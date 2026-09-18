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

## Files in this folder

- `fetch_screenshots.py` — the pipeline script (this is the one you run)
- `config.example.json` — rename to `config.json` and add your credentials
- `requirements.txt` — Python dependencies
- `input_json/` — your original 8 game-list files (already copied in)
- `output_images/` — created on first run; final resized screenshots go here
- `run_log.csv` — created after each run; per-game status/log
