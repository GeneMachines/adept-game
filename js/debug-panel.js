window.ADEPT = window.ADEPT || {};

// Balance defaults — entity files read from here so the panel can tweak them live
// Balance defaults — tuned to reflect real biologic relationships.
// Chemo: non-selective, damages everything equally.
// ADC: preferential tumor binding (~85%), payload delivered via linker cleavage.
// ADEPT: enzyme binds tumor (~92%), prodrug only activates near enzyme.
ADEPT.Balance = {
    chemo_tumor_mult: 3.5,          // chemo potency vs tumor
    chemo_cuttlefish_mult: 4.0,     // chemo potency vs healthy cells (slightly higher — less resistant)
    chemo_cooldown: 0.3,
    active_tumor_mult: 5.0,         // activated drug is concentrated, potent at target
    active_cuttlefish_mult: 4.0,    // same drug if it drifts off-target
    adc_tumor_bind: 0.85,           // ADC tumor binding affinity (clinical ~Kd 1-10nM)
    ae_tumor_bind: 0.92,            // AE tumor binding (high affinity, pretargeted)
    adc_payload: 4,                 // DAR (drug-antibody ratio, clinical range 2-8)
    adc_leak_dmg_mult: 0.5,        // payload leak damage multiplier
    adc_leak_spawn_chance: 2,       // chance of leaked drug spawning free
    adc_leak_drug_potency: 0.8,    // leaked drug is slightly less potent
    prodrug_potency: 1.2,           // prodrug activation yields concentrated drug
    ae_catalytic_radius: 14,        // enzyme catalytic radius (slightly larger for gameplay)
    pinocytosis_rate: 0.15,         // uptake prob/sec for free antibodies near cuttlefish
    pinocytosis_dmg_mult: 1.5,      // damage mult for internalized ADC payload
};

// Mode configs — mode files read maxMolecules etc from here
ADEPT.ModeConfigs = {
    chemo: { maxMolecules: 120, tumorHp: 80 },
    adc: { maxMolecules: 30, tumorHp: 100 },
    adept: { maxMolecules: 60, prodrugMax: 100, tumorHp: 100 },
};

ADEPT.DebugPanel = {
    visible: false,
    el: null,

    toggle: function() {
        this.visible = !this.visible;
        if (!this.el) this.build();
        this.el.style.display = this.visible ? 'block' : 'none';
        if (this.visible) this.refresh();
    },

    build: function() {
        var panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.style.cssText = 'position:fixed;top:0;right:0;width:280px;height:100vh;overflow-y:auto;' +
            'background:rgba(10,10,30,0.92);color:#a0ffa0;font-family:"Press Start 2P",monospace;' +
            'font-size:7px;padding:8px;z-index:9999;display:none;line-height:1.8;' +
            'border-left:2px solid #40e040;box-sizing:border-box;';
        panel.innerHTML = '<div style="font-size:9px;color:#40e040;margin-bottom:6px;">BETA PANEL [D]</div>';

        // PK Half-Lives
        this.addSection(panel, 'PK HALF-LIVES', [
            { label: 'Chemo free', obj: ADEPT.PK.HALF_LIFE, key: 'chemo_free' },
            { label: 'ADC free', obj: ADEPT.PK.HALF_LIFE, key: 'adc_free' },
            { label: 'ADC bound tumor', obj: ADEPT.PK.HALF_LIFE, key: 'adc_bound_tumor' },
            { label: 'ADC bound cuttle', obj: ADEPT.PK.HALF_LIFE, key: 'adc_bound_cuttlefish' },
            { label: 'AE free', obj: ADEPT.PK.HALF_LIFE, key: 'antibody_enzyme_free' },
            { label: 'AE bound tumor', obj: ADEPT.PK.HALF_LIFE, key: 'antibody_enzyme_bound_tumor' },
            { label: 'AE bound cuttle', obj: ADEPT.PK.HALF_LIFE, key: 'antibody_enzyme_bound_cuttlefish' },
            { label: 'Prodrug free', obj: ADEPT.PK.HALF_LIFE, key: 'prodrug_free' },
            { label: 'Active drug free', obj: ADEPT.PK.HALF_LIFE, key: 'active_drug_free' },
            { label: 'ADC leak rate', obj: ADEPT.PK, key: 'ADC_LEAK_RATE' },
        ]);

        // Physics
        this.addSection(panel, 'DIFFUSION', [
            { label: 'Chemo', obj: ADEPT.Physics.DIFFUSION, key: 'chemo' },
            { label: 'ADC', obj: ADEPT.Physics.DIFFUSION, key: 'adc' },
            { label: 'AE', obj: ADEPT.Physics.DIFFUSION, key: 'antibody_enzyme' },
            { label: 'Prodrug', obj: ADEPT.Physics.DIFFUSION, key: 'prodrug' },
            { label: 'Active drug', obj: ADEPT.Physics.DIFFUSION, key: 'active_drug' },
        ]);

        this.addSection(panel, 'DRAG', [
            { label: 'Chemo', obj: ADEPT.Physics.DRAG, key: 'chemo' },
            { label: 'ADC', obj: ADEPT.Physics.DRAG, key: 'adc' },
            { label: 'AE', obj: ADEPT.Physics.DRAG, key: 'antibody_enzyme' },
            { label: 'Prodrug', obj: ADEPT.Physics.DRAG, key: 'prodrug' },
            { label: 'Active drug', obj: ADEPT.Physics.DRAG, key: 'active_drug' },
        ]);

        // Damage & Binding
        this.addSection(panel, 'DAMAGE & BINDING', [
            { label: 'Chemo→tumor mult', obj: ADEPT.Balance, key: 'chemo_tumor_mult' },
            { label: 'Chemo→cuttlefish mult', obj: ADEPT.Balance, key: 'chemo_cuttlefish_mult' },
            { label: 'Chemo cooldown', obj: ADEPT.Balance, key: 'chemo_cooldown' },
            { label: 'Drug→tumor mult', obj: ADEPT.Balance, key: 'active_tumor_mult' },
            { label: 'Drug→cuttlefish mult', obj: ADEPT.Balance, key: 'active_cuttlefish_mult' },
            { label: 'ADC bind tumor %', obj: ADEPT.Balance, key: 'adc_tumor_bind' },
            { label: 'AE bind tumor %', obj: ADEPT.Balance, key: 'ae_tumor_bind' },
            { label: 'ADC payload', obj: ADEPT.Balance, key: 'adc_payload' },
            { label: 'ADC leak dmg mult', obj: ADEPT.Balance, key: 'adc_leak_dmg_mult' },
            { label: 'ADC leak spawn %', obj: ADEPT.Balance, key: 'adc_leak_spawn_chance' },
            { label: 'ADC leak drug pot', obj: ADEPT.Balance, key: 'adc_leak_drug_potency' },
            { label: 'Prodrug potency', obj: ADEPT.Balance, key: 'prodrug_potency' },
            { label: 'AE catalytic R', obj: ADEPT.Balance, key: 'ae_catalytic_radius' },
        ]);

        // Mode configs
        this.addSection(panel, 'MODE: CHEMO', [
            { label: 'Max molecules', obj: ADEPT.ModeConfigs.chemo, key: 'maxMolecules' },
            { label: 'Tumor HP', obj: ADEPT.ModeConfigs.chemo, key: 'tumorHp' },
        ]);

        this.addSection(panel, 'MODE: ADC', [
            { label: 'Max molecules', obj: ADEPT.ModeConfigs.adc, key: 'maxMolecules' },
            { label: 'Tumor HP', obj: ADEPT.ModeConfigs.adc, key: 'tumorHp' },
        ]);

        this.addSection(panel, 'MODE: ADEPT', [
            { label: 'Max AE molecules', obj: ADEPT.ModeConfigs.adept, key: 'maxMolecules' },
            { label: 'Max prodrug', obj: ADEPT.ModeConfigs.adept, key: 'prodrugMax' },
            { label: 'Tumor HP', obj: ADEPT.ModeConfigs.adept, key: 'tumorHp' },
        ]);

        document.body.appendChild(panel);
        this.el = panel;
    },

    addSection: function(panel, title, fields) {
        var sec = document.createElement('div');
        sec.style.cssText = 'margin:6px 0;';
        var header = document.createElement('div');
        header.style.cssText = 'color:#e0e040;font-size:7px;margin:4px 0 2px;cursor:pointer;';
        header.textContent = '▸ ' + title;
        var body = document.createElement('div');
        body.style.cssText = 'display:none;padding-left:4px;';
        header.onclick = function() {
            var open = body.style.display !== 'none';
            body.style.display = open ? 'none' : 'block';
            header.textContent = (open ? '▸ ' : '▾ ') + title;
        };
        sec.appendChild(header);

        for (var i = 0; i < fields.length; i++) {
            var f = fields[i];
            var row = document.createElement('div');
            row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin:1px 0;';
            var lbl = document.createElement('span');
            lbl.textContent = f.label;
            var inp = document.createElement('input');
            inp.type = 'number';
            inp.step = '0.1';
            inp.value = f.obj[f.key];
            inp.style.cssText = 'width:60px;background:#1a1a30;color:#a0ffa0;border:1px solid #306030;' +
                'font-family:"Press Start 2P",monospace;font-size:7px;padding:2px 3px;text-align:right;';
            inp.dataset.obj = ''; // we'll use closure
            (function(obj, key, input) {
                input.oninput = function() {
                    var v = parseFloat(input.value);
                    if (!isNaN(v)) obj[key] = v;
                };
            })(f.obj, f.key, inp);
            row.appendChild(lbl);
            row.appendChild(inp);
            body.appendChild(row);
        }

        sec.appendChild(body);
        panel.appendChild(sec);
    },

    refresh: function() {
        // Re-read values into inputs on panel open
        if (!this.el) return;
        var inputs = this.el.querySelectorAll('input[type="number"]');
        // Inputs are in order of fields added, but simpler to just rebuild
        // For now, the oninput handlers keep things in sync
    },
};

// D key toggle
window.addEventListener('keydown', function(e) {
    if (e.code === 'KeyD' && !e.repeat) {
        ADEPT.DebugPanel.toggle();
    }
});
