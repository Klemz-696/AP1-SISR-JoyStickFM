#!/usr/bin/env python3
import os
import subprocess
import zipfile
import shutil

hub_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(hub_dir, "..", ".."))

lib_dir = os.path.join(root_dir, "scratch", "lib")
src_file = os.path.join(hub_dir, "src", "main", "java", "fm", "joystick", "hub", "JoyStickHub.java")
res_file = os.path.join(hub_dir, "src", "main", "resources", "plugin.yml")
bin_dir = os.path.join(hub_dir, "target", "classes")
output_jar = os.path.join(root_dir, "Perplexity", "JoyStickFM_Production_Lots_0_a_7", "JoyStickHub.jar")

os.makedirs(bin_dir, exist_ok=True)
os.makedirs(os.path.dirname(output_jar), exist_ok=True)

# Détection du Classpath
cp_jars = []
if os.path.isdir(lib_dir):
    cp_jars = [os.path.join(lib_dir, f) for f in os.listdir(lib_dir) if f.endswith(".jar")]
classpath = os.pathsep.join(cp_jars)

print("=" * 60)
print("  COMPILATION ET EMBALLAGE DU PLUGIN JOYSTICKHUB v1.5.0")
print("=" * 60)

# Compilation
print("\n[1/3] Compilation avec javac...")
cmd = ["javac", "-cp", classpath, "-d", bin_dir, src_file]
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode != 0:
    print("❌ Erreur de compilation :")
    print(res.stderr)
    exit(1)
print("✔ Compilation Java réussie !")

# Copie du plugin.yml
shutil.copy2(res_file, os.path.join(bin_dir, "plugin.yml"))

# Packaging JAR
print(f"\n[2/3] Emballage dans : {output_jar}...")
with zipfile.ZipFile(output_jar, "w", zipfile.ZIP_DEFLATED) as zf:
    for foldername, subfolders, filenames in os.walk(bin_dir):
        for filename in filenames:
            filepath = os.path.join(foldername, filename)
            arcname = os.path.relpath(filepath, bin_dir)
            zf.write(filepath, arcname)

print(f"✔ JAR généré avec succès ! Taille : {os.path.getsize(output_jar)} octets")
print("\n[3/3] Terminé avec succès.")
