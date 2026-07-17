# Linet — Documentación

Documentación de diseño y arquitectura **antes de código**.  
Juego tipo *Line Tower Defense* (estilo mapa de Warcraft III).

## Cómo usar esta carpeta

1. Empezá por [visión/producto.md](./vision/producto.md) — qué es Linet y qué no es.
2. Cerrá alcance en [roadmap/mvp.md](./roadmap/mvp.md) y el catálogo en [roadmap/features.md](./roadmap/features.md).
3. Definí el stack en [core/stack.md](./core/stack.md).
4. Cerrá sistemas de juego en `gameplay/` y contenido en `content/`.
5. Registrá decisiones importantes en `decisions/` (ADRs).
6. Recién después: estructura de carpetas de código en [core/arquitectura.md](./core/arquitectura.md).

## Índice

| Área | Qué define |
|------|------------|
| [vision/](./vision/) | Producto, pillars, audiencia |
| [roadmap/](./roadmap/) | MVP, features, backlog / próximas |
| [core/](./core/) | Stack, arquitectura, game loop, estados |
| [gameplay/](./gameplay/) | Economía, combate, path, olas |
| [content/](./content/) | Catálogos: torres, creeps, mapas |
| [modes/](./modes/) | Modos de juego (classic, random, etc.) |
| [ui/](./ui/) | Pantallas, HUD, flujos |
| [decisions/](./decisions/) | Decisiones técnicas (ADR) |

## Convención

- Un tema = un archivo. Evitar “mega-docs” que mezclan stack + torres + UI.
- Cada doc empieza con **Estado** (`borrador` / `en revisión` / `aprobado`).
- Números y fórmulas van en tablas; narrativa corta.
- Si algo cambia el balance o la arquitectura, actualizá el doc **antes** o **junto** al cambio de código.
