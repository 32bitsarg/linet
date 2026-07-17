import Phaser from "phaser";
import { MAP, TOWERS, type SimSnapshot } from "@linet/shared";
import { net } from "../net";

const TOWER_COLORS: Record<string, number> = {
  arrow: 0x6dbf6a,
  cannon: 0xc47a3a,
  frost: 0x6ab0d8,
  sniper: 0xb0b0b0,
  mage: 0x9b6ad8,
};

const CREEP_COLORS: Record<string, number> = {
  grub: 0x8bc34a,
  runner: 0xffc107,
  brute: 0xe57373,
  shade: 0x7e57c2,
  boss_1: 0xd32f2f,
};

export class GameScene extends Phaser.Scene {
  private state: SimSnapshot | null = null;
  private creepGfx = new Map<string, Phaser.GameObjects.Arc>();
  private towerGfx = new Map<string, Phaser.GameObjects.Container>();
  private hud!: Phaser.GameObjects.Text;
  private banner!: Phaser.GameObjects.Text;
  private laneLabelLeft!: Phaser.GameObjects.Text;
  private laneLabelRight!: Phaser.GameObjects.Text;
  private selectedTowerId: string = "arrow";
  private selectedInstanceId: string | null = null;
  private placeRejectUntil = 0;
  private rangeCircle!: Phaser.GameObjects.Arc;
  private hoverCell!: Phaser.GameObjects.Rectangle;
  private buildButtons: Phaser.GameObjects.Container[] = [];
  private sendButtons: Phaser.GameObjects.Container[] = [];

  constructor() {
    super("game");
  }

  create() {
    const { width, height } = this.scale;

    const bg = this.add.graphics().setDepth(0);
    bg.fillGradientStyle(0x0c1410, 0x0c1410, 0x152018, 0x1a2420, 1);
    bg.fillRect(0, 0, width, height);

    // Side atmospheres: ally moss vs rival iron
    this.add.rectangle(0, 0, width / 2, 640, 0x14301c, 0.35).setOrigin(0).setDepth(0);
    this.add.rectangle(width / 2, 0, width / 2, 640, 0x2a1818, 0.32).setOrigin(0).setDepth(0);

    const divider = this.add.rectangle(width / 2, 320, 3, 620, 0xd8c49a, 0.35).setDepth(4);
    this.tweens.add({
      targets: divider,
      alpha: { from: 0.22, to: 0.55 },
      duration: 2400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.add.rectangle(0, 640, width, 80, 0x080c09, 0.96).setOrigin(0).setDepth(5);
    this.add.rectangle(0, 640, width, 2, 0xd8c49a, 0.25).setOrigin(0).setDepth(6);

    this.laneLabelLeft = this.add
      .text(MAP.lanes[0]!.originX, 14, "TU LÍNEA", {
        fontFamily: "Bebas Neue, Impact, sans-serif",
        fontSize: "26px",
        color: "#6fbf78",
        letterSpacing: 3,
      })
      .setDepth(8);
    this.laneLabelRight = this.add
      .text(MAP.lanes[1]!.originX, 14, "RIVAL", {
        fontFamily: "Bebas Neue, Impact, sans-serif",
        fontSize: "26px",
        color: "#c45a4a",
        letterSpacing: 3,
      })
      .setDepth(8);

    this.hoverCell = this.add
      .rectangle(0, 0, 36, 36, 0x6fbf78, 0.22)
      .setStrokeStyle(2, 0xd8c49a, 0.85)
      .setVisible(false)
      .setDepth(3);

    MAP.lanes.forEach((lane, laneIndex) => {
      const ally = laneIndex === 0;
      const accent = ally ? 0x6fbf78 : 0xc45a4a;
      const fill = ally ? 0x1c2e22 : 0x2a1e1c;
      const grid = ally ? 0x2f4a38 : 0x4a302c;
      const g = this.add.graphics().setDepth(1);
      const w = lane.cols * lane.cellSize;
      const h = lane.rows * lane.cellSize;

      // Outer frame
      g.fillStyle(fill, 0.95);
      g.fillRect(lane.originX - 4, lane.originY - 4, w + 8, h + 8);
      g.lineStyle(2, accent, 0.75);
      g.strokeRect(lane.originX - 4, lane.originY - 4, w + 8, h + 8);

      // Checkerboard-ish ground
      for (let r = 0; r < lane.rows; r++) {
        for (let c = 0; c < lane.cols; c++) {
          const shade = (c + r) % 2 === 0 ? 0.12 : 0.06;
          g.fillStyle(0x000000, shade);
          g.fillRect(
            lane.originX + c * lane.cellSize,
            lane.originY + r * lane.cellSize,
            lane.cellSize,
            lane.cellSize,
          );
        }
      }

      g.lineStyle(1, grid, 0.55);
      for (let c = 0; c <= lane.cols; c++) {
        const x = lane.originX + c * lane.cellSize;
        g.lineBetween(x, lane.originY, x, lane.originY + h);
      }
      for (let r = 0; r <= lane.rows; r++) {
        const y = lane.originY + r * lane.cellSize;
        g.lineBetween(lane.originX, y, lane.originX + w, y);
      }

      const spawnX = lane.originX + lane.spawnCol * lane.cellSize;
      const spawnY = lane.originY + lane.spawnRow * lane.cellSize;
      const exitX = lane.originX + lane.exitCol * lane.cellSize;
      const exitY = lane.originY + lane.exitRow * lane.cellSize;

      g.fillStyle(0x3d7a45, 0.65);
      g.fillRect(spawnX + 2, spawnY + 2, lane.cellSize - 4, lane.cellSize - 4);
      g.fillStyle(0x8a3a35, 0.7);
      g.fillRect(exitX + 2, exitY + 2, lane.cellSize - 4, lane.cellSize - 4);

      const spawnGlow = this.add
        .rectangle(
          spawnX + lane.cellSize / 2,
          spawnY + lane.cellSize / 2,
          lane.cellSize - 6,
          lane.cellSize - 6,
          0x6fbf78,
          0.2,
        )
        .setDepth(2);
      this.tweens.add({
        targets: spawnGlow,
        alpha: { from: 0.15, to: 0.45 },
        duration: 1100,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.add
        .text(spawnX + lane.cellSize / 2, spawnY + lane.cellSize / 2, "↓", {
          fontFamily: "Bebas Neue, Impact, sans-serif",
          fontSize: "20px",
          color: "#d8f5d8",
        })
        .setOrigin(0.5)
        .setDepth(3);

      this.add
        .text(exitX + lane.cellSize / 2, exitY + lane.cellSize / 2, "✕", {
          fontFamily: "Sora, sans-serif",
          fontSize: "14px",
          color: "#ffc9c4",
        })
        .setOrigin(0.5)
        .setDepth(3);

      const hit = this.add
        .rectangle(lane.originX + w / 2, lane.originY + h / 2, w, h, 0x000000, 0)
        .setInteractive({ useHandCursor: true })
        .setDepth(2);
      hit.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        this.onLanePointer(lane.id, pointer.worldX, pointer.worldY);
      });
      hit.on("pointermove", (pointer: Phaser.Input.Pointer) => {
        this.updateHover(lane.id, pointer.worldX, pointer.worldY);
      });
      hit.on("pointerout", () => this.hoverCell.setVisible(false));
    });

    this.rangeCircle = this.add
      .circle(0, 0, 10, 0xffffff, 0.06)
      .setStrokeStyle(1, 0xd8c49a, 0.7)
      .setVisible(false)
      .setDepth(25);

    this.hud = this.add
      .text(12, 652, "", {
        fontFamily: "Sora, sans-serif",
        fontSize: "13px",
        color: "#e8f0e0",
        backgroundColor: "#00000000",
        lineSpacing: 3,
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.banner = this.add
      .text(width / 2, 42, "", {
        fontFamily: "Bebas Neue, Impact, sans-serif",
        fontSize: "32px",
        color: "#d8c49a",
        letterSpacing: 2,
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.createBuildBar();
    this.createSendPanel();
    this.createTowerPanel();

    net.onState = (s) => {
      this.state = s;
      if (s.phase === "ended") {
        this.scene.start("end", { state: s });
        return;
      }
      if (s.phase === "lobby") {
        this.scene.start("lobby");
        return;
      }
      this.syncWorld();
      this.updateHud();
    };

    net.onEvent = (e) => {
      if (e.type === "attack") {
        const line = this.add
          .line(0, 0, e.x as number, e.y as number, e.tx as number, e.ty as number, 0xffe082, 0.75)
          .setOrigin(0, 0)
          .setDepth(50);
        this.tweens.add({ targets: line, alpha: 0, duration: 140, onComplete: () => line.destroy() });
      }
      if (e.type === "placeRejected") {
        this.placeRejectUntil = this.time.now + 1200;
        this.banner.setText("NO PODÉS TAPAR EL CAMINO");
      }
    };

    this.input.keyboard?.on("keydown-ESC", () => {
      this.selectedInstanceId = null;
      this.rangeCircle.setVisible(false);
    });
  }

  private updateHover(laneId: string, worldX: number, worldY: number) {
    const me = this.me();
    if (!me) {
      this.hoverCell.setVisible(false);
      return;
    }
    const myLane = MAP.lanes[me.laneIndex];
    if (!myLane || myLane.id !== laneId) {
      this.hoverCell.setVisible(false);
      return;
    }
    const col = Math.floor((worldX - myLane.originX) / myLane.cellSize);
    const row = Math.floor((worldY - myLane.originY) / myLane.cellSize);
    if (col < 0 || row < 0 || col >= myLane.cols || row >= myLane.rows) {
      this.hoverCell.setVisible(false);
      return;
    }
    const occupied = this.state?.towers.some(
      (t) => t.laneIndex === me.laneIndex && t.col === col && t.row === row,
    );
    const reserved =
      (col === myLane.spawnCol && row === myLane.spawnRow) ||
      (col === myLane.exitCol && row === myLane.exitRow);
    if (occupied || reserved) {
      this.hoverCell.setVisible(false);
      return;
    }
    this.hoverCell
      .setPosition(
        myLane.originX + col * myLane.cellSize + myLane.cellSize / 2,
        myLane.originY + row * myLane.cellSize + myLane.cellSize / 2,
      )
      .setSize(myLane.cellSize - 4, myLane.cellSize - 4)
      .setVisible(true);
  }

  private me() {
    return this.state?.players.find((p) => p.sessionId === net.sessionId);
  }

  private createBuildBar() {
    const y = 680;
    TOWERS.forEach((t, i) => {
      const x = 280 + i * 108;
      const bg = this.add
        .rectangle(0, 0, 98, 38, TOWER_COLORS[t.id] ?? 0x666666)
        .setStrokeStyle(1, 0xd8c49a, 0.35)
        .setInteractive({ useHandCursor: true });
      const label = this.add
        .text(0, 0, `${t.name}\n$${t.cost}`, {
          fontFamily: "Sora, sans-serif",
          fontSize: "11px",
          color: "#111",
          align: "center",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
      const c = this.add.container(x, y, [bg, label]).setDepth(100);
      bg.on("pointerdown", () => {
        this.selectedTowerId = t.id;
        this.selectedInstanceId = null;
        this.rangeCircle.setVisible(false);
      });
      this.buildButtons.push(c);
    });
  }

  private createSendPanel() {
    const sends = [
      { id: "send_swarm", label: "Swarm\n20SP" },
      { id: "send_fast", label: "Fast\n35SP" },
      { id: "send_tank", label: "Tank\n60SP" },
      { id: "send_boss", label: "Boss\n120SP" },
    ];
    sends.forEach((s, i) => {
      const x = 920 + (i % 2) * 100;
      const y = 658 + Math.floor(i / 2) * 36;
      const bg = this.add
        .rectangle(0, 0, 92, 32, 0x5a2e2c)
        .setStrokeStyle(1, 0xc45a4a, 0.45)
        .setInteractive({ useHandCursor: true });
      const label = this.add
        .text(0, 0, s.label, {
          fontFamily: "Sora, sans-serif",
          fontSize: "10px",
          color: "#ffe8e4",
          align: "center",
        })
        .setOrigin(0.5);
      const c = this.add.container(x, y, [bg, label]).setDepth(100);
      bg.on("pointerdown", () => net.sendIntent({ type: "sendCreeps", sendId: s.id }));
      this.sendButtons.push(c);
    });
  }

  private createTowerPanel() {
    this.input.keyboard?.on("keydown-U", () => {
      if (this.selectedInstanceId) net.sendIntent({ type: "upgradeTower", towerInstanceId: this.selectedInstanceId });
    });
    this.input.keyboard?.on("keydown-S", () => {
      if (this.selectedInstanceId) net.sendIntent({ type: "sellTower", towerInstanceId: this.selectedInstanceId });
    });
  }

  private onLanePointer(laneId: string, worldX: number, worldY: number) {
    const me = this.me();
    if (!me || !this.state) return;
    const myLane = MAP.lanes[me.laneIndex];
    if (!myLane || myLane.id !== laneId) return;

    const col = Math.floor((worldX - myLane.originX) / myLane.cellSize);
    const row = Math.floor((worldY - myLane.originY) / myLane.cellSize);
    if (col < 0 || row < 0 || col >= myLane.cols || row >= myLane.rows) return;

    const existing = this.state.towers.find(
      (t) => t.laneIndex === me.laneIndex && t.col === col && t.row === row,
    );
    if (existing) {
      this.selectedInstanceId = existing.id;
      const def = TOWERS.find((t) => t.id === existing.towerId);
      this.rangeCircle.setPosition(existing.x, existing.y).setRadius(def?.range ?? 100).setVisible(true);
      return;
    }

    net.sendIntent({ type: "placeTower", col, row, towerId: this.selectedTowerId });
  }

  private syncWorld() {
    if (!this.state) return;

    const liveCreepIds = new Set(this.state.creeps.map((c) => c.id));
    for (const [id, gfx] of this.creepGfx) {
      if (!liveCreepIds.has(id)) {
        gfx.destroy();
        this.creepGfx.delete(id);
      }
    }
    for (const creep of this.state.creeps) {
      let gfx = this.creepGfx.get(creep.id);
      if (!gfx) {
        const r = creep.creepId === "boss_1" ? 14 : creep.creepId === "brute" ? 11 : 8;
        gfx = this.add.circle(creep.x, creep.y, r, CREEP_COLORS[creep.creepId] ?? 0xffffff).setDepth(20);
        this.creepGfx.set(creep.id, gfx);
      }
      gfx.setPosition(creep.x, creep.y);
      gfx.setAlpha(creep.source === "send" ? 0.85 : 1);
    }

    const liveTowerIds = new Set(this.state.towers.map((t) => t.id));
    for (const [id, gfx] of this.towerGfx) {
      if (!liveTowerIds.has(id)) {
        gfx.destroy();
        this.towerGfx.delete(id);
      }
    }
    for (const tower of this.state.towers) {
      let gfx = this.towerGfx.get(tower.id);
      if (!gfx) {
        const base = this.add.rectangle(0, 2, 32, 30, 0x2a3228).setStrokeStyle(1, 0xd8c49a, 0.4);
        const body = this.add.rectangle(0, -2, 26, 26, TOWER_COLORS[tower.towerId] ?? 0x888888);
        const lvl = this.add
          .text(0, -2, String(tower.level), {
            fontFamily: "Bebas Neue, Impact, sans-serif",
            fontSize: "14px",
            color: "#111",
          })
          .setOrigin(0.5);
        gfx = this.add.container(tower.x, tower.y, [base, body, lvl]).setDepth(30).setSize(34, 34);
        body.setInteractive({ useHandCursor: true });
        body.on("pointerdown", () => {
          const me = this.me();
          if (!me || tower.laneIndex !== me.laneIndex) return;
          this.selectedInstanceId = tower.id;
          const def = TOWERS.find((t) => t.id === tower.towerId);
          this.rangeCircle.setPosition(tower.x, tower.y).setRadius(def?.range ?? 100).setVisible(true);
        });
        this.towerGfx.set(tower.id, gfx);
      }
      const lvlText = gfx.list[2] as Phaser.GameObjects.Text;
      lvlText.setText(String(tower.level));
      gfx.setPosition(tower.x, tower.y);
    }

    if (this.selectedInstanceId) {
      const t = this.state.towers.find((x) => x.id === this.selectedInstanceId);
      if (!t) {
        this.selectedInstanceId = null;
        this.rangeCircle.setVisible(false);
      }
    }
  }

  private updateHud() {
    if (!this.state) return;
    const me = this.me();
    const rival = this.state.players.find((p) => p.sessionId !== net.sessionId);
    const cd = this.state.waveActive ? "OLA" : `CD ${this.state.waveCountdown.toFixed(1)}s`;

    if (me) {
      if (me.laneIndex === 0) {
        this.laneLabelLeft.setText("TU LÍNEA").setColor("#6fbf78");
        this.laneLabelRight.setText("RIVAL").setColor("#c45a4a");
      } else {
        this.laneLabelLeft.setText("RIVAL").setColor("#c45a4a");
        this.laneLabelRight.setText("TU LÍNEA").setColor("#6fbf78");
      }
    }

    this.hud.setText(
      [
        `Ola ${this.state.waveIndex}/10  ·  ${cd}${this.state.suddenDeath ? "  ·  SUDDEN DEATH" : ""}`,
        me ? `${me.lives} vidas  ·  ${me.gold}G  ·  ${me.sendPoints}SP` : "",
        rival ? `Rival ${rival.name}: ${rival.lives}❤${this.state.soloMode ? " (bot)" : ""}` : "",
        this.selectedInstanceId
          ? "[U] upgrade  ·  [S] sell  ·  [ESC] deselect"
          : `${this.selectedTowerId} — click celda`,
      ].join("\n"),
    );

    if (this.time.now < this.placeRejectUntil) {
      this.banner.setText("NO PODÉS TAPAR EL CAMINO");
    } else if (this.state.incomingSendBanner && this.state.incomingSendBanner.until > this.state.time) {
      const meLane = me?.laneIndex;
      if (meLane === this.state.incomingSendBanner.laneIndex) {
        this.banner.setText(`INCOMING  ·  ${this.state.incomingSendBanner.sendId}`);
      } else {
        this.banner.setText(`SEND  ·  ${this.state.incomingSendBanner.sendId}`);
      }
    } else {
      this.banner.setText("");
    }
  }
}
