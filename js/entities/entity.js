window.ADEPT = window.ADEPT || {};

ADEPT._nextId = 1;

ADEPT.Entity = function(x, y) {
    this.id = ADEPT._nextId++;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = 4;
    this.alive = true;
    this.layer = 0;
    this.type = 'entity';
    this.diffuses = false;
    this.isMolecule = false;
};

ADEPT.Entity.prototype.update = function(dt) {};
ADEPT.Entity.prototype.render = function(ctx) {};
ADEPT.Entity.prototype.onCollision = function(other) {};

ADEPT.Entity.prototype.distanceTo = function(other) {
    var dx = this.x - other.x;
    var dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
};

ADEPT.Entity.prototype.overlaps = function(other) {
    return this.distanceTo(other) < (this.radius + other.radius);
};
