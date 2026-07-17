# Mapas

> **Estado:** aprobado / primer tanteo  
> Sistema de path → [../gameplay/path.md](../gameplay/path.md) · Balance → [../balance/mvp-values.md](../balance/mvp-values.md)

## Contenido MVP

| id | Nombre | Lanes | Slots (aprox) | Forma del path | Estado |
|----|--------|-------|---------------|----------------|--------|
| `line_01` | | **2 espejo** (1v1) | 15–25 / jugador | zigzag / S | draft |

## Notas de diseño de `line_01`

- **Perspectiva:** top-down ortogonal.
- Simetría justa: mismos waypoints relativos y mismos slots.
- Legible de un vistazo **por lane**; el rival se ve sin confundir ownership.
- Slots cerca de curvas = más valor.
- Espacio visual para feedback de **incoming send**.
- Resolución de referencia: 1280×720, escala responsiva.

## Post-MVP

- Mapas con 2 lanes.
- Mapas con shortcuts / portals (con cuidado: rompe claridad Line TD).
