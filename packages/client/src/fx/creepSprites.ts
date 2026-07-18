import Phaser from "phaser";
import { MAP } from "@linet/shared";

/** Matches baked sheets in `public/assets/creeps/{id}.png`. */
export const CREEP_FRAME_W = 40;
export const CREEP_FRAME_H = 40;
export const CREEP_FRAME_COUNT = 6;

export const CREEP_IDS = ["grub", "runner", "brute", "shade", "boss_1"] as const;
export type CreepSpriteId = (typeof CREEP_IDS)[number];

export function creepSheetKey(id: string): string {
  return `creep_${id}`;
}

export function creepWalkAnim(id: string): string {
  return `creep_${id}_walk`;
}

/** Display size scales with map cellSize so creeps fill the larger cells. */
export function creepDisplaySize(creepId: string): { w: number; h: number } {
  const cell = MAP.lanes[0]?.cellSize ?? 36;
  const mul =
    creepId === "boss_1"
      ? 1.05
      : creepId === "brute"
        ? 0.92
        : creepId === "shade"
          ? 0.78
          : creepId === "runner"
            ? 0.68
            : 0.62;
  const s = Math.round(cell * mul);
  return { w: s, h: s };
}

export function preloadCreepSprites(scene: Phaser.Scene): void {
  for (const id of CREEP_IDS) {
    const key = creepSheetKey(id);
    if (scene.textures.exists(key)) continue;
    scene.load.spritesheet(key, `/assets/creeps/${id}.png`, {
      frameWidth: CREEP_FRAME_W,
      frameHeight: CREEP_FRAME_H,
    });
  }
}

export function registerCreepAnimations(scene: Phaser.Scene): void {
  for (const id of CREEP_IDS) {
    const sheet = creepSheetKey(id);
    const walk = creepWalkAnim(id);
    if (!scene.anims.exists(walk)) {
      scene.anims.create({
        key: walk,
        frames: scene.anims.generateFrameNumbers(sheet, { start: 0, end: 5 }),
        frameRate: id === "runner" ? 11 : id === "boss_1" || id === "brute" ? 5 : 7,
        repeat: -1,
      });
    }
  }
}

export function playCreepWalk(sprite: Phaser.GameObjects.Sprite, creepId: string): void {
  const key = creepWalkAnim(creepId);
  if (sprite.anims.currentAnim?.key === key && sprite.anims.isPlaying) return;
  sprite.play(key);
}
