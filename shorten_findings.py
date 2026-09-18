#!/usr/bin/env python3
"""
Shorten game findings to brief impressions (max 150 chars).
Analyzes pillar scores and generates appropriate feedback.
"""

import json
from pathlib import Path

def get_score_impression(score, max_score, pillar_type):
    """Generate impression text based on score range."""
    if max_score == 0:
        return "Not scored."
    
    percentage = (score / max_score) * 100
    
    # Impression templates by category and score range
    if pillar_type == "values":
        if percentage >= 90:
            return "Excellent value. Fair pricing with no aggressive monetization."
        elif percentage >= 70:
            return "Good value. Reasonable pricing with minor monetization concerns."
        elif percentage >= 50:
            return "Mixed value. Some monetization elements present."
        else:
            return "Poor value. Significant monetization or pricing issues."
    
    elif pillar_type == "ethics":
        if percentage >= 90:
            return "Devs delivered honestly. Strong post-launch support and transparency."
        elif percentage >= 70:
            return "Generally trustworthy. Good communication and reasonable feature delivery."
        elif percentage >= 50:
            return "Inconsistent ethics. Some communication gaps or broken promises."
        else:
            return "Ethical concerns. Poor support or misleading marketing."
    
    elif pillar_type == "gameplay":
        if percentage >= 80:
            return "Outstanding content depth. Exceptional campaign length and ending variety."
        elif percentage >= 60:
            return "Solid gameplay. Good campaign length with multiple endings."
        elif percentage >= 40:
            return "Moderate content. Decent playtime but limited replay value."
        else:
            return "Limited gameplay. Short campaign with few outcome variations."
    
    elif pillar_type == "accessibility":
        if percentage >= 70:
            return "Inclusive design. Great accessibility features and language support."
        elif percentage >= 50:
            return "Decent access. Some features included but could be better."
        elif percentage >= 30:
            return "Limited access. Minimal accessibility or localization options."
        else:
            return "Poor accessibility. Few features for disabled players."
    
    elif pillar_type == "standards":
        if percentage >= 80:
            return "Polished release. Strong player reception and technical quality."
        elif percentage >= 60:
            return "Good quality. Generally well-received with solid performance."
        elif percentage >= 40:
            return "Mixed reception. Some technical or support issues."
        else:
            return "Rough launch. Poor reception or significant technical problems."
    
    return "Unrated."

def refactor_game_data(game_data):
    """Refactor findings to brief impressions."""
    if "scores" not in game_data or "content" not in game_data:
        return game_data
    
    pillars = game_data["scores"].get("pillars", {})
    content = game_data["content"]
    
    # Generate impressions for each pillar
    if "values" in pillars:
        score = pillars["values"].get("score", 0)
        max_score = pillars["values"].get("max", 25)
        content["values_findings"] = get_score_impression(score, max_score, "values")
    
    if "ethics" in pillars:
        score = pillars["ethics"].get("score", 0)
        max_score = pillars["ethics"].get("max", 25)
        content["ethics_findings"] = get_score_impression(score, max_score, "ethics")
    
    if "gameplay" in pillars:
        score = pillars["gameplay"].get("score", 0)
        max_score = pillars["gameplay"].get("max", 10)
        content["gameplay_findings"] = get_score_impression(score, max_score, "gameplay")
    
    if "accessibility" in pillars:
        score = pillars["accessibility"].get("score", 0)
        max_score = pillars["accessibility"].get("max", 10)
        content["accessibility_findings"] = get_score_impression(score, max_score, "accessibility")
    
    if "standards" in pillars:
        score = pillars["standards"].get("score", 0)
        max_score = pillars["standards"].get("max", 30)
        content["standards_findings"] = get_score_impression(score, max_score, "standards")
    
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
    
    print("✨ Shortening findings to brief impressions...\n")
    
    total_games = 0
    successful_files = 0
    
    for json_file in json_files:
        if "input_json" in str(json_file):
            continue
        
        print(f"📝 Processing: {json_file.name}", end=" ... ")
        success, result = refactor_json_file(json_file)
        
        if success:
            total_games += result
            successful_files += 1
            print(f"✅ ({result} games)")
        else:
            print(f"❌ Error: {result}")
    
    print(f"\n🎯 Complete!")
    print(f"   Files processed: {successful_files}")
    print(f"   Games updated: {total_games}")
    print(f"\n📌 All findings now:")
    print(f"   • Max 150 characters")
    print(f"   • Score-based impressions")
    print(f"   • High/medium/low assessment")
    print(f"   • No detailed metric breakdown")

if __name__ == "__main__":
    main()
