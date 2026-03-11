window.ADEPT = window.ADEPT || {};

ADEPT.AntibodyEnzyme = function(x, y) {
    ADEPT.Molecule.call(this, x, y);
    this.type = 'antibody_enzyme';
    this.radius = 4;
    this.catalyticRadius = ADEPT.Balance.ae_catalytic_radius;
    this.layer = 1;
    this.chompTimer = 0;
    this.chomping = false;
};

ADEPT.AntibodyEnzyme.prototype = Object.create(ADEPT.Molecule.prototype);
ADEPT.AntibodyEnzyme.prototype.constructor = ADEPT.AntibodyEnzyme;

ADEPT.AntibodyEnzyme.prototype.onCollision = function(other) {
    if (this.bound || !this.alive) return;
    if (other.type === 'tumor' && Math.random() < ADEPT.Balance.ae_tumor_bind) {
        this.bindTo(other);
        other.addBoundMolecule(this);
        if (ADEPT.Sound) ADEPT.Sound.play('bind');
    }
};

ADEPT.AntibodyEnzyme.prototype.triggerChomp = function() {
    this.chomping = true;
    this.chompTimer = 0.3;
};

ADEPT.AntibodyEnzyme.prototype.update = function(dt) {
    ADEPT.Molecule.prototype.update.call(this, dt);
    if (this.chompTimer > 0) {
        this.chompTimer -= dt;
        if (this.chompTimer <= 0) {
            this.chomping = false;
        }
    }
};

ADEPT.AntibodyEnzyme.prototype.render = function(ctx) {
    var px = Math.round(this.x);
    var py = Math.round(this.y);

    var col = this.bound ? '#30a030' : '#40e040';
    var enzymeCol = this.chomping ? '#e060ff' : '#a040e0';

    // Y-shape antibody (same as ADC but no payload)
    ctx.fillStyle = col;
    ctx.fillRect(px, py + 1, 1, 3);

    // Left arm
    ctx.fillRect(px - 2, py, 1, 1);
    ctx.fillRect(px - 1, py + 1, 1, 1);
    ctx.fillRect(px - 3, py - 1, 1, 1);

    // Right arm
    ctx.fillRect(px + 2, py, 1, 1);
    ctx.fillRect(px + 1, py + 1, 1, 1);
    ctx.fillRect(px + 3, py - 1, 1, 1);

    // Enzyme blob at junction (pac-man style when chomping)
    ctx.fillStyle = enzymeCol;
    if (this.chomping) {
        // Open mouth
        ctx.fillRect(px - 2, py + 3, 5, 1);
        ctx.fillRect(px - 2, py + 4, 2, 2);
        ctx.fillRect(px + 1, py + 4, 2, 2);
        ctx.fillRect(px - 2, py + 6, 5, 1);
        // Spark
        ctx.fillStyle = '#ffff40';
        ctx.fillRect(px, py + 5, 1, 1);
    } else {
        // Closed blob
        ctx.fillRect(px - 2, py + 3, 5, 4);
        ctx.fillRect(px - 1, py + 2, 3, 1);
        // Eye on enzyme
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px, py + 4, 1, 1);
    }
};
