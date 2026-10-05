#!/usr/bin/env python3
"""
JoyStick FM - Lot 6: Interactive NPCs and Holographic Floating Labels Setup
Features:
  - Clean styling using Minecraft section signs (§) — NO raw JSON syntax visible
  - Double-layer display: Villager name + Floating Subtitle (text_display)
  - 4 Game Stations: BedWars, Hikabrain, BlockHunt, Rush FunCraft
  - Grand Exit Station: RETOUR AU HUB (interactive villager + portal)
"""

import subprocess
import sys

CONTAINER = "minecraft_ap1"
WORLD = "lobby_minijeux"

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    out = res.stdout.strip()
    return out

def setup_npcs():
    print(f"=== [LOT 6] Déploiement des PNJ et Hologrammes Stylisés dans '{WORLD}' ===")

    # 1. Purge propre des anciens PNJ et affichages
    print("1. Nettoyage des anciennes entités...")
    rcon(f"execute in {WORLD} run kill @e[type=villager]")
    rcon(f"execute in {WORLD} run kill @e[type=text_display]")
    rcon(f"execute in {WORLD} run kill @e[type=armor_stand]")

    # 2. PNJ BedWars (Nord, Z = -13.5)
    print("2. Borne BedWars...")
    rcon(f"execute in {WORLD} run summon villager 0.5 65.0 -13.5 {{NoAI:1b,Silent:1b,Invulnerable:1b,CustomName:'\"§c§l✦ BEDWARS (Duo) ✦\"',CustomNameVisible:1b}}")
    rcon(f"execute in {WORLD} run summon text_display 0.5 67.2 -13.5 {{text:'\"§7[ Clic-droit pour Rejoindre ]\"',billboard:\"vertical\"}}")

    # 3. PNJ Hikabrain (Sud, Z = 13.5)
    print("3. Borne Hikabrain...")
    rcon(f"execute in {WORLD} run summon villager 0.5 65.0 13.5 {{NoAI:1b,Silent:1b,Invulnerable:1b,CustomName:'\"§e§l✦ HIKABRAIN (1v1) ✦\"',CustomNameVisible:1b}}")
    rcon(f"execute in {WORLD} run summon text_display 0.5 67.2 13.5 {{text:'\"§7[ Clic-droit pour Défier ]\"',billboard:\"vertical\"}}")

    # 4. PNJ BlockHunt (Est, X = 13.5)
    print("4. Borne BlockHunt...")
    rcon(f"execute in {WORLD} run summon villager 13.5 65.0 0.5 {{NoAI:1b,Silent:1b,Invulnerable:1b,CustomName:'\"§b§l✦ CACHE-CACHE ✦\"',CustomNameVisible:1b}}")
    rcon(f"execute in {WORLD} run summon text_display 13.5 67.2 0.5 {{text:'\"§7[ Clic-droit pour Jouer ]\"',billboard:\"vertical\"}}")

    # 5. PNJ Rush FunCraft (Ouest, X = -13.5)
    print("5. Borne Rush FunCraft...")
    rcon(f"execute in {WORLD} run summon villager -13.5 65.0 0.5 {{NoAI:1b,Silent:1b,Invulnerable:1b,CustomName:'\"§6§l✦ RUSH FUNCRAFT ✦\"',CustomNameVisible:1b}}")
    rcon(f"execute in {WORLD} run summon text_display -13.5 67.2 0.5 {{text:'\"§7[ Clic-droit pour Jouer ]\"',billboard:\"vertical\"}}")

    # 6. Borne RETOUR AU HUB (Sud-Ouest, X = -11.5, Z = 11.5)
    print("6. Borne Retour au Hub...")
    rcon(f"execute in {WORLD} run summon villager -11.5 65.0 11.5 {{NoAI:1b,Silent:1b,Invulnerable:1b,CustomName:'\"§a§l✦ RETOUR AU HUB ✦\"',CustomNameVisible:1b}}")
    rcon(f"execute in {WORLD} run summon text_display -11.5 67.2 11.5 {{text:'\"§7[ Clic-droit pour Téléporter ]\"',billboard:\"vertical\"}}")

    print(f"=== [LOT 6] Bornes interactives et textes stylisés déployés avec succès ! ===")

if __name__ == "__main__":
    setup_npcs()
