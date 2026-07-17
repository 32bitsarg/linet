# Combate

> **Estado:** borrador

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

## Fórmulas (rellenar)

```
damage_final = max(1, damage_raw * mitigation(armor, damage_type))
```

Mitigación concreta: _TBD_ (lineal, % por punto, diminishing returns…).

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

- Hitscan vs proyectil con travel time — _TBD_
- ¿Pueden miss por muerte del target mid-flight? Preferencia: sí, o retarget — _TBD_
