<#
.SYNOPSIS
    Script de sauvegarde automatique des documents employé vers le serveur Windows Server (AP1).
.DESCRIPTION
    Ce script vérifie la joignabilité du serveur de fichiers via le VPN ou le réseau local,
    effectue une copie différentielle/incrémentale des documents vers le partage réseau avec Robocopy,
    génère un fichier de journalisation horodaté et conserve un historique des sauvegardes.
.AUTHOR
    Binôme 04 & 10 - BTS SIO SISR (2e année)
#>

[CmdletBinding()]
param (
    [string]$SourcePath = "$env:USERPROFILE\Documents",
    [string]$ServerIP = "10.30.0.20",
    [string]$ShareName = "Partage",
    [string]$Username = $env:USERNAME,
    [string]$LogFolder = "$env:LOCALAPPDATA\Sauvegarde_AP1\Logs"
)

# Initialisation du dossier de logs
if (-not (Test-Path -Path $LogFolder)) {
    New-Item -ItemType Directory -Path $LogFolder -Force | Out-Null
}

$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$LogFile = Join-Path -Path $LogFolder -ChildPath "Backup_$Timestamp.log"

function Write-Log {
    param([string]$Message)
    $Entry = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message"
    Add-Content -Path $LogFile -Value $Entry
    Write-Output $Entry
}

Write-Log "=== Début de la sauvegarde automatique des documents employé ==="
Write-Log "Source : $SourcePath"
Write-Log "Serveur cible : $ServerIP"

# 1. Vérification de la connectivité au serveur (Test du port SMB 445)
Write-Log "Vérification de l'accès au serveur via le VPN/LAN..."
$PortCheck = Test-NetConnection -ComputerName $ServerIP -Port 445 -WarningAction SilentlyContinue

if (-not $PortCheck.TcpTestSucceeded) {
    Write-Log "[ERREUR] Le serveur de fichiers ($ServerIP) n'est pas joignable sur le port SMB 445."
    Write-Log "Vérifiez que le VPN nomade IPsec est bien connecté. Sauvegarde reportée."
    exit 1
}

Write-Log "[OK] Serveur joignable. Accès au partage réseau en cours..."

# 2. Définition du chemin cible
$DestinationPath = "\\$ServerIP\$ShareName\$Username"

if (-not (Test-Path -Path $DestinationPath)) {
    try {
        New-Item -ItemType Directory -Path $DestinationPath -Force | Out-Null
        Write-Log "Création du dossier utilisateur sur le serveur : $DestinationPath"
    } catch {
        Write-Log "[ERREUR] Impossible de créer le dossier cible : $_"
        exit 2
    }
}

# 3. Exécution de Robocopy pour une synchronisation robuste et incrémentale
# Paramètres :
# /E     : Copie tous les sous-répertoires, y compris les vides
# /XO    : Exclut les fichiers plus anciens déjà présents sur la cible (incrémental)
# /R:2   : 2 tentatives en cas de fichier verrouillé
# /W:5   : 5 secondes d'attente entre deux tentatives
# /NP    : Pas de pourcentage de progression (optimise les logs)
# /LOG+  : Ajoute les détails de transfert au fichier de log

Write-Log "Lancement de la synchronisation Robocopy..."
$RobocopyArgs = @(
    $SourcePath,
    $DestinationPath,
    "/E",
    "/XO",
    "/R:2",
    "/W:5",
    "/NP",
    "/LOG+:$LogFile"
)

$Process = Start-Process -FilePath "robocopy.exe" -ArgumentList $RobocopyArgs -Wait -NoNewWindow -PassThru

# Codes retour Robocopy : <= 7 signifie succès ou fichiers identiques/nouveaux copiés. >= 8 indique une erreur critique.
if ($Process.ExitCode -le 7) {
    Write-Log "[SUCCÈS] Sauvegarde terminée avec succès. Code retour Robocopy : $($Process.ExitCode)"
} else {
    Write-Log "[AVERTISSEMENT/ERREUR] Robocopy a retourné le code $($Process.ExitCode). Consultez les logs pour plus de détails."
}

Write-Log "=== Fin du traitement de sauvegarde ==="
