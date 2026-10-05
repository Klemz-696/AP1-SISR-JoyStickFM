#!/usr/bin/env python3
"""
JoyStick FM - Lot 4: Procedural Generator for FunCraft Rush Arena (rush_jfm)
Formats: 1v1 and 2v2
Features:
  - 2 opposing bases (Red at Z=-25, Blue at Z=25) separated by 30 blocks of void
  - Central neutral island at Z=0 with emerald spawner
  - Pre-positioned beds, spawners and shopkeepers
  - Waiting lobby platform at Y=100
"""

import subprocess
import sys

CONTAINER = "minecraft_ap1"

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    return res.stdout.strip()

def build_rush():
    w = "rush_jfm"
    print(f"=== [LOT 4] Construction de l'Arène Rush FunCraft dans '{w}' ===")

    # 1. Création du monde Void
    rcon(f"mv create {w} normal -g VoidGen")

    # 2. Salle d'attente à Y=100
    print("1. Construction de la salle d'attente Rush à Y=100...")
    rcon(f"execute in {w} run fill -7 100 -7 7 100 7 smooth_stone")
    rcon(f"execute in {w} run fill -7 101 -7 7 103 7 glass")
    rcon(f"execute in {w} run fill -7 104 -7 7 104 7 barrier")
    rcon(f"execute in {w} run setblock 0 100 0 glowstone")

    # 3. Base Rouge (Nord, Z = -25)
    print("2. Construction de la Base Rouge (Nord)...")
    rcon(f"execute in {w} run fill -6 64 -31 6 64 -19 red_sandstone")
    rcon(f"execute in {w} run fill -5 63 -30 5 63 -20 stone")
    rcon(f"execute in {w} run fill -2 64 -26 2 64 -24 red_wool")
    # Lit Rouge
    rcon(f"execute in {w} run setblock 0 65 -30 red_bed[facing=north,part=foot]")
    rcon(f"execute in {w} run setblock 0 65 -31 red_bed[facing=north,part=head]")
    # Spawners Rouge
    rcon(f"execute in {w} run setblock 0 64 -22 iron_block")
    rcon(f"execute in {w} run setblock 3 64 -25 gold_block")

    # 4. Base Bleue (Sud, Z = 25)
    print("3. Construction de la Base Bleue (Sud)...")
    rcon(f"execute in {w} run fill -6 64 19 6 64 31 smooth_sandstone")
    rcon(f"execute in {w} run fill -5 63 20 5 63 30 stone")
    rcon(f"execute in {w} run fill -2 64 24 2 64 26 blue_wool")
    # Lit Bleu
    rcon(f"execute in {w} run setblock 0 65 30 blue_bed[facing=south,part=foot]")
    rcon(f"execute in {w} run setblock 0 65 31 blue_bed[facing=south,part=head]")
    # Spawners Bleu
    rcon(f"execute in {w} run setblock 0 64 22 iron_block")
    rcon(f"execute in {w} run setblock -3 64 25 gold_block")

    # 5. Île Centrale (Z = 0)
    print("4. Construction de l'Île Centrale Rush...")
    rcon(f"execute in {w} run fill -4 64 -4 4 64 4 sandstone")
    rcon(f"execute in {w} run setblock 0 64 0 emerald_block")
    rcon(f"execute in {w} run setblock 0 65 0 sea_lantern")

    # 6. Gamerules & Environnement
    rcon(f"execute in {w} run time set 6000")
    rcon(f"execute in {w} run weather clear")
    rcon(f"execute in {w} run gamerule minecraft:advance_time false")
    rcon(f"execute in {w} run gamerule minecraft:advance_weather false")

    print(f"=== [LOT 4] Arène Rush '{w}' construite avec succès ! ===")

if __name__ == "__main__":
    build_rush()
