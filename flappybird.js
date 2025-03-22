// Dynamic canvas size
let board;
let boardWidth, boardHeight;
let context;

// Bird properties
let birdWidth, birdHeight, birdX, birdY, birdImg;
let bird = { x: 0, y: 0, width: 0, height: 0 };

// Pipes
let pipeArray = [];
let pipeWidth, pipeHeight, pipeX, pipeY;
let topPipeImg, bottomPipeImg;

// Physics
let velocityX, velocityY, gravity;
let gameOver = false;
let gameStarted = false;
let score = 0;
let pipeInterval; // Store interval ID

window.onload = function () {
    initializeGame();
    window.addEventListener("resize", resizeCanvas);
};

function initializeGame() {
    board = document.getElementById("board");
    context = board.getContext("2d");

    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function () {
        resizeCanvas(); // Ensure everything scales correctly before drawing
    };

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";
    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    document.addEventListener("keydown", moveBird);
    document.addEventListener("touchstart", moveBird);
}

function resizeCanvas() {
    boardWidth = window.innerWidth * 0.9;
    boardHeight = window.innerHeight * 0.8;
    board.width = boardWidth;
    board.height = boardHeight;

    birdWidth = boardWidth * 0.08;
    birdHeight = birdWidth * 0.7;
    birdX = boardWidth / 8;
    birdY = boardHeight / 2;

    pipeWidth = boardWidth * 0.15;
    pipeHeight = boardHeight * 0.6;
    pipeX = boardWidth;

    velocityX = -boardWidth * 0.005;
    gravity = boardHeight * 0.001;
    velocityY = 0;

    bird = { x: birdX, y: birdY, width: birdWidth, height: birdHeight };

    if (!gameStarted) {
        drawStartScreen();
    }
}

function drawStartScreen() {
    context.clearRect(0, 0, board.width, board.height);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Display "Tap to Start" message
    context.fillStyle = "white";
    context.font = boardWidth * 0.06 + "px sans-serif";
    context.textAlign = "center";
    context.fillText("Tap to Start", boardWidth / 2, boardHeight / 2);
}

function update() {
    if (!gameStarted) return;

    requestAnimationFrame(update);
    if (gameOver) {
        context.fillStyle = "white";
        context.font = boardWidth * 0.06 + "px sans-serif";
        context.textAlign = "center";
        context.fillText("GAME OVER", boardWidth / 2, boardHeight / 2);
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    // Apply gravity to bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
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
    context.font = boardWidth * 0.06 + "px sans-serif";
    context.textAlign = "left";
    context.fillText(Math.floor(score), boardWidth * 0.08, boardHeight * 0.05);
}

function moveBird(e) {
    if (!gameStarted) {
        gameStarted = true;
        pipeArray = [];
        velocityY = 0;
        score = 0;
        gameOver = false;
        requestAnimationFrame(update);

        clearInterval(pipeInterval);
        pipeInterval = setInterval(placePipes, 1500);
    }

    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX" || e.type === "touchstart") {
        velocityY = -boardHeight * 0.015;
        if (gameOver) restartGame();
    }
}

function placePipes() {
    if (gameOver || !gameStarted) return;

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = boardHeight / 2.8;

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
    velocityY = 0;
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

