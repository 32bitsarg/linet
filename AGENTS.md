# AGENTS — Linet

Entry point for AI agents working on this repo. Read this before changing code.

## What this is

**Linet** = Line Tower Wars (Warcraft-style), not fixed-path Line TD.

- 1v1 online (Colyseus). Solo mode = human + bot that builds a simple maze (no sends).
- Each player owns a **vertical maze grid**. Towers **block cells**; creeps **A\*** spawn → exit.
- Place that seals the route is **rejected** (`placeRejected`).
- Dual currency: gold (towers) + send points (sends to rival).
- Authoritative sim at **20 Hz** in `@linet/shared`.

## Monorepo map

| Path | Touch when… |
|------|-------------|
| `packages/shared/src/sim/Simulation.ts` | Game rules: tick, place/sell/send, waves, combat, win/lose |
| `packages/shared/src/sim/pathfinding.ts` | A*, blocked cells, route checks |
| `packages/shared/src/sim/combat.ts` | Damage / armor / upgrade cost math |
| `packages/shared/src/types.ts` | Intents, snapshot, defs shapes |
| `packages/shared/src/constants.ts` | Tick rate, starting gold/SP/lives |
| `packages/shared/src/content/` | Tower/creep/wave/send/map data |
| `packages/server/src/GameRoom.ts` | Colyseus room, tick loop, broadcast |
| `packages/client/src/scenes/` | Phaser UI (one scene per file) |
| `packages/client/src/net.ts` | Colyseus client, intents/state |
| `content/*.json` | Human-readable mirror of shared content (keep in sync) |
| `docs/` | Design docs (Spanish). Prefer updating with code changes |

## Data flow

```
Client (Phaser scene)
  → Intent via net.ts
  → GameRoom (server)
  → Simulation.enqueueIntent / Simulation.step
  → broadcast snapshot + events
  → Client renders only (no combat authority)
```

## Hard rules

1. **Server/sim is source of truth** — client never invents gold, kills, or valid places.
2. **Shared sim is testable without UI/network** — put logic in `packages/shared`, not Phaser.
3. **Cannot seal maze** — place must leave spawn→exit path.
4. **Code in English**; design docs in Spanish.
5. Do not invent “PathSystem / BuildSystem” modules — responsibilities live in the files above until explicitly split.

## Commands

```bash
pnpm install
pnpm dev                 # server + client
pnpm test                # shared tests
pnpm typecheck
```

- Client: http://localhost:5173  
- Server WS: ws://localhost:2567  

## Design docs (when needed)

- Product: `docs/vision/producto.md`
- Architecture detail: `docs/core/arquitectura.md`
- Maze rules: `docs/gameplay/path.md`
- Multi/sends: `docs/multiplayer/`
