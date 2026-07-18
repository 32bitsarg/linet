import type { CreepDef } from "../../types.js";

/** Speeds in world px/s. Only runner is clearly "fast". */
export const CREEPS: CreepDef[] = [
  { id: "grub", name: "Grub", hp: 30, speed: 55, armor: 0, magicResist: 0, goldReward: 4, leakDamage: 1, tags: ["swarm"] },
  { id: "runner", name: "Runner", hp: 45, speed: 100, armor: 0, magicResist: 0, goldReward: 5, leakDamage: 1, tags: ["fast"] },
  { id: "brute", name: "Brute", hp: 180, speed: 38, armor: 20, magicResist: 0, goldReward: 12, leakDamage: 3, tags: ["tank", "armored"] },
  { id: "shade", name: "Shade", hp: 90, speed: 50, armor: 0, magicResist: 30, goldReward: 8, leakDamage: 2, tags: ["magic-resist"] },
  { id: "boss_1", name: "Boss", hp: 800, speed: 28, armor: 40, magicResist: 20, goldReward: 80, leakDamage: 10, tags: ["boss"] },
];
