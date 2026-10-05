#!/usr/bin/env python3
"""
Generator for the JoyStick FM Dedicated Mini-Games Lobby (lobby_minijeux)
Builds an explorable futuristic neon platform (violet/cyan) with stations for:
  - BedWars (Duo / Squad)
  - Rush FunCraft (1v1 & 2v2)
  - Hikabrain (1v1)
  - BlockHunt (Cache-cache Village Rétro)
  - Hub Return Portal
"""

import subprocess
import sys

CONTAINER = "minecraft_ap1"

def rcon(cmd):
    full_cmd = ["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd]
    res = subprocess.run(full_cmd, capture_output=True, text=True)
    return res.stdout.strip()

def build_lobby():
    w = "lobby_minijeux"
    print(f"=== Generating Mini-Games Lobby in world '{w}' ===")

    # 1. Main Central Plaza (Circular/Cross platform 31x31 at Y=64)
    print("Building Central Neon Plaza...")
    rcon(f"execute in {w} run fill -15 64 -15 15 64 15 smooth_quartz")
    rcon(f"execute in {w} run fill -15 63 -15 15 63 15 black_concrete")
    
    # Neon Accent Rings (Purple & Cyan Stained Glass / Concrete)
    rcon(f"execute in {w} run fill -15 64 -15 15 64 -15 purple_concrete")
    rcon(f"execute in {w} run fill -15 64 15 15 64 15 purple_concrete")
    rcon(f"execute in {w} run fill -15 64 -15 -15 64 15 cyan_concrete")
    rcon(f"execute in {w} run fill 15 64 -15 15 64 15 cyan_concrete")

    # Center Spawn Monument
    rcon(f"execute in {w} run fill -2 64 -2 2 64 2 sea_lantern")
    rcon(f"execute in {w} run fill -1 65 -1 1 68 1 beacon")
    rcon(f"execute in {w} run setblock 0 69 0 magenta_stained_glass")

    # Perimeter Guard Rail (Glass and Barriers to prevent falling into void)
    print("Installing Guard Rails and Barriers...")
    rcon(f"execute in {w} run fill -15 65 -15 15 66 -15 purple_stained_glass")
    rcon(f"execute in {w} run fill -15 65 15 15 66 15 purple_stained_glass")
    rcon(f"execute in {w} run fill -15 65 -15 -15 66 15 cyan_stained_glass")
    rcon(f"execute in {w} run fill 15 65 -15 15 66 15 cyan_stained_glass")
    # Top Invisible Barriers
    rcon(f"execute in {w} run fill -15 67 -15 15 70 -15 barrier")
    rcon(f"execute in {w} run fill -15 67 15 15 70 15 barrier")
    rcon(f"execute in {w} run fill -15 67 -15 -15 70 15 barrier")
    rcon(f"execute in {w} run fill 15 67 -15 15 70 15 barrier")

    # 2. Four Thematic Portals / Stations
    # North: BedWars & Rush Station
    print("Building North Station: BedWars & Rush...")
    rcon(f"execute in {w} run fill -5 65 -15 5 70 -15 red_concrete")
    rcon(f"execute in {w} run fill -3 65 -15 3 69 -15 red_stained_glass")
    rcon(f"execute in {w} run setblock 0 65 -14 red_bed")

    # South: Hikabrain 1v1 Station
    print("Building South Station: Hikabrain...")
    rcon(f"execute in {w} run fill -5 65 15 5 70 15 yellow_concrete")
    rcon(f"execute in {w} run fill -3 65 15 3 69 15 yellow_stained_glass")
    rcon(f"execute in {w} run setblock 0 65 14 sandstone")

    # East: BlockHunt Station (Village Retro)
    print("Building East Station: BlockHunt...")
    rcon(f"execute in {w} run fill 15 65 -5 15 70 5 oak_planks")
    rcon(f"execute in {w} run fill 15 65 -3 15 69 3 bookshelf")
    rcon(f"execute in {w} run setblock 14 65 0 barrel")

    # West: Return to Main Hub Portal
    print("Building West Station: Hub Portal...")
    rcon(f"execute in {w} run fill -15 65 -4 -15 70 4 obsidian")
    rcon(f"execute in {w} run fill -15 65 -2 -15 69 2 nether_portal")

    # World Environment
    rcon(f"execute in {w} run time set 6000")
    rcon(f"execute in {w} run weather clear")
    rcon(f"execute in {w} run gamerule minecraft:advance_time false")
    rcon(f"execute in {w} run gamerule minecraft:advance_weather false")
    rcon(f"execute in {w} run gamerule minecraft:spawn_monsters false")
    rcon(f"execute in {w} run setworldspawn 0 65 0")

    print(f"Mini-Games Lobby in '{w}' built successfully!")

if __name__ == "__main__":
    build_lobby()
