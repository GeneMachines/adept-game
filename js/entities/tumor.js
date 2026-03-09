window.ADEPT = window.ADEPT || {};

ADEPT.Tumor = function(x, y, config) {
    ADEPT.Entity.call(this, x, y);
    config = config || {};
    this.type = 'tumor';
    this.radius = config.radius || 18;
    this.layer = 1;
    this.hp = config.hp || 100;
    this.maxHp = this.hp;
    this.diffuses = false;
    this.boundMolecules = [];
    this.damageFlash = 0;
    this.pulseTimer = Math.random() * 10; // randomize phase so mets pulse differently
    this.isMetastasis = config.isMetastasis || false;

    // Swimming AI (slow drift — mets are faster/jitterier)
    this.wanderX = x;
    this.wanderY = y;
    this.wanderTimer = 0;
    this.wanderInterval = 4 + Math.random() * 4;
    this.swimSpeed = this.isMetastasis ? 5 : 3;

    // Generate irregular surface points for collision
    this.surfacePoints = [];
    var numPoints = this.isMetastasis ? 12 : 20;
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

    // Metastasis beam state machine (primary only)
    this.metBeam = null; // {phase, timer, targetX, targetY, progress}
    this.metCount = 0;

    // Generate some vein paths for rendering
    this.veins = [];
    var numVeins = this.isMetastasis ? 2 : 5;
    for (var v = 0; v < numVeins; v++) {
        var vein = [];
        var a = Math.random() * Math.PI * 2;
        var len = this.isMetastasis ? (2 + Math.random() * 4) : (4 + Math.random() * 8);
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

ADEPT.Tumor.prototype.startMetBeam = function(targetX, targetY) {
    this.metBeam = {
        phase: 'charge',  // charge → beam → impact → done
        timer: 0,
        targetX: targetX,
        targetY: targetY,
        progress: 0,       // 0-1 beam extension
        chargeDuration: 0.5,
        beamDuration: 0.3,
        impactDuration: 0.2,
        chargeSpawnTimer: 0,
    };
};

ADEPT.Tumor.prototype.update = function(dt) {
    this.pulseTimer += dt;
    if (this.damageFlash > 0) this.damageFlash -= dt;
    if (this.hp <= 0 && this.alive) {
        this.alive = false;
        if (this.isMetastasis && ADEPT.Particles) {
            ADEPT.Particles.spawn('death', this.x, this.y);
        }
    }

    // Tick metastasis beam
    if (this.metBeam && this.alive) {
        var b = this.metBeam;
        b.timer += dt;
        if (b.phase === 'charge') {
            // Spawn converging particles toward eye
            b.chargeSpawnTimer += dt;
            if (b.chargeSpawnTimer > 0.12) {
                b.chargeSpawnTimer = 0;
                ADEPT.Particles.spawn('met_charge', this.x, this.y);
            }
            if (b.timer >= b.chargeDuration) {
                b.phase = 'beam';
                b.timer = 0;
            }
        } else if (b.phase === 'beam') {
            b.progress = Math.min(1, b.timer / b.beamDuration);
            if (b.timer >= b.beamDuration) {
                b.phase = 'impact';
                b.timer = 0;
                ADEPT.Particles.spawn('met_impact', b.targetX, b.targetY);
            }
        } else if (b.phase === 'impact') {
            if (b.timer >= b.impactDuration) {
                b.phase = 'done';
            }
        }
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
        // Fallback: simple rectangle
        var fallbackR = this.isMetastasis ? 5 : 8;
        ctx.fillStyle = flash ? '#a04060' : '#5a2a4a';
        ctx.fillRect(px - fallbackR, py - fallbackR, fallbackR * 2, fallbackR * 2);
        return;
    }

    var sw = sprite.width;
    var sh = sprite.height;

    // Scale factor for metastases (draw sprite smaller)
    var scale = this.isMetastasis ? 0.5 : 1.0;
    var drawW = Math.round(sw * scale);
    var drawH = Math.round(sh * scale);

    // Buffer must fit sprite at any rotation — use diagonal
    var diag = Math.ceil(Math.sqrt(drawW * drawW + drawH * drawH)) + 2;

    // Offscreen buffer for rotation + tint effects
    if (!this._tintBuffer || this._tintBuffer.width !== diag) {
        this._tintBuffer = document.createElement('canvas');
    }
    var buf = this._tintBuffer;
    buf.width = diag;
    buf.height = diag;
    var bc = buf.getContext('2d');
    bc.clearRect(0, 0, diag, diag);
    bc.imageSmoothingEnabled = false;

    // Slow rotation based on pulseTimer (mets spin a bit faster)
    bc.save();
    bc.translate(diag / 2, diag / 2);
    bc.rotate(this.pulseTimer * (this.isMetastasis ? 0.25 : 0.15));
    bc.drawImage(sprite, -Math.floor(drawW / 2), -Math.floor(drawH / 2), drawW, drawH);
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

    // Metastasis beam rendering
    if (this.metBeam && this.alive) {
        var b = this.metBeam;
        if (b.phase === 'charge') {
            // Glowing pixel cluster at eye center with increasing intensity
            var intensity = b.timer / b.chargeDuration;
            ctx.fillStyle = 'rgba(224, 64, 192, ' + (intensity * 0.6) + ')';
            ctx.fillRect(px - 1, py - 1, 3, 3);
            ctx.fillStyle = 'rgba(255, 255, 255, ' + (intensity * 0.4) + ')';
            ctx.fillRect(px, py, 1, 1);
        } else if (b.phase === 'beam') {
            // Pixel laser extending from center toward target
            var dx = b.targetX - this.x;
            var dy = b.targetY - this.y;
            var len = Math.sqrt(dx * dx + dy * dy);
            var steps = Math.floor(len * b.progress);
            var nx = dx / len;
            var ny = dy / len;
            // Glow layer (wider, dimmer)
            ctx.fillStyle = 'rgba(224, 64, 192, 0.3)';
            for (var s = 0; s < steps; s += 2) {
                var bx = Math.round(this.x + nx * s);
                var by = Math.round(this.y + ny * s);
                ctx.fillRect(bx - 1, by - 1, 3, 3);
            }
            // Core beam (magenta)
            ctx.fillStyle = '#e040c0';
            for (var s = 0; s < steps; s++) {
                var bx = Math.round(this.x + nx * s);
                var by = Math.round(this.y + ny * s);
                ctx.fillRect(bx, by, 1, 1);
            }
            // White tip
            if (steps > 0) {
                var tipX = Math.round(this.x + nx * steps);
                var tipY = Math.round(this.y + ny * steps);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(tipX, tipY, 1, 1);
            }
        } else if (b.phase === 'impact') {
            // Full beam fading out
            var fade = 1 - (b.timer / b.impactDuration);
            var dx = b.targetX - this.x;
            var dy = b.targetY - this.y;
            var len = Math.sqrt(dx * dx + dy * dy);
            var nx = dx / len;
            var ny = dy / len;
            ctx.globalAlpha = fade;
            ctx.fillStyle = '#e040c0';
            for (var s = 0; s < len; s += 2) {
                var bx = Math.round(this.x + nx * s);
                var by = Math.round(this.y + ny * s);
                ctx.fillRect(bx, by, 1, 1);
            }
            ctx.globalAlpha = 1.0;
        }
    }

    // HP bar below
    var barW = this.isMetastasis ? 16 : 28;
    var barH = this.isMetastasis ? 2 : 3;
    var barX = px - barW / 2;
    var barY = py + Math.floor(diag / 2) + 2;
    ctx.fillStyle = '#200010';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = this.isMetastasis ? '#c04080' : '#e04040';
    ctx.fillRect(barX, barY, Math.round(barW * hpFrac), barH);
};
