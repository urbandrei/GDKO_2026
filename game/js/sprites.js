// Sprite Rendering Functions

function drawSpriteFrame(img, frameX, frameY, screenX, screenY, flipH, scale) {
    if (spriteFrameWidth === 0 || spriteFrameHeight === 0) return;
    const srcX = frameX * spriteFrameWidth;
    const srcY = frameY * spriteFrameHeight;
    const drawWidth = spriteFrameWidth * scale;
    const drawHeight = spriteFrameHeight * scale;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(screenX, screenY);
    if (flipH) {
        ctx.scale(-1, 1);
    }
    ctx.drawImage(
        img,
        srcX, srcY, spriteFrameWidth, spriteFrameHeight,
        -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight
    );
    ctx.restore();
}

function drawTintedHair(frameX, frameY, screenX, screenY, flipH, scale, tintColor) {
    if (spriteFrameWidth === 0 || spriteFrameHeight === 0) return;
    const srcX = frameX * spriteFrameWidth;
    const srcY = frameY * spriteFrameHeight;
    const drawWidth = spriteFrameWidth * scale;
    const drawHeight = spriteFrameHeight * scale;

    const offCanvas = document.createElement('canvas');
    offCanvas.width = spriteFrameWidth;
    offCanvas.height = spriteFrameHeight;
    const offCtx = offCanvas.getContext('2d');
    offCtx.imageSmoothingEnabled = false;

    offCtx.drawImage(hairImg, srcX, srcY, spriteFrameWidth, spriteFrameHeight, 0, 0, spriteFrameWidth, spriteFrameHeight);

    if (tintColor && tintColor !== 'black') {
        offCtx.globalCompositeOperation = 'source-atop';
        offCtx.fillStyle = tintColor;
        offCtx.fillRect(0, 0, spriteFrameWidth, spriteFrameHeight);
    }

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(screenX, screenY);
    if (flipH) {
        ctx.scale(-1, 1);
    }
    ctx.drawImage(offCanvas, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
}

function drawGun(screenX, screenY, mouseX, mouseY) {
    if (gunWidth === 0 || gunHeight === 0) return;

    const dx = mouseX - screenX;
    const dy = mouseY - screenY;
    const angle = Math.atan2(dy, dx);
    const aimingLeft = mouseX < screenX;
    const gunScale = 4.2;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(screenX, screenY);
    ctx.rotate(angle);
    if (aimingLeft) {
        ctx.scale(1, -1);
    }
    ctx.drawImage(gunImg, -gunWidth * gunScale / 2, -gunHeight * gunScale / 2, gunWidth * gunScale, gunHeight * gunScale);
    ctx.restore();
}

function drawRoundedRect(cx, cy, size, radius, recoilX, recoilY) {
    const half = size / 2;
    const x = cx - half + recoilX;
    const y = cy - half + recoilY;
    if (radius >= half) {
        ctx.beginPath();
        ctx.arc(cx + recoilX, cy + recoilY, half, 0, Math.PI * 2);
        ctx.fill();
        return;
    }
    if (radius <= 0) {
        ctx.fillRect(x, y, size, size);
        return;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + size - radius, y);
    ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
    ctx.lineTo(x + size, y + size - radius);
    ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
    ctx.lineTo(x + radius, y + size);
    ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}
