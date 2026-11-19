const modal = document.getElementById('puzzle-modal');
const board = document.getElementById('puzzle-board');
const puzzleScore = document.getElementById('puzzle-score');
const puzzleBest = document.getElementById('puzzle-best');
const closeButton = document.getElementById('puzzle-close');

const size = 3;
const totalTiles = size * size;

let tiles = [];
let emptyIndex = totalTiles - 1;
let isAnimating = false;
let isWon = false;

let curMoves = 0;
let currentImgSrc = '';

document.querySelectorAll('img:not(.logo)').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => loadAndOpenPuzzle(img.src));
});

closeButton.onclick = () => {
    modal.classList.remove('active');
}

function loadAndOpenPuzzle(imgSrc) {
    currentImgSrc = imgSrc;
    isWon = false;

    board.classList.remove('won');
    modal.classList.add('active');

    curMoves = 0;
    puzzleScore.textContent = curMoves;

    updateBestDisplay(imgSrc);
    
    // i dont actually use this image its just for getting aspect ratio
    const imgObj = new Image();
    imgObj.src = imgSrc;
    imgObj.onload = () => {
        const aspectRatio = imgObj.naturalWidth / imgObj.naturalHeight;
        board.style.setProperty('--aspect-ratio', aspectRatio);
        initPuzzle(imgSrc);
    };
}

// url to rng seed
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function random(a) {
    return function() {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function initPuzzle(imgSrc) {
    tiles = Array.from({ length: totalTiles }, (_, i) => i);
    emptyIndex = totalTiles - 1;
  
    const seed = hashCode(imgSrc);
    const rng = random(seed);
    
    // shuffle code
    let prevEmptyIndex = -1;
    for (let i = 0; i < 100; i++) {
        let validMoves = getValidMoves(emptyIndex);
        
        // no backtracking  !!
        if (prevEmptyIndex !== -1 && validMoves.length > 1) {
            validMoves = validMoves.filter(m => m !== prevEmptyIndex);
        }

        const randomMove = validMoves[Math.floor(rng() * validMoves.length)];
        
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
        tile.addEventListener('mouseenter', () => handleTileHover(i));
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

    curMoves += 1;
    puzzleScore.textContent = curMoves;
    const event = new CustomEvent("moveMade");
    window.dispatchEvent(event);

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

function handleTileHover(hoveredTileId) {
    const hoveredTile = tileElements[hoveredTileId];
    if (!isAnimating && !isWon && !hoveredTile.classList.contains('empty')) {
        const event = new CustomEvent("tileHovered");
        window.dispatchEvent(event);
    }
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
        checkAndSaveBestScore(currentImgSrc);

        const event = new CustomEvent("puzzleWon");
        window.dispatchEvent(event);
    }
}


function checkAndSaveBestScore(imgSrc) {
    const key = `puzzle_best_score_${imgSrc}`;
    const savedBest = localStorage.getItem(key);
    
    if (!savedBest || curMoves < parseInt(savedBest, 10)) {
        localStorage.setItem(key, curMoves);
        updateBestDisplay(imgSrc);
    }
}

function updateBestDisplay(imgSrc) {
    if (!puzzleBest) return;
    const key = `puzzle_best_score_${imgSrc}`;
    const savedBest = localStorage.getItem(key);
    if (savedBest !== null) {
        puzzleBest.textContent = parseInt(savedBest, 10);
    } else {
        puzzleBest.textContent = '-';
    }
}