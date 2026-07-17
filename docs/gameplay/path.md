# Path y mapa

> **Estado:** borrador  
> Multi A+C → [../multiplayer/overview.md](../multiplayer/overview.md)

## Concepto Line TD

- Los creeps siguen un **path de waypoints**.
- El jugador **no** bloquea el camino con torres.
- Las torres se colocan en **build slots** laterales.
- En multi MVP: **un path + set de slots por jugador** (lanes espejo).

## Path

```
spawn ──► wp1 ──► wp2 ──► … ──► exit (leak)
```

| Campo | Descripción |
|-------|-------------|
| `waypoints[]` | Puntos ordenados en mundo |
| `width` | Ancho visual del lane |
| `spawn` / `exit` | Extremos |
| `ownerPlayerId` | Dueño del lane (runtime) |

## Build slots

| Campo | Descripción |
|-------|-------------|
| `id` | Identificador estable |
| `position` | Coordenadas |
| `laneId` / `ownerSlot` | A qué jugador pertenece |
| `allowedTowers` | `all` o whitelist |
| `occupiedBy` | instancia o null |

Reglas:

- 1 torre por slot.
- Solo el dueño del lane puede place/upgrade/sell.
- Sell libera el slot.

## MapDef (schema mental)

```
MapDef {
  id, name
  lanes: LaneDef[]     # MVP: 2 lanes espejo
}

LaneDef {
  id
  path: PathDef
  slots: BuildSlot[]
}
```

## MVP

- 1 mapa `line_01` con **2 lanes espejo**.
- Misma longitud de path y misma cantidad/valor de slots.
- Spawns de ola base + cola de **sends** en el spawn del lane.
