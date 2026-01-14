// Bullet and Shooting Functions

function triggerShake(intensity, now) {
    shake.x = (Math.random() - 0.5) * 2 * intensity;
    shake.y = (Math.random() - 0.5) * 2 * intensity;
    shake.until = now + SHAKE_DURATION;
}

function shoot(now) {
    if (now - lastShot < FIRE_RATE) return;
    lastShot = now;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const dx = mouse.x - cx;
    const dy = mouse.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;

    const dirX = dx / dist;
    const dirY = dy / dist;
    const extraCount = activeEffects.filter(e => e === 'extraBullet').length;
    const damageCount = activeEffects.filter(e => e === 'damage').length;
    const speedCount = activeEffects.filter(e => e === 'bulletSpeed').length;
    const pierceCount = activeEffects.filter(e => e === 'piercing').length;
    const isPiercing = pierceCount > 0;
    const bulletDamage = 1 + damageCount;
    const bulletSpeedMult = Math.pow(1.25, speedCount);
    const actualBulletSpeed = BULLET_SPEED * bulletSpeedMult;
    const totalBullets = 1 + extraCount;
    const spreadAngle = 0.15;

    for (let i = 0; i < totalBullets; i++) {
        const angleOffset = (i - (totalBullets - 1) / 2) * spreadAngle;
        const cos = Math.cos(angleOffset);
        const sin = Math.sin(angleOffset);
        const bDirX = dirX * cos - dirY * sin;
        const bDirY = dirX * sin + dirY * cos;
        const startX = player.x + bDirX * (PLAYER_SIZE / 2 + BULLET_SIZE);
        const startY = player.y + bDirY * (PLAYER_SIZE / 2 + BULLET_SIZE);
        bullets.push({
            x: startX,
            y: startY,
            startX: startX,
            startY: startY,
            vx: bDirX * actualBulletSpeed,
            vy: bDirY * actualBulletSpeed,
            trail: [],
            damage: bulletDamage,
            piercing: isPiercing,
            maxPierces: pierceCount,
            hitEnemies: new Set()
        });
    }

    triggerShake(SHAKE_INTENSITY * 0.5, now);
    recoil.x = -dirX * RECOIL_DISTANCE;
    recoil.y = -dirY * RECOIL_DISTANCE;
    muzzleFlash.until = now + MUZZLE_FLASH_DURATION;
    muzzleFlash.offsetX = dirX * (PLAYER_SIZE / 2 + MUZZLE_FLASH_SIZE / 2);
    muzzleFlash.offsetY = dirY * (PLAYER_SIZE / 2 + MUZZLE_FLASH_SIZE / 2);
    playSoundShoot();
}
