window.ADEPT = window.ADEPT || {};

ADEPT.ModeBase = function(config) {
    this.name = config.name;
    this.description = config.description || '';
    this.maxMolecules = config.maxMolecules || 20;
    this.cuttlefishCount = config.cuttlefishCount || 5;
    this.tumorHp = config.tumorHp || 100;
    this.roundTimer = 0;
    this.dosesUsed = 0;
    this.dosed = false;
    this._spawnQueue = [];
    this._spawnTimer = 0;
};

ADEPT.ModeBase.prototype.setup = function(game) {
    game.entities = [];
    var T = ADEPT.Config.TANK;

    // Spawn tumor at random position
    var tx = T.LEFT + 30 + Math.random() * (T.RIGHT - T.LEFT - 60);
    var ty = T.TOP + 25 + Math.random() * (T.BOTTOM - T.TOP - 50);
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

    // Check win/lose
    if (game.tumor && game.tumor.hp <= 0 && game.tumor.alive) {
        // Tumor just died
    }
    if (game.tumor && !game.tumor.alive) {
        // Wait for all molecules to clear before showing results
        if (!this._winDelay) this._winDelay = 0;
        this._winDelay += dt;
        if (this._winDelay > 1.5 && !this._hasMolecules(game)) {
            game.endRound(true);
        }
    }

    // Check all cuttlefish dead
    if (game.getCuttlefishAlive() === 0 && this.dosed) {
        if (!this._loseDelay) this._loseDelay = 0;
        this._loseDelay += dt;
        if (this._loseDelay > 1.5 && !this._hasMolecules(game)) {
            game.endRound(false);
        }
    }
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
