#!/usr/bin/env python3
"""
Procedural Generator for FunCraft-style Hikabrain 1v1 Arena (hikabrain_jfm)
Features:
  - 1-block wide sandstone suspended bridge (Y=64, length 40 blocks)
  - Red Base at North (Z = -20) with Red Bed
  - Blue Base at South (Z = 20) with Blue Bed
  - Scoring objective: touch / right-click the opponent bed
  - Target score: 5 points to win
"""

import subprocess
import sys

CONTAINER = "minecraft_ap1"

def rcon(cmd):
    full_cmd = ["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd]
    res = subprocess.run(full_cmd, capture_output=True, text=True)
    return res.stdout.strip()

def build_hikabrain():
    w = "hikabrain_jfm"
    print(f"=== Generating FunCraft Hikabrain Arena in world '{w}' ===")

    # 1. Waiting Platform at Y=100
    print("Building Hikabrain Waiting Platform at Y=100...")
    rcon(f"execute in {w} run fill -5 100 -5 5 100 5 smooth_stone")
    rcon(f"execute in {w} run fill -5 101 -5 5 103 5 glass")
    rcon(f"execute in {w} run fill -5 104 -5 5 104 5 barrier")
    rcon(f"execute in {w} run setblock 0 100 0 glowstone")

    # 2. Narrow 1-Block Bridge at Y=64 from Z=-18 to Z=18
    print("Building 1-Block Wide Central Sandstone Bridge...")
    rcon(f"execute in {w} run fill 0 64 -18 0 64 18 sandstone")

    # 3. Red Base (North, Z=-23 to -19, size 5x5)
    print("Building Red Base at Z=-21...")
    rcon(f"execute in {w} run fill -2 64 -23 2 64 -19 red_concrete")
    rcon(f"execute in {w} run fill -2 65 -23 2 66 -23 red_stained_glass")
    rcon(f"execute in {w} run setblock 0 64 -21 sea_lantern")
    # Red Bed (Target for Blue team)
    rcon(f"execute in {w} run setblock 0 65 -22 red_bed[facing=north,part=foot]")
    rcon(f"execute in {w} run setblock 0 65 -23 red_bed[facing=north,part=head]")

    # 4. Blue Base (South, Z=19 to 23, size 5x5)
    print("Building Blue Base at Z=21...")
    rcon(f"execute in {w} run fill -2 64 19 2 64 23 blue_concrete")
    rcon(f"execute in {w} run fill -2 65 23 2 66 23 blue_stained_glass")
    rcon(f"execute in {w} run setblock 0 64 21 sea_lantern")
    # Blue Bed (Target for Red team)
    rcon(f"execute in {w} run setblock 0 65 22 blue_bed[facing=south,part=foot]")
    rcon(f"execute in {w} run setblock 0 65 23 blue_bed[facing=south,part=head]")

    # Environment
    rcon(f"execute in {w} run time set 6000")
    rcon(f"execute in {w} run gamerule minecraft:advance_time false")
    rcon(f"execute in {w} run gamerule minecraft:advance_weather false")

    print(f"Hikabrain Arena in '{w}' built successfully!")

if __name__ == "__main__":
    build_hikabrain()
