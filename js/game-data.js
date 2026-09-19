/* Game page data from JSON with optional URL parameter overrides. */

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const defaultDataPath = 'json/metroidvania_games_v1.06.json';
    const fallbackImagePath = 'img/vegas_logo.png';

    function withJsonCacheBust(path) {
        const separator = String(path).includes('?') ? '&' : '?';
        return `${path}${separator}v=${Date.now()}`;
    }

    const pillarSelectors = {
        values: '.about-grid .acronym-block:nth-of-type(1) .pillar-content',
        ethics: '.about-grid .acronym-block:nth-of-type(2) .pillar-content',
        gameplay: '.about-grid .acronym-block:nth-of-type(3) .pillar-content',
        accessibility: '.about-grid .acronym-block:nth-of-type(4) .pillar-content',
        standards: '.about-grid .acronym-block:nth-of-type(5) .pillar-content'
    };
    const pillarMaxByKey = {
        pointsV: 25,
        pointsE: 25,
        pointsG: 10,
        pointsA: 10,
        pointsS: 30
    };
    const benchmarkCriteria = {
        values: {
            'Launch retail price (USD)': {
                5: { label: 'Budget Kings', className: 'bonus points-p5', description: 'Games launched with love and soul, not greed and pipe dreams. These games cost less than the average price of similar games released the same year.', points: '+5 points' },
                3: { label: 'Take My Money', className: 'bonus points-p3', description: 'Games that came out strong but totally worth every penny. These games came out at the average price point of other similar games released that year.', points: '+3 points' },
                '-5': { label: 'Greed Tax', className: 'penalty points-m5', description: 'Games that came out costing a pretty penny without really anything interesting to show. More expensive than other similar games released that year.', points: '-5 points' },
                '-20': { label: 'Whale Fishing', className: 'penalty points-m20', description: 'Games that came out over priced, either deserved or not, but way out of line with other games release the same year.', points: '-20 points' }
            },
            'Early access/demo price': {
                5: { label: 'Free Deals', className: 'bonus points-p5', description: "Games that came out with a free demo or an open beta or an early access. They didn't have to do it, yet they still did it, and for free.", points: '+5 points' },
                0: { label: 'Beta Cover Charge', className: 'neutral points-0', description: 'Games that came out with a paid beta under $20. Not generous, not outrageous, just an early look with a small cover charge.', points: '0 points' },
                '-3': { label: 'Semi Greedy Hype', className: 'penalty points-m3', description: 'Games that came out with a demo or an early access version (non multi player game), but at a price. Even before launch the game studio wanted your money.', points: '-3 points' },
                '-20': { label: 'The Nerve', className: 'penalty points-m20', description: 'Games with an early access version that IS multiplayer, giving a headstart to only players who fork out MORE of their cash! SHAME on the developer!', points: '-20 points' }
            },
            'Microtransactions at launch': {
                5: { label: 'Clean slate', className: 'bonus points-p5', description: 'Games that came out with ZERO microtransactions. The game was the retail price with no additional costs.', points: '+5 points' },
                0: { label: 'Minor MTX', className: 'bonus points-0', description: 'Games that came out with some microtransactions, but no individual MTX exceeds $5.', points: '0 points' },
                '-3': { label: 'Moderate MTX', className: 'penalty points-m3', description: 'Games that came out with some microtransactions, but no individual MTX exceeds $20.', points: '-3 points' },
                '-10': { label: 'Extreme MTX', className: 'penalty points-m10', description: 'Games that came out with microtransactions that cost more than $50. Scandalous!', points: '-10 points' }
            },
            'Loot boxes/random rewards': {
                5: { label: 'No Gamble Boxes', className: 'bonus points-p5', description: 'Games that came out with ZERO loot boxes or random rewards purchasable with real money. No slot-machine nonsense hiding inside the purchase.', points: '+5 points' },
                0: { label: 'Transparent Trinkets', className: 'neutral points-0', description: 'Games with cosmetic-only random rewards, transparent odds, and a single tradeable safety-currency. Still random, but at least the rules are on the table.', points: '0 points' },
                '-5': { label: 'Casino Lite', className: 'penalty points-m5', description: 'Games with casino-like random mechanics using a single tradeable currency system. One layer of funny money is already one layer too many.', points: '-5 points' },
                '-10': { label: 'Currency Maze', className: 'penalty points-m10', description: 'Games with casino-like random mechanics using multiple tradeable currency systems. Confusing by design, expensive by outcome.', points: '-10 points' }
            },
            'Battle pass/subscription model': {
                5: { label: "Don't want no sub", className: 'bonus points-p5', description: 'Games that came out with ZERO subscription or recurring cost of any kind. The game was bought once with no other fees.', points: '+5 points' },
                0: { label: 'Cosmetic Pass', className: 'bonus points-0', description: 'Games with a cosmetic-only, single-tier pass with no gameplay benefits.', points: '0 points' },
                '-5': { label: 'Premium Pass', className: 'penalty points-m5', description: 'Games that came out with a premium, multi-tier battle pass or season pass that includes gameplay benefits.', points: '-5 points' }
            },
            'In-game advertisements': {
                0: { label: 'No Billboard Nonsense', className: 'neutral points-0', description: 'Games that came out with no in-game advertisement screens, popups, or flashing menu bait. Nothing extra earned, but nothing annoying shoved in your face either.', points: '0 points' },
                '-3': { label: 'Ad Bait', className: 'penalty points-m3', description: 'Games that came out with optional ads for minor rewards or temporarily flashing/highlighted menus. Technically optional, still tacky.', points: '-3 points' },
                '-5': { label: 'Billboard Tax', className: 'penalty points-m5', description: 'Games that came out with forced ads or disruptive ad placements, including persistent flashing/highlighted elements. You paid for a game, not a billboard.', points: '-5 points' }
            }
        },
        ethics: {
            'Announcement lead time': {
                5: { label: 'Perfect Marketing', className: 'bonus points-p5', description: 'Games that came out within 18 months of initial announcement with no fake promises, with multiple trailers and no push backed dates. They were organized enough to avoid the infamous "crunch-time" and delivered on time! Major Kudos!.', points: '+5 points' },
                0: { label: 'Long Announcement', className: 'neutral points-0', description: 'Games that came out between 18 and 24 months of initial announcement. Extended marketing window but manageable hype.', points: '0 points' },
                '-10': { label: 'Extended Pipe-dream', className: 'penalty points-m10', description: 'Games that came out more than 24 months after announcement! This is just terrible marketing that tests player patience far too long.', points: '-10 points' }
            },
            'Post-launch support duration': {
                10: { label: 'Iron Man', className: 'bonus points-p10', description: 'Games that came out and received FREE continued support and content updates for over 2 years after initial launch. This was a labor of love from the devs recognized by the players.', points: '+10 points' },
                5: { label: 'Solid Support', className: 'bonus points-p5', description: 'Games that came out and received FREE continued support for between 1 and 2 years after initial launch. A solid commitment to the community.', points: '+5 points' },
                '-10': { label: 'Abandoned', className: 'penalty points-m10', description: 'Games that came out with support lasting less than 1 year after launch, then left to stagnate. Disappointing given how quickly they moved on.', points: '-10 points' }
            },
            'Advertised feature delivery at launch': {
                10: { label: 'Feats First', className: 'bonus points-p10', description: 'Games that came out all the features mentioned during the marketing period prior to launch. Nothing was cut from the release.', points: '+10 points' },
                5: { label: 'Feats First', className: 'bonus points-p5', description: 'Games that came out with advertised launch features present. Nothing important was cut from the release.', points: '+5 points' },
                '-3': { label: 'Wait a minute...', className: 'penalty points-m3', description: 'Games that came out with at least 1 missing feature without comment or clarification.', points: '-3 points' },
                '-10': { label: 'Rip Off', className: 'penalty points-m10', description: 'Games that came out with at least multiple missing features OR removed negative comments about the game after launch.', points: '-10 points' }
            },
            'Pre-launch trailers and community feedback': {
                5: { label: 'Open Hype', className: 'bonus points-p5', description: 'Pre-launch trailers, content updates, and community feedback gave players a clear picture of what they were buying.', points: '+5 points' },
                0: { label: 'Quiet Runway', className: 'neutral points-0', description: 'Pre-launch communication was limited but not actively misleading.', points: '0 points' },
                '-5': { label: 'Fog Machine', className: 'penalty points-m5', description: 'Pre-launch communication was unclear, sparse, or failed to answer reasonable player concerns.', points: '-5 points' }
            }
        },
        gameplay: {
            'Main campaign/core duration': {
                5: { label: 'The Long Haul', className: 'bonus points-p5', description: 'Games with a massive 20+ hour main campaign. Plenty of bang for your buck!', points: '+5 points' },
                3: { label: 'Decent Length', className: 'bonus points-p3', description: 'Games with a solid 15-20 hour main campaign. A respectable length for most adventures.', points: '+3 points' },
                0: { label: 'Moderate Length', className: 'neutral points-0', description: 'Games with a campaign between 5-15 hours. A reasonable middle ground experience.', points: '0 points' },
                '-5': { label: "Wait, it's over?", className: 'penalty points-m5', description: 'Games with less than a 5 hour campaign. It feels more like a demo than a full game.', points: '-5 points' }
            },
            'Outcome/ending variety': {
                5: { label: 'Multiple Endings', className: 'bonus points-p5', description: 'Games that offer multiple endings or diverse paths to completion based on player choices (different classes, characters, story branches).', points: '+5 points' },
                3: { label: 'Single Focus', className: 'bonus points-p3', description: 'Games with only one ending or a pure sandbox with no specific endpoint. Story is linear but well-crafted.', points: '+3 points' }
            }
        },
        accessibility: {
            'Input methods': {
                2: { label: 'Multiple Inputs', className: 'bonus points-p2', description: 'Support for multiple standard input methods natively, such as both Keyboard & Mouse AND Controller. This allows players to customize their experience to their preferences.', points: '+2 points' },
                0: { label: 'Single Input', className: 'neutral points-0', description: 'Only one input method supported (e.g., Keyboard & Mouse ONLY or Controller ONLY). Players are limited in control options.', points: '0 points' }
            },
            'Accessibility features': {
                2: { label: 'Inclusive Design', className: 'bonus points-p2', description: 'Comprehensive accessibility options included such as colorblind modes, subtitles, and difficulty changes to ensure more people can enjoy the game.', points: '+2 points' },
                '-3': { label: 'Barriers to Entry', className: 'penalty points-m3', description: 'Zero accessibility options provided to assist players with different visual or cognitive needs. One size fits few. Disappointing approach.', points: '-3 points' }
            },
            'Localization and translation': {
                6: { label: 'Global Citizen', className: 'bonus points-p6', description: "The game is fully translated into at least 3 different languages with localized text, subtitles, and voiceovers, making it accessible to a broader audience. The devs didn't have to do this. It took time and extra effort. Kudos!", points: '+6 points' },
                0: { label: 'Language Locked', className: 'neutral points-0', description: 'Only one language available at launch, limiting the audience to a single linguistic group. Limited global reach.', points: '0 points' }
            }
        },
        standards: {
            'Offline playability': {
                5: { label: 'Solo Power', className: 'bonus points-p5', description: 'Games that are fully playable offline independently of remote servers or online accounts. You own what you bought.', points: '+5 points' },
                0: { label: 'Partial Offline', className: 'neutral points-0', description: 'Games that can be played partially offline (solo campaign only) while multiplayer requires connection.', points: '0 points' },
                '-100': { label: 'Plug Pulled', className: 'penalty points-m100', description: 'The ultimate failure. The game is dead, no longer supported, and cannot be played at all.', points: '-100 points' }
            },
            'Crossplay at launch': {
                10: { label: 'Single-Player Exemption', className: 'bonus points-p10', description: 'Games that are primarily single-player automatically receive full credit as cross-platform requirements do not apply to single-player experiences.', points: '+10 points' },
                3: { label: 'Dual Bridge', className: 'bonus points-p3', description: 'For multiplayer games: Cross-platform play between 2 major platforms at launch.', points: '+3 points' },
                0: { label: 'Platform Isolated', className: 'neutral points-0', description: 'For multiplayer games: No cross-platform play support at launch.', points: '0 points' }
            },
            'Modding support': {
                5: { label: "Modder's Paradise", className: 'bonus points-p5', description: 'Full, open modding support provided with official tools and documentation, allowing the community to thrive.', points: '+5 points' },
                0: { label: 'No Modding', className: 'neutral points-0', description: 'No mod support or very limited support provided.', points: '0 points' },
                '-5': { label: 'Creative Ban', className: 'penalty points-m5', description: 'Developers actively ban or restrict modding, stifling community creativity and game longevity.', points: '-5 points' }
            },
            'File size optimization': {
                5: { label: 'Lean Machine', className: 'bonus points-p5', description: 'Game file size is average or below average for its generation compared to similar games of the same genre released the same year.', points: '+5 points' },
                0: { label: 'Reasonable Size', className: 'neutral points-0', description: 'Slightly higher than average, but less than double the genre average for the generation.', points: '0 points' },
                '-5': { label: 'Storage Hog', className: 'penalty points-m5', description: 'Disproportionate file size, more than double the typical industry average for the genre. Excessive bloat.', points: '-5 points' }
            },
            'First-month player review state': {
                5: { label: 'Critical Darling', className: 'bonus points-p5', description: 'Positive initial reviews from players and critics (at least 4/5 or 80%+ based on a combination of scores from Metacritic, Steam reviews, GameSpot, and IGN user scores).', points: '+5 points' },
                '-2': { label: 'Mixed Reception', className: 'penalty points-m2', description: 'Mixed reviews from players (2.5 to 3/5 on Backloggd, 5 to 7/10 on Metacritic User Score, or Steam Mixed rating). Decent but with concerns.', points: '-2 points' },
                '-20': { label: 'Total Trainwreck', className: 'penalty points-m20', description: 'Below 2.5/5 or 50% average player reviews at launch (based on same sources as cited earlier). A technical or conceptual disaster.', points: '-20 points' }
            }
        }
    };
    const criterionAliases = {
        values: {
            'Launch standard edition retail price (USD)': 'Launch retail price (USD)',
            'Early access/demo pricing': 'Early access/demo price',
            'Loot boxes/randomized paid rewards': 'Loot boxes/random rewards'
        },
        ethics: {
            'Post-launch support, updates, and DLCs': 'Post-launch support duration',
            'Announcement lead time before US launch': 'Announcement lead time',
            'Pre-launch trailers, content updates, community feedback': 'Pre-launch trailers and community feedback',
            'Pre-launch trailers/feedback adaptations': 'Pre-launch trailers and community feedback',
            'Advertised features present at launch': 'Advertised feature delivery at launch'
        },
        gameplay: {
            'Average expected duration of main campaign/core experience': 'Main campaign/core duration',
            'Variety of outcomes/game endings': 'Outcome/ending variety'
        },
        accessibility: {
            'Accessibility features (subtitles, colorblind modes, difficulty adjustments)': 'Accessibility features',
            'Control input methods supported': 'Input methods',
            'Localization and translation breadth': 'Localization and translation'
        },
        standards: {
            'State of initial player reviews after first month of launch': 'First-month player review state',
            'Game completely playable offline': 'Offline playability',
            'Launch-day cross-platform multiplayer support': 'Crossplay at launch',
            'Modding support level': 'Modding support'
        }
    };
    const fallbackFindingsBySlug = {
        'half-life': {
            values: [
                'Launch retail price (USD): 5',
                'Early access/demo price: 5',
                'Microtransactions at launch: 5',
                'Loot boxes/random rewards: 5',
                'Battle pass/subscription model: 5',
                'In-game advertisements: 0'
            ],
            ethics: [
                'Post-launch support duration: 10',
                'Announcement lead time: 5',
                'Advertised feature delivery at launch: 10'
            ],
            gameplay: [
                'Main campaign/core duration: 5',
                'Outcome/ending variety: 3'
            ],
            accessibility: [
                'Input methods: 2',
                'Accessibility features: 2',
                'Localization and translation: 6'
            ],
            standards: [
                'First-month player review state: 5',
                'Offline playability: 5',
                'Crossplay at launch: 10',
                'Modding support: 5',
                'File size optimization: 5'
            ]
        },
        'hollow-knight-silksong': {
            values: [
                'Launch retail price (USD): 5',
                'Microtransactions at launch: 5',
                'Loot boxes/random rewards: 5',
                'Battle pass/subscription model: 5',
                'In-game advertisements: 0'
            ],
            ethics: [
                'Post-launch support duration: 10',
                'Announcement lead time: -10',
                'Advertised feature delivery at launch: 10'
            ],
            gameplay: [
                'Main campaign/core duration: 5',
                'Outcome/ending variety: 5'
            ],
            accessibility: [
                'Input methods: 2',
                'Accessibility features: -3',
                'Localization and translation: 0'
            ],
            standards: [
                'First-month player review state: 5',
                'Offline playability: 5',
                'Crossplay at launch: 0',
                'Modding support: 0',
                'File size optimization: 5'
            ]
        }
    };

    function parseTier(value) {
        const parsed = Number.parseInt(value, 10);
        if (!Number.isFinite(parsed)) return null;
        if (parsed < 1 || parsed > 5) return null;
        return parsed;
    }

    function getTierColor(tier) {
        const colorMap = {
            5: '#3A86FF',
            4: '#8338EC',
            3: '#FF006E',
            2: '#FB5607',
            1: '#FFBE0B'
        };

        return colorMap[tier] || '#00c8e0';
    }

    function setText(selector, value) {
        if (!value) return;
        const element = document.querySelector(selector);
        if (element) element.textContent = value;
    }

    function setImage(selector, srcValue, altValue) {
        if (!srcValue && !altValue) return;
        const element = document.querySelector(selector);
        if (!element) return;
        element.onerror = () => {
            element.onerror = null;
            element.src = fallbackImagePath;
        };
        if (srcValue) element.src = srcValue;
        if (altValue) element.alt = altValue;
    }

    function getCriterionScores(pillarKey, text) {
        const scores = new Map();
        if (!text) return scores;

        String(text).split(';').forEach(part => {
            const normalizedPart = part.replace(/^\s*[A-Za-z]+\s+pulse:\s*/i, '').trim();
            const match = normalizedPart.match(/([^:]+):\s*(-?\d+(?:\.\d+)?)/);
            if (!match) return;
            const rawCriterion = match[1].trim();
            const canonicalCriterion = criterionAliases[pillarKey]?.[rawCriterion] || rawCriterion;
            scores.set(canonicalCriterion, Number.parseFloat(match[2]));
        });

        return scores;
    }

    function createBenchmarkListItem(item) {
        const listItem = document.createElement('li');

        const label = document.createElement('span');
        label.className = item.className;
        label.textContent = item.label;

        const description = document.createTextNode(` ${item.description} `);

        const points = document.createElement('span');
        points.className = item.className;
        points.textContent = item.points;

        listItem.appendChild(label);
        listItem.appendChild(description);
        listItem.appendChild(points);

        return listItem;
    }

    function getHighestCriterionScore(branches) {
        return Math.max(...Object.keys(branches).map(Number));
    }

    function getCriterionItemClassName(item, score, branches) {
        if (score !== getHighestCriterionScore(branches)) return item.className;
        return `${item.className} points-max`.trim();
    }

    function renderBenchmarkMatches(pillarKey, findingText, fallbackFindings) {
        const contentElement = document.querySelector(pillarSelectors[pillarKey]);
        if (!contentElement) return;

        contentElement.querySelector('.game-benchmark-list')?.remove();

        const sourceText = fallbackFindings?.[pillarKey]
            ? fallbackFindings[pillarKey].join('; ')
            : findingText;
        const criterionScores = getCriterionScores(pillarKey, sourceText);
        const criterionMap = benchmarkCriteria[pillarKey];
        if (!criterionMap || criterionScores.size === 0) return;

        const list = document.createElement('ul');
        list.className = 'game-benchmark-list';
        const renderedLabels = new Set();

        Object.entries(criterionMap).forEach(([criterion, branches]) => {
            if (!criterionScores.has(criterion)) return;
            const score = criterionScores.get(criterion);
            const scoreKey = String(score);
            const item = branches[scoreKey];
            if (!item || renderedLabels.has(item.label)) return;

            list.appendChild(createBenchmarkListItem({
                ...item,
                className: getCriterionItemClassName(item, score, branches)
            }));
            renderedLabels.add(item.label);
        });

        if (!list.children.length) return;
        contentElement.appendChild(list);
    }

    function renderBenchmarkMatchesForData(data) {
        const content = data?.content || {};
        const fallbackFindings = fallbackFindingsBySlug[data?.game?.slug];

        renderBenchmarkMatches('values', content.values_findings, fallbackFindings);
        renderBenchmarkMatches('ethics', content.ethics_findings, fallbackFindings);
        renderBenchmarkMatches('gameplay', content.gameplay_findings, fallbackFindings);
        renderBenchmarkMatches('accessibility', content.accessibility_findings, fallbackFindings);
        renderBenchmarkMatches('standards', content.standards_findings, fallbackFindings);

        if (typeof initializePillarListItemBehavior === 'function') {
            initializePillarListItemBehavior(document.querySelector('#game-about-grid') || document);
        }
    }

    function renderBenchmarkMatchesFromParams() {
        const pageTitleSlug = String(params.get('page') || params.get('title') || '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-');
        const fallbackFindings = fallbackFindingsBySlug[pageTitleSlug];
        const hasFindingParams = [
            'valuesFinding',
            'ethicsFinding',
            'gameplayFinding',
            'accessibilityFinding',
            'standardsFinding'
        ].some(key => params.has(key));

        if (!fallbackFindings && !hasFindingParams) return;

        renderBenchmarkMatches('values', params.get('valuesFinding'), fallbackFindings);
        renderBenchmarkMatches('ethics', params.get('ethicsFinding'), fallbackFindings);
        renderBenchmarkMatches('gameplay', params.get('gameplayFinding'), fallbackFindings);
        renderBenchmarkMatches('accessibility', params.get('accessibilityFinding'), fallbackFindings);
        renderBenchmarkMatches('standards', params.get('standardsFinding'), fallbackFindings);

        if (typeof initializePillarListItemBehavior === 'function') {
            initializePillarListItemBehavior(document.querySelector('#game-about-grid') || document);
        }
    }

    function setPillarPointsFromParams() {
        const keys = ['pointsV', 'pointsE', 'pointsG', 'pointsA', 'pointsS'];
        const pointElements = document.querySelectorAll('.about-grid .pillar-points');

        keys.forEach((key, index) => {
            const value = params.get(key);
            if (!value) return;
            const target = pointElements[index];
            if (!target) return;

            const numericValue = Number.parseFloat(value);
            if (Number.isFinite(numericValue) && !value.includes('/')) {
                const max = pillarMaxByKey[key];
                if (Number.isFinite(max) && max > 0) {
                    target.textContent = `${numericValue}/${max}`;
                    return;
                }
            }

            target.textContent = value;
        });
    }

    function setPillarPoint(selector, score, max) {
        const element = document.querySelector(selector);
        if (!element) return;
        if (!Number.isFinite(score) || !Number.isFinite(max) || max <= 0) return;
        element.textContent = `${score}/${max}`;
    }

    function parsePillarScore(text) {
        if (!text) return null;
        const match = String(text).trim().match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
        if (!match) return null;

        const score = Number.parseFloat(match[1]);
        const max = Number.parseFloat(match[2]);
        if (!Number.isFinite(score) || !Number.isFinite(max) || max <= 0) return null;

        return { score, max };
    }

    function getTierFromPercent(percent) {
        if (!Number.isFinite(percent)) return 1;
        if (percent >= 80) return 5;
        if (percent >= 60) return 4;
        if (percent >= 40) return 3;
        if (percent >= 20) return 2;
        return 1;
    }

    function getTierFromStatValue(statIndex, statValue) {
        if (!Number.isFinite(statValue)) return null;

        if (statIndex === 0 || statIndex === 1) {
            if (statValue === 25) return 5;
            if (statValue >= 20 && statValue <= 24) return 4;
            if (statValue >= 15 && statValue <= 19) return 3;
            if (statValue >= 10 && statValue <= 14) return 2;
            return 1;
        }

        if (statIndex === 2 || statIndex === 3) {
            if (statValue === 10) return 5;
            if (statValue >= 8 && statValue <= 9) return 4;
            if (statValue >= 6 && statValue <= 7) return 3;
            if (statValue >= 4 && statValue <= 5) return 2;
            return 1;
        }

        if (statIndex === 4) {
            if (statValue === 30) return 5;
            if (statValue >= 24 && statValue <= 29) return 4;
            if (statValue >= 18 && statValue <= 23) return 3;
            if (statValue >= 12 && statValue <= 17) return 2;
            return 1;
        }

        return null;
    }

    function setGameCardStats(statsValues) {
        const statValueElements = document.querySelectorAll('.game-card-collapsed .game-stat-value');
        if (!statValueElements.length) return;

        const maxValues = [25, 25, 10, 10, 30];
        statValueElements.forEach((element, index) => {
            const statValue = Number(statsValues[index] || 0);
            const maxValue = maxValues[index] || 0;
            const tier = getTierFromStatValue(index, statValue);

            element.textContent = `${statValue}/${maxValue}`;
            element.classList.remove('tier-1', 'tier-2', 'tier-3', 'tier-4', 'tier-5');

            if (tier) {
                element.classList.add(`tier-${tier}`);
                element.style.color = getTierColor(tier);
            }
        });
    }

    function applyPillarTiers() {
        const pillarBlocks = document.querySelectorAll('.about-grid .acronym-block');

        pillarBlocks.forEach(block => {
            const pointsElement = block.querySelector('.pillar-points');
            if (!pointsElement) return;

            const parsed = parsePillarScore(pointsElement.textContent);
            if (!parsed) return;

            const percent = (parsed.score / parsed.max) * 100;
            const tier = getTierFromPercent(percent);

            pointsElement.classList.remove('tier-1', 'tier-2', 'tier-3', 'tier-4', 'tier-5');
            pointsElement.classList.add(`tier-${tier}`);
            pointsElement.setAttribute('data-tier', String(tier));

            const letter = block.querySelector('.letter');
            if (letter) {
                const letterColor = 'var(--game-name-color, #00eaff)';
                letter.style.color = letterColor;
                letter.style.textShadow = `0 0 10px ${letterColor}`;
            }
        });
    }

    function syncGameCardStatsFromPillars() {
        const pointElements = document.querySelectorAll('.about-grid .pillar-points');
        const statsValues = Array.from(pointElements).map(pointElement => parsePillarScore(pointElement.textContent)?.score);
        setGameCardStats(statsValues);
    }

    function mapFromJsonData(data) {
        const benchmarkEntry = Array.isArray(data) ? (data[0] || {}) : (data || {});
        const game = benchmarkEntry?.game || {};
        const assets = benchmarkEntry?.assets || {};
        const content = benchmarkEntry?.content || {};
        const total = benchmarkEntry?.scores?.total || {};
        const pillars = benchmarkEntry?.scores?.pillars || {};

        if (game.name) {
            document.title = `${game.name} | V.E.G.A.S. Cooldown Benchmark`;
        }

        setText('.breadcrumb span:last-child', game.name);
        setText('.glow-text', game.name);
        setText('.game-name.game-name-banner', game.name);
        setText('.publisher-line .meta-value', game.publisher);
        setText('.genre-line .meta-value', game.genre);
        setText('.year-line .meta-value', game.release_year);
        setText('.game-description', content.reviewer_notes || content.short_description);
        setImage('.game-thumbnail', assets.card_image_url, assets.card_image_alt);

        setText('.values-finding', content.values_findings);
        setText('.ethics-finding', content.ethics_findings);
        setText('.gameplay-finding', content.gameplay_findings);
        setText('.accessibility-finding', content.accessibility_findings);
        setText('.standards-finding', content.standards_findings);

        setPillarPoint('.about-grid .acronym-block:nth-of-type(1) .pillar-points', pillars?.values?.score, pillars?.values?.max);
        setPillarPoint('.about-grid .acronym-block:nth-of-type(2) .pillar-points', pillars?.ethics?.score, pillars?.ethics?.max);
        setPillarPoint('.about-grid .acronym-block:nth-of-type(3) .pillar-points', pillars?.gameplay?.score, pillars?.gameplay?.max);
        setPillarPoint('.about-grid .acronym-block:nth-of-type(4) .pillar-points', pillars?.accessibility?.score, pillars?.accessibility?.max);
        setPillarPoint('.about-grid .acronym-block:nth-of-type(5) .pillar-points', pillars?.standards?.score, pillars?.standards?.max);
        setGameCardStats([
            pillars?.values?.score,
            pillars?.ethics?.score,
            pillars?.gameplay?.score,
            pillars?.accessibility?.score,
            pillars?.standards?.score
        ]);

        renderBenchmarkMatchesForData(benchmarkEntry);

        const scoreElement = document.querySelector('.game-score');
        const scoreFillElement = document.querySelector('.score-meter-fill');

        if (scoreElement && Number.isFinite(total.score)) {
            scoreElement.textContent = String(Math.round(total.score));
        }

        if (scoreFillElement && Number.isFinite(total.percent)) {
            const scoreValue = Math.max(0, Math.min(100, total.percent));
            scoreFillElement.style.width = `${scoreValue}%`;
        }
    }

    function applyUrlOverrides() {
        const pageTitle = params.get('page') || params.get('title');
        if (pageTitle) {
            document.title = `${pageTitle} | V.E.G.A.S. Cooldown Benchmark`;
        }

        setText('.breadcrumb span:last-child', pageTitle);
        setText('.glow-text', pageTitle);
        setText('.game-name.game-name-banner', params.get('title'));
        setText('.publisher-line .meta-value', params.get('publisher'));
        setText('.genre-line .meta-value', params.get('genre'));
        setText('.year-line .meta-value', params.get('year'));
        setText('.game-description', params.get('notes') || params.get('description'));
        setText('.values-finding', params.get('valuesFinding'));
        setText('.ethics-finding', params.get('ethicsFinding'));
        setText('.gameplay-finding', params.get('gameplayFinding'));
        setText('.accessibility-finding', params.get('accessibilityFinding'));
        setText('.standards-finding', params.get('standardsFinding'));
        renderBenchmarkMatchesFromParams();
        setImage('.game-thumbnail', params.get('image'), params.get('imageAlt'));
        setPillarPointsFromParams();
        if (['pointsV', 'pointsE', 'pointsG', 'pointsA', 'pointsS'].some(key => params.has(key))) {
            setGameCardStats([
                Number.parseFloat(params.get('pointsV')),
                Number.parseFloat(params.get('pointsE')),
                Number.parseFloat(params.get('pointsG')),
                Number.parseFloat(params.get('pointsA')),
                Number.parseFloat(params.get('pointsS'))
            ]);
        }

        const scoreElement = document.querySelector('.game-score');
        const scoreFillElement = document.querySelector('.score-meter-fill');
        const rawScore = params.get('score');

        if (scoreElement && rawScore) {
            const parsedScore = Number.parseFloat(rawScore);
            if (Number.isFinite(parsedScore)) {
                const scoreValue = Math.max(0, Math.min(100, parsedScore));
                scoreElement.textContent = String(Math.round(scoreValue));
                if (scoreFillElement) {
                    scoreFillElement.style.width = `${scoreValue}%`;
                }
            }
        }
    }

    function applyGlobalThemeTier() {
        const scoreElement = document.querySelector('.game-score');
        const scoreFillElement = document.querySelector('.score-meter-fill');

        const defaultTierFromClass = (() => {
            if (!scoreElement) return 4;
            const tierClass = Array.from(scoreElement.classList).find(cls => /^tier-[1-5]$/.test(cls));
            if (!tierClass) return 4;
            return Number.parseInt(tierClass.replace('tier-', ''), 10);
        })();

        const tier = parseTier(params.get('tier')) || defaultTierFromClass;
        const tierColor = getTierColor(tier);

        if (scoreElement) {
            scoreElement.classList.remove('tier-1', 'tier-2', 'tier-3', 'tier-4', 'tier-5');
            scoreElement.classList.add(`tier-${tier}`);
            scoreElement.style.color = tierColor;
        }

        if (scoreFillElement) {
            scoreFillElement.style.backgroundColor = tierColor;
        }

        const descriptionBlock = document.querySelector('.game-description-block');
        if (descriptionBlock) {
            descriptionBlock.style.backgroundColor = tierColor;
        }

        document.querySelectorAll('.about-grid .letter').forEach(letter => {
            if (letter.style.color) return;
            const letterColor = 'var(--game-name-color, #00eaff)';
            letter.style.color = letterColor;
            letter.style.textShadow = `0 0 10px ${letterColor}`;
        });
    }

    function applyGenreBackgroundTheme() {
        const descriptionBlock = document.querySelector('.game-description-block');
        if (!descriptionBlock) return;

        const genreText = (
            params.get('genre') ||
            document.querySelector('.genre-line .meta-value')?.textContent ||
            ''
        ).trim();

        const genreKey = String(genreText).toLowerCase();
        const backgroundThemes = {
            racing: 'img/arcade-racing-bg.png',
            'arcade racing': 'img/arcade-racing-bg.png'
        };

        const matchedTheme = Object.entries(backgroundThemes).find(([key]) => genreKey.includes(key));

        if (!matchedTheme) {
            descriptionBlock.style.backgroundImage = '';
            descriptionBlock.style.backgroundColor = '';
            descriptionBlock.style.backgroundSize = '';
            descriptionBlock.style.backgroundPosition = '';
            descriptionBlock.style.backgroundRepeat = '';
            descriptionBlock.style.backgroundAttachment = '';
            descriptionBlock.style.border = '';
            descriptionBlock.style.boxShadow = '';
            descriptionBlock.style.color = '';
            return;
        }

        descriptionBlock.style.backgroundColor = 'transparent';
        descriptionBlock.style.backgroundImage = `url('${matchedTheme[1]}')`;
        descriptionBlock.style.backgroundSize = 'auto';
        descriptionBlock.style.backgroundPosition = 'top center';
        descriptionBlock.style.backgroundRepeat = 'no-repeat';
        descriptionBlock.style.backgroundAttachment = 'scroll';
        descriptionBlock.style.border = 'none';
        descriptionBlock.style.boxShadow = 'none';
        descriptionBlock.style.color = 'transparent';
    }

    function applySkorePremiumStyling() {
        const scoreElement = document.querySelector('.game-score');
        const cardElement = document.querySelector('.game-card-collapsed');
        
        if (!scoreElement || !cardElement) return;
        
        const scoreText = scoreElement.textContent.trim();
        const scoreValue = Number.parseFloat(scoreText);
        
        if (Number.isFinite(scoreValue) && scoreValue >= 95) {
            cardElement.classList.add('score-premium');
        }
    }

    async function initializeData() {
        const hasUrlData = params.has('title') || params.has('page') || params.has('valuesFinding');

        if (!hasUrlData || params.has('data')) {
            try {
                const dataPath = params.get('data') || defaultDataPath;
                const response = await fetch(withJsonCacheBust(dataPath));
                if (!response.ok) throw new Error(`Failed to load ${dataPath}`);
                const data = await response.json();
                mapFromJsonData(data);
            } catch (error) {
                // Keep page usable even when JSON cannot be loaded (e.g. opened via file://).
                console.warn(error);
            }
        }

        applyUrlOverrides();
        applyPillarTiers();
        syncGameCardStatsFromPillars();
        applyGlobalThemeTier();
        applyGenreBackgroundTheme();
        applySkorePremiumStyling();
    }

    initializeData();
});
