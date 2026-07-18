# Arquitectura

> **Estado:** aprobado  
> Agentes → [`AGENTS.md`](../../AGENTS.md) · Stack → [stack.md](./stack.md) · Multi → [../multiplayer/overview.md](../multiplayer/overview.md)

## Principio

Separar **simulación** (lógica pura en `@linet/shared`) de **presentación** (Phaser) y de **transporte** (Colyseus).  
La misma simulación corre en el **servidor** (autoridad) y se testea sin UI ni red.

## Flujo

```
Cliente (Phaser scene)
  → Intent (net.ts)
  → GameRoom (Colyseus)
  → Simulation.enqueueIntent / step (20 Hz)
  → snapshot + events broadcast
  → Cliente solo renderiza
```

## Packages

| Package | Rol |
|---------|-----|
| `@linet/shared` | Tipos, content, pathfinding, `Simulation` |
| `@linet/server` | Room Colyseus, tick loop, broadcast |
| `@linet/client` | Phaser scenes, HUD, input → intents |

## Mapa de archivos (fuente de verdad)

| Path | Responsabilidad |
|------|-----------------|
| `packages/shared/src/sim/Simulation.ts` | Tick, place/sell/upgrade/send, waves, combat, win/lose |
| `packages/shared/src/sim/pathfinding.ts` | A*, celdas bloqueadas, `pathHasRoute` |
| `packages/shared/src/sim/combat.ts` | Daño, armor, costos de upgrade |
| `packages/shared/src/sim/path.ts` | Helpers geométricos (`dist2`, `polylineLength`) |
| `packages/shared/src/types.ts` | Intents, snapshot, defs |
| `packages/shared/src/constants.ts` | Tick, starting gold/SP/lives |
| `packages/shared/src/content/` | Datos de torres, creeps, olas, sends, mapa |
| `packages/server/src/GameRoom.ts` | Room, intents, tick 20 Hz, broadcast |
| `packages/client/src/scenes/` | Una escena Phaser por archivo |
| `packages/client/src/camera/RtsCamera.ts` | Cámara RTS (pan/zoom/foco lane); solo presentación |
| `packages/client/src/fx/groundTextures.ts` | Texturas procedurales de terreno |
| `packages/client/src/fx/towerSprites.ts` | Load/anims torres (`public/assets/towers/`) |
| `packages/client/src/fx/creepSprites.ts` | Load/anims creeps + `creepDisplaySize` ∝ cell |
| `packages/client/public/assets/{towers,creeps}/` | Spritesheets PNG (bake scripts en `scripts/`) |
| `packages/client/src/net.ts` | Cliente Colyseus + `requestSync` |
| `content/*.json` | Espejo humano de defs (mantener sync) |

No hay clases `PathSystem` / `BuildSystem` separadas: esas responsabilidades viven dentro de `Simulation` + `pathfinding` hasta un split explícito futuro.

## Intents (API)

```
setReady { ready }
startGame {}
placeTower { col, row, towerId }
upgradeTower { towerInstanceId }
sellTower { towerInstanceId }
sendCreeps { sendId }
rematch {}
sync {}                 // cliente pide snapshot fresco (GameRoom responde state)
```

Place inválido (sella spawn→exit) emite evento `placeRejected` y no cobra oro.

## Decisiones cerradas

- **Tick:** 20 Hz (ADR 0004).
- **State sync:** snapshot completo 1v1 + eventos de feedback (`attack`, `placeRejected`, etc.).
- **Currency:** gold + send points (ADR 0003).
- **Modelo:** OOP / estado en `Simulation`; ECS out of scope para MVP.
