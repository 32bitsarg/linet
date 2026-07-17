# Game loop y estados

> **Estado:** borrador

## Estados de sesión

```
boot → menu → loading → playing ⇄ paused → won | lost → menu
```

| Estado | Qué ocurre |
|--------|------------|
| `menu` | Elegir modo / mapa |
| `loading` | Cargar content + assets |
| `playing` | Simulación activa |
| `paused` | Simulación congelada; UI activa |
| `won` / `lost` | Resumen de partida |

## Timestep

- Preferencia: **fixed timestep** para simulación (ej. 20 o 30 Hz).
- Render interpolado opcional.
- Valor elegido: _TBD_

## Orden de update (por tick)

1. Input / intents pendientes
2. Wave spawns
3. Creep movement
4. Tower targeting + fire
5. Projectiles / effects
6. Combat resolve (damage, death)
7. Economy (rewards)
8. Life / leak check
9. Win / lose check

## Pausas y “entre olas”

- ¿Las olas arrancan solas o el jugador pulsa “Next wave”? _TBD_
- ¿Hay interest entre olas? → ver [economy.md](../gameplay/economy.md)
