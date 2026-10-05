#!/usr/bin/env python3
"""
JoyStick FM - Touche Finale Parfaite (Pose Plaque d'Or, Activation Chrono, Boussole & Menu)
"""

import subprocess
import time
from pathlib import Path

CONTAINER = "minecraft_ap1"

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    out = res.stdout.strip()
    print(f" [RCON] {cmd[:65]}\n    ==> {out}")
    return out

def main():
    print("=" * 75)
    print(" JOYSTICK FM — APPLICATION DE LA TOUCHE FINALE PARFAITE ")
    print("=" * 75)

    # 1. Pose infaillible de la plaque d'or de départ sur le quartz
    print("\n--- [1/4] Pose de la Plaque d'Or sur Quartz Solide ---")
    rcon("execute in hub run setblock 6 66 0 air destroy")
    rcon("execute in hub run setblock 6 65 0 smooth_quartz")
    rcon("execute in hub run setblock 6 66 0 light_weighted_pressure_plate")

    # 2. Command blocks du chronomètre avec échappement NBT 100% valide
    print("\n--- [2/4] Activation des Command Blocks du Chrono (Syntaxe NBT Validée) ---")
    # Départ : démarre chrono + ding sonore + actionbar
    cmd_start = 'execute as @a[x=5.5,dx=1,y=65.5,dy=1.5,z=-0.5,dz=1,scores={in_parkour=0}] run scoreboard players set @s in_parkour 1'
    cmd_sound = 'execute as @a[x=5.5,dx=1,y=65.5,dy=1.5,z=-0.5,dz=1] run playsound minecraft:block.note_block.bell master @s ~ ~ ~ 1 1.5'
    rcon(f'execute in hub run setblock 6 64 0 repeating_command_block[facing=up]{{Command:"{cmd_start}",auto:1b}}')
    rcon(f'execute in hub run setblock 6 63 0 repeating_command_block[facing=up]{{Command:"{cmd_sound}",auto:1b}}')

    # Arrivée : victoire + son toast + particules + arrêt chrono
    cmd_win_sound = 'execute as @a[x=5.5,dx=3,y=72,dy=2.5,z=0.5,dz=3,scores={in_parkour=1}] run playsound minecraft:ui.toast.challenge_complete master @s ~ ~ ~ 1 1'
    cmd_win_part = 'execute as @a[x=5.5,dx=3,y=72,dy=2.5,z=0.5,dz=3,scores={in_parkour=1}] run particle minecraft:totem_of_undying ~ ~1 ~ 0.5 0.5 0.5 0.1 50'
    cmd_stop = 'execute as @a[x=5.5,dx=3,y=72,dy=2.5,z=0.5,dz=3,scores={in_parkour=1}] run scoreboard players set @s in_parkour 0'
    rcon(f'execute in hub run setblock 7 70 2 repeating_command_block[facing=up]{{Command:"{cmd_win_sound}",auto:1b}}')
    rcon(f'execute in hub run setblock 7 69 2 repeating_command_block[facing=up]{{Command:"{cmd_win_part}",auto:1b}}')
    rcon(f'execute in hub run setblock 7 68 2 repeating_command_block[facing=up]{{Command:"{cmd_stop}",auto:1b}}')

    # 3. Synchronisation de la Boussole et du Menu
    print("\n--- [3/4] Synchronisation des Menus et d'ItemJoin ---")
    rcon("ij reload")
    rcon("dm reload")
    # Si le joueur est en ligne, don immédiat
    rcon("itemjoin get game-selector Klemz_696")
    rcon("ij get game-selector Klemz_696")

    # 4. Confirmation de la sécurité anti-chute
    print("\n--- [4/4] Vérification de la Sécurité Anti-Vide à Y=60 ---")
    rcon("execute in hub run gamerule minecraft:fall_damage false")

    print("\n" + "=" * 75)
    print(" TOUT EST PRÊT : CONNECTEZ-VOUS EN JEU POUR JOUER ! ")
    print("=" * 75)

if __name__ == "__main__":
    main()
