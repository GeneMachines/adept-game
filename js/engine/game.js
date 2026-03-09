window.ADEPT = window.ADEPT || {};

ADEPT.Game = function(canvas) {
    this.canvas = canvas;
    this.renderer = new ADEPT.Renderer(canvas);
    this.input = new ADEPT.Input(canvas);
    this.hud = new ADEPT.HUD();

    this.state = 'TITLE'; // TITLE, MENU, STAGE_SELECT, MODE_INTRO, PLAYING, GAME_OVER, RESULTS
    this.mode = null;
    this.entities = [];
    this.tumor = null;
    this.score = 0;
    this.result = null;
    this.currentModeIndex = 0;
    this.currentStage = 1; // 1 or 4
    this.gameOverTimer = 0;

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

    switch (this.state) {
        case 'TITLE':
            if (this.input.consumeAnyKey()) {
                this.state = 'MENU';
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
                this.currentModeIndex = opt;
                this.state = 'STAGE_SELECT';
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

        case 'MODE_INTRO':
            if (this.input.consumeEsc()) {
                this.input.consumeAnyKey();
                this.state = 'MENU';
                break;
            }
            if (this.input.consumeAnyKey()) {
                this.state = 'PLAYING';
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
            var opt = this.input.consumeOption();
            if (opt === 10) { // R - retry
                this.startMode(this.currentModeIndex, this.currentStage);
            } else if (opt === 11) { // N - next
                var next = (this.currentModeIndex + 1) % 3;
                this.startMode(next, this.currentStage);
            } else if (opt === 12) { // M - menu
                this.state = 'TITLE';
            }
            if (this.input.chargeReleased) this.input.consumeCharge();
            break;
    }
};

ADEPT.Game.prototype.render = function(dt) {
    this.renderer.clear();

    if (this.state === 'TITLE' || this.state === 'MENU' || this.state === 'STAGE_SELECT' || this.state === 'RESULTS' || this.state === 'GAME_OVER') {
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
    this.state = 'MODE_INTRO';
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
    // Stage IV unlocked by beating Stage I for this mode
    try {
        var key = 'adept_' + this.modeKeys[modeIndex] + '_s1_beat';
        return localStorage.getItem(key) === '1';
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
    this.state = 'RESULTS';
};
