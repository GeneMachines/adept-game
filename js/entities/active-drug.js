window.ADEPT = window.ADEPT || {};

ADEPT.ActiveDrug = function(x, y, potency) {
    ADEPT.Molecule.call(this, x, y);
    this.type = 'active_drug';
    this.radius = 2;
    this.potency = potency || 1.5;
    this.layer = 1;
    this.glowTimer = 0;
};

ADEPT.ActiveDrug.prototype = Object.create(ADEPT.Molecule.prototype);
ADEPT.ActiveDrug.prototype.constructor = ADEPT.ActiveDrug;

// Consumed on hit, same multipliers as chemo
ADEPT.ActiveDrug.prototype.onCollision = function(other) {
    if (!this.alive) return;
    var B = ADEPT.Balance;
    if (other.type === 'tumor') {
        other.damage(this.potency * B.chemo_tumor_mult);
        this.alive = false;
        if (ADEPT.Particles) ADEPT.Particles.spawn('damage', this.x, this.y);
        if (ADEPT.Sound) ADEPT.Sound.play('tumorHit');
    }
    if (other.type === 'cuttlefish') {
        other.damage(this.potency * B.chemo_cuttlefish_mult);
        this.alive = false;
        if (ADEPT.Particles) ADEPT.Particles.spawn('damage', this.x, this.y);
        if (ADEPT.Sound) ADEPT.Sound.play('cuttlefishHit');
    }
};

ADEPT.ActiveDrug.prototype.update = function(dt) {
    ADEPT.Molecule.prototype.update.call(this, dt);
    this.glowTimer += dt;
};

ADEPT.ActiveDrug.prototype.render = function(ctx) {
    var px = Math.round(this.x);
    var py = Math.round(this.y);
    var pulse = Math.sin(this.glowTimer * 8) * 0.3 + 0.7;

    // Bright red activated drug
    ctx.fillStyle = '#ff4040';
    ctx.fillRect(px - 1, py - 1, 3, 3);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(px, py, 1, 1);

    // Pulsing glow
    ctx.fillStyle = 'rgba(255, 0, 0, ' + (0.15 * pulse) + ')';
    ctx.fillRect(px - 3, py - 3, 7, 7);
};
