# Combate

> **Estado:** aprobado  
> Balance → [../balance/mvp-values.md](../balance/mvp-values.md)

## Daño

| Tipo | Descripción | Ejemplos de torres |
|------|-------------|--------------------|
| Physical | Default | |
| Magical | | |
| Pure / True | Ignora armor | |
| Elemental (fire/ice/…) | Opcional post-MVP | |

## Defensa de creeps

| Stat | Efecto |
|------|--------|
| Armor / Magic resist | Reduce daño del tipo correspondiente |
| Evasion | Chance de miss (opcional) |
| Spell immunity | Bloquea CC mágico (bosses) |

## Fórmula de daño

Daño **hitscan** (sin travel time de proyectil).

```
damage_final = max(1, floor(damage_raw * (1 - defense / (defense + 100))))
```

- `defense` = `armor` para daño físico, `magicResist` para daño mágico.
- Pure / True damage ignora defense.
- Ejemplo: 20 armor reduce ~16.7% del daño físico; 100 armor reduce 50%.

| defense | Mitigación aproximada |
|---------|------------------------|
| 0 | 0% |
| 20 | 16.7% |
| 50 | 33.3% |
| 100 | 50% |
| 200 | 66.7% |

## Targeting

Prioridades típicas de torre:

1. First (más avanzado en el path)
2. Last
3. Closest
4. Strongest (más HP)
5. Weakest

Default global MVP: **First**.

## Status effects

| Effect | Qué hace | Stacking |
|--------|----------|----------|
| Slow | Reduce velocidad path | |
| Stun | Congela movimiento | |
| DoT (burn/poison) | Daño por tick | |
| Armor shred | Baja defense | |
| Root | No se mueve pero ataca? (N/A en TD) | |

## Proyectiles

- **MVP: hitscan.** La torre dispara y el daño se aplica inmediatamente al target válido en ese tick.
- No hay travel time, no hay miss por muerte mid-flight.
- Proyectiles visuales (si los usamos) son **puramente cosméticos**; no afectan la simulación.
- Travel time real: post-MVP si se justifica.
