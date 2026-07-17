# Catálogo de features

> **Estado:** borrador  
> MVP → [mvp.md](./mvp.md) · Próximas → [backlog.md](./backlog.md)

Lista única de features del proyecto.  
Usá los estados de [README.md](./README.md). Cuando una feature sea grande, linkeá al doc de diseño.

## Jugabilidad

| ID | Feature | Estado | Notas / doc |
|----|---------|--------|-------------|
| `path-system` | Path de waypoints + leak | mvp | [path.md](../gameplay/path.md) |
| `build-slots` | Slots de construcción | mvp | [path.md](../gameplay/path.md) |
| `tower-place-sell` | Place / sell torres | mvp | [towers.md](../gameplay/towers.md) |
| `tower-upgrades` | Upgrades de torres | mvp | [towers.md](../gameplay/towers.md) |
| `tower-targeting` | Prioridades first/last/strong… | next | Default MVP = first |
| `combat-basic` | Daño, HP, kills | mvp | [combat.md](../gameplay/combat.md) |
| `combat-armor` | Armor / resists | next | |
| `status-slow` | Slow | next | Candidato fuerte post-MVP inmediato |
| `status-dot` | Burn / poison | later | |
| `aoe-splash` | Daño en área | mvp | Al menos 1 torre AoE |
| `economy-gold` | Oro, costos, rewards | mvp | [economy.md](../gameplay/economy.md) |
| `economy-interest` | Interés entre olas | next | |
| `lives-system` | Vidas por leak | mvp | |
| `wave-system` | Olas fijas | mvp | [waves.md](../gameplay/waves.md) |
| `wave-manual-start` | Botón Next wave | next | |
| `boss-waves` | Olas boss | next | |
| `win-lose` | Condiciones de fin | mvp | |

## Contenido

| ID | Feature | Estado | Notas / doc |
|----|---------|--------|-------------|
| `roster-towers-mvp` | 4–6 torres | mvp | [tower-roster.md](../content/tower-roster.md) |
| `roster-creeps-mvp` | Roster básico | mvp | [creep-roster.md](../content/creep-roster.md) |
| `map-line-01` | Primer mapa | mvp | [maps.md](../content/maps.md) |
| `map-second` | Segundo mapa | later | |
| `flying-creeps` | Unidades aéreas | later | |

## Modos

| ID | Feature | Estado | Notas / doc |
|----|---------|--------|-------------|
| `mode-classic` | Classic | mvp | [classic.md](../modes/classic.md) |
| `mode-random` | Random / draft de torres | later | [random.md](../modes/random.md) |
| `mode-endless` | Endless | later | |

## UI / meta

| ID | Feature | Estado | Notas / doc |
|----|---------|--------|-------------|
| `ui-hud` | HUD de partida | mvp | [screens.md](../ui/screens.md) |
| `ui-build-bar` | Barra de torres | mvp | |
| `ui-hotkeys` | Hotkeys | next | |
| `ui-settings` | Opciones (audio, etc.) | next | |
| `meta-unlocks` | Desbloqueos persistentes | later | |
| `meta-ranking` | Ranking | later | |

## Técnico / plataforma

| ID | Feature | Estado | Notas / doc |
|----|---------|--------|-------------|
| `tech-sim-render-split` | Simulación ≠ presentación | mvp | [0001](../decisions/0001-simulacion-vs-presentacion.md) |
| `tech-content-data` | Torres/olas como data | mvp | [stack.md](../core/stack.md) |
| `tech-save-run` | Save mid-run | later | |
| `mp-local` | Multijugador local | later | |
| `mp-online` | Multijugador online | later | |
| `tool-map-editor` | Editor de mapas | later | |

## Cómo agregar una feature

1. Sumá una fila acá con ID estable (`kebab-case`).
2. Poné estado `idea` o `later`.
3. Si entra al MVP o al próximo corte, actualizá [mvp.md](./mvp.md) o [backlog.md](./backlog.md).
4. Si necesita diseño, creá/linkeá el doc en `gameplay/` o `content/`.
