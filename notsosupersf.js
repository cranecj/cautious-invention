const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const heightElement = document.getElementById('height');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Game variables
let gameLoop;
let gameStarted = false;
const platforms = [];
let highScore = localStorage.getItem('sfHighScore') || 0;
let currentHeight = 0;
const PLATFORM_GAP_Y = 150;
const PLATFORM_WIDTH = 100;
const PLATFORM_HEIGHT = 20;
const BUFFER_ZONE = 200; // Extra space below and above viewport for platforms

const player = {
    x: 50,
    y: canvas.height - 70,
    width: 30,
    height: 50,
    velocityX: 0,
    velocityY: 0,
    speed: 7,
    jumpForce: -15,
    gravity: 0.5,
    isJumping: false
};

// Add high score display
const highScoreElement = document.createElement('div');
highScoreElement.id = 'highScore';
highScoreElement.textContent = `High Score: ${highScore}m`;
document.querySelector('#content').insertBefore(highScoreElement, canvas);

// Add this variable for game over message
let isGameOver = false;

// Generate initial platforms
function generatePlatforms() {
    platforms.length = 0;
    
    // Ground platform
    platforms.push({
        x: 0,
        y: canvas.height - 20,
        width: canvas.width,
        height: 20
    });

    // Generate initial platforms
    for (let y = canvas.height - PLATFORM_GAP_Y; y > -PLATFORM_GAP_Y; y -= PLATFORM_GAP_Y) {
        let prevX = platforms[platforms.length - 1].x;
        let x = Math.max(50, Math.min(canvas.width - PLATFORM_WIDTH - 50,
            prevX + (Math.random() * 200 - 100))); // Max 100px left or right from previous

        platforms.push({
            x: x,
            y: y,
            width: PLATFORM_WIDTH,
            height: PLATFORM_HEIGHT
        });
    }
}

// Add this function to generate new platforms above
function addNewPlatforms() {
    const highestPlatform = Math.min(...platforms.map(p => p.y));
    const lowestPlatform = Math.max(...platforms.map(p => p.y));
    
    // Add platforms above
    while (highestPlatform > -BUFFER_ZONE) {
        let prevX = platforms.find(p => p.y === highestPlatform).x;
        let x = Math.max(50, Math.min(canvas.width - PLATFORM_WIDTH - 50,
            prevX + (Math.random() * 200 - 100)));

        platforms.push({
            x: x,
            y: highestPlatform - PLATFORM_GAP_Y,
            width: PLATFORM_WIDTH,
            height: PLATFORM_HEIGHT
        });
    }

    // Remove platforms that are too far below
    platforms = platforms.filter(platform => 
        platform.y < canvas.height + BUFFER_ZONE && 
        platform.y > -BUFFER_ZONE
    );
}

function startGame() {
    if (gameStarted) return;
    
    isGameOver = false;
    player.x = 50;
    player.y = canvas.height - 70;
    player.velocityX = 0;
    player.velocityY = 0;
    player.isJumping = false;
    currentHeight = 0;
    heightElement.textContent = '0';
    
    generatePlatforms();
    gameStarted = true;
    gameLoop = setInterval(update, 1000/60);
    startButton.style.display = 'none';
}

// Keyboard input handling
const keys = {};
document.addEventListener('keydown', function(e) {
    e.preventDefault(); // Prevent default browser scrolling
    keys[e.key] = true;
    
    // Handle space restart when game is over
    if (e.code === 'Space' && isGameOver) {
        isGameOver = false;
        startGame();
    }
});
document.addEventListener('keyup', function(e) {
    e.preventDefault(); // Prevent default browser scrolling
    keys[e.key] = false;
});

function handleInput() {
    // WASD controls
    if ((keys['w'] || keys['W'] || keys['ArrowUp']) && !player.isJumping) {
        player.velocityY = player.jumpForce;
        player.isJumping = true;
    }
    
    // Left movement
    if (keys['a'] || keys['A'] || keys['ArrowLeft']) {
        player.velocityX = -player.speed;
    }
    // Right movement
    if (keys['d'] || keys['D'] || keys['ArrowRight']) {
        player.velocityX = player.speed;
    }
}

function checkCollision(platform) {
    return player.x < platform.x + platform.width &&
           player.x + player.width > platform.x &&
           player.y + player.height > platform.y &&
           player.y < platform.y + platform.height;
}

function update() {
    if (!gameStarted) return;

    handleInput();
    
    player.velocityY += player.gravity;
    player.x += player.velocityX;
    player.y += player.velocityY;

    // Check platform collisions
    player.isJumping = true;
    platforms.forEach(platform => {
        if (checkCollision(platform)) {
            if (player.velocityY > 0) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.isJumping = false;
            }
        }
    });

    // Screen boundaries
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Camera follow and platform generation
    if (player.y < canvas.height / 2) {
        const offset = canvas.height / 2 - player.y;
        player.y += offset;
        
        // Move all platforms down
        platforms.forEach(platform => {
            platform.y += offset;
        });

        // Generate/remove platforms
        addNewPlatforms();
        
        // Update current height
        currentHeight += offset / 10;
        heightElement.textContent = Math.floor(currentHeight);
        
        // Update high score
        if (currentHeight > highScore) {
            highScore = Math.floor(currentHeight);
            localStorage.setItem('sfHighScore', highScore);
            highScoreElement.textContent = `High Score: ${highScore}m`;
        }
    }

    // Check lose condition (falling off screen)
    if (player.y > canvas.height + PLATFORM_HEIGHT) {
        gameOver(false);
    }

    player.velocityX = 0;
    draw();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB';  // Sky blue background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw platforms
    ctx.fillStyle = '#8B4513';  // Brown color for platforms
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw player
    ctx.fillStyle = '#333';  // Dark gray for player
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function gameOver(won) {
    gameStarted = false;
    isGameOver = true;
    clearInterval(gameLoop);
    
    // Draw game over message
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width/2, canvas.height/2 - 30);
    
    ctx.font = '24px Arial';
    ctx.fillText('Press Space to Restart', canvas.width/2, canvas.height/2 + 20);
    ctx.fillText(`Height: ${Math.floor(currentHeight)}m`, canvas.width/2, canvas.height/2 + 60);
}

startButton.addEventListener('click', startGame);

// Initial draw
draw(); 