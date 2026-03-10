window.ADEPT = window.ADEPT || {};

ADEPT.Game = function(canvas) {
    this.canvas = canvas;
    this.renderer = new ADEPT.Renderer(canvas);
    this.input = new ADEPT.Input(canvas);
    this.hud = new ADEPT.HUD();

    this.state = 'TITLE'; // TITLE, NARRATIVE, MENU, STAGE_SELECT, LAB_BENCH, HOW_TO_PLAY, MODE_INTRO, PLAYING, GAME_OVER, RESULTS, RESULTS_INFO, ENDING
    this.mode = null;
    this.entities = [];
    this.tumor = null;
    this.score = 0;
    this.result = null;
    this.currentModeIndex = 0;
    this.currentStage = 1; // 1 or 4
    this.gameOverTimer = 0;
    this.labBenchParams = [];
    this.labBenchCursor = 0;
    this.modeIntroTimer = 0;
    this.narrativeTimer = 0;
    this.endingTimer = 0;
    this.resultsTimer = 0;
    this.textCrawlComplete = false;

    this.TICK_RATE = 60;
    this.TICK_MS = 1000 / this.TICK_RATE;
    this.MAX_FRAME_SKIP = 5;
    this.accumulator = 0;
    this.lastTime = 0;

    // Mode keys for localStorage progress
    this.modeKeys = ['chemo', 'adc', 'adept'];

    ADEPT.gameInstance = this;
};

ADEPT.Game.prototype.start = function() {
    var self = this;
    this.lastTime = performance.now();
    requestAnimationFrame(function(t) { self.loop(t); });
};

ADEPT.Game.prototype.loop = function(timestamp) {
    var self = this;
    var delta = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // Clamp delta to avoid spiral of death
    if (delta > 200) delta = 200;
    this.accumulator += delta;

    var ticks = 0;
    var dt = this.TICK_MS / 1000;
    while (this.accumulator >= this.TICK_MS && ticks < this.MAX_FRAME_SKIP) {
        this.update(dt);
        this.accumulator -= this.TICK_MS;
        ticks++;
    }

    this.render(dt);
    requestAnimationFrame(function(t) { self.loop(t); });
};

ADEPT.Game.prototype.update = function(dt) {
    this.input.update(dt);
    this.input.setGameState(this.state);

    switch (this.state) {
        case 'TITLE':
            if (this.input.consumeAnyKey()) {
                this.narrativeTimer = 0;
                this.textCrawlComplete = false;
                this.state = 'NARRATIVE';
            }
            if (this.input.chargeReleased) this.input.consumeCharge();
            break;

        case 'NARRATIVE':
            this.narrativeTimer += dt;
            if (this.input.consumeAnyKey()) {
                if (this.textCrawlComplete) {
                    this.startMode(0, 1);
                } else {
                    this.narrativeTimer = 999; // Skip to full reveal
                }
            }
            if (this.input.chargeReleased) this.input.consumeCharge();
            break;

        case 'MENU':
            if (this.input.consumeEsc()) {
                this.input.consumeOption();
                this.input.consumeAnyKey();
                this.state = 'TITLE';
                break;
            }
            var opt = this.input.consumeOption();
            if (opt === 0 || opt === 1 || opt === 2) {
                this.startMode(opt, 1); // Skip stage select, go straight to Stage I
            } else if (opt === 14) { // I - info
                this.state = 'HOW_TO_PLAY';
            }
            if (this.input.chargeReleased) this.input.consumeCharge();
            break;

        case 'STAGE_SELECT':
            if (this.input.consumeEsc()) {
                this.input.consumeOption();
                this.input.consumeAnyKey();
                this.state = 'MENU';
                break;
            }
            var opt = this.input.consumeOption();
            if (opt === 0) this.startMode(this.currentModeIndex, 1);
            else if (opt === 1 && this.isStageUnlocked(this.currentModeIndex, 4)) {
                this.startMode(this.currentModeIndex, 4);
            }
            if (this.input.chargeReleased) this.input.consumeCharge();
            break;

        case 'LAB_BENCH':
            if (this.input.consumeEsc()) {
                this.input.consumeArrow();
                this.input.consumeAnyKey();
                this.state = 'MENU';
                break;
            }
            var arrow = this.input.consumeArrow();
            if (arrow === 'up') {
                this.labBenchCursor = Math.max(0, this.labBenchCursor - 1);
            } else if (arrow === 'down') {
                this.labBenchCursor = Math.min(this.labBenchParams.length - 1, this.labBenchCursor + 1);
            } else if (arrow === 'left') {
                var p = this.labBenchParams[this.labBenchCursor];
                p.value = Math.max(p.min, Math.round((p.value - p.step) * 100) / 100);
            } else if (arrow === 'right') {
                var p = this.labBenchParams[this.labBenchCursor];
                p.value = Math.min(p.max, Math.round((p.value + p.step) * 100) / 100);
            }
            var labConfirm = this.input.consumePhase2();
            if (this.input.chargeReleased) {
                this.input.consumeCharge();
                labConfirm = true;
            }
            if (labConfirm) {
                this.applyLabBenchParams();
                this.state = 'MENU';
            }
            this.input.consumeAnyKey();
            break;

        case 'HOW_TO_PLAY':
            if (this.input.consumeEsc() || this.input.consumeAnyKey()) {
                this.state = 'MENU';
            }
            if (this.input.chargeReleased) this.input.consumeCharge();
            break;

        case 'MODE_INTRO':
            this.modeIntroTimer += dt;
            if (this.modeIntroTimer > 0.3) {
                if (this.input.consumeAnyKey()) {
                    if (this.textCrawlComplete) {
                        this.state = 'PLAYING';
                    } else {
                        this.modeIntroTimer = 999; // Skip to full reveal
                    }
                }
            } else {
                this.input.consumeAnyKey(); // Consume stray presses
            }
            if (this.input.chargeReleased) this.input.consumeCharge();
            break;

        case 'PLAYING':
            if (this.input.consumeEsc()) {
                this.abandonRound();
                break;
            }
            this.mode.update(dt, this);
            ADEPT.Physics.updateAll(this.entities, dt);
            ADEPT.PK.updateAll(this.entities, dt, this);
            ADEPT.Particles.update(dt);

            // Update all entities
            for (var i = 0; i < this.entities.length; i++) {
                this.entities[i].update(dt);
            }

            // Prune dead entities
            this.entities = this.entities.filter(function(e) { return e.alive; });

            // Spawn death particles for cuttlefish
            for (var i = 0; i < this.entities.length; i++) {
                var e = this.entities[i];
                if (e.type === 'cuttlefish' && e.hp <= 0 && e.deathTimer < 0.05) {
                    ADEPT.Particles.spawn('death', e.x, e.y);
                }
            }
            break;

        case 'GAME_OVER':
            this.gameOverTimer += dt;
            ADEPT.Particles.update(dt);
            // Allow skip after 1.5s
            if (this.gameOverTimer > 1.5 && this.input.consumeAnyKey()) {
                this.endRound(false);
            }
            if (this.input.chargeReleased) this.input.consumeCharge();
            break;

        case 'RESULTS':
            this.resultsTimer += dt;
            var opt = this.input.consumeOption();
            if (opt === 10) { // R - retry
                this.startMode(this.currentModeIndex, this.currentStage);
            } else if (opt === 12) { // M - menu
                this.state = 'MENU';
            } else if (opt === 14) { // I - info
                this.input.consumeAnyKey();
                this.state = 'RESULTS_INFO';
            } else if (this.resultsTimer > 0.5) {
                if (this.input.consumeAnyKey()) {
                    // Spacebar / any key → advance to next mode (or ending)
                    if (this.currentModeIndex === 2) {
                        this.endingTimer = 0;
                        this.textCrawlComplete = false;
                        this.state = 'ENDING';
                    } else {
                        var next = this.currentModeIndex + 1;
                        this.startMode(next, this.currentStage);
                    }
                }
            } else {
                this.input.consumeAnyKey(); // consume stray presses during guard
            }
            if (this.input.chargeReleased) this.input.consumeCharge();
            break;

        case 'ENDING':
            this.endingTimer += dt;
            if (this.input.consumeAnyKey()) {
                if (this.textCrawlComplete) {
                    this.state = 'MENU';
                } else {
                    this.endingTimer = 999;
                }
            }
            if (this.input.chargeReleased) this.input.consumeCharge();
            break;

        case 'RESULTS_INFO':
            if (this.input.consumeEsc()) {
                this.input.consumeOption();
                this.input.consumeAnyKey();
                this.state = 'RESULTS';
            } else if (this.input.consumeAnyKey()) {
                this.state = 'RESULTS';
            }
            if (this.input.chargeReleased) this.input.consumeCharge();
            break;
    }
};

ADEPT.Game.prototype.render = function(dt) {
    this.renderer.clear();

    if (this.state === 'TITLE' || this.state === 'NARRATIVE' || this.state === 'MENU' || this.state === 'STAGE_SELECT' || this.state === 'LAB_BENCH' || this.state === 'HOW_TO_PLAY' || this.state === 'RESULTS' || this.state === 'RESULTS_INFO' || this.state === 'GAME_OVER' || this.state === 'ENDING') {
        this.hud.render(this);
        this.renderer.present();
        return;
    }

    this.renderer.drawBackground(dt);

    // Sort entities by layer
    this.entities.sort(function(a, b) { return a.layer - b.layer; });

    var ctx = this.renderer.getContext();
    for (var i = 0; i < this.entities.length; i++) {
        if (this.entities[i].alive) {
            this.entities[i].render(ctx);
        }
    }

    ADEPT.Particles.render(ctx);
    this.hud.render(this);
    this.renderer.present();
};

ADEPT.Game.prototype.startMode = function(index, stage) {
    this.currentModeIndex = index;
    this.currentStage = stage || 1;
    this.score = 0;
    this.result = null;

    switch (index) {
        case 0: this.mode = new ADEPT.ModeChemo(this.currentStage); break;
        case 1: this.mode = new ADEPT.ModeADC(this.currentStage); break;
        case 2: this.mode = new ADEPT.ModeADEPT(this.currentStage); break;
    }

    this.mode.setup(this);
    this.modeIntroTimer = 0;
    this.textCrawlComplete = false;
    this.state = 'MODE_INTRO';
};

ADEPT.Game.prototype.setupLabBench = function() {
    this.labBenchCursor = 0;

    this.labBenchParams = [
        { name: 'POTENCY', obj: 'Balance', key: 'chemo_tumor_mult', min: 2.0, max: 6.0, step: 0.5, group: 0, value: ADEPT.Balance.chemo_tumor_mult },
        { name: 'CLEARANCE RATE', obj: 'PK_HL', key: 'chemo_free', min: 3.0, max: 12.0, step: 1.0, group: 0, value: ADEPT.PK.HALF_LIFE.chemo_free },
        { name: 'DRUG LOADING', obj: 'Balance', key: 'adc_payload', min: 2, max: 8, step: 1, group: 1, value: ADEPT.Balance.adc_payload },
        { name: 'RELEASE RATE', obj: 'PK', key: 'ADC_LEAK_RATE', min: 0.10, max: 0.50, step: 0.05, group: 1, value: ADEPT.PK.ADC_LEAK_RATE },
        { name: 'ENZYME RADIUS', obj: 'Balance', key: 'ae_catalytic_radius', min: 8, max: 24, step: 2, group: 2, value: ADEPT.Balance.ae_catalytic_radius },
        { name: 'PRODRUG POTENCY', obj: 'Balance', key: 'prodrug_potency', min: 0.4, max: 2.0, step: 0.2, group: 2, value: ADEPT.Balance.prodrug_potency },
    ];

    this.state = 'LAB_BENCH';
};

ADEPT.Game.prototype.applyLabBenchParams = function() {
    for (var i = 0; i < this.labBenchParams.length; i++) {
        var p = this.labBenchParams[i];
        if (p.obj === 'Balance') {
            ADEPT.Balance[p.key] = p.value;
        } else if (p.obj === 'PK_HL') {
            ADEPT.PK.HALF_LIFE[p.key] = p.value;
        } else if (p.obj === 'PK') {
            ADEPT.PK[p.key] = p.value;
        }
    }
};

ADEPT.Game.prototype.abandonRound = function() {
    this.entities = [];
    this.tumor = null;
    this.mode = null;
    ADEPT.Particles.particles = [];
    this.state = 'MENU';
};

ADEPT.Game.prototype.addEntity = function(entity) {
    this.entities.push(entity);
};

ADEPT.Game.prototype.getCuttlefishAlive = function() {
    var count = 0;
    for (var i = 0; i < this.entities.length; i++) {
        if (this.entities[i].type === 'cuttlefish' && this.entities[i].hp > 0) {
            count++;
        }
    }
    return count;
};

ADEPT.Game.prototype.getCuttlefishTotal = function() {
    return this.mode ? this.mode.cuttlefishCount : 5;
};

ADEPT.Game.prototype.allTumorsDead = function() {
    for (var i = 0; i < this.entities.length; i++) {
        var e = this.entities[i];
        if (e.type === 'tumor' && e.alive) return false;
    }
    return true;
};

ADEPT.Game.prototype.isStageUnlocked = function(modeIndex, stage) {
    if (stage === 1) return true;
    // Stage IV unlocked by beating Stage I on ALL three modes
    try {
        for (var i = 0; i < this.modeKeys.length; i++) {
            var key = 'adept_' + this.modeKeys[i] + '_s1_beat';
            if (localStorage.getItem(key) !== '1') return false;
        }
        return true;
    } catch (e) {
        return false;
    }
};

ADEPT.Game.prototype.saveProgress = function(modeIndex, stage, tumorKilled) {
    if (!tumorKilled) return;
    try {
        var key = 'adept_' + this.modeKeys[modeIndex] + '_s' + stage + '_beat';
        localStorage.setItem(key, '1');
    } catch (e) {
        // localStorage unavailable
    }
};

ADEPT.Game.prototype.startGameOver = function() {
    this.gameOverTimer = 0;
    this.state = 'GAME_OVER';
};

ADEPT.Game.prototype.endRound = function(tumorKilled) {
    var alive = this.getCuttlefishAlive();
    var total = this.getCuttlefishTotal();
    this.result = ADEPT.Scoring.calculate(
        tumorKilled, alive, total,
        this.mode.dosesUsed, this.mode.roundTimer
    );
    this.score = this.result.score;
    this.saveProgress(this.currentModeIndex, this.currentStage, tumorKilled);

    // Check for high score
    var modeKey = this.modeKeys[this.currentModeIndex];
    this.result.isNewHighScore = ADEPT.Scoring.saveHighScore(modeKey, this.currentStage, this.result.score);
    this.result.highScore = ADEPT.Scoring.getHighScore(modeKey, this.currentStage);

    this.resultsTimer = 0;
    this.state = 'RESULTS';
};
