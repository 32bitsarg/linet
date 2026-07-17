# Stack

> **Estado:** borrador

## Decisión

| Capa | Opción | Alternativas descartadas | Por qué |
|------|--------|--------------------------|---------|
| Lenguaje | _TBD_ | | |
| Runtime / engine | _TBD_ (p.ej. Phaser, Pixi, Godot, Unity, custom Canvas) | | |
| Bundler / tooling | _TBD_ | | |
| Lenguaje de datos (torres, olas) | _TBD_ (JSON / TS / YAML) | | |
| Persistencia local | _TBD_ | | |
| Multiplayer (futuro) | _TBD_ | | |

## Requisitos no negociables del stack

- Actualización de juego determinista o fácilmente depurable (ticks / fixed timestep).
- Datos de contenido (torres, creeps, olas) **separados** de la lógica.
- Fácil iterar balance sin recompilar todo el engine (ideal).

## Estructura prevista del repo (código) — borrador

```
linet/
  docs/           # esta documentación
  src/            # código del juego (cuando exista)
  content/        # datos: torres, creeps, olas, mapas
  assets/         # sprites, audio, fuentes
  tests/          # tests de sistemas (economía, path, daño)
```

> Detalle fino de módulos → [arquitectura.md](./arquitectura.md)

## Preguntas abiertas

1. ¿Web-first o desktop-first?
2. ¿2D top-down ortogonal o isométrico?
3. ¿Necesitamos física real o solo hit-scan / proyectiles simples?
