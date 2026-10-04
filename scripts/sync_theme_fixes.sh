#!/bin/bash
set -e

THEME_DIR="/var/www/html/wp-content/themes/joystickfm-theme"

# 1. Remplacer les anciennes adresses IP théoriques par les IP réelles du VLAN 100 DMZ
sed -i 's/10\.10\.10\.12/10.100.0.50/g' "$THEME_DIR/functions.php"
sed -i 's/10\.10\.10\.12/10.100.0.50/g' "$THEME_DIR/assets/php/icecast-proxy.php"
sed -i 's/10\.10\.10\.12/10.100.0.50/g' "$THEME_DIR/assets/php/stream-proxy.php"
sed -i 's/10\.10\.10\.12/10.100.0.50/g' "$THEME_DIR/page-radio.php"

sed -i 's/10\.10\.10\.10/10.100.0.52/g' "$THEME_DIR/page-mentions-legales.php"
sed -i 's/10\.10\.10\.11/10.100.0.51/g' "$THEME_DIR/page-mentions-legales.php"
sed -i 's/10\.10\.10\.12/10.100.0.50/g' "$THEME_DIR/page-mentions-legales.php"
sed -i 's/10\.10\.10\.0\/24/10.100.0.0\/24/g' "$THEME_DIR/page-mentions-legales.php"
sed -i 's/VMware vSphere/Proxmox VE/g' "$THEME_DIR/page-mentions-legales.php"

sed -i 's/10\.10\.10\.10/10.100.0.52/g' "$THEME_DIR/page-plan-du-site.php"
sed -i 's/10\.10\.10\.11/10.100.0.51/g' "$THEME_DIR/page-plan-du-site.php"
sed -i 's/10\.10\.10\.12/10.100.0.50/g' "$THEME_DIR/page-plan-du-site.php"
sed -i 's/10\.10\.10\.0\/24/10.100.0.0\/24/g' "$THEME_DIR/page-plan-du-site.php"
sed -i 's/VMware vSphere/Proxmox VE/g' "$THEME_DIR/page-plan-du-site.php"

# 2. Permissions
chown -R www-data:www-data "$THEME_DIR"

echo "✅ Adresses IP et métadonnées du thème synchronisées avec le VLAN 100 !"
