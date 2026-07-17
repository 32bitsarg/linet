# Roster de creeps (MVP)

> **Estado:** borrador  
> Olas → [../gameplay/waves.md](../gameplay/waves.md)

## Tags útiles

`swarm` · `tank` · `fast` · `armored` · `magic-resist` · `boss` · `flying` (si aplica)

## Catálogo

| id | Nombre | Tags | HP | Speed | Armor | MR | Gold | Notas | Estado |
|----|--------|------|----|-------|-------|----|------|-------|--------|
| `grub` | | swarm | | | | | | early filler | draft |
| `runner` | | fast | | | | | | stress targeting | draft |
| `brute` | | tank armored | | | | | | fuerza single DPS | draft |
| `shade` | | magic-resist | | | | | | fuerza diversity | draft |
| `boss_1` | | boss | | | | | | mid boss | draft |

## CreepDef (schema mental)

```
CreepDef {
  id, name
  tags: string[]
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
