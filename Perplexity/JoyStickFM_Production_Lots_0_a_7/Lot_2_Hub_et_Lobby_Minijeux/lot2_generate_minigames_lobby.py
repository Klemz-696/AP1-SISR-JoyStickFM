#!/usr/bin/env python3
"""
JoyStick FM - Lot 2: Generator for Dedicated Mini-Games Lobby (lobby_minijeux)
Builds an explorable futuristic neon platform (quartz, purple/cyan concrete, beacons)
featuring 4 thematic portals/stations:
  - North: BedWars (4 teams of 2)
  - South: Hikabrain (1v1 duel bridge)
  - East: BlockHunt (Retro Village hide-and-seek)
  - West: Rush FunCraft (1v1 & 2v2)
  - Center: JoyStick FM Beacon & Spawn monument
"""

import subprocess
import sys

CONTAINER = "minecraft_ap1"

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    return res.stdout.strip()

def build_lobby():
    w = "lobby_minijeux"
    print(f"=== [LOT 2] Construction du Lobby Mini-Jeux dans le monde '{w}' ===")

    # 1. Création du monde Void si absent
    rcon(f"mv create {w} normal -g VoidGen")

    # 2. Esplanade centrale (31x31 blocs à Y=64)
    print("1. Pose de l'esplanade centrale en quartz lisse...")
    rcon(f"execute in {w} run fill -15 64 -15 15 64 15 smooth_quartz")
    rcon(f"execute in {w} run fill -15 63 -15 15 63 15 black_concrete")

    # 3. Anneaux d'accents néon JoyStick FM (Violet et Cyan)
    print("2. Intégration des bandes néon violettes et cyan...")
    rcon(f"execute in {w} run fill -15 64 -15 15 64 -15 purple_concrete")
    rcon(f"execute in {w} run fill -15 64 15 15 64 15 purple_concrete")
    rcon(f"execute in {w} run fill -15 64 -15 -15 64 15 cyan_concrete")
    rcon(f"execute in {w} run fill 15 64 -15 15 64 15 cyan_concrete")

    # 4. Monument central luminescent
    print("3. Édification du monument central avec balise...")
    rcon(f"execute in {w} run fill -2 64 -2 2 64 2 sea_lantern")
    rcon(f"execute in {w} run fill -1 65 -1 1 68 1 beacon")
    rcon(f"execute in {w} run setblock 0 69 0 magenta_stained_glass")

    # 5. Garde-corps et barrières invisibles périmétriques
    print("4. Sécurisation périmétrique anti-chute...")
    rcon(f"execute in {w} run fill -15 65 -15 15 66 -15 purple_stained_glass")
    rcon(f"execute in {w} run fill -15 65 15 15 66 15 purple_stained_glass")
    rcon(f"execute in {w} run fill -15 65 -15 -15 66 15 cyan_stained_glass")
    rcon(f"execute in {w} run fill 15 65 -15 15 66 15 cyan_stained_glass")
    rcon(f"execute in {w} run fill -15 67 -15 15 70 -15 barrier")
    rcon(f"execute in {w} run fill -15 67 15 15 70 15 barrier")
    rcon(f"execute in {w} run fill -15 67 -15 -15 70 15 barrier")
    rcon(f"execute in {w} run fill 15 67 -15 15 70 15 barrier")

    # 6. Station Nord : BedWars
    print("5. Station Nord : BedWars...")
    rcon(f"execute in {w} run fill -5 65 -15 5 70 -15 red_concrete")
    rcon(f"execute in {w} run fill -3 65 -15 3 69 -15 red_stained_glass")
    rcon(f"execute in {w} run setblock 0 65 -14 red_bed")

    # 7. Station Sud : Hikabrain
    print("6. Station Sud : Hikabrain...")
    rcon(f"execute in {w} run fill -5 65 15 5 70 15 yellow_concrete")
    rcon(f"execute in {w} run fill -3 65 15 3 69 15 yellow_stained_glass")
    rcon(f"execute in {w} run setblock 0 65 14 sandstone")

    # 8. Station Est : BlockHunt
    print("7. Station Est : BlockHunt Village...")
    rcon(f"execute in {w} run fill 15 65 -5 15 70 5 oak_planks")
    rcon(f"execute in {w} run fill 15 65 -3 15 69 3 bookshelf")
    rcon(f"execute in {w} run setblock 14 65 0 barrel")

    # 9. Station Ouest : Rush FunCraft & Portail Hub
    print("8. Station Ouest : Rush & Portail Hub...")
    rcon(f"execute in {w} run fill -15 65 -5 -15 70 5 gold_block")
    rcon(f"execute in {w} run fill -15 65 -3 -15 69 3 orange_stained_glass")
    rcon(f"execute in {w} run setblock -14 65 0 golden_pickaxe")

    # 10. Verrouillage environnemental
    rcon(f"execute in {w} run time set 6000")
    rcon(f"execute in {w} run weather clear")
    rcon(f"execute in {w} run gamerule minecraft:advance_time false")
    rcon(f"execute in {w} run gamerule minecraft:advance_weather false")
    rcon(f"execute in {w} run gamerule minecraft:spawn_monsters false")
    rcon(f"execute in {w} run setworldspawn 0 65 0")

    print(f"=== [LOT 2] Le Lobby Mini-Jeux '{w}' est entièrement opérationnel ! ===")

if __name__ == "__main__":
    build_lobby()
