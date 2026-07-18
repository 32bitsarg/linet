# Mapas

> **Estado:** aprobado / primer tanteo  
> Sistema de path → [../gameplay/path.md](../gameplay/path.md) · Cámara/terreno → [../ui/camera-and-terrain.md](../ui/camera-and-terrain.md) · Balance → [../balance/mvp-values.md](../balance/mvp-values.md)

## Contenido MVP

| id | Nombre | Lanes | Grilla | Flujo | Estado |
|----|--------|-------|--------|-------|--------|
| `line_01` | Twin Mazes | **2 espejo** (1v1) | **14×17**, cell **36** | arriba → abajo | playable |

Orígenes (mapa lógico 1280×720): lane_0 `(48, 30)`, lane_1 `(728, 30)`; spawn/exit en columnas centrales; `exitRow` 16.

Fuente de verdad: `packages/shared/src/content/data/map.ts` (+ espejo `content/maps/line_01.json`).

## Notas de diseño de `line_01`

- **Perspectiva:** top-down ortogonal; dos rectángulos verticales lado a lado.
- Grilla con **celdas grandes** (cell 36) para torres/creeps legibles; menos celdas que 16×23@28 pero más craft visible.
- Display cliente: torres/creeps escalan con `cellSize` (`GameScene` / `creepDisplaySize`).
- Simetría justa: mismas dims; spawn/exit espejados en columna.
- Torres bloquean celdas; A\* garantiza ruta spawn→exit.
- Cliente: **ghost path**, terreno meadow/scrub alrededor, piso grass+dirt por celda.
- Cámara RTS puede enfocar una lane (el mapa lógico sigue siendo el mismo).

## Post-MVP

- Grillas más grandes / densidades distintas.
- Hazards / terreno especial (con cuidado: claridad del maze).
- Art pipeline (reemplazar procedural por tileset).
