AFRAME.registerComponent('snake-voxel', {
  schema: {
    voxelSize: { type: 'number', default: 0.08 },
    headColor: { type: 'color', default: '#2ecc71' },
    bodyColor: { type: 'color', default: '#27ae60' },
    appleColor: { type: 'color', default: '#e74c3c' },
  },

  init: function () {
    this.snake = null;
    this.voxels = [];
    this.appleVoxel = null;
    this.accumulator = 0;
    this.ready = false;

    this.build = this.build.bind(this);

    if (window.snake) {
      this.build();
      return;
    }

    const sceneEl = this.el.sceneEl;
    const waitForSnake = () => {
      if (window.snake) {
        this.build();
        return;
      }
      const id = setInterval(() => {
        if (window.snake) {
          clearInterval(id);
          this.build();
        }
      }, 100);
    };

    if (sceneEl.hasLoaded) {
      waitForSnake();
    } else {
      sceneEl.addEventListener('loaded', waitForSnake);
    }
  },

  build: function () {
    if (this.ready) return;
    const snake = window.snake;
    if (!snake) return;

    this.snake = snake;
    const size = this.data.voxelSize;
    const geometry = size * 0.9;

    const createBox = (color) => {
      const box = document.createElement('a-box');
      box.setAttribute('width', geometry);
      box.setAttribute('height', geometry);
      box.setAttribute('depth', geometry);
      box.setAttribute('color', color);
      box.setAttribute('visible', false);
      this.el.appendChild(box);
      return box;
    };

    this.appleVoxel = createBox(this.data.appleColor);

    const poolSize = snake.numGrid * snake.numGrid;
    for (let i = 0; i < poolSize; i++) {
      this.voxels.push(createBox(this.data.bodyColor));
    }

    this.ready = true;
    this.sync();
  },

  tick: function (t, dt) {
    if (!this.ready || !this.snake) return;

    const stepMs = (this.snake.gameSpeed / 60) * 1000;
    this.accumulator += Math.min(dt, 200);

    while (this.accumulator >= stepMs) {
      this.accumulator -= stepMs;
      this.snake.step();
      this.sync();
    }
  },

  sync: function () {
    const snake = this.snake;
    const size = this.data.voxelSize;
    const offset = (snake.numGrid - 1) / 2;

    snake.cells.forEach((cell, index) => {
      const voxel = this.voxels[index];
      if (!voxel) return;

      const col = cell.x / snake.grid;
      const row = cell.y / snake.grid;

      voxel.setAttribute('position', {
        x: (col - offset) * size,
        y: size / 2,
        z: (row - offset) * size,
      });
      voxel.setAttribute(
        'material',
        'color',
        index === 0 ? this.data.headColor : this.data.bodyColor
      );
      voxel.setAttribute('visible', true);
    });

    for (let i = snake.cells.length; i < this.voxels.length; i++) {
      this.voxels[i].setAttribute('visible', false);
    }

    if (this.appleVoxel) {
      const col = snake.apple.x / snake.grid;
      const row = snake.apple.y / snake.grid;
      this.appleVoxel.setAttribute('position', {
        x: (col - offset) * size,
        y: size / 2,
        z: (row - offset) * size,
      });
      this.appleVoxel.setAttribute('visible', true);
    }
  },
});
