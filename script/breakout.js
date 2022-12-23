const cnv = canvas;
const ctx = cnv.getContext('2d');

const fps = 60;

const background = "#222222"

var paddle, ball, blockGroup;
var direction = 'stop';
var gameStart = false;
var gameOver = false;
var level = 1;

const blockColors = {
    red: "#FF0000",
    yellow: "#FFFF00",
    green: "#00FF00",
    cyan: "#00FFFF",
    blue: "#0000FF",
    magenta: "#FF00FF"
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
        this.color = "#FF8000";
        this.width = cnv.width * 120 / canvasBaseMeasurements.width;
        this.height = cnv.height * 20 / canvasBaseMeasurements.height;
        this.px = (cnv.width / 2) - (this.width / 2);
        this.py = cnv.height - this.height - 20;
        this.dx = 0;
        this.vx = 10;
        this.cx = this.px + (this.width / 2);
        this.target;
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
        this.moveToTarget();
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
    moveToTarget() {
        const range = this.vx / 2;
        if (this.target) {
            if (this.cx > this.target - range && this.cx < this.target + range) {
                direction = 'stop';
                delete this.target;
            } else if (this.cx < this.target - range) {
                direction = 'right'
            } else { // (this.cx > target + range) {
                direction = 'left'
            }
        }
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
        this.color = "#80FF00";
        this.radius = cnv.width * 10 / canvasBaseMeasurements.width;
        this.angle = 0;
        this.speed = 4;
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
        this.dx = Math.sin(radians) * this.speed;
        this.dy = - Math.cos(radians) * this.speed;
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
        this.color = '#FFFFFF';
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
    collisionCheck() {
        const ballLeft = ball.px - ball.radius;
        const ballRight = ball.px + ball.radius;
        const ballTop = ball.py - ball.radius;
        const ballBottom = ball.py + ball.radius;
        if (ballLeft < this.right && ballRight > this.left && ballTop < this.bottom && ballBottom > this.top) {
            ball.dy = -ball.dy;
            ball.speed += 0.2;
            this.destroy();
            return true;
        } else {
            return false;
        }
    }
}

class BlockGroup {
    constructor() {
        this.blockRowCount = level + 2;
        this.blockColumnCount = level + 1;
        this.blockGap = 50 / level;
        this.offsetTop = 100;
        this.offsetBottom = cnv.height - 100;
        this.count = 0;
        this.blocks = new Set();
        const maxWidth = cnv.width * 0.9;
        let rowWidth = this.getRowWidth();
        if (rowWidth > maxWidth) {
            const newBlockWidth = (maxWidth / this.blockColumnCount) - this.blockGap;
            const newBlockHeight = newBlockWidth * blockMeasurements.height / blockMeasurements.width;
            blockMeasurements.width = newBlockWidth;
            blockMeasurements.height = newBlockHeight;
            rowWidth = this.getRowWidth();
        }
        const maxHeight = cnv.height - (this.offsetTop + this.offsetBottom);
        const rowStart = Math.round((cnv.width / 2) - (rowWidth / 2));
        // this.blocks = new Block(blockRowStart, this.offsetTop);
        for (let r = 0; r < this.blockRowCount; r++) {
            for (let c = 0; c < this.blockColumnCount; c++) {
                const px = rowStart + ((blockMeasurements.width + this.blockGap) * c);
                const py = this.offsetTop + ((blockMeasurements.height + this.blockGap) * r);
                const block = new Block(px, py);
                const colors = Object.keys(blockColors);
                const colorIndex = r % colors.length;
                block.color = blockColors[colors[colorIndex]];
                this.blocks.add(block);
            }
        }
        this.count = this.blocks.size;
    }
    getRowWidth() {
        return (blockMeasurements.width * this.blockColumnCount) + (this.blockGap * (this.blockColumnCount - 1));
    }
    drawGroup() {
        this.blocks.forEach(block => {
            if (block.collisionCheck()) {
                this.blocks.delete(block);
                this.count = this.blocks.size;
            }
            block.drawBlock();
        });
        if (this.count === 0) {
            level++;
            restart();
        }
    }
    destroy() {
        const keys = Object.keys(this);
        keys.forEach(key => {
            delete this[key];
        });
    }
}

initialize();

function initialize() {
    addEventListener("keydown", keyDownHandler);
    addEventListener("keyup", keyDownHandler);
    cnv.addEventListener("touchmove", touchHandler);
    cnv.addEventListener("touchstart", touchHandler);
    // cnv.addEventListener("resize", canvasResize);
    drawBackground();
    gameOver = false;
    gameStart = false;
    paddle = new Paddle();
    ball = new Ball();
    blockGroup = new BlockGroup();
    // draw();
    setInterval(draw, 1000 / fps);
}

// function canvasResize() {
//     blockMeasurements.width = cnv.width * 80 / canvasBaseMeasurements.width;
//     blockMeasurements.height = cnv.height * 30 / canvasBaseMeasurements.height;
// }

function draw() {
    // console.dir(ctx)
    drawBackground();
    paddle.drawPaddle();
    paddle.move();
    ball.drawBall();
    ball.move();
    blockGroup.drawGroup();
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

function touchHandler(e) {
    console.log(e);
    const target = e.touches[0].clientX - (cnv.offsetLeft + cnv.clientLeft);
    paddle.target = target;
    paddle.moveToTarget();
}

function lostBall() {
    restart();
    // check lives
}

function restart() {
    gameStart = false;
    if (!gameover) {
        ball.destroy();
        ball = new Ball();
        paddle.destroy();
        paddle = new Paddle();
        if (blockGroup.count === 0) {
            blockGroup.destroy();
            blockGroup = new BlockGroup();
        }
    }

}