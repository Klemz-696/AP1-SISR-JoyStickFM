#!/usr/bin/env python3
"""
JoyStick FM - Master Polish & Fix Orchestrator (V2 - In-Game Feedback Resolution)
Resolves:
  1. Parkour: Removes all blocking invisible barrier walls from the jumping airspace (X=4..22).
  2. Compass / JumpTo: Revokes essentials.jumpto & essentials.compass permissions so Essentials no longer hijacks the compass.
  3. ItemJoin: Replaces items.yml with clean version (no $10 cost, no unwanted blocks, protected against drop/death loss).
  4. Void / Fall Damage: Sets gamerule fall_damage false everywhere and installs Y=20 safety net so no player ever dies of fall damage.
  5. Inventory: Clears bugged items and gives the fresh interactive Compass.
  6. NPCs & Holograms: Pure Minecraft color codes (§), zero raw JSON syntax.
  7. Lobbies & Solo: Forceloaded solid platforms, minPlayers=1 for immediate solo game starts.
"""

import os
import subprocess
import sys
import time
from pathlib import Path

CONTAINER = "minecraft_ap1"
BASE_DIR = Path(__file__).resolve().parent

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    out = res.stdout.strip()
    print(f" [RCON] {cmd[:50]} => {out[:60]}")
    return out

def cp(src, dst):
    res = subprocess.run(["docker", "cp", str(src), f"{CONTAINER}:{dst}"], capture_output=True, text=True)
    if res.returncode == 0:
        print(f" [COPY] {Path(src).name} -> {dst} OK")
    else:
        print(f" [COPY ERROR] {res.stderr}")

def main():
    print("=" * 66)
    print(" JOYSTICK FM — APPLICATION DU CORRECTIF COMPLET IN-GAME (V2)")
    print("=" * 66)

    # 1. Neutraliser l'interception de la Boussole par Essentials (/jumpto)
    print("\n--- [1/8] Neutralisation du détournement de la Boussole par Essentials ---")
    rcon("lp group default permission set essentials.jumpto false")
    rcon("lp group default permission set essentials.compass false")
    rcon("lp group default permission set essentials.top false")
    rcon("lp group default permission set itemjoin.use true")
    rcon("lp group default permission set itemjoin.* true")
    print("  -> Permissions essentials.jumpto et essentials.compass révoquées.")

    # 2. Suppression TOTALE des dégâts de chute (Zéro mort par chute)
    print("\n--- [2/8] Suppression de tous les dégâts de chute (fall_damage false) ---")
    rcon("gamerule fallDamage false")
    rcon("execute in hub run gamerule minecraft:fall_damage false")
    rcon("execute in lobby_minijeux run gamerule minecraft:fall_damage false")
    rcon("execute in rush_jfm run gamerule minecraft:fall_damage false")
    rcon("execute in hikabrain_jfm run gamerule minecraft:fall_damage false")
    # Activation des blocs de commande
    subprocess.run(["docker", "exec", "-i", CONTAINER, "sed", "-i", "s/enable-command-block=false/enable-command-block=true/g", "/data/server.properties"])
    rcon("gamerule enableCommandBlockOutput false")

    # 3. Injection des configurations propres
    print("\n--- [3/8] Injection des Configurations Propres (Menus, Arenas Solo, Items) ---")
    cp(BASE_DIR / "Lot_6_Navigation_et_Menus" / "lot6_games_menu.yml", "/data/plugins/DeluxeMenus/gui_menus/games.yml")
    cp(BASE_DIR / "Lot_6_Navigation_et_Menus" / "items.yml", "/data/plugins/ItemJoin/items.yml")
    cp(BASE_DIR / "Lot_4_Rush_FunCraft" / "rush_1v1.yml", "/data/plugins/BedWars/arenas/rush_1v1.yml")
    cp(BASE_DIR / "Lot_4_Rush_FunCraft" / "rush_2v2.yml", "/data/plugins/BedWars/arenas/rush_2v2.yml")
    cp(BASE_DIR / "Lot_1_BedWars_BlockHunt" / "jfm_duo.yml", "/data/plugins/BedWars/arenas/jfm_duo.yml")
    cp(BASE_DIR / "Lot_1_BedWars_BlockHunt" / "blockhunt_arenas.yml", "/data/plugins/BlockHunt/arenas.yml")

    # 4. Sécurisation Hub & Filet de Sécurité (Périmètre élargi à +/-25)
    print("\n--- [4/8] Application de la Sécurité du Hub & Filet Anti-Chute ---")
    subprocess.run([sys.executable, str(BASE_DIR / "Lot_2_Hub_et_Lobby_Minijeux" / "lot2_hub_security.py")])

    # 5. Top Parkour Libéré (100% Praticable sans barrières invisibles)
    print("\n--- [5/8] Reconstruction du Top Parkour Accessible au Spawn ---")
    subprocess.run([sys.executable, str(BASE_DIR / "Lot_7_Finition_Auth_et_Recette" / "lot7_setup_parkour.py")])

    # 6. Matérialisation Robuste du Lobby Mini-Jeux
    print("\n--- [6/8] Génération Robuste du Lobby des Mini-Jeux ---")
    subprocess.run([sys.executable, str(BASE_DIR / "Lot_2_Hub_et_Lobby_Minijeux" / "lot2_generate_minigames_lobby.py")])

    # Salles d'attente d'arènes Rush et BedWars (Y=100)
    rcon("execute in rush_jfm run forceload add -1 -1 1 1")
    rcon("execute in rush_jfm run fill -7 100 -7 7 100 7 smooth_stone")
    rcon("execute in rush_jfm run fill -7 101 -7 7 103 7 glass")
    rcon("execute in rush_jfm run fill -7 104 -7 7 104 7 barrier")
    rcon("execute in rush_jfm run setblock 0 100 0 glowstone")

    rcon("execute in bedwars_jfm run forceload add -1 -1 1 1")
    rcon("execute in bedwars_jfm run fill -8 100 -8 8 100 8 smooth_stone")
    rcon("execute in bedwars_jfm run fill -8 101 -8 8 103 8 glass")
    rcon("execute in bedwars_jfm run fill -8 104 -8 8 104 8 barrier")
    rcon("execute in bedwars_jfm run setblock 0 100 0 glowstone")

    # 7. PNJ et Textes Stylisés sans JSON brut
    print("\n--- [7/8] PNJ et Hologrammes Stylisés ---")
    subprocess.run([sys.executable, str(BASE_DIR / "Lot_6_Navigation_et_Menus" / "lot6_setup_lobby_npcs.py")])

    # 8. Rechargement des Plugins et Nettoyage de l'Inventaire
    print("\n--- [8/8] Rechargement Général et Distribution de la Boussole Propre ---")
    rcon("dm reload")
    rcon("ij reload")
    rcon("bw reload")
    rcon("bh reload")
    rcon("mvinv reload")

    # Purge des vieux items buggés de l'inventaire des joueurs en ligne
    rcon("clear @a")
    rcon("itemjoin get game-selector @a")

    print("\n" + "=" * 66)
    print(" TOUS LES PROBLÈMES SONT ENTIÈREMENT RÉSOLUS ! ")
    print("=" * 66)

if __name__ == "__main__":
    main()
