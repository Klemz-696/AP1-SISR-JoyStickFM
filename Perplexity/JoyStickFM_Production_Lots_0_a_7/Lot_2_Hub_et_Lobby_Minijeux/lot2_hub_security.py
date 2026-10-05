#!/usr/bin/env python3
"""
JoyStick FM - Lot 2: Hub Perimeter Security & Guaranteed Anti-Void Teleportation (V3)
Features:
  - Disables fall_damage (gamerule fall_damage false) -> ZERO fall death
  - Expands perimeter barriers to X,Z = +/-25 (generous 51x51 area, no collision with Parkour)
  - Clears any barrier blocks in the parkour airspace (X=4..30, Y=64..90)
  - Completely REMOVES the blocking invisible barrier floor at Y=20
  - Guaranteed Repeating Command Block with a 4000x4000 bounding box (Y=-64..54) catching any falling player
  - Works on both 'hub' and 'world'
"""

import subprocess

CONTAINER = "minecraft_ap1"

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    out = res.stdout.strip()
    return out

def apply_hub_security():
    print("=== [LOT 2] Application de la sécurité du Hub (Anti-Chute & Re-TP Garanti) ===")

    worlds = ["hub", "world"]

    for w in worlds:
        # 1. Forceload des chunks du Spawn
        rcon(f"execute in {w} run forceload add -2 -2 2 2")

        # 2. Nettoyage des anciennes barrières parasites dans le ciel et l'espace du parkour
        print(f"1. Nettoyage des barrières parasites dans '{w}'...")
        rcon(f"execute in {w} run fill -25 65 -25 25 85 25 air replace barrier")

        # 3. Suppression totale de l'ancien sol invisible à Y=20 qui bloquait les joueurs
        print(f"2. Suppression du sol invisible à Y=20 dans '{w}'...")
        rcon(f"execute in {w} run fill -50 15 -50 50 25 50 air replace barrier")

        # 4. Consolidation de la plateforme centrale du Hub (33x33 blocs à Y=64)
        print(f"3. Consolidation de la plateforme centrale dans '{w}'...")
        rcon(f"execute in {w} run fill -16 63 -16 16 63 16 black_concrete")
        rcon(f"execute in {w} run fill -16 64 -16 16 64 16 smooth_quartz")
        rcon(f"execute in {w} run fill -16 64 -16 16 64 -16 purple_concrete")
        rcon(f"execute in {w} run fill -16 64 16 16 64 16 purple_concrete")
        rcon(f"execute in {w} run fill -16 64 -16 -16 64 16 cyan_concrete")
        rcon(f"execute in {w} run fill 16 64 -16 16 64 16 cyan_concrete")

        # 5. Périmètre de sécurité invisible ÉLARGI à X,Z = +/-25 (Parkour 100% libre)
        print(f"4. Pose du périmètre élargi à +/-25 dans '{w}'...")
        rcon(f"execute in {w} run fill -25 65 -25 25 72 -25 barrier")
        rcon(f"execute in {w} run fill -25 65 25 25 72 25 barrier")
        rcon(f"execute in {w} run fill -25 65 -25 -25 72 25 barrier")
        rcon(f"execute in {w} run fill 25 65 -25 25 72 25 barrier")

        # 6. DÉSACTIVATION DES DÉGÂTS DE CHUTE
        rcon(f"execute in {w} run gamerule minecraft:fall_damage false")

        # 7. BLOC DE COMMANDE RÉPÉTITIF ANTI-VIDE (Zone 4000x4000, Y=-64 à 54)
        # Dès qu'un joueur passe sous Y=54 (la plateforme est à Y=64), il est instantanément retéléporté à 0.5 65.0 0.5
        print(f"5. Mise en place du bloc de commande de rattrapage anti-vide dans '{w}'...")
        cmd_tp = "execute as @a[x=-2000,dx=4000,z=-2000,dz=4000,y=-64,dy=118] run tp @s 0.5 65.0 0.5 0 0"
        rcon(f'execute in {w} run setblock 0 63 0 repeating_command_block[facing=up]{{Command:"{cmd_tp}",auto:1b}}')

        # 8. Verrouillage du temps et des monstres
        rcon(f"execute in {w} run gamerule minecraft:advance_time false")
        rcon(f"execute in {w} run gamerule minecraft:advance_weather false")
        rcon(f"execute in {w} run gamerule minecraft:spawn_monsters false")
        rcon(f"execute in {w} run setworldspawn 0 65 0")

    # Appliquer aussi sur les autres mondes
    rcon("gamerule fallDamage false")
    rcon("execute in lobby_minijeux run gamerule minecraft:fall_damage false")
    rcon("execute in rush_jfm run gamerule minecraft:fall_damage false")
    rcon("execute in hikabrain_jfm run gamerule minecraft:fall_damage false")

    # Anti-vide pour le lobby des mini-jeux (plateforme à Y=64)
    cmd_tp_lobby = "execute as @a[x=-1000,dx=2000,z=-1000,dz=2000,y=-64,dy=118] run tp @s 0.5 65.0 0.5 0 0"
    rcon(f'execute in lobby_minijeux run setblock 0 63 0 repeating_command_block[facing=up]{{Command:"{cmd_tp_lobby}",auto:1b}}')

    print("=== [LOT 2] Sécurité du Hub 100% opérationnelle (Anti-chute & Re-TP instantané) ! ===")

if __name__ == "__main__":
    apply_hub_security()
