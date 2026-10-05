#!/usr/bin/env python3
"""
JoyStick FM - Master Polish & Fix Orchestrator (Lots 0-7 Refinements)
Resolves all in-game feedback:
  1. Texts & NPCs: Section signs (§) styling with zero raw JSON syntax visible.
  2. DeluxeMenus: Hide item attributes, gorgeous centered title, working stats & quit button.
  3. Mini-Games Lobbies: Forceloaded solid platforms (33x33 quartz/neon in lobby_minijeux, Y=100 rooms in rush_jfm & bedwars_jfm).
  4. Anti-Void Catch: Fail-safe barrier floor at Y=20 + repeating command block covering Y=-128..52 (no death screen).
  5. Top Parkour: Moved directly adjacent to Spawn (starts at X=8) with clear illuminated leaderboard.
  6. Solo Testing: minPlayers=1 on rush_1v1, rush_2v2, jfm_duo, blockhunt for instant solo starts.
  7. Lobby Exits: Return-to-hub items, portal stations, and menu quit buttons.
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
    return out

def cp(src, dst):
    res = subprocess.run(["docker", "cp", str(src), f"{CONTAINER}:{dst}"], capture_output=True, text=True)
    if res.returncode == 0:
        print(f" [COPY] {Path(src).name} -> {dst} OK")
    else:
        print(f" [COPY ERROR] {res.stderr}")

def main():
    print("=" * 66)
    print(" JOYSTICK FM — APPLICATION DU PACK DE FINITION & EXPÉRIENCE DE JEU")
    print("=" * 66)

    # 1. Activation des Command Blocks dans server.properties
    print("\n--- [1/7] Configuration des Command Blocks ---")
    subprocess.run(["docker", "exec", "-i", CONTAINER, "sed", "-i", "s/enable-command-block=false/enable-command-block=true/g", "/data/server.properties"])
    rcon("gamerule enableCommandBlockOutput false")
    print("  -> Blocs de commande activés et notifications masquées.")

    # 2. Déploiement des configurations Solo et Menus polis
    print("\n--- [2/7] Injection des Fichiers de Configuration Mis à Jour ---")
    cp(BASE_DIR / "Lot_6_Navigation_et_Menus" / "lot6_games_menu.yml", "/data/plugins/DeluxeMenus/gui_menus/games.yml")
    cp(BASE_DIR / "Lot_4_Rush_FunCraft" / "rush_1v1.yml", "/data/plugins/BedWars/arenas/rush_1v1.yml")
    cp(BASE_DIR / "Lot_4_Rush_FunCraft" / "rush_2v2.yml", "/data/plugins/BedWars/arenas/rush_2v2.yml")
    cp(BASE_DIR / "Lot_1_BedWars_BlockHunt" / "jfm_duo.yml", "/data/plugins/BedWars/arenas/jfm_duo.yml")
    cp(BASE_DIR / "Lot_1_BedWars_BlockHunt" / "blockhunt_arenas.yml", "/data/plugins/BlockHunt/arenas.yml")

    # Configuration ItemJoin étendue à lobby_minijeux
    itemjoin_yaml = """items-v4:
  game-selector:
    id: COMPASS
    slot: 4
    name: '&6&l✦ MENU DES JEUX ✦ &7(Clic-Droit)'
    lore:
      - '&7Clique pour ouvrir la sélection des jeux :'
      - '&8▸ &aSurvie Vanilla'
      - '&8▸ &cBedWars &6Rush'
      - '&8▸ &eHikabrain &3Cache-Cache'
      - ''
      - '&e➜ Clic-droit pour ouvrir le menu'
    commands:
      right-click:
        - 'player: menu'
      left-click:
        - 'player: menu'
    enabled-worlds:
      - hub
      - lobby_minijeux
    triggers:
      - join
      - respawn
      - world-change
    itemflags:
      - HIDE_ATTRIBUTES
    give-on-world-switch: true
  quit-lobby:
    id: RED_BED
    slot: 8
    name: '&c&l✦ RETOUR AU HUB ✦ &7(Clic-Droit)'
    lore:
      - '&7Clique pour quitter et retourner au Hub principal.'
      - ''
      - '&c➜ Clic-droit pour téléporter au Hub'
    commands:
      right-click:
        - 'player: spawn'
      left-click:
        - 'player: spawn'
    enabled-worlds:
      - lobby_minijeux
      - rush_jfm
      - hikabrain_jfm
    triggers:
      - join
      - respawn
      - world-change
    itemflags:
      - HIDE_ATTRIBUTES
    give-on-world-switch: true
"""
    items_path = BASE_DIR / "items_polished.yml"
    items_path.write_text(itemjoin_yaml, encoding="utf-8")
    cp(items_path, "/data/plugins/ItemJoin/items.yml")

    # 3. Sécurisation Hub & Système Anti-Chute
    print("\n--- [3/7] Sécurisation Hub & Filet Anti-Chute Réfléchi ---")
    subprocess.run([sys.executable, str(BASE_DIR / "Lot_2_Hub_et_Lobby_Minijeux" / "lot2_hub_security.py")])

    # 4. Construction Robuste du Lobby Mini-Jeux
    print("\n--- [4/7] Construction Robuste du Lobby des Mini-Jeux ---")
    subprocess.run([sys.executable, str(BASE_DIR / "Lot_2_Hub_et_Lobby_Minijeux" / "lot2_generate_minigames_lobby.py")])

    # 5. Salles d'attente d'arènes Rush et BedWars (Y=100)
    print("\n--- [5/7] Construction des Salles d'Attente d'Arènes (Y=100) ---")
    # Rush waiting room
    rcon("execute in rush_jfm run forceload add -1 -1 1 1")
    rcon("execute in rush_jfm run fill -7 100 -7 7 100 7 smooth_stone")
    rcon("execute in rush_jfm run fill -7 101 -7 7 103 7 glass")
    rcon("execute in rush_jfm run fill -7 104 -7 7 104 7 barrier")
    rcon("execute in rush_jfm run setblock 0 100 0 glowstone")
    # Bedwars waiting room
    rcon("execute in bedwars_jfm run forceload add -1 -1 1 1")
    rcon("execute in bedwars_jfm run fill -8 100 -8 8 100 8 smooth_stone")
    rcon("execute in bedwars_jfm run fill -8 101 -8 8 103 8 glass")
    rcon("execute in bedwars_jfm run fill -8 104 -8 8 104 8 barrier")
    rcon("execute in bedwars_jfm run setblock 0 100 0 glowstone")
    print("  -> Salles d'attente Y=100 matérialisées.")

    # 6. PNJ et Hologrammes Stylisés (sans JSON brut)
    print("\n--- [6/7] Déploiement des PNJ et Textes Stylisés ---")
    subprocess.run([sys.executable, str(BASE_DIR / "Lot_6_Navigation_et_Menus" / "lot6_setup_lobby_npcs.py")])
    subprocess.run([sys.executable, str(BASE_DIR / "Lot_7_Finition_Auth_et_Recette" / "lot7_setup_parkour.py")])

    # 7. Rechargement des Plugins
    print("\n--- [7/7] Synchronisation Mémoire des Plugins ---")
    rcon("dm reload")
    rcon("ij reload")
    rcon("bw reload")
    rcon("bh reload")
    rcon("mvinv reload")

    print("\n" + "=" * 66)
    print(" TOUTES LES AMÉLIORATIONS SONT APPLIQUÉES AVEC SUCCÈS ! ")
    print("=" * 66)

if __name__ == "__main__":
    main()
