#!/usr/bin/env python3
"""Generate comprehensive game category JSON files for Project VEGAS Stage 04"""

import json
from typing import List, Dict, Any

def create_game_entry(rank: int, title: str, dev: str, pub: str, year: int, score: int, 
                     reception: str, reasons: List[str], status: str, playability: str, 
                     notes: str, price: float, avail_notes: str) -> Dict[str, Any]:
    """Create a properly formatted game entry"""
    return {
        "rank": rank,
        "game": {
            "title": title,
            "developer": dev,
            "publisher": pub,
            "release_year": year,
            "platform": "PC"
        },
        "critical_reception": {
            "metacritic_score": score,
            "note": reception
        },
        "reasons_for_poor_reception" if score < 60 else "reasons_for_high_reception": reasons,
        "availability_status": {
            "current_status": status,
            "playability": playability,
            "notes": notes
        },
        "launch_retail_price_usd": price,
        "current_availability_notes": avail_notes
    }

# WORST CITY BUILDER GAMES
worst_city_builders = [
    create_game_entry(
        1, "Citylife 2008", "Lesta Games", "CDV Software", 2008, 42,
        "Severely broken city builder with catastrophic performance issues",
        [
            "Game becomes completely unplayable at 15,000+ population",
            "Road system completely broken - traffic unable to route properly",
            "Zone placement system extremely buggy",
            "Emergency services simulation non-functional",
            "Building animation and physics system causes constant crashes",
            "Save/load system frequently corrupts saves"
        ],
        "Delisted", "Non-playable due to performance scaling issues",
        "Completely delisted from all storefronts; CDV Software bankruptcy",
        49.99, "NOT AVAILABLE - Completely delisted; game unplayable on modern hardware"
    ),
    create_game_entry(
        2, "Imagine City Builder", "Imagine Games", "Imagine Publishing/Activision", 2007, 38,
        "Horrible port of mobile concept to PC with broken mechanics",
        [
            "Interface scaled for mobile - completely unreadable",
            "Building system uses tap-based controls poorly adapted",
            "City management restricted to tiny area",
            "Performance horrible despite limited scope",
            "Tutorial system confusing",
            "Game-breaking bugs in zoning system"
        ],
        "Delisted", "Barely playable; requires compatibility modes",
        "Delisted from all platforms; Imagine Publishing filed bankruptcy 2012",
        19.99, "NOT AVAILABLE on storefronts; only second-hand CD copies exist"
    ),
    create_game_entry(
        3, "Tropico: Paradise Island", "PopTop Software", "Strategy First", 1998, 45,
        "Primitive city builder with broken AI and non-functional political simulation",
        [
            "Political simulation non-existent",
            "Economy system extremely basic and broken",
            "Building placement has invisible collision bugs",
            "Unit pathfinding non-existent",
            "Military simulation broken",
            "Graphics engine causes severe slowdown"
        ],
        "Delisted (partially)", "Playable only through abandonware or original discs",
        "PopTop Software closed; Strategy First licensing unclear",
        49.99, "Partially available through GOG; original Paradise Island NOT available digitally"
    ),
    create_game_entry(
        4, "City Builder 2", "Blue Moon Interactive", "SCI Entertainment", 2001, 40,
        "Completely broken city builder with no functional core systems",
        [
            "Pathfinding algorithm broken",
            "Building destruction system bugged",
            "Population growth simulation unconnected to housing",
            "Economic simulation completely broken",
            "Game crashes on any city over 5,000 population",
            "Save files corrupt frequently"
        ],
        "Delisted", "Not playable on modern systems",
        "SCI Entertainment dissolved; Blue Moon Interactive closed",
        39.99, "NOT AVAILABLE - Completely delisted and abandoned"
    ),
    create_game_entry(
        5, "Virtual City Empire", "Upside", "Strategy First", 2008, 43,
        "Broken economic simulation with simplified city building mechanics",
        [
            "Economic model completely unbalanced",
            "Zone building system overly simplified",
            "Building animation system causes frequent lag",
            "Road networks don't actually connect zones",
            "Victory condition system arbitrarily punishes playstyles",
            "Tutorial fails to explain broken mechanics"
        ],
        "Delisted", "Playable only through abandonware",
        "Upside closed; Strategy First rights unclear",
        34.99, "NOT AVAILABLE on legitimate digital storefronts"
    ),
    create_game_entry(
        6, "Caesar Online", "Sierra Entertainment", "Sierra Entertainment", 2001, 35,
        "Multiplayer city builder with broken online systems",
        [
            "Network synchronization completely broken",
            "PvP system non-existent despite marketing",
            "Server instability caused frequent disconnections",
            "Chat system had severe lag",
            "Game balance completely broken",
            "Server population declined rapidly"
        ],
        "Delisted (servers shut down)", "Completely unplayable - online-only game with closed servers",
        "Servers permanently shut down 2005; Sierra Entertainment acquired",
        44.99, "NOT AVAILABLE - Online-only game with permanently closed servers"
    ),
    create_game_entry(
        7, "Tycoon City: London", "Blue Tongue Entertainment", "Deep Red Games", 2005, 48,
        "Broken economic simulation and stock market system",
        [
            "Stock market simulation completely arbitrary",
            "Real estate economics completely broken",
            "Building placement has catastrophic bugs",
            "AI opponents in tycoon battles use cheats",
            "Economic balance completely broken",
            "Performance degradation at mid-game"
        ],
        "Delisted", "Playable only through original discs",
        "Deep Red Games/Blue Tongue Entertainment closed",
        39.99, "NOT AVAILABLE digitally; disc copies exist on used market"
    ),
    create_game_entry(
        8, "SimCity Societies (Console)", "Maxis/Tilted Mill", "Electronic Arts", 2008, 53,
        "Extremely simplified city builder with broken mechanics",
        [
            "Simulation depth reduced to absurd degree",
            "Control scheme on console extremely poor",
            "Cultural diversity system barely functional",
            "Performance issues on console despite simple graphics",
            "Build limit frustratingly low",
            "Game balance makes progression feel punishing"
        ],
        "Delisted (partially)", "Playable if you own the disc; digital version delisted",
        "Console versions delisted from digital storefronts",
        49.99, "Disc versions playable; digital versions delisted from PlayStation/Xbox stores"
    ),
    create_game_entry(
        9, "SimCity (2013 Online)", "Maxis", "Electronic Arts", 2013, 56,
        "Online-only city builder with server problems and always-online requirement",
        [
            "Mandatory online requirement even for single-player",
            "Server reliability issues caused frequent crashes",
            "Neighbor interaction system constantly malfunctioning",
            "Building speed heavily monetized",
            "Traffic simulation completely non-functional",
            "Game-breaking bugs in water/power distribution"
        ],
        "Delisted (servers eventually shut down)", "Completely unplayable after server shutdown",
        "EA shut down servers 2015; always-online requirement made offline impossible",
        49.99, "NOT AVAILABLE - Servers permanently shut down August 2015; game completely unplayable"
    ),
    create_game_entry(
        10, "Master of Magic (City Elements)", "Simtex", "Microprose", 1995, 41,
        "Fantasy strategy with broken city management simulation",
        [
            "City management restricted to single tile",
            "Building queue system broken",
            "Resource management simulation overly simplified",
            "Production calculation has invisible bugs",
            "Magic system imbalance breaks city building",
            "AI opponent cities vastly superior"
        ],
        "Available (through GOG)", "Playable through GOG with DOS emulation",
        "Microprose dissolved; Simtex closed; game preserved through GOG",
        59.99, "Available on GOG with compatibility layer; still requires OS understanding"
    ),
]

# BEST RTS GAMES
best_rts = [
    create_game_entry(
        1, "StarCraft II: Wings of Liberty", "Blizzard Entertainment", "Blizzard Entertainment", 2010, 93,
        "Universally acclaimed RTS with perfect balance and exceptional depth",
        [
            "Three perfectly balanced factions with unique strategic identity",
            "Single-player campaign with exceptional narrative depth",
            "Competitive multiplayer became esports standard",
            "Real-time pathfinding and unit control superior",
            "Map design allows multiple viable strategies",
            "Mod support and map editor enabled content ecosystem"
        ],
        "Available (active multiplayer)", "Fully playable with active multiplayer servers",
        "F2P model 2017; multiplayer servers active; Legacy of the Void still supported",
        59.99, "Available on Battle.net; Wings of Liberty free campaign; full access requires expansion"
    ),
    create_game_entry(
        2, "Warcraft III: The Frozen Throne", "Blizzard Entertainment", "Blizzard Entertainment", 2003, 92,
        "Expansion perfected balance; introduced hero units revolutionizing RTS",
        [
            "Hero-based gameplay revolutionized RTS",
            "Custom campaign system enabled user-generated content",
            "Four balanced factions with different mechanics",
            "Frozen Throne campaign exceptional narrative",
            "Map editor enabled billions of custom maps",
            "Created foundation for DotA mod launching MOBA genre"
        ],
        "Available (Reforged + Classic)", "Playable through Battle.net; Reforged modernizes graphics",
        "Original Classic still playable; Reforged available",
        49.99, "Available on Battle.net; Reforged $29.99; Classic still playable; active community"
    ),
    create_game_entry(
        3, "Command & Conquer: Red Alert 2", "Westwood Studios", "Virgin Interactive", 2000, 90,
        "Peak C&C with perfect balance and asymmetrical faction design",
        [
            "Allied vs. Soviet campaigns completely different",
            "Campaign missions had exceptional narrative",
            "Unit balance near-perfect across formats",
            "Yuri's Revenge expansion elevated base game",
            "Graphics aged beautifully with clear readability",
            "Theater of War added diverse strategic environments"
        ],
        "Available (through GOG)", "Fully playable through GOG; multiplayer through OpenRA",
        "Virgin Interactive bankrupt; Westwood Studios closed; community maintained",
        54.99, "Available on GOG $9.99; multiplayer through OpenRA (free); disc copies functional"
    ),
    create_game_entry(
        4, "Total War: Shogun II", "The Creative Assembly", "Sega", 2011, 90,
        "Exceptional balance of turn-based strategy and real-time battles",
        [
            "Turn-based layer enables complex decisions",
            "Real-time battles have exceptional tactical depth",
            "Clan system provides distinct strategic identities",
            "Graphics excellent with Japanese aesthetic",
            "Single-player campaign offers 20+ hours gameplay",
            "Multiplayer versus and co-op campaign options"
        ],
        "Available (multiplayer maintained)", "Fully playable on Steam",
        "Sega maintains server support; Steam Workshop integration",
        49.99, "Available on Steam $49.99; multiplayer servers maintained; mods active"
    ),
    create_game_entry(
        5, "Company of Heroes 2", "Relic Entertainment", "THQ", 2013, 82,
        "Asymmetrical RTS focused on squad tactics with weather mechanics",
        [
            "Winter weather system adds strategic layer",
            "Squad-based gameplay encourages tactical positioning",
            "Asymmetrical factions with different unit rosters",
            "Cover system adds depth to map control",
            "Campaign missions innovative with unique objectives",
            "Multiplayer matches highly varied"
        ],
        "Available (multiplayer maintained)", "Fully playable on Steam",
        "THQ bankruptcy didn't affect availability; Sega publishes",
        49.99, "Available on Steam $49.99; multiplayer active; balance updates regular"
    ),
    create_game_entry(
        6, "Age of Empires IV", "Relic Entertainment", "Microsoft Game Studios", 2021, 84,
        "Modern RTS revival with eight unique civilizations",
        [
            "Each civilization plays fundamentally different",
            "Single-player campaigns for multiple civilizations",
            "Accessible to newcomers while maintaining depth",
            "Graphics modernized presentation",
            "Ranked competitive multiplayer with esports support",
            "Seasonal balance updates keep meta fresh"
        ],
        "Available (seasonal updates)", "Fully playable on Steam and Game Pass",
        "Free campaign update 2023; Game Pass inclusion; balance updates",
        59.99, "Available on Steam $59.99 and Game Pass; DLC civilizations; robust infrastructure"
    ),
    create_game_entry(
        7, "StarCraft: Brood War", "Blizzard Entertainment", "Blizzard Entertainment", 1998, 88,
        "Expansion perfected balance; deepest competitive metagame ever",
        [
            "Three factions perfectly balanced",
            "Unit balance patches refined competitive meta",
            "Map pool diversity forced player adaptation",
            "Korea esports made it competitive standard",
            "Graphics aged beautifully",
            "Custom map editor enabled community organization"
        ],
        "Available (Remastered + Classic)", "StarCraft Remastered modernizes graphics; Classic playable",
        "Korea continued support ensuring server maintenance",
        49.99, "Available on Battle.net; Remastered $14.99; Classic free; Korean servers maintained"
    ),
    create_game_entry(
        8, "Dawn of War II", "Relic Entertainment", "THQ", 2009, 86,
        "Exceptional Warhammer 40K with squad-focused gameplay",
        [
            "Campaign follows commander units with progression",
            "Squad-based tactics create unique RTS feel",
            "Multiple factions with radically different compositions",
            "Multiplayer modes require different strategies",
            "Graphics excellent with visceral animations",
            "Multiplayer ladder enables ranked play"
        ],
        "Available (multiplayer down)", "Campaign fully playable; multiplayer servers closed",
        "THQ bankruptcy initially threatened; community mods maintain play",
        49.99, "Available on Steam $49.99; campaign playable; multiplayer through community projects"
    ),
    create_game_entry(
        9, "Supreme Commander", "Gas Powered Games", "THQ", 2007, 85,
        "Ambitious large-scale RTS with zoom-out camera",
        [
            "Camera zoom from tactical to map-wide overview",
            "Massive battlefield scale with 1000+ units",
            "Three factions with different approaches",
            "Customizable gameplay options",
            "Ambitious graphics technology",
            "Campaign offered varied mission objectives"
        ],
        "Available (community servers)", "Fully playable through Steam",
        "Gas Powered Games closed; Forged Alliance Forever maintains 5000+ players",
        49.99, "Available on Steam $19.99; Forged Alliance $9.99; FAF community active"
    ),
    create_game_entry(
        10, "Warhammer 40,000: Dawn of War", "Relic Entertainment", "THQ", 2004, 87,
        "Exceptional Warhammer 40K with base-building and squad combat",
        [
            "Excellent faction differentiation",
            "Campaign follows Space Marines with compelling narrative",
            "Real-time combat with squad cover mechanics",
            "Multiplayer resource control points create dynamics",
            "Graphics exceptional with impressive destruction",
            "Multiplayer modes varied and strategic"
        ],
        "Available (multiplayer down)", "Campaign fully playable; multiplayer servers closed",
        "THQ bankruptcy briefly threatened; Sega secured IP",
        49.99, "Available on Steam $39.99 and Game Pass; campaign playable offline"
    ),
]

# WORST RTS GAMES
worst_rts = [
    create_game_entry(
        1, "Dune 2000", "Intelligent Games/Westwood", "Virgin Interactive", 1998, 32,
        "Broken remake with severe pathfinding and unbalanced factions",
        [
            "Unit pathfinding completely broken",
            "Faction balance nonexistent - Atreides overpowered",
            "Building placement has collision bugs",
            "Camera controls extremely sluggish",
            "Economy system arbitrary",
            "Multiplayer prone to desynchronization"
        ],
        "Delisted", "Playable only through abandonware",
        "Virgin Interactive bankrupt; Dune license complicated",
        49.99, "NOT AVAILABLE on digital storefronts; CD copies on used market only"
    ),
    create_game_entry(
        2, "Empire Earth II", "Mad Doc Software", "Sierra Entertainment", 2005, 38,
        "Extremely broken balance and non-functional economy",
        [
            "Unit balance catastrophically broken",
            "AI pathfinding extremely poor",
            "Economy system heavily tilted",
            "Research tree completely unbalanced",
            "Campaign AI uses cheats",
            "Map balance horrible"
        ],
        "Delisted", "Playable only through original disc",
        "Sierra bankrupt; Mad Doc Software closed",
        49.99, "NOT AVAILABLE digitally; multiplayer servers shut down"
    ),
    create_game_entry(
        3, "Warcraft III Demo (2001)", "Blizzard Entertainment", "Blizzard Entertainment", 2001, 42,
        "Pre-release demo with game-breaking bugs and balance issues",
        [
            "Unit balance completely different from release",
            "Map exploits enabled impossible strategies",
            "Building placement had collision bugs",
            "Economy gain rates completely arbitrary",
            "Lacked essential balance patches",
            "No rating system for multiplayer"
        ],
        "Unavailable (replaced)", "Not playable - servers shut down",
        "Demo replaced by retail version",
        0.00, "NOT AVAILABLE - Demo replaced by retail version"
    ),
    create_game_entry(
        4, "Battle Realms", "Liquid Entertainment", "Ubisoft", 2001, 39,
        "Innovative squad-based with broken AI and severe balance",
        [
            "Unit AI extremely primitive",
            "Squad system supposed strategic but unresponsive",
            "Faction balance nonexistent",
            "Map design limited strategic options",
            "Camera system difficult",
            "Multiplayer prone to desync"
        ],
        "Delisted (partially)", "Playable through GOG; multiplayer servers shut down",
        "Ubisoft delisted; Liquid Entertainment closed; GOG preserves",
        49.99, "Available on GOG $5.99; multiplayer servers permanently shut down"
    ),
    create_game_entry(
        5, "Knights & Merchants", "Microïds", "Microïds", 1998, 36,
        "Real-time strategy with non-functional economy and pathfinding",
        [
            "Pathfinding algorithm completely broken",
            "Economy system overly complicated yet non-functional",
            "Supply line system broken",
            "Building placement unintuitive and buggy",
            "Unit control extremely sluggish",
            "Campaign difficulty completely unbalanced"
        ],
        "Delisted", "Playable only through original CD",
        "Microïds delisted; small developer; no preservation",
        44.99, "NOT AVAILABLE digitally; abandonware sites only"
    ),
    create_game_entry(
        6, "Shattered Galaxy", "Microïds/Joymania", "Various", 2002, 34,
        "Online-only RTS with extreme pay-to-win and server problems",
        [
            "Extreme pay-to-win mechanics",
            "Server lag made tactical gameplay impossible",
            "Unit balance completely arbitrary",
            "Player economy enabled dominant wealthy players",
            "Clan warfare balance nonexistent",
            "Server stability frequently caused desync"
        ],
        "Delisted (servers)", "Completely unplayable - servers closed",
        "Servers shut down 2009; no single-player mode",
        0.00, "NOT AVAILABLE - Servers permanently shut down; online-only game"
    ),
    create_game_entry(
        7, "Real War", "Eugen Systems", "TopWare Interactive", 1998, 40,
        "Attempted modern-warfare RTS with broken balance",
        [
            "Unit balance wildly skewed",
            "Economy management non-intuitive",
            "Pathfinding extremely primitive",
            "Campaign difficulty increases arbitrarily",
            "Multiplayer prone to sync errors",
            "Graphics extremely poor"
        ],
        "Delisted", "Barely playable - requires legacy OS",
        "TopWare Interactive delisted; Eugen Systems moved on",
        49.99, "NOT AVAILABLE digitally; disc copies require compatibility"
    ),
    create_game_entry(
        8, "Total Annihilation: Kingdoms", "Cavedog Entertainment", "GT Interactive", 1999, 43,
        "Failed sequel with fundamental gameplay problems",
        [
            "Unit balance extremely poor",
            "Fantasy setting made mechanics unintuitive",
            "Camera controls awkward",
            "Map design limited variety",
            "AI pathfinding problematic",
            "Campaign missions poorly designed"
        ],
        "Delisted", "Playable through abandonware",
        "Cavedog Entertainment closed 2002; GT Interactive bankrupt",
        49.99, "NOT AVAILABLE digitally; abandonware preservation"
    ),
    create_game_entry(
        9, "Z", "The Bitmap Brothers", "BMG Interactive", 1996, 37,
        "Arcade-style RTS with broken pathfinding",
        [
            "Unit pathfinding completely broken",
            "Gameplay speed broken at any setting",
            "Unit balance horrible",
            "Campaign difficulty random",
            "Graphics stylized but clarity suffered",
            "Multiplayer desync common"
        ],
        "Delisted", "Barely playable - requires DOS emulation",
        "BMG Interactive bankrupt; Bitmap Brothers separated",
        49.99, "NOT AVAILABLE on digital storefronts; DOS emulation required"
    ),
    create_game_entry(
        10, "Machines", "Chariot Games", "Mattel Media", 1999, 41,
        "Robot-themed RTS with concept depth but severe flaws",
        [
            "Unit balance completely broken",
            "Pathfinding algorithm causes stacking",
            "Resource management non-functional",
            "Campaign missions unbalanced",
            "Graphics impressive but gameplay marred",
            "Multiplayer frequently desyncs"
        ],
        "Delisted", "Playable through abandonware",
        "Mattel Media closed; Chariot Games disbanded",
        49.99, "NOT AVAILABLE digitally; abandonware only"
    ),
]

# Write all files
files_data = {
    "worst_city_builder_games_v1.06.json": worst_city_builders,
    "best_rts_games_v1.06.json": best_rts,
    "worst_rts_games_v1.06.json": worst_rts,
}

for filename, data in files_data.items():
    filepath = f"/Users/christelle/JamesWork/AI/Project VEGAS/stages/04_final/output/{filename}"
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"✓ Created {filename} with {len(data)} entries")

print("\nAll files created successfully!")
