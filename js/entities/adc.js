window.ADEPT = window.ADEPT || {};

ADEPT.ADC = function(x, y, potency) {
    ADEPT.Molecule.call(this, x, y);
    this.type = 'adc';
    this.radius = 4;
    this.potency = potency || 1.0;
    this.payloadRemaining = 4.0;
    this.layer = 1;
};

ADEPT.ADC.prototype = Object.create(ADEPT.Molecule.prototype);
ADEPT.ADC.prototype.constructor = ADEPT.ADC;

ADEPT.ADC.prototype.onCollision = function(other) {
    if (this.bound || !this.alive) return;
    if (other.type === 'tumor' && Math.random() < ADEPT.Balance.adc_tumor_bind) {
        this.bindTo(other);
        other.addBoundMolecule(this);
    }
};

ADEPT.ADC.prototype.render = function(ctx) {
    var px = Math.round(this.x);
    var py = Math.round(this.y);

    // Y-shape antibody with payload indicator
    var col = this.bound ? '#30a030' : '#40e040';
    var payloadCol = this.payloadRemaining > 2 ? '#ff6040' : '#ff9060';

    // Stem
    ctx.fillStyle = col;
    ctx.fillRect(px, py, 1, 4);

    // Left arm
    ctx.fillRect(px - 2, py - 1, 1, 1);
    ctx.fillRect(px - 1, py, 1, 1);
    ctx.fillRect(px - 3, py - 2, 1, 1);

    // Right arm
    ctx.fillRect(px + 2, py - 1, 1, 1);
    ctx.fillRect(px + 1, py, 1, 1);
    ctx.fillRect(px + 3, py - 2, 1, 1);

    // Payload indicator (dot at bottom of stem)
    if (this.payloadRemaining > 0.5) {
        ctx.fillStyle = payloadCol;
        ctx.fillRect(px - 1, py + 3, 3, 2);
    }

    // Glow if leaking
    if (this.payloadRemaining > 0.5) {
        ctx.fillStyle = 'rgba(255, 96, 64, 0.1)';
        ctx.fillRect(px - 3, py - 1, 7, 7);
    }
};
