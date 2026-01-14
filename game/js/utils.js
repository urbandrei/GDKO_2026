// Utility Functions

function seededRandom(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
}

function checkCollision(ax, ay, aSize, bx, by, bSize) {
    return Math.abs(ax - bx) < (aSize + bSize) / 2 &&
           Math.abs(ay - by) < (aSize + bSize) / 2;
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function mixColors(r, g, b) {
    const total = r + g + b;
    if (total === 0) return 'black';
    const rNorm = r / total;
    const gNorm = g / total;
    const bNorm = b / total;
    const red = Math.floor(255 * rNorm);
    const green = Math.floor(255 * gNorm);
    const blue = Math.floor(255 * bNorm);
    return `rgb(${red}, ${green}, ${blue})`;
}

function getDifficultyMult(now) {
    const elapsed = now - gameStartTime;
    return 0.7 * Math.pow(2, elapsed / DIFFICULTY_RAMP_TIME);
}
