# JSON Audit Fixes

Latest audit date: 2026-08-02

The `json/` folder currently contains 6 JSON files and 32 total game entries. JSON syntax is valid and no duplicate game names or slugs were found.

## Remaining Fixes

### 1. Replace One Ethics Label Everywhere

Across all JSON files, replace this label:

```text
Pre-launch trailers/feedback adaptations
```

with this exact label:

```text
Pre-launch trailers and community feedback
```

Keep the same score number after the label.

Example:

```text
Pre-launch trailers/feedback adaptations: 5
```

should become:

```text
Pre-launch trailers and community feedback: 5
```

Affected files and counts:

- `json/beat_em_up_games_v1.06.json` - 10 entries
- `json/city_builder_games_v1.06.json` - 7 entries
- `json/first_person_shooter_games_v1.06.json` - 11 entries
- `json/management_simulation_games_v1.06.json` - 1 entry
- `json/metroidvania_games_v1.06.json` - 1 entry
- `json/puzzle_strategy_games_v1.06.json` - 2 entries

### 2. Add Missing FPS Slugs

In `json/first_person_shooter_games_v1.06.json`, 10 entries still have missing or empty `game.slug` values.

Add non-empty slugs for the FPS games missing them. Suggested slugs:

```json
"quake-iii-arena"
"half-life-2-episode-1"
"unreal-tournament-2004"
"bioshock"
"call-of-duty-4-modern-warfare"
"quake"
"bioshock-infinite"
"half-life-2"
"call-of-duty-modern-warfare-2"
"half-life-alyx"
```

Use the exact game names present in `json/first_person_shooter_games_v1.06.json`. The audit reported 10 missing slugs there.

## Required Exact Labels

Use these exact labels in each `content.*_findings` field.

### Values

```text
Launch retail price (USD)
Early access/demo price
Microtransactions at launch
Loot boxes/random rewards
Battle pass/subscription model
In-game advertisements
```

### Ethics

```text
Post-launch support duration
Announcement lead time
Pre-launch trailers and community feedback
Advertised feature delivery at launch
```

### Gameplay

```text
Main campaign/core duration
Outcome/ending variety
```

### Accessibility

```text
Accessibility features
Input methods
Localization and translation
```

### Standards

```text
First-month player review state
Offline playability
Crossplay at launch
Modding support
File size optimization
```

## Findings Format

Each findings field should be semicolon-separated `Label: number` entries.

Example:

```json
"values_findings": "Values pulse: Launch retail price (USD): 5; Early access/demo price: 5; Microtransactions at launch: 5; Loot boxes/random rewards: 5; Battle pass/subscription model: 5; In-game advertisements: 0.",
"ethics_findings": "Ethics pulse: Post-launch support duration: 5; Announcement lead time: 5; Pre-launch trailers and community feedback: 5; Advertised feature delivery at launch: 5.",
"gameplay_findings": "Gameplay pulse: Main campaign/core duration: 0; Outcome/ending variety: 5.",
"accessibility_findings": "Accessibility pulse: Accessibility features: 2; Input methods: 2; Localization and translation: 6.",
"standards_findings": "Standards pulse: First-month player review state: 5; Offline playability: 5; Crossplay at launch: 10; Modding support: 0; File size optimization: 5."
```

## Score Rule

For every game, the numbers in each `*_findings` string must add up to the corresponding pillar score:

```json
"scores": {
  "pillars": {
    "values": { "score": 25, "max": 25 },
    "ethics": { "score": 20, "max": 25 },
    "gameplay": { "score": 5, "max": 10 },
    "accessibility": { "score": 10, "max": 10 },
    "standards": { "score": 25, "max": 30 }
  }
}
```

The sum of all five pillar scores should match `scores.total.score`.
