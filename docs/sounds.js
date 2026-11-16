document.addEventListener('DOMContentLoaded', () => {
    const hoverSound = document.getElementById('hover-sound');
    const clickSound = document.getElementById('click-sound');
    const luciSound = document.getElementById('luci-sound');
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

    function playSound(audioElement) {
        if (!soundEnabled) return;
        audioElement.volume = 0.35;
        audioElement.currentTime = 0;
        audioElement.play().catch(() => {});
    }

    document.querySelectorAll('a, button, img').forEach(element => {
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
        luci.addEventListener('click', () => {
            playSound(luciSound);
        })
    }

    window.addEventListener('multUp', (event) => {
        playSound(multUpSound);
    });

    window.addEventListener('expUp', (event) => {
        playSound(expUpSound);
    });

    document.querySelectorAll('.sound-toggle, .submit-button, img').forEach(btn => {
        btn.addEventListener('click', () => {
            playSound(clickSound);
        });
    });
})