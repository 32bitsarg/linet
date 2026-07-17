# MVP — Primera versión jugable

> **Estado:** borrador  
> Visión de producto → [../vision/producto.md](../vision/producto.md)  
> Catálogo de features → [features.md](./features.md)

## Definición de “MVP listo”

Podés jugar **una partida completa** de principio a fin:

1. Elegís jugar (menú mínimo).
2. Colocás / upgradeás / vendés torres en slots.
3. Sobrevivís (o perdés) un set fijo de olas.
4. Ves pantalla de victoria o derrota.

Sin multiplayer, sin meta-progresión, sin editor.

## Checklist MVP

### Core jugable

| ID | Feature | Criterio de listo | Doc | Estado |
|----|---------|-------------------|-----|--------|
| `mvp-path` | Path + spawn/exit | Creeps recorren waypoints y leakean al final | [path.md](../gameplay/path.md) | mvp |
| `mvp-slots` | Build slots | Place/sell en slots; 1 torre por slot | [path.md](../gameplay/path.md) | mvp |
| `mvp-towers` | 4–6 torres base | Cada una con rol distinto y stats jugables | [tower-roster.md](../content/tower-roster.md) | mvp |
| `mvp-upgrades` | Upgrades lineales | Al menos L1→L2→L3 en cada torre MVP | [towers.md](../gameplay/towers.md) | mvp |
| `mvp-creeps` | Roster de creeps | ≥4 tipos (swarm, fast, tank, especial) | [creep-roster.md](../content/creep-roster.md) | mvp |
| `mvp-waves` | 8–12 olas fijas | Secuencia clara early→mid→late | [waves.md](../gameplay/waves.md) | mvp |
| `mvp-combat` | Daño + targeting | First-target; kills restan HP | [combat.md](../gameplay/combat.md) | mvp |
| `mvp-economy` | Oro + costos | Oro inicial, reward por kill, costos place/upgrade | [economy.md](../gameplay/economy.md) | mvp |
| `mvp-lives` | Vidas / leak | Leak resta vidas; a 0 = defeat | [economy.md](../gameplay/economy.md) | mvp |
| `mvp-winlose` | Win / lose | Sobrevivir última ola = win; vidas 0 = lose | [game-loop.md](../core/game-loop.md) | mvp |

### UI mínima

| ID | Feature | Criterio de listo | Doc | Estado |
|----|---------|-------------------|-----|--------|
| `mvp-hud` | HUD | Oro, vidas, ola visibles | [screens.md](../ui/screens.md) | mvp |
| `mvp-build-ui` | Build / upgrade / sell | Se puede jugar solo con mouse | [screens.md](../ui/screens.md) | mvp |
| `mvp-range` | Preview de range | Se ve al seleccionar o colocar | [screens.md](../ui/screens.md) | mvp |
| `mvp-end` | End screen | Resumen win/lose + volver al menú | [screens.md](../ui/screens.md) | mvp |

### Contenido MVP

| ID | Feature | Criterio de listo | Doc | Estado |
|----|---------|-------------------|-----|--------|
| `mvp-map-01` | 1 mapa | Path legible + slots suficientes | [maps.md](../content/maps.md) | mvp |
| `mvp-mode-classic` | Modo classic | Una regla de partida estable | [classic.md](../modes/classic.md) | mvp |

## Explícitamente fuera del MVP

| Feature | Por qué sale | Va a |
|---------|--------------|------|
| Multijugador | Complejidad de sync | [backlog.md](./backlog.md) |
| Modo random | Necesita roster estable primero | [backlog.md](./backlog.md) |
| Editor de mapas | Herramienta, no juego | later |
| Meta unlocks / ranking | Requiere persistencia y loops largos | later |
| Interest entre olas | Nice-to-have de economía | next (candidato) |
| Status effects avanzados (stun chains, etc.) | Balance pesado | next |
| Múltiples mapas | Un mapa alcanza para validar | next |

## Números objetivo (rellenar)

| Parámetro | Objetivo |
|-----------|----------|
| Duración de partida | ~__ min |
| Vidas iniciales | __ |
| Oro inicial | __ |
| Torres distintas | 4–6 |
| Olas | 8–12 |
| Mapa | 1 (`line_01`) |

## Orden de implementación sugerido

1. Path + creeps moviéndose + leak/vidas  
2. Slots + place torre dummy  
3. Combat básico + oro por kill  
4. Roster mínimo (2–3 torres) + upgrades  
5. Waves + win/lose  
6. Pulir UI / roster completo MVP  
