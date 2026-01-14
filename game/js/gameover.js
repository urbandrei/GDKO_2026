// Game Over Functions

function spawnConfetti(now) {
    confetti = [];
    for (let i = 0; i < CONFETTI_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = CONFETTI_SPEED * (0.5 + Math.random() * 0.5);
        confetti.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 200,
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            birth: now,
            size: 4 + Math.random() * 4
        });
    }
}

function gameOver() {
    gameState = 'gameover';
    gameOverStartTime = performance.now();
    gameOverSnapshot = {
        playerX: player.x,
        playerY: player.y,
        playerAnim: { ...playerAnim },
        enemies: enemies.map(e => ({ ...e })),
        bullets: bullets.map(b => ({ ...b })),
        enemyBullets: enemyBullets.map(b => ({ ...b })),
        fragments: fragments.map(f => ({ ...f })),
        recoil: { ...recoil },
        hairColor: mixColors(
            activeEffects.filter(e => e === 'red').length,
            activeEffects.filter(e => e === 'green').length,
            activeEffects.filter(e => e === 'blue').length
        )
    };

    lastRunTime = Math.floor((performance.now() - gameStartTime) / 1000);
    if (lastRunTime > highScore) {
        highScore = lastRunTime;
        localStorage.setItem('cardGunnerHighScore', highScore);
        isNewHighScore = true;
        playSoundVictory();
        spawnConfetti(performance.now());
    } else {
        isNewHighScore = false;
        playSoundGameOver();
    }

    const runMin = Math.floor(lastRunTime / 60);
    const runSec = lastRunTime % 60;
    document.getElementById('run-time').textContent = `TIME: ${runMin}:${runSec.toString().padStart(2, '0')}`;
    const bestMin = Math.floor(highScore / 60);
    const bestSec = highScore % 60;
    document.getElementById('best-time').textContent = `BEST: ${bestMin}:${bestSec.toString().padStart(2, '0')}`;

    gameoverScreen.style.display = 'block';
    canvas.style.cursor = 'default';
}

function renderGameOverScene(now) {
    if (!gameOverSnapshot) return;

    const elapsed = now - gameOverStartTime;
    const t = Math.min(1, elapsed / GAMEOVER_ANIM_DURATION);
    const eased = easeOutCubic(t);

    const zoom = 1 + (GAMEOVER_ZOOM - 1) * eased;
    const rotation = GAMEOVER_ROTATION * eased;
    const offsetX = canvas.width * GAMEOVER_OFFSET_X * eased;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.fillStyle = '#ccc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(cx + offsetX, cy);
    ctx.rotate(rotation);
    ctx.scale(zoom, zoom);
    ctx.translate(-cx, -cy);

    const playerScreenX = cx;
    const playerScreenY = cy;
    const worldOffsetX = gameOverSnapshot.playerX - playerScreenX;
    const worldOffsetY = gameOverSnapshot.playerY - playerScreenY;

    ctx.fillStyle = GRASS_COLOR;
    ctx.font = '10px "Press Start 2P", monospace';
    const startCellX = Math.floor((gameOverSnapshot.playerX - cx) / GRASS_CELL_SIZE) - 1;
    const startCellY = Math.floor((gameOverSnapshot.playerY - cy) / GRASS_CELL_SIZE) - 1;
    const endCellX = Math.ceil((gameOverSnapshot.playerX + cx) / GRASS_CELL_SIZE) + 1;
    const endCellY = Math.ceil((gameOverSnapshot.playerY + cy) / GRASS_CELL_SIZE) + 1;
    for (let cellX = startCellX; cellX <= endCellX; cellX++) {
        for (let cellY = startCellY; cellY <= endCellY; cellY++) {
            const rand = seededRandom(cellX, cellY);
            if (rand > 0.3) continue;
            const gx = cellX * GRASS_CELL_SIZE + rand * GRASS_CELL_SIZE;
            const gy = cellY * GRASS_CELL_SIZE + seededRandom(cellY, cellX) * GRASS_CELL_SIZE;
            const screenX = gx - worldOffsetX;
            const screenY = gy - worldOffsetY;
            const phase = Math.sin(gx * 0.01 + now * GRASS_WAVE_SPEED);
            const charIndex = phase < -0.33 ? 0 : phase > 0.33 ? 2 : 1;
            ctx.fillText(GRASS_CHARS[charIndex], screenX, screenY);
        }
    }

    const snap = gameOverSnapshot;
    const spriteRow = snap.playerAnim.movingUp ? 1 : 0;
    const spriteCol = snap.playerAnim.frame;
    const spriteFlip = snap.playerAnim.facingLeft;
    const spriteScale = 4.5;
    const drawX = playerScreenX + snap.recoil.x;
    const drawY = playerScreenY + snap.recoil.y;

    drawSpriteFrame(runningImg, spriteCol, spriteRow, drawX, drawY, spriteFlip, spriteScale);
    drawTintedHair(spriteCol, spriteRow, drawX, drawY, spriteFlip, spriteScale, snap.hairColor);

    ctx.fillStyle = snap.hairColor;
    for (let b of snap.bullets) {
        ctx.fillRect(b.x - worldOffsetX - BULLET_SIZE / 2, b.y - worldOffsetY - BULLET_SIZE / 2, BULLET_SIZE, BULLET_SIZE);
    }

    for (let e of snap.enemies) {
        if (e.dying) {
            ctx.fillStyle = 'white';
        } else {
            ctx.fillStyle = 'red';
        }
        ctx.fillRect(e.x - worldOffsetX - ENEMY_SIZE / 2, e.y - worldOffsetY - ENEMY_SIZE / 2, ENEMY_SIZE, ENEMY_SIZE);
    }

    ctx.fillStyle = 'red';
    for (let b of snap.enemyBullets) {
        ctx.fillRect(b.x - worldOffsetX - ENEMY_BULLET_SIZE / 2, b.y - worldOffsetY - ENEMY_BULLET_SIZE / 2, ENEMY_BULLET_SIZE, ENEMY_BULLET_SIZE);
    }

    ctx.fillStyle = 'white';
    for (let f of snap.fragments) {
        ctx.fillRect(f.x - worldOffsetX - FRAGMENT_SIZE / 2, f.y - worldOffsetY - FRAGMENT_SIZE / 2, FRAGMENT_SIZE, FRAGMENT_SIZE);
    }

    ctx.restore();

    if (!isNewHighScore) {
        ctx.fillStyle = `rgba(139, 0, 0, ${0.4 * eased})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const dt = 1/60;
    for (let i = confetti.length - 1; i >= 0; i--) {
        const c = confetti[i];
        const age = now - c.birth;
        if (age > CONFETTI_LIFETIME) {
            confetti.splice(i, 1);
            continue;
        }
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.vy += 400 * dt;

        const alpha = 1 - age / CONFETTI_LIFETIME;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = c.color;
        ctx.fillRect(c.x - c.size/2, c.y - c.size/2, c.size, c.size);
    }
    ctx.globalAlpha = 1;

    if (isNewHighScore) {
        const bestTimeEl = document.getElementById('best-time');
        bestTimeEl.style.color = Math.sin(now * 0.01) > 0 ? '#ff0' : '#0ff';
    }
}
