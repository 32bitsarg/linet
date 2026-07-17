# Arquitectura

> **Estado:** borrador  
> Depende de: [stack.md](./stack.md) · Multi → [../multiplayer/overview.md](../multiplayer/overview.md)

## Principio

Separar **simulación** (lógica pura) de **presentación** (Phaser) y de **transporte** (Colyseus).  
La misma simulación corre en el **servidor** (autoridad) y se testea sin UI ni red.

## Capas propuestas

```
┌──────────────────────────────────────────────┐
│  Phaser: UI / Input / Audio / VFX            │  cliente
├──────────────────────────────────────────────┤
│  Colyseus Client: intents + state patches    │  red
├──────────────────────────────────────────────┤
│  Colyseus Room (Node)                        │  servidor
│    └─ Simulation (shared)                    │  autoridad
├──────────────────────────────────────────────┤
│  Systems (shared)                            │  path, towers, combat…
├──────────────────────────────────────────────┤
│  Content data (shared)                       │  TowerDef, CreepDef, WaveDef
└──────────────────────────────────────────────┘
```

## Packages (tentativo)

| Package | Contiene |
|---------|----------|
| `shared` | tipos, content schemas, simulación, intents |
| `server` | Colyseus rooms, validación, tick loop |
| `client` | Phaser scenes, HUD, predicción visual leve |

## Módulos de sistemas (nombres tentativos)

| Módulo | Responsabilidad |
|--------|-----------------|
| `PathSystem` | Waypoints, progreso de creeps en el path |
| `BuildSystem` | Slots válidos, place / sell / upgrade (por jugador) |
| `TowerSystem` | Targeting, cooldowns, proyectiles / efectos |
| `CreepSystem` | Spawn, HP, status effects, death |
| `CombatSystem` | Resolución de daño, armor, resists |
| `EconomySystem` | Oro, costos, recompensas (por jugador) |
| `WaveSystem` | Timeline de olas, composición, bosses |
| `LifeSystem` | Vidas / leaks / eliminación |
| `RoomSession` | Lobby → playing → results (Colyseus) |

## Flujo de datos (partida multi)

1. Jugadores joinean room → lobby → ready.
2. Servidor carga `MapDef` + defs y arranca tick.
3. Cliente envía intents; servidor valida (oro, slot dueño, etc.) y aplica.
4. Servidor hace broadcast del state (o patches).
5. Phaser solo renderiza e input; no decide el resultado de combate.

## Intents del jugador (API mental)

```
PlaceTower { slotId, towerId }
UpgradeTower { towerInstanceId, branch? }
SellTower { towerInstanceId }
SendCreeps { sendId }
StartNextWave { }          # según modo / host
SetReady { ready: boolean }
```

## Lo que todavía no definimos

- ¿ECS, OOP por entidades, o híbrido?
- ¿Tick rate del server (20/30 Hz)?
- ¿Cuánto state se synca vs eventos (kill, place, send)?
- ¿Gold-only o dual currency para sends? → [send.md](../multiplayer/send.md)