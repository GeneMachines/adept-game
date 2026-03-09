window.ADEPT = window.ADEPT || {};

ADEPT.Renderer = function(canvas) {
    this.canvas = canvas;
    this.VIRTUAL_W = ADEPT.Config.VIRTUAL_W;
    this.VIRTUAL_H = ADEPT.Config.VIRTUAL_H;

    // Offscreen buffer at virtual resolution
    this.buffer = document.createElement('canvas');
    this.buffer.width = this.VIRTUAL_W;
    this.buffer.height = this.VIRTUAL_H;
    this.bctx = this.buffer.getContext('2d');
    this.bctx.imageSmoothingEnabled = false;

    this.displayCtx = canvas.getContext('2d');
    this.displayCtx.imageSmoothingEnabled = false;

    this.bubbleTimer = 0;

    this.resize();
    var self = this;
    window.addEventListener('resize', function() { self.resize(); });
};

ADEPT.Renderer.prototype.resize = function() {
    var aspect = this.VIRTUAL_W / this.VIRTUAL_H;
    var w = window.innerWidth;
    var h = window.innerHeight;
    if (w / h > aspect) {
        w = Math.floor(h * aspect);
    } else {
        h = Math.floor(w / aspect);
    }
    this.canvas.width = w;
    this.canvas.height = h;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.scale = w / this.VIRTUAL_W;
    this.displayCtx.imageSmoothingEnabled = false;
};

ADEPT.Renderer.prototype.clear = function() {
    this.bctx.fillStyle = '#0a0a1e';
    this.bctx.fillRect(0, 0, this.VIRTUAL_W, this.VIRTUAL_H);
};

ADEPT.Renderer.prototype.drawBackground = function(dt) {
    var ctx = this.bctx;
    var T = ADEPT.Config.TANK;

    // Water fill
    ctx.fillStyle = '#0e1e3a';
    ctx.fillRect(T.LEFT, T.TOP, T.RIGHT - T.LEFT, T.BOTTOM - T.TOP);

    // Water gradient (lighter at top)
    ctx.fillStyle = 'rgba(30, 60, 120, 0.3)';
    ctx.fillRect(T.LEFT, T.TOP, T.RIGHT - T.LEFT, 20);
    ctx.fillStyle = 'rgba(20, 40, 80, 0.2)';
    ctx.fillRect(T.LEFT, T.TOP + 20, T.RIGHT - T.LEFT, 20);

    // Diagonal light shafts from top-right (Aerith's church style)
    var rayTime = Date.now() / 1000;
    var tankW = T.RIGHT - T.LEFT;
    var tankH = T.BOTTOM - T.TOP;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Three soft diagonal beams entering from top-right at ~45°
    var rays = [
        { enterX: 0.85, width: 22, alpha: 0.035, speed: 0.2, phase: 0 },
        { enterX: 0.70, width: 16, alpha: 0.025, speed: 0.15, phase: 1.8 },
        { enterX: 0.95, width: 12, alpha: 0.02, speed: 0.25, phase: 3.5 },
    ];

    for (var ri = 0; ri < rays.length; ri++) {
        var ray = rays[ri];
        var breathe = Math.sin(rayTime * ray.speed + ray.phase) * 0.008;
        var baseAlpha = ray.alpha + breathe;

        // Each beam: scan vertical lines, calculate where the diagonal falls
        for (var ry = 0; ry < tankH; ry++) {
            var frac = ry / tankH;
            // Beam center drifts left as it goes down (diagonal from top-right)
            var centerX = T.LEFT + tankW * ray.enterX - ry * 0.7;
            // Beam widens gently as it descends
            var halfW = (ray.width * 0.3) + (ray.width * 0.7) * frac;
            // Fade: bright at top, soft at bottom
            var fade = baseAlpha * (1 - frac * 0.5);
            // Soft shimmer
            var shimmer = Math.sin(ry * 0.3 + rayTime * 1.5 + ri * 2) * 0.005;
            var a = Math.max(0, fade + shimmer);

            // Soft blue-white light
            ctx.fillStyle = 'rgba(160, 200, 240, ' + a + ')';
            ctx.fillRect(Math.round(centerX - halfW), T.TOP + ry, Math.round(halfW * 2), 1);

            // Brighter core (narrower, whiter)
            var coreW = halfW * 0.3;
            ctx.fillStyle = 'rgba(200, 220, 255, ' + (a * 0.6) + ')';
            ctx.fillRect(Math.round(centerX - coreW), T.TOP + ry, Math.round(coreW * 2), 1);
        }
    }

    // Caustic dapples where light hits the floor and mid-water
    for (var ci = 0; ci < 10; ci++) {
        // Position caustics along the diagonal light path
        var cx = T.RIGHT - 20 - ci * 18 - Math.sin(ci * 2.1) * 8;
        var cy = T.TOP + 20 + ci * 16;
        if (cx < T.LEFT || cx > T.RIGHT || cy > T.BOTTOM - 10) continue;
        var flicker = Math.sin(rayTime * 2.0 + ci * 2.7) * 0.5 + 0.5;
        ctx.fillStyle = 'rgba(170, 210, 245, ' + (flicker * 0.05) + ')';
        var cw = 2 + Math.round(Math.sin(ci * 4.3) * 1.5);
        ctx.fillRect(Math.round(cx), Math.round(cy), cw, 1);
        // Secondary sparkle
        ctx.fillStyle = 'rgba(220, 235, 255, ' + (flicker * 0.03) + ')';
        ctx.fillRect(Math.round(cx) + 1, Math.round(cy) - 1, 1, 1);
    }
    ctx.restore();

    // Gravel at bottom
    ctx.fillStyle = '#3a2e1e';
    ctx.fillRect(T.LEFT, T.BOTTOM - 6, T.RIGHT - T.LEFT, 6);
    ctx.fillStyle = '#4a3e2a';
    for (var gx = T.LEFT; gx < T.RIGHT; gx += 3) {
        if (Math.sin(gx * 7.3) > 0.3) {
            ctx.fillRect(gx, T.BOTTOM - 5 + Math.floor(Math.sin(gx * 3.1) * 2), 2, 2);
        }
    }
    ctx.fillStyle = '#2e2218';
    for (var gx = T.LEFT + 1; gx < T.RIGHT; gx += 5) {
        if (Math.cos(gx * 4.7) > 0) {
            ctx.fillRect(gx, T.BOTTOM - 3, 1, 1);
        }
    }

    // Seaweed decoration (between volcanoes)
    var seaweedPositions = [
        T.LEFT + 20, T.LEFT + 50, T.RIGHT - 55, T.RIGHT - 25,
        T.LEFT + 80, T.RIGHT - 80
    ];
    var swayTime = Date.now() / 1000;
    for (var si = 0; si < seaweedPositions.length; si++) {
        var sx = seaweedPositions[si];
        var height = 18 + (si % 3) * 8; // vary heights (taller seaweed)
        var sway = Math.sin(swayTime * 1.2 + si * 1.7);

        // Draw frond pixel-by-pixel from bottom up
        for (var py = 0; py < height; py++) {
            var frac = py / height;
            var wave = Math.round(sway * frac * 3);
            // Main stalk
            var shade = frac < 0.4 ? '#1a6020' : (frac < 0.7 ? '#30a030' : '#50d040');
            ctx.fillStyle = shade;
            ctx.fillRect(sx + wave, T.BOTTOM - 7 - py, 1, 1);
            // Second frond (offset)
            if (si % 2 === 0 && py < height - 2) {
                var wave2 = Math.round(Math.sin(swayTime * 1.5 + si * 2.3) * frac * 3);
                ctx.fillRect(sx + 3 + wave2, T.BOTTOM - 7 - py, 1, 1);
            }
            // Third frond for fuller look
            if (si % 3 === 0 && py < height - 4) {
                var wave3 = Math.round(Math.sin(swayTime * 0.9 + si * 3.1) * frac * 2.5);
                ctx.fillStyle = frac < 0.5 ? '#1e7025' : '#38b035';
                ctx.fillRect(sx - 2 + wave3, T.BOTTOM - 7 - py, 1, 1);
            }
            // Leaf bits branching off (more frequent)
            if (py % 3 === 1 && py > 2) {
                ctx.fillStyle = frac < 0.5 ? '#28802a' : '#40c038';
                ctx.fillRect(sx + wave - 1, T.BOTTOM - 7 - py, 1, 1);
                ctx.fillRect(sx + wave + 1, T.BOTTOM - 7 - py, 1, 1);
            }
            // Extra leaves higher up
            if (py % 4 === 2 && py > 6) {
                ctx.fillStyle = frac < 0.6 ? '#25752a' : '#45c540';
                ctx.fillRect(sx + wave - 2, T.BOTTOM - 7 - py, 1, 1);
                ctx.fillRect(sx + wave + 2, T.BOTTOM - 7 - py, 1, 1);
            }
        }
        // Tip
        ctx.fillStyle = '#60e050';
        ctx.fillRect(sx + Math.round(sway * 3), T.BOTTOM - 7 - height, 1, 1);
    }

    // Sea floor mini volcanoes
    var ventSpacing = Math.floor((T.RIGHT - T.LEFT - 20) / 6);
    var ventPulse = Math.sin((Date.now() / 600)) * 0.3 + 0.7;
    for (var v = 0; v < 6; v++) {
        var vx = T.LEFT + 12 + v * ventSpacing;
        var vy = T.BOTTOM - 6;
        // Volcano base (wide mound)
        ctx.fillStyle = '#4a3828';
        ctx.fillRect(vx - 4, vy - 1, 9, 2);
        ctx.fillRect(vx - 3, vy - 2, 7, 1);
        // Mid slope
        ctx.fillStyle = '#5a4430';
        ctx.fillRect(vx - 2, vy - 3, 5, 1);
        ctx.fillRect(vx - 2, vy - 4, 5, 1);
        // Peak / rim
        ctx.fillStyle = '#6a5038';
        ctx.fillRect(vx - 1, vy - 5, 3, 1);
        // Crater opening (dark)
        ctx.fillStyle = '#1a0e08';
        ctx.fillRect(vx - 1, vy - 6, 3, 1);
        ctx.fillRect(vx, vy - 7, 1, 1);
        // Inner glow from crater
        ctx.fillStyle = 'rgba(180, 80, 30, ' + (ventPulse * 0.3) + ')';
        ctx.fillRect(vx, vy - 6, 1, 1);
        // Subtle heat shimmer above
        ctx.fillStyle = 'rgba(120, 60, 20, ' + (ventPulse * 0.12) + ')';
        ctx.fillRect(vx - 1, vy - 8, 3, 1);
        ctx.fillRect(vx, vy - 9, 1, 1);
    }

    // Tank walls
    ctx.fillStyle = '#4a4a5a';
    ctx.fillRect(T.LEFT - 3, T.TOP - 3, 3, T.BOTTOM - T.TOP + 6); // left
    ctx.fillRect(T.RIGHT, T.TOP - 3, 3, T.BOTTOM - T.TOP + 6);    // right
    ctx.fillRect(T.LEFT - 3, T.BOTTOM, T.RIGHT - T.LEFT + 6, 3);  // bottom
    ctx.fillRect(T.LEFT - 3, T.TOP - 3, T.RIGHT - T.LEFT + 6, 3); // top rim

    // Tank wall highlight
    ctx.fillStyle = '#6a6a7a';
    ctx.fillRect(T.LEFT - 3, T.TOP - 3, 1, T.BOTTOM - T.TOP + 6);
    ctx.fillRect(T.LEFT - 3, T.TOP - 3, T.RIGHT - T.LEFT + 6, 1);

    // Spawn decorative bubbles
    if (dt) {
        this.bubbleTimer += dt;
        if (this.bubbleTimer > 0.8) {
            this.bubbleTimer = 0;
            if (Math.random() < 0.5) {
                ADEPT.Particles.spawn('bubble',
                    T.LEFT + 10 + Math.random() * (T.RIGHT - T.LEFT - 20),
                    T.BOTTOM - 8
                );
            }
        }
    }
};

ADEPT.Renderer.prototype.present = function() {
    this.displayCtx.imageSmoothingEnabled = false;
    this.displayCtx.drawImage(
        this.buffer, 0, 0,
        this.canvas.width, this.canvas.height
    );
};

ADEPT.Renderer.prototype.getContext = function() {
    return this.bctx;
};
