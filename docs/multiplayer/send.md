# Send / income (variante C)

> **Estado:** aprobado  
> Overview multi → [overview.md](./overview.md) · Economía → [../gameplay/economy.md](../gameplay/economy.md) · Balance → [../balance/mvp-values.md](../balance/mvp-values.md) · ADR 0003 → [../decisions/0003-economia-dual.md](../decisions/0003-economia-dual.md)

## Idea

Además de la ola **compartida/espejo** que spawnea el server en cada lane, los jugadores pueden **enviar creeps extras al path del rival**.  
Eso convierte defensa buena en presión ofensiva (fantasía Line TD / custom WC3).

## Modelo propuesto (MVP)

### Dual currency (MVP)

| Recurso | Para qué | Cómo se gana |
|---------|----------|--------------|
| **Gold** | Torres / upgrades / sell | Kills |
| **Send points** (SP) | Comprar envíos al rival | Kills (50% del gold reward), clear de ola (**+28 SP**), pasivo (**+3 SP/s**); start **100 SP** |

**Decisión:** `gold + send points` — ver ADR 0003. Esto evita vaciar defensa al atacar y permite balancear sends por separado.

### Catálogo de sends (MVP)

| id | Creeps enviados | Costo SP | Min wave | Cooldown |
|----|-----------------|----------|----------|----------|
| `send_swarm` | 5× grub | 15 | 1 | 4 s |
| `send_fast` | 3× runner | 28 | 2 | 5 s |
| `send_mix` | 3× grub + 2× runner | 40 | 3 | 6 s |
| `send_tank` | 1× brute | 50 | 3 | 6.5 s |
| `send_boss` | 1× shade + 2× brute | 95 | 5 | 10 s |

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

## Reglas de send (cerradas)

1. Solo podés enviar al **rival** (1v1 MVP).
2. Los creeps enviados spawnean en la **cola del spawn del lane rival**.
3. Leak de un creep enviado: resta vidas al **defensor**.
4. Kill de un creep enviado: gold + SP para el **defensor**.
5. No podés enviar si el rival ya está eliminado.
6. Cooldown por `SendDef` para evitar flood.
7. Los sends **no** cuentan para el clear de ola del rival; son independientes de la wave clock.

## Open questions

1. ¿Cap de creeps vivos por lane (anti-lag / anti-flood)?
2. ¿Bots para practicar sends en room de 1?

Respuesta tentativa: no hay cap en MVP; se mide en playtests. Bots: post-MVP.
