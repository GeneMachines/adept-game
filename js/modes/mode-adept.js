window.ADEPT = window.ADEPT || {};

ADEPT.ModeADEPT = function(stage) {
    ADEPT.ModeBase.call(this, {
        name: 'ADEPT',
        description: 'Two-phase pretargeting. Phase 1: deploy antibody-enzyme conjugates that stick to the crown of thorns. Wait for off-target enzymes to clear. Phase 2: deploy harmless prodrug that only activates at the enzyme.',
        maxMolecules: 30,
        cuttlefishCount: 5,
        tumorHp: 100,
        stage: stage || 1,
    });
    this.phase = 1; // 1=deploy AE, 2=waiting/ready for prodrug, 4=prodrug deployed
    this.prodrugMax = 50;
    this.aeDoses = 0;
    this.maxAEDoses = 3; // allow multiple AB-enzyme deployments
};

ADEPT.ModeADEPT.prototype = Object.create(ADEPT.ModeBase.prototype);
ADEPT.ModeADEPT.prototype.constructor = ADEPT.ModeADEPT;

ADEPT.ModeADEPT.prototype.update = function(dt, game) {
    ADEPT.ModeBase.prototype.update.call(this, dt, game);

    if (this.phase === 1) {
        // Phase 1: deploy AB-enzyme (can do multiple doses)
        game.input.consumePhase2(); // clear stale enzyme toggle
        if (game.input.consumeProdrugToggle() && this.aeDoses > 0) {
            // Toggle back to prodrug mode
            this.phase = 2;
            if (ADEPT.Sound) ADEPT.Sound.play('phaseToggle');
        } else if (game.input.chargeReleased) {
            var charge = game.input.consumeCharge();
            if (charge > 0.05) {
                this.deployAntibodyEnzyme(charge, game);
                this.dosesUsed++;
                this.aeDoses++;
                this.dosed = true;
                if (ADEPT.Sound) ADEPT.Sound.play('deploy');
                // After first dose, switch to phase 2 (but can still deploy more AE via toggle)
                this.phase = 2;
            }
        }
    } else if (this.phase === 2) {
        // Waiting/ready phase — player can deploy prodrug OR toggle back to enzyme
        game.input.consumeProdrugToggle(); // clear stale prodrug toggle
        if (game.input.consumePhase2() && this.aeDoses < this.maxAEDoses) {
            // Toggle to enzyme mode for another AB-enzyme dose
            this.phase = 1;
            if (ADEPT.Sound) ADEPT.Sound.play('phaseToggle');
        } else if (game.input.chargeReleased) {
            var charge = game.input.consumeCharge();
            if (charge > 0.05) {
                this.deployProdrug(charge, game);
                this.dosesUsed++;
                this.phase = 4;
                if (ADEPT.Sound) ADEPT.Sound.play('deploy');
            }
        }
    } else if (this.phase === 4) {
        // Can deploy more prodrug (locked out of enzyme)
        game.input.consumePhase2(); // clear stale
        game.input.consumeProdrugToggle(); // clear stale
        if (game.input.chargeReleased) {
            var charge = game.input.consumeCharge();
            if (charge > 0.05) {
                this.deployProdrug(charge, game);
                this.dosesUsed++;
                if (ADEPT.Sound) ADEPT.Sound.play('deploy');
            }
        }
    }
};

ADEPT.ModeADEPT.prototype.deployAntibodyEnzyme = function(charge, game) {
    var cfg = ADEPT.ModeConfigs.adept;
    var count = Math.max(1, Math.floor(charge * cfg.maxMolecules));
    var T = ADEPT.Config.TANK;

    var ventSpacing = Math.floor((T.RIGHT - T.LEFT - 20) / 6);
    var mols = [];
    for (var i = 0; i < count; i++) {
        var vent = Math.floor(Math.random() * 6);
        var ventX = T.LEFT + 12 + vent * ventSpacing;
        var mol = new ADEPT.AntibodyEnzyme(
            ventX + (Math.random() - 0.5) * 4,
            T.BOTTOM - 12
        );
        mol.vx = (Math.random() - 0.5) * 1;
        mol.vy = -(1.5 + Math.random() * 2);
        mols.push(mol);
    }
    this.queueSpawns(mols);
};

ADEPT.ModeADEPT.prototype.deployProdrug = function(charge, game) {
    var cfg = ADEPT.ModeConfigs.adept;
    var count = Math.max(1, Math.floor(charge * cfg.prodrugMax));
    var T = ADEPT.Config.TANK;

    var ventSpacing = Math.floor((T.RIGHT - T.LEFT - 20) / 6);
    var mols = [];
    for (var i = 0; i < count; i++) {
        var vent = Math.floor(Math.random() * 6);
        var ventX = T.LEFT + 12 + vent * ventSpacing;
        var mol = new ADEPT.Prodrug(
            ventX + (Math.random() - 0.5) * 4,
            T.BOTTOM - 12
        );
        mol.vx = (Math.random() - 0.5) * 1;
        mol.vy = -(1.5 + Math.random() * 2);
        mols.push(mol);
    }
    this.queueSpawns(mols);
};

ADEPT.ModeADEPT.prototype.getOffTargetCount = function(game) {
    var count = 0;
    for (var i = 0; i < game.entities.length; i++) {
        var e = game.entities[i];
        if (e.type === 'antibody_enzyme' && e.bound && e.boundTo && e.boundTo.type === 'cuttlefish' && e.alive) {
            count++;
        }
    }
    return count;
};
