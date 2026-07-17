# ADR 0001: Separar simulación de presentación

> **Estado:** aceptado  
> **Fecha:** 2026-07-17

## Contexto

Vamos a documentar y luego implementar un Line TD. Si mezclamos render/input con reglas de juego desde el día 1, el balance y los bugs de path/combat se vuelven difíciles de testear.

## Opciones consideradas

1. **Todo en el engine/UI** — más rápido al inicio, peor a medio plazo.
2. **Simulación pura + capa de presentación** — un poco más de estructura, testable.

## Decisión

Adoptar separación simulación / presentación (ver `docs/core/arquitectura.md`).

## Consecuencias

- Los sistemas (path, towers, economy…) no importan Phaser/Godot/DOM.
- La UI solo envía intents y lee snapshots de estado.
- Podemos escribir tests de olas/economía sin abrir el juego.
