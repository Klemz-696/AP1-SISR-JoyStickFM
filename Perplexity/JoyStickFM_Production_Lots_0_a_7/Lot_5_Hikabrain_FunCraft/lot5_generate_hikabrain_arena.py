#!/usr/bin/env python3
"""
JoyStick FM - Lot 5: Procedural Generator for FunCraft Hikabrain Arena (hikabrain_jfm)
Features:
  - 1-block wide suspended sandstone bridge (Y=64, length 40 blocks)
  - Red Base at North (Z = -21) with Red Bed
  - Blue Base at South (Z = 21) with Blue Bed
  - Waiting Lobby at Y=100
"""

import subprocess
import sys

CONTAINER = "minecraft_ap1"

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    return res.stdout.strip()

def build_hikabrain():
    w = "hikabrain_jfm"
    print(f"=== [LOT 5] Construction de l'Arène Hikabrain dans '{w}' ===")

    # 1. Création du monde Void
    rcon(f"mv create {w} normal -g VoidGen")

    # 2. Plateforme d'attente à Y=100
    print("1. Construction de la plateforme d'attente Hikabrain à Y=100...")
    rcon(f"execute in {w} run fill -5 100 -5 5 100 5 smooth_stone")
    rcon(f"execute in {w} run fill -5 101 -5 5 103 5 glass")
    rcon(f"execute in {w} run fill -5 104 -5 5 104 5 barrier")
    rcon(f"execute in {w} run setblock 0 100 0 glowstone")

    # 3. Passerelle étroite de 1 bloc en grès (Z = -18 à 18 à Y=64)
    print("2. Construction de la passerelle suspendue de 1 bloc de large...")
    rcon(f"execute in {w} run fill 0 64 -18 0 64 18 sandstone")

    # 4. Base Rouge (Nord, Z = -21)
    print("3. Construction de la Base Rouge...")
    rcon(f"execute in {w} run fill -2 64 -23 2 64 -19 red_concrete")
    rcon(f"execute in {w} run fill -2 65 -23 2 66 -23 red_stained_glass")
    rcon(f"execute in {w} run setblock 0 64 -21 sea_lantern")
    # Lit Rouge (Cible pour les Bleus)
    rcon(f"execute in {w} run setblock 0 65 -22 red_bed[facing=north,part=foot]")
    rcon(f"execute in {w} run setblock 0 65 -23 red_bed[facing=north,part=head]")

    # 5. Base Bleue (Sud, Z = 21)
    print("4. Construction de la Base Bleue...")
    rcon(f"execute in {w} run fill -2 64 19 2 64 23 blue_concrete")
    rcon(f"execute in {w} run fill -2 65 23 2 66 23 blue_stained_glass")
    rcon(f"execute in {w} run setblock 0 64 21 sea_lantern")
    # Lit Bleu (Cible pour les Rouges)
    rcon(f"execute in {w} run setblock 0 65 22 blue_bed[facing=south,part=foot]")
    rcon(f"execute in {w} run setblock 0 65 23 blue_bed[facing=south,part=head]")

    # 6. Gamerules & Environnement
    rcon(f"execute in {w} run time set 6000")
    rcon(f"execute in {w} run weather clear")
    rcon(f"execute in {w} run gamerule minecraft:advance_time false")
    rcon(f"execute in {w} run gamerule minecraft:advance_weather false")

    print(f"=== [LOT 5] Arène Hikabrain '{w}' construite avec succès ! ===")

if __name__ == "__main__":
    build_hikabrain()
