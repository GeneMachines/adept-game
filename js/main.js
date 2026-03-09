window.ADEPT = window.ADEPT || {};

(function() {
    var canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    // Preload sprites
    if (ADEPT.Sprites) ADEPT.Sprites.init();

    var game = new ADEPT.Game(canvas);
    game.start();
})();
