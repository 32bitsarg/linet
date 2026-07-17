# Mapas

> **Estado:** aprobado / primer tanteo  
> Sistema de path → [../gameplay/path.md](../gameplay/path.md) · Balance → [../balance/mvp-values.md](../balance/mvp-values.md)

## Contenido MVP

| id | Nombre | Lanes | Grilla | Flujo | Estado |
|----|--------|-------|--------|-------|--------|
| `line_01` | Twin Mazes | **2 espejo** (1v1) | 12×14, cell 40 | arriba → abajo | draft |

## Notas de diseño de `line_01`

- **Perspectiva:** top-down ortogonal; dos rectángulos verticales lado a lado.
- Simetría justa: mismas dimensiones y spawn/exit relativos.
- Torres bloquean celdas; A\* garantiza ruta spawn→exit.
- Espacio visual para feedback de **incoming send**.
- Resolución de referencia: 1280×720.

## Post-MVP

- Grillas más grandes / densidades distintas.
- Hazards / terreno especial (con cuidado: claridad del maze).
