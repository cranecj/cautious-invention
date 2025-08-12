# Game Collection

This repository contains a collection of web-based games implemented in HTML5, CSS, and JavaScript. The games are designed to be played in a browser and feature various gameplay mechanics from classic arcade games to modern word puzzles.

## Games Included

### 1. Super Tic Tac Toe (index.html)
**File**: `index.html`, `script.js`
**Description**: An advanced version of the classic tic-tac-toe game featuring a 3x3 grid of smaller tic-tac-toe boards.

**Gameplay**:
- Players alternate between ⭕ (human) and ❌ (AI/second player)
- Two modes: Human vs Human and Human vs CPU
- When you make a move, it determines which small board the opponent must play on next
- Win a small board to claim it with your symbol
- Win three small boards in a row to win the game
- Simple AI opponent with random move selection

**Controls**: Mouse click on cells

### 2. Wordle (wordle.html)
**File**: `wordle.html`, `wordle.js`, `words.js`, `targetwords.js`
**Description**: A word guessing game inspired by the popular Wordle puzzle.

**Gameplay**:
- Guess a 5-letter word in 6 attempts
- Color feedback system:
  - Green: Correct letter in correct position
  - Yellow: Correct letter in wrong position  
  - Gray: Letter not in the word
- On-screen keyboard with color-coded feedback
- Victory celebration with confetti animation

**Controls**: 
- Keyboard input or on-screen keyboard
- ENTER to submit guess
- BACKSPACE to delete letters
- Cheat codes: Press 'V' or type '4321' to reveal the word

### 3. Flappy Square (flappy.html)
**File**: `flappy.html`, `flappy.js`
**Description**: A Flappy Bird-style game with a square character and various gameplay enhancements.

**Gameplay**:
- Control a square bird through pipes by clicking/pressing keys
- Gravity-based physics with jump mechanics
- Scoring system with high score tracking (localStorage)
- Progressive difficulty - speed increases every 20 points
- Collectible coins worth 5 points each
- Special firework collectibles worth 30 points
- Particle effects and visual feedback
- Multiple difficulty levels: easy, medium, hard, demon, impossible
- Game over screen with restart functionality
- Fullscreen mode support

**Controls**:
- SPACE, mouse click, or touch to jump
- Cheat code: Type '1234' for special effects

### 4. Aim Practice (fps.html)  
**File**: `fps.html`, `fps.js`
**Description**: A target shooting game for improving mouse accuracy and reaction time.

**Gameplay**:
- Click on randomly appearing targets before time runs out
- Customizable time limits (10-60 seconds)
- Miss penalty: Each miss reduces time by 1 second
- Target overlap prevention system
- Accuracy tracking (hits vs misses)
- Customizable crosshair colors
- Real-time score display

**Controls**:
- Mouse click to shoot targets
- Time and crosshair color selection via dropdown menus

## Technical Features

### Common Elements
- **Responsive Design**: All games adapt to different screen sizes
- **Navigation Sidebar**: Consistent navigation between games
- **CSS Styling**: Shared styling with game-specific enhancements
- **Local Storage**: High score persistence where applicable
- **Cross-browser Compatibility**: Works in modern web browsers

### File Structure
```
├── index.html          # Super Tic Tac Toe (main page)
├── wordle.html         # Wordle game
├── flappy.html         # Flappy Square game  
├── fps.html            # Aim Practice game
├── script.js           # Super Tic Tac Toe logic
├── wordle.js           # Wordle game logic
├── flappy.js           # Flappy Square game logic
├── fps.js              # Aim Practice game logic
├── styles.css          # Shared styling
├── words.js            # Wordle word dictionary (large)
├── targetwords.js      # Wordle target words list
└── claude.md           # This documentation
```

### Development Notes
- All games use vanilla JavaScript (no frameworks)
- Canvas-based rendering for Flappy Square and Aim Practice
- DOM manipulation for Super Tic Tac Toe and Wordle
- Event-driven architecture with keyboard and mouse input handling
- Modular code structure with clear separation of concerns

### Browser Requirements
- Modern browser with HTML5 support
- JavaScript enabled
- Canvas support for canvas-based games
- Local storage support for high scores

## Getting Started
1. Open any HTML file in a web browser
2. Use the sidebar navigation to switch between games
3. Follow the on-screen instructions for each game
4. Enjoy playing!

Each game is self-contained and can be played independently. The collection provides entertainment for different types of players, from puzzle enthusiasts to arcade game fans.