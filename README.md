# Linet

**Line Tower Wars** multijugador 1v1 (laberintos + sends), inspirado en mapas de Warcraft III.

## Stack

- TypeScript monorepo (`pnpm`)
- Cliente: Phaser 3 + Vite
- Servidor: Colyseus + Node
- Simulación shared autoritativa a 20 Hz

## Para agentes / contribuidores

Empezá por [`AGENTS.md`](./AGENTS.md) (mapa del repo + reglas duras).  
Diseño: [`docs/README.md`](./docs/README.md).

## Desarrollo

```bash
pnpm install
pnpm dev
```

- Cliente: http://localhost:5173  
- Servidor: ws://localhost:2567  

Abrí dos pestañas → crear/unirse con el mismo código → Ready → Start (host).  
O usá **Jugar solo (test)** para un bot pasivo.

## Packages

```
packages/shared   simulación + content + tipos
packages/server   Colyseus GameRoom
packages/client   Phaser UI (scenes/)
content/          defs JSON (espejo de shared content)
docs/             diseño (español)
```
