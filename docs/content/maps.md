# Mapas

> **Estado:** aprobado / primer tanteo  
> Sistema de path → [../gameplay/path.md](../gameplay/path.md) · Cámara/terreno → [../ui/camera-and-terrain.md](../ui/camera-and-terrain.md) · Balance → [../balance/mvp-values.md](../balance/mvp-values.md)

## Contenido MVP

| id | Nombre | Lanes | Grilla | Flujo | Estado |
|----|--------|-------|--------|-------|--------|
| `line_01` | Twin Mazes | **2 espejo** (1v1) | **16×23**, cell **28** | arriba → abajo | playable |

Orígenes (mapa lógico 1280×720): lane_0 `(48, 34)`, lane_1 `(784, 34)`; spawn/exit en columnas centrales; `exitRow` 22.

Fuente de verdad: `packages/shared/src/content/data/map.ts` (+ espejo `content/maps/line_01.json`).

## Notas de diseño de `line_01`

- **Perspectiva:** top-down ortogonal; dos rectángulos verticales lado a lado.
- Grilla más alta que el MVP inicial (era 12×14, luego 16×18) para **paths largos** y maze craft estilo WC3.
- Simetría justa: mismas dims; spawn/exit espejados en columna.
- Torres bloquean celdas; A\* garantiza ruta spawn→exit.
- Cliente: **ghost path**, terreno meadow/scrub alrededor, piso grass+dirt por celda.
- Cámara RTS puede enfocar una lane (el mapa lógico sigue siendo el mismo).

## Post-MVP

- Grillas más grandes / densidades distintas.
- Hazards / terreno especial (con cuidado: claridad del maze).
- Art pipeline (reemplazar procedural por tileset).
