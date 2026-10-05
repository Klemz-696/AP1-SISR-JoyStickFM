#!/bin/bash
# ==============================================================================
# Script de déploiement automatique - Portail Web & Player Audio (JoyStick FM)
# Cible : Debian 12 (DMZ Externe - IP: 10.100.0.51)
# Projet AP 1 BTS SIO SISR — Binôme 04 & 10
# ==============================================================================

set -e

echo "=========================================================="
echo " 🎵 INSTALLATION & CONFIGURATION PORTAIL WEB JOYSTICK FM"
echo "=========================================================="

# 1. Installation Apache2 & modules nécessaires
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y apache2 curl

# 2. Activation des modules Reverse Proxy
a2enmod proxy
a2enmod proxy_http
a2enmod headers
a2enmod rewrite

# 3. Configuration du VirtualHost avec Reverse-Proxy Audio
cat << 'EOF' > /etc/apache2/sites-available/000-default.conf
<VirtualHost *:80>
    ServerAdmin admin@joystickfm.local
    DocumentRoot /var/www/html

    # Proxy audio optimisé sans coupure vers le serveur Icecast
    ProxyPass "/radio-stream.mp3" "http://10.100.0.50:8000/joystick-fm" flushpackets=on disablereuse=on
    ProxyPassReverse "/radio-stream.mp3" "http://10.100.0.50:8000/joystick-fm"

    # En-têtes CORS pour compatibilité tous navigateurs
    Header set Access-Control-Allow-Origin "*"

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
EOF

# 4. Déploiement de l'interface Web & Player HTML5 JoyStick FM
cat << 'EOF' > /var/www/html/index.html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JoyStick FM — La WebRadio du Lycée Sidoine Apollinaire</title>
    <style>
        :root {
            --primary: #8a2be2;
            --accent: #00e5ff;
            --bg: #0b0f19;
            --card-bg: #151d30;
            --text: #ffffff;
            --subtext: #94a3b8;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: radial-gradient(circle at top, #1e1035 0%, var(--bg) 100%);
            color: var(--text);
            margin: 0;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .player-card {
            background: var(--card-bg);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 40px;
            width: 100%;
            max-width: 480px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(138, 43, 226, 0.2);
            text-align: center;
        }
        .logo-badge {
            display: inline-block;
            background: linear-gradient(135deg, var(--primary), var(--accent));
            width: 80px;
            height: 80px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 38px;
            box-shadow: 0 10px 25px rgba(0, 229, 255, 0.3);
        }
        h1 {
            font-size: 26px;
            margin: 0 0 8px;
            font-weight: 800;
            letter-spacing: -0.5px;
        }
        .subtitle {
            color: var(--subtext);
            font-size: 14px;
            margin-bottom: 25px;
        }
        .status-pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(34, 197, 94, 0.15);
            color: #4ade80;
            padding: 6px 16px;
            border-radius: 9999px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 30px;
        }
        .status-dot {
            width: 8px;
            height: 8px;
            background: #22c55e;
            border-radius: 50%;
            box-shadow: 0 0 10px #22c55e;
            animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
            0% { transform: scale(0.95); opacity: 0.8; }
            50% { transform: scale(1.3); opacity: 1; }
            100% { transform: scale(0.95); opacity: 0.8; }
        }
        .audio-controls {
            margin-top: 15px;
            display: flex;
            flex-direction: column;
            gap: 15px;
            align-items: center;
        }
        audio {
            width: 100%;
            filter: invert(1) hue-rotate(180deg);
            border-radius: 12px;
        }
        .meta-info {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            font-size: 12px;
            color: var(--subtext);
            display: flex;
            justify-content: space-between;
        }
    </style>
</head>
<body>
    <div class="player-card">
        <div class="logo-badge">📻</div>
        <h1>JoyStick FM</h1>
        <div class="subtitle">WebRadio Officielle — BTS SIO SISR (AP 1)</div>
        
        <div class="status-pill">
            <span class="status-dot"></span>
            EN DIRECT — 128 kbps MP3
        </div>

        <div class="audio-controls">
            <audio controls autoplay preload="none">
                <source src="/radio-stream.mp3" type="audio/mpeg">
                Votre navigateur ne supporte pas l'élément audio.
            </audio>
        </div>

        <div class="meta-info">
            <span>Flux : <code>/radio-stream.mp3</code></span>
            <span>Serveur : Icecast2 DMZ</span>
        </div>
    </div>
</body>
</html>
EOF

# 5. Redémarrage Apache2
systemctl restart apache2
echo "✅ Portail Web & Lecteur HTML5 JoyStick FM opérationnel sur le port 80 !"
echo "👉 Accès : http://10.100.0.51:80"
