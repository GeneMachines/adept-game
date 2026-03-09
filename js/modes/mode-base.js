window.ADEPT = window.ADEPT || {};

ADEPT.ModeBase = function(config) {
    this.name = config.name;
    this.description = config.description || '';
    this.maxMolecules = config.maxMolecules || 20;
    this.cuttlefishCount = config.cuttlefishCount || 5;
    this.tumorHp = config.tumorHp || 100;
    this.stage = config.stage || 1;
    this.roundTimer = 0;
    this.dosesUsed = 0;
    this.dosed = false;
    this._spawnQueue = [];
    this._spawnTimer = 0;

    // Metastasis (Stage IV only)
    this._metTimer = 0;
    this._metFirstDelay = 15;   // seconds before first met
    this._metInterval = 12;     // seconds between subsequent mets
    this._metMax = 3;           // max secondary tumors
    this._metCount = 0;
    this._metWarningTimer = 0;  // >0 while "METASTASIS!" is showing
};

ADEPT.ModeBase.prototype.setup = function(game) {
    game.entities = [];
    var T = ADEPT.Config.TANK;

    // Spawn tumor at random position
    var tx = T.LEFT + 30 + Math.random() * (T.RIGHT - T.LEFT - 60);
    var ty = T.TOP + 25 + Math.random() * (T.CENTER_Y - T.TOP - 25);
    var tumor = new ADEPT.Tumor(tx, ty);
    tumor.hp = this.tumorHp;
    tumor.maxHp = this.tumorHp;
    game.addEntity(tumor);
    game.tumor = tumor;

    // Spawn cuttlefish at random positions (avoiding tumor area)
    for (var i = 0; i < this.cuttlefishCount; i++) {
        var cx = T.LEFT + 20 + Math.random() * (T.RIGHT - T.LEFT - 80);
        var cy = T.TOP + 15 + Math.random() * (T.BOTTOM - T.TOP - 30);
        var cuttle = new ADEPT.Cuttlefish(cx, cy);
        game.addEntity(cuttle);
    }

    ADEPT.Particles.clear();
};

ADEPT.ModeBase.prototype.queueSpawns = function(molecules) {
    // Stagger spawns: each molecule gets a delay so they spray out over time
    var sprayDuration = 1.0; // seconds to spray entire dose
    var interval = molecules.length > 1 ? sprayDuration / molecules.length : 0;
    for (var i = 0; i < molecules.length; i++) {
        this._spawnQueue.push({
            delay: i * interval,
            mol: molecules[i]
        });
    }
};

ADEPT.ModeBase.prototype.update = function(dt, game) {
    this.roundTimer += dt;

    // Process spawn queue (spray effect)
    if (this._spawnQueue.length > 0) {
        this._spawnTimer += dt;
        while (this._spawnQueue.length > 0 && this._spawnQueue[0].delay <= this._spawnTimer) {
            var spawn = this._spawnQueue.shift();
            game.addEntity(spawn.mol);
        }
        if (this._spawnQueue.length === 0) {
            this._spawnTimer = 0;
        }
    }

    // Metastasis timer (Stage IV only)
    if (this.stage === 4 && game.tumor && game.tumor.alive && this._metCount < this._metMax) {
        this._metTimer += dt;
        var threshold = this._metCount === 0 ? this._metFirstDelay : this._metInterval;
        if (this._metTimer >= threshold) {
            this._metTimer = 0;
            this._startMetastasis(game);
        }
    }

    // Tick metastasis warning
    if (this._metWarningTimer > 0) {
        this._metWarningTimer -= dt;
    }

    // Poll for beam completion — spawn met when beam is done
    if (game.tumor && game.tumor.metBeam && game.tumor.metBeam.phase === 'done') {
        var b = game.tumor.metBeam;
        var metHp = Math.round(game.tumor.maxHp * 0.3);
        var met = new ADEPT.Tumor(b.targetX, b.targetY, {
            radius: 10,
            hp: metHp,
            isMetastasis: true,
        });
        game.addEntity(met);
        game.tumor.metBeam = null;
        game.tumor.metCount++;
        this._metCount++;
    }

    // Check win/lose — use allTumorsDead for Stage IV
    var allDead = game.allTumorsDead();
    if (allDead && this.dosed) {
        if (!this._winDelay) this._winDelay = 0;
        this._winDelay += dt;
        if (this._winDelay > 1.5 && !this._hasMolecules(game)) {
            game.endRound(true);
        }
    } else {
        this._winDelay = 0;
    }

    // Check all cuttlefish dead
    if (game.getCuttlefishAlive() === 0 && this.dosed) {
        if (!this._loseDelay) this._loseDelay = 0;
        this._loseDelay += dt;
        if (this._loseDelay > 1.5 && !this._hasMolecules(game)) {
            game.startGameOver();
        }
    }
};

ADEPT.ModeBase.prototype._startMetastasis = function(game) {
    var T = ADEPT.Config.TANK;
    var tumor = game.tumor;

    // Pick a random target at least 40px from primary, inside tank
    var targetX, targetY, attempts = 0;
    do {
        targetX = T.LEFT + 20 + Math.random() * (T.RIGHT - T.LEFT - 40);
        targetY = T.TOP + 20 + Math.random() * (T.BOTTOM - T.TOP - 40);
        var dx = targetX - tumor.x;
        var dy = targetY - tumor.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        attempts++;
    } while (dist < 40 && attempts < 20);

    tumor.startMetBeam(targetX, targetY);
    this._metWarningTimer = 1.0; // show warning for 1 second
};

ADEPT.ModeBase.prototype._hasMolecules = function(game) {
    for (var i = 0; i < game.entities.length; i++) {
        var e = game.entities[i];
        if (e.alive && e.isMolecule) return true;
    }
    return false;
};

ADEPT.ModeBase.prototype.onDoseRelease = function(chargeNormalized, game) {
    // Override in subclasses
};
