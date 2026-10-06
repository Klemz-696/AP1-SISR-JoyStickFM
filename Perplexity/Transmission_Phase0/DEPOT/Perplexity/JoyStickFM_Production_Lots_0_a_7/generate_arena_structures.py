#!/usr/bin/env python3
"""
Procedural Arena Structure Generator for JoyStickFM (AP1)
Executes vanilla Minecraft /fill and /setblock commands via RCON into Docker container.
Generates:
  1. BedWars 4-team arena in world 'bedwars_jfm'
  2. BlockHunt retro village arena in world 'blockhunt_jfm'
Strictly follows 'arena_manifest.design.json' geometry coordinates.
"""

import subprocess
import time
import sys

CONTAINER = "minecraft_ap1"

def rcon(cmd):
    full_cmd = ["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd]
    res = subprocess.run(full_cmd, capture_output=True, text=True)
    return res.stdout.strip()

def build_bedwars():
    print("=== Generating BedWars Arena (bedwars_jfm) ===")
    w = "bedwars_jfm"
    rcon(f"execute in {w} run forceload add -6 -6 6 6")
    time.sleep(1)

    # 1. Waiting Lobby Platform at Y=100
    print("Building Lobby Platform at Y=100...")
    rcon(f"execute in {w} run fill -7 100 -7 7 100 7 smooth_quartz")
    rcon(f"execute in {w} run fill -7 101 -7 7 103 -7 glass")
    rcon(f"execute in {w} run fill -7 101 7 7 103 7 glass")
    rcon(f"execute in {w} run fill -7 101 -7 -7 103 7 glass")
    rcon(f"execute in {w} run fill 7 101 -7 7 103 7 glass")
    rcon(f"execute in {w} run fill -7 104 -7 7 104 7 barrier")
    # Central glowstone in lobby
    rcon(f"execute in {w} run setblock 0 100 0 glowstone")

    # 2. Central Island (21x21, Center 0, 64, 0)
    print("Building Central Island...")
    rcon(f"execute in {w} run fill -10 64 -10 10 64 10 grass_block")
    rcon(f"execute in {w} run fill -9 61 -9 9 63 9 dirt")
    rcon(f"execute in {w} run fill -7 58 -7 7 60 7 stone")
    rcon(f"execute in {w} run fill -4 55 -4 4 57 4 stone")
    # Emerald Generators
    rcon(f"execute in {w} run setblock -3 64 0 emerald_block")
    rcon(f"execute in {w} run setblock 3 64 0 emerald_block")
    # Center decorative monument
    rcon(f"execute in {w} run fill -1 65 -1 1 67 1 sea_lantern")

    # 3. Four Team Islands (Half-width 12 -> 25x25)
    teams = [
        {"name": "Red", "cx": 0, "cz": -64, "wool": "red_wool", "bed_facing": "north",
         "bed_foot": (0, 65, -68), "bed_head": (0, 65, -69), "bed_type": "red_bed",
         "gen": (0, 64, -60)},
        {"name": "Blue", "cx": 64, "cz": 0, "wool": "blue_wool", "bed_facing": "east",
         "bed_foot": (68, 65, 0), "bed_head": (69, 65, 0), "bed_type": "blue_bed",
         "gen": (60, 64, 0)},
        {"name": "Green", "cx": 0, "cz": 64, "wool": "green_wool", "bed_facing": "south",
         "bed_foot": (0, 65, 68), "bed_head": (0, 65, 69), "bed_type": "green_bed",
         "gen": (0, 64, 60)},
        {"name": "Yellow", "cx": -64, "cz": 0, "wool": "yellow_wool", "bed_facing": "west",
         "bed_foot": (-68, 65, 0), "bed_head": (-69, 65, 0), "bed_type": "yellow_bed",
         "gen": (-60, 64, 0)}
    ]

    for t in teams:
        cx, cz = t["cx"], t["cz"]
        print(f"Building {t['name']} Island at ({cx}, 64, {cz})...")
        # Island layers
        rcon(f"execute in {w} run fill {cx-12} 64 {cz-12} {cx+12} 64 {cz+12} grass_block")
        rcon(f"execute in {w} run fill {cx-10} 61 {cz-10} {cx+10} 63 {cz+10} dirt")
        rcon(f"execute in {w} run fill {cx-7} 58 {cz-7} {cx+7} 60 {cz+7} stone")
        rcon(f"execute in {w} run fill {cx-4} 55 {cz-4} {cx+4} 57 {cz+4} stone")
        
        # Team wool spawn ring
        rcon(f"execute in {w} run fill {cx-2} 64 {cz-2} {cx+2} 64 {cz+2} {t['wool']}")
        
        # Generator block
        gx, gy, gz = t["gen"]
        rcon(f"execute in {w} run setblock {gx} {gy} {gz} iron_block")
        
        # Bed
        fx, fy, fz = t["bed_foot"]
        hx, hy, hz = t["bed_head"]
        facing = t["bed_facing"]
        bed_block = t["bed_type"]
        rcon(f"execute in {w} run setblock {fx} {fy} {fz} {bed_block}[facing={facing},part=foot]")
        rcon(f"execute in {w} run setblock {hx} {hy} {hz} {bed_block}[facing={facing},part=head]")

    # 4. Diamond Islands (9x9 at Diagonals +-30)
    diamonds = [(-30, -30), (30, -30), (30, 30), (-30, 30)]
    for dx, dz in diamonds:
        print(f"Building Diamond Island at ({dx}, 64, {dz})...")
        rcon(f"execute in {w} run fill {dx-4} 64 {dz-4} {dx+4} 64 {dz+4} grass_block")
        rcon(f"execute in {w} run fill {dx-3} 62 {dz-3} {dx+3} 63 {dz+3} dirt")
        rcon(f"execute in {w} run fill {dx-2} 60 {dz-2} {dx+2} 61 {dz+2} stone")
        rcon(f"execute in {w} run setblock {dx} 64 {dz} diamond_block")

    print("BedWars geometry generation completed!")

def build_blockhunt():
    print("=== Generating BlockHunt Retro Village (blockhunt_jfm) ===")
    w = "blockhunt_jfm"
    rcon(f"execute in {w} run forceload add -4 -4 4 4")
    time.sleep(1)

    # 1. Waiting Lobby Platform at Y=100
    print("Building Lobby Platform at Y=100...")
    rcon(f"execute in {w} run fill -7 100 -7 7 100 7 smooth_stone")
    rcon(f"execute in {w} run fill -7 101 -7 7 103 -7 glass")
    rcon(f"execute in {w} run fill -7 101 7 7 103 7 glass")
    rcon(f"execute in {w} run fill -7 101 -7 -7 103 7 glass")
    rcon(f"execute in {w} run fill 7 101 -7 7 103 7 glass")
    rcon(f"execute in {w} run fill -7 104 -7 7 104 7 barrier")
    rcon(f"execute in {w} run setblock 0 100 0 sea_lantern")

    # 2. Village Ground (81x81 from -40 to 40 at Y=64)
    print("Building Village Ground (81x81)...")
    rcon(f"execute in {w} run fill -40 64 -40 40 64 40 grass_block")
    rcon(f"execute in {w} run fill -40 60 -40 40 63 40 dirt")
    
    # Perimeter Walls (Height 65-72)
    print("Building Village Perimeter Wall...")
    rcon(f"execute in {w} run fill -40 65 -40 40 70 -40 stone_bricks")
    rcon(f"execute in {w} run fill -40 65 40 40 70 40 stone_bricks")
    rcon(f"execute in {w} run fill -40 65 -40 -40 70 40 stone_bricks")
    rcon(f"execute in {w} run fill 40 65 -40 40 70 40 stone_bricks")
    # Top barrier prevention
    rcon(f"execute in {w} run fill -40 71 -40 40 75 -40 barrier")
    rcon(f"execute in {w} run fill -40 71 40 40 75 40 barrier")
    rcon(f"execute in {w} run fill -40 71 -40 -40 75 40 barrier")
    rcon(f"execute in {w} run fill 40 71 -40 40 75 40 barrier")

    # Streets (Main Crossroad and alleys)
    print("Creating Cobblestone and Gravel Paths...")
    rcon(f"execute in {w} run fill -4 64 -40 4 64 40 gravel")
    rcon(f"execute in {w} run fill -40 64 -4 40 64 4 gravel")
    # Central Plaza at (0, 64, 0)
    rcon(f"execute in {w} run fill -8 64 -8 8 64 8 cobblestone")
    # Central Fountain (Hider Spawn area)
    rcon(f"execute in {w} run fill -3 65 -3 3 65 3 stone_brick_stairs")
    rcon(f"execute in {w} run setblock 0 65 0 sea_lantern")

    # Seeker Gatehouse Spawn at North (0, 65, -34.5)
    print("Building Seeker Gatehouse...")
    rcon(f"execute in {w} run fill -4 65 -38 4 69 -32 cobblestone")
    rcon(f"execute in {w} run fill -2 65 -36 2 68 -34 air")
    rcon(f"execute in {w} run fill -2 65 -32 2 68 -32 iron_bars")

    # 3. Six Retro Village Houses (11x11 each)
    houses = [
        {"name": "H1", "cx": -24, "cz": -20},
        {"name": "H2", "cx": -24, "cz": 20},
        {"name": "H3", "cx": -14, "cz": 0},
        {"name": "H4", "cx": 14, "cz": 0},
        {"name": "H5", "cx": 24, "cz": -20},
        {"name": "H6", "cx": 24, "cz": 20}
    ]

    for h in houses:
        cx, cz = h["cx"], h["cz"]
        print(f"Building House {h['name']} at ({cx}, 64, {cz})...")
        # Cobblestone Foundation
        rcon(f"execute in {w} run fill {cx-4} 64 {cz-4} {cx+4} 64 {cz+4} spruce_planks")
        # Walls (Oak planks + oak logs at corners)
        rcon(f"execute in {w} run fill {cx-4} 65 {cz-4} {cx+4} 68 {cz+4} oak_planks")
        rcon(f"execute in {w} run fill {cx-3} 65 {cz-3} {cx+3} 67 {cz+3} air")
        # Door openings
        rcon(f"execute in {w} run setblock {cx} 65 {cz+4} air")
        rcon(f"execute in {w} run setblock {cx} 66 {cz+4} air")
        # Windows
        rcon(f"execute in {w} run setblock {cx-2} 66 {cz+4} glass_pane")
        rcon(f"execute in {w} run setblock {cx+2} 66 {cz+4} glass_pane")
        # Roof (Cobblestone / Oak stairs)
        rcon(f"execute in {w} run fill {cx-5} 69 {cz-5} {cx+5} 69 {cz+5} cobblestone")
        rcon(f"execute in {w} run fill {cx-4} 70 {cz-4} {cx+4} 70 {cz+4} oak_planks")
        rcon(f"execute in {w} run fill {cx-2} 71 {cz-2} {cx+2} 71 {cz+2} oak_slab")

        # Interior props matching disguise blocks (BookShelf, Barrel, Crafting Table, Hay)
        rcon(f"execute in {w} run setblock {cx-3} 65 {cz-3} bookshelf")
        rcon(f"execute in {w} run setblock {cx-3} 66 {cz-3} bookshelf")
        rcon(f"execute in {w} run setblock {cx+3} 65 {cz-3} crafting_table")
        rcon(f"execute in {w} run setblock {cx-3} 65 {cz+3} barrel")
        rcon(f"execute in {w} run setblock {cx+3} 65 {cz+3} hay_block")
        rcon(f"execute in {w} run setblock {cx} 67 {cz} lantern[hanging=true]")

    # Outside market stalls and hiding props along streets
    props = [
        (-6, 65, -12, "hay_block"), (-6, 66, -12, "hay_block"),
        (6, 65, -12, "barrel"), (6, 65, -11, "barrel"),
        (-6, 65, 12, "bookshelf"), (6, 65, 12, "cauldron"),
        (-10, 65, 6, "crafting_table"), (10, 65, 6, "barrel")
    ]
    for px, py, pz, b in props:
        rcon(f"execute in {w} run setblock {px} {py} {pz} {b}")

    print("BlockHunt village geometry generation completed!")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "bedwars":
        build_bedwars()
    elif len(sys.argv) > 1 and sys.argv[1] == "blockhunt":
        build_blockhunt()
    else:
        build_bedwars()
        build_blockhunt()
