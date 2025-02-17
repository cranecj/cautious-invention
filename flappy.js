const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const scoreElement = document.getElementById('score');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game variables
let score = 0;
let gameLoop;
let gameStarted = false;
let pipeSpawnLoop;
let currentSpeed = 1;
const SPEED_INCREASE = 0.5;  // Changed from 1.5 to 0.5
const SCORE_THRESHOLD = 20;
const BASE_SPEED = 1;
let cheatCode = '';

// Add this with other game variables at the top
let highScore = localStorage.getItem('flappyHighScore') || 0;

// Add these with other game variables at the top
let gameOverScreen = false;
let gameOverMessage = "Game Over - Press Space to Restart";

const bird = {
    x: 50,
    y: canvas.height / 2,
    velocity: 0,
    gravity: 0.3,
    jump: -6,
    size: 20
};

const pipes = [];
const pipeWidth = 50;
const pipeGap = 200;
const pipeSpawnInterval = 2000;

// Add this after the game variables
const birdParticles = [];
const PARTICLE_COUNT = 8;
const PARTICLE_SPEED = 3;
const PARTICLE_SIZE = bird.size / 2;

// Add these with the other game variables
let pipeCount = 0;
const coins = [];
const COIN_SIZE = 20;
const COIN_POINTS = 5;

// Add this variable with other game variables
let speedLevel = 0;

// Add this after the scoreElement constant at the top
const highScoreElement = document.createElement('div');
highScoreElement.id = 'highScore';
highScoreElement.textContent = `High Score: ${highScore}`;
document.querySelector('#content').insertBefore(highScoreElement, canvas);

// Add these with other game variables
const lasers = [];
const LASER_SPEED = 3;
const LASER_HEIGHT = 4;
const LASER_POINTS_THRESHOLD = 50;
const LASER_COLOR = '#FF0000';

// Add these with other game variables
const LASER_INTERVAL = 1000; // 1 second in milliseconds
let laserSpawnLoop;

// Add these constants near the top with other game variables
const DIFFICULTY_SPEEDS = {
    'easy': 1,
    'medium': 2,
    'hard': 3,
    'demon': 6,
    'impossible': 11
};
let currentDifficulty = 'easy';

// Add this after creating the highScoreElement
const difficultySelect = document.createElement('select');
difficultySelect.id = 'difficultySelect';
['easy', 'medium', 'hard', 'demon', 'impossible'].forEach(difficulty => {
    const option = document.createElement('option');
    option.value = difficulty;
    option.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    if (difficulty === 'demon' || difficulty === 'impossible') {
        option.style.color = '#FF0000';
    }
    difficultySelect.appendChild(option);
});
document.querySelector('#content').insertBefore(difficultySelect, canvas);

// Add this after creating the difficultySelect element
const difficultyLabel = document.createElement('div');
difficultyLabel.id = 'difficultyLabel';
difficultyLabel.textContent = 'Level:';
document.querySelector('#content').insertBefore(difficultyLabel, difficultySelect);

difficultySelect.addEventListener('change', (e) => {
    currentDifficulty = e.target.value;
    if (gameStarted) {
        // Update current game speed if game is in progress
        currentSpeed = BASE_SPEED * DIFFICULTY_SPEEDS[currentDifficulty] + (SPEED_INCREASE * speedLevel);
        clearInterval(pipeSpawnLoop);
        pipeSpawnLoop = setInterval(spawnPipe, pipeSpawnInterval / currentSpeed);
    }
});

// Add these with other game variables
const fireworks = [];
const FIREWORK_POINTS = 30;
const FIREWORK_COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

// Add this variable with other game variables
let catsSpawned = false;

startButton.addEventListener('click', startGame);
canvas.addEventListener('click', handleClick);
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (gameOverScreen) {
            // Reset game state and start new game
            gameOverScreen = false;
            startGame();
        } else if (gameStarted) {
            handleClick();
        }
    }
});

document.addEventListener('keydown', (event) => {
    if (/^[0-9]$/.test(event.key)) {
        cheatCode += event.key;
        if (cheatCode === '69') {
            updateScore(99999999);
            cheatCode = '';
        }
        if (cheatCode === '4321') {
            localStorage.setItem('flappyHighScore', 0);
        } else {
            
        }
    } else {
        cheatCode = '';
    }
});

function startGame() {
    if (gameStarted) return;
    
    // Reset game state
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes.length = 0;
    coins.length = 0;
    lasers.length = 0;
    pipeCount = 0;
    score = 0;
    speedLevel = 0;
    currentSpeed = BASE_SPEED * DIFFICULTY_SPEEDS[currentDifficulty];
    scoreElement.textContent = score;
    gameStarted = true;
    gameOverScreen = false;
    fireworks.length = 0;
    
    // Start game loops
    gameLoop = setInterval(update, 1000/60);
    pipeSpawnLoop = setInterval(spawnPipe, pipeSpawnInterval / currentSpeed);
    
    if (score >= LASER_POINTS_THRESHOLD) {
        laserSpawnLoop = setInterval(spawnRandomLaser, LASER_INTERVAL);
    }
    
    startButton.style.display = 'none';
}

function handleClick() {
    if (!gameStarted) return;
    bird.velocity = bird.jump;
}

function spawnPipe() {
    if (!gameStarted) return;
    
    pipeCount++;
    
    // Ensure gap is always within playable bounds
    const minGapStart = 100;
    const maxGapStart = canvas.height - pipeGap - 100;
    
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
        
        // Spawn coin every 5 pipes
        if (pipeCount % 5 === 0) {
            coins.push({
                x: canvas.width,
                y: gapStart + (pipeGap / 2) - (COIN_SIZE / 2),
                collected: false
            });
        }
    }
}

function increaseSpeed() {
    speedLevel++;
    currentSpeed = (BASE_SPEED * DIFFICULTY_SPEEDS[currentDifficulty]) + (SPEED_INCREASE * speedLevel);
    clearInterval(pipeSpawnLoop);
    pipeSpawnLoop = setInterval(spawnPipe, pipeSpawnInterval / currentSpeed);
}

function updateScore(newScore) {
    score = newScore;
    scoreElement.textContent = score;
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('flappyHighScore', highScore);
        highScoreElement.textContent = `High Score: ${highScore}`;
    }
}

function spawnRandomLaser() {
    if (!gameStarted || score < LASER_POINTS_THRESHOLD) return;
    
    // Random Y position within canvas bounds
    const laserY = Math.random() * (canvas.height - LASER_HEIGHT);
    lasers.push({
        x: canvas.width,
        y: laserY,
        active: true
    });
}

function createFirework() {
    const x = Math.random() * canvas.width;
    const y = canvas.height;
    const particles = [];
    const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
    
    // Create explosion particles
    for (let i = 0; i < 30; i++) {
        const angle = (Math.PI * 2 * i) / 30;
        const speed = 4 + Math.random() * 2;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            color: color
        });
    }
    
    fireworks.push({
        particles: particles,
        age: 0
    });
}

function update() {
    // Update bird
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // Add velocity cap to prevent too fast falling
    if (bird.velocity > 8) {
        bird.velocity = 8;
    }
    
    // Check collisions
    if (bird.y < 0 || bird.y > canvas.height) {
        gameOver();
        return;
    }
    
    // Update pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= currentSpeed;
        
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
        
        // Update score and check for speed increase
        if (!pipes[i].passed && pipes[i].x < bird.x) {
            pipes[i].passed = true;
            updateScore(score + 1);
            
            // Trigger fireworks at 30 points
            if (score === FIREWORK_POINTS) {
                createFirework();
                createFirework();
                createFirework();
            }
            
            if (score % SCORE_THRESHOLD === 0) {
                increaseSpeed();
            }
        }
    }
    
    // Update coins
    for (let i = coins.length - 1; i >= 0; i--) {
        coins[i].x -= currentSpeed;
        
        // Remove off-screen coins
        if (coins[i].x + COIN_SIZE < 0) {
            coins.splice(i, 1);
            continue;
        }
        
        // Check coin collection
        if (!coins[i].collected && checkCoinCollision(coins[i])) {
            coins[i].collected = true;
            updateScore(score + COIN_POINTS);
            
            if (score % SCORE_THRESHOLD === 0) {
                increaseSpeed();
            }
        }
    }
    
    // Check if we need to start laser spawning
    if (score >= LASER_POINTS_THRESHOLD && !laserSpawnLoop) {
        laserSpawnLoop = setInterval(spawnRandomLaser, LASER_INTERVAL);
    }
    
    // Update lasers
    for (let i = lasers.length - 1; i >= 0; i--) {
        const laser = lasers[i];
        laser.x -= LASER_SPEED;

        // Check laser collision
        if (laser.active && checkLaserCollision(laser)) {
            gameOver();
            return;
        }

        // Remove off-screen lasers
        if (laser.x < 0) {
            lasers.splice(i, 1);
        }
    }
    
    // Update fireworks
    for (let i = fireworks.length - 1; i >= 0; i--) {
        const firework = fireworks[i];
        firework.age++;
        
        for (let j = firework.particles.length - 1; j >= 0; j--) {
            const particle = firework.particles[j];
            
            // Update particle
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // Gravity
            particle.alpha = Math.max(0, 1 - firework.age / 50);
            
            // Draw particle
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            ctx.fillRect(particle.x, particle.y, 2, 2);
        }
        
        // Remove old fireworks
        if (firework.age > 50) {
            fireworks.splice(i, 1);
        }
    }
    
    // Reset alpha for other drawings
    ctx.globalAlpha = 1;
    
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

function checkCoinCollision(coin) {
    return (
        bird.x < coin.x + COIN_SIZE &&
        bird.x + bird.size > coin.x &&
        bird.y < coin.y + COIN_SIZE &&
        bird.y + bird.size > coin.y
    );
}

function checkLaserCollision(laser) {
    return (
        bird.x < laser.x + canvas.width &&
        bird.x + bird.size > laser.x &&
        bird.y < laser.y + LASER_HEIGHT &&
        bird.y + bird.size > laser.y
    );
}

function createDeathParticles() {
    birdParticles.length = 0;
    // Create a 2x4 grid of particles
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 4; col++) {
            birdParticles.push({
                x: bird.x + (col * PARTICLE_SIZE),
                y: bird.y + (row * PARTICLE_SIZE),
                vx: (Math.random() - 0.5) * 2, // Slight random horizontal movement
                vy: -4 + Math.random() * 2,    // Initial upward velocity with randomness
                size: PARTICLE_SIZE,
                gravity: 0.4
            });
        }
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (gameStarted) {
        // Draw bird
        ctx.fillStyle = '#FF69B4';
        ctx.fillRect(bird.x, bird.y, bird.size, bird.size);
    } else if (birdParticles.length > 0) {
        // Draw falling particles
        ctx.fillStyle = '#FF69B4';
        
        // Update and draw particles, remove ones that are off screen
        for (let i = birdParticles.length - 1; i >= 0; i--) {
            const particle = birdParticles[i];
            
            // Apply gravity and update position
            particle.vy += particle.gravity;
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Remove if off screen
            if (particle.y > canvas.height) {
                birdParticles.splice(i, 1);
                continue;
            }
            
            // Draw particle
            ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        }
    }
    
    // Draw coins
    ctx.fillStyle = '#FFD700';  // Gold color
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.beginPath();
            ctx.arc(
                coin.x + COIN_SIZE/2,
                coin.y + COIN_SIZE/2,
                COIN_SIZE/2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    });
    
    // Draw pipes with new color
    ctx.fillStyle = '#1E90FF'; // Changed to dodger blue
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.gapStart);
        ctx.fillRect(
            pipe.x,
            pipe.gapStart + pipeGap,
            pipeWidth,
            canvas.height - (pipe.gapStart + pipeGap)
        );
    });

    // Draw lasers
    if (score >= LASER_POINTS_THRESHOLD) {
        ctx.fillStyle = LASER_COLOR;
        lasers.forEach(laser => {
            if (laser.active) {
                ctx.fillRect(laser.x, laser.y, canvas.width, LASER_HEIGHT);
                
                // Add glow effect
                ctx.save();
                ctx.shadowColor = LASER_COLOR;
                ctx.shadowBlur = 10;
                ctx.fillRect(laser.x, laser.y, canvas.width, LASER_HEIGHT);
                ctx.restore();
            }
        });
    }

    // Draw fireworks
    for (let i = fireworks.length - 1; i >= 0; i--) {
        const firework = fireworks[i];
        firework.age++;
        
        for (let j = firework.particles.length - 1; j >= 0; j--) {
            const particle = firework.particles[j];
            
            // Update particle
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // Gravity
            particle.alpha = Math.max(0, 1 - firework.age / 50);
            
            // Draw particle
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            ctx.fillRect(particle.x, particle.y, 2, 2);
        }
        
        // Remove old fireworks
        if (firework.age > 50) {
            fireworks.splice(i, 1);
        }
    }
    
    // Draw game over screen
    if (gameOverScreen) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '48px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(gameOverMessage, canvas.width / 2, canvas.height / 2);
    }
    
    // Reset alpha for other drawings
    ctx.globalAlpha = 1;
}

function gameOver() {
    gameStarted = false;
    gameOverScreen = true;
    createDeathParticles();
    
    // Clear game intervals immediately
    clearInterval(gameLoop);
    clearInterval(pipeSpawnLoop);
    clearInterval(laserSpawnLoop);
    
    // Start a new animation loop just for the particles and game over screen
    const particleLoop = setInterval(() => {
        if (birdParticles.length === 0) {
            clearInterval(particleLoop);
            startButton.style.display = 'none'; // Hide the start button
        }
        draw();
    }, 1000/60);
}

// Initial draw
draw();

function createCat() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 30 + Math.random() * 20,
        speed: 0.2 + Math.random() * 0.3,
        pawOffset: Math.random() * Math.PI * 2, // Random starting phase for paw movement
        pawHeight: 5 // Height of paw movement
    };
} 

function updateScore(newScore) {
    // Cap the score at 9999
    score = Math.min(newScore, 9999);
    scoreElement.textContent = score;
    
    if (score > highScore) {
        // Also cap the high score at 9999
        highScore = Math.min(score, 9999);
        localStorage.setItem('flappyHighScore', highScore);
        highScoreElement.textContent = `High Score: ${highScore}`;
    }
}