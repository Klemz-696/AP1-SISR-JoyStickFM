#!/usr/bin/env bash
# Installer for an agent-verified bundle; not an autonomous arena configurator.
set -Eeuo pipefail
umask 077
MODE="${1:---plan}"
BUNDLE="${2:-}"
CONTAINER="${CONTAINER:-minecraft_ap1}"
DATA_DIR="${DATA_DIR:-/opt/minecraft/data}"
BACKUP_ROOT="${BACKUP_ROOT:-/opt/minecraft/gamemodes-backups}"
READY_TIMEOUT="${READY_TIMEOUT:-180}"
case "$MODE" in --plan|--apply) ;; *) echo 'Usage: deploy_gamemodes.sh --plan|--apply VERIFIED_BUNDLE' >&2; exit 2;; esac
[[ -n "$BUNDLE" && -d "$BUNDLE" ]] || { echo 'A verified bundle directory is required.' >&2; exit 2; }
command -v docker >/dev/null
command -v python3 >/dev/null
BUNDLE="$(realpath "$BUNDLE")"
DATA_DIR="$(realpath "$DATA_DIR")"
[[ -f "$BUNDLE/manifest.json" ]] || { echo 'Missing manifest.json; no verified deployment bundle provided.' >&2; exit 2; }
STAGE="$(mktemp -d)"
STOPPED=0
BACKUP=''
cleanup() {
  rc=$?
  rm -rf -- "$STAGE"
  if (( rc != 0 )); then
    printf 'FAILED. No success claim. Backup: %s\n' "${BACKUP:-not created}" >&2
    if (( STOPPED )); then echo 'Server left stopped: inspect and restore the backup before restarting.' >&2; fi
  fi
}
trap cleanup EXIT
python3 - "$BUNDLE" "$DATA_DIR" "$STAGE" <<'PY'
import json,pathlib,sys,hashlib,re,shutil,urllib.request
bundle,data,stage=map(pathlib.Path,sys.argv[1:])
m=json.loads((bundle/'manifest.json').read_text())
assert m.get('schema_version')==1, 'Unsupported manifest'
assert m.get('verified') is True, 'Bundle is not marked verified'
assert m.get('evidence'), 'Missing validation evidence references'
assert m.get('expected_paper_version') and m.get('plugin_fingerprints'), 'Missing software fingerprints'
assert m.get('arena_manifest_sha256'), 'Missing geometry fingerprint'
allowed=m.get('allowed_destination_prefixes',[])
assert allowed and all(p and '..' not in p and not p.startswith('/') for p in allowed)
for prefix in allowed:
    assert prefix.startswith('plugins/') or prefix.startswith('worlds/'), 'Only audited plugin/world prefixes are allowed'
    assert not re.search(r'(^|/)(hub|world|playerdata|players)(/|$)',prefix), 'Protected paths not permitted'
geometry=bundle/'arena_manifest.json'
assert geometry.is_file(), 'Missing arena manifest'
assert hashlib.file_digest(geometry.open('rb'),'sha256').hexdigest()==m['arena_manifest_sha256']
for f in m.get('files',[]):
    rel=pathlib.PurePosixPath(f['destination'])
    assert not rel.is_absolute() and '..' not in rel.parts, 'Unsafe destination'
    assert any(str(rel).startswith(p) for p in allowed), 'Destination outside allowlist'
    target=data.joinpath(*rel.parts)
    assert data==target.resolve().parent or data in target.resolve().parents, 'Destination escapes data'
    assert re.fullmatch(r'[0-9a-f]{64}',f['sha256']), 'Missing SHA256'
    assert ('source' in f) != ('url' in f), 'Specify one source: local or URL'
    dest=stage.joinpath(*rel.parts);dest.parent.mkdir(parents=True,exist_ok=True)
    if 'source' in f:
        source=(bundle/f['source']).resolve()
        assert bundle in source.parents and source.is_file(), 'Unsafe local source'
        shutil.copyfile(source,dest)
    else:
        assert f['url'].startswith('https://'), 'HTTPS required'
        assert f.get('license') and f.get('source_page'), 'Provenance/license required'
        req=urllib.request.Request(f['url'],headers={'User-Agent':'JoyStickFM-Verified-Deployment/1.0'})
        with urllib.request.urlopen(req,timeout=30) as response,dest.open('wb') as output:
            assert response.geturl().startswith('https://')
            count=0;limit=int(f.get('max_bytes',67108864))
            while chunk:=response.read(1048576):
                count+=len(chunk);assert count<=limit, 'Download too large';output.write(chunk)
    assert hashlib.file_digest(dest.open('rb'),'sha256').hexdigest()==f['sha256'], 'Checksum mismatch'
    if dest.suffix.lower() in ('.yml','.yaml','.json','.txt'):
        text=dest.read_text(encoding='utf-8')
        assert '__CMD_' not in text and '__TODO_' not in text, 'Unresolved template'
for item in m.get('post_start_commands',[]):
    assert isinstance(item,dict) and item.get('command') and item.get('expect_regex'), 'Each command needs expected output'
    assert '\n' not in item['command'] and '\r' not in item['command']
    assert not re.search(r'(^|\s)(reload confirm|op|deop|delete|regen|clear)(\s|$)',item['command']), 'Forbidden command'
for item in m.get('health_checks',[]):
    assert item.get('command') and item.get('expect_regex')
assert m.get('health_checks'), 'Missing checks'
print(json.dumps({'files':[f['destination'] for f in m.get('files',[])],
                  'post_start_commands':m.get('post_start_commands',[]),
                  'health_checks':m.get('health_checks',[])},indent=2))
PY
python3 - "$BUNDLE/manifest.json" "$CONTAINER" <<'PY'
import json,subprocess,sys,re
m=json.load(open(sys.argv[1]));c=sys.argv[2]
v=subprocess.check_output(['docker','exec','-i',c,'rcon-cli','--','version'],text=True)
assert re.search(m['expected_paper_version'],v), 'Unexpected server version'
for name,expected in m['plugin_fingerprints'].items():
    code='import sys,pathlib,hashlib; p=pathlib.Path(sys.argv[1]); print(hashlib.file_digest(p.open("rb"),"sha256").hexdigest())'
    path='/data/plugins/'+name
    assert '/' not in name and name.endswith('.jar')
    actual=subprocess.check_output(['docker','exec',c,'sh','-c','sha256sum "$1"','sh',path],text=True).split()[0]
    assert actual==expected, 'Unexpected plugin binary: '+name
PY
if [[ "$MODE" == '--plan' ]]; then
  echo 'PLAN ONLY: downloaded/validated in a temporary directory; no production files changed.'
  exit 0
fi
[[ "$EUID" -eq 0 ]] || { echo 'Apply requires root.' >&2; exit 2; }
[[ "${APPROVED_MAINTENANCE:-}" == 'YES' ]] || { echo 'Set APPROVED_MAINTENANCE=YES only after approval.' >&2; exit 2; }
: "${TARGET_UID:?Set audited container data UID}"
: "${TARGET_GID:?Set audited container data GID}"
[[ "$TARGET_UID" =~ ^[0-9]+$ && "$TARGET_GID" =~ ^[0-9]+$ ]] || exit 2
MANIFEST_HASH="$(sha256sum "$BUNDLE/manifest.json" | cut -d' ' -f1)"
MARKER="$DATA_DIR/.joystick-gamemodes-manifest.sha256"
if [[ -f "$MARKER" ]] && [[ "$(cat "$MARKER")" == "$MANIFEST_HASH" ]]; then
  echo 'Identical manifest already installed; do not repeat build commands.'
  exit 0
fi
mkdir -p "$BACKUP_ROOT"
chmod 700 "$BACKUP_ROOT"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP="$BACKUP_ROOT/data-$STAMP.tar"
printf 'Approved maintenance: full stopped-data backup will be %s\n' "$BACKUP"
docker exec -i "$CONTAINER" rcon-cli -- 'save-all flush'
docker stop -t 120 "$CONTAINER" >/dev/null
STOPPED=1
tar -C "$DATA_DIR" -cpf "$BACKUP" .
chmod 600 "$BACKUP"
python3 - "$BUNDLE/manifest.json" "$STAGE" "$DATA_DIR" "$TARGET_UID" "$TARGET_GID" <<'PY'
import json,pathlib,sys,os,shutil,tempfile
manifest,stage,data=map(pathlib.Path,sys.argv[1:4]);uid,gid=map(int,sys.argv[4:6])
m=json.loads(manifest.read_text())
for f in m.get('files',[]):
    relative=pathlib.PurePosixPath(f['destination'])
    dest=data.joinpath(*relative.parts)
    current=data
    for part in relative.parts[:-1]:
        current=current/part
        if not current.exists(): current.mkdir();os.chown(current,uid,gid)
    source=stage.joinpath(*relative.parts)
    fd,tmp=tempfile.mkstemp(prefix='.jfm-',dir=dest.parent);os.close(fd)
    try:
        shutil.copyfile(source,tmp);os.chown(tmp,uid,gid);os.chmod(tmp,0o644);os.replace(tmp,dest)
    finally:
        if os.path.exists(tmp): os.unlink(tmp)
PY
SINCE="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
docker start "$CONTAINER" >/dev/null
STOPPED=0
end=$((SECONDS+READY_TIMEOUT))
ready=0
while (( SECONDS < end )); do
  if docker logs --since "$SINCE" "$CONTAINER" 2>&1 | grep -q 'Done ('; then
    if docker exec -i "$CONTAINER" rcon-cli -- 'list' >/dev/null 2>&1; then ready=1;break;fi
  fi
  sleep 3
done
[[ "$ready" -eq 1 ]] || { echo 'Startup timeout; inspect logs. Do not claim ready.' >&2; exit 1; }
python3 - "$BUNDLE/manifest.json" "$CONTAINER" <<'PY'
import json,subprocess,re,sys
m=json.load(open(sys.argv[1]));c=sys.argv[2]
for phase in ('post_start_commands','health_checks'):
    for item in m.get(phase,[]):
        output=subprocess.check_output(['docker','exec','-i',c,'rcon-cli','--',item['command']],text=True)
        print(item['command']);print(output)
        assert re.search(item['expect_regex'],output), 'Unexpected RCON response; stop validation'
PY
printf '%s\n' "$MANIFEST_HASH" > "$MARKER"
chown "$TARGET_UID:$TARGET_GID" "$MARKER"
chmod 600 "$MARKER"
echo "Bundle installed and console checks passed. Backup: $BACKUP"
echo 'Player acceptance tests are still required; this does not prove a full playable match.'
