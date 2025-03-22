// Dynamic canvas size with max limits
let board;
let maxBoardWidth = 600; // Max width for PC screens
let maxBoardHeight = 800; // Max height for PC screens
let boardWidth = Math.min(window.innerWidth * 0.9, maxBoardWidth);
let boardHeight = Math.min(window.innerHeight * 0.8, maxBoardHeight);
let context;

// Bird properties
let birdSize = Math.min(boardWidth * 0.1, 40); // Set a max bird size
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;

let bird = {
    x: birdX,
    y: birdY,
    width: birdSize,
    height: birdSize * 0.7,
    velocityY: 0,
    gravity: 0.3, // Adjusted for smoother descent
    jumpPower: -6 // Adjusted for better jump feel
};

// Pipes
let pipeArray = [];
let pipeWidth = Math.min(boardWidth * 0.15, 70);
let pipeHeight = boardHeight * 0.6;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg, bottomPipeImg;

// Game variables
let velocityX = -3; // Fixed speed for PC
let gameOver = false;
let gameStarted = false;
let score = 0;
let pipeInterval;

// Load images
let birdImg = new Image();
birdImg.src = "./flappybird.png";

topPipeImg = new Image();
topPipeImg.src = "./toppipe.png";
bottomPipeImg = new Image();
bottomPipeImg.src = "./bottompipe.png";

window.onload = function () {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    birdImg.onload = function () {
        drawStartScreen();
    };

    document.addEventListener("keydown", moveBird);
    document.addEventListener("touchstart", moveBird);
};

function drawStartScreen() {
    context.clearRect(0, 0, board.width, board.height);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    context.fillStyle = "white";
    context.font = "28px sans-serif";
    context.textAlign = "center";
    context.fillText("Tap to Start", boardWidth / 2, boardHeight / 2);
}

function update() {
    if (!gameStarted) return;

    requestAnimationFrame(update);
    if (gameOver) {
        context.fillStyle = "white";
        context.font = "40px sans-serif";
        context.textAlign = "center";
        context.fillText("GAME OVER", boardWidth / 2, boardHeight / 2);
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    // Apply gravity smoothly
    bird.velocityY += bird.gravity;
    bird.y = Math.max(bird.y + bird.velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) gameOver = true;

    // Move pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) gameOver = true;
    }

    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    context.fillStyle = "white";
    context.font = "28px sans-serif";
    context.textAlign = "left";
    context.fillText(Math.floor(score), boardWidth * 0.08, boardHeight * 0.05);
}

function moveBird(e) {
    if (!gameStarted) {
        gameStarted = true;
        pipeArray = [];
        bird.velocityY = 0;
        score = 0;
        gameOver = false;
        requestAnimationFrame(update);

        clearInterval(pipeInterval);
        pipeInterval = setInterval(placePipes, 1500);
    }

    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX" || e.type === "touchstart") {
        bird.velocityY = bird.jumpPower;
        if (gameOver) {
            restartGame();
        }
    }
}

function placePipes() {
    if (gameOver || !gameStarted) return;

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = boardHeight / 3.5;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe);
}

function restartGame() {
    clearInterval(pipeInterval);
    gameStarted = false;
    gameOver = false;
    bird.velocityY = 0;
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    drawStartScreen();
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}
