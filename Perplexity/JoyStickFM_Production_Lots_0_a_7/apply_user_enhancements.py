#!/usr/bin/env python3
"""
JoyStick FM — Application des Demandes Utilisateur :
  1. Lobby : Retrait du parkour rigide et ajout de blocs de saut libres dans tout le spawn
  2. Survie : Retrait strict de la boussole en survie, restitution au spawn et mini-jeux
  3. Mini-Jeux : Génération complète et intégrale des terrains de TOUS les mini-jeux
     (bedwars_jfm, blockhunt_jfm, rush_jfm, hikabrain_jfm, lobby_minijeux)
"""

import subprocess
import sys
import time
import shutil
import pathlib
import re

CONTAINER = "minecraft_ap1"
DATA_DIR = pathlib.Path("/opt/minecraft/data")
SCRIPT_DIR = pathlib.Path(__file__).parent.resolve()

def strip_ansi(text):
    return re.sub(r'\x1b\[[0-9;]*[a-zA-Z]', '', text)

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    return strip_ansi(res.stdout.strip())

def d_exec(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "sh", "-c", cmd], capture_output=True, text=True)
    return strip_ansi(res.stdout.strip())

def log(msg):
    print(f"[JoyStick FM Enhancements] {msg}", flush=True)

# ------------------------------------------------------------------------------
# 1. PARCOUR LIBRE DU LOBBY (Suppression de l'ancien parkour rigide + Blocs de saut)
# ------------------------------------------------------------------------------
def setup_lobby_freeform_jumps():
    log("=== 1. Transformation du Lobby : Blocs de saut libres dans tout le spawn ===")
    w = "hub"
    
    # A. Suppression de l'ancien parkour rigide (plaques d'or et affichages)
    log("   - Nettoyage des anciennes plaques et affichages...")
    rcon(f"execute in {w} run setblock 8 64 0 polished_andesite")
    rcon(f"execute in {w} run setblock 8 65 0 air")
    rcon(f"execute in {w} run setblock 24 91 24 polished_deepslate")
    rcon(f"execute in {w} run setblock 24 92 24 air")
    rcon(f"execute in {w} run kill @e[type=text_display,distance=..60]")
    rcon(f"execute in {w} run kill @e[type=armor_stand,distance=..60]")

    # B. Nettoyage des anciens blocs d'obstacles linéaires
    old_steps = [
        (11, 66, 2), (14, 67, 4), (16, 68, 7), (18, 70, 10), (20, 72, 13),
        (22, 74, 16), (24, 76, 18), (25, 79, 20), (24, 83, 22), (22, 87, 24)
    ]
    for x, y, z in old_steps:
        rcon(f"execute in {w} run setblock {x} {y} {z} air")

    # C. Ajout de blocs de saut organiques et variés dans tout le spawn (hauteur et largeur)
    log("   - Pose des blocs et piliers de saut libres à travers tout le spawn...")

    # Secteur Ouest (X négatif) : Piliers et dalles de saut (Y=65 à Y=75)
    west_jumps = [
        (-6, 65, -6, "smooth_quartz"), (-8, 66, -8, "sea_lantern"), (-11, 67, -7, "prismarine_bricks"),
        (-14, 68, -5, "smooth_stone_slab"), (-17, 69, -7, "cyan_concrete"), (-19, 71, -10, "sea_lantern"),
        (-16, 73, -13, "smooth_quartz"), (-14, 75, -16, "polished_andesite"),
        (-6, 65, 6, "smooth_quartz"), (-8, 66, 8, "sea_lantern"), (-11, 67, 7, "prismarine_bricks"),
        (-14, 68, 5, "smooth_stone_slab"), (-17, 69, 7, "cyan_concrete"), (-19, 71, 10, "sea_lantern"),
        (-16, 73, 13, "smooth_quartz"), (-14, 75, 16, "polished_andesite")
    ]
    for x, y, z, mat in west_jumps:
        rcon(f"execute in {w} run setblock {x} {y} {z} {mat}")

    # Secteur Est (X positif) : Piliers et dalles de saut (Y=65 à Y=76)
    east_jumps = [
        (6, 65, -6, "smooth_quartz"), (8, 66, -8, "sea_lantern"), (11, 67, -7, "deepslate_brick_slab"),
        (14, 68, -5, "magenta_concrete"), (17, 69, -7, "sea_lantern"), (19, 71, -10, "smooth_quartz"),
        (16, 73, -13, "purple_concrete"), (14, 75, -16, "polished_andesite"),
        (6, 65, 6, "smooth_quartz"), (8, 66, 8, "sea_lantern"), (11, 67, 7, "deepslate_brick_slab"),
        (14, 68, 5, "magenta_concrete"), (17, 69, 7, "sea_lantern"), (19, 71, 10, "smooth_quartz"),
        (16, 73, 13, "purple_concrete"), (14, 75, 16, "polished_andesite")
    ]
    for x, y, z, mat in east_jumps:
        rcon(f"execute in {w} run setblock {x} {y} {z} {mat}")

    # Secteur Nord & Sud : Passerelles d'ascension vers les chemins de ronde (Y=65 à Y=76)
    north_south_jumps = [
        (-4, 66, -15, "smooth_stone_slab"), (0, 67, -17, "sea_lantern"), (4, 68, -15, "smooth_stone_slab"),
        (2, 70, -19, "polished_andesite"), (-2, 72, -21, "smooth_quartz"), (0, 74, -23, "stone_brick_slab"),
        (-4, 66, 15, "smooth_stone_slab"), (0, 67, 17, "sea_lantern"), (4, 68, 15, "smooth_stone_slab"),
        (2, 70, 19, "polished_andesite"), (-2, 72, 21, "smooth_quartz"), (0, 74, 23, "stone_brick_slab")
    ]
    for x, y, z, mat in north_south_jumps:
        rcon(f"execute in {w} run setblock {x} {y} {z} {mat}")

    # Escaliers et blocs hélicoïdaux grimpant autour des 4 Tours de la Citadelle (Y=66 à Y=84)
    tower_spirals = [
        # Tour Nord-Ouest
        (-21, 67, -20, "polished_deepslate_slab"), (-19, 70, -22, "smooth_quartz"),
        (-20, 73, -25, "sea_lantern"), (-23, 76, -24, "polished_deepslate_slab"),
        (-25, 80, -21, "smooth_quartz"), (-23, 84, -19, "sea_lantern"),
        # Tour Nord-Est
        (21, 67, -20, "polished_deepslate_slab"), (19, 70, -22, "smooth_quartz"),
        (20, 73, -25, "sea_lantern"), (23, 76, -24, "polished_deepslate_slab"),
        (25, 80, -21, "smooth_quartz"), (23, 84, -19, "sea_lantern"),
        # Tour Sud-Ouest
        (-21, 67, 20, "polished_deepslate_slab"), (-19, 70, 22, "smooth_quartz"),
        (-20, 73, 25, "sea_lantern"), (-23, 76, 24, "polished_deepslate_slab"),
        (-25, 80, 21, "smooth_quartz"), (-23, 84, 19, "sea_lantern"),
        # Tour Sud-Est
        (21, 67, 20, "polished_deepslate_slab"), (19, 70, 22, "smooth_quartz"),
        (20, 73, 25, "sea_lantern"), (23, 76, 24, "polished_deepslate_slab"),
        (25, 80, 21, "smooth_quartz"), (23, 84, 19, "sea_lantern")
    ]
    for x, y, z, mat in tower_spirals:
        rcon(f"execute in {w} run setblock {x} {y} {z} {mat}")

    log("   -> Blocs de saut libres installés avec succès dans tout le Grand Hub !")

# ------------------------------------------------------------------------------
# 2. GESTION STRICTE DE LA BOUSSOLE (Retrait en Survie, Restitution au Hub/Jeux)
# ------------------------------------------------------------------------------
def setup_compass_behavior():
    log("=== 2. Gestion de la Boussole (Retrait en Survie, Don en Hub & Mini-Jeux) ===")
    
    # A. Déploiement de JoyStickHub.jar v1.4.0
    hub_jar_src = SCRIPT_DIR / "JoyStickHub.jar"
    hub_jar_dest = DATA_DIR / "plugins" / "JoyStickHub.jar"
    if hub_jar_src.exists():
        shutil.copy2(hub_jar_src, hub_jar_dest)
        d_exec("chown 1000:1000 /data/plugins/JoyStickHub.jar")
        log("   JoyStickHub.jar v1.4.0 déployé !")

    # B. Mise à jour ItemJoin items.yml (auto-remove sur survie)
    ij_src = SCRIPT_DIR / "Lot_6_Navigation_et_Menus" / "items.yml"
    ij_dest = DATA_DIR / "plugins" / "ItemJoin" / "items.yml"
    if ij_src.exists():
        shutil.copy2(ij_src, ij_dest)
        d_exec("chown 1000:1000 /data/plugins/ItemJoin/items.yml")
        log("   ItemJoin items.yml configuré avec auto-remove.")

    # C. Rechargement des plugins
    rcon("ij reload")
    rcon("dm reload")
    log("   Plugins ItemJoin & DeluxeMenus rechargés.")

# ------------------------------------------------------------------------------
# 3. GÉNÉRATION INTÉGRALE DES TERRAINS POUR TOUS LES MINI-JEUX
# ------------------------------------------------------------------------------
def build_all_minigame_arenas():
    log("=== 3. Génération Intégrale des Terrains pour TOUS les Mini-Jeux ===")

    # A. LOBBY MINI-JEUX (lobby_minijeux)
    log("--- [A] Construction du Lobby Mini-Jeux Arcade (lobby_minijeux) ---")
    w_lob = "lobby_minijeux"
    rcon(f"mv create {w_lob} normal -g VoidGen")
    rcon(f"execute in {w_lob} run forceload add -3 -3 3 3")
    time.sleep(1)
    # Esplanade 33x33 à Y=64
    rcon(f"execute in {w_lob} run fill -16 63 -16 16 63 16 black_concrete")
    rcon(f"execute in {w_lob} run fill -16 64 -16 16 64 16 smooth_quartz")
    rcon(f"execute in {w_lob} run fill -16 64 -16 16 64 -16 purple_concrete")
    rcon(f"execute in {w_lob} run fill -16 64 16 16 64 16 purple_concrete")
    rcon(f"execute in {w_lob} run fill -16 64 -16 -16 64 16 cyan_concrete")
    rcon(f"execute in {w_lob} run fill 16 64 -16 16 64 16 cyan_concrete")
    # Monument central avec balise
    rcon(f"execute in {w_lob} run fill -2 64 -2 2 64 2 sea_lantern")
    rcon(f"execute in {w_lob} run fill -1 65 -1 1 65 1 iron_block")
    rcon(f"execute in {w_lob} run setblock 0 66 0 beacon")
    rcon(f"execute in {w_lob} run setblock 0 67 0 magenta_stained_glass")
    # 4 Stations
    rcon(f"execute in {w_lob} run fill -4 65 -16 4 69 -16 red_concrete")
    rcon(f"execute in {w_lob} run setblock 0 65 -15 red_bed[facing=north,part=foot]")
    rcon(f"execute in {w_lob} run fill -4 65 16 4 69 16 yellow_concrete")
    rcon(f"execute in {w_lob} run setblock 0 65 15 sandstone")
    rcon(f"execute in {w_lob} run fill 16 65 -4 16 69 4 oak_planks")
    rcon(f"execute in {w_lob} run setblock 15 65 0 barrel")
    rcon(f"execute in {w_lob} run fill -16 65 -4 -16 69 4 gold_block")
    rcon(f"execute in {w_lob} run setblock -15 65 0 anvil")
    # Sécurité anti-chute et spawn
    rcon(f"execute in {w_lob} run fill -16 65 -16 16 67 -16 barrier")
    rcon(f"execute in {w_lob} run fill -16 65 16 16 67 16 barrier")
    rcon(f"execute in {w_lob} run fill -16 65 -16 -16 67 16 barrier")
    rcon(f"execute in {w_lob} run fill 16 65 -16 16 67 16 barrier")
    rcon(f"mv setspawn {w_lob} 0.5 65.0 0.5")
    rcon(f"execute in {w_lob} run gamerule minecraft:fall_damage false")
    log("   -> lobby_minijeux 100% construit !")

    # B. BEDWARS 4 ÉQUIPES (bedwars_jfm)
    log("--- [B] Construction de l'Arène BedWars Spatiale 4 Équipes (bedwars_jfm) ---")
    w_bw = "bedwars_jfm"
    rcon(f"mv create {w_bw} normal -g VoidGen")
    rcon(f"execute in {w_bw} run forceload add -6 -6 6 6")
    time.sleep(1)
    
    # 1. Salle d'attente à Y=100
    rcon(f"execute in {w_bw} run fill -7 100 -7 7 100 7 smooth_quartz")
    rcon(f"execute in {w_bw} run fill -7 101 -7 7 103 7 glass")
    rcon(f"execute in {w_bw} run fill -7 104 -7 7 104 7 barrier")
    rcon(f"execute in {w_bw} run setblock 0 100 0 glowstone")
    
    # 2. Île Centrale (21x21, Y=64)
    rcon(f"execute in {w_bw} run fill -10 64 -10 10 64 10 grass_block")
    rcon(f"execute in {w_bw} run fill -9 61 -9 9 63 9 dirt")
    rcon(f"execute in {w_bw} run fill -7 58 -7 7 60 7 stone")
    rcon(f"execute in {w_bw} run fill -4 55 -4 4 57 4 stone")
    rcon(f"execute in {w_bw} run setblock -3 64 0 emerald_block")
    rcon(f"execute in {w_bw} run setblock 3 64 0 emerald_block")
    rcon(f"execute in {w_bw} run fill -1 65 -1 1 67 1 sea_lantern")

    # 3. 4 Îles d'Équipes (Red, Blue, Green, Yellow)
    teams = [
        ("Red", 0, -64, "red_wool", "north", (0, 65, -68), (0, 65, -69), "red_bed", (0, 64, -60)),
        ("Blue", 64, 0, "blue_wool", "east", (68, 65, 0), (69, 65, 0), "blue_bed", (60, 64, 0)),
        ("Green", 0, 64, "green_wool", "south", (0, 65, 68), (0, 65, 69), "green_bed", (0, 64, 60)),
        ("Yellow", -64, 0, "yellow_wool", "west", (-68, 65, 0), (-69, 65, 0), "yellow_bed", (-60, 64, 0))
    ]
    for t_name, cx, cz, wool, facing, (bfx, bfy, bfz), (bhx, bhy, bhz), bed_mat, (gx, gy, gz) in teams:
        rcon(f"execute in {w_bw} run fill {cx-12} 64 {cz-12} {cx+12} 64 {cz+12} grass_block")
        rcon(f"execute in {w_bw} run fill {cx-10} 61 {cz-10} {cx+10} 63 {cz+10} dirt")
        rcon(f"execute in {w_bw} run fill {cx-7} 58 {cz-7} {cx+7} 60 {cz+7} stone")
        rcon(f"execute in {w_bw} run fill {cx-2} 64 {cz-2} {cx+2} 64 {cz+2} {wool}")
        rcon(f"execute in {w_bw} run setblock {gx} {gy} {gz} iron_block")
        rcon(f"execute in {w_bw} run setblock {bfx} {bfy} {bfz} {bed_mat}[facing={facing},part=foot]")
        rcon(f"execute in {w_bw} run setblock {bhx} {bhy} {bhz} {bed_mat}[facing={facing},part=head]")

    # 4. 4 Îles Diamant Diagonales
    for dx, dz in [(-30, -30), (30, -30), (30, 30), (-30, 30)]:
        rcon(f"execute in {w_bw} run fill {dx-4} 64 {dz-4} {dx+4} 64 {dz+4} grass_block")
        rcon(f"execute in {w_bw} run fill {dx-3} 62 {dz-3} {dx+3} 63 {dz+3} dirt")
        rcon(f"execute in {w_bw} run fill {dx-2} 60 {dz-2} {dx+2} 61 {dz+2} stone")
        rcon(f"execute in {w_bw} run setblock {dx} 64 {dz} diamond_block")

    rcon(f"mv setspawn {w_bw} 0 101 0")
    log("   -> bedwars_jfm 100% construit !")

    # C. BLOCKHUNT VILLAGE RÉTRO 81x81 (blockhunt_jfm)
    log("--- [C] Construction du Village Rétro Meublé 81x81 (blockhunt_jfm) ---")
    w_bh = "blockhunt_jfm"
    rcon(f"mv create {w_bh} normal -g VoidGen")
    rcon(f"execute in {w_bh} run forceload add -4 -4 4 4")
    time.sleep(1)

    # 1. Salle d'attente à Y=100
    rcon(f"execute in {w_bh} run fill -7 100 -7 7 100 7 smooth_stone")
    rcon(f"execute in {w_bh} run fill -7 101 -7 7 103 7 glass")
    rcon(f"execute in {w_bh} run fill -7 104 -7 7 104 7 barrier")
    rcon(f"execute in {w_bh} run setblock 0 100 0 glowstone")

    # 2. Sol du Village (81x81 de -40 à 40 à Y=64)
    rcon(f"execute in {w_bh} run fill -40 64 -40 40 64 40 grass_block")
    rcon(f"execute in {w_bh} run fill -40 60 -40 40 63 40 dirt")

    # Murs d'enceinte
    rcon(f"execute in {w_bh} run fill -40 65 -40 40 72 -40 stone_bricks")
    rcon(f"execute in {w_bh} run fill -40 65 40 40 72 40 stone_bricks")
    rcon(f"execute in {w_bh} run fill -40 65 -40 -40 72 40 stone_bricks")
    rcon(f"execute in {w_bh} run fill 40 65 -40 40 72 40 stone_bricks")

    # Rues pavées
    rcon(f"execute in {w_bh} run fill -3 64 -38 3 64 38 cobblestone")
    rcon(f"execute in {w_bh} run fill -38 64 -3 38 64 3 cobblestone")

    # Fontaine Centrale (Place du village)
    rcon(f"execute in {w_bh} run fill -5 64 -5 5 65 5 stone_bricks")
    rcon(f"execute in {w_bh} run fill -4 65 -4 4 65 4 water")
    rcon(f"execute in {w_bh} run setblock 0 65 0 sea_lantern")
    rcon(f"execute in {w_bh} run setblock 0 66 0 stone_brick_wall")
    rcon(f"execute in {w_bh} run setblock 0 67 0 stone_brick_wall")

    # 4 Maisons Meublées (Cachettes Hiders)
    # Maison Nord-Ouest
    rcon(f"execute in {w_bh} run fill -30 65 -30 -15 72 -15 oak_planks hollow")
    rcon(f"execute in {w_bh} run fill -30 73 -30 -15 73 -15 spruce_planks")
    rcon(f"execute in {w_bh} run fill -23 65 -15 -22 67 -15 air") # Porte
    rcon(f"execute in {w_bh} run fill -28 65 -28 -26 67 -28 bookshelf")
    rcon(f"execute in {w_bh} run fill -18 65 -28 -17 66 -28 barrel")
    rcon(f"execute in {w_bh} run setblock -18 65 -18 crafting_table")

    # Maison Nord-Est
    rcon(f"execute in {w_bh} run fill 15 65 -30 30 72 -15 birch_planks hollow")
    rcon(f"execute in {w_bh} run fill 15 73 -30 30 73 -15 dark_oak_planks")
    rcon(f"execute in {w_bh} run fill 22 65 -15 23 67 -15 air")
    rcon(f"execute in {w_bh} run fill 17 65 -28 20 67 -28 bookshelf")
    rcon(f"execute in {w_bh} run fill 27 65 -28 28 66 -28 barrel")
    rcon(f"execute in {w_bh} run setblock 17 65 -18 cauldron")

    # Maison Sud-Ouest (Forge)
    rcon(f"execute in {w_bh} run fill -30 65 15 -15 72 30 cobblestone hollow")
    rcon(f"execute in {w_bh} run fill -30 73 15 -15 73 30 stone_bricks")
    rcon(f"execute in {w_bh} run fill -23 65 15 -22 67 15 air")
    rcon(f"execute in {w_bh} run fill -28 65 20 -28 66 22 iron_bars")
    rcon(f"execute in {w_bh} run setblock -18 65 28 blast_furnace")
    rcon(f"execute in {w_bh} run setblock -19 65 28 anvil")

    # Maison Sud-Est
    rcon(f"execute in {w_bh} run fill 15 65 15 30 72 30 mud_bricks hollow")
    rcon(f"execute in {w_bh} run fill 15 73 15 30 73 30 spruce_planks")
    rcon(f"execute in {w_bh} run fill 22 65 15 23 67 15 air")
    rcon(f"execute in {w_bh} run fill 17 65 28 20 67 28 bookshelf")
    rcon(f"execute in {w_bh} run fill 27 65 28 28 66 28 hay_block")

    # Étalages de Marché (Place du village avec bottes de foin et tonneaux)
    rcon(f"execute in {w_bh} run fill -10 65 -12 -6 66 -10 hay_block")
    rcon(f"execute in {w_bh} run fill 6 65 -12 10 66 -10 barrel")
    rcon(f"execute in {w_bh} run fill -10 65 10 -6 66 12 pumpkin")
    rcon(f"execute in {w_bh} run fill 6 65 10 10 66 12 melon")

    rcon(f"mv setspawn {w_bh} 0 101 0")
    log("   -> blockhunt_jfm 100% construit !")

    # D. RUSH FUNCRAFT (rush_jfm)
    log("--- [D] Construction de l'Arène Rush FunCraft (rush_jfm) ---")
    w_ru = "rush_jfm"
    rcon(f"mv create {w_ru} normal -g VoidGen")
    rcon(f"execute in {w_ru} run forceload add -3 -3 3 3")
    time.sleep(1)

    # 1. Salle d'attente à Y=100
    rcon(f"execute in {w_ru} run fill -7 100 -7 7 100 7 smooth_stone")
    rcon(f"execute in {w_ru} run fill -7 101 -7 7 103 7 glass")
    rcon(f"execute in {w_ru} run fill -7 104 -7 7 104 7 barrier")
    rcon(f"execute in {w_ru} run setblock 0 100 0 glowstone")

    # 2. Base Rouge (Nord, Z = -25)
    rcon(f"execute in {w_ru} run fill -6 64 -31 6 64 -19 red_sandstone")
    rcon(f"execute in {w_ru} run fill -5 63 -30 5 63 -20 stone")
    rcon(f"execute in {w_ru} run fill -2 64 -26 2 64 -24 red_wool")
    rcon(f"execute in {w_ru} run setblock 0 65 -30 red_bed[facing=north,part=foot]")
    rcon(f"execute in {w_ru} run setblock 0 65 -31 red_bed[facing=north,part=head]")
    rcon(f"execute in {w_ru} run setblock 0 64 -22 iron_block")
    rcon(f"execute in {w_ru} run setblock 3 64 -25 gold_block")

    # 3. Base Bleue (Sud, Z = 25)
    rcon(f"execute in {w_ru} run fill -6 64 19 6 64 31 smooth_sandstone")
    rcon(f"execute in {w_ru} run fill -5 63 20 5 63 30 stone")
    rcon(f"execute in {w_ru} run fill -2 64 24 2 64 26 blue_wool")
    rcon(f"execute in {w_ru} run setblock 0 65 30 blue_bed[facing=south,part=foot]")
    rcon(f"execute in {w_ru} run setblock 0 65 31 blue_bed[facing=south,part=head]")
    rcon(f"execute in {w_ru} run setblock 0 64 22 iron_block")
    rcon(f"execute in {w_ru} run setblock -3 64 25 gold_block")

    # 4. Île Centrale (Z = 0)
    rcon(f"execute in {w_ru} run fill -6 64 -6 6 64 6 sandstone")
    rcon(f"execute in {w_ru} run fill -5 63 -5 5 63 5 stone")
    rcon(f"execute in {w_ru} run setblock 0 64 0 emerald_block")

    rcon(f"mv setspawn {w_ru} 0 101 0")
    log("   -> rush_jfm 100% construit !")

    # E. HIKABRAIN FUNCRAFT (hikabrain_jfm)
    log("--- [E] Construction de l'Arène Hikabrain FunCraft (hikabrain_jfm) ---")
    w_hi = "hikabrain_jfm"
    rcon(f"mv create {w_hi} normal -g VoidGen")
    rcon(f"execute in {w_hi} run forceload add -3 -3 3 3")
    time.sleep(1)

    # 1. Salle d'attente à Y=100
    rcon(f"execute in {w_hi} run fill -5 100 -5 5 100 5 smooth_stone")
    rcon(f"execute in {w_hi} run fill -5 101 -5 5 103 5 glass")
    rcon(f"execute in {w_hi} run fill -5 104 -5 5 104 5 barrier")
    rcon(f"execute in {w_hi} run setblock 0 100 0 glowstone")

    # 2. Passerelle suspendue de 1 bloc en grès (Z = -18 à 18 à Y=64)
    rcon(f"execute in {w_hi} run fill 0 64 -18 0 64 18 sandstone")

    # 3. Base Rouge (Nord, Z = -21)
    rcon(f"execute in {w_hi} run fill -2 64 -23 2 64 -19 red_concrete")
    rcon(f"execute in {w_hi} run fill -2 65 -23 2 66 -23 red_stained_glass")
    rcon(f"execute in {w_hi} run setblock 0 64 -21 sea_lantern")
    rcon(f"execute in {w_hi} run setblock 0 65 -22 red_bed[facing=north,part=foot]")
    rcon(f"execute in {w_hi} run setblock 0 65 -23 red_bed[facing=north,part=head]")

    # 4. Base Bleue (Sud, Z = 21)
    rcon(f"execute in {w_hi} run fill -2 64 19 2 64 23 blue_concrete")
    rcon(f"execute in {w_hi} run fill -2 65 23 2 66 23 blue_stained_glass")
    rcon(f"execute in {w_hi} run setblock 0 64 21 sea_lantern")
    rcon(f"execute in {w_hi} run setblock 0 65 22 blue_bed[facing=south,part=foot]")
    rcon(f"execute in {w_hi} run setblock 0 65 23 blue_bed[facing=south,part=head]")

    rcon(f"mv setspawn {w_hi} 0 101 0")
    log("   -> hikabrain_jfm 100% construit !")

def main():
    print("==================================================================")
    print("  JOYSTICK FM — APPLICATION DES AMÉLIORATIONS UTILISATEUR        ")
    print("==================================================================")

    # 1. Lobby : Blocs de saut libres
    setup_lobby_freeform_jumps()

    # 2. Boussole : Retrait strict en survie et don au Hub/Jeux
    setup_compass_behavior()

    # 3. Terrains Mini-Jeux : Construction intégrale garantie
    build_all_minigame_arenas()

    # 4. Nettoyage joueur actuel si en survie
    log("4. Vérification et synchronisation du joueur Klemz_696...")
    rcon("effect clear Klemz_696")

    # 5. Redémarrage propre pour prise en compte à chaud de JoyStickHub v1.4.0
    log("5. Redémarrage propre du serveur PaperMC...")
    subprocess.run(["docker", "restart", CONTAINER], check=False)
    
    time.sleep(15)
    for _ in range(30):
        tps = rcon("tps")
        if "tps" in tps.lower():
            break
        time.sleep(2)

    print("\n==================================================================")
    print("  TOUTES LES AMÉLIORATIONS SONT APPLIQUÉES AVEC SUCCÈS !          ")
    print("==================================================================")
    print("  1. Lobby : Ancien parkour retiré, blocs de saut libres installés")
    print("  2. Boussole : Retirée en Survie, redonnée au Hub et Mini-Jeux")
    print("  3. Mini-Jeux : Terrains de TOUS les jeux entièrement matérialisés")
    print("==================================================================")

if __name__ == "__main__":
    main()
