#!/bin/bash
# ==============================================================================
# Script de déploiement automatique - Serveur Icecast 2 (JoyStick FM)
# Cible : Debian 12 (DMZ Externe - IP: 10.100.0.50)
# Projet AP 1 BTS SIO SISR — Binôme 04 & 10
# ==============================================================================

set -e

echo "=========================================================="
echo " 📻 INSTALLATION & CONFIGURATION ICECAST 2 — JOYSTICK FM"
echo "=========================================================="

# 1. Mise à jour et installation d'Icecast2
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y icecast2 curl

# 2. Configuration d'Icecast2 (/etc/icecast2/icecast.xml)
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

    <hostname>10.100.0.50</hostname>

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
        <fallback-mount>/silence.mp3</fallback-mount>
        <fallback-override>1</fallback-override>
        <fallback-when-full>1</fallback-when-full>
        <intro>/intro.mp3</intro>
        <hidden>0</hidden>
        <no-mount>0</no-mount>
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

# 3. Activation du service dans /etc/default/icecast2
sed -i 's/ENABLE=false/ENABLE=true/' /etc/default/icecast2 || true

# 4. Permissions et démarrage
chown -R icecast2:icecast /etc/icecast2 /var/log/icecast2
systemctl daemon-reload
systemctl enable --now icecast2
systemctl restart icecast2

echo "✅ Icecast 2 est opérationnel sur le port 8000 !"
echo "👉 Interface Web : http://10.100.0.50:8000"
echo "👉 Point de montage : http://10.100.0.50:8000/joystick-fm"
