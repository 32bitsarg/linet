import Phaser from "phaser";

/** Matches baked sheets in `public/assets/towers/{id}.png`. */
export const TOWER_FRAME_W = 48;
export const TOWER_FRAME_H = 56;
export const TOWER_FRAME_COUNT = 6;

export const TOWER_IDS = ["arrow", "cannon", "frost", "sniper", "mage"] as const;
export type TowerSpriteId = (typeof TOWER_IDS)[number];

export function towerSheetKey(id: string): string {
  return `tower_${id}`;
}

export function towerIdleAnim(id: string): string {
  return `tower_${id}_idle`;
}

export function towerAttackAnim(id: string): string {
  return `tower_${id}_attack`;
}

/** Queue spritesheet loads (call from BootScene.preload). */
export function preloadTowerSprites(scene: Phaser.Scene): void {
  for (const id of TOWER_IDS) {
    const key = towerSheetKey(id);
    if (scene.textures.exists(key)) continue;
    scene.load.spritesheet(key, `/assets/towers/${id}.png`, {
      frameWidth: TOWER_FRAME_W,
      frameHeight: TOWER_FRAME_H,
    });
  }
}

/** Register idle (frames 0–2) and attack (frames 3–5) animations. */
export function registerTowerAnimations(scene: Phaser.Scene): void {
  for (const id of TOWER_IDS) {
    const sheet = towerSheetKey(id);
    const idle = towerIdleAnim(id);
    const attack = towerAttackAnim(id);
    if (!scene.anims.exists(idle)) {
      scene.anims.create({
        key: idle,
        frames: scene.anims.generateFrameNumbers(sheet, { start: 0, end: 2 }),
        frameRate: 5,
        repeat: -1,
        yoyo: true,
      });
    }
    if (!scene.anims.exists(attack)) {
      scene.anims.create({
        key: attack,
        frames: scene.anims.generateFrameNumbers(sheet, { start: 3, end: 5 }),
        frameRate: 14,
        repeat: 0,
      });
    }
  }
}

export function playTowerIdle(sprite: Phaser.GameObjects.Sprite, towerId: string): void {
  const key = towerIdleAnim(towerId);
  if (sprite.anims.currentAnim?.key === key) return;
  sprite.play(key);
}

export function playTowerAttack(sprite: Phaser.GameObjects.Sprite, towerId: string): void {
  const attack = towerAttackAnim(towerId);
  const idle = towerIdleAnim(towerId);
  sprite.play(attack);
  sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
    if (sprite.active) sprite.play(idle);
  });
}
