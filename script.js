// script.js
const superBoard = Array(9).fill(null).map(() => Array(9).fill(null));
const smallBoardWins = Array(9).fill(null);
const humanPlayer = '⭕';
const aiPlayer = '❌';
let currentPlayer = humanPlayer;
let nextBoard = -1; // -1 means any board is playable
let gameMode = 'human'; // Default to Human vs Human

const boards = document.querySelectorAll('.board');
const resultDiv = document.getElementById('result');
const newGameButton = document.getElementById('newGameButton');
const modeSelect = document.getElementById('modeSelect');

newGameButton.addEventListener('click', resetGame);
modeSelect.addEventListener('change', (e) => {
    gameMode = e.target.value;
    resetGame();
});

boards.forEach((board, boardIndex) => {
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', () => handleClick(boardIndex, i));
        board.appendChild(cell);
    }
});

function handleClick(boardIndex, cellIndex) {
    if (nextBoard !== -1 && nextBoard !== boardIndex) return;
    if (superBoard[boardIndex][cellIndex] !== null || smallBoardWins[boardIndex] !== null) return;

    makeMove(boardIndex, cellIndex, currentPlayer);
    if (checkWin(superBoard[boardIndex], currentPlayer)) {
        smallBoardWins[boardIndex] = currentPlayer;
        replaceBoardWithEmoji(boardIndex, currentPlayer);
        if (checkWin(smallBoardWins, currentPlayer)) {
            showResult(`${currentPlayer} wins the game!`);
            return;
        }
    }

    if (isBoardFull(superBoard[boardIndex])) {
        smallBoardWins[boardIndex] = 'draw';
    }

    currentPlayer = currentPlayer === humanPlayer ? aiPlayer : humanPlayer;
    nextBoard = smallBoardWins[cellIndex] === null ? cellIndex : -1;
    highlightActiveBoard();

    if (gameMode === 'cpu' && currentPlayer === aiPlayer) {
        setTimeout(() => aiMove(), 500);
    }
}

function aiMove() {
    // Simple AI: Random move in the allowed board
    let availableMoves = [];
    if (nextBoard === -1) {
        for (let i = 0; i < 9; i++) {
            if (smallBoardWins[i] === null) {
                for (let j = 0; j < 9; j++) {
                    if (superBoard[i][j] === null) {
                        availableMoves.push({ board: i, cell: j });
                    }
                }
            }
        }
    } else {
        for (let j = 0; j < 9; j++) {
            if (superBoard[nextBoard][j] === null) {
                availableMoves.push({ board: nextBoard, cell: j });
            }
        }
    }

    if (availableMoves.length > 0) {
        const move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        handleClick(move.board, move.cell);
    }
}

function makeMove(boardIndex, cellIndex, player) {
    superBoard[boardIndex][cellIndex] = player;
    const board = boards[boardIndex];
    const cell = board.children[cellIndex];
    cell.textContent = player;
    cell.classList.add(player === humanPlayer ? 'o' : 'x');
}

function replaceBoardWithEmoji(boardIndex, player) {
    const board = boards[boardIndex];
    Array.from(board.children).forEach(cell => {
        cell.textContent = player;
        cell.classList.add(player === humanPlayer ? 'o' : 'x');
        cell.style.cursor = 'default'; // Disable further clicks
    });
}

function checkWin(board, player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    return winPatterns.some(pattern => 
        pattern.every(index => board[index] === player)
    );
}

function isBoardFull(board) {
    return board.every(cell => cell !== null);
}

function showResult(message) {
    resultDiv.textContent = message;
}

function resetGame() {
    superBoard.forEach(board => board.fill(null));
    smallBoardWins.fill(null);
    boards.forEach(board => {
        Array.from(board.children).forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('o', 'x');
            cell.style.cursor = 'pointer';
        });
        board.classList.remove('active');
    });
    document.body.style.backgroundColor = '#f0f0f0';
    resultDiv.textContent = '';
    currentPlayer = humanPlayer;
    nextBoard = -1;
    highlightActiveBoard();
}

function highlightActiveBoard() {
    boards.forEach((board, index) => {
        if (nextBoard === -1 || nextBoard === index) {
            board.classList.add('active');
        } else {
            board.classList.remove('active');
        }
    });
}

// Initial highlight
highlightActiveBoard();
