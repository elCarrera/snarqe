var numGrid = 10;
var canvasSize = 400;
var grid = canvasSize / numGrid;
var level = 3;
var gameSpeed = getSpeed(level);

function getSpeed(level) {
  switch (level) {
    case 1:
      return 40;
    case 2:
      return 30;
    case 3:
      return 20;
    case 4:
      return 10;
    case 5:
      return 5;
    default:
      return 40;
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

window.snake = {
  numGrid: numGrid,
  grid: grid,
  gameSpeed: gameSpeed,
  level: level,

  x: 10 * grid,
  y: 10 * grid,

  dx: grid,
  dy: 0,

  cells: [],

  maxCells: 4,

  apple: {
    x: getRandomInt(0, numGrid) * grid,
    y: getRandomInt(0, numGrid) * grid
  },

  direction: function(dir) {
    switch (dir.toUpperCase()) {
      case 'UP':
        this.dx = 0;
        this.dy = -grid;
        break;
      case 'LEFT':
        this.dx = -grid;
        this.dy = 0;
        break;
      case 'RIGHT':
        this.dx = grid;
        this.dy = 0;
        break;
      case 'DOWN':
        this.dx = 0;
        this.dy = grid;
        break;
    }
  },

  reset: function() {
    this.x = 10 * grid;
    this.y = 10 * grid;
    this.dx = grid;
    this.dy = 0;
    this.cells = [];
    this.maxCells = 4;
    this.apple.x = getRandomInt(0, numGrid) * grid;
    this.apple.y = getRandomInt(0, numGrid) * grid;
  },

  step: function() {
    this.x += this.dx;
    this.y += this.dy;

    var limit = numGrid * grid;

    if (this.x < 0) {
      this.x = limit - grid;
    } else if (this.x >= limit) {
      this.x = 0;
    }

    if (this.y < 0) {
      this.y = limit - grid;
    } else if (this.y >= limit) {
      this.y = 0;
    }

    this.cells.unshift({ x: this.x, y: this.y });

    if (this.cells.length > this.maxCells) {
      this.cells.pop();
    }

    if (this.cells[0].x === this.apple.x && this.cells[0].y === this.apple.y) {
      this.maxCells++;
      this.apple.x = getRandomInt(0, numGrid) * grid;
      this.apple.y = getRandomInt(0, numGrid) * grid;
      return 'eat';
    }

    for (var i = 1; i < this.cells.length; i++) {
      if (this.cells[0].x === this.cells[i].x && this.cells[0].y === this.cells[i].y) {
        this.reset();
        return 'die';
      }
    }

    return null;
  }
};

document.addEventListener('keydown', function(e) {
  if (e.which === 37 && window.snake.dx === 0) {
    window.snake.direction('left');
  } else if (e.which === 38 && window.snake.dy === 0) {
    window.snake.direction('up');
  } else if (e.which === 39 && window.snake.dx === 0) {
    window.snake.direction('right');
  } else if (e.which === 40 && window.snake.dy === 0) {
    window.snake.direction('down');
  }
});
