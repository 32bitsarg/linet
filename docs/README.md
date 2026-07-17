# Linet — Documentación

Diseño y arquitectura del juego (**Line Tower Wars**).  
Mapa para agentes de código: [`../AGENTS.md`](../AGENTS.md).

## Cómo usar esta carpeta

1. [visión/producto.md](./vision/producto.md) — qué es Linet y qué no es.
2. [roadmap/mvp.md](./roadmap/mvp.md) y [roadmap/features.md](./roadmap/features.md) — alcance.
3. [core/stack.md](./core/stack.md) + [core/arquitectura.md](./core/arquitectura.md) — stack y mapa de código.
4. [multiplayer/overview.md](./multiplayer/overview.md) — rooms, lanes, sends.
5. `gameplay/` + `content/` — reglas y catálogos.
6. [balance/mvp-values.md](./balance/mvp-values.md) — números.
7. `decisions/` — ADRs.

Si el código y un doc discrepan, **actualizá el doc** (o el código) en el mismo cambio.

## Índice

| Área | Qué define |
|------|------------|
| [vision/](./vision/) | Producto, pillars |
| [roadmap/](./roadmap/) | MVP, features, backlog |
| [multiplayer/](./multiplayer/) | Rooms, lanes, send |
| [core/](./core/) | Stack, arquitectura, game loop |
| [gameplay/](./gameplay/) | Economía, combate, laberinto, olas |
| [content/](./content/) | Torres, creeps, mapas |
| [balance/](./balance/) | Valores de primer tanteo |
| [modes/](./modes/) | Classic, random, etc. |
| [ui/](./ui/) | Pantallas, HUD |
| [decisions/](./decisions/) | ADRs |

## Convención

- Un tema = un archivo.
- Cada doc empieza con **Estado** (`borrador` / `en revisión` / `aprobado`).
- Números en tablas; narrativa corta.
- Código en inglés; docs de diseño en español.
