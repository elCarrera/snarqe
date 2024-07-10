function Snake() {
    this.x = 0;
    this.y = 0;
    this.xSpeed = scale * 1;
    this.ySpeed = 0;
    // It seems to not work properly in console when initializing total 
    // higher than zero in the draw function, despite painting it ok.
    this.total = 0;
    this.tail = [];


    this.draw = function() {
        ctx.fillStyle = "#86c574";

        for (let i=0; i<this.tail.length; i++) {
            ctx.fillRect(this.tail[i].x, this.tail[i].y, scale, scale);
        }

        ctx.fillRect(this.x, this.y, scale, scale);
    }

    this.update = function() {

        this.moveTail();

        this.x += this.xSpeed;
        this.y += this.ySpeed;
        

        //Here we could switch between two playing modes:
        // 1. You hit the wall, you die
        // 2. You appear in the opposite place (torus playground)

        /* Mode 1
        if(this.x < 0 || this.x >= canvas.width || this.y < 0 || this.y >= canvas.height) {
            console.log("estás fuerísima");
        }
        */

        if(this.x >= canvas.width) {
            this.x = 0;
        }
        if(this.x < 0) {
            this.x = canvas.width - scale * 1;
        }
        if(this.y >= canvas.height) {
            this.y = 0;
        }
        if(this.y < 0) {
            this.y = canvas.height - scale * 1;
        }

    }

    this.enlarge = function() {
        this.total++;
    }

    this.moveTail = function() {
        for (let i=0; i<this.tail.length - 1; i++) {
            this.tail[i] = this.tail[i+1];
        }

        this.tail[this.total - 1] = {x: this.x, y: this.y};
    }

    this.hasEaten = function() {
        if(this.x === fruit.x && this.y === fruit.y) {
            return true;
        }
        return false;
    }

    this.hasCollide = function() {
        for (let i=0; i<this.tail.length; i++) {
            
            if(this.tail[i].x === this.x && this.tail[i].y === this.y){
                return true;
            }
        }
        return false;
    }
    
    this.changeDirection = function(direction) {
        // It kind of works, but need to control the actual direction better so
        // player can't overclock to turn arround.
        // Also that if is pretty ugly
        switch(direction) {
            case 'Up': 
                if(this.xSpeed != 0 && this.ySpeed != scale * 1){
                    this.xSpeed = 0;
                    this.ySpeed = -scale * 1;
                }
            break;
            case 'Down': 
                if(this.xSpeed != 0 && this.ySpeed != -scale * 1){
                    this.xSpeed = 0;
                    this.ySpeed = scale * 1;
                }
            break;
            case 'Left':
                if(this.xSpeed != scale * 1 && this.ySpeed != 0){
                    this.xSpeed = -scale * 1;
                    this.ySpeed = 0;
                }
            break;
            case 'Right': 
            if(this.xSpeed != -scale * 1 && this.ySpeed != 0){
                this.xSpeed = scale * 1;
                this.ySpeed = 0;
            }
            break;
        }
    }
}