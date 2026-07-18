# AI Context — Linet

Documento de contexto vivo para agentes de código. Acá va el estado actual del proyecto, deuda técnica abierta y próximas acciones, para no tener que re-descubrir todo en cada sesión.

## Estado general

- **Fase actual:** MVP casi cerrado, en polish.
- **Branch activo:** `polish/mvp-feedback-and-ui-fixes`
- **Última sesión:** revisión del PR #2 (`refactor/ui-polish`) + plan de polish MVP.

## Features MVP — estado real

| ID | Feature | Estado | Notas |
|----|---------|--------|-------|
| `path-system` | Grilla + A* + leak | done | Sin sellar path. |
| `build-slots` | Place en celdas | done | Ownership por lane. |
| `tower-place-sell` | Place / sell | done | |
| `tower-upgrades` | Upgrades L1→L3 | done | |
| `combat-basic` | Daño, HP, kills | done | Hitscan. |
| `status-slow` | Slow | done | Simulación funcional; feedback visual azul en cliente (esta sesión). |
| `aoe-splash` | Daño en área | done | Torre Cannon. |
| `economy-gold` | Oro + rewards | done | |
| `lives-system` | Vidas por leak | done | |
| `wave-system` | Olas fijas | done | 10 olas, auto-start. |
| `win-lose` | Fin de partida | done | Last standing + rematch. |
| `roster-towers-mvp` | 5 torres | done | Archer, Cannon, Frost, Sniper, Mage. |
| `roster-creeps-mvp` | 5 creeps | done | Grub, Runner, Brute, Shade, Boss. |
| `map-line-01` | Mapa espejo | done | `line_01`. |
| `mp-rooms` | Create / join | done | Código de 5 caracteres. |
| `mp-lobby` | Lobby + ready | done | |
| `mp-lanes` | Lanes paralelos | done | |
| `mp-send` | Sends al rival | done | 4 sends. |
| `mp-authority` | Sim en servidor | done | |
| `mp-sync` | State sync | done | Snapshot 20 Hz. |
| `mp-reconnect` | Reconnect corto | done | 30 s con `allowReconnection` + overlays (esta sesión). |
| `mp-results` | Resultados / rematch | done | |
| `mode-classic` | Classic multi | done | |
| `ui-lobby` | UI lobby | done | |
| `ui-hud` | HUD partida | done | |
| `ui-send-panel` | Panel sends | done | |
| `ui-build-bar` | Barra torres | done | |
| `tech-sim-render-split` | Sim ≠ render | done | |
| `tech-stack-phaser-colyseus` | Stack | done | |
| `tech-content-data` | Data-driven | done | |

## Bugs / deuda técnica abierta

- [ ] `tower-targeting` — solo `first` hoy.
- [ ] `economy-interest` — interés entre olas.
- [ ] `wave-manual-start` — botón Next wave.
- [ ] `boss-waves` — boss a mitad/final.
- [ ] `ui-hotkeys` — U, S, ESC existen; faltan más.
- [ ] `combat-armor` — sistema de armor/resists más visible.

## Próximas acciones planificadas

1. **Post-MVP inmediato:** `tower-targeting` (agregar selector en panel de torre).
2. **Post-MVP:** `economy-interest` → `wave-manual-start`.
3. **Técnicos:** tests de cliente, CI básico.

## Notas de sesión

- El slow ya funcionaba en servidor; se agregó tinte azul al creep en cliente.
- Se agregaron overlays de "Reconectando…" y "Esperando rival…".
- Se refactorizó `UIFactory.createButton` para exponer `bg` y evitar accesos frágiles a `container.list[0]`.
- Se agregó fallback de emoji fonts para iconos del HUD.
