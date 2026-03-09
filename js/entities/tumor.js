window.ADEPT = window.ADEPT || {};

ADEPT.Tumor = function(x, y) {
    ADEPT.Entity.call(this, x, y);
    this.type = 'tumor';
    this.radius = 18;
    this.layer = 1;
    this.hp = 100;
    this.maxHp = 100;
    this.diffuses = false;
    this.boundMolecules = [];
    this.damageFlash = 0;
    this.pulseTimer = 0;

    // Swimming AI (slow drift)
    this.wanderX = x;
    this.wanderY = y;
    this.wanderTimer = 0;
    this.wanderInterval = 4 + Math.random() * 4;
    this.swimSpeed = 3;

    // Generate irregular surface points for collision
    this.surfacePoints = [];
    var numPoints = 20;
    for (var i = 0; i < numPoints; i++) {
        var angle = (i / numPoints) * Math.PI * 2;
        var r = this.radius * (0.75 + Math.random() * 0.25);
        this.surfacePoints.push({
            x: Math.cos(angle) * r,
            y: Math.sin(angle) * r,
            r: r,
            angle: angle,
        });
    }

    // Generate some vein paths for rendering
    this.veins = [];
    for (var v = 0; v < 5; v++) {
        var vein = [];
        var a = Math.random() * Math.PI * 2;
        var len = 4 + Math.random() * 8;
        for (var s = 0; s < len; s++) {
            a += (Math.random() - 0.5) * 0.8;
            vein.push({
                x: Math.cos(a) * s * 1.2,
                y: Math.sin(a) * s * 1.2,
            });
        }
        this.veins.push(vein);
    }
};

ADEPT.Tumor.prototype = Object.create(ADEPT.Entity.prototype);
ADEPT.Tumor.prototype.constructor = ADEPT.Tumor;

ADEPT.Tumor.prototype.overlaps = function(other) {
    // Check distance to surface points
    for (var i = 0; i < this.surfacePoints.length; i++) {
        var pt = this.surfacePoints[i];
        var dx = (this.x + pt.x) - other.x;
        var dy = (this.y + pt.y) - other.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < other.radius + 3) return true;
    }
    // Also check center distance
    return this.distanceTo(other) < (this.radius * 0.6 + other.radius);
};

ADEPT.Tumor.prototype.damage = function(amount) {
    if (this.hp <= 0) return;
    this.hp -= amount;
    this.damageFlash = 0.15;
    if (this.hp <= 0) {
        this.hp = 0;
    }
};

ADEPT.Tumor.prototype.addBoundMolecule = function(mol) {
    this.boundMolecules.push(mol);
};

ADEPT.Tumor.prototype.removeBoundMolecule = function(mol) {
    var idx = this.boundMolecules.indexOf(mol);
    if (idx >= 0) this.boundMolecules.splice(idx, 1);
};

ADEPT.Tumor.prototype.update = function(dt) {
    this.pulseTimer += dt;
    if (this.damageFlash > 0) this.damageFlash -= dt;
    if (this.hp <= 0 && this.alive) {
        this.alive = false;
    }

    // Slow wander
    this.wanderTimer += dt;
    if (this.wanderTimer > this.wanderInterval) {
        this.wanderTimer = 0;
        this.wanderInterval = 4 + Math.random() * 4;
        var T = ADEPT.Config.TANK;
        this.wanderX = T.LEFT + this.radius + 10 + Math.random() * (T.RIGHT - T.LEFT - this.radius * 2 - 20);
        this.wanderY = T.TOP + this.radius + 10 + Math.random() * (T.BOTTOM - T.TOP - this.radius * 2 - 20);
    }

    var dx = this.wanderX - this.x;
    var dy = this.wanderY - this.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 2) {
        this.x += (dx / dist) * this.swimSpeed * dt;
        this.y += (dy / dist) * this.swimSpeed * dt;
    }
    // Gentle bob
    this.y += Math.sin(this.pulseTimer * 1.5) * 0.15;

    // Keep in tank
    var T = ADEPT.Config.TANK;
    this.x = Math.max(T.LEFT + this.radius, Math.min(T.RIGHT - this.radius, this.x));
    this.y = Math.max(T.TOP + this.radius, Math.min(T.BOTTOM - this.radius, this.y));
};

ADEPT.Tumor.prototype.render = function(ctx) {
    var px = Math.round(this.x);
    var py = Math.round(this.y);
    var flash = this.damageFlash > 0;
    var hpFrac = this.hp / this.maxHp;

    var sprite = ADEPT.Sprites ? ADEPT.Sprites.get('tumor') : null;

    if (!sprite || !sprite.complete) {
        // Fallback: simple circle
        ctx.fillStyle = flash ? '#a04060' : '#5a2a4a';
        ctx.fillRect(px - 8, py - 8, 16, 16);
        return;
    }

    var sw = sprite.width;
    var sh = sprite.height;
    // Buffer must fit sprite at any rotation — use diagonal
    var diag = Math.ceil(Math.sqrt(sw * sw + sh * sh)) + 2;

    // Offscreen buffer for rotation + tint effects
    if (!this._tintBuffer) {
        this._tintBuffer = document.createElement('canvas');
    }
    var buf = this._tintBuffer;
    buf.width = diag;
    buf.height = diag;
    var bc = buf.getContext('2d');
    bc.clearRect(0, 0, diag, diag);

    // Slow rotation based on pulseTimer
    bc.save();
    bc.translate(diag / 2, diag / 2);
    bc.rotate(this.pulseTimer * 0.15);
    bc.drawImage(sprite, -Math.floor(sw / 2), -Math.floor(sh / 2));
    bc.restore();

    // Damage flash tint
    if (flash) {
        bc.globalCompositeOperation = 'source-atop';
        bc.fillStyle = 'rgba(255, 80, 80, 0.5)';
        bc.fillRect(0, 0, diag, diag);
    }

    // Darken as HP drops (tumor looks sickly/weakened)
    if (hpFrac < 0.5) {
        bc.globalCompositeOperation = 'source-atop';
        bc.fillStyle = 'rgba(40, 40, 40, ' + ((1 - hpFrac * 2) * 0.4) + ')';
        bc.fillRect(0, 0, diag, diag);
    }

    ctx.drawImage(buf, px - Math.floor(diag / 2), py - Math.floor(diag / 2));

    // HP bar below
    var barW = 28;
    var barH = 3;
    var barX = px - barW / 2;
    var barY = py + Math.floor(diag / 2) + 3;
    ctx.fillStyle = '#200010';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = '#e04040';
    ctx.fillRect(barX, barY, Math.round(barW * hpFrac), barH);
};
