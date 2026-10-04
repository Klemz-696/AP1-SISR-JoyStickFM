#!/bin/bash
# ==============================================================================
# Script de déploiement automatique - Régie Auto-DJ Streamer avec Playlist Réelle
# Cible : Debian 12 (DMZ Externe - IP: 10.100.0.52)
# Projet AP 1 BTS SIO SISR - Binôme 04 & 10
# ==============================================================================

set -e

echo "=========================================================="
echo " 🎧 INSTALLATION AUTO-DJ STREAMER (PLAYLIST JOYSTICK FM)"
echo "=========================================================="

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ffmpeg curl rsync

mkdir -p /opt/joystick-streamer/playlist

# 1. Script de diffusion audio en boucle avec mélange aléatoire (Shuffle)
cat << 'EOF' > /opt/joystick-streamer/stream_playlist_loop.sh
#!/bin/bash
ICECAST_HOST="10.100.0.50"
ICECAST_PORT="8000"
MOUNT="/joystick-fm"
PASS="hackme"
MUSIC_DIR="/opt/joystick-streamer/playlist"

echo "[AUTO-DJ] Démarrage de la régie de diffusion vers icecast://${ICECAST_HOST}:${ICECAST_PORT}${MOUNT}..."

while true; do
    # Vérifier s'il y a des fichiers MP3 dans la playlist
    MP3_COUNT=$(ls -1 "$MUSIC_DIR"/*.mp3 2>/dev/null | wc -l)
    
    if [ "$MP3_COUNT" -gt 0 ]; then
        echo "[AUTO-DJ] $MP3_COUNT titres trouvés. Lancement de la programmation musicale..."
        
        # Générer une liste de lecture mélangée aléatoirement
        ls -1 "$MUSIC_DIR"/*.mp3 | shuf > /tmp/current_playlist.txt
        
        while IFS= read -r TRACK; do
            echo "[ON AIR] Titre en cours de diffusion : $(basename "$TRACK")"
            ffmpeg -re -i "$TRACK" \
                -c:a libmp3lame -b:a 128k -ar 44100 -ac 2 \
                -content_type audio/mpeg \
                -ice_name "JoyStick FM - La Radio du Lycee Sidoine Apollinaire" \
                -ice_description "WebRadio des etudiants BTS SIO SISR" \
                -ice_genre "Electro / Gaming / Hits" \
                -f mp3 "icecast://source:${PASS}@${ICECAST_HOST}:${ICECAST_PORT}${MOUNT}" 2>/dev/null || true
            sleep 1
        done < /tmp/current_playlist.txt
    else
        echo "[ATTENTION] Aucun fichier MP3 dans $MUSIC_DIR ! Diffusion d'un signal musical de repli..."
        ffmpeg -re -f lavfi -i "sine=frequency=440:beep_factor=4:sample_rate=44100" \
            -c:a libmp3lame -b:a 128k -ar 44100 -ac 2 \
            -content_type audio/mpeg \
            -ice_name "JoyStick FM [Signal de Test]" \
            -f mp3 "icecast://source:${PASS}@${ICECAST_HOST}:${ICECAST_PORT}${MOUNT}" 2>/dev/null || true
        sleep 3
    fi
done
EOF

chmod +x /opt/joystick-streamer/stream_playlist_loop.sh

# 2. Création et activation du service systemd
cat << 'EOF' > /etc/systemd/system/joystick-streamer.service
[Unit]
Description=JoyStick FM Auto-DJ Playlist Streamer Daemon
After=network.target

[Service]
Type=simple
User=root
ExecStart=/opt/joystick-streamer/stream_playlist_loop.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now joystick-streamer

echo "✅ Régie Auto-DJ Streamer configurée et active sur 10.100.0.52 !"
echo "👉 Déposez les fichiers MP3 dans /opt/joystick-streamer/playlist/ pour diffusion immédiate."
