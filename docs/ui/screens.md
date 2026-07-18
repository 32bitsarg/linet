# UI / UX

> **Estado:** aprobado  
> Multi → [../multiplayer/overview.md](../multiplayer/overview.md) · Cámara/terreno → [camera-and-terrain.md](./camera-and-terrain.md) · Balance → [../balance/mvp-values.md](../balance/mvp-values.md)

## Pantallas

| Pantalla | Contenido mínimo |
|----------|------------------|
| Loading | Logo, conectando a servidor |
| Main menu | Jugar (multi), práctica vs bot, créditos |
| Create / Join room | Código corto de 4–6 caracteres, input de código, botón join |
| Lobby | 2 players, ready, host start, color/nombre |
| HUD partida | Oro, send points, vidas, ola, countdown, rival; **chips fijos** (no scroll con cámara) |
| Build bar | Torres + costo (gold) en dock inferior |
| Send panel | Sends + costo SP + estados disabled (ola / CD / SP) |
| Tower panel | Stats, upgrade, sell |
| Controles cámara | Botones MI MAPA / RIVAL / TODO |
| Disconnect | “Reconectando…” / tiempo restante |
| Rival disconnected | “Esperando rival…” / forfeit |
| Error | Código inválido, sala llena, conexión fallida |
| End screen | Winner, leaks/sends stats, rematch, leave |

## HUD — prioridades

1. Vidas, oro y **send points** propios.
2. Ola actual + countdown.
3. Estado del rival (vidas / bot / desconectado).
4. Feedback de leak + **incoming send** (banner).
5. Hint de torre seleccionada / place.
6. Controles de cámara visibles pero secundarios.

## Cámara (partida)

| Input | Acción |
|-------|--------|
| WASD / flechas | Pan |
| Borde de pantalla | Pan automático |
| Rueda | Zoom |
| Click medio + drag | Pan |
| `Q` / `1` | Foco mi mapa |
| `E` / `2` | Foco rival |
| `3` / `Home` | Overview (ambas lanes / cover zoom) |
| `Space` | Centrar mi línea **sin** cambiar zoom |

Detalle → [camera-and-terrain.md](./camera-and-terrain.md).

## Interacciones clave

- Lobby: create / paste code / ready / práctica.
- Click celda vacía propia → place (celdas ajenas / sellar path no buildables).
- Click torre propia → upgrade/sell.
- Hotkeys: `U` upgrade, `S` sell (con torre seleccionada), `ESC` deselect.
- Ghost path: polyline spawn→exit actual por lane.

## Accesibilidad / claridad

- Contraste grilla vs terreno; spawn (IN) / exit (OUT) visibles.
- Identidad de color/nombre por jugador estable en lobby y partida.
- HUD siempre legible (cámara UI separada + layout en resize).
