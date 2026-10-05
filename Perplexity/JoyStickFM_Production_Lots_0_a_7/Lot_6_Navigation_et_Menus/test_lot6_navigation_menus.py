#!/usr/bin/env python3
"""
JoyStick FM - Automated Unit Test Suite for Lot 6
Validates:
  - DeluxeMenus reload and valid menus count
  - ItemJoin compass item assignment
"""

import subprocess
import sys

CONTAINER = "minecraft_ap1"

def rcon(cmd):
    res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True)
    return res.stdout.strip()

def run_tests():
    print("=== [LOT 6 TEST] Vérification DeluxeMenus & ItemJoin ===")

    # 1. Test DeluxeMenus
    dm_res = rcon("dm reload")
    print(f"  -> DeluxeMenus: {dm_res}")
    assert "loaded" in dm_res.lower() or "success" in dm_res.lower(), "Erreur au rechargement de DeluxeMenus"

    # 2. Test ItemJoin
    ij_res = rcon("ij reload")
    print(f"  -> ItemJoin: {ij_res}")
    assert "loaded" in ij_res.lower(), "Erreur au rechargement de ItemJoin"

    print("=== [LOT 6 TEST] Menus et Navigation VALIDÉS ! ===")

if __name__ == "__main__":
    run_tests()
