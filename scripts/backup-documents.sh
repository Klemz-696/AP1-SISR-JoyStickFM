#!/bin/bash
# ==============================================================================
# Script de sauvegarde automatique des documents employé vers le serveur SMB (AP1)
# Binôme 04 & 10 - BTS SIO SISR (2e année)
# ==============================================================================

SOURCE_DIR="$HOME/Documents"
SERVER_IP="10.30.0.20"
SHARE_NAME="Partage"
MOUNT_POINT="/mnt/partage_sauvegarde"
USER_NAME="clement04"
LOG_DIR="$HOME/.local/share/sauvegarde_ap1/logs"
DATE_STR=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_FILE="$LOG_DIR/backup_${DATE_STR}.log"

mkdir -p "$LOG_DIR"

log_msg() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_msg "=== Début de la sauvegarde automatique des documents employé ==="
log_msg "Source : $SOURCE_DIR"
log_msg "Serveur cible : $SERVER_IP (Partage: $SHARE_NAME)"

# 1. Vérification de la joignabilité du serveur de fichiers (Port SMB 445)
log_msg "Vérification de la connectivité réseau vers le serveur SMB..."
if ! nc -z -w 3 "$SERVER_IP" 445; then
    log_msg "[ERREUR] Le serveur de fichiers ($SERVER_IP) n'est pas joignable sur le port 445."
    log_msg "Vérifiez que la liaison VPN est active. Sauvegarde reportée."
    exit 1
fi
log_msg "[OK] Serveur joignable."

# 2. Montage temporaire CIFS ou utilisation d'un point de montage existant
TARGET_BACKUP_DIR=""
if mountpoint -q "$MOUNT_POINT"; then
    TARGET_BACKUP_DIR="$MOUNT_POINT/Sauvegardes_$USER_NAME"
elif [ -d "/run/user/$UID/gvfs/smb-share:server=$SERVER_IP,share=$SHARE_NAME" ]; then
    TARGET_BACKUP_DIR="/run/user/$UID/gvfs/smb-share:server=$SERVER_IP,share=$SHARE_NAME/Sauvegardes_$USER_NAME"
else
    # Montage CIFS direct
    sudo mkdir -p "$MOUNT_POINT"
    sudo mount -t cifs "//$SERVER_IP/$SHARE_NAME" "$MOUNT_POINT" -o username=employe04,password=Employe04!,uid=$UID,gid=$GID
    TARGET_BACKUP_DIR="$MOUNT_POINT/Sauvegardes_$USER_NAME"
fi

mkdir -p "$TARGET_BACKUP_DIR"

# 3. Synchronisation incrémentale rsync
log_msg "Lancement de la synchronisation incrémentale rsync..."
rsync -avz --update --delete --exclude=".*" "$SOURCE_DIR/" "$TARGET_BACKUP_DIR/" >> "$LOG_FILE" 2>&1
RSYNC_EXIT=$?

if [ $RSYNC_EXIT -eq 0 ]; then
    log_msg "[SUCCÈS] Sauvegarde terminée avec succès."
else
    log_msg "[AVERTISSEMENT] rsync a retourné le code : $RSYNC_EXIT"
fi

# 4. Rotation des logs (conservation 7 jours)
find "$LOG_DIR" -type f -name "backup_*.log" -mtime +7 -delete

log_msg "=== Fin du traitement de sauvegarde ==="
exit $RSYNC_EXIT
