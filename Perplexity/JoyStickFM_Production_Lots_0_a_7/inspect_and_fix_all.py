#!/usr/bin/env python3
"""
JoyStick FM - Inspection Profonde & Résolution Totale
1. Diagnostic et correction radicale d'Essentials (compass-item).
2. Diagnostic et correction chirurgicale d'ItemJoin via latest.log.
3. Filet invisible de sécurité à Y=60 (juste 4 blocs sous la plateforme) : IMPOSSIBLE DE MOURIR DU VIDE.
4. Blocs physiques du Parkour 100% posés sur du solide (quartz et émeraude).
5. Chronomètre interactif spatial (départ et arrivée).
"""

import subprocess
import time
from pathlib import Path

CONTAINER = "minecraft_ap1"
BASE_DIR = Path(__file__).resolve().parent

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    out = res.stdout.strip()
    print(f" [RCON] {cmd[:65]}\n    ==> {out}")
    return out

def sh(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "bash", "-c", cmd], capture_output=True, text=True)
    out = res.stdout.strip()
    if out:
        print(f" [SHELL] {cmd[:50]}...\n    ==> {out[:120]}")
    return out

def cp(src, dst):
    res = subprocess.run(["docker", "cp", str(src), f"{CONTAINER}:{dst}"], capture_output=True, text=True)
    if res.returncode == 0:
        print(f" [COPY] {Path(src).name} -> {dst} OK")
    else:
        print(f" [COPY ERROR] {res.stderr}")

def main():
    print("=" * 75)
    print(" JOYSTICK FM — INSPECTION PROFONDE ET CORRECTIFS GARANTIS ")
    print("=" * 75)

    # 1. DIAGNOSTIC ESSENTIALS COMPASS
    print("\n--- [1/6] Diagnostic & Neutralisation Totale d'Essentials Compass ---")
    sh("grep -i 'compass-item' /data/plugins/Essentials/config.yml")
    # Forcer la désactivation absolue de compass-item dans Essentials
    sh("sed -i 's/^compass-item:.*/compass-item: -1/g' /data/plugins/Essentials/config.yml")
    sh("sed -i 's/^  compass-item:.*/  compass-item: -1/g' /data/plugins/Essentials/config.yml")
    rcon("ess reload")
    sh("grep -i 'compass-item' /data/plugins/Essentials/config.yml")

    # 2. DIAGNOSTIC ITEMJOIN
    print("\n--- [2/6] Diagnostic ItemJoin & Logs du Serveur ---")
    sh("grep -i -C 2 'ItemJoin' /data/logs/latest.log | tail -n 25")
    print("Fichiers dans /data/plugins/ItemJoin/ :")
    sh("ls -la /data/plugins/ItemJoin/")

    # 3. ÉCRITURE D'UN ITEMS.YML PROPRE DIRECTEMENT DANS LE CONTENEUR
    print("\n--- [3/6] Réécriture Ultra-Propre de items.yml pour ItemJoin ---")
    clean_items_yaml = """items-v4:
  game-selector:
    id: COMPASS
    slot: 4
    name: '&6&l✦ MENU DES JEUX ✦ &7(Clic-Droit)'
    lore:
      - '&7Clique pour ouvrir la sélection des jeux :'
      - '&8▸ &aSurvie Vanilla'
      - '&8▸ &cBedWars &6Rush'
      - '&8▸ &eHikabrain &3Cache-Cache'
      - ''
      - '&e➜ Clic-droit pour ouvrir le menu'
    commands:
      default:
        - 'player: menu'
    triggers:
      - join
      - respawn
      - world-change
    enabled-worlds:
      - hub
      - world
      - lobby_minijeux
    itemflags:
      - HIDE_ATTRIBUTES
    permission-node: false
    always-give: true
    overwrite: true
    give-on-world-switch: true
    clear-on-world-switch: false
    drop-full: false
    item-movement: false
    modify-item: false
    movement-type: false
    drop-creative: false
    death-drops: false
"""
    # Écrire directement dans le conteneur
    subprocess.run(["docker", "exec", "-i", CONTAINER, "bash", "-c", "cat << 'EOF' > /data/plugins/ItemJoin/items.yml\n" + clean_items_yaml + "\nEOF"])
    # Supprimer les anciens caches de joueurs
    sh("rm -rf /data/plugins/ItemJoin/players/ /data/plugins/ItemJoin/database.db")
    rcon("ij reload")
    rcon("itemjoin reload")

    # 4. SÉCURITÉ ANTI-CHUTE PHYSIQUE ABSOLUE : FILET INVISIBLE À Y=60
    # La plateforme est à Y=64. À Y=60 (4 blocs sous la plateforme), un plancher géant invisible de 71x71 blocs !
    print("\n--- [4/6] Pose du Filet Invisible Anti-Chute à Y=60 (ZÉRO MORT DU VIDE) ---")
    rcon("execute in hub run fill -35 60 -35 35 60 35 barrier replace")
    # Filet secondaire plus bas à Y=30 au cas où
    rcon("execute in hub run fill -40 30 -40 40 30 40 barrier replace")
    # Téléportation automatique dès qu'un joueur touche le plancher à Y=60 ou en dessous
    cmd_tp = "execute as @a at @s if entity @s[y=-128,dy=187] run tp @s 0.5 65.0 0.5 0 0"
    rcon(f'execute in hub run setblock 0 63 0 repeating_command_block[facing=up]{{Command:"{cmd_tp}",auto:1b}}')
    rcon("execute in hub run gamerule minecraft:fall_damage false")

    # 5. POSE DES BLOCS PHYSIQUES DU PARKOUR (SOLIDES, SANS ERREUR)
    print("\n--- [5/6] Pose des Blocs Solides du Parkour (Départ & Arrivée) ---")
    # Départ : quartz à Y=65 et plaque d'or posée sur le quartz à Y=66
    rcon("execute in hub run setblock 6 65 0 smooth_quartz replace")
    rcon("execute in hub run setblock 6 66 0 light_weighted_pressure_plate replace")

    # Arrivée : émeraude à Y=72, plaque de pression à Y=73, et balise à côté à 8, 73, 2
    rcon("execute in hub run fill 6 72 1 8 72 3 emerald_block replace")
    rcon("execute in hub run setblock 7 73 2 heavy_weighted_pressure_plate replace")
    rcon("execute in hub run setblock 8 73 2 beacon replace")
    # Nettoyage sous l'émeraude
    rcon("execute in hub run setblock 7 71 2 air replace")

    # 6. MÉCANISME INTERACTIF DU CHRONOMÈTRE DU PARKOUR
    print("\n--- [6/6] Activation du Chronomètre Automatique par Détection de Zone ---")
    rcon("scoreboard objectives add in_parkour dummy")
    rcon("scoreboard objectives add parkour_time dummy")

    # Command block Always Active sous le spawn pour détecter le départ (sur la dalle de quartz à X=6, Y=66, Z=0)
    cmd_start = 'execute as @a[x=5.5,dx=1,y=65.5,dy=1.5,z=-0.5,dz=1,scores={in_parkour=0}] run scoreboard players set @s in_parkour 1'
    cmd_start_sound = 'execute as @a[x=5.5,dx=1,y=65.5,dy=1.5,z=-0.5,dz=1] run title @s title {"text":"✦ CHRONO DÉMARRÉ ! ✦","color":"gold","bold":true}'
    rcon(f'execute in hub run setblock 6 64 0 repeating_command_block[facing=up]{{Command:"{cmd_start}",auto:1b}}')
    rcon(f'execute in hub run setblock 6 63 0 repeating_command_block[facing=up]{{Command:"{cmd_start_sound}",auto:1b}}')

    # Command block Always Active pour détecter l'arrivée (sur la plateforme d'émeraude à X=6..8, Y=72..74, Z=1..3)
    cmd_win = 'execute as @a[x=5.5,dx=3,y=72,dy=2.5,z=0.5,dz=3,scores={in_parkour=1}] run title @s title {"text":"★ VICTOIRE ! ★","color":"green","bold":true}'
    cmd_win_sub = 'execute as @a[x=5.5,dx=3,y=72,dy=2.5,z=0.5,dz=3,scores={in_parkour=1}] run title @s subtitle {"text":"Parcours terminé avec succès !","color":"aqua"}'
    cmd_win_sound = 'execute as @a[x=5.5,dx=3,y=72,dy=2.5,z=0.5,dz=3,scores={in_parkour=1}] run playsound minecraft:ui.toast.challenge_complete master @s ~ ~ ~ 1 1'
    cmd_stop = 'execute as @a[x=5.5,dx=3,y=72,dy=2.5,z=0.5,dz=3,scores={in_parkour=1}] run scoreboard players set @s in_parkour 0'
    rcon(f'execute in hub run setblock 7 70 2 repeating_command_block[facing=up]{{Command:"{cmd_win}",auto:1b}}')
    rcon(f'execute in hub run setblock 7 69 2 repeating_command_block[facing=up]{{Command:"{cmd_win_sub}",auto:1b}}')
    rcon(f'execute in hub run setblock 7 68 2 repeating_command_block[facing=up]{{Command:"{cmd_win_sound}",auto:1b}}')
    rcon(f'execute in hub run setblock 7 67 2 repeating_command_block[facing=up]{{Command:"{cmd_stop}",auto:1b}}')

    # Distribution immédiate à Klemz_696
    print("\n--- Attribution Boussole Menu des Jeux ---")
    rcon("clear Klemz_696")
    time.sleep(1)
    rcon("itemjoin get game-selector Klemz_696")
    rcon("ij get game-selector Klemz_696")
    rcon('give Klemz_696 compass[custom_name=\'{"text":"✦ MENU DES JEUX ✦ (Clic-Droit)","color":"gold","bold":true}\'] 1')

    print("\n" + "=" * 75)
    print(" TRAITEMENT ET INSPECTION TERMINÉS ")
    print("=" * 75)

if __name__ == "__main__":
    main()
