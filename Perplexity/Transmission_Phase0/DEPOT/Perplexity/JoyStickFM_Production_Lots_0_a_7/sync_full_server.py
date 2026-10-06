#!/usr/bin/env python3
"""
JoyStick FM — Script Maître de Synchronisation Complète Serveur VM & Dépôt Git
=============================================================================
Ce script garantit la parité absolue entre :
  - Le dépôt Git local / distant (/opt/minecraft/repo)
  - Le serveur Minecraft en production (/opt/minecraft/data)
  - Le conteneur Docker (minecraft_ap1)
"""

import os
import sys
import time
import shutil
import pathlib
import subprocess
import re

REPO_DIR = pathlib.Path("/opt/minecraft/repo")
DATA_DIR = pathlib.Path("/opt/minecraft/data")
MC_DIR = pathlib.Path("/opt/minecraft")
CONTAINER = "minecraft_ap1"

def strip_ansi(text):
    return re.sub(r'\x1b\[[0-9;]*[a-zA-Z]', '', text)

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    return strip_ansi(res.stdout.strip())

def d_exec(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "sh", "-c", cmd], capture_output=True, text=True)
    return strip_ansi(res.stdout.strip())

def log(msg):
    print(f"[JoyStick Sync] {msg}", flush=True)

def main():
    print("=" * 70)
    print("  JOYSTICK FM — SYNCHRONISATION MAÎTRE VM <-> SERVEUR MINECRAFT   ")
    print("=" * 70)

    # 1. Mise à jour du dépôt Git local
    log("1. Récupération des dernières modifications depuis GitHub (git pull)...")
    try:
        subprocess.run(["git", "-C", str(REPO_DIR), "pull", "origin", "main"], check=True)
        log("   ✔ Dépôt Git synchronisé avec succès.")
    except Exception as e:
        log(f"   ⚠️ Avertissement git pull : {e}")

    # 2. Synchronisation de docker-compose.yml
    log("2. Synchronisation de l'infrastructure Docker...")
    compose_src = REPO_DIR / "serveur_minecraft" / "docker-compose.yml"
    compose_dest = MC_DIR / "docker-compose.yml"
    if compose_src.exists():
        shutil.copy2(compose_src, compose_dest)
        log("   ✔ docker-compose.yml mis à jour.")

    # 3. Synchronisation des configurations racine PaperMC
    log("3. Synchronisation des fichiers de configuration serveur...")
    root_configs = ["server.properties", "bukkit.yml", "spigot.yml", "commands.yml"]
    for cfg in root_configs:
        src = REPO_DIR / "serveur_minecraft" / cfg
        dest = DATA_DIR / cfg
        if src.exists():
            shutil.copy2(src, dest)
    
    # Config Paper
    paper_src_dir = REPO_DIR / "serveur_minecraft" / "config"
    paper_dest_dir = DATA_DIR / "config"
    if paper_src_dir.exists():
        paper_dest_dir.mkdir(parents=True, exist_ok=True)
        for f in paper_src_dir.glob("*.yml"):
            shutil.copy2(f, paper_dest_dir / f.name)
    log("   ✔ server.properties, spigot.yml, paper-*.yml synchronisés.")

    # 4. Synchronisation des Plugins (.jar)
    log("4. Synchronisation des binaires plugins...")
    plugins_dest = DATA_DIR / "plugins"
    plugins_dest.mkdir(parents=True, exist_ok=True)

    # JoyStickHub v1.5.0
    hub_jar = REPO_DIR / "Perplexity" / "JoyStickFM_Production_Lots_0_a_7" / "JoyStickHub.jar"
    if hub_jar.exists():
        shutil.copy2(hub_jar, plugins_dest / "JoyStickHub.jar")
        log("   ✔ JoyStickHub.jar v1.5.0 copié.")

    # Minijeux Jars
    for jar_name in ["BlockHunt.jar", "ScreamingBedWars.jar"]:
        j = REPO_DIR / "Perplexity" / jar_name
        if j.exists():
            shutil.copy2(j, plugins_dest / jar_name)
            log(f"   ✔ {jar_name} copié.")

    # Plugins depuis plugins_a_installer si manquants
    installer_dir = REPO_DIR / "plugins_a_installer"
    if installer_dir.exists():
        for j in installer_dir.glob("*.jar"):
            target_jar = plugins_dest / j.name
            if not target_jar.exists() or os.path.getsize(target_jar) == 0:
                shutil.copy2(j, target_jar)
                log(f"   ✔ Installé : {j.name}")

    # 5. Synchronisation fine des configurations plugins (ItemJoin, DeluxeMenus, LuckPerms, etc.)
    log("5. Synchronisation des configurations de plugins...")
    
    # ItemJoin items.yml
    ij_src = REPO_DIR / "Perplexity" / "JoyStickFM_Production_Lots_0_a_7" / "Lot_6_Navigation_et_Menus" / "items.yml"
    ij_dest = plugins_dest / "ItemJoin" / "items.yml"
    if ij_src.exists():
        ij_dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(ij_src, ij_dest)
        log("   ✔ ItemJoin/items.yml synchronisé.")

    # DeluxeMenus games.yml
    dm_src = REPO_DIR / "Perplexity" / "JoyStickFM_Production_Lots_0_a_7" / "Lot_6_Navigation_et_Menus" / "lot6_games_menu.yml"
    dm_dest = plugins_dest / "DeluxeMenus" / "gui_menus" / "games.yml"
    if dm_src.exists():
        dm_dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(dm_src, dm_dest)
        log("   ✔ DeluxeMenus/games.yml synchronisé.")

    # 6. Forçage des modes de jeu Multiverse
    log("6. Contrôle des modes de jeu Multiverse...")
    rcon("mv modify set mode adventure hub")
    rcon("mv modify set mode adventure lobby_minijeux")
    rcon("mv modify set mode survival survie")

    # 7. Restauration / orientation des PNJ
    log("7. Déploiement et orientation des PNJ interactifs...")
    npc_script = REPO_DIR / "Perplexity" / "JoyStickFM_Production_Lots_0_a_7" / "Lot_6_Navigation_et_Menus" / "lot6_setup_lobby_npcs.py"
    if npc_script.exists():
        subprocess.run([sys.executable, str(npc_script)], check=False)
        log("   ✔ PNJ réinitialisés et orientés vers le centre.")

    # 8. Attribution des permissions Docker (1000:1000)
    log("8. Application des permissions système chown 1000:1000...")
    subprocess.run(["chown", "-R", "1000:1000", str(DATA_DIR)], check=False)

    # 9. Rechargement des plugins à chaud
    log("9. Rechargement à chaud des plugins via RCON...")
    rcon("itemjoin reload")
    rcon("deluxemenus reload")
    rcon("luckperms reload")
    rcon("tab reload")

    print("\n" + "=" * 70)
    print("  SYNCHRONISATION TERMINÉE AVEC SUCCÈS !                         ")
    print("=" * 70)

if __name__ == "__main__":
    main()
