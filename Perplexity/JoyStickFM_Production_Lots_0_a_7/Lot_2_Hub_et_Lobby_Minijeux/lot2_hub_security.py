#!/usr/bin/env python3
"""
JoyStick FM - Lot 2: Hub Perimeter Security & Anti-Void Fallback
Features:
  - 3-block high barrier wall on the Hub perimeter (Y=65 to Y=68)
  - Automatic void-fallback command block at Y=50:
    Any player falling below Y=50 is teleported back to Hub Spawn (0.5, 65, 0.5)
    with zero velocity and zero fall damage.
"""

import subprocess
import sys

CONTAINER = "minecraft_ap1"

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    out = res.stdout.strip()
    print(f"[RCON] {cmd} => {out[:60]}")
    return out

def apply_hub_security():
    print("=== [LOT 2] Application de la sécurité du Hub principal ===")

    # 1. Pose de la clôture invisible sur la plateforme céleste
    print("1. Installation des barrières invisibles périmétriques...")
    rcon("execute in hub run fill -40 65 -40 40 68 -40 barrier")
    rcon("execute in hub run fill -40 65 40 40 68 40 barrier")
    rcon("execute in hub run fill -40 65 -40 -40 68 40 barrier")
    rcon("execute in hub run fill 40 65 -40 40 68 40 barrier")

    # 2. Installation du système de rattrapage anti-chute Y < 50
    print("2. Mise en place du bloc de commande de rattrapage anti-chute...")
    cmd_payload = 'execute in hub as @a[y=0,dy=50] run tp @s 0.5 65.0 0.5 0 0'
    rcon(f'execute in hub run setblock 0 63 0 repeating_command_block[facing=up]{{Command:"{cmd_payload}",auto:1b}}')

    # 3. Vérification des gamerules du Hub
    rcon("execute in hub run gamerule minecraft:advance_time false")
    rcon("execute in hub run gamerule minecraft:advance_weather false")
    rcon("execute in hub run gamerule minecraft:spawn_monsters false")
    rcon("execute in hub run time set 6000")
    rcon("execute in hub run weather clear")

    print("=== [LOT 2] Sécurisation du Hub achevée avec succès ! ===")

if __name__ == "__main__":
    apply_hub_security()
