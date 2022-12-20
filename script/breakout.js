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

class Paddle {
    constructor() {
        this.color = "#FF0080";
        this.width = cnv.width * 120 / 525;
        this.height = cnv.height * 20 / 700;
        this.px = (cnv.width / 2) - (this.width / 2);
        this.py = cnv.height - this.height - 20;
        this.dx = 10;
    }
    drawPaddle() {
        ctx.beginPath();
        ctx.rect(this.px, this.py, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = "#eee";
        ctx.stroke();
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
        this.px = cnv.width / 2;
        this.py = paddle.py - this.radius;
        this.dx = -2;
        this.dy = -4;
    }
    drawBall() {
        ctx.beginPath();
        ctx.arc(this.px, this.py, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = "#eee";
        ctx.stroke();
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
        }
        if (this.py + this.radius >= cnv.height) {
            // lose life
            // restart paddle
            // paddle.deletePaddle();
            // restart ball
            // ball.deleteBall();
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
        this.topLeft = new Object();
        this.topLeft.px = px;
        this.topLeft.py = py;
        this.dx = 0;
    }
    drawBlock() {
        ctx.beginPath();
        ctx.rect(this.topLeft.px, this.topLeft.py, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = "#eee";
        ctx.stroke();
    }
}

let block; 

initialize();

function initialize() {
    console.log(canvas.width, canvas.height);
    addEventListener("keydown", keyDownHandler);
    // cnv.addEventListener("touchmove", toucMoveHandler);
    // cnv.addEventListener("touchstart", touchStartHandler);
    // cnv.addEventListener("resize", canvasResize);
    drawBackground();
    paddle = new Paddle();
    ball = new Ball();
    draw(); 
    setInterval(draw, 1000/fps);
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
    console.log(key)
    // paddle controls
    if (key === 'KeyA' || key === 'ArrowLeft') {
        movePaddleLeft();
    } else if (key === 'KeyD' || key === 'ArrowRight') {
        movePaddleRight();
    }
}

function movePaddleLeft () {
    if (paddle.px > paddle.dx) {
        // left
        paddle.px -= paddle.dx;
    }
}

function movePaddleRight () {
    if (paddle.px + paddle.width < cnv.width - paddle.dx) {
        // right
        paddle.px += paddle.dx;
    }
}