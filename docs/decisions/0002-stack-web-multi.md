# ADR 0002: Stack web multiplayer (Phaser + Colyseus)

> **Estado:** aceptado  
> **Fecha:** 2026-07-17

## Contexto

El MVP de Linet es **web** y el **multijugador online es feature principal**, no un add-on posterior. Hay que elegir engine 2D y capa de red/rooms.

## Opciones consideradas

### Frontend

1. **Phaser 3** — maduro para TD/RTS 2D, muchos recursos, export web simple.
2. Pixi + custom — más control, más trabajo de game loop/escenas.
3. Godot/Unity export web — más pesado para un MVP browser-first.

### Backend / sync

1. **Colyseus + Node + TS** — rooms, state sync, reconexión, matchmaking.
2. Socket.io casero — más flexible, reinventar rooms/rejoin.
3. Solo single-player ahora, multi después — choca con el producto (multi = MVP).

## Decisión

- Cliente: **Phaser 3 + TypeScript**
- Servidor: **Colyseus + Node.js + TypeScript**
- Transporte: **WebSockets** (Colyseus)

La simulación de juego vive en código **shared** (sin Phaser); el servidor la ejecuta con autoridad; el cliente renderiza e envía intents.

## Consecuencias

- El MVP incluye deploy de **cliente + servidor**, no solo estático.
- Hay que diseñar rooms, lobby y reglas multi desde el inicio ([multiplayer/overview.md](../multiplayer/overview.md)).
- Single-player, si existe, puede ser “room de 1” o bot — no un engine aparte.
- Complejidad de sync es costo aceptado del MVP.
