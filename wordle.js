// wordle.js
const wordleBoard = document.getElementById('wordleBoard');
const wordleResult = document.getElementById('wordleResult');
const newWordleGameButton = document.getElementById('newWordleGameButton');
const keyboard = document.getElementById('keyboard');

let currentWord = '';
let currentGuess = '';
let attempts = 0;
const maxAttempts = 6;
let cheatCode = '';

newWordleGameButton.addEventListener('click', startNewGame);

function startNewGame() {
    if (targetWords.length === 0) return;
    currentWord = targetWords[Math.floor(Math.random() * targetWords.length)].toUpperCase();
    currentGuess = '';
    attempts = 0;
    wordleResult.textContent = '';
    wordleBoard.innerHTML = '';
    keyboard.innerHTML = '';
    createWordleGrid();
    createKeyboard();
}

function createWordleGrid() {
    for (let i = 0; i < maxAttempts; i++) {
        const row = document.createElement('div');
        row.classList.add('wordle-row');
        for (let j = 0; j < currentWord.length; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            row.appendChild(cell);
        }
        wordleBoard.appendChild(row);
    }
}

function createKeyboard() {
    const rows = [
        'QWERTYUIOP',
        'ASDFGHJKL',
        'ZXCVBNM'
    ];
    rows.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('keyboard-row');
        row.split('').forEach(letter => {
            const key = document.createElement('div');
            key.classList.add('key');
            key.textContent = letter;
            rowDiv.appendChild(key);
        });
        keyboard.appendChild(rowDiv);
    });
}

function handleKeyPress(event) {
    if (attempts >= maxAttempts) return;

    const key = event.key.toUpperCase();
    
    // Handle cheat code
    if (/^[0-9]$/.test(event.key)) {
        cheatCode += event.key;
        if (cheatCode === '4321') {
            alert(`The word is: ${currentWord}`);
            cheatCode = '';
        }
    } else {
        cheatCode = ''; // Reset cheat code if any other key is pressed
    }

    if (key === 'ENTER') {
        if (currentGuess.length === currentWord.length) {
            if (isValidWord(currentGuess)) {
                checkGuess();
            } else {
                wordleResult.textContent = 'Not a valid word!';
            }
        }
    } else if (key === 'BACKSPACE') {
        currentGuess = currentGuess.slice(0, -1);
        updateGrid();
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < currentWord.length) {
        currentGuess += key;
        updateGrid();
    }
}

function updateGrid() {
    const row = wordleBoard.children[attempts];
    for (let i = 0; i < currentWord.length; i++) {
        const cell = row.children[i];
        cell.textContent = currentGuess[i] || '';
    }
}

function checkGuess() {
    const row = wordleBoard.children[attempts];
    const guessedLetters = {};

    for (let i = 0; i < currentWord.length; i++) {
        const cell = row.children[i];
        const letter = currentGuess[i];
        guessedLetters[letter] = guessedLetters[letter] || { correct: false, present: false };

        if (letter === currentWord[i]) {
            cell.style.backgroundColor = 'green';
            guessedLetters[letter].correct = true;
        } else if (currentWord.includes(letter)) {
            cell.style.backgroundColor = 'yellow';
            guessedLetters[letter].present = true;
        } else {
            cell.style.backgroundColor = 'gray';
        }
    }

    updateKeyboard(guessedLetters);

    if (currentGuess === currentWord) {
        wordleResult.textContent = 'Congratulations! You guessed the word!';
        triggerWinAnimation();
    } else {
        attempts++;
        currentGuess = '';
        if (attempts >= maxAttempts) {
            wordleResult.textContent = `Game Over! The word was: ${currentWord}`;
        }
    }
}

function updateKeyboard(guessedLetters) {
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        const letter = key.textContent;
        if (guessedLetters[letter]) {
            if (guessedLetters[letter].correct) {
                key.classList.add('correct');
            } else if (guessedLetters[letter].present) {
                key.classList.add('present');
            } else {
                key.classList.add('tried');
            }
        }
    });
}

function isValidWord(word) {
    return validWords.includes(word.toLowerCase());
}

function triggerWinAnimation() {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 7,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
        });
        confetti({
            particleCount: 7,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

document.addEventListener('keydown', handleKeyPress);
startNewGame();
