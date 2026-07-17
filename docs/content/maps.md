# Mapas

> **Estado:** borrador  
> Sistema de path → [../gameplay/path.md](../gameplay/path.md)

## MVP

| id | Nombre | Lanes | Slots (aprox) | Forma del path | Estado |
|----|--------|-------|---------------|----------------|--------|
| `line_01` | | 1 | 20–30 | zigzag / S | draft |

## Notas de diseño de `line_01`

- El path debe ser legible en un vistazo.
- Slots cerca de curvas = más valor (más tiempo de contacto).
- Evitar slots “muertos” (fuera de toda range útil).

## Post-MVP

- Mapas con 2 lanes.
- Mapas con shortcuts / portals (con cuidado: rompe claridad Line TD).
