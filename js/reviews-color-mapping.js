/* Reviews page: score tier color and mapping helpers */

const TIER_CLASS_LIST = ['tier-1', 'tier-2', 'tier-3', 'tier-4', 'tier-5'];

function getTierColor(tier) {
    const colorMap = {
        5: '#3A86FF', /* Tier 5: Azure Blue */
        4: '#8338EC', /* Tier 4: Blue Violet */
        3: '#FF006E', /* Tier 3: Neon Pink */
        2: '#FB5607', /* Tier 2: Blaze Orange */
        1: '#FFBE0B'  /* Tier 1: Amber Gold */
    };

    return colorMap[tier] || 'inherit';
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

    if (totalScore >= 91) return 5;
    if (totalScore >= 81 && totalScore <= 90) return 4;
    if (totalScore >= 71 && totalScore <= 80) return 3;
    if (totalScore >= 61 && totalScore <= 70) return 2;
    if (totalScore <= 60) return 1;

    return null;
}
