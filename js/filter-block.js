document.addEventListener('DOMContentLoaded', () => {
    const filterBlock = document.querySelector('.filter-block');
    if (!filterBlock) return;

    const trigger = filterBlock.querySelector('.filter-block__trigger');
    const panel = filterBlock.querySelector('.filter-block__panel');
    const yearStart = filterBlock.querySelector('[data-filter-year="start"]');
    const yearEnd = filterBlock.querySelector('[data-filter-year="end"]');
    const startBubble = filterBlock.querySelector('[data-filter-bubble="start"]');
    const endBubble = filterBlock.querySelector('[data-filter-bubble="end"]');
    const toggleInput = filterBlock.querySelector('.filter-toggle__input');
    const minYear = Number(yearStart?.min || 1990);
    const maxYear = Number(yearStart?.max || 2023);
    const range = maxYear - minYear;

    const state = {
        startYear: Number(yearStart?.value || minYear),
        endYear: Number(yearEnd?.value || maxYear),
        genres: new Set(),
        publishers: new Set(),
        sortMode: toggleInput?.checked ? 'worst' : 'best'
    };

    const genreAliases = {
        fps: ['first-person shooter', 'first person shooter'],
        'first-person shooter': ['fps', 'first person shooter'],
        'first person shooter': ['fps', 'first-person shooter'],
        rts: ['real-time strategy', 'real time strategy'],
        'real-time strategy': ['rts', 'real time strategy'],
        'real time strategy': ['rts', 'real-time strategy'],
        'soul-like': ['souls-like'],
        'souls-like': ['soul-like']
    };

    function getPercent(value) {
        return `${((Number(value) - minYear) / range) * 100}%`;
    }

    function updateSlider() {
        if (!yearStart || !yearEnd) return;

        let startValue = Number(yearStart.value);
        let endValue = Number(yearEnd.value);

        if (startValue > endValue) {
            if (document.activeElement === yearStart) {
                startValue = endValue;
                yearStart.value = String(startValue);
            } else {
                endValue = startValue;
                yearEnd.value = String(endValue);
            }
        }

        state.startYear = startValue;
        state.endYear = endValue;
        filterBlock.style.setProperty('--slider-start', getPercent(startValue));
        filterBlock.style.setProperty('--slider-end', getPercent(endValue));

        if (startBubble) {
            startBubble.textContent = startValue;
            startBubble.style.left = getPercent(startValue);
        }

        if (endBubble) {
            endBubble.textContent = endValue;
            endBubble.style.left = getPercent(endValue);
        }
    }

    function showBubble(bubble) {
        bubble?.classList.add('is-visible');
    }

    function hideBubble(bubble) {
        bubble?.classList.remove('is-visible');
    }

    function bindScrollablePills(scroller) {
        if (!scroller) return;

        let isPressed = false;
        let isDragging = false;
        let startX = 0;
        let startScrollLeft = 0;
        let moved = false;
        let suppressClick = false;

        function startPress(clientX) {
            if (isPressed) return;

            isPressed = true;
            isDragging = false;
            moved = false;
            startX = clientX;
            startScrollLeft = scroller.scrollLeft;
        }

        function dragTo(clientX) {
            if (!isPressed) return;

            const deltaX = clientX - startX;
            if (Math.abs(deltaX) > 4) {
                moved = true;
                isDragging = true;
                scroller.classList.add('is-dragging');
            }

            if (!isDragging) return;

            scroller.scrollLeft = startScrollLeft - deltaX;
        }

        function stopDragging() {
            if (!isPressed) return;

            isPressed = false;
            isDragging = false;
            scroller.classList.remove('is-dragging');
            suppressClick = moved;
            window.setTimeout(() => {
                suppressClick = false;
                moved = false;
            }, 0);
        }

        scroller.addEventListener('pointerdown', event => {
            if (event.pointerType === 'mouse' && event.button !== 0) return;

            startPress(event.clientX);
        });

        scroller.addEventListener('pointermove', event => {
            dragTo(event.clientX);
        });

        scroller.addEventListener('pointerup', event => {
            stopDragging();
        });

        scroller.addEventListener('mousedown', event => {
            if (event.button !== 0) return;

            startPress(event.clientX);
        });

        document.addEventListener('mousemove', event => {
            dragTo(event.clientX);
        });

        document.addEventListener('mouseup', stopDragging);

        scroller.addEventListener('pointercancel', stopDragging);
        scroller.addEventListener('click', event => {
            if (!suppressClick) return;

            event.preventDefault();
            event.stopPropagation();
            suppressClick = false;
            moved = false;
        }, true);
    }

    function bindYearInput(input, bubble) {
        if (!input) return;

        input.addEventListener('input', () => {
            updateSlider();
            showBubble(bubble);
            applyFilters();
        });
        input.addEventListener('pointerdown', () => showBubble(bubble));
        input.addEventListener('pointerup', () => hideBubble(bubble));
        input.addEventListener('pointercancel', () => hideBubble(bubble));
        input.addEventListener('focus', () => showBubble(bubble));
        input.addEventListener('blur', () => hideBubble(bubble));
        input.addEventListener('change', () => hideBubble(bubble));
    }

    function normalizeFilterValue(value) {
        return String(value || '')
            .trim()
            .toLowerCase()
            .replace(/[’]/g, "'")
            .replace(/\s+/g, ' ');
    }

    function getGenreValues(value) {
        const normalized = normalizeFilterValue(value);
        return new Set([normalized, ...(genreAliases[normalized] || [])]);
    }

    function cardMatchesGenre(cardGenre, selectedGenre) {
        const genreValues = getGenreValues(cardGenre);
        const selectedValues = getGenreValues(selectedGenre);

        if (selectedValues.has('rpg')) {
            return [...genreValues].some(genre => genre.includes('rpg') || genre.includes('role-playing'));
        }

        return [...selectedValues].some(selected => (
            [...genreValues].some(genre => genre === selected || genre.includes(selected))
        ));
    }

    function carouselMatchesGenre(carouselGenre, selectedGenre) {
        const genreValues = getGenreValues(carouselGenre);
        const selectedValues = getGenreValues(selectedGenre);

        return [...selectedValues].some(selected => genreValues.has(selected));
    }

    function updateNoResultsMessage(hasVisibleCards) {
        const stack = document.getElementById('carousels-stack');
        if (!stack) return;

        if (stack.querySelector('.carousel-load-error')) {
            stack.querySelector('.filter-no-results')?.remove();
            return;
        }

        let message = stack.querySelector('.filter-no-results');
        if (!message) {
            message = document.createElement('section');
            message.className = 'filter-no-results';
            message.setAttribute('role', 'status');
            message.textContent = 'No games match the selected filters.';
            stack.appendChild(message);
        }

        message.hidden = hasVisibleCards;
    }

    function hasActiveFilters(selectedGenres, selectedPublishers) {
        return selectedGenres.length > 0
            || selectedPublishers.length > 0
            || state.startYear !== minYear
            || state.endYear !== maxYear;
    }

    function getCarouselTitle(genre, isDefaultAllTime = false) {
        if (isDefaultAllTime) return 'All-Time Greatest Games';

        if (state.startYear !== minYear || state.endYear !== maxYear) {
            return `Top 10 ${genre} games from ${state.startYear}-${state.endYear}`;
        }

        return `Top 10 ${genre} games of all-time`;
    }

    function updateCarouselSections(selectedGenres, selectedPublishers) {
        const stack = document.getElementById('carousels-stack');
        if (!stack) return;

        const sections = [...stack.querySelectorAll('.carousel-section')];
        const isDefaultAllTime = !hasActiveFilters(selectedGenres, selectedPublishers);
        const sectionMatchesSelectedGenre = section => {
            if (isDefaultAllTime) return section.dataset.carouselDefault === 'all-time';
            if (section.dataset.carouselDefault === 'all-time') return false;
            if (!selectedGenres.length) return true;

            const sectionGenre = section.dataset.carouselGenre;
            const sectionCards = [...section.querySelectorAll('.game-card-collapsed')];
            return selectedGenres.some(genre => (
                carouselMatchesGenre(sectionGenre, genre)
                || sectionCards.some(card => cardMatchesGenre(card.dataset.filterGenre, genre))
            ));
        };

        sections.forEach(section => {
            const title = section.querySelector('.carousel-title');
            if (title) title.textContent = getCarouselTitle(section.dataset.carouselGenre || 'Game', isDefaultAllTime && section.dataset.carouselDefault === 'all-time');
        });

        if (isDefaultAllTime) {
            sections
                .sort((firstSection, secondSection) => {
                    const firstIndex = Number(firstSection.dataset.carouselIndex || 0);
                    const secondIndex = Number(secondSection.dataset.carouselIndex || 0);
                    return firstIndex - secondIndex;
                })
                .forEach(section => stack.appendChild(section));
        } else if (selectedGenres.length) {
            const selectedSections = sections.filter(sectionMatchesSelectedGenre);
            const remainingSections = sections
                .filter(section => !selectedSections.includes(section))
                .sort((firstSection, secondSection) => {
                    const firstIndex = Number(firstSection.dataset.carouselIndex || 0);
                    const secondIndex = Number(secondSection.dataset.carouselIndex || 0);
                    return firstIndex - secondIndex;
                });

            [...selectedSections, ...remainingSections].forEach(section => stack.appendChild(section));
        } else {
            sections
                .sort((firstSection, secondSection) => {
                    const firstIndex = Number(firstSection.dataset.carouselIndex || 0);
                    const secondIndex = Number(secondSection.dataset.carouselIndex || 0);
                    return firstIndex - secondIndex;
                })
                .forEach(section => stack.appendChild(section));
        }

        sections.forEach(section => {
            section.classList.toggle('is-filter-hidden', !sectionMatchesSelectedGenre(section));
        });
    }

    function cardMatchesPublisher(cardPublisher, selectedPublisher) {
        return normalizeFilterValue(cardPublisher).includes(normalizeFilterValue(selectedPublisher));
    }

    function applyFilters() {
        const selectedGenres = [...state.genres];
        const selectedPublishers = [...state.publishers];
        const sortDirection = state.sortMode === 'worst' ? 1 : -1;

        updateCarouselSections(selectedGenres, selectedPublishers);

        document.querySelectorAll('.about-grid.horizontalScroller_list').forEach(carousel => {
            const cards = [...carousel.querySelectorAll('.game-card-collapsed')];
            const section = carousel.closest('.carousel-section');
            const useCarouselGenreFilter = Boolean(section?.dataset.carouselGenre);

            cards
                .sort((firstCard, secondCard) => {
                    const firstScore = Number(firstCard.dataset.filterScore || 0);
                    const secondScore = Number(secondCard.dataset.filterScore || 0);
                    return (firstScore - secondScore) * sortDirection;
                })
                .forEach(card => carousel.appendChild(card));

            cards.forEach(card => {
                const year = Number(card.dataset.filterYear || 0);
                const matchesYear = year >= state.startYear && year <= state.endYear;
                const matchesGenre = (useCarouselGenreFilter && selectedGenres.some(genre => carouselMatchesGenre(section.dataset.carouselGenre, genre)))
                    || selectedGenres.length === 0
                    || selectedGenres.some(genre => cardMatchesGenre(card.dataset.filterGenre, genre));
                const matchesPublisher = selectedPublishers.length === 0
                    || selectedPublishers.some(publisher => cardMatchesPublisher(card.dataset.filterPublisher, publisher));

                card.classList.toggle('is-filter-hidden', !(matchesYear && matchesGenre && matchesPublisher));
            });

            const hasVisibleCards = cards.some(card => !card.classList.contains('is-filter-hidden'));
            carousel.closest('.carousel-section')?.classList.toggle('is-filter-empty', !hasVisibleCards);
        });

        const hasAnyVisibleCards = [...document.querySelectorAll('.carousel-section')].some(section => {
            if (section.classList.contains('is-filter-hidden') || section.classList.contains('is-filter-empty')) return false;
            return [...section.querySelectorAll('.game-card-collapsed')].some(card => !card.classList.contains('is-filter-hidden'));
        });

        updateNoResultsMessage(hasAnyVisibleCards);
    }

    trigger?.addEventListener('click', () => {
        const isExpanded = filterBlock.classList.toggle('is-expanded');
        panel?.classList.toggle('is-expanded', isExpanded);
        if (panel) {
            panel.style.setProperty('height', isExpanded ? `${panel.scrollHeight}px` : '0px', 'important');
        }
        trigger.setAttribute('aria-expanded', String(isExpanded));
    });

    filterBlock.querySelectorAll('.filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const isSelected = pill.getAttribute('aria-pressed') !== 'true';
            const group = pill.closest('.filter-genre') ? state.genres : state.publishers;

            pill.setAttribute('aria-pressed', String(isSelected));
            pill.classList.toggle('is-selected', isSelected);

            if (isSelected) {
                group.add(pill.dataset.filterValue || pill.textContent.trim());
            } else {
                group.delete(pill.dataset.filterValue || pill.textContent.trim());
            }

            applyFilters();
        });
    });

    toggleInput?.addEventListener('change', () => {
        state.sortMode = toggleInput.checked ? 'worst' : 'best';
        applyFilters();
    });

    bindYearInput(yearStart, startBubble);
    bindYearInput(yearEnd, endBubble);
    filterBlock.querySelectorAll('.filter-genre, .filter-publisher').forEach(bindScrollablePills);
    updateSlider();
    document.addEventListener('gamesCarouselReady', applyFilters);
    document.addEventListener('gamesCarouselError', () => updateNoResultsMessage(true));

    filterBlock.filterState = state;
});
