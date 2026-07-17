# Arquitectura

> **Estado:** aprobado  
> Depende de: [stack.md](./stack.md) · Multi → [../multiplayer/overview.md](../multiplayer/overview.md) · Balance → [../balance/mvp-values.md](../balance/mvp-values.md)

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

## Decisiones de arquitectura cerradas

- **Modelo de entidades:** OOP por entidades con sistemas. ECS es overkill para el MVP; se reevalúa si el roster crece mucho.
- **Tick rate del server:** **20 Hz** (50 ms por tick). Renders interpolan a 60 FPS.
- **State sync:** Colyseus sincroniza el **state completo** de la sala (pequeño para 1v1). Eventos explícitos para feedback visual: `place`, `upgrade`, `sell`, `send`, `kill`, `leak`, `waveStart`.
- **Currency:** **Dual currency** (gold + send points) — ver ADR 0003.

## Lo que todavía no definimos

- Reconexión extendida más allá de la ventana corta de Colyseus.
- Replay / persistencia de partidas.