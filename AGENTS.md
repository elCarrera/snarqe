# Snarqe

## Ejecutar y verificar

- Ejecuta los comandos desde la raíz del repositorio; `server.js` resuelve `docs/` y `https/` relativas al cwd.
- Instala las dependencias con `npm install`; el lockfile fija Express 4.18.2 y nodemon 2.0.20.
- Servidor de desarrollo: `PORT=3000 npm start` → `https://localhost:3000` (el navegador avisa del certificado autofirmado).
- `npm start` ejecuta `nodemon server.js`; sin `PORT` escucha en 443. El servidor es solo HTTPS (sin listener HTTP ni redirección).
- No hay scripts de test, lint, typecheck ni CI. Verifica los cambios manualmente en un navegador.
- `https/` está en gitignore; si faltan los certificados, regenéralos con:
  ```bash
  openssl req -x509 -newkey rsa-4096 -keyout https/key.pem -out https/cert.pem -days 365 -nodes -subj '/CN=localhost'
  ```

## Servidor

- `server.js` es el entrypoint HTTPS de Express: sirve `docs/`, registra cada petición y redirige `/index` → `/index.html` y `/ping` → `ping.html`. El switch compara `req.url`, así que los query strings lo evitan. No hay manejadores personalizados de 404/500.
- `opencode.json` carga `AGENTS.md`, `review.md` y `README.md` como instrucciones; lee `review.md` antes de cambiar el servidor.
- `package.json` solo define el script `start`.
- `.gitignore` ignora `node_modules/` y `https/`.

## Estructura del frontend

- `docs/` es el frontend activo servido. `static/` es un casi-duplicado obsoleto; `old/` contiene copias de referencia obsoletas (su `server_copy.js` está roto: usa `app` sin requerir Express). No edites ninguno de los dos.
- `docs/libs/` incluye A-Frame vendorizado localmente (`aframe.min.js`, `aframe-ar.js`); solo `docs/sayHi.html` carga TensorFlow.js/MediaPipe desde CDN.
- `docs/index.html` es el directorio manual de páginas; añade ahí las páginas y enlaces nuevos.

## Juegos y motores

- `docs/js/snake_engine.js` es el motor: lógica pura de la rejilla (sin canvas ni A-Frame), define el global `window.snake` y escucha el teclado. Lo cargan `docs/snake.html` y `docs/snarqe.html`.
- `docs/js/snake_canvas.js` es el render 2D sobre canvas; lo usa `docs/snake.html`, que sigue siendo la versión 2D.
- `docs/js/snake_voxel.js` registra el componente A-Frame `snake-voxel`, que dibuja la serpiente y la manzana como vóxeles 3D; lo usa `docs/snarqe.html`, la versión AR sobre marcador.
- `docs/js/snake_for_aframe.js` está retirado: no debe usarse ni referenciarse.
- Motor viejo: `docs/js/snake.js`, `fruit.js` y `draw.js`, basados en `setInterval`; solo lo referencia `docs/index_old.html` (cuyas rutas de script relativas a la raíz `fruit.js`/`snake.js`/`draw.js` no resuelven: los archivos están en `docs/js/`).
- `docs/sayHi.html` es la única página con seguimiento facial; necesita permiso de cámara.

## Edición

- Pon los cambios del frontend en `docs/` (JS/CSS/assets dentro de `docs/`); pon los cambios del servidor en `server.js`.
- Mantén los cambios acotados y sigue el estilo del archivo circundante; no reformatees archivos no relacionados.
