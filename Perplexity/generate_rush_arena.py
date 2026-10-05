#!/usr/bin/env python3
"""
Procedural Generator for FunCraft-style Rush Arena (rush_jfm)
Formats: 1v1 and 2v2
Features:
  - 2 opposing bases (Red vs Blue) separated by 30 blocks of void
  - Bases at Y=64, sandstone bridges, beds, spawners and shop
  - Waiting lobby platform at Y=100
"""

import subprocess
import sys

CONTAINER = "minecraft_ap1"

def rcon(cmd):
    full_cmd = ["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd]
    res = subprocess.run(full_cmd, capture_output=True, text=True)
    return res.stdout.strip()

def build_rush():
    w = "rush_jfm"
    print(f"=== Generating FunCraft Rush Arena in world '{w}' ===")

    # 1. Waiting Lobby Platform at Y=100
    print("Building Rush Lobby Platform at Y=100...")
    rcon(f"execute in {w} run fill -7 100 -7 7 100 7 smooth_stone")
    rcon(f"execute in {w} run fill -7 101 -7 7 103 7 glass")
    rcon(f"execute in {w} run fill -7 104 -7 7 104 7 barrier")
    rcon(f"execute in {w} run setblock 0 100 0 glowstone")

    # 2. Red Base (North at Z = -25)
    print("Building Red Base at Z=-25...")
    rcon(f"execute in {w} run fill -6 64 -31 6 64 -19 red_sandstone")
    rcon(f"execute in {w} run fill -5 63 -30 5 63 -20 stone")
    rcon(f"execute in {w} run fill -2 64 -26 2 64 -24 red_wool")
    # Red Bed
    rcon(f"execute in {w} run setblock 0 65 -30 red_bed[facing=north,part=foot]")
    rcon(f"execute in {w} run setblock 0 65 -31 red_bed[facing=north,part=head]")
    # Red Spawners (Bronze / Gold)
    rcon(f"execute in {w} run setblock 0 64 -22 iron_block")
    rcon(f"execute in {w} run setblock 3 64 -25 gold_block")

    # 3. Blue Base (South at Z = 25)
    print("Building Blue Base at Z=25...")
    rcon(f"execute in {w} run fill -6 64 19 6 64 31 smooth_sandstone")
    rcon(f"execute in {w} run fill -5 63 20 5 63 30 stone")
    rcon(f"execute in {w} run fill -2 64 24 2 64 26 blue_wool")
    # Blue Bed
    rcon(f"execute in {w} run setblock 0 65 30 blue_bed[facing=south,part=foot]")
    rcon(f"execute in {w} run setblock 0 65 31 blue_bed[facing=south,part=head]")
    # Blue Spawners
    rcon(f"execute in {w} run setblock 0 64 22 iron_block")
    rcon(f"execute in {w} run setblock -3 64 25 gold_block")

    # 4. Central Neutral Island (Z = 0)
    print("Building Central Rush Island at Z=0...")
    rcon(f"execute in {w} run fill -4 64 -4 4 64 4 sandstone")
    rcon(f"execute in {w} run setblock 0 64 0 emerald_block")
    rcon(f"execute in {w} run setblock 0 65 0 sea_lantern")

    # Environment
    rcon(f"execute in {w} run time set 6000")
    rcon(f"execute in {w} run gamerule minecraft:advance_time false")
    rcon(f"execute in {w} run gamerule minecraft:advance_weather false")

    print(f"Rush Arena in '{w}' built successfully!")

if __name__ == "__main__":
    build_rush()
