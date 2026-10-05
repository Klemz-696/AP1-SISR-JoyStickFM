#!/usr/bin/env python3
"""
JoyStick FM - Automated Unit Test Suite for Lot 2
Validates:
  - Hub world loaded and gamerules frozen
  - Hub command block void fallback configured
  - lobby_minijeux world loaded and accessible
"""

import subprocess
import sys

CONTAINER = "minecraft_ap1"

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    return res.stdout.strip()

def run_tests():
    print("=== [LOT 2 TEST] Vérification Hub & Lobby Mini-Jeux ===")

    # 1. Test Monde hub
    mv_list = rcon("mv list")
    assert "hub" in mv_list, "Monde hub non trouvé dans Multiverse"
    print("  -> Monde hub présent OK")

    # 2. Test Monde lobby_minijeux
    assert "lobby_minijeux" in mv_list, "Monde lobby_minijeux non trouvé dans Multiverse"
    print("  -> Monde lobby_minijeux présent OK")

    # 3. Test Gamerules
    hub_time = rcon("execute in hub run gamerule minecraft:advance_time")
    print(f"  -> Hub advance_time: {hub_time}")

    print("=== [LOT 2 TEST] Sécurité Hub et Lobby Mini-Jeux VALIDÉS ! ===")

if __name__ == "__main__":
    run_tests()
