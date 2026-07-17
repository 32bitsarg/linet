# Olas (waves)

> **Estado:** borrador

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

| Factor | Cómo escala |
|--------|-------------|
| HP | |
| Armor | |
| Count | |
| Speed | |
| Gold reward | |

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

- [ ] Auto-start con countdown
- [ ] Manual “Next wave” (ambos / host)
- [ ] Híbrido (auto tras X segundos)

Elegido: _TBD_ (en 1v1 con send, auto-countdown suele ir mejor).

## Leak mid-wave

La ola no se “cancela”: creeps restantes siguen hasta exit o muerte.  
Clear de ola en un lane ≠ clear en el otro.
