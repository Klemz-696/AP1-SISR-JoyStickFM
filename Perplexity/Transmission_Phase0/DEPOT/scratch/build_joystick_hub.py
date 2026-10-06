import os, subprocess, zipfile, shutil

# Chemins
root = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
lib_dir = os.path.join(root, "scratch", "lib")
src_file = os.path.join(root, "scratch", "src", "fm", "joystick", "hub", "JoyStickHub.java")
bin_dir = os.path.join(root, "scratch", "bin")
output_jar = os.path.join(root, "Perplexity", "JoyStickFM_Production_Lots_0_a_7", "JoyStickHub.jar")

os.makedirs(bin_dir, exist_ok=True)

# Classpath
cp_jars = [os.path.join(lib_dir, f) for f in os.listdir(lib_dir) if f.endswith(".jar")]
classpath = ";".join(cp_jars)

# Compilation
print("[1/3] Compilation de JoyStickHub avec javac...")
cmd = ["javac", "-cp", classpath, "-d", bin_dir, src_file]
res = subprocess.run(cmd, capture_output=True, text=True)
if res.returncode != 0:
    print("ERREUR de compilation :")
    print(res.stderr)
    exit(1)
print("-> Compilation réussie avec code 0.")

# plugin.yml
plugin_yml_content = """name: JoyStickHub
version: 1.0.0
main: fm.joystick.hub.JoyStickHub
api-version: '1.20'
folia-supported: true
description: Plugin natif JoyStick FM (Void Fallback fluide et Chrono Parcours)
commands:
  parkour:
    description: Affiche le record du parcours
    usage: /parkour
"""

plugin_yml_path = os.path.join(bin_dir, "plugin.yml")
with open(plugin_yml_path, "w", encoding="utf-8") as f:
    f.write(plugin_yml_content)

# Packaging JAR
print(f"[2/3] Emballage dans {output_jar}...")
with zipfile.ZipFile(output_jar, "w", zipfile.ZIP_DEFLATED) as zf:
    for foldername, subfolders, filenames in os.walk(bin_dir):
        for filename in filenames:
            filepath = os.path.join(foldername, filename)
            arcname = os.path.relpath(filepath, bin_dir)
            zf.write(filepath, arcname)

print(f"[3/3] JAR généré avec succès ! Taille : {os.path.getsize(output_jar)} octets")
