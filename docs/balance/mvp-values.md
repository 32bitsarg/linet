# Balance MVP — valores de primer tanteo

> **Estado:** borrador / primer tanteo  
> Base para playtests del MVP. Estos números son intencionalmente simples y se espera que cambien con feedback.  
> Decisiones que los fijan: ADR 0003 (economía dual), ADR 0004 (tick rate y sync).

## Ritmo de partida

| Parámetro | Valor |
|-----------|-------|
| Jugadores | 2 (1v1) |
| Duración objetivo | ~8 minutos |
| Cantidad de olas | 10 |
| Tiempo activo por ola | ~35–45 s |
| Countdown entre olas | 10 s |
| Control de ola | **Auto-start** con countdown visible |
| Victoria | Last standing (0 vidas = derrota) |

## Vidas y economía inicial

| Parámetro | Valor | Nota |
|-----------|-------|------|
| Vidas iniciales | 20 | Leak de creep base quita 1–3 vidas; boss 10 |
| Oro inicial | 200 | Alcanza para ~3 torres baratas + 1 upgrade |
| Send points iniciales | 80 | Para 2–4 envíos early |
| Refund por venta | 70% | Redondeado hacia abajo |
| Interés | No en MVP | Volver a evaluar en `next` |

## Currencies

| Recurso | Para qué | Cómo se gana |
|---------|----------|--------------|
| **Gold** | Place / upgrade / sell torres | Kills, fin de ola |
| **Send points (SP)** | Enviar creeps al rival | Kills (50% del gold reward), clear de ola (+20 SP), pasivo (+2 SP/s) |

## Fórmula de daño (hitscan)

```
damage_final = max(1, floor(damage_raw * (1 - defense / (defense + 100))))
```

- `defense` puede ser `armor` (para daño físico) o `magicResist` (para daño mágico).
- Pure / True damage ignora defense.
- Ejemplo: 20 armor reduce 16.7% del daño físico. 100 armor reduce 50%.

## Targeting

Default MVP: **First** (creep más avanzado en el path).  
Post-MVP: opciones de targeting por torre.

## Torres MVP

| id | Nombre | Rol | Costo | Range | Dmg | Interval | DPS | Tipo daño | Efecto | Estado |
|----|--------|-----|-------|-------|-----|----------|-----|-----------|--------|--------|
| `arrow` | Archer | anti-swarm / basic | 60 | 120 | 12 | 0.6 s | 20 | physical | — | playable |
| `cannon` | Cannon | AoE | 100 | 100 | 25 | 1.5 s | 16.7 | physical | splash r=40 | playable |
| `frost` | Frost | slow / CC | 80 | 110 | 8 | 1.0 s | 8 | magical | slow 30% por 2 s | playable |
| `sniper` | Sniper | single DPS | 120 | 200 | 45 | 1.8 s | 25 | physical | long range | playable |
| `mage` | Mage | anti-tank / magic | 100 | 130 | 22 | 1.0 s | 22 | magical | — | playable |

### Upgrades lineales

Cada torre tiene 2 upgrades lineales (L1 → L2 → L3).

| Nivel | Costo | Multiplicador de stats |
|-------|-------|------------------------|
| L1 | base | 1.0× |
| L2 | +50% del costo base | 1.5× |
| L3 | +100% del costo base | 2.0× |

Ejemplo Archer:

| Nivel | Costo total | Dmg | DPS |
|-------|-------------|-----|-----|
| L1 | 60 | 12 | 20 |
| L2 | 90 | 18 | 30 |
| L3 | 120 | 24 | 40 |

## Creeps MVP

| id | Nombre | HP | Speed | Armor | MR | Gold | Leak damage | Tags |
|----|--------|----|-------|-------|----|------|-------------|------|
| `grub` | Grub | 30 | 80 | 0 | 0 | 4 | 1 | swarm |
| `runner` | Runner | 45 | 140 | 0 | 0 | 5 | 1 | fast |
| `brute` | Brute | 180 | 50 | 20 | 0 | 12 | 3 | tank, armored |
| `shade` | Shade | 90 | 70 | 0 | 30 | 8 | 2 | magic-resist |
| `boss_1` | Boss | 800 | 40 | 40 | 20 | 80 | 10 | boss |

### Escalado por ola

| Stat | Fórmula por ola |
|------|-----------------|
| HP base | ×1.15^ola |
| Count | +1 cada 2 olas (empezando en ola 3) |
| Gold reward | ×1.08^ola |
| Speed | Sin escala en MVP |
| Armor / MR | Sin escala en MVP |

### Olas fijas (primer tanteo)

| Ola | Composición | Notas |
|-----|-------------|-------|
| 1 | 6× grub | Intro |
| 2 | 4× grub + 2× runner | Fast debut |
| 3 | 4× runner + 2× brute | Tank debut |
| 4 | 8× grub + 2× brute | Swarm + tank |
| 5 | 6× shade | MR check |
| 6 | 4× brute + 4× runner | Mix |
| 7 | 1× boss_1 | Mid boss |
| 8 | 10× shade + 4× runner | Late swarm |
| 9 | 6× brute + 4× shade | Mixed armor/MR |
| 10 | 2× boss_1 + 8× runner | Final |

## Sends

| id | Creeps enviados | Costo SP | Min wave | Cooldown |
|----|-----------------|----------|----------|----------|
| `send_swarm` | 3× grub | 20 | 1 | 5 s |
| `send_fast` | 2× runner | 35 | 2 | 6 s |
| `send_tank` | 1× brute | 60 | 4 | 8 s |
| `send_boss` | 1× shade + 1× brute | 120 | 6 | 12 s |

Los creeps enviados spawnean en la cola del spawn del lane rival.  
No hay cap de creeps vivos en MVP; se revisa si hay lag en playtests.

## Fin de ola y recompensas

- **Clear de ola:** cuando no quedan creeps de la ola base vivos en el lane.
- Recompensa por clear: **20 SP** (no gold extra en MVP; ya viene de kills).
- Los sends **no** cuentan para el clear de ola del rival; son independientes.

## Tie-break

Si ambos jugadores llegan a 0 vidas en el mismo tick server:

1. Mayor cantidad de vidas restantes justo antes del leak fatal (si difieren).
2. Si siguen empatados: menor cantidad de leaks totales acumulados.
3. Si siguen empatados: más oro acumulado.
4. Si persisten: **sudden death** — ambos reciben 1 vida y ola 11 especial hasta que alguien leak.

## Notas de ajuste esperado

- Si las partidas duran <6 min, subir HP de creeps o armor.
- Si duran >10 min, bajar HP de creeps o bajar vidas iniciales.
- Si el early es muy fácil, bajar gold inicial o subir HP de grub.
- Si el late es imposible, revisar escalado de HP o cantidad de olas.

## Dependencias

- Sistema de combate: [../gameplay/combat.md](../gameplay/combat.md)
- Sistema de economía: [../gameplay/economy.md](../gameplay/economy.md)
- Olas: [../gameplay/waves.md](../gameplay/waves.md)
- Sends: [../multiplayer/send.md](../multiplayer/send.md)
- Torres: [../content/tower-roster.md](../content/tower-roster.md)
- Creeps: [../content/creep-roster.md](../content/creep-roster.md)
