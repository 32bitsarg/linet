import type { WaveDef } from "../../types.js";

export const WAVES: WaveDef[] = [
  { index: 1, rewardGold: 0, isBoss: false, entries: [{ creepId: "grub", count: 6, intervalMs: 700, delayMs: 0 }] },
  {
    index: 2,
    rewardGold: 0,
    isBoss: false,
    entries: [
      { creepId: "grub", count: 4, intervalMs: 650, delayMs: 0 },
      { creepId: "runner", count: 2, intervalMs: 800, delayMs: 500 },
    ],
  },
  {
    index: 3,
    rewardGold: 0,
    isBoss: false,
    entries: [
      { creepId: "runner", count: 4, intervalMs: 700, delayMs: 0 },
      { creepId: "brute", count: 2, intervalMs: 1200, delayMs: 800 },
    ],
  },
  {
    index: 4,
    rewardGold: 0,
    isBoss: false,
    entries: [
      { creepId: "grub", count: 8, intervalMs: 500, delayMs: 0 },
      { creepId: "brute", count: 2, intervalMs: 1200, delayMs: 1000 },
    ],
  },
  { index: 5, rewardGold: 0, isBoss: false, entries: [{ creepId: "shade", count: 6, intervalMs: 750, delayMs: 0 }] },
  {
    index: 6,
    rewardGold: 0,
    isBoss: false,
    entries: [
      { creepId: "brute", count: 4, intervalMs: 1100, delayMs: 0 },
      { creepId: "runner", count: 4, intervalMs: 650, delayMs: 600 },
    ],
  },
  { index: 7, rewardGold: 0, isBoss: true, entries: [{ creepId: "boss_1", count: 1, intervalMs: 1000, delayMs: 0 }] },
  {
    index: 8,
    rewardGold: 0,
    isBoss: false,
    entries: [
      { creepId: "shade", count: 10, intervalMs: 450, delayMs: 0 },
      { creepId: "runner", count: 4, intervalMs: 600, delayMs: 400 },
    ],
  },
  {
    index: 9,
    rewardGold: 0,
    isBoss: false,
    entries: [
      { creepId: "brute", count: 6, intervalMs: 900, delayMs: 0 },
      { creepId: "shade", count: 4, intervalMs: 700, delayMs: 500 },
    ],
  },
  {
    index: 10,
    rewardGold: 0,
    isBoss: true,
    entries: [
      { creepId: "boss_1", count: 2, intervalMs: 2500, delayMs: 0 },
      { creepId: "runner", count: 8, intervalMs: 500, delayMs: 1000 },
    ],
  },
];
