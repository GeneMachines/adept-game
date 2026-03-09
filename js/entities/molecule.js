window.ADEPT = window.ADEPT || {};

ADEPT.Molecule = function(x, y) {
    ADEPT.Entity.call(this, x, y);
    this.diffuses = true;
    this.isMolecule = true;
    this.bound = false;
    this.boundTo = null;
    this.bindOffsetX = 0;
    this.bindOffsetY = 0;
    this.lifetime = Infinity;
    this.age = 0;
    this.layer = 1;
    this.potency = 1.0;
};

ADEPT.Molecule.prototype = Object.create(ADEPT.Entity.prototype);
ADEPT.Molecule.prototype.constructor = ADEPT.Molecule;

ADEPT.Molecule.prototype.update = function(dt) {
    this.age += dt;
    if (this.age > this.lifetime) {
        this.alive = false;
        return;
    }
    if (this.bound && this.boundTo) {
        this.x = this.boundTo.x + this.bindOffsetX;
        this.y = this.boundTo.y + this.bindOffsetY;
        if (!this.boundTo.alive) {
            this.alive = false;
        }
    }
};

ADEPT.Molecule.prototype.bindTo = function(target) {
    this.bound = true;
    this.boundTo = target;
    this.diffuses = false;
    // Random position on target surface
    var angle = Math.random() * Math.PI * 2;
    var dist = target.radius * (0.7 + Math.random() * 0.3);
    this.bindOffsetX = Math.cos(angle) * dist;
    this.bindOffsetY = Math.sin(angle) * dist;
};
