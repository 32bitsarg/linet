import Phaser from "phaser";

export const TEX_GRASS = "tex_grass";
export const TEX_DIRT = "tex_dirt";
/** Larger open-field mix for the world background. */
export const TEX_MEADOW = "tex_meadow";
/** Darker scrub for far padding / edges. */
export const TEX_SCRUB = "tex_scrub";

/** Deterministic 0..1 hash for cell mixing. */
export function cellNoise(col: number, row: number, seed = 0): number {
  const n = Math.sin(col * 127.1 + row * 311.7 + seed * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Procedural seamless-ish ground tiles (no external art assets).
 * Call once from BootScene before entering gameplay.
 */
export function generateGroundTextures(scene: Phaser.Scene, size = 64): void {
  if (!scene.textures.exists(TEX_GRASS)) {
    bakeGrass(scene, TEX_GRASS, size);
  }
  if (!scene.textures.exists(TEX_DIRT)) {
    bakeDirt(scene, TEX_DIRT, size);
  }
  if (!scene.textures.exists(TEX_MEADOW)) {
    bakeMeadow(scene, TEX_MEADOW, 128);
  }
  if (!scene.textures.exists(TEX_SCRUB)) {
    bakeScrub(scene, TEX_SCRUB, 128);
  }
}

function bakeGrass(scene: Phaser.Scene, key: string, size: number) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  g.fillStyle(0x2f5a34, 1);
  g.fillRect(0, 0, size, size);

  for (let i = 0; i < 18; i++) {
    const x = (i * 17 + 5) % size;
    const y = (i * 29 + 11) % size;
    const r = 6 + (i % 5);
    g.fillStyle(i % 2 === 0 ? 0x3d7a45 : 0x26502c, 0.55);
    g.fillCircle(x, y, r);
    g.fillCircle(x - size, y, r);
    g.fillCircle(x + size, y, r);
    g.fillCircle(x, y - size, r);
    g.fillCircle(x, y + size, r);
  }

  for (let i = 0; i < 140; i++) {
    const x = (i * 13 + 3) % size;
    const y = (i * 37 + 7) % size;
    const bright = i % 3 === 0;
    g.fillStyle(bright ? 0x6fbf78 : 0x1a3a20, bright ? 0.45 : 0.35);
    g.fillRect(x, y, 1, 2 + (i % 3));
  }

  for (let i = 0; i < 80; i++) {
    const x = (i * 19) % size;
    const y = (i * 23 + 9) % size;
    g.fillStyle(0x0a180e, 0.2);
    g.fillRect(x, y, 1, 1);
  }

  g.generateTexture(key, size, size);
  g.destroy();
}

function bakeDirt(scene: Phaser.Scene, key: string, size: number) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  g.fillStyle(0x5a4030, 1);
  g.fillRect(0, 0, size, size);

  for (let i = 0; i < 16; i++) {
    const x = (i * 21 + 8) % size;
    const y = (i * 27 + 4) % size;
    const r = 7 + (i % 6);
    g.fillStyle(i % 2 === 0 ? 0x6e4e3a : 0x4a3224, 0.6);
    g.fillCircle(x, y, r);
    g.fillCircle(x - size, y, r);
    g.fillCircle(x + size, y, r);
    g.fillCircle(x, y - size, r);
    g.fillCircle(x, y + size, r);
  }

  for (let i = 0; i < 50; i++) {
    const x = (i * 11 + 2) % size;
    const y = (i * 41 + 6) % size;
    g.fillStyle(i % 4 === 0 ? 0x8a7a6a : 0x3a281c, 0.5);
    g.fillCircle(x, y, 1 + (i % 2));
  }

  g.lineStyle(1, 0x2a1c14, 0.35);
  for (let i = 0; i < 8; i++) {
    const x0 = (i * 15) % size;
    const y0 = (i * 31) % size;
    g.lineBetween(x0, y0, (x0 + 10) % size, (y0 + 6) % size);
  }

  g.generateTexture(key, size, size);
  g.destroy();
}

/** Open terrain: grass base with dirt veins — reads as continuous field. */
function bakeMeadow(scene: Phaser.Scene, key: string, size: number) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  g.fillStyle(0x2a4e30, 1);
  g.fillRect(0, 0, size, size);

  for (let i = 0; i < 28; i++) {
    const x = (i * 19 + 7) % size;
    const y = (i * 33 + 13) % size;
    const r = 10 + (i % 8);
    g.fillStyle(i % 3 === 0 ? 0x3a6a40 : 0x244828, 0.5);
    g.fillCircle(x, y, r);
    g.fillCircle(x - size, y, r);
    g.fillCircle(x + size, y, r);
    g.fillCircle(x, y - size, r);
    g.fillCircle(x, y + size, r);
  }

  // Dirt veins / bare patches
  for (let i = 0; i < 12; i++) {
    const x = (i * 41 + 17) % size;
    const y = (i * 27 + 9) % size;
    const r = 8 + (i % 7);
    g.fillStyle(0x5c4434, 0.55);
    g.fillCircle(x, y, r);
    g.fillCircle(x - size, y, r);
    g.fillCircle(x + size, y, r);
  }

  for (let i = 0; i < 220; i++) {
    const x = (i * 13 + 2) % size;
    const y = (i * 37 + 5) % size;
    g.fillStyle(i % 5 === 0 ? 0x6fbf78 : 0x1c3820, 0.3);
    g.fillRect(x, y, 1, 1 + (i % 2));
  }

  for (let i = 0; i < 40; i++) {
    const x = (i * 29 + 4) % size;
    const y = (i * 17 + 11) % size;
    g.fillStyle(0x7a6a58, 0.4);
    g.fillCircle(x, y, 1);
  }

  g.generateTexture(key, size, size);
  g.destroy();
}

/** Wilder / darker ground for far padding around the map. */
function bakeScrub(scene: Phaser.Scene, key: string, size: number) {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  g.fillStyle(0x1a2a1c, 1);
  g.fillRect(0, 0, size, size);

  for (let i = 0; i < 22; i++) {
    const x = (i * 23 + 3) % size;
    const y = (i * 31 + 8) % size;
    const r = 12 + (i % 9);
    g.fillStyle(i % 2 === 0 ? 0x243828 : 0x3a3024, 0.55);
    g.fillCircle(x, y, r);
    g.fillCircle(x - size, y, r);
    g.fillCircle(x + size, y, r);
    g.fillCircle(x, y - size, r);
    g.fillCircle(x, y + size, r);
  }

  for (let i = 0; i < 100; i++) {
    const x = (i * 17) % size;
    const y = (i * 43 + 6) % size;
    g.fillStyle(0x0c140e, 0.35);
    g.fillRect(x, y, 2, 2);
  }

  // Sparse dry grass
  for (let i = 0; i < 60; i++) {
    const x = (i * 21 + 9) % size;
    const y = (i * 19 + 2) % size;
    g.fillStyle(0x4a5a38, 0.4);
    g.fillRect(x, y, 1, 3);
  }

  g.generateTexture(key, size, size);
  g.destroy();
}
