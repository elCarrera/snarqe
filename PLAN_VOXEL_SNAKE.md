# Plan: serpiente 3D por vóxeles en A-Frame (snarqe)

Documento de coordinación para agentes paralelos. Cada agente debe leer este
archivo completo antes de tocar nada y ceñirse a **sus** archivos para evitar
conflictos de escritura.

## Contexto

- Repo: `snarqe`. Servidor Express HTTPS (`server.js`) que sirve `docs/`.
- A-Frame **1.8.0** vendorizado en `docs/libs/` (`aframe.min.js`, `aframe-ar.js`).
  No mezclar versiones ni usar CDN.
- Guía local: `.opencode/skills/aframe/SKILL.md`. Docs:
  <https://aframe.io/docs/1.8.0/primitives/a-box.html> y
  <https://aframe.io/docs/1.8.0/core/entity.html>.
- `AGENTS.md` manda: **no editar `static/` ni `old/`** (copias obsoletas).

### Problema actual

El "3D" es falso. `docs/js/snake_for_aframe.js` mezcla simulación de rejilla +
dibujo en canvas 2D + input. `docs/snarqe.html` tiene un canvas oculto
(`#source-canvas`), un componente `draw` que lo convierte en `THREE.CanvasTexture`
y lo pega a un `<a-plane>`. Se quiere eliminar el canvas y representar la
serpiente como entidades A-Frame reales.

### Objetivo

La serpiente (y la manzana) son entidades A-Frame (`<a-box>`) dentro del
marcador AR, actualizadas por un componente ECS. `snake.html` sigue en 2D con
canvas usando la misma lógica.

## Arquitectura

Separar lógica de render en 3 archivos independientes:

```
docs/js/snake_engine.js   -> simulación pura + input teclado + global window.snake
docs/js/snake_canvas.js   -> render 2D (canvas) para snake.html
docs/js/snake_voxel.js    -> componente A-Frame 'snake-voxel' para snarqe.html
```

`docs/js/snake_for_aframe.js` queda retirado (sin referencias en `docs/`).

### Contrato de interfaz (CONGELADO — no cambiar sin avisar al integrador)

`docs/js/snake_engine.js` define `window.snake` con esta forma exacta:

```js
window.snake = {
  numGrid: 10,          // celdas por lado
  grid: 40,             // "píxeles" por celda (canvas 400x400)
  gameSpeed: 20,        // nº de frames de 60fps por paso (nivel 3 por defecto)
  level: 3,
  x: 10 * grid, y: 10 * grid,
  dx: grid, dy: 0,
  cells: [],            // [{x, y}, ...] índice 0 = cabeza
  maxCells: 4,
  apple: { x, y },      // en unidades de píxel (múltiplos de grid)
  direction(dir),       // 'up' | 'down' | 'left' | 'right' (case-insensitive)
  reset(),              // estado inicial
  step()                // avanza 1 celda; devuelve 'eat' | 'die' | null
}
```

Reglas de `step()` (portadas del motor actual):

1. `x += dx; y += dy`.
2. Wrap horizontal y vertical contra `numGrid * grid` (el canvas mide
   `numGrid * grid = 400`).
3. `cells.unshift({x, y})`; si `cells.length > maxCells`, `cells.pop()`.
4. Si la cabeza coincide con `apple`: `maxCells++` y recolocar `apple` en una
   celda aleatoria (0..numGrid-1) por eje.
5. Autocolisión: si la cabeza (`cells[0]`) coincide con otra celda, `reset()`.
6. Devuelve `'eat'`, `'die'` o `null` para que el render pueda reaccionar.

`snake_engine.js` escucha `keydown` **una sola vez** (flechas, con la guarda de
no revertir sobre el mismo eje) y llama a `snake.direction(...)`. No debe tocar
DOM ni canvas. Debe poder cargarse sin `#source-canvas` presente.

## Tareas por archivo

### Agente A — motor + canvas

1. **Crear** `docs/js/snake_engine.js`
   - Simulación pura según el contrato de arriba (sin canvas, sin A-Frame).
   - Conservar `getRandomInt` y `getSpeed(level)` del original.
   - Listener `keydown` (37/38/39/40) tal como está hoy.
2. **Crear** `docs/js/snake_canvas.js`
   - Replica del bucle `requestAnimationFrame` original: usa `#source-canvas`,
     `context.clearRect`, pinta manzana roja (`grid-1`) y cuerpo verde
     (`grid-1`), con la lógica de comer/morir delegada en `snake.step()`.
   - Sólo debe ejecutarse si existe `#source-canvas`.
3. **Editar** `docs/snake.html`
   - Sustituir el `<script src="/js/snake_for_aframe.js">` por
     `<script defer src="js/snake_engine.js"></script>` y
     `<script defer src="js/snake_canvas.js"></script>`.
   - No tocar el resto (canvas, flechas, `snake.direction` inline sigue igual).

### Agente B — vóxeles AR

1. **Crear** `docs/js/snake_voxel.js`
   - Registrar componente A-Frame `snake-voxel` con `AFRAME.registerComponent`.
   - Schema: `voxelSize` (default `0.08`), `headColor` (`#2ecc71`), `bodyColor`
     (`#27ae60`), `appleColor` (`#e74c3c`).
   - `init()`: crea un pool de `<a-box>` (hijos de `this.el`), uno para la
     manzana y N para el cuerpo. Reutiliza entidades con
     `setAttribute('position', {x,y,z})` + `setAttribute('material','color',...)`
     + `setAttribute('visible', true/false)`. Geometría `voxelSize * 0.9`.
     Nada de crear/destruir entidades cada frame.
   - `tick(t, dt)`: acumula `dt`; cada `snake.gameSpeed / 60 * 1000` ms llama a
     `window.snake.step()` y luego `sync()`.
   - `sync()`: mapea cada celda a mundo:
     `col = cell.x / snake.grid`, `row = cell.y / snake.grid`,
     `x = (col - (numGrid-1)/2) * s`, `z = (row - (numGrid-1)/2) * s`,
     `y = s/2`. Índice 0 = cabeza (color de cabeza). Manzana con su color.
     Oculta los vóxeles sobrantes.
   - No debe depender, en tiempo de carga, de que `snake_engine.js` ya haya
     ejecutado `step()`; sí de que `window.snake` exista (esperar
     `sceneEl.addEventListener('loaded', ...)` o comprobar en `init`).
   - No registra listeners de teclado (ya lo hace el motor).
2. **Editar** `docs/snarqe.html`
   - Eliminar `<div id="drawDiv">` + `<canvas id="source-canvas">` (líneas 41-43)
     y el `<script>` del componente `draw` (líneas 19-38).
   - Eliminar el include duplicado de la línea 18; cargar sólo una vez:
     `<script defer src="js/snake_engine.js"></script>` +
     `<script defer src="js/snake_voxel.js"></script>`.
   - Quitar `<script defer src='js/joystick.js'></script>` (rompe consola por
     faltar `#stick1`, `#stick2`, `#status1`, `#status2`; no está cableado).
   - Corregir la ruta del marcador a `patterns/pattern-pixel_apple.patt`.
   - Dentro de `<a-marker-camera>`, además del `<a-plane>` tablero, añadir:
     `<a-entity snake-voxel></a-entity>` y luces explícitas
     (`ambient` intensity ~0.8 + `directional`), porque AR.js no siempre
     inyecta las luces por defecto.
   - Mantener el script inline de flechas: llama a `snake.direction(this.id)`
     (el global lo aporta `snake_engine.js`).
   - No tocar `snake.html` ni `snake_canvas.js`.

### Agente C — docs y limpieza

1. **Editar** `AGENTS.md`: reescribir la sección "Juegos y motores" para
   reflejar el nuevo reparto (`snake_engine.js`, `snake_canvas.js`,
   `snake_voxel.js`), quitar las notas ya resueltas (script duplicado, ruta del
   patrón, joystick roto) y dejar constancia de que `snake_for_aframe.js` está
   retirado.
2. **Eliminar** `docs/js/snake_for_aframe.js` (ya sin referencias en `docs/`).
   Verificar con `rg 'snake_for_aframe' docs/` antes.
3. No tocar `snake_engine.js`, `snake_canvas.js`, `snake_voxel.js`, `snake.html`
   ni `snarqe.html`.

## Coordinación

- Archivos disjuntos por agente => se pueden ejecutar en paralelo:
  - A: `snake_engine.js`, `snake_canvas.js`, `snake.html`.
  - B: `snake_voxel.js`, `snarqe.html`.
  - C: `AGENTS.md`, borrado de `snake_for_aframe.js`.
- El integrador (sesión principal) revisa el diff, comprueba el contrato y
  verifica. Si un agente necesita cambiar el contrato, debe reportarlo, no
  improvisar.
- **Prohibido** editar `static/` y `old/`.

## Verificación

1. `node --check docs/js/snake_engine.js docs/js/snake_canvas.js docs/js/snake_voxel.js`.
2. `rg 'snake_for_aframe' docs/` => sin resultados.
3. `PORT=3000 npm start` y abrir las páginas:
   - `docs/snake.html`: serpiente 2D en canvas, flechas/teclado funcionan.
   - `docs/snarqe.html`: sin canvas ni textura; serpiente en vóxeles 3D sobre
     el marcador, crece al comer y se reinicia al colisionar; consola sin
     errores.
4. Aceptar el certificado autofirmado. Cámara/marcador requiere HTTPS.

## Criterios de aceptación

- No queda ninguna referencia a `#source-canvas` ni a `CanvasTexture` en
  `docs/snarqe.html`.
- `snarqe.html` carga el motor una sola vez y el marcador tiene la ruta
  correcta.
- La serpiente se ve como cajas 3D que siguen la rejilla; cabeza distinguible;
  manzana visible.
- `snake.html` mantiene el comportamiento 2D.
- Sin errores en consola.
