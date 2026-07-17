import { computeDamage, scaledCreepHp, upgradeCost } from "./combat.js";
import { MAP } from "../content/index.js";
import { cellKey, findPath, pathHasRoute } from "./pathfinding.js";
import test from "node:test";
import assert from "node:assert/strict";

test("damage formula armor", () => {
  assert.equal(computeDamage(20, "physical", 20, 0), 16);
  assert.equal(computeDamage(20, "pure", 100, 100), 20);
});

test("upgrade costs", () => {
  assert.equal(upgradeCost(60, 2), 30);
  assert.equal(upgradeCost(60, 3), 60);
});

test("hp scales with wave", () => {
  assert.equal(scaledCreepHp(30, 1), 34);
});

test("empty maze has spawn-exit path", () => {
  const lane = MAP.lanes[0]!;
  assert.equal(pathHasRoute(lane, new Set()), true);
  const path = findPath(
    lane,
    new Set(),
    lane.spawnCol,
    lane.spawnRow,
    lane.exitCol,
    lane.exitRow,
  );
  assert.ok(path && path.length >= 2);
});

test("full block of exit neighbors can seal path", () => {
  const lane = MAP.lanes[0]!;
  const blocked = new Set<string>();
  // Block every cell in row above exit except we block the whole maze mid-band
  for (let c = 0; c < lane.cols; c++) {
    blocked.add(cellKey(c, lane.rows - 2));
  }
  assert.equal(pathHasRoute(lane, blocked), false);
});
