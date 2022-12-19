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
    width: 80,
    height: 30
}

let paddle, ball;

class Paddle {
    constructor() {
        this.color = "#FF0080";
        this.width = cnv.width * 120 / 525;
        this.height = cnv.height * 20 / 700;
        this.px = (cnv.width / 2) - (this.width / 2);
        this.py = cnv.height - this.height - 20;
        this.dx = 0;
        this.dy = 0;
    }

    drawPaddle() {
        ctx.beginPath();
        ctx.rect(this.px, this.py, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = "#eee";
        ctx.stroke();
    }
}

class Ball {
    constructor() {
        this.color = "#00FF80";
        this.radius = 10;
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
    // addEventListener("keydown", keyDownHandler);
    drawBackground();
    paddle = new Paddle();
    ball = new Ball();
    block = new Block(10, 100);
    draw();
    // setInterval(draw, 1000/fps);
}

function draw() {
    // console.dir(ctx)
    console.log(canvas.width, canvas.height);
    drawBackground();
    paddle.drawPaddle();
    ball.drawBall();
    block.drawBlock();
    ball.px += ball.dx;
    ball.py += ball.dy;
}

function drawBackground() {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, cnv.width, cnv.height);
}


