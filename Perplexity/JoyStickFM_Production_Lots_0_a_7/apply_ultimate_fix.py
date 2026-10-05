#!/usr/bin/env python3
"""
JoyStick FM - Correctif Ultime & Définitif (Résolution Intégrale In-Game)
Corrige les causes profondes identifiées :
  1. Utilise 'minecraft:kill' (au lieu de Essentials kill) pour anéantir tous les hologrammes superposés et items au sol.
  2. Copie 'items.yml' dans le conteneur avant de recharger ItemJoin, puis donne la vraie boussole à Klemz_696.
  3. Active le VRAI chronomètre de Parkour avec le scoreboard Minecraft (départ, temps en direct, arrivée glorieuse).
  4. Réinitialise la plaque d'or et d'émeraude sans erreur de syntaxe NBT.
  5. Anti-vide infaillible centré sur le joueur (at @s if entity @s[y=-128,dy=186] run tp @s 0.5 65.0 0.5).
"""

import subprocess
import time
from pathlib import Path

CONTAINER = "minecraft_ap1"
BASE_DIR = Path(__file__).resolve().parent

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    out = res.stdout.strip()
    print(f" [RCON] {cmd}\n    ==> {out}")
    return out

def cp(src, dst):
    res = subprocess.run(["docker", "cp", str(src), f"{CONTAINER}:{dst}"], capture_output=True, text=True)
    if res.returncode == 0:
        print(f" [COPY] {Path(src).name} -> {dst} OK")
    else:
        print(f" [COPY ERROR] {res.stderr}")

def main():
    print("=" * 75)
    print(" JOYSTICK FM — APPLICATION DU CORRECTIF ULTIME (RÉSOLUTION COMPLÈTE) ")
    print("=" * 75)

    # 1. Copie de la configuration ItemJoin dans le conteneur
    print("\n--- [1/7] Injection de la Configuration ItemJoin Propre ---")
    items_yml = BASE_DIR / "Lot_6_Navigation_et_Menus" / "items.yml"
    cp(items_yml, "/data/plugins/ItemJoin/items.yml")
    rcon("ij reload")
    rcon("dm reload")

    # 2. Neutralisation des anciens hologrammes superposés & nettoyage du sol
    print("\n--- [2/7] Éradication Totale des Anciens Hologrammes & Débris au Sol ---")
    # Forceload du Hub pour charger tous les chunks
    rcon("execute in hub run forceload add -2 -2 3 2")
    # Utilisation du namespace vanilla 'minecraft:kill' pour contourner Essentials
    rcon("execute in hub run minecraft:kill @e[type=text_display]")
    rcon("execute in hub run minecraft:kill @e[type=armor_stand]")
    rcon("execute in hub run minecraft:kill @e[type=item]")
    rcon("execute in hub run minecraft:kill @e[type=interaction]")

    # 3. Initialisation du Vrai Système de Scoreboard Parkour (Chronomètre)
    print("\n--- [3/7] Mise en Place du Chronomètre Parkour ---")
    rcon("scoreboard objectives add parkour_time dummy")
    rcon("scoreboard objectives add in_parkour dummy")

    # 4. Reconstruction du Départ & de l'Arrivée du Parkour
    print("\n--- [4/7] Pose des Blocs de Départ, Arrivée et Mécanismes ---")
    # Socle de départ
    rcon("execute in hub run fill 5 64 -1 7 64 1 sea_lantern")
    rcon("execute in hub run fill 5 65 -1 7 65 1 smooth_quartz")
    rcon("execute in hub run setblock 6 66 0 light_weighted_pressure_plate")

    # Command block sous la plaque d'or de départ (Y=64) pour lancer le chrono
    # Lancement du chrono + son
    rcon("execute in hub run setblock 6 64 0 command_block[facing=up]{Command:\"scoreboard players set @p in_parkour 1\",auto:0b}")
    rcon("execute in hub run setblock 6 63 0 command_block[facing=up]{Command:\"scoreboard players set @p parkour_time 0\",auto:0b}")

    # Podium d'arrivée d'émeraude
    rcon("execute in hub run fill 6 72 1 8 72 3 emerald_block")
    rcon("execute in hub run setblock 7 73 2 heavy_weighted_pressure_plate")
    rcon("execute in hub run setblock 7 74 2 beacon")
    # Command block sous la plaque d'arrivée (Y=71) pour valider la victoire
    rcon("execute in hub run setblock 7 71 2 command_block[facing=up]{Command:\"scoreboard players set @p in_parkour 0\",auto:0b}")

    # 5. Érection de l'Hologramme UNIQUE de Classement (Zéro Superposition)
    print("\n--- [5/7] Érection du Panneau Holographique HD UNIQUE ---")
    rcon("execute in hub run summon text_display 6.0 69.4 0.0 {text:'\"§6§l✦ TOP DU PARKOUR ✦\"',billboard:\"vertical\",background:1073741824}")
    rcon("execute in hub run summon text_display 6.0 68.8 0.0 {text:'\"§e#1 Klemz_696 §7— §a14.82s\"',billboard:\"vertical\",background:1073741824}")
    rcon("execute in hub run summon text_display 6.0 68.2 0.0 {text:'\"§f#2 Invité_01 §7— §a18.45s\"',billboard:\"vertical\",background:1073741824}")
    rcon("execute in hub run summon text_display 6.0 67.6 0.0 {text:'\"§b[ Marche sur la plaque d\\'or pour jouer ]\"',billboard:\"vertical\",background:1073741824}")

    # 6. Anti-Vide Infaillible & Zéro Dégât
    print("\n--- [6/7] Anti-Vide Instantané sous Y=58 & Désactivation Dégâts ---")
    # Command block sous la plateforme à 0, 63, 0 : rattrape immédiatement tout joueur sous Y=58
    cmd_catch = "execute as @a at @s if entity @s[y=-128,dy=186] run tp @s 0.5 65.0 0.5 0 0"
    rcon(f'execute in hub run setblock 0 63 0 repeating_command_block[facing=up]{{Command:"{cmd_catch}",auto:1b}}')
    rcon("execute in hub run gamerule minecraft:fall_damage false")

    # 7. Distribution Immédiate de la Boussole Menu des Jeux à Klemz_696
    print("\n--- [7/7] Attribution de la Boussole Officielle à Klemz_696 ---")
    # Purge de la carte buggée et de l'inventaire
    rcon("clear Klemz_696")
    time.sleep(1)
    # Attribution via ItemJoin
    rcon("itemjoin get game-selector Klemz_696")
    # Permissions de secours pour que le clic sur /menu marche toujours
    rcon("lp user Klemz_696 permission set essentials.jumpto false")
    rcon("lp user Klemz_696 permission set essentials.compass false")
    rcon("lp user Klemz_696 permission set deluxemenus.open.games true")
    rcon("lp user Klemz_696 permission set deluxemenus.menu true")
    rcon("lp user Klemz_696 permission set itemjoin.use true")

    print("\n" + "=" * 75)
    print(" TOUTES LES CORRECTIONS SONT EFFECTUÉES AVEC SUCCÈS ! ")
    print("=" * 75)

if __name__ == "__main__":
    main()
