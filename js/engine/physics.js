window.ADEPT = window.ADEPT || {};

ADEPT.Utils = {
    gaussianRandom: function() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }
};

ADEPT.Config = {
    TANK: {
        LEFT: 8,
        RIGHT: 248,
        TOP: 24,
        BOTTOM: 200,
        CENTER_X: 128,
        CENTER_Y: 112,
    },
    VIRTUAL_W: 256,
    VIRTUAL_H: 240,
};

// Physics uses pixels/frame for velocity. Simple and predictable.
ADEPT.Physics = {
    // Jitter strength per frame (pixels). Higher = faster diffusion.
    DIFFUSION: {
        chemo: 1.0,
        adc: 0.5,
        antibody_enzyme: 0.45,
        prodrug: 0.8,
        active_drug: 1.0,
    },

    // Drag per frame (velocity multiplier). Lower = more damping.
    DRAG: {
        chemo: 0.94,
        adc: 0.92,
        antibody_enzyme: 0.92,
        prodrug: 0.94,
        active_drug: 0.94,
    },

    updateBrownian: function(entity, dt) {
        var D = ADEPT.Physics.DIFFUSION[entity.type] || 1.0;
        var drag = ADEPT.Physics.DRAG[entity.type] || 0.94;

        // Random jitter each frame
        entity.vx += ADEPT.Utils.gaussianRandom() * D;
        entity.vy += ADEPT.Utils.gaussianRandom() * D;

        // Drag
        entity.vx *= drag;
        entity.vy *= drag;

        // Position update (velocity is already in px/frame)
        entity.x += entity.vx;
        entity.y += entity.vy;
    },

    enforceBounds: function(e) {
        var T = ADEPT.Config.TANK;
        if (e.x - e.radius < T.LEFT) { e.x = T.LEFT + e.radius; e.vx *= -0.5; }
        if (e.x + e.radius > T.RIGHT) { e.x = T.RIGHT - e.radius; e.vx *= -0.5; }
        if (e.y - e.radius < T.TOP) { e.y = T.TOP + e.radius; e.vy *= -0.5; }
        if (e.y + e.radius > T.BOTTOM) { e.y = T.BOTTOM - e.radius; e.vy *= -0.5; }
    },

    updateAll: function(entities, dt) {
        for (var i = 0; i < entities.length; i++) {
            var e = entities[i];
            if (e.bound || !e.diffuses) continue;
            ADEPT.Physics.updateBrownian(e, dt);
            ADEPT.Physics.enforceBounds(e);
        }
        ADEPT.Physics.detectCollisions(entities);
    },

    detectCollisions: function(entities) {
        for (var i = 0; i < entities.length; i++) {
            if (!entities[i].alive) continue;
            for (var j = i + 1; j < entities.length; j++) {
                if (!entities[j].alive) continue;
                var a = entities[i], b = entities[j];
                if (a.overlaps(b)) {
                    a.onCollision(b);
                    b.onCollision(a);
                }
            }
        }
    }
};
