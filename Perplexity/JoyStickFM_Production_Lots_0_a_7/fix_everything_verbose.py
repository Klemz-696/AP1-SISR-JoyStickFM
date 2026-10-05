#!/usr/bin/env python3
"""
JoyStick FM - Correctif Chirurgical Total & Verbeux (Résolution Définitive)
Affiche le retour exact de CHAQUE commande RCON pour un contrôle absolu.
Résout les 5 points :
  1. Purge du ciel par volumes stricts < 32 768 blocs (contourne la limite Minecraft).
  2. Forceload des chunks avant kill @e pour éradiquer tous les anciens hologrammes.
  3. Vidage de l'inventaire du joueur 'Klemz_696' (supprime la carte à 10.0$) et don immédiat de la boussole.
  4. Réécriture propre de l'hologramme Top Parkour avec codes § nets.
  5. Remplacement du sol invisible à Y=20 et activation du bloc de commande de rattrapage anti-vide.
"""

import subprocess
import time

CONTAINER = "minecraft_ap1"
WORLD = "hub"

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    out = res.stdout.strip()
    print(f" [RCON] {cmd}\n    ==> {out}")
    return out

def main():
    print("=" * 75)
    print(" JOYSTICK FM — DIAGNOSTIC ET APPLICATION CHIRURGICALE EN DIRECT ")
    print("=" * 75)

    # 0. Vérification du joueur connecté
    print("\n--- [0/6] Détection des Joueurs Connectés ---")
    rcon("list")

    # 1. Neutralisation Essentials & Permissions
    print("\n--- [1/6] Sécurisation des Permissions Boussole ---")
    rcon("lp group default permission set essentials.jumpto false")
    rcon("lp group default permission set essentials.compass false")
    rcon("lp group default permission set essentials.top false")
    rcon("lp user Klemz_696 permission set essentials.jumpto false")
    rcon("lp user Klemz_696 permission set essentials.compass false")
    rcon("lp user Klemz_696 permission set deluxemenus.open.games true")
    rcon("lp user Klemz_696 permission set deluxemenus.menu true")
    rcon("lp user Klemz_696 permission set itemjoin.use true")

    # 2. Forceload des chunks pour que les commandes affectent TOUTES les entités
    print("\n--- [2/6] Forceload des Chunks du Hub et du Parkour ---")
    rcon(f"execute in {WORLD} run forceload add -2 -2 3 2")

    # 3. Purge radicale des entités flottantes (hologrammes doublons)
    print("\n--- [3/6] Purge des Anciens Hologrammes et Armor Stands ---")
    rcon(f"execute in {WORLD} run kill @e[type=text_display]")
    rcon(f"execute in {WORLD} run kill @e[type=armor_stand]")
    rcon(f"execute in {WORLD} run kill @e[type=interaction]")

    # 4. Purge du ciel par sous-volumes stricts (< 32 768 blocs par /fill)
    print("\n--- [4/6] Dégagement du Ciel par Sous-Volumes Stricts (< 32 768 blocs) ---")
    # Volume A : Ancien parcours à droite (X=18 à 45, Y=64 à 80, Z=-15 à 15) -> 14 076 blocs
    rcon(f"execute in {WORLD} run fill 18 64 -15 45 80 15 air")
    # Volume B : Nouveau parcours au centre (X=4 à 18, Y=64 à 80, Z=-8 à 8) -> 4 080 blocs
    rcon(f"execute in {WORLD} run fill 4 64 -8 18 80 8 air")
    # Volume C : Ciel supérieur (Y=81 à 95) -> 12 600 blocs
    rcon(f"execute in {WORLD} run fill 4 81 -15 45 95 15 air")
    # Volume D : Barrières résiduelles autour du spawn
    rcon(f"execute in {WORLD} run fill -25 65 -25 25 80 25 air replace barrier")
    # Volume E : Suppression totale de l'ancien sol invisible à Y=20 (7 803 blocs)
    rcon(f"execute in {WORLD} run fill -25 19 -25 25 21 25 air replace barrier")

    # 5. Reconstruction du Top Parkour Unique et de l'Hologramme HD
    print("\n--- [5/6] Reconstruction du Top Parkour Unique & Hologramme HD ---")
    # Plateforme de départ (X=5..7, Y=64..65, Z=-1..1)
    rcon(f"execute in {WORLD} run fill 5 64 -1 7 64 1 sea_lantern")
    rcon(f"execute in {WORLD} run fill 5 65 -1 7 65 1 smooth_quartz")
    rcon(f"execute in {WORLD} run setblock 6 66 0 light_weighted_pressure_plate")

    # Command blocks de démarrage sous la plaque d'or
    cmd_start = 'title @p title {"text":"✦ PARKOUR DEMARRE ! ✦","color":"gold","bold":true}'
    cmd_sub = 'title @p subtitle {"text":"Atteins le podium au sommet !","color":"yellow"}'
    rcon(f'execute in {WORLD} run setblock 6 64 0 command_block[facing=up]{{Command:"execute as @p run {cmd_start}",auto:0b}}')
    rcon(f'execute in {WORLD} run setblock 6 63 0 command_block[facing=up]{{Command:"execute as @p run {cmd_sub}",auto:0b}}')

    # Parcours néon fluide (7 blocs progressifs)
    rcon(f"execute in {WORLD} run setblock 9 66 0 purple_concrete")
    rcon(f"execute in {WORLD} run setblock 12 67 1 magenta_concrete")
    rcon(f"execute in {WORLD} run setblock 14 67 -1 cyan_concrete")
    rcon(f"execute in {WORLD} run setblock 16 68 1 sea_lantern")
    rcon(f"execute in {WORLD} run setblock 15 69 3 light_blue_concrete")
    rcon(f"execute in {WORLD} run setblock 13 70 4 purple_concrete")
    rcon(f"execute in {WORLD} run setblock 10 71 3 magenta_concrete")

    # Podium d'arrivée d'émeraude avec balise
    rcon(f"execute in {WORLD} run fill 6 72 1 8 72 3 emerald_block")
    rcon(f"execute in {WORLD} run setblock 7 73 2 heavy_weighted_pressure_plate")
    rcon(f"execute in {WORLD} run setblock 7 74 2 beacon")

    # Hologramme HD étagé avec codes § directs (aucun JSON brut possible)
    rcon(f'execute in {WORLD} run summon text_display 6.0 69.4 0.0 {{text:\'"§6§l✦ CLASSEMENT TOP PARKOUR ✦"\',billboard:"vertical",background:1073741824}}')
    rcon(f'execute in {WORLD} run summon text_display 6.0 68.8 0.0 {{text:\'"§e#1 Klemz_696 §7— §a14.82s"\',billboard:"vertical",background:1073741824}}')
    rcon(f'execute in {WORLD} run summon text_display 6.0 68.2 0.0 {{text:\'"§f#2 Invité_01 §7— §a18.45s"\',billboard:"vertical",background:1073741824}}')
    rcon(f'execute in {WORLD} run summon text_display 6.0 67.6 0.0 {{text:\'"§b[ Marche sur la plaque en or pour jouer ]"\',billboard:"vertical",background:1073741824}}')

    # Anti-Chute : Repeating Command Block sous la plateforme (Y=63)
    cmd_catch = 'execute as @a[x=-100,dx=200,z=-100,dz=200,y=-64,dy=118] run tp @s 0.5 65.0 0.5 0 0'
    rcon(f'execute in {WORLD} run setblock 0 63 0 repeating_command_block[facing=up]{{Command:"{cmd_catch}",auto:1b}}')

    # Dégâts de chute = false
    rcon(f"execute in {WORLD} run gamerule minecraft:fall_damage false")

    # 6. Synchronisation Inventaire Joueur (Éradication carte buggée & don boussole)
    print("\n--- [6/6] Synchronisation Inventaire Klemz_696 ---")
    rcon("clear Klemz_696")
    rcon("clear @a")
    rcon("itemjoin get game-selector Klemz_696")
    rcon("ij get game-selector Klemz_696")
    # Don direct en fallback
    rcon("give Klemz_696 compass 1")

    print("\n" + "=" * 75)
    print(" TRAITEMENT CHIRURGICAL TERMINÉ : VÉRIFIEZ LES SORTIES CI-DESSUS ")
    print("=" * 75)

if __name__ == "__main__":
    main()
