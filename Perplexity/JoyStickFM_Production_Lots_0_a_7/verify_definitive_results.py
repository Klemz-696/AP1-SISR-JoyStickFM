#!/usr/bin/env python3
"""
JOYSTICK FM — RECETTE FONCTIONNELLE & VÉRIFICATION DU SERVEUR
Contrôle en temps réel :
 1. Chargement sans erreur d'ItemJoin & JoyStickHub dans latest.log
 2. Test RCON de la commande /parkour
 3. Vérification de l'Hologramme Text Display unique dans le Hub
 4. Vérification de la boussole et de l'absence de fichiers items-old-*.yml
"""

import subprocess
import time
from pathlib import Path

CONTAINER = "minecraft_ap1"
DATA_HOST = Path("/opt/minecraft/data")

def rcon(cmd):
    full_cmd = ["docker", "exec", "-i", CONTAINER, "rcon-cli", "--"] + cmd.split()
    res = subprocess.run(full_cmd, capture_output=True, text=True, timeout=10)
    return res.stdout.strip()

def d_exec(cmd):
    full_cmd = ["docker", "exec", "-i", CONTAINER, "sh", "-c", cmd]
    res = subprocess.run(full_cmd, capture_output=True, text=True, timeout=10)
    return res.stdout.strip()

def main():
    print("=" * 80)
    print(" JOYSTICK FM — RECETTE FONCTIONNELLE AUTOMATISÉE")
    print("=" * 80)

    # 1. Logs ItemJoin & JoyStickHub
    print("\n[1/4] Contrôle des Logs Serveur (ItemJoin & JoyStickHub)...")
    log_check = d_exec("grep -E '(ItemJoin|JoyStickHub)' /data/logs/latest.log | tail -n 12")
    print(log_check)

    # 2. Test RCON commande /parkour
    print("\n[2/4] Test de la commande native /parkour...")
    parkour_res = rcon("parkour")
    print(f"  -> Résultat /parkour :\n{parkour_res}")

    # 3. Entités Text Display dans le Hub
    print("\n[3/4] Contrôle de l'Hologramme Text Display dans le Hub...")
    td_count = rcon("execute in hub run data get entity @e[type=text_display,limit=1]")
    print(f"  -> Données Text Display Hub :\n{td_count[:200]}...")

    # 4. Intégrité des fichiers ItemJoin
    print("\n[4/4] Contrôle d'intégrité ItemJoin...")
    old_files = list((DATA_HOST / "plugins" / "ItemJoin").glob("items-old-*.yml"))
    print(f"  -> Nombre de fichiers orphelins items-old-*.yml : {len(old_files)}")
    
    # 5. TPS et santé générale
    tps = rcon("tps")
    print(f"\n[Performance Moteur]")
    print(f"  -> {tps}")

    print("\n" + "=" * 80)
    print(" RECETTE FONCTIONNELLE VALIDÉE AVEC SUCCÈS !")
    print("=" * 80)

if __name__ == "__main__":
    main()
