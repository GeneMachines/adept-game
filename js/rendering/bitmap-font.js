window.ADEPT = window.ADEPT || {};

// Pixel-perfect bitmap font — zero anti-aliasing, crisp at any scale.
// Each glyph is 4px wide × 5px tall. Rows are 4-bit masks (bit 3=left, bit 0=right).
// Scale 1 for sizes ≤6 (5px advance), scale 2 for sizes ≥7 (10px advance).

ADEPT.BitmapFont = {
    W: 4,
    H: 5,

    G: {
        'A': [6,9,15,9,9],     'B': [14,9,14,9,14],   'C': [7,8,8,8,7],
        'D': [14,9,9,9,14],    'E': [15,8,14,8,15],    'F': [15,8,14,8,8],
        'G': [7,8,11,9,7],     'H': [9,9,15,9,9],      'I': [14,4,4,4,14],
        'J': [3,1,1,9,6],      'K': [9,10,12,10,9],     'L': [8,8,8,8,15],
        'M': [9,15,15,9,9],    'N': [9,13,15,11,9],     'O': [6,9,9,9,6],
        'P': [14,9,14,8,8],    'Q': [6,9,9,10,7],       'R': [14,9,14,10,9],
        'S': [7,8,6,1,14],     'T': [15,4,4,4,4],       'U': [9,9,9,9,6],
        'V': [9,9,9,6,6],      'W': [9,9,15,15,9],      'X': [9,9,6,9,9],
        'Y': [9,9,6,4,4],      'Z': [15,1,6,8,15],

        '0': [6,9,9,9,6],      '1': [4,12,4,4,14],      '2': [6,9,2,4,15],
        '3': [14,1,6,1,14],    '4': [9,9,15,1,1],       '5': [15,8,14,1,14],
        '6': [6,8,14,9,6],     '7': [15,1,2,4,4],       '8': [6,9,6,9,6],
        '9': [6,9,7,1,6],

        ' ': [0,0,0,0,0],      '.': [0,0,0,0,4],        ',': [0,0,0,4,8],
        ':': [0,4,0,4,0],      '!': [4,4,4,0,4],        '?': [6,9,2,0,2],
        '-': [0,0,15,0,0],     '+': [0,4,14,4,0],       '/': [1,2,4,8,0],
        '[': [12,8,8,8,12],    ']': [6,2,2,2,6],        '(': [4,8,8,8,4],
        ')': [4,2,2,2,4],      '>': [8,4,2,4,8],        '<': [2,4,8,4,2],
        '=': [0,15,0,15,0],    '_': [0,0,0,0,15],       '\'': [4,4,0,0,0],
        '"': [10,10,0,0,0],    '*': [0,10,4,10,0],      '%': [9,1,6,8,9],
    },

    getScale: function(size) {
        return (size && size >= 7) ? 2 : 1;
    },

    measure: function(text, size) {
        var n = String(text).length;
        if (n === 0) return 0;
        var s = this.getScale(size);
        return ((this.W + 1) * n - 1) * s;
    },

    draw: function(ctx, text, x, y, color, size) {
        var s = this.getScale(size);
        var advance = (this.W + 1) * s;
        ctx.fillStyle = color || '#f0f0f0';
        text = String(text).toUpperCase();
        var px = Math.round(x);
        var py = Math.round(y);

        for (var i = 0; i < text.length; i++) {
            var g = this.G[text[i]];
            if (g) {
                for (var r = 0; r < this.H; r++) {
                    var bits = g[r];
                    if (bits === 0) continue;
                    for (var c = 0; c < this.W; c++) {
                        if (bits & (8 >> c)) {
                            ctx.fillRect(px + c * s, py + r * s, s, s);
                        }
                    }
                }
            }
            px += advance;
        }
    }
};
