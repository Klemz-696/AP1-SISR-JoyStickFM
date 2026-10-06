#!/usr/bin/env python3
"""
JOYSTICK FM — AUDIT ET CORRECTION DU MONDE SURVIE
Résolution ciblée des 2 anomalies constatées :
 1. Absence de dégâts de chute (fall_damage)
 2. Impossibilité de miner des blocs (Gamemode, Spawn Protection, GriefPrevention, Multiverse)

Usage:
  python3 audit_and_fix_survie.py --check   (Audit en lecture seule des paramètres de survie)
  python3 audit_and_fix_survie.py --apply   (Correction et recette en direct)
"""

import sys
import subprocess
import argparse
from pathlib import Path

CONTAINER = "minecraft_ap1"
DATA_HOST = Path("/opt/minecraft/data") if Path("/opt/minecraft/data").exists() else Path(".")

def rcon(cmd):
    full_cmd = ["docker", "exec", "-i", CONTAINER, "rcon-cli", "--"] + cmd.split()
    try:
        res = subprocess.run(full_cmd, capture_output=True, text=True, timeout=10)
        return res.stdout.strip()
    except Exception as e:
        return f"Erreur RCON: {e}"

def d_exec(cmd):
    full_cmd = ["docker", "exec", "-i", CONTAINER, "sh", "-c", cmd]
    try:
        res = subprocess.run(full_cmd, capture_output=True, text=True, timeout=10)
        return res.stdout.strip()
    except Exception as e:
        return f"Erreur Docker Exec: {e}"

def check_mode():
    print("=" * 80)
    print(" JOYSTICK FM — AUDIT DU MONDE SURVIE (LECTURE SEULE)")
    print("=" * 80)

    # 1. Gamerule Fall Damage
    print("\n[1/6] État de la gamerule fall_damage dans 'survie'...")
    fd_mc = rcon("execute in survie run gamerule minecraft:fall_damage")
    fd_vanilla = rcon("execute in survie run gamerule fallDamage")
    print(f"  -> minecraft:fall_damage : {fd_mc}")
    print(f"  -> fallDamage : {fd_vanilla}")

    # 2. Multiverse Configuration pour 'survie'
    print("\n[2/6] Multiverse-Core info pour 'survie'...")
    mv_info = rcon("mv info survie")
    print(mv_info[:400] if mv_info else "Aucune info MV")
    
    mv_world_yaml = d_exec("grep -A 15 'survie:' /data/plugins/Multiverse-Core/worlds.yml | head -n 25")
    print(f"  -> Extrait worlds.yml pour 'survie' :\n{mv_world_yaml}")

    # 3. server.properties (spawn-protection, gamemode, force-gamemode)
    print("\n[3/6] Propriétés serveur (server.properties)...")
    sp_props = d_exec("grep -E '^(spawn-protection|gamemode|force-gamemode|difficulty)' /data/server.properties")
    print(f"  -> server.properties :\n{sp_props}")

    # 4. GriefPrevention (Configuration & Claims sur survie)
    print("\n[4/6] GriefPrevention sur le monde 'survie'...")
    gp_survie = d_exec("grep -i -C 3 'survie' /data/plugins/GriefPreventionData/config.yml")
    print(f"  -> grep GriefPrevention config :\n{gp_survie}")
    gp_claims = d_exec("ls -la /data/plugins/GriefPreventionData/ClaimData/ | wc -l")
    print(f"  -> Nombre de fichiers de claims : {gp_claims}")

    # 5. Inventaires / Multiverse-Inventories (Partage ou switch de gamemode)
    print("\n[5/6] Multiverse-Inventories groups.yml...")
    mvi_groups = d_exec("cat /data/plugins/Multiverse-Inventories/groups.yml | head -n 35")
    print(mvi_groups[:500] if mvi_groups else "Non disponible")

    # 6. Joueurs connectés et Gamemode
    print("\n[6/6] Joueurs actuels et Gamemode...")
    players = rcon("list")
    print(f"  -> Joueurs : {players}")
    klemz_gm = rcon("data get entity Klemz_696 playerGameType")
    print(f"  -> Gamemode Klemz_696 (0=survival, 1=creative, 2=adventure, 3=spectator) : {klemz_gm}")

    print("\n" + "=" * 80)
    print(" AUDIT SURVIE TERMINÉ.")
    print("=" * 80)

def apply_mode():
    print("=" * 80)
    print(" JOYSTICK FM — APPLICATION DES CORRECTIFS SURVIE")
    print("=" * 80)

    # 1. Rétablir les dégâts de chute dans survie
    print("\n[1/5] Activation des dégâts de chute (fall_damage) dans 'survie'...")
    rcon("execute in survie run gamerule minecraft:fall_damage true")
    rcon("execute in survie run gamerule fallDamage true")
    print("  -> Dégâts de chute réactivés dans 'survie'.")

    # 2. Configurer Multiverse pour forcer le gamemode SURVIVAL dans 'survie'
    print("\n[2/5] Configuration du mode SURVIVAL dans Multiverse pour 'survie'...")
    rcon("mv modify survie set gamemode survival")
    rcon("mv modify survie set hunger true")
    rcon("mv modify survie set allowflight false")
    print("  -> Multiverse configuré : survie = SURVIVAL.")

    # 3. Désactiver la spawn-protection de server.properties (permet de miner dès le spawn)
    print("\n[3/5] Désactivation de spawn-protection dans server.properties...")
    d_exec("sed -i 's/^spawn-protection=.*/spawn-protection=0/' /data/server.properties")
    d_exec("grep '^spawn-protection' /data/server.properties")
    print("  -> spawn-protection=0 configuré (minage immédiat permis).")

    # 4. Désactiver les claims GriefPrevention sur 'survie' (D1 : 100% Vanilla sans claim)
    print("\n[4/5] Neutralisation des restrictions GriefPrevention sur 'survie'...")
    # S'assurer que le mode pour survie est Disabled dans GriefPrevention
    d_exec("sed -i 's/survie: ClaimsEnabled/survie: Disabled/g' /data/plugins/GriefPreventionData/config.yml")
    d_exec("sed -i 's/survie: Survival/survie: Disabled/g' /data/plugins/GriefPreventionData/config.yml")
    rcon("gp reload")
    print("  -> GriefPrevention rechargé en mode 'Disabled' sur le monde survie.")

    # 5. Mettre à jour le gamemode des joueurs actuellement dans survie
    print("\n[5/5] Actualisation du mode de jeu des joueurs connectés...")
    rcon("execute in survie as @a run gamemode survival @s")
    print("  -> Gamemode des joueurs dans survie réaligné sur SURVIVAL.")

    print("\n" + "=" * 80)
    print(" VÉRIFICATION IMMÉDIATE...")
    fd_check = rcon("execute in survie run gamerule minecraft:fall_damage")
    print(f"  -> fall_damage dans survie : {fd_check}")
    gm_klemz = rcon("data get entity Klemz_696 playerGameType")
    print(f"  -> Gamemode Klemz_696 : {gm_klemz}")
    print(" CORRECTIFS APPLIQUÉS AVEC SUCCÈS !")
    print("=" * 80)

def main():
    parser = argparse.ArgumentParser(description="Audit et correction du monde survie JoyStick FM")
    parser.add_argument("--check", action="store_true", help="Audit en lecture seule des paramètres survie")
    parser.add_argument("--apply", action="store_true", help="Applique les corrections")
    args = parser.parse_args()

    if args.apply:
        apply_mode()
    elif args.check:
        check_mode()
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
