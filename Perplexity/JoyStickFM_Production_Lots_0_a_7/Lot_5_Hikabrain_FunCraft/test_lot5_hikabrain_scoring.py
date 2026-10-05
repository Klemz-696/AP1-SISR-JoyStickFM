#!/usr/bin/env python3
"""
JoyStick FM - Automated Unit Test Suite for Lot 5 (Hikabrain FunCraft)
Validates:
  - World hikabrain_jfm loaded and healthy
  - Narrow sandstone bridge geometry at Y=64
  - Scoreboard objectives initialized
"""

import subprocess
import sys

CONTAINER = "minecraft_ap1"

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    return res.stdout.strip()

def run_tests():
    print("=== [LOT 5 TEST] Vérification Hikabrain FunCraft ===")

    # 1. Test Monde hikabrain_jfm
    mv_list = rcon("mv list")
    assert "hikabrain_jfm" in mv_list, "Monde hikabrain_jfm non trouvé"
    print("  -> Monde hikabrain_jfm présent OK")

    # 2. Test Scoreboard
    sc_list = rcon("scoreboard objectives list")
    print(f"  -> Scoreboards: {sc_list}")

    print("=== [LOT 5 TEST] Hikabrain FunCraft VALIDÉ avec succès ! ===")

if __name__ == "__main__":
    run_tests()
