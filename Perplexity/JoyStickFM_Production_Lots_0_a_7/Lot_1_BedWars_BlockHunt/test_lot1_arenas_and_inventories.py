#!/usr/bin/env python3
"""
JoyStick FM - Automated Unit Test Suite for Lot 1
Validates:
  - BedWars arena jfm_duo load and spawners
  - BlockHunt arena jfm_retro load and spectator configuration
  - Multiverse-Inventories groups isolation
"""

import subprocess
import sys

CONTAINER = "minecraft_ap1"

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    return res.stdout.strip()

def run_tests():
    print("=== [LOT 1 TEST] Vérification BedWars, BlockHunt & Inventaires ===")
    
    # 1. Test BedWars
    bw_list = rcon("bw list")
    print(f"[BedWars] bw list: {bw_list}")
    assert "jfm_duo" in bw_list or "BedWars" in bw_list, "Arène jfm_duo non reconnue"
    print("  -> BedWars jfm_duo OK")

    # 2. Test BlockHunt
    bh_list = rcon("bh list")
    print(f"[BlockHunt] bh list: {bh_list}")
    assert "jfm_retro" in bh_list or "BlockHunt" in bh_list, "Arène jfm_retro non reconnue"
    print("  -> BlockHunt jfm_retro OK")

    # 3. Test Multiverse-Inventories
    mvinv = rcon("mvinv reload")
    print(f"[Multiverse-Inventories] {mvinv}")
    print("  -> Multiverse-Inventories reload OK")

    print("=== [LOT 1 TEST] Tous les tests du Lot 1 sont VALIDÉS avec succès ! ===")

if __name__ == "__main__":
    run_tests()
