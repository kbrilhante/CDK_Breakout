const cnv = canvas;
const ctx = cnv.getContext('2d');

const fps = 60;

const background = "#222222"

let paddle, ball, brickGroup;
let direction = 'stop';
var gameStart = false;
var gameOver = false;
var level = 1;

const blockColors = {
    red: "#FF0000",
    orange: "#FF8000",
    yellow: "#FFFF00",
    green: "#00FF00",
    blue: "#0000FF",
    purple: "#8000FF"
}

const canvasBaseMeasurements = {
    width: 525,
    height: 700
}

const blockMeasurements = {
    width: cnv.width * 80 / canvasBaseMeasurements.width,
    height: cnv.height * 30 / canvasBaseMeasurements.height
}

class Paddle {
    constructor() {
        this.color = "#00FFFF";
        this.width = cnv.width * 120 / canvasBaseMeasurements.width;
        this.height = cnv.height * 20 / canvasBaseMeasurements.height;
        this.px = (cnv.width / 2) - (this.width / 2);
        this.py = cnv.height - this.height - 20;
        this.dx = 0;
        this.vx = 10;
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
    move() {
        const leftWall = this.vx;
        const rightWall = cnv.width - this.vx;
        const paddleLeft = this.px;
        const paddleRight = this.px + this.width;
        if (paddleLeft > leftWall && direction === 'left') {
            this.dx = -this.vx;
        } else if (paddleRight < rightWall && direction === 'right') {
            this.dx = this.vx;
        } else {
            this.dx = 0;
        }

        this.px += this.dx;
    }
    destroy() {
        const keys = Object.keys(this);
        keys.forEach(key => {
            delete this[key];
        });
    }
}

class Ball {
    constructor() {
        this.color = "#FF00FF";
        this.radius = cnv.width * 10 / canvasBaseMeasurements.width;
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
    destroy() {
        const keys = Object.keys(this);
        keys.forEach(key => {
            delete this[key];
        });
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
        this.left = px;
        this.right = px + this.width;
        this.top = py;
        this.bottom = py + this.height;
    }
    drawBlock() {
        ctx.beginPath();
        ctx.rect(this.left, this.top, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = "#eee";
        ctx.stroke();
    }
    destroy() {
        const keys = Object.keys(this);
        keys.forEach(key => {
            delete this[key];
        });
    }
}

class BlockGroup {
    constructor() {
        this.blockRowCount = level + 2;
        this.blockColumnCount = level + 1;
        this.blockGap = 10;
        this.offsetTop = 30;
        this.offsetBottom = cnv.height - 100;
        const maxWidth = cnv.width * 0.9;
        const maxHeight = cnv.height -(this.offsetTop + this.offsetBottom);
    }
}

initialize();
function initialize() {
    addEventListener("keydown", keyDownHandler);
    addEventListener("keyup", keyDownHandler);
    // cnv.addEventListener("touchmove", touchMoveHandler);
    // cnv.addEventListener("touchstart", touchStartHandler);
    // cnv.addEventListener("resize", canvasResize);
    drawBackground();
    paddle = new Paddle();
    ball = new Ball();
    // draw();
    setInterval(draw, 1000 / fps);
}

function canvasResize() {
    blockMeasurements.width = cnv.width * 80 / canvasBaseMeasurements.width;
    blockMeasurements.height = cnv.height * 30 / canvasBaseMeasurements.height;
}

function draw() {
    // console.dir(ctx)
    drawBackground();
    paddle.drawPaddle();
    paddle.move();
    ball.drawBall();
    ball.move();
}

function drawBackground() {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, cnv.width, cnv.height);
}

function keyDownHandler(e) {
    // console.log(e);
    const upDown = e.type;
    const key = e.code;
    // console.log(key)
    // paddle controls
    if (!gameOver) {
        if (!gameStart && key === 'Space') {
            ball.launch();
            gameStart = true;
        }
        if (upDown === 'keydown') {
            if (key === 'KeyA' || key === 'ArrowLeft') {
                direction = 'left';
            } else if (key === 'KeyD' || key === 'ArrowRight') {
                direction = 'right';
            }
        } else {
            direction = 'stop';
        }
    }
}

function lostBall() {
    gameStart = false;
    ball.destroy();
    ball = new Ball(0);
    paddle.destroy();
    paddle = new Paddle();
    // check lives
}