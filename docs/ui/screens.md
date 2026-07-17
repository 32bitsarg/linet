# UI / UX

> **Estado:** aprobado  
> Multi → [../multiplayer/overview.md](../multiplayer/overview.md) · Balance → [../balance/mvp-values.md](../balance/mvp-values.md)

## Pantallas

| Pantalla | Contenido mínimo |
|----------|------------------|
| Loading | Logo, conectando a servidor |
| Main menu | Jugar (multi), opciones, créditos |
| Create / Join room | Código corto de 4–6 caracteres, input de código, botón join |
| Lobby | 2 players, ready, host start, color/nombre |
| HUD partida | Oro, send points, vidas, ola actual, countdown, estado del rival |
| Build bar | Torres + costo (gold) |
| Send panel | 4 sends + costo (SP) + incoming banner |
| Tower panel | Stats, upgrade, sell, targeting (post-MVP) |
| Disconnect | “Reconectando…” / tiempo restante |
| Rival disconnected | “Esperando rival…” / forfeit |
| Error | Código inválido, sala llena, conexión fallida |
| End screen | Winner, leaks/sends stats, rematch, leave |

## HUD — prioridades

1. Vidas, oro y **send points** propios.
2. Ola actual.
3. Estado del rival (vidas).
4. Feedback de leak + **incoming send**.
5. Range preview al colocar / seleccionar.

## Interacciones clave

- Lobby: create / paste code / ready.
- Click slot vacío propio → place (slots ajenos no buildables).
- Click torre propia → upgrade/sell.
- Hotkeys (post-MVP inmediato): `1–6` torres, `U` upgrade, `S` sell.

## Accesibilidad / claridad

- Contraste fuerte path vs build area vs lanes de otros jugadores.
- Identidad de color/nombre por jugador estable en lobby y partida.
