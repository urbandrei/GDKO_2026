// Audio System

let audioCtx = null;
let masterGain = null;
let sfxGain = null;
let musicGain = null;
let audioSettings = { volume: 0.5, muted: false };
let musicInterval = null;
let musicStep = 0;
let musicChordIndex = 0;
let musicArpIndex = 0;

function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);
    masterGain.gain.value = audioSettings.volume;
    sfxGain = audioCtx.createGain();
    sfxGain.connect(masterGain);
    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0.3;
    musicGain.connect(masterGain);
}

// Sound Effects
function playSoundShoot() {
    if (!audioCtx || audioSettings.muted) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.1);
}

function playSoundExplosion() {
    if (!audioCtx || audioSettings.muted) return;
    for (let i = 0; i < 3; i++) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        const baseFreq = 200 + Math.random() * 100;
        osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.2);
    }
}

function playSoundDamage() {
    if (!audioCtx || audioSettings.muted) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.setValueAtTime(200, audioCtx.currentTime + 0.05);
    osc.frequency.setValueAtTime(100, audioCtx.currentTime + 0.1);
    osc.frequency.setValueAtTime(180, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.25);
}

function playSoundGameOver() {
    if (!audioCtx || audioSettings.muted) return;
    stopMusic();
    const notes = [523, 440, 349, 262, 98];
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        const startTime = audioCtx.currentTime + i * 0.15;
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(startTime);
        osc.stop(startTime + 0.3);
    });
}

function playSoundPickup() {
    if (!audioCtx || audioSettings.muted) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(523, audioCtx.currentTime);
    osc.frequency.setValueAtTime(659, audioCtx.currentTime + 0.05);
    osc.frequency.setValueAtTime(784, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.15);
}

function playSoundSwap() {
    if (!audioCtx || audioSettings.muted) return;
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.08);
    gain1.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
    osc1.connect(gain1);
    gain1.connect(sfxGain);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.08);
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(330, audioCtx.currentTime + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(660, audioCtx.currentTime + 0.18);
    gain2.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gain2.gain.setValueAtTime(0.25, audioCtx.currentTime + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
    osc2.connect(gain2);
    gain2.connect(sfxGain);
    osc2.start(audioCtx.currentTime + 0.1);
    osc2.stop(audioCtx.currentTime + 0.18);
}

function playSoundMilestone() {
    if (!audioCtx || audioSettings.muted) return;
    const notes = [262, 330, 392, 523];
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.1 + 0.2);
        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(audioCtx.currentTime + i * 0.1);
        osc.stop(audioCtx.currentTime + i * 0.1 + 0.2);
    });
}

function playSoundCardPlace() {
    if (!audioCtx || audioSettings.muted) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.setValueAtTime(554, audioCtx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.1);
}

function playSoundVictory() {
    if (!audioCtx || audioSettings.muted) return;
    stopMusic();
    const notes = [262, 330, 392, 523, 659, 784];
    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.12 + 0.25);
        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start(audioCtx.currentTime + i * 0.12);
        osc.stop(audioCtx.currentTime + i * 0.12 + 0.25);
    });
}

function playSoundEnemyShoot() {
    if (!audioCtx || audioSettings.muted) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(330, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.08);
}

function playSoundClick() {
    if (!audioCtx || audioSettings.muted) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(660, audioCtx.currentTime);
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.02);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.05);
}

function playSoundEnemyHit() {
    if (!audioCtx || audioSettings.muted) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.05);
}

function playSoundCardSpawn() {
    if (!audioCtx || audioSettings.muted) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(392, audioCtx.currentTime);
    osc.frequency.setValueAtTime(523, audioCtx.currentTime + 0.08);
    osc.frequency.setValueAtTime(659, audioCtx.currentTime + 0.16);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.24);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.24);
}

// Music System
function startMusic() {
    if (!audioCtx || audioSettings.muted) return;
    if (musicInterval) return;
    musicStep = 0;
    musicChordIndex = 0;
    musicArpIndex = 0;
    musicInterval = setInterval(() => {
        playMusicStep();
        musicStep++;
        musicArpIndex = (musicArpIndex + 1) % 3;
        if (musicStep % 16 === 0) {
            musicChordIndex = (musicChordIndex + 1) % MUSIC_SEQUENCE.length;
        }
    }, MUSIC_STEP_MS);
}

function stopMusic() {
    if (musicInterval) {
        clearInterval(musicInterval);
        musicInterval = null;
    }
}

function playMusicStep() {
    if (!audioCtx || audioSettings.muted) return;
    const seq = MUSIC_SEQUENCE[musicChordIndex];
    if (musicStep % 8 === 0) {
        playMusicNote(seq.bass, 'square', 0.15, 0.2);
    }
    const arpFreq = seq.chord[musicArpIndex];
    playMusicNote(arpFreq, 'square', 0.08, 0.08);
}

function playMusicNote(freq, type, volume, duration) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(musicGain);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + duration);
}
