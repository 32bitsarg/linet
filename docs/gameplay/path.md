# Path y mapa

> **Estado:** borrador

## Concepto Line TD

- Los creeps siguen un **path de waypoints**.
- El jugador **no** bloquea el camino con torres.
- Las torres se colocan en **build slots** (celdas / plataformas laterales).

## Path

```
spawn ──► wp1 ──► wp2 ──► … ──► exit (leak)
```

| Campo | Descripción |
|-------|-------------|
| `waypoints[]` | Puntos ordenados en mundo |
| `width` | Ancho visual / lane (opcional multi-lane) |
| `spawn` / `exit` | Extremos |

## Build slots

Cada slot:

| Campo | Descripción |
|-------|-------------|
| `id` | Identificador estable |
| `position` | Coordenadas |
| `allowedTowers` | `all` o whitelist (opcional) |
| `occupiedBy` | instancia o null |

Reglas:

- 1 torre por slot (salvo excepción documentada).
- Sell libera el slot.
- Upgrade no cambia de slot.

## MapDef (schema mental)

```
MapDef {
  id, name
  path: PathDef
  slots: BuildSlot[]
  theme?: string
}
```

## MVP

- 1 mapa.
- 1 lane.
- Suficientes slots para el roster MVP sin saturación visual.
