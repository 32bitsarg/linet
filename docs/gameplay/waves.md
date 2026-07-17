# Olas (waves)

> **Estado:** aprobado  
> Balance → [../balance/mvp-values.md](../balance/mvp-values.md)

## Modelo

Una partida = secuencia de olas. Cada ola define **qué** spawnea, **cuánto**, y **con qué timing**.

## WaveDef (schema mental)

```
WaveDef {
  index: number
  name?: string
  entries: WaveEntry[]     # grupos dentro de la ola
  rewardGold?: number
  isBoss?: boolean
}

WaveEntry {
  creepId: string
  count: number
  intervalMs: number       # entre spawns del grupo
  delayMs?: number         # delay antes de este grupo
}
```

## Escalado

| Factor | Fórmula por ola |
|--------|-----------------|
| HP base | ×1.15^ola |
| Count | +1 cada 2 olas (empezando ola 3) |
| Gold reward | ×1.08^ola |
| Armor / MR | Sin escala en MVP |
| Speed | Sin escala en MVP |

Valores base y composición concreta en [../balance/mvp-values.md](../balance/mvp-values.md).

## Ritmo deseado

- Early: creeps frágiles, enseñan targeting y path.
- Mid: mezcla de tanques + swarms + algún flying/special.
- Late: bosses + comps que fuerzan diversidad de torres.

## Multi (A + C)

- Cada jugador tiene su propia instancia de path (espejo).
- La **ola base** spawnea en **ambos** lanes a la vez (mismo `WaveDef`).
- Los **sends** son spawns extra en el lane rival, fuera o en cola respecto a la ola — ver [send.md](../multiplayer/send.md).
- “Fin de ola” por jugador: no quedan creeps vivos **de esa ola** en su lane (los sends pueden seguir activos).

## Control de ola

- **Elegido:** auto-start con countdown de 10 s entre olas.
- El countdown se muestra en el HUD.
- Manual “Next wave” y híbrido: post-MVP.

Ver también [../core/game-loop.md](../core/game-loop.md).

## Leak mid-wave

La ola no se “cancela”: creeps restantes siguen hasta exit o muerte.  
Clear de ola en un lane ≠ clear en el otro.
