# PR — `feat/maze-scale-path-sends`

> **Estado:** en revisión (working tree; aún sin merge)  
> Rama: `feat/maze-scale-path-sends`  
> Objetivo: mazes legibles (celdas grandes), creeps más pausados, sends agresivos, cámara RTS, sprites PNG + terreno, y fixes de sync en práctica/solo.

## Resumen ejecutivo

Este cambio acerca Linet a la fantasía **Line Tower Wars** (maze craft + presión de sends) y moderniza la **presentación cliente** (cámara RTS, HUD fijo, terreno procedural, spritesheets PNG). La simulación sigue siendo autoritativa en `@linet/shared`; el cliente solo renderiza e envía intents.

### Qué gana el jugador

| Área | Antes (aprox.) | Ahora |
|------|----------------|-------|
| Maze | Grilla densa (históricamente 12×14 → 16×23@28) | **14×17**, `cellSize` **36** (rectángulos/celdas más grandes) |
| Creeps | Velocidades altas (runner 140, grub 80) | Más pausados; solo **runner** (~100) es claramente rápido |
| Sends | Menos presión | Costos/CDs más bajos, `send_mix`, SP más generoso |
| Vista | Mapa fijo 1280×720, ambas lanes siempre a la vista | **Cámara RTS**: pan/zoom, foco mi mapa / rival / overview |
| HUD | Barra superior ancha; se movía con bugs de cámara | **HUD fijo** (cámara UI) + layout en `RESIZE` |
| Terreno | Colores planos | **Grass + dirt** en grilla; **meadow/scrub** de fondo |
| Torres/creeps | Formas procedurales runtime | **Spritesheets PNG** (idle/attack / walk) + sombra + depth por Y |
| Práctica vs bot | A veces no sincronizaba en DEV | `requestSync` + WS a `:2567` en DEV |

---

## Alcance por capa

### 1. Shared / contenido (reglas + data)

- Mapa `line_01` con **celdas grandes** (14×17 @ 36) → torres/creeps legibles.
- Velocidades de creeps más bajas; `runner` sigue siendo el fast.
- Economía SP y catálogo de sends más agresivos.
- Tests de sim actualizados si aplica.

### 2. Server

- Mensaje `sync` para reenviar snapshot cuando el cliente lo pide (lobby/partida).

### 3. Client (presentación)

- Phaser `Scale.RESIZE` (sin letterbox negro).
- `RtsCameraController` + cámara HUD transparente.
- Texturas procedurales + mezcla en piso/fondo.
- Spritesheets PNG de torres/creeps (bake scripts + `public/assets/`); display size ∝ `cellSize`.
- Polish de UI de partida (dock, chips, labels IN/OUT, ghost path).

### 4. Docs

- Mapas / path / sends / UI / arquitectura / este dossier.

---

## Archivos — qué hace cada uno y por qué

### Shared (sim + content)

| Archivo | Qué hace | Por qué |
|---------|----------|---------|
| `packages/shared/src/content/data/map.ts` | Define `MAP` / `line_01`: 2 lanes **14×17**, cell **36**, origins `(48,30)` y `(728,30)`, exitRow 16 | Celdas más grandes = torres/creeps legibles; sim y cliente leen la misma def |
| `content/maps/line_01.json` | Espejo humano del mapa | Convención del repo: content JSON sync con shared |
| `packages/shared/src/content/data/creeps.ts` | Speeds: grub 55, runner 100, brute 38, shade 50, boss 28 | Solo runner es “rápido”; el resto más legible en maze |
| `content/creeps.json` | Espejo de creeps | Idem |
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
| `packages/client/src/fx/groundTextures.ts` | Genera texturas procedurales: `tex_grass`, `tex_dirt`, `tex_meadow`, `tex_scrub` + `cellNoise` | Terreno legible sin tileset externo |
| `packages/client/src/fx/towerSprites.ts` | Preload sheets + anims idle/attack; keys `tower_{id}` | Torres con sprite real, no dibujo runtime |
| `packages/client/src/fx/creepSprites.ts` | Preload sheets + walk; `creepDisplaySize()` ∝ `MAP.cellSize` | Creeps legibles al subir el tamaño de celda |
| `packages/client/public/assets/towers/*.png` | Spritesheets bakeados (idle + attack) | Assets servidos estáticos por Vite |
| `packages/client/public/assets/creeps/*.png` | Spritesheets bakeados (walk loop) | Idem |
| `scripts/bake-tower-sprites.py` | Genera PNGs de torres | Regenerar art sin tocar Phaser |
| `scripts/bake-creep-sprites.py` | Genera PNGs de creeps | Idem |

### Client — escenas

| Archivo | Qué hace | Por qué |
|---------|----------|---------|
| `packages/client/src/scenes/BootScene.ts` | Ground textures + preload/create anims de torres y creeps | Assets listos **antes** de `GameScene` |
| `packages/client/src/scenes/GameScene.ts` | Partida: terreno, grillas, ghost path, sprites torres/creeps (sombra + depth Y), HUD dual-camera, dock, hotkeys cámara | Única escena de gameplay; **no** decide rules (solo intents) |
| `packages/client/src/scenes/LobbyScene.ts` | (sync/`requestSync` u otros tweaks del branch) | Misma familia de fixes de estado al entrar |

### Docs tocados / nuevos

| Archivo | Rol |
|---------|-----|
| `docs/prs/feat-maze-scale-path-sends.md` | **Este dossier** — alcance PR + mapa de archivos |
| `docs/ui/camera-and-terrain.md` | Diseño de cámara RTS, HUD fijo, 2.5D, texturas |
| `docs/content/maps.md` | Spec mapa 14×17 cell 36 |
| `docs/content/creep-roster.md` | Speeds más pausadas + runner fast |
| `docs/balance/mvp-values.md` | Tabla creeps alineada a speeds nuevas |
| `docs/gameplay/path.md` | Path + ghost + tamaño maze |
| `docs/ui/camera-and-terrain.md` | Cámara, terreno, sprites PNG |
| `docs/ui/screens.md` | HUD / controles cámara |
| `docs/multiplayer/send.md` | Números SP / catálogo |
| `docs/core/arquitectura.md` | Paths `camera/` y `fx/` |
| `docs/core/stack.md` | Nota RESIZE + presentación |
| `docs/roadmap/mvp.md` | Checklist mapa actualizado |
| `AGENTS.md` | Punteros sprites + bake scripts |

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

### Sprites + depth (2.5D ligero)

- Torres: sombra elipse + sprite sheet (idle/attack al disparar); display ~`cell×0.95` × `cell×1.12`; depth `f(y)`.
- Creeps: sombra + walk loop; tamaño vía `creepDisplaySize` (boss > brute > shade > runner > grub); depth `f(y)`.
- No es isométrico: la **sim/grilla sigue ortogonal** (clicks y A* sin cambio).
- Bake: `python scripts/bake-tower-sprites.py` / `python scripts/bake-creep-sprites.py`.

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
6. Celdas grandes: torres/creeps se ven más grandes; creeps (salvo runner) se mueven más despacio.

## Fuera de alcance (este PR)

- Isométrico real / art pipeline con artista (los PNG actuales son bake procedural).
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
