// Home Screen Functions

function initHomeEnemies() {
    homeEnemies = [];
    for (let i = 0; i < HOME_ENEMY_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        homeEnemies.push({
            x: Math.random() * canvas.width,
            y: homeScrollY + Math.random() * canvas.height,
            vx: Math.cos(angle) * HOME_ENEMY_WANDER_SPEED,
            vy: Math.sin(angle) * HOME_ENEMY_WANDER_SPEED
        });
    }
}

function updateHomeScreen(dt) {
    homeScrollY += HOME_SCROLL_SPEED * dt;

    for (let e of homeEnemies) {
        e.x += e.vx * dt;
        e.y += e.vy * dt;

        if (e.x < -ENEMY_SIZE) e.x = canvas.width + ENEMY_SIZE;
        if (e.x > canvas.width + ENEMY_SIZE) e.x = -ENEMY_SIZE;

        const screenY = e.y - homeScrollY + canvas.height / 2;
        if (screenY > canvas.height + ENEMY_SIZE * 2) {
            e.y = homeScrollY - canvas.height / 2 - ENEMY_SIZE;
            e.x = Math.random() * canvas.width;
        }
    }
}

function renderHomeScreen(now) {
    ctx.fillStyle = '#ccc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = GRASS_COLOR;
    ctx.font = '10px "Press Start 2P", monospace';
    const startCellX = Math.floor(-1);
    const startCellY = Math.floor((homeScrollY - canvas.height) / GRASS_CELL_SIZE) - 1;
    const endCellX = Math.ceil(canvas.width / GRASS_CELL_SIZE) + 1;
    const endCellY = Math.ceil((homeScrollY + canvas.height) / GRASS_CELL_SIZE) + 1;

    for (let cellX = startCellX; cellX <= endCellX; cellX++) {
        for (let cellY = startCellY; cellY <= endCellY; cellY++) {
            const rand = seededRandom(cellX, cellY);
            if (rand > 0.3) continue;
            const gx = cellX * GRASS_CELL_SIZE + rand * GRASS_CELL_SIZE;
            const gy = cellY * GRASS_CELL_SIZE + seededRandom(cellY, cellX) * GRASS_CELL_SIZE;
            const screenX = gx;
            const screenY = gy - homeScrollY + canvas.height / 2;
            if (screenY < -20 || screenY > canvas.height + 20) continue;
            const phase = Math.sin(gx * 0.01 + now * GRASS_WAVE_SPEED);
            const charIndex = phase < -0.33 ? 0 : phase > 0.33 ? 2 : 1;
            ctx.fillText(GRASS_CHARS[charIndex], screenX, screenY);
        }
    }

    ctx.fillStyle = 'red';
    for (let e of homeEnemies) {
        const screenY = e.y - homeScrollY + canvas.height / 2;
        ctx.fillRect(e.x - ENEMY_SIZE / 2, screenY - ENEMY_SIZE / 2, ENEMY_SIZE, ENEMY_SIZE);
    }
}
