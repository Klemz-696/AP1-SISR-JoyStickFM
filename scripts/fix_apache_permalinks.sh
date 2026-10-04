#!/bin/bash
set -e

# 1. Activer mod_rewrite
a2enmod rewrite

# 2. Configurer AllowOverride All dans apache2.conf pour /var/www/
sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# 3. Créer le fichier .htaccess officiel WordPress
cat << 'EOF' > /var/www/html/.htaccess
# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress
EOF

# 4. Permissions sur .htaccess
chown www-data:www-data /var/www/html/.htaccess
chmod 644 /var/www/html/.htaccess

# 5. Régénération avec WP-CLI
wp rewrite flush --hard --path=/var/www/html --allow-root

# 6. Redémarrage propre d'Apache
systemctl restart apache2

echo "✅ Règles de réécriture et permaliens réparés avec succès !"
