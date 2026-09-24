var canvas = document.getElementById('source-canvas');
var context = canvas.getContext('2d');

// the canvas width & height, snake x & y, and the apple x & y, all need to be a multiples of the grid size in order for collision detection to work
// (e.g. 16 * 25 = 400)

const numGrid = 10;
const canvasSize = canvas.width;
let level = 3;
let gameSpeed = getSpeed(level);

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



var grid = canvasSize / numGrid;
var count = 0;

var snake = {
  x: 10 * grid,
  y: 10 * grid,

  // snake velocity. moves one grid length every frame in either the x or y direction
  dx: grid,
  dy: 0,

  // keep track of all grids the snake body occupies
  cells: [],

  // length of the snake. grows when eating an apple
  maxCells: 4,

  direction: function(dir){
    switch(dir.toUpperCase()) {
      case 'UP' :
        snake.dx = 0;
        snake.dy = -grid;
        break;
      case 'LEFT':
        snake.dx = -grid;
        snake.dy = 0;
        break;
      case 'RIGHT':
        snake.dx = grid;
        snake.dy = 0;
        break;
      case 'DOWN':
        snake.dx = 0;
        snake.dy = grid;
        break;
    }
  }
};

var apple = {
  x: (getRandomInt(0, numGrid) * grid),
  y: (getRandomInt(0, numGrid) * grid)
};

// get random whole numbers in a specific range
// @see https://stackoverflow.com/a/1527820/2124254
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// game loop
function loop() {
  requestAnimationFrame(loop);

  // slow game loop to 15 fps instead of 60 (60/15 = 4) 
  // no entiendo la anotación de arriba, no tiene ningún sentido
  if (++count < gameSpeed) {
    return;
  }

  count = 0;
  context.clearRect(0,0,canvas.width,canvas.height);

  // move snake by it's velocity
  snake.x += snake.dx;
  snake.y += snake.dy;

  // wrap snake position horizontally on edge of screen
  if (snake.x < 0) {
    snake.x = canvas.width - grid;
  }
  else if (snake.x >= canvas.width) {
    snake.x = 0;
  }

  // wrap snake position vertically on edge of screen
  if (snake.y < 0) {
    snake.y = canvas.height - grid;
  }
  else if (snake.y >= canvas.height) {
    snake.y = 0;
  }

  // keep track of where snake has been. front of the array is always the head
  snake.cells.unshift({x: snake.x, y: snake.y});

  // remove cells as we move away from them
  if (snake.cells.length > snake.maxCells) {
    snake.cells.pop();
  }

  // draw apple
  context.fillStyle = 'red';
  context.fillRect(apple.x, apple.y, grid-1, grid-1);

  // draw snake one cell at a time
  context.fillStyle = 'green';
  snake.cells.forEach(function(cell, index) {

    // drawing 1 px smaller than the grid creates a grid effect in the snake body so you can see how long it is
    context.fillRect(cell.x, cell.y, grid-1, grid-1);

    // snake ate apple
    if (cell.x === apple.x && cell.y === apple.y) {
      snake.maxCells++;

      // canvas is 400x400 which is 25x25 grids
      apple.x = getRandomInt(0, numGrid) * grid;
      apple.y = getRandomInt(0, numGrid) * grid;
    }

    // check collision with all cells after this one (modified bubble sort)
    for (var i = index + 1; i < snake.cells.length; i++) {

      // snake occupies same space as a body part. reset game
      if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
        snake.x = 10 * grid;
        snake.y = 10 * grid;
        snake.cells = [];
        snake.maxCells = 4;
        snake.dx = grid;
        snake.dy = 0;

        apple.x = getRandomInt(0, numGrid) * grid;
        apple.y = getRandomInt(0, numGrid) * grid;
      }
    }
  });
}

// listen to keyboard events to move the snake
document.addEventListener('keydown', function(e) {
  // prevent snake from backtracking on itself by checking that it's
  // not already moving on the same axis (pressing left while moving
  // left won't do anything, and pressing right while moving left
  // shouldn't let you collide with your own body)

  // left arrow key
  if (e.which === 37 && snake.dx === 0) {
    snake.direction('left');
  }
  // up arrow key
  else if (e.which === 38 && snake.dy === 0) {
    snake.direction('up');
  }
  // right arrow key
  else if (e.which === 39 && snake.dx === 0) {
    snake.direction('right');
  }
  // down arrow key
  else if (e.which === 40 && snake.dy === 0) {
    snake.direction('down');
  }
});

// start the game
requestAnimationFrame(loop);