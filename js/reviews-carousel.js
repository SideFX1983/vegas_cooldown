/* Reviews page: carousel generation and scrolling logic */

const CAROUSEL_CONFIG = {
    /* Number of cards per carousel */
    CARDS_PER_CAROUSEL: 10,
};

const JSON_DATA_DIRECTORY = 'json/';
const KNOWN_JSON_DATA_FILES = [
    'beat_em_up_games_v1.06.json',
    'city_builder_games_v1.06.json',
    'first_person_shooter_games_v1.06.json',
    'management_simulation_games_v1.06.json',
    'metroidvania_games_v1.06.json',
    'puzzle_strategy_games_v1.06.json',
    'racing_games_v1.06.json',
    'rpg_games_v1.06.json',
    'rts_games_v1.06.json'
];
const JSON_SOURCE_GENRE_LABELS = {
    'beat_em_up_games_v1.06.json': "Beat 'em up",
    'first_person_shooter_games_v1.06.json': 'First-person shooter',
    'fps_games_v1.06.json': 'First-person shooter',
    'racing_games_v1.06.json': 'Racing',
    'rpg_games_v1.06.json': 'Role-Playing Game',
    'rts_games_v1.06.json': 'Real-Time Strategy'
};
const JSON_CACHE_BUST_VERSION = 'json-all-files-20260918-premium';
const FALLBACK_GAME_IMAGE = 'img/vegas_logo.png';

function withJsonCacheBust(path) {
    const separator = String(path).includes('?') ? '&' : '?';
    return `${path}${separator}v=${JSON_CACHE_BUST_VERSION}-${Date.now()}`;
}

function getImageFallbackCandidates(src, title) {
    const candidates = [];
    const addCandidate = candidate => {
        if (candidate && !candidates.includes(candidate)) candidates.push(candidate);
    };
    const titleBase = String(title || '')
        .replace(/\s*\([^)]*\)\s*/g, ' ')
        .trim();
    const titleHyphen = titleBase.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '');
    const titleUnderscore = titleBase.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '');

    addCandidate(src);

    if (src) {
        ['jpg', 'jpeg', 'png'].forEach(extension => {
            addCandidate(src.replace(/\.[^.]+$/, `.${extension}`));
        });
    }

    [titleHyphen, titleUnderscore].forEach(baseName => {
        ['jpg', 'jpeg', 'png'].forEach(extension => {
            addCandidate(`img/${baseName}.${extension}`);
        });
    });

    addCandidate(FALLBACK_GAME_IMAGE);

    return candidates;
}

function getCarouselTitle(genre, startYear = null, endYear = null, sortMode = 'best') {
    const prefix = sortMode === 'worst' ? 'Worst 10' : 'TOP 10';
    if (Number.isFinite(startYear) && Number.isFinite(endYear)) {
        return `${prefix} ${genre} games from ${startYear}-${endYear}`;
    }

    return `${prefix} ${genre} games of all-time`;
}

function filterCardsByScoreCutoff(cards, maxScore) {
    return cards.filter(card => {
        const totalScore = getComputedTotalScoreFromCardData(card);
        return totalScore <= maxScore;
    });
}

let globalGameData = { sources: [], cards: [] };

function updateFirstCarouselWithGlobalData(sortMode = 'best') {
    const firstSection = document.querySelector('[data-carousel-default="all-time"]');
    if (!firstSection) return;

    const firstCarousel = firstSection.querySelector('.about-grid');
    if (!firstCarousel) return;

    let cardsToDisplay = globalGameData.cards;
    
    // Apply score cutoff for worst games (only show games with score <= 30)
    if (sortMode === 'worst') {
        cardsToDisplay = filterCardsByScoreCutoff(cardsToDisplay, 30);
    }

    // Get top or worst based on sortMode
    const carouselCards = sortMode === 'worst' 
        ? getLowestCardData(cardsToDisplay)
        : getTopCardData(cardsToDisplay);

    populateCarouselFromCardData(firstCarousel, carouselCards);
    initializeCarouselScroll(firstCarousel);
}

function updateCarouselTitles(sortMode = 'best') {
    const sections = document.querySelectorAll('.carousel-section');
    sections.forEach(section => {
        const titleElement = section.querySelector('.carousel-title');
        if (!titleElement) return;

        const genre = section.dataset.carouselGenre || 'Game';
        const isDefaultAllTime = section.dataset.carouselDefault === 'all-time';
        let newTitle;

        if (isDefaultAllTime) {
            const prefix = sortMode === 'worst' ? 'Worst 10' : 'TOP 10';
            newTitle = `${prefix} All-Time Games`;
        } else {
            newTitle = getCarouselTitle(genre, null, null, sortMode);
        }

        titleElement.textContent = newTitle;

        // Update carousel content for genre carousels when worst filter is applied
        if (!isDefaultAllTime) {
            const carousel = section.querySelector('.about-grid');
            if (carousel) {
                // Find the matching source by genre
                const sourceIndex = Number(section.dataset.carouselIndex) - 1;
                if (sourceIndex >= 0 && sourceIndex < globalGameData.sources.length) {
                    const source = globalGameData.sources[sourceIndex];
                    let cardsForGenre = source.cards;
                    
                    // Apply score cutoff for worst games (only show score <= 30)
                    if (sortMode === 'worst') {
                        cardsForGenre = filterCardsByScoreCutoff(cardsForGenre, 30);
                    }
                    
                    const carouselCards = sortMode === 'worst'
                        ? getLowestCardData(cardsForGenre)
                        : getTopCardData(cardsForGenre);
                    
                    populateCarouselFromCardData(carousel, carouselCards);
                    initializeCarouselScroll(carousel);
                }
            }
        }
    });
    
    // Update first carousel with global data when toggle changes
    updateFirstCarouselWithGlobalData(sortMode);
}

function getStatMaxValue(statIndex) {
    const statMaxByIndex = [25, 25, 10, 10, 30];
    const max = statMaxByIndex[statIndex];
    return Number.isFinite(max) ? max : 0;
}

function parseJsonObjectSequence(rawText) {
    const trimmed = String(rawText || '').trim();
    if (!trimmed) return [];

    try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch (_error) {
        const wrapped = `[${trimmed}]`;
        const parsedWrapped = JSON.parse(wrapped);
        return Array.isArray(parsedWrapped) ? parsedWrapped : [];
    }
}

function toCardDataFromBenchmarkEntry(entry, sourcePath = '') {
    const game = entry?.game || {};
    const assets = entry?.assets || {};
    const content = entry?.content || {};
    const pillars = entry?.scores?.pillars || {};

    const statsValues = [
        Number(pillars?.values?.score || 0),
        Number(pillars?.ethics?.score || 0),
        Number(pillars?.gameplay?.score || 0),
        Number(pillars?.accessibility?.score || 0),
        Number(pillars?.standards?.score || 0)
    ];

    return {
        imageSrc: assets.card_image_url || 'img/hollow-knight-silksong.jpeg',
        imageAlt: assets.card_image_alt || game.name || 'Game art',
        titlePrefix: '',
        titleText: game.name || 'Unknown Game',
        publisher: game.publisher || 'Unknown Publisher',
        genre: game.genre || 'Unknown Genre',
        releaseYear: String(game.release_year || ''),
        totalScore: String(entry?.scores?.total?.score || 0),
        sourcePath,
        description: content.short_description || '',
        statsValues,
        scores: [
            { label: 'values', value: `${statsValues[0]}/25`, text: content.values_findings || '' },
            { label: 'ethics', value: `${statsValues[1]}/25`, text: content.ethics_findings || '' },
            { label: 'gameplay', value: `${statsValues[2]}/10`, text: content.gameplay_findings || '' },
            { label: 'accessibility', value: `${statsValues[3]}/10`, text: content.accessibility_findings || '' },
            { label: 'standards', value: `${statsValues[4]}/30`, text: content.standards_findings || '' },
        ],
        notes: content.reviewer_notes || content.short_description || '',
    };
}

function getFilenameFromPath(path) {
    return String(path || '').split('/').filter(Boolean).pop() || '';
}

function getSourceGenreLabel(path, entries) {
    const filename = getFilenameFromPath(path);
    if (JSON_SOURCE_GENRE_LABELS[filename]) return JSON_SOURCE_GENRE_LABELS[filename];

    const firstGenre = entries.find(entry => entry?.game?.genre)?.game?.genre;
    return firstGenre || filename.replace(/_games.*$/i, '').replace(/[_-]+/g, ' ');
}

async function getJsonDataPaths() {
    try {
        const response = await fetch(withJsonCacheBust(JSON_DATA_DIRECTORY));

        if (!response.ok) {
            throw new Error(`Expected JSON directory failed to load: ${JSON_DATA_DIRECTORY} (${response.status} ${response.statusText || 'HTTP error'})`);
        }

        const directoryHtml = await response.text();
        const directoryDocument = new DOMParser().parseFromString(directoryHtml, 'text/html');
        const paths = [...directoryDocument.querySelectorAll('a[href$=".json"]')]
            .map(anchor => new URL(anchor.getAttribute('href'), new URL(JSON_DATA_DIRECTORY, window.location.href)).href)
            .filter((path, index, allPaths) => allPaths.indexOf(path) === index)
            .sort();

        if (paths.length) return paths;
    } catch (_error) {
        // Fall through to known files when directory listing is unavailable.
    }

    return KNOWN_JSON_DATA_FILES
        .map(filename => new URL(`${JSON_DATA_DIRECTORY}${filename}`, window.location.href).href)
        .sort();
}

async function loadGameCardsFromJsonFiles() {
    const paths = await getJsonDataPaths();
    const sources = await Promise.all(paths.map(async path => {
        const response = await fetch(withJsonCacheBust(path));

        if (!response.ok) {
            throw new Error(`Expected JSON failed to load: ${path} (${response.status} ${response.statusText || 'HTTP error'})`);
        }

        const entries = await response.json();
        if (!Array.isArray(entries)) {
            throw new Error(`Expected JSON did not contain an array: ${path}`);
        }

        return {
            path,
            genre: getSourceGenreLabel(path, entries),
            cards: entries.map(entry => toCardDataFromBenchmarkEntry(entry, path))
        };
    }));

    return {
        sources,
        cards: sources.flatMap(source => source.cards)
    };
}

function renderCarouselLoadError(carouselsStack, error) {
    const message = error instanceof Error ? error.message : String(error);
    carouselsStack.innerHTML = '';

    const errorElement = document.createElement('section');
    errorElement.className = 'carousel-load-error';
    errorElement.setAttribute('role', 'alert');
    errorElement.innerHTML = `
        <h2>Game data failed to load</h2>
        <p>The expected JSON files could not be loaded. No fallback game data was used.</p>
        <code>${message}</code>
    `;

    carouselsStack.appendChild(errorElement);
}

function cloneCardData(data) {
    return {
        ...data,
        statsValues: Array.isArray(data.statsValues) ? [...data.statsValues] : [],
        scores: Array.isArray(data.scores)
            ? data.scores.map(score => ({ ...score }))
            : []
    };
}

function getComputedTotalScoreFromCardData(cardData) {
    const statsValues = Array.isArray(cardData?.statsValues) ? cardData.statsValues : [];
    return statsValues.reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
}

function parseScoreValuePair(valueText) {
    if (!valueText) return null;
    const match = String(valueText).trim().match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
    if (!match) return null;

    return {
        score: match[1],
        max: match[2],
        raw: `${match[1]}/${match[2]}`
    };
}

function getCardTitle(cardData) {
    return `${cardData.titlePrefix || ''}${cardData.titleText || ''}`.trim();
}

function buildGamePageUrl(cardData, computedTotalScore, normalizedStats, matchedScoreTier) {
    const gameUrl = new URL('game.html', window.location.href);
    const searchParams = gameUrl.searchParams;

    const cardTitle = getCardTitle(cardData);
    const safeScore = Math.max(0, Math.min(100, computedTotalScore));

    if (cardTitle) {
        searchParams.set('title', cardTitle);
        searchParams.set('page', cardTitle);
    }

    searchParams.set('publisher', cardData.publisher || '');
    searchParams.set('genre', cardData.genre || '');
    searchParams.set('year', cardData.releaseYear || '');
    searchParams.set('description', cardData.description || '');
    searchParams.set('notes', cardData.notes || cardData.description || '');
    searchParams.set('image', cardData.imageSrc || '');
    searchParams.set('imageAlt', cardData.imageAlt || cardTitle || 'Game art');
    searchParams.set('score', String(Math.round(safeScore)));

    if (Number.isFinite(matchedScoreTier)) {
        searchParams.set('tier', String(matchedScoreTier));
    }

    const defaultPillarPoints = {
        pointsV: String(normalizedStats[0] ?? 0),
        pointsE: String(normalizedStats[1] ?? 0),
        pointsG: String(normalizedStats[2] ?? 0),
        pointsA: String(normalizedStats[3] ?? 0),
        pointsS: String(normalizedStats[4] ?? 0)
    };

    const findingsByLabel = {
        values: '',
        ethics: '',
        gameplay: '',
        accessibility: '',
        standards: ''
    };

    (cardData.scores || []).forEach(scoreEntry => {
        const label = String(scoreEntry.label || '').trim().toLowerCase();
        const parsedValue = parseScoreValuePair(scoreEntry.value);

        if (label === 'values') {
            if (parsedValue) defaultPillarPoints.pointsV = parsedValue.raw;
            findingsByLabel.values = scoreEntry.text || findingsByLabel.values;
            return;
        }

        if (label === 'ethics') {
            if (parsedValue) defaultPillarPoints.pointsE = parsedValue.raw;
            findingsByLabel.ethics = scoreEntry.text || findingsByLabel.ethics;
            return;
        }

        if (label === 'gameplay') {
            if (parsedValue) defaultPillarPoints.pointsG = parsedValue.raw;
            findingsByLabel.gameplay = scoreEntry.text || findingsByLabel.gameplay;
            return;
        }

        if (label === 'accessibility') {
            if (parsedValue) defaultPillarPoints.pointsA = parsedValue.raw;
            findingsByLabel.accessibility = scoreEntry.text || findingsByLabel.accessibility;
            return;
        }

        if (label === 'standards') {
            if (parsedValue) defaultPillarPoints.pointsS = parsedValue.raw;
            findingsByLabel.standards = scoreEntry.text || findingsByLabel.standards;
        }
    });

    Object.entries(defaultPillarPoints).forEach(([key, value]) => {
        searchParams.set(key, value);
    });

    if (findingsByLabel.values) searchParams.set('valuesFinding', findingsByLabel.values);
    if (findingsByLabel.ethics) searchParams.set('ethicsFinding', findingsByLabel.ethics);
    if (findingsByLabel.gameplay) searchParams.set('gameplayFinding', findingsByLabel.gameplay);
    if (findingsByLabel.accessibility) searchParams.set('accessibilityFinding', findingsByLabel.accessibility);
    if (findingsByLabel.standards) searchParams.set('standardsFinding', findingsByLabel.standards);

    return gameUrl.toString();
}

function createGameCard(cardData) {
    const template = document.getElementById('game-card-template');
    const cardClone = template.content.cloneNode(true);
    const cardElement = cardClone.querySelector('.game-card-collapsed');

    /* Set image */
    const imgElement = cardClone.querySelector('.game-thumbnail');
    const imageCandidates = getImageFallbackCandidates(cardData.imageSrc, getCardTitle(cardData));
    let imageCandidateIndex = 0;
    imgElement.onerror = () => {
        imageCandidateIndex += 1;
        if (imageCandidateIndex >= imageCandidates.length) {
            imgElement.onerror = null;
            imgElement.src = FALLBACK_GAME_IMAGE;
            return;
        }

        imgElement.src = imageCandidates[imageCandidateIndex];
    };
    imgElement.src = imageCandidates[0] || FALLBACK_GAME_IMAGE;
    imgElement.alt = cardData.imageAlt;

    /* Set title */
    const titleElement = cardClone.querySelector('.game-name');
    titleElement.textContent = `${cardData.titlePrefix}${cardData.titleText}`;

    /* Set publisher info */
    const publisherElement = cardClone.querySelector('.publisher-line');
    publisherElement.innerHTML = `<span class="meta-label">Publisher</span> <span class="meta-value">${cardData.publisher}</span>`;

    const genreElement = cardClone.querySelector('.genre-line');
    genreElement.innerHTML = `<span class="meta-label">Genre</span> <span class="meta-value">${cardData.genre}</span>`;

    const yearElement = cardClone.querySelector('.year-line');
    yearElement.innerHTML = `<span class="meta-label">Year of Release</span> <span class="meta-value">${cardData.releaseYear}</span>`;

    /* Compute total score from stat values */
    const normalizedStats = Array.from({ length: 5 }, (_, index) => {
        const rawValue = Array.isArray(cardData.statsValues) ? cardData.statsValues[index] : undefined;
        return Number.isFinite(rawValue) ? rawValue : 0;
    });
    const computedTotalScore = normalizedStats.reduce((sum, value) => sum + value, 0);

    if (cardElement) {
        cardElement.dataset.filterTitle = getCardTitle(cardData);
        cardElement.dataset.filterPublisher = cardData.publisher || '';
        cardElement.dataset.filterGenre = cardData.genre || '';
        cardElement.dataset.filterYear = cardData.releaseYear || '';
        cardElement.dataset.filterScore = String(computedTotalScore);
    }

    /* Set total score */
    const scoreElement = cardClone.querySelector('.game-score');
    scoreElement.textContent = String(computedTotalScore);
    scoreElement.classList.remove(...TIER_CLASS_LIST);

    const matchedScoreTier = getTierFromTotalScore(computedTotalScore);
    if (matchedScoreTier) {
        scoreElement.classList.add(`tier-${matchedScoreTier}`);
        scoreElement.style.color = getTierColor(matchedScoreTier);
    }

    /* Add premium gold frame class for scores 95 or above */
    if (computedTotalScore >= 95 && cardElement) {
        cardElement.classList.add('score-premium');
    }

    const scoreFillElement = cardClone.querySelector('.score-meter-fill');
    const scorePercent = Math.max(0, Math.min(100, computedTotalScore));
    scoreFillElement.style.width = `${scorePercent}%`;
    if (matchedScoreTier) {
        scoreFillElement.style.backgroundColor = getTierColor(matchedScoreTier);
    }

    const gamePageUrl = buildGamePageUrl(cardData, computedTotalScore, normalizedStats, matchedScoreTier);
    if (cardElement) {
        cardElement.setAttribute('role', 'link');
        cardElement.setAttribute('tabindex', '0');
        cardElement.setAttribute('aria-label', `Open ${getCardTitle(cardData)} details`);

        cardElement.addEventListener('click', event => {
            if (event.target.closest('.li-toggle-btn')) return;
            window.location.href = gamePageUrl;
        });

        cardElement.addEventListener('keydown', event => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            window.location.href = gamePageUrl;
        });
    }

    /* Set description */
    const descElement = cardClone.querySelector('.card-description');
    descElement.textContent = cardData.description;

    /* Set VEGAS stat values */
    const statValueElements = cardClone.querySelectorAll('.game-stat-value');
    statValueElements.forEach((element, index) => {
        const statValue = normalizedStats[index];
        const statMaxValue = getStatMaxValue(index);
        const matchedTier = getTierFromStatValue(index, statValue);

        element.textContent = `${statValue}/${statMaxValue}`;
        element.classList.remove(...TIER_CLASS_LIST);

        if (matchedTier) {
            element.classList.add(`tier-${matchedTier}`);
            element.style.color = getTierColor(matchedTier);
        }
    });

    /* Set score breakdown */
    const scoresList = cardClone.querySelector('.card-scores');
    cardData.scores.forEach(score => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="bonus">${score.label}:</span> ${score.value} - ${score.text}`;
        scoresList.appendChild(li);
    });

    /* Set reviewer notes */
    const notesElement = cardClone.querySelector('.card-notes');
    notesElement.textContent = cardData.notes;



    return cardClone;
}

function getTopCardData(cardData, cardCount = CAROUSEL_CONFIG.CARDS_PER_CAROUSEL) {
    return cardData
        .map(cloneCardData)
        .sort((a, b) => {
            const totalA = getComputedTotalScoreFromCardData(a);
            const totalB = getComputedTotalScoreFromCardData(b);
            return totalB - totalA;
        })
        .slice(0, cardCount);
}

    function getLowestCardData(cardData, cardCount = CAROUSEL_CONFIG.CARDS_PER_CAROUSEL) {
        return cardData
        .map(cloneCardData)
        .sort((a, b) => getComputedTotalScoreFromCardData(a) - getComputedTotalScoreFromCardData(b))
        .slice(0, cardCount);
    }

function populateCarouselFromCardData(carousel, cardData) {
    carousel.innerHTML = '';
    cardData.forEach(data => {
        carousel.appendChild(createGameCard(data));
    });
}

function initializeCarouselScroll(carousel) {
    function updateScrollerState() {
        const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
        const isScrollable = maxScrollLeft > 1;
        const atBeginning = carousel.scrollLeft <= 1;
        const atEnd = carousel.scrollLeft >= maxScrollLeft - 1;

        carousel.classList.toggle('isScrollable', isScrollable);
        carousel.classList.toggle('isBeginning', isScrollable && atBeginning);
        carousel.classList.toggle('isEnd', isScrollable && atEnd);
    }

    /* Initial state check */
    updateScrollerState();

    /* Update on scroll */
    carousel.addEventListener('scroll', updateScrollerState, { passive: true });

    /* Update on window resize */
    window.addEventListener('resize', updateScrollerState);
}

document.addEventListener('DOMContentLoaded', async () => {
    const carouselsStack = document.getElementById('carousels-stack');
    const firstSection = carouselsStack ? carouselsStack.querySelector('.carousel-section') : null;

    if (!carouselsStack || !firstSection) {
        console.error('Carousel container or template section not found.');
        return;
    }

    /* Populate first carousel */
    const firstCarousel = firstSection.querySelector('.about-grid');
    let gameData = { sources: [], cards: [] };

    try {
        gameData = await loadGameCardsFromJsonFiles();
        globalGameData = gameData;
    } catch (error) {
        console.error(error);
        renderCarouselLoadError(carouselsStack, error);
        document.dispatchEvent(new CustomEvent('gamesCarouselError', { detail: { error } }));
        return;
    }

    const firstCarouselCardData = getTopCardData(gameData.cards);
    populateCarouselFromCardData(firstCarousel, firstCarouselCardData);

    initializeCarouselScroll(firstCarousel);

    const firstTitleElement = firstSection.querySelector('.carousel-title');
    if (firstTitleElement) {
        firstTitleElement.textContent = 'TOP 10 All-Time Games';
    }

    firstSection.dataset.carouselGenre = 'All-Time Greatest Games';
    firstSection.dataset.carouselIndex = '0';
    firstSection.dataset.carouselDefault = 'all-time';

    if (document.body.dataset.page === 'recent') {
        const recentCarouselConfigs = [
            { title: 'Top 10 Rated Games of 2023', startYear: 2023, endYear: 2023, sort: 'highest' },
            { title: 'Top 10 Rated Games of the decade 2013-2023', startYear: 2013, endYear: 2023, sort: 'highest' },
            { title: 'Worst 10 Rated Games of 2023', startYear: 2023, endYear: 2023, sort: 'lowest' },
            { title: 'Worst 10 Rated Games of the decade 2013-2023', startYear: 2013, endYear: 2023, sort: 'lowest' }
        ];

        recentCarouselConfigs.forEach((config, index) => {
            const sectionClone = firstSection.cloneNode(true);
            const filteredCards = gameData.cards.filter(card => {
                const year = Number(card.releaseYear);
                return year >= config.startYear && year <= config.endYear;
            });

            sectionClone.classList.add('carousel-small');
            sectionClone.dataset.carouselGenre = config.title;
            sectionClone.dataset.carouselIndex = String(index + 1);
            delete sectionClone.dataset.carouselDefault;

            const titleElement = sectionClone.querySelector('.carousel-title');
            if (titleElement) titleElement.textContent = config.title;

            const clonedCarousel = sectionClone.querySelector('.about-grid');
            const rankedCards = config.sort === 'lowest'
                ? getLowestCardData(filteredCards)
                : getTopCardData(filteredCards);
            populateCarouselFromCardData(clonedCarousel, rankedCards);
            initializeCarouselScroll(clonedCarousel);
            carouselsStack.appendChild(sectionClone);
        });
    } else {

        /* Clone carousel sections to create source-backed genre carousels. */
        gameData.sources.forEach((source, index) => {
        const sectionClone = firstSection.cloneNode(true);
        const carouselGenre = source.genre;

        sectionClone.classList.add('carousel-small');
        sectionClone.dataset.carouselGenre = carouselGenre;
        sectionClone.dataset.carouselIndex = String(index + 1);
        delete sectionClone.dataset.carouselDefault;

        const titleElement = sectionClone.querySelector('.carousel-title');
        if (titleElement) {
            titleElement.textContent = getCarouselTitle(carouselGenre, null, null, 'best');
        }

        const clonedCarousel = sectionClone.querySelector('.about-grid');
        populateCarouselFromCardData(clonedCarousel, getTopCardData(source.cards));
        initializeCarouselScroll(clonedCarousel);

            carouselsStack.appendChild(sectionClone);
        });
    }

    /* Initialize card expand/collapse behavior only when available. */
    if (typeof initializeCardBehavior === 'function') {
        initializeCardBehavior();
    }

    /* Listen for filter toggle changes to update carousel titles */
    const filterToggle = document.querySelector('.filter-toggle__input');
    if (filterToggle) {
        filterToggle.addEventListener('change', () => {
            const sortMode = filterToggle.checked ? 'worst' : 'best';
            updateCarouselTitles(sortMode);
        });
    }

    document.dispatchEvent(new Event('gamesCarouselReady'));

});
