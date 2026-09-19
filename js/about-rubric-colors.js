document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.about-pillar-expanded ul, .about-pillar-collapsed ul').forEach(list => {
        const items = [...list.querySelectorAll(':scope > li')];
        const scoreEntries = items.map(item => {
            const scoreElement = [...item.querySelectorAll('span')]
                .find(span => /[+-]?\d+(?:\.\d+)?\s*points?/i.test(span.textContent));
            const scoreMatch = scoreElement?.textContent.match(/[+-]?\d+(?:\.\d+)?/);
            return { item, scoreElement, score: scoreMatch ? Number(scoreMatch[0]) : NaN };
        });
        const branches = Object.fromEntries(
            scoreEntries
                .filter(entry => Number.isFinite(entry.score))
                .map(entry => [entry.score, true])
        );

        scoreEntries.forEach(({ item, scoreElement, score }) => {
            if (!scoreElement || !Number.isFinite(score)) return;
            const tier = getTierFromCriterionScore(score, branches);
            item.querySelectorAll('span').forEach(span => {
                span.classList.remove('criterion-tier-1', 'criterion-tier-2', 'criterion-tier-3', 'criterion-tier-4', 'criterion-tier-5');
                span.classList.add(`criterion-tier-${tier}`);
            });
        });
    });
});