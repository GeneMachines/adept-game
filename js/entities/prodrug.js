window.ADEPT = window.ADEPT || {};

ADEPT.Prodrug = function(x, y) {
    ADEPT.Molecule.call(this, x, y);
    this.type = 'prodrug';
    this.radius = 2;
    this.layer = 1;
};

ADEPT.Prodrug.prototype = Object.create(ADEPT.Molecule.prototype);
ADEPT.Prodrug.prototype.constructor = ADEPT.Prodrug;

// Standard collision still works for normal overlap
ADEPT.Prodrug.prototype.onCollision = function(other) {
    if (!this.alive) return;
    if (other.type === 'antibody_enzyme' && other.alive) {
        this.activate(other);
    }
};

// Also check catalytic radius in update (wider area)
ADEPT.Prodrug.prototype.update = function(dt) {
    ADEPT.Molecule.prototype.update.call(this, dt);
    if (!this.alive || !ADEPT.gameInstance) return;

    var entities = ADEPT.gameInstance.entities;
    for (var i = 0; i < entities.length; i++) {
        var e = entities[i];
        if (e.type === 'antibody_enzyme' && e.alive && e.catalyticRadius) {
            var dx = this.x - e.x;
            var dy = this.y - e.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < e.catalyticRadius) {
                this.activate(e);
                return;
            }
        }
    }
};

ADEPT.Prodrug.prototype.activate = function(enzyme) {
    if (!this.alive) return;
    this.alive = false;
    enzyme.triggerChomp();
    // Spawn active drug at the enzyme location (right at the tumor)
    var drug = new ADEPT.ActiveDrug(enzyme.x, enzyme.y, ADEPT.Balance.prodrug_potency);
    if (ADEPT.gameInstance) {
        ADEPT.gameInstance.addEntity(drug);
    }
    if (ADEPT.Particles) ADEPT.Particles.spawn('activation', enzyme.x, enzyme.y);
    if (ADEPT.Sound) ADEPT.Sound.play('activation');
};

ADEPT.Prodrug.prototype.render = function(ctx) {
    var px = Math.round(this.x);
    var py = Math.round(this.y);

    // Dim grey grenade shape
    ctx.fillStyle = '#808890';
    ctx.fillRect(px - 1, py - 1, 3, 3);
    ctx.fillRect(px, py - 2, 1, 1); // pin

    // Subtle outline
    ctx.fillStyle = '#606870';
    ctx.fillRect(px - 1, py + 2, 3, 1);
};
