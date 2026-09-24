var canvas = document.getElementById('source-canvas');

if (canvas) {
  var context = canvas.getContext('2d');
  var count = 0;

  function loop() {
    requestAnimationFrame(loop);

    if (++count < window.snake.gameSpeed) {
      return;
    }

    count = 0;
    context.clearRect(0, 0, canvas.width, canvas.height);

    window.snake.step();

    context.fillStyle = 'red';
    context.fillRect(window.snake.apple.x, window.snake.apple.y, window.snake.grid - 1, window.snake.grid - 1);

    context.fillStyle = 'green';
    window.snake.cells.forEach(function(cell) {
      context.fillRect(cell.x, cell.y, window.snake.grid - 1, window.snake.grid - 1);
    });
  }

  requestAnimationFrame(loop);
}
