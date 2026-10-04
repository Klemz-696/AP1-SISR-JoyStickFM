#!/bin/bash
# ==============================================================================
# Script de Finalisation WordPress & Thème JoyStick FM
# Cible : Debian 12 (DMZ Externe - IP: 10.100.0.51)
# ==============================================================================

set -e

echo "=========================================================="
echo " 🚀 FINALISATION & ACTIVATION DU SITE JOYSTICK FM"
echo "=========================================================="

# 1. Ajuster les permissions complètes sur /var/www/html
echo "[1/5] Application des permissions www-data..."
chown -R www-data:www-data /var/www/html
find /var/www/html/ -type d -exec chmod 755 {} \;
find /var/www/html/ -type f -exec chmod 644 {} \;

# 2. Installation de WP-CLI si non présent
echo "[2/5] Vérification et installation de WP-CLI..."
if ! command -v wp &> /dev/null; then
    curl -s -o /usr/local/bin/wp https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
    chmod +x /usr/local/bin/wp
fi

# 3. Installation et configuration du cœur de WordPress
echo "[3/5] Initialisation du CMS WordPress JoyStick FM..."
if ! wp core is-installed --path=/var/www/html --allow-root 2>/dev/null; then
    wp core install \
        --url="http://10.100.0.51" \
        --title="JoyStick FM - La Radio Gaming du Lycée Sidoine Apollinaire" \
        --admin_user="admin_joystick" \
        --admin_password="JoystickFM_Admin2026!" \
        --admin_email="admin@joystickfm.local" \
        --skip-email \
        --path=/var/www/html \
        --allow-root
    echo "  -> WordPress installé avec succès !"
else
    echo "  -> WordPress est déjà initialisé."
fi

# 4. Activation du thème personnalisé JoyStick FM
echo "[4/5] Activation du thème 'joystickfm-theme'..."
wp theme activate joystickfm-theme --path=/var/www/html --allow-root

# 5. Création des pages officielles et configuration des URLs réécrites
echo "[5/5] Création des pages et configuration des permaliens..."
wp rewrite structure '/%postname%/' --path=/var/www/html --allow-root

# Création des pages si elles n'existent pas déjà
for slug in "radio:Radio" "podcasts:Podcasts" "blog:Blog" "contact:Contact" "mentions-legales:Mentions Légales" "politique-confidentialite:Politique de Confidentialité" "plan-du-site:Plan du Site"; do
    NAME="${slug%%:*}"
    TITLE="${slug##*:}"
    if ! wp post list --post_type=page --name="$NAME" --field=ID --path=/var/www/html --allow-root | grep -q '^[0-9]'; then
        wp post create --post_type=page --post_title="$TITLE" --post_name="$NAME" --post_status=publish --path=/var/www/html --allow-root >/dev/null
        echo "  -> Page '$TITLE' (/$NAME) créée."
    fi
done

# Flush des règles de réécriture Apache
wp rewrite flush --path=/var/www/html --allow-root
systemctl restart apache2

echo "=========================================================="
echo " ✅ PORTAIL WEB JOYSTICK FM 100% OPÉRATIONNEL !"
echo " 👉 Accès Web : http://10.100.0.51"
echo " 👉 Administration : http://10.100.0.51/wp-admin"
echo "    Identifiant : admin_joystick"
echo "    Mot de passe : JoystickFM_Admin2026!"
echo "=========================================================="
