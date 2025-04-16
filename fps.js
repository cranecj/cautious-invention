const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const timerElement = document.getElementById('timer');
const timeSelect = document.getElementById('timeSelect');
const crosshairColor = document.getElementById('crosshairColor');

// Set canvas size
canvas.width = 1000;
canvas.height = 800;

// Game variables
let gameActive = false;
let timeLeft = 30;
let targets = [];
let gameInterval;
let timerInterval;
let hits = 0;
let misses = 0;

// Button properties
const buttonWidth = 200;
const buttonHeight = 50;
const buttonX = canvas.width/2 - buttonWidth/2;
const buttonY = canvas.height/2 + 50;

// Target class
class Target {
    constructor() {
        let overlapping;
        let maxAttempts = 50; // Prevent infinite loop
        let attempts = 0;
        
        do {
            overlapping = false;
            this.x = Math.random() * (canvas.width - 40);
            this.y = Math.random() * (canvas.height - 40);
            this.size = 40;
            this.hit = false;
            
            // Check for overlap with existing targets
            for (const target of targets) {
                const dx = this.x - target.x;
                const dy = this.y - target.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < this.size + target.size) {
                    overlapping = true;
                    break;
                }
            }
            attempts++;
        } while (overlapping && attempts < maxAttempts);
    }

    draw() {
        if (!this.hit) {
            // Draw outer red circle
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size/2, 0, Math.PI * 2);
            ctx.fill();

            // Draw white circle
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size/2 - 5, 0, Math.PI * 2);
            ctx.fill();

            // Draw red circle
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size/2 - 10, 0, Math.PI * 2);
            ctx.fill();

            // Draw white circle
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size/2 - 15, 0, Math.PI * 2);
            ctx.fill();

            // Draw center red circle
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size/2 - 20, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    isHit(x, y) {
        if (this.hit) return false;
        const distance = Math.sqrt(
            Math.pow(x - (this.x + this.size/2), 2) + 
            Math.pow(y - (this.y + this.size/2), 2)
        );
        return distance <= this.size/2;
    }
}

// Function to update crosshair color
function updateCrosshairColor() {
    const color = crosshairColor.value;
    // Remove the # from the color code for proper encoding
    const encodedColor = color.replace('#', '%23');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><line x1="12" y1="0" x2="12" y2="24" stroke="${encodedColor}" stroke-width="2"/><line x1="0" y1="12" x2="24" y2="12" stroke="${encodedColor}" stroke-width="2"/></svg>`;
    const cursorUrl = `data:image/svg+xml;utf8,${svg}`;
    canvas.style.cursor = `url('${cursorUrl}') 12 12, crosshair`;
}

// Draw start button
function drawStartButton() {
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Start Game', canvas.width/2, buttonY + buttonHeight/2 + 8);
}

// Check if click is on start button
function isButtonClick(x, y) {
    return x >= buttonX && x <= buttonX + buttonWidth &&
           y >= buttonY && y <= buttonY + buttonHeight;
}

// Handle canvas click
function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    if (!gameActive) {
        if (isButtonClick(x, y)) {
            startGame();
        }
    } else {
        handleClick(event);
    }
}

// Initialize game
function initGame() {
    hits = 0;
    misses = 0;
    timeLeft = parseInt(timeSelect.value);
    targets = [];
    timerElement.textContent = `Time: ${timeLeft}`;
    gameActive = true;
    
    // Create initial targets
    for (let i = 0; i < 5; i++) {
        targets.push(new Target());
    }
}

// Update game state
function update() {
    if (!gameActive) return;
    
    // Clear canvas
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw targets
    targets.forEach(target => target.draw());
    
    // Check if we need more targets
    if (targets.filter(t => !t.hit).length < 3) {
        targets.push(new Target());
    }
}

// Handle mouse click
function handleClick(event) {
    if (!gameActive) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    let hitTarget = false;
    targets.forEach(target => {
        if (target.isHit(x, y)) {
            target.hit = true;
            hits++;
            hitTarget = true;
        }
    });
    
    if (hitTarget) {
        // Remove hit targets after a short delay
        setTimeout(() => {
            targets = targets.filter(t => !t.hit);
        }, 100);
    } else {
        // Subtract 1 second for missing
        timeLeft = Math.max(0, timeLeft - 1);
        misses++;
        timerElement.textContent = `Time: ${timeLeft}`;
        
        // End game if time runs out
        if (timeLeft <= 0) {
            endGame();
        }
    }
}

// Update timer
function updateTimer() {
    timeLeft--;
    timerElement.textContent = `Time: ${timeLeft}`;
    
    if (timeLeft <= 0) {
        endGame();
    }
}

// End game
function endGame() {
    gameActive = false;
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    
    // Calculate accuracy
    const totalShots = hits + misses;
    const accuracy = totalShots > 0 ? Math.round((hits / totalShots) * 100) : 0;
    
    // Show stats
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Game Over!`, canvas.width/2, canvas.height/2 - 60);
    ctx.font = '36px Arial';
    ctx.fillText(`Targets Hit: ${hits}`, canvas.width/2, canvas.height/2);
    ctx.fillText(`Accuracy: ${accuracy}%`, canvas.width/2, canvas.height/2 + 40);
    drawStartButton();
}

// Start game
function startGame() {
    initGame();
    
    // Start game loop
    gameInterval = setInterval(update, 1000/60);
    timerInterval = setInterval(updateTimer, 1000);
}

// Event listeners
canvas.addEventListener('click', handleCanvasClick);
crosshairColor.addEventListener('change', updateCrosshairColor);

// Initial setup
updateCrosshairColor(); // Set initial crosshair color
ctx.fillStyle = '#333';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = 'white';
ctx.font = '48px Arial';
ctx.textAlign = 'center';
ctx.fillText('Click Start to Play', canvas.width/2, canvas.height/2 - 30);
ctx.font = '24px Arial';
ctx.fillText('Best experience with a mouse', canvas.width/2, canvas.height/2 + 20);
drawStartButton(); 