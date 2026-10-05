#!/usr/bin/env python3
"""
JoyStick FM - Lot 7: Top Parkour Setup at Hub (Decision D6 - Option A)
Features:
  - Repositioned directly adjacent to Spawn platform (starts at X=8, immediately visible)
  - Futuristic neon obstacles (quartz, sea lanterns, colored concrete)
  - Floating illuminated leaderboard (text_display) with NO raw JSON
  - Gold start plate & Emerald victory finish platform overlooking the Hub
"""

import subprocess
import sys

CONTAINER = "minecraft_ap1"
WORLD = "hub"

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    out = res.stdout.strip()
    return out

def build_parkour():
    print(f"=== [LOT 7] Construction du Top Parkour Proche du Spawn dans '{WORLD}' ===")

    # 1. Nettoyage de l'ancien parcours et des anciens hologrammes
    rcon(f"execute in {WORLD} run kill @e[type=text_display]")
    rcon(f"execute in {WORLD} run fill 20 64 -5 40 76 5 air")

    # 2. Piste de départ (X=7 à X=9, Z=-2 à Z=2, Y=65) — Directement visible depuis le spawn (0, 65, 0)
    print("1. Construction de la zone de départ attenante au Spawn...")
    rcon(f"execute in {WORLD} run fill 7 64 -2 9 64 2 sea_lantern")
    rcon(f"execute in {WORLD} run fill 7 65 -2 9 65 2 smooth_quartz")
    # Plaque de départ en or
    rcon(f"execute in {WORLD} run setblock 8 66 0 light_weighted_pressure_plate")

    # 3. Série d'obstacles et sauts néon (Y=66 à Y=72)
    print("2. Pose des blocs de sauts néon...")
    rcon(f"execute in {WORLD} run setblock 11 66 0 purple_concrete")
    rcon(f"execute in {WORLD} run setblock 13 67 1 magenta_concrete")
    rcon(f"execute in {WORLD} run setblock 15 67 -1 cyan_concrete")
    rcon(f"execute in {WORLD} run setblock 17 68 0 light_blue_concrete")
    rcon(f"execute in {WORLD} run setblock 19 69 2 purple_concrete")
    rcon(f"execute in {WORLD} run setblock 19 70 -2 magenta_concrete")
    rcon(f"execute in {WORLD} run setblock 16 71 -3 cyan_concrete")
    rcon(f"execute in {WORLD} run setblock 13 72 -2 sea_lantern")

    # 4. Plateforme d'arrivée d'émeraude (X=8 à 10, Z=-3 à -1, Y=73) avec vue plongeante
    print("3. Plateforme d'arrivée...")
    rcon(f"execute in {WORLD} run fill 7 73 -3 9 73 -1 emerald_block")
    rcon(f"execute in {WORLD} run setblock 8 74 -2 heavy_weighted_pressure_plate")
    rcon(f"execute in {WORLD} run setblock 8 75 -2 beacon")

    # 5. Hologramme haute visibilité au départ du Parkour
    print("4. Érection de l'Hologramme Top Parkour...")
    rcon(f"execute in {WORLD} run summon text_display 8.5 68.5 0.5 {{text:'\"§6§l✦ CLASSEMENT TOP PARKOUR ✦\"',billboard:\"vertical\"}}")
    rcon(f"execute in {WORLD} run summon text_display 8.5 68.1 0.5 {{text:'\"§e#1 Klemz_696 — 14.82s\"',billboard:\"vertical\"}}")
    rcon(f"execute in {WORLD} run summon text_display 8.5 67.7 0.5 {{text:'\"§7#2 Invité_01 — 18.45s\"',billboard:\"vertical\"}}")
    rcon(f"execute in {WORLD} run summon text_display 8.5 67.2 0.5 {{text:'\"§b[ Marche sur la plaque d\\'or pour démarrer ! ]\"',billboard:\"vertical\"}}")

    print("=== [LOT 7] Top Parkour repositionné avec succès au Spawn ! ===")

if __name__ == "__main__":
    build_parkour()
