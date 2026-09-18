"""
Shared helpers for the IGDB screenshot pipeline.
Used by both fetch_screenshots.py (first pass) and retry_screenshots.py
(re-fetch pass for games you flagged as needing a different screenshot).
"""

import glob
import json
import os
import sys

import requests

HERE = os.path.dirname(os.path.abspath(__file__))
INPUT_DIR = os.path.join(HERE, "input_json")
OUTPUT_DIR = os.path.join(HERE, "output_images")
RETRY_DIR = os.path.join(HERE, "find_other_screenshots")
CONFIG_PATH = os.path.join(HERE, "config.json")
HISTORY_PATH = os.path.join(HERE, "screenshot_history.json")

TARGET_W, TARGET_H = 400, 550
TARGET_RATIO = TARGET_W / TARGET_H

IGDB_TOKEN_URL = "https://id.twitch.tv/oauth2/token"
IGDB_API_URL = "https://api.igdb.com/v4"

# Screenshots below this size are usually thumbnails/icons, not real captures.
MIN_SCREENSHOT_WIDTH = 480

# Preferred *source* resolution tiers, used to favor higher-quality screenshots
# when several unused options exist. These are soft preferences, not hard
# requirements — older games often won't have anything this large on IGDB.
RECENT_GAME_YEAR_CUTOFF = 2001
RECENT_TIER_MIN = (1920, 1080)
OLDER_TIER_MIN = (1024, 768)


# --------------------------------------------------------------------------
# Config / auth
# --------------------------------------------------------------------------

def load_config():
    if not os.path.exists(CONFIG_PATH):
        sys.exit(
            f"Missing {CONFIG_PATH}.\n"
            "Create it with your IGDB/Twitch credentials, e.g.:\n"
            '{"client_id": "...", "client_secret": "..."}\n'
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


def build_headers(cfg, token):
    return {"Client-ID": cfg["client_id"], "Authorization": f"Bearer {token}"}


# --------------------------------------------------------------------------
# Game list loading
# --------------------------------------------------------------------------

def load_games_from_json_dir(input_dir=INPUT_DIR):
    """Returns a de-duplicated list of
    {"name":..., "slug":..., "release_year":..., "source_file":...}"""
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
            games.append(
                {
                    "name": name,
                    "slug": slug,
                    "release_year": g.get("release_year"),
                    "source_file": os.path.basename(path),
                }
            )
    return games


def games_by_slug(input_dir=INPUT_DIR):
    return {g["slug"]: g for g in load_games_from_json_dir(input_dir)}


# --------------------------------------------------------------------------
# History (tracks which IGDB image_id was used for each slug, across runs)
# --------------------------------------------------------------------------

def load_history(path=HISTORY_PATH):
    if not os.path.exists(path):
        return {}
    with open(path) as f:
        return json.load(f)


def save_history(history, path=HISTORY_PATH):
    with open(path, "w") as f:
        json.dump(history, f, indent=2)


def record_used_image(history, slug, image_id):
    history.setdefault(slug, [])
    if image_id not in history[slug]:
        history[slug].append(image_id)


# --------------------------------------------------------------------------
# IGDB API calls
# --------------------------------------------------------------------------

def igdb_find_game_id(session, headers, name):
    """Search IGDB for a game by name, return (id, matched_name) or (None, None)."""
    body = f'search "{name}"; fields id,name; limit 5;'
    resp = session.post(f"{IGDB_API_URL}/games", headers=headers, data=body, timeout=30)
    resp.raise_for_status()
    results = resp.json()
    if not results:
        return None, None
    for r in results:
        if r.get("name", "").strip().lower() == name.strip().lower():
            return r["id"], r["name"]
    return results[0]["id"], results[0]["name"]


def igdb_get_screenshots(session, headers, game_id):
    """Return list of screenshot dicts (image_id, width, height) for a game."""
    body = (
        f"fields image_id,width,height; "
        f"where game = {game_id}; "
        f"sort width desc; "
        f"limit 30;"
    )
    resp = session.post(f"{IGDB_API_URL}/screenshots", headers=headers, data=body, timeout=30)
    resp.raise_for_status()
    shots = resp.json()
    return [s for s in shots if s.get("width", 0) >= MIN_SCREENSHOT_WIDTH]


def igdb_image_url(image_id, size="1080p"):
    return f"https://images.igdb.com/igdb/image/upload/t_{size}/{image_id}.jpg"


# --------------------------------------------------------------------------
# Screenshot selection
# --------------------------------------------------------------------------

def resolution_tier_for_year(release_year):
    """Return (min_w, min_h) preferred tier based on release year."""
    if release_year and release_year >= RECENT_GAME_YEAR_CUTOFF:
        return RECENT_TIER_MIN
    return OLDER_TIER_MIN


def pick_best_screenshot(shots, used_image_ids=None, release_year=None):
    """
    Pick the best screenshot from a list, given:
      - shots: list of {"image_id","width","height"}
      - used_image_ids: image_ids to exclude (already tried / rejected)
      - release_year: used to pick a preferred resolution tier

    Preference order:
      1. Not previously used
      2. Meets the resolution tier for the game's era (soft preference)
      3. Closest aspect ratio to the 400x550 target (minimizes cropping)
      4. Higher resolution as a tiebreaker
    """
    used_image_ids = used_image_ids or set()
    candidates = [s for s in shots if s["image_id"] not in used_image_ids]
    if not candidates:
        return None

    min_w, min_h = resolution_tier_for_year(release_year)
    tiered = [s for s in candidates if s["width"] >= min_w and s["height"] >= min_h]
    pool = tiered if tiered else candidates

    def sort_key(s):
        ratio_dist = abs((s["width"] / s["height"]) - TARGET_RATIO)
        return (ratio_dist, -(s["width"] * s["height"]))

    pool.sort(key=sort_key)
    return pool[0]


# --------------------------------------------------------------------------
# Image processing
# --------------------------------------------------------------------------

def resize_crop_to_fit(img, target_w=TARGET_W, target_h=TARGET_H):
    """
    Resize + center-crop an image to exactly target_w x target_h without
    distorting aspect ratio ("cover" behavior: fill the frame, crop overflow).
    """
    img = img.convert("RGB")
    src_w, src_h = img.size
    src_ratio = src_w / src_h
    target_ratio = target_w / target_h

    if abs(src_ratio - target_ratio) < 0.01:
        return img.resize((target_w, target_h), Image.LANCZOS)

    if src_ratio > target_ratio:
        scale_h = target_h
        scale_w = round(src_ratio * scale_h)
    else:
        scale_w = target_w
        scale_h = round(scale_w / src_ratio)

    resized = img.resize((scale_w, scale_h), Image.LANCZOS)
    left = (scale_w - target_w) // 2
    top = (scale_h - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


# Deferred import so this module can be imported even before Pillow-dependent
# parts are needed (keeps error messages cleaner if Pillow isn't installed yet).
try:
    from PIL import Image
except ImportError:
    Image = None
