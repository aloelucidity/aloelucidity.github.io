document.addEventListener('DOMContentLoaded', () => {
    const hoverSound = document.getElementById('hover-sound');
    const clickSound = document.getElementById('click-sound');
    const backSound = document.getElementById('back-sound');
    const tileHoverSound = document.getElementById('tile-hover-sound');
    const mouseClickSound = document.getElementById('mouse-click-sound');
    const puzzleWinSound = document.getElementById('puzzle-win-sound');
    const luciSound = document.getElementById('luci-sound');
    const luciOwSound = document.getElementById('luci-ow-sound');
    const multUpSound = document.getElementById('mult-up-sound');
    const expUpSound = document.getElementById('exp-up-sound');
    const toggleButton = document.getElementById('sound-toggle');
    let soundEnabled = localStorage.getItem('soundEnabled') !== 'false';

    // Update button text/state on load
    function updateToggleUI() {
    toggleButton.textContent = soundEnabled ? 'sound: on' : 'sound: off';
    toggleButton.classList.toggle('muted', !soundEnabled);
    }
    updateToggleUI();

    toggleButton.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        localStorage.setItem('soundEnabled', soundEnabled);
        updateToggleUI();
    });

    function playSound(audioElement, semitoneShift = 0) {
        if (!soundEnabled) return;

        const rate = Math.pow(2, semitoneShift / 12);
        audioElement.preservesPitch = false;
        audioElement.playbackRate = rate;

        audioElement.volume = 0.35;
        audioElement.currentTime = 0;
        audioElement.play().catch(() => {});
    }

    document.querySelectorAll('a, button, img:not(.logo), .close-button, .nav-button, label').forEach(element => {
        element.addEventListener('mouseenter', () => {
            playSound(hoverSound);
        });
    });

    document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function(e) {
        if (!soundEnabled) return;
        
        e.preventDefault(); 
        const targetUrl = this.href;

        playSound(clickSound);

        clickSound.onended = () => {
        window.location.href = targetUrl;
        };

        setTimeout(() => {
        window.location.href = targetUrl;
        }, 1000);
    });
    });

    const luci = document.getElementById("clickable-luci");
    if (luci) {
        luci.addEventListener('mousedown', () => {
            playSound(luciSound);
        })
    }

    const pcLuci = document.getElementById("pc-luci");
    if (pcLuci) {
        pcLuci.addEventListener('mousedown', () => {
            const randomSemitones = (Math.random() * 4) - 2;
            playSound(luciOwSound, randomSemitones);
        })
    }

    window.addEventListener('multUp', (event) => {
        playSound(multUpSound);
    });

    window.addEventListener('expUp', (event) => {
        playSound(expUpSound);
    });

    window.addEventListener('tileHovered', (event) => {
        playSound(tileHoverSound);
    });

    window.addEventListener('moveMade', (event) => {
        playSound(mouseClickSound);
    });

    window.addEventListener('puzzleWon', (event) => {
        playSound(puzzleWinSound);
    });

    document.querySelectorAll('.sound-toggle, .submit-button, img:not(.logo), .typo-start-button, .accept-button').forEach(btn => {
        btn.addEventListener('click', () => {
            playSound(clickSound);
        });
    });

    document.querySelectorAll('.game-show-input').forEach(btn => {
        btn.addEventListener('click', () => {
            playSound(mouseClickSound);
        });
    });

    document.querySelectorAll('.close-button').forEach(btn => {
        btn.addEventListener('click', () => {
            playSound(backSound);
        });
    });
})