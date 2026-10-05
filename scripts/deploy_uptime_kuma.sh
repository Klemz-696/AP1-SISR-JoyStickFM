#!/bin/bash
# ==============================================================================
# Déploiement Automatisé du Tableau de Bord de Supervision Uptime Kuma
# AP 1 BTS SIO SISR — Lycée Sidoine Apollinaire
# Cible : Poste-Clement-projet (VM 11011 - Linux Mint / 192.168.200.4 / 100.88.228.38)
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}==================================================================${NC}"
echo -e "${CYAN} 📊 DÉPLOIEMENT DU DASHBOARD DE SUPERVISION UPTIME KUMA          ${NC}"
echo -e "${CYAN}==================================================================${NC}"

# 1. Vérification des privilèges
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}[!] Ce script doit être exécuté avec sudo : sudo ./deploy_uptime_kuma.sh${NC}"
    exit 1
fi

# 2. Installation de Docker et Docker Compose si absents
echo -e "\n${YELLOW}[1/4] Vérification de l'environnement Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "Docker n'est pas installé. Installation de docker.io pour Linux Mint..."
    apt-get update
    apt-get install -y docker.io docker-compose-v2 || apt-get install -y docker.io
    systemctl enable --now docker
    echo -e "${GREEN}[OK] Docker installé avec succès.${NC}"
else
    echo -e "${GREEN}[OK] Docker est déjà opérationnel : $(docker --version)${NC}"
fi

# 3. Création de l'arborescence
UPTIME_DIR="/opt/uptime-kuma"
echo -e "\n${YELLOW}[2/4] Préparation du répertoire $UPTIME_DIR...${NC}"
mkdir -p "$UPTIME_DIR/data"
chmod -R 775 "$UPTIME_DIR"

# 4. Génération du docker-compose.yml
echo -e "\n${YELLOW}[3/4] Écriture de la configuration docker-compose.yml...${NC}"
cat << 'EOF' > "$UPTIME_DIR/docker-compose.yml"
version: '3.8'

services:
  uptime-kuma:
    image: louislam/uptime-kuma:2
    container_name: uptime-kuma
    restart: always
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
    environment:
      - UPTIME_KUMA_PORT=3001
EOF

# 5. Démarrage du conteneur
echo -e "\n${YELLOW}[4/4] Démarrage du conteneur Uptime Kuma...${NC}"
cd "$UPTIME_DIR"
docker compose down || true
docker compose up -d

echo -e "\n${GREEN}==================================================================${NC}"
echo -e "${GREEN} ✅ DÉPLOIEMENT UPTIME KUMA RÉUSSI AVEC SUCCÈS !                ${NC}"
echo -e "${GREEN}==================================================================${NC}"
echo -e "Accédez à votre tableau de bord de supervision :"
echo -e " • Depuis le réseau LAN / WireGuard : ${CYAN}http://192.168.200.4:3001${NC}"
echo -e " • Depuis Tailscale (Anywhere)      : ${CYAN}http://100.88.228.38:3001${NC}"
echo -e " • En local sur Poste-Clément       : ${CYAN}http://localhost:3001${NC}"
echo -e "==================================================================\n"
