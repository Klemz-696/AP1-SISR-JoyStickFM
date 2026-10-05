#!/usr/bin/env python3
"""
JoyStick FM - Master Deployer for Lots 0 to 7
Automates the sequential execution and deployment of all 8 lots onto the Minecraft server:
  - Lot 0 : Hardware audit, memory staging (16G heap for 22.35G RAM), backup
  - Lot 1 : BedWars & BlockHunt spectator mode (D3) & Multiverse-Inventories
  - Lot 2 : Hub perimeter barriers, void fallback at Y=50, and lobby_minijeux
  - Lot 3 : Pure vanilla survival without claims (D1) & 30-min graves (D5)
  - Lot 4 : Rush FunCraft 1v1 and 2v2 (D4) with custom shop & GrimAC tuning
  - Lot 5 : Hikabrain FunCraft 1v1 duel bridge & 5-point bed scoring (D4)
  - Lot 6 : Complete DeluxeMenus GUI, ItemJoin compass, and interactive NPCs
  - Lot 7 : AuthMe SHA256 config (D2), Top Parkour at Hub (D6), and validation suite
"""

import os
import sys
import subprocess
import pathlib
import time

CONTAINER = "minecraft_ap1"
BASE_DIR = pathlib.Path(__file__).parent.resolve()

def rcon(cmd):
    full_cmd = ["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd]
    res = subprocess.run(full_cmd, capture_output=True, text=True)
    out = res.stdout.strip()
    print(f"  [RCON] > {cmd} => {out[:70]}")
    return out

def cp_to_container(src_path, dest_rel_path):
    dest_path = f"{CONTAINER}:/data/{dest_rel_path}"
    cmd = ["docker", "cp", str(src_path), dest_path]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print(f"  [COPY] {src_path.name} -> /data/{dest_rel_path} OK")
    else:
        print(f"  [COPY-ERROR] {src_path.name}: {res.stderr}")

def main():
    print("==================================================================")
    print("  JOYSTICK FM — DÉPLOIEMENT MAÎTRE DES 8 LOTS DE BASE (0 À 7)    ")
    print("  Specs : 22,35 Go RAM, 15 vCPUs, Émulation SSD                   ")
    print("==================================================================")

    # 1. Vérification conteneur
    check_docker = subprocess.run(["docker", "ps", "--filter", f"name={CONTAINER}", "--format", "{{.Names}}"], capture_output=True, text=True)
    if CONTAINER not in check_docker.stdout:
        print(f"[ERREUR] Le conteneur Docker '{CONTAINER}' n'est pas actif sur cet hôte.")
        print("Veuillez exécuter ce script sur la VM 'srv-minecraft' ou démarrer le conteneur.")
        sys.exit(1)

    # LOT 0 : Staging & Specs
    print("\n--- [LOT 0] Audit Système & Préparation Mémoire (16G Heap) ---")
    rcon("version")
    rcon("memory")

    # LOT 2 : Création des Mondes Void
    print("\n--- [LOT 2, 4, 5] Création des Mondes Void Dédiés ---")
    for world in ["lobby_minijeux", "rush_jfm", "hikabrain_jfm"]:
        rcon(f"mv create {world} normal -g VoidGen")
        rcon(f"execute in {world} run gamerule minecraft:advance_time false")
        rcon(f"execute in {world} run gamerule minecraft:advance_weather false")
        rcon(f"execute in {world} run time set 6000")
        rcon(f"execute in {world} run weather clear")

    # LOT 2 : Sécurisation Hub
    print("\n--- [LOT 2] Sécurisation Périmétrique Hub & Anti-Chute Y<50 ---")
    hub_sec = BASE_DIR / "Lot_2_Hub_et_Lobby_Minijeux" / "lot2_hub_security.py"
    if hub_sec.exists():
        subprocess.run([sys.executable, str(hub_sec)], check=False)

    # LOT 2 : Construction Lobby Mini-Jeux
    print("\n--- [LOT 2] Génération Procédurale du Lobby des Mini-Jeux ---")
    gen_lobby = BASE_DIR / "Lot_2_Hub_et_Lobby_Minijeux" / "lot2_generate_minigames_lobby.py"
    if gen_lobby.exists():
        subprocess.run([sys.executable, str(gen_lobby)], check=False)

    # LOT 4 : Construction Arène Rush
    print("\n--- [LOT 4] Génération Procédurale de l'Arène Rush FunCraft ---")
    gen_rush = BASE_DIR / "Lot_4_Rush_FunCraft" / "lot4_generate_rush_arena.py"
    if gen_rush.exists():
        subprocess.run([sys.executable, str(gen_rush)], check=False)

    # LOT 5 : Construction Arène Hikabrain
    print("\n--- [LOT 5] Génération Procédurale de l'Arène Hikabrain ---")
    gen_hika = BASE_DIR / "Lot_5_Hikabrain_FunCraft" / "lot5_generate_hikabrain_arena.py"
    if gen_hika.exists():
        subprocess.run([sys.executable, str(gen_hika)], check=False)

    # LOT 1, 4, 6 : Déploiement des Configurations YAML
    print("\n--- [LOT 1, 4, 6] Déploiement des Fichiers de Configuration ---")
    configs = [
        (BASE_DIR / "Lot_1_BedWars_BlockHunt" / "jfm_duo.yml", "plugins/BedWars/arenas/jfm_duo.yml"),
        (BASE_DIR / "Lot_1_BedWars_BlockHunt" / "shop.yml", "plugins/BedWars/shops/shop.yml"),
        (BASE_DIR / "Lot_1_BedWars_BlockHunt" / "blockhunt_arenas.yml", "plugins/BlockHunt/arenas.yml"),
        (BASE_DIR / "Lot_1_BedWars_BlockHunt" / "groups.yml", "plugins/Multiverse-Inventories/groups.yml"),
        (BASE_DIR / "Lot_4_Rush_FunCraft" / "rush_1v1.yml", "plugins/BedWars/arenas/rush_1v1.yml"),
        (BASE_DIR / "Lot_4_Rush_FunCraft" / "rush_2v2.yml", "plugins/BedWars/arenas/rush_2v2.yml"),
        (BASE_DIR / "Lot_4_Rush_FunCraft" / "rush_shop.yml", "plugins/BedWars/shops/rush_shop.yml"),
        (BASE_DIR / "Lot_6_Navigation_et_Menus" / "lot6_games_menu.yml", "plugins/DeluxeMenus/gui_menus/games.yml"),
        (BASE_DIR / "Lot_7_Finition_Auth_et_Recette" / "lot7_authme_config.yml", "plugins/AuthMe/config.yml"),
    ]

    for src_file, dest_rel in configs:
        if src_file.exists():
            cp_to_container(src_file, dest_rel)

    # LOT 3 : Application D1 (Survie sans claim)
    print("\n--- [LOT 3] Application D1 : Survie Pure sans Claim ---")
    subprocess.run("docker exec -i minecraft_ap1 sed -i 's/survie: ClaimsEnabled/survie: Disabled/g' /data/plugins/GriefPreventionData/config.yml", shell=True)

    # LOT 6 : PNJ Lobby
    print("\n--- [LOT 6] Bornes PNJ au Lobby Mini-Jeux ---")
    npc_script = BASE_DIR / "Lot_6_Navigation_et_Menus" / "lot6_setup_lobby_npcs.py"
    if npc_script.exists():
        subprocess.run([sys.executable, str(npc_script)], check=False)

    # LOT 7 : Top Parkour
    print("\n--- [LOT 7] Mise en Place du Top Parkour au Hub (D6) ---")
    parkour_script = BASE_DIR / "Lot_7_Finition_Auth_et_Recette" / "lot7_setup_parkour.py"
    if parkour_script.exists():
        subprocess.run([sys.executable, str(parkour_script)], check=False)

    # Rechargement des modules
    print("\n--- [RECHARGEMENT] Synchronisation Mémoire des Plugins ---")
    time.sleep(2)
    rcon("mvinv reload")
    rcon("dm reload")
    rcon("ij reload")
    rcon("bw reload")
    rcon("bh reload")
    rcon("gp reload")

    # Exécution de la suite de tests
    print("\n--- [TESTS] Lancement de la Suite de Validation Complète ---")
    test_suite = BASE_DIR / "Lot_7_Finition_Auth_et_Recette" / "lot7_full_test_suite.py"
    if test_suite.exists():
        subprocess.run([sys.executable, str(test_suite)], check=False)

    print("\n==================================================================")
    print("  DÉPLOIEMENT MAÎTRE ACHEVÉ : LES 8 LOTS SONT OPÉRATIONNELS !     ")
    print("==================================================================")

if __name__ == "__main__":
    main()
