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

- Motor nuevo: `docs/js/snake_for_aframe.js`, basado en `requestAnimationFrame`; define un `snake` global y lo usan `docs/snake.html` y `docs/snarqe.html`.
- Motor viejo: `docs/js/snake.js`, `fruit.js` y `draw.js`, basados en `setInterval`; solo lo referencia `docs/index_old.html` (cuyas rutas de script relativas a la raíz `fruit.js`/`snake.js`/`draw.js` no resuelven: los archivos están en `docs/js/`).
- `docs/snarqe.html` carga `snake_for_aframe.js` dos veces (líneas 16 y 18) → dos bucles de juego y el doble de velocidad. Quita uno al depurar.
- `docs/snarqe.html` también carga `docs/js/joystick.js`, pero ese script espera los elementos `#stick1`, `#stick2`, `#status1`, `#status2` que la página no tiene, así que su bucle de `requestAnimationFrame` lanza un error. El joystick no está conectado a la dirección de la serpiente; las flechas y el teclado controlan la serpiente.
- El puente del canvas de RA se registra inline en `docs/snarqe.html` con `THREE.CanvasTexture`.
- `docs/snarqe.html` apunta a `patterns\pattern-pixel_apples.patt` (barra invertida, plural), pero el asset versionado es `docs/patterns/pattern-pixel_apple.patt`. Corrige la ruta antes de depurar marcadores que no aparecen.
- `docs/sayHi.html` es la única página con seguimiento facial; necesita permiso de cámara.

## Edición

- Pon los cambios del frontend en `docs/` (JS/CSS/assets dentro de `docs/`); pon los cambios del servidor en `server.js`.
- Mantén los cambios acotados y sigue el estilo del archivo circundante; no reformatees archivos no relacionados.
