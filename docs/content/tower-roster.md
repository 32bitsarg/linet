# Roster de torres (MVP)

> **Estado:** aprobado / primer tanteo  
> Reglas del sistema → [../gameplay/towers.md](../gameplay/towers.md) · Balance → [../balance/mvp-values.md](../balance/mvp-values.md)

## Cómo llenar esta tabla

1. Definí 4–6 torres con roles distintos.
2. Completá números solo cuando [economy.md](../gameplay/economy.md) y [combat.md](../gameplay/combat.md) tengan fórmulas base.
3. Marcá cada torre `draft` → `playable` → `balanced`.

## Catálogo

| id | Nombre | Rol | Costo | Range | Dmg | Interval | DPS | Tipo daño | Efecto | Estado |
|----|--------|-----|-------|-------|-----|----------|-----|-----------|--------|--------|
| `arrow` | Archer | anti-swarm / basic | 60 | 120 | 12 | 0.6 s | 20 | physical | — | playable |
| `cannon` | Cannon | AoE | 100 | 100 | 25 | 1.5 s | 16.7 | physical | splash r=40 | playable |
| `frost` | Frost | slow / CC | 80 | 110 | 8 | 1.0 s | 8 | magical | slow 30% / 2 s | playable |
| `sniper` | Sniper | single DPS | 120 | 200 | 45 | 1.8 s | 25 | physical | long range | playable |
| `mage` | Mage | anti-tank / magic | 100 | 130 | 22 | 1.0 s | 22 | magical | — | playable |

> Upgrades lineales: L2 = +50% costo y stats; L3 = +100% costo y stats. Ver [../balance/mvp-values.md](../balance/mvp-values.md).

## Upgrades por torre

Modelo MVP: **lineal** (L1 → L2 → L3). Ver reglas de multiplicador en [../balance/mvp-values.md](../balance/mvp-values.md).

### `arrow` (Archer)

| Nivel | Costo acumulado | Dmg | DPS | Efecto |
|-------|-----------------|-----|-----|--------|
| 1 | 60 | 12 | 20 | — |
| 2 | 90 | 18 | 30 | — |
| 3 | 120 | 24 | 40 | — |

### `cannon`

| Nivel | Costo acumulado | Dmg | DPS | Splash |
|-------|-----------------|-----|-----|--------|
| 1 | 100 | 25 | 16.7 | r=40 |
| 2 | 150 | 37 | 25 | r=40 |
| 3 | 200 | 50 | 33.3 | r=50 |

### `frost`

| Nivel | Costo acumulado | Dmg | DPS | Slow |
|-------|-----------------|-----|-----|------|
| 1 | 80 | 8 | 8 | 30% / 2 s |
| 2 | 120 | 12 | 12 | 40% / 2 s |
| 3 | 160 | 16 | 16 | 50% / 2.5 s |

### `sniper`

| Nivel | Costo acumulado | Dmg | DPS | Range |
|-------|-----------------|-----|-----|-------|
| 1 | 120 | 45 | 25 | 200 |
| 2 | 180 | 67 | 37 | 220 |
| 3 | 240 | 90 | 50 | 250 |

### `mage`

| Nivel | Costo acumulado | Dmg | DPS | Notas |
|-------|-----------------|-----|-----|-------|
| 1 | 100 | 22 | 22 | mágico |
| 2 | 150 | 33 | 33 | mágico |
| 3 | 200 | 44 | 44 | mágico |

## Sinergias deseadas

| Combo | Por qué funciona |
|-------|------------------|
| frost + cannon | slow agrupa / alarga tiempo en splash |
| sniper + mage | split tank DPS físico/mágico |

## Cortes conscientes (no en MVP)

- Torres de spawn de unidades
- Torres que mueven el path
- Torres de teletransporte
