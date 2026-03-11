window.ADEPT = window.ADEPT || {};

ADEPT.Sound = {
    ctx: null,
    unlocked: false,
    muted: false,
    volume: 0.3,
    activeCount: 0,
    MAX_ACTIVE: 8,
    _lastPlayed: {},
    _chargeOsc: null,
    _chargeGain: null,

    // Minimum ms between repeated plays of the same sound
    _intervals: {
        deploy: 200,
        tumorHit: 80,
        cuttlefishHit: 80,
        cuttlefishDeath: 500,
        tumorDeath: 500,
        activation: 100,
        gameOver: 1000,
        victory: 1000,
        bind: 100,
        uptake: 150,
        metCharge: 300,
        metBeam: 300,
        metImpact: 300,
        menuSelect: 150,
        phaseToggle: 150
    },

    init: function() {
        try {
            var AC = window.AudioContext || window.webkitAudioContext;
            if (AC) {
                this.ctx = new AC();
                this._setupUnlock();
            }
        } catch (e) {
            // Web Audio not supported — sounds disabled silently
        }

        // Mute toggle on S key
        var self = this;
        window.addEventListener('keydown', function(e) {
            if (e.code === 'KeyS' && !e.repeat) {
                self.toggleMute();
            }
        });
    },

    _setupUnlock: function() {
        var self = this;
        var removeListeners = function() {
            window.removeEventListener('touchstart', unlock, true);
            window.removeEventListener('mousedown', unlock, true);
            window.removeEventListener('keydown', unlock, true);
        };
        var unlock = function() {
            if (self.unlocked) return;
            var ctx = self.ctx;

            // Play a silent buffer to prime iOS audio pipeline
            try {
                var buffer = ctx.createBuffer(1, 1, 22050);
                var source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.start(0);
            } catch(e) {}

            if (ctx.state === 'suspended') {
                ctx.resume().then(function() {
                    self.unlocked = true;
                    removeListeners();
                });
                // Don't remove listeners yet — retry on next touch if needed
            } else {
                self.unlocked = true;
                removeListeners();
            }
        };
        window.addEventListener('touchstart', unlock, true);
        window.addEventListener('mousedown', unlock, true);
        window.addEventListener('keydown', unlock, true);
    },

    play: function(name) {
        if (this.muted || !this.ctx) return;
        // Auto-resume if not yet unlocked
        if (!this.unlocked) {
            if (this.ctx.state === 'suspended') this.ctx.resume();
            return;
        }
        if (this.activeCount >= this.MAX_ACTIVE) return;

        var now = performance.now();
        var minInterval = this._intervals[name] || 50;
        if (this._lastPlayed[name] && (now - this._lastPlayed[name]) < minInterval) return;
        this._lastPlayed[name] = now;

        var method = '_' + name;
        if (this[method]) this[method]();
    },

    toggleMute: function() {
        this.muted = !this.muted;
        if (this.muted) this.stopCharge();
        return this.muted;
    },

    // Sustained rising tone while charging — call from input start/stop
    startCharge: function() {
        if (this.muted || !this.ctx) return;
        if (!this.unlocked) {
            if (this.ctx.state === 'suspended') this.ctx.resume();
            return;
        }
        this.stopCharge(); // kill any existing

        var ctx = this.ctx;
        var now = ctx.currentTime;
        var vol = this.volume;

        // Rising triangle tone: 80Hz → 800Hz over 6s (matches maxCharge)
        var gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol * 0.10, now + 0.08);
        gain.gain.linearRampToValueAtTime(vol * 0.18, now + 6.0);

        var osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 6.0);
        osc.connect(gain);
        osc.start(now);
        this._trackOsc(osc);

        this._chargeOsc = osc;
        this._chargeGain = gain;
    },

    stopCharge: function() {
        var ctx = this.ctx;
        if (!ctx) return;
        var now = ctx.currentTime;

        if (this._chargeGain) {
            this._chargeGain.gain.cancelScheduledValues(now);
            this._chargeGain.gain.setValueAtTime(
                this._chargeGain.gain.value, now
            );
            this._chargeGain.gain.linearRampToValueAtTime(0, now + 0.03);
        }
        if (this._chargeOsc) {
            try { this._chargeOsc.stop(now + 0.05); } catch(e) {}
            this._chargeOsc = null;
        }
        this._chargeGain = null;
    },

    _trackOsc: function(osc) {
        var self = this;
        self.activeCount++;
        osc.onended = function() {
            self.activeCount--;
        };
    },

    // ── Tier 1: Essential Sounds ───────────────────────────────

    // Dose release — rising sweep whoosh
    _deploy: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var vol = this.volume;

        var gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol * 0.25, now + 0.005);
        gain.gain.linearRampToValueAtTime(0, now + 0.15);

        var osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.linearRampToValueAtTime(400, now + 0.15);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.15);
        this._trackOsc(osc);

        // Grit layer
        var gain2 = ctx.createGain();
        gain2.connect(ctx.destination);
        gain2.gain.setValueAtTime(vol * 0.08, now);
        gain2.gain.linearRampToValueAtTime(0, now + 0.10);

        var osc2 = ctx.createOscillator();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(80, now);
        osc2.connect(gain2);
        osc2.start(now);
        osc2.stop(now + 0.10);
        this._trackOsc(osc2);
    },

    // Molecule hits tumor — punchy low thud
    _tumorHit: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var vol = this.volume;

        var gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol * 0.20, now + 0.002);
        gain.gain.linearRampToValueAtTime(0, now + 0.06);

        var osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.06);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.06);
        this._trackOsc(osc);
    },

    // Molecule hits cuttlefish — alarming higher tone
    _cuttlefishHit: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var vol = this.volume;

        var gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol * 0.15, now + 0.002);
        gain.gain.linearRampToValueAtTime(0, now + 0.08);

        var osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(200, now + 0.08);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.08);
        this._trackOsc(osc);
    },

    // Cuttlefish dies — sad 3-note chromatic descent
    _cuttlefishDeath: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var vol = this.volume;
        var notes = [440, 370, 294];
        var durations = [0.12, 0.12, 0.20];
        var gains = [0.20, 0.15, 0.10];
        var t = now;

        for (var i = 0; i < notes.length; i++) {
            var g = ctx.createGain();
            g.connect(ctx.destination);
            g.gain.setValueAtTime(vol * gains[i], t);
            g.gain.linearRampToValueAtTime(0, t + durations[i]);

            var o = ctx.createOscillator();
            o.type = 'triangle';
            o.frequency.setValueAtTime(notes[i], t);
            o.connect(g);
            o.start(t);
            o.stop(t + durations[i]);
            this._trackOsc(o);

            t += durations[i];
        }
    },

    // Tumor destroyed — low rumbling explosion
    _tumorDeath: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var vol = this.volume;

        var gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(vol * 0.25, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.30);

        var osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.linearRampToValueAtTime(30, now + 0.30);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.30);
        this._trackOsc(osc);

        var gain2 = ctx.createGain();
        gain2.connect(ctx.destination);
        gain2.gain.setValueAtTime(vol * 0.12, now);
        gain2.gain.linearRampToValueAtTime(0, now + 0.20);

        var osc2 = ctx.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(160, now);
        osc2.frequency.linearRampToValueAtTime(40, now + 0.20);
        osc2.connect(gain2);
        osc2.start(now);
        osc2.stop(now + 0.20);
        this._trackOsc(osc2);
    },

    // Prodrug activation — bright double-pop snap
    _activation: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var vol = this.volume;

        var g1 = ctx.createGain();
        g1.connect(ctx.destination);
        g1.gain.setValueAtTime(vol * 0.18, now);
        g1.gain.linearRampToValueAtTime(0, now + 0.03);

        var o1 = ctx.createOscillator();
        o1.type = 'square';
        o1.frequency.setValueAtTime(880, now);
        o1.connect(g1);
        o1.start(now);
        o1.stop(now + 0.03);
        this._trackOsc(o1);

        var g2 = ctx.createGain();
        g2.connect(ctx.destination);
        g2.gain.setValueAtTime(vol * 0.15, now + 0.04);
        g2.gain.linearRampToValueAtTime(0, now + 0.07);

        var o2 = ctx.createOscillator();
        o2.type = 'square';
        o2.frequency.setValueAtTime(1100, now + 0.04);
        o2.connect(g2);
        o2.start(now + 0.04);
        o2.stop(now + 0.07);
        this._trackOsc(o2);
    },

    // Game over — descending 4-note wah wah
    _gameOver: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var vol = this.volume;
        var notes = [392, 330, 262, 196];
        var durations = [0.20, 0.20, 0.20, 0.40];
        var gains = [0.20, 0.18, 0.16, 0.14];
        var t = now;

        for (var i = 0; i < notes.length; i++) {
            var g = ctx.createGain();
            g.connect(ctx.destination);
            g.gain.setValueAtTime(vol * gains[i], t);
            g.gain.linearRampToValueAtTime(0, t + durations[i]);

            var o = ctx.createOscillator();
            o.type = 'square';
            o.frequency.setValueAtTime(notes[i], t);
            o.connect(g);
            o.start(t);
            o.stop(t + durations[i]);
            this._trackOsc(o);

            t += durations[i];
        }
    },

    // Victory — ascending triumphant arpeggio
    _victory: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var vol = this.volume;
        var notes = [523, 659, 784, 1047];
        var durations = [0.10, 0.10, 0.10, 0.30];
        var gains = [0.18, 0.18, 0.18, 0.22];
        var t = now;

        for (var i = 0; i < notes.length; i++) {
            var g = ctx.createGain();
            g.connect(ctx.destination);
            g.gain.setValueAtTime(vol * gains[i], t);
            g.gain.linearRampToValueAtTime(0, t + durations[i]);

            var o = ctx.createOscillator();
            o.type = 'triangle';
            o.frequency.setValueAtTime(notes[i], t);
            o.connect(g);
            o.start(t);
            o.stop(t + durations[i]);
            this._trackOsc(o);

            t += durations[i];
        }
    },

    // ── Tier 2: Enhancement Sounds ─────────────────────────────

    // ADC/AE binds to tumor — soft click
    _bind: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var vol = this.volume;

        var gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol * 0.12, now + 0.002);
        gain.gain.linearRampToValueAtTime(0, now + 0.04);

        var osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, now);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.04);
        this._trackOsc(osc);
    },

    // Pinocytosis — downward gulp
    _uptake: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var vol = this.volume;

        var gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol * 0.12, now + 0.005);
        gain.gain.linearRampToValueAtTime(0, now + 0.10);

        var osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.linearRampToValueAtTime(150, now + 0.10);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.10);
        this._trackOsc(osc);
    },

    // Metastasis charge — ominous rising whine
    _metCharge: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var vol = this.volume;

        var gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol * 0.12, now + 0.05);
        gain.gain.setValueAtTime(vol * 0.12, now + 0.45);
        gain.gain.linearRampToValueAtTime(0, now + 0.50);

        var osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.50);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.50);
        this._trackOsc(osc);
    },

    // Metastasis beam fires — sharp zap
    _metBeam: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var vol = this.volume;

        var gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol * 0.18, now + 0.002);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.30);

        var osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.30);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.30);
        this._trackOsc(osc);
    },

    // Metastasis impact — deep boom
    _metImpact: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var vol = this.volume;

        var gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol * 0.22, now + 0.002);
        gain.gain.linearRampToValueAtTime(0, now + 0.20);

        var osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.20);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.20);
        this._trackOsc(osc);
    },

    // Menu selection — UI blip
    _menuSelect: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var vol = this.volume;

        var gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol * 0.12, now + 0.002);
        gain.gain.linearRampToValueAtTime(0, now + 0.05);

        var osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(660, now);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.05);
        this._trackOsc(osc);
    },

    // ADEPT phase toggle — two-tone switch
    _phaseToggle: function() {
        var ctx = this.ctx;
        var now = ctx.currentTime;
        var vol = this.volume;

        var g1 = ctx.createGain();
        g1.connect(ctx.destination);
        g1.gain.setValueAtTime(vol * 0.12, now);
        g1.gain.linearRampToValueAtTime(0, now + 0.04);

        var o1 = ctx.createOscillator();
        o1.type = 'triangle';
        o1.frequency.setValueAtTime(440, now);
        o1.connect(g1);
        o1.start(now);
        o1.stop(now + 0.04);
        this._trackOsc(o1);

        var g2 = ctx.createGain();
        g2.connect(ctx.destination);
        g2.gain.setValueAtTime(vol * 0.12, now + 0.04);
        g2.gain.linearRampToValueAtTime(0, now + 0.08);

        var o2 = ctx.createOscillator();
        o2.type = 'triangle';
        o2.frequency.setValueAtTime(660, now + 0.04);
        o2.connect(g2);
        o2.start(now + 0.04);
        o2.stop(now + 0.08);
        this._trackOsc(o2);
    }
};
