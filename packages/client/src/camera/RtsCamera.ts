import Phaser from "phaser";
import { MAP, type LaneDef } from "@linet/shared";

/** Extra world around the map so either lane can be centered at any zoom. */
export const CAMERA_BOUNDS_PAD_X = 420;
export const CAMERA_BOUNDS_PAD_Y = 120;

export type RtsCameraOptions = {
  panSpeed?: number;
  edgeMargin?: number;
  /** Multiplier over cover-minZoom for max zoom */
  maxZoomMul?: number;
  hudBottom?: number;
  hudTop?: number;
};

/**
 * RTS world camera for Scale.RESIZE:
 * - minZoom "covers" the map so the viewport never shows empty letterbox strips
 * - padded bounds so you can always pan to center either lane
 */
export class RtsCameraController {
  private readonly cam: Phaser.Cameras.Scene2D.Camera;
  private readonly keys: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
  };
  private readonly opts: Required<RtsCameraOptions>;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  allowSPan = true;

  constructor(
    private readonly scene: Phaser.Scene,
    opts: RtsCameraOptions = {},
  ) {
    this.cam = scene.cameras.main;
    this.opts = {
      panSpeed: opts.panSpeed ?? 560,
      edgeMargin: opts.edgeMargin ?? 28,
      maxZoomMul: opts.maxZoomMul ?? 2.4,
      hudBottom: opts.hudBottom ?? 46,
      hudTop: opts.hudTop ?? 36,
    };

    this.cam.setBounds(
      -CAMERA_BOUNDS_PAD_X,
      -CAMERA_BOUNDS_PAD_Y,
      MAP.width + CAMERA_BOUNDS_PAD_X * 2,
      MAP.height + CAMERA_BOUNDS_PAD_Y * 2,
    );
    this.cam.setRoundPixels(true);
    this.refreshViewport(true);

    const kb = scene.input.keyboard!;
    this.keys = {
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      w: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    scene.input.on(
      "wheel",
      (
        _pointer: Phaser.Input.Pointer,
        _over: unknown,
        _dx: number,
        dy: number,
      ) => {
        const next = Phaser.Math.Clamp(
          this.cam.zoom - dy * 0.0012,
          this.minZoom,
          this.maxZoom,
        );
        const beforeX = this.cam.midPoint.x;
        const beforeY = this.cam.midPoint.y;
        this.cam.setZoom(next);
        this.cam.centerOn(beforeX, beforeY);
        this.clamp();
      },
    );

    scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.middleButtonDown()) {
        this.dragging = true;
        this.lastX = pointer.x;
        this.lastY = pointer.y;
      }
    });
    scene.input.on("pointerup", () => {
      this.dragging = false;
    });
    scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!pointer.middleButtonDown()) {
        this.dragging = false;
        return;
      }
      if (!this.dragging) {
        this.dragging = true;
        this.lastX = pointer.x;
        this.lastY = pointer.y;
        return;
      }
      const dx = (pointer.x - this.lastX) / this.cam.zoom;
      const dy = (pointer.y - this.lastY) / this.cam.zoom;
      this.cam.scrollX -= dx;
      this.cam.scrollY -= dy;
      this.lastX = pointer.x;
      this.lastY = pointer.y;
      this.clamp();
    });
  }

  /** Cover zoom: map fills the screen (no empty strips). */
  get minZoom(): number {
    const { width, height } = this.scene.scale;
    if (width <= 0 || height <= 0) return 1;
    return Math.max(width / MAP.width, height / MAP.height);
  }

  get maxZoom(): number {
    return this.minZoom * this.opts.maxZoomMul;
  }

  /** Call on Scale.RESIZE so camera size/zoom track the window. */
  refreshViewport(resetZoom = false) {
    const { width, height } = this.scene.scale;
    this.cam.setViewport(0, 0, width, height);
    this.cam.setSize(width, height);
    if (resetZoom) {
      this.cam.setZoom(this.minZoom);
      this.cam.centerOn(MAP.width / 2, MAP.height / 2);
    } else {
      this.cam.setZoom(Phaser.Math.Clamp(this.cam.zoom, this.minZoom, this.maxZoom));
    }
    this.clamp();
  }

  update(deltaMs: number) {
    const dt = deltaMs / 1000;
    const speed = (this.opts.panSpeed / this.cam.zoom) * dt;
    let vx = 0;
    let vy = 0;

    if (this.keys.left.isDown || this.keys.a.isDown) vx -= 1;
    if (this.keys.right.isDown || this.keys.d.isDown) vx += 1;
    if (this.keys.up.isDown || this.keys.w.isDown) vy -= 1;
    if (this.keys.down.isDown || (this.allowSPan && this.keys.s.isDown)) vy += 1;

    const pointer = this.scene.input.activePointer;
    const { width, height } = this.scene.scale;
    const m = this.opts.edgeMargin;
    const inHud =
      pointer.y > height - this.opts.hudBottom || pointer.y < this.opts.hudTop;
    if (!this.dragging && !inHud) {
      if (pointer.x <= m) vx -= 1;
      if (pointer.x >= width - m) vx += 1;
      if (pointer.y <= this.opts.hudTop + m) vy -= 1;
      if (pointer.y >= height - this.opts.hudBottom - m) vy += 1;
    }

    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy) || 1;
      this.cam.scrollX += (vx / len) * speed;
      this.cam.scrollY += (vy / len) * speed;
      this.clamp();
    }
  }

  laneCenter(lane: LaneDef): { x: number; y: number } {
    return {
      x: lane.originX + (lane.cols * lane.cellSize) / 2,
      y: lane.originY + (lane.rows * lane.cellSize) / 2,
    };
  }

  laneFillZoom(lane: LaneDef): number {
    const { width, height } = this.scene.scale;
    const laneW = lane.cols * lane.cellSize;
    const laneH = lane.rows * lane.cellSize;
    const viewW = width * 0.9;
    const viewH = (height - this.opts.hudBottom - this.opts.hudTop) * 0.92;
    const z = Math.min(viewW / laneW, viewH / laneH);
    return Phaser.Math.Clamp(z, this.minZoom, this.maxZoom);
  }

  focusLane(lane: LaneDef, zoom?: number, duration = 280) {
    const { x, y } = this.laneCenter(lane);
    const z = zoom ?? Math.max(this.laneFillZoom(lane), this.minZoom * 1.25);
    this.cam.pan(x, y, duration, "Sine.easeInOut", true);
    this.cam.zoomTo(
      Phaser.Math.Clamp(z, this.minZoom, this.maxZoom),
      duration,
      "Sine.easeInOut",
      true,
      (_cam, progress) => {
        if (progress === 1) this.clamp();
      },
    );
  }

  centerOnLane(lane: LaneDef, duration = 220) {
    const { x, y } = this.laneCenter(lane);
    this.cam.pan(x, y, duration, "Sine.easeInOut", true, (_cam, progress) => {
      if (progress === 1) this.clamp();
    });
  }

  focusOverview(duration = 280) {
    this.cam.pan(MAP.width / 2, MAP.height / 2, duration, "Sine.easeInOut", true);
    this.cam.zoomTo(this.minZoom, duration, "Sine.easeInOut", true, (_cam, progress) => {
      if (progress === 1) this.clamp();
    });
  }

  clamp() {
    if (!this.cam.useBounds) return;
    this.cam.scrollX = this.cam.clampX(this.cam.scrollX);
    this.cam.scrollY = this.cam.clampY(this.cam.scrollY);
  }
}
