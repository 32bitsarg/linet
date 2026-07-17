import {
  BOT_SESSION_ID,
  CLEAR_SP_REWARD,
  SELL_REFUND,
  SP_PER_SECOND,
  STARTING_GOLD,
  STARTING_LIVES,
  STARTING_SP,
  TICK_DT,
  TOTAL_WAVES,
  WAVE_COUNTDOWN_SEC,
} from "../constants.js";
import {
  getCreepDef,
  getSendDef,
  getTowerDef,
  getWaveDef,
  MAP,
} from "../content/index.js";
import {
  computeDamage,
  scaledCreepGold,
  scaledCreepHp,
  towerStatsAtLevel,
  upgradeCost,
} from "./combat.js";
import { dist2, polylineLength } from "./path.js";
import {
  cellCenter,
  cellKey,
  findPath,
  inBounds,
  isReservedCell,
  pathHasRoute,
  worldToCell,
} from "./pathfinding.js";
import type {
  CreepState,
  Intent,
  PublicPlayer,
  SimEvent,
  SimSnapshot,
  TowerState,
  Vec2,
} from "../types.js";

interface InternalPlayer extends PublicPlayer {
  sendCooldowns: Map<string, number>;
  livesBeforeFatal: number;
}

interface SpawnJob {
  laneIndex: number;
  creepId: string;
  atTime: number;
  source: "wave" | "send";
  waveIndex: number;
}

let nextId = 1;
function uid(prefix: string): string {
  return `${prefix}_${nextId++}`;
}

export class Simulation {
  roomCode: string;
  hostSessionId: string;
  phase: "lobby" | "playing" | "ended" = "lobby";
  tick = 0;
  time = 0;
  waveIndex = 0;
  waveCountdown = 0;
  waveActive = false;
  waveSpawnDone = false;
  suddenDeath = false;
  winnerSessionId: string | null = null;
  players = new Map<string, InternalPlayer>();
  creeps: CreepState[] = [];
  towers: TowerState[] = [];
  spawnQueue: SpawnJob[] = [];
  events: SimEvent[] = [];
  incomingSendBanner: { laneIndex: number; sendId: string; until: number } | null = null;
  soloMode = false;
  private laneCleared = new Set<number>();

  constructor(roomCode: string) {
    this.roomCode = roomCode;
    this.hostSessionId = "";
  }

  enableSoloWithBot(): void {
    if (this.soloMode) return;
    this.soloMode = true;
    if (!this.players.has(BOT_SESSION_ID)) {
      this.addPlayer(BOT_SESSION_ID, "Bot (test)");
    }
    const bot = this.players.get(BOT_SESSION_ID);
    if (bot) {
      bot.ready = true;
      bot.connected = true;
    }
  }

  addPlayer(sessionId: string, name: string): boolean {
    if (this.players.size >= 2) return false;
    const laneIndex = this.players.size;
    this.players.set(sessionId, {
      sessionId,
      name,
      laneIndex,
      ready: false,
      connected: true,
      gold: STARTING_GOLD,
      sendPoints: STARTING_SP,
      lives: STARTING_LIVES,
      totalLeaks: 0,
      totalGoldEarned: 0,
      eliminated: false,
      sendCooldowns: new Map(),
      livesBeforeFatal: STARTING_LIVES,
    });
    if (!this.hostSessionId) this.hostSessionId = sessionId;
    return true;
  }

  removePlayer(sessionId: string): void {
    const p = this.players.get(sessionId);
    if (!p) return;
    if (this.phase === "lobby") {
      this.players.delete(sessionId);
      if (this.soloMode && sessionId !== BOT_SESSION_ID) {
        this.players.delete(BOT_SESSION_ID);
      }
      if (this.hostSessionId === sessionId) {
        this.hostSessionId = [...this.players.keys()].find((id) => id !== BOT_SESSION_ID) ?? "";
      }
    } else {
      p.connected = false;
    }
  }

  setConnected(sessionId: string, connected: boolean): void {
    const p = this.players.get(sessionId);
    if (p) p.connected = connected;
  }

  enqueueIntent(sessionId: string, intent: Intent): void {
    const player = this.players.get(sessionId);
    if (!player) return;

    if (this.phase === "lobby") {
      if (intent.type === "setReady") {
        player.ready = intent.ready;
      } else if (intent.type === "startGame") {
        if (sessionId === this.hostSessionId && this.canStart()) this.startMatch();
      }
      return;
    }

    if (this.phase === "ended") {
      if (intent.type === "rematch") this.resetForRematch();
      return;
    }

    if (player.eliminated || !player.connected) return;

    switch (intent.type) {
      case "placeTower":
        this.placeTower(player, intent.col, intent.row, intent.towerId);
        break;
      case "upgradeTower":
        this.upgradeTower(player, intent.towerInstanceId);
        break;
      case "sellTower":
        this.sellTower(player, intent.towerInstanceId);
        break;
      case "sendCreeps":
        this.sendCreeps(player, intent.sendId);
        break;
    }
  }

  private canStart(): boolean {
    if (this.soloMode) {
      const humans = [...this.players.values()].filter((p) => p.sessionId !== BOT_SESSION_ID);
      return humans.length === 1 && humans[0]!.ready && humans[0]!.connected;
    }
    if (this.players.size !== 2) return false;
    return [...this.players.values()].every((p) => p.ready && p.connected);
  }

  private startMatch(): void {
    this.phase = "playing";
    this.waveIndex = 0;
    this.waveCountdown = WAVE_COUNTDOWN_SEC;
    this.waveActive = false;
    this.suddenDeath = false;
    this.winnerSessionId = null;
    this.creeps = [];
    this.towers = [];
    this.spawnQueue = [];
    this.laneCleared.clear();
    for (const p of this.players.values()) {
      p.gold = STARTING_GOLD;
      p.sendPoints = STARTING_SP;
      p.lives = STARTING_LIVES;
      p.totalLeaks = 0;
      p.totalGoldEarned = 0;
      p.eliminated = false;
      p.sendCooldowns.clear();
      p.livesBeforeFatal = STARTING_LIVES;
    }
    this.events.push({ type: "matchStart" });
  }

  private resetForRematch(): void {
    for (const p of this.players.values()) {
      p.ready = p.sessionId === BOT_SESSION_ID ? true : false;
    }
    this.phase = "lobby";
    this.creeps = [];
    this.towers = [];
    this.spawnQueue = [];
    this.waveIndex = 0;
    this.waveActive = false;
    this.winnerSessionId = null;
    this.suddenDeath = false;
  }

  step(): SimEvent[] {
    this.events = [];
    if (this.phase !== "playing") return this.events;

    this.tick += 1;
    this.time += TICK_DT;

    this.tickPassiveSp();
    this.tickWaveFlow();
    this.tickSpawnQueue();
    this.tickCreeps();
    this.tickTowers();
    this.checkWaveClear();
    this.checkWinLose();

    if (this.incomingSendBanner && this.time >= this.incomingSendBanner.until) {
      this.incomingSendBanner = null;
    }

    return this.events;
  }

  private blockedForLane(laneIndex: number, extra?: { col: number; row: number }): Set<string> {
    const blocked = new Set<string>();
    for (const t of this.towers) {
      if (t.laneIndex === laneIndex) blocked.add(cellKey(t.col, t.row));
    }
    if (extra) blocked.add(cellKey(extra.col, extra.row));
    return blocked;
  }

  private tickPassiveSp(): void {
    for (const p of this.players.values()) {
      if (p.eliminated) continue;
      p.sendPoints += SP_PER_SECOND * TICK_DT;
    }
  }

  private tickWaveFlow(): void {
    if (this.waveActive) return;
    if (this.waveIndex >= TOTAL_WAVES && !this.suddenDeath) return;

    this.waveCountdown -= TICK_DT;
    if (this.waveCountdown <= 0) {
      this.beginWave(this.waveIndex + 1);
    }
  }

  private beginWave(index: number): void {
    this.waveIndex = index;
    this.waveActive = true;
    this.waveSpawnDone = false;
    this.waveCountdown = 0;
    this.laneCleared.clear();
    this.events.push({ type: "waveStart", waveIndex: index });

    const wave = getWaveDef(index);
    if (!wave) {
      for (const laneIndex of [0, 1]) {
        for (let i = 0; i < 20; i++) {
          this.spawnQueue.push({
            laneIndex,
            creepId: "runner",
            atTime: this.time + i * 0.6,
            source: "wave",
            waveIndex: index,
          });
        }
      }
      this.waveSpawnDone = true;
      return;
    }

    for (const laneIndex of [0, 1]) {
      for (const entry of wave.entries) {
        for (let i = 0; i < entry.count; i++) {
          this.spawnQueue.push({
            laneIndex,
            creepId: entry.creepId,
            atTime: this.time + entry.delayMs / 1000 + (i * entry.intervalMs) / 1000,
            source: "wave",
            waveIndex: index,
          });
        }
      }
    }
    this.waveSpawnDone = true;
  }

  private tickSpawnQueue(): void {
    const ready = this.spawnQueue.filter((j) => j.atTime <= this.time);
    this.spawnQueue = this.spawnQueue.filter((j) => j.atTime > this.time);
    for (const job of ready) {
      this.spawnCreep(job.laneIndex, job.creepId, job.source, job.waveIndex);
    }
  }

  private spawnCreep(
    laneIndex: number,
    creepId: string,
    source: "wave" | "send",
    waveIndex: number,
  ): void {
    const def = getCreepDef(creepId);
    const lane = MAP.lanes[laneIndex];
    if (!def || !lane) return;

    const blocked = this.blockedForLane(laneIndex);
    const path =
      findPath(lane, blocked, lane.spawnCol, lane.spawnRow, lane.exitCol, lane.exitRow) ??
      [cellCenter(lane, lane.spawnCol, lane.spawnRow), cellCenter(lane, lane.exitCol, lane.exitRow)];

    const hp = scaledCreepHp(def.hp, waveIndex);
    const start = path[0]!;
    this.creeps.push({
      id: uid("creep"),
      creepId,
      laneIndex,
      hp,
      maxHp: hp,
      progress: 0,
      x: start.x,
      y: start.y,
      slowUntil: 0,
      slowPercent: 0,
      source,
      waveIndex,
      path,
      pathIndex: 1,
    });
  }

  private repathLane(laneIndex: number): void {
    const lane = MAP.lanes[laneIndex];
    if (!lane) return;
    const blocked = this.blockedForLane(laneIndex);

    for (const creep of this.creeps) {
      if (creep.laneIndex !== laneIndex || creep.hp <= 0) continue;
      const cell = worldToCell(lane, creep.x, creep.y);
      const startCol = cell?.col ?? lane.spawnCol;
      const startRow = cell?.row ?? lane.spawnRow;
      // If standing on a blocked cell (shouldn't), search nearby free
      let sc = startCol;
      let sr = startRow;
      if (blocked.has(cellKey(sc, sr))) {
        let found = false;
        for (let d = 1; d < 4 && !found; d++) {
          for (const [dc, dr] of [
            [d, 0],
            [-d, 0],
            [0, d],
            [0, -d],
          ] as const) {
            const nc = startCol + dc;
            const nr = startRow + dr;
            if (inBounds(lane, nc, nr) && !blocked.has(cellKey(nc, nr))) {
              sc = nc;
              sr = nr;
              found = true;
              break;
            }
          }
        }
      }
      const path = findPath(lane, blocked, sc, sr, lane.exitCol, lane.exitRow);
      if (path && path.length) {
        creep.path = path;
        creep.pathIndex = Math.min(1, path.length - 1);
        creep.progress = 0;
      }
    }
  }

  private tickCreeps(): void {
    const remaining: CreepState[] = [];
    for (const creep of this.creeps) {
      const def = getCreepDef(creep.creepId);
      if (!def) continue;
      if (creep.hp <= 0) continue;

      let speed = def.speed;
      if (creep.slowUntil > this.time) speed *= 1 - creep.slowPercent;

      if (!creep.path.length) {
        remaining.push(creep);
        continue;
      }

      const totalLen = Math.max(1, polylineLength(creep.path));
      let moveBudget = speed * TICK_DT;

      while (moveBudget > 0 && creep.pathIndex < creep.path.length) {
        const target = creep.path[creep.pathIndex]!;
        const dx = target.x - creep.x;
        const dy = target.y - creep.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= 0.001) {
          creep.pathIndex += 1;
          continue;
        }
        if (moveBudget >= dist) {
          creep.x = target.x;
          creep.y = target.y;
          moveBudget -= dist;
          creep.pathIndex += 1;
        } else {
          creep.x += (dx / dist) * moveBudget;
          creep.y += (dy / dist) * moveBudget;
          moveBudget = 0;
        }
      }

      // progress for First targeting
      let traveled = 0;
      for (let i = 1; i < creep.pathIndex && i < creep.path.length; i++) {
        const a = creep.path[i - 1]!;
        const b = creep.path[i]!;
        traveled += Math.hypot(b.x - a.x, b.y - a.y);
      }
      if (creep.pathIndex > 0 && creep.pathIndex < creep.path.length) {
        const prev = creep.path[creep.pathIndex - 1]!;
        traveled += Math.hypot(creep.x - prev.x, creep.y - prev.y);
      }
      creep.progress = Math.min(1, traveled / totalLen);

      if (creep.pathIndex >= creep.path.length) {
        this.applyLeak(creep);
        continue;
      }
      remaining.push(creep);
    }
    this.creeps = remaining;
  }

  private applyLeak(creep: CreepState): void {
    const owner = [...this.players.values()].find((p) => p.laneIndex === creep.laneIndex);
    if (!owner || owner.eliminated) return;
    const def = getCreepDef(creep.creepId);
    const dmg = def?.leakDamage ?? 1;
    owner.livesBeforeFatal = owner.lives;
    owner.lives -= dmg;
    owner.totalLeaks += 1;
    this.events.push({
      type: "leak",
      sessionId: owner.sessionId,
      creepId: creep.creepId,
      damage: dmg,
    });
    if (owner.lives <= 0) {
      owner.lives = 0;
      owner.eliminated = true;
      this.events.push({ type: "eliminated", sessionId: owner.sessionId });
    }
  }

  private tickTowers(): void {
    for (const tower of this.towers) {
      const owner = [...this.players.values()].find((p) => p.laneIndex === tower.laneIndex);
      if (!owner || owner.eliminated) continue;
      const def = getTowerDef(tower.towerId);
      if (!def) continue;
      const stats = towerStatsAtLevel(def.damage, def.range, def.attackInterval, tower.level);
      tower.cooldown = Math.max(0, tower.cooldown - TICK_DT);
      if (tower.cooldown > 0) continue;

      const target = this.findTarget(tower, stats.range);
      if (!target) continue;

      tower.cooldown = stats.attackInterval;
      this.dealTowerDamage(
        tower,
        def.damageType,
        stats.damage,
        def.splashRadius,
        def.slowPercent,
        def.slowDuration,
        target,
      );
      this.events.push({
        type: "attack",
        towerId: tower.id,
        targetId: target.id,
        x: tower.x,
        y: tower.y,
        tx: target.x,
        ty: target.y,
      });
    }
  }

  private findTarget(tower: TowerState, range: number): CreepState | null {
    const range2 = range * range;
    let best: CreepState | null = null;
    for (const creep of this.creeps) {
      if (creep.laneIndex !== tower.laneIndex) continue;
      if (creep.hp <= 0) continue;
      if (dist2(tower.x, tower.y, creep.x, creep.y) > range2) continue;
      if (!best || creep.progress > best.progress) best = creep;
    }
    return best;
  }

  private dealTowerDamage(
    tower: TowerState,
    damageType: "physical" | "magical" | "pure",
    damage: number,
    splashRadius: number,
    slowPercent: number,
    slowDuration: number,
    primary: CreepState,
  ): void {
    const targets =
      splashRadius > 0
        ? this.creeps.filter(
            (c) =>
              c.laneIndex === tower.laneIndex &&
              c.hp > 0 &&
              dist2(primary.x, primary.y, c.x, c.y) <= splashRadius * splashRadius,
          )
        : [primary];

    for (const creep of targets) {
      const def = getCreepDef(creep.creepId);
      if (!def) continue;
      const dmg = computeDamage(damage, damageType, def.armor, def.magicResist);
      creep.hp -= dmg;
      if (slowPercent > 0 && slowDuration > 0) {
        creep.slowPercent = Math.max(creep.slowPercent, slowPercent);
        creep.slowUntil = Math.max(creep.slowUntil, this.time + slowDuration);
      }
      if (creep.hp <= 0) this.killCreep(creep);
    }
  }

  private killCreep(creep: CreepState): void {
    const owner = [...this.players.values()].find((p) => p.laneIndex === creep.laneIndex);
    const def = getCreepDef(creep.creepId);
    if (owner && def) {
      const gold = scaledCreepGold(def.goldReward, creep.waveIndex);
      owner.gold += gold;
      owner.totalGoldEarned += gold;
      owner.sendPoints += gold * 0.5;
      this.events.push({ type: "kill", sessionId: owner.sessionId, gold, creepId: creep.creepId });
    }
    creep.hp = 0;
  }

  private checkWaveClear(): void {
    if (!this.waveActive || !this.waveSpawnDone) return;
    if (this.spawnQueue.some((j) => j.source === "wave")) return;

    for (const laneIndex of [0, 1]) {
      if (this.laneCleared.has(laneIndex)) continue;
      const owner = [...this.players.values()].find((p) => p.laneIndex === laneIndex);
      if (owner?.eliminated) {
        this.laneCleared.add(laneIndex);
        continue;
      }
      const waveCreepsAlive = this.creeps.some(
        (c) => c.laneIndex === laneIndex && c.source === "wave" && c.hp > 0,
      );
      if (waveCreepsAlive) continue;
      this.laneCleared.add(laneIndex);
      if (owner && !owner.eliminated) {
        owner.sendPoints += CLEAR_SP_REWARD;
        this.events.push({ type: "waveClear", sessionId: owner.sessionId, waveIndex: this.waveIndex });
      }
    }

    if (this.laneCleared.size >= 2) {
      this.waveActive = false;
      if (!this.suddenDeath && this.waveIndex >= TOTAL_WAVES) {
        const alive = [...this.players.values()].filter((p) => !p.eliminated);
        if (alive.length === 2) this.beginSuddenDeath();
      } else if (this.waveIndex < TOTAL_WAVES) {
        this.waveCountdown = WAVE_COUNTDOWN_SEC;
      }
    }
  }

  private beginSuddenDeath(): void {
    this.suddenDeath = true;
    for (const p of this.players.values()) {
      if (!p.eliminated) p.lives = Math.max(p.lives, 1);
    }
    this.waveCountdown = 3;
    this.events.push({ type: "suddenDeath" });
  }

  private checkWinLose(): void {
    if (this.phase !== "playing") return;
    const alive = [...this.players.values()].filter((p) => !p.eliminated);
    if (alive.length === 1) {
      this.endMatch(alive[0]!.sessionId);
      return;
    }
    if (alive.length === 0) {
      const all = [...this.players.values()];
      all.sort((a, b) => {
        if (b.livesBeforeFatal !== a.livesBeforeFatal) return b.livesBeforeFatal - a.livesBeforeFatal;
        if (a.totalLeaks !== b.totalLeaks) return a.totalLeaks - b.totalLeaks;
        return b.totalGoldEarned - a.totalGoldEarned;
      });
      if (
        all[0]!.livesBeforeFatal === all[1]!.livesBeforeFatal &&
        all[0]!.totalLeaks === all[1]!.totalLeaks &&
        all[0]!.totalGoldEarned === all[1]!.totalGoldEarned
      ) {
        for (const p of all) {
          p.eliminated = false;
          p.lives = 1;
        }
        this.beginSuddenDeath();
        return;
      }
      this.endMatch(all[0]!.sessionId);
    }
  }

  private endMatch(winnerSessionId: string): void {
    this.phase = "ended";
    this.winnerSessionId = winnerSessionId;
    this.waveActive = false;
    this.events.push({ type: "matchEnd", winnerSessionId });
  }

  forfeit(sessionId: string): void {
    const p = this.players.get(sessionId);
    if (!p || this.phase !== "playing") return;
    p.eliminated = true;
    p.lives = 0;
    this.events.push({ type: "forfeit", sessionId });
    this.checkWinLose();
  }

  private placeTower(player: InternalPlayer, col: number, row: number, towerId: string): void {
    const def = getTowerDef(towerId);
    const lane = MAP.lanes[player.laneIndex];
    if (!def || !lane) return;
    if (!inBounds(lane, col, row)) return;
    if (isReservedCell(lane, col, row)) return;
    if (this.towers.some((t) => t.laneIndex === player.laneIndex && t.col === col && t.row === row)) {
      return;
    }
    if (player.gold < def.cost) return;

    const blocked = this.blockedForLane(player.laneIndex, { col, row });
    if (!pathHasRoute(lane, blocked)) {
      this.events.push({ type: "placeRejected", reason: "blocks_path", col, row });
      return;
    }

    player.gold -= def.cost;
    const pos = cellCenter(lane, col, row);
    const tower: TowerState = {
      id: uid("tower"),
      towerId,
      laneIndex: player.laneIndex,
      col,
      row,
      level: 1,
      cooldown: 0,
      x: pos.x,
      y: pos.y,
      investedGold: def.cost,
    };
    this.towers.push(tower);
    this.repathLane(player.laneIndex);
    this.events.push({
      type: "place",
      sessionId: player.sessionId,
      towerId: tower.id,
      defId: towerId,
      col,
      row,
    });
  }

  private upgradeTower(player: InternalPlayer, towerInstanceId: string): void {
    const tower = this.towers.find((t) => t.id === towerInstanceId);
    if (!tower || tower.laneIndex !== player.laneIndex) return;
    if (tower.level >= 3) return;
    const def = getTowerDef(tower.towerId);
    if (!def) return;
    const toLevel = tower.level + 1;
    const cost = upgradeCost(def.cost, toLevel);
    if (player.gold < cost) return;
    player.gold -= cost;
    tower.level = toLevel;
    tower.investedGold += cost;
    this.events.push({ type: "upgrade", sessionId: player.sessionId, towerId: tower.id, level: tower.level });
  }

  private sellTower(player: InternalPlayer, towerInstanceId: string): void {
    const idx = this.towers.findIndex((t) => t.id === towerInstanceId);
    if (idx < 0) return;
    const tower = this.towers[idx]!;
    if (tower.laneIndex !== player.laneIndex) return;
    const refund = Math.floor(tower.investedGold * SELL_REFUND);
    player.gold += refund;
    const laneIndex = tower.laneIndex;
    this.towers.splice(idx, 1);
    this.repathLane(laneIndex);
    this.events.push({ type: "sell", sessionId: player.sessionId, towerId: tower.id, refund });
  }

  private sendCreeps(player: InternalPlayer, sendId: string): void {
    const send = getSendDef(sendId);
    if (!send) return;
    if (this.waveIndex < send.minWave) return;
    if (player.sendPoints < send.costSendPoints) return;
    const cdUntil = player.sendCooldowns.get(sendId) ?? 0;
    if (this.time < cdUntil) return;

    const rival = [...this.players.values()].find((p) => p.sessionId !== player.sessionId);
    if (!rival || rival.eliminated) return;

    player.sendPoints -= send.costSendPoints;
    player.sendCooldowns.set(sendId, this.time + send.cooldownMs / 1000);

    let t = this.time;
    for (const entry of send.entries) {
      for (let i = 0; i < entry.count; i++) {
        this.spawnQueue.push({
          laneIndex: rival.laneIndex,
          creepId: entry.creepId,
          atTime: t,
          source: "send",
          waveIndex: Math.max(this.waveIndex, 1),
        });
        t += 0.35;
      }
    }

    this.incomingSendBanner = {
      laneIndex: rival.laneIndex,
      sendId,
      until: this.time + 2.5,
    };
    this.events.push({
      type: "send",
      from: player.sessionId,
      to: rival.sessionId,
      sendId,
    });
  }

  snapshot(): SimSnapshot {
    return {
      tick: this.tick,
      time: this.time,
      phase: this.phase,
      waveIndex: this.waveIndex,
      waveCountdown: Math.max(0, this.waveCountdown),
      waveActive: this.waveActive,
      suddenDeath: this.suddenDeath,
      winnerSessionId: this.winnerSessionId,
      players: [...this.players.values()].map((p) => ({
        sessionId: p.sessionId,
        name: p.name,
        laneIndex: p.laneIndex,
        ready: p.ready,
        connected: p.connected,
        gold: Math.floor(p.gold),
        sendPoints: Math.floor(p.sendPoints),
        lives: p.lives,
        totalLeaks: p.totalLeaks,
        totalGoldEarned: Math.floor(p.totalGoldEarned),
        eliminated: p.eliminated,
      })),
      creeps: this.creeps.map((c) => ({
        ...c,
        path: c.path.map((p) => ({ ...p })),
      })),
      towers: this.towers.map((t) => ({ ...t })),
      incomingSendBanner: this.incomingSendBanner,
      roomCode: this.roomCode,
      hostSessionId: this.hostSessionId,
      soloMode: this.soloMode,
    };
  }
}
