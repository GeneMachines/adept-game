
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
            { key: '1', name: 'CHEMO',          desc: 'Floods the tank with toxin',  color: '#ff4040', bg: '#1a0808' },
            { key: '2', name: 'ADC',            desc: 'Antibody-drug conjugate',      color: '#40e040', bg: '#081a08' },
            { key: '3', name: 'ADEPT',          desc: 'Enzyme-prodrug system',        color: '#a040e0', bg: '#10081a' },
            { key: '4', name: 'BOSS LEVEL',     desc: 'Metastatic ADEPT challenge',   color: '#e040c0', bg: '#1a0818' },
        ],
        howToPlay: '[I] HOW TO PLAY',
        hint:      'PRESS 1, 2 OR 3',
    },

    // ── MODE INTRO FLASH CARDS ────────────────────────────────
    // Each mode's narrative crawls in RPG-style typewriter.
    // Plain strings = default gray. { text, color } = emphasis.
    intro: {
        chemo: [
            'THE CROWN OF THORNS THREATENS',
            'THE REEF AND ALL WHO LIVE THERE.',
            'CHEMICAL X CAN DESTROY IT.',
            { text: 'FLOOD THE TANK.', color: '#e0e040' },
        ],
        adc: [
            'CHEMICAL X WAS TOO RECKLESS.',
            'THE ADC CARRIES ITS PAYLOAD',
            'STRAIGHT TO THE INVADER.',
            { text: 'A TARGETED STRIKE.', color: '#e0e040' },
        ],
        adept: [
            'ADEPT IS A TWO-PART STRATEGY.',
            { text: '1/ PRIME THE COT', color: '#e0e040' },
            '(DON\'T WORRY, IT WON\'T HURT',
            'YOUR FRIENDS)',
            { text: '2/ LET THE PRODRUG RIP!', color: '#e0e040' },
        ],
        boss: [
            'THE INVASION HAS BEEN PUSHED BACK.',
            'BUT DEEP IN THE REEF,',
            'THE SOURCE STILL GROWS.',
            { text: 'FINISH IT ONCE AND FOR ALL.', color: '#e0e040' },
        ],
        // Controls shown below narrative text
        controls: {
            default: [
                { text: '[HOLD SPACE] CHARGE', color: '#505060' },
                { text: '[RELEASE] DEPLOY',    color: '#505060' },
            ],
            defaultMobile: [
                { text: 'HOLD BUTTON TO CHARGE', color: '#505060' },
                { text: 'RELEASE TO DEPLOY',     color: '#505060' },
            ],
            adept: [
                { text: '[SPACE] CHARGE + DEPLOY', color: '#505060' },
                { text: '[E] TOGGLE ENZYME / PRODRUG', color: '#a040e0' },
            ],
            adeptMobile: [
                { text: 'HOLD BUTTON TO CHARGE',         color: '#505060' },
                { text: 'TAP ENZYME/PRODRUG TO TOGGLE', color: '#a040e0' },
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

    // ── DID YOU KNOW (educational cards after boss victory) ────
    // Shown in sequence: chemo → ADC → ADEPT, then ENDING plays.
    // Plain strings = default gray. { text, color } = emphasis.
    didYouKnow: {
        header: 'D I D  Y O U  K N O W',
        cards: [
            {
                title: 'SYSTEMIC CHEMO',
                color: '#ff4040',
                facts: [
                    'CHEMOTHERAPY TARGETS UNIVERSAL',
                    'CELLULAR MACHINERY. IT DOES NOT',
                    'DISTINGUISH TUMOUR FROM HEALTHY',
                    'TISSUE.',
                    '',
                    { text: 'TUMOURS HAVE BILLIONS OF CELLS,', color: '#40e0c0' },
                    { text: 'ALL OF WHICH MUST BE ELIMINATED,', color: '#40e0c0' },
                    { text: 'WHILE PROTECTING HEALTHY TISSUE', color: '#40e0c0' },
                    { text: 'FROM EVEN A FRACTION OF THAT', color: '#40e0c0' },
                    { text: 'DAMAGE.', color: '#40e0c0' },
                ],
            },
            {
                title: 'ADC',
                color: '#40e040',
                facts: [
                    'DESPITE TUMOUR-SPECIFIC BINDING,',
                    'LESS THAN 1% OF AN ADC DOSE',
                    'ACTUALLY REACHES THE TUMOUR.',
                    'THE REST IS TURNED OVER IN',
                    'HEALTHY TISSUE.',
                    '',
                    { text: 'ADCS HAVE A SIMILAR TOXICITY', color: '#e0a040' },
                    { text: 'PROFILE TO FREE PAYLOAD \u2014 THEY', color: '#e0a040' },
                    { text: "DON'T REDUCE OFF-TARGET TOXICITY,", color: '#e0a040' },
                    { text: 'ONLY INCREASE EFFICACY.', color: '#e0a040' },
                ],
            },
            {
                title: 'ADEPT',
                color: '#a040e0',
                facts: [
                    'NEITHER THE ANTIBODY-ENZYME NOR',
                    'THE PRODRUG IS TOXIC ALONE. ONLY',
                    'WHEN THEY MEET AT THE TUMOUR IS',
                    'ACTIVE DRUG GENERATED.',
                    '',
                    { text: 'TURNOVER IN HEALTHY TISSUE', color: '#40e0c0' },
                    { text: 'PRODUCES NO TOXICITY. AND BECAUSE', color: '#40e0c0' },
                    { text: 'ENZYMES CONVERT HUNDREDS OF', color: '#40e0c0' },
                    { text: 'MOLECULES PER SECOND, THE DRUG-', color: '#40e0c0' },
                    { text: 'ANTIBODY RATIO IS EFFECTIVELY', color: '#40e0c0' },
                    { text: 'UNCAPPED.', color: '#40e0c0' },
                ],
            },
        ],
    },

    // ── SHARED PROMPTS ────────────────────────────────────────
    prompts: {
        pressAnyKey: 'PRESS ANY KEY',
        back:        '[ESC] BACK',
    },
};
