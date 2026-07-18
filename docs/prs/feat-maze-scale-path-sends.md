# PR — `feat/maze-scale-path-sends`

> **Estado:** en revisión (working tree; aún sin merge)  
> Rama: `feat/maze-scale-path-sends`  
> Objetivo: mazes más altos estilo WC3, sends más agresivos, cámara RTS, presentación 2.5D + terreno texturizado, y fixes de sync en práctica/solo.

## Resumen ejecutivo

Este cambio acerca Linet a la fantasía **Line Tower Wars** (maze craft largo + presión de sends) y moderniza la **presentación cliente** (cámara tipo RTS, HUD fijo, terreno procedural). La simulación sigue siendo autoritativa en `@linet/shared`; el cliente solo renderiza e envía intents.

### Qué gana el jugador

| Área | Antes (aprox.) | Ahora |
|------|----------------|-------|
| Maze | Grilla chica (históricamente 12×14 / luego 16×18) | **16×23**, `cellSize` 28 |
| Sends | Menos presión | Costos/CDs más bajos, `send_mix`, SP más generoso |
| Vista | Mapa fijo 1280×720, ambas lanes siempre a la vista | **Cámara RTS**: pan/zoom, foco mi mapa / rival / overview |
| HUD | Barra superior ancha; se movía con bugs de cámara | **HUD fijo** (cámara UI) + layout en `RESIZE` |
| Terreno | Colores planos | **Grass + dirt** en grilla; **meadow/scrub** de fondo |
| Torres/creeps | Sprites flat | **2.5D ligero** (sombra, altura, depth por Y) |
| Práctica vs bot | A veces no sincronizaba en DEV | `requestSync` + WS a `:2567` en DEV |

---

## Alcance por capa

### 1. Shared / contenido (reglas + data)

- Mapa `line_01` más alto → más filas de craft.
- Economía SP y catálogo de sends más agresivos.
- Tests de sim actualizados si aplica.

### 2. Server

- Mensaje `sync` para reenviar snapshot cuando el cliente lo pide (lobby/partida).

### 3. Client (presentación)

- Phaser `Scale.RESIZE` (sin letterbox negro).
- `RtsCameraController` + cámara HUD transparente.
- Texturas procedurales + mezcla en piso/fondo.
- Polish de UI de partida (dock, chips, labels IN/OUT, ghost path).

### 4. Docs

- Mapas / path / sends / UI / arquitectura / este dossier.

---

## Archivos — qué hace cada uno y por qué

### Shared (sim + content)

| Archivo | Qué hace | Por qué |
|---------|----------|---------|
| `packages/shared/src/content/data/map.ts` | Define `MAP` / `line_01`: 2 lanes 16×23, cell 28, origins `(48,34)` y `(784,34)`, exitRow 22 | Más altura de maze dentro de 1280×720 lógico; sim y cliente leen la misma def |
| `content/maps/line_01.json` | Espejo humano del mapa | Convención del repo: content JSON sync con shared |
| `packages/shared/src/content/data/sends.ts` | Catálogo de sends (costos, CDs, counts, `send_mix`, etc.) | Más presión ofensiva; balance “tanteo” alineado a WC3-feel |
| `content/sends.json` | Espejo de sends | Idem |
| `packages/shared/src/constants.ts` | SP inicial **100**, pasivo **+3/s**, clear **+28** | Soporta sends más frecuentes sin vaciar defensa al inicio |
| `packages/shared/src/sim/Simulation.test.ts` | Tests de sim ajustados a nuevas constants/mapa | No romper CI / regressiones de place/path |

### Server

| Archivo | Qué hace | Por qué |
|---------|----------|---------|
| `packages/server/src/GameRoom.ts` | Handler `sync` → manda snapshot actual al requester | Tras conectar/`onState`, el cliente puede pedir estado fresco (fixía práctica vs bot / HMR) |

### Client — entry & red

| Archivo | Qué hace | Por qué |
|---------|----------|---------|
| `packages/client/src/main.ts` | Crea `Phaser.Game` con tamaño de ventana y `Scale.RESIZE` | Canvas llena el parent → **sin franjas negras** de letterbox; el HUD se relayouta |
| `packages/client/index.html` | `#game` 100% ancho/alto, fondo `#0a100c` | El área alrededor del canvas (si hubiera) no se ve “negra vacía” |
| `packages/client/src/net.ts` | DEV → `http://localhost:2567`; `requestSync()` | Vite (`:5173`) no es el WS; sin esto el cliente apuntaba mal y la práctica “no hacía nada” |
| `packages/client/vite.config.ts` | (ajustes de proxy/dev si aplica en el branch) | Dev ergonomics cliente↔server |

### Client — cámara y FX (nuevos)

| Archivo | Qué hace | Por qué |
|---------|----------|---------|
| `packages/client/src/camera/RtsCamera.ts` | Controlador de cámara mundo: WASD/flechas, edge pan, rueda, click medio, bounds con **padding**, `minZoom` tipo **cover**, foco lane / overview / center-only | Fantasía RTS: mirar tu maze o el rival sin perder el mapa; padding permite **centrar tu línea con o sin zoom** |
| `packages/client/src/fx/groundTextures.ts` | Genera texturas procedurales: `tex_grass`, `tex_dirt`, `tex_meadow`, `tex_scrub` + `cellNoise` | No hay art pipeline aún; procedural mantiene el repo liviano y da terreno legible |

### Client — escenas

| Archivo | Qué hace | Por qué |
|---------|----------|---------|
| `packages/client/src/scenes/BootScene.ts` | Llama `generateGroundTextures()` y arranca menú | Las texturas deben existir **antes** de `GameScene` |
| `packages/client/src/scenes/GameScene.ts` | Partida: terreno mundo, grillas texturizadas, ghost path, torres 2.5D, creeps+barras, HUD dual-camera, dock torres/sends, hotkeys cámara (`Q`/`E`/`Space`/…) | Única escena de gameplay; concentra presentación. **No** decide rules (solo intents) |
| `packages/client/src/scenes/LobbyScene.ts` | (sync/`requestSync` u otros tweaks del branch) | Misma familia de fixes de estado al entrar |

### Docs tocados / nuevos

| Archivo | Rol |
|---------|-----|
| `docs/prs/feat-maze-scale-path-sends.md` | **Este dossier** — alcance PR + mapa de archivos |
| `docs/ui/camera-and-terrain.md` | Diseño de cámara RTS, HUD fijo, 2.5D, texturas |
| `docs/content/maps.md` | Spec mapa 16×23 |
| `docs/gameplay/path.md` | Path + ghost + tamaño maze |
| `docs/ui/screens.md` | HUD / controles cámara |
| `docs/multiplayer/send.md` | Números SP / catálogo |
| `docs/core/arquitectura.md` | Paths `camera/` y `fx/` |
| `docs/core/stack.md` | Nota RESIZE + presentación |
| `AGENTS.md` | Punteros para agentes |

---

## Detalle de sistemas cliente

### Cámara RTS (`RtsCamera.ts`)

1. **Bounds padded** (`CAMERA_BOUNDS_PAD_X/Y`) alrededor del mapa lógico 1280×720 → se puede panear hasta centrar lane izquierda/derecha incluso a zoom mínimo.
2. **`minZoom` = cover** (`max(viewW/mapW, viewH/mapH)`) → el terreno llena la ventana (sin bandas vacías internas).
3. **Controles:** WASD/flechas, borde de pantalla, rueda, drag botón medio.
4. **Focos:** `focusLane` (pan+zoom), `centerOnLane` (solo pan, **Space**), `focusOverview` (centro mapa + minZoom).
5. **Clamp** vía `camera.clampX/Y` de Phaser (permite `scrollX` negativo al zoomear — el clamp manual a `≥0` fue un bug).

### HUD fijo (dual camera en `GameScene`)

- `cameras.main` → mundo (scroll/zoom).
- `hudCam` → transparente; solo objetos `registerHud(...)`.
- `main.ignore(hud)`; `hudCam.ignore(world)`.
- En `Scale.RESIZE`, `layoutHud(width,height)` reposiciona dock, chips y botones.

### Terreno

- **Fondo (`paintWorldTerrain`)**: `TileSprite` scrub (padding) + meadow (área de juego) + parches dirt + lavados ally/rival.
- **Piso de lane**: por celda, `tex_grass` / `tex_dirt` según `cellNoise` (ally más pasto, rival más tierra) + tints.
- **Por qué TileSprite afuera y sprites por celda adentro:** afuera = área grande (perf); adentro = mezcla legible celda a celda alineada al grid.

### 2.5D ligero

- Torres: sombra elipse + pedestal + cuerpo + techo; depth `f(y)`.
- Creeps: sombra + cuerpo offset; depth `f(y)`.
- No es isométrico: la **sim/grilla sigue ortogonal** (clicks y A* sin cambio).

### Ghost path

- Cliente corre `findPath` local sobre torres del snapshot y dibuja polyline (propia más visible, rival tenue).
- Feedback de maze craft sin autoridad extra en el server.

---

## Controles (partida)

| Input | Acción |
|-------|--------|
| Click celda vacía (tu lane) | Place torre seleccionada |
| Click torre propia | Select + range |
| `U` / `S` | Upgrade / sell (con torre seleccionada) |
| `ESC` | Deselect |
| `Q` / `1` | Foco mi mapa |
| `E` / `2` | Foco rival |
| `3` / `Home` | Overview |
| `Space` | Centrar mi línea (mantiene zoom) |
| WASD / flechas / borde / rueda / click medio | Cámara |

---

## Cómo probar

```bash
pnpm install
pnpm --filter @linet/shared build   # si el server consume dist/
pnpm dev
```

1. Práctica vs bot: debe conectar a `:2567`, bot construye, sync OK.
2. Colocar torres sin sellar path; ver ghost path.
3. Pan/zoom; HUD no se mueve; Space centra tu lane.
4. Sin franjas negras al maximizar (RESIZE).
5. Sends aparecen en dock con CD/ola/SP.

## Fuera de alcance (este PR)

- Isométrico real / art pipeline con PNGs.
- Minimapa.
- Targeting modes / range preview al ghost-place.
- Balance “aprobado” (sigue tanteo).
- Reconnect UX completa.

## Checklist merge

- [ ] `pnpm --filter @linet/shared build`
- [ ] `pnpm typecheck` / tests shared
- [ ] Probar multi + solo
- [ ] Confirmar `content/*.json` sync con `packages/shared/src/content/data/`
- [ ] No commitear `tsc-*.txt` ni artefactos locales
