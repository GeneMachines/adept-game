window.ADEPT = window.ADEPT || {};

ADEPT.PK = {
    HALF_LIFE: {
        chemo_free: 8.0,
        adc_free: 15.0,
        adc_bound_tumor: 40.0,
        adc_bound_cuttlefish: 20.0,
        antibody_enzyme_free: 15.0,
        antibody_enzyme_bound_tumor: 200.0,
        antibody_enzyme_bound_cuttlefish: 10.0,
        prodrug_free: 10.0,
        active_drug_free: 6.0,
    },

    ADC_LEAK_RATE: 0.3,

    updateAll: function(entities, dt, game) {
        for (var i = 0; i < entities.length; i++) {
            var e = entities[i];
            if (!e.alive || !e.isMolecule) continue;
            ADEPT.PK.applyElimination(e, dt);
            if (e.type === 'adc') {
                ADEPT.PK.applyPayloadLeak(e, dt, game);
            }
        }
    },

    applyElimination: function(entity, dt) {
        var key = entity.type + '_free';
        if (entity.bound && entity.boundTo) {
            key = entity.type + '_bound_' + entity.boundTo.type;
        }
        var halfLife = ADEPT.PK.HALF_LIFE[key];
        if (!halfLife) return;

        // Accelerate clearance after tumor is dead so the round ends faster
        var gi = ADEPT.gameInstance;
        if (gi && gi.tumor && !gi.tumor.alive) {
            halfLife = halfLife / 8;
        }

        var kelim = 0.693 / halfLife;
        var pElim = 1 - Math.exp(-kelim * dt);
        if (Math.random() < pElim) {
            if (entity.bound && entity.boundTo && entity.boundTo.removeBoundMolecule) {
                entity.boundTo.removeBoundMolecule(entity);
            }
            entity.alive = false;
        }
    },

    applyPayloadLeak: function(adc, dt, game) {
        if (adc.payloadRemaining <= 0) return;
        var leaked = ADEPT.PK.ADC_LEAK_RATE * dt;
        adc.payloadRemaining = Math.max(0, adc.payloadRemaining - leaked);
        var B = ADEPT.Balance;
        if (adc.boundTo) {
            adc.boundTo.damage(leaked * adc.potency * B.adc_leak_dmg_mult);
        }
        if (Math.random() < leaked * B.adc_leak_spawn_chance && game) {
            var drug = new ADEPT.ActiveDrug(
                adc.x + (Math.random() - 0.5) * 16,
                adc.y + (Math.random() - 0.5) * 16,
                adc.potency * B.adc_leak_drug_potency
            );
            game.addEntity(drug);
        }
    }
};
