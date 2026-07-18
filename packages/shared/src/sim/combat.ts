import type { DamageType, TowerDef } from "../types.js";

export function computeDamage(
  raw: number,
  damageType: DamageType,
  armor: number,
  magicResist: number,
): number {
  if (damageType === "pure") return Math.max(1, Math.floor(raw));
  const defense = damageType === "physical" ? armor : magicResist;
  const mitigated = raw * (1 - defense / (defense + 100));
  return Math.max(1, Math.floor(mitigated));
}

export function scaledCreepHp(baseHp: number, waveIndex: number): number {
  return Math.floor(baseHp * Math.pow(1.15, waveIndex));
}

export function scaledCreepGold(baseGold: number, waveIndex: number): number {
  return Math.floor(baseGold * Math.pow(1.08, waveIndex));
}

export interface TowerCombatStats {
  damage: number;
  range: number;
  attackInterval: number;
  splashRadius: number;
  slowPercent: number;
  slowDuration: number;
}

/** Combat stats at tower level, aligned with docs/content/tower-roster.md */
export function towerCombatAtLevel(def: TowerDef, level: number): TowerCombatStats {
  const lvl = Math.max(1, Math.min(3, level));
  const dmgMult = lvl === 1 ? 1 : lvl === 2 ? 1.5 : 2;
  const damage = Math.round(def.damage * dmgMult);

  let range = def.range;
  let splashRadius = def.splashRadius;
  let slowPercent = def.slowPercent;
  let slowDuration = def.slowDuration;

  if (def.id === "sniper") {
    range = lvl === 1 ? 200 : lvl === 2 ? 220 : 250;
  }
  if (def.id === "cannon") {
    splashRadius = lvl === 3 ? 50 : 40;
  }
  if (def.id === "frost") {
    if (lvl === 1) {
      slowPercent = 0.3;
      slowDuration = 2;
    } else if (lvl === 2) {
      slowPercent = 0.4;
      slowDuration = 2;
    } else {
      slowPercent = 0.5;
      slowDuration = 2.5;
    }
  }

  return {
    damage,
    range,
    attackInterval: def.attackInterval,
    splashRadius,
    slowPercent,
    slowDuration,
  };
}

/** @deprecated Prefer towerCombatAtLevel(def, level) */
export function towerStatsAtLevel(
  baseDamage: number,
  baseRange: number,
  baseInterval: number,
  level: number,
): { damage: number; range: number; attackInterval: number } {
  const mult = level === 1 ? 1 : level === 2 ? 1.5 : 2;
  return {
    damage: baseDamage * mult,
    range: baseRange,
    attackInterval: baseInterval,
  };
}

export function upgradeCost(baseCost: number, toLevel: number): number {
  if (toLevel === 2) return Math.floor(baseCost * 0.5);
  if (toLevel === 3) return Math.floor(baseCost * 1.0);
  return 0;
}
