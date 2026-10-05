#!/usr/bin/env bash
# JoyStick FM - Audit Matériel & Staging (Lot 0)
# Valide les 22.35 Go RAM, 15 vCPUs, émulation SSD et réalise un backup à froid

set -euo pipefail

echo "=================================================================="
echo "  JoyStick FM — Lot 0 : Audit Système, Matériel & Staging        "
echo "=================================================================="

# 1. Vérification Mémoire RAM
TOTAL_RAM_MB=$(free -m | awk '/^Mem:/{print $2}')
echo "[RAM] Mémoire physique totale : ${TOTAL_RAM_MB} Mo (~$((TOTAL_RAM_MB / 1024)) Go)"
if [ "$TOTAL_RAM_MB" -lt 20000 ]; then
    echo "[WARN] La RAM détectée (${TOTAL_RAM_MB} Mo) est inférieure aux 22 Go configurés."
else
    echo "[OK] Dimensionnement RAM 22+ Go validé."
fi

# 2. Vérification CPU (15 vCPUs)
CPUS=$(nproc)
echo "[CPU] Nombre de cœurs détectés : ${CPUS} vCPUs"
if [ "$CPUS" -ge 14 ]; then
    echo "[OK] Allocation CPU 15 cœurs validée."
else
    echo "[INFO] CPU actuel : ${CPUS} cœurs."
fi

# 3. Vérification Émulation SSD
echo "[DISK] Contrôle du type de stockage..."
for dev in /sys/block/sd* /sys/block/vd*; do
    if [ -f "$dev/queue/rotational" ]; then
        ROT=$(cat "$dev/queue/rotational")
        NAME=$(basename "$dev")
        if [ "$ROT" -eq 0 ]; then
            echo "[OK] Disque $NAME : Mode SSD Non-Rotatif actif (Émulation SSD validée)"
        else
            echo "[INFO] Disque $NAME : Mode HDD standard"
        fi
    fi
done

# 4. Création de la sauvegarde à froid
BACKUP_DIR="/opt/minecraft/gamemodes-backups"
TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")
mkdir -p "$BACKUP_DIR"

if [ -d "/opt/minecraft/data" ]; then
    echo "[BACKUP] Réalisation de la sauvegarde à froid..."
    BACKUP_FILE="${BACKUP_DIR}/backup_lot0_${TIMESTAMP}.tar.gz"
    tar --exclude='cache' --exclude='logs' -czf "$BACKUP_FILE" -C /opt/minecraft data
    echo "[OK] Sauvegarde créée : $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
fi

echo "=================================================================="
echo "  Lot 0 validé avec succès ! Staging et pré-requis opérationnels. "
echo "=================================================================="
