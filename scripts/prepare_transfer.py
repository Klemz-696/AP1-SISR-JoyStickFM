import os
import shutil
import glob

base_dir = r"C:\Users\Klemz\Desktop\AP 1"
brain_dir = r"C:\Users\Klemz\.gemini\antigravity-ide\brain\0d75ed09-2580-47eb-8840-737f6c8ac792"

# 1. Structure de dossiers cibles
dirs_to_create = [
    os.path.join(base_dir, "_archives_binaires", "minecraft_jars"),
    os.path.join(base_dir, "_archives_binaires", "manifests_json"),
    os.path.join(base_dir, "_archives_donnees"),
    os.path.join(base_dir, "_contexte_ia", "logs"),
    os.path.join(base_dir, "_contexte_ia", "artifacts"),
    os.path.join(base_dir, "01_Journal_de_Bord", "Seance_04_2026-10-03"),
]

for d in dirs_to_create:
    os.makedirs(d, exist_ok=True)
    print(f"[OK] Dossier cree / verifie : {d}")

# 2. Deplacer les .jar lourds a la racine
jars = glob.glob(os.path.join(base_dir, "*.jar"))
for jar in jars:
    dest = os.path.join(base_dir, "_archives_binaires", "minecraft_jars", os.path.basename(jar))
    shutil.move(jar, dest)
    print(f"[MOVE] JAR -> {dest}")

# 3. Deplacer les .json a la racine
jsons = glob.glob(os.path.join(base_dir, "*.json"))
for j in jsons:
    dest = os.path.join(base_dir, "_archives_binaires", "manifests_json", os.path.basename(j))
    shutil.move(j, dest)
    print(f"[MOVE] JSON -> {dest}")

# 4. Deplacer les .csv a la racine
csvs = glob.glob(os.path.join(base_dir, "*.csv"))
for c in csvs:
    dest = os.path.join(base_dir, "_archives_donnees", os.path.basename(c))
    shutil.move(c, dest)
    print(f"[MOVE] CSV -> {dest}")

# 5. Sauvegarder les artefacts et les journaux de discussion Antigravity
if os.path.exists(brain_dir):
    # Artefacts .md
    for md in glob.glob(os.path.join(brain_dir, "*.md")):
        dest = os.path.join(base_dir, "_contexte_ia", "artifacts", os.path.basename(md))
        shutil.copy2(md, dest)
        print(f"[COPY] Artifact -> {dest}")
    
    # Transcripts JSONL
    logs_dir = os.path.join(brain_dir, ".system_generated", "logs")
    if os.path.exists(logs_dir):
        for log in glob.glob(os.path.join(logs_dir, "*.jsonl")):
            dest = os.path.join(base_dir, "_contexte_ia", "logs", os.path.basename(log))
            shutil.copy2(log, dest)
            print(f"[COPY] Log -> {dest}")

print("\n=== CLASSEMENT ET EXPORT DU CONTEXTE TERMINES AVEC SUCCES ===")
