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

    // Mobile detection (also set static for HUD access)
    this.isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    ADEPT.Input.isMobile = this.isMobile;
    this.gameState = '';
    this.activeTouching = false; // true while a finger is down (for button highlight)

    // Touch button regions (virtual coordinates)
    // These match the rendered positions in hud.js
    this.touchZones = {
        // PLAYING state buttons
        charge:  { x: 8,   y: 168, w: 116, h: 32 },
        action:  { x: 132, y: 168, w: 116, h: 32 },
        esc:     { x: 90,  y: 0,   w: 76,  h: 20 },
        // MENU state cards (match renderMenu: startY=48, gap=42, cardH=34)
        menuCard0: { x: 18, y: 48,  w: 220, h: 34 },
        menuCard1: { x: 18, y: 90,  w: 220, h: 34 },
        menuCard2: { x: 18, y: 132, w: 220, h: 34 },
        menuHelp:  { x: 40, y: 170, w: 176, h: 16 },
        // STAGE_SELECT
        stage1: { x: 38, y: 86,  w: 180, h: 28 },
        stage2: { x: 38, y: 126, w: 180, h: 28 },
    };

    var self = this;

    // ── Keyboard ─────────────────────────────────────────────
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

    // ── Touch ────────────────────────────────────────────────
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        var touch = e.touches[0];
        var v = self.screenToVirtual(touch.clientX, touch.clientY);
        self.activeTouching = true;
        self.handleTouchStart(v.x, v.y);
    });

    canvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        self.activeTouching = false;
        if (self.charging) {
            self.chargeReleased = true;
            self.chargeValue = self.chargeTime / self.maxCharge;
            self.charging = false;
        }
    });

    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
    });
};

// Convert screen touch coordinates to virtual 256×240 space
ADEPT.Input.prototype.screenToVirtual = function(clientX, clientY) {
    var rect = this.canvas.getBoundingClientRect();
    var scaleX = ADEPT.Config.VIRTUAL_W / rect.width;
    var scaleY = ADEPT.Config.VIRTUAL_H / rect.height;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
};

// Hit-test a point against a rect {x, y, w, h}
ADEPT.Input.prototype.hitTest = function(vx, vy, zone) {
    return vx >= zone.x && vx <= zone.x + zone.w &&
           vy >= zone.y && vy <= zone.y + zone.h;
};

// Called each frame from game.js to keep touch handler state-aware
ADEPT.Input.prototype.setGameState = function(state) {
    this.gameState = state;
};

// State-aware touch dispatch
ADEPT.Input.prototype.handleTouchStart = function(vx, vy) {
    var z = this.touchZones;

    switch (this.gameState) {
        case 'PLAYING':
            if (this.hitTest(vx, vy, z.charge)) {
                this.charging = true;
            } else if (this.hitTest(vx, vy, z.action)) {
                this.phase2Triggered = true;
                this.anyKey = true;
            } else if (this.hitTest(vx, vy, z.esc)) {
                this.escPressed = true;
                this.selectedOption = 12;
                this.anyKey = true;
            } else {
                // Tap anywhere else = anyKey (useful for skip etc.)
                this.anyKey = true;
            }
            break;

        case 'MENU':
            if (this.hitTest(vx, vy, z.menuCard0)) {
                this.selectedOption = 0;
                this.anyKey = true;
            } else if (this.hitTest(vx, vy, z.menuCard1)) {
                this.selectedOption = 1;
                this.anyKey = true;
            } else if (this.hitTest(vx, vy, z.menuCard2)) {
                this.selectedOption = 2;
                this.anyKey = true;
            } else if (this.hitTest(vx, vy, z.menuHelp)) {
                this.selectedOption = 14;
                this.anyKey = true;
            } else {
                this.anyKey = true;
            }
            break;

        case 'STAGE_SELECT':
            if (this.hitTest(vx, vy, z.stage1)) {
                this.selectedOption = 0;
                this.anyKey = true;
            } else if (this.hitTest(vx, vy, z.stage2)) {
                this.selectedOption = 1;
                this.anyKey = true;
            } else {
                // Tap outside = back (ESC)
                this.escPressed = true;
                this.anyKey = true;
            }
            break;

        case 'RESULTS':
            // Hit-test the option buttons at the bottom
            // These Y positions are approximate — they depend on content height.
            // Use generous regions covering the bottom option row area.
            if (vy > 160 && vy < 210) {
                if (vx < 75) {
                    this.selectedOption = 10; // R - retry
                    this.anyKey = true;
                } else if (vx < 145) {
                    this.selectedOption = 12; // M - menu
                    this.anyKey = true;
                } else {
                    this.selectedOption = 14; // I - info
                    this.anyKey = true;
                }
            } else {
                this.anyKey = true;
            }
            break;

        case 'LAB_BENCH':
            // Top half = up, bottom half = down
            // Left third = ESC, right third = confirm
            if (vx < 60) {
                this.escPressed = true;
                this.anyKey = true;
            } else if (vx > 196) {
                // Confirm (right side tap)
                this.phase2Triggered = true;
                this.anyKey = true;
            } else if (vy < 120) {
                this.arrowUp = true;
                this.anyKey = true;
            } else {
                this.arrowDown = true;
                this.anyKey = true;
            }
            break;

        default:
            // TITLE, NARRATIVE, GAME_OVER, ENDING, MODE_INTRO,
            // RESULTS_INFO, HOW_TO_PLAY — any touch = anyKey
            this.anyKey = true;
            break;
    }
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
