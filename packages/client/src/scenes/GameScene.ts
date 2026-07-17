import Phaser from "phaser";
import { MAP, SENDS, TOWERS, towerCombatAtLevel, type SimSnapshot } from "@linet/shared";
import { net } from "../net";
import {
  createBadge,
  createBanner,
  createButton,
  createIconText,
  createPanel,
  createStyledText,
  setButtonDisabled,
  UI,
} from "../ui/UIFactory";

const TOWER_COLORS: Record<string, number> = {
  arrow: 0x6dbf6a,
  cannon: 0xc47a3a,
  frost: 0x6ab0d8,
  sniper: 0xb0b0b0,
  mage: 0x9b6ad8,
};

const TOWER_BORDER: Record<string, number> = {
  arrow: 0xa5d6a7,
  cannon: 0xffb74d,
  frost: 0x81d4fa,
  sniper: 0xe0e0e0,
  mage: 0xce93d8,
};

const TOWER_LETTER: Record<string, string> = {
  arrow: "A",
  cannon: "C",
  frost: "F",
  sniper: "S",
  mage: "M",
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
  private creepHealthBars = new Map<string, Phaser.GameObjects.Container>();
  private towerGfx = new Map<string, Phaser.GameObjects.Container>();
  private banner!: Phaser.GameObjects.Text;
  private laneLabelLeft!: Phaser.GameObjects.Text;
  private laneLabelRight!: Phaser.GameObjects.Text;
  private waveBadge!: Phaser.GameObjects.Container;
  private countdownText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private spText!: Phaser.GameObjects.Text;
  private rivalText!: Phaser.GameObjects.Text;
  private towerHintText!: Phaser.GameObjects.Text;
  private selectedTowerId: string = "arrow";
  private selectedInstanceId: string | null = null;
  private placeRejectUntil = 0;
  private rangeCircle!: Phaser.GameObjects.Arc;
  private hoverCell!: Phaser.GameObjects.Rectangle;
  private buildButtons: { id: string; container: Phaser.GameObjects.Container }[] = [];
  private sendButtons: { id: string; container: Phaser.GameObjects.Container }[] = [];
  private towerPanel!: Phaser.GameObjects.Container;
  private towerPanelTitle!: Phaser.GameObjects.Text;
  private towerPanelStats!: Phaser.GameObjects.Text;

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

    this.add.rectangle(0, height - 56, width, 56, 0x080c09, 0.96).setOrigin(0).setDepth(5);
    this.add.rectangle(0, height - 56, width, 2, 0xd8c49a, 0.25).setOrigin(0).setDepth(6);

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
        .text(spawnX + lane.cellSize / 2, spawnY - 8, "ENTRADA", {
          fontFamily: "Bebas Neue, Impact, sans-serif",
          fontSize: "11px",
          color: "#a5d6a7",
          letterSpacing: 1,
        })
        .setOrigin(0.5, 1)
        .setDepth(3);

      this.add
        .text(spawnX + lane.cellSize / 2, spawnY + lane.cellSize / 2, "↓", {
          fontFamily: "Bebas Neue, Impact, sans-serif",
          fontSize: "18px",
          color: "#d8f5d8",
        })
        .setOrigin(0.5)
        .setDepth(3);

      this.add
        .text(exitX + lane.cellSize / 2, exitY + lane.cellSize + 8, "SALIDA", {
          fontFamily: "Bebas Neue, Impact, sans-serif",
          fontSize: "11px",
          color: "#ef9a9a",
          letterSpacing: 1,
        })
        .setOrigin(0.5, 0)
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

    // Top HUD bar
    createPanel(this, width / 2, 32, width - 16, 48, {
      color: UI.colors.darkBg,
      alpha: 0.92,
      borderColor: UI.colors.panelBorder,
    });
    this.waveBadge = createBadge(this, 54, 32, "OLA 0/10", UI.colors.gold);
    this.countdownText = createStyledText(this, 102, 26, "", "small");
    this.livesText = createIconText(this, 240, 26, "❤", "20", UI.colors.redText);
    this.goldText = createIconText(this, 320, 26, "●", "200", UI.colors.goldText);
    this.spText = createIconText(this, 410, 26, "⚡", "80", UI.colors.blueText);
    this.rivalText = createStyledText(this, width - 160, 26, "", "body");
    this.towerHintText = createStyledText(this, width / 2, 54, "", "small");

    this.banner = createBanner(this, width, height);

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
      .setFillStyle(TOWER_COLORS[this.selectedTowerId] ?? 0x6fbf78, 0.38)
      .setVisible(true);
  }

  private me() {
    return this.state?.players.find((p) => p.sessionId === net.sessionId);
  }

  private createBuildBar() {
    const { height } = this.scale;
    const startX = 64;
    const y = height - 38;
    const gap = 74;
    TOWERS.forEach((t, i) => {
      const x = startX + i * gap;
      const btn = createButton(this, x, y, `${t.name}\n$${t.cost}`, {
        width: 70,
        height: 40,
        color: TOWER_COLORS[t.id] ?? 0x888888,
        textColor: UI.colors.textDark,
        fontSize: "10px",
        selected: t.id === this.selectedTowerId,
        onClick: () => {
          this.selectedTowerId = t.id;
          this.selectedInstanceId = null;
          this.rangeCircle.setVisible(false);
          this.refreshBuildBar();
        },
      });
      this.buildButtons.push({ id: t.id, container: btn });
    });
  }

  private refreshBuildBar() {
    for (const btn of this.buildButtons) {
      const bg = btn.container.list[0] as Phaser.GameObjects.Rectangle;
      const selected = btn.id === this.selectedTowerId;
      const def = TOWERS.find((t) => t.id === btn.id);
      const color = def ? (TOWER_COLORS[def.id] ?? 0x888888) : 0x888888;
      const borderColor = selected ? UI.colors.gold : UI.colors.panelBorder;
      bg.setFillStyle(color).setStrokeStyle(selected ? 2 : 1, borderColor);
    }
  }

  private createSendPanel() {
    const { width, height } = this.scale;
    const sends = [
      { id: "send_swarm", label: "SWARM\n20 SP" },
      { id: "send_fast", label: "FAST\n35 SP" },
      { id: "send_tank", label: "TANK\n60 SP" },
      { id: "send_boss", label: "BOSS\n120 SP" },
    ];
    const startX = width - 64;
    const y = height - 38;
    const gap = 74;
    sends.forEach((s, i) => {
      const x = startX - i * gap;
      const btn = createButton(this, x, y, s.label, {
        width: 70,
        height: 40,
        color: 0x4a2522,
        borderColor: UI.colors.red,
        textColor: UI.colors.redText,
        fontSize: "10px",
        onClick: () => net.sendIntent({ type: "sendCreeps", sendId: s.id }),
      });
      this.sendButtons.push({ id: s.id, container: btn });
    });
  }

  private refreshSendPanel() {
    if (!this.state) return;
    const me = this.me();
    if (!me) return;

    for (const btn of this.sendButtons) {
      const def = SENDS.find((s) => s.id === btn.id);
      if (!def) continue;
      const name = def.id.replace("send_", "").toUpperCase();
      let label = `${name}\n${def.costSendPoints} SP`;
      let disabled = false;
      const cdUntil = me.sendCooldownUntil[def.id] ?? 0;
      const cdLeft = cdUntil - this.state.time;

      if (this.state.waveIndex < def.minWave) {
        disabled = true;
        label = `${name}\nOLA ${def.minWave}+`;
      } else if (cdLeft > 0) {
        disabled = true;
        label = `${name}\nCD ${Math.ceil(cdLeft)}s`;
      } else if (me.sendPoints < def.costSendPoints) {
        disabled = true;
        label = `${name}\nSP`;
      }

      setButtonDisabled(btn.container, disabled, {
        label,
        enabledStyle: {
          color: 0x4a2522,
          borderColor: UI.colors.red,
          textColor: UI.colors.redText,
        },
        onClick: () => net.sendIntent({ type: "sendCreeps", sendId: def.id }),
      });
    }
  }

  private createTowerPanel() {
    const { width } = this.scale;
    const panelWidth = 150;
    const panelHeight = 96;
    const x = width - panelWidth / 2 - 10;
    const y = 84;
    const bg = this.add
      .rectangle(0, 0, panelWidth, panelHeight, UI.colors.panelBg, 0.95)
      .setStrokeStyle(1, UI.colors.panelBorder)
      .setDepth(UI.z.panels);
    this.towerPanelTitle = createStyledText(this, -panelWidth / 2 + 10, -panelHeight / 2 + 10, "TORRE", "body", UI.colors.goldText);
    this.towerPanelStats = createStyledText(this, -panelWidth / 2 + 10, -panelHeight / 2 + 30, "", "small");
    const upBtn = createButton(this, -36, 28, "UPGRADE [U]", {
      width: 68,
      height: 24,
      color: UI.colors.green,
      textColor: UI.colors.textDark,
      fontSize: "9px",
      onClick: () => {
        if (this.selectedInstanceId) net.sendIntent({ type: "upgradeTower", towerInstanceId: this.selectedInstanceId });
      },
    });
    const sellBtn = createButton(this, 36, 28, "SELL [S]", {
      width: 64,
      height: 24,
      color: UI.colors.red,
      textColor: UI.colors.textDark,
      fontSize: "9px",
      onClick: () => {
        if (this.selectedInstanceId) net.sendIntent({ type: "sellTower", towerInstanceId: this.selectedInstanceId });
      },
    });
    this.towerPanel = this.add
      .container(x, y, [bg, this.towerPanelTitle, this.towerPanelStats, upBtn, sellBtn])
      .setDepth(UI.z.panels)
      .setVisible(false);

    this.input.keyboard?.on("keydown-U", () => {
      if (this.selectedInstanceId) net.sendIntent({ type: "upgradeTower", towerInstanceId: this.selectedInstanceId });
    });
    this.input.keyboard?.on("keydown-S", () => {
      if (this.selectedInstanceId) net.sendIntent({ type: "sellTower", towerInstanceId: this.selectedInstanceId });
    });
  }

  private updateTowerPanel() {
    if (!this.state || !this.selectedInstanceId) {
      this.towerPanel.setVisible(false);
      return;
    }
    const tower = this.state.towers.find((t) => t.id === this.selectedInstanceId);
    if (!tower) {
      this.towerPanel.setVisible(false);
      return;
    }
    const def = TOWERS.find((t) => t.id === tower.towerId);
    if (!def) {
      this.towerPanelTitle.setText("TORRE");
      this.towerPanelStats.setText(`Lvl ${tower.level}`);
      this.towerPanel.setVisible(true);
      return;
    }
    const stats = towerCombatAtLevel(def, tower.level);
    const slow =
      stats.slowPercent > 0
        ? `\nSlow ${Math.round(stats.slowPercent * 100)}% / ${stats.slowDuration}s`
        : "";
    const splash = stats.splashRadius > 0 ? `\nSplash r=${stats.splashRadius}` : "";
    this.towerPanelTitle.setText(def.name.toUpperCase());
    this.towerPanelStats.setText(
      `Lvl ${tower.level} · ${def.name}\nRng ${Math.round(stats.range)} · Dmg ${Math.round(stats.damage)}${splash}${slow}`,
    );
    this.towerPanel.setVisible(true);
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
      const range = def ? towerCombatAtLevel(def, existing.level).range : 100;
      this.rangeCircle.setPosition(existing.x, existing.y).setRadius(range).setVisible(true);
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
        this.creepHealthBars.get(id)?.destroy();
        this.creepHealthBars.delete(id);
      }
    }
    for (const creep of this.state.creeps) {
      let gfx = this.creepGfx.get(creep.id);
      if (!gfx) {
        const r = creep.creepId === "boss_1" ? 14 : creep.creepId === "brute" ? 11 : 8;
        gfx = this.add.circle(creep.x, creep.y, r, CREEP_COLORS[creep.creepId] ?? 0xffffff).setDepth(20);
        this.creepGfx.set(creep.id, gfx);
        const bar = this.createCreepHealthBar();
        this.creepHealthBars.set(creep.id, bar);
      }
      gfx.setPosition(creep.x, creep.y);
      gfx.setAlpha(creep.source === "send" ? 0.85 : 1);
      const bar = this.creepHealthBars.get(creep.id);
      if (bar) {
        this.updateCreepHealthBar(bar, creep, gfx);
      }
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
        const border = TOWER_BORDER[tower.towerId] ?? 0xd8c49a;
        const base = this.add.rectangle(0, 2, 32, 30, 0x2a3228).setStrokeStyle(2, border, 0.9);
        const body = this.add.rectangle(0, -2, 26, 26, TOWER_COLORS[tower.towerId] ?? 0x888888);
        const letter = this.add
          .text(-8, -10, TOWER_LETTER[tower.towerId] ?? "?", {
            fontFamily: "Bebas Neue, Impact, sans-serif",
            fontSize: "11px",
            color: "#111",
          })
          .setOrigin(0.5);
        const lvl = this.add
          .text(8, -10, String(tower.level), {
            fontFamily: "Bebas Neue, Impact, sans-serif",
            fontSize: "12px",
            color: "#111",
          })
          .setOrigin(0.5);
        gfx = this.add.container(tower.x, tower.y, [base, body, letter, lvl]).setDepth(30).setSize(34, 34);
        body.setInteractive({ useHandCursor: true });
        body.on("pointerdown", () => {
          const me = this.me();
          if (!me || tower.laneIndex !== me.laneIndex) return;
          this.selectedInstanceId = tower.id;
          const def = TOWERS.find((t) => t.id === tower.towerId);
          const range = def ? towerCombatAtLevel(def, tower.level).range : 100;
          this.rangeCircle.setPosition(tower.x, tower.y).setRadius(range).setVisible(true);
        });
        this.towerGfx.set(tower.id, gfx);
      }
      const lvlText = gfx.list[3] as Phaser.GameObjects.Text;
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

    if (me) {
      if (me.laneIndex === 0) {
        this.laneLabelLeft.setText("TU LÍNEA").setColor("#6fbf78");
        this.laneLabelRight.setText("RIVAL").setColor("#c45a4a");
      } else {
        this.laneLabelLeft.setText("RIVAL").setColor("#c45a4a");
        this.laneLabelRight.setText("TU LÍNEA").setColor("#6fbf78");
      }
    }

    const badgeLabel = this.waveBadge.list[1] as Phaser.GameObjects.Text;
    badgeLabel.setText(`OLA ${this.state.waveIndex}/10`);
    const cd = this.state.waveActive
      ? "EN PROGRESO"
      : `SIGUIENTE EN ${Math.max(0, this.state.waveCountdown).toFixed(1)}s`;
    this.countdownText.setText(`${cd}${this.state.suddenDeath ? "  ·  SUDDEN DEATH" : ""}`);

    if (me) {
      this.livesText.setText(`❤ ${me.lives}`);
      this.goldText.setText(`● ${me.gold}`);
      this.spText.setText(`⚡ ${me.sendPoints}`);
    }

    if (rival) {
      if (this.state.soloMode) {
        this.rivalText.setText(`RIVAL: ${rival.name}  ${rival.lives}❤ (bot)`).setColor(UI.colors.redText);
      } else if (!rival.connected) {
        this.rivalText
          .setText(`RIVAL: ${rival.name}  ${rival.lives}❤ · DESCONECTADO`)
          .setColor("#9aa898");
      } else {
        this.rivalText.setText(`RIVAL: ${rival.name}  ${rival.lives}❤`).setColor(UI.colors.redText);
      }
    } else {
      this.rivalText.setText("");
    }

    this.refreshSendPanel();

    this.towerHintText.setText(
      this.selectedInstanceId
        ? "[U] UPGRADE  ·  [S] SELL  ·  [ESC] DESELECT"
        : `${this.selectedTowerId.toUpperCase()} — CLICK UNA CELDA VACÍA`,
    );

    this.updateTowerPanel();

    if (this.time.now < this.placeRejectUntil) {
      this.banner.setText("NO PODÉS TAPAR EL CAMINO");
      this.banner.setColor("#c45a4a");
    } else if (this.state.incomingSendBanner && this.state.incomingSendBanner.until > this.state.time) {
      const meLane = me?.laneIndex;
      if (meLane === this.state.incomingSendBanner.laneIndex) {
        this.banner.setText(`¡INCOMING ${this.state.incomingSendBanner.sendId.toUpperCase()}!`);
        this.banner.setColor("#c45a4a");
      } else {
        this.banner.setText(`SEND ${this.state.incomingSendBanner.sendId.toUpperCase()}`);
        this.banner.setColor(UI.colors.goldText);
      }
    } else {
      this.banner.setText("");
    }
  }

  private createCreepHealthBar(): Phaser.GameObjects.Container {
    const width = 20;
    const height = 4;
    const bg = this.add.rectangle(0, 0, width, height, 0x222222).setDepth(22);
    const fill = this.add
      .rectangle(-width / 2, 0, width, height, 0x4ade80)
      .setDepth(22)
      .setOrigin(0, 0.5);
    return this.add.container(0, 0, [bg, fill]).setDepth(22);
  }

  private updateCreepHealthBar(
    bar: Phaser.GameObjects.Container,
    creep: SimSnapshot["creeps"][number],
    gfx: Phaser.GameObjects.Arc,
  ) {
    const pct = Math.max(0, creep.hp / creep.maxHp);
    const fill = bar.list[1] as Phaser.GameObjects.Rectangle;
    fill.scaleX = pct;
    fill.setFillStyle(this.healthBarColor(pct));
    bar.setPosition(creep.x, creep.y - gfx.radius - 6);
    bar.setAlpha(gfx.alpha);
  }

  private healthBarColor(pct: number): number {
    if (pct > 0.6) return 0x4ade80; // green
    if (pct > 0.3) return 0xfacc15; // yellow
    return 0xef4444; // red
  }
}
