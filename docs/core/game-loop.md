# Game loop y estados

> **Estado:** aprobado  
> Balance → [../balance/mvp-values.md](../balance/mvp-values.md)

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

- **Fixed timestep:** 20 Hz (50 ms por tick) en servidor y simulación compartida.
- Cliente renderiza a 60 FPS con interpolación visual leve sobre el state recibido.
- Tick rate cerrado en ADR 0004.

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

- **Auto-start con countdown:** cada ola comienza automáticamente 10 s después de que terminó la anterior.
- El countdown se muestra en el HUD.
- **No hay pausa en multiplayer.**
- Interés entre olas: fuera del MVP.
