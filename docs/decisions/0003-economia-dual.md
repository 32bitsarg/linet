# ADR 0003: Economía dual (gold + send points)

> **Estado:** aceptado  
> **Fecha:** 2026-07-17

## Contexto

El MVP de Linet es 1v1 online con **sends** de creeps al rival. Necesitamos decidir si los envíos se pagan con el mismo oro que se usa para torres (`gold-only`) o con una currency separada (`send points`).

## Opciones consideradas

### A) Gold-only

- Todos los costos (torres, upgrades, sends) salen del mismo pool de oro.

**Pros:**
- Sistema más simple de entender y programar.
- Un solo número en el HUD.

**Contras:**
- Atacar directamente debilita la defensa, lo que puede sentirse punitivo.
- Balance frágil: si los sends son baratos, se spamean; si son caros, nadie ataca.
- Menos tensión estratégica entre invertir en defensa vs presión.

### B) Dual currency (gold + send points)

- **Gold:** place, upgrade, sell de torres.
- **Send points (SP):** comprar envíos al rival.
- SP se gana por kills, clear de ola y pasivamente.

**Pros:**
- Permite atacar sin sacrificar la defensa.
- Balancea sends por separado del balance de torres.
- Más cercano a la fantasía de Line TD / custom WC3.
- Genera decisiones interesantes: ¿gastar SP ahora o acumular para un boss send?

**Contras:**
- Un recurso más en el HUD y en la simulación.
- Necesita una fórmula de income de SP clara.

## Decisión

Adoptar **dual currency** para el MVP.

- Gold inicial: 200.
- Send points iniciales: 80.
- SP por kill: 50% del gold reward del creep.
- SP por clear de ola: 20.
- SP pasivo: 2/s.

## Consecuencias

- `EconomySystem` maneja dos balances por jugador.
- El HUD muestra oro y SP.
- `SendSystem` valida costos en SP, no en gold.
- Place/upgrade/sell validan gold.
- La separación permite iterar balance de sends sin tocar economía de torres.

## Links

- [../gameplay/economy.md](../gameplay/economy.md)
- [../multiplayer/send.md](../multiplayer/send.md)
- [../balance/mvp-values.md](../balance/mvp-values.md)
