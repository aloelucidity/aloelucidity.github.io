// helpers!!

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

const DAILY_WORDS = [
    "mario", "luigi", "wario", "yoshi",
];

// the game . which you just LOST! mwahwahahaha im so evil

function initGame() {
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

    const seed = getDailySeed();
    const rng = random(seed);

    const shuffled = [...charElements];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const chosenTypos = shuffled.slice(0, 5);
    chosenTypos.sort((a, b) => a.originalIndex - b.originalIndex);

    const startTime = performance.now();
    const mainTimerEl = document.querySelector('.typo-timer');
    const columns = document.querySelectorAll('.typo-column');
    
    let foundCount = 0;

    const timerInterval = setInterval(() => {
        const elapsedSeconds = (performance.now() - startTime) / 1000;
        if (mainTimerEl) {
            mainTimerEl.textContent = `time - ${formatTime(elapsedSeconds)}`;
        }
    }, 50);

    chosenTypos.forEach((item, slotIndex) => {
        const originalChar = item.element.dataset.original;
        const scrambledChar = getScrambledChar(originalChar, rng);
        
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
                }

                foundCount++;
                if (foundCount === 5) {
                    clearInterval(timerInterval);
                    console.log("congrats, you won ! !!11 1!");
                }
            }
        });
    });
}

initGame();