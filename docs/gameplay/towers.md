# Sistema de torres

> **Estado:** borrador  
> Catálogo concreto → [../content/tower-roster.md](../content/tower-roster.md)

## Rol en el juego

Las torres son la herramienta principal de defensa. Cada una debería ocupar un **rol** claro para que el build order importe.

## Roles (framework)

| Rol | Función | Ejemplos de nombre (placeholder) |
|-----|---------|----------------------------------|
| DPS single | Alto daño a 1 target | Sniper / Cannon |
| AoE | Daño en área / splash | Mortar |
| Slow / CC | Control de velocidad | Frost |
| Support | Buff aliados / debuff | Aura tower |
| Anti-swarm | Ataque rápido / multicible | Gatling |
| Anti-tank | Penetración / % HP / armor shred | Piercer |
| Special | Niche (flying only, execute…) | |

## Ciclo de vida

1. Place en slot libre (paga costo).
2. Target según prioridad.
3. Attack según `attackInterval` / `range`.
4. Upgrade (lineal o ramas).
5. Sell (refund %).

## TowerDef (schema mental)

```
TowerDef {
  id: string
  name: string
  role: Role
  cost: number
  range: number
  damage: number
  damageType: DamageType
  attackInterval: number
  projectile?: ProjectileDef
  effects?: StatusEffect[]
  upgrades: UpgradeDef[]
  targetingDefault: Targeting
}
```

## Upgrades

Opciones de diseño (elegir una para MVP):

| Modelo | Pros | Contras |
|--------|------|---------|
| A) Lineal L1→L2→L3 | Simple | Poca variedad |
| B) 2 ramas en L2 | Builds distintos | Más balance |
| C) Árbol amplio | Depth | Complejidad MVP |

**Preferencia MVP:** A o B — _elegir_.

## Reglas de balance (guidelines)

- Ninguna torre sola debe clearar late game.
- AoE fuerte vs swarm, débil vs tank.
- Single-target inverso.
- CC no stunea eterno: diminishing o CD claro.

## Open questions

1. ¿Torres aéreas / anti-air separado?
2. ¿Límite de torres del mismo tipo?
3. ¿Fusión de torres (estilo algunos TD) en post-MVP?
