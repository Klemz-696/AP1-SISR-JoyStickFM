#!/usr/bin/env bash
# ==============================================================================
# JoyStick FM — Script de Synchronisation Rapide Serveur VM
# ==============================================================================
set -e

echo "=== [1/3] Mise à jour du dépôt Git ==="
cd /opt/minecraft/repo
git pull origin main

echo "=== [2/3] Synchronisation des fichiers et configurations ==="
python3 Perplexity/JoyStickFM_Production_Lots_0_a_7/sync_full_server.py

echo "=== [3/3] Vérification de l'état du conteneur et des tests ==="
python3 Perplexity/JoyStickFM_Production_Lots_0_a_7/verify_master_lots_0_to_7.py

echo "=== Déploiement et synchronisation 100% terminés ! ==="
