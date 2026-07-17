# Multijugador — overview

> **Estado:** aprobado  
> Stack → [../core/stack.md](../core/stack.md) · MVP → [../roadmap/mvp.md](../roadmap/mvp.md)  
> Send → [send.md](./send.md) · Balance → [../balance/mvp-values.md](../balance/mvp-values.md)

## Principio de producto

El multijugador online **no es post-MVP**: es la forma principal de jugar Linet.  
Una partida MVP = jugadores en una **room** Colyseus, cada uno en su lane, enviándose presión (sends).

## Variante MVP: A + C

| Pieza | Decisión |
|-------|----------|
| **A) Lanes paralelos** | Cada jugador tiene su **path** y sus **build slots**. Olas base iguales / espejo. |
| **C) Send** | Matar (o gastar income) permite **enviar creeps al lane del rival**. |
| **B) Coop** | Fuera del MVP → backlog |

### Fantasía de partida

1. Defendés tu línea.
2. Clear eficiente → income / send charge.
3. Mandás creeps al rival para romperle el timing.
4. Quien se queda sin vidas pierde (last standing). Empate: ver tie-break abajo.

### Jugadores

- MVP target: **2 jugadores** (1v1).  
- 3–4 (FFA / 2v2): post-MVP (más balance de sends).

## Autoridad

```
Cliente (Phaser)          Servidor (Colyseus room)
───────────────          ────────────────────────
input → Intent    ──►    valida + aplica a simulación
render ← State    ◄──    tick simulación, broadcast patch
```

- El servidor es **source of truth** (oro, HP, kills, place/upgrade, **sends**).
- El cliente puede hacer feedback optimista leve pero debe reconciliar con el state.

## Room flow (MVP)

```
menu → create/join lobby → ready → playing → won/lost → rematch/leave
```

| Pieza | Criterio de listo |
|-------|-------------------|
| Create / Join room | Código o link corto (1v1) |
| Lobby | 2 players, ready, host start |
| Lanes | Cada uno ve/juega su path; rival visible (overview o panel) |
| Sends | Enviar creeps válidos al lane rival |
| Sync | Mismo tick; leaks/sends consistentes |
| Disconnect | Reconexión en ventana X segundos |
| End | Resultados + rematch/leave |

## Intents de red (MVP)

```
JoinRoom / LeaveRoom
SetReady
PlaceTower { slotId, towerId }
UpgradeTower { towerInstanceId }
SellTower { towerInstanceId }
SendCreeps { sendId, targetPlayerId? }   # ver send.md
StartNextWave { }     # si el modo lo permite
```

## Fuera del multi MVP

- Ranked / ELO
- Matchmaking por skill (room code alcanza)
- Coop mismo path (variante B)
- 3–4 jugadores
- Spectators
- Cliente mobile nativo

## Tie-break

Si ambos jugadores llegan a 0 vidas en el mismo tick server:

1. Vidas restantes justo antes del leak fatal (si difieren).
2. Menor cantidad de leaks totales acumulados.
3. Mayor oro acumulado.
4. Si persisten: **sudden death** — 1 vida + ola especial hasta que alguien leak.

## Reglas de desconexión

- **Ventana corta:** Colyseus permite rejoin durante ~30 s. La partida se congela visualmente para el desconectado; el otro jugador ve “rival desconectado”.
- **Si no vuelve:** el jugador conectado gana por forfeit; el desconectado pierde.
- **Host migration:** no aplica en MVP. Colyseus server es la autoridad; el “host” del lobby solo puede iniciar la partida, no posee estado.

## Pause

- **No hay pausa en multiplayer.** El countdown entre olas es la única pausa programada.

## Bots / offline

- Fuera del MVP. Post-MVP se evalúa un bot básico para practicar sends en una room de 1.
