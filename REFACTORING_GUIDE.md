# Vegas Cooldown - Quick Reference & Action Items

**Quick navigation for developers and maintainers**

---

## Code Duplication Hotspots - At a Glance

### 🔴 CRITICAL (Address First)

#### Colors & Tier System
- **File locations:** `reviews-color-mapping.js`, `style.css`, `game-cards.css`, `about-pillar-cards.css`
- **Duplication level:** 4-5 times
- **Impact:** Changes require editing multiple files
- **Fix time:** 1 hour
- **Refactor to:** `config/tier-config.js`

#### Genre Aliases & Normalization
- **File locations:** `filter-block.js`, `game-data.js`, `reviews-carousel.js`
- **Duplication level:** 3+ places with slightly different implementations
- **Impact:** Genre filtering inconsistencies, hard to update aliases
- **Fix time:** 2 hours
- **Refactor to:** `utils/genre-utils.js`

#### Business Rules & Scoring Scales
- **File locations:** `game-data.js` (2000+ lines with embedded configs)
- **Duplication level:** Criteria repeated, tier calculations scattered
- **Impact:** Can't find or update business logic easily
- **Fix time:** 4 hours
- **Refactor to:** `config/` directory (split into multiple files)

#### Cache Busting Version
- **File locations:** `reviews-carousel.js`, `game-data.js`, 7+ HTML files
- **Duplication level:** Multiple different version strings
- **Impact:** Inconsistent cache invalidation strategy
- **Fix time:** 30 minutes
- **Refactor to:** `config/cache-config.js`

---

### 🟠 MODERATE (Improve Next)

#### CSS Utilities & Components
- **Duplication:** `.bonus`, `.penalty`, `.neutral`, `.tier-1` through `.tier-5` classes repeated
- **Locations:** Multiple CSS files
- **Impact:** Maintenance burden, larger CSS files
- **Fix:** Consolidate to `css/utilities.css`

#### Event Handling Patterns
- **Duplication:** Pointer/mouse drag logic in `filter-block.js`
- **Reusability:** Could be used in other scrollable components
- **Impact:** Duplicated code when new scrollable components added
- **Fix:** Extract to `utils/scroll-utils.js`

#### Media Query Breakpoints
- **Inconsistency:** 1024px vs 1240px used in different files
- **Impact:** Responsive design harder to manage
- **Fix:** Centralize to `css/breakpoints.css`

#### HTML Navigation Markup
- **Duplication:** Same navbar markup on all pages
- **Impact:** Changes require editing multiple HTML files
- **Fix:** Document pattern, plan for templating system

---

### 🟡 MINOR (Nice to Have)

#### Type Checking Patterns
- **Locations:** `game-data.js`, `reviews-color-mapping.js`, multiple files
- **Pattern:** `Number.isFinite()`, `Number()` coercion repeated
- **Fix:** Extract to `utils/type-utils.js`

#### Animation Keyframes
- **Duplication:** Some effects defined inline
- **Locations:** `game-layout.css` and elsewhere
- **Fix:** Consolidate to `css/animations.css`

#### Font Family Definitions
- **Duplication:** Same font stacks repeated in multiple places
- **Fix:** Centralize in CSS variables

---

## Recommended Directory Structure

```
Vegas/
├── js/
│   ├── config/                    # NEW: All application configuration
│   │   ├── cache-config.js
│   │   ├── colors.config.js (from tier-mapping.js)
│   │   ├── genres.config.js (from filter-block.js)
│   │   ├── scoring-rules.js (from game-data.js)
│   │   └── ui-config.js
│   │
│   ├── utils/                     # NEW: Reusable utilities & helpers
│   │   ├── genre-utils.js (from filter-block.js)
│   │   ├── scroll-utils.js (refactor from filter-block.js)
│   │   ├── type-utils.js (new helpers)
│   │   ├── dom-utils.js (new helpers)
│   │   └── cache-utils.js (from cache-config.js)
│   │
│   ├── services/                  # NEW: Business logic & data management
│   │   ├── game-data-service.js (refactor from reviews-carousel.js)
│   │   ├── filter-service.js (refactor from filter-block.js)
│   │   └── carousel-service.js (refactor from reviews-carousel.js)
│   │
│   ├── [existing files stay]
│   ├── burger-menu.js
│   ├── filter-block.js            # REFACTOR: Reduce to UI logic only
│   ├── game-data.js               # REFACTOR: Remove configs, keep logic
│   ├── game-layout.js
│   ├── reviews-carousel.js        # REFACTOR: Use services instead
│   ├── reviews-color-mapping.js   # REFACTOR: Move to config/
│   ├── reviews-parallax.js
│   ├── see-more.js
│   └── spotlight.js
│
├── css/
│   ├── config/                    # NEW: CSS configuration
│   │   ├── variables.css          # All CSS variables (from multiple :root)
│   │   └── breakpoints.css        # Media queries (new centralization)
│   │
│   ├── utilities/                 # NEW: Reusable CSS classes
│   │   ├── colors.css             (from multiple files)
│   │   ├── typography.css         (new)
│   │   ├── spacing.css            (new)
│   │   ├── layout.css             (new)
│   │   ├── shadows.css            (new)
│   │   └── animations.css         (from game-layout.css)
│   │
│   ├── [existing files stay, reduced in size]
│   ├── style.css                  # REFACTOR: Remove duplicates
│   ├── navbar.css
│   ├── about-pillar-cards.css     # REFACTOR: Use centralized colors
│   ├── game-cards.css             # REFACTOR: Extract utilities
│   ├── game-cards-small.css
│   ├── game-layout.css            # REFACTOR: Extract animations
│   ├── reviews-carousel.css
│   ├── reviews-parallax.css
│   └── filter-block.css
│
└── [other directories stay the same]
```

---

## Refactoring Checklist

### Priority 1 - Color System (1 hour)
- [ ] Create `js/config/colors.config.js` with TIER_COLORS export
- [ ] Update `reviews-color-mapping.js` to import from config
- [ ] Create `css/config/variables.css` with all CSS color variables
- [ ] Update all CSS files to import variables.css
- [ ] Remove duplicate :root color declarations from style.css, game-cards.css, etc.
- [ ] Test: colors display correctly on all pages

### Priority 2 - Genre Utils (2 hours)
- [ ] Create `js/utils/genre-utils.js`
- [ ] Export: GENRE_ALIASES, normalizeGenre(), matchesGenre(), getGenreVariants()
- [ ] Update `filter-block.js` to import and use
- [ ] Update `game-data.js` to use shared utilities
- [ ] Update `reviews-carousel.js` to use shared utilities
- [ ] Remove duplicate implementations from all files
- [ ] Test: genre filtering works across all pages

### Priority 3 - Cache Config (30 minutes)
- [ ] Create `js/config/cache-config.js`
- [ ] Export: CACHE_VERSION constant and withCacheBust() function
- [ ] Update `reviews-carousel.js` to import from config
- [ ] Update `game-data.js` to import from config
- [ ] Update all HTML files to use consistent version string (in separate script)
- [ ] Test: cache invalidation works properly

### Priority 4 - Business Rules (4 hours)
- [ ] Create `js/config/scoring-rules.js`
- [ ] Move BENCHMARK_CRITERIA from game-data.js (lines ~50-400)
- [ ] Move CRITERION_ALIASES from game-data.js
- [ ] Create `js/config/tier-rules.js` with scoring thresholds
- [ ] Move TOTAL_SCORE_TIERS logic
- [ ] Update game-data.js to import from config
- [ ] Verify: criteria display correctly on About & Game pages

### Priority 5 - CSS Utilities (2 hours)
- [ ] Create `css/utilities/colors.css` with .u-bonus, .u-penalty, .u-neutral
- [ ] Create `css/utilities/tiers.css` with .u-tier-1 through .u-tier-5
- [ ] Update HTML/templates to use utility classes
- [ ] Remove duplicate class definitions from individual CSS files
- [ ] Test: all visual styles apply correctly

### Priority 6 - Refactor Large Files (8 hours)
- [ ] Extract logic from `game-data.js` into services
- [ ] Extract logic from `filter-block.js` into services
- [ ] Extract logic from `reviews-carousel.js` into services
- [ ] Create service files with clear interfaces
- [ ] Test: all functionality works after refactoring

---

## Testing After Refactoring

### Functional Tests
- [ ] All games load on games.html
- [ ] Genre filtering works correctly
- [ ] Year range filtering works
- [ ] Publisher filtering works
- [ ] Best/Worst toggle works
- [ ] Color tier system displays correctly
- [ ] Carousel scrolling works
- [ ] Game detail pages load
- [ ] About page displays correctly
- [ ] Navbar works on all pages
- [ ] Mobile menu works

### Visual Regression Tests
- [ ] Colors match design on all pages
- [ ] Layout responsive at all breakpoints (412px, 768px, 1024px, 1240px+)
- [ ] Shadows and glows render correctly
- [ ] Animations play smoothly
- [ ] No flashing or loading artifacts

### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] No console errors or warnings
- [ ] No missing resources (404s)
- [ ] Cache headers working correctly

---

## File-by-File Refactoring Plan

### game-data.js (2000+ lines → ~500 lines)
**Remove to:**
- `benchmarkCriteria` → `config/scoring-rules.js`
- `criterionAliases` → `config/scoring-rules.js`
- `fallbackFindingsBySlug` → `config/game-defaults.js`
- `pillarSelectors` → `config/dom-selectors.js`
- `pillarMaxByKey` → `config/scoring-scales.js`

**Keep in game-data.js:**
- `withJsonCacheBust()` → move to `utils/cache-utils.js`
- Main logic that processes game data
- Functions that transform config into DOM

**Impact:** Easier to navigate, clearer separation of data vs. logic

### filter-block.js (300+ lines → ~150 lines)
**Remove to:**
- `genreAliases` → `config/genres.config.js`
- `normalizeFilterValue()` → `utils/genre-utils.js`
- `getGenreValues()` → `utils/genre-utils.js`
- `cardMatchesGenre()` → `utils/genre-utils.js`
- `bindScrollablePills()` → `utils/scroll-utils.js`

**Keep in filter-block.js:**
- DOM event binding for filter UI
- Filter state management
- Apply filters logic

### reviews-carousel.js (300+ lines → ~150 lines)
**Extract to:**
- `globalGameData` logic → `services/game-data-service.js`
- Carousel population logic → `services/carousel-service.js`

**Keep in reviews-carousel.js:**
- Initialize carousels on page load
- Wire up service to DOM

---

## Git Strategy

### Commit Order (for atomic, reviewable changes)
1. Create config/ and utils/ directories with new files
2. Update imports in existing files
3. Remove duplicate code from original locations
4. Run full test suite
5. Minor file cleanup and formatting

### Commit Messages
```
feat: centralize color configuration

- Create config/tier-config.js with TIER_COLORS
- Update all CSS files to import from centralized variables.css
- Remove duplicate :root declarations
- Update reviews-color-mapping.js to use config

Fixes: Inconsistent color definitions across files
Reduces: ~100 lines of duplication
```

---

## Before & After Examples

### Example 1: Genre Handling
```javascript
// BEFORE - scattered across 3 files
const genreAliases = { fps: [...], rts: [...], ... };
function normalizeFilterValue(value) { ... }
function cardMatchesGenre(cardGenre, selectedGenre) { ... }

// AFTER - single location
import { normalizeGenre, matchesGenre } from '../utils/genre-utils.js';

// Usage: same as before, but centralized
const normalized = normalizeGenre(value);
const matches = matchesGenre(cardGenre, selected);
```

### Example 2: Color Configuration
```css
/* BEFORE - repeated in multiple files */
--color-azure-blue: #3A86FF;
--color-blue-violet: #8338EC;

/* AFTER - centralized import */
@import 'config/variables.css';

/* Variables now available */
color: var(--tier-5-color);
box-shadow: var(--shadow-tier-5);
```

---

## Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Break existing functionality | Medium | High | Comprehensive testing before merge |
| Performance regression | Low | Medium | Monitor load times, bundle size |
| Styling issues from CSS refactor | Medium | Medium | Visual regression testing |
| Module load order problems | Low | High | Use explicit imports, avoid globals |
| Git conflicts during merge | Medium | Low | Coordinate changes, merge frequently |

---

## Documentation to Create

1. **Architecture Decision Record (ADR)**
   - Why we're centralizing configuration
   - Benefits of modular approach
   - When to add to config vs. services

2. **Module Guidelines**
   - What goes in utils/ vs. services/ vs. config/
   - Export conventions
   - Naming conventions

3. **Configuration Guide**
   - How to update business rules
   - How to add new genres
   - How to change colors/tiers

4. **Contributing Guide**
   - How to add new features (which file structure to use)
   - Code style conventions
   - Testing requirements

---

## Success Metrics

After refactoring, the codebase should:
- ✅ Have 0 duplicated configuration values
- ✅ Have <5% duplicated utility functions
- ✅ Have clear separation between data, logic, and presentation
- ✅ Have explicit dependency imports (no implicit globals)
- ✅ Have all business rules in config/ directory
- ✅ Have 80%+ test coverage for utils and services
- ✅ Pass full functional test suite
- ✅ Maintain same or better performance

---

## Questions to Answer During Refactoring

1. **Should genre matching be case-insensitive?** (Currently is, but not documented)
2. **What's the correct behavior for missing game data?** (fallbackFindingsBySlug handles this, but inconsistently)
3. **Should tier colors be exposed to JavaScript or only CSS?** (Currently in both places)
4. **How should new genres be added?** (Currently requires updating 3+ files)
5. **What's the intended cache busting strategy?** (Date.now() vs. version string - pick one)

---

## Timeline Estimate

| Phase | Duration | Complexity |
|-------|----------|-----------|
| Phase 1: Configuration Centralization | 2-3 days | Low-Medium |
| Phase 2: Utility Extraction | 2-3 days | Medium |
| Phase 3: Service Refactoring | 3-4 days | High |
| Phase 4: Testing & QA | 2-3 days | Medium |
| Phase 5: Documentation | 1-2 days | Low |
| **Total** | **10-15 days** | **Medium** |

---

## Resources

### Recommended Reading
- [The Twelve-Factor App - Configuration](https://12factor.net/config)
- [Clean Code - By Robert C. Martin](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)
- [Refactoring - By Martin Fowler](https://refactoring.com/)

### Tools
- ESLint for code quality
- Prettier for code formatting
- Jest for unit testing
- Cypress for integration testing

---

## Next Steps

1. **Review this analysis** with the team
2. **Prioritize** which refactorings to tackle first
3. **Create feature branch** for refactoring work
4. **Start with Phase 1** (configuration centralization)
5. **Run tests** frequently
6. **Get code review** before merging
7. **Document findings** in project

---

Generated: 2026-09-18
Last Updated: 2026-09-18
