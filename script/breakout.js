const cnv = canvas;
const ctx = cnv.getContext('2d');

const fps = 60;

const background = "#222222"

var paddle, ball, blockGroup;
var direction;
var gameStart, gameOver;
var level, lives, score, hiScore;
var button;

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
        const cKey = Object.keys(blockColors);
        const bottomGap = 50;
        this.color = blockColors[cKey[lives - 1]];
        this.width = cnv.width * 120 / canvasBaseMeasurements.width;
        this.height = cnv.height * 20 / canvasBaseMeasurements.height;
        this.px = (cnv.width / 2) - (this.width / 2);
        this.py = cnv.height - this.height - bottomGap;
        this.dx = 0;
        this.vx = 10;
        this.cx = this.px + (this.width / 2);
        this.cy = this.py + (this.height / 2);
        this.target;
    }
    drawPaddle() {
        ctx.beginPath();
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.rect(this.px, this.py, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = "#000";
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
        this.color = "#FF8000";
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
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.arc(this.px, this.py, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = "#000";
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
        const ballX = this.px - paddle.cx;
        const ballY = paddle.cy - this.py;
        let newAngle = Math.round(Math.atan2(ballX, ballY) * 180 / Math.PI);
        // console.log(newAngle)
        if (Math.abs(newAngle) === 90) {
            newAngle -= 1;
        }
        this.angle = newAngle;
        this.bounce();
    }
    bounceBlock(vertCol) { // vertCol is boolean
        let newAngle;
        if (vertCol) {
            // console.log('vertical');
            newAngle = Math.round(Math.atan2(this.dx, this.dy) * 180 / Math.PI);
        } else {
            // console.log('side');
            newAngle = Math.round(Math.atan2(-this.dx, -this.dy) * 180 / Math.PI);
        }
        this.angle = newAngle;
        this.bounce()
    }
    destroy() {
        const keys = Object.keys(this);
        keys.forEach(key => {
            delete this[key];
        });
    }
    move() {
        if (gameStart) {
            // console.log(this.speed);
            this.px += this.dx;
            this.py += this.dy;
            //collisions check
            if (this.px - this.radius <= 0 || this.px + this.radius >= cnv.width) {
                this.dx = -this.dx;
            }
            if (this.py - this.radius <= 0) {
                this.dy = -this.dy;
            }
            if ((this.py + this.radius >= paddle.py && this.py - this.radius <= paddle.py + paddle.height) && (this.px + this.radius >= paddle.px && this.px - this.radius <= paddle.px + paddle.width)) {
                this.dy = -this.dy;
                this.bouncePaddle();
            }
            if (this.py + this.radius >= cnv.height) {
                lostBall();
            }
            if (this.px - this.radius <= 0) {
                this.px = this.radius;
            } else if (this.px + this.radius >= cnv.width) {
                this.px = cnv.width - this.radius;
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
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.rect(this.left, this.top, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.stroke();
    }
    destroy() {
        const keys = Object.keys(this);
        keys.forEach(key => {
            delete this[key];
        });
        blockGroup.blocks.delete(this);
    }
}

class BlockGroup {
    constructor() {
        this.blockRowCount = level + 2;
        this.blockColumnCount = level + 1;
        this.blockGap = 60 / level;
        if (this.blockGap <= ball.radius * 2) { this.blockGap = 0 }
        this.offsetTop = 100;
        this.offsetBottom = cnv.height - (paddle.py + (2 * ball.radius) + 30);
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
            const ballLeft = ball.px - ball.radius;
            const ballRight = ball.px + ball.radius;
            const ballTop = ball.py - ball.radius;
            const ballBottom = ball.py + ball.radius;
            // collision check
            if (ballLeft <= block.right && ballRight >= block.left && ballBottom >= block.top && ballTop <= block.bottom) {
                ball.speed += 0.2;
                if (ball.py > block.top && ball.py < block.bottom) {
                    ball.bounceBlock(false); // side collision
                } else {
                    ball.bounceBlock(true); // vertical collision
                }
                block.destroy();
                this.count -= 1;
                score += 15;
                if (score > hiScore) {
                    hiScore = score;
                    localStorage.setItem('hiScore', hiScore);
                }
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

class Button {
    constructor(type) {
        this.cx = cnv.width / 2;
        this.cy = cnv.height / 2;
        this.width = 300;
        this.height = 150;
        this.top = this.cy - this.height / 2;
        this.bottom = this.cy + this.height / 2;
        this.left = this.cx - this.width / 2;
        this.right = this.cx + this.width / 2;
        switch (type) {
            case 'gameStart':
                this.color = blockColors.green;
                this.fontColor = '#000'
                this.title = 'Launch the Ball';
                this.text = ['Press SPACEBAR or', 'touch here to start'];
                break;
            case 'gameOver':
                this.color = blockColors.red;
                this.fontColor = '#fff'
                this.title = 'GAME OVER';
                this.text = ['Press ENTER or', 'touch here to try again'];
                break;
        }
    }
    drawButton() {
        // btn Background
        ctx.beginPath();
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 10;
        ctx.fillStyle = this.color + '90';
        ctx.fillRect(this.left, this.top, this.width, this.height);
        ctx.stroke();

        // btn text info
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillStyle = this.fontColor;
        ctx.textAlign = 'center';

        // title
        ctx.font = '36px Fantasy';
        let posY = this.top + (this.height / 4);
        ctx.fillText(this.title, this.cx, posY, this.width * 0.9);
        //text
        ctx.font = '20px Fantasy';
        posY += this.height / 3;
        ctx.fillText(this.text[0], this.cx, posY, this.width * 0.9);
        posY += this.height / 6;
        ctx.fillText(this.text[1], this.cx, posY, this.width * 0.9);
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
    cnv.addEventListener("click", mouseHandler);
    hiScore = localStorage.getItem('hiScore');
    if (!hiScore) {
        hiScore = 0;
    }
    newGame();
    // draw();
    setInterval(draw, 1000 / fps);
}

function draw() {
    ctx.clearRect(0, 0, cnv.width, cnv.height)
    paddle.drawPaddle();
    paddle.move();
    ball.drawBall();
    ball.move();
    blockGroup.drawGroup();
    btnHandler();
    drawGameInfo();
}

function startGame() {
    ball.launch();
    gameStart = true;
}

function newGame() {
    direction = 'stop';
    gameOver = false;
    gameStart = false;
    level = 1;
    lives = 1//6;
    score = 0;
    paddle = new Paddle();
    ball = new Ball();
    blockGroup = new BlockGroup();
}

function drawGameInfo() {
    // top bar area info
    const barWidth = cnv.width * 0.96;
    const barHeight = blockGroup.offsetTop * 0.7;

    const maxWidth = barWidth / 4;

    const barTop = (blockGroup.offsetTop - barHeight) / 2;
    // const barTop = blockGroup.offsetTop / 2;
    const barLeft = (cnv.width - barWidth) / 2;
    const barRight = barLeft + barWidth;

    // Top Game general rules
    ctx.textBaseline = 'top';
    // ctx.textBaseline = 'middle';
    ctx.font = '20px Fantasy';
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.textAlign = 'center';

    // score
    let pos = barLeft + maxWidth / 2;
    ctx.fillText('Score: ' + score, pos, barTop, maxWidth);

    // level
    pos += maxWidth;
    ctx.fillText('Level: ' + level, pos, barTop, maxWidth);

    // lives
    pos += maxWidth;
    ctx.fillText('Lives: ' + lives, pos, barTop, maxWidth);

    // hiscore
    pos += maxWidth;
    ctx.fillText('Hi-Score: ' + hiScore, pos, barTop, maxWidth);
}

function keyDownHandler(e) {
    // console.log(e);
    const upDown = e.type;
    const key = e.code;
    // console.log(key)
    // paddle controls
    if (!gameOver) {
        if (!gameStart && key === 'Space') {
            startGame();
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
    } else if (key === 'Enter') {
        newGame();
    }
}

function touchHandler(e) {
    const offsetX = e.touches[0].clientX - (cnv.offsetLeft + cnv.clientLeft);
    const offsetY = e.touches[0].clientY - (cnv.offsetTop + cnv.clientTop);

    // console.log(offsetX, offsetY);

    // if (!gameStart && (e.touches[0].clientY - (cnv.offsetTop + cnv.clientTop)) < blockGroup.offsetBottom) {
    if (offsetY >= button.top && offsetY <= button.bottom && offsetX >= button.left && offsetX <= button.right) {
        clickHandler();
    } else {
        paddle.target = offsetX;
    }
}

function mouseHandler(e) {
    if (e.offsetY >= button.top && e.offsetY <= button.bottom && e.offsetX >= button.left && e.offsetX <= button.right) {
        clickHandler();
    }
}

function clickHandler() {
    if (gameOver) {
        newGame();
    } else if (!gameStart) {
        startGame();
    }
}

function lostBall() {
    lives--;
    if (lives === 0) {
        gameOver = true;
    }
    restart();
}

function restart() {
    gameStart = false;
    paddle.destroy();
    ball.destroy();
    if (!gameOver) {
        paddle = new Paddle();
        ball = new Ball();
        if (blockGroup.count === 0) {
            blockGroup.destroy();
            blockGroup = new BlockGroup();
        }
    }
}

function btnHandler() {
    if (!gameStart && !gameOver) {
        button = new Button('gameStart');
        button.drawButton();
    } else if (gameOver) {
        button = new Button('gameOver');
        button.drawButton();
    } else {
        button.destroy();
    }
}