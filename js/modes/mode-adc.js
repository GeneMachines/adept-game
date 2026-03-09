window.ADEPT = window.ADEPT || {};

ADEPT.ModeADC = function(stage) {
    ADEPT.ModeBase.call(this, {
        name: 'ADC',
        description: 'Antibody-Drug Conjugates diffuse through the tank like chemo, but they stick preferentially to the crown of thorns. Once bound, they slowly leak their toxic payload. Better targeting, but not perfect.',
        maxMolecules: 15,
        cuttlefishCount: 5,
        tumorHp: 100,
        stage: stage || 1,
    });
};

ADEPT.ModeADC.prototype = Object.create(ADEPT.ModeBase.prototype);
ADEPT.ModeADC.prototype.constructor = ADEPT.ModeADC;

ADEPT.ModeADC.prototype.update = function(dt, game) {
    ADEPT.ModeBase.prototype.update.call(this, dt, game);

    if (game.input.chargeReleased) {
        var charge = game.input.consumeCharge();
        if (charge > 0.05) {
            this.onDoseRelease(charge, game);
            this.dosesUsed++;
            this.dosed = true;
        }
    }
};

ADEPT.ModeADC.prototype.onDoseRelease = function(charge, game) {
    var cfg = ADEPT.ModeConfigs.adc;
    var count = Math.max(1, Math.floor(charge * cfg.maxMolecules));
    var T = ADEPT.Config.TANK;

    var ventSpacing = Math.floor((T.RIGHT - T.LEFT - 20) / 6);
    var mols = [];
    for (var i = 0; i < count; i++) {
        var vent = Math.floor(Math.random() * 6);
        var ventX = T.LEFT + 12 + vent * ventSpacing;
        var mol = new ADEPT.ADC(
            ventX + (Math.random() - 0.5) * 4,
            T.BOTTOM - 12,
            1.0 + charge * 0.5
        );
        mol.payloadRemaining = ADEPT.Balance.adc_payload;
        mol.vx = (Math.random() - 0.5) * 1;
        mol.vy = -(1.5 + Math.random() * 2);
        mols.push(mol);
    }
    this.queueSpawns(mols);
};
