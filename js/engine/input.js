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
        if (e.code === 'KeyM' || e.code === 'Escape') self.selectedOption = 12; // menu
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

ADEPT.Input.prototype.getNormalizedCharge = function() {
    return this.chargeTime / this.maxCharge;
};
