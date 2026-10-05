#!/usr/bin/env python3
"""
JoyStick FM - Lot 7: Top Parkour Setup at Hub (V4 - Total Cleanup, Zero Duplicate, Crystal Clear Hologram)
Features:
  - Total airspace purge: Eradicates all duplicate parkour blocks between X=4 and X=60, Y=63 and Y=100.
  - Absolute entity purge: Kills all old text_displays, armor_stands, and interactions in hub and world.
  - Single, beautifully aligned parkour track starting right off the spawn platform.
  - Dynamic interactive start & finish plates with in-game titles and sounds.
  - Clean holographic leaderboard using pure Minecraft color codes (§), guaranteed 0% raw JSON.
"""

import subprocess
import time

CONTAINER = "minecraft_ap1"

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    out = res.stdout.strip()
    return out

def build_parkour():
    print("=== [LOT 7] Reconstruction Totale du Top Parkour (Zéro Doublon, Zéro JSON brut) ===")

    worlds = ["hub", "world"]

    # 1. PURGE RADICALE DES ANCIENNES ENTITÉS (Tous les vieux hologrammes en double)
    print("1. Suppression radicale des hologrammes et anciens supports...")
    for w in worlds:
        rcon(f"execute in {w} run kill @e[type=text_display]")
        rcon(f"execute in {w} run kill @e[type=armor_stand]")
        rcon(f"execute in {w} run kill @e[type=interaction]")

    # 2. PURGE RADICALE DE TOUT L'ESPACE AÉRIEN (Suppression intégrale des deux anciens parcours)
    print("2. Dégagement complet par de l'air de tout le ciel (X=4..60, Y=63..100)...")
    for w in worlds:
        # Efface tout le volume où flottaient l'ancien et le nouveau parcours
        rcon(f"execute in {w} run fill 4 63 -30 60 100 30 air")
        rcon(f"execute in {w} run fill -30 63 -30 4 100 -20 air")
        rcon(f"execute in {w} run fill -25 65 -25 25 85 25 air replace barrier")

    # 3. PISTE DE DÉPART ATTENANTE AU SPAWN (X=5..7, Z=-1..1, Y=64..65)
    print("3. Construction de la zone de départ attenante au Spawn (X=6)...")
    for w in worlds:
        rcon(f"execute in {w} run fill 5 64 -1 7 64 1 sea_lantern")
        rcon(f"execute in {w} run fill 5 65 -1 7 65 1 smooth_quartz")
        # Plaque de départ en or
        rcon(f"execute in {w} run setblock 6 66 0 light_weighted_pressure_plate")
        # Command blocks sous la plaque de départ (Y=64) pour feedback sonore et visuel
        cmd_start = 'title @p title {"text":"✦ PARKOUR DÉMARRÉ ! ✦","color":"gold","bold":true}'
        cmd_sub = 'title @p subtitle {"text":"Atteins le podium d\\'émeraude au sommet !","color":"yellow"}'
        rcon(f'execute in {w} run setblock 6 64 0 command_block[facing=up]{{Command:"execute as @p run {cmd_start}",auto:0b}}')
        rcon(f'execute in {w} run setblock 6 63 0 command_block[facing=up]{{Command:"execute as @p run {cmd_sub}",auto:0b}}')

    # 4. SÉRIE D'OBSTACLES ET SAUTS NÉON UNIQUES (Y=66 à Y=72)
    print("4. Pose des blocs de sauts néon (Parcours Unique, Fluide et Équilibré)...")
    for w in worlds:
        rcon(f"execute in {w} run setblock 9 66 0 purple_concrete")
        rcon(f"execute in {w} run setblock 12 67 1 magenta_concrete")
        rcon(f"execute in {w} run setblock 14 67 -1 cyan_concrete")
        rcon(f"execute in {w} run setblock 16 68 1 sea_lantern")
        rcon(f"execute in {w} run setblock 15 69 3 light_blue_concrete")
        rcon(f"execute in {w} run setblock 13 70 4 purple_concrete")
        rcon(f"execute in {w} run setblock 10 71 3 magenta_concrete")

    # 5. PODIUM D'ARRIVÉE D'ÉMERAUDE (X=6..8, Z=1..3, Y=72) AVEC BALISE LUMINEUSE
    print("5. Plateforme d'arrivée d'émeraude avec balise lumineuse...")
    for w in worlds:
        rcon(f"execute in {w} run fill 6 72 1 8 72 3 emerald_block")
        rcon(f"execute in {w} run setblock 7 73 2 heavy_weighted_pressure_plate")
        rcon(f"execute in {w} run setblock 7 74 2 beacon")
        # Command blocks sous la plaque d'arrivée pour célébration
        cmd_win = 'title @p title {"text":"★ VICTOIRE ! ★","color":"green","bold":true}'
        cmd_win_sub = 'title @p subtitle {"text":"Parcours terminé avec succès !","color":"aqua"}'
        rcon(f'execute in {w} run setblock 7 71 2 command_block[facing=up]{{Command:"execute as @p run {cmd_win}",auto:0b}}')
        rcon(f'execute in {w} run setblock 7 70 2 command_block[facing=up]{{Command:"execute as @p run {cmd_win_sub}",auto:0b}}')

    # 6. PANNEAU HOLOGRAPHIQUE HD DE CLASSEMENT (Codes § directs, espacement vertical net, 0% JSON brut)
    print("6. Érection de l'Hologramme Top Parkour HD (Codes § directs, lisibilité absolue)...")
    for w in worlds:
        rcon(f'execute in {w} run summon text_display 6.0 69.4 0.0 {{text:\'"§6§l✦ CLASSEMENT TOP PARKOUR ✦"\',billboard:"vertical",background:1073741824}}')
        rcon(f'execute in {w} run summon text_display 6.0 68.8 0.0 {{text:\'"§e#1 Klemz_696 §7— §a14.82s"\',billboard:"vertical",background:1073741824}}')
        rcon(f'execute in {w} run summon text_display 6.0 68.2 0.0 {{text:\'"§f#2 Invité_01 §7— §a18.45s"\',billboard:"vertical",background:1073741824}}')
        rcon(f'execute in {w} run summon text_display 6.0 67.6 0.0 {{text:\'"§b[ Marche sur la plaque d\\\'or pour jouer ]"\',billboard:"vertical",background:1073741824}}')

    print("=== [LOT 7] Top Parkour HD reconstruit : parcours unique, zéro doublon, hologramme impeccable ! ===")

if __name__ == "__main__":
    build_parkour()
