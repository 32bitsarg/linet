# ADR 0004: Tick rate y estrategia de sync

> **Estado:** aceptado  
> **Fecha:** 2026-07-17

## Contexto

Linet corre en servidor autoritativo con Colyseus. Necesitamos fijar:

1. Con qué frecuencia corre la simulación en el servidor.
2. Qué se sincroniza por state y qué por eventos.
3. Cómo se interpola/reconcilia en el cliente.

## Opciones consideradas

### Tick rate

1. **10 Hz** (100 ms): suficiente para un TD, pero el input puede sentirse lento.
2. **20 Hz** (50 ms): buen balance entre latencia y uso de CPU/red.
3. **30 Hz** (33 ms): más suave, más costo.

### Sync strategy

1. **State completo:** Colyseus sincroniza todo el state de la sala en cada patch.
2. **Eventos + state reducido:** solo posiciones/HP de creeps por state; eventos para place/send/kill.
3. **Snapshots delta:** sistema custom de delta compression.

## Decisión

- **Tick rate del servidor y simulación compartida: 20 Hz** (50 ms).
- **Cliente renderiza a 60 FPS** con interpolación visual leve sobre el state recibido.
- **State sync vía Colyseus schema:** el state de la sala es pequeño (1v1), así que sincronizamos el state completo.
- **Eventos explícitos para feedback visual:** `place`, `upgrade`, `sell`, `send`, `kill`, `leak`, `waveStart`. El servidor los emite; el cliente los puede usar para VFX/SFX sin afectar la simulación.
- **Modelo de entidades: OOP con sistemas.** ECS queda descartado para el MVP por ser overkill; se reevalúa si el roster crece mucho.

## Consecuencias

- `Simulation` corre a 20 Hz en el servidor Colyseus.
- `client/Phaser` renderiza a 60 FPS, interpolando posiciones de creeps entre ticks.
- Predicción visual leve para place/upgrade/sell, siempre reconciliada con el state del servidor.
- Tests de simulación corren a 20 Hz sin red ni Phaser.
- El state es lo suficientemente pequeño como para no preocuparnos por optimización de patches en el MVP.

## Links

- [../core/arquitectura.md](../core/arquitectura.md)
- [../core/game-loop.md](../core/game-loop.md)
- [../multiplayer/overview.md](../multiplayer/overview.md)
- [../balance/mvp-values.md](../balance/mvp-values.md)
