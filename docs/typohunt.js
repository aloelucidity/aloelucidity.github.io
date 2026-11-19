// helpers!!

import { WORDS } from './words.js';

function getDailySeed() {
    const d = new Date();
    const dateString = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
        hash = (hash << 5) - hash + dateString.charCodeAt(i);
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

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const secsStr = seconds < 10 ? '0' + seconds.toFixed(2) : seconds.toFixed(2);
    return `${minutes}:${secsStr}s`;
}

function remToPx(rem) {
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return rem * rootFontSize;
}

// popup stuff and things

const typoStartButton = document.getElementById("typo-start-button");

const modal = document.getElementById('typo-modal');
const closeButton = document.getElementById('typo-close');
const acceptButton = document.getElementById('typo-accept');

const resultsModal = document.getElementById('typo-results-modal');
const resultsCloseButton = document.getElementById('typo-results-close');

const typoTracker = document.getElementById('typo-tracker');

typoStartButton.onclick = () => {
    if (!isWon) {
        modal.classList.add('active');
    }
    else {
        resultsModal.classList.add('active');
    }
    typoStartButton.classList.add('hidden');
}
closeButton.onclick = () => {
    modal.classList.remove('active');
    typoStartButton.classList.remove('hidden');
}
acceptButton.onclick = () => {
    modal.classList.remove('active');
    initGame();
    typoTracker.classList.add('active')
}
resultsCloseButton.onclick = () => {
    resultsModal.classList.remove('active');
    typoStartButton.classList.remove('hidden');
}

// the game . which you just LOST! mwahwahahaha im so evil

let isWon = false;
let savedTimes = {};
let seed = getDailySeed();
let rng = random(seed);
let randomWord = WORDS[Math.floor(rng() * WORDS.length)];

function updateHint() {
    const hintText = document.querySelector('.typo-hint');
    if (!hintText) return;

    const activeTypos = document.querySelectorAll('.typo[data-scrambled="true"]');
    
    if (activeTypos.length === 0) {
        return;
    }

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    let closestTypo = null;
    let minDistance = Infinity;

    activeTypos.forEach(typo => {
        const rect = typo.getBoundingClientRect();
        const typoCenterX = rect.left + rect.width / 2;
        const typoCenterY = rect.top + rect.height / 2;

        const distance = Math.hypot(typoCenterX - centerX, typoCenterY - centerY);

        if (distance < minDistance) {
            minDistance = distance;
            closestTypo = { rect, typoCenterX, typoCenterY };
        }
    });

    const THRESHOLD_PX = remToPx(50);
    if (minDistance <= THRESHOLD_PX) {
        hintText.textContent = "typo nearby!";
    } else {
        if (closestTypo.typoCenterY > centerY) {
            hintText.textContent = "too high!";
        } else {
            hintText.textContent = "too low!";
        }
    }
}

function initGame() {
    rng = random(seed);
    
    const containers = document.querySelectorAll('.typo-text');
    const charElements = [];
    let globalIndex = 0;

    containers.forEach(container => {
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
        const textNodes = [];
        
        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }

        textNodes.forEach(textNode => {
            const text = textNode.nodeValue;
            const fragment = document.createDocumentFragment();
            
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const span = document.createElement('span');
                span.textContent = char;
                span.dataset.original = char;
                fragment.appendChild(span);
                
                if (/[a-z]/.test(char)) {
                    charElements.push({ element: span, originalIndex: globalIndex++ });
                }
            }
            
            textNode.parentNode.replaceChild(fragment, textNode);
        });
    });

    // to stop the algorithm from making a "typo" by replacing a character
    // with an identical character, it can't pick letters that exist in the selected word
    // this makes the game easier but eh i think thats a good thing tbh
    const validElements = charElements.filter(item => {
        return !randomWord.includes(item.element.dataset.original.toLowerCase());
    });

    const shuffled = [...validElements];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const chosenTypos = shuffled.slice(0, 5);
    chosenTypos.sort((a, b) => a.originalIndex - b.originalIndex);

    const startTime = performance.now();
    const mainTimerText = document.querySelector('.typo-timer');
    const columns = document.querySelectorAll('.typo-column');
    
    let foundCount = 0;

    const timerInterval = setInterval(() => {
        const elapsedSeconds = (performance.now() - startTime) / 1000;
        mainTimerText.textContent = `time - ${formatTime(elapsedSeconds)}`;
        updateHint();
    }, 50);
    
    chosenTypos.forEach((item, slotIndex) => {
        const originalChar = item.element.dataset.original;
        const scrambledChar = randomWord[slotIndex];
        
        item.element.textContent = scrambledChar;
        item.element.dataset.scrambled = "true";
        item.element.classList.add('typo');

        item.element.addEventListener('click', function() {
            if (this.dataset.scrambled === "true") {
                this.textContent = this.dataset.original;
                this.dataset.scrambled = "false";
                this.classList.remove('typo');
                
                const elapsedSeconds = (performance.now() - startTime) / 1000;
                if (columns[slotIndex]) {
                    const charDiv = columns[slotIndex].querySelector('.typo-char');
                    const timeDiv = columns[slotIndex].querySelector('.typo-time');
                    
                    if (charDiv) charDiv.textContent = scrambledChar;
                    if (timeDiv) timeDiv.textContent = formatTime(elapsedSeconds);
                    
                    savedTimes[slotIndex] = elapsedSeconds;
                }

                foundCount++;
                if (foundCount === 5) {
                    clearInterval(timerInterval);
                    winGame(elapsedSeconds);
                }
            }
        });
    });
}

function winGame(elapsedSeconds) {
    isWon = true;

    const mainTimerText = document.querySelector('.typo-timer');
    mainTimerText.textContent = `time - ${formatTime(elapsedSeconds)}`;

    const hintText = document.querySelector('.typo-hint');
    hintText.textContent = 'congrats ^^';

    resultsModal.classList.add('active');
    typoTracker.classList.remove('active');

    const resultsTimerText = document.querySelector('.typo-results-timer');
    const resultsColumns = document.querySelectorAll('.typo-results-column');
    resultsTimerText.textContent = `total time - ${formatTime(elapsedSeconds)}`;

    for (let slotIndex = 0; slotIndex < 5; slotIndex++) {
        const scrambledChar = randomWord[slotIndex];
        if (resultsColumns[slotIndex]) {
            const charDiv = resultsColumns[slotIndex].querySelector('.typo-results-char');
            const timeDiv = resultsColumns[slotIndex].querySelector('.typo-results-time');
            
            if (charDiv) charDiv.textContent = scrambledChar;
            if (timeDiv) timeDiv.textContent = formatTime(savedTimes[slotIndex]);
        }
    }
}