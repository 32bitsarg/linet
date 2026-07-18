# Catálogo de features

> **Estado:** borrador  
> MVP → [mvp.md](./mvp.md) · Próximas → [backlog.md](./backlog.md)

Lista única de features del proyecto.  
Usá los estados de [README.md](./README.md). Cuando una feature sea grande, linkeá al doc de diseño.

## Jugabilidad

| ID | Feature | Estado | Notas / doc |
|----|---------|--------|-------------|
| `path-system` | Grilla + A* spawn/exit + leak | done | [path.md](../gameplay/path.md) |
| `build-slots` | Place en celdas (no sellar) | done | [path.md](../gameplay/path.md) |
| `tower-place-sell` | Place / sell torres | done | [towers.md](../gameplay/towers.md) |
| `tower-upgrades` | Upgrades de torres | done | Roster L1–L3 en código; [towers.md](../gameplay/towers.md) |
| `tower-targeting` | Prioridades first/last/strong… | next | Default MVP = first |
| `combat-basic` | Daño, HP, kills | done | [combat.md](../gameplay/combat.md) |
| `combat-armor` | Armor / resists | done | Fórmula en shared/combat |
| `status-slow` | Slow | done | Torre frost; feedback visual azul en cliente |
| `status-dot` | Burn / poison | later | |
| `aoe-splash` | Daño en área | done | Cannon |
| `economy-gold` | Oro, costos, rewards | done | [economy.md](../gameplay/economy.md) |
| `economy-interest` | Interés entre olas | next | |
| `lives-system` | Vidas por leak | done | |
| `wave-system` | Olas fijas | done | [waves.md](../gameplay/waves.md) |
| `wave-manual-start` | Botón Next wave | next | |
| `boss-waves` | Olas boss | done | Olas 7 y 10 |
| `win-lose` | Condiciones de fin | done | |

## Contenido

| ID | Feature | Estado | Notas / doc |
|----|---------|--------|-------------|
| `roster-towers-mvp` | 4–6 torres | done | [tower-roster.md](../content/tower-roster.md) |
| `roster-creeps-mvp` | Roster básico | done | [creep-roster.md](../content/creep-roster.md) |
| `map-line-01` | Primer mapa | done | [maps.md](../content/maps.md) |
| `map-second` | Segundo mapa | later | |
| `flying-creeps` | Unidades aéreas | later | |

## Multijugador

| ID | Feature | Estado | Notas / doc |
|----|---------|--------|-------------|
| `mp-online` | Multijugador online (pillar MVP) | done | [overview.md](../multiplayer/overview.md) |
| `mp-rooms` | Create / join room | done | 1v1 |
| `mp-lobby` | Lobby + ready | done | |
| `mp-lanes` | Lanes paralelos (A) | done | laberintos espejo |
| `mp-send` | Send creeps al rival (C) | done | [send.md](../multiplayer/send.md) |
| `mp-authority` | Server-authoritative sim | done | [arquitectura.md](../core/arquitectura.md) |
| `mp-sync` | State sync de partida | done | |
| `mp-reconnect` | Reconexión corta | done | Colyseus `allowReconnection` + overlays cliente |
| `mp-results` | Resultados / rematch | done | |
| `mp-solo-bot` | Práctica vs bot (construye) | done | Solo test, no ranked |
| `mp-coop` | Coop mismo path (B) | later | |
| `mp-ranked` | Ranked / ELO | later | |
| `mp-skill-mm` | Matchmaking por skill | later | |
| `mp-local` | Hotseat / same device | later | |
| `mp-ffa` | 3–4 jugadores | later | |

## Modos

| ID | Feature | Estado | Notas / doc |
|----|---------|--------|-------------|
| `mode-classic` | Classic multi | done | [classic.md](../modes/classic.md) |
| `mode-random` | Random / draft de torres | later | [random.md](../modes/random.md) |
| `mode-endless` | Endless | later | |

## UI / meta

| ID | Feature | Estado | Notas / doc |
|----|---------|--------|-------------|
| `ui-lobby` | UI create/join/ready | done | [screens.md](../ui/screens.md) |
| `ui-hud` | HUD de partida | done | oro, vidas, send pts, rival connected |
| `ui-send-panel` | Panel de sends | done | disabled SP/CD/minWave |
| `ui-build-bar` | Barra de torres | done | |
| `ui-hotkeys` | Hotkeys | done | U / S / ESC |
| `ui-settings` | Opciones (audio, etc.) | next | |
| `meta-unlocks` | Desbloqueos persistentes | later | |
| `meta-ranking` | Ranking | later | |

## Técnico / plataforma

| ID | Feature | Estado | Notas / doc |
|----|---------|--------|-------------|
| `tech-sim-render-split` | Simulación ≠ presentación | done | [0001](../decisions/0001-simulacion-vs-presentacion.md) |
| `tech-stack-phaser-colyseus` | Phaser + Colyseus + TS | done | [0002](../decisions/0002-stack-web-multi.md) |
| `tech-content-data` | Torres/olas como data | done | [stack.md](../core/stack.md) |
| `tech-save-run` | Save mid-run | later | |
| `tool-map-editor` | Editor de mapas | later | |

## Cómo agregar una feature

1. Sumá una fila acá con ID estable (`kebab-case`).
2. Poné estado `idea` o `later`.
3. Si entra al MVP o al próximo corte, actualizá [mvp.md](./mvp.md) o [backlog.md](./backlog.md).
4. Si necesita diseño, creá/linkeá el doc en `gameplay/` o `content/`.
