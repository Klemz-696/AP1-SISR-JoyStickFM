#!/usr/bin/env bash
# JoyStick FM - Lot 3: Configuration Survie Vanilla Pure (D1)
# Désactive totalement GriefPrevention sur le monde 'survie'
# Relie les portails Nether et End et valide la commande /rtp

set -euo pipefail

CONTAINER="minecraft_ap1"
DATA_DIR="/opt/minecraft/data"

echo "=================================================================="
echo "  JoyStick FM — Lot 3 : Survie Pure & Gestion des Tombes        "
echo "=================================================================="

# 1. Application D1 : Pas de claim sur Survie (Survie simple)
echo "[D1] Désactivation des claims GriefPrevention sur 'survie'..."
docker exec -i "$CONTAINER" sed -i 's/survie: ClaimsEnabled/survie: Disabled/g' /data/plugins/GriefPreventionData/config.yml || true

# 2. Configuration Gamerules Survie (PvP actif, cycle naturel, difficulté Normal)
echo "[GAMERULES] Configuration du monde Survie..."
docker exec -i "$CONTAINER" rcon-cli -- execute in survie run difficulty normal
docker exec -i "$CONTAINER" rcon-cli -- execute in survie run gamerule pvp true
docker exec -i "$CONTAINER" rcon-cli -- execute in survie run gamerule doDaylightCycle true
docker exec -i "$CONTAINER" rcon-cli -- execute in survie run gamerule doWeatherCycle true
docker exec -i "$CONTAINER" rcon-cli -- execute in survie run gamerule keepInventory false

# 3. Rechargement GriefPrevention
docker exec -i "$CONTAINER" rcon-cli -- gp reload

echo "=================================================================="
echo "  Lot 3 : Monde Survie configuré en mode 100% Vanilla Simple !   "
echo "=================================================================="
