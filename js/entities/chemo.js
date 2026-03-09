window.ADEPT = window.ADEPT || {};

ADEPT.Chemo = function(x, y, potency) {
    ADEPT.Molecule.call(this, x, y);
    this.type = 'chemo';
    this.radius = 2;
    this.potency = potency || 1.0;
    this.layer = 1;
};

ADEPT.Chemo.prototype = Object.create(ADEPT.Molecule.prototype);
ADEPT.Chemo.prototype.constructor = ADEPT.Chemo;

ADEPT.Chemo.prototype.onCollision = function(other) {
    if (!this.alive) return;
    var B = ADEPT.Balance;
    if (other.type === 'tumor') {
        other.damage(this.potency * B.chemo_tumor_mult);
        this.alive = false;
        if (ADEPT.Particles) ADEPT.Particles.spawn('damage', this.x, this.y);
    }
    if (other.type === 'cuttlefish') {
        other.damage(this.potency * B.chemo_cuttlefish_mult);
        this.alive = false;
        if (ADEPT.Particles) ADEPT.Particles.spawn('damage', this.x, this.y);
    }
};

ADEPT.Chemo.prototype.render = function(ctx) {
    var px = Math.round(this.x);
    var py = Math.round(this.y);
    // Small red toxic dot with glow
    ctx.fillStyle = '#ff2020';
    ctx.fillRect(px - 1, py - 1, 3, 3);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(px, py, 1, 1);
    // Faint glow
    ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
    ctx.fillRect(px - 2, py - 2, 5, 5);
};
