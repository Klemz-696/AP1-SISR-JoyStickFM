#!/bin/bash
# ==============================================================================
# Script de déploiement automatique - Régie Auto-DJ Streamer (JoyStick FM)
# Cible : Debian 12 (DMZ Externe - IP: 10.100.0.52)
# Projet AP 1 BTS SIO SISR — Binôme 04 & 10
# ==============================================================================

set -e

echo "=========================================================="
echo " 🎛️ INSTALLATION DU FLUX AUTO-DJ / SOURCE — JOYSTICK FM"
echo "=========================================================="

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ffmpeg curl

mkdir -p /opt/joystick-streamer
cd /opt/joystick-streamer

# 1. Génération d'une boucle audio d'ambiance radio synthétique (Gingle/Tone musical)
# si aucun MP3 n'est présent, pour garantir un flux audio immédiat 24/7
cat << 'EOF' > /opt/joystick-streamer/stream_loop.sh
#!/bin/bash
ICECAST_HOST="10.100.0.50"
ICECAST_PORT="8000"
MOUNT="/joystick-fm"
PASS="hackme"

echo "[STREAMER] Démarrage de la diffusion vers http://${ICECAST_HOST}:${ICECAST_PORT}${MOUNT}..."

while true; do
    # Génère un flux audio synthétique radio (chimes/synth 440Hz stéréo 128k) simulant l'antenne radio
    ffmpeg -re -f lavfi -i "sine=frequency=440:beep_factor=4:sample_rate=44100" \
        -c:a libmp3lame -b:a 128k -ar 44100 \
        -content_type audio/mpeg \
        -f mp3 "icecast://source:${PASS}@${ICECAST_HOST}:${ICECAST_PORT}${MOUNT}" || true
    sleep 3
done
EOF

chmod +x /opt/joystick-streamer/stream_loop.sh

# 2. Création du service systemd pour exécution continue en arrière-plan
cat << 'EOF' > /etc/systemd/system/joystick-streamer.service
[Unit]
Description=JoyStick FM Auto-DJ Streamer Daemon
After=network.target

[Service]
Type=simple
User=root
ExecStart=/opt/joystick-streamer/stream_loop.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now joystick-streamer

echo "✅ Régie Auto-DJ Streamer active et connectée au serveur Icecast !"
