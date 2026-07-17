# Send / income (variante C)

> **Estado:** borrador  
> Overview multi → [overview.md](./overview.md) · Economía → [../gameplay/economy.md](../gameplay/economy.md)

## Idea

Además de la ola **compartida/espejo** que spawnea el server en cada lane, los jugadores pueden **enviar creeps extras al path del rival**.  
Eso convierte defensa buena en presión ofensiva (fantasía Line TD / custom WC3).

## Modelo propuesto (MVP)

### Dual currency (simple)

| Recurso | Para qué | Cómo se gana |
|---------|----------|--------------|
| **Gold** | Torres / upgrades / sell | Kills, fin de ola, (interés post-MVP) |
| **Send points** (o “income”) | Comprar envíos al rival | Por kill, por ola clear, o income pasivo por tick/ola |

Alternativa más chica: **solo gold** y los sends se compran con oro.  
**Preferencia MVP:** _TBD — gold-only vs gold + send points_.  
Recomendación: **gold + send points** para no vaciar defensa al atacar.

### Catálogo de sends (borrador)

| id | Qué envía | Costo (send pts) | Notas |
|----|-----------|------------------|-------|
| `send_swarm` | N creeps swarm | bajo | spam early |
| `send_tank` | 1 tank | medio | fuerza single-target |
| `send_fast` | N runners | medio | stress + leaks |
| `send_boss` | mini-boss | alto / unlock late | 1–2 por partida |

Los creeps de send usan defs del [creep-roster](../content/creep-roster.md) con tag `sendable` o un `SendDef` que referencia `creepId`.

### SendDef (schema mental)

```
SendDef {
  id: string
  creepId: string
  count: number
  costSendPoints: number
  minWave?: number          # unlock por ola
  cooldownMs?: number       # anti-spam
}
```

## Reglas

1. Solo podés enviar al **rival** (1v1 MVP).
2. Los creeps enviados spawnean en el **spawn del lane rival** (o cola de spawn).
3. Leak de un creep enviado: resta vidas al **defensor** (el que recibió el send), no al emisor.
4. Kill de un creep enviado: oro/send points para el **defensor** (incentiva clear).
5. No podés enviar si el rival ya está eliminado.
6. Cooldown global o por `SendDef` para evitar flood en un frame.

## Leak vs send (no confundir)

| Evento | Efecto |
|--------|--------|
| Creep de ola/send llega al exit | Defensor pierde vidas |
| ¿Leak genera send automático al rival? | **No en MVP** (evita death spiral opaco). Solo sends **manuales** comprados. |

Si más adelante queremos “leak = dump al rival”, va a backlog con mucho cuidado de balance.

## Victoria

- **Last standing:** a 0 vidas → eliminado; el otro gana.
- Si ambos a 0 en el mismo tick server → tie-break: menos leaks totales / más oro / sudden death — _elegir_.

## UI mínima

- Panel “Send” con 2–4 botones + costo en send points.
- Feedback en el lane rival: banner “Incoming send”.
- Contador de send points junto al oro.

## Open questions

1. Gold-only vs dual currency.
2. ¿Income pasivo por segundo o solo por kill/ola?
3. ¿Cap de creeps vivos por lane (anti-lag / anti-flood)?
4. ¿Los sends cuentan para “fin de ola” del rival o son independientes de la wave clock?
