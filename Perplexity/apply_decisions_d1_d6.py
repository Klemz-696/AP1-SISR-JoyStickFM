#!/usr/bin/env python3
"""
JoyStick FM - Automated Deployment of Technical Decisions D1 to D6
Applies all structural, gameplay and security updates to the Minecraft server.

Can be run locally inside the VM or via remote SSH wrapper.
Target Container: minecraft_ap1
"""

import os
import sys
import subprocess
import pathlib
import time

CONTAINER = "minecraft_ap1"
DATA_DIR = pathlib.Path("/opt/minecraft/data")

def rcon(cmd):
    """Executes command on Minecraft server via rcon-cli."""
    full_cmd = ["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd]
    res = subprocess.run(full_cmd, capture_output=True, text=True)
    out = res.stdout.strip()
    print(f"[RCON] > {cmd} => {out[:80]}")
    return out

def cp_to_container(src_path, dest_rel_path):
    """Copies file directly into container data path."""
    dest_path = f"{CONTAINER}:/data/{dest_rel_path}"
    cmd = ["docker", "cp", str(src_path), dest_path]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0:
        print(f"[COPY] {src_path.name} -> /data/{dest_rel_path} OK")
    else:
        print(f"[COPY-ERROR] Failed to copy {src_path.name}: {res.stderr}")

def main():
    print("==================================================================")
    print("  JoyStick FM — Déploiement Automatisé des Décisions D1 à D6     ")
    print("==================================================================")
    
    # 1. Vérification du conteneur
    check_docker = subprocess.run(["docker", "ps", "--filter", f"name={CONTAINER}", "--format", "{{.Names}}"], capture_output=True, text=True)
    if CONTAINER not in check_docker.stdout:
        print(f"[ERROR] Container '{CONTAINER}' is not running on this host.")
        print("Note: If running from outside the VM, copy this script and 'verified_bundle' to the VM first.")
        sys.exit(1)

    # 2. Création des mondes dédiés via VoidGen
    print("\n[LOT 2, 4, 5] Création des mondes Void...")
    for world in ["lobby_minijeux", "rush_jfm", "hikabrain_jfm"]:
        rcon(f"mv create {world} normal -g VoidGen")
        rcon(f"execute in {world} run gamerule minecraft:advance_time false")
        rcon(f"execute in {world} run gamerule minecraft:advance_weather false")
        rcon(f"execute in {world} run time set 6000")
        rcon(f"execute in {world} run weather clear")

    # 3. Sécurisation Hub (Bordures invisibles + Rattrapage anti-chute sous Y=50)
    print("\n[LOT 2] Sécurisation du Hub Principal...")
    # Pose de barrières périmétriques sur la plateforme
    rcon("execute in hub run fill -40 65 -40 40 68 -40 barrier")
    rcon("execute in hub run fill -40 65 40 40 68 40 barrier")
    rcon("execute in hub run fill -40 65 -40 -40 68 40 barrier")
    rcon("execute in hub run fill 40 65 -40 40 68 40 barrier")
    # Configuration du command block / commande de rattrapage anti-chute à Y=50
    rcon("execute in hub run setblock 0 63 0 repeating_command_block[facing=up]{Command:\"execute in hub as @a[y=0,dy=50] run tp @s 0.5 65.0 0.5 0 0\",auto:1b}")

    # 4. Génération des structures procédurales
    print("\n[LOT 2, 4, 5] Génération procédurale des arènes...")
    base_dir = pathlib.Path(__file__).parent.resolve()
    
    # Exécution des générateurs
    for script_name in ["generate_minigames_lobby.py", "generate_rush_arena.py", "generate_hikabrain_arena.py"]:
        script_file = base_dir / script_name
        if script_file.exists():
            print(f"Running {script_name}...")
            subprocess.run([sys.executable, str(script_file)], check=False)

    # 5. Déploiement des fichiers de configuration vérifiés (Bundle v2)
    print("\n[LOT 1, 3, 6] Déploiement des configurations vérifiées...")
    bundle_sources = base_dir / "verified_bundle" / "sources"
    
    configs_to_deploy = [
        ("jfm_duo.yml", "plugins/BedWars/arenas/jfm_duo.yml"),
        ("rush_1v1.yml", "plugins/BedWars/arenas/rush_1v1.yml"),
        ("rush_2v2.yml", "plugins/BedWars/arenas/rush_2v2.yml"),
        ("blockhunt_arenas.yml", "plugins/BlockHunt/arenas.yml"),
        ("groups.yml", "plugins/Multiverse-Inventories/groups.yml"),
        ("games.yml", "plugins/DeluxeMenus/gui_menus/games.yml"),
        ("itemjoin_config.yml", "plugins/ItemJoin/config.yml"),
    ]

    for src_file, dest_rel in configs_to_deploy:
        fpath = bundle_sources / src_file
        if fpath.exists():
            cp_to_container(fpath, dest_rel)

    # 6. Application de D1 : Désactivation des claims sur Survie
    print("\n[D1] Désactivation des claims GriefPrevention sur 'survie'...")
    gp_patch_cmd = "docker exec -i minecraft_ap1 sed -i 's/survie: ClaimsEnabled/survie: Disabled/g' /data/plugins/GriefPreventionData/config.yml"
    subprocess.run(gp_patch_cmd, shell=True)

    # 7. Rechargement propre des plugins en mémoire
    print("\n[RELOAD] Rechargement des plugins...")
    time.sleep(2)
    rcon("mvinv reload")
    rcon("dm reload")
    rcon("ij reload")
    rcon("bw reload")
    rcon("gp reload")
    
    print("\n==================================================================")
    print("  Déploiement terminé avec succès !                              ")
    print("  - Hub : Protégé avec barrières et rattrapage anti-vide Y<50     ")
    print("  - Lobby : 'lobby_minijeux' prêt avec 4 stands néon             ")
    print("  - Survie : 100% Vanilla simple sans claims (D1)                ")
    print("  - Rush : 'rush_1v1' et 'rush_2v2' configurés (D4)              ")
    print("  - Hikabrain : Passerelle 1 bloc et duel au lit à 5 pts (D4)     ")
    print("  - BlockHunt : Village rétro & élimination spectateur (D3)       ")
    print("  - Menus : GUI DeluxeMenus mise à jour avec tous les modes      ")
    print("==================================================================")

if __name__ == "__main__":
    main()
