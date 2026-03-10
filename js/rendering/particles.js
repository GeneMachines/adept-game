window.ADEPT = window.ADEPT || {};

ADEPT.Particles = {
    particles: [],

    spawn: function(type, x, y) {
        switch (type) {
            case 'damage':
                for (var i = 0; i < 4; i++) {
                    ADEPT.Particles.particles.push({
                        x: x, y: y,
                        vx: (Math.random() - 0.5) * 30,
                        vy: (Math.random() - 0.5) * 30,
                        life: 0.4,
                        maxLife: 0.4,
                        color: '#ff2020',
                        size: 2,
                        type: 'fade',
                    });
                }
                break;
            case 'activation':
                for (var i = 0; i < 6; i++) {
                    var angle = (i / 6) * Math.PI * 2;
                    ADEPT.Particles.particles.push({
                        x: x, y: y,
                        vx: Math.cos(angle) * 20,
                        vy: Math.sin(angle) * 20,
                        life: 0.5,
                        maxLife: 0.5,
                        color: '#ff4040',
                        size: 2,
                        type: 'fade',
                    });
                }
                // Flash
                ADEPT.Particles.particles.push({
                    x: x, y: y,
                    vx: 0, vy: 0,
                    life: 0.3,
                    maxLife: 0.3,
                    color: '#ffff40',
                    size: 6,
                    type: 'flash',
                });
                break;
            case 'bubble':
                ADEPT.Particles.particles.push({
                    x: x, y: y,
                    vx: (Math.random() - 0.5) * 3,
                    vy: -5 - Math.random() * 5,
                    life: 3 + Math.random() * 2,
                    maxLife: 5,
                    color: 'rgba(150, 200, 255, 0.3)',
                    size: 1 + Math.floor(Math.random() * 2),
                    type: 'bubble',
                });
                break;
            case 'death':
                for (var i = 0; i < 8; i++) {
                    ADEPT.Particles.particles.push({
                        x: x + (Math.random() - 0.5) * 8,
                        y: y + (Math.random() - 0.5) * 6,
                        vx: (Math.random() - 0.5) * 10,
                        vy: -8 - Math.random() * 10,
                        life: 1.0,
                        maxLife: 1.0,
                        color: '#ffffff',
                        size: 1,
                        type: 'fade',
                    });
                }
                break;
            case 'tumor_break':
                for (var i = 0; i < 5; i++) {
                    ADEPT.Particles.particles.push({
                        x: x + (Math.random() - 0.5) * 10,
                        y: y + (Math.random() - 0.5) * 10,
                        vx: (Math.random() - 0.5) * 20,
                        vy: (Math.random() - 0.5) * 20,
                        life: 0.8,
                        maxLife: 0.8,
                        color: '#5a2a4a',
                        size: 2 + Math.floor(Math.random() * 2),
                        type: 'fade',
                    });
                }
                break;
            case 'uptake':
                // Inward "gulp" — particles converge to the point (cell eating)
                for (var i = 0; i < 4; i++) {
                    var ua = (i / 4) * Math.PI * 2 + Math.random() * 0.5;
                    var ud = 8 + Math.random() * 4;
                    ADEPT.Particles.particles.push({
                        x: x + Math.cos(ua) * ud,
                        y: y + Math.sin(ua) * ud,
                        vx: -Math.cos(ua) * ud / 0.3,
                        vy: -Math.sin(ua) * ud / 0.3,
                        life: 0.3,
                        maxLife: 0.3,
                        color: '#80c0e0',
                        size: 1,
                        type: 'fade',
                    });
                }
                break;
            case 'met_charge':
                // Converging sparkle particles moving inward toward eye
                for (var i = 0; i < 3; i++) {
                    var ca = (i / 3) * Math.PI * 2 + Math.random() * 0.5;
                    var cd = 12 + Math.random() * 8;
                    ADEPT.Particles.particles.push({
                        x: x + Math.cos(ca) * cd,
                        y: y + Math.sin(ca) * cd,
                        vx: -Math.cos(ca) * cd / 0.4,
                        vy: -Math.sin(ca) * cd / 0.4,
                        life: 0.4,
                        maxLife: 0.4,
                        color: '#e040c0',
                        size: 1,
                        type: 'fade',
                    });
                }
                break;
            case 'met_impact':
                // Radial burst at metastasis spawn point
                for (var i = 0; i < 10; i++) {
                    var ia = (i / 10) * Math.PI * 2;
                    ADEPT.Particles.particles.push({
                        x: x, y: y,
                        vx: Math.cos(ia) * 25,
                        vy: Math.sin(ia) * 25,
                        life: 0.5,
                        maxLife: 0.5,
                        color: '#e040c0',
                        size: 2,
                        type: 'fade',
                    });
                }
                // Central white flash
                ADEPT.Particles.particles.push({
                    x: x, y: y,
                    vx: 0, vy: 0,
                    life: 0.3,
                    maxLife: 0.3,
                    color: '#ffffff',
                    size: 6,
                    type: 'flash',
                });
                break;
        }
    },

    update: function(dt) {
        for (var i = ADEPT.Particles.particles.length - 1; i >= 0; i--) {
            var p = ADEPT.Particles.particles[i];
            p.life -= dt;
            if (p.life <= 0) {
                ADEPT.Particles.particles.splice(i, 1);
                continue;
            }
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (p.type === 'bubble') {
                p.vx += (Math.random() - 0.5) * 2;
            }
        }
    },

    render: function(ctx) {
        for (var i = 0; i < ADEPT.Particles.particles.length; i++) {
            var p = ADEPT.Particles.particles[i];
            var alpha = p.life / p.maxLife;
            var px = Math.round(p.x);
            var py = Math.round(p.y);

            if (p.type === 'flash') {
                var s = Math.round(p.size * (1 - alpha) + 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = alpha;
                ctx.fillRect(px - s, py - s, s * 2, s * 2);
                ctx.globalAlpha = 1.0;
            } else if (p.type === 'bubble') {
                ctx.fillStyle = p.color;
                ctx.fillRect(px, py, p.size, p.size);
            } else {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = alpha;
                ctx.fillRect(px, py, p.size, p.size);
                ctx.globalAlpha = 1.0;
            }
        }
    },

    clear: function() {
        ADEPT.Particles.particles = [];
    }
};
