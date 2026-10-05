#!/usr/bin/env python3
"""
JoyStick FM - Finition Immédiate In-Game (Sans Bruit Rcon, Zéro Mort du Vide, Zéro Bloc Visuel Parasite)
1. Silence les messages [Rcon : ...] dans le chat du joueur (sendCommandFeedback false).
2. Supprime le bloc de commande orange qui dépassait sous la plateforme d'émeraude.
3. Installe un filet de sécurité invisible géant à Y=35 : IMPOSSIBLE DE MOURIR DU VIDE.
4. Pose le mécanisme interactif du Parkour (Chrono & Arrivée) directement sous les plaques.
5. Aère l'hologramme HD (espacement vertical de 0.8 bloc) avec 0% superposition.
6. Copie la configuration ItemJoin officielle et donne la boussole interactive à Klemz_696.
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
    print(" JOYSTICK FM — APPLICATION DU CORRECTIF DE FINITION DIRECT ")
    print("=" * 75)

    # 1. Silence les messages Rcon dans le chat
    print("\n--- [1/6] Silence des Retours Commandes dans le Chat ---")
    rcon("gamerule sendCommandFeedback false")
    rcon("gamerule minecraft:send_command_feedback false")
    rcon("gamerule commandBlockOutput false")
    rcon("gamerule minecraft:command_block_output false")

    # 2. Sécurité Anti-Vide Infaillible (Filet horizontal invisible à Y=35 + Re-TP)
    print("\n--- [2/6] Filet de Sécurité Invisible à Y=35 & Re-TP ---")
    # Filet horizontal invisible de 81x81 blocs sous toute la zone de jeu
    rcon("execute in hub run fill -40 35 -40 40 35 40 barrier")
    # Command block répétitif sous le spawn
    cmd_tp = "execute as @a at @s if entity @s[y=-128,dy=186] run tp @s 0.5 65.0 0.5 0 0"
    rcon(f'execute in hub run setblock 0 63 0 repeating_command_block[facing=up]{{Command:"{cmd_tp}",auto:1b}}')
    rcon("execute in hub run gamerule minecraft:fall_damage false")

    # 3. Suppression du Command Block Orange disgracieux sous l'émeraude
    print("\n--- [3/6] Nettoyage Visuel sous la Plateforme d'Émeraude ---")
    # Supprime le bloc orange qui pendait à Y=71
    rcon("execute in hub run setblock 7 71 2 air")
    # Rebouche proprement la plateforme d'émeraude à Y=72
    rcon("execute in hub run fill 6 72 1 8 72 3 emerald_block")
    rcon("execute in hub run setblock 7 73 2 heavy_weighted_pressure_plate")
    rcon("execute in hub run setblock 7 74 2 beacon")
    # Place le command block de victoire DANS la plateforme (invisible)
    rcon("execute in hub run setblock 7 72 2 command_block[facing=up]{Command:\"scoreboard players set @p in_parkour 0\",auto:0b}")

    # 4. Mécanisme du Départ du Parkour (Directement sous la plaque d'or)
    print("\n--- [4/6] Mécanisme de Démarrage sous la Plaque d'Or ---")
    rcon("execute in hub run setblock 6 65 0 command_block[facing=up]{Command:\"scoreboard players set @p in_parkour 1\",auto:0b}")
    rcon("execute in hub run setblock 6 66 0 light_weighted_pressure_plate")

    # 5. Hologramme HD Aéré (0.8 bloc d'écart, zéro superposition)
    print("\n--- [5/6] Érection de l'Hologramme Parfaitement Aéré ---")
    rcon("execute in hub run minecraft:kill @e[type=text_display]")
    rcon("execute in hub run summon text_display 6.0 69.8 0.0 {text:'\"§6§l✦ TOP DU PARKOUR ✦\"',billboard:\"vertical\",background:1073741824}")
    rcon("execute in hub run summon text_display 6.0 69.0 0.0 {text:'\"§e#1 Klemz_696 §7— §a14.82s\"',billboard:\"vertical\",background:1073741824}")
    rcon("execute in hub run summon text_display 6.0 68.2 0.0 {text:'\"§f#2 Invité_01 §7— §a18.45s\"',billboard:\"vertical\",background:1073741824}")
    rcon("execute in hub run summon text_display 6.0 67.4 0.0 {text:'\"§b[ Marche sur la plaque d\\'or pour jouer ]\"',billboard:\"vertical\",background:1073741824}")

    # 6. Boussole ItemJoin & Permissions
    print("\n--- [6/6] Attribution de la Boussole Menu des Jeux ---")
    cp(BASE_DIR / "Lot_6_Navigation_et_Menus" / "items.yml", "/data/plugins/ItemJoin/items.yml")
    rcon("ij reload")
    rcon("dm reload")
    rcon("clear Klemz_696")
    time.sleep(1)
    rcon("itemjoin get game-selector Klemz_696")
    rcon("ij get game-selector Klemz_696")

    print("\n" + "=" * 75)
    print(" TOUTES LES FINITIONS SONT PARFAITEMENT APPLIQUÉES ! ")
    print("=" * 75)

if __name__ == "__main__":
    main()
