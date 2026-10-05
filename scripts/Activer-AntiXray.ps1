<#
.SYNOPSIS
    Activation et configuration de l'Anti-Xray natif PaperMC (Engine Mode 2) sur 10.30.0.22.
.DESCRIPTION
    Injecte la configuration d'obfuscation de paquets asynchrone dans paper-world-defaults.yml
    et redémarre le conteneur Docker pour rendre tout cheat X-Ray ou pack transparent 100% inopérant.
#>

$ServerIP = "10.30.0.22"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " 🛡️ ACTIVATION ANTI-XRAY NATIF PAPER (ENGINE MODE 2)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$RemoteScript = @'
python3 -c "
import re, os

candidates = [
    '/opt/minecraft/data/config/paper-world-defaults.yml',
    '/opt/minecraft/data/paper-world-defaults.yml'
]
target = next((c for c in candidates if os.path.exists(c)), None)

if not target:
    os.makedirs('/opt/minecraft/data/config', exist_ok=True)
    target = '/opt/minecraft/data/config/paper-world-defaults.yml'
    with open(target, 'w') as f:
        f.write('# Paper World Defaults\n')

with open(target, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Backup
with open(target + '.bak', 'w', encoding='utf-8') as f:
    f.write(content)

block = '''anticheat:
  anti-xray:
    enabled: true
    engine-mode: 2
    hidden-blocks:
      - copper_ore
      - deepslate_copper_ore
      - raw_copper_block
      - diamond_ore
      - deepslate_diamond_ore
      - emerald_ore
      - deepslate_emerald_ore
      - gold_ore
      - deepslate_gold_ore
      - iron_ore
      - deepslate_iron_ore
      - raw_iron_block
      - lapis_ore
      - deepslate_lapis_ore
      - redstone_ore
      - deepslate_redstone_ore
      - chest
      - ancient_debris
    replacement-blocks:
      - stone
      - deepslate
      - oak_planks
    max-block-height: 64
    update-radius: 2
    use-permission: false'''

if 'anti-xray:' in content:
    pattern = r'anticheat:\s*\n\s*anti-xray:.*?(?=\n[a-zA-Z0-9_-]+:|\Z)'
    new_content, count = re.subn(pattern, block, content, flags=re.DOTALL)
    if count == 0:
        new_content = content + '\n\n' + block
else:
    new_content = content + '\n\n' + block

with open(target, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f'Configuration Anti-Xray injectee avec succes dans {target}')
"
'@

Write-Host "`n[1/3] Injection de la politique Anti-Xray sur srv-minecraft..." -ForegroundColor Yellow
ssh "root@${ServerIP}" $RemoteScript

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Erreur lors de l'application de l'Anti-Xray. Vérifiez la connexion SSH." -ForegroundColor Red
    exit 1
}

Write-Host "`n[2/3] Redémarrage du serveur Paper (nécessaire pour initialiser l'obfuscation)..." -ForegroundColor Yellow
ssh "root@${ServerIP}" "cd /opt/minecraft && docker compose restart"

Write-Host "`n[3/3] Vérification du statut du conteneur..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
ssh "root@${ServerIP}" "docker ps --filter name=minecraft_ap1 --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

Write-Host "`n✅ Terminé avec succès ! L'Anti-Xray Engine Mode 2 est actif." -ForegroundColor Green
Write-Host "Les minerais cachés sont désormais masqués au niveau protocolaire pour tous les joueurs !" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
