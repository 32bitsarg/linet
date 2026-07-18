import { Simulation } from "./Simulation.js";
import { MAP } from "../content/index.js";
import test from "node:test";
import assert from "node:assert/strict";

test("lobby start place maze and reject full block", () => {
  const sim = new Simulation("TEST1");
  assert.equal(sim.addPlayer("a", "A"), true);
  assert.equal(sim.addPlayer("b", "B"), true);
  sim.enqueueIntent("a", { type: "setReady", ready: true });
  sim.enqueueIntent("b", { type: "setReady", ready: true });
  sim.enqueueIntent("a", { type: "startGame" });
  assert.equal(sim.phase, "playing");

  sim.enqueueIntent("a", { type: "placeTower", col: 3, row: 5, towerId: "arrow" });
  assert.equal(sim.towers.length, 1);
  assert.ok(sim.players.get("a")!.gold < 200);

  const lane0 = MAP.lanes[0]!;
  const sealRow = lane0.rows - 2;
  for (let c = 0; c < lane0.cols; c++) {
    sim.players.get("a")!.gold = 9999;
    sim.enqueueIntent("a", { type: "placeTower", col: c, row: sealRow, towerId: "arrow" });
  }
  const wallCount = sim.towers.filter((t) => t.laneIndex === 0 && t.row === sealRow).length;
  assert.ok(wallCount < lane0.cols);
});

test("reject place on foreign lane cell still uses ownership", () => {
  const sim = new Simulation("TEST2");
  sim.addPlayer("a", "A");
  sim.addPlayer("b", "B");
  sim.enqueueIntent("a", { type: "setReady", ready: true });
  sim.enqueueIntent("b", { type: "setReady", ready: true });
  sim.enqueueIntent("a", { type: "startGame" });
  sim.enqueueIntent("a", { type: "placeTower", col: 1, row: 1, towerId: "arrow" });
  assert.equal(sim.towers[0]?.laneIndex, 0);
});

test("solo bot builds at least one tower over time", () => {
  const sim = new Simulation("SOLO1");
  sim.addPlayer("a", "A");
  sim.enableSoloWithBot();
  sim.enqueueIntent("a", { type: "setReady", ready: true });
  sim.enqueueIntent("a", { type: "startGame" });
  assert.equal(sim.phase, "playing");

  const bot = sim.players.get("__bot__");
  assert.ok(bot);
  bot!.gold = 9999;

  for (let i = 0; i < 80; i++) sim.step();
  const botTowers = sim.towers.filter((t) => t.laneIndex === bot!.laneIndex);
  assert.ok(botTowers.length >= 1);
});
