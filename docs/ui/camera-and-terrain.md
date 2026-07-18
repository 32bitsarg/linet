# Cámara RTS, HUD fijo y terreno

> **Estado:** aprobado / primer tanteo (cliente)  
> PR → [../prs/feat-maze-scale-path-sends.md](../prs/feat-maze-scale-path-sends.md) · Pantallas → [screens.md](./screens.md) · Mapas → [../content/maps.md](../content/maps.md)

## Objetivos

1. Poder **mirar tu maze o el del rival** y panear/zoomear (fantasía RTS / WC3).
2. El **HUD nunca se mueve** con la cámara.
3. El canvas **llena la ventana** (sin letterbox negro).
4. El fondo y el piso se leen como **un mismo terreno**.
5. Presentación **2.5D ligera** sin cambiar la sim ortogonal.

## Escala Phaser

| Modo | Uso en Linet |
|------|----------------|
| `FIT` | Descartado para partida: genera franjas negras |
| `ENVELOP` | Descartado: rellena pantalla pero **recorta** HUD arriba/abajo |
| **`RESIZE`** | Elegido: el game size = ventana; HUD se relayouta |

Archivo: `packages/client/src/main.ts`.

## Dual camera

| Cámara | Rol |
|--------|-----|
| `cameras.main` | Mundo (maze, torres, creeps, terreno, ghost path) |
| `hudCam` | UI fija; `transparent = true` |

Objetos HUD pasan por `registerHud`. Objetos dinámicos del mundo por `registerWorld` (ignored por `hudCam`).

## `RtsCameraController`

Path: `packages/client/src/camera/RtsCamera.ts`.

- Bounds = mapa + **padding** → se puede centrar cualquiera de las dos lanes a cualquier zoom.
- `minZoom` = **cover** del mapa en el viewport.
- Clamp con `clampX` / `clampY` de Phaser (no forzar `scrollX >= 0`).

## Terreno procedural

Path: `packages/client/src/fx/groundTextures.ts` (bake en `BootScene`).

| Key | Uso |
|-----|-----|
| `tex_grass` / `tex_dirt` | Celdas del maze (mezcla por `cellNoise`) |
| `tex_meadow` | Campo abierto bajo/alrededor de los mazes |
| `tex_scrub` | Padding lejano (más oscuro) |

`GameScene.paintWorldTerrain()` compone TileSprites + parches. Las lanes pintan tiles por celda encima.

## 2.5D / sprites

- Torres: spritesheets PNG en `public/assets/towers/{id}.png` (idle + attack).
- Creeps: spritesheets PNG en `public/assets/creeps/{id}.png` (walk loop).
- Tamaño en pantalla ∝ `MAP.cellSize` (celdas grandes → sprites más grandes).
- Regenerar: `python scripts/bake-tower-sprites.py` / `python scripts/bake-creep-sprites.py`
- Depth por Y; la grilla de pathfinding no cambia.

## Hotkeys cámara

Ver [screens.md](./screens.md).
