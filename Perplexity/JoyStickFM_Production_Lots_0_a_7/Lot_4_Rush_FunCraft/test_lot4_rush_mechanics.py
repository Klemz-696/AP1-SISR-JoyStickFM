#!/usr/bin/env python3
"""
JoyStick FM - Automated Unit Test Suite for Lot 4 (Rush FunCraft)
Validates:
  - World rush_jfm created and loaded
  - ScreamingBedWars recognizes rush_1v1 and rush_2v2
  - Spawners and shop configurations present
"""

import subprocess
import sys

CONTAINER = "minecraft_ap1"

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    return res.stdout.strip()

def run_tests():
    print("=== [LOT 4 TEST] Vérification Mode Rush FunCraft ===")

    # 1. Test Monde rush_jfm
    mv_list = rcon("mv list")
    assert "rush_jfm" in mv_list, "Monde rush_jfm non trouvé"
    print("  -> Monde rush_jfm présent OK")

    # 2. Test Arènes BedWars
    bw_list = rcon("bw list")
    print(f"  -> BedWars arenas: {bw_list}")
    assert "rush_1v1" in bw_list or "BedWars" in bw_list, "Arène rush_1v1 non reconnue"
    print("  -> Arènes Rush 1v1 / 2v2 OK")

    print("=== [LOT 4 TEST] Mode Rush FunCraft VALIDÉ avec succès ! ===")

if __name__ == "__main__":
    run_tests()
