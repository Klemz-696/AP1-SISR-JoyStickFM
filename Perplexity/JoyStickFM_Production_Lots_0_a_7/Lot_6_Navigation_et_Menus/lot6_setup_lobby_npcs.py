#!/usr/bin/env python3
"""
JoyStick FM - Lot 6: Interactive NPCs and Signs Setup in lobby_minijeux
Spawns interactive villagers / armor stands with floating text for quick match joins:
  - North: BedWars (4x2)
  - South: Hikabrain (1v1)
  - East: BlockHunt (Retro Village)
  - West: Rush FunCraft (1v1 / 2v2)
"""

import subprocess
import sys

CONTAINER = "minecraft_ap1"
WORLD = "lobby_minijeux"

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    return res.stdout.strip()

def setup_npcs():
    print(f"=== [LOT 6] Configuration des PNJ et Bornes d'accès dans '{WORLD}' ===")

    # 1. PNJ BedWars (Nord, Z = -13)
    print("1. Borne BedWars...")
    rcon(f"execute in {WORLD} run summon villager 0.5 65.0 -13.5 {{NoAI:1b,Silent:1b,CustomName:'{{\"text\":\"✦ BEDWARS (4v4) ✦\",\"color\":\"red\",\"bold\":true}}',CustomNameVisible:1b}}")

    # 2. PNJ Hikabrain (Sud, Z = 13)
    print("2. Borne Hikabrain...")
    rcon(f"execute in {WORLD} run summon villager 0.5 65.0 13.5 {{NoAI:1b,Silent:1b,CustomName:'{{\"text\":\"✦ HIKABRAIN (1v1) ✦\",\"color\":\"yellow\",\"bold\":true}}',CustomNameVisible:1b}}")

    # 3. PNJ BlockHunt (Est, X = 13)
    print("3. Borne BlockHunt...")
    rcon(f"execute in {WORLD} run summon villager 13.5 65.0 0.5 {{NoAI:1b,Silent:1b,CustomName:'{{\"text\":\"✦ BLOCKHUNT ✦\",\"color\":\"aqua\",\"bold\":true}}',CustomNameVisible:1b}}")

    # 4. PNJ Rush FunCraft (Ouest, X = -13)
    print("4. Borne Rush FunCraft...")
    rcon(f"execute in {WORLD} run summon villager -13.5 65.0 0.5 {{NoAI:1b,Silent:1b,CustomName:'{{\"text\":\"✦ RUSH FUNCRAFT ✦\",\"color\":\"gold\",\"bold\":true}}',CustomNameVisible:1b}}")

    print(f"=== [LOT 6] Bornes interactives déployées dans '{WORLD}' ! ===")

if __name__ == "__main__":
    setup_npcs()
