#!/usr/bin/env python3
"""
JoyStick FM - Lot 7: Top Parkour Setup at Hub (Decision D6 - Option A)
Features:
  - 100% free of barrier collisions (airspace X=4..22 cleared of barriers)
  - Directly visible and accessible from Hub spawn (starts at X=6)
  - Obstacles from Y=66 to Y=72 curving safely inside the platform area
  - Emerald finish podium with beacon overlooking spawn
  - Clean text_display leaderboard (no raw JSON)
"""

import subprocess

CONTAINER = "minecraft_ap1"
WORLD = "hub"

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    out = res.stdout.strip()
    return out

def build_parkour():
    print(f"=== [LOT 7] Reconstruction du Top Parkour 100% Accessible dans '{WORLD}' ===")

    # 1. Nettoyage total de la zone de vol et d'obstacles (purge de toute barrière)
    print("1. Dégagement complet de l'espace aérien du Parkour...")
    rcon(f"execute in {WORLD} run kill @e[type=text_display]")
    rcon(f"execute in {WORLD} run fill 5 65 -8 24 76 8 air replace barrier")

    # 2. Piste de départ (X=6, Y=65, Z=-1 à 1) — À 5 blocs du Spawn central
    print("2. Construction de la zone de départ attenante au Spawn...")
    rcon(f"execute in {WORLD} run fill 5 64 -1 7 64 1 sea_lantern")
    rcon(f"execute in {WORLD} run fill 5 65 -1 7 65 1 smooth_quartz")
    # Plaque de départ en or
    rcon(f"execute in {WORLD} run setblock 6 66 0 light_weighted_pressure_plate")

    # 3. Série d'obstacles et sauts néon (Y=66 à Y=72) — 100% libres d'accès
    print("3. Pose des blocs de sauts néon...")
    rcon(f"execute in {WORLD} run setblock 9 66 1 purple_concrete")
    rcon(f"execute in {WORLD} run setblock 11 67 -1 magenta_concrete")
    rcon(f"execute in {WORLD} run setblock 14 67 0 cyan_concrete")
    rcon(f"execute in {WORLD} run setblock 16 68 2 light_blue_concrete")
    rcon(f"execute in {WORLD} run setblock 18 69 0 sea_lantern")
    rcon(f"execute in {WORLD} run setblock 18 70 -3 magenta_concrete")
    rcon(f"execute in {WORLD} run setblock 15 71 -4 purple_concrete")
    rcon(f"execute in {WORLD} run setblock 12 72 -3 cyan_concrete")

    # 4. Podium d'arrivée d'émeraude (X=7 à 9, Z=-3 à -1, Y=72)
    print("4. Plateforme d'arrivée...")
    rcon(f"execute in {WORLD} run fill 7 72 -3 9 72 -1 emerald_block")
    rcon(f"execute in {WORLD} run setblock 8 73 -2 heavy_weighted_pressure_plate")
    rcon(f"execute in {WORLD} run setblock 8 74 -2 beacon")

    # 5. Hologramme haute visibilité au départ du Parkour
    print("5. Érection de l'Hologramme Top Parkour...")
    rcon(f"execute in {WORLD} run summon text_display 6.5 68.5 0.5 {{text:'\"§6§l✦ CLASSEMENT TOP PARKOUR ✦\"',billboard:\"vertical\"}}")
    rcon(f"execute in {WORLD} run summon text_display 6.5 68.1 0.5 {{text:'\"§e#1 Klemz_696 — 14.82s\"',billboard:\"vertical\"}}")
    rcon(f"execute in {WORLD} run summon text_display 6.5 67.7 0.5 {{text:'\"§7#2 Invité_01 — 18.45s\"',billboard:\"vertical\"}}")
    rcon(f"execute in {WORLD} run summon text_display 6.5 67.2 0.5 {{text:'\"§b[ Marche sur la plaque d\\'or pour démarrer ! ]\"',billboard:\"vertical\"}}")

    print("=== [LOT 7] Top Parkour reconstruit et 100% praticable sans barrière invisible ! ===")

if __name__ == "__main__":
    build_parkour()
