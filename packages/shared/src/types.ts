export type DamageType = "physical" | "magical" | "pure";

export interface Vec2 {
  x: number;
  y: number;
}

export interface TowerDef {
  id: string;
  name: string;
  role: string;
  cost: number;
  range: number;
  damage: number;
  attackInterval: number;
  damageType: DamageType;
  splashRadius: number;
  slowPercent: number;
  slowDuration: number;
}

export interface CreepDef {
  id: string;
  name: string;
  hp: number;
  speed: number;
  armor: number;
  magicResist: number;
  goldReward: number;
  leakDamage: number;
  tags: string[];
}

export interface WaveEntryDef {
  creepId: string;
  count: number;
  intervalMs: number;
  delayMs: number;
}

export interface WaveDef {
  index: number;
  rewardGold: number;
  isBoss: boolean;
  entries: WaveEntryDef[];
}

export interface SendEntryDef {
  creepId: string;
  count: number;
}

export interface SendDef {
  id: string;
  costSendPoints: number;
  minWave: number;
  cooldownMs: number;
  entries: SendEntryDef[];
}

/** Rectangular maze lane (Line Tower Wars style). */
export interface LaneDef {
  id: string;
  /** Top-left of the build grid in world pixels */
  originX: number;
  originY: number;
  cols: number;
  rows: number;
  cellSize: number;
  /** Entrance cell (usually top center) */
  spawnCol: number;
  spawnRow: number;
  /** Exit cell (usually bottom center) */
  exitCol: number;
  exitRow: number;
}

export interface MapDef {
  id: string;
  name: string;
  width: number;
  height: number;
  lanes: LaneDef[];
}

export type GamePhase = "lobby" | "playing" | "ended";

export type Intent =
  | { type: "setReady"; ready: boolean }
  | { type: "startGame" }
  | { type: "placeTower"; col: number; row: number; towerId: string }
  | { type: "upgradeTower"; towerInstanceId: string }
  | { type: "sellTower"; towerInstanceId: string }
  | { type: "sendCreeps"; sendId: string }
  | { type: "rematch" };

export interface PublicPlayer {
  sessionId: string;
  name: string;
  laneIndex: number;
  ready: boolean;
  connected: boolean;
  gold: number;
  sendPoints: number;
  lives: number;
  totalLeaks: number;
  totalGoldEarned: number;
  eliminated: boolean;
  /** Sim time until which each sendId is on cooldown */
  sendCooldownUntil: Record<string, number>;
}

export interface CreepState {
  id: string;
  creepId: string;
  laneIndex: number;
  hp: number;
  maxHp: number;
  /** 0..1 along full current path (for targeting First) */
  progress: number;
  x: number;
  y: number;
  slowUntil: number;
  slowPercent: number;
  source: "wave" | "send";
  waveIndex: number;
  path: Vec2[];
  pathIndex: number;
}

export interface TowerState {
  id: string;
  towerId: string;
  laneIndex: number;
  col: number;
  row: number;
  level: number;
  cooldown: number;
  x: number;
  y: number;
  investedGold: number;
}

export interface SimSnapshot {
  tick: number;
  time: number;
  phase: GamePhase;
  waveIndex: number;
  waveCountdown: number;
  waveActive: boolean;
  suddenDeath: boolean;
  winnerSessionId: string | null;
  players: PublicPlayer[];
  creeps: CreepState[];
  towers: TowerState[];
  incomingSendBanner: { laneIndex: number; sendId: string; until: number } | null;
  roomCode: string;
  hostSessionId: string;
  soloMode: boolean;
}

export interface SimEvent {
  type: string;
  [key: string]: unknown;
}
