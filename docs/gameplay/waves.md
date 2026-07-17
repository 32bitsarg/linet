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

## Control de ola

- [ ] Auto-start con countdown
- [ ] Manual “Next wave”
- [ ] Híbrido (auto tras X segundos)

Elegido: _TBD_

## Leak mid-wave

La ola no se “cancela”: creeps restantes siguen hasta exit o muerte.  
Victoria de ola = todos spawneados + vivos = 0.
