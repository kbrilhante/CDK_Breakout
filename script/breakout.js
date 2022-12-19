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

const ball = {
    color: "#00FF80",
    radius: 10,
    px: cnv.width / 2,
    py: cnv.height - 30,
    dx: 2,
    dy: -2
}

// const paddle = {
//     color: "#FF0080",
//     width: cnv.width * 120 / 525,
//     height: cnv.height * 20 / 700,
//     px: (cnv.width / 2) - (paddle.width / 2),
//     py: 600,
//     dx: 0,
//     dy: 0
// }

const blockMeasurements = {
    width: 80,
    height: 30
}

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
}

class Block {
    constructor(px, py) {
        this.width = blockMeasurements.width;
        this.height = blockMeasurements.height;
        this.topLeft = new Object();
        this.topLeft.px = px;
        this.topLeft.py = py;
    }
}

draw();

// setInterval(draw, 1000/fps);

function draw() {
    // console.dir(ctx)
    console.log(canvas.width, canvas.height);
    drawBackground();
    drawPaddle();
    drawBall();
    drawBlock(10, 100);
    ball.px += ball.dx;
    ball.py += ball.dy;
}

function drawBackground() {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, cnv.width, cnv.height);
}

function drawPaddle() {
    const paddle = new Paddle();
    ctx.beginPath();
    ctx.rect(paddle.px, paddle.py, paddle.width, paddle.height);
    ctx.fillStyle = paddle.color;
    ctx.fill();
    ctx.strokeStyle = "#eee";
    ctx.stroke();
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.px, ball.py, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.strokeStyle = "#eee";
    ctx.stroke();
}

function drawBlock(px, py) {
    const colors = Object.keys(blockColors);
    const randomColorIndex = Math.floor(Math.random() * colors.length);
    const block = new Block(px, py);
    console.log(block)
    ctx.beginPath();
    ctx.rect(block.topLeft.px, block.topLeft.py, block.width, block.height);
    ctx.fillStyle = blockColors[colors[randomColorIndex]];
    ctx.fill();
    ctx.strokeStyle = "#eee";
    ctx.stroke();
}
