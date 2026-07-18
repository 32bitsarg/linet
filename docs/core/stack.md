# Stack

> **Estado:** aprobado  
> ADR → [0002-stack-web-multi.md](../decisions/0002-stack-web-multi.md) · Balance → [../balance/mvp-values.md](../balance/mvp-values.md)

## Fase 1 — Web (MVP)

| Capa | Opción | Notas |
|------|--------|-------|
| Lenguaje | **TypeScript** | Cliente y servidor |
| Frontend / engine | **Phaser 3** | 2D HTML5; TD / estilo Warcraft |
| Backend | **Colyseus + Node.js** | Rooms, sync, reconexión, matchmaking |
| Comunicación | **WebSockets** (vía Colyseus) | Tiempo real |
| Datos de contenido | **TypeScript / JSON** | Torres, creeps, olas, mapas |
| Deploy cliente | Web (browser) | Base también para mobile después |

## Por qué este stack

- El **multijugador online es feature principal del MVP** → hace falta servidor de rooms desde el día 1.
- Phaser cubre path, sprites, input y HUD sin un engine pesado.
- Colyseus evita reinventar sync / leave-rejoin / matchmaking.
- El mismo backend puede servir web y, más adelante, clientes mobile.

## Presentación cliente (notas vigentes)

- Phaser **3** (2D). Fantasía 2.5D = sombras/altura/depth, no motor 3D.
- Escala partida: **`Scale.RESIZE`** (sin letterbox); HUD con cámara UI fija.
- Terreno procedural en `fx/groundTextures.ts` hasta tener art pipeline.
- Detalle → [../ui/camera-and-terrain.md](../ui/camera-and-terrain.md).

## Requisitos no negociables

- **Simulación autoritativa en servidor** (el cliente predice/renderiza; no decide kills/oro finales).
- Simulación **separada** de Phaser (ADR 0001) para testear y reusar en Colyseus room.
- Fixed timestep / ticks deterministas o reconciliables.
- Contenido (torres, creeps, olas) como data, no hardcodeado en escenas.

## Estructura prevista del repo (código)

```
linet/
  docs/
  packages/          # o apps/ — monorepo ligero
    shared/          # tipos, defs, simulación pura
    client/          # Phaser 3
    server/          # Colyseus + Node
  content/           # torres, creeps, olas, mapas
  assets/
  tests/
```

> Detalle de módulos → [arquitectura.md](./arquitectura.md)  
> Multiplayer → [../multiplayer/overview.md](../multiplayer/overview.md)

## Preguntas abiertas resueltas

1. **¿Top-down ortogonal o isométrico?** → **Top-down ortogonal** (más simple para slots, path y clicks).
2. **¿Hitscan o proyectiles con travel time?** → **Hitscan** para el MVP (menos complejidad de sync; ver [../gameplay/combat.md](../gameplay/combat.md)).

## Pregunta abierta pendiente

1. ¿Hosting MVP: un VPS / Railway / Fly.io / similar? (no bloquea el stack)
