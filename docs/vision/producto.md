# Producto — Linet

> **Estado:** borrador

## Qué es

Linet es un *Line Tower Wars* (estilo Warcraft III): cada jugador arma un **laberinto con torres** en su carril; los creeps pathfindean spawn → exit. En 1v1 mandás creeps al laberinto del rival (sends).

**Inspiración:** mapas Line Tower Wars / maze TD de Warcraft III (grilla + pathfinding + sends + economía dual).

## Qué no es (por ahora)

- No es Line TD de path fijo con slots laterales.
- No es un RTS completo.
- No es battle royale / survival abierto.

## Pillars de diseño

1. **Multijugador online 1v1 primero** — laberintos propios + sends al rival (A + C).
2. **Laberinto legible** — grilla clara; nunca se puede sellar la ruta spawn→exit.
3. **Decisiones de maze + build** — forma del camino y composición de torres.
4. **Presión ofensiva** — clear bueno se convierte en sends, no solo en farmear oro.
5. **Economía tensa** — gold, send points, upgrades y riesgo de leak importan.
6. **Sesiones cortas** — una partida completa en un tiempo objetivo (definir en MVP).

## Audiencia

- Jugadores casuales de TD / fans de mapas custom WC3 multi.
- Plataforma MVP: **web** (Phaser); server reutilizable para mobile después.

## Alcance

La checklist viva del MVP, features y próximas está en **[roadmap/](../roadmap/)**:

- [MVP](../roadmap/mvp.md) — qué entra en la primera versión jugable
- [Features](../roadmap/features.md) — catálogo con estados
- [Backlog](../roadmap/backlog.md) — post-MVP priorizado

Acá solo queda la brújula de producto; el tracking de alcance no se duplica.

## Referencias

- Warcraft III Line TD (variantes clásicas)
- _Agregar otros TD de referencia_
