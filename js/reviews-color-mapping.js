/* Reviews page: score tier color and mapping helpers */

const TIER_CLASS_LIST = ['tier-1', 'tier-2', 'tier-3', 'tier-4', 'tier-5'];

function getTierColor(tier) {
    const colorMap = {
        5: '--score-gold',
        4: '--score-orange',
        3: '--score-purple',
        2: '--score-blue',
        1: '--score-brown'
    };

    return colorMap[tier]
        ? getComputedStyle(document.documentElement).getPropertyValue(colorMap[tier]).trim()
        : 'inherit';
}

function getTierFromStatValue(statIndex, statValue) {
    if (!Number.isFinite(statValue)) return null;

    /* Values (0) and Ethics (1): /25 scale */
    if (statIndex === 0 || statIndex === 1) {
        if (statValue === 25) return 5;
        if (statValue >= 20 && statValue <= 24) return 4;
        if (statValue >= 15 && statValue <= 19) return 3;
        if (statValue >= 10 && statValue <= 14) return 2;
        return 1;
    }

    /* Gameplay (2) and Accessibility (3): /10 scale */
    if (statIndex === 2 || statIndex === 3) {
        if (statValue === 10) return 5;
        if (statValue >= 8 && statValue <= 9) return 4;
        if (statValue >= 6 && statValue <= 7) return 3;
        if (statValue >= 4 && statValue <= 5) return 2;
        return 1;
    }

    /* Standards (4): /30 scale */
    if (statIndex === 4) {
        if (statValue === 30) return 5;
        if (statValue >= 24 && statValue <= 29) return 4;
        if (statValue >= 18 && statValue <= 23) return 3;
        if (statValue >= 12 && statValue <= 17) return 2;
        return 1;
    }

    return null;
}

function getTierFromTotalScore(totalScore) {
    if (!Number.isFinite(totalScore)) return null;

    if (totalScore >= 95) return 5;
    if (totalScore >= 85) return 4;
    if (totalScore >= 75) return 3;
    if (totalScore >= 41) return 2;
    if (totalScore < 41) return 1;

    return null;
}

function getTierFromPercent(percent) {
    if (!Number.isFinite(percent)) return 1;
    if (percent >= 100) return 5;
    if (percent >= 80) return 4;
    if (percent >= 60) return 3;
    if (percent >= 40) return 2;
    return 1;
}

function getTierFromCriterionScore(score, branches) {
    const scores = Object.keys(branches || {})
        .map(Number)
        .filter(Number.isFinite)
        .sort((firstScore, secondScore) => firstScore - secondScore);
    const uniqueScores = scores.filter((value, index) => index === 0 || value !== scores[index - 1]);
    const scoreIndex = uniqueScores.indexOf(Number(score));

    if (scoreIndex < 0 || uniqueScores.length === 0) return 1;
    if (uniqueScores.length === 1 || scoreIndex === uniqueScores.length - 1) return 5;
    if (scoreIndex === 0) return Number(score) > 0 ? 4 : 1;

    const rankFromHighest = uniqueScores.length - 1 - scoreIndex;
    return Math.max(2, 5 - rankFromHighest);
}
