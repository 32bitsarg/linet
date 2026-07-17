# Laberinto y pathfinding

> **Estado:** aprobado (Line Tower Wars)  
> Multi A+C → [../multiplayer/overview.md](../multiplayer/overview.md)

## Concepto

Linet es **Line Tower Wars** (estilo WC3), no Line TD de path fijo:

- Cada jugador tiene un **carril rectangular de grilla**.
- Las torres **ocupan celdas** y forman el laberinto.
- Los creeps usan **pathfinding (A\*)** de spawn → exit.
- **No se puede sellar** la ruta: un place que deja sin camino se rechaza.
- En 1v1: dos laberintos **lado a lado** (izquierda / derecha); creeps van **arriba → abajo**.

## Lane (grilla)

| Campo | Descripción |
|-------|-------------|
| `originX/Y` | Esquina superior izquierda del grid en mundo |
| `cols` / `rows` | Tamaño del laberinto |
| `cellSize` | Tamaño de celda en px |
| `spawnCol/Row` | Entrada (reservada) |
| `exitCol/Row` | Salida / leak (reservada) |

Reglas:

- 1 torre por celda libre.
- Spawn y exit no son buildables.
- Solo el dueño del lane puede place/upgrade/sell.
- Tras place/sell, los creeps vivos **recalculan path**.

## Path dinámico

```
spawn ──► A* (4 vecinos) ──► exit (leak)
```

- Obstáculos = celdas con torre.
- Si no hay ruta → `placeRejected` (no se cobra oro).

## MapDef (schema)

```
MapDef {
  id, name, width, height
  lanes: LaneDef[]     # MVP: 2 laberintos espejo
}

LaneDef {
  id
  originX, originY
  cols, rows, cellSize
  spawnCol, spawnRow
  exitCol, exitRow
}
```

## MVP

- Mapa `line_01` / Twin Mazes: **2 lanes** 12×14, `cellSize` 40.
- Spawns de ola base + cola de **sends** en el spawn del lane rival.
