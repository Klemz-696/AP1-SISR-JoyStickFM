#!/usr/bin/env bash
set -Eeuo pipefail
CONTAINER="${CONTAINER:-minecraft_ap1}"
DATA_DIR="${DATA_DIR:-/opt/minecraft/data}"
command -v docker >/dev/null
command -v python3 >/dev/null
printf '\n=== SERVER VERSION ===\n'
docker exec -i "$CONTAINER" rcon-cli -- version
printf '\n=== PLUGINS ===\n'
docker exec -i "$CONTAINER" rcon-cli -- plugins
printf '\n=== JAVA ===\n'
docker exec "$CONTAINER" java -version 2>&1
printf '\n=== SAFE DOCKER METADATA ===\n'
docker inspect "$CONTAINER" | python3 -c '
import json,sys
v=json.load(sys.stdin)[0]
print("Image:",v["Config"].get("Image"))
print("Image user:",v["Config"].get("User"))
print("Mounts:",json.dumps(v.get("Mounts",[]),indent=2))
allowed={"UID","GID","MEMORY","TYPE","CUSTOM_SERVER","ONLINE_MODE","GAMEMODE","FORCE_GAMEMODE"}
for item in v["Config"].get("Env",[]):
 k,_,value=item.partition("=")
 if k in allowed: print(k+"="+value)
print("Port bindings:",json.dumps(v.get("HostConfig",{}).get("PortBindings",{}),indent=2))'
printf '\n=== JAR DESCRIPTORS AND HASHES ===\n'
python3 - "$DATA_DIR" <<'PY'
import sys,zipfile,hashlib,pathlib
base=pathlib.Path(sys.argv[1])
for jar in sorted((base/'plugins').glob('*.jar')):
    h=hashlib.file_digest(jar.open('rb'),'sha256').hexdigest()
    print('\nFILE',jar.name,'SHA256',h)
    try:
        with zipfile.ZipFile(jar) as z:
            for name in ('plugin.yml','paper-plugin.yml'):
                if name in z.namelist():
                    text=z.read(name).decode('utf-8',errors='replace')
                    print('DESCRIPTOR',name)
                    print(text)
    except (OSError,zipfile.BadZipFile) as e: print(type(e).__name__,str(e))
for relative in ['plugins/Multiverse-Core/worlds.yml','plugins/Multiverse-Inventories/config.yml',
                 'plugins/Multiverse-Inventories/groups.yml','plugins/GriefPreventionData/config.yml',
                 'plugins/DeluxeMenus/config.yml','plugins/DeluxeMenus/gui_menus/games.yml',
                 'plugins/ItemJoin/config.yml','plugins/ItemJoin/items.yml','plugins/TAB/config.yml']:
    p=base/relative
    print('CONFIG',relative,'EXISTS',p.is_file())
    if p.is_file(): print('SHA256',hashlib.file_digest(p.open('rb'),'sha256').hexdigest())
print('WORLD METADATA FILES (paths relative to data)')
for p in base.rglob('level.dat'):
    if 'plugins' not in p.relative_to(base).parts: print(p.relative_to(base))
PY
printf '\n=== READ-ONLY RCON DETAILS ===\n'
for cmd in 'version Multiverse-Core' 'version Multiverse-Inventories' \
  'version BedWars' 'version BlockHunt' 'version TAB' 'version ItemJoin' \
  'version GriefPrevention' 'version DeluxeMenus' 'mv list' 'mv info hub' \
  'mv info world' 'mv info survie' 'mv info minijeux' 'mv generators' \
  'mv help create' 'mv help modify' 'bw help' 'bh help'; do
  printf '\n>>> %s\n' "$cmd"
  docker exec -i "$CONTAINER" rcon-cli -- "$cmd" || printf 'RCON CALL FAILED: %s\n' "$cmd" >&2
done
printf '\nAudit finished. This script did not install, delete, restart or reload anything.\n'
printf 'Review this report privately before sharing; plugin descriptors may contain project URLs.\n'
