// 游戏常量
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    'cyan', 'blue', 'orange', 'yellow', 'green', 'purple', 'red'
];

// 方块形状定义
const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1], [1, 1]], // O
    [[1, 1, 0], [0, 1, 1]], // Z
    [[0, 1, 1], [1, 1, 0]] // S
];

// 游戏状态
let canvas = document.getElementById('gameBoard');
let ctx = canvas.getContext('2d');
let nextCanvas = document.getElementById('nextPiece');
let nextCtx = nextCanvas.getContext('2d');

let score = 0;
let level = 1;
let gameOver = false;
let isPaused = false;
let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let currentPiece = null;
let nextPiece = null;

// 游戏控制
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('restartBtn').addEventListener('click', restartGame);

// 键盘控制
document.addEventListener('keydown', handleKeyPress);

class Piece {
    constructor(shape = null, color = null) {
        this.shape = shape || SHAPES[Math.floor(Math.random() * SHAPES.length)];
        this.color = color || COLORS[Math.floor(Math.random() * COLORS.length)];
        this.x = Math.floor((COLS - this.shape[0].length) / 2);
        this.y = 0;
    }

    draw() {
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(this.x + x, this.y + y, this.color);
                }
            });
        });
    }
}

function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制已固定的方块
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawBlock(x, y, value);
            }
        });
    });

    // 绘制当前方块
    if (currentPiece) {
        currentPiece.draw();
    }
}

function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (nextPiece) {
        nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    nextCtx.fillStyle = nextPiece.color;
                    nextCtx.fillRect(x * 20 + 20, y * 20 + 20, 19, 19);
                    nextCtx.strokeStyle = 'black';
                    nextCtx.strokeRect(x * 20 + 20, y * 20 + 20, 19, 19);
                }
            });
        });
    }
}

function moveDown() {
    if (!currentPiece) return;
    currentPiece.y++;
    if (hasCollision()) {
        currentPiece.y--;
        mergePiece();
        checkLines();
        if (currentPiece.y === 0) {
            gameOver = true;
            alert('游戏结束！');
            return;
        }
        currentPiece = nextPiece;
        nextPiece = new Piece();
        drawNextPiece();
    }
    draw();
}

function hasCollision() {
    return currentPiece.shape.some((row, dy) => {
        return row.some((value, dx) => {
            if (!value) return false;
            let newX = currentPiece.x + dx;
            let newY = currentPiece.y + dy;
            return newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && board[newY][newX]);
        });
    });
}

function mergePiece() {
    currentPiece.shape.forEach((row, dy) => {
        row.forEach((value, dx) => {
            if (value) {
                let newY = currentPiece.y + dy;
                if (newY >= 0) {
                    board[newY][currentPiece.x + dx] = currentPiece.color;
                }
            }
        });
    });
}

function checkLines() {
    let lines = 0;
    board.forEach((row, y) => {
        if (row.every(cell => cell)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            lines++;
        }
    });
    if (lines > 0) {
        score += [100, 300, 600, 1000][lines - 1];
        document.getElementById('score').textContent = score;
        level = Math.floor(score / 1000) + 1;
        document.getElementById('level').textContent = level;
    }
}

function handleKeyPress(event) {
    if (gameOver || isPaused) return;

    switch(event.keyCode) {
        case 37: // 左箭头
            if (currentPiece) {
                currentPiece.x--;
                if (hasCollision()) {
                    currentPiece.x++;
                }
            }
            break;
        case 39: // 右箭头
            if (currentPiece) {
                currentPiece.x++;
                if (hasCollision()) {
                    currentPiece.x--;
                }
            }
            break;
        case 40: // 下箭头
            moveDown();
            break;
        case 38: // 上箭头
            if (currentPiece) {
                rotate();
            }
            break;
        case 32: // 空格
            hardDrop();
            break;
    }
    draw();
}

function rotate() {
    let newShape = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[row.length - 1 - i])
    );
    let oldShape = currentPiece.shape;
    currentPiece.shape = newShape;
    if (hasCollision()) {
        currentPiece.shape = oldShape;
    }
}

function hardDrop() {
    while (!hasCollision()) {
        currentPiece.y++;
    }
    currentPiece.y--;
    moveDown();
}

function startGame() {
    if (!currentPiece) {
        gameOver = false;
        board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
        score = 0;
        level = 1;
        document.getElementById('score').textContent = '0';
        document.getElementById('level').textContent = '1';
        currentPiece = new Piece();
        nextPiece = new Piece();
        drawNextPiece();
        gameLoop();
    }
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? '继续' : '暂停';
}

function restartGame() {
    gameOver = true;
    currentPiece = null;
    startGame();
}

function gameLoop() {
    if (!gameOver && !isPaused) {
        moveDown();
    }
    setTimeout(gameLoop, 1000 - (level - 1) * 100);
}

// 初始化游戏界面
draw(); 