# Vegas Cooldown Benchmark

An objective and comprehensive video game benchmark tool.

V.E.G.A.S. Cooldown is a static website that benchmarks games across five pillars:

- Values
- Ethics
- Gameplay
- Accessibility
- Standards

The site includes landing, informational, news, games listing, and single-game detail pages. Game content is loaded from local JSON files.

## Project Structure

- `index.html`: Homepage overview.
- `about.html`: Full benchmark rubric and scoring logic.
- `games.html`: Game carousels and filter UI sourced from JSON.
- `news.html`: News-style carousel view sourced from JSON.
- `game.html`: Single-game detail page with pillar breakdown.
- `accessibility.html`, `contact.html`: Supplemental pages.
- `css/`: Stylesheets by feature/page.
- `js/`: UI behavior, carousel rendering, filters, and JSON mapping.
- `json/`: Source benchmark data files.
- `img/`: Site and game artwork.


## Data Notes

- JSON files are versioned in filename form (for example, `*_v1.06.json`).
- Game listing and detail pages use query params and JSON mapping logic from `js/reviews-carousel.js` and `js/game-data.js`.

## License

Private repository content. All rights reserved unless otherwise specified by the repository owner.
