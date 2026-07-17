import type { Vec2 } from "../types.js";

export function dist2(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

export function polylineLength(points: Vec2[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    len += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return len;
}
