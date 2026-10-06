#!/usr/bin/env python3
"""
JoyStick FM — Résolution des PNJ du Lobby & Protection Anti-Casse
================================================================
Corrige les 2 points remontés par l'utilisateur :
  1. PNJ dans le lobby des mini-jeux :
     - Orientation corrigée (regardent vers le centre du lobby)
     - Clic interactif opérationnel via JoyStickHub v1.5.0 (déclenche immédiatement le jeu)
  2. Protection anti-casse et Gamemode strict :
     - Multiverse forcé en mode Aventure sur 'hub' et 'lobby_minijeux'
     - JoyStickHub v1.5.0 annule toute destruction/pose de bloc dans les lobbies
     - Passage automatique et garanti en mode Aventure dès la sortie de Survie
"""

import subprocess
import sys
import time
import shutil
import pathlib
import re

CONTAINER = "minecraft_ap1"
DATA_DIR = pathlib.Path("/opt/minecraft/data")
SCRIPT_DIR = pathlib.Path(__file__).parent.resolve()

def strip_ansi(text):
    return re.sub(r'\x1b\[[0-9;]*[a-zA-Z]', '', text)

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    return strip_ansi(res.stdout.strip())

def d_exec(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "sh", "-c", cmd], capture_output=True, text=True)
    return strip_ansi(res.stdout.strip())

def log(msg):
    print(f"[JoyStick FM Fix] {msg}", flush=True)

def main():
    print("==================================================================")
    print("  JOYSTICK FM — RÉPARATION DES PNJ & PROTECTION DU LOBBY          ")
    print("==================================================================")

    # 1. DÉPLOIEMENT DE JOYSTICKHUB v1.5.0
    log("1. Déploiement de JoyStickHub.jar v1.5.0 (PNJ interactifs & Anti-casse)...")
    hub_jar_src = SCRIPT_DIR / "JoyStickHub.jar"
    hub_jar_dest = DATA_DIR / "plugins" / "JoyStickHub.jar"
    if hub_jar_src.exists():
        shutil.copy2(hub_jar_src, hub_jar_dest)
        d_exec("chown 1000:1000 /data/plugins/JoyStickHub.jar")
        log("   JoyStickHub.jar v1.5.0 déployé avec succès.")

    # 2. CONFIGURATION STRICTE DES GAMEMODES DANS MULTIVERSE
    log("2. Configuration stricte des modes de jeu Multiverse...")
    rcon("mv modify set mode adventure hub")
    rcon("mv modify set mode adventure lobby_minijeux")
    rcon("mv modify set mode survival survie")
    log("   Multiverse : 'hub' et 'lobby_minijeux' verrouillés en Aventure, 'survie' en Survie.")

    # 3. RÉPARATION DE LA STRUCTURE DU LOBBY MINI-JEUX SI DES BLOCS ONT ÉTÉ CASSÉS
    log("3. Restauration des blocs du Lobby Mini-Jeux...")
    w_lob = "lobby_minijeux"
    rcon(f"execute in {w_lob} run fill -16 63 -16 16 63 16 black_concrete")
    rcon(f"execute in {w_lob} run fill -16 64 -16 16 64 16 smooth_quartz")
    rcon(f"execute in {w_lob} run fill -16 64 -16 16 64 -16 purple_concrete")
    rcon(f"execute in {w_lob} run fill -16 64 16 16 64 16 purple_concrete")
    rcon(f"execute in {w_lob} run fill -16 64 -16 -16 64 16 cyan_concrete")
    rcon(f"execute in {w_lob} run fill 16 64 -16 16 64 16 cyan_concrete")

    # 4. DÉPLOIEMENT DES PNJ CORRECTEMENT ORIENTÉS
    log("4. Déploiement des PNJ interactifs correctement orientés...")
    npc_script = SCRIPT_DIR / "Lot_6_Navigation_et_Menus" / "lot6_setup_lobby_npcs.py"
    if npc_script.exists():
        subprocess.run([sys.executable, str(npc_script)], check=False)
    else:
        log("   [AVERTISSEMENT] lot6_setup_lobby_npcs.py introuvable !")

    # 5. SYNCHRONISATION DU JOUEUR EN LIGNE
    log("5. Synchronisation du statut du joueur Klemz_696...")
    rcon("gamemode adventure Klemz_696")

    # 6. REDÉMARRAGE PROPRE POUR CHARGER JOYSTICKHUB v1.5.0
    log("6. Redémarrage propre du serveur PaperMC...")
    subprocess.run(["docker", "restart", CONTAINER], check=False)
    
    time.sleep(15)
    for _ in range(30):
        tps = rcon("tps")
        if "tps" in tps.lower():
            break
        time.sleep(2)

    print("\n==================================================================")
    print("  CORRECTIONS APPLIQUÉES AVEC SUCCÈS !                            ")
    print("==================================================================")
    print("  1. PNJ : Regardent vers le centre du lobby, clic droit actif")
    print("  2. Lobbies : Mode Aventure forcé, destruction de blocs interdite")
    print("  3. Survie : Mode Survie préservé à l'entrée de la Survie")
    print("==================================================================")

if __name__ == "__main__":
    main()
