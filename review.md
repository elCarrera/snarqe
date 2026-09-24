# Review de `server.js`

## Resumen general

Servidor Express con HTTPS que sirve archivos estáticos desde `docs/` y tiene un par de redirecciones simples. Correcto en funcionalidad básica, pero con varios puntos mejorables.

---

## Observaciones

### 1. Puerto por defecto 443 (alto privilegio)
```js
const port = process.env.PORT || 443;
```
- Requiere `sudo` en Linux/Mac. Para desarrollo convendría usar `3000` o `8080` como fallback.
- En producción sí tiene sentido 443, pero entonces deberías tener un mecanismo para HTTP → HTTPS.

### 2. Carga síncrona de certificados sin manejo de errores
```js
key: fs.readFileSync('https/key.pem'),
cert: fs.readFileSync('https/cert.pem')
```
- Si los archivos no existen, el servidor crashea sin mensaje claro.
- La ruta es relativa al `cwd`, no al archivo. Usa `__dirname + '/https/...'` para ser robusto.

### 3. Middleware de logging
```js
console.log('\x1b[33m', req.method, req.hostname, req.path, req.time, req.ip);
```
- `req.hostname` funciona en Express, pero si estás detrás de un proxy (Nginx, etc.) necesitas `app.set('trust proxy', true)` para que `req.ip` y `req.hostname` sean fiables.
- El color ANSI se reinicia al final del log si no hay `\x1b[0m`.

### 4. Express.static apunta a `docs/`
```js
app.use(express.static('docs'));
```
- Existe un directorio `static/` con contenido similar. ¿Cuál es el correcto? Si es `static/`, la línea debería actualizarse.
- Ruta relativa puede fallar según dónde se ejecute `node`. Usa `path.join(__dirname, 'docs')`.

### 5. Middleware de redirecciones: usa `req.url` en vez de `req.path`
```js
switch (req.url) {
```
- `req.url` incluye query strings (`/index?foo=bar`), por lo que no matchearía. Usa `req.path`.
- Considera usar `app.get('/index', ...)` en lugar de un middleware manual.

### 6. No hay manejador de errores ni 404
- Express por defecto responde "Cannot GET /ruta" sin un 404 personalizado.
- No hay `app.use((err, req, res, next) => ...)` para errores 500.

### 7. Solo HTTPS, sin HTTP
- No hay servidor HTTP en el mismo `server.js`. Puerto 443 implica que un usuario que intente `http://` no tendrá respuesta ni redirección. Normalmente se corre un segundo servidor HTTP en puerto 80 que redirija a HTTPS.

### 8. Estilo y formateo
- Inconsistencia en espacios: `(req,res,next) =>{` vs `(req, res, next) => {`. Sugiero usar `(req, res, next) => {` consistentemente (Prettier ayuda).
- `next()` indentado con 2 espacios dentro del switch, mientras el bloque del `case` usa 8 espacios — mezcla de espacios y tabs según el editor.

---

## Sugerencias generales

| Aspecto | Recomendación |
|---|---|
| Puerto dev | Default a `3000` y documentar que en prod se usa 443 |
| Ruta certs | `path.join(__dirname, 'https', 'key.pem')` con try/catch |
| trust proxy | `app.set('trust proxy', 1)` si usas proxy inverso |
| Static dir | Decidir entre `docs/` o `static/` y ser consistente |
| Manejo errores | Añadir middleware 404 y 500 |
| HTTP → HTTPS | Añadir segundo server HTTP que redirija |
| Formateo | Correr `npx prettier --write server.js` |
