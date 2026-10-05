<#
.SYNOPSIS
    Déploiement automatisé de plugins Minecraft vers le serveur Paper (VM 10.30.0.22).
.DESCRIPTION
    Transfère un ou plusieurs fichiers .jar dans /opt/minecraft/data/plugins/,
    applique automatiquement les permissions Docker (1000:1000, chmod 755),
    recharge la configuration du serveur via RCON et affiche la liste des plugins actifs.
.PARAMETER PluginPath
    Chemin vers le fichier .jar du plugin à installer (optionnel).
.EXAMPLE
    .\Deploy-Plugin.ps1
    .\Deploy-Plugin.ps1 -PluginPath "C:\chemin\mon-plugin.jar"
#>

param (
    [Parameter(Mandatory = $false, Position = 0)]
    [string]$PluginPath
)

$ServerIP = "10.30.0.22"
$RemotePluginsDir = "/opt/minecraft/data/plugins"
$LocalPluginsFolder = "$PSScriptRoot\..\plugins_a_installer"

# Créer le dossier local de dépôt s'il n'existe pas
if (-not (Test-Path $LocalPluginsFolder)) {
    New-Item -ItemType Directory -Path $LocalPluginsFolder -Force | Out-Null
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " 🚀 DÉPLOIEMENT RAPIDE DE PLUGINS — SERVEUR PAPER 26.2" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$FilesToDeploy = @()

# Si aucun chemin n'est passé en paramètre, chercher dans le dossier local ou demander
if (-not $PluginPath) {
    $JarsInFolder = Get-ChildItem -Path $LocalPluginsFolder -Filter "*.jar"
    if ($JarsInFolder.Count -gt 0) {
        Write-Host "Plugins prêts à être déployés dans 'plugins_a_installer' :" -ForegroundColor Yellow
        foreach ($item in $JarsInFolder) {
            $SizeKB = [math]::Round($item.Length / 1024, 1)
            $msg = " - " + $item.Name + " (" + $SizeKB + " Ko)"
            Write-Host $msg -ForegroundColor White
        }
        $Confirm = Read-Host "`nDéployer l'ensemble de ces plugins vers le serveur ? (O/N)"
        if ($Confirm -eq 'O' -or $Confirm -eq 'o') {
            $FilesToDeploy = $JarsInFolder.FullName
        } else {
            Write-Host "Opération annulée." -ForegroundColor Red
            exit
        }
    } else {
        $PluginPath = Read-Host "Glissez-déposez le fichier .jar ou entrez son chemin"
        $PluginPath = $PluginPath.Trim('"', "'")
        if ($PluginPath -and (Test-Path $PluginPath)) {
            $FilesToDeploy = @($PluginPath)
        }
    }
} else {
    $PluginPath = $PluginPath.Trim('"', "'")
    if (Test-Path $PluginPath) {
        $FilesToDeploy = @($PluginPath)
    }
}

if ($FilesToDeploy.Count -eq 0) {
    Write-Host "Aucun plugin à déployer trouvé." -ForegroundColor Red
    exit 1
}

Write-Host "`n[1/3] Transfert SCP vers $ServerIP..." -ForegroundColor Yellow
if ($FilesToDeploy.Count -gt 1) {
    scp "$LocalPluginsFolder\*.jar" "root@${ServerIP}:${RemotePluginsDir}/"
} else {
    scp $FilesToDeploy[0] "root@${ServerIP}:${RemotePluginsDir}/"
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Erreur lors du transfert SCP. Vérifiez l'accès VPN WireGuard et le mot de passe." -ForegroundColor Red
    exit 1
}

Write-Host "`n[2/3] Ajustement des permissions Docker (UID 1000, chmod 755)..." -ForegroundColor Yellow
ssh "root@${ServerIP}" "chown -R 1000:1000 $RemotePluginsDir; chmod 755 $RemotePluginsDir/*.jar"

Write-Host "`n[3/3] Rechargement du serveur Paper via RCON..." -ForegroundColor Yellow
ssh "root@${ServerIP}" "docker exec -i minecraft_ap1 rcon-cli reload confirm"

Write-Host "`n📋 État actuel des plugins actifs :" -ForegroundColor Cyan
ssh "root@${ServerIP}" "docker exec -i minecraft_ap1 rcon-cli plugins"

Write-Host "`n✅ Terminé avec succès ! Tous les plugins sont opérationnels." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
