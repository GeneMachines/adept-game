window.ADEPT = window.ADEPT || {};

ADEPT.Input = function(canvas) {
    this.canvas = canvas;
    this.charging = false;
    this.chargeTime = 0;
    this.maxCharge = 6.0;
    this.chargeReleased = false;
    this.chargeValue = 0;
    this.phase2Triggered = false;
    this.prodrugToggled = false;
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

    // Touch button regions for canvas taps (virtual coordinates)
    this.touchZones = {
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
            if (self.gameState === 'PLAYING' && ADEPT.Sound) ADEPT.Sound.startCharge();
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
                if (ADEPT.Sound) ADEPT.Sound.stopCharge();
            }
        }
    });

    // ── Canvas touch (menus, tap-to-advance) ─────────────────
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        var touch = e.touches[0];
        var v = self.screenToVirtual(touch.clientX, touch.clientY);
        self.handleCanvasTouch(v.x, v.y);
    });

    canvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        // If charging via canvas tap (non-PLAYING states), release
        if (self.charging) {
            self.chargeReleased = true;
            self.chargeValue = self.chargeTime / self.maxCharge;
            self.charging = false;
            if (ADEPT.Sound) ADEPT.Sound.stopCharge();
        }
    });

    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
    });

    // ── HTML touch buttons (below canvas) ────────────────────
    if (this.isMobile) {
        document.body.classList.add('has-touch');
        this.setupHTMLButtons();
    }
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

// Called each frame from game.js
ADEPT.Input.prototype.setGameState = function(state) {
    this.gameState = state;
    if (this.isMobile) {
        this.updateHTMLButtons(state);
    }
};

// ── HTML button wiring ──────────────────────────────────────
ADEPT.Input.prototype.setupHTMLButtons = function() {
    var self = this;
    this.btnCharge  = document.getElementById('btn-charge');
    this.btnBack    = document.getElementById('btn-back');
    this.btnEnzyme  = document.getElementById('btn-enzyme');
    this.btnProdrug = document.getElementById('btn-prodrug');
    this.toggleGroup = document.getElementById('toggle-group');

    // CHARGE button — hold to charge, release to deploy
    this.btnCharge.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        self.charging = true;
        self.btnCharge.classList.add('active');
        self.btnCharge.textContent = 'RELEASE';
        if (self.gameState === 'PLAYING' && ADEPT.Sound) ADEPT.Sound.startCharge();
    });
    this.btnCharge.addEventListener('touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (self.charging) {
            self.chargeReleased = true;
            self.chargeValue = self.chargeTime / self.maxCharge;
            self.charging = false;
            if (ADEPT.Sound) ADEPT.Sound.stopCharge();
        }
        self.btnCharge.classList.remove('active');
        self.btnCharge.textContent = 'HOLD';
    });

    // ENZYME toggle — always set flag, let game logic decide
    this.btnEnzyme.addEventListener('click', function(e) {
        e.preventDefault();
        self.phase2Triggered = true;
        self.anyKey = true;
    });

    // PRODRUG toggle — always set flag, let game logic decide
    this.btnProdrug.addEventListener('click', function(e) {
        e.preventDefault();
        self.prodrugToggled = true;
        self.anyKey = true;
    });

    // BACK button — ESC
    this.btnBack.addEventListener('click', function(e) {
        e.preventDefault();
        self.escPressed = true;
        self.selectedOption = 12;
        self.anyKey = true;
    });

    // Results screen buttons — use touchstart for instant response (no 300ms click delay)
    this.resultsBtns = document.getElementById('results-btns');
    this.btnRetry = document.getElementById('btn-retry');
    this.btnNext  = document.getElementById('btn-next');
    this.btnInfo  = document.getElementById('btn-info');

    this.btnRetry.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        self.selectedOption = 10;
        self.anyKey = true;
    });

    this.btnNext.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        self.anyKey = true; // same as spacebar — advances to next mode
    });

    this.btnInfo.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        self.selectedOption = 14;
        self.anyKey = true;
    });
};

// Update HTML button visibility/labels based on game state
ADEPT.Input.prototype.updateHTMLButtons = function(state) {
    if (!this.btnCharge) return;

    var controls = document.getElementById('touch-controls');
    var toggle = this.toggleGroup;

    var results = this.resultsBtns;

    if (state === 'PLAYING') {
        controls.style.display = 'flex';
        this.btnBack.style.display = '';
        this.btnCharge.style.display = '';
        results.classList.add('hidden');

        // Show toggle only in ADEPT mode
        var game = ADEPT.gameInstance;
        if (game && game.mode && game.mode.name === 'ADEPT') {
            toggle.classList.remove('hidden');
            var phase = game.mode.phase;
            var maxed = game.mode.aeDoses >= game.mode.maxAEDoses;

            if (phase === 1) {
                // Enzyme mode — purple pill, enzyme selected
                toggle.classList.remove('prodrug-active');
                this.btnEnzyme.classList.add('active');
                this.btnEnzyme.classList.remove('disabled');
                this.btnProdrug.classList.remove('active');
                this.btnProdrug.classList.remove('disabled');
            } else if (phase === 2) {
                // Prodrug mode — red pill, enzyme tappable if doses remain
                toggle.classList.add('prodrug-active');
                this.btnProdrug.classList.add('active');
                this.btnProdrug.classList.remove('disabled');
                this.btnEnzyme.classList.remove('active');
                if (maxed) {
                    this.btnEnzyme.classList.add('disabled');
                } else {
                    this.btnEnzyme.classList.remove('disabled');
                }
            } else if (phase === 4) {
                // Prodrug locked — red pill, enzyme disabled
                toggle.classList.add('prodrug-active');
                this.btnProdrug.classList.add('active');
                this.btnProdrug.classList.remove('disabled');
                this.btnEnzyme.classList.remove('active');
                this.btnEnzyme.classList.add('disabled');
            }
        } else {
            toggle.classList.add('hidden');
        }
    } else {
        // Non-playing states: hide gameplay buttons
        this.btnCharge.style.display = 'none';
        toggle.classList.add('hidden');

        if (state === 'RESULTS') {
            // Show results buttons (RETRY, NEXT, INFO)
            controls.style.display = 'flex';
            this.btnBack.style.display = 'none';
            results.classList.remove('hidden');
        } else {
            results.classList.add('hidden');

            // Show back button on screens that support ESC
            var showBack = (state === 'MENU' || state === 'STAGE_SELECT' ||
                            state === 'LAB_BENCH' || state === 'HOW_TO_PLAY' ||
                            state === 'RESULTS_INFO');
            if (showBack) {
                controls.style.display = 'flex';
                this.btnBack.style.display = '';
            } else {
                controls.style.display = 'none';
            }
        }
    }
};

// Canvas touch — handles menu taps and tap-to-advance
ADEPT.Input.prototype.handleCanvasTouch = function(vx, vy) {
    var z = this.touchZones;

    switch (this.gameState) {
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
                this.escPressed = true;
                this.anyKey = true;
            }
            break;

        case 'RESULTS':
            // Hit-test the option buttons at the bottom
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
            if (vx < 60) {
                this.escPressed = true;
                this.anyKey = true;
            } else if (vx > 196) {
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
            // RESULTS_INFO, HOW_TO_PLAY, PLAYING — any canvas touch = anyKey
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

ADEPT.Input.prototype.consumeProdrugToggle = function() {
    var val = this.prodrugToggled;
    this.prodrugToggled = false;
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
