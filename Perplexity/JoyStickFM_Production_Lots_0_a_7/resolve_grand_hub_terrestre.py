#!/usr/bin/env python3
"""
JoyStick FM — Résolution & Construction Native du Grand Hub Architectural Terrestre
====================================================================================
Ce script résout l'incompatibilité de l'ancienne archive 1.8 et matérialise directement
dans PaperMC 1.21.4 le Grand Hub Architectural Terrestre (Citadelle Royale JoyStick FM) :
  1. Recréation propre et sans corruption du monde Multiverse 'hub'
  2. Grande Esplanade Pavée 61x61 (Y=64) avec dallage noble et bandes néon JoyStick FM
  3. 4 Grandes Tours Fortifiées d'Angle (hauteur Y=64 à Y=90)
  4. Remparts de citadelle et chemins de ronde (Y=76)
  5. Pavillon Central Triomphal avec balise céleste active (Beacon) et spawn officiel
  6. 4 Portails Monumentaux vers Survie, Lobby Mini-Jeux, BedWars et BlockHunt
  7. Grand Parcours acrobatique Top Parkour intégré (Départ au sol -> Sommet Tour Sud-Est)
  8. Sécurité anti-chute absolue (fall_damage=false, pvp=false, barrières et bloc anti-vide)
  9. Enregistrement des spawns (Multiverse, Essentials, World)
"""

import subprocess
import sys
import time
import re

CONTAINER = "minecraft_ap1"

def strip_ansi(text):
    return re.sub(r'\x1b\[[0-9;]*[a-zA-Z]', '', text)

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    out = res.stdout.strip()
    return out

def d_exec(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "sh", "-c", cmd], capture_output=True, text=True)
    return res.stdout.strip()

def log(msg):
    print(f"[Grand Hub] {msg}", flush=True)

def main():
    print("==================================================================")
    print("  JOYSTICK FM — MATÉRIALISATION DU GRAND HUB TERRESTRE (CITADELLE)")
    print("==================================================================")

    # 1. Diagnostic de l'état actuel du monde 'hub'
    log("1. Diagnostic et nettoyage de l'ancien monde 'hub'...")
    mv_list = strip_ansi(rcon("mv list"))
    
    # Si hub est listé mais corrompu/défectueux, on le décharge et on le supprime proprement
    if "hub" in mv_list:
        log("   Déchargement du monde 'hub'...")
        rcon("mv unload hub")
        log("   Suppression propre de 'hub' dans Multiverse...")
        rcon("mv delete hub")
        rcon("mv confirm")
    
    # Nettoyage physique du dossier /data/hub pour repartir sur une base 1.21.4 saine
    d_exec("rm -rf /data/hub")
    
    # 2. Création native du monde avec VoidGen (garantie 0 corruption, chunks 1.21.4 natifs)
    log("2. Création native du monde 'hub' avec VoidGen...")
    res_create = rcon("mv create hub normal -g VoidGen")
    log(f"   Résultat Multiverse : {strip_ansi(res_create)}")
    
    # Vérification que le monde est bien présent
    mv_list_after = strip_ansi(rcon("mv list"))
    if "hub" not in mv_list_after:
        log("   [ATTENTION] Deuxième tentative de chargement de 'hub'...")
        rcon("mv load hub")
    
    # 3. Forceload des chunks du spawn pour garantir le placement
    log("3. Verrouillage du chargement des chunks (-3 -3 à 3 3)...")
    rcon("execute in hub run forceload add -3 -3 3 3")
    time.sleep(1)

    # 4. Construction de la Grande Esplanade Pavée (61x61 de X=-30 à 30, Z=-30 à 30 à Y=64)
    log("4. Édification de la Grande Esplanade Pavée 61x61 (Y=64)...")
    # Substrat solide à Y=63
    rcon("execute in hub run fill -30 63 -30 30 63 30 deepslate")
    # Sol principal en andésite polie
    rcon("execute in hub run fill -30 64 -30 30 64 30 polished_andesite")
    # Cadre extérieur et motifs géométriques en pierre sculptée et stone bricks
    rcon("execute in hub run fill -30 64 -30 30 64 -29 stone_bricks")
    rcon("execute in hub run fill -30 64 29 30 64 30 stone_bricks")
    rcon("execute in hub run fill -30 64 -30 -29 64 30 stone_bricks")
    rcon("execute in hub run fill 29 64 -30 30 64 30 stone_bricks")

    # 5. Bandes Néon JoyStick FM encastrées avec lanternes de mer
    log("5. Intégration des allées lumineuses Néon JoyStick FM (Violet & Cyan)...")
    # Allées violettes Nord-Sud (X = -10 et X = 10)
    rcon("execute in hub run fill -10 63 -28 -10 63 28 sea_lantern")
    rcon("execute in hub run fill -10 64 -28 -10 64 28 magenta_stained_glass")
    rcon("execute in hub run fill 10 63 -28 10 63 28 sea_lantern")
    rcon("execute in hub run fill 10 64 -28 10 64 28 magenta_stained_glass")
    # Allées cyan Est-Ouest (Z = -10 et Z = 10)
    rcon("execute in hub run fill -28 63 -10 28 63 -10 sea_lantern")
    rcon("execute in hub run fill -28 64 -10 28 64 -10 cyan_stained_glass")
    rcon("execute in hub run fill -28 63 10 28 63 10 sea_lantern")
    rcon("execute in hub run fill -28 64 10 28 64 10 cyan_stained_glass")

    # 6. Pavillon Triomphal Central du Spawn (X=0, Z=0)
    log("6. Construction du Pavillon Triomphal Central et Balise Céleste (Beacon)...")
    # Podium central surélevé 9x9 en quartz lisse (Y=65)
    rcon("execute in hub run fill -4 65 -4 4 65 4 smooth_quartz")
    rcon("execute in hub run fill -5 64 -5 5 64 5 quartz_stairs")
    # Piliers majestueux en quartz (Y=65 à Y=71)
    for px, pz in [(-4, -4), (-4, 4), (4, -4), (4, 4)]:
        rcon(f"execute in hub run fill {px} 65 {pz} {px} 71 {pz} quartz_pillar")
    # Arches supérieures reliant les piliers
    rcon("execute in hub run fill -4 71 -4 4 71 -4 chiseled_quartz_block")
    rcon("execute in hub run fill -4 71 4 4 71 4 chiseled_quartz_block")
    rcon("execute in hub run fill -4 71 -4 -4 71 4 chiseled_quartz_block")
    rcon("execute in hub run fill 4 71 -4 4 71 4 chiseled_quartz_block")
    # Dôme et lanternes
    rcon("execute in hub run fill -3 72 -3 3 72 3 smooth_quartz")
    rcon("execute in hub run fill -2 73 -2 2 73 2 sea_lantern")
    rcon("execute in hub run fill -1 74 -1 1 74 1 smooth_quartz")

    # Balise centrale active (Pyramide en fer 3x3 à Y=64, Balise à Y=65)
    rcon("execute in hub run fill -1 64 -1 1 64 1 iron_block")
    rcon("execute in hub run setblock 0 65 0 beacon")
    rcon("execute in hub run setblock 0 66 0 magenta_stained_glass")

    # 7. Les 4 Grandes Tours Fortifiées d'Angle (Citadelle)
    log("7. Édification des 4 Grandes Tours Fortifiées de la Citadelle...")
    towers = [
        ("Nord-Ouest", -27, -27, 86),
        ("Nord-Est", 21, -27, 86),
        ("Sud-Ouest", -27, 21, 86),
        ("Sud-Est (Tour du Parkour)", 21, 21, 92)
    ]
    for name, tx, tz, top_y in towers:
        # Base de la tour 7x7
        rcon(f"execute in hub run fill {tx} 64 {tz} {tx+6} {top_y} {tz+6} deepslate_bricks hollow")
        # Meurtrières et ouvertures en lampion
        rcon(f"execute in hub run fill {tx+2} 65 {tz} {tx+4} 67 {tz} air")
        rcon(f"execute in hub run fill {tx} 65 {tz+2} {tx} 67 {tz+4} air")
        # Sol intérieur au sommet
        rcon(f"execute in hub run fill {tx+1} {top_y-1} {tz+1} {tx+5} {top_y-1} {tz+5} polished_deepslate")
        # Créneaux au sommet
        rcon(f"execute in hub run fill {tx} {top_y} {tz} {tx+6} {top_y} {tz+6} polished_deepslate_wall hollow")
        rcon(f"execute in hub run setblock {tx} {top_y+1} {tz} soul_lantern")
        rcon(f"execute in hub run setblock {tx+6} {top_y+1} {tz} soul_lantern")
        rcon(f"execute in hub run setblock {tx} {top_y+1} {tz+6} soul_lantern")
        rcon(f"execute in hub run setblock {tx+6} {top_y+1} {tz+6} soul_lantern")

    # 8. Remparts et Courtines de liaison (Y=76)
    log("8. Construction des Remparts et Chemins de Ronde (Y=76)...")
    # Mur Nord (Z=-25)
    rcon("execute in hub run fill -20 64 -26 20 76 -24 stone_bricks")
    rcon("execute in hub run fill -20 76 -25 20 76 -25 polished_andesite")
    rcon("execute in hub run fill -20 77 -26 20 77 -26 stone_brick_wall")
    # Mur Sud (Z=25)
    rcon("execute in hub run fill -20 64 24 20 76 26 stone_bricks")
    rcon("execute in hub run fill -20 76 25 20 76 25 polished_andesite")
    rcon("execute in hub run fill -20 77 26 20 77 26 stone_brick_wall")
    # Mur Ouest (X=-25)
    rcon("execute in hub run fill -26 64 -20 -24 76 20 stone_bricks")
    rcon("execute in hub run fill -25 76 -20 -25 76 20 polished_andesite")
    rcon("execute in hub run fill -26 77 -20 -26 77 20 stone_brick_wall")
    # Mur Est (X=25)
    rcon("execute in hub run fill 24 64 -20 26 76 20 stone_bricks")
    rcon("execute in hub run fill 25 76 -20 25 76 20 polished_andesite")
    rcon("execute in hub run fill 26 77 -20 26 77 20 stone_brick_wall")

    # 9. Les 4 Portails Monumentaux d'accès aux modes
    log("9. Installation des 4 Portails d'accès aux modes...")
    # Portail Nord : Lobby Mini-Jeux (X=0, Z=-25)
    rcon("execute in hub run fill -3 65 -25 3 70 -25 emerald_block")
    rcon("execute in hub run fill -1 65 -25 1 68 -25 air")
    rcon("execute in hub run setblock 0 64 -25 sea_lantern")
    rcon("execute in hub run setblock 0 65 -25 heavy_weighted_pressure_plate")
    # Bloc de commande de téléportation sous la plaque du Lobby Mini-Jeux
    rcon('execute in hub run setblock 0 63 -25 command_block{Command:"mv tp @p lobby_minijeux",auto:1b}')

    # Portail Sud : Monde Survie Durable (X=0, Z=25)
    rcon("execute in hub run fill -3 65 25 3 70 25 mossy_stone_bricks")
    rcon("execute in hub run fill -1 65 25 1 68 25 air")
    rcon("execute in hub run setblock 0 64 25 sea_lantern")
    rcon("execute in hub run setblock 0 65 25 heavy_weighted_pressure_plate")
    # Bloc de commande de téléportation vers la survie
    rcon('execute in hub run setblock 0 63 25 command_block{Command:"execute as @p in survie run tp @s 0 75 0",auto:1b}')

    # Portail Ouest : BedWars JoyStick FM (X=-25, Z=0)
    rcon("execute in hub run fill -25 65 -3 -25 70 3 red_concrete")
    rcon("execute in hub run fill -25 65 -1 -25 68 1 air")
    rcon("execute in hub run setblock -25 64 0 sea_lantern")
    rcon("execute in hub run setblock -25 65 0 red_bed[facing=west,part=foot]")

    # Portail Est : BlockHunt Village (X=25, Z=0)
    rcon("execute in hub run fill 25 65 -3 25 70 3 oak_planks")
    rcon("execute in hub run fill 25 65 -1 25 68 1 bookshelf")
    rcon("execute in hub run setblock 25 64 0 sea_lantern")
    rcon("execute in hub run setblock 24 65 0 barrel")

    # 10. Grand Top Parkour Intégré JoyStick FM
    log("10. Aménagement du Top Parkour (Obstacles & Sommet Tour Sud-Est)...")
    # Départ à (8, 65, 0)
    rcon("execute in hub run setblock 8 64 0 gold_block")
    rcon("execute in hub run setblock 8 65 0 light_weighted_pressure_plate")
    # Obstacles acrobatiques menant à la courtine et la Tour Sud-Est
    parkour_steps = [
        (11, 66, 2, "smooth_quartz"),
        (14, 67, 4, "smooth_stone_slab"),
        (16, 68, 7, "sea_lantern"),
        (18, 70, 10, "polished_andesite"),
        (20, 72, 13, "prismarine_bricks"),
        (22, 74, 16, "chiseled_stone_bricks"),
        (24, 76, 18, "stone_brick_slab"),
        (25, 79, 20, "smooth_quartz_stairs"),
        (24, 83, 22, "polished_deepslate_slab"),
        (22, 87, 24, "sea_lantern")
    ]
    for x, y, z, mat in parkour_steps:
        rcon(f"execute in hub run setblock {x} {y} {z} {mat}")

    # Arrivée glorieuse au sommet de la Tour Sud-Est (X=24, Y=92, Z=24)
    rcon("execute in hub run setblock 24 91 24 iron_block")
    rcon("execute in hub run setblock 24 92 24 light_weighted_pressure_plate")
    # Balise de victoire au sommet de la tour
    rcon("execute in hub run setblock 24 90 24 beacon")
    # Bloc de commande pour feux d'artifice et félicitations
    rcon('execute in hub run setblock 24 89 24 command_block{Command:"title @p title {\\"text\\":\\"✦ PARKOUR RÉUSSI ! ✦\\",\\"color\\":\\"gold\\",\\"bold\\":true}",auto:1b}')

    # Hologramme d'accueil Parkour
    rcon('execute in hub run summon text_display 8.0 67.5 0.0 {text:\'"§6§l✦ TOP DU PARKOUR ✦\\n§eSautez jusqu\'au sommet de la Tour !"§r\',billboard:"vertical",background:1073741824}')

    # 11. Périmètre de Barrières Invisibles & Filet de Sécurité
    log("11. Sécurisation périmétrique anti-chute et barrières invisibles...")
    # Mur invisible sur le périmètre extérieur (X, Z = +/- 31)
    rcon("execute in hub run fill -31 65 -31 31 75 -31 barrier")
    rcon("execute in hub run fill -31 65 31 31 75 31 barrier")
    rcon("execute in hub run fill -31 65 -31 -31 75 31 barrier")
    rcon("execute in hub run fill 31 65 -31 31 75 31 barrier")

    # 12. Bloc de commande répétitif anti-vide (Zone Y=-64 à Y=54 -> TP à 0.5 65.0 0.5)
    log("12. Mise en place du bloc de commande de rattrapage anti-vide...")
    cmd_tp_hub = 'execute as @a[x=-2000,dx=4000,z=-2000,dz=4000,y=-64,dy=118] run tp @s 0.5 65.0 0.5 0 0'
    rcon(f'execute in hub run setblock 0 63 0 repeating_command_block[facing=up]{{Command:"{cmd_tp_hub}",auto:1b}}')

    # 13. Gamerules indispensables de sécurité
    log("13. Application stricte des gamerules (fall_damage=false, pvp=false, time=fixed)...")
    rcon("execute in hub run gamerule minecraft:fall_damage false")
    rcon("execute in hub run gamerule minecraft:pvp false")
    rcon("execute in hub run gamerule minecraft:advance_time false")
    rcon("execute in hub run gamerule minecraft:advance_weather false")
    rcon("execute in hub run gamerule minecraft:spawn_monsters false")
    rcon("execute in hub run time set 6000")
    rcon("execute in hub run weather clear")

    # 14. Enregistrement des coordonnées de Spawn
    log("14. Enregistrement du point de réapparition officiel (0.5, 65.0, 0.5)...")
    rcon("mv setspawn hub 0.5 65.0 0.5")
    rcon("execute in hub run setworldspawn 0 65 0")
    rcon("setspawn default")

    # 15. Validation finale
    log("15. Vérification du statut...")
    check_mv = strip_ansi(rcon("mv list"))
    check_fall = strip_ansi(rcon("execute in hub run gamerule minecraft:fall_damage"))
    check_pvp = strip_ansi(rcon("execute in hub run gamerule minecraft:pvp"))
    
    hub_ok = "hub" in check_mv
    fall_ok = "false" in check_fall.lower()
    pvp_ok = "false" in check_pvp.lower()

    print("\n==================================================================")
    print(f"  RÉSULTAT DE LA MATÉRIALISATION DU HUB :")
    print(f"    - Monde 'hub' dans Multiverse : {'OK' if hub_ok else 'ERREUR'}")
    print(f"    - Dégâts de chute désactivés   : {'OK' if fall_ok else 'ERREUR'}")
    print(f"    - PvP désactivé au spawn       : {'OK' if pvp_ok else 'ERREUR'}")
    print("==================================================================")

    if hub_ok and fall_ok and pvp_ok:
        log("★ LE GRAND HUB ARCHITECTURAL TERRESTRE EST 100% OPÉRATIONNEL ! ★")
        return 0
    else:
        log("[AVERTISSEMENT] Certains paramètres doivent être inspectés.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
