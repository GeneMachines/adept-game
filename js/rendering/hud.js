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

    if (game.state === 'LAB_BENCH') {
        this.renderLabBench(ctx, game);
        return;
    }

    if (game.state === 'HOW_TO_PLAY') {
        this.renderHowToPlay(ctx);
        return;
    }

    if (game.state === 'GAME_OVER') {
        this.renderGameOver(ctx, game);
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
    this.drawTextCentered(ctx, 'OUTSMART THE CROWN OF THORNS', 118, '#607890', 5);

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
    var t = Date.now() / 1000;

    // Header
    this.drawTextCentered(ctx, 'SELECT MODE', 22, '#40e0c0', 7);

    // Decorative line
    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 70, 38, 140, 1);
    ctx.fillStyle = '#40e0c0';
    ctx.fillRect(cx - 30, 38, 60, 1);

    // Mode cards — big names with colored left borders
    var modes = [
        { key: '1', name: 'SYSTEMIC CHEMO', desc: 'Floods the tank with toxin', color: '#ff4040', bg: '#1a0808' },
        { key: '2', name: 'ADC', desc: 'Antibody-drug conjugate', color: '#40e040', bg: '#081a08' },
        { key: '3', name: 'ADEPT', desc: 'Enzyme-prodrug system', color: '#a040e0', bg: '#10081a' },
    ];

    var cardX = 18;
    var cardW = 220;
    var cardH = 34;
    var startY = 48;
    var gap = 42;

    for (var i = 0; i < modes.length; i++) {
        var m = modes[i];
        var y = startY + i * gap;

        // Card background
        ctx.fillStyle = m.bg;
        ctx.fillRect(cardX, y, cardW, cardH);

        // Left color border (3px wide)
        ctx.fillStyle = m.color;
        ctx.fillRect(cardX, y, 3, cardH);

        // Key number (big)
        this.drawText(ctx, m.key, cardX + 8, y + 4, m.color, 7);

        // Mode name (big)
        this.drawText(ctx, m.name, cardX + 22, y + 4, m.color, 7);

        // Description (small)
        this.drawText(ctx, m.desc, cardX + 22, y + 22, '#606080', 5);
    }

    // Decorative line
    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 70, startY + 3 * gap - 2, 140, 1);

    this.drawTextCentered(ctx, '[L] LAB BENCH', startY + 3 * gap + 10, '#40e0c0', 5);
    this.drawTextCentered(ctx, '[I] HOW TO PLAY', startY + 3 * gap + 22, '#40e0c0', 5);

    this.drawTextCentered(ctx, 'PRESS 1, 2 OR 3', startY + 3 * gap + 38, '#808890', 5);
    this.drawTextCentered(ctx, '[ESC] BACK', startY + 3 * gap + 50, '#404860', 5);

    // Animated cuttlefish behind menu
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
    this.drawTextCentered(ctx, 'Single crown of thorns', 114, '#606080', 5);

    var unlocked = game.isStageUnlocked(game.currentModeIndex, 4);
    if (unlocked) {
        this.drawTextCentered(ctx, '[2] STAGE IV', 136, '#e040c0', 7);
        this.drawTextCentered(ctx, 'Metastatic - it spreads!', 154, '#606080', 5);
    } else {
        this.drawTextCentered(ctx, '[2] STAGE IV', 136, '#403040', 7);
        this.drawTextCentered(ctx, 'Beat all 3 modes to unlock', 154, '#403040', 5);
    }

    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 60, 170, 120, 1);

    this.drawTextCentered(ctx, unlocked ? 'PRESS 1 OR 2' : 'PRESS 1', 182, '#808890', 5);
    this.drawTextCentered(ctx, '[ESC] BACK', 194, '#404860', 5);
};

ADEPT.HUD.prototype.renderLabBench = function(ctx, game) {
    var cx = ADEPT.Config.VIRTUAL_W / 2;
    var groupNames = ['SYSTEMIC CHEMO', 'ADC', 'ADEPT'];
    var groupColors = ['#ff4040', '#40e040', '#a040e0'];

    // Header
    this.drawTextCentered(ctx, 'L A B   B E N C H', 18, '#40e0c0', 7);

    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 70, 32, 140, 1);

    this.drawTextCentered(ctx, 'TWEAK DRUG PARAMETERS', 40, '#606080', 5);

    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 70, 50, 140, 1);

    // Parameter rows grouped by mode
    var params = game.labBenchParams;
    var cursor = game.labBenchCursor;
    var y = 58;
    var lastGroup = -1;

    for (var i = 0; i < params.length; i++) {
        var p = params[i];
        var gcol = groupColors[p.group];

        // Mode header when group changes
        if (p.group !== lastGroup) {
            if (lastGroup !== -1) y += 4;
            this.drawText(ctx, groupNames[p.group], 14, y, gcol, 5);
            y += 12;
            lastGroup = p.group;
        }

        var selected = (i === cursor);
        var rowCol = selected ? gcol : '#606080';

        // Cursor indicator
        if (selected) {
            this.drawText(ctx, '>', 12, y, gcol, 5);
        }

        // Parameter name
        this.drawText(ctx, p.name, 22, y, rowCol, 5);

        // Bar visualization
        var barX = 128;
        var barW = 54;
        var barH = 5;
        var fraction = (p.value - p.min) / (p.max - p.min);

        // Bar background
        ctx.fillStyle = '#1a1a2a';
        ctx.fillRect(barX, y, barW, barH);

        // Bar fill
        ctx.fillStyle = selected ? gcol : '#404060';
        ctx.fillRect(barX, y, Math.round(barW * fraction), barH);

        // Bar border
        ctx.fillStyle = '#404060';
        ctx.fillRect(barX - 1, y - 1, barW + 2, 1);
        ctx.fillRect(barX - 1, y + barH, barW + 2, 1);
        ctx.fillRect(barX - 1, y, 1, barH);
        ctx.fillRect(barX + barW, y, 1, barH);

        // Position marker
        var markerX = barX + Math.round(barW * fraction);
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(markerX, y - 1, 1, barH + 2);

        // Value text
        var decimals = 0;
        if (p.step < 1) decimals = 1;
        if (p.step < 0.1) decimals = 2;
        var valStr = p.value.toFixed(decimals);
        this.drawText(ctx, valStr, barX + barW + 6, y, selected ? '#f0f0f0' : '#808080', 5);

        y += 14;
    }

    // Bottom section
    y += 8;
    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 70, y, 140, 1);

    this.drawTextCentered(ctx, '[UP/DOWN] SELECT', y + 12, '#606080', 5);
    this.drawTextCentered(ctx, '[LEFT/RIGHT] ADJUST', y + 24, '#606080', 5);
    this.drawTextCentered(ctx, '[SPACE] SAVE  [ESC] BACK', y + 40, '#404860', 5);
};

ADEPT.HUD.prototype.renderHowToPlay = function(ctx) {
    var cx = ADEPT.Config.VIRTUAL_W / 2;

    this.drawTextCentered(ctx, 'H O W   T O   P L A Y', 18, '#40e0c0', 7);

    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 70, 34, 140, 1);

    this.drawText(ctx, 'CONTROLS', 14, 42, '#40e0c0', 5);
    this.drawText(ctx, '[HOLD SPACE] CHARGE DOSE', 14, 54, '#e0e040', 5);
    this.drawText(ctx, '[RELEASE] DEPLOY INTO TANK', 14, 66, '#e0e040', 5);
    this.drawText(ctx, 'LONGER CHARGE = BIGGER DOSE', 14, 78, '#808090', 5);

    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 70, 92, 140, 1);

    this.drawText(ctx, 'ADEPT MODE', 14, 100, '#a040e0', 5);
    this.drawText(ctx, '1. [SPACE] DEPLOY AB-ENZYME', 14, 112, '#a040e0', 5);
    this.drawText(ctx, '2. WAIT FOR OFF-TARGET CLEARING', 14, 124, '#e0a040', 5);
    this.drawText(ctx, '3. [SPACE] DEPLOY PRODRUG', 14, 136, '#ff4040', 5);
    this.drawText(ctx, '[E] ADD MORE ENZYME', 14, 148, '#808090', 5);

    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 70, 162, 140, 1);

    this.drawText(ctx, 'GOAL', 14, 170, '#40e0c0', 5);
    this.drawText(ctx, 'KILL THE CROWN OF THORNS', 14, 182, '#808090', 5);
    this.drawText(ctx, 'PROTECT YOUR CUTTLEFISH', 14, 194, '#808090', 5);

    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 70, 208, 140, 1);

    this.drawTextCentered(ctx, '[ESC] BACK', 218, '#404860', 5);
};

ADEPT.HUD.prototype.renderIntro = function(ctx, game) {
    var cx = ADEPT.Config.VIRTUAL_W / 2;
    var modeName = game.mode ? game.mode.name : '';

    // Dark panel behind text for readability
    ctx.fillStyle = 'rgba(8, 12, 20, 0.85)';
    ctx.fillRect(8, 40, ADEPT.Config.VIRTUAL_W - 16, 160);

    this.drawTextCentered(ctx, modeName, 70, '#f0f0f0', 8);

    // Stage label
    if (game.mode && game.mode.stage === 4) {
        this.drawTextCentered(ctx, 'STAGE IV - METASTATIC', 88, '#e040c0', 5);
    } else {
        this.drawTextCentered(ctx, 'STAGE I', 88, '#40e0c0', 5);
    }

    // Brief hint
    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 60, 102, 120, 1);

    this.drawTextCentered(ctx, '[HOLD SPACE] DEPLOY', 114, '#808090', 5);

    this.drawTextCentered(ctx, 'PRESS ANY KEY', 150, '#e0e040', 5);
    this.drawTextCentered(ctx, '[ESC] BACK', 164, '#404860', 5);
};

ADEPT.HUD.prototype.renderResults = function(ctx, game) {
    var cx = ADEPT.Config.VIRTUAL_W / 2;
    var result = game.result;
    if (!result) return;

    var modeName = game.mode ? game.mode.name : '';
    var stageStr = game.currentStage === 4 ? ' - STAGE IV' : ' - STAGE I';
    this.drawTextCentered(ctx, 'RESULTS', 14, '#f0f0f0', 7);
    this.drawTextCentered(ctx, modeName + stageStr, 30, '#808090', 5);

    ctx.fillStyle = '#304060';
    ctx.fillRect(30, 40, 196, 1);

    var y = 46;
    var tumorLabel = result.tumorKilled ? 'YES' : 'NO';
    var tumorColor = result.tumorKilled ? '#40e040' : '#e04040';
    this.drawText(ctx, 'COT KILLED:', 30, y, '#c0c0c0', 5);
    this.drawText(ctx, tumorLabel, 150, y, tumorColor, 5);
    this.drawText(ctx, '+' + result.tumorScore, 190, y, '#f0e040', 5);

    y += 12;
    this.drawText(ctx, 'CUTTLEFISH:', 30, y, '#c0c0c0', 5);
    this.drawText(ctx, result.cuttlefishAlive + '/' + result.totalCuttlefish, 150, y, '#e06040', 5);
    this.drawText(ctx, '+' + result.cuttleScore, 190, y, '#f0e040', 5);

    y += 12;
    this.drawText(ctx, 'EFFICIENCY:', 30, y, '#c0c0c0', 5);
    this.drawText(ctx, '+' + result.efficiencyScore, 190, y, '#f0e040', 5);

    // Therapeutic index
    y += 12;
    var tiStr = result.therapeuticIndex + '%';
    var tiColor = result.therapeuticIndex >= 80 ? '#40e040' : result.therapeuticIndex >= 40 ? '#e0e040' : '#e04040';
    this.drawText(ctx, 'THERAPEUTIC INDEX:', 30, y, '#c0c0c0', 5);
    this.drawText(ctx, tiStr, 150, y, tiColor, 5);

    ctx.fillStyle = '#304060';
    y += 12;
    ctx.fillRect(30, y, 196, 1);

    y += 6;
    this.drawText(ctx, 'TOTAL:', 30, y, '#f0f0f0', 5);
    this.drawText(ctx, String(result.score), 180, y, '#f0e040', 5);

    // High score
    y += 12;
    if (result.isNewHighScore) {
        var blink = Math.sin(Date.now() / 1000 * 4) > 0;
        if (blink) {
            this.drawTextCentered(ctx, 'NEW HIGH SCORE!', y, '#f0e040', 5);
        }
    } else if (result.highScore > 0) {
        this.drawText(ctx, 'HIGH SCORE:', 30, y, '#606080', 5);
        this.drawText(ctx, String(result.highScore), 180, y, '#606080', 5);
    }

    // Stars
    y += 14;
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

    y += 14;
    if (result.stars === 3) {
        this.drawTextCentered(ctx, 'PERFECT!', y, '#f0e040', 5);
    } else if (result.stars === 0 && !result.tumorKilled) {
        this.drawTextCentered(ctx, 'CROWN OF THORNS SURVIVED...', y, '#e04040', 5);
    }

    y += 14;
    this.drawText(ctx, '[R] RETRY', 30, y, '#808890', 5);
    this.drawText(ctx, '[N] NEXT', 95, y, '#808890', 5);
    this.drawText(ctx, '[M] MENU', 155, y, '#808890', 5);
    this.drawText(ctx, '[ESC]', 215, y, '#404860', 5);
};

ADEPT.HUD.prototype.renderGameOver = function(ctx, game) {
    var cx = ADEPT.Config.VIRTUAL_W / 2;
    var cy = ADEPT.Config.VIRTUAL_H / 2;
    var t = game.gameOverTimer;

    // Dark overlay that fades in
    var fade = Math.min(1, t / 1.0);
    ctx.fillStyle = 'rgba(10, 0, 0, ' + (fade * 0.7) + ')';
    ctx.fillRect(0, 0, ADEPT.Config.VIRTUAL_W, ADEPT.Config.VIRTUAL_H);

    // Scanlines for CRT drama
    if (fade > 0.3) {
        ctx.fillStyle = 'rgba(60, 0, 0, 0.08)';
        for (var sl = 0; sl < ADEPT.Config.VIRTUAL_H; sl += 2) {
            ctx.fillRect(0, sl, ADEPT.Config.VIRTUAL_W, 1);
        }
    }

    // "GAME OVER" — big, red, shaking
    if (t > 0.3) {
        var shake = t < 1.0 ? (1.0 - t) * 3 : 0;
        var sx = Math.round((Math.random() - 0.5) * shake);
        var sy = Math.round((Math.random() - 0.5) * shake);

        // Glow behind text
        ctx.fillStyle = 'rgba(180, 0, 0, ' + (fade * 0.3) + ')';
        var tw = ADEPT.BitmapFont.measure('GAME OVER', 8);
        var tx = Math.round(cx - tw / 2) + sx;
        ctx.fillRect(tx - 4, cy - 30 + sy, tw + 8, 18);

        this.drawText(ctx, 'GAME OVER', tx, cy - 28 + sy, '#e02020', 8);
    }

    // Flavor text
    if (t > 1.0) {
        this.drawTextCentered(ctx, 'ALL CUTTLEFISH LOST', cy + 4, '#804040', 5);
    }

    // "PRESS ANY KEY" after delay
    if (t > 1.5) {
        var blink = Math.sin(Date.now() / 1000 * 3) > 0;
        if (blink) {
            this.drawTextCentered(ctx, 'PRESS ANY KEY', cy + 30, '#808080', 5);
        }
    }
};
