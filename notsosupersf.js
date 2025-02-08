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

const player = {
    x: 50,
    y: canvas.height - 70,
    width: 30,
    height: 50,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    jumpForce: -15,
    gravity: 0.5,
    isJumping: false
};

const platforms = [];
const PLATFORM_WIDTH = 100;
const PLATFORM_HEIGHT = 20;
const PLATFORM_GAP = 150;
const MAX_PLATFORM_SPACING = 150;

// Add this variable to track if floor is visible
let floorVisible = true;

// Add these constants for new platform types
const PLATFORM_TYPES = {
    NORMAL: 'normal',
    BOUNCY: 'bouncy',
    FALLING: 'falling'
};

// Add these platform properties
const BOUNCY_FORCE = -25;
const FALLING_DELAY = 500; // half second in milliseconds

// Generate initial platforms
function generatePlatforms() {
    platforms.length = 0;  // Clear existing platforms
    
    // Ground platform
    platforms.push({
        x: 0,
        y: canvas.height - 20,
        width: canvas.width,
        height: 20,
        type: PLATFORM_TYPES.NORMAL
    });

    // Generate initial platforms
    for (let y = canvas.height - PLATFORM_GAP; y > 0; y -= PLATFORM_GAP) {
        let x = Math.random() * (canvas.width - PLATFORM_WIDTH);
        
        platforms.push({
            x: x,
            y: y,
            width: PLATFORM_WIDTH,
            height: PLATFORM_HEIGHT,
            type: PLATFORM_TYPES.NORMAL,
            touchTime: 0,
            falling: false,
            fallSpeed: 0
        });
    }
}

function startGame() {
    if (gameStarted) return;
    
    // Reset game state
    player.x = 50;
    player.y = canvas.height - 70;
    player.velocityX = 0;
    player.velocityY = 0;
    player.isJumping = false;
    
    // Generate platforms
    generatePlatforms();
    console.log('Platforms generated:', platforms);  // Debug log
    
    gameStarted = true;
    gameLoop = setInterval(update, 1000/60);
    startButton.style.display = 'none';
}

function handleInput() {
    // WASD controls
    if ((keys['w'] || keys['W']) && !player.isJumping) {
        player.velocityY = player.jumpForce;
        player.isJumping = true;
    }
    if (keys['a'] || keys['A']) player.velocityX = -player.speed;
    if (keys['d'] || keys['D']) player.velocityX = player.speed;

    // Arrow key controls
    if (keys['ArrowUp'] && !player.isJumping) {
        player.velocityY = player.jumpForce;
        player.isJumping = true;
    }
    if (keys['ArrowLeft']) player.velocityX = -player.speed;
    if (keys['ArrowRight']) player.velocityX = player.speed;
}

function checkCollision(platform) {
    return player.x < platform.x + platform.width &&
           player.x + player.width > platform.x &&
           player.y + player.height > platform.y &&
           player.y < platform.y + platform.height;
}

// Add this function to generate new platforms above
function addNewPlatformsAbove() {
    const highestPlatform = platforms.reduce((highest, platform) => 
        platform.y < highest ? platform.y : highest, canvas.height);
        
    if (highestPlatform > 0) {
        let currentHeight = highestPlatform - PLATFORM_GAP;
        let lastX = platforms.find(p => p.y === highestPlatform).x;

        while (currentHeight > -PLATFORM_GAP) {
            let minX = Math.max(0, lastX - MAX_PLATFORM_SPACING);
            let maxX = Math.min(canvas.width - PLATFORM_WIDTH, lastX + MAX_PLATFORM_SPACING);
            let newX = minX + Math.random() * (maxX - minX);
            
            let type = PLATFORM_TYPES.NORMAL;
            const rand = Math.random();
            if (rand < 0.2) {
                type = PLATFORM_TYPES.BOUNCY;
            } else if (rand < 0.4) {
                type = PLATFORM_TYPES.FALLING;
            }

            platforms.push({
                x: newX,
                y: currentHeight,
                width: PLATFORM_WIDTH,
                height: PLATFORM_HEIGHT,
                type: type,
                touchTime: 0,
                falling: false,
                fallSpeed: 0
            });
            
            lastX = newX;
            currentHeight -= PLATFORM_GAP;
        }
    }
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
                switch(platform.type) {
                    case PLATFORM_TYPES.BOUNCY:
                        player.velocityY = BOUNCY_FORCE;
                        break;
                    case PLATFORM_TYPES.FALLING:
                        if (!platform.falling) {
                            if (platform.touchTime === 0) {
                                platform.touchTime = Date.now();
                            } else if (Date.now() - platform.touchTime > FALLING_DELAY) {
                                platform.falling = true;
                            }
                            player.y = platform.y - player.height;
                            player.velocityY = 0;
                            player.isJumping = false;
                        }
                        break;
                    default:
                        player.y = platform.y - player.height;
                        player.velocityY = 0;
                        player.isJumping = false;
                }
            }
        }
    });

    // Update falling platforms
    platforms.forEach(platform => {
        if (platform.falling) {
            platform.fallSpeed += player.gravity;
            platform.y += platform.fallSpeed;
        }
    });

    // Remove off-screen platforms
    platforms = platforms.filter(platform => platform.y < canvas.height + 100);

    // Generate new platforms above as player climbs
    if (player.y < canvas.height / 2) {
        addNewPlatformsAbove();
        // Move everything down
        const offset = canvas.height / 2 - player.y;
        player.y += offset;
        platforms.forEach(platform => platform.y += offset);
    }

    // Screen boundaries
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Update height display
    const height = Math.max(0, Math.floor((canvas.height - player.y) / 10));
    heightElement.textContent = height;

    // Check if floor is visible
    const viewportBottom = player.y + canvas.height/2;
    floorVisible = viewportBottom >= canvas.height - 20;

    // Check lose condition (falling when floor not visible)
    if (!floorVisible && player.velocityY > 0 && player.y > canvas.height/2) {
        gameOver(false);
    }

    player.velocityX = 0;
    draw();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB';  // Sky blue background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw platforms - add console log to debug
    console.log('Number of platforms:', platforms.length);
    platforms.forEach(platform => {
        ctx.fillStyle = '#8B4513';  // Brown color for platforms
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw player
    ctx.fillStyle = '#333';  // Dark gray for player
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function gameOver(won) {
    gameStarted = false;
    clearInterval(gameLoop);
    startButton.style.display = 'block';
    startButton.textContent = won ? 'You Won! Play Again?' : 'Try Again';
}

// Keyboard input handling
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

startButton.addEventListener('click', startGame);

// Initial draw
draw(); 