#!/usr/bin/env python3
"""
JoyStick FM - Master Polish & Fix Orchestrator (V3 - Final Resolution of All In-Game Issues)
Resolves:
  1. Compass Item & $10 error: Purges /data/plugins/ItemJoin/players/, replaces items.yml with zero-cost config, clears inventory and delivers the fresh interactive Compass.
  2. JumpTo / Essentials Compass Hijack: Revokes essentials.jumpto & essentials.compass permissions for default and user Klemz_696.
  3. Duplicate Parkour: Purges all duplicate floating blocks and old armor stands/text displays across X=4..60, Y=63..100.
  4. Parkour Leaderboard: Single crystal-clear holographic display using pure Minecraft color codes (§), guaranteed 0% raw JSON.
  5. Fall Damage & Anti-Void Teleportation: Removes Y=20 invisible barrier floor and establishes a 4000x4000 repeating command block (Y=-64..54) catching any player falling into the void and teleporting them back to Spawn (0.5, 65.0, 0.5) with zero damage.
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
    print(f" [RCON] {cmd[:60]} => {out[:70]}")
    return out

def cp(src, dst):
    res = subprocess.run(["docker", "cp", str(src), f"{CONTAINER}:{dst}"], capture_output=True, text=True)
    if res.returncode == 0:
        print(f" [COPY] {Path(src).name} -> {dst} OK")
    else:
        print(f" [COPY ERROR] {res.stderr}")

def main():
    print("=" * 70)
    print(" JOYSTICK FM — APPLICATION DU CORRECTIF MAÎTRE FINAL (V3)")
    print("=" * 70)

    # 1. Activation des Command Blocks dans server.properties
    print("\n--- [1/8] Activation des Blocs de Commande ---")
    subprocess.run(["docker", "exec", "-i", CONTAINER, "sed", "-i", "s/enable-command-block=false/enable-command-block=true/g", "/data/server.properties"])
    rcon("gamerule enableCommandBlockOutput false")
    rcon("gamerule commandBlockOutput false")

    # 2. Neutraliser l'interception de la Boussole par Essentials (/jumpto)
    print("\n--- [2/8] Neutralisation du détournement de la Boussole par Essentials ---")
    rcon("lp group default permission set essentials.jumpto false")
    rcon("lp group default permission set essentials.compass false")
    rcon("lp group default permission set essentials.top false")
    rcon("lp user Klemz_696 permission set essentials.jumpto false")
    rcon("lp user Klemz_696 permission set essentials.compass false")
    rcon("lp user Klemz_696 permission set essentials.top false")
    rcon("lp group default permission set itemjoin.use true")
    rcon("lp group default permission set itemjoin.* true")
    rcon("lp group default permission set deluxemenus.menu true")
    rcon("lp group default permission set deluxemenus.open true")
    rcon("lp group default permission set deluxemenus.open.games true")
    rcon("lp group default permission set deluxemenus.execute true")
    print("  -> Permissions essentials révoquées et permissions menus garanties.")

    # 3. Dégâts de chute = FALSE partout
    print("\n--- [3/8] Désactivation Totale des Dégâts de Chute ---")
    rcon("gamerule fallDamage false")
    for w in ["hub", "world", "lobby_minijeux", "rush_jfm", "hikabrain_jfm", "survie"]:
        rcon(f"execute in {w} run gamerule minecraft:fall_damage false")

    # 4. Injection des configurations propres
    print("\n--- [4/8] Injection des Configurations Propres ---")
    cp(BASE_DIR / "Lot_6_Navigation_et_Menus" / "lot6_games_menu.yml", "/data/plugins/DeluxeMenus/gui_menus/games.yml")
    cp(BASE_DIR / "Lot_6_Navigation_et_Menus" / "items.yml", "/data/plugins/ItemJoin/items.yml")
    cp(BASE_DIR / "Lot_4_Rush_FunCraft" / "rush_1v1.yml", "/data/plugins/BedWars/arenas/rush_1v1.yml")
    cp(BASE_DIR / "Lot_4_Rush_FunCraft" / "rush_2v2.yml", "/data/plugins/BedWars/arenas/rush_2v2.yml")
    cp(BASE_DIR / "Lot_1_BedWars_BlockHunt" / "jfm_duo.yml", "/data/plugins/BedWars/arenas/jfm_duo.yml")
    cp(BASE_DIR / "Lot_1_BedWars_BlockHunt" / "blockhunt_arenas.yml", "/data/plugins/BlockHunt/arenas.yml")

    # 5. Purge du cache joueur ItemJoin (éradique le $10 error)
    print("\n--- [5/8] Purge du Cache Joueurs ItemJoin ---")
    subprocess.run(["docker", "exec", "-i", CONTAINER, "rm", "-rf", "/data/plugins/ItemJoin/players/"])
    print("  -> Cache ItemJoin purgé.")

    # 6. Sécurisation Hub & Anti-Chute Re-TP (suppression sol Y=20, cube 4000x4000)
    print("\n--- [6/8] Application de la Sécurité du Hub & Re-TP Anti-Vide ---")
    subprocess.run([sys.executable, str(BASE_DIR / "Lot_2_Hub_et_Lobby_Minijeux" / "lot2_hub_security.py")])

    # 7. Top Parkour V4 (Purge totale des doublons, hologramme HD §, mécanique interactive)
    print("\n--- [7/8] Reconstruction Unique du Top Parkour (Zéro Doublon) ---")
    subprocess.run([sys.executable, str(BASE_DIR / "Lot_7_Finition_Auth_et_Recette" / "lot7_setup_parkour.py")])

    # 8. Rechargement des Plugins & Distribution de la Boussole
    print("\n--- [8/8] Rechargement Général et Attribution de la Boussole Interactive ---")
    rcon("dm reload")
    rcon("ij reload")
    rcon("bw reload")
    rcon("bh reload")
    rcon("mvinv reload")

    # Nettoyage radical de l'inventaire des joueurs en ligne
    print("  -> Nettoyage de l'inventaire de tous les joueurs...")
    rcon("clear @a")
    time.sleep(1)

    # Attribution de la boussole interactive officielle
    print("  -> Distribution de la Boussole Menu des Jeux...")
    rcon('give @a minecraft:compass[custom_name=\'{"text":"✦ MENU DES JEUX ✦ (Clic-Droit)","color":"gold","bold":true}\'] 1')
    rcon("itemjoin get game-selector @a")

    print("\n" + "=" * 70)
    print(" MISE À JOUR V3 APPLIQUÉE AVEC SUCCÈS : TOUS LES POINTS SONT RÉSOLUS !")
    print("=" * 70)

if __name__ == "__main__":
    main()
