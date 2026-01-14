// Enemy Functions

function spawnEnemy(now) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.max(canvas.width, canvas.height) / 2 + 100;
    const diff = getDifficultyMult(now);
    enemies.push({
        x: player.x + Math.cos(angle) * dist,
        y: player.y + Math.sin(angle) * dist,
        health: Math.ceil(ENEMY_BASE_HEALTH * diff),
        lastShot: now,
        fireRate: ENEMY_FIRE_RATE_BASE / diff
    });
}

function spawnFragments(ex, ey, bvx, bvy, now) {
    playSoundExplosion();
    const baseAngle = Math.atan2(bvy, bvx);
    const count = FRAGMENT_COUNT_MIN + Math.floor(Math.random() * (FRAGMENT_COUNT_MAX - FRAGMENT_COUNT_MIN + 1));
    for (let i = 0; i < count; i++) {
        const angle = baseAngle + (Math.random() - 0.5) * FRAGMENT_CONE;
        const speed = FRAGMENT_SPEED_MIN + Math.random() * (FRAGMENT_SPEED_MAX - FRAGMENT_SPEED_MIN);
        fragments.push({
            x: ex,
            y: ey,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            birth: now
        });
    }
}
