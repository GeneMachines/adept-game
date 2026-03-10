
window.ADEPT = window.ADEPT || {};

// ════════════════════════════════════════════════════════════════
//  GAME TEXT — Edit this file to change all in-game copy
//
//  Plain strings use the screen's default color.
//  Use { text: '...', color: '#hex' } for colored emphasis.
//
//  Lines render top-to-bottom in array order. Layout adapts
//  automatically — add/remove lines freely.
// ════════════════════════════════════════════════════════════════

ADEPT.Text = {

    // ── TITLE SCREEN ──────────────────────────────────────────
    title: {
        name1:     'CUTTLEFISH',
        name2:     'BIO',
        subtitle:  'A D E P T',
        tagline:   'OUTSMART THE CROWN OF THORNS',
        copyright: '2026 CUTTLEFISH BIO',
    },

    // ── NARRATIVE STORY PAGE (between title & first mode) ─────
    // Text crawls in RPG-style, one character at a time
    narrative: {
        // Gray story text (appears first)
        story: [
            'THE CALM COASTAL WATERS OF',
            'YOUR HOMELAND HAVE BEEN',
            'SHATTERED BY AN INVASION OF',
            'THE DANGEROUS',
        ],
        // Large red enemy name (appears after brief pause)
        enemy: 'CROWN OF THORNS',
        // Teal mission text (appears after second pause)
        mission: [
            'BATTLE THE INVADER WITH ALL THE',
            'TOOLS AT YOUR DISPOSAL!',
        ],
    },

    // ── MODE SELECT MENU ──────────────────────────────────────
    menu: {
        header: 'SELECT MODE',
        modes: [
            { key: '1', name: 'SYSTEMIC CHEMO', desc: 'Floods the tank with toxin',  color: '#ff4040', bg: '#1a0808' },
            { key: '2', name: 'ADC',            desc: 'Antibody-drug conjugate',      color: '#40e040', bg: '#081a08' },
            { key: '3', name: 'ADEPT',          desc: 'Enzyme-prodrug system',        color: '#a040e0', bg: '#10081a' },
        ],
        howToPlay: '[I] HOW TO PLAY',
        hint:      'PRESS 1, 2 OR 3',
    },

    // ── MODE INTRO FLASH CARDS ────────────────────────────────
    // Each mode's narrative crawls in RPG-style typewriter.
    // Plain strings = default gray. { text, color } = emphasis.
    intro: {
        chemo: [
            'YOU DISCOVER THE CROWN OF',
            'THORNS IS WEAK AGAINST',
            'CHEMICAL X',
            { text: 'USE IT TO KILL THE INVADER!', color: '#e0e040' },
        ],
        adc: [
            'CHEMICAL X WAS EFFECTIVE BUT ITS',
            'INDISCRIMINATE KILLING CAME AT A',
            'GREAT COST.',
            { text: 'YOU ADD TARGETING TO CHEMICAL X', color: '#40e0c0' },
            { text: 'AND CREATE AN ADC!', color: '#40e0c0' },
            { text: 'USE THE ADC TO DEFEAT THE INVADER!', color: '#e0e040' },
        ],
        adept: [
            'THE ADC DID THE JOB BUT IT',
            'STILL LEFT THE LOCALS IN A SICKENED STATE.',
            { text: 'IN ONE FINAL ATTEMPT YOU SPLIT', color: '#40e0c0' },
            { text: 'TARGETING FROM PAYLOAD TO CREATE ADEPT.', color: '#40e0c0' },
            { text: 'USE ADEPT TO DEFEAT THE INVADER ONCE AND FOR ALL!', color: '#e0e040' },
        ],
        // Controls shown below narrative text
        controls: {
            default: [
                { text: '[HOLD SPACE] CHARGE', color: '#505060' },
                { text: '[RELEASE] DEPLOY',    color: '#505060' },
            ],
            adept: [
                { text: '[SPACE] CHARGE ANTIBODY-ENZYME', color: '#a040e0' },
                { text: 'WAIT FOR OFF-TARGET TO CLEAR',   color: '#e0a040' },
                { text: '[SPACE] CHARGE PRODRUG',          color: '#ff4040' },
            ],
        },
    },

    // ── GAMEPLAY HUD ──────────────────────────────────────────
    hud: {
        dose:        'DOSE',
        cuttlefish:  'CUTTLEFISH',
        charging:    'CHARGING...',
        metastasis:  'METASTASIS!',
        // ADEPT phase prompts
        phase1:        '[SPACE] DEPLOY AB-ENZYME',
        phase2:        'CLEARING...',
        phase2prodrug: '[SPACE] PRODRUG',
        phase2enzyme:  '[E] MORE ENZYME',
        phase4:        'PRODRUG ACTIVE [SPACE] MORE',
        // Non-ADEPT modes
        instruction:   '[HOLD SPACE] CHARGE  [RELEASE] DEPLOY',
    },

    // ── RESULTS SCREEN ────────────────────────────────────────
    results: {
        header:     'RESULTS',
        cotKilled:  'COT KILLED:',
        cuttlefish: 'CUTTLEFISH:',
        efficiency: 'EFFICIENCY:',
        ti:         'THERAPEUTIC INDEX:',
        total:      'TOTAL:',
        newHigh:    'NEW HIGH SCORE!',
        highScore:  'HIGH SCORE:',
        perfect:    'PERFECT!',
        survived:   'CROWN OF THORNS SURVIVED...',
        retry:      '[R] RETRY',
        next:       '[N] NEXT',
        menu:       '[M] MENU',
    },

    // ── GAME OVER ─────────────────────────────────────────────
    gameOver: {
        title:  'GAME OVER',
        flavor: 'ALL CUTTLEFISH LOST',
    },

    // ── HOW TO PLAY ───────────────────────────────────────────
    howToPlay: {
        header: 'H O W   T O   P L A Y',
        controls: [
            { text: '[HOLD SPACE] CHARGE DOSE',    color: '#e0e040' },
            { text: '[RELEASE] DEPLOY INTO TANK',  color: '#e0e040' },
            { text: 'LONGER CHARGE = BIGGER DOSE', color: '#808090' },
        ],
        adeptTitle: 'ADEPT MODE',
        adeptSteps: [
            { text: '1. [SPACE] DEPLOY AB-ENZYME',         color: '#a040e0' },
            { text: '2. WAIT FOR OFF-TARGET CLEARING',     color: '#e0a040' },
            { text: '3. [SPACE] DEPLOY PRODRUG',           color: '#ff4040' },
            { text: '[E] ADD MORE ENZYME',                 color: '#808090' },
        ],
        goalTitle: 'GOAL',
        goals: [
            'KILL THE CROWN OF THORNS',
            'PROTECT YOUR CUTTLEFISH',
        ],
    },

    // ── STORY ENDING (after ADEPT mode completes) ───────────
    ending: {
        // Gray poetic text (appears first)
        verse: [
            'WITH PRECISION AND PATIENCE',
            'BALANCE IS RESTORED.',
            'THE CROWN OF THORNS FELL,',
            'AND THE REEF BREATHES AGAIN.',
        ],
        // Teal hopeful text (appears after pause)
        hope: [
            'WHERE BRUTE FORCE FAILED,',
            'ADEPT-ABILITY PREVAILED!',
        ],
        // Yellow closing (appears after second pause)
        closing: 'THE HOMELAND IS SAVED.',
    },

    // ── RESULTS INFO (per-mode educational facts) ─────────────
    // Press [I] on results screen to view.
    // Plain strings = default gray. { text, color } = emphasis.
    // 'refs' array = literature references shown at bottom.
    resultsInfo: {
        chemo: {
            title: 'SYSTEMIC CHEMO',
            color: '#ff4040',
            facts: [
                'CHEMO TARGETS UNIVERSAL CELLULAR',
                'MACHINERY AND RELIES ON',
                'TUMOUR-SPECIFIC SENSITIVITY',
                'FOR SELECTIVE EFFECT.',
                '',
                { text: 'TUMOURS CAN CONTAIN BILLIONS', color: '#40e0c0' },
                { text: 'OF CELLS, REQUIRING THE', color: '#40e0c0' },
                { text: 'DESTRUCTION OF 99.9999999999%', color: '#40e0c0' },
                { text: 'OF THEM.', color: '#40e0c0' },
                '',
                { text: 'HOWEVER, EVEN A 90% KILL IN A', color: '#e0a040' },
                { text: 'HEALTHY ORGAN WOULD BE FATAL.', color: '#e0a040' },
            ],
            refs: [
                'LETAI AND DE THE, NAT. REV.',
                'CANCER 25, 209-218 (2025)',
            ],
        },
        adc: {
            title: 'ADC',
            color: '#40e040',
            facts: [
                'ANTIBODY-DRUG CONJUGATES LINK A',
                'CYTOTOXIC PAYLOAD TO A TARGETING',
                'ANTIBODY VIA A CHEMICAL LINKER.',
                '',
                { text: 'LESS THAN 1% OF THE INITIAL', color: '#40e0c0' },
                { text: 'DOSE OF AN ADC ACTUALLY', color: '#40e0c0' },
                { text: 'REACHES THE TUMOUR.', color: '#40e0c0' },
                '',
                { text: 'THE REMAINDER IS TURNED OVER', color: '#e0a040' },
                { text: 'IN HEALTHY TISSUE.', color: '#e0a040' },
            ],
            refs: [
                'PLACEHOLDER REFERENCE 1',
                'PLACEHOLDER REFERENCE 2',
            ],
        },
        adept: {
            title: 'ADEPT',
            color: '#a040e0',
            facts: [
                'BY PRETARGETING THE TUMOUR WITH',
                'AN ANTIBODY-ENZYME FUSION,',
                'HEALTHY TISSUE IS SPARED.',
                '',
                { text: 'ENZYME LOCALISED IN THE TUMOUR', color: '#e0a040' },
                { text: 'ACTIVATES AN OTHERWISE BENIGN', color: '#e0a040' },
                { text: 'PRODRUG, GENERATING PAYLOAD', color: '#e0a040' },
                { text: 'RIGHT WHERE IT\'S NEEDED.', color: '#e0a040' },
                '',
                { text: 'ENZYMES CAN CONVERT 100S OR', color: '#40e0c0' },
                { text: '1000S OF MOLECULES PER SECOND,', color: '#40e0c0' },
                { text: 'SO THE DRUG-ANTIBODY RATIO OF', color: '#40e0c0' },
                { text: 'ADEPT IS EFFECTIVELY UNCAPPED.', color: '#40e0c0' },
            ],
            refs: [
                'PLACEHOLDER REFERENCE 1',
                'PLACEHOLDER REFERENCE 2',
            ],
        },
    },

    // ── SHARED PROMPTS ────────────────────────────────────────
    prompts: {
        pressAnyKey: 'PRESS ANY KEY',
        back:        '[ESC] BACK',
    },
};
