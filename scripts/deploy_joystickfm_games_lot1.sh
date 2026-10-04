#!/bin/bash
# ==============================================================================
# JoyStick FM — Déploiement automatisé du Lot 1 (Comptes, Jeux, Activités)
# Cible : VM Debian 12 WordPress (10.100.0.51)
# ==============================================================================
set -e

echo "=========================================================="
echo " 🎮 DÉPLOIEMENT DU LOT 1 : JOYSTICK FM GAMES & COMPTES"
echo "=========================================================="

WP_PATH="/var/www/html"
PLUGIN_DIR="${WP_PATH}/wp-content/plugins/joystickfm-games"
THEME_DIR="${WP_PATH}/wp-content/themes/joystickfm-theme"

# 1. Vérification et création du répertoire plugin
echo "[1/6] Préparation du répertoire plugin..."
mkdir -p "${PLUGIN_DIR}"

# 2. Permissions www-data
echo "[2/6] Application des permissions..."
chown -R www-data:www-data "${PLUGIN_DIR}" "${THEME_DIR}"
chmod -R 755 "${PLUGIN_DIR}"

# 3. Activation du plugin via WP-CLI
echo "[3/6] Activation du plugin joystickfm-games..."
wp plugin activate joystickfm-games --path="${WP_PATH}" --allow-root

# 4. Régénération des permaliens
echo "[4/6] Rafraîchissement des règles de réécriture..."
wp rewrite flush --path="${WP_PATH}" --allow-root

# 5. Contrôle des tables MariaDB
echo "[5/6] Vérification des tables MariaDB..."
wp db query "SHOW TABLES LIKE 'wp_jfm_%';" --path="${WP_PATH}" --allow-root

# 6. Contrôle des pages créées
echo "[6/6] Contrôle des pages provisionnées..."
wp post list --post_type=page --fields=ID,post_title,post_name,post_status --path="${WP_PATH}" --allow-root

echo "=========================================================="
echo " ✅ LOT 1 DÉPLOYÉ ET OPÉRATIONNEL SUR LE SERVEUR WEB !"
echo "=========================================================="
