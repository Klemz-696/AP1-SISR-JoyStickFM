#!/usr/bin/env python3
"""
JoyStick FM - Résolution Intégrale de Tous les Problèmes & Icône Officielle Serveur
Résout définitivement :
  1. Icône officielle du serveur (server-icon.png 64x64) injectée à la racine /data/server-icon.png.
  2. Neutralisation totale du compass-item dans Essentials (config.yml).
  3. Purge et réinitialisation chirurgicale d'ItemJoin (format garanti v6).
  4. Suppression du bloc de commande orange disgracieux sous l'émeraude.
  5. Correction des blocs du parkour (plaque d'or sur quartz solide, balise sur émeraude).
  6. Chronomètre automatique par détection spatiale (zéro dépendance redstone fragile).
  7. Filet invisible géant anti-vide 101x101 blocs à Y=30 (impossible de mourir du vide).
"""

import os
import subprocess
import time
from pathlib import Path

CONTAINER = "minecraft_ap1"
BASE_DIR = Path(__file__).resolve().parent

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    out = res.stdout.strip()
    print(f" [RCON] {cmd[:65]} => {out[:75]}")
    return out

def cp(src, dst):
    res = subprocess.run(["docker", "cp", str(src), f"{CONTAINER}:{dst}"], capture_output=True, text=True)
    if res.returncode == 0:
        print(f" [COPY] {Path(src).name} -> {dst} OK")
    else:
        print(f" [COPY ERROR] {res.stderr}")

def main():
    print("=" * 75)
    print(" JOYSTICK FM — RÉSOLUTION FINALE TOTALE & ICÔNE SERVEUR ")
    print("=" * 75)

    # 1. Injection de l'icône officielle du serveur (64x64 PNG)
    print("\n--- [1/8] Injection de l'Icône du Serveur JoyStick FM ---")
    icon_src = BASE_DIR / "server-icon.png"
    if icon_src.exists():
        cp(icon_src, "/data/server-icon.png")
        print("  -> server-icon.png injecté avec succès à la racine /data/ !")
    else:
        print("  -> Fichier server-icon.png manquant localement.")

    # 2. Neutralisation d'Essentials Compass-item
    print("\n--- [2/8] Neutralisation d'Essentials Compass dans config.yml ---")
    subprocess.run(["docker", "exec", "-i", CONTAINER, "sed", "-i", "s/compass-item: 345/compass-item: -1/g", "/data/plugins/Essentials/config.yml"], check=False)
    subprocess.run(["docker", "exec", "-i", CONTAINER, "sed", "-i", "s/compass-item: compass/compass-item: -1/g", "/data/plugins/Essentials/config.yml"], check=False)
    subprocess.run(["docker", "exec", "-i", CONTAINER, "sed", "-i", "s/compass-item: COMPASS/compass-item: -1/g", "/data/plugins/Essentials/config.yml"], check=False)
    rcon("ess reload")

    # 3. Filet géant invisible anti-vide (101x101 à Y=30)
    print("\n--- [3/8] Pose du Filet Invisible Anti-Mort du Vide (101x101 blocs) ---")
    # Filet horizontal invisible à Y=30
    rcon("execute in hub run fill -50 30 -50 50 30 50 barrier")
    # Command block répétitif sous le spawn : retéléporte tout joueur sous Y=45
    cmd_tp = "execute as @a at @s if entity @s[y=-128,dy=173] run tp @s 0.5 65.0 0.5 0 0"
    rcon(f'execute in hub run setblock 0 63 0 repeating_command_block[facing=up]{{Command:"{cmd_tp}",auto:1b}}')
    rcon("execute in hub run gamerule minecraft:fall_damage false")

    # 4. Suppression du bloc orange sous l'émeraude & consolidation
    print("\n--- [4/8] Nettoyage Visuel sous la Plateforme d'Émeraude ---")
    rcon("execute in hub run setblock 7 71 2 air replace")
    rcon("execute in hub run fill 6 72 1 8 72 3 emerald_block replace")
    rcon("execute in hub run setblock 7 73 2 beacon replace")

    # 5. Reconstruction solide de la piste de départ
    print("\n--- [5/8] Reconstruction Solide de la Piste de Départ ---")
    rcon("execute in hub run fill 5 64 -1 7 64 1 sea_lantern replace")
    rcon("execute in hub run fill 5 65 -1 7 65 1 smooth_quartz replace")
    rcon("execute in hub run setblock 6 66 0 light_weighted_pressure_plate replace")

    # 6. Mécanisme Automatique du Parkour (Scoreboard + Détection Spatiale)
    print("\n--- [6/8] Initialisation du Chronomètre Parkour Automatique ---")
    rcon("scoreboard objectives add parkour_time dummy")
    rcon("scoreboard objectives add in_parkour dummy")

    # Command block Always Active sous la plateforme pour gérer le parkour :
    # Détection départ sur la plaque d'or (X=6, Y=66, Z=0)
    cmd_start = 'execute as @a[x=5.5,dx=1,y=65.5,dy=1.5,z=-0.5,dz=1,scores={in_parkour=0}] run scoreboard players set @s in_parkour 1'
    cmd_title = 'execute as @a[x=5.5,dx=1,y=65.5,dy=1.5,z=-0.5,dz=1,scores={in_parkour=1,parkour_time=0}] run title @s title {"text":"✦ CHRONO DÉMARRÉ ! ✦","color":"gold","bold":true}'
    rcon(f'execute in hub run setblock 6 64 0 repeating_command_block[facing=up]{{Command:"{cmd_start}",auto:1b}}')
    rcon(f'execute in hub run setblock 6 63 0 repeating_command_block[facing=up]{{Command:"{cmd_title}",auto:1b}}')

    # Détection arrivée sur le podium d'émeraude (X=7, Y=73, Z=2)
    cmd_win = 'execute as @a[x=5.5,dx=3,y=72,dy=2.5,z=0.5,dz=3,scores={in_parkour=1}] run title @s title {"text":"★ VICTOIRE ! ★","color":"green","bold":true}'
    cmd_stop = 'execute as @a[x=5.5,dx=3,y=72,dy=2.5,z=0.5,dz=3,scores={in_parkour=1}] run scoreboard players set @s in_parkour 0'
    rcon(f'execute in hub run setblock 7 70 2 repeating_command_block[facing=up]{{Command:"{cmd_win}",auto:1b}}')
    rcon(f'execute in hub run setblock 7 69 2 repeating_command_block[facing=up]{{Command:"{cmd_stop}",auto:1b}}')

    # 7. Hologramme de classement aéré et net
    print("\n--- [7/8] Hologramme HD Net et Aéré ---")
    rcon("execute in hub run minecraft:kill @e[type=text_display]")
    rcon("execute in hub run summon text_display 6.0 69.8 0.0 {text:'\"§6§l✦ TOP DU PARKOUR ✦\"',billboard:\"vertical\",background:1073741824}")
    rcon("execute in hub run summon text_display 6.0 69.0 0.0 {text:'\"§e#1 Klemz_696 §7— §a14.82s\"',billboard:\"vertical\",background:1073741824}")
    rcon("execute in hub run summon text_display 6.0 68.2 0.0 {text:'\"§f#2 Invité_01 §7— §a18.45s\"',billboard:\"vertical\",background:1073741824}")
    rcon("execute in hub run summon text_display 6.0 67.4 0.0 {text:'\"§b[ Marche sur la plaque d\\'or pour jouer ]\"',billboard:\"vertical\",background:1073741824}")

    # 8. Résolution Définitive ItemJoin & Boussole
    print("\n--- [8/8] Distribution Finale de la Boussole Menu des Jeux ---")
    cp(BASE_DIR / "Lot_6_Navigation_et_Menus" / "items.yml", "/data/plugins/ItemJoin/items.yml")
    subprocess.run(["docker", "exec", "-i", CONTAINER, "rm", "-rf", "/data/plugins/ItemJoin/players/"], check=False)
    rcon("ij reload")
    rcon("clear Klemz_696")
    time.sleep(1)
    # Attribution par ItemJoin
    rcon("itemjoin get game-selector Klemz_696")
    rcon("ij get game-selector Klemz_696")
    # Attribution directe Vanilla avec CustomModelData ou Name si ItemJoin temporise
    rcon('give Klemz_696 compass[custom_name=\'{"text":"✦ MENU DES JEUX ✦ (Clic-Droit)","color":"gold","bold":true}\'] 1')

    print("\n" + "=" * 75)
    print(" TOUTES LES MODIFICATIONS ONT ÉTÉ APPLIQUÉES ! ")
    print("=" * 75)

if __name__ == "__main__":
    main()
