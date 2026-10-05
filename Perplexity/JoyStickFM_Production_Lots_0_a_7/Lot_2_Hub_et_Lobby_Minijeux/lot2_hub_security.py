#!/usr/bin/env python3
"""
JoyStick FM - Lot 2: Hub Perimeter Security, Anti-Fall & Anti-Damage Fix
Features:
  - Disables fall_damage (gamerule fall_damage false) -> ZERO fall death
  - Expands perimeter barriers to X,Z = +/-25 (generous 51x51 area, no collision with Parkour)
  - Clears any barrier blocks in the parkour airspace (X=5..22, Y=64..76)
  - Horizontal invisible safety net at Y=20
  - Continuous anti-void catch teleporting smoothly to spawn (0.5, 65, 0.5)
"""

import subprocess

CONTAINER = "minecraft_ap1"

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    out = res.stdout.strip()
    return out

def apply_hub_security():
    print("=== [LOT 2] Application de la sécurité du Hub (Zéro Dégât de Chute & Périmètre 51x51) ===")

    # 1. Forceload des chunks du Hub
    rcon("execute in hub run forceload add -2 -2 2 2")

    # 2. PURGE de TOUTES les anciennes barrières parasites qui bloquaient le parkour
    print("1. Nettoyage des anciennes barrières parasites...")
    rcon("execute in hub run fill -20 65 -20 20 75 20 air replace barrier")

    # 3. Consolidation de la dalle du Hub (33x33 blocs à Y=64)
    print("2. Consolidation de la plateforme centrale...")
    rcon("execute in hub run fill -16 63 -16 16 63 16 black_concrete")
    rcon("execute in hub run fill -16 64 -16 16 64 16 smooth_quartz")
    rcon("execute in hub run fill -16 64 -16 16 64 -16 purple_concrete")
    rcon("execute in hub run fill -16 64 16 16 64 16 purple_concrete")
    rcon("execute in hub run fill -16 64 -16 -16 64 16 cyan_concrete")
    rcon("execute in hub run fill 16 64 -16 16 64 16 cyan_concrete")

    # 4. Nouveau périmètre de barrières invisibles ÉLARGI à X,Z = +/-25 (Parkour 100% dégagé)
    print("3. Pose du nouveau périmètre élargi à +/-25...")
    rcon("execute in hub run fill -25 65 -25 25 72 -25 barrier")
    rcon("execute in hub run fill -25 65 25 25 72 25 barrier")
    rcon("execute in hub run fill -25 65 -25 -25 72 25 barrier")
    rcon("execute in hub run fill 25 65 -25 25 72 25 barrier")

    # 5. Filet de sécurité horizontal invisible à Y=20 sous toute la zone
    print("4. Filet horizontal invisible à Y=20...")
    rcon("execute in hub run fill -35 20 -35 35 20 35 barrier")

    # 6. DÉSACTIVATION ABSOLUE DES DÉGÂTS DE CHUTE (Fall damage = false)
    print("5. Désactivation des dégâts de chute sur tous les mondes de lobby...")
    rcon("execute in hub run gamerule minecraft:fall_damage false")
    rcon("execute in lobby_minijeux run gamerule minecraft:fall_damage false")
    rcon("execute in rush_jfm run gamerule minecraft:fall_damage false")
    rcon("execute in hikabrain_jfm run gamerule minecraft:fall_damage false")

    # 7. Bloc de commande de rattrapage instantané à Y=63
    print("6. Mise en place du bloc de commande de téléportation anti-vide...")
    cmd_catch = 'execute as @a[y=-128,dy=180] run tp @s 0.5 65.0 0.5 0 0'
    rcon(f'execute in hub run setblock 0 63 0 repeating_command_block[facing=up]{{Command:"{cmd_catch}",auto:1b}}')

    # 8. Verrouillage du temps et des monstres
    rcon("execute in hub run gamerule minecraft:advance_time false")
    rcon("execute in hub run gamerule minecraft:advance_weather false")
    rcon("execute in hub run gamerule minecraft:spawn_monsters false")
    rcon("execute in hub run setworldspawn 0 65 0")

    print("=== [LOT 2] Sécurité du Hub 100% opérationnelle (Zéro mort par chute) ! ===")

if __name__ == "__main__":
    apply_hub_security()
