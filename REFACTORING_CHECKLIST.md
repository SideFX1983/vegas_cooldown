# Vegas Cooldown - Refactoring Checklist

**Track progress as you work through the refactoring**

---

## PHASE 1: Foundation Setup (0.5 days)

### Create Directory Structure
```
[ ] Create js/config/ directory
    - Add .gitkeep file
    
[ ] Create js/utils/ directory
    - Add .gitkeep file
    
[ ] Create js/services/ directory
    - Add .gitkeep file
    
[ ] Create css/config/ directory
    - Add .gitkeep file
    
[ ] Create css/utilities/ directory
    - Add .gitkeep file
```

### Verify Setup
```
[ ] Run: ls -la js/config/ js/utils/ js/services/
[ ] Run: ls -la css/config/ css/utilities/
[ ] All directories exist and are accessible
```

---

## PHASE 2: Color Configuration (1 day)

### Create Color Config File
```
[ ] Create js/config/tier-config.js
[ ] Define TIER_COLORS object with all 5 tiers:
    [ ] Tier 5: #3A86FF (Azure Blue)
    [ ] Tier 4: #8338EC (Blue Violet)
    [ ] Tier 3: #FF006E (Neon Pink)
    [ ] Tier 2: #FB5607 (Blaze Orange)
    [ ] Tier 1: #FFBE0B (Amber Gold)
[ ] Export getTierColor(tier) function
[ ] Export TIER_COLORS constant
[ ] Add JSDoc comments
```

### Update JavaScript Files
```
[ ] Update js/reviews-color-mapping.js
    [ ] Import from config/tier-config.js
    [ ] Remove local TIER_COLORS definition
    [ ] Update getTierColor() to use config
    [ ] Test: npm test or visual check

[ ] Update js/reviews-carousel.js
    [ ] No changes needed (doesn't use colors directly)
    
[ ] Update js/filter-block.js
    [ ] No changes needed (doesn't use colors directly)
    
[ ] Update js/game-data.js
    [ ] No changes needed (doesn't use colors directly)
```

### Create CSS Variables File
```
[ ] Create css/config/variables.css
[ ] Move all :root variable definitions:
    [ ] Copy --color-* variables
    [ ] Copy --neon-* variables
    [ ] Copy --bg-* variables
    [ ] Copy --text-* variables
    [ ] Copy --card-* variables
    [ ] Add new variables for consistency
[ ] Add comments grouping related variables
```

### Update CSS Files
```
[ ] Create import line: @import 'config/variables.css';

[ ] In css/style.css:
    [ ] Add import at top
    [ ] Remove duplicate color definitions from :root
    [ ] Verify styles still apply

[ ] In css/game-cards.css:
    [ ] Add import at top
    [ ] Remove duplicate :root definitions
    [ ] Verify cards render correctly

[ ] In css/about-pillar-cards.css:
    [ ] Add import at top
    [ ] Remove duplicate color definitions
    [ ] Verify pillar cards display

[ ] In css/navbar.css:
    [ ] Add import at top
    [ ] Update any hardcoded colors to use variables
    [ ] Verify navbar renders

[ ] In css/reviews-carousel.css:
    [ ] Add import at top
    [ ] Update any color references
    [ ] Verify carousel displays

[ ] Check all remaining CSS files:
    [ ] game-cards-small.css - import variables
    [ ] game-layout.css - import variables
    [ ] reviews-parallax.css - import variables
    [ ] filter-block.css - import variables
```

### Testing - Color Configuration
```
[ ] Visual Test - All pages:
    [ ] index.html - colors correct
    [ ] games.html - tier colors display correctly
    [ ] game.html - card colors correct
    [ ] about.html - pillar colors correct
    [ ] recent.html - carousel colors correct
    [ ] contact.html - nav colors correct

[ ] Console Checks:
    [ ] npm run build (if available)
    [ ] No CSS warnings/errors
    [ ] No duplicate variable definitions
    [ ] Check Firefox DevTools for CSS variables

[ ] Cross-browser Testing:
    [ ] Chrome - colors match
    [ ] Firefox - colors match
    [ ] Safari - colors match

[ ] Performance:
    [ ] Page load time same as before
    [ ] No render delays
```

---

## PHASE 3: Genre Utilities (1 day)

### Create Genre Utils File
```
[ ] Create js/utils/genre-utils.js
[ ] Define exports:
    [ ] GENRE_ALIASES object (copy from filter-block.js)
    [ ] normalizeGenre(value) function
    [ ] getGenreVariants(genre) function
    [ ] matchesGenre(cardGenre, selectedGenre) function
    [ ] matchesCarouselGenre(carouselGenre, selectedGenre) function
[ ] Add JSDoc comments for each function
[ ] Add error handling for null/undefined values
```

### Update filter-block.js
```
[ ] Add at top: import * as genreUtils from '../utils/genre-utils.js';

[ ] Replace local definitions:
    [ ] Remove: const genreAliases = { ... };
    [ ] Replace normalizeFilterValue() call with genreUtils.normalizeGenre()
    [ ] Replace cardMatchesGenre() with genreUtils.matchesGenre()
    [ ] Replace carouselMatchesGenre() with genreUtils.matchesCarouselGenre()

[ ] Update function calls:
    [ ] Search for normalizeFilterValue
    [ ] Replace with genreUtils.normalizeGenre
    [ ] Search for cardMatchesGenre
    [ ] Replace with genreUtils.matchesGenre
    [ ] Search for carouselMatchesGenre
    [ ] Replace with genreUtils.matchesCarouselGenre

[ ] Test after changes:
    [ ] Genre filtering works
    [ ] Genre aliases work
    [ ] No console errors
```

### Update game-data.js
```
[ ] Add at top: import * as genreUtils from '../utils/genre-utils.js';

[ ] Find and replace normalizeFilterValue:
    [ ] Search for normalizeFilterValue occurrences
    [ ] Replace with genreUtils.normalizeGenre()

[ ] Test after changes:
    [ ] Game page genre displays correctly
    [ ] Genre filtering works
    [ ] No console errors
```

### Update reviews-carousel.js
```
[ ] Add at top: import * as genreUtils from '../utils/genre-utils.js';

[ ] Find any genre-related functions:
    [ ] Update to use centralized utils

[ ] Test after changes:
    [ ] Carousel genre filtering works
    [ ] Genre labels display correctly
```

### Testing - Genre Utilities
```
[ ] Functional Tests:
    [ ] games.html - filter by each genre
    [ ] Verify correct games appear
    [ ] Test genre aliases (FPS, fps, First-person shooter all work)
    [ ] Test RTS/Real-Time Strategy alias
    [ ] Test partial matching
    [ ] Clear filters and verify all games show

[ ] Edge Cases:
    [ ] Unknown genre doesn't crash
    [ ] Mixed case genres work (FPS vs fps)
    [ ] Genres with special characters work
    [ ] Empty genre field handled

[ ] Console Check:
    [ ] No errors or warnings
    [ ] No "undefined" references
```

---

## PHASE 4: Cache Busting Unification (0.5 days)

### Create Cache Config File
```
[ ] Create js/config/cache-config.js
[ ] Define exports:
    [ ] CACHE_VERSION = 'json-all-files-20260918-premium' (or next version)
    [ ] withCacheBust(path) function
[ ] Add JSDoc comments
```

### Update JavaScript Files
```
[ ] In reviews-carousel.js:
    [ ] Add: import { CACHE_VERSION, withCacheBust } from '../config/cache-config.js';
    [ ] Remove: const JSON_CACHE_BUST_VERSION = ...
    [ ] Replace: function withJsonCacheBust() with imported withCacheBust()
    [ ] Replace all: withJsonCacheBust(path) → withCacheBust(path)

[ ] In game-data.js:
    [ ] Add: import { CACHE_VERSION, withCacheBust } from '../config/cache-config.js';
    [ ] Replace local withJsonCacheBust() with imported version
    [ ] Replace all calls to use new function
```

### Update HTML Files
```
[ ] Check version string consistency across pages:
    [ ] index.html
    [ ] games.html
    [ ] game.html
    [ ] about.html
    [ ] recent.html
    [ ] contact.html
    [ ] news.html
    [ ] accessibility.html

[ ] Make all use same version string:
    [ ] If using ?v=... format, use: ?v=20260918
    [ ] Apply consistently to all CSS links
    [ ] Document: Next time version needed, update BOTH
        - js/config/cache-config.js
        - ALL HTML files

[ ] Update all <link> tags:
    [ ] style.css?v=...
    [ ] navbar.css?v=...
    [ ] game-cards.css?v=...
    [ ] etc.
```

### Testing - Cache Busting
```
[ ] Verify version consistency:
    [ ] Open DevTools Network tab
    [ ] Reload page
    [ ] Check all resource URLs
    [ ] Confirm version parameter present
    [ ] Confirm same version used everywhere

[ ] Clear browser cache:
    [ ] Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
    [ ] Verify new version loaded
    [ ] Check headers for cache directives

[ ] Console Check:
    [ ] No resource loading errors
    [ ] No 404s for CSS/JS files
```

---

## PHASE 5: Business Rules Extraction (2 days)

### Create Scoring Rules Config
```
[ ] Create js/config/scoring-rules.js
[ ] Copy from game-data.js:
    [ ] benchmarkCriteria object
    [ ] criterionAliases object
    [ ] Add SCORING_SCALES export
[ ] Add JSDoc comments
[ ] Organize by category (Values, Ethics, Gameplay, etc.)
```

### Create Tier Scoring Config
```
[ ] Create js/config/tier-scoring.js
[ ] Define scoring ranges:
    [ ] VALUES scale (0-25 points)
    [ ] ETHICS scale (0-25 points)
    [ ] GAMEPLAY scale (0-10 points)
    [ ] ACCESSIBILITY scale (0-10 points)
    [ ] STANDARDS scale (0-30 points)
    [ ] TOTAL_SCORE tiers (0-100 with tier assignments)
[ ] Export getTierFromTotalScore() function
[ ] Export getTierFromStatValue() function
```

### Create Game Defaults Config
```
[ ] Create js/config/game-defaults.js
[ ] Copy from game-data.js:
    [ ] fallbackFindingsBySlug object
    [ ] Add default game data structure
[ ] Export fallback data getter function
```

### Create DOM Selectors Config
```
[ ] Create js/config/dom-selectors.js
[ ] Move from game-data.js:
    [ ] pillarSelectors object
    [ ] Export for reuse
[ ] Add navigation selectors
[ ] Add filter selectors
```

### Update game-data.js
```
[ ] Add imports at top:
    [ ] import { BENCHMARK_CRITERIA, CRITERION_ALIASES } from '../config/scoring-rules.js';
    [ ] import { getTierFromTotalScore, getTierFromStatValue } from '../config/tier-scoring.js';
    [ ] import { FALLBACK_FINDINGS } from '../config/game-defaults.js';
    [ ] import { PILLAR_SELECTORS } from '../config/dom-selectors.js';

[ ] Remove local definitions of:
    [ ] benchmarkCriteria
    [ ] criterionAliases
    [ ] fallbackFindingsBySlug
    [ ] pillarSelectors
    [ ] pillarMaxByKey

[ ] Find all references and update:
    [ ] Search: benchmarkCriteria[
    [ ] Replace: const criteria = BENCHMARK_CRITERIA
    [ ] Search: criterionAliases[
    [ ] Replace: use CRITERION_ALIASES instead

[ ] Verify file size:
    [ ] game-data.js should reduce from 2000+ to ~500-800 lines
    
[ ] Test after changes:
    [ ] game.html loads correctly
    [ ] game details display
    [ ] pillar cards render
    [ ] scoring displays correctly
```

### Update reviews-carousel.js
```
[ ] If using tier scoring:
    [ ] Add: import { getTierFromTotalScore } from '../config/tier-scoring.js';
    [ ] Replace local getTierFromTotalScore logic
    
[ ] If using score cutoffs:
    [ ] Add: import { TOTAL_SCORE_TIERS } from '../config/tier-scoring.js';
    [ ] Replace hardcoded 30 cutoff with config value
```

### Testing - Business Rules
```
[ ] Load game.html:
    [ ] All game details display
    [ ] Scores calculate correctly
    [ ] Tier colors match scoring
    [ ] Pillar cards show correct content
    [ ] Descriptions display

[ ] Test about.html:
    [ ] All scoring criteria display
    [ ] Descriptions are correct
    [ ] Points values match config
    [ ] Expansion/collapse works

[ ] Test games.html carousel:
    [ ] Games load in correct order
    [ ] Scoring displays correctly
    [ ] Tier colors apply correctly

[ ] Console Check:
    [ ] No import errors
    [ ] No undefined references
    [ ] No scoring calculation errors
```

---

## PHASE 6: CSS Utilities (1 day)

### Create CSS Utilities File
```
[ ] Create css/utilities/colors.css
[ ] Define utility classes:
    [ ] .u-bonus - blue, bold
    [ ] .u-penalty - red, bold
    [ ] .u-neutral - neutral color
    [ ] .u-text-tier-1 through .u-text-tier-5
    [ ] .u-bg-tier-1 through .u-bg-tier-5
    [ ] .u-shadow-tier-1 through .u-shadow-tier-5
[ ] Add comments
```

### Create Animation Utilities File
```
[ ] Create css/utilities/animations.css
[ ] Move keyframes from game-layout.css:
    [ ] @keyframes shimmer
    [ ] @keyframes game-card-shimmer
    [ ] Any other animations
[ ] Add reusable animation utilities:
    [ ] .u-animate-fade-in
    [ ] .u-animate-slide-up
[ ] Add comments
```

### Update CSS Files
```
[ ] At top of each CSS file, add imports:
    [ ] @import '../utilities/colors.css';
    [ ] @import '../utilities/animations.css';

[ ] Files to update:
    [ ] style.css
    [ ] game-cards.css
    [ ] about-pillar-cards.css
    [ ] game-layout.css
    [ ] reviews-carousel.css
    [ ] navbar.css
    [ ] filter-block.css

[ ] Replace class definitions with utility classes:
    [ ] Search: .bonus {
    [ ] Replace: use class="u-bonus" instead (in HTML)
    [ ] Or link from CSS with @extend (if using preprocessor)

[ ] Remove duplicate definitions:
    [ ] Remove duplicate .bonus definitions
    [ ] Remove duplicate .tier-1 definitions
    [ ] Remove duplicate animation keyframes
```

### Update HTML & JS to Use Utilities
```
[ ] In HTML templates:
    [ ] Search: class="bonus"
    [ ] Replace: class="u-bonus"
    [ ] Search: class="penalty"
    [ ] Replace: class="u-penalty"

[ ] In JS that adds classes:
    [ ] Search: classList.add('bonus')
    [ ] Replace: classList.add('u-bonus')
    [ ] Similar for other utility classes

[ ] Files to update:
    [ ] game.html template sections
    [ ] about.html
    [ ] Any JS dynamically adding classes
```

### Testing - CSS Utilities
```
[ ] Visual Regression Testing:
    [ ] index.html - layouts match
    [ ] games.html - carousel looks same
    [ ] game.html - card displays correctly
    [ ] about.html - pillar cards look correct

[ ] Color Verification:
    [ ] All bonus text is blue
    [ ] All penalty text is red
    [ ] All tier colors correct
    [ ] No missing colors

[ ] Animation Check:
    [ ] Shimmer animation smooth
    [ ] Card hover effects work
    [ ] Parallax works on reviews

[ ] Console Check:
    [ ] No CSS parse errors
    [ ] No missing class warnings
```

---

## PHASE 7: Final Integration & Testing (1 day)

### Code Quality Check
```
[ ] Run linter (if available):
    [ ] ESLint on all JS files
    [ ] Stylelint on all CSS files
    [ ] Fix any warnings

[ ] Check for dead code:
    [ ] Search for old functions that were replaced
    [ ] Verify they're not used elsewhere
    [ ] Remove if truly dead

[ ] Verify no circular dependencies:
    [ ] config/ files don't import from other modules
    [ ] utils/ files don't import from services
    [ ] Follow clear dependency hierarchy
```

### Full Functional Testing
```
[ ] Test each page thoroughly:
    [ ] index.html
        [ ] Hero section displays
        [ ] Buttons work
        [ ] Spotlight effect works
        [ ] Responsive on mobile

    [ ] games.html
        [ ] All carousels load
        [ ] Filter works (genre, year, publisher)
        [ ] Best/Worst toggle works
        [ ] Carousel scrolls smoothly
        [ ] Cards are clickable

    [ ] game.html (test with different games)
        [ ] Game details load
        [ ] Scores display
        [ ] Colors match tiers
        [ ] Pillar cards expand/collapse
        [ ] Notes display
        [ ] Related games show

    [ ] about.html
        [ ] All sections load
        [ ] Pillar cards expand/collapse
        [ ] List items toggle
        [ ] All content readable

    [ ] recent.html
        [ ] Games load and display
        [ ] Filters work
        [ ] Responsive design

    [ ] contact.html
        [ ] Form displays
        [ ] Layout correct

    [ ] news.html
        [ ] Content displays (if exists)

    [ ] accessibility.html
        [ ] Accessibility info displays
```

### Responsive Testing
```
[ ] Mobile (412px):
    [ ] All content fits
    [ ] Navigation works
    [ ] Touch targets adequate
    [ ] No horizontal scroll

[ ] Tablet (768px):
    [ ] Layout adapts
    [ ] Navigation accessible
    [ ] Cards stack appropriately

[ ] Desktop (1024px+):
    [ ] Full layout displayed
    [ ] Sidebars work
    [ ] Multi-column layouts work

[ ] Wide (1240px+):
    [ ] Game page grid displays
    [ ] Extra spacing renders
```

### Browser Compatibility
```
[ ] Chrome (latest):
    [ ] All features work
    [ ] No console errors

[ ] Firefox (latest):
    [ ] All features work
    [ ] CSS variables work
    [ ] No warnings

[ ] Safari (latest):
    [ ] All features work
    [ ] Touch events work (mobile)

[ ] Edge (latest):
    [ ] All features work
```

### Performance Check
```
[ ] Page Load Time:
    [ ] index.html < 2 seconds
    [ ] games.html < 3 seconds
    [ ] game.html < 2 seconds

[ ] No Console Errors:
    [ ] Zero JavaScript errors
    [ ] Zero resource 404s
    [ ] No deprecation warnings

[ ] Network Tab:
    [ ] CSS loads with correct versions
    [ ] JS loads completely
    [ ] JSON files load
    [ ] Images load

[ ] Rendering:
    [ ] No layout shifts
    [ ] No flashing
    [ ] Smooth animations
    [ ] Fast transitions
```

### Git & Documentation
```
[ ] Commit All Changes:
    [ ] git add .
    [ ] git commit -m "Refactor: Centralize configuration and improve maintainability"
    [ ] git push origin refactoring-branch

[ ] Create Pull Request:
    [ ] Link to CODE_ANALYSIS.md
    [ ] Link to REFACTORING_GUIDE.md
    [ ] Add summary of changes
    [ ] Note: No functional changes, only refactoring

[ ] Document Changes:
    [ ] Update ARCHITECTURE.md (if exists, or create)
    [ ] Add config/ directory to documentation
    [ ] Add utils/ directory to documentation
    [ ] Update Contributing Guidelines

[ ] Cleanup:
    [ ] Delete ANALYSIS_SUMMARY.md, CODE_ANALYSIS.md, REFACTORING_GUIDE.md
    [ ] (Move to project wiki or archive)
    [ ] Or keep as reference for future developers
```

---

## PHASE 8: Post-Refactoring (Ongoing)

### Monitoring
```
[ ] Track metrics:
    [ ] Duplication percentage (target: 2-3%)
    [ ] Time to add features (target: -30%)
    [ ] Bug escape rate (target: -70%)
    [ ] Code review time (target: -40%)

[ ] Gather feedback:
    [ ] Team feedback on new structure
    [ ] Identify pain points
    [ ] Note improvements
    [ ] Plan next optimizations
```

### Future Improvements
```
[ ] Consider next phase:
    [ ] Convert to ES modules
    [ ] Add unit tests
    [ ] Extract services
    [ ] Implement state management

[ ] Document decisions:
    [ ] Architecture Decision Records (ADRs)
    [ ] Why certain patterns were chosen
    [ ] When to revisit decisions
```

---

## TROUBLESHOOTING

### If Something Breaks

**Colors Not Displaying:**
```
[ ] Check: @import 'config/variables.css'; at top of CSS files
[ ] Verify: css/config/variables.css exists and has content
[ ] Clear: Browser cache (Cmd+Shift+R)
[ ] Check: DevTools for CSS parse errors
```

**Genre Filtering Not Working:**
```
[ ] Check: js/utils/genre-utils.js exists
[ ] Verify: All functions exported correctly
[ ] Check: imports in filter-block.js are correct
[ ] Debug: console.log() to verify function calls
```

**Game Data Not Loading:**
```
[ ] Check: config files exist and export correctly
[ ] Verify: game-data.js imports from config/
[ ] Check: No circular dependencies
[ ] Debug: Check network tab for failed requests
```

**CSS Utilities Not Applying:**
```
[ ] Check: HTML has correct class names (u-bonus, not bonus)
[ ] Verify: css/utilities/colors.css has .u-bonus definition
[ ] Check: DevTools to see if class is applied
[ ] Clear: Browser cache
```

---

## SIGN-OFF CHECKLIST

Before marking refactoring as complete:

```
[ ] All code compiles/loads without errors
[ ] All pages display correctly
[ ] All features functional
[ ] No regressions detected
[ ] Performance maintained or improved
[ ] No console errors on any page
[ ] Responsive design works at all breakpoints
[ ] Cross-browser compatibility verified
[ ] Code review approved
[ ] Tests pass (if applicable)
[ ] Documentation updated
[ ] Team trained on new structure

Refactoring Completed By: ___________________
Date: ___________________
Sign-Off: ___________________
```

---

## QUICK REFERENCE

### File Locations After Refactoring
```
js/
  config/
    cache-config.js
    tier-config.js
    scoring-rules.js
    tier-scoring.js
    game-defaults.js
    dom-selectors.js
  utils/
    genre-utils.js

css/
  config/
    variables.css
    breakpoints.css
  utilities/
    colors.css
    animations.css
```

### Import Examples
```javascript
// In any JS file needing colors:
import { TIER_COLORS, getTierColor } from '../config/tier-config.js';

// In any JS file needing genres:
import * as genreUtils from '../utils/genre-utils.js';

// In any JS file needing business rules:
import { BENCHMARK_CRITERIA } from '../config/scoring-rules.js';
```

```css
/* At top of any CSS file: */
@import 'config/variables.css';
@import 'utilities/colors.css';
@import 'utilities/animations.css';
```

---

**Last Updated:** September 18, 2026  
**Status:** Ready to Use  
**Version:** 1.0
