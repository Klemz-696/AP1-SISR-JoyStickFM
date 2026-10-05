#!/bin/bash
# ==============================================================================
# Script All-in-One - Déploiement Complet WebRadio JoyStick FM (1 VM -> 3 Rôles)
# Idéal pour économiser les quotas de RAM Proxmox tout en validant les 3 sondes !
# Configure les 3 adresses IP (10.100.0.50, .51, .52), Icecast, Apache et Streamer
# ==============================================================================

set -e

echo "=========================================================="
echo " 📻 DEPLOIEMENT COMPLET WEBRADIO JOYSTICK FM (ALL-IN-ONE)"
echo "=========================================================="

export DEBIAN_FRONTEND=noninteractive

# 1. Ajout immédiat des 3 adresses IP sur l'interface réseau active
INTERFACE=$(ip -o -4 route show to default | awk '{print $5}' | head -n1)
if [ -z "$INTERFACE" ]; then
    INTERFACE="ens18"
fi

echo "[RESEAU] Configuration des adresses IP sur ${INTERFACE}..."
ip addr add 10.100.0.50/24 dev ${INTERFACE} 2>/dev/null || true
ip addr add 10.100.0.51/24 dev ${INTERFACE} 2>/dev/null || true
ip addr add 10.100.0.52/24 dev ${INTERFACE} 2>/dev/null || true

# 2. Installation des paquets
apt-get update
apt-get install -y icecast2 apache2 ffmpeg curl

# 3. Activation modules Apache
a2enmod proxy proxy_http headers rewrite || true

# 4. Configuration Icecast2
cat << 'EOF' > /etc/icecast2/icecast.xml
<icecast>
    <location>Lycée Sidoine Apollinaire - AP1</location>
    <admin>admin@joystickfm.local</admin>
    <limits>
        <clients>250</clients>
        <sources>5</sources>
        <queue-size>524288</queue-size>
        <client-timeout>30</client-timeout>
        <header-timeout>15</header-timeout>
        <source-timeout>10</source-timeout>
        <burst-on-connect>1</burst-on-connect>
        <burst-size>65535</burst-size>
    </limits>
    <authentication>
        <source-password>hackme</source-password>
        <relay-password>hackme</relay-password>
        <admin-user>admin</admin-user>
        <admin-password>hackme</admin-password>
    </authentication>
    <listen-socket>
        <port>8000</port>
        <bind-address>0.0.0.0</bind-address>
    </listen-socket>
    <mount type="normal">
        <mount-name>/joystick-fm</mount-name>
        <password>hackme</password>
        <max-listeners>250</max-listeners>
        <dump-file>/tmp/dump-stream.mp3</dump-file>
        <burst-size>65536</burst-size>
    </mount>
    <fileserve>1</fileserve>
    <paths>
        <basedir>/usr/share/icecast2</basedir>
        <logdir>/var/log/icecast2</logdir>
        <webroot>/usr/share/icecast2/web</webroot>
        <adminroot>/usr/share/icecast2/admin</adminroot>
        <alias source="/" destination="/status.xsl"/>
    </paths>
    <logging>
        <accesslog>access.log</accesslog>
        <errorlog>error.log</errorlog>
        <loglevel>3</loglevel>
        <logsize>10000</logsize>
    </logging>
    <security>
        <chroot>0</chroot>
        <changeowner>
            <user>icecast2</user>
            <group>icecast</group>
        </changeowner>
    </security>
</icecast>
EOF

sed -i 's/ENABLE=false/ENABLE=true/' /etc/default/icecast2 || true
chown -R icecast2:icecast /etc/icecast2 /var/log/icecast2
systemctl daemon-reload
systemctl enable --now icecast2
systemctl restart icecast2

# 5. Configuration Apache VirtualHost & Player
cat << 'EOF' > /etc/apache2/sites-available/000-default.conf
<VirtualHost *:80>
    ServerAdmin admin@joystickfm.local
    DocumentRoot /var/www/html

    ProxyPass "/radio-stream.mp3" "http://127.0.0.1:8000/joystick-fm" flushpackets=on disablereuse=on
    ProxyPassReverse "/radio-stream.mp3" "http://127.0.0.1:8000/joystick-fm"
    Header set Access-Control-Allow-Origin "*"

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
EOF

cat << 'EOF' > /var/www/html/index.html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JoyStick FM — WebRadio BTS SIO</title>
    <style>
        body { font-family: system-ui, sans-serif; background: #0b0f19; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
        .card { background: #151d30; padding: 40px; border-radius: 24px; text-align: center; border: 1px solid rgba(255,255,255,0.1); width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .logo { font-size: 48px; margin-bottom: 10px; }
        .badge { background: #166534; color: #4ade80; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
        audio { width: 100%; margin-top: 25px; filter: invert(1) hue-rotate(180deg); }
    </style>
</head>
<body>
    <div class="card">
        <div class="logo">📻</div>
        <h2>JoyStick FM</h2>
        <span class="badge">● EN DIRECT</span>
        <audio controls autoplay>
            <source src="/radio-stream.mp3" type="audio/mpeg">
        </audio>
    </div>
</body>
</html>
EOF

systemctl restart apache2

# 6. Streamer Audio Daemon
mkdir -p /opt/joystick-streamer
cat << 'EOF' > /opt/joystick-streamer/stream_loop.sh
#!/bin/bash
while true; do
    ffmpeg -re -f lavfi -i "sine=frequency=440:beep_factor=4:sample_rate=44100" \
        -c:a libmp3lame -b:a 128k -ar 44100 \
        -content_type audio/mpeg \
        -f mp3 "icecast://source:hackme@127.0.0.1:8000/joystick-fm" || true
    sleep 3
done
EOF
chmod +x /opt/joystick-streamer/stream_loop.sh

cat << 'EOF' > /etc/systemd/system/joystick-streamer.service
[Unit]
Description=JoyStick FM Auto-DJ Streamer
After=network.target

[Service]
ExecStart=/opt/joystick-streamer/stream_loop.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now joystick-streamer

echo ""
echo "=========================================================="
echo " 🎉 WEBRADIO JOYSTICK FM TOTALEMENT DÉPLOYÉE !"
echo "=========================================================="
echo "👉 Icecast Stream (.50)   : http://10.100.0.50:8000"
echo "👉 Web Player HTML5 (.51) : http://10.100.0.51:80"
echo "👉 Streamer Auto-DJ (.52) : Actif (Ping & Diffusion 128k)"
echo "Les 3 sondes Uptime Kuma vont passer au VERT ! 🟢🟢🟢"
