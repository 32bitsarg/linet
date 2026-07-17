# Economía

> **Estado:** aprobado  
> Balance → [../balance/mvp-values.md](../balance/mvp-values.md) · ADR 0003 → [../decisions/0003-economia-dual.md](../decisions/0003-economia-dual.md)

## Fuentes de recursos

| Recurso | Fuente | Regla |
|---------|--------|-------|
| Gold | Kill | Oro base del creep escalado por ola |
| Gold | Venta de torre | 70% del valor invertido (redondeado hacia abajo) |
| Send points | Kill | 50% del gold reward del creep |
| Send points | Clear de ola | +20 SP al clear |
| Send points | Pasivo | +2 SP/s durante la partida |
| Interés (gold) | Entre olas | **post-MVP** |

## Costos

| Recurso | Usado en |
|---------|----------|
| Gold | Place / upgrade / sell de torres |
| Send points | Enviar creeps al rival (ver [send.md](../multiplayer/send.md)) |

## Leak

Cuando un creep (ola o send) llega al exit del **defensor**:

- Resta vidas al dueño de ese lane (`leakDamage` del creep).
- **No** genera send automático al rival en MVP.

## Parámetros iniciales (MVP)

| Parámetro | Valor |
|-----------|-------|
| Oro inicial | 200 |
| Send points iniciales | 80 |
| Vidas iniciales | 20 |
| Refund por venta | 70% |
| SP por kill | 50% del gold reward |
| SP por clear | 20 |
| SP pasivo | 2/s |

## Sensación deseada

- **Early:** se puede colocar 2–3 torres baratas.
- **Mid:** hay que elegir upgrade vs nueva torre; los primeros sends aparecen.
- **Late:** composición y sinergias importan más que spamear; los sends presionan fuerte.
