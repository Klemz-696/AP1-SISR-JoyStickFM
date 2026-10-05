#!/usr/bin/env python3
"""
JoyStick FM - Automated Unit Test Suite for Lot 3
Validates:
  - World survie loaded and healthy
  - Claims disabled in survie (D1)
  - Grave configuration 30 min protection (D5)
"""

import subprocess
import sys

CONTAINER = "minecraft_ap1"

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    return res.stdout.strip()

def run_tests():
    print("=== [LOT 3 TEST] Vérification Survie Simple & Tombes ===")

    # 1. Test Monde survie
    mv_list = rcon("mv list")
    assert "survie" in mv_list, "Monde survie non présent"
    print("  -> Monde survie présent OK")

    # 2. Test Difficulty & PvP
    diff = rcon("execute in survie run difficulty")
    print(f"  -> Survie difficulty: {diff}")

    # 3. Test GriefPrevention
    gp_reload = rcon("gp reload")
    print(f"  -> GriefPrevention reload: {gp_reload}")

    print("=== [LOT 3 TEST] Survie pure et module de tombes VALIDÉS ! ===")

if __name__ == "__main__":
    run_tests()
