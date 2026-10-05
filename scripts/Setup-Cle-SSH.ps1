<#
.SYNOPSIS
    Configuration automatique de la clé SSH nomade sur la VM Minecraft (10.30.0.22).
.DESCRIPTION
    Injecte la clé publique id_ed25519 de ce PC portable dans ~/.ssh/authorized_keys
    sur le serveur pour permettre les transferts SCP et commandes RCON sans mot de passe.
#>

$ServerIP = "10.30.0.22"
$PubKeyFile = "$env:USERPROFILE\.ssh\id_ed25519.pub"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " 🔑 CONFIGURATION CLE SSH NOMADE -- SERVEUR MINECRAFT" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not (Test-Path $PubKeyFile)) {
    Write-Host "Generation d'une nouvelle paire de cles ED25519..." -ForegroundColor Yellow
    ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\id_ed25519" -N '""'
}

$PubKey = (Get-Content $PubKeyFile -Raw).Trim()
Write-Host "Cle publique detectee." -ForegroundColor Gray
Write-Host "`nConnexion a root@$ServerIP (entrez le mot de passe root une derniere fois)..." -ForegroundColor Yellow

$RemoteCmd = "mkdir -p /root/.ssh; chmod 700 /root/.ssh; echo '$PubKey' >> /root/.ssh/authorized_keys; sort -u /root/.ssh/authorized_keys -o /root/.ssh/authorized_keys; chmod 600 /root/.ssh/authorized_keys"

ssh root@$ServerIP $RemoteCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSucces ! Votre cle SSH est autorisee sur le serveur." -ForegroundColor Green
    Write-Host "Les deploiements seront desormais instantanes sans mot de passe !" -ForegroundColor Green
} else {
    Write-Host "`nEchec de la configuration. Verifiez le mot de passe ou la liaison WireGuard." -ForegroundColor Red
}
Write-Host "==========================================================" -ForegroundColor Cyan
