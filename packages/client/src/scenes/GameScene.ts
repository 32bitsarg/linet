import Phaser from "phaser";
import {
  MAP,
  SENDS,
  TOWERS,
  cellKey,
  findPath,
  towerCombatAtLevel,
  type SimSnapshot,
} from "@linet/shared";
import { CAMERA_BOUNDS_PAD_X, CAMERA_BOUNDS_PAD_Y, RtsCameraController } from "../camera/RtsCamera";
import {
  creepDisplaySize,
  creepSheetKey,
  playCreepWalk,
} from "../fx/creepSprites";
import { TEX_DIRT, TEX_GRASS, TEX_MEADOW, TEX_SCRUB, cellNoise } from "../fx/groundTextures";
import {
  playTowerAttack,
  playTowerIdle,
  towerSheetKey,
} from "../fx/towerSprites";
import { net } from "../net";
import {
  createBadge,
  createBanner,
  createButton,
  createIconText,
  createStyledText,
  setButtonDisabled,
  type ButtonResult,
  UI,
} from "../ui/UIFactory";

const TOWER_COLORS: Record<string, number> = {
  arrow: 0x6dbf6a,
  cannon: 0xc47a3a,
  frost: 0x6ab0d8,
  sniper: 0xb0b0b0,
  mage: 0x9b6ad8,
};

const BOTTOM_H = 46;

/** Y-sorted depth for faux 2.5D (lower on screen draws on top). */
function depthAtY(y: number, layer = 0): number {
  return 20 + Math.floor(y) + layer;
}

export class GameScene extends Phaser.Scene {
  private state: SimSnapshot | null = null;
  private creepGfx = new Map<string, Phaser.GameObjects.Container>();
  private creepLastX = new Map<string, number>();
  private creepHealthBars = new Map<string, Phaser.GameObjects.Container>();
  private towerGfx = new Map<string, Phaser.GameObjects.Container>();
  /** Sprite child index inside tower containers (after shadow). */
  private static readonly TOWER_SPRITE_IDX = 1;
  private static readonly TOWER_LVL_IDX = 2;
  private static readonly CREEP_SPRITE_IDX = 0;
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
  private pathGfx!: Phaser.GameObjects.Graphics;
  private buildButtons: { id: string; button: ButtonResult }[] = [];
  private sendButtons: { id: string; button: ButtonResult }[] = [];
  private towerPanel!: Phaser.GameObjects.Container;
  private disconnectOverlay!: Phaser.GameObjects.Container;
  private rivalWaitOverlay!: Phaser.GameObjects.Container;
  private rivalWaitText!: Phaser.GameObjects.Text;
  private towerPanelTitle!: Phaser.GameObjects.Text;
  private towerPanelStats!: Phaser.GameObjects.Text;
  private rtsCam!: RtsCameraController;
  private hudCam!: Phaser.Cameras.Scene2D.Camera;
  private readonly hudObjects = new Set<Phaser.GameObjects.GameObject>();
  private cameraBootstrapped = false;
  private dockBg!: Phaser.GameObjects.Rectangle;
  private dockLine!: Phaser.GameObjects.Rectangle;
  private dockTowersLabel!: Phaser.GameObjects.Text;
  private dockSendsLabel!: Phaser.GameObjects.Text;
  private camBtnMine!: Phaser.GameObjects.Container;
  private camBtnRival!: Phaser.GameObjects.Container;
  private camBtnAll!: Phaser.GameObjects.Container;
  private camTip!: Phaser.GameObjects.Text;

  constructor() {
    super("game");
  }

  /** Mark object as screen-fixed HUD (rendered only by hudCam). */
  private registerHud<T extends Phaser.GameObjects.GameObject>(obj: T): T {
    this.hudObjects.add(obj);
    const depthObj = obj as unknown as Phaser.GameObjects.Components.Depth & { depth?: number };
    if (typeof depthObj.setDepth === "function") {
      depthObj.setDepth(Math.max(depthObj.depth ?? 0, UI.z.hud));
    }
    const list = (obj as unknown as { list?: Phaser.GameObjects.GameObject[] }).list;
    if (Array.isArray(list)) {
      for (const child of list) {
        this.hudObjects.add(child);
      }
    }
    return obj;
  }

  /** World objects must be ignored by the fixed HUD camera. */
  private registerWorld<T extends Phaser.GameObjects.GameObject>(obj: T): T {
    this.hudCam?.ignore(obj);
    return obj;
  }

  /** Continuous terrain under/around the mazes (meadow + scrub + dirt patches). */
  private paintWorldTerrain() {
    const worldW = MAP.width + CAMERA_BOUNDS_PAD_X * 2;
    const worldH = MAP.height + CAMERA_BOUNDS_PAD_Y * 2;
    const cx = MAP.width / 2;
    const cy = MAP.height / 2;

    // Far padding — darker scrub so the playable field reads as a clearing
    this.add
      .tileSprite(cx, cy, worldW, worldH, TEX_SCRUB)
      .setDepth(0)
      .setTint(0x889988);

    // Main meadow covering the map area (+ a bit of bleed)
    const bleed = 48;
    this.add
      .tileSprite(cx, cy, MAP.width + bleed * 2, MAP.height + bleed * 2, TEX_MEADOW)
      .setDepth(0)
      .setTint(0xb8d0a8)
      .setAlpha(0.98);

    // Ally / rival atmosphere washes (still terrain-tinted, not flat panels)
    this.add
      .rectangle(0, 0, MAP.width / 2, MAP.height, 0x14301c, 0.18)
      .setOrigin(0)
      .setDepth(0);
    this.add
      .rectangle(MAP.width / 2, 0, MAP.width / 2, MAP.height, 0x2a1818, 0.16)
      .setOrigin(0)
      .setDepth(0);

    // Dirt patches between / around lanes so meadow ↔ maze dirt connects
    const patches: { x: number; y: number; w: number; h: number; tint: number; alpha: number }[] = [
      { x: MAP.width / 2, y: MAP.height * 0.28, w: 160, h: 220, tint: 0xc4a890, alpha: 0.75 },
      { x: MAP.width / 2, y: MAP.height * 0.62, w: 140, h: 180, tint: 0xb89878, alpha: 0.7 },
      { x: 24, y: MAP.height * 0.45, w: 90, h: 260, tint: 0xa8c098, alpha: 0.55 },
      { x: MAP.width - 24, y: MAP.height * 0.5, w: 90, h: 240, tint: 0xc09080, alpha: 0.5 },
      { x: 220, y: 20, w: 200, h: 70, tint: 0xb0c8a0, alpha: 0.6 },
      { x: 1060, y: 20, w: 200, h: 70, tint: 0xc8a090, alpha: 0.55 },
      { x: 220, y: MAP.height - 16, w: 220, h: 60, tint: 0xa89878, alpha: 0.55 },
      { x: 1060, y: MAP.height - 16, w: 220, h: 60, tint: 0xb08070, alpha: 0.5 },
    ];

    for (let i = 0; i < patches.length; i++) {
      const p = patches[i]!;
      const key = i % 3 === 0 ? TEX_DIRT : TEX_MEADOW;
      this.add
        .tileSprite(p.x, p.y, p.w, p.h, key)
        .setDepth(0)
        .setTint(p.tint)
        .setAlpha(p.alpha)
        .setAngle((i % 5) * 7 - 14);
    }

    // Soft path of dirt down the center corridor (between mazes)
    this.add
      .tileSprite(MAP.width / 2, MAP.height / 2, 72, MAP.height - 40, TEX_DIRT)
      .setDepth(0)
      .setTint(0xb09070)
      .setAlpha(0.45);
  }

  private setupHudCamera() {
    const { width, height } = this.scale;
    this.hudCam = this.cameras.add(0, 0, width, height);
    this.hudCam.setName("hud");
    this.hudCam.setScroll(0, 0);
    this.hudCam.setZoom(1);
    this.hudCam.setRoundPixels(true);
    this.hudCam.transparent = true;
    this.hudCam.setBackgroundColor("rgba(0,0,0,0)");

    const hudList = [...this.hudObjects];
    this.cameras.main.ignore(hudList);

    for (const child of this.children.list) {
      if (!this.hudObjects.has(child)) {
        this.hudCam.ignore(child);
      }
    }
  }

  private onGameResize(gameSize: Phaser.Structs.Size) {
    const width = gameSize.width;
    const height = gameSize.height;
    this.cameras.main.setSize(width, height);
    if (this.hudCam) {
      this.hudCam.setViewport(0, 0, width, height);
      this.hudCam.setSize(width, height);
    }
    this.rtsCam?.refreshViewport(false);
    this.layoutHud(width, height);
  }

  private layoutHud(width: number, height: number) {
    if (!this.dockBg) return;
    this.dockBg.setPosition(0, height - BOTTOM_H).setSize(width, BOTTOM_H);
    this.dockLine.setPosition(0, height - BOTTOM_H).setSize(width, 1);
    this.dockTowersLabel.setPosition(24, height - BOTTOM_H + 6);
    this.dockSendsLabel.setPosition(width - 24, height - BOTTOM_H + 6);

    const chipY = 16;
    this.waveBadge?.setPosition(48, chipY);
    this.countdownText?.setPosition(90, chipY - 5);
    this.livesText?.setPosition(width / 2 - 96, chipY - 5);
    this.goldText?.setPosition(width / 2 - 16, chipY - 5);
    this.spText?.setPosition(width / 2 + 72, chipY - 5);
    this.rivalText?.setPosition(width - 14, chipY - 5);
    this.towerHintText?.setPosition(width / 2, height - BOTTOM_H - 12);
    this.banner?.setPosition(width / 2, 34);

    this.camBtnMine?.setPosition(width / 2 - 80, 42);
    this.camBtnRival?.setPosition(width / 2, 42);
    this.camBtnAll?.setPosition(width / 2 + 80, 42);
    this.camTip?.setPosition(width / 2, 58);

    this.buildButtons.forEach((btn, i) => {
      btn.button.container.setPosition(72 + i * 70, height - 22);
    });
    this.sendButtons.forEach((btn, i) => {
      btn.button.container.setPosition(width - 48 - i * 58, height - 22);
    });

    this.towerPanel?.setPosition(width - 150 / 2 - 10, 96);
  }

  create() {
    const { width, height } = this.scale;

    this.rtsCam = new RtsCameraController(this, {
      hudBottom: BOTTOM_H,
      hudTop: 40,
    });

    this.paintWorldTerrain();

    const divider = this.add
      .rectangle(MAP.width / 2, MAP.height / 2, 2, MAP.height - 40, 0xd8c49a, 0.28)
      .setDepth(4);
    this.tweens.add({
      targets: divider,
      alpha: { from: 0.18, to: 0.42 },
      duration: 2600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Bottom action dock (screen-space HUD)
    this.dockBg = this.registerHud(
      this.add.rectangle(0, height - BOTTOM_H, width, BOTTOM_H, 0x060a08, 0.97).setOrigin(0),
    );
    this.dockLine = this.registerHud(
      this.add.rectangle(0, height - BOTTOM_H, width, 1, 0xd8c49a, 0.35).setOrigin(0),
    );
    this.dockTowersLabel = this.registerHud(
      this.add.text(24, height - BOTTOM_H + 6, "TORRES", {
        fontFamily: UI.fontTitle,
        fontSize: "11px",
        color: UI.colors.goldText,
        letterSpacing: 2,
      }),
    );
    this.dockSendsLabel = this.registerHud(
      this.add
        .text(width - 24, height - BOTTOM_H + 6, "SENDS", {
          fontFamily: UI.fontTitle,
          fontSize: "11px",
          color: UI.colors.redText,
          letterSpacing: 2,
        })
        .setOrigin(1, 0),
    );

    const lane0 = MAP.lanes[0]!;
    const lane1 = MAP.lanes[1]!;
    this.laneLabelLeft = this.add
      .text(lane0.originX + (lane0.cols * lane0.cellSize) / 2, lane0.originY - 18, "TU LÍNEA", {
        fontFamily: UI.fontTitle,
        fontSize: "18px",
        color: "#6fbf78",
        letterSpacing: 3,
      })
      .setOrigin(0.5, 1)
      .setDepth(8);
    this.laneLabelRight = this.add
      .text(lane1.originX + (lane1.cols * lane1.cellSize) / 2, lane1.originY - 18, "RIVAL", {
        fontFamily: UI.fontTitle,
        fontSize: "18px",
        color: "#c45a4a",
        letterSpacing: 3,
      })
      .setOrigin(0.5, 1)
      .setDepth(8);

    const cell = lane0.cellSize;
    this.hoverCell = this.add
      .rectangle(0, 0, cell - 3, cell - 3, 0x6fbf78, 0.22)
      .setStrokeStyle(2, 0xd8c49a, 0.9)
      .setVisible(false)
      .setDepth(3);

    this.pathGfx = this.add.graphics().setDepth(2);

    MAP.lanes.forEach((lane, laneIndex) => {
      const ally = laneIndex === 0;
      const accent = ally ? 0x6fbf78 : 0xc45a4a;
      const grid = ally ? 0x2a4032 : 0x403028;
      const g = this.add.graphics().setDepth(1);
      const w = lane.cols * lane.cellSize;
      const h = lane.rows * lane.cellSize;

      // Outer shadow / frame
      g.fillStyle(0x000000, 0.35);
      g.fillRect(lane.originX - 2, lane.originY - 2, w + 4, h + 4);

      // Mixed grass + dirt tile floor
      for (let r = 0; r < lane.rows; r++) {
        for (let c = 0; c < lane.cols; c++) {
          const n = cellNoise(c, r, laneIndex + 1);
          const n2 = cellNoise(c + 3, r + 5, laneIndex + 9);
          // Ally: mostly grass with dirt patches. Rival: more scorched dirt.
          const grassBias = ally ? 0.38 : 0.58;
          const useDirt = n > grassBias;
          const key = useDirt ? TEX_DIRT : TEX_GRASS;
          const img = this.add
            .image(
              lane.originX + c * lane.cellSize + lane.cellSize / 2,
              lane.originY + r * lane.cellSize + lane.cellSize / 2,
              key,
            )
            .setDisplaySize(lane.cellSize + 1, lane.cellSize + 1)
            .setDepth(1);

          if (ally) {
            img.setTint(useDirt ? 0xc8d8b8 : 0xb8e0b0);
          } else {
            img.setTint(useDirt ? 0xe0a090 : 0xc09070);
          }
          // Slight brightness variation so the mix feels organic
          img.setAlpha(0.88 + n2 * 0.12);
        }
      }

      // Soft vignette at bottom of maze
      g.fillStyle(0x000000, 0.16);
      g.fillRect(lane.originX, lane.originY + h - 12, w, 12);
      g.lineStyle(2, accent, 0.85);
      g.strokeRect(lane.originX - 1, lane.originY - 1, w + 2, h + 2);

      g.lineStyle(1, grid, 0.28);
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

      g.fillStyle(0x3d7a45, 0.55);
      g.fillRect(spawnX + 1, spawnY + 1, lane.cellSize - 2, lane.cellSize - 2);
      g.fillStyle(0x8a3a35, 0.6);
      g.fillRect(exitX + 1, exitY + 1, lane.cellSize - 2, lane.cellSize - 2);

      const spawnGlow = this.add
        .rectangle(
          spawnX + lane.cellSize / 2,
          spawnY + lane.cellSize / 2,
          lane.cellSize - 4,
          lane.cellSize - 4,
          0x6fbf78,
          0.2,
        )
        .setDepth(2);
      this.tweens.add({
        targets: spawnGlow,
        alpha: { from: 0.12, to: 0.4 },
        duration: 1100,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.add
        .text(spawnX + lane.cellSize / 2, spawnY + 2, "IN", {
          fontFamily: UI.fontTitle,
          fontSize: "10px",
          color: "#d8f5d8",
        })
        .setOrigin(0.5, 0)
        .setDepth(3);

      this.add
        .text(exitX + lane.cellSize / 2, exitY + lane.cellSize - 2, "OUT", {
          fontFamily: UI.fontTitle,
          fontSize: "10px",
          color: "#ffc9c4",
        })
        .setOrigin(0.5, 1)
        .setDepth(3);

      const hit = this.add
        .rectangle(lane.originX + w / 2, lane.originY + h / 2, w, h, 0x000000, 0)
        .setInteractive({ useHandCursor: true })
        .setDepth(2);
      hit.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        if (pointer.middleButtonDown() || pointer.rightButtonDown()) return;
        this.onLanePointer(lane.id, pointer.worldX, pointer.worldY);
      });
      hit.on("pointermove", (pointer: Phaser.Input.Pointer) => {
        this.updateHover(lane.id, pointer.worldX, pointer.worldY);
      });
      hit.on("pointerout", () => this.hoverCell.setVisible(false));
    });

    this.rangeCircle = this.add
      .circle(0, 0, 10, 0xffffff, 0.05)
      .setStrokeStyle(1, 0xd8c49a, 0.65)
      .setVisible(false)
      .setDepth(15);

    // Floating top HUD chips
    const chipY = 16;
    this.waveBadge = this.registerHud(createBadge(this, 48, chipY, "OLA 0/10", UI.colors.gold));
    this.countdownText = this.registerHud(createStyledText(this, 90, chipY - 5, "", "small"));
    this.livesText = this.registerHud(
      createIconText(this, width / 2 - 96, chipY - 5, "❤", "20", UI.colors.redText),
    );
    this.goldText = this.registerHud(
      createIconText(this, width / 2 - 16, chipY - 5, "●", "200", UI.colors.goldText),
    );
    this.spText = this.registerHud(
      createIconText(this, width / 2 + 72, chipY - 5, "⚡", "100", UI.colors.blueText),
    );
    this.rivalText = this.registerHud(
      createStyledText(this, width - 14, chipY - 5, "", "small").setOrigin(1, 0),
    );
    this.towerHintText = this.registerHud(
      createStyledText(this, width / 2, height - BOTTOM_H - 12, "", "small").setOrigin(0.5),
    );

    this.banner = this.registerHud(createBanner(this, width, height));
    this.banner.setY(34);

    this.createCameraControls();
    this.createBuildBar();
    this.createSendPanel();
    this.createTowerPanel();
    this.createDisconnectOverlay();
    this.createRivalWaitOverlay();
    this.setupHudCamera();
    this.layoutHud(width, height);

    net.onConnectionLost = () => this.disconnectOverlay.setVisible(true);
    net.onConnectionRestored = () => this.disconnectOverlay.setVisible(false);

    this.scale.on("resize", this.onGameResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off("resize", this.onGameResize, this);
    });

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
      this.bootstrapCameraIfNeeded();
      this.syncWorld();
      this.updateHud();
    };

    net.onEvent = (e) => {
      if (e.type === "attack") {
        const line = this.registerWorld(
          this.add
            .line(0, 0, e.x as number, e.y as number, e.tx as number, e.ty as number, 0xffe082, 0.75)
            .setOrigin(0, 0)
            .setDepth(depthAtY(Math.max(e.y as number, e.ty as number), 40)),
        );
        this.tweens.add({ targets: line, alpha: 0, duration: 140, onComplete: () => line.destroy() });

        const instanceId = e.towerId as string | undefined;
        if (instanceId) {
          const gfx = this.towerGfx.get(instanceId);
          const tower = this.state?.towers.find((t) => t.id === instanceId);
          if (gfx && tower) {
            const sprite = gfx.list[GameScene.TOWER_SPRITE_IDX];
            if (sprite instanceof Phaser.GameObjects.Sprite) {
              playTowerAttack(sprite, tower.towerId);
            }
          }
        }
      }
      if (e.type === "placeRejected") {
        this.placeRejectUntil = this.time.now + 1200;
        this.banner.setText("NO PODÉS TAPAR EL CAMINO");
      }
    };

    net.requestSync();

    this.input.keyboard?.on("keydown-ESC", () => {
      this.selectedInstanceId = null;
      this.rangeCircle.setVisible(false);
    });

    this.input.keyboard?.on("keydown-Q", () => this.focusMyLane());
    this.input.keyboard?.on("keydown-E", () => this.focusRivalLane());
    this.input.keyboard?.on("keydown-HOME", () => this.rtsCam.focusOverview());
    this.input.keyboard?.on("keydown-ONE", () => this.focusMyLane());
    this.input.keyboard?.on("keydown-TWO", () => this.focusRivalLane());
    this.input.keyboard?.on("keydown-THREE", () => this.rtsCam.focusOverview());
    this.input.keyboard?.on("keydown-SPACE", () => this.centerMyLane());
  }

  update(_time: number, delta: number) {
    this.rtsCam.allowSPan = !this.selectedInstanceId;
    this.rtsCam.update(delta);
  }

  private bootstrapCameraIfNeeded() {
    if (this.cameraBootstrapped) return;
    const me = this.me();
    if (!me) return;
    this.cameraBootstrapped = true;
    this.focusMyLane(0);
  }

  private focusMyLane(duration = 280) {
    const me = this.me();
    const lane = MAP.lanes[me?.laneIndex ?? 0];
    if (lane) this.rtsCam.focusLane(lane, undefined, duration);
  }

  private focusRivalLane(duration = 280) {
    const me = this.me();
    const rivalIndex = me ? 1 - me.laneIndex : 1;
    const lane = MAP.lanes[rivalIndex];
    if (lane) this.rtsCam.focusLane(lane, undefined, duration);
  }

  /** Pan only (keep zoom) so my lane is centered — Space. */
  private centerMyLane(duration = 220) {
    const me = this.me();
    const lane = MAP.lanes[me?.laneIndex ?? 0];
    if (lane) this.rtsCam.centerOnLane(lane, duration);
  }

  private createCameraControls() {
    const { width } = this.scale;
    const y = 42;
    const mk = (x: number, label: string, onClick: () => void) => {
      const btn = createButton(this, x, y, label, {
        width: 72,
        height: 22,
        color: 0x1a2420,
        borderColor: UI.colors.gold,
        textColor: UI.colors.goldText,
        fontSize: "9px",
        onClick,
      });
      this.registerHud(btn.container);
      return btn.container;
    };
    this.camBtnMine = mk(width / 2 - 80, "MI MAPA [Q]", () => this.focusMyLane());
    this.camBtnRival = mk(width / 2, "RIVAL [E]", () => this.focusRivalLane());
    this.camBtnAll = mk(width / 2 + 80, "TODO [3]", () => this.rtsCam.focusOverview());

    this.camTip = this.registerHud(
      createStyledText(
        this,
        width / 2,
        58,
        "Cámara: WASD · Space centra tu línea · Q/E foco",
        "small",
      ).setOrigin(0.5),
    );
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
      .setSize(myLane.cellSize - 3, myLane.cellSize - 3)
      .setFillStyle(TOWER_COLORS[this.selectedTowerId] ?? 0x6fbf78, 0.38)
      .setDepth(depthAtY(myLane.originY + row * myLane.cellSize, 1))
      .setVisible(true);
  }

  private me() {
    return this.state?.players.find((p) => p.sessionId === net.sessionId);
  }

  private createBuildBar() {
    const { height } = this.scale;
    const startX = 72;
    const y = height - 22;
    const gap = 70;
    TOWERS.forEach((t, i) => {
      const x = startX + i * gap;
      const btn = createButton(this, x, y, `${t.name}\n$${t.cost}`, {
        width: 64,
        height: 34,
        color: TOWER_COLORS[t.id] ?? 0x888888,
        textColor: UI.colors.textDark,
        fontSize: "9px",
        selected: t.id === this.selectedTowerId,
        onClick: () => {
          this.selectedTowerId = t.id;
          this.selectedInstanceId = null;
          this.rangeCircle.setVisible(false);
          this.refreshBuildBar();
        },
      });
      this.registerHud(btn.container);
      this.buildButtons.push({ id: t.id, button: btn });
    });
  }

  private refreshBuildBar() {
    for (const btn of this.buildButtons) {
      const selected = btn.id === this.selectedTowerId;
      const def = TOWERS.find((t) => t.id === btn.id);
      const color = def ? (TOWER_COLORS[def.id] ?? 0x888888) : 0x888888;
      const borderColor = selected ? UI.colors.gold : UI.colors.panelBorder;
      btn.button.bg.setFillStyle(color).setStrokeStyle(selected ? 2 : 1, borderColor);
    }
  }

  private createSendPanel() {
    const { width, height } = this.scale;
    const startX = width - 48;
    const y = height - 22;
    const gap = 58;
    [...SENDS].reverse().forEach((s, i) => {
      const name = s.id.replace("send_", "").toUpperCase();
      const x = startX - i * gap;
      const btn = createButton(this, x, y, `${name}\n${s.costSendPoints} SP`, {
        width: 54,
        height: 34,
        color: 0x4a2522,
        borderColor: UI.colors.red,
        textColor: UI.colors.redText,
        fontSize: "9px",
        onClick: () => net.sendIntent({ type: "sendCreeps", sendId: s.id }),
      });
      this.registerHud(btn.container);
      this.sendButtons.push({ id: s.id, button: btn });
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

      setButtonDisabled(btn.button, disabled, {
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
    const y = 96;
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
      .container(x, y, [bg, this.towerPanelTitle, this.towerPanelStats, upBtn.container, sellBtn.container])
      .setDepth(UI.z.panels)
      .setVisible(false);
    this.registerHud(this.towerPanel);

    this.input.keyboard?.on("keydown-U", () => {
      if (this.selectedInstanceId) net.sendIntent({ type: "upgradeTower", towerInstanceId: this.selectedInstanceId });
    });
    this.input.keyboard?.on("keydown-S", () => {
      if (this.selectedInstanceId) net.sendIntent({ type: "sellTower", towerInstanceId: this.selectedInstanceId });
    });
  }

  private createDisconnectOverlay() {
    const { width, height } = this.scale;
    const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.72).setOrigin(0).setDepth(UI.z.modal);
    const label = this.add
      .text(width / 2, height / 2, "RECONNECTING…", {
        fontFamily: UI.fontTitle,
        fontSize: "36px",
        color: UI.colors.goldText,
        letterSpacing: 3,
      })
      .setOrigin(0.5)
      .setDepth(UI.z.modal);
    this.disconnectOverlay = this.registerHud(
      this.add.container(0, 0, [bg, label]).setDepth(UI.z.modal).setVisible(false),
    );
  }

  private createRivalWaitOverlay() {
    const { width, height } = this.scale;
    const bg = this.add.rectangle(0, 0, width, height, 0x000000, 0.25).setOrigin(0).setDepth(UI.z.modal);
    this.rivalWaitText = this.add
      .text(width / 2, height / 2, "", {
        fontFamily: UI.fontBody,
        fontSize: "18px",
        color: UI.colors.textLight,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(UI.z.modal);
    this.rivalWaitOverlay = this.registerHud(
      this.add.container(0, 0, [bg, this.rivalWaitText]).setDepth(UI.z.modal).setVisible(false),
    );
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
        this.creepLastX.delete(id);
        this.creepHealthBars.get(id)?.destroy();
        this.creepHealthBars.delete(id);
      }
    }
    for (const creep of this.state.creeps) {
      let gfx = this.creepGfx.get(creep.id);
      const size = creepDisplaySize(creep.creepId);
      if (!gfx) {
        const sheet = creepSheetKey(creep.creepId);
        const sprite = this.add
          .sprite(0, 0, sheet, 0)
          .setDisplaySize(size.w, size.h)
          .setOrigin(0.5, 0.85);
        playCreepWalk(sprite, creep.creepId);
        gfx = this.registerWorld(
          this.add.container(creep.x, creep.y, [sprite]).setSize(size.w, size.h),
        );
        this.creepGfx.set(creep.id, gfx);
        this.creepLastX.set(creep.id, creep.x);
        const bar = this.registerWorld(this.createCreepHealthBar(size.w));
        this.creepHealthBars.set(creep.id, bar);
      }
      const sprite = gfx.list[GameScene.CREEP_SPRITE_IDX];
      const prevX = this.creepLastX.get(creep.id) ?? creep.x;
      if (sprite instanceof Phaser.GameObjects.Sprite) {
        if (Math.abs(creep.x - prevX) > 0.4) {
          sprite.setFlipX(creep.x < prevX);
        }
        playCreepWalk(sprite, creep.creepId);
        if (creep.slowUntil > this.state.time) {
          sprite.setTint(0x88ccff);
        } else {
          sprite.clearTint();
        }
      }
      this.creepLastX.set(creep.id, creep.x);
      gfx.setPosition(creep.x, creep.y);
      gfx.setAlpha(creep.source === "send" ? 0.85 : 1);
      gfx.setDepth(depthAtY(creep.y, 2));
      const bar = this.creepHealthBars.get(creep.id);
      if (bar) {
        this.updateCreepHealthBar(bar, creep, size.h, gfx.alpha);
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
        const sheet = towerSheetKey(tower.towerId);
        const cell = MAP.lanes[0]?.cellSize ?? 36;
        const tw = Math.round(cell * 0.95);
        const th = Math.round(cell * 1.12);
        const shadow = this.add.ellipse(
          1,
          Math.round(th * 0.35),
          Math.round(tw * 0.85),
          Math.round(th * 0.28),
          0x000000,
          0.4,
        );
        const sprite = this.add
          .sprite(0, -2, sheet, 0)
          .setDisplaySize(tw, th)
          .setOrigin(0.5, 0.75);
        playTowerIdle(sprite, tower.towerId);
        sprite.setInteractive({ useHandCursor: true });
        sprite.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
          if (pointer.middleButtonDown()) return;
          const me = this.me();
          if (!me || tower.laneIndex !== me.laneIndex) return;
          this.selectedInstanceId = tower.id;
          const def = TOWERS.find((t) => t.id === tower.towerId);
          const range = def ? towerCombatAtLevel(def, tower.level).range : 100;
          this.rangeCircle.setPosition(tower.x, tower.y).setRadius(range).setVisible(true);
        });
        const lvl = this.add
          .text(Math.round(tw * 0.38), -Math.round(th * 0.45), String(tower.level), {
            fontFamily: UI.fontTitle,
            fontSize: "12px",
            color: "#f0f0e8",
            stroke: "#111",
            strokeThickness: 3,
          })
          .setOrigin(0.5);
        gfx = this.registerWorld(
          this.add.container(tower.x, tower.y, [shadow, sprite, lvl]).setSize(tw, th),
        );
        this.towerGfx.set(tower.id, gfx);
      }
      const lvlText = gfx.list[GameScene.TOWER_LVL_IDX] as Phaser.GameObjects.Text;
      lvlText.setText(String(tower.level));
      gfx.setPosition(tower.x, tower.y);
      gfx.setDepth(depthAtY(tower.y, 5));
    }

    if (this.selectedInstanceId) {
      const t = this.state.towers.find((x) => x.id === this.selectedInstanceId);
      if (!t) {
        this.selectedInstanceId = null;
        this.rangeCircle.setVisible(false);
      } else {
        this.rangeCircle.setPosition(t.x, t.y).setDepth(depthAtY(t.y, 3));
      }
    }

    this.redrawPaths();
  }

  /** Ghost polyline of current spawn→exit route per lane (mine bright, rival faint). */
  private redrawPaths() {
    if (!this.state) return;
    this.pathGfx.clear();
    const me = this.me();

    MAP.lanes.forEach((lane, laneIndex) => {
      const blocked = new Set<string>();
      for (const t of this.state!.towers) {
        if (t.laneIndex === laneIndex) blocked.add(cellKey(t.col, t.row));
      }
      const path = findPath(
        lane,
        blocked,
        lane.spawnCol,
        lane.spawnRow,
        lane.exitCol,
        lane.exitRow,
      );
      if (!path || path.length < 2) return;

      const mine = me?.laneIndex === laneIndex;
      const color = mine ? 0xd8c49a : 0xc45a4a;
      const alpha = mine ? 0.5 : 0.2;
      this.pathGfx.lineStyle(2.5, color, alpha);
      this.pathGfx.beginPath();
      this.pathGfx.moveTo(path[0]!.x, path[0]!.y);
      for (let i = 1; i < path.length; i++) {
        this.pathGfx.lineTo(path[i]!.x, path[i]!.y);
      }
      this.pathGfx.strokePath();

      this.pathGfx.fillStyle(color, alpha * 0.85);
      for (const p of path) {
        this.pathGfx.fillCircle(p.x, p.y, 2);
      }
    });
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
        this.rivalWaitOverlay.setVisible(false);
      } else if (!rival.connected) {
        this.rivalText
          .setText(`RIVAL: ${rival.name}  ${rival.lives}❤ · DESCONECTADO`)
          .setColor("#9aa898");
        this.rivalWaitText.setText(`ESPERANDO A ${rival.name.toUpperCase()}…`);
        this.rivalWaitOverlay.setVisible(true);
      } else {
        this.rivalText.setText(`RIVAL: ${rival.name}  ${rival.lives}❤`).setColor(UI.colors.redText);
        this.rivalWaitOverlay.setVisible(false);
      }
    } else {
      this.rivalText.setText("");
      this.rivalWaitOverlay.setVisible(false);
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

  private createCreepHealthBar(widthHint = 16): Phaser.GameObjects.Container {
    const width = Math.max(14, Math.round(widthHint * 0.7));
    const height = 3;
    const bg = this.add.rectangle(0, 0, width, height, 0x222222);
    const fill = this.add.rectangle(-width / 2, 0, width, height, 0x4ade80).setOrigin(0, 0.5);
    return this.add.container(0, 0, [bg, fill]);
  }

  private updateCreepHealthBar(
    bar: Phaser.GameObjects.Container,
    creep: SimSnapshot["creeps"][number],
    spriteH: number,
    alpha: number,
  ) {
    const pct = Math.max(0, creep.hp / creep.maxHp);
    const fill = bar.list[1] as Phaser.GameObjects.Rectangle;
    fill.scaleX = pct;
    fill.setFillStyle(this.healthBarColor(pct));
    bar.setPosition(creep.x, creep.y - spriteH * 0.75);
    bar.setAlpha(alpha);
    bar.setDepth(depthAtY(creep.y, 8));
  }

  private healthBarColor(pct: number): number {
    if (pct > 0.6) return 0x4ade80;
    if (pct > 0.3) return 0xfacc15;
    return 0xef4444;
  }
}
