window.ADEPT = window.ADEPT || {};

ADEPT.Scoring = {
    calculate: function(tumorKilled, cuttlefishAlive, totalCuttlefish, dosesUsed, roundTime) {
        var tumorScore = tumorKilled ? 500 : 0;
        var cuttleScore = cuttlefishAlive * 100;
        var maxDoses = 5;
        var efficiencyRatio = Math.max(0, 1 - (dosesUsed / maxDoses) * 0.5);
        var timeBonus = Math.max(0, Math.floor(100 - roundTime));
        var efficiencyScore = Math.floor(efficiencyRatio * 100 + timeBonus);
        var score = tumorScore + cuttleScore + efficiencyScore;

        // Therapeutic index: targeting precision (0-100%)
        // Measures how well you killed the target without harming healthy cells
        var therapeuticIndex = 0;
        if (tumorKilled) {
            therapeuticIndex = Math.round((cuttlefishAlive / totalCuttlefish) * 100);
        }

        var stars = 0;
        if (!tumorKilled) {
            stars = 0;
        } else if (cuttlefishAlive === totalCuttlefish) {
            stars = 3;
        } else if (cuttlefishAlive >= totalCuttlefish - 1) {
            stars = 2;
        } else if (cuttlefishAlive >= 1) {
            stars = 1;
        } else {
            stars = 0;
        }

        return {
            score: score,
            stars: stars,
            tumorScore: tumorScore,
            cuttleScore: cuttleScore,
            efficiencyScore: efficiencyScore,
            therapeuticIndex: therapeuticIndex,
            tumorKilled: tumorKilled,
            cuttlefishAlive: cuttlefishAlive,
            totalCuttlefish: totalCuttlefish,
        };
    },

    getHighScore: function(modeKey, stage) {
        try {
            var key = 'adept_highscore_' + modeKey + '_s' + stage;
            return parseInt(localStorage.getItem(key)) || 0;
        } catch (e) {
            return 0;
        }
    },

    saveHighScore: function(modeKey, stage, score) {
        try {
            var key = 'adept_highscore_' + modeKey + '_s' + stage;
            var old = parseInt(localStorage.getItem(key)) || 0;
            if (score > old) {
                localStorage.setItem(key, String(score));
                return true; // new high score
            }
        } catch (e) {}
        return false;
    }
};
