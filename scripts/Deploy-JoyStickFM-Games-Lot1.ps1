<#
==============================================================================
 JoyStick FM — Script de Déploiement Automatisé Lot 1 (PowerShell)
 Cible : VM Debian 12 WordPress (10.100.0.51)
==============================================================================
#>

[CmdletBinding()]
param (
    [string]$TargetHost = "10.100.0.51",
    [string]$TargetUser = "root",
    [string]$RemoteWpPath = "/var/www/html"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " 🚀 JOYSTICK FM - DÉPLOIEMENT DU LOT 1 (COMPTES & JEUX)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Test de connectivité
Write-Host "`n[1/5] Test de connectivité vers ${TargetHost}:22..." -ForegroundColor Yellow
$tcpTest = Test-NetConnection -ComputerName $TargetHost -Port 22 -WarningAction SilentlyContinue

if (-not $tcpTest.TcpTestSucceeded) {
    Write-Host "❌ Connexion SSH impossible vers ${TargetHost}:22 !" -ForegroundColor Red
    Write-Host "   -> Vérifiez l'état du tunnel VPN WireGuard (WG-Tunnel-VPN-AP1)." -ForegroundColor DarkYellow
    Write-Host "   -> Si vous êtes hors du lab physique, vérifiez que le routeur de sous-réseau (posteclement / 192.168.101.37) est allumé et connecté." -ForegroundColor DarkYellow
    exit 1
}
Write-Host "✅ Hôte $TargetHost accessible sur le port SSH 22." -ForegroundColor Green

# 2. Transfert du plugin joystickfm-games
$LocalPluginDir = Join-Path $PSScriptRoot "..\AP_Webradio\3- Website\joystickfm-games"
$RemotePluginDir = "$RemoteWpPath/wp-content/plugins/joystickfm-games"

Write-Host "`n[2/5] Déploiement du plugin 'joystickfm-games' vers $RemotePluginDir..." -ForegroundColor Yellow
scp -r -o StrictHostKeyChecking=no "$LocalPluginDir" "${TargetUser}@${TargetHost}:${RemoteWpPath}/wp-content/plugins/"
Write-Host "✅ Fichiers du plugin transférés avec succès." -ForegroundColor Green

# 3. Synchronisation des fichiers du thème mis à jour
$LocalThemeDir = Join-Path $PSScriptRoot "..\AP_Webradio\3- Website\joystickfm-theme"
$RemoteThemeDir = "$RemoteWpPath/wp-content/themes/joystickfm-theme"

Write-Host "`n[3/5] Déploiement des templates et assets du thème JoyStick FM..." -ForegroundColor Yellow
scp -o StrictHostKeyChecking=no "$LocalThemeDir\header.php" "$TargetUser@$TargetHost`:$RemoteThemeDir/header.php"
scp -o StrictHostKeyChecking=no "$LocalThemeDir\footer.php" "$TargetUser@$TargetHost`:$RemoteThemeDir/footer.php"
scp -o StrictHostKeyChecking=no "$LocalThemeDir\page.php" "$TargetUser@$TargetHost`:$RemoteThemeDir/page.php"
scp -o StrictHostKeyChecking=no "$LocalThemeDir\assets\css\style.css" "$TargetUser@$TargetHost`:$RemoteThemeDir/assets/css/style.css"
scp -o StrictHostKeyChecking=no "$LocalThemeDir\assets\js\chat.js" "$TargetUser@$TargetHost`:$RemoteThemeDir/assets/js/chat.js"
scp -o StrictHostKeyChecking=no "$LocalThemeDir\assets\js\joystick-launch-game.js" "$TargetUser@$TargetHost`:$RemoteThemeDir/assets/js/joystick-launch-game.js"
scp -o StrictHostKeyChecking=no "$LocalThemeDir\assets\php\chat-handler.php" "$TargetUser@$TargetHost`:$RemoteThemeDir/assets/php/chat-handler.php"
Write-Host "✅ Fichiers du thème synchronisés avec succès." -ForegroundColor Green

# 4. Exécution du script de finalisation sur le serveur
$RemoteScript = Join-Path $PSScriptRoot "deploy_joystickfm_games_lot1.sh"
Write-Host "`n[4/5] Exécution des configurations sur le serveur distant (WP-CLI, BDD, Permaliens)..." -ForegroundColor Yellow
Get-Content $RemoteScript -Raw | ssh -o StrictHostKeyChecking=no "$TargetUser@$TargetHost" "bash -s"

# 5. Validation des endpoints HTTP
Write-Host "`n[5/5] Test des routes HTTP..." -ForegroundColor Yellow
$Routes = @("/jeux/", "/activites/", "/compte/")
foreach ($route in $Routes) {
    $code = ssh -o StrictHostKeyChecking=no "$TargetUser@$TargetHost" "curl -s -o /dev/null -w '%{http_code}' 'http://localhost$route'"
    if ($code -eq "200") {
        Write-Host "  -> Route $route : HTTP $code OK" -ForegroundColor Green
    } else {
        Write-Host "  -> Route $route : HTTP $code (à vérifier)" -ForegroundColor Yellow
    }
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " 🎉 DÉPLOIEMENT DU LOT 1 TERMINÉ AVEC SUCCÈS !" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
