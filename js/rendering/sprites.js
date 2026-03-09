window.ADEPT = window.ADEPT || {};

ADEPT.Sprites = {
    _images: {},
    _loaded: 0,
    _total: 0,
    ready: false,

    load: function(name, src) {
        this._total++;
        var self = this;
        var img = new Image();
        img.onload = function() {
            self._loaded++;
            if (self._loaded >= self._total) {
                self.ready = true;
            }
        };
        img.src = src;
        this._images[name] = img;
    },

    get: function(name) {
        return this._images[name] || null;
    },

    init: function() {
        this.load('cuttlefish', 'assets/cuttlefish.png');
        this.load('cuttlefish-flip', 'assets/cuttlefish-flip.png');
        this.load('tumor', 'assets/tumor.png');
    }
};
