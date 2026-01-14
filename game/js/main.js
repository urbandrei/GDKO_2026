// Main Entry Point - Game Loop, State, and Event Handlers

// DOM Elements
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const homeScreen = document.getElementById('home');
const gameoverScreen = document.getElementById('gameover');

// Load sprite images
const runningImg = new Image();
runningImg.src = 'art/running.png';
const hairImg = new Image();
hairImg.src = 'art/hair.png';
const gunImg = new Image();
gunImg.src = 'art/gun.png';

// Sprite frame dimensions
let spriteFrameWidth = 0;
let spriteFrameHeight = 0;
let gunWidth = 0;
let gunHeight = 0;

runningImg.onload = function() {
    spriteFrameWidth = runningImg.width / SPRITE_COLS;
    spriteFrameHeight = runningImg.height / SPRITE_ROWS;
};
gunImg.onload = function() {
    gunWidth = gunImg.width;
    gunHeight = gunImg.height;
};

// Game State Variables
let gameState = 'home';
let player = { x: 0, y: 0 };
let bullets = [];
let enemies = [];
let fragments = [];
let keys = {};
let mouse = { x: 0, y: 0, down: false };
let lastShot = 0;
let lastSpawn = 0;
let lastTime = 0;
let shake = { x: 0, y: 0, until: 0 };
let hitstopUntil = 0;
let recoil = { x: 0, y: 0 };
let muzzleFlash = { until: 0 };
let cards = [];
let viewingCard = null;
let activeEffects = [];
let draggingCard = false;
let dragPos = { x: 0, y: 0 };
let cardAnimation = { active: false, startTime: 0, cardStartWorldX: 0, cardStartWorldY: 0 };
let enemyBullets = [];
let playerInvincibleUntil = 0;
let gameStartTime = 0;
let cardViewStartTime = 0;
let playerAnim = { frame: 0, lastFrameTime: 0, facingLeft: false, movingUp: false };
let cardSlots = [];
let fadingCards = [];
let hoveringSlot = -1;
let homeScrollY = 0;
let homeEnemies = [];
let gameOverStartTime = 0;
let gameOverSnapshot = null;
let highScore = parseInt(localStorage.getItem('cardGunnerHighScore')) || 0;
let lastRunTime = 0;
let lastMinuteMilestone = 0;
let timerFlashUntil = 0;
let firstCardHintUntil = 0;
let hasShownFirstCardHint = false;
let isNewHighScore = false;
let liveHighScoreBeatTime = 0;
let hasBeatenHighScore = false;
let confetti = [];
let tutorialStartTime = 0;

// Canvas Resize
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Input Handlers
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (draggingCard && viewingCard) {
        hoveringSlot = getSlotAtPosition(mouse.x, mouse.y);
    }
});
window.addEventListener('mousedown', e => {
    mouse.down = true;
    if (viewingCard && !cardAnimation.active && !draggingCard) {
        draggingCard = true;
        hoveringSlot = getSlotAtPosition(mouse.x, mouse.y);
    }
});
window.addEventListener('mouseup', () => {
    mouse.down = false;
    if (viewingCard && draggingCard) {
        const slotIndex = getSlotAtPosition(mouse.x, mouse.y);
        if (slotIndex >= 0) {
            const newCard = {
                effectId: viewingCard.effect.id,
                letter: viewingCard.effect.name.charAt(0).toUpperCase()
            };

            if (cardSlots[slotIndex] !== null) {
                playSoundSwap();
                const pos = getSlotPosition(slotIndex);
                fadingCards.push({
                    effectId: cardSlots[slotIndex].effectId,
                    letter: cardSlots[slotIndex].letter,
                    startTime: performance.now(),
                    x: pos.x,
                    y: pos.y
                });
            } else {
                playSoundCardPlace();
            }

            cardSlots[slotIndex] = newCard;
            rebuildActiveEffects();
            viewingCard = null;
            cardAnimation.active = false;
        }
        draggingCard = false;
        hoveringSlot = -1;
    }
});

// Initialize audio on first interaction
window.addEventListener('click', () => { initAudio(); startMusic(); }, { once: true });
window.addEventListener('keydown', () => { initAudio(); startMusic(); }, { once: true });

// Game Functions
function startGame() {
    initAudio();
    playSoundClick();
    startMusic();
    tutorialStartTime = performance.now();
    player = { x: 0, y: 0 };
    bullets = [];
    enemies = [];
    fragments = [];
    cards = [];
    activeEffects = [];
    cardSlots = new Array(CARD_SLOT_COUNT).fill(null);
    fadingCards = [];
    hoveringSlot = -1;
    viewingCard = null;
    draggingCard = false;
    cardAnimation = { active: false, startTime: 0, cardStartWorldX: 0, cardStartWorldY: 0 };
    enemyBullets = [];
    playerInvincibleUntil = 0;
    gameStartTime = performance.now();
    cardViewStartTime = 0;
    playerAnim = { frame: 0, lastFrameTime: 0, facingLeft: false, movingUp: false };
    keys = {};
    lastShot = 0;
    lastSpawn = 0;
    shake = { x: 0, y: 0, until: 0 };
    hitstopUntil = 0;
    recoil = { x: 0, y: 0 };
    muzzleFlash = { until: 0 };
    lastMinuteMilestone = 0;
    timerFlashUntil = 0;
    firstCardHintUntil = 0;
    hasShownFirstCardHint = false;
    confetti = [];
    isNewHighScore = false;
    liveHighScoreBeatTime = 0;
    hasBeatenHighScore = false;
    document.getElementById('best-time').style.color = '';
    gameState = 'playing';
    homeScreen.style.display = 'none';
    gameoverScreen.style.display = 'none';
    canvas.style.cursor = 'none';
}

function updateHomeHighScore() {
    const bestMin = Math.floor(highScore / 60);
    const bestSec = highScore % 60;
    document.getElementById('home-high-score').textContent =
        `BEST: ${bestMin}:${bestSec.toString().padStart(2, '0')}`;
}

function goHome() {
    playSoundClick();
    startMusic();
    gameState = 'home';
    homeScreen.style.display = 'block';
    gameoverScreen.style.display = 'none';
    canvas.style.cursor = 'default';
    initHomeEnemies();
    updateHomeHighScore();
    document.getElementById('best-time').style.color = '';
}

// Game Loop
function gameLoop(now) {
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    if (gameState === 'home') {
        updateHomeScreen(dt);
        renderHomeScreen(now);
    } else if (gameState === 'gameover') {
        renderGameOverScene(now);
    } else if (gameState === 'playing') {
        if (viewingCard && !draggingCard && !cardAnimation.active) {
            if (now - cardViewStartTime > CARD_VIEW_TIMEOUT) {
                viewingCard = null;
            }
        }

        if (!viewingCard && now >= hitstopUntil) {
            update(dt, now);
        }
        render(now);
    }

    requestAnimationFrame(gameLoop);
}

// Initialize and start
initHomeEnemies();
updateHomeHighScore();
requestAnimationFrame(gameLoop);
