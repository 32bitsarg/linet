# MVP — Primera versión jugable

> **Estado:** aprobado  
> Visión → [../vision/producto.md](../vision/producto.md)  
> Features → [features.md](./features.md)  
> Multi → [../multiplayer/overview.md](../multiplayer/overview.md)  
> Balance → [../balance/mvp-values.md](../balance/mvp-values.md)

## Definición de “MVP listo”

Podés crear/entrar a una **room online** y completar una partida multijugador:

1. Create / join lobby (código o link).
2. Todos ready → partida.
3. Cada jugador coloca / upgradea / vende torres en **su** laberinto (celdas propias; sin sellar path).
4. Olas espejo + **sends** al rival (variante **A + C**).
5. Simulación **autoritativa en servidor**.
6. Last standing (0 vidas = out) → resultados → lobby/menú.
7. Reconexión básica si alguien se cae unos segundos.

Sin meta-progresión, sin editor, sin ranked, sin coop (B), sin proyectiles con travel time, sin interés.

## Pillar del MVP

| Pilar | Implicancia |
|-------|-------------|
| **Multijugador online 1v1** | Colyseus rooms + WebSockets |
| **A + C** | Laberintos paralelos + send de creeps al rival |
| Line Tower Wars jugable | Grilla, A*, torres, olas, economía, vidas |
| Web | Phaser 3 en browser |

## Checklist MVP

### Multijugador (principal)

| ID | Feature | Criterio de listo | Doc | Estado |
|----|---------|-------------------|-----|--------|
| `mvp-mp-rooms` | Create / join room | 2+ jugadores entran con código/link | [overview.md](../multiplayer/overview.md) | done |
| `mvp-mp-lobby` | Lobby + ready | La partida no arranca hasta ready (o host start) | idem | done |
| `mvp-mp-authority` | Simulación en server | Cliente no puede spawnear oro/kills a dedo | [arquitectura.md](../core/arquitectura.md) | done |
| `mvp-mp-sync` | State sync | Todos ven el mismo resultado de ola/leaks | idem | done |
| `mvp-mp-reconnect` | Reconnect corto | Rejoin en ventana X s sin romper la room | Colyseus | partial |
| `mvp-mp-results` | Resultados | Pantalla final + rematch/leave | [screens.md](../ui/screens.md) | done |
| `mvp-mp-lanes` | Lanes paralelos (A) | 2 laberintos espejo; ownership por lane | [overview.md](../multiplayer/overview.md) | done |
| `mvp-mp-send` | Send al rival (C) | Comprar y spawnear creeps en lane rival | [send.md](../multiplayer/send.md) | done |

### Core jugable

| ID | Feature | Criterio de listo | Doc | Estado |
|----|---------|-------------------|-----|--------|
| `mvp-path` | Grilla + A* spawn/exit | Creeps pathfindean; no se puede sellar | [path.md](../gameplay/path.md) | done |
| `mvp-slots` | Place en celdas | Place/sell; ownership de lane; reject block | [path.md](../gameplay/path.md) | done |
| `mvp-towers` | 4–6 torres base | Roles distintos, stats jugables | [tower-roster.md](../content/tower-roster.md) | done |
| `mvp-upgrades` | Upgrades lineales | L1→L2→L3 por torre MVP | [towers.md](../gameplay/towers.md) | done |
| `mvp-creeps` | Roster de creeps | ≥4 tipos | [creep-roster.md](../content/creep-roster.md) | done |
| `mvp-waves` | 8–12 olas fijas | Early→mid→late | [waves.md](../gameplay/waves.md) | done |
| `mvp-combat` | Daño + targeting | First-target; kills en server | [combat.md](../gameplay/combat.md) | done |
| `mvp-economy` | Oro + costos | Por jugador; syncado | [economy.md](../gameplay/economy.md) | done |
| `mvp-lives` | Vidas / leak | Leak resta vidas al dueño del lane/path | [economy.md](../gameplay/economy.md) | done |
| `mvp-winlose` | Win / lose multi | Last standing (0 vidas) | [overview.md](../multiplayer/overview.md) | done |

### UI mínima

| ID | Feature | Criterio de listo | Doc | Estado |
|----|---------|-------------------|-----|--------|
| `mvp-ui-lobby` | UI lobby | Crear/unir, lista de players, ready | [screens.md](../ui/screens.md) | done |
| `mvp-hud` | HUD partida | Oro, vidas, ola, send points, rival vivo | idem | done |
| `mvp-build-ui` | Build / upgrade / sell | Jugable con mouse | idem | done |
| `mvp-send-ui` | Panel send | 2–4 sends comprables + feedback incoming | [send.md](../multiplayer/send.md) | done |
| `mvp-range` | Preview de range | Al seleccionar/colocar | idem | partial |
| `mvp-end` | End screen multi | Resultados + rematch/leave | idem | done |

### Contenido MVP

| ID | Feature | Criterio de listo | Doc | Estado |
|----|---------|-------------------|-----|--------|
| `mvp-map-01` | 1 mapa multi | 2 laberintos grilla por jugador | [maps.md](../content/maps.md) | done |
| `mvp-mode-classic` | Classic multi | Reglas estables en room | [classic.md](../modes/classic.md) | done |

## Explícitamente fuera del MVP

| Feature | Por qué sale | Va a |
|---------|--------------|------|
| Ranked / ELO | Necesita población y anti-cheat liviano | later |
| Matchmaking por skill | Room code alcanza | later |
| Coop mismo path (B) | No es el fantasy A+C | later |
| 3–4 jugadores | Balance de sends más complejo | later |
| Leak = send automático | Death spiral opaco; solo send manual en MVP | later |
| Modo random | Roster estable primero | backlog |
| Editor de mapas | Herramienta, no juego | later |
| Meta unlocks | Persistencia de cuenta | later |
| Interest entre olas | Nice-to-have | next |
| Status effects avanzados | Balance + sync extra | next |
| Múltiples mapas | Un mapa multi alcanza | next |
| Cliente mobile nativo | Misma API después | later |

## Números objetivo (cerrados)

| Parámetro | Objetivo |
|-----------|----------|
| Jugadores por room | **2 (1v1)** |
| Duración de partida | **~8 min** |
| Vidas iniciales | **20** |
| Oro inicial | **200** |
| Send points iniciales | **80** |
| Torres distintas | **5** |
| Sends distintos | **4** |
| Olas | **10** |
| Mapa | 1 multi espejo (`line_01`) |
| Variante multi | **A + C** (lanes + send) |
| Perspectiva | **Top-down ortogonal** |
| Combate | **Hitscan** |
| Tick rate server | **20 Hz** |
| Control de olas | **Auto-start con countdown** |

## Orden de implementación sugerido

1. Monorepo `shared` + `server` Colyseus + `client` Phaser vacío  
2. Room 1v1: join/lobby/ready  
3. Simulación: **2 lanes** espejo + creeps + leak  
4. Place tower autoritativo por lane  
5. Combat + gold + waves espejo  
6. **Send system** + UI  
7. Win last-standing + reconnect + results + roster  
