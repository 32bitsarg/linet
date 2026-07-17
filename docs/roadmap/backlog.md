# Backlog — próximas features

> **Estado:** borrador  
> Solo sale de acá lo que **no** está en el MVP.  
> Catálogo completo → [features.md](./features.md)

## Prioridad `next` (justo después del MVP)

Orden tentativo — reordenar cuando el MVP esté jugable.

| Prioridad | ID | Feature | Por qué ahora | Depende de |
|-----------|----|---------|---------------|------------|
| 1 | `status-slow` | Torre / efecto slow | Hace falta para builds interesantes | combat + 1 torre frost |
| 2 | `tower-targeting` | Cambiar targeting | Control fino sin nuevo contenido | UI panel torre |
| 3 | `economy-interest` | Interés entre olas | Tensión económica clásica Line TD | economy estable |
| 4 | `wave-manual-start` | Next wave manual | Agencia + farming de interés | waves + UI |
| 5 | `boss-waves` | Boss a mitad/final | Picos de drama | creeps + combat |
| 6 | `combat-armor` | Armor / resists | Fuerza diversidad de daño | fórmulas en combat.md |
| 7 | `ui-hotkeys` | Hotkeys | UX de partida larga | build UI |
| 8 | `ui-settings` | Opciones | Audio / fullscreen básico | menú |

## Prioridad `later` (deseable, sin fecha)

| ID | Feature | Notas |
|----|---------|-------|
| `mode-random` | Modo random/draft | Cuando el roster sea ≥8–10 torres |
| `mode-endless` | Endless | Necesita escalado de olas |
| `map-second` | Segundo mapa | Variar curvatura / densidad de slots |
| `flying-creeps` | Aéreos + anti-air | Cambia targeting y roster |
| `status-dot` | DoTs | Balance + VFX |
| `meta-unlocks` | Unlocks persistentes | Cuenta / save global |
| `meta-ranking` | Ranking | Backend o leaderboard local |
| `mp-local` | Multi local | Hotseat o split — definir |
| `mp-online` | Multi online | Gran ADR aparte |
| `tool-map-editor` | Editor | Después de MapDef estable |
| `tech-save-run` | Save mid-run | Nice para sesiones largas |

## Ideas crudas (`idea`)

Anotá acá sin compromiso. Si sobrevive, promové a `later`/`next` en [features.md](./features.md).

- [ ] Torres de soporte con auras
- [ ] Fusión de torres
- [ ] Desafíos diarios
- [ ] Replay / ghost de partida
- [ ] _…_

## Descarta (`cut`)

Cosas que miramos y dijimos que no (para no reabrir el tema cada semana).

| Feature | Motivo | Fecha |
|---------|--------|-------|
| _ej. maze building libre_ | Rompe el pillar Line TD | |

## Ritual

Al terminar el MVP (o un corte):

1. Revisá esta lista con lo aprendido al jugar.
2. Mové 3–5 ítems a un “Sprint / corte N” concreto.
3. Actualizá estados en [features.md](./features.md).
