const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const scoreElement = document.getElementById('score');

// Set canvas size
canvas.width = 400;
canvas.height = 600;

// Game variables
let score = 0;
let gameLoop;
let gameStarted = false;

const bird = {
    x: 50,
    y: canvas.height / 2,
    velocity: 0,
    gravity: 0.4,
    jump: -7,
    size: 20
};

const pipes = [];
const pipeWidth = 50;
const pipeGap = 180;
const pipeSpawnInterval = 2000;

startButton.addEventListener('click', startGame);
canvas.addEventListener('click', handleClick);
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') handleClick();
});

function startGame() {
    if (gameStarted) return;
    
    // Reset game state
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    scoreElement.textContent = score;
    gameStarted = true;
    
    // Start game loops
    gameLoop = setInterval(update, 1000/60);
    setInterval(spawnPipe, pipeSpawnInterval);
    
    startButton.style.display = 'none';
}

function handleClick() {
    if (!gameStarted) return;
    bird.velocity = bird.jump;
}

function spawnPipe() {
    if (!gameStarted) return;
    
    // Ensure gap is always within playable bounds
    const minGapStart = 100;  // Minimum distance from top
    const maxGapStart = canvas.height - pipeGap - 100;  // Maximum distance from top
    
    // Clamp the gap start position to ensure it's always within bounds
    const gapStart = Math.max(minGapStart, 
        Math.min(maxGapStart, 
            minGapStart + (Math.random() * (maxGapStart - minGapStart))
        )
    );
    
    // Verify gap size
    const topPipeHeight = gapStart;
    const bottomPipeStart = gapStart + pipeGap;
    const bottomPipeHeight = canvas.height - bottomPipeStart;
    
    // Only spawn pipe if gap is valid
    if (topPipeHeight >= 0 && bottomPipeHeight >= 0 && pipeGap >= bird.size * 2) {
        pipes.push({
            x: canvas.width,
            gapStart: gapStart,
            passed: false
        });
    }
}

function update() {
    // Update bird
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // Check collisions
    if (bird.y < 0 || bird.y > canvas.height) {
        gameOver();
        return;
    }
    
    // Update pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 1.5;
        
        // Remove off-screen pipes
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
            continue;
        }
        
        // Check collision
        if (checkCollision(pipes[i])) {
            gameOver();
            return;
        }
        
        // Update score
        if (!pipes[i].passed && pipes[i].x < bird.x) {
            pipes[i].passed = true;
            score++;
            scoreElement.textContent = score;
        }
    }
    
    draw();
}

function checkCollision(pipe) {
    if (bird.x + bird.size > pipe.x && bird.x < pipe.x + pipeWidth) {
        if (bird.y < pipe.gapStart || bird.y + bird.size > pipe.gapStart + pipeGap) {
            return true;
        }
    }
    return false;
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw bird
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(bird.x, bird.y, bird.size, bird.size);
    
    // Draw pipes
    ctx.fillStyle = '#4CAF50';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.gapStart);
        ctx.fillRect(
            pipe.x,
            pipe.gapStart + pipeGap,
            pipeWidth,
            canvas.height - (pipe.gapStart + pipeGap)
        );
    });
}

function gameOver() {
    gameStarted = false;
    clearInterval(gameLoop);
    startButton.style.display = 'block';
    startButton.textContent = 'Play Again';
}

// Initial draw
draw(); 