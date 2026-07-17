# UI / UX

> **Estado:** borrador  
> Multi → [../multiplayer/overview.md](../multiplayer/overview.md)

## Pantallas

| Pantalla | Contenido mínimo |
|----------|------------------|
| Main menu | Jugar (multi), opciones, créditos |
| Lobby | Crear room / unirse, 2 players, ready, start |
| HUD partida | Oro, send points, vidas, ola, rival |
| Build bar | Torres + costo (gold) |
| Send panel | 2–4 sends + costo (send points) + incoming banner |
| Tower panel | Stats, upgrade, sell, targeting |
| Disconnect | “Reconectando…” |
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
