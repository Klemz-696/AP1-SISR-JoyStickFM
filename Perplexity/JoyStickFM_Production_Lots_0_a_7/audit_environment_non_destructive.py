#!/usr/bin/env python3
"""
JoyStick FM - Audit Approfondi Non Destructif de l'Infrastructure Minecraft PaperMC 26.2
Mode LECTURE SEULE absolue. Aucune modification n'est apportée au serveur.
Ce script recueille :
  1. Versions réelles (PaperMC build, Java runtime, RAM tas JVM, CPU, Docker mounts).
  2. Joueurs connectés et statut de sauvegarde.
  3. Inventaire exhaustif des JAR des plugins (SHA256, plugin.yml, main class, version effective).
  4. Inspection chirurgicale d'ItemJoin (extraction du items.yml interne par défaut du JAR, parsing du items.yml actuel, logs d'erreurs).
  5. Inspection chirurgicale d'EssentialsX (compass-item, jumpto, permissions réelles LuckPerms pour Klemz_696).
  6. Cartographie géométrique du Hub (entités existantes avec tags, blocs aux coordonnées critiques).
  7. Disponibilité des outils de compilation Java (javac / JDK) pour un micro-plugin dédié JoyStick.
"""

import hashlib
import json
import os
import subprocess
import sys
import zipfile
from pathlib import Path

CONTAINER = "minecraft_ap1"
REPORT_FILE = Path("/opt/minecraft/repo/Perplexity/audit_complet_minecraft_terrain.json")

def rcon(cmd):
    try:
        res = subprocess.run(["docker", "exec", "-i", CONTAINER, "rcon-cli", "--", cmd], capture_output=True, text=True, timeout=10)
        return res.stdout.strip()
    except Exception as e:
        return f"ERROR: {e}"

def d_exec(cmd):
    try:
        res = subprocess.run(["docker", "exec", "-i", CONTAINER, "bash", "-c", cmd], capture_output=True, text=True, timeout=15)
        return res.stdout.strip()
    except Exception as e:
        return f"ERROR: {e}"

def h_exec(cmd):
    try:
        res = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=15)
        return res.stdout.strip()
    except Exception as e:
        return f"ERROR: {e}"

def get_sha256(filepath):
    try:
        sha = hashlib.sha256()
        with open(filepath, "rb") as f:
            while chunk := f.read(8192):
                sha.update(chunk)
        return sha.hexdigest()
    except Exception as e:
        return f"ERROR: {e}"

def main():
    print("=" * 80)
    print(" JOYSTICK FM — AUDIT APPROFONDI NON DESTRUCTIF (LECTURE SEULE STRICTE)")
    print("=" * 80)

    report = {}

    # 1. Vérification Conteneur Docker & Système Hôte
    print("\n[1/7] Audit Système, Docker & Spécifications Hôte...")
    report["host"] = {
        "hostname": h_exec("hostname"),
        "os_release": h_exec("cat /etc/os-release | grep PRETTY_NAME"),
        "uptime": h_exec("uptime"),
        "ram_host": h_exec("free -h"),
        "cpu_host": h_exec("nproc"),
    }
    docker_inspect = h_exec(f"docker inspect {CONTAINER}")
    try:
        inspect_json = json.loads(docker_inspect)[0]
        report["docker"] = {
            "status": inspect_json.get("State", {}).get("Status"),
            "image": inspect_json.get("Config", {}).get("Image"),
            "mounts": inspect_json.get("Mounts", []),
            "env": [e for e in inspect_json.get("Config", {}).get("Env", []) if not any(s in e.lower() for s in ["pass", "secret", "token", "key"])],
        }
    except Exception as e:
        report["docker"] = {"error": str(e)}

    # 2. Audit PaperMC & Runtime JVM
    print("\n[2/7] Audit PaperMC, Java 25 & Paramètres JVM...")
    report["minecraft_runtime"] = {
        "version_rcon": rcon("version"),
        "tps": rcon("tps"),
        "memory_rcon": rcon("memory"),
        "java_version_container": d_exec("java -version 2>&1"),
        "javac_available_container": d_exec("which javac"),
        "javac_version_host": h_exec("javac -version 2>&1"),
        "server_properties": d_exec("cat /data/server.properties | grep -E 'level-name|online-mode|enable-command-block|motd'"),
    }
    print(f"  -> Version Paper : {report['minecraft_runtime']['version_rcon']}")
    print(f"  -> Java Conteneur : {report['minecraft_runtime']['java_version_container'].splitlines()[0] if report['minecraft_runtime']['java_version_container'] else 'Inconnu'}")
    print(f"  -> Javac disponible dans conteneur : {report['minecraft_runtime']['javac_available_container']}")
    print(f"  -> Javac disponible sur l'hôte : {report['minecraft_runtime']['javac_version_host']}")

    # 3. Joueurs Connectés & Sauvegarde de Sécurité en mémoire
    print("\n[3/7] Audit des Joueurs Connectés & Flush Mémoire...")
    report["players_online"] = rcon("list")
    print(f"  -> Joueurs : {report['players_online']}")
    flush_res = rcon("save-all flush")
    print(f"  -> Save-all flush : {flush_res}")
    report["save_all_flush"] = flush_res

    # 4. Inventaire des JAR réellement présents
    print("\n[4/7] Inventaire et Empreinte SHA256 des JAR des Plugins...")
    plugins_list_raw = d_exec("ls -la /data/plugins/*.jar")
    report["plugins_jars"] = []
    
    # Trouver le chemin de montage de /data sur l'hôte
    data_host_mount = None
    if "mounts" in report.get("docker", {}):
        for m in report["docker"]["mounts"]:
            if m.get("Destination") == "/data":
                data_host_mount = Path(m.get("Source"))
                break

    print(f"  -> Point de montage hôte pour /data : {data_host_mount}")
    
    if data_host_mount and (data_host_mount / "plugins").exists():
        for jar_path in (data_host_mount / "plugins").glob("*.jar"):
            jar_info = {
                "filename": jar_path.name,
                "size": jar_path.stat().st_size,
                "sha256": get_sha256(jar_path),
            }
            # Inspection du plugin.yml ou paper-plugin.yml à l'intérieur du JAR
            try:
                with zipfile.ZipFile(jar_path, "r") as zf:
                    descriptor = None
                    if "paper-plugin.yml" in zf.namelist():
                        descriptor = zf.read("paper-plugin.yml").decode("utf-8", errors="replace")
                        jar_info["descriptor_type"] = "paper-plugin.yml"
                    elif "plugin.yml" in zf.namelist():
                        descriptor = zf.read("plugin.yml").decode("utf-8", errors="replace")
                        jar_info["descriptor_type"] = "plugin.yml"
                    
                    if descriptor:
                        jar_info["descriptor_snippet"] = "\n".join(descriptor.splitlines()[:20])
            except Exception as e:
                jar_info["zip_error"] = str(e)

            report["plugins_jars"].append(jar_info)
            print(f"  -> Plugin JAR : {jar_path.name} ({jar_info['size']} octets) SHA256={jar_info['sha256'][:16]}...")

    # 5. Diagnostic Approfondi d'ItemJoin
    print("\n[5/7] Diagnostic Chirurgical d'ItemJoin (Schéma & Fichiers)...")
    report["itemjoin"] = {
        "folder_ls": d_exec("ls -la /data/plugins/ItemJoin/"),
        "config_yml": d_exec("cat /data/plugins/ItemJoin/config.yml | head -n 45"),
        "items_yml": d_exec("cat /data/plugins/ItemJoin/items.yml"),
        "latest_log_errors": d_exec("grep -i -C 3 'ItemJoin' /data/logs/latest.log | tail -n 40"),
    }
    
    # Extraire le items.yml et config.yml par défaut depuis le JAR d'ItemJoin lui-même !
    if data_host_mount:
        for jar_path in (data_host_mount / "plugins").glob("*ItemJoin*.jar"):
            try:
                with zipfile.ZipFile(jar_path, "r") as zf:
                    report["itemjoin"]["jar_namelist"] = [n for n in zf.namelist() if n.endswith((".yml", ".sql", ".txt"))]
                    for sample_name in ["items.yml", "config.yml"]:
                        if sample_name in zf.namelist():
                            report["itemjoin"][f"jar_default_{sample_name}"] = zf.read(sample_name).decode("utf-8", errors="replace")[:1500]
            except Exception as e:
                report["itemjoin"]["jar_extract_error"] = str(e)

    # 6. Diagnostic Approfondi d'EssentialsX
    print("\n[6/7] Diagnostic Chirurgical d'EssentialsX...")
    report["essentials"] = {
        "compass_config_grep": d_exec("grep -i -C 2 'compass' /data/plugins/Essentials/config.yml"),
        "disabled_commands": d_exec("grep -i -C 2 'disabled-commands' /data/plugins/Essentials/config.yml"),
        "luckperms_klemz_perms": rcon("lp user Klemz_696 permission info"),
        "luckperms_default_perms": rcon("lp group default permission info"),
    }

    # 7. Cartographie Géométrique du Hub & Entités
    print("\n[7/7] Cartographie du Hub, Entités & Blocs Physiques...")
    report["hub_geometry"] = {
        "text_display_entities": rcon("execute in hub run data get entity @e[type=text_display,limit=1]"),
        "armor_stand_entities": rcon("execute in hub run data get entity @e[type=armor_stand,limit=1]"),
        "block_0_63_0": rcon("execute in hub run data get block 0 63 0"),
        "block_6_64_0": rcon("execute in hub run data get block 6 64 0"),
        "block_6_65_0": rcon("execute in hub run data get block 6 65 0"),
        "block_6_66_0": rcon("execute in hub run data get block 6 66 0"),
        "block_7_71_2": rcon("execute in hub run data get block 7 71 2"),
        "block_7_72_2": rcon("execute in hub run data get block 7 72 2"),
        "block_7_73_2": rcon("execute in hub run data get block 7 73 2"),
        "block_8_73_2": rcon("execute in hub run data get block 8 73 2"),
        "gamerules": {
            "fall_damage": rcon("execute in hub run gamerule minecraft:fall_damage"),
            "command_block_output": rcon("gamerule minecraft:command_block_output"),
            "send_command_feedback": rcon("gamerule minecraft:send_command_feedback"),
        }
    }

    # Sauvegarde du rapport JSON complet
    REPORT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 80)
    print(f" AUDIT TERMINÉ AVEC SUCCÈS. RAPPORT BRUT SAUVEGARDÉ DANS :")
    print(f" -> {REPORT_FILE}")
    print("=" * 80)

if __name__ == "__main__":
    main()
