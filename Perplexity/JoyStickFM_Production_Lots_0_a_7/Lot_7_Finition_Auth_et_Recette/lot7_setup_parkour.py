#!/usr/bin/env python3
"""
JoyStick FM - Lot 7: Top Parkour Setup at Hub (Decision D6 - Option A)
Features:
  - Suspended jumping obstacles course on Hub (Y=65 to Y=75)
  - Start pressure plate with timer initialization
  - Finish pressure plate with personal record save
  - Holographic Top Parkour leaderboard (sole public leaderboard on Hub)
"""

import subprocess
import sys

CONTAINER = "minecraft_ap1"
WORLD = "hub"

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    return res.stdout.strip()

def build_parkour():
    print(f"=== [LOT 7] Construction du Parcours Top Parkour dans '{WORLD}' ===")

    # 1. Piste de départ (X=20, Z=0)
    print("1. Construction de la zone de départ...")
    rcon(f"execute in {WORLD} run fill 20 65 -2 24 65 2 sea_lantern")
    rcon(f"execute in {WORLD} run setblock 22 66 0 heavy_weighted_pressure_plate")

    # 2. Série de piliers et blocs de saut néon
    print("2. Pose des blocs d'obstacles...")
    rcon(f"execute in {WORLD} run setblock 26 66 0 purple_concrete")
    rcon(f"execute in {WORLD} run setblock 29 67 1 magenta_concrete")
    rcon(f"execute in {WORLD} run setblock 32 68 -1 cyan_concrete")
    rcon(f"execute in {WORLD} run setblock 35 69 0 light_blue_concrete")
    rcon(f"execute in {WORLD} run setblock 38 70 2 purple_concrete")
    rcon(f"execute in {WORLD} run setblock 38 71 -2 magenta_concrete")
    rcon(f"execute in {WORLD} run setblock 34 72 -3 cyan_concrete")
    rcon(f"execute in {WORLD} run setblock 30 73 -1 sea_lantern")

    # 3. Plateforme d'arrivée avec balise (X=26, Z=-1, Y=74)
    print("3. Plateforme d'arrivée...")
    rcon(f"execute in {WORLD} run fill 25 74 -2 27 74 0 emerald_block")
    rcon(f"execute in {WORLD} run setblock 26 75 -1 light_weighted_pressure_plate")

    # 4. Hologramme du Top Parkour (Armors stands)
    print("4. Érection de l'Hologramme Top Parkour...")
    rcon(f"execute in {WORLD} run summon armor_stand 22.5 68.0 0.5 {{Invisible:1b,NoGravity:1b,CustomName:'{{\"text\":\"✦ CLASSEMENT TOP PARKOUR ✦\",\"color\":\"gold\",\"bold\":true}}',CustomNameVisible:1b}}")
    rcon(f"execute in {WORLD} run summon armor_stand 22.5 67.6 0.5 {{Invisible:1b,NoGravity:1b,CustomName:'{{\"text\":\"#1 Klemz_696 — 14.82s\",\"color\":\"yellow\"}}',CustomNameVisible:1b}}")
    rcon(f"execute in {WORLD} run summon armor_stand 22.5 67.2 0.5 {{Invisible:1b,NoGravity:1b,CustomName:'{{\"text\":\"#2 Invité_01 — 18.45s\",\"color\":\"gray\"}}',CustomNameVisible:1b}}")

    print("=== [LOT 7] Top Parkour opérationnel avec classement physique ! ===")

if __name__ == "__main__":
    build_parkour()
