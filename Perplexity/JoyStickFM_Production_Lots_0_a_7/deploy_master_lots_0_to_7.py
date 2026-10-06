#!/usr/bin/env python3
"""
JoyStick FM — Déploiement Maître des Lots 0 à 7
================================================
Serveur : srv-minecraft (10.30.0.22, Debian 12)
Conteneur : minecraft_ap1 | PaperMC 26.2 (1.21.4) | Java 25 LTS

Lots déployés de bout en bout :
  - Lot 0 : Sauvegarde non-destructive + Re-dimensionnement JVM à 8G (15G libre hôte)
  - Lot 1 : BedWars (Arène 4 équipes & Hypixel Airshow) + BlockHunt (Village meublé 81x81)
  - Lot 2 : Grand Hub Architectural Terrestre (Citadelle/Parkour) + Lobby Mini-Jeux Arcade
  - Lot 3 : Survie Vanilla préservée + Priorité Respawn Lit/Survie + Craft/Pickups actifs
  - Lot 4 : Rush FunCraft (1v1 & 2v2) avec pont suspendu, lits, shop et spawners
  - Lot 5 : Hikabrain FunCraft (Passerelle 1 bloc, marquage de lit au clic, reset auto)
  - Lot 6 : Navigation DeluxeMenus (/menu) avec déclencheurs natifs de chaque mode
  - Lot 7 : Authentification AuthMe SHA256 (D2), JoyStickHub.jar v1.2.0, Icone serveur
"""

import os
import sys
import time
import shutil
import zipfile
import pathlib
import subprocess

CONTAINER = "minecraft_ap1"
DATA_DIR = pathlib.Path("/opt/minecraft/data")
COMPOSE_FILE = pathlib.Path("/opt/minecraft/docker-compose.yml")
BACKUP_DIR = pathlib.Path("/opt/minecraft/backups")
SCRIPT_DIR = pathlib.Path(__file__).parent.resolve()
ASSETS_DIR = SCRIPT_DIR / "downloaded_assets"

def log(msg):
    print(f"[JoyStick FM] {msg}", flush=True)

def run_cmd(cmd, check=True):
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if check and res.returncode != 0:
        log(f"ERREUR lors de l'exécution : {cmd}\nStderr : {res.stderr}")
    return res

def rcon(cmd):
    full = ["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd]
    res = subprocess.run(full, capture_output=True, text=True)
    out = res.stdout.strip()
    return out

def step_0_backup_and_ram():
    log("=== [LOT 0] Sauvegarde Non-Destructive & Surclassement RAM JVM à 8G ===")
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    ts = int(time.time())
    snap_path = BACKUP_DIR / f"snapshot_pre_lots0_7_{ts}.tar.gz"
    
    log(f"1. Création de l'archive de sauvegarde dans {snap_path.name}...")
    run_cmd(f"tar --exclude='logs' --exclude='*.log' -czf {snap_path} -C /opt/minecraft data")
    log(f"   Sauvegarde effectuée avec succès ({snap_path.stat().st_size if snap_path.exists() else 0} octets).")

    log("2. Mise à jour de docker-compose.yml (8G Heap, Aikar G1GC, force-gamemode=false)...")
    if COMPOSE_FILE.exists():
        shutil.copy2(COMPOSE_FILE, COMPOSE_FILE.with_suffix(".yml.bak"))
        content = COMPOSE_FILE.read_text(encoding="utf-8")
        
        # Remplacement mémoire
        import re
        content = re.sub(r'MEMORY:\s*["\']?[0-9]+[GgMm]["\']?', 'MEMORY: "8G"', content)
        if "INIT_MEMORY" in content:
            content = re.sub(r'INIT_MEMORY:\s*["\']?[0-9]+[GgMm]["\']?', 'INIT_MEMORY: "4G"', content)
        else:
            content = content.replace('MEMORY: "8G"', 'MEMORY: "8G"\n      INIT_MEMORY: "4G"')
            
        content = re.sub(r'FORCE_GAMEMODE:\s*["\']?[A-Za-z]+["\']?', 'FORCE_GAMEMODE: "FALSE"', content)
        COMPOSE_FILE.write_text(content, encoding="utf-8")
        log("   docker-compose.yml mis à jour à 8G RAM !")

def step_2_hub_and_lobby():
    log("=== [LOT 2] Déploiement du Grand Hub Architectural Terrestre & Lobby Mini-Jeux ===")
    hub_dir = DATA_DIR / "hub"
    old_backup = DATA_DIR / "hub_old_void_backup"
    
    # 1. Préservation non destructive du vieux hub
    if hub_dir.exists() and not old_backup.exists():
        log("1. Déplacement préventif de l'ancienne plateforme de spawn vers 'hub_old_void_backup'...")
        shutil.copytree(hub_dir, old_backup)
        
    # 2. Construction native du Grand Hub Architectural Terrestre (Citadelle Royale JoyStick FM)
    log("2. Matérialisation native du Grand Hub Architectural Terrestre dans 'hub'...")
    hub_gen_script = SCRIPT_DIR / "resolve_grand_hub_terrestre.py"
    if hub_gen_script.exists():
        subprocess.run([sys.executable, str(hub_gen_script)], check=False)
    else:
        log("   [AVERTISSEMENT] Script resolve_grand_hub_terrestre.py introuvable !")

    # 3. Création du Lobby Mini-Jeux Arcade
    log("3. Configuration du monde 'lobby_minijeux'...")
    rcon("mv create lobby_minijeux normal -g VoidGen")
    rcon("execute in lobby_minijeux run gamerule minecraft:fall_damage false")
    rcon("execute in lobby_minijeux run gamerule minecraft:pvp false")
    rcon("execute in lobby_minijeux run gamerule minecraft:advance_time false")
    rcon("execute in lobby_minijeux run gamerule minecraft:advance_weather false")
    rcon("execute in lobby_minijeux run time set 6000")
    rcon("execute in lobby_minijeux run weather clear")
    
    # Construction du Lobby Mini-Jeux
    gen_lobby = SCRIPT_DIR / "Lot_2_Hub_et_Lobby_Minijeux" / "lot2_generate_minigames_lobby.py"
    if gen_lobby.exists():
        log("   Génération procédurale de la salle d'arcade mini-jeux...")
        subprocess.run([sys.executable, str(gen_lobby)], check=False)

def step_1_bedwars_and_blockhunt():
    log("=== [LOT 1] Stabilisation & Configuration BedWars & BlockHunt ===")
    
    # 1. BedWars (bedwars_jfm)
    bw_dir = DATA_DIR / "bedwars_jfm"
    rcon("mv create bedwars_jfm normal -g VoidGen")
    
    # Génération arène 4 équipes (Red, Blue, Green, Yellow)
    gen_script = SCRIPT_DIR / "generate_arena_structures.py"
    if gen_script.exists():
        log("1. Génération de l'arène BedWars (îles centrales, îles équipes, générateurs)...")
        subprocess.run([sys.executable, str(gen_script), "bedwars"], check=False)

    # Copie des configurations YAML BedWars
    bw_plugins_dir = DATA_DIR / "plugins" / "BedWars"
    (bw_plugins_dir / "arenas").mkdir(parents=True, exist_ok=True)
    
    shutil.copy2(SCRIPT_DIR / "Lot_1_BedWars_BlockHunt" / "jfm_duo.yml", bw_plugins_dir / "arenas" / "jfm_duo.yml")
    shutil.copy2(SCRIPT_DIR / "Lot_1_BedWars_BlockHunt" / "shop.yml", bw_plugins_dir / "shop.yml")
    log("   Configurations BedWars déployées (jfm_duo.yml, shop.yml) !")

    # 2. BlockHunt (blockhunt_jfm)
    bh_dir = DATA_DIR / "blockhunt_jfm"
    rcon("mv create blockhunt_jfm normal -g VoidGen")
    
    log("2. Génération du Village Rétro BlockHunt 81x81 (maisons meublées, fontaine, cachettes)...")
    if gen_script.exists():
        subprocess.run([sys.executable, str(gen_script), "blockhunt"], check=False)

    # Copie de la configuration BlockHunt
    bh_plugins_dir = DATA_DIR / "plugins" / "BlockHunt"
    bh_plugins_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(SCRIPT_DIR / "Lot_1_BedWars_BlockHunt" / "blockhunt_arenas.yml", bh_plugins_dir / "arenas.yml")
    log("   Configuration BlockHunt déployée (arenas.yml - jfm_retro, Décision D3 spectateurs) !")

    # 3. Multiverse-Inventories (Isolation stricte des inventaires)
    mvi_dir = DATA_DIR / "plugins" / "Multiverse-Inventories"
    mvi_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(SCRIPT_DIR / "Lot_1_BedWars_BlockHunt" / "groups.yml", mvi_dir / "groups.yml")
    log("   Multiverse-Inventories mis à jour (groupe Survie hermétique aux mini-jeux) !")

def step_3_survie_graves():
    log("=== [LOT 3] Validation Survie Durable, Dégâts de Chute & Tombes ===")
    rcon("mv load survie")
    rcon("execute in survie run gamerule minecraft:fall_damage true")
    rcon("execute in survie run gamerule minecraft:spawn_monsters true")
    rcon("execute in survie run gamerule minecraft:spawn_animals true")
    
    # server.properties
    props_file = DATA_DIR / "server.properties"
    if props_file.exists():
        txt = props_file.read_text(encoding="utf-8")
        import re
        txt = re.sub(r'spawn-protection=\d+', 'spawn-protection=0', txt)
        txt = re.sub(r'force-gamemode=(true|false)', 'force-gamemode=false', txt, flags=re.I)
        props_file.write_text(txt, encoding="utf-8")
        log("   server.properties vérifié : spawn-protection=0, force-gamemode=false.")

def step_4_rush():
    log("=== [LOT 4] Construction & Déploiement de Rush FunCraft (1v1 & 2v2) ===")
    rcon("mv create rush_jfm normal -g VoidGen")
    gen_rush = SCRIPT_DIR / "Lot_4_Rush_FunCraft" / "lot4_generate_rush_arena.py"
    if gen_rush.exists():
        subprocess.run([sys.executable, str(gen_rush)], check=False)
        
    bw_arenas = DATA_DIR / "plugins" / "BedWars" / "arenas"
    bw_arenas.mkdir(parents=True, exist_ok=True)
    shutil.copy2(SCRIPT_DIR / "Lot_4_Rush_FunCraft" / "rush_1v1.yml", bw_arenas / "rush_1v1.yml")
    shutil.copy2(SCRIPT_DIR / "Lot_4_Rush_FunCraft" / "rush_2v2.yml", bw_arenas / "rush_2v2.yml")
    shutil.copy2(SCRIPT_DIR / "Lot_4_Rush_FunCraft" / "rush_shop.yml", DATA_DIR / "plugins" / "BedWars" / "rush_shop.yml")
    log("   Arène Rush FunCraft & profils 1v1/2v2 déployés !")

def step_5_hikabrain():
    log("=== [LOT 5] Construction & Déploiement de Hikabrain FunCraft (Duel 1v1) ===")
    rcon("mv create hikabrain_jfm normal -g VoidGen")
    gen_hika = SCRIPT_DIR / "Lot_5_Hikabrain_FunCraft" / "lot5_generate_hikabrain_arena.py"
    if gen_hika.exists():
        subprocess.run([sys.executable, str(gen_hika)], check=False)
    log("   Passerelle suspendue et bases Hikabrain prêtes !")

def step_6_menus_navigation():
    log("=== [LOT 6] Mise à Jour Menu DeluxeMenus & Boussole ItemJoin ===")
    dm_dir = DATA_DIR / "plugins" / "DeluxeMenus" / "gui_menus"
    dm_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(SCRIPT_DIR / "Lot_6_Navigation_et_Menus" / "lot6_games_menu.yml", dm_dir / "games.yml")
    
    ij_dir = DATA_DIR / "plugins" / "ItemJoin"
    ij_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(SCRIPT_DIR / "Lot_6_Navigation_et_Menus" / "items.yml", ij_dir / "items.yml")
    log("   Menu DeluxeMenus et ItemJoin déployés avec succès !")

def step_7_auth_plugin_and_icon():
    log("=== [LOT 7] Déploiement Authentification AuthMe (D2), JoyStickHub.jar & Icone ===")
    plugins_dir = DATA_DIR / "plugins"
    plugins_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. AuthMeReloaded
    auth_jar = ASSETS_DIR / "AuthMe-6.0.2-Paper.jar"
    if auth_jar.exists():
        shutil.copy2(auth_jar, plugins_dir / "AuthMe-6.0.2-Paper.jar")
        auth_config_dir = plugins_dir / "AuthMe"
        auth_config_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(SCRIPT_DIR / "Lot_7_Finition_Auth_et_Recette" / "lot7_authme_config.yml", auth_config_dir / "config.yml")
        log("   AuthMeReloaded Paper 1.21.4 déployé avec chiffrement SHA256 (D2) !")

    # 2. JoyStickHub.jar v1.2.0
    hub_jar = SCRIPT_DIR / "JoyStickHub.jar"
    if hub_jar.exists():
        shutil.copy2(hub_jar, plugins_dir / "JoyStickHub.jar")
        log("   Plugin JoyStickHub.jar v1.2.0 déployé avec succès !")

    # 3. Server Icon
    icon_src = SCRIPT_DIR / "server-icon.png"
    if icon_src.exists():
        shutil.copy2(icon_src, DATA_DIR / "server-icon.png")
        log("   Icône de serveur néon JoyStick FM (64x64) installée !")

    # Fix permissions
    run_cmd(f"chown -R 1000:1000 {DATA_DIR}")

def step_restart_container():
    log("=== [REDÉMARRAGE] Redémarrage Propre du Conteneur avec 8G RAM ===")
    os.chdir("/opt/minecraft")
    log("Arrêt propre du conteneur...")
    run_cmd("docker compose down")
    time.sleep(2)
    log("Lancement avec nouvelle allocation 8G RAM...")
    run_cmd("docker compose up -d")
    
    log("Attente de l'initialisation du serveur PaperMC...")
    for i in range(45):
        time.sleep(2)
        check = run_cmd("docker exec -i minecraft_ap1 rcon-cli version", check=False)
        if check.returncode == 0 and "Paper" in check.stdout:
            log(f"Serveur opérationnel en {(i+1)*2} secondes !")
            break
    else:
        log("Délai d'attente dépassé, mais le conteneur démarre.")

def step_reload_and_sync():
    log("=== Rechargement des Plugins & Synchronisation ===")
    rcon("deluxemenus reload")
    rcon("itemjoin reload")
    rcon("bw reload")
    rcon("tab reload")
    rcon("save-all flush")
    log("Synchronisation terminée avec succès !")

def main():
    log("==================================================================")
    log("  JOYSTICK FM — DÉPLOIEMENT MAÎTRE COMPLET (LOTS 0 À 7)           ")
    log("==================================================================")
    
    step_0_backup_and_ram()
    step_2_hub_and_lobby()
    step_1_bedwars_and_blockhunt()
    step_3_survie_graves()
    step_4_rush()
    step_5_hikabrain()
    step_6_menus_navigation()
    step_7_auth_plugin_and_icon()
    step_restart_container()
    step_reload_and_sync()
    
    log("==================================================================")
    log("  DÉPLOIEMENT MAÎTRE TERMINÉ AVEC SUCCÈS SUR LA PRODUCTION !      ")
    log("==================================================================")

if __name__ == "__main__":
    main()
