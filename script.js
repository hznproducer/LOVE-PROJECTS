document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const startScreen = document.getElementById('start-screen');
    const mainScreen = document.getElementById('main-screen');
    const surpriseScreen = document.getElementById('surprise-screen');
    const bgVideo = document.getElementById('bg-video');
    const bars = document.querySelectorAll('.music-bar');
    const playerThumb = document.getElementById('player-thumb');
    const playerTitle = document.getElementById('player-title');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const rewindBtn = document.getElementById('rewind-btn');
    const forwardBtn = document.getElementById('forward-btn');
    const spotifyHeart = document.getElementById('spotify-heart');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const repeatBtn = document.getElementById('repeat-btn');
    const spotifyNotification = document.getElementById('spotify-notification');
    const notifSongTitle = document.getElementById('notif-song-title');
    const notifThumb = document.getElementById('notif-thumb');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const emojiBurstLayer = document.getElementById('emoji-burst-layer');
    const CELEBRATION_EMOJIS = ['❤️', '💖', '✨', '🌹', '💫', '💕'];

    let currentAudio = null;
    let fadeInterval = null;
    let isSurpriseTriggered = false;

    function parseTimeToSeconds(timeStr) {
        if (!timeStr) return 0;
        if (!timeStr.includes(':')) return parseFloat(timeStr) || 0;
        const parts = timeStr.split(':');
        return (parseInt(parts[0], 10) * 60) + (parseFloat(parts[1]) || 0);
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function updatePlayPauseIcon() {
        if(!currentAudio) return;
        if(currentAudio.paused) {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        } else {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        }
    }

    function fadeInAudio(audioNode, duration = 800) {
        if (fadeInterval) clearInterval(fadeInterval);
        audioNode.volume = 0;
        audioNode.play().then(() => updatePlayPauseIcon()).catch(e => {});

        const steps = 15;
        const stepTime = duration / steps;
        const volumeIncrement = 1 / steps;
        let currentStep = 0;

        fadeInterval = setInterval(() => {
            currentStep++;
            let newVol = audioNode.volume + volumeIncrement;
            if (newVol >= 1 || currentStep >= steps) {
                audioNode.volume = 1;
                clearInterval(fadeInterval);
            } else {
                audioNode.volume = newVol;
            }
        }, stepTime);
    }

    function triggerEmojiBurst() {
        if (!emojiBurstLayer) return;
        const total = 22;

        for (let i = 0; i < total; i++) {
            setTimeout(() => {
                const span = document.createElement('span');
                span.className = 'burst-emoji';
                span.textContent = CELEBRATION_EMOJIS[Math.floor(Math.random() * CELEBRATION_EMOJIS.length)];

                const size = 16 + Math.random() * 22;
                const startX = Math.random() * 100;
                const duration = 2.6 + Math.random() * 1.8;
                const drift1 = (Math.random() * 40 - 20).toFixed(0) + 'px';
                const drift2 = (Math.random() * 80 - 40).toFixed(0) + 'px';
                const drift3 = (Math.random() * 60 - 30).toFixed(0) + 'px';
                const rot1 = (Math.random() * 30 - 15).toFixed(0) + 'deg';
                const rot2 = (Math.random() * 60 - 30).toFixed(0) + 'deg';
                const rot3 = (Math.random() * 50 - 25).toFixed(0) + 'deg';

                span.style.left = startX + 'vw';
                span.style.fontSize = size + 'px';
                span.style.setProperty('--drift-1', drift1);
                span.style.setProperty('--drift-2', drift2);
                span.style.setProperty('--drift-3', drift3);
                span.style.setProperty('--rot-1', rot1);
                span.style.setProperty('--rot-2', rot2);
                span.style.setProperty('--rot-3', rot3);
                span.style.animationDuration = duration + 's';

                emojiBurstLayer.appendChild(span);

                setTimeout(() => {
                    if (span.parentNode) span.parentNode.removeChild(span);
                }, duration * 1000 + 150);
            }, i * 70);
        }
    }

    startBtn.addEventListener('click', () => {
        ['audio1', 'audio2', 'audio3'].forEach(id => {
            let audioNode = document.getElementById(id);
            if(audioNode) {
                audioNode.volume = 0;
                let playPromise = audioNode.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        audioNode.pause();
                        audioNode.currentTime = 0;
                    }).catch(error => {});
                }
            }
        });

        startScreen.style.opacity = '0';
        setTimeout(() => {
            startScreen.style.display = 'none';
            mainScreen.style.display = 'flex';
            setTimeout(() => { mainScreen.style.opacity = '1'; }, 20);
        }, 350);
    });

    spotifyHeart.addEventListener('click', () => {
        spotifyHeart.classList.toggle('liked');
    });
    shuffleBtn.addEventListener('click', () => {
        shuffleBtn.classList.toggle('active');
    });
    repeatBtn.addEventListener('click', () => {
        repeatBtn.classList.toggle('active');
        if(currentAudio) currentAudio.loop = repeatBtn.classList.contains('active');
    });

    bars.forEach(bar => {
        const spot = document.createElement('span');
        spot.className = 'apple-spot';
        bar.appendChild(spot);

        const resetTilt = () => {
            bar.style.setProperty('--tilt-x', '0deg');
            bar.style.setProperty('--tilt-y', '0deg');
            bar.style.setProperty('--spot-x', '50%');
            bar.style.setProperty('--spot-y', '40%');
            bar.style.setProperty('--thumb-x', '0px');
            bar.style.setProperty('--thumb-y', '0px');
            bar.classList.remove('is-tilting');
        };

        const applyTilt = (clientX, clientY) => {
            const rect = bar.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
            const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
            bar.style.setProperty('--tilt-x', ((0.5 - y) * 12).toFixed(2) + 'deg');
            bar.style.setProperty('--tilt-y', ((x - 0.5) * 16).toFixed(2) + 'deg');
            bar.style.setProperty('--spot-x', (x * 100).toFixed(1) + '%');
            bar.style.setProperty('--spot-y', (y * 100).toFixed(1) + '%');
            bar.style.setProperty('--thumb-x', ((x - 0.5) * 8).toFixed(1) + 'px');
            bar.style.setProperty('--thumb-y', ((y - 0.5) * 6).toFixed(1) + 'px');
            bar.classList.add('is-tilting');
        };

        bar.addEventListener('pointermove', (e) => {
            if (isSurpriseTriggered) return;
            applyTilt(e.clientX, e.clientY);
        });
        bar.addEventListener('pointerleave', resetTilt);
        bar.addEventListener('pointercancel', resetTilt);

        bar.addEventListener('mouseenter', () => {
            if(isSurpriseTriggered) return;
            const audioId = bar.getAttribute('data-audio');
            const videoSrc = bar.getAttribute('data-video');
            const audioStart = parseTimeToSeconds(bar.getAttribute('data-audio-start'));
            const videoStart = parseTimeToSeconds(bar.getAttribute('data-video-start'));
            if(bgVideo.src !== videoSrc) bgVideo.src = videoSrc;
            bgVideo.currentTime = videoStart;
            bgVideo.play().catch(e => {});
            bgVideo.style.opacity = '1';

            if(currentAudio) {
                if(fadeInterval) clearInterval(fadeInterval);
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }
            currentAudio = document.getElementById(audioId);
            if(currentAudio) {
                currentAudio.currentTime = audioStart;
                fadeInAudio(currentAudio, 600);
            }
        });

        bar.addEventListener('mouseleave', () => {
            if(isSurpriseTriggered) return;
            bgVideo.style.opacity = '0';
            setTimeout(() => { if(!isSurpriseTriggered) bgVideo.pause(); }, 300);
            if(currentAudio) {
                if(fadeInterval) clearInterval(fadeInterval);
                currentAudio.pause();
            }
        });

        bar.addEventListener('click', () => {
            isSurpriseTriggered = true;

            const audioId = bar.getAttribute('data-audio');
            const audioStart = parseTimeToSeconds(bar.getAttribute('data-audio-start'));
            const videoSrc = bar.getAttribute('data-video');
            const videoStart = parseTimeToSeconds(bar.getAttribute('data-video-start'));
            const songTitle = bar.querySelector('h3').innerText;
            const thumbSrc = bar.querySelector('img').src;

            playerTitle.innerText = songTitle;
            notifSongTitle.innerText = songTitle;
            playerThumb.src = thumbSrc;
            notifThumb.src = thumbSrc;

            if(currentAudio && currentAudio.id !== audioId) {
                if(fadeInterval) clearInterval(fadeInterval);
                currentAudio.pause();
            }
            currentAudio = document.getElementById(audioId);
            if(currentAudio) {
                currentAudio.currentTime = audioStart;
                fadeInAudio(currentAudio, 800);
            }

            if(bgVideo.src !== videoSrc) bgVideo.src = videoSrc;
            bgVideo.currentTime = videoStart;
            bgVideo.play().catch(e => {});
            bgVideo.style.opacity = '1';

            spotifyNotification.classList.add('show');
            setTimeout(() => {
                spotifyNotification.classList.remove('show');
            }, 3500);

            triggerEmojiBurst();

            mainScreen.style.opacity = '0';
            setTimeout(() => {
                mainScreen.style.display = 'none';
                surpriseScreen.style.display = 'flex';
                setTimeout(() => {
                    surpriseScreen.style.opacity = '1';
                }, 20);
            }, 350);
        });
    });

    setInterval(() => {
        if(currentAudio && !currentAudio.paused) {
            const current = currentAudio.currentTime;
            const duration = currentAudio.duration || 1;
            const percent = (current / duration) * 100;
            progressBar.value = percent;
            progressBar.style.background = `linear-gradient(to right, #ff3366 ${percent}%, rgba(255, 255, 255, 0.2) ${percent}%)`;

            currentTimeEl.innerText = formatTime(current);
            totalTimeEl.innerText = formatTime(duration);
            updatePlayPauseIcon();
        }
    }, 200);

    progressBar.addEventListener('input', () => {
        if(currentAudio && currentAudio.duration) {
            const percent = progressBar.value;
            const newTime = (percent / 100) * currentAudio.duration;
            currentAudio.currentTime = newTime;
            progressBar.style.background = `linear-gradient(to right, #ff3366 ${percent}%, rgba(255, 255, 255, 0.2) ${percent}%)`;
            currentTimeEl.innerText = formatTime(newTime);
        }
    });

    playPauseBtn.addEventListener('click', () => {
        if(!currentAudio) return;
        if(currentAudio.paused) {
            currentAudio.play();
        } else {
            currentAudio.pause();
        }
        updatePlayPauseIcon();
    });

    rewindBtn.addEventListener('click', () => {
        if(currentAudio) currentAudio.currentTime = Math.max(0, currentAudio.currentTime - 10);
    });
    forwardBtn.addEventListener('click', () => {
        if(currentAudio && currentAudio.duration) currentAudio.currentTime = Math.min(currentAudio.duration, currentAudio.currentTime + 10);
    });

    backToMenuBtn.addEventListener('click', () => {
        isSurpriseTriggered = false;
        if(currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        bgVideo.style.opacity = '0';
        bgVideo.pause();

        surpriseScreen.style.opacity = '0';
        setTimeout(() => {
            surpriseScreen.style.display = 'none';
            mainScreen.style.display = 'flex';
            setTimeout(() => { mainScreen.style.opacity = '1'; }, 20);
        }, 350);
    });
});
