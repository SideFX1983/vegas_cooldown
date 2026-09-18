#!/usr/bin/env python3
"""
IGDB Gameplay Screenshot Fetcher
=================================

Reads every *.json file in ./input_json/ (each a list of game entries with a
"game": {"name": ..., "slug": ...} block), looks each game up on IGDB, grabs
its highest-quality screenshots, picks the best one, and resizes/crops it to
fit ~400x550 px WITHOUT distorting the aspect ratio (crop-to-fill, never squish).

Output: ./output_images/<slug>.jpg   (one image per game)
A log file (./run_log.csv) records what happened for every game so you can
see matches, misses, and anything that needs a manual look.

SETUP (one-time, ~2 minutes):
------------------------------
1. Go to https://dev.twitch.tv/console/apps/create and log in with (or create)
   a free Twitch account.
2. Register an application:
     - Name: anything, e.g. "my-igdb-fetcher"
     - OAuth Redirect URL: http://localhost
     - Category: "Application Integration"
3. Click "Manage" on your new app, then "New Secret" to get your Client Secret.
4. Copy the Client ID and Client Secret into config.json (same folder as this
   script) like so:

     {
       "client_id": "your_client_id_here",
       "client_secret": "your_client_secret_here"
     }

That's it — this script handles the OAuth token exchange with Twitch
automatically every time it runs (tokens expire, so no need to save one).

USAGE:
------
    pip install requests Pillow
    python fetch_screenshots.py

Re-running is safe: games whose output file already exists are skipped
(delete a file, or use --force, to re-fetch it).
"""

import argparse
import csv
import glob
import io
import json
import os
import sys
import time

import requests
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
INPUT_DIR = os.path.join(HERE, "input_json")
OUTPUT_DIR = os.path.join(HERE, "output_images")
CONFIG_PATH = os.path.join(HERE, "config.json")
LOG_PATH = os.path.join(HERE, "run_log.csv")

TARGET_W, TARGET_H = 400, 550
TARGET_RATIO = TARGET_W / TARGET_H

IGDB_TOKEN_URL = "https://id.twitch.tv/oauth2/token"
IGDB_API_URL = "https://api.igdb.com/v4"

# Screenshots below this size are usually thumbnails/icons, not real captures.
MIN_SCREENSHOT_WIDTH = 480


def load_config():
    if not os.path.exists(CONFIG_PATH):
        sys.exit(
            f"Missing {CONFIG_PATH}.\n"
            "Create it with your IGDB/Twitch credentials, e.g.:\n"
            '{"client_id": "...", "client_secret": "..."}\n'
            "See the setup instructions at the top of this script."
        )
    with open(CONFIG_PATH) as f:
        cfg = json.load(f)
    if not cfg.get("client_id") or not cfg.get("client_secret"):
        sys.exit("config.json must contain both 'client_id' and 'client_secret'.")
    return cfg


def get_access_token(client_id, client_secret):
    resp = requests.post(
        IGDB_TOKEN_URL,
        params={
            "client_id": client_id,
            "client_secret": client_secret,
            "grant_type": "client_credentials",
        },
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def load_games_from_json_dir(input_dir):
    """Returns a de-duplicated list of {"name":..., "slug":..., "source_file":...}"""
    games = []
    seen_slugs = set()
    for path in sorted(glob.glob(os.path.join(input_dir, "*.json"))):
        with open(path) as f:
            entries = json.load(f)
        for entry in entries:
            g = entry.get("game", {})
            name, slug = g.get("name"), g.get("slug")
            if not name or not slug:
                continue
            if slug in seen_slugs:
                continue
            seen_slugs.add(slug)
            games.append({"name": name, "slug": slug, "source_file": os.path.basename(path)})
    return games


def igdb_find_game_id(session, headers, name):
    """Search IGDB for a game by name, return the best-matching game id (or None)."""
    body = f'search "{name}"; fields id,name; limit 5;'
    resp = session.post(f"{IGDB_API_URL}/games", headers=headers, data=body, timeout=30)
    resp.raise_for_status()
    results = resp.json()
    if not results:
        return None, None
    # Prefer an exact (case-insensitive) name match; else take the top search hit.
    for r in results:
        if r.get("name", "").strip().lower() == name.strip().lower():
            return r["id"], r["name"]
    return results[0]["id"], results[0]["name"]


def igdb_get_screenshots(session, headers, game_id):
    """Return list of screenshot dicts (id, image_id, width, height) for a game,
    sorted largest-first."""
    body = (
        f"fields image_id,width,height; "
        f"where game = {game_id}; "
        f"sort width desc; "
        f"limit 20;"
    )
    resp = session.post(f"{IGDB_API_URL}/screenshots", headers=headers, data=body, timeout=30)
    resp.raise_for_status()
    shots = resp.json()
    # Drop tiny images (likely not full gameplay captures)
    return [s for s in shots if s.get("width", 0) >= MIN_SCREENSHOT_WIDTH]


def igdb_image_url(image_id, size="1080p"):
    # IGDB's largest standard size; see https://api-docs.igdb.com/#images
    return f"https://images.igdb.com/igdb/image/upload/t_{size}/{image_id}.jpg"


def resize_crop_to_fit(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    """
    Resize + center-crop an image to exactly target_w x target_h without
    distorting aspect ratio ("cover" behavior: fill the frame, crop overflow).
    """
    img = img.convert("RGB")
    src_w, src_h = img.size
    src_ratio = src_w / src_h

    if abs(src_ratio - TARGET_RATIO) < 0.01:
        # Close enough to exact ratio — just resize.
        return img.resize((target_w, target_h), Image.LANCZOS)

    if src_ratio > TARGET_RATIO:
        # Source is wider than target: match height, crop width.
        scale_h = target_h
        scale_w = round(src_ratio * scale_h)
    else:
        # Source is taller than target: match width, crop height.
        scale_w = target_w
        scale_h = round(scale_w / src_ratio)

    resized = img.resize((scale_w, scale_h), Image.LANCZOS)

    left = (scale_w - target_w) // 2
    top = (scale_h - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def process_game(session, headers, game, force=False):
    slug = game["slug"]
    out_path = os.path.join(OUTPUT_DIR, f"{slug}.jpg")

    if os.path.exists(out_path) and not force:
        return {"slug": slug, "name": game["name"], "status": "skipped_existing", "detail": ""}

    try:
        game_id, matched_name = igdb_find_game_id(session, headers, game["name"])
        if game_id is None:
            return {"slug": slug, "name": game["name"], "status": "no_igdb_match", "detail": ""}

        shots = igdb_get_screenshots(session, headers, game_id)
        if not shots:
            return {
                "slug": slug,
                "name": game["name"],
                "status": "no_screenshots",
                "detail": f"matched_igdb_id={game_id} ({matched_name})",
            }

        # Prefer a screenshot whose aspect ratio is closest to our target —
        # this minimizes how much we need to crop away.
        def ratio_distance(s):
            r = s["width"] / s["height"]
            return abs(r - TARGET_RATIO)

        shots.sort(key=ratio_distance)
        best = shots[0]

        img_url = igdb_image_url(best["image_id"])
        img_resp = session.get(img_url, timeout=30)
        img_resp.raise_for_status()

        img = Image.open(io.BytesIO(img_resp.content))
        final = resize_crop_to_fit(img, TARGET_W, TARGET_H)

        os.makedirs(OUTPUT_DIR, exist_ok=True)
        final.save(out_path, "JPEG", quality=90)

        return {
            "slug": slug,
            "name": game["name"],
            "status": "ok",
            "detail": f"igdb_id={game_id} ({matched_name}), src_res={best['width']}x{best['height']}",
        }

    except requests.HTTPError as e:
        return {"slug": slug, "name": game["name"], "status": "http_error", "detail": str(e)}
    except Exception as e:
        return {"slug": slug, "name": game["name"], "status": "error", "detail": str(e)}


def main():
    parser = argparse.ArgumentParser(description="Fetch IGDB gameplay screenshots for a list of games.")
    parser.add_argument("--force", action="store_true", help="Re-fetch even if the output file already exists.")
    parser.add_argument("--delay", type=float, default=0.3, help="Seconds to wait between API calls (be polite to IGDB).")
    args = parser.parse_args()

    cfg = load_config()
    print("Requesting IGDB/Twitch access token...")
    token = get_access_token(cfg["client_id"], cfg["client_secret"])
    headers = {
        "Client-ID": cfg["client_id"],
        "Authorization": f"Bearer {token}",
    }

    games = load_games_from_json_dir(INPUT_DIR)
    print(f"Loaded {len(games)} unique games from {INPUT_DIR}")

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    session = requests.Session()
    results = []

    for i, game in enumerate(games, 1):
        print(f"[{i}/{len(games)}] {game['name']} ({game['slug']})...", end=" ", flush=True)
        result = process_game(session, headers, game, force=args.force)
        results.append(result)
        print(result["status"])
        time.sleep(args.delay)

    with open(LOG_PATH, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["slug", "name", "status", "detail"])
        writer.writeheader()
        writer.writerows(results)

    ok = sum(1 for r in results if r["status"] == "ok")
    skipped = sum(1 for r in results if r["status"] == "skipped_existing")
    failed = len(results) - ok - skipped
    print(f"\nDone. {ok} downloaded, {skipped} already existed, {failed} need attention.")
    print(f"Full log written to {LOG_PATH}")
    if failed:
        print("Check run_log.csv for games with no_igdb_match / no_screenshots / errors.")


if __name__ == "__main__":
    main()
