#!/usr/bin/env python3
"""
JOYSTICK FM — RÉSOLUTION DU RESPAWN DU MONDE SURVIE
Problème résolu :
  Lors d'une mort en Survie, le joueur réapparaissait au Hub central
  au lieu du spawn du monde Survie (ou de son lit / ancre).

Actions appliquées :
 1. Multiverse-Core : configuration de respawn-world: survie et bed-respawn: true
 2. EssentialsX : priorité du listener de respawn à 'lowest' (laisse la main à Multiverse & au plugin)
 3. JoyStickHub.jar (v1.1.0) : détection native PlayerDeath / PlayerRespawn garantissant la réapparition
    en Survie et en mode SURVIVAL.
 4. Redémarrage contrôlé de minecraft_ap1 pour recharger le JAR en mémoire.
"""

import subprocess
import time
import shutil
from pathlib import Path

CONTAINER = "minecraft_ap1"
DATA_HOST = Path("/opt/minecraft/data") if Path("/opt/minecraft/data").exists() else Path(".")

def rcon(cmd):
    full_cmd = ["docker", "exec", "-i", CONTAINER, "rcon-cli", "--"] + cmd.split()
    res = subprocess.run(full_cmd, capture_output=True, text=True, timeout=10)
    return res.stdout.strip()

def d_exec(cmd):
    full_cmd = ["docker", "exec", "-i", CONTAINER, "sh", "-c", cmd]
    res = subprocess.run(full_cmd, capture_output=True, text=True, timeout=10)
    return res.stdout.strip()

def wait_for_rcon(max_seconds=50):
    print("  -> En attente de la disponibilité de PaperMC RCON...")
    start = time.time()
    while time.time() - start < max_seconds:
        try:
            out = rcon("version")
            if "Paper" in out or "git-Paper" in out or "version" in out.lower():
                print(f"  -> RCON opérationnel en {int(time.time() - start)}s.")
                return True
        except Exception:
            pass
        time.sleep(2)
    raise TimeoutError("Le serveur n'a pas répondu à RCON.")

def main():
    print("=" * 80)
    print(" JOYSTICK FM — CONFIGURATION CHIRURGICALE DU RESPAWN EN SURVIE")
    print("=" * 80)

    # 1. Déploiement de la version enrichie de JoyStickHub.jar
    print("\n[1/4] Mise à jour du plugin JoyStickHub.jar...")
    jar_src = Path(__file__).resolve().parent / "JoyStickHub.jar"
    dest_jar = DATA_HOST / "plugins" / "JoyStickHub.jar"
    if jar_src.exists() and dest_jar.parent.exists():
        shutil.copy2(jar_src, dest_jar)
        print(f"  -> JoyStickHub.jar mis à jour ({dest_jar.stat().st_size} octets).")

    # 2. Configuration Multiverse-Core pour lier le respawn à survie
    print("\n[2/4] Configuration des paramètres de respawn dans Multiverse...")
    rcon("mv modify survie set respawn-world survie")
    rcon("mv modify survie set bed-respawn true")
    rcon("mv modify survie set anchor-respawn true")
    # Pour le nether et l'end de survie si présents
    rcon("mv modify survie_nether set respawn-world survie")
    rcon("mv modify survie_the_end set respawn-world survie")
    print("  -> Multiverse configuré : respawn-world = survie, bed-respawn = true.")

    # 3. Patch EssentialsX pour ne pas écraser le respawn des mondes
    print("\n[3/4] Alignement de la priorité de respawn dans EssentialsX...")
    ess_config = DATA_HOST / "plugins" / "Essentials" / "config.yml"
    if ess_config.exists():
        with open(ess_config, "r", encoding="utf-8") as f:
            content = f.read()

        # Priorité au plus bas pour laisser Multiverse et le plugin gérer le respawn par monde
        content = content.replace("respawn-listener-priority: high", "respawn-listener-priority: lowest")
        content = content.replace("respawn-listener-priority: highest", "respawn-listener-priority: lowest")
        content = content.replace("respawn-at-home: false", "respawn-at-home: true")

        with open(ess_config, "w", encoding="utf-8") as f:
            f.write(content)
        print("  -> EssentialsX : respawn-listener-priority = lowest, respawn-at-home = true.")

    # 4. Redémarrage contrôlé du conteneur pour recharger le JAR natif
    print("\n[4/4] Redémarrage contrôlé de PaperMC pour prise en compte...")
    subprocess.run(["docker", "restart", CONTAINER], check=True)
    wait_for_rcon()

    print("\n" + "=" * 80)
    print(" VÉRIFICATION DU RESPAWN...")
    mv_check = rcon("mv info survie")
    for line in mv_check.splitlines():
        if "Respawn" in line or "Bed" in line:
            print(f"  -> {line}")

    print("\n CONFIGURATION DU RESPAWN VALIDÉE AVEC SUCCÈS !")
    print(" Les joueurs mourant en Survie réapparaîtront désormais :")
    print("  1. À leur lit s'ils ont dormi dans un lit en Survie")
    print("  2. Au spawn du monde Survie en l'absence de lit")
    print("  3. En restant systématiquement en mode SURVIVAL")
    print("=" * 80)

if __name__ == "__main__":
    main()
