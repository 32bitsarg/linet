# Roster de creeps (MVP)

> **Estado:** aprobado / primer tanteo  
> Olas → [../gameplay/waves.md](../gameplay/waves.md) · Balance → [../balance/mvp-values.md](../balance/mvp-values.md)

## Tags útiles

`swarm` · `tank` · `fast` · `armored` · `magic-resist` · `boss` · `flying` (si aplica)

## Catálogo

| id | Nombre | Tags | HP | Speed | Armor | MR | Gold | Leak dmg | Estado |
|----|--------|------|----|-------|-------|----|------|----------|--------|
| `grub` | Grub | swarm | 30 | 80 | 0 | 0 | 4 | 1 | playable |
| `runner` | Runner | fast | 45 | 140 | 0 | 0 | 5 | 1 | playable |
| `brute` | Brute | tank, armored | 180 | 50 | 20 | 0 | 12 | 3 | playable |
| `shade` | Shade | magic-resist | 90 | 70 | 0 | 30 | 8 | 2 | playable |
| `boss_1` | Boss | boss | 800 | 40 | 40 | 20 | 80 | 10 | playable |

> HP base se escala ×1.15^ola. Gold reward ×1.08^ola. Ver [../balance/mvp-values.md](../balance/mvp-values.md).

## CreepDef (schema mental)

```
CreepDef {
  id, name
  tags: string[]
  hp, speed
  armor, magicResist
  hp, speed
  armor, magicResist
  goldReward
  leakDamage: number    # vidas que quita al exit
  size?: number
  immunities?: StatusEffectId[]
}
```

## Contrapicks (diseño)

| Creep | Torre que lo castiga | Torre que sufre |
|-------|----------------------|-----------------|
| swarm | AoE | sniper puro |
| tank | sniper / shred | splash débil |
| fast | slow + mid DPS | torres lentas sin CC |
