#!/usr/bin/env python3
"""
IGDB Gameplay Screenshot Fetcher (first pass)
==============================================

Reads every *.json file in ./input_json/ (each a list of game entries with a
"game": {"name": ..., "slug": ..., "release_year": ...} block), looks each
game up on IGDB, grabs a gameplay screenshot, and resizes/crops it to fit
400x550 px WITHOUT distorting the aspect ratio (crop-to-fill, never squish).

Output: ./output_images/<slug>.jpg   (one image per game)
Log:    ./run_log.csv                (per-game outcome)
History: ./screenshot_history.json   (tracks which IGDB image was used per
         game, so a later retry — see retry_screenshots.py — never re-picks
         the same screenshot you rejected)

SETUP (one-time, ~2 minutes): see README.md.

USAGE:
------
    pip install -r requirements.txt
    python3 fetch_screenshots.py

Re-running is safe: games whose output file already exists are skipped
(delete the file, or use --force, to re-fetch it).

Didn't like a result? Don't re-run this script for it — instead see
retry_screenshots.py, which is built for exactly that (and won't repeat the
same screenshot).
"""

import argparse
import csv
import io
import time

import requests

import igdb_common as common
from igdb_common import Image


def process_game(session, headers, game, history, force=False):
    slug = game["slug"]
    out_path = common.OUTPUT_DIR + f"/{slug}.jpg"

    import os
    if os.path.exists(out_path) and not force:
        return {"slug": slug, "name": game["name"], "status": "skipped_existing", "detail": ""}

    try:
        game_id, matched_name = common.igdb_find_game_id(session, headers, game["name"])
        if game_id is None:
            return {"slug": slug, "name": game["name"], "status": "no_igdb_match", "detail": ""}

        shots = common.igdb_get_screenshots(session, headers, game_id)
        if not shots:
            return {
                "slug": slug,
                "name": game["name"],
                "status": "no_screenshots",
                "detail": f"matched_igdb_id={game_id} ({matched_name})",
            }

        used_ids = set(history.get(slug, []))
        best = common.pick_best_screenshot(shots, used_ids, game.get("release_year"))
        if best is None:
            return {
                "slug": slug,
                "name": game["name"],
                "status": "no_unused_screenshots",
                "detail": f"matched_igdb_id={game_id} ({matched_name})",
            }

        img_url = common.igdb_image_url(best["image_id"])
        img_resp = session.get(img_url, timeout=30)
        img_resp.raise_for_status()

        img = Image.open(io.BytesIO(img_resp.content))
        final = common.resize_crop_to_fit(img)

        os.makedirs(common.OUTPUT_DIR, exist_ok=True)
        final.save(out_path, "JPEG", quality=90)

        common.record_used_image(history, slug, best["image_id"])

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
    parser.add_argument("--delay", type=float, default=0.3, help="Seconds to wait between API calls.")
    args = parser.parse_args()

    cfg = common.load_config()
    print("Requesting IGDB/Twitch access token...")
    token = common.get_access_token(cfg["client_id"], cfg["client_secret"])
    headers = common.build_headers(cfg, token)

    games = common.load_games_from_json_dir()
    print(f"Loaded {len(games)} unique games from {common.INPUT_DIR}")

    history = common.load_history()

    import os
    os.makedirs(common.OUTPUT_DIR, exist_ok=True)
    session = requests.Session()
    results = []

    for i, game in enumerate(games, 1):
        print(f"[{i}/{len(games)}] {game['name']} ({game['slug']})...", end=" ", flush=True)
        result = process_game(session, headers, game, history, force=args.force)
        results.append(result)
        print(result["status"])
        time.sleep(args.delay)

    common.save_history(history)

    with open(common.HERE + "/run_log.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["slug", "name", "status", "detail"])
        writer.writeheader()
        writer.writerows(results)

    ok = sum(1 for r in results if r["status"] == "ok")
    skipped = sum(1 for r in results if r["status"] == "skipped_existing")
    failed = len(results) - ok - skipped
    print(f"\nDone. {ok} downloaded, {skipped} already existed, {failed} need attention.")
    print(f"Full log written to run_log.csv")
    if failed:
        print("Check run_log.csv for games with no_igdb_match / no_screenshots / errors.")


if __name__ == "__main__":
    main()
