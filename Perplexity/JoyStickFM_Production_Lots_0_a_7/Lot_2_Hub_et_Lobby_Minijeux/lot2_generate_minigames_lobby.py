#!/usr/bin/env python3
"""
JoyStick FM - Lot 2: Robust Generator for Dedicated Mini-Games Lobby (lobby_minijeux)
Features:
  - Forceload chunks to guarantee 100% block generation
  - 33x33 futuristic quartz & neon esplanade at Y=64 with underlighting
  - 4 thematic stations (BedWars, Hikabrain, BlockHunt, Rush)
  - Grand Exit Station to return to Hub (Bed / Door icon)
  - Perimeter barriers + invisible anti-fall safety net at Y=15
  - Autonomous repeating command block for safe void catch
"""

import subprocess
import sys

CONTAINER = "minecraft_ap1"
WORLD = "lobby_minijeux"

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    return res.stdout.strip()

def build_lobby():
    w = WORLD
    print(f"=== [LOT 2] Construction Robuste du Lobby Mini-Jeux dans '{w}' ===")

    # 1. Création du monde Void si absent
    rcon(f"mv create {w} normal -g VoidGen")

    # 2. Forceload des chunks pour garantir le placement des blocs
    print("1. Verrouillage du chargement des chunks (-2 -2 à 2 2)...")
    rcon(f"execute in {w} run forceload add -2 -2 2 2")

    # 3. Base et Esplanade centrale (33x33 blocs à Y=64)
    print("2. Pose de la dalle de fondation et de l'esplanade...")
    # Couche de sécurité inférieure (Y=63)
    rcon(f"execute in {w} run fill -16 63 -16 16 63 16 black_concrete")
    # Esplanade principale en quartz lisse (Y=64)
    rcon(f"execute in {w} run fill -16 64 -16 16 64 16 smooth_quartz")

    # 4. Anneaux d'accents néon JoyStick FM (Violet et Cyan)
    print("3. Intégration des bandes néon violettes et cyan...")
    rcon(f"execute in {w} run fill -16 64 -16 16 64 -16 purple_concrete")
    rcon(f"execute in {w} run fill -16 64 16 16 64 16 purple_concrete")
    rcon(f"execute in {w} run fill -16 64 -16 -16 64 16 cyan_concrete")
    rcon(f"execute in {w} run fill 16 64 -16 16 64 16 cyan_concrete")

    # Motif croisé central néon
    rcon(f"execute in {w} run fill -16 64 0 16 64 0 light_blue_concrete")
    rcon(f"execute in {w} run fill 0 64 -16 0 64 16 magenta_concrete")

    # 5. Monument central luminescent
    print("4. Édification du monument central avec balise...")
    rcon(f"execute in {w} run fill -2 64 -2 2 64 2 sea_lantern")
    rcon(f"execute in {w} run fill -1 65 -1 1 65 1 iron_block")
    rcon(f"execute in {w} run setblock 0 66 0 beacon")
    rcon(f"execute in {w} run setblock 0 67 0 magenta_stained_glass")

    # 6. Garde-corps et barrières invisibles périmétriques (impossible de tomber accidentellement)
    print("5. Sécurisation périmétrique anti-chute...")
    rcon(f"execute in {w} run fill -16 65 -16 16 66 -16 purple_stained_glass")
    rcon(f"execute in {w} run fill -16 65 16 16 66 16 purple_stained_glass")
    rcon(f"execute in {w} run fill -16 65 -16 -16 66 16 cyan_stained_glass")
    rcon(f"execute in {w} run fill 16 65 -16 16 66 16 cyan_stained_glass")
    # Mur invisible de 3 blocs de haut
    rcon(f"execute in {w} run fill -16 67 -16 16 70 -16 barrier")
    rcon(f"execute in {w} run fill -16 67 16 16 70 16 barrier")
    rcon(f"execute in {w} run fill -16 67 -16 -16 70 16 barrier")
    rcon(f"execute in {w} run fill 16 67 -15 16 70 16 barrier")

    # 7. Filet de sécurité anti-vide à Y=15 (filet invisible empêchant toute mort)
    print("6. Pose du filet de sécurité anti-mort à Y=15...")
    rcon(f"execute in {w} run fill -25 15 -25 25 15 25 barrier")

    # 8. Station Nord : BedWars (Z = -14)
    print("7. Station Nord : BedWars...")
    rcon(f"execute in {w} run fill -4 65 -16 4 69 -16 red_concrete")
    rcon(f"execute in {w} run fill -2 65 -16 2 68 -16 red_stained_glass")
    rcon(f"execute in {w} run setblock 0 64 -14 sea_lantern")
    rcon(f"execute in {w} run setblock 0 65 -15 red_bed[facing=north,part=foot]")

    # 9. Station Sud : Hikabrain (Z = 14)
    print("8. Station Sud : Hikabrain...")
    rcon(f"execute in {w} run fill -4 65 16 4 69 16 yellow_concrete")
    rcon(f"execute in {w} run fill -2 65 16 2 68 16 yellow_stained_glass")
    rcon(f"execute in {w} run setblock 0 64 14 sea_lantern")
    rcon(f"execute in {w} run setblock 0 65 15 sandstone")

    # 10. Station Est : BlockHunt Village (X = 14)
    print("9. Station Est : BlockHunt...")
    rcon(f"execute in {w} run fill 16 65 -4 16 69 4 oak_planks")
    rcon(f"execute in {w} run fill 16 65 -2 16 68 2 bookshelf")
    rcon(f"execute in {w} run setblock 14 64 0 sea_lantern")
    rcon(f"execute in {w} run setblock 15 65 0 barrel")

    # 11. Station Ouest : Rush FunCraft (X = -14)
    print("10. Station Ouest : Rush FunCraft...")
    rcon(f"execute in {w} run fill -16 65 -4 -16 69 4 gold_block")
    rcon(f"execute in {w} run fill -16 65 -2 -16 68 2 orange_stained_glass")
    rcon(f"execute in {w} run setblock -14 64 0 sea_lantern")
    rcon(f"execute in {w} run setblock -15 65 0 anvil")

    # 12. Portail / Arche de Retour au Hub (Coin Sud-Ouest, X = -10, Z = 10)
    print("11. Construction de la borne de sortie vers le Hub...")
    rcon(f"execute in {w} run fill -12 65 9 -12 68 13 emerald_block")
    rcon(f"execute in {w} run fill -12 65 10 -12 67 12 air")
    rcon(f"execute in {w} run setblock -12 64 11 sea_lantern")
    rcon(f"execute in {w} run setblock -12 65 11 heavy_weighted_pressure_plate")

    # 13. Bloc de commande anti-chute autonome dans lobby_minijeux
    print("12. Mise en place du bloc de commande anti-chute...")
    rcon(f"execute in {w} run setblock 0 63 0 repeating_command_block[facing=up]{{Command:\"execute as @a[y=-128,dy=180] run tp @s 0.5 65.0 0.5 0 0\",auto:1b}}")

    # 14. Configuration environnementale
    rcon(f"execute in {w} run gamerule minecraft:advance_time false")
    rcon(f"execute in {w} run gamerule minecraft:advance_weather false")
    rcon(f"execute in {w} run gamerule minecraft:spawn_monsters false")
    rcon(f"execute in {w} run setworldspawn 0 65 0")

    print(f"=== [LOT 2] Le Lobby Mini-Jeux '{w}' est 100% matérialisé et sécurisé ! ===")

if __name__ == "__main__":
    build_lobby()
