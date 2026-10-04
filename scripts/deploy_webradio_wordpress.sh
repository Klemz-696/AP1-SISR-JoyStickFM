#!/bin/bash
# ==============================================================================
# Script de déploiement automatique - Portail Web WordPress & Thème JoyStick FM
# Cible : Debian 12 (DMZ Externe - IP: 10.100.0.51)
# Projet AP 1 BTS SIO SISR - Binôme 04 & 10
# ==============================================================================

set -e

echo "=========================================================="
echo " 🌐 DÉPLOIEMENT COMPLET WORDPRESS & THÈME JOYSTICK FM"
echo "=========================================================="

export DEBIAN_FRONTEND=noninteractive

# 1. Mise à jour et installation de la pile LAMP (Apache, MariaDB, PHP 8.2)
apt-get update
apt-get install -y apache2 mariadb-server php php-mysql php-curl php-gd php-mbstring php-xml php-xmlrpc php-soap php-intl php-zip curl wget rsync

# 2. Activation des modules Apache indispensables (Reverse Proxy Audio + Réécriture URL)
a2enmod rewrite proxy proxy_http headers

# 3. Sécurisation et initialisation de la base de données MariaDB
systemctl enable --now mariadb
mysql -u root << 'SQL'
CREATE DATABASE IF NOT EXISTS joystickfm_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'joystick_user'@'localhost' IDENTIFIED BY 'JoystickFM_2026_Secure!';
GRANT ALL PRIVILEGES ON joystickfm_db.* TO 'joystick_user'@'localhost';
FLUSH PRIVILEGES;
SQL

# 4. Installation du CMS WordPress officiel en français
cd /tmp
wget -q https://fr.wordpress.org/latest-fr_FR.tar.gz
rm -rf /var/www/html/*
tar -xzf latest-fr_FR.tar.gz -C /tmp
cp -r /tmp/wordpress/* /var/www/html/
rm -rf /tmp/wordpress latest-fr_FR.tar.gz

# 5. Configuration de wp-config.php avec résolution dynamique de l'hôte (IP locale et WAN)
cat << 'EOF' > /var/www/html/wp-config.php
<?php
define('DB_NAME', 'joystickfm_db');
define('DB_USER', 'joystick_user');
define('DB_PASSWORD', 'JoystickFM_2026_Secure!');
define('DB_HOST', 'localhost');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');

// Clés uniques et sels d'authentification
define('AUTH_KEY',         '6e8c7512a88494b980e15bfa881b831c7752b04f981e4b9d5ecbb7580e0c8104');
define('SECURE_AUTH_KEY',  '6e25f8b9d3e8a4a58b901fc182b8423d6a992a54823db8cfb088e8971f30d051');
define('LOGGED_IN_KEY',    '5c490a88092a912bbcb89b2db971c26b91dc3895e6914589d81ba235a901e741');
define('NONCE_KEY',        '3491ba8cf8b9001ea91745db28394b0a8849b2df88e91c7752b04f981e4b9d5e');
define('AUTH_SALT',        '2b91dc3895e6914589d81ba235a901e7416e8c7512a88494b980e15bfa881b83');
define('SECURE_AUTH_SALT', '1c7752b04f981e4b9d5ecbb7580e0c81046e25f8b9d3e8a4a58b901fc182b842');
define('LOGGED_IN_SALT',   '823db8cfb088e8971f30d0515c490a88092a912bbcb89b2db971c26b91dc3895');
define('NONCE_SALT',       'e6914589d81ba235a901e7413491ba8cf8b9001ea91745db28394b0a8849b2df');

$table_prefix = 'wp_';
define('WP_DEBUG', false);

// DIRECTIVES ÉPROUVÉES : Résolution dynamique d'hôte pour accès transparent LAN (10.100.0.51) et WAN (192.168.101.37)
if (isset($_SERVER['HTTP_HOST'])) {
    define('WP_HOME', 'http://' . $_SERVER['HTTP_HOST']);
    define('WP_SITEURL', 'http://' . $_SERVER['HTTP_HOST']);
} else {
    define('WP_HOME', 'http://10.100.0.51');
    define('WP_SITEURL', 'http://10.100.0.51');
}
define('CONCATENATE_SCRIPTS', false);

if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/');
}
require_once ABSPATH . 'wp-settings.php';
EOF

# 6. Configuration du VirtualHost Apache (Reverse-Proxy Audio vers Icecast 10.100.0.50)
cat << 'EOF' > /etc/apache2/sites-available/000-default.conf
<VirtualHost *:80>
    ServerAdmin admin@joystickfm.local
    DocumentRoot /var/www/html

    <Directory /var/www/html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Reverse-Proxy Audio transparent vers le serveur Icecast DMZ
    ProxyPass "/radio-stream.mp3" "http://10.100.0.50:8000/joystick-fm" flushpackets=on disablereuse=on
    ProxyPassReverse "/radio-stream.mp3" "http://10.100.0.50:8000/joystick-fm"

    Header set Access-Control-Allow-Origin "*"

    ErrorLog ${APACHE_LOG_DIR}/joystick_error.log
    CustomLog ${APACHE_LOG_DIR}/joystick_access.log combined
</VirtualHost>
EOF

# 7. Permissions du répertoire WordPress
chown -R www-data:www-data /var/www/html
find /var/www/html/ -type d -exec chmod 755 {} \;
find /var/www/html/ -type f -exec chmod 644 {} \;

# 8. Redémarrage d'Apache
systemctl restart apache2

echo "✅ Pile LAMP & WordPress déployés avec succès sur 10.100.0.51 !"
echo "👉 Prochaine étape : synchroniser le thème personnalisé 'joystickfm-theme' dans /var/www/html/wp-content/themes/"
