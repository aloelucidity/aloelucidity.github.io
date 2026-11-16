const modal = document.getElementById('puzzle-modal');
const board = document.getElementById('puzzle-board');
const timer = document.getElementById('puzzle-timer');
const best = document.getElementById('puzzle-best');
const closeButton = document.querySelector('.close-button');

const size = 3;
const totalTiles = size * size;

let tiles = [];
let emptyIndex = totalTiles - 1;
let isAnimating = false;
let isWon = false;

let startTime = null;
let timerInterval = null;
let elapsedTime = 0;

updateBestDisplay();

document.querySelectorAll('img:not(.logo)').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => loadAndOpenPuzzle(img.src));
});

closeButton.onclick = () => {
    modal.classList.remove('active');
    stopTimer();
}

function loadAndOpenPuzzle(imgSrc) {
    isWon = false;
    board.classList.remove('won');
    modal.classList.add('active');

    resetTimer();
    startTimer();
    
    // i dont actually use this image its just for getting aspect ratio
    const imgObj = new Image();
    imgObj.src = imgSrc;
    imgObj.onload = () => {
        const aspectRatio = imgObj.naturalWidth / imgObj.naturalHeight;
        board.style.setProperty('--aspect-ratio', aspectRatio);
        initPuzzle(imgSrc);
    };
}

function initPuzzle(imgSrc) {
    tiles = Array.from({ length: totalTiles }, (_, i) => i);
    emptyIndex = totalTiles - 1;
  
    // shuffle code
    let prevEmptyIndex = -1;
    for (let i = 0; i < 100; i++) {
        let validMoves = getValidMoves(emptyIndex);
        
        // no backtracking  !!
        if (prevEmptyIndex !== -1 && validMoves.length > 1) {
            validMoves = validMoves.filter(m => m !== prevEmptyIndex);
        }

        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        
        prevEmptyIndex = emptyIndex;
        tiles[emptyIndex] = tiles[randomMove];
        tiles[randomMove] = totalTiles - 1;
        emptyIndex = randomMove;
    }

    // instancing code
    tileElements = [];
    for (let i = 0; i < totalTiles; i++) {
        const tile = document.createElement('div');
        tile.className = 'puzzle-tile';

        if (i === totalTiles - 1) {
            tile.classList.add('empty');
        }

        const col = i % size;
        const row = Math.floor(i / size);
        tile.style.backgroundImage = `url(${imgSrc})`;
        tile.style.backgroundPosition = `${(col / (size - 1)) * 100}% ${(row / (size - 1)) * 100}%`;
    
        tile.addEventListener('click', () => handleTileClick(i));
        tileElements.push(tile);
    }
  
    renderBoard();
}

function getValidMoves(idx) {
    const row = Math.floor(idx / size);
    const col = idx % size;
    const moves = [];
    if (row > 0) moves.push(idx - size);
    if (row < size - 1) moves.push(idx + size);
    if (col > 0) moves.push(idx - 1);
    if (col < size - 1) moves.push(idx + 1);
    return moves;
}

function renderBoard() {
    board.innerHTML = '';
    tiles.forEach(tileId => {
      board.appendChild(tileElements[tileId]);
    });
}

function handleTileClick(clickedTileId) {
    if (isAnimating || isWon) return;
  
    const currentIndex = tiles.indexOf(clickedTileId);
    if (!isAdjacent(currentIndex, emptyIndex)) return;
  
    isAnimating = true;
  
    const movingTile = tileElements[clickedTileId];
    const emptyTile = tileElements[totalTiles - 1];
  
    const firstMovingRect = movingTile.getBoundingClientRect();
    const firstEmptyRect = emptyTile.getBoundingClientRect();
  
    tiles[emptyIndex] = clickedTileId;
    tiles[currentIndex] = totalTiles - 1;
    emptyIndex = currentIndex;
  
    renderBoard();
  
    const lastMovingRect = movingTile.getBoundingClientRect();
    const lastEmptyRect = emptyTile.getBoundingClientRect();
  
    const dMovingX = firstMovingRect.left - lastMovingRect.left;
    const dMovingY = firstMovingRect.top - lastMovingRect.top;
    const dEmptyX = firstEmptyRect.left - lastEmptyRect.left;
    const dEmptyY = firstEmptyRect.top - lastEmptyRect.top;
  
    const initialTransition = movingTile.style.transition;
    const initialTransform = movingTile.style.transform;

    movingTile.style.transition = 'none';
    movingTile.style.transform = initialTransform + ` translate(${dMovingX}px, ${dMovingY}px)`;
  
    // this line makes it update. feels hacky but whatever
    void movingTile.offsetWidth;
  
    movingTile.style.transition = initialTransition;
    movingTile.style.transform = initialTransform;
  
    setTimeout(() => {
        movingTile.style.transition = '';
        isAnimating = false;
        checkWin();
    }, 110);
}

function isAdjacent(i1, i2) {
    const r1 = Math.floor(i1 / size), c1 = i1 % size;
    const r2 = Math.floor(i2 / size), c2 = i2 % size;
    return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}

function checkWin() {
    if (tiles.every((val, idx) => val === idx)) {
        isWon = true;
        board.classList.add('won');
        tileElements[totalTiles - 1].classList.remove('empty');
        stopTimer();
        checkAndSaveBestTime(elapsedTime);
    }
}

// timer stuff

function startTimer() {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(() => {
        elapsedTime = Date.now() - startTime;
        if (timer) timer.textContent = formatTime(elapsedTime);
    }, 30);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    stopTimer();
    elapsedTime = 0;
    if (timer) timer.textContent = '00:00.00';
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const hundredths = Math.floor((ms % 1000) / 10);

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
}

function checkAndSaveBestTime(currentMs) {
    const savedBest = localStorage.getItem('puzzle_best_time');
    
    if (!savedBest || currentMs < parseInt(savedBest, 10)) {
        localStorage.setItem('puzzle_best_time', currentMs);
        updateBestDisplay();
    }
}

function updateBestDisplay() {
    if (!best) return;
    const savedBest = localStorage.getItem('puzzle_best_time');
    if (savedBest !== null) {
        best.textContent = formatTime(parseInt(savedBest, 10));
    } else {
        best.textContent = '--:--.--';
    }
}