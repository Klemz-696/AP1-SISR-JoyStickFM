import urllib.request
import os

PLUGINS = {
    "LuckPerms-Bukkit.jar": "https://cdn.modrinth.com/data/Vebnzrzj/versions/b0mk8uS6/LuckPerms-Bukkit-5.5.71.jar",
    "CoreProtect.jar": "https://cdn.modrinth.com/data/Lu3KuzdV/versions/3sehX6Sg/CoreProtect-CE-24.1.jar",
    "GrimAC.jar": "https://cdn.modrinth.com/data/LJNGWSvH/versions/YJEwvStg/grimac-bukkit-2.3.74-abb95b6.jar",
    "Chunky-Bukkit.jar": "https://cdn.modrinth.com/data/fALzjamp/versions/MdY6JATr/Chunky-Bukkit-1.5.3.jar"
}

output_dir = os.path.join(os.path.dirname(__file__), "..", "plugins_a_installer")
os.makedirs(output_dir, exist_ok=True)

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for name, url in PLUGINS.items():
    dest = os.path.join(output_dir, name)
    print(f"Téléchargement de {name} depuis {url}...")
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp, open(dest, 'wb') as f:
        f.write(resp.read())
    size_mb = os.path.getsize(dest) / (1024 * 1024)
    print(f" -> {name} téléchargé avec succès ({size_mb:.2f} Mo)")

print("\nTous les plugins ont été téléchargés dans plugins_a_installer/ avec succès !")
