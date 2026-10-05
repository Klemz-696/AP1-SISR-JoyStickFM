import os
import zipfile

source_dir = r"C:\Users\Klemz\Desktop\AP 1"
desktop_dir = r"C:\Users\Klemz\Desktop"
zip_path = os.path.join(desktop_dir, "AP1_Transfert_Portable_2026-10-03.zip")

print("Compression en cours du dossier AP 1...")

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(source_dir):
        # Exclure .git ou dossiers temporaires si existants
        for file in files:
            file_path = os.path.join(root, file)
            # Ne pas zipper l'archive elle-meme
            if file.endswith(".zip"):
                continue
            arcname = os.path.relpath(file_path, os.path.dirname(source_dir))
            zipf.write(file_path, arcname)

size_mb = os.path.getsize(zip_path) / (1024 * 1024)
print(f"Archive creee avec succes : {zip_path} ({size_mb:.2f} Mo)")
