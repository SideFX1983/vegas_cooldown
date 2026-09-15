#!/usr/bin/env python3
import json
import os
from pathlib import Path

json_dir = Path('json')
findings_fields = ['values_findings', 'ethics_findings', 'gameplay_findings', 'accessibility_findings', 'standards_findings']

results = {}

for json_file in sorted(json_dir.glob('*.json')):
    with open(json_file, 'r') as f:
        data = json.load(f)
    
    if not isinstance(data, list):
        continue
    
    file_name = json_file.name
    results[file_name] = []
    
    for i, game in enumerate(data):
        game_name = game.get('game', {}).get('name', 'Unknown')
        content = game.get('content', {})
        missing = []
        
        for field in findings_fields:
            value = content.get(field, '')
            if not value or (isinstance(value, str) and value.strip() == ''):
                missing.append(field.replace('_findings', ''))
        
        if missing:
            results[file_name].append({
                'index': i,
                'name': game_name,
                'missing': missing
            })

# Print results
print("\n" + "="*80)
print("JSON AUDIT: MISSING PILLAR FINDINGS")
print("="*80 + "\n")

total_missing = 0
for file_name in sorted(results.keys()):
    missing_games = results[file_name]
    if missing_games:
        print(f"📄 {file_name}")
        for entry in missing_games:
            print(f"   [{entry['index']}] {entry['name']}")
            print(f"        ⚠️  Missing: {', '.join(entry['missing'])}")
        print()
        total_missing += len(missing_games)

if total_missing == 0:
    print("✅ All games have complete pillar findings data!")
else:
    print(f"\n⚠️  SUMMARY: {total_missing} games have missing findings data")

print("="*80)
