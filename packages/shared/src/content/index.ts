import { CREEPS } from "./data/creeps.js";
import { MAP } from "./data/map.js";
import { SENDS } from "./data/sends.js";
import { TOWERS } from "./data/towers.js";
import { WAVES } from "./data/waves.js";
import type { CreepDef, SendDef, TowerDef, WaveDef } from "../types.js";

export { TOWERS, CREEPS, WAVES, SENDS, MAP };

export function getTowerDef(id: string): TowerDef | undefined {
  return TOWERS.find((t) => t.id === id);
}

export function getCreepDef(id: string): CreepDef | undefined {
  return CREEPS.find((c) => c.id === id);
}

export function getSendDef(id: string): SendDef | undefined {
  return SENDS.find((s) => s.id === id);
}

export function getWaveDef(index: number): WaveDef | undefined {
  return WAVES.find((w) => w.index === index);
}
