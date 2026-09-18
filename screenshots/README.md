# IGDB Gameplay Screenshot Pipeline

Automatically fetches a gameplay screenshot for every game listed in your
JSON files, and resizes/crops it to fit **400×550 px** without distorting
the aspect ratio (it crops instead of squishing when no exact ratio match exists).

Your 8 input files (103 unique games total) are already in `input_json/`.

## 1. Get a free IGDB / Twitch API key (you do this part — it needs your own login)

I can't create this key for you since it requires logging into a personal
Twitch account, but it only takes ~2 minutes:

1. Go to **https://dev.twitch.tv/console/apps/create** and log in (or create
   a free Twitch account if you don't have one).
2. Fill in the "Register Your Application" form:
   - **Name:** anything unique, e.g. `my-screenshot-fetcher`
   - **OAuth Redirect URLs:** `http://localhost`
   - **Category:** `Application Integration`
3. Click **Create**, then find your new app and click **Manage**.
4. Copy the **Client ID** shown on the page.
5. Click **New Secret** to generate a **Client Secret**, and copy it too
   (you won't be able to see it again — if you lose it, just generate a new one).

## 2. Set up the config file

Rename `config.example.json` to `config.json` and paste in your credentials:

```json
{
  "client_id": "your_client_id_here",
  "client_secret": "your_client_secret_here"
}
```

## 3. Install dependencies and run

```bash
pip install -r requirements.txt
python fetch_screenshots.py
```

Images land in `output_images/`, named `<slug>.jpg` — e.g. `cities-skylines.jpg`.

A `run_log.csv` is written after each run showing, per game: whether it was
found on IGDB, whether a screenshot existed, and the resolution of the
source image used. Re-running the script skips games that already have an
output file — use `--force` to redo everything.

## How images are picked and resized

- Only IGDB's `screenshots` field is used (never `cover` or `artworks`), so
  box art and key art are excluded by construction.
- Among a game's available screenshots, the one whose aspect ratio is
  **closest to 400:550** is picked, to minimize cropping.
- The image is scaled up/down to cover a 400×550 frame, then center-cropped
  to fit exactly — it is never stretched or squished.

## Known limitation — please read

IGDB does **not** tag screenshots as "gameplay" vs. "menu" vs. "loading
screen" vs. "cutscene." Its `screenshots` field is generally gameplay-focused
by convention (since publishers upload cover/key art separately to other
fields), but there's no metadata guarantee that a given screenshot isn't a
menu or cutscene frame. This script can't fully guarantee that without an
extra visual-inspection step per image, which isn't built in here. Spot-check
`output_images/` afterward and swap out any that aren't a good fit — the
`run_log.csv` tells you exactly which IGDB entry (game id + matched name)
each image came from, which makes manually re-picking one easy.

## Retrying a bad screenshot

Don't like a screenshot for a game — bad crop, wrong scene, low quality?

1. Create a folder called `find_other_screenshots/` next to `output_images/`
   (same level, i.e. directly inside the pipeline folder).
2. Copy the offending image(s) into it, **keeping the filename exactly as-is**
   (e.g. `cities-skylines.jpg`) — the script matches games by that filename.
3. Run:
   ```bash
   python3 retry_screenshots.py
   ```

For each flagged file, it:
- Re-queries IGDB for that game
- Picks a **different** screenshot than any used before (tracked in
  `screenshot_history.json`, shared with the main script) — so you won't get
  the same rejected image back
- Prefers higher-resolution source images: ~1920×1080 for games from 2001
  onward, ~1024×768 for older titles (soft preference — falls back to the
  best available if IGDB doesn't have that much resolution for a given game)
- Resizes/crops to 400×550 the same way as the first pass (never squished)
- Overwrites the file in `output_images/`
- **Deletes the flagged copy from `find_other_screenshots/` only on success**
  — if no replacement could be found, the file stays there so you know it
  still needs attention, and you can re-run later (e.g. after IGDB gets new
  screenshots added) without losing track of it

Check `retry_log.csv` afterward for anything that couldn't be replaced —
usually because every available screenshot for that game has already been
tried (`no_unused_screenshots`), meaning IGDB simply doesn't have more options
for that title.

**One-time caveat:** your first 103 games were fetched before history
tracking existed. If you flag one of those originals for retry, there's a
small chance (only on this first retry) it re-picks the same image, since
there's nothing recorded yet to exclude. Every run after that is fully
tracked, for every game.

## Files in this folder

- `fetch_screenshots.py` — first-pass pipeline script
- `retry_screenshots.py` — re-fetch script for flagged/rejected screenshots
- `igdb_common.py` — shared logic used by both scripts (don't need to touch this)
- `config.example.json` — rename to `config.json` and add your credentials
- `requirements.txt` — Python dependencies
- `input_json/` — your original 8 game-list files (already copied in)
- `output_images/` — final resized screenshots, one per game (`<slug>.jpg`)
- `find_other_screenshots/` — you create this; drop rejected images here to trigger a re-fetch
- `screenshot_history.json` — created automatically; tracks which IGDB image was used per game
- `run_log.csv` — per-game status/log from `fetch_screenshots.py`
- `retry_log.csv` — per-game status/log from `retry_screenshots.py`
