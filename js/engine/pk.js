window.ADEPT = window.ADEPT || {};

ADEPT.PK = {
    // Half-lives in game-seconds. Ratios reflect real PK:
    // Small molecules (chemo, prodrug, active drug) clear 2-3x faster than
    // large proteins (ADC, AE). Tumor-bound persists >> free >> off-target bound.
    // AE-tumor binding is extremely stable (ADEPT's key advantage).
    HALF_LIFE: {
        chemo_free: 6.0,                       // small molecule, clears fast
        adc_free: 20.0,                        // large protein, persists longer
        adc_bound_tumor: 60.0,                 // internalized, very stable
        adc_bound_cuttlefish: 12.0,            // off-target, detaches faster
        antibody_enzyme_free: 20.0,            // large protein like ADC
        antibody_enzyme_bound_tumor: 300.0,    // extremely stable (pretargeting advantage)
        antibody_enzyme_bound_cuttlefish: 8.0, // off-target clears fast (clearance phase)
        prodrug_free: 8.0,                     // small molecule prodrug
        active_drug_free: 4.0,                 // small active drug, clears fastest
    },

    ADC_LEAK_RATE: 0.25,                       // linker cleavage rate (DAR ~4)

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

        // Accelerate clearance after ALL tumors are dead so the round ends faster
        var gi = ADEPT.gameInstance;
        if (gi && gi.allTumorsDead()) {
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
