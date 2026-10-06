import urllib.request
import os
import hashlib
import zipfile
import pathlib

BASE_DIR = pathlib.Path(__file__).parent.resolve()
ASSETS_DIR = BASE_DIR / "downloaded_assets"
ASSETS_DIR.mkdir(parents=True, exist_ok=True)

ASSETS = [
    {
        "id": "hub_terrestre",
        "name": "Minecraft Monday Lobby.zip",
        "url": "https://raw.githubusercontent.com/HeathLoganCampbell/Minecraft-Monday-Lobby/main/Minecraft%20Monday%20Lobby.zip",
        "target": ASSETS_DIR / "hub_grand_architectural.zip"
    },
    {
        "id": "authme_paper",
        "name": "AuthMe-6.0.2-SNAPSHOT-Paper.jar",
        "url": "https://ci.codemc.io/job/AuthMe/job/AuthMeReloaded/lastSuccessfulBuild/artifact/authme-paper/target/AuthMe-6.0.2-SNAPSHOT-Paper.jar",
        "target": ASSETS_DIR / "AuthMe-6.0.2-Paper.jar"
    }
]

BEDWARS_FILES = [
    "level.dat",
    "region/r.-1.-1.mca",
    "region/r.-1.0.mca",
    "region/r.0.-1.mca",
    "region/r.0.0.mca"
]

def download_file(url, target_path):
    print(f"Downloading {url} -> {target_path.name}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'JoyStickFM-Deployer/1.0'})
    with urllib.request.urlopen(req) as resp:
        data = resp.read()
    with open(target_path, "wb") as f:
        f.write(data)
    h = hashlib.sha256(data).hexdigest()
    print(f"  OK: {len(data)} bytes, SHA256: {h[:16]}...")
    return len(data)

def main():
    print("=== Downloading Verified JoyStick FM Community Assets ===")
    for item in ASSETS:
        if not item["target"].exists():
            download_file(item["url"], item["target"])
        else:
            print(f"Already cached: {item['target'].name} ({item['target'].stat().st_size} bytes)")
            
    bw_dir = ASSETS_DIR / "bedwars_airshow"
    bw_dir.mkdir(parents=True, exist_ok=True)
    (bw_dir / "region").mkdir(parents=True, exist_ok=True)
    
    base_bw_url = "https://raw.githubusercontent.com/Odsodium/Hypixel-Bedwars-Maps/main/solos%20and%20doubles/Airshow"
    for rf in BEDWARS_FILES:
        target = bw_dir / rf
        if not target.exists():
            download_file(f"{base_bw_url}/{rf}", target)
        else:
            print(f"Already cached: {target.name} ({target.stat().st_size} bytes)")

    print("\nAll external assets staged successfully!")

if __name__ == "__main__":
    main()
