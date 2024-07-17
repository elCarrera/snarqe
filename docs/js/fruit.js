function Fruit() {
    this.x;
    this.y;

    this.pickLocation = function() {
        this.x = (Math.floor(Math.random() * rows -1) + 1) * scale;
        this.y = (Math.floor(Math.random() * columns -1) + 1) * scale;
        //this.x = scale * 6;
        //this.y = scale * 0;
    }

    this.draw = function() {
        ctx.fillStyle = "#e784c1";
        ctx.fillRect(this.x, this.y, scale, scale);
    }
}