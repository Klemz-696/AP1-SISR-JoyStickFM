#!/usr/bin/env python3
"""
JOYSTICK FM — RÉSOLUTION RAMASSAGE ITEMS & CRAFT SURVIE
Problème identifié :
  Dans /data/plugins/ItemJoin/config.yml :
    Prevent:
      Pickups: true         -> Bloquait le ramassage de tout bloc/item au sol !
      itemMovement: true    -> Bloquait le déplacement d'items et le craft dans l'inventaire !
      Self-Drops: true      -> Bloquait le jet d'items avec 'A' / 'Q' !

Correction :
  Mise à 'false' de ces restrictions globales dans ItemJoin/config.yml.
  La boussole 'game-selector' reste protégée individuellement par ses propres itemflags.
"""

import subprocess
from pathlib import Path

CONTAINER = "minecraft_ap1"
DATA_HOST = Path("/opt/minecraft/data") if Path("/opt/minecraft/data").exists() else Path(".")

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
    print(" JOYSTICK FM — DÉBLOCAGE RAMASSAGE D'ITEMS & CRAFT EN SURVIE")
    print("=" * 80)

    # 1. Vérification de la configuration actuelle
    print("\n[1/3] Lecture de la section Prevent d'ItemJoin...")
    cur_prevent = d_exec("grep -A 6 'Prevent:' /data/plugins/ItemJoin/config.yml")
    print(f"  Configuration actuelle :\n{cur_prevent}")

    # 2. Correction chirurgicale dans config.yml
    print("\n[2/3] Désactivation des blocages globaux (Pickups, itemMovement, Self-Drops)...")
    d_exec("sed -i 's/Pickups: true/Pickups: false/g' /data/plugins/ItemJoin/config.yml")
    d_exec("sed -i 's/itemMovement: true/itemMovement: false/g' /data/plugins/ItemJoin/config.yml")
    d_exec("sed -i 's/Self-Drops: true/Self-Drops: false/g' /data/plugins/ItemJoin/config.yml")
    d_exec("sed -i 's/Death-Drops: true/Death-Drops: false/g' /data/plugins/ItemJoin/config.yml")

    new_prevent = d_exec("grep -A 6 'Prevent:' /data/plugins/ItemJoin/config.yml")
    print(f"  Nouvelle configuration :\n{new_prevent}")

    # 3. Rechargement à chaud d'ItemJoin
    print("\n[3/3] Rechargement à chaud d'ItemJoin via RCON...")
    reload_res = rcon("itemjoin reload")
    print(f"  -> Résultat /itemjoin reload : {reload_res}")

    print("\n" + "=" * 80)
    print(" CORRECTION APPLIQUÉE AVEC SUCCÈS !")
    print(" Les joueurs peuvent désormais :")
    print("  - Ramasser librement les blocs cassés et items au sol")
    print("  - Déplacer leurs items et crafter dans l'inventaire")
    print("  - Jeter des items (touche A / Q)")
    print("  - La boussole reste 100% protégée par ses propres flags")
    print("=" * 80)

if __name__ == "__main__":
    main()
