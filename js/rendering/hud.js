window.ADEPT = window.ADEPT || {};

ADEPT.HUD = function() {};

ADEPT.HUD.prototype.drawText = function(ctx, text, x, y, color, size) {
    ADEPT.BitmapFont.draw(ctx, text, x, y, color, size);
};

ADEPT.HUD.prototype.drawTextCentered = function(ctx, text, y, color, size) {
    var w = ADEPT.BitmapFont.measure(text, size);
    var x = Math.round(ADEPT.Config.VIRTUAL_W / 2 - w / 2);
    ADEPT.BitmapFont.draw(ctx, text, x, y, color, size);
};

ADEPT.HUD.prototype.render = function(game) {
    var ctx = game.renderer.getContext();
    var T = ADEPT.Config.TANK;

    if (game.state === 'TITLE') {
        this.renderTitle(ctx);
        return;
    }

    if (game.state === 'MENU') {
        this.renderMenu(ctx);
        return;
    }

    if (game.state === 'STAGE_SELECT') {
        this.renderStageSelect(ctx, game);
        return;
    }

    if (game.state === 'RESULTS') {
        this.renderResults(ctx, game);
        return;
    }

    if (game.state === 'MODE_INTRO') {
        this.renderIntro(ctx, game);
        return;
    }

    // Top bar - mode name + stage label
    var modeName = game.mode ? game.mode.name : '';
    if (game.mode && game.mode.stage === 4) {
        modeName += ' IV';
    }
    this.drawText(ctx, modeName, T.LEFT, 4, '#f0f0f0', 5);

    // Score (right-aligned)
    var scoreStr = 'SCORE ' + String(game.score).padStart(4, '0');
    var scoreW = ADEPT.BitmapFont.measure(scoreStr, 5);
    this.drawText(ctx, scoreStr, T.RIGHT - scoreW - 1, 4, '#f0e040', 5);

    // Timer
    var timeStr = Math.floor(game.mode ? game.mode.roundTimer : 0) + 's';
    this.drawText(ctx, timeStr, T.CENTER_X - 8, 4, '#80a0c0', 5);

    // ESC hint (subtle, after timer)
    this.drawText(ctx, '[ESC]', T.CENTER_X + 10, 4, '#303850', 5);

    // Bottom HUD area
    var hudY = T.BOTTOM + 8;

    // Charge meter
    this.drawText(ctx, 'DOSE', T.LEFT, hudY, '#808080', 5);
    var meterX = T.LEFT + 25;
    var meterW = 60;
    var meterH = 6;

    // Meter background
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(meterX, hudY, meterW, meterH);
    ctx.fillStyle = '#303040';
    ctx.fillRect(meterX, hudY, meterW, 1);

    // Charge fill
    var charge = game.input.getNormalizedCharge();
    if (charge > 0) {
        var fillW = Math.round(meterW * charge);
        // Color zones
        if (charge < 0.2) {
            ctx.fillStyle = '#40a040'; // green - too little
        } else if (charge < 0.6) {
            ctx.fillStyle = '#e0e040'; // yellow - sweet spot
        } else if (charge < 0.8) {
            ctx.fillStyle = '#e08040'; // orange - risky
        } else {
            ctx.fillStyle = '#e04040'; // red - danger
        }
        ctx.fillRect(meterX, hudY, fillW, meterH);
    }

    // Meter border
    ctx.fillStyle = '#606070';
    ctx.fillRect(meterX - 1, hudY - 1, meterW + 2, 1);
    ctx.fillRect(meterX - 1, hudY + meterH, meterW + 2, 1);
    ctx.fillRect(meterX - 1, hudY, 1, meterH);
    ctx.fillRect(meterX + meterW, hudY, 1, meterH);

    // Zone markers
    ctx.fillStyle = '#404050';
    ctx.fillRect(meterX + Math.round(meterW * 0.2), hudY, 1, meterH);
    ctx.fillRect(meterX + Math.round(meterW * 0.6), hudY, 1, meterH);
    ctx.fillRect(meterX + Math.round(meterW * 0.8), hudY, 1, meterH);

    // Cuttlefish count
    var cuttleAlive = game.getCuttlefishAlive();
    var cuttleTotal = game.getCuttlefishTotal();
    this.drawText(ctx, 'CUTTLEFISH', meterX + meterW + 8, hudY, '#808080', 5);
    var fishX = meterX + meterW + 62;
    for (var i = 0; i < cuttleTotal; i++) {
        ctx.fillStyle = i < cuttleAlive ? '#e06040' : '#303030';
        // Mini cuttlefish icon
        ctx.fillRect(fishX + i * 8, hudY + 1, 4, 3);
        ctx.fillRect(fishX + i * 8 + 4, hudY + 2, 1, 1);
    }

    // ADEPT phase indicator
    if (game.mode && game.mode.phase !== undefined) {
        var phaseY = hudY + 12;
        if (game.mode.phase === 1) {
            var doseStr = game.mode.aeDoses ? ' (' + game.mode.aeDoses + '/' + game.mode.maxAEDoses + ')' : '';
            this.drawText(ctx, '[SPACE] DEPLOY AB-ENZYME' + doseStr, T.LEFT, phaseY, '#a040e0', 5);
        } else if (game.mode.phase === 2) {
            var offTarget = game.mode.getOffTargetCount ? game.mode.getOffTargetCount(game) : 0;
            this.drawText(ctx, 'CLEARING... OFF-TARGET: ' + offTarget, T.LEFT, phaseY, '#e0a040', 5);
            this.drawText(ctx, '[SPACE] PRODRUG', T.LEFT, phaseY + 10, '#808890', 5);
            if (game.mode.aeDoses < game.mode.maxAEDoses) {
                this.drawText(ctx, '[E] MORE ENZYME', T.LEFT + 90, phaseY + 10, '#a040e0', 5);
            }
        } else if (game.mode.phase === 4) {
            this.drawText(ctx, 'PRODRUG ACTIVE [SPACE] MORE', T.LEFT, phaseY, '#ff4040', 5);
        }
    } else if (game.mode) {
        // Non-ADEPT modes
        var instrY = hudY + 12;
        if (!game.mode.dosed) {
            this.drawText(ctx, '[HOLD SPACE] CHARGE  [RELEASE] DEPLOY', T.LEFT, instrY, '#606080', 5);
        }
    }

    // Controls hint for charging
    if (game.input.charging) {
        this.drawText(ctx, 'CHARGING...', meterX, hudY + meterH + 2, '#e0e040', 5);
    }

    // "METASTASIS!" blinking warning (Stage IV)
    if (game.mode && game.mode._metWarningTimer > 0) {
        var t = Date.now() / 1000;
        if (Math.sin(t * 8) > 0) {
            this.drawTextCentered(ctx, 'METASTASIS!', T.TOP + 6, '#e040c0', 7);
        }
    }
};

ADEPT.HUD.prototype.renderTitle = function(ctx) {
    var cx = ADEPT.Config.VIRTUAL_W / 2;
    var t = Date.now() / 1000;

    // Subtle scanline overlay for arcade CRT feel
    ctx.fillStyle = 'rgba(0, 20, 40, 0.15)';
    for (var sl = 0; sl < ADEPT.Config.VIRTUAL_H; sl += 2) {
        ctx.fillRect(0, sl, ADEPT.Config.VIRTUAL_W, 1);
    }

    // Top decorative line
    ctx.fillStyle = '#1a4060';
    ctx.fillRect(cx - 80, 40, 160, 1);
    ctx.fillStyle = '#40e0c0';
    ctx.fillRect(cx - 40, 40, 80, 1);

    // "CUTTLEFISH BIO" — main branding, big and teal
    this.drawTextCentered(ctx, 'CUTTLEFISH', 50, '#40e0c0', 8);
    this.drawTextCentered(ctx, 'BIO', 64, '#40e0c0', 8);

    // Decorative dot separators (flanking BIO)
    ctx.fillStyle = '#40e0c0';
    ctx.fillRect(cx - 22, 68, 2, 2);
    ctx.fillRect(cx + 20, 68, 2, 2);

    // "— ADEPT —" subtitle
    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 70, 84, 140, 1);
    this.drawTextCentered(ctx, 'A D E P T', 92, '#f0f0f0', 7);
    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 70, 108, 140, 1);

    // Tagline
    this.drawTextCentered(ctx, 'OUTSMART THE INVADER', 118, '#607890', 5);

    // Animated cuttlefish swimming across the screen
    var fishPhase = t * 0.4;
    var fishX = ((fishPhase % 1) * (ADEPT.Config.VIRTUAL_W + 40)) - 20;
    var fishY = 140 + Math.sin(t * 1.5) * 4;
    var sprite = ADEPT.Sprites ? ADEPT.Sprites.get('cuttlefish-flip') : null;
    if (sprite && sprite.complete) {
        ctx.globalAlpha = 0.4;
        ctx.drawImage(sprite, Math.round(fishX) - 14, Math.round(fishY) - 13);
        ctx.globalAlpha = 1.0;
    } else {
        ctx.fillStyle = 'rgba(224, 96, 64, 0.3)';
        ctx.fillRect(Math.round(fishX) - 5, Math.round(fishY) - 3, 10, 7);
    }

    // "PRESS ANY KEY" — classic arcade blink
    var blink = Math.sin(t * 3) > 0;
    if (blink) {
        this.drawTextCentered(ctx, 'PRESS ANY KEY', 170, '#e0e040', 5);
    }

    // Bottom decorative line
    ctx.fillStyle = '#1a4060';
    ctx.fillRect(cx - 80, 190, 160, 1);
    ctx.fillStyle = '#40e0c0';
    ctx.fillRect(cx - 40, 190, 80, 1);

    // Copyright/version
    this.drawTextCentered(ctx, '2026 CUTTLEFISH BIO', 202, '#303850', 5);
};

ADEPT.HUD.prototype.renderMenu = function(ctx) {
    var cx = ADEPT.Config.VIRTUAL_W / 2;

    this.drawTextCentered(ctx, 'ADEPT GAME', 30, '#40e0c0', 8);
    this.drawTextCentered(ctx, 'by Cuttlefish Bio', 48, '#607090', 5);

    // Decorative line
    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 60, 60, 120, 1);

    this.drawTextCentered(ctx, '[1] SYSTEMIC CHEMO', 72, '#ff4040', 5);
    this.drawTextCentered(ctx, 'Floods the tank with toxin', 82, '#606080', 5);

    this.drawTextCentered(ctx, '[2] ADC', 100, '#40e040', 5);
    this.drawTextCentered(ctx, 'Antibody-drug conjugate', 110, '#606080', 5);

    this.drawTextCentered(ctx, '[3] ADEPT', 128, '#a040e0', 5);
    this.drawTextCentered(ctx, 'Pretargeted enzyme-prodrug', 138, '#606080', 5);

    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 60, 156, 120, 1);

    this.drawTextCentered(ctx, 'PRESS 1, 2 OR 3', 168, '#808890', 5);
    this.drawTextCentered(ctx, '[ESC] BACK', 180, '#404860', 5);

    // Animated cuttlefish behind menu
    var t = Date.now() / 1000;
    var fishX = cx + Math.sin(t * 0.5) * 40;
    var fishY = 210 + Math.sin(t * 0.8) * 5;
    ctx.fillStyle = 'rgba(224, 96, 64, 0.3)';
    ctx.fillRect(Math.round(fishX) - 5, Math.round(fishY) - 3, 10, 7);
    ctx.fillRect(Math.round(fishX) - 6, Math.round(fishY) - 2, 12, 5);
};

ADEPT.HUD.prototype.renderStageSelect = function(ctx, game) {
    var cx = ADEPT.Config.VIRTUAL_W / 2;
    var modeNames = ['SYSTEMIC CHEMO', 'ADC', 'ADEPT'];
    var modeColors = ['#ff4040', '#40e040', '#a040e0'];
    var name = modeNames[game.currentModeIndex] || '';
    var col = modeColors[game.currentModeIndex] || '#f0f0f0';

    this.drawTextCentered(ctx, name, 40, col, 8);

    // Decorative line
    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 60, 58, 120, 1);

    this.drawTextCentered(ctx, 'SELECT STAGE', 70, '#808890', 5);

    this.drawTextCentered(ctx, '[1] STAGE I', 96, '#40e0c0', 7);
    this.drawTextCentered(ctx, 'Single tumor', 114, '#606080', 5);

    var unlocked = game.isStageUnlocked(game.currentModeIndex, 4);
    if (unlocked) {
        this.drawTextCentered(ctx, '[2] STAGE IV', 136, '#e040c0', 7);
        this.drawTextCentered(ctx, 'Metastatic - tumor spreads!', 154, '#606080', 5);
    } else {
        this.drawTextCentered(ctx, '[2] STAGE IV', 136, '#403040', 7);
        this.drawTextCentered(ctx, 'Beat Stage I to unlock', 154, '#403040', 5);
    }

    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 60, 170, 120, 1);

    this.drawTextCentered(ctx, unlocked ? 'PRESS 1 OR 2' : 'PRESS 1', 182, '#808890', 5);
    this.drawTextCentered(ctx, '[ESC] BACK', 194, '#404860', 5);
};

ADEPT.HUD.prototype.renderIntro = function(ctx, game) {
    var cx = ADEPT.Config.VIRTUAL_W / 2;
    var modeName = game.mode ? game.mode.name : '';
    var desc = game.mode ? game.mode.description : '';

    this.drawTextCentered(ctx, modeName, 50, '#f0f0f0', 8);

    // Stage label
    if (game.mode && game.mode.stage === 4) {
        this.drawTextCentered(ctx, 'STAGE IV - METASTATIC', 66, '#e040c0', 5);
    } else {
        this.drawTextCentered(ctx, 'STAGE I', 66, '#40e0c0', 5);
    }

    // Word wrap description
    var words = desc.split(' ');
    var line = '';
    var lineY = 84;
    for (var i = 0; i < words.length; i++) {
        var testLine = line + (line ? ' ' : '') + words[i];
        if (testLine.length > 42) {
            this.drawText(ctx, line, 20, lineY, '#808090', 5);
            line = words[i];
            lineY += 10;
        } else {
            line = testLine;
        }
    }
    if (line) {
        this.drawText(ctx, line, 20, lineY, '#808090', 5);
    }

    this.drawTextCentered(ctx, 'PRESS ANY KEY', 178, '#e0e040', 5);
    this.drawTextCentered(ctx, '[ESC] BACK', 190, '#404860', 5);
};

ADEPT.HUD.prototype.renderResults = function(ctx, game) {
    var cx = ADEPT.Config.VIRTUAL_W / 2;
    var result = game.result;
    if (!result) return;

    var modeName = game.mode ? game.mode.name : '';
    var stageStr = game.currentStage === 4 ? ' - STAGE IV' : ' - STAGE I';
    this.drawTextCentered(ctx, 'RESULTS', 20, '#f0f0f0', 7);
    this.drawTextCentered(ctx, modeName + stageStr, 38, '#808090', 5);

    ctx.fillStyle = '#304060';
    ctx.fillRect(30, 50, 196, 1);

    var y = 58;
    var tumorLabel = result.tumorKilled ? 'YES' : 'NO';
    var tumorColor = result.tumorKilled ? '#40e040' : '#e04040';
    this.drawText(ctx, 'TUMOR KILLED:', 30, y, '#c0c0c0', 5);
    this.drawText(ctx, tumorLabel, 150, y, tumorColor, 5);
    this.drawText(ctx, '+' + result.tumorScore, 190, y, '#f0e040', 5);

    y += 14;
    this.drawText(ctx, 'CUTTLEFISH:', 30, y, '#c0c0c0', 5);
    this.drawText(ctx, result.cuttlefishAlive + '/' + result.totalCuttlefish, 150, y, '#e06040', 5);
    this.drawText(ctx, '+' + result.cuttleScore, 190, y, '#f0e040', 5);

    y += 14;
    this.drawText(ctx, 'EFFICIENCY:', 30, y, '#c0c0c0', 5);
    this.drawText(ctx, '+' + result.efficiencyScore, 190, y, '#f0e040', 5);

    ctx.fillStyle = '#304060';
    y += 14;
    ctx.fillRect(30, y, 196, 1);

    y += 8;
    this.drawText(ctx, 'TOTAL:', 30, y, '#f0f0f0', 5);
    this.drawText(ctx, String(result.score), 180, y, '#f0e040', 5);

    // Stars
    y += 16;
    for (var i = 0; i < 3; i++) {
        var filled = i < result.stars;
        var sx = cx - 20 + i * 16;
        ctx.fillStyle = filled ? '#f0e040' : '#303040';
        // Star shape (simple pixel star)
        ctx.fillRect(sx + 2, y, 3, 1);
        ctx.fillRect(sx, y + 1, 7, 1);
        ctx.fillRect(sx + 1, y + 2, 5, 1);
        ctx.fillRect(sx + 1, y + 3, 2, 1);
        ctx.fillRect(sx + 4, y + 3, 2, 1);
    }

    y += 16;
    if (result.stars === 3) {
        this.drawTextCentered(ctx, 'PERFECT!', y, '#f0e040', 5);
    } else if (result.stars === 0 && !result.tumorKilled) {
        this.drawTextCentered(ctx, 'TUMOR SURVIVED...', y, '#e04040', 5);
    }

    y += 16;
    this.drawText(ctx, '[R] RETRY', 30, y, '#808890', 5);
    this.drawText(ctx, '[N] NEXT', 95, y, '#808890', 5);
    this.drawText(ctx, '[M] MENU', 155, y, '#808890', 5);
    this.drawText(ctx, '[ESC]', 215, y, '#404860', 5);
};
