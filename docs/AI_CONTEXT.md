# AI Context — Linet

Documento de contexto vivo para agentes de código. Acá va el estado actual del proyecto, deuda técnica abierta y próximas acciones, para no tener que re-descubrir todo en cada sesión.

## Estado general

- **Fase actual:** MVP cerrado; presentación modernizada.
- **Branch activo:** `master`
- **Últimos PRs:**
  - PR #2 `refactor/ui-polish` — HUD, build/send bars, tower panel.
  - PR #5 `feat/maze-scale-path-sends` — maze 14×17, cámara RTS, sprites PNG, terreno, sends agresivos.
  - PR #6 `polish/mvp-feedback-and-ui-fixes` — slow visual, overlays reconnect, refactor `UIFactory.createButton`, emoji fonts, roadmap actualizado.

## Features MVP — estado real

| ID | Feature | Estado | Notas |
|----|---------|--------|-------|
| `path-system` | Grilla + A* + leak | done | Sin sellar path. |
| `build-slots` | Place en celdas | done | Ownership por lane. |
| `tower-place-sell` | Place / sell | done | |
| `tower-upgrades` | Upgrades L1→L3 | done | |
| `combat-basic` | Daño, HP, kills | done | Hitscan. |
| `status-slow` | Slow | done | Torre frost; feedback visual azul en cliente. |
| `combat-armor` | Armor / resists | done | Fórmula en shared/combat. |
| `boss-waves` | Olas boss | done | Olas 7 y 10. |
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
| `mp-reconnect` | Reconnect corto | done | 30 s con `allowReconnection` + overlays cliente. |
| `mp-solo-bot` | Práctica vs bot | done | Solo test, no ranked. |
| `mp-results` | Resultados / rematch | done | |
| `mode-classic` | Classic multi | done | |
| `ui-lobby` | UI lobby | done | |
| `ui-hud` | HUD partida | done | HUD fijo, cámara UI, rival connected. |
| `ui-send-panel` | Panel sends | done | disabled SP/CD/minWave. |
| `ui-build-bar` | Barra torres | done | |
| `ui-hotkeys` | Hotkeys | done | U / S / ESC. |
| `tech-sim-render-split` | Sim ≠ render | done | |
| `tech-stack-phaser-colyseus` | Stack | done | |
| `tech-content-data` | Data-driven | done | |
| `rts-camera` | Cámara RTS | done | Pan/zoom, foco mi mapa/rival/overview. |
| `sprites-towers-creeps` | Sprites PNG | done | idle/attack/walk + sombras + depth por Y. |
| `terrain-procedural` | Terreno | done | grass/dirt/meadow/scrub procedural. |

## Bugs / deuda técnica abierta

- [ ] `tower-targeting` — solo `first` hoy.
- [ ] `economy-interest` — interés entre olas.
- [ ] `wave-manual-start` — botón Next wave.
- [ ] `ui-settings` — Opciones (audio, fullscreen).

## Próximas acciones planificadas

1. **Post-MVP inmediato:** `tower-targeting` (agregar selector First/Last/Strongest/Closest en panel de torre).
2. **Post-MVP:** `economy-interest` → `wave-manual-start`.
3. **Técnicos:** tests de cliente, CI básico.

## Notas de sesión

- El slow ya funcionaba en servidor; se agregó tinte azul al sprite de creep en cliente.
- Se agregaron overlays de "RECONNECTING…" y "ESPERANDO A RIVAL…".
- Se refactorizó `UIFactory.createButton` para exponer `{ container, bg, text }` y se actualizó `setButtonDisabled`.
- Se agregó fallback de emoji fonts para iconos del HUD.
- Se actualizó `docs/roadmap/features.md` con estados `done` post-MVP.
