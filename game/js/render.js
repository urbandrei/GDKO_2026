// Main Render Function

function render(now) {
    ctx.fillStyle = '#ccc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    let shakeX = 0, shakeY = 0;
    if (now < shake.until) {
        const t = (shake.until - now) / SHAKE_DURATION;
        shakeX = shake.x * t;
        shakeY = shake.y * t;
    }

    let zoom = 1;
    let playerScreenX = cx;
    let playerScreenY = cy;
    let animProgress = 1.0;

    if (viewingCard) {
        if (cardAnimation.active) {
            const elapsed = now - cardAnimation.startTime;
            animProgress = Math.min(1.0, elapsed / CARD_PICKUP_ANIM_DURATION);
            animProgress = easeOutCubic(animProgress);
            if (elapsed >= CARD_PICKUP_ANIM_DURATION) {
                cardAnimation.active = false;
            }
        }

        const targetZoom = 1.8;
        zoom = 1 + (targetZoom - 1) * animProgress;
        playerScreenX = cx + (canvas.width * CARD_VIEW_PLAYER_X - cx) * animProgress;
        playerScreenY = cy;
    }

    ctx.save();
    if (viewingCard) {
        ctx.translate(playerScreenX, playerScreenY);
        ctx.scale(zoom, zoom);
        ctx.translate(-playerScreenX, -playerScreenY);
    }

    const offsetX = player.x - playerScreenX + shakeX;
    const offsetY = player.y - playerScreenY + shakeY;

    ctx.fillStyle = GRASS_COLOR;
    ctx.font = '10px "Press Start 2P", monospace';
    const startCellX = Math.floor((player.x - cx) / GRASS_CELL_SIZE) - 1;
    const startCellY = Math.floor((player.y - cy) / GRASS_CELL_SIZE) - 1;
    const endCellX = Math.ceil((player.x + cx) / GRASS_CELL_SIZE) + 1;
    const endCellY = Math.ceil((player.y + cy) / GRASS_CELL_SIZE) + 1;
    for (let cellX = startCellX; cellX <= endCellX; cellX++) {
        for (let cellY = startCellY; cellY <= endCellY; cellY++) {
            const rand = seededRandom(cellX, cellY);
            if (rand > 0.3) continue;
            const gx = cellX * GRASS_CELL_SIZE + rand * GRASS_CELL_SIZE;
            const gy = cellY * GRASS_CELL_SIZE + seededRandom(cellY, cellX) * GRASS_CELL_SIZE;
            const screenX = gx - offsetX;
            const screenY = gy - offsetY;
            const phase = Math.sin(gx * 0.01 + now * GRASS_WAVE_SPEED);
            const charIndex = phase < -0.33 ? 0 : phase > 0.33 ? 2 : 1;
            ctx.fillText(GRASS_CHARS[charIndex], screenX, screenY);
        }
    }

    let previewEffect = null;
    if (viewingCard && draggingCard && hoveringSlot >= 0) {
        const effectId = viewingCard.effect.id;
        if (['green', 'red', 'blue'].includes(effectId)) {
            previewEffect = effectId;
        }
    }

    let redCount = activeEffects.filter(e => e === 'red').length;
    let greenCount = activeEffects.filter(e => e === 'green').length;
    let blueCount = activeEffects.filter(e => e === 'blue').length;
    if (previewEffect === 'red') redCount++;
    if (previewEffect === 'green') greenCount++;
    if (previewEffect === 'blue') blueCount++;
    const hairColor = mixColors(redCount, greenCount, blueCount);

    const spriteRow = playerAnim.movingUp ? 1 : 0;
    const spriteCol = playerAnim.frame;
    const spriteFlip = playerAnim.facingLeft;
    const spriteScale = 4.5;
    const drawX = playerScreenX + recoil.x;
    const drawY = playerScreenY + recoil.y;

    if (now < playerInvincibleUntil) {
        ctx.globalAlpha = 0.5 + Math.sin(now * 0.02) * 0.3;
    }

    const adjustedMouseX = (mouse.x - playerScreenX) / zoom + playerScreenX;
    const adjustedMouseY = (mouse.y - playerScreenY) / zoom + playerScreenY;

    if (playerAnim.movingUp) {
        drawGun(drawX, drawY, adjustedMouseX, adjustedMouseY);
        drawSpriteFrame(runningImg, spriteCol, spriteRow, drawX, drawY, spriteFlip, spriteScale);
        drawTintedHair(spriteCol, spriteRow, drawX, drawY, spriteFlip, spriteScale, hairColor);
    } else {
        drawSpriteFrame(runningImg, spriteCol, spriteRow, drawX, drawY, spriteFlip, spriteScale);
        drawTintedHair(spriteCol, spriteRow, drawX, drawY, spriteFlip, spriteScale, hairColor);
        drawGun(drawX, drawY, adjustedMouseX, adjustedMouseY);
    }
    ctx.globalAlpha = 1;

    if (now < muzzleFlash.until) {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(playerScreenX - MUZZLE_FLASH_SIZE / 2 + muzzleFlash.offsetX, playerScreenY - MUZZLE_FLASH_SIZE / 2 + muzzleFlash.offsetY, MUZZLE_FLASH_SIZE, MUZZLE_FLASH_SIZE);
    }

    ctx.fillStyle = '#000';
    for (let b of bullets) {
        for (let i = 0; i < b.trail.length; i++) {
            const t = b.trail[i];
            ctx.globalAlpha = (i + 1) / (b.trail.length + 1) * 0.5;
            const size = BULLET_SIZE * (i + 1) / (b.trail.length + 1);
            ctx.fillRect(t.x - offsetX - size / 2, t.y - offsetY - size / 2, size, size);
        }
        ctx.globalAlpha = 1;
        ctx.fillRect(b.x - offsetX - BULLET_SIZE / 2, b.y - offsetY - BULLET_SIZE / 2, BULLET_SIZE, BULLET_SIZE);
    }

    for (let e of enemies) {
        if (e.dying) {
            const t = (now - e.deathTime) / ENEMY_DEATH_DURATION;
            const scale = 1 + (ENEMY_DEATH_SCALE - 1) * t;
            const size = ENEMY_SIZE * scale;
            ctx.fillStyle = 'white';
            ctx.fillRect(e.x - offsetX - size / 2, e.y - offsetY - size / 2, size, size);
        } else {
            ctx.fillStyle = (e.hitFlashUntil && now < e.hitFlashUntil) ? 'white' : 'red';
            ctx.fillRect(e.x - offsetX - ENEMY_SIZE / 2, e.y - offsetY - ENEMY_SIZE / 2, ENEMY_SIZE, ENEMY_SIZE);
        }
    }

    for (let f of fragments) {
        const age = now - f.birth;
        if (age < FRAGMENT_MOVE_TIME) {
            ctx.globalAlpha = 1;
        } else {
            ctx.globalAlpha = 1 - (age - FRAGMENT_MOVE_TIME) / FRAGMENT_FADE_TIME;
        }
        ctx.fillRect(f.x - offsetX - FRAGMENT_SIZE / 2, f.y - offsetY - FRAGMENT_SIZE / 2, FRAGMENT_SIZE, FRAGMENT_SIZE);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'red';
    for (let b of enemyBullets) {
        for (let i = 0; i < b.trail.length; i++) {
            const t = b.trail[i];
            ctx.globalAlpha = (i + 1) / (b.trail.length + 1) * 0.5;
            const size = ENEMY_BULLET_SIZE * (i + 1) / (b.trail.length + 1);
            ctx.fillRect(t.x - offsetX - size / 2, t.y - offsetY - size / 2, size, size);
        }
        ctx.globalAlpha = 1;
        ctx.fillRect(b.x - offsetX - ENEMY_BULLET_SIZE / 2, b.y - offsetY - ENEMY_BULLET_SIZE / 2, ENEMY_BULLET_SIZE, ENEMY_BULLET_SIZE);
    }

    ctx.fillStyle = '#daa520';
    for (let c of cards) {
        ctx.fillRect(c.x - offsetX - CARD_WIDTH / 2, c.y - offsetY - CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT);
    }

    ctx.restore();

    const totalSlotsWidth = CARD_SLOT_COUNT * CARD_SLOT_WIDTH + (CARD_SLOT_COUNT - 1) * CARD_SLOT_MARGIN;
    const slotsStartX = (canvas.width - totalSlotsWidth) / 2;
    const slotsY = canvas.height - CARD_SLOT_HEIGHT - CARD_SLOT_BOTTOM_MARGIN;

    for (let i = 0; i < CARD_SLOT_COUNT; i++) {
        const slotX = slotsStartX + i * (CARD_SLOT_WIDTH + CARD_SLOT_MARGIN);
        const slot = cardSlots[i];

        if (slot === null) {
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;
            ctx.strokeRect(slotX, slotsY, CARD_SLOT_WIDTH, CARD_SLOT_HEIGHT);

            ctx.fillStyle = '#666';
            ctx.font = '16px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('+', slotX + CARD_SLOT_WIDTH / 2, slotsY + CARD_SLOT_HEIGHT / 2);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
        } else {
            if (viewingCard && draggingCard && hoveringSlot === i) {
                ctx.fillStyle = '#ff6b6b';
            } else {
                ctx.fillStyle = '#daa520';
            }
            ctx.fillRect(slotX, slotsY, CARD_SLOT_WIDTH, CARD_SLOT_HEIGHT);

            ctx.fillStyle = '#000';
            ctx.font = '14px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(slot.letter, slotX + CARD_SLOT_WIDTH / 2, slotsY + CARD_SLOT_HEIGHT / 2);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
        }
    }

    for (let fc of fadingCards) {
        const elapsed = now - fc.startTime;
        const alpha = 1 - elapsed / CARD_FADE_DURATION;
        if (alpha > 0) {
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#daa520';
            ctx.fillRect(fc.x, fc.y, CARD_SLOT_WIDTH, CARD_SLOT_HEIGHT);
            ctx.fillStyle = '#000';
            ctx.font = '14px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(fc.letter, fc.x + CARD_SLOT_WIDTH / 2, fc.y + CARD_SLOT_HEIGHT / 2);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
            ctx.globalAlpha = 1;
        }
    }
    fadingCards = fadingCards.filter(fc => now - fc.startTime < CARD_FADE_DURATION);

    if (viewingCard) {
        if (draggingCard) {
            const cardX = mouse.x - DRAGGED_CARD_WIDTH / 2;
            const cardY = mouse.y - DRAGGED_CARD_HEIGHT / 2;

            ctx.fillStyle = '#daa520';
            ctx.fillRect(cardX, cardY, DRAGGED_CARD_WIDTH, DRAGGED_CARD_HEIGHT);

            ctx.fillStyle = '#000';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(viewingCard.effect.name.charAt(0).toUpperCase(), cardX + DRAGGED_CARD_WIDTH / 2, cardY + DRAGGED_CARD_HEIGHT / 2);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';

            if (hoveringSlot >= 0 && cardSlots[hoveringSlot] !== null) {
                const hoveredSlot = cardSlots[hoveringSlot];
                const hoveredEffect = getEffectById(hoveredSlot.effectId);
                if (hoveredEffect) {
                    const detailCardX = canvas.width * CARD_VIEW_CARD_X - CARD_UI_WIDTH_NEW / 2;
                    const detailCardY = canvas.height * 0.5 - CARD_UI_HEIGHT_NEW / 2;

                    ctx.fillStyle = '#daa520';
                    ctx.fillRect(detailCardX, detailCardY, CARD_UI_WIDTH_NEW, CARD_UI_HEIGHT_NEW);

                    ctx.fillStyle = '#000';
                    ctx.font = '12px "Press Start 2P", monospace';
                    ctx.fillText(hoveredEffect.name, detailCardX + 15, detailCardY + 40);
                    ctx.font = '10px "Press Start 2P", monospace';
                    ctx.fillText(hoveredEffect.desc, detailCardX + 15, detailCardY + 70);

                    ctx.fillStyle = '#ff4444';
                    ctx.font = '14px "Press Start 2P", monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText('REMOVE', detailCardX + CARD_UI_WIDTH_NEW / 2, detailCardY - 15);
                    ctx.textAlign = 'left';
                }
            }
        } else if (cardAnimation.active) {
            const cardStartScreenX = cardAnimation.cardStartWorldX - player.x + cx - CARD_WIDTH / 2;
            const cardStartScreenY = cardAnimation.cardStartWorldY - player.y + cy - CARD_HEIGHT / 2;
            const targetX = canvas.width * CARD_VIEW_CARD_X - CARD_UI_WIDTH_NEW / 2;
            const targetY = canvas.height * 0.5 - CARD_UI_HEIGHT_NEW / 2;

            const cardX = cardStartScreenX + (targetX - cardStartScreenX) * animProgress;
            const cardY = cardStartScreenY + (targetY - cardStartScreenY) * animProgress;
            const cardW = CARD_WIDTH + (CARD_UI_WIDTH_NEW - CARD_WIDTH) * animProgress;
            const cardH = CARD_HEIGHT + (CARD_UI_HEIGHT_NEW - CARD_HEIGHT) * animProgress;

            ctx.fillStyle = '#daa520';
            ctx.fillRect(cardX, cardY, cardW, cardH);

            if (animProgress > 0.5) {
                ctx.fillStyle = '#000';
                ctx.globalAlpha = (animProgress - 0.5) * 2;
                ctx.font = '12px "Press Start 2P", monospace';
                ctx.fillText(viewingCard.effect.name, cardX + 15, cardY + 40);
                ctx.font = '10px "Press Start 2P", monospace';
                ctx.fillText(viewingCard.effect.desc, cardX + 15, cardY + 70);
                ctx.globalAlpha = 1;
            }
        } else {
            const cardX = canvas.width * CARD_VIEW_CARD_X - CARD_UI_WIDTH_NEW / 2;
            const cardY = canvas.height * 0.5 - CARD_UI_HEIGHT_NEW / 2;

            ctx.fillStyle = '#daa520';
            ctx.fillRect(cardX, cardY, CARD_UI_WIDTH_NEW, CARD_UI_HEIGHT_NEW);

            ctx.fillStyle = '#000';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillText(viewingCard.effect.name, cardX + 15, cardY + 40);
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.fillText(viewingCard.effect.desc, cardX + 15, cardY + 70);

            const elapsed = now - cardViewStartTime;
            const remaining = Math.max(0, 1 - elapsed / CARD_VIEW_TIMEOUT);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(cardX, cardY + CARD_UI_HEIGHT_NEW + 5, CARD_UI_WIDTH_NEW * remaining, 5);

            ctx.fillStyle = '#fff';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Click to drag to a slot', canvas.width * CARD_VIEW_CARD_X, cardY + CARD_UI_HEIGHT_NEW + 30);
            ctx.textAlign = 'left';
        }
    }

    const tutorialElapsed = now - tutorialStartTime;
    if (tutorialElapsed < TUTORIAL_DURATION) {
        let alpha = 1;
        if (tutorialElapsed > TUTORIAL_DURATION - TUTORIAL_FADE_TIME) {
            alpha = (TUTORIAL_DURATION - tutorialElapsed) / TUTORIAL_FADE_TIME;
        }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#fff';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textAlign = 'center';

        ctx.fillText('CLICK TO SHOOT', playerScreenX, playerScreenY - 80);

        const firstEnemy = enemies.find(e => !e.dying);
        if (firstEnemy) {
            const enemyScreenX = firstEnemy.x - offsetX;
            const enemyScreenY = firstEnemy.y - offsetY;
            ctx.fillText('AVOID THE RED!', enemyScreenX, enemyScreenY - 30);
        }

        ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
    }

    if (now < firstCardHintUntil && cards.length > 0) {
        const hintTimeLeft = firstCardHintUntil - now;
        const alpha = Math.min(1, hintTimeLeft / 500);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#fff';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        const firstCard = cards[0];
        const cardScreenX = firstCard.x - offsetX;
        const cardScreenY = firstCard.y - offsetY;
        ctx.fillText('WALK OVER TO PICK UP', cardScreenX, cardScreenY - 30);
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
    }

    const elapsed = Math.floor((now - gameStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    if (minutes > lastMinuteMilestone && minutes > 0) {
        lastMinuteMilestone = minutes;
        playSoundMilestone();
        timerFlashUntil = now + 500;
    }

    if (now < timerFlashUntil) {
        ctx.fillStyle = Math.sin(now * 0.03) > 0 ? '#fff' : '#ff0';
    } else {
        ctx.fillStyle = '#fff';
    }
    ctx.font = '20px "Press Start 2P", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(timeStr, canvas.width - 20, 35);

    const hsMin = Math.floor(highScore / 60);
    const hsSec = highScore % 60;
    ctx.fillStyle = '#aaa';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText(`BEST: ${hsMin}:${hsSec.toString().padStart(2, '0')}`, canvas.width - 20, 55);
    ctx.textAlign = 'left';

    if (!hasBeatenHighScore && elapsed > highScore && highScore > 0) {
        hasBeatenHighScore = true;
        liveHighScoreBeatTime = now;
        playSoundMilestone();
    }

    if (liveHighScoreBeatTime > 0 && now < liveHighScoreBeatTime + 3000) {
        const bannerAge = now - liveHighScoreBeatTime;
        let alpha = 1;
        if (bannerAge > 2500) alpha = 1 - (bannerAge - 2500) / 500;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ff0';
        ctx.font = '24px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('NEW HIGH SCORE!', canvas.width / 2, canvas.height / 3);
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    const crossSize = 10;
    ctx.beginPath();
    ctx.moveTo(mouse.x - crossSize, mouse.y);
    ctx.lineTo(mouse.x + crossSize, mouse.y);
    ctx.moveTo(mouse.x, mouse.y - crossSize);
    ctx.lineTo(mouse.x, mouse.y + crossSize);
    ctx.stroke();
}
