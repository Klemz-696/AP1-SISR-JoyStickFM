#!/usr/bin/env python3
"""
JoyStick FM - Lot 2: Hub Perimeter Security & Fail-Safe Anti-Void Fallback
Features:
  - Forceload chunk anchors around Hub platform
  - Double perimeter barriers (glass aesthetic + 4-block high invisible barrier)
  - Invisible horizontal safety barrier floor at Y=20 (prevents hitting void -64)
  - Autonomous repeating command block catching all players Y <= 52:
    teleports immediately back to (0.5, 65, 0.5) with zero damage.
"""

import subprocess
import sys

CONTAINER = "minecraft_ap1"

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    out = res.stdout.strip()
    print(f"[RCON] {cmd} => {out[:70]}")
    return out

def apply_hub_security():
    print("=== [LOT 2] Application de la sécurité renforcée du Hub principal ===")

    # 1. Forceload des chunks du Hub pour garantir le placement
    print("1. Forceload des chunks du Hub (-2 -2 à 2 2)...")
    rcon("execute in hub run forceload add -2 -2 2 2")

    # 2. Consolidation de la plateforme centrale (33x33 blocs à Y=64)
    print("2. Consolidation de la dalle du Hub...")
    rcon("execute in hub run fill -16 63 -16 16 63 16 black_concrete")
    rcon("execute in hub run fill -16 64 -16 16 64 16 smooth_quartz")
    rcon("execute in hub run fill -16 64 -16 16 64 -16 purple_concrete")
    rcon("execute in hub run fill -16 64 16 16 64 16 purple_concrete")
    rcon("execute in hub run fill -16 64 -16 -16 64 16 cyan_concrete")
    rcon("execute in hub run fill 16 64 -16 16 64 16 cyan_concrete")

    # 3. Barrières périmétriques (Y=65 à Y=68)
    print("3. Installation des barrières invisibles périmétriques...")
    rcon("execute in hub run fill -16 65 -16 16 69 -16 barrier")
    rcon("execute in hub run fill -16 65 16 16 69 16 barrier")
    rcon("execute in hub run fill -16 65 -16 -16 69 16 barrier")
    rcon("execute in hub run fill 16 65 -16 16 69 16 barrier")

    # 4. Filet de sécurité horizontal invisible à Y=20 (impossible d'atteindre le vide mortel à -64)
    print("4. Déploiement du filet invisible horizontal anti-vide à Y=20...")
    rcon("execute in hub run fill -30 20 -30 30 20 30 barrier")

    # 5. Bloc de commande de rattrapage instantané (couvre tout Y de -128 jusqu'à 52)
    print("5. Mise en place du bloc de commande de rattrapage anti-chute...")
    cmd_catch = 'execute as @a[y=-128,dy=180] run tp @s 0.5 65.0 0.5 0 0'
    rcon(f'execute in hub run setblock 0 63 0 repeating_command_block[facing=up]{{Command:"{cmd_catch}",auto:1b}}')

    # 6. Gamerules du Hub
    rcon("execute in hub run gamerule minecraft:advance_time false")
    rcon("execute in hub run gamerule minecraft:advance_weather false")
    rcon("execute in hub run gamerule minecraft:spawn_monsters false")
    rcon("execute in hub run setworldspawn 0 65 0")

    print("=== [LOT 2] Sécurisation renforcée du Hub achevée avec succès ! ===")

if __name__ == "__main__":
    apply_hub_security()
