// Card System Functions

function getSlotAtPosition(x, y) {
    const totalWidth = CARD_SLOT_COUNT * CARD_SLOT_WIDTH + (CARD_SLOT_COUNT - 1) * CARD_SLOT_MARGIN;
    const startX = (canvas.width - totalWidth) / 2;
    const slotY = canvas.height - CARD_SLOT_HEIGHT - CARD_SLOT_BOTTOM_MARGIN;

    for (let i = 0; i < CARD_SLOT_COUNT; i++) {
        const slotX = startX + i * (CARD_SLOT_WIDTH + CARD_SLOT_MARGIN);
        if (x >= slotX && x <= slotX + CARD_SLOT_WIDTH &&
            y >= slotY && y <= slotY + CARD_SLOT_HEIGHT) {
            return i;
        }
    }
    return -1;
}

function getSlotPosition(index) {
    const totalWidth = CARD_SLOT_COUNT * CARD_SLOT_WIDTH + (CARD_SLOT_COUNT - 1) * CARD_SLOT_MARGIN;
    const startX = (canvas.width - totalWidth) / 2;
    const slotY = canvas.height - CARD_SLOT_HEIGHT - CARD_SLOT_BOTTOM_MARGIN;
    const slotX = startX + index * (CARD_SLOT_WIDTH + CARD_SLOT_MARGIN);
    return { x: slotX, y: slotY };
}

function rebuildActiveEffects() {
    activeEffects = cardSlots.filter(s => s !== null).map(s => s.effectId);
}

function removeCardFromSlot(now) {
    playSoundDamage();
    for (let i = CARD_SLOT_COUNT - 1; i >= 0; i--) {
        if (cardSlots[i] !== null) {
            const pos = getSlotPosition(i);
            fadingCards.push({
                effectId: cardSlots[i].effectId,
                letter: cardSlots[i].letter,
                startTime: now,
                x: pos.x,
                y: pos.y
            });
            cardSlots[i] = null;
            rebuildActiveEffects();
            return true;
        }
    }
    return false;
}

function hasCardsInSlots() {
    return cardSlots.some(s => s !== null);
}

function getEffectById(effectId) {
    return CARD_EFFECTS.find(e => e.id === effectId);
}

function getCardScale() {
    if (!draggingCard) return 1.0;
    const restingY = canvas.height * 0.5;
    const dropZoneY = canvas.height - 100;
    const cardCenterY = dragPos.y + CARD_UI_HEIGHT_NEW / 2;
    const progress = Math.max(0, Math.min(1, (cardCenterY - restingY) / (dropZoneY - restingY)));
    const minScale = MINI_CARD_SIZE / CARD_UI_WIDTH_NEW;
    return 1.0 - (1.0 - minScale) * progress;
}

function shouldShowCardText() {
    return getCardScale() > 0.5;
}
