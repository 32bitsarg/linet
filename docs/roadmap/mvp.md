# MVP — Primera versión jugable

> **Estado:** borrador  
> Visión → [../vision/producto.md](../vision/producto.md)  
> Features → [features.md](./features.md)  
> Multi → [../multiplayer/overview.md](../multiplayer/overview.md)

## Definición de “MVP listo”

Podés crear/entrar a una **room online** y completar una partida multijugador:

1. Create / join lobby (código o link).
2. Todos ready → partida.
3. Cada jugador coloca / upgradea / vende torres en **su** lane (slots propios).
4. Olas espejo + **sends** al rival (variante **A + C**).
5. Simulación **autoritativa en servidor**.
6. Last standing (0 vidas = out) → resultados → lobby/menú.
7. Reconexión básica si alguien se cae unos segundos.

Sin meta-progresión, sin editor, sin ranked, sin coop (B).

## Pillar del MVP

| Pilar | Implicancia |
|-------|-------------|
| **Multijugador online 1v1** | Colyseus rooms + WebSockets |
| **A + C** | Lanes paralelos + send de creeps al rival |
| Line TD jugable | Path, torres, olas, economía, vidas |
| Web | Phaser 3 en browser |

## Checklist MVP

### Multijugador (principal)

| ID | Feature | Criterio de listo | Doc | Estado |
|----|---------|-------------------|-----|--------|
| `mvp-mp-rooms` | Create / join room | 2+ jugadores entran con código/link | [overview.md](../multiplayer/overview.md) | mvp |
| `mvp-mp-lobby` | Lobby + ready | La partida no arranca hasta ready (o host start) | idem | mvp |
| `mvp-mp-authority` | Simulación en server | Cliente no puede spawnear oro/kills a dedo | [arquitectura.md](../core/arquitectura.md) | mvp |
| `mvp-mp-sync` | State sync | Todos ven el mismo resultado de ola/leaks | idem | mvp |
| `mvp-mp-reconnect` | Reconnect corto | Rejoin en ventana X s sin romper la room | Colyseus | mvp |
| `mvp-mp-results` | Resultados | Pantalla final + rematch/leave | [screens.md](../ui/screens.md) | mvp |
| `mvp-mp-lanes` | Lanes paralelos (A) | 2 paths espejo; slots por jugador | [overview.md](../multiplayer/overview.md) | mvp |
| `mvp-mp-send` | Send al rival (C) | Comprar y spawnear creeps en lane rival | [send.md](../multiplayer/send.md) | mvp |

### Core jugable

| ID | Feature | Criterio de listo | Doc | Estado |
|----|---------|-------------------|-----|--------|
| `mvp-path` | Path + spawn/exit | Creeps recorren waypoints y leakean | [path.md](../gameplay/path.md) | mvp |
| `mvp-slots` | Build slots (por jugador) | Place/sell; ownership de slot | [path.md](../gameplay/path.md) | mvp |
| `mvp-towers` | 4–6 torres base | Roles distintos, stats jugables | [tower-roster.md](../content/tower-roster.md) | mvp |
| `mvp-upgrades` | Upgrades lineales | L1→L2→L3 por torre MVP | [towers.md](../gameplay/towers.md) | mvp |
| `mvp-creeps` | Roster de creeps | ≥4 tipos | [creep-roster.md](../content/creep-roster.md) | mvp |
| `mvp-waves` | 8–12 olas fijas | Early→mid→late | [waves.md](../gameplay/waves.md) | mvp |
| `mvp-combat` | Daño + targeting | First-target; kills en server | [combat.md](../gameplay/combat.md) | mvp |
| `mvp-economy` | Oro + costos | Por jugador; syncado | [economy.md](../gameplay/economy.md) | mvp |
| `mvp-lives` | Vidas / leak | Leak resta vidas al dueño del lane/path | [economy.md](../gameplay/economy.md) | mvp |
| `mvp-winlose` | Win / lose multi | Last standing (0 vidas) | [overview.md](../multiplayer/overview.md) | mvp |

### UI mínima

| ID | Feature | Criterio de listo | Doc | Estado |
|----|---------|-------------------|-----|--------|
| `mvp-ui-lobby` | UI lobby | Crear/unir, lista de players, ready | [screens.md](../ui/screens.md) | mvp |
| `mvp-hud` | HUD partida | Oro, vidas, ola, send points, rival vivo | idem | mvp |
| `mvp-build-ui` | Build / upgrade / sell | Jugable con mouse | idem | mvp |
| `mvp-send-ui` | Panel send | 2–4 sends comprables + feedback incoming | [send.md](../multiplayer/send.md) | mvp |
| `mvp-range` | Preview de range | Al seleccionar/colocar | idem | mvp |
| `mvp-end` | End screen multi | Resultados + rematch/leave | idem | mvp |

### Contenido MVP

| ID | Feature | Criterio de listo | Doc | Estado |
|----|---------|-------------------|-----|--------|
| `mvp-map-01` | 1 mapa multi | Path(s) + slots por jugador | [maps.md](../content/maps.md) | mvp |
| `mvp-mode-classic` | Classic multi | Reglas estables en room | [classic.md](../modes/classic.md) | mvp |

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

## Números objetivo (rellenar)

| Parámetro | Objetivo |
|-----------|----------|
| Jugadores por room | **2 (1v1)** |
| Duración de partida | ~__ min |
| Vidas iniciales | __ |
| Oro inicial | __ |
| Send points iniciales | __ |
| Torres distintas | 4–6 |
| Sends distintos | 2–4 |
| Olas | 8–12 |
| Mapa | 1 multi espejo (`line_01`) |
| Variante multi | **A + C** (lanes + send) |

## Orden de implementación sugerido

1. Monorepo `shared` + `server` Colyseus + `client` Phaser vacío  
2. Room 1v1: join/lobby/ready  
3. Simulación: **2 lanes** espejo + creeps + leak  
4. Place tower autoritativo por lane  
5. Combat + gold + waves espejo  
6. **Send system** + UI  
7. Win last-standing + reconnect + results + roster  
