
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
            'GREAT COST TO THE LOCALS.',
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
            'THE BALANCE IS RESTORED.',
            'THE CROWN OF THORNS FELL,',
            'AND THE REEF BREATHES AGAIN.',
        ],
        // Teal hopeful text (appears after pause)
        hope: [
            'WHERE BRUTE FORCE FAILED,',
            'INGENUITY PREVAILED.',
        ],
        // Yellow closing (appears after second pause)
        closing: 'THE HOMELAND IS SAVED.',
    },

    // ── SHARED PROMPTS ────────────────────────────────────────
    prompts: {
        pressAnyKey: 'PRESS ANY KEY',
        back:        '[ESC] BACK',
    },
};
