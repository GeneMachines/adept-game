window.ADEPT = window.ADEPT || {};

ADEPT.Input = function(canvas) {
    this.canvas = canvas;
    this.charging = false;
    this.chargeTime = 0;
    this.maxCharge = 6.0;
    this.chargeReleased = false;
    this.chargeValue = 0;
    this.phase2Triggered = false;
    this.anyKey = false;
    this.selectedOption = -1;
    this.escPressed = false;
    this.arrowUp = false;
    this.arrowDown = false;
    this.arrowLeft = false;
    this.arrowRight = false;

    var self = this;

    window.addEventListener('keydown', function(e) {
        if (e.repeat) return;
        if (e.code === 'Space') {
            e.preventDefault();
            self.charging = true;
        }
        if (e.code === 'KeyE' || e.code === 'Enter') {
            self.phase2Triggered = true;
        }
        if (e.code === 'Digit1' || e.code === 'Numpad1') self.selectedOption = 0;
        if (e.code === 'Digit2' || e.code === 'Numpad2') self.selectedOption = 1;
        if (e.code === 'Digit3' || e.code === 'Numpad3') self.selectedOption = 2;
        if (e.code === 'KeyR') self.selectedOption = 10; // retry
        if (e.code === 'KeyN') self.selectedOption = 11; // next
        if (e.code === 'KeyM') self.selectedOption = 12; // menu
        if (e.code === 'KeyL') self.selectedOption = 13; // lab bench
        if (e.code === 'KeyI') self.selectedOption = 14; // info
        if (e.code === 'Escape') { self.escPressed = true; self.selectedOption = 12; }
        if (e.code === 'ArrowUp') { e.preventDefault(); self.arrowUp = true; }
        if (e.code === 'ArrowDown') { e.preventDefault(); self.arrowDown = true; }
        if (e.code === 'ArrowLeft') { e.preventDefault(); self.arrowLeft = true; }
        if (e.code === 'ArrowRight') { e.preventDefault(); self.arrowRight = true; }
        self.anyKey = true;
    });

    window.addEventListener('keyup', function(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            if (self.charging) {
                self.chargeReleased = true;
                self.chargeValue = self.chargeTime / self.maxCharge;
                self.charging = false;
            }
        }
    });

    // Touch support
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        var touch = e.touches[0];
        var rect = canvas.getBoundingClientRect();
        var ty = (touch.clientY - rect.top) / rect.height;

        // Bottom 30% = charge, top area = phase2/menu
        if (ty > 0.7) {
            self.charging = true;
        } else {
            self.phase2Triggered = true;
            self.anyKey = true;
        }
    });

    canvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        if (self.charging) {
            self.chargeReleased = true;
            self.chargeValue = self.chargeTime / self.maxCharge;
            self.charging = false;
        }
    });
};

ADEPT.Input.prototype.update = function(dt) {
    if (this.charging) {
        this.chargeTime = Math.min(this.chargeTime + dt, this.maxCharge);
    }
};

ADEPT.Input.prototype.consumeCharge = function() {
    var val = this.chargeValue;
    this.chargeReleased = false;
    this.chargeValue = 0;
    this.chargeTime = 0;
    return val;
};

ADEPT.Input.prototype.consumePhase2 = function() {
    var val = this.phase2Triggered;
    this.phase2Triggered = false;
    return val;
};

ADEPT.Input.prototype.consumeEsc = function() {
    var val = this.escPressed;
    this.escPressed = false;
    return val;
};

ADEPT.Input.prototype.consumeAnyKey = function() {
    var val = this.anyKey;
    this.anyKey = false;
    return val;
};

ADEPT.Input.prototype.consumeOption = function() {
    var val = this.selectedOption;
    this.selectedOption = -1;
    return val;
};

ADEPT.Input.prototype.consumeArrow = function() {
    if (this.arrowUp) { this.arrowUp = false; return 'up'; }
    if (this.arrowDown) { this.arrowDown = false; return 'down'; }
    if (this.arrowLeft) { this.arrowLeft = false; return 'left'; }
    if (this.arrowRight) { this.arrowRight = false; return 'right'; }
    return null;
};

ADEPT.Input.prototype.getNormalizedCharge = function() {
    return this.chargeTime / this.maxCharge;
};
