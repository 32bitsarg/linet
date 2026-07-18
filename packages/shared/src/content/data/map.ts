import type { MapDef } from "../../types.js";

/**
 * Larger cells for readable towers/creeps within 1280×720.
 * Slightly fewer cells than 16×23@28, but each cell is bigger.
 */
export const MAP: MapDef = {
  id: "line_01",
  name: "Twin Mazes",
  width: 1280,
  height: 720,
  lanes: [
    {
      id: "lane_0",
      originX: 48,
      originY: 30,
      cols: 14,
      rows: 17,
      cellSize: 36,
      spawnCol: 6,
      spawnRow: 0,
      exitCol: 6,
      exitRow: 16,
    },
    {
      id: "lane_1",
      originX: 728,
      originY: 30,
      cols: 14,
      rows: 17,
      cellSize: 36,
      spawnCol: 7,
      spawnRow: 0,
      exitCol: 7,
      exitRow: 16,
    },
  ],
};
