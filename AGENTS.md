# AGENTS.md — Snarqe

## Project Overview

AR Snake game: HTML5 Canvas snake rendered as a texture in an A-Frame/AR.js scene. Also includes standalone snake, joystick test, arrow controls test, and a face-tracking experiment.

## Tech Stack

- **Backend**: Node.js, Express 4.18.2, HTTPS (built-in `https`)
- **Frontend**: A-Frame 1.6.0, AR.js, vanilla JS Canvas game
- **Face tracking** (experimental): TensorFlow.js + MediaPipe FaceMesh
- **Dev tool**: nodemon

## Directory Structure

```
snarqe/
├── server.js              # Express HTTPS server, serves `docs/`
├── package.json           # Dependencies: express, nodemon
├── .gitignore             # Ignores node_modules/, https/
├── README.md
├── AGENTS.md
├── review.md
├── docs/                  # Served by Express.static — "active" frontend
│   ├── index.html         # Navigation page
│   ├── snarqe.html        # Main AR snake page
│   ├── snake.html         # Standalone snake game
│   ├── joystick.html      # Virtual joystick test
│   ├── arrows.html        # Arrow-button test
│   ├── AFrame.html        # Minimal A-Frame demo
│   ├── ping.html          # "pong" health-check
│   ├── sayHi.html         # Face-tracking (only here, not in static/)
│   ├── index_old.html     # Older AR page with Hiro marker
│   ├── images/            # joystick-base.png, joystick-blue.png, joystick-red.png
│   ├── js/
│   │   ├── snake_for_aframe.js  # Main snake engine (used in snarqe.html, snake.html)
│   │   ├── snake.js             # Old snake constructor (used in index_old.html)
│   │   ├── fruit.js             # Old fruit class (used in index_old.html)
│   │   ├── draw.js              # Old game driver (used in index_old.html)
│   │   └── joystick.js          # Joystick controller class
│   ├── styles/
│   │   ├── style.css
│   │   └── arrows.css
│   ├── libs/              # Local copies of aframe.min.js, aframe-ar.js
│   └── patterns/          # Custom AR marker: pattern-pixel_apple.patt
├── static/                # Near-duplicate of docs/ (unserved, older version)
├── https/                 # Self-signed SSL certs (gitignored)
└── old/                   # Backup files
```

## ⚠️ Critical: Dual Directory Problem

**`docs/` and `static/` are near-duplicates.** The server serves from `docs/`. Differences include:

- `docs/index.html` has title "docs" and links to `sayHi.html`; `static/` index has title "Elis" and no sayHi link
- `docs/snarqe.html` uses a custom AR pattern; `static/` uses Hiro marker
- `docs/` has `sayHi.html` and `patterns/`; `static/` does not
- `docs/arrows.html` uses `position: sticky`; `static/` uses `position: fixed`

**Any change to JS/CSS/HTML must be made in `docs/`.** The `static/` dir should be treated as a stale reference. If you modify `docs/`, consider if `static/` needs the same change.

## How to Run

```bash
npm install          # Install express + nodemon
PORT=3000 npm start  # Start on port 3000 (no sudo needed)
npm start            # Starts on port 443 (requires sudo)
```

Access: `https://localhost:3000` or `https://localhost`. The server is HTTPS-only.

## Key Architectural Notes

1. **Two snake engines coexist:**
   - **New** (`snake_for_aframe.js`): object-based, `requestAnimationFrame` loop, used by `snarqe.html` and `snake.html`.
   - **Old** (`snake.js` + `fruit.js` + `draw.js`): constructor-function-based, `setInterval` loop, used by `index_old.html`.

2. **Canvas→AR bridge:** The A-Frame component `draw` (registered inline in `snarqe.html`) maps a hidden 2D canvas onto a 3D plane texture each frame via `THREE.CanvasTexture`.

3. **Joystick not wired:** `joystick.js` is loaded in `snarqe.html` but its output is not connected to snake direction. It only works standalone on `joystick.html`.

4. **HTTPS certs** are in `https/` and gitignored. On a fresh clone, regenerate with:
   ```bash
   openssl req -x509 -newkey rsa:4096 -keyout https/key.pem -out https/cert.pem -days 365 -nodes -subj '/CN=localhost'
   ```

## Coding Conventions

- **JS naming**: camelCase for variables/functions, PascalCase for constructors (`Snake`, `Fruit`, `JoystickController`)
- **File naming**: lowercase hyphenated (`snake_for_aframe.js`, `arrows.html`)
- **Semicolons**: mostly present (add them)
- **Indentation**: prefer 2 spaces (project is inconsistent — be consistent with the file you edit)
- **Strings**: mix of Spanish and English — follow the surrounding context

## Common Agent Tasks

### Adding a new HTML page
1. Create the file in `docs/`
2. Add a link in `docs/index.html`
3. If needed, add a redirect in `server.js`
4. If the page uses new JS/CSS, create in `docs/js/` or `docs/styles/`

### Modifying the snake game
- Edit `docs/js/snake_for_aframe.js` for the main game logic
- The A-Frame bridge is in the inline `<script>` in `docs/snarqe.html`

### Modifying styles
- `docs/styles/style.css` for general styles
- `docs/styles/arrows.css` for arrow-control-specific styles

### Adding server routes
- Edit `server.js`
- Keep the existing middleware pattern
- Add error handlers if needed (currently none exist)

## No Tests

No test framework is set up. No linting. Manual testing via browser at `https://localhost`.

## A-Frame & AR.js Notes

- AR library: `libs/aframe-ar.js` (local copy) or use CDN version in some pages
- A-Frame 1.6.0: `libs/aframe.min.js`
- Marker types used: Hiro (`index_old.html`), custom pattern (`snarqe.html` via `patterns/pattern-pixel_apple.patt`)
- On mobile, camera permission is required for AR features
