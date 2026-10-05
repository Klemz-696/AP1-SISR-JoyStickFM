#!/usr/bin/env python3
"""
JoyStick FM - Lot 5: Autonomous Hikabrain Game Engine (Decision D4)
Faithful to historical FunCraft 2016-2018:
  - 1v1 duel on 1-block wide sandstone bridge
  - Objective: touch / click the opponent bed to score 1 point
  - First team to 5 points wins the match
  - Instant round reset (bridge rebuild, player teleport back, kit renewal)
  - Kit: Iron sword, Knockback II stick, 64 sandstone, 2 golden apples
"""

import subprocess
import sys
import time

CONTAINER = "minecraft_ap1"
WORLD = "hikabrain_jfm"

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    return res.stdout.strip()

def init_scoreboards():
    """Initialise les scoreboards et équipes pour Hikabrain."""
    print("[HIKABRAIN] Initialisation des scoreboards...")
    rcon("scoreboard objectives add hika_red dummy \"Score Rouge\"")
    rcon("scoreboard objectives add hika_blue dummy \"Score Bleu\"")
    rcon("team add HikaRed \"Rouge\"")
    rcon("team add HikaBlue \"Bleu\"")
    rcon("team modify HikaRed color red")
    rcon("team modify HikaBlue color blue")

def reset_round():
    """Réinitialise la passerelle et remet les kits aux joueurs."""
    # 1. Reconstruction du pont de 1 bloc
    rcon(f"execute in {WORLD} run fill 0 64 -18 0 64 18 sandstone")
    # 2. Nettoyage des blocs posés au-dessus du pont
    rcon(f"execute in {WORLD} run fill -5 65 -18 5 80 18 air replace sandstone")
    # 3. Téléportation aux spawns de base
    rcon(f"execute in {WORLD} run tp @a[team=HikaRed] 0.5 65.0 -21.5 180 0")
    rcon(f"execute in {WORLD} run tp @a[team=HikaBlue] 0.5 65.0 21.5 0 0")
    # 4. Distribution du kit officiel FunCraft
    give_kit("@a[team=HikaRed]")
    give_kit("@a[team=HikaBlue]")

def give_kit(target):
    """Attribue le kit Hikabrain officiel."""
    rcon(f"clear {target}")
    rcon(f"give {target} iron_sword{{Unbreakable:1b}} 1")
    rcon(f"give {target} stick{{Enchantments:[{{id:\"minecraft:knockback\",lvl:2s}}],display:{{Name:'{{\"text\":\"✦ Bâton Knockback ✦\",\"color\":\"gold\"}}'}}}} 1")
    rcon(f"give {target} sandstone 64")
    rcon(f"give {target} golden_apple 2")
    rcon(f"effect give {target} saturation 1 255 true")

def check_scoring():
    """Vérifie la détection de contact avec les lits."""
    # Rouge touchant le lit Bleu (Z ~ 22)
    red_score = rcon(f"execute in {WORLD} if entity @a[team=HikaRed,x=0,y=65,z=22,distance=..1.8]")
    if "Passed" in red_score or "Test passed" in red_score:
        rcon("scoreboard players add Red hika_red 1")
        rcon(f"title @a[world={WORLD}] title {{\"text\":\"POINT ROUGE !\",\"color\":\"red\",\"bold\":true}}")
        rcon(f"playsound minecraft:ui.toast.challenge_complete master @a[world={WORLD}]")
        time.sleep(1)
        reset_round()

    # Bleu touchant le lit Rouge (Z ~ -22)
    blue_score = rcon(f"execute in {WORLD} if entity @a[team=HikaBlue,x=0,y=65,z=-22,distance=..1.8]")
    if "Passed" in blue_score or "Test passed" in blue_score:
        rcon("scoreboard players add Blue hika_blue 1")
        rcon(f"title @a[world={WORLD}] title {{\"text\":\"POINT BLEU !\",\"color\":\"blue\",\"bold\":true}}")
        rcon(f"playsound minecraft:ui.toast.challenge_complete master @a[world={WORLD}]")
        time.sleep(1)
        reset_round()

def setup_command_block_loop():
    """Déploie les blocs de commande répétitifs autonomes dans le monde pour exécution continue."""
    print("[HIKABRAIN] Déploiement des blocs de commande autonomes...")
    # Détection Rouge sur lit Bleu
    cb1 = f'execute in {WORLD} as @a[team=HikaRed,x=0,y=65,z=22,distance=..1.8] run function hikabrain:score_red'
    rcon(f'execute in {WORLD} run setblock 0 60 0 repeating_command_block[facing=up]{{Command:"{cb1}",auto:1b}}')
    print("[HIKABRAIN] Moteur Hikabrain configuré !")

if __name__ == "__main__":
    init_scoreboards()
    setup_command_block_loop()
    reset_round()
