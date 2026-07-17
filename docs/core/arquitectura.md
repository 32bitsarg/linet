# Arquitectura

> **Estado:** borrador  
> Depende de: [stack.md](./stack.md)

## Principio

Separar **simulación** (lógica pura del juego) de **presentación** (render, input, audio).  
Así se puede testear combat/economía/path sin UI.

## Capas propuestas

```
┌─────────────────────────────────────┐
│  UI / Input / Audio                 │  presentación
├─────────────────────────────────────┤
│  Game Session (orquestación)        │  estados, start/pause/end
├─────────────────────────────────────┤
│  Systems                            │  path, towers, creeps, combat, economy, waves
├─────────────────────────────────────┤
│  Content data                       │  defs JSON/TS: TowerDef, CreepDef, WaveDef
└─────────────────────────────────────┘
```

## Módulos de sistemas (nombres tentativos)

| Módulo | Responsabilidad |
|--------|-----------------|
| `PathSystem` | Waypoints, progreso de creeps en el path |
| `BuildSystem` | Slots válidos, place / sell / upgrade |
| `TowerSystem` | Targeting, cooldowns, proyectiles / efectos |
| `CreepSystem` | Spawn, HP, status effects, death |
| `CombatSystem` | Resolución de daño, armor, resists |
| `EconomySystem` | Oro, costos, recompensas, interés (si aplica) |
| `WaveSystem` | Timeline de olas, composición, bosses |
| `LifeSystem` | Vidas / leaks / game over |
| `Session` | Estados: menu → playing → paused → won/lost |

## Flujo de datos (partida)

1. Cargar `MapDef` + `TowerDefs` + `WaveDefs`.
2. `Session` entra en `playing`.
3. Cada tick: waves → creeps move → towers attack → combat resolve → economy → check win/lose.
4. UI solo lee estado y envía intents (`PlaceTower`, `Upgrade`, `Sell`, `Pause`).

## Intents del jugador (API mental)

```
PlaceTower { slotId, towerId }
UpgradeTower { towerInstanceId, branch? }
SellTower { towerInstanceId }
StartNextWave { }          # si el modo es manual
Pause { }
```

## Lo que todavía no definimos

- ¿ECS, OOP por entidades, o híbrido?
- ¿Autoridad del tick (fijo 20/30/60 Hz)?
- ¿Save/load mid-run en MVP?
