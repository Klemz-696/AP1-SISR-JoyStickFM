#!/usr/bin/env python3
"""
JoyStick FM - Lot 6: Interactive NPCs and Holographic Floating Labels Setup
Features:
  - Clean styling with orientation (Rotation) facing the central plaza
  - 4 Game Stations: BedWars, Hikabrain, BlockHunt, Rush FunCraft
  - Grand Exit Station: RETOUR AU HUB (interactive villager + portal)
  - Interacted cleanly via JoyStickHub.jar v1.5.0 on right-click
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
    print(f"=== [LOT 6] Déploiement des PNJ Bien Orientés et Interactifs dans '{WORLD}' ===")

    # 1. Purge propre des anciennes entités
    print("1. Nettoyage des anciennes entités...")
    rcon(f"execute in {WORLD} run kill @e[type=villager]")
    rcon(f"execute in {WORLD} run kill @e[type=text_display]")
    rcon(f"execute in {WORLD} run kill @e[type=armor_stand]")

    # 2. PNJ BedWars (Nord, Z = -13.5, regarde vers le Sud : Rotation [180.0f, 0.0f])
    print("2. Borne BedWars (orientée Sud)...")
    rcon(f"execute in {WORLD} run summon villager 0.5 65.0 -13.5 {{NoAI:1b,Silent:1b,Invulnerable:1b,Rotation:[180.0f,0.0f],VillagerData:{{profession:\"weaponsmith\"}},CustomName:'\"§c§l✦ BEDWARS (Duo) ✦\"',CustomNameVisible:1b}}")
    rcon(f"execute in {WORLD} run summon text_display 0.5 67.2 -13.5 {{text:'\"§e[ Clic-droit pour Rejoindre ]\"',billboard:\"vertical\"}}")

    # 3. PNJ Hikabrain (Sud, Z = 13.5, regarde vers le Nord : Rotation [0.0f, 0.0f])
    print("3. Borne Hikabrain (orientée Nord)...")
    rcon(f"execute in {WORLD} run summon villager 0.5 65.0 13.5 {{NoAI:1b,Silent:1b,Invulnerable:1b,Rotation:[0.0f,0.0f],VillagerData:{{profession:\"fletcher\"}},CustomName:'\"§e§l✦ HIKABRAIN (1v1) ✦\"',CustomNameVisible:1b}}")
    rcon(f"execute in {WORLD} run summon text_display 0.5 67.2 13.5 {{text:'\"§e[ Clic-droit pour Défier ]\"',billboard:\"vertical\"}}")

    # 4. PNJ BlockHunt (Est, X = 13.5, regarde vers l'Ouest : Rotation [-90.0f, 0.0f])
    print("4. Borne BlockHunt (orientée Ouest)...")
    rcon(f"execute in {WORLD} run summon villager 13.5 65.0 0.5 {{NoAI:1b,Silent:1b,Invulnerable:1b,Rotation:[-90.0f,0.0f],VillagerData:{{profession:\"librarian\"}},CustomName:'\"§b§l✦ CACHE-CACHE ✦\"',CustomNameVisible:1b}}")
    rcon(f"execute in {WORLD} run summon text_display 13.5 67.2 0.5 {{text:'\"§e[ Clic-droit pour Jouer ]\"',billboard:\"vertical\"}}")

    # 5. PNJ Rush FunCraft (Ouest, X = -13.5, regarde vers l'Est : Rotation [90.0f, 0.0f])
    print("5. Borne Rush FunCraft (orientée Est)...")
    rcon(f"execute in {WORLD} run summon villager -13.5 65.0 0.5 {{NoAI:1b,Silent:1b,Invulnerable:1b,Rotation:[90.0f,0.0f],VillagerData:{{profession:\"armorer\"}},CustomName:'\"§6§l✦ RUSH FUNCRAFT ✦\"',CustomNameVisible:1b}}")
    rcon(f"execute in {WORLD} run summon text_display -13.5 67.2 0.5 {{text:'\"§e[ Clic-droit pour Jouer ]\"',billboard:\"vertical\"}}")

    # 6. Borne RETOUR AU HUB (Sud-Ouest, X = -11.5, Z = 11.5, regarde vers le centre : Rotation [45.0f, 0.0f])
    print("6. Borne Retour au Hub (orientée Centre)...")
    rcon(f"execute in {WORLD} run summon villager -11.5 65.0 11.5 {{NoAI:1b,Silent:1b,Invulnerable:1b,Rotation:[45.0f,0.0f],VillagerData:{{profession:\"cleric\"}},CustomName:'\"§a§l✦ RETOUR AU HUB ✦\"',CustomNameVisible:1b}}")
    rcon(f"execute in {WORLD} run summon text_display -11.5 67.2 11.5 {{text:'\"§e[ Clic-droit pour Téléporter ]\"',billboard:\"vertical\"}}")

    print(f"=== [LOT 6] Bornes interactives correctement orientées et déployées ! ===")

if __name__ == "__main__":
    setup_npcs()
