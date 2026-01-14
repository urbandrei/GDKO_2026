// Main Update Function

function update(dt, now) {
    let moveX = 0, moveY = 0;
    if (keys['w']) moveY -= 1;
    if (keys['s']) moveY += 1;
    if (keys['a']) moveX -= 1;
    if (keys['d']) moveX += 1;
    const moveDist = Math.sqrt(moveX * moveX + moveY * moveY);
    if (moveDist > 0) {
        player.x += (moveX / moveDist) * PLAYER_SPEED * dt;
        player.y += (moveY / moveDist) * PLAYER_SPEED * dt;
    }

    const isMoving = moveDist > 0;
    playerAnim.movingUp = keys['w'] || false;

    if (isMoving) {
        if (moveX < 0) playerAnim.facingLeft = true;
        else if (moveX > 0) playerAnim.facingLeft = false;
    }

    if (isMoving) {
        if (now - playerAnim.lastFrameTime >= ANIMATION_FRAME_TIME) {
            playerAnim.frame = (playerAnim.frame + 1) % SPRITE_COLS;
            playerAnim.lastFrameTime = now;
        }
    } else {
        playerAnim.frame = 0;
    }

    if (mouse.down) shoot(now);

    const diff = getDifficultyMult(now);
    if (now - lastSpawn > SPAWN_INTERVAL / diff) {
        lastSpawn = now;
        spawnEnemy(now);
    }

    recoil.x *= (1 - RECOIL_RECOVERY);
    recoil.y *= (1 - RECOIL_RECOVERY);

    const homingCount = activeEffects.filter(e => e === 'homing').length;
    for (let b of bullets) {
        const distFromPlayer = Math.sqrt((b.x - player.x) ** 2 + (b.y - player.y) ** 2);
        if (distFromPlayer > PLAYER_SIZE) {
            b.trail.push({ x: b.x, y: b.y });
            if (b.trail.length > TRAIL_LENGTH) b.trail.shift();
        }

        if (homingCount > 0) {
            let nearestEnemy = null;
            let nearestDist = Infinity;
            for (let e of enemies) {
                if (e.dying) continue;
                const d = Math.sqrt((b.x - e.x) ** 2 + (b.y - e.y) ** 2);
                if (d < nearestDist) {
                    nearestDist = d;
                    nearestEnemy = e;
                }
            }
            if (nearestEnemy) {
                const tdx = nearestEnemy.x - b.x;
                const tdy = nearestEnemy.y - b.y;
                const tDist = Math.sqrt(tdx * tdx + tdy * tdy);
                if (tDist > 0) {
                    const strength = HOMING_STRENGTH * homingCount;
                    b.vx += (tdx / tDist) * strength;
                    b.vy += (tdy / tDist) * strength;
                    const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
                    b.vx = (b.vx / speed) * BULLET_SPEED;
                    b.vy = (b.vy / speed) * BULLET_SPEED;
                }
            }
        }

        b.x += b.vx * dt;
        b.y += b.vy * dt;
    }

    for (let e of enemies) {
        if (e.dying) continue;
        const dx = player.x - e.x;
        const dy = player.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            e.x += (dx / dist) * ENEMY_SPEED * diff * dt;
            e.y += (dy / dist) * ENEMY_SPEED * diff * dt;
            if (now - e.lastShot > e.fireRate) {
                e.lastShot = now;
                enemyBullets.push({
                    x: e.x,
                    y: e.y,
                    vx: (dx / dist) * ENEMY_BULLET_SPEED * (0.8 + diff * 0.2),
                    vy: (dy / dist) * ENEMY_BULLET_SPEED * (0.8 + diff * 0.2),
                    trail: []
                });
                playSoundEnemyShoot();
            }
        }
    }

    for (let b of enemyBullets) {
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > TRAIL_LENGTH) b.trail.shift();
        b.x += b.vx * dt;
        b.y += b.vy * dt;
    }
    enemyBullets = enemyBullets.filter(b => {
        const dx = b.x - player.x;
        const dy = b.y - player.y;
        return Math.sqrt(dx*dx + dy*dy) < 1500;
    });

    bullets = bullets.filter(b => {
        const dist = Math.sqrt((b.x - b.startX) ** 2 + (b.y - b.startY) ** 2);
        return dist < BULLET_MAX_DISTANCE;
    });

    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (e.dying) continue;
        for (let j = bullets.length - 1; j >= 0; j--) {
            const b = bullets[j];
            if (b.piercing && b.hitEnemies.has(i)) continue;
            if (checkCollision(e.x, e.y, ENEMY_HITBOX, b.x, b.y, BULLET_SIZE)) {
                e.health -= b.damage;
                e.hitFlashUntil = now + 50;
                playSoundEnemyHit();
                const bSpeed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
                if (bSpeed > 0) {
                    e.x += (b.vx / bSpeed) * 10;
                    e.y += (b.vy / bSpeed) * 10;
                }
                if (e.health <= 0) {
                    e.dying = true;
                    e.deathTime = now;
                    e.killVx = b.vx;
                    e.killVy = b.vy;
                    spawnFragments(e.x, e.y, b.vx, b.vy, now);
                    triggerShake(SHAKE_INTENSITY, now);
                    hitstopUntil = now + HITSTOP_DURATION;
                }
                if (b.piercing) {
                    b.hitEnemies.add(i);
                    if (b.hitEnemies.size > b.maxPierces) {
                        bullets.splice(j, 1);
                    }
                } else {
                    bullets.splice(j, 1);
                }
                break;
            }
        }
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (e.dying && now - e.deathTime >= ENEMY_DEATH_DURATION) {
            if (Math.random() < CARD_DROP_CHANCE) {
                const effect = CARD_EFFECTS[Math.floor(Math.random() * CARD_EFFECTS.length)];
                cards.push({ x: e.x, y: e.y, effect: effect, spawnTime: now });
                playSoundCardSpawn();
                if (cards.length === 1 && !hasShownFirstCardHint) {
                    firstCardHintUntil = now + 3000;
                    hasShownFirstCardHint = true;
                }
            }
            enemies.splice(i, 1);
        }
    }

    if (now >= playerInvincibleUntil) {
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            const b = enemyBullets[i];
            if (checkCollision(player.x, player.y, PLAYER_SIZE, b.x, b.y, ENEMY_BULLET_SIZE)) {
                enemyBullets.splice(i, 1);
                if (hasCardsInSlots()) {
                    removeCardFromSlot(now);
                    playerInvincibleUntil = now + PLAYER_INVINCIBILITY_TIME;
                } else {
                    gameOver();
                    return;
                }
            }
        }
    }

    for (let e of enemies) {
        if (e.dying) continue;
        if (checkCollision(player.x, player.y, PLAYER_SIZE, e.x, e.y, ENEMY_HITBOX)) {
            e.health -= 1;
            e.hitFlashUntil = now + 50;
            playSoundEnemyHit();

            const dx = e.x - player.x;
            const dy = e.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                e.x += (dx / dist) * BODY_SLAM_KNOCKBACK;
                e.y += (dy / dist) * BODY_SLAM_KNOCKBACK;
            }

            if (e.health <= 0) {
                e.dying = true;
                e.deathTime = now;
                e.killVx = dx;
                e.killVy = dy;
                spawnFragments(e.x, e.y, dx, dy, now);
                triggerShake(SHAKE_INTENSITY, now);
                hitstopUntil = now + HITSTOP_DURATION;
            }

            if (hasCardsInSlots()) {
                removeCardFromSlot(now);
            } else {
                gameOver();
                return;
            }
        }
    }

    for (let f of fragments) {
        const age = now - f.birth;
        if (age < FRAGMENT_MOVE_TIME) {
            const factor = 1 - age / FRAGMENT_MOVE_TIME;
            f.x += f.vx * factor * dt;
            f.y += f.vy * factor * dt;
        }
    }
    fragments = fragments.filter(f => now - f.birth < FRAGMENT_LIFETIME);

    for (let i = cards.length - 1; i >= 0; i--) {
        const c = cards[i];
        if (checkCollision(player.x, player.y, PLAYER_SIZE, c.x, c.y, CARD_WIDTH)) {
            viewingCard = c;
            playSoundPickup();
            cardAnimation.active = true;
            cardAnimation.startTime = now;
            cardAnimation.cardStartWorldX = c.x;
            cardAnimation.cardStartWorldY = c.y;
            cardViewStartTime = now;
            draggingCard = false;
            cards.splice(i, 1);
            break;
        }
    }

    cards = cards.filter(c => now - c.spawnTime < CARD_DESPAWN_TIME);
}
