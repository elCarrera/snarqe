---
name: aframe
description: Use when adding, installing, or upgrading A-Frame in an HTML page or scene, choosing between CDN, npm, or a vendored build, or setting up a local server for A-Frame/WebXR/AR work. Covers aframe.min.js, <a-scene>, A-Frame 1.8.0, and Cordova.
---

# A-Frame

A-Frame is a web frameYwork for VR/AR built on HTML and three.js. Docs:
<https://aframe.io/docs/1.8.0/introduction/>. Current docs version in this
project: **1.8.0**.

## Installing / including A-Frame

Most methods require no real installation. Pick one:

### 1. CDN `<script>` (fastest, no build)

```html
<head>
  <script src="https://aframe.io/releases/1.8.0/aframe.min.js"></script>
</head>
<body>
  <a-scene>
    <a-box position="-1 0.5 -3" rotation="0 45 0" color="#4CC3D9"></a-box>
    <a-sphere position="0 1.25 -5" radius="1.25" color="#EF2D5E"></a-sphere>
    <a-cylinder position="1 0.75 -3" radius="0.5" height="1.5" color="#FFC65D"></a-cylinder>
    <a-plane position="0 0 -4" rotation="-90 0 0" width="4" height="4" color="#7BC8A4"></a-plane>
    <a-sky color="#ECECEC"></a-sky>
  </a-scene>
</body>
```

Pin the exact version (`1.8.0`), never `master`, in committed HTML.

### 2. Self-hosted build

Download and vendor the file (e.g. `docs/libs/aframe.min.js`):

- Production (minified): <https://aframe.io/releases/1.8.0/aframe.min.js>
- Development (uncompressed + source maps): <https://aframe.io/releases/1.8.0/aframe.js>

Reference it with a path relative to the served root, e.g.
`<script src="libs/aframe.min.js"></script>` when the page lives in `docs/`.
Vendor AR/WebXR add-ons locally too if offline use matters (`aframe-ar.js`).

### 3. npm (`npm install aframe`)

```bash
npm install aframe
```

Then bundle (Webpack/Vite/`angle`):

```js
import AFRAME from 'aframe';
```

Scaffold a scene with `angle`:

```bash
npm install -g angle && angle initscene
```

## Local development

Serve over a local server; don't open with `file://` (no domain → relative and
absolute URLs, models, and fonts break).

```bash
npm i -g five-server@latest && five-server --port=8000   # or
python3 -m http.server
```

Then open `http://localhost:8000`.

## Cordova

Add the local-file XHR plugin or JSON fonts / 3D models fail from `file://`:

```bash
cordova plugin add cordova-plugin-xhr-local-file
```

CSP header must allow `https://cdn.aframe.io`, `https://fonts.googleapis.com`,
`img-src data: content: blob:`. Render the scene only after the `deviceready`
event (see the Installation docs page).

## This repo (snarqe)

- A-Frame is vendored in `docs/libs/` (`aframe.min.js`, `aframe-ar.js`); pages
  in `docs/` should reference those local builds, not the CDN.
- `docs/snarqe.html` loads **the snake engine twice** (duplicate
  `snake_for_aframe.js` script tags) → doubled game loop/speed; remove one when
  debugging.
- Its AR marker path `patterns\pattern-pixel_apples.patt` is wrong: the asset is
  `docs/patterns/pattern-pixel_apple.patt`. Fix the path before debugging
  missing markers.
- `docs/sayHi.html` is the only page loading TensorFlow.js/MediaPipe (from CDN)
  and needs camera permission.
- Stay on A-Frame 1.8.0 to match the vendored builds; don't mix versions.

## Gotchas

- `<a-scene>` auto-initializes on load; assets referenced by `src` load before
  the scene renders.
- HTTPS or `localhost` is required for camera/WebXR; this project's server is
  HTTPS-only (`server.js`).
- Check the browser console for component/attribute typos — A-Frame warns but
  usually keeps running.
