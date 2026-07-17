import type { LaneDef, Vec2 } from "../types.js";

export function cellKey(col: number, row: number): string {
  return `${col},${row}`;
}

export function cellCenter(lane: LaneDef, col: number, row: number): Vec2 {
  return {
    x: lane.originX + (col + 0.5) * lane.cellSize,
    y: lane.originY + (row + 0.5) * lane.cellSize,
  };
}

export function worldToCell(lane: LaneDef, x: number, y: number): { col: number; row: number } | null {
  const col = Math.floor((x - lane.originX) / lane.cellSize);
  const row = Math.floor((y - lane.originY) / lane.cellSize);
  if (col < 0 || row < 0 || col >= lane.cols || row >= lane.rows) return null;
  return { col, row };
}

export function inBounds(lane: LaneDef, col: number, row: number): boolean {
  return col >= 0 && row >= 0 && col < lane.cols && row < lane.rows;
}

export function isReservedCell(lane: LaneDef, col: number, row: number): boolean {
  return (
    (col === lane.spawnCol && row === lane.spawnRow) ||
    (col === lane.exitCol && row === lane.exitRow)
  );
}

/** 4-neighbor A*. Returns cell centers in world space, or null if no path. */
export function findPath(
  lane: LaneDef,
  blocked: Set<string>,
  startCol: number,
  startRow: number,
  endCol: number,
  endRow: number,
): Vec2[] | null {
  if (!inBounds(lane, startCol, startRow) || !inBounds(lane, endCol, endRow)) return null;
  if (blocked.has(cellKey(startCol, startRow)) || blocked.has(cellKey(endCol, endRow))) return null;

  const start = cellKey(startCol, startRow);
  const goal = cellKey(endCol, endRow);
  if (start === goal) return [cellCenter(lane, startCol, startRow)];

  const open: { col: number; row: number; f: number; g: number }[] = [
    { col: startCol, row: startRow, f: 0, g: 0 },
  ];
  const came = new Map<string, string>();
  const gScore = new Map<string, number>([[start, 0]]);
  const closed = new Set<string>();

  const heuristic = (c: number, r: number) => Math.abs(c - endCol) + Math.abs(r - endRow);

  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift()!;
    const ck = cellKey(current.col, current.row);
    if (ck === goal) {
      const cells: { col: number; row: number }[] = [{ col: endCol, row: endRow }];
      let cur = goal;
      while (came.has(cur)) {
        cur = came.get(cur)!;
        const [c, r] = cur.split(",").map(Number) as [number, number];
        cells.push({ col: c, row: r });
      }
      cells.reverse();
      return cells.map((cell) => cellCenter(lane, cell.col, cell.row));
    }
    if (closed.has(ck)) continue;
    closed.add(ck);

    const neighbors = [
      [current.col + 1, current.row],
      [current.col - 1, current.row],
      [current.col, current.row + 1],
      [current.col, current.row - 1],
    ] as const;

    for (const [nc, nr] of neighbors) {
      if (!inBounds(lane, nc, nr)) continue;
      const nk = cellKey(nc, nr);
      if (blocked.has(nk) || closed.has(nk)) continue;
      const tentative = (gScore.get(ck) ?? Infinity) + 1;
      if (tentative >= (gScore.get(nk) ?? Infinity)) continue;
      came.set(nk, ck);
      gScore.set(nk, tentative);
      open.push({ col: nc, row: nr, g: tentative, f: tentative + heuristic(nc, nr) });
    }
  }
  return null;
}

export function pathHasRoute(lane: LaneDef, blocked: Set<string>): boolean {
  return (
    findPath(lane, blocked, lane.spawnCol, lane.spawnRow, lane.exitCol, lane.exitRow) !== null
  );
}
