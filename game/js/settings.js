// Settings Functions

let settingsOpen = false;

function openSettings() {
    initAudio();
    playSoundClick();
    settingsOpen = true;
    document.getElementById('settings-modal').style.display = 'flex';
    updateSettingsUI();
}

function closeSettings() {
    playSoundClick();
    settingsOpen = false;
    document.getElementById('settings-modal').style.display = 'none';
}

function setVolume(value) {
    audioSettings.volume = value;
    if (masterGain) {
        masterGain.gain.value = audioSettings.muted ? 0 : value;
    }
    document.getElementById('volume-display').textContent = Math.round(value * 100) + '%';
    document.getElementById('volume-slider').value = value * 100;
}

function toggleMute() {
    audioSettings.muted = !audioSettings.muted;
    if (masterGain) {
        masterGain.gain.value = audioSettings.muted ? 0 : audioSettings.volume;
    }
    updateMuteButton();
    if (audioSettings.muted) {
        stopMusic();
    } else if (gameState === 'playing') {
        startMusic();
    }
}

function updateMuteButton() {
    const btn = document.getElementById('mute-btn');
    btn.textContent = audioSettings.muted ? 'Unmute' : 'Mute';
    btn.style.background = audioSettings.muted ? '#ff6b6b' : '';
}

function updateSettingsUI() {
    document.getElementById('volume-slider').value = audioSettings.volume * 100;
    document.getElementById('volume-display').textContent = Math.round(audioSettings.volume * 100) + '%';
    updateMuteButton();
}
