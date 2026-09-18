#!/usr/bin/env python3
"""
IGDB Gameplay Screenshot Retry Pass
====================================

Workflow:
  1. You look through ./output_images/ and find screenshots you don't like
     (poor quality, bad crop, wrong vibe, whatever).
  2. Copy (don't need to remove the original) those files into
     ./find_other_screenshots/  — keep the filename exactly as-is
     (it's matched back to a game by its slug, e.g. "cities-skylines.jpg").
  3. Run this script: python3 retry_screenshots.py

For each file found in find_other_screenshots/, this script:
  - Looks up the game by slug in your input_json/ files (for its name and
    release year).
  - Re-queries IGDB for that game's screenshots.
  - Picks the best one EXCLUDING every image already used before (tracked in
    screenshot_history.json, shared with fetch_screenshots.py) — so you won't
    just get the same image back.
  - Prefers higher-resolution source screenshots: ~1920x1080 for games from
    2001 onward, ~1024x768 for older games. This is a soft preference — if
    IGDB doesn't have anything that large for a given game, it falls back to
    the best available unused screenshot.
  - Resizes/crops to 400x550 (same crop-to-fill logic as the first pass —
    never squished).
  - Overwrites the file in output_images/<slug>.jpg with the new pick.
  - Deletes the file from find_other_screenshots/ ONLY on success, so a
    failed lookup stays there for you to retry later (no silent data loss).

A game with no history yet (i.e. you never retried it before, and it was
fetched under an older version of this script before history tracking
existed) may occasionally re-select the same image once, since there's
nothing to exclude yet. Every run after that is fully tracked.

Log: ./retry_log.csv (per-attempt outcome)

USAGE:
------
    python3 retry_screenshots.py
"""

import csv
import io
import os
import time

import requests

import igdb_common as common
from igdb_common import Image

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png"}


def find_flagged_slugs(retry_dir):
    """Return list of (slug, full_path) for every image file in retry_dir."""
    if not os.path.isdir(retry_dir):
        return []
    items = []
    for fname in sorted(os.listdir(retry_dir)):
        stem, ext = os.path.splitext(fname)
        if ext.lower() in SUPPORTED_EXTENSIONS:
            items.append((stem, os.path.join(retry_dir, fname)))
    return items


def process_flagged(session, headers, slug, flagged_path, games_by_slug, history):
    game = games_by_slug.get(slug)
    if game is None:
        return {
            "slug": slug,
            "name": "",
            "status": "unknown_slug",
            "detail": "No game with this slug found in input_json/ — filename may have been changed.",
        }

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
                "detail": f"All {len(shots)} available screenshots for this game have already been tried.",
            }

        img_url = common.igdb_image_url(best["image_id"])
        img_resp = session.get(img_url, timeout=30)
        img_resp.raise_for_status()

        img = Image.open(io.BytesIO(img_resp.content))
        final = common.resize_crop_to_fit(img)

        os.makedirs(common.OUTPUT_DIR, exist_ok=True)
        out_path = os.path.join(common.OUTPUT_DIR, f"{slug}.jpg")
        final.save(out_path, "JPEG", quality=90)

        common.record_used_image(history, slug, best["image_id"])

        # Success — remove the flagged copy so the retry folder stays clean.
        os.remove(flagged_path)

        return {
            "slug": slug,
            "name": game["name"],
            "status": "replaced",
            "detail": f"igdb_id={game_id} ({matched_name}), src_res={best['width']}x{best['height']}",
        }

    except requests.HTTPError as e:
        return {"slug": slug, "name": game["name"], "status": "http_error", "detail": str(e)}
    except Exception as e:
        return {"slug": slug, "name": game["name"], "status": "error", "detail": str(e)}


def main():
    cfg = common.load_config()
    print("Requesting IGDB/Twitch access token...")
    token = common.get_access_token(cfg["client_id"], cfg["client_secret"])
    headers = common.build_headers(cfg, token)

    flagged = find_flagged_slugs(common.RETRY_DIR)
    if not flagged:
        print(f"No files found in {common.RETRY_DIR} — nothing to retry.")
        print("Copy a screenshot you don't like from output_images/ into that folder and run this again.")
        return

    print(f"Found {len(flagged)} flagged screenshot(s) to replace.")

    games_lookup = common.games_by_slug()
    history = common.load_history()

    session = requests.Session()
    results = []

    for i, (slug, path) in enumerate(flagged, 1):
        print(f"[{i}/{len(flagged)}] {slug}...", end=" ", flush=True)
        result = process_flagged(session, headers, slug, path, games_lookup, history)
        results.append(result)
        print(result["status"])
        time.sleep(0.3)

    common.save_history(history)

    log_path = os.path.join(common.HERE, "retry_log.csv")
    with open(log_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["slug", "name", "status", "detail"])
        writer.writeheader()
        writer.writerows(results)

    replaced = sum(1 for r in results if r["status"] == "replaced")
    remaining = len(results) - replaced
    print(f"\nDone. {replaced} replaced, {remaining} still need attention (left in find_other_screenshots/).")
    print(f"Full log written to retry_log.csv")


if __name__ == "__main__":
    main()
