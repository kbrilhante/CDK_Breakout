const cnv = canvas;
const ctx = cnv.getContext('2d');

const fps = 60;

const background = "#222222"

const blockColors = {
    red: "#FF0000",
    orange: "#FF8000",
    yellow: "#FFFF00",
    green: "#00FF00",
    cyan: "#00FFFF",
    blue: "#0000FF",
    purple: "#8000FF",
    magenta: "#FF00FF"
}

const blockMeasurements = {
    width: cnv.width * 80 / 525,
    height: cnv.height * 30 / 700
}

let paddle, ball;
var gameStart = false;
var gameOver = false;

class Paddle {
    constructor() {
        this.color = "#FF0080";
        this.width = cnv.width * 120 / 525;
        this.height = cnv.height * 20 / 700;
        this.px = (cnv.width / 2) - (this.width / 2);
        this.py = cnv.height - this.height - 20;
        this.dx = 10;
        this.cx = this.px + (this.width / 2);
    }
    drawPaddle() {
        ctx.beginPath();
        ctx.rect(this.px, this.py, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = "#eee";
        ctx.stroke();
        this.cx = this.px + (this.width / 2);
    }
    deletePaddle() {
        delete this.color;
        delete this.width;
        delete this.height;
        delete this.px;
        delete this.py;
        delete this.dx;
        delete this.dy;
    }
}

class Ball {
    constructor() {
        this.color = "#00FF80";
        this.radius = 10;
        this.angle = 0;
        this.velocity = 4;
        this.px = cnv.width / 2;
        this.py = paddle.py - this.radius;
        this.dx = 0;
        this.dy = 0;
    }
    drawBall() {
        ctx.beginPath();
        ctx.arc(this.px, this.py, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = "#eee";
        ctx.stroke();
    }
    bounce() {
        const radians = Math.PI * this.angle / 180;
        this.dx = Math.sin(radians) * this.velocity;
        this.dy = - Math.cos(radians) * this.velocity;
    }
    launch() {
        this.angle = Math.floor(Math.random() * 120) - 60;
        this.bounce();
    }
    bouncePaddle() {
        // console.log(Math.round(ball.px - paddle.cx));
        const ballD = this.px - paddle.cx;
        const newAngle = ballD * 120 / paddle.width;
        this.angle = newAngle;
        this.bounce();
    }
    deleteBall() {
        delete this.color;
        delete this.radius;
        delete this.px;
        delete this.py;
        delete this.dx;
        delete this.dy;
    }
    move() {
        if (gameStart) {
            this.px += this.dx;
            this.py += this.dy;
            // console.log(this.px, this.py)
            //collisions check
            if (this.px - this.radius <= 0 || this.px + this.radius >= cnv.width) {
                this.dx = -this.dx;
            }
            if (this.py - this.radius <= 0) {
                this.dy = -this.dy;
            }
            if (this.py + this.radius >= paddle.py && (this.px + this.radius >= paddle.px && this.px - this.radius <= paddle.px + paddle.width)) {
                this.dy = -this.dy;
                this.bouncePaddle();
            }
            if (this.py + this.radius >= cnv.height) {
                lostBall();
            }
        } else {
            this.px = paddle.cx;
        }
    }

}

class Block {
    constructor(px, py) {
        const colors = Object.keys(blockColors);
        const randomColorIndex = Math.floor(Math.random() * colors.length);
        this.color = blockColors[colors[randomColorIndex]];
        this.width = blockMeasurements.width;
        this.height = blockMeasurements.height;
        this.px = px;
        this.py = py;
        this.dx = 0;
    }
    drawBlock() {
        ctx.beginPath();
        ctx.rect(this.px, this.py, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = "#eee";
        ctx.stroke();
    }
}

class BlockGroup {
    
}

initialize();

function initialize() {
    console.log(canvas.width, canvas.height);
    addEventListener("keydown", keyDownHandler);
    // cnv.addEventListener("touchmove", touchMoveHandler);
    // cnv.addEventListener("touchstart", touchStartHandler);
    // cnv.addEventListener("resize", canvasResize);
    drawBackground();
    paddle = new Paddle();
    ball = new Ball();
    draw();
    setInterval(draw, 1000 / fps);
}

function draw() {
    // console.dir(ctx)
    drawBackground();
    paddle.drawPaddle();
    ball.drawBall();
    ball.move();
}

function drawBackground() {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, cnv.width, cnv.height);
}

function keyDownHandler(e) {
    const key = e.code;
    // console.log(key)
    // paddle controls
    if (!gameOver) {
        if (key === 'KeyA' || key === 'ArrowLeft') {
            movePaddleLeft();
        } else if (key === 'KeyD' || key === 'ArrowRight') {
            movePaddleRight();
        }
        if (!gameStart && key === 'Space') {
            ball.launch();
            gameStart = true;
        }
    }
}

function movePaddleLeft() {
    if (paddle.px > paddle.dx) {
        // left
        paddle.px -= paddle.dx;
    }
}

function movePaddleRight() {
    if (paddle.px + paddle.width < cnv.width - paddle.dx) {
        // right
        paddle.px += paddle.dx;
    }
}



function lostBall() {
    gameStart = false;
    ball.deleteBall();
    ball = new Ball(0);
    paddle.deletePaddle();
    paddle = new Paddle();
    // check lives
}