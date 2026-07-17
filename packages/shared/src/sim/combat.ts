import type { DamageType } from "../types.js";

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
