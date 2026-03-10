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

// RPG-style typewriter text crawl — reveals characters one at a time
// lines: [{text, y, color, size, pause, centered}]
// Returns true when all text is fully revealed
ADEPT.HUD.prototype.drawTextCrawl = function(ctx, lines, elapsed, charsPerSec) {
    var cursor = 0;
    var allDone = true;

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        cursor += (line.pause || 0);

        if (elapsed < cursor) { allDone = false; break; }

        var lineStart = cursor;
        cursor += line.text.length / charsPerSec;

        var lineElapsed = elapsed - lineStart;
        var showChars = Math.min(line.text.length, Math.floor(lineElapsed * charsPerSec));
        if (showChars <= 0) { allDone = false; break; }
        if (showChars < line.text.length) allDone = false;

        var displayText = line.text.substring(0, showChars);
        var size = line.size || 5;
        var color = line.color || '#808890';

        if (line.centered !== false) {
            var fullW = ADEPT.BitmapFont.measure(line.text, size);
            var x = Math.round(ADEPT.Config.VIRTUAL_W / 2 - fullW / 2);
            ADEPT.BitmapFont.draw(ctx, displayText, x, line.y, color, size);
        } else {
            ADEPT.BitmapFont.draw(ctx, displayText, line.x || 0, line.y, color, size);
        }
    }

    return allDone;
};

ADEPT.HUD.prototype.render = function(game) {
    var ctx = game.renderer.getContext();
    var T = ADEPT.Config.TANK;

    if (game.state === 'TITLE') {
        this.renderTitle(ctx);
        return;
    }

    if (game.state === 'NARRATIVE') {
        this.renderNarrative(ctx, game);
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

    if (game.state === 'ENDING') {
        this.renderEnding(ctx, game);
        return;
    }

    if (game.state === 'RESULTS') {
        this.renderResults(ctx, game);
        return;
    }

    if (game.state === 'RESULTS_INFO') {
        this.renderResultsInfo(ctx, game);
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
    var HT = ADEPT.Text.hud;
    this.drawText(ctx, HT.dose, T.LEFT, hudY, '#808080', 5);
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
    this.drawText(ctx, HT.cuttlefish, meterX + meterW + 8, hudY, '#808080', 5);
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
            this.drawText(ctx, HT.phase1 + doseStr, T.LEFT, phaseY, '#a040e0', 5);
        } else if (game.mode.phase === 2) {
            this.drawText(ctx, HT.phase2, T.LEFT, phaseY, '#e0a040', 5);
            this.drawText(ctx, HT.phase2prodrug, T.LEFT, phaseY + 10, '#808890', 5);
            if (game.mode.aeDoses < game.mode.maxAEDoses) {
                this.drawText(ctx, HT.phase2enzyme, T.LEFT + 90, phaseY + 10, '#a040e0', 5);
            }
        } else if (game.mode.phase === 4) {
            this.drawText(ctx, HT.phase4, T.LEFT, phaseY, '#ff4040', 5);
        }
    } else if (game.mode) {
        // Non-ADEPT modes
        var instrY = hudY + 12;
        if (!game.mode.dosed) {
            this.drawText(ctx, HT.instruction, T.LEFT, instrY, '#606080', 5);
        }
    }

    // Controls hint for charging
    if (game.input.charging) {
        this.drawText(ctx, HT.charging, meterX, hudY + meterH + 2, '#e0e040', 5);
    }

    // "METASTASIS!" blinking warning (Stage IV)
    if (game.mode && game.mode._metWarningTimer > 0) {
        var t = Date.now() / 1000;
        if (Math.sin(t * 8) > 0) {
            this.drawTextCentered(ctx, HT.metastasis, T.TOP + 6, '#e040c0', 7);
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
    var TX = ADEPT.Text.title;
    this.drawTextCentered(ctx, TX.name1, 50, '#40e0c0', 8);
    this.drawTextCentered(ctx, TX.name2, 64, '#40e0c0', 8);

    // Decorative dot separators (flanking BIO)
    ctx.fillStyle = '#40e0c0';
    ctx.fillRect(cx - 22, 68, 2, 2);
    ctx.fillRect(cx + 20, 68, 2, 2);

    // "— ADEPT —" subtitle
    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 70, 84, 140, 1);
    this.drawTextCentered(ctx, TX.subtitle, 92, '#f0f0f0', 7);
    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 70, 108, 140, 1);

    // Tagline
    this.drawTextCentered(ctx, TX.tagline, 118, '#607890', 5);

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
        this.drawTextCentered(ctx, ADEPT.Text.prompts.pressAnyKey, 170, '#e0e040', 5);
    }

    // Bottom decorative line
    ctx.fillStyle = '#1a4060';
    ctx.fillRect(cx - 80, 190, 160, 1);
    ctx.fillStyle = '#40e0c0';
    ctx.fillRect(cx - 40, 190, 80, 1);

    // Copyright/version
    this.drawTextCentered(ctx, TX.copyright, 202, '#303850', 5);
};

ADEPT.HUD.prototype.renderNarrative = function(ctx, game) {
    var cx = ADEPT.Config.VIRTUAL_W / 2;
    var t = game.narrativeTimer || 0;
    var wallT = Date.now() / 1000;

    // Subtle scanlines
    ctx.fillStyle = 'rgba(0, 20, 40, 0.15)';
    for (var sl = 0; sl < ADEPT.Config.VIRTUAL_H; sl += 2) {
        ctx.fillRect(0, sl, ADEPT.Config.VIRTUAL_W, 1);
    }

    // Top decorative line
    ctx.fillStyle = '#1a4060';
    ctx.fillRect(cx - 80, 28, 160, 1);
    ctx.fillStyle = '#e06040';
    ctx.fillRect(cx - 30, 28, 60, 1);

    // Cuttlefish sprite swimming
    var fishPhase = wallT * 0.3;
    var fishX = ((fishPhase % 1) * (ADEPT.Config.VIRTUAL_W + 40)) - 20;
    var fishY = 44 + Math.sin(wallT * 1.2) * 3;
    var sprite = ADEPT.Sprites ? ADEPT.Sprites.get('cuttlefish-flip') : null;
    if (sprite && sprite.complete) {
        ctx.globalAlpha = 0.5;
        ctx.drawImage(sprite, Math.round(fishX) - 14, Math.round(fishY) - 13);
        ctx.globalAlpha = 1.0;
    }

    // Narrative text crawl (RPG-style typewriter) — built from ADEPT.Text
    var TX = ADEPT.Text.narrative;
    var lines = [];
    var y = 68;
    for (var i = 0; i < TX.story.length; i++) {
        lines.push({ text: TX.story[i], y: y });
        y += 12;
    }
    var storyLineCount = lines.length;
    y += 4;
    lines.push({ text: TX.enemy, y: y, color: '#e04060', size: 7, pause: 0.3 });
    y += 22;
    for (var i = 0; i < TX.mission.length; i++) {
        var entry = { text: TX.mission[i], y: y, color: '#40e0c0' };
        if (i === 0) entry.pause = 0.5;
        lines.push(entry);
        y += 12;
    }
    var sepY = lines[storyLineCount].y + 14; // separator between enemy name and mission

    var crawlDone = this.drawTextCrawl(ctx, lines, t, 40);

    // Separator between story and mission (appears when mission text starts)
    var sepTime = 0;
    for (var si = 0; si <= storyLineCount; si++) {
        sepTime += (lines[si].pause || 0) + lines[si].text.length / 40;
    }
    if (lines[storyLineCount + 1]) sepTime += (lines[storyLineCount + 1].pause || 0);
    if (t > sepTime) {
        ctx.fillStyle = '#304060';
        ctx.fillRect(cx - 50, sepY, 100, 1);
    }

    // Bottom decorative line + PRESS ANY KEY (after crawl completes)
    if (crawlDone) {
        ctx.fillStyle = '#1a4060';
        ctx.fillRect(cx - 80, 192, 160, 1);
        ctx.fillStyle = '#40e0c0';
        ctx.fillRect(cx - 30, 192, 60, 1);

        var blink = Math.sin(wallT * 3) > 0;
        if (blink) {
            this.drawTextCentered(ctx, ADEPT.Text.prompts.pressAnyKey, 206, '#e0e040', 5);
        }
    }

    game.textCrawlComplete = crawlDone;
};

ADEPT.HUD.prototype.renderMenu = function(ctx) {
    var cx = ADEPT.Config.VIRTUAL_W / 2;
    var t = Date.now() / 1000;

    // Header
    var TX = ADEPT.Text.menu;
    this.drawTextCentered(ctx, TX.header, 22, '#40e0c0', 7);

    // Decorative line
    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 70, 38, 140, 1);
    ctx.fillStyle = '#40e0c0';
    ctx.fillRect(cx - 30, 38, 60, 1);

    // Mode cards — big names with colored left borders
    var modes = TX.modes;

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

    this.drawTextCentered(ctx, TX.howToPlay, startY + 3 * gap + 10, '#40e0c0', 5);

    this.drawTextCentered(ctx, TX.hint, startY + 3 * gap + 28, '#808890', 5);
    this.drawTextCentered(ctx, ADEPT.Text.prompts.back, startY + 3 * gap + 40, '#404860', 5);

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
    var TX = ADEPT.Text.howToPlay;

    this.drawTextCentered(ctx, TX.header, 18, '#40e0c0', 7);

    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 70, 34, 140, 1);

    var y = 42;
    this.drawText(ctx, 'CONTROLS', 14, y, '#40e0c0', 5);
    y += 12;
    for (var i = 0; i < TX.controls.length; i++) {
        this.drawText(ctx, TX.controls[i].text, 14, y, TX.controls[i].color, 5);
        y += 12;
    }

    y += 2;
    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 70, y, 140, 1);
    y += 8;

    this.drawText(ctx, TX.adeptTitle, 14, y, '#a040e0', 5);
    y += 12;
    for (var i = 0; i < TX.adeptSteps.length; i++) {
        this.drawText(ctx, TX.adeptSteps[i].text, 14, y, TX.adeptSteps[i].color, 5);
        y += 12;
    }

    y += 2;
    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 70, y, 140, 1);
    y += 8;

    this.drawText(ctx, TX.goalTitle, 14, y, '#40e0c0', 5);
    y += 12;
    for (var i = 0; i < TX.goals.length; i++) {
        this.drawText(ctx, TX.goals[i], 14, y, '#808090', 5);
        y += 12;
    }

    y += 2;
    ctx.fillStyle = '#304060';
    ctx.fillRect(cx - 70, y, 140, 1);

    this.drawTextCentered(ctx, ADEPT.Text.prompts.back, y + 10, '#404860', 5);
};

ADEPT.HUD.prototype.renderIntro = function(ctx, game) {
    var cx = ADEPT.Config.VIRTUAL_W / 2;
    var modeName = game.mode ? game.mode.name : '';
    var t = game.modeIntroTimer || 0;

    // Mode colors
    var modeColors = { 'SYSTEMIC CHEMO': '#ff4040', 'ADC': '#40e040', 'ADEPT': '#a040e0' };
    var modeBgs = { 'SYSTEMIC CHEMO': 'rgba(180,0,0,', 'ADC': 'rgba(0,140,0,', 'ADEPT': 'rgba(100,0,160,' };
    var col = modeColors[modeName] || '#f0f0f0';
    var bgBase = modeBgs[modeName] || 'rgba(100,100,100,';

    // Fade in
    var alpha = 1;
    if (t < 0.2) alpha = t / 0.2;

    // Full-screen dark overlay
    ctx.fillStyle = 'rgba(8, 12, 20, ' + (alpha * 0.9) + ')';
    ctx.fillRect(0, 0, ADEPT.Config.VIRTUAL_W, ADEPT.Config.VIRTUAL_H);

    // Mode name — big and centered near top
    var titleY = 30;
    ctx.fillStyle = bgBase + (alpha * 0.25) + ')';
    var tw = ADEPT.BitmapFont.measure(modeName, 8);
    var tx = Math.round(cx - tw / 2);
    ctx.fillRect(tx - 12, titleY - 4, tw + 24, 24);

    if (alpha > 0.1) {
        this.drawText(ctx, modeName, tx, titleY, col, 8);
    }

    // Stage label
    if (t > 0.15) {
        if (game.mode && game.mode.stage === 4) {
            this.drawTextCentered(ctx, 'STAGE IV', titleY + 20, '#e040c0', 5);
        } else {
            this.drawTextCentered(ctx, 'STAGE I', titleY + 20, '#808890', 5);
        }
    }

    // Narrative text — RPG-style typewriter crawl
    game.textCrawlComplete = false;
    if (t > 0.2) {
        ctx.fillStyle = '#304060';
        ctx.fillRect(cx - 70, titleY + 34, 140, 1);

        var ny = titleY + 44;
        var crawlElapsed = t - 0.2;

        // Build narrative lines from ADEPT.Text config
        var TX = ADEPT.Text.intro;
        var modeKey = modeName === 'SYSTEMIC CHEMO' ? 'chemo' : modeName === 'ADC' ? 'adc' : 'adept';
        var textDef = TX[modeKey] || [];
        var narrativeLines = [];
        for (var ni = 0; ni < textDef.length; ni++) {
            var entry = textDef[ni];
            if (typeof entry === 'string') {
                narrativeLines.push({ text: entry, y: ny + ni * 12 });
            } else {
                narrativeLines.push({ text: entry.text, y: ny + ni * 12, color: entry.color });
            }
        }

        this.drawTextCrawl(ctx, narrativeLines, crawlElapsed, 40);

        // Compute total crawl duration for timing controls + prompt
        var crawlDuration = 0;
        for (var ci = 0; ci < narrativeLines.length; ci++) {
            crawlDuration += (narrativeLines[ci].pause || 0) + narrativeLines[ci].text.length / 40;
        }

        // Controls appear 0.3s after narrative finishes
        if (crawlElapsed > crawlDuration + 0.3) {
            var controls = (modeKey === 'adept') ? TX.controls.adept : TX.controls.default;
            var iy = titleY + 108;
            ctx.fillStyle = '#304060';
            ctx.fillRect(cx - 50, iy - 6, 100, 1);

            var ctrlY = iy;
            if (controls.length <= 2) ctrlY += 6; // center fewer lines
            for (var ci = 0; ci < controls.length; ci++) {
                this.drawTextCentered(ctx, controls[ci].text, ctrlY + ci * 14, controls[ci].color, 5);
            }
        }

        // "PRESS ANY KEY" prompt — appears 0.6s after narrative finishes
        if (crawlElapsed > crawlDuration + 0.6) {
            game.textCrawlComplete = true;
            var blink = Math.sin(Date.now() / 1000 * 3) > 0;
            if (blink) {
                this.drawTextCentered(ctx, ADEPT.Text.prompts.pressAnyKey, titleY + 166, '#e0e040', 5);
            }
        }
    }
};

ADEPT.HUD.prototype.renderResults = function(ctx, game) {
    var cx = ADEPT.Config.VIRTUAL_W / 2;
    var result = game.result;
    if (!result) return;

    var TX = ADEPT.Text.results;
    var modeName = game.mode ? game.mode.name : '';
    var stageStr = game.currentStage === 4 ? ' - STAGE IV' : ' - STAGE I';
    this.drawTextCentered(ctx, TX.header, 14, '#f0f0f0', 7);
    this.drawTextCentered(ctx, modeName + stageStr, 30, '#808090', 5);

    ctx.fillStyle = '#304060';
    ctx.fillRect(30, 40, 196, 1);

    var y = 46;
    var tumorLabel = result.tumorKilled ? 'YES' : 'NO';
    var tumorColor = result.tumorKilled ? '#40e040' : '#e04040';
    this.drawText(ctx, TX.cotKilled, 30, y, '#c0c0c0', 5);
    this.drawText(ctx, tumorLabel, 150, y, tumorColor, 5);
    this.drawText(ctx, '+' + result.tumorScore, 190, y, '#f0e040', 5);

    y += 12;
    this.drawText(ctx, TX.cuttlefish, 30, y, '#c0c0c0', 5);
    this.drawText(ctx, result.cuttlefishAlive + '/' + result.totalCuttlefish, 150, y, '#e06040', 5);
    this.drawText(ctx, '+' + result.cuttleScore, 190, y, '#f0e040', 5);

    y += 12;
    this.drawText(ctx, TX.efficiency, 30, y, '#c0c0c0', 5);
    this.drawText(ctx, '+' + result.efficiencyScore, 190, y, '#f0e040', 5);

    // Therapeutic index
    y += 12;
    var tiStr = result.therapeuticIndex + '%';
    var tiColor = result.therapeuticIndex >= 80 ? '#40e040' : result.therapeuticIndex >= 40 ? '#e0e040' : '#e04040';
    this.drawText(ctx, TX.ti, 30, y, '#c0c0c0', 5);
    this.drawText(ctx, tiStr, 150, y, tiColor, 5);

    ctx.fillStyle = '#304060';
    y += 12;
    ctx.fillRect(30, y, 196, 1);

    y += 6;
    this.drawText(ctx, TX.total, 30, y, '#f0f0f0', 5);
    this.drawText(ctx, String(result.score), 180, y, '#f0e040', 5);

    // High score
    y += 12;
    if (result.isNewHighScore) {
        var blink = Math.sin(Date.now() / 1000 * 4) > 0;
        if (blink) {
            this.drawTextCentered(ctx, TX.newHigh, y, '#f0e040', 5);
        }
    } else if (result.highScore > 0) {
        this.drawText(ctx, TX.highScore, 30, y, '#606080', 5);
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
        this.drawTextCentered(ctx, TX.perfect, y, '#f0e040', 5);
    } else if (result.stars === 0 && !result.tumorKilled) {
        this.drawTextCentered(ctx, TX.survived, y, '#e04040', 5);
    }

    y += 14;
    this.drawText(ctx, TX.retry, 14, y, '#404860', 5);
    this.drawText(ctx, TX.menu, 80, y, '#404860', 5);
    this.drawText(ctx, '[I] INFO', 150, y, '#404860', 5);

    y += 14;
    var blink = Math.sin(Date.now() / 1000 * 3) > 0;
    if (blink) {
        this.drawTextCentered(ctx, ADEPT.Text.prompts.pressAnyKey, y, '#e0e040', 5);
    }
};

ADEPT.HUD.prototype.renderResultsInfo = function(ctx, game) {
    var cx = ADEPT.Config.VIRTUAL_W / 2;
    var modeKey = game.modeKeys[game.currentModeIndex];
    var info = ADEPT.Text.resultsInfo[modeKey];
    if (!info) return;

    // Mode title
    this.drawTextCentered(ctx, info.title, 14, info.color || '#f0f0f0', 7);

    // Separator
    ctx.fillStyle = '#304060';
    ctx.fillRect(20, 30, 216, 1);

    // Facts
    var y = 38;
    for (var i = 0; i < info.facts.length; i++) {
        var line = info.facts[i];
        if (typeof line === 'string') {
            if (line === '') {
                y += 6; // blank line = small gap
            } else {
                this.drawTextCentered(ctx, line, y, '#808890', 5);
                y += 10;
            }
        } else {
            this.drawTextCentered(ctx, line.text, y, line.color || '#808890', line.size || 5);
            y += 10;
        }
    }

    // Separator before references
    y += 4;
    ctx.fillStyle = '#304060';
    ctx.fillRect(20, y, 216, 1);
    y += 8;

    // References header
    this.drawText(ctx, 'REFERENCES:', 14, y, '#505060', 5);
    y += 10;

    for (var i = 0; i < info.refs.length; i++) {
        var ref = info.refs[i];
        var refText = (i + 1) + '. ' + ref;
        this.drawText(ctx, refText, 14, y, '#505060', 5);
        y += 10;
    }

    // Bottom separator + back prompt
    y += 4;
    ctx.fillStyle = '#304060';
    ctx.fillRect(20, y, 216, 1);
    y += 10;
    this.drawTextCentered(ctx, ADEPT.Text.prompts.back, y, '#404860', 5);
};

ADEPT.HUD.prototype.renderEnding = function(ctx, game) {
    var cx = ADEPT.Config.VIRTUAL_W / 2;
    var t = game.endingTimer || 0;
    var wallT = Date.now() / 1000;
    var TX = ADEPT.Text.ending;

    // Subtle scanlines
    ctx.fillStyle = 'rgba(0, 20, 40, 0.15)';
    for (var sl = 0; sl < ADEPT.Config.VIRTUAL_H; sl += 2) {
        ctx.fillRect(0, sl, ADEPT.Config.VIRTUAL_W, 1);
    }

    // Top decorative line (teal — peaceful)
    ctx.fillStyle = '#1a4060';
    ctx.fillRect(cx - 80, 28, 160, 1);
    ctx.fillStyle = '#40e0c0';
    ctx.fillRect(cx - 30, 28, 60, 1);

    // Cuttlefish swimming home (two of them, peaceful)
    var fishPhase1 = wallT * 0.25;
    var fishX1 = ((fishPhase1 % 1) * (ADEPT.Config.VIRTUAL_W + 40)) - 20;
    var fishY1 = 44 + Math.sin(wallT * 1.0) * 3;
    var fishPhase2 = (wallT * 0.25 + 0.3) % 1;
    var fishX2 = (fishPhase2 * (ADEPT.Config.VIRTUAL_W + 40)) - 20;
    var fishY2 = 50 + Math.sin(wallT * 1.2 + 1) * 3;
    var sprite = ADEPT.Sprites ? ADEPT.Sprites.get('cuttlefish-flip') : null;
    if (sprite && sprite.complete) {
        ctx.globalAlpha = 0.5;
        ctx.drawImage(sprite, Math.round(fishX1) - 14, Math.round(fishY1) - 13);
        ctx.globalAlpha = 0.35;
        ctx.drawImage(sprite, Math.round(fishX2) - 14, Math.round(fishY2) - 13);
        ctx.globalAlpha = 1.0;
    }

    // Build crawl lines from ADEPT.Text.ending
    var lines = [];
    var y = 72;
    for (var i = 0; i < TX.verse.length; i++) {
        lines.push({ text: TX.verse[i], y: y });
        y += 12;
    }
    y += 6;
    for (var i = 0; i < TX.hope.length; i++) {
        var entry = { text: TX.hope[i], y: y, color: '#40e0c0' };
        if (i === 0) entry.pause = 0.6;
        lines.push(entry);
        y += 12;
    }
    y += 6;
    lines.push({ text: TX.closing, y: y, color: '#e0e040', size: 7, pause: 0.8 });

    var crawlDone = this.drawTextCrawl(ctx, lines, t, 30); // Slower pace for poetic feel

    // Separator (appears with hope section)
    var sepTime = 0;
    for (var si = 0; si < TX.verse.length; si++) {
        sepTime += (lines[si].pause || 0) + lines[si].text.length / 30;
    }
    if (t > sepTime + 0.3) {
        ctx.fillStyle = '#304060';
        ctx.fillRect(cx - 40, lines[TX.verse.length].y - 10, 80, 1);
    }

    // Bottom area
    if (crawlDone) {
        // Bottom decorative line
        ctx.fillStyle = '#1a4060';
        ctx.fillRect(cx - 80, 192, 160, 1);
        ctx.fillStyle = '#40e0c0';
        ctx.fillRect(cx - 30, 192, 60, 1);

        var blink = Math.sin(wallT * 3) > 0;
        if (blink) {
            this.drawTextCentered(ctx, ADEPT.Text.prompts.pressAnyKey, 206, '#e0e040', 5);
        }
    }

    game.textCrawlComplete = crawlDone;
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
        var goTX = ADEPT.Text.gameOver;
        ctx.fillStyle = 'rgba(180, 0, 0, ' + (fade * 0.3) + ')';
        var tw = ADEPT.BitmapFont.measure(goTX.title, 8);
        var tx = Math.round(cx - tw / 2) + sx;
        ctx.fillRect(tx - 4, cy - 30 + sy, tw + 8, 18);

        this.drawText(ctx, goTX.title, tx, cy - 28 + sy, '#e02020', 8);
    }

    // Flavor text
    if (t > 1.0) {
        this.drawTextCentered(ctx, ADEPT.Text.gameOver.flavor, cy + 4, '#804040', 5);
    }

    // "PRESS ANY KEY" after delay
    if (t > 1.5) {
        var blink = Math.sin(Date.now() / 1000 * 3) > 0;
        if (blink) {
            this.drawTextCentered(ctx, ADEPT.Text.prompts.pressAnyKey, cy + 30, '#808080', 5);
        }
    }
};
