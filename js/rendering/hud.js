window.ADEPT = window.ADEPT || {};

ADEPT.HUD = function() {
    this.fontLoaded = false;
};

ADEPT.HUD.prototype.drawText = function(ctx, text, x, y, color, size) {
    ctx.fillStyle = color || '#f0f0f0';
    // Use pixel font at small size for crisp rendering
    ctx.font = (size || 5) + 'px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';
    ctx.fillText(text, x, y);
};

ADEPT.HUD.prototype.render = function(game) {
    var ctx = game.renderer.getContext();
    var T = ADEPT.Config.TANK;

    if (game.state === 'MENU') {
        this.renderMenu(ctx);
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

    // Top bar - mode name
    var modeName = game.mode ? game.mode.name : '';
    this.drawText(ctx, modeName, T.LEFT, 4, '#f0f0f0', 5);

    // Score
    var scoreStr = 'SCORE ' + String(game.score).padStart(4, '0');
    this.drawText(ctx, scoreStr, T.RIGHT - 50, 4, '#f0e040', 5);

    // Timer
    var timeStr = Math.floor(game.mode ? game.mode.roundTimer : 0) + 's';
    this.drawText(ctx, timeStr, T.CENTER_X - 8, 4, '#80a0c0', 5);

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
            this.drawText(ctx, '[HOLD SPACE] DEPLOY ANTIBODY-ENZYME' + doseStr, T.LEFT, phaseY, '#a040e0', 5);
        } else if (game.mode.phase === 2) {
            var offTarget = game.mode.getOffTargetCount ? game.mode.getOffTargetCount(game) : 0;
            this.drawText(ctx, 'CLEARING... OFF-TARGET: ' + offTarget, T.LEFT, phaseY, '#e0a040', 5);
            this.drawText(ctx, '[HOLD SPACE] PRODRUG', T.LEFT, phaseY + 10, '#808890', 5);
            if (game.mode.aeDoses < game.mode.maxAEDoses) {
                this.drawText(ctx, '[E] MORE ENZYME', T.LEFT + 120, phaseY + 10, '#a040e0', 5);
            }
        } else if (game.mode.phase === 4) {
            this.drawText(ctx, 'PRODRUG ACTIVE  [SPACE] MORE PRODRUG', T.LEFT, phaseY, '#ff4040', 5);
        }
    } else if (game.mode) {
        // Non-ADEPT modes
        var instrY = hudY + 12;
        if (!game.mode.dosed) {
            this.drawText(ctx, '[HOLD SPACE] CHARGE DOSE  [RELEASE] DEPLOY', T.LEFT, instrY, '#606080', 5);
        }
    }

    // Controls hint for charging
    if (game.input.charging) {
        this.drawText(ctx, 'CHARGING...', meterX, hudY + meterH + 2, '#e0e040', 5);
    }
};

ADEPT.HUD.prototype.renderMenu = function(ctx) {
    var cx = ADEPT.Config.VIRTUAL_W / 2;

    this.drawText(ctx, 'ADEPT GAME', cx - 30, 30, '#40e0c0', 8);
    this.drawText(ctx, 'by Cuttlefish Bio', cx - 40, 48, '#607090', 5);

    // Decorative line
    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 60, 62, 120, 1);

    this.drawText(ctx, '[1] SYSTEMIC CHEMO', cx - 48, 80, '#ff4040', 6);
    this.drawText(ctx, 'Floods the tank with toxin', cx - 58, 92, '#606080', 5);

    this.drawText(ctx, '[2] ADC', cx - 48, 112, '#40e040', 6);
    this.drawText(ctx, 'Antibody-drug conjugate', cx - 50, 124, '#606080', 5);

    this.drawText(ctx, '[3] ADEPT', cx - 48, 144, '#a040e0', 6);
    this.drawText(ctx, 'Pretargeted enzyme-prodrug', cx - 58, 156, '#606080', 5);

    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 60, 175, 120, 1);

    this.drawText(ctx, 'PRESS 1, 2 OR 3', cx - 38, 188, '#808890', 5);

    // Animated cuttlefish behind menu
    var t = Date.now() / 1000;
    var fishX = cx + Math.sin(t * 0.5) * 40;
    var fishY = 210 + Math.sin(t * 0.8) * 5;
    ctx.fillStyle = 'rgba(224, 96, 64, 0.3)';
    ctx.fillRect(Math.round(fishX) - 5, Math.round(fishY) - 3, 10, 7);
    ctx.fillRect(Math.round(fishX) - 6, Math.round(fishY) - 2, 12, 5);
};

ADEPT.HUD.prototype.renderIntro = function(ctx, game) {
    var cx = ADEPT.Config.VIRTUAL_W / 2;
    var modeName = game.mode ? game.mode.name : '';
    var desc = game.mode ? game.mode.description : '';

    this.drawText(ctx, modeName, cx - modeName.length * 3, 50, '#f0f0f0', 8);

    // Word wrap description
    var words = desc.split(' ');
    var line = '';
    var lineY = 80;
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

    this.drawText(ctx, 'PRESS ANY KEY', cx - 32, 180, '#e0e040', 5);
};

ADEPT.HUD.prototype.renderResults = function(ctx, game) {
    var cx = ADEPT.Config.VIRTUAL_W / 2;
    var result = game.result;
    if (!result) return;

    var modeName = game.mode ? game.mode.name : '';
    this.drawText(ctx, 'RESULTS', cx - 20, 20, '#f0f0f0', 7);
    this.drawText(ctx, modeName, cx - modeName.length * 2.5, 35, '#808090', 5);

    ctx.fillStyle = '#304060';
    ctx.fillRect(30, 48, 196, 1);

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
    this.drawText(ctx, 'TOTAL:', 30, y, '#f0f0f0', 6);
    this.drawText(ctx, String(result.score), 180, y, '#f0e040', 6);

    // Stars
    y += 20;
    for (var i = 0; i < 3; i++) {
        var filled = i < result.stars;
        var sx = cx - 20 + i * 16;
        if (filled) {
            ctx.fillStyle = '#f0e040';
            // Star shape (simple pixel star)
            ctx.fillRect(sx + 2, y, 3, 1);
            ctx.fillRect(sx, y + 1, 7, 1);
            ctx.fillRect(sx + 1, y + 2, 5, 1);
            ctx.fillRect(sx + 1, y + 3, 2, 1);
            ctx.fillRect(sx + 4, y + 3, 2, 1);
        } else {
            ctx.fillStyle = '#303040';
            ctx.fillRect(sx + 2, y, 3, 1);
            ctx.fillRect(sx, y + 1, 7, 1);
            ctx.fillRect(sx + 1, y + 2, 5, 1);
            ctx.fillRect(sx + 1, y + 3, 2, 1);
            ctx.fillRect(sx + 4, y + 3, 2, 1);
        }
    }

    y += 16;
    if (result.stars === 3) {
        this.drawText(ctx, 'PERFECT!', cx - 20, y, '#f0e040', 6);
    } else if (result.stars === 0 && !result.tumorKilled) {
        this.drawText(ctx, 'TUMOR SURVIVED...', cx - 40, y, '#e04040', 5);
    }

    y += 20;
    this.drawText(ctx, '[R] RETRY', 40, y, '#808890', 5);
    this.drawText(ctx, '[N] NEXT', 110, y, '#808890', 5);
    this.drawText(ctx, '[M] MENU', 175, y, '#808890', 5);
};
