window.ADEPT = window.ADEPT || {};

ADEPT.ModeChemo = function(stage) {
    ADEPT.ModeBase.call(this, {
        name: 'SYSTEMIC CHEMO',
        description: 'Release chemotherapy into the tank. It kills everything it touches - crown of thorns AND cuttlefish. Hold SPACE to charge dose, release to deploy. Good luck.',
        maxMolecules: 60,
        cuttlefishCount: 5,
        tumorHp: 80,
        stage: stage || 1,
    });
};

ADEPT.ModeChemo.prototype = Object.create(ADEPT.ModeBase.prototype);
ADEPT.ModeChemo.prototype.constructor = ADEPT.ModeChemo;

ADEPT.ModeChemo.prototype.update = function(dt, game) {
    ADEPT.ModeBase.prototype.update.call(this, dt, game);

    if (game.input.chargeReleased) {
        var charge = game.input.consumeCharge();
        if (charge > 0.05) {
            this.onDoseRelease(charge, game);
            this.dosesUsed++;
            this.dosed = true;
            if (ADEPT.Sound) ADEPT.Sound.play('deploy');
        }
    }
};

ADEPT.ModeChemo.prototype.onDoseRelease = function(charge, game) {
    var cfg = ADEPT.ModeConfigs.chemo;
    var count = Math.max(1, Math.floor(charge * cfg.maxMolecules));
    var potency = 0.3 + charge * 1.0;
    var T = ADEPT.Config.TANK;

    var ventSpacing = Math.floor((T.RIGHT - T.LEFT - 20) / 6);
    var mols = [];
    for (var i = 0; i < count; i++) {
        var vent = Math.floor(Math.random() * 6);
        var ventX = T.LEFT + 12 + vent * ventSpacing;
        var mol = new ADEPT.Chemo(
            ventX + (Math.random() - 0.5) * 4,
            T.BOTTOM - 12,
            potency
        );
        mol.vx = (Math.random() - 0.5) * 1.5;
        mol.vy = -(1.5 + Math.random() * 2);
        mols.push(mol);
    }
    this.queueSpawns(mols);
};
