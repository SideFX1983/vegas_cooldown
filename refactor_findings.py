#!/usr/bin/env python3
"""
Refactor game findings fields to sound more personalized and fun.
Removes 'pulse' terminology and makes content more engaging.
"""

import json
import os
import re
from pathlib import Path

# Define the refactoring patterns
FINDINGS_REPLACEMENTS = {
    "values_findings": lambda text: re.sub(
        r'Values pulse:',
        "Here's what the wallet-friendly breakdown looks like:",
        text
    ),
    "ethics_findings": lambda text: re.sub(
        r'Ethics pulse:',
        "The devs showed up and delivered on their promises with:",
        text
    ),
    "gameplay_findings": lambda text: re.sub(
        r'Gameplay pulse:',
        "Time to beat it and what you get from it:",
        text
    ),
    "accessibility_findings": lambda text: re.sub(
        r'Accessibility pulse:',
        "Getting everyone into the game—here's how well they did:",
        text
    ),
    "standards_findings": lambda text: re.sub(
        r'Standards pulse:',
        "Real-world performance and player verdict:",
        text
    ),
}

def refactor_game_data(game_data):
    """Refactor the findings fields in a single game entry."""
    if "content" in game_data:
        content = game_data["content"]
        for field_name, replacer in FINDINGS_REPLACEMENTS.items():
            if field_name in content:
                content[field_name] = replacer(content[field_name])
    return game_data

def refactor_json_file(file_path):
    """Refactor all games in a JSON file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Refactor each game entry
        if isinstance(data, list):
            data = [refactor_game_data(game) for game in data]
        elif isinstance(data, dict):
            data = refactor_game_data(data)
        
        # Write back to file with proper formatting
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        return True, len(data) if isinstance(data, list) else 1
    except Exception as e:
        return False, str(e)

def main():
    """Main refactoring process."""
    json_dir = Path(__file__).parent / "json"
    json_files = sorted(json_dir.glob("*.json"))
    
    print("🎮 Starting game findings refactoring...\n")
    
    total_games = 0
    successful_files = 0
    
    for json_file in json_files:
        # Skip the input_json subfolder copies
        if "input_json" in str(json_file):
            continue
        
        print(f"📝 Processing: {json_file.name}", end=" ... ")
        success, result = refactor_json_file(json_file)
        
        if success:
            total_games += result
            successful_files += 1
            print(f"✅ ({result} games refactored)")
        else:
            print(f"❌ Error: {result}")
    
    print(f"\n✨ Refactoring complete!")
    print(f"   Files processed: {successful_files}")
    print(f"   Total games updated: {total_games}")
    print(f"\n📌 Changes made:")
    print(f"   • 'Values pulse:' → 'Here's what the wallet-friendly breakdown looks like:'")
    print(f"   • 'Ethics pulse:' → 'The devs showed up and delivered on their promises with:'")
    print(f"   • 'Gameplay pulse:' → 'Time to beat it and what you get from it:'")
    print(f"   • 'Accessibility pulse:' → 'Getting everyone into the game—here's how well they did:'")
    print(f"   • 'Standards pulse:' → 'Real-world performance and player verdict:'")

if __name__ == "__main__":
    main()
