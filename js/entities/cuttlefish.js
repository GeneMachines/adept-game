window.ADEPT = window.ADEPT || {};

ADEPT.Cuttlefish = function(x, y) {
    ADEPT.Entity.call(this, x, y);
    this.type = 'cuttlefish';
    this.radius = 10;
    this.layer = 2;
    this.hp = 100;
    this.maxHp = 100;
    this.diffuses = false;

    // Swimming AI
    this.swimTimer = Math.random() * Math.PI * 2;
    this.swimSpeedX = 8 + Math.random() * 6;
    this.swimSpeedY = 4 + Math.random() * 3;
    this.baseX = x;
    this.baseY = y;
    this.wanderX = x;
    this.wanderY = y;
    this.wanderTimer = 0;
    this.wanderInterval = 3 + Math.random() * 4;
    this.facingRight = Math.random() > 0.5;

    this.boundMolecules = [];
    this.damageFlash = 0;
    this.deathTimer = 0;
};

ADEPT.Cuttlefish.prototype = Object.create(ADEPT.Entity.prototype);
ADEPT.Cuttlefish.prototype.constructor = ADEPT.Cuttlefish;

ADEPT.Cuttlefish.prototype.update = function(dt) {
    if (this.hp <= 0 && this.alive) {
        this.deathTimer += dt;
        if (this.deathTimer > 1.0) {
            this.alive = false;
        }
        return;
    }

    this.swimTimer += dt;
    this.wanderTimer += dt;
    if (this.damageFlash > 0) this.damageFlash -= dt;

    // Pick new wander target periodically
    if (this.wanderTimer > this.wanderInterval) {
        this.wanderTimer = 0;
        this.wanderInterval = 3 + Math.random() * 4;
        var T = ADEPT.Config.TANK;
        this.wanderX = T.LEFT + 20 + Math.random() * (T.RIGHT - T.LEFT - 40);
        this.wanderY = T.TOP + 15 + Math.random() * (T.BOTTOM - T.TOP - 30);
        this.facingRight = this.wanderX > this.x;
    }

    // Swim toward wander target with sine wave overlay
    var dx = this.wanderX - this.x;
    var dy = this.wanderY - this.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 2) {
        this.x += (dx / dist) * this.swimSpeedX * dt;
        this.y += (dy / dist) * this.swimSpeedY * dt;
    }
    // Sine wave bob
    this.y += Math.sin(this.swimTimer * 2) * 0.3;

    // Keep in tank
    var T = ADEPT.Config.TANK;
    this.x = Math.max(T.LEFT + this.radius, Math.min(T.RIGHT - this.radius, this.x));
    this.y = Math.max(T.TOP + this.radius, Math.min(T.BOTTOM - this.radius, this.y));
};

ADEPT.Cuttlefish.prototype.damage = function(amount) {
    if (this.hp <= 0) return;
    this.hp -= amount;
    this.damageFlash = 0.2;
    if (this.hp <= 0) {
        this.hp = 0;
        this.deathTimer = 0;
    }
};

ADEPT.Cuttlefish.prototype.addBoundMolecule = function(mol) {
    this.boundMolecules.push(mol);
};

ADEPT.Cuttlefish.prototype.removeBoundMolecule = function(mol) {
    var idx = this.boundMolecules.indexOf(mol);
    if (idx >= 0) this.boundMolecules.splice(idx, 1);
};

ADEPT.Cuttlefish.prototype.render = function(ctx) {
    var px = Math.round(this.x);
    var py = Math.round(this.y);
    var dead = this.hp <= 0;
    var damaged = this.hp < this.maxHp;
    var flash = this.damageFlash > 0;

    // Pick the right sprite for facing direction
    var spriteName = this.facingRight ? 'cuttlefish-flip' : 'cuttlefish';
    var sprite = ADEPT.Sprites ? ADEPT.Sprites.get(spriteName) : null;

    if (!sprite || !sprite.complete) {
        // Fallback: simple colored oval if sprite not loaded
        ctx.fillStyle = flash ? '#e0a080' : (dead ? '#706860' : '#d4c4a0');
        ctx.fillRect(px - 8, py - 4, 16, 8);
        return;
    }

    var sw = sprite.width;
    var sh = sprite.height;

    // Use offscreen canvas for tint effects so source-atop is isolated to sprite pixels
    var needTint = flash || dead;
    if (needTint) {
        if (!this._tintBuffer) {
            this._tintBuffer = document.createElement('canvas');
        }
        var buf = this._tintBuffer;
        buf.width = sw;
        buf.height = sh;
        var bc = buf.getContext('2d');
        bc.clearRect(0, 0, sw, sh);
        bc.drawImage(sprite, 0, 0);

        if (flash && !dead) {
            bc.globalCompositeOperation = 'source-atop';
            bc.fillStyle = 'rgba(220, 60, 30, 0.45)';
            bc.fillRect(0, 0, sw, sh);
        }
        if (dead) {
            bc.globalCompositeOperation = 'source-atop';
            bc.fillStyle = 'rgba(80, 70, 60, 0.5)';
            bc.fillRect(0, 0, sw, sh);
        }

        ctx.save();
        if (dead) ctx.globalAlpha = Math.max(0, 1.0 - this.deathTimer);
        ctx.drawImage(buf, px - Math.floor(sw / 2), py - Math.floor(sh / 2));
        ctx.restore();
    } else {
        ctx.drawImage(sprite, px - Math.floor(sw / 2), py - Math.floor(sh / 2));
    }

    // HP bar (world space, unaffected by transform/alpha)
    if (damaged && !dead) {
        var barW = 20;
        var barH = 2;
        var barX = px - barW / 2;
        var barY = py - Math.floor(sh / 2) - 3;
        ctx.fillStyle = '#300000';
        ctx.fillRect(barX, barY, barW, barH);
        var hpFrac = this.hp / this.maxHp;
        ctx.fillStyle = hpFrac < 0.25 ? '#e04040' : (hpFrac < 0.5 ? '#e0e040' : '#40e040');
        ctx.fillRect(barX, barY, Math.round(barW * hpFrac), barH);
    }
};
