# Document 13 : Plan de Déploiement WebRadio JoyStick FM & Modèle Debian 12
## Projet AP 1 - BTS SIO SISR (Binôme 04 & 10)
*Date : 04 Octobre 2026*
*Auteur : Clément SAUZÈDE (04 - Lead Réseau & JoyStick FM) & Mathys DUTHILLEUL (10 - Admin Systèmes)*

---

## 1. Contexte & Arbitrage d'Ingénierie (Pourquoi une VM Modèle ?)

Initialement, le projet prévoyait une migration V2V depuis d'anciennes archives VMware vSphere (`AP_Webradio/4- VMs/` pesant plus de 25 Go de fichiers `.vmdk` et `.iso`).
Cependant, deux contraintes majeures ont conduit à un arbitrage d'ingénierie moderne et professionnel :
1. **Restrictions de droits sur Proxmox VE :** Les comptes étudiants ne disposent pas des privilèges `root` sur l'hyperviseur pour exécuter des commandes comme `qm importdisk` sur le stockage partagé.
2. **Optimisation des ressources et standardisation :** Les anciennes machines virtuelles vSphere étaient lourdes, contenaient des environnements graphiques XFCE/GNOME inutiles consommant 80% du CPU/RAM, et des dépendances obsolètes.

> [!NOTE]
> **La solution d'ingénierie retenue :**  
> Création d'une **VM Modèle Debian 12 (Template Golden Image)** propre, légère (sans interface graphique), standardisée avec `qemu-guest-agent` et clés SSH, puis **clonage instantané** pour déployer les rôles WebRadio en DMZ Externe avec des scripts d'automatisation en 1 clic.

---

## 2. Phase 1 : Création de la VM Modèle Debian 12 (Template Proxmox)

### 2.1. Spécifications de la VM sur Proxmox VE
Dans l'interface Web Proxmox (`https://172.30.216.200:8006/`) :
* **Général :**
  * VM ID : `9000` (Convention pour les templates) ou `11050`
  * Nom : `tpl-debian12-ap1`
* **OS :**
  * ISO : `debian-12.x.x-amd64-netinst.iso` (disponible sur le stockage ISO du lycée)
* **Système :**
  * Contrôleur SCSI : `VirtIO SCSI single`
  * Qemu Agent : **Coché** (Indispensable pour la remontée d'IP et l'automatisation)
* **Disques :**
  * Stockage : `local-lvm` (ou stockage étudiant)
  * Taille : `15 Go` (Format `raw` ou `qcow2`, cache par défaut, discard activé)
* **CPU :**
  * Cœurs : `1 vCPU` (Type : `host` ou `kvm64`)
* **Mémoire :**
  * RAM : `1024 Mo` (Ballonnement désactivé pour stabilité)
* **Réseau :**
  * Bridge : `vmbr3` (VLAN 100 - DMZ Externe)
  * Modèle : `VirtIO (paravirtualisé)`

---

### 2.2. Installation minimale du Système d'Exploitation
Lors du boot sur l'installateur Debian :
1. Langue : Français / Clavier : Français (azerty).
2. Nom d'hôte : `debian-modele` / Domaine : `ap1.local`.
3. Mot de passe `root` : standardisé pour le TP.
4. Utilisateur local : `debian` (ou `etu04`).
5. Partitionnement : Assisté - Utiliser tout le disque (un seul volume `/` + swap).
6. **Sélection des logiciels (`tasksel`) :**
   - **Décocher** impérativement l'environnement de bureau graphique (pas de GNOME, pas de XFCE).
   - **Cocher uniquement :** `Serveur SSH` et `Utilitaires usuels du système`.

---

### 2.3. Script de Post-Installation et Préparation au Clonage (Golden Image)
Dès le premier démarrage de la VM modèle, ouvrez une session SSH (ou la console Proxmox) en `root` et exécutez ce script de standardisation :

```bash
cat << 'EOF' > /root/prepare_template.sh
#!/bin/bash
set -e
echo "=== 1. MISE À JOUR ET PAQUETS INDISPENSABLES ==="
export DEBIAN_FRONTEND=noninteractive
apt-get update && apt-get dist-upgrade -y
apt-get install -y qemu-guest-agent curl wget sudo vim net-tools rsync htop ca-certificates

echo "=== 2. CONFIGURATION DU GUEST AGENT & SUDO ==="
systemctl enable --now qemu-guest-agent
usermod -aG sudo debian 2>/dev/null || true
echo "debian ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/debian

echo "=== 3. INJECTION DE LA CLÉ SSH PUBLIQUE CLÉMENT ==="
mkdir -p /root/.ssh /home/debian/.ssh
chmod 700 /root/.ssh /home/debian/.ssh
# Injection de la clé ED25519 nomade
cat << 'KEY' >> /root/.ssh/authorized_keys
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICa5f57jQyW9kSg1fF2uF5F9m9zY6d9xV4q1W8e7R2bL clement-portable
KEY
cp /root/.ssh/authorized_keys /home/debian/.ssh/authorized_keys
chown -R debian:debian /home/debian/.ssh
chmod 600 /root/.ssh/authorized_keys /home/debian/.ssh/authorized_keys

echo "=== 4. NETTOYAGE ET PURGE POUR CLONAGE PROPRE ==="
# Réinitialisation de l'identifiant machine (machine-id unique par VM clonée)
truncate -s 0 /etc/machine-id
rm -f /var/lib/dbus/machine-id
ln -s /etc/machine-id /var/lib/dbus/machine-id

# Nettoyage des baux DHCP et des logs
rm -f /var/lib/dhcp/* /var/lib/NetworkManager/* 2>/dev/null || true
truncate -s 0 /var/log/wtmp /var/log/lastlog /var/log/syslog /var/log/messages 2>/dev/null || true

# Suppression des clés hôtes SSH (seront regénérées au premier boot de chaque clone)
rm -f /etc/ssh/ssh_host_*

# Service systemd de regénération automatique des clés SSH au 1er boot du clone
cat << 'SERVICE' > /etc/systemd/system/regenerate-ssh-keys.service
[Unit]
Description=Regenerate SSH Host Keys on First Boot
Before=ssh.service
ConditionFileNotEmpty=!/etc/ssh/ssh_host_rsa_key

[Service]
Type=oneshot
ExecStart=/usr/bin/ssh-keygen -A
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
SERVICE
systemctl enable regenerate-ssh-keys.service

apt-get clean
history -c
echo "=== VM MODÈLE PRÊTE ! ÉTEINDRE LA VM MAINTENANT ==="
EOF
chmod +x /root/prepare_template.sh
/root/prepare_template.sh
poweroff
```

### 2.4. Transformation en Template Proxmox
Une fois la VM éteinte :
- Dans l'interface Proxmox, clic-droit sur la VM `tpl-debian12-ap1` ➔ **Convert to template**.
- L'icône de la machine se transforme en modèle figé.

---

## 3. Phase 2 : Déploiement et Clonage des VM WebRadio

Depuis le Template créé, deux stratégies de déploiement sont possibles :

### Architecture A : 3 VM Distinctes (Conformité Puriste - 3 x 1 Go RAM)
1. **VM 11050 (`Debian-Icecast2`) :** Clic-droit sur le template ➔ *Clone* ➔ Full Clone ➔ Nom : `Debian-Icecast2`.
2. **VM 11051 (`Debian-Web`) :** Clic-droit sur le template ➔ *Clone* ➔ Full Clone ➔ Nom : `Debian-Web`.
3. **VM 11052 (`Debian-Mixxx`) :** Clic-droit sur le template ➔ *Clone* ➔ Full Clone ➔ Nom : `Debian-Mixxx`.

### Architecture B : 1 VM All-in-One Consolidée (Optimisation Quota Proxmox - 1 Go RAM)
* Déploiement d'une seule VM `SRV-WEBRADIO` (IP `10.100.0.50` avec alias `.51` et `.52`) exécutant Icecast, Apache et le streamer dans un environnement cloisonné.

---

## 4. Phase 3 : Automatisation du Déploiement des Services

Une fois la/les VM démarrée(s) et les IP configurées en DMZ Externe :

### 4.1. Rôle 1 : Serveur Icecast 2 (`10.100.0.50`)
Exécution directe du script `scripts/deploy_webradio_icecast.sh` :
- Installation du serveur Icecast 2.4.
- Configuration du point de montage `/joystick-fm` (250 auditeurs simultanés, tampon 64k).
- Démarrage automatique du service systemd `icecast2`.
- Validation : `curl -I http://10.100.0.50:8000/joystick-fm`

### 4.2. Rôle 2 : Portail Web & Player HTML5 (`10.100.0.51`)
Exécution directe du script `scripts/deploy_webradio_web.sh` :
- Installation Apache2 avec modules `proxy`, `proxy_http`, `headers`.
- Configuration du Reverse Proxy `/radio-stream.mp3` vers `10.100.0.50:8000/joystick-fm`.
- Déploiement du Player Web HTML5 JoyStick FM avec animations audio et affichage du direct.
- Validation : `curl -I http://10.100.0.51/`

### 4.3. Rôle 3 : Régie Auto-DJ Streamer (`10.100.0.52`)
Exécution directe du script `scripts/deploy_webradio_streamer.sh` :
- Installation de `ffmpeg`.
- Déploiement du script de streaming continu 24/7 vers Icecast (MP3 128 kbps).
- Service d'auto-guérison systemd `joystick-streamer.service` (redémarrage automatique en cas de coupure).

---

## 5. Phase 4 : Sécurisation & Intégration Réseau OPNsense

### 5.1. Translation de Ports WAN (Firewall > NAT > Port Forward)
Deux règles chirurgicales sont créées sur l'interface WAN (`192.168.101.37`) :
1. **Règle 1 : Streaming Icecast Brut (Port 8000)**
   - Interface : `WAN` | Protocol : `TCP`
   - Destination Port : `8000`
   - Redirect target IP : `10.100.0.50` (Port `8000`)
   - Description : `M2 - Flux Streaming Icecast JoyStick FM`
2. **Règle 2 : Portail Web & Lecteur HTML5 (Port 80)**
   - Interface : `WAN` | Protocol : `TCP`
   - Destination Port : `80`
   - Redirect target IP : `10.100.0.51` (Port `80`)
   - Description : `M2 - Portail Web Auditeurs JoyStick FM`

### 5.2. Cloisonnement Anti-Rebond Zero-Trust (Firewall > Rules > DMZ_EXT)
Conformément aux exigences de sécurité de l'AP1 :
* **Règle 1 (Block Anti-Rebond LAN) :** Bloquer tout flux de `DMZ_EXT net` vers `LAN net` (Log activé).
* **Règle 2 (Block Anti-Rebond DMZ_INT) :** Bloquer tout flux de `DMZ_EXT net` vers `DMZ_INT net` (Log activé).
* **Règle 3 (Pass Sortant Strict) :** Autoriser uniquement les réponses HTTP/Audio vers le WAN et les requêtes DNS/NTP vers la passerelle `10.100.0.254`.

---

## 6. Phase 5 : Recette & Intégration Supervision Uptime Kuma

Dès le lancement, les sondes déjà créées dans Uptime Kuma basculent au vert :
1. `Flux Icecast (8000)` : `http://10.100.0.50:8000/joystick-fm` ➔ **100% UP**
2. `Portail Web Radio (80)` : `http://10.100.0.51:80` ➔ **100% UP**
3. `Régie Mixxx Streamer` : Ping `10.100.0.52` ➔ **100% UP**

---

## 7. Bilan d'Exécution & Validation Opérationnelle (Séance du 04/10/2026)

L'ensemble de ce plan a été **exécuté et validé avec succès en conditions réelles** :
- **Golden Image Proxmox :** VM modèle Debian 12 créée et standardisée (`qemu-guest-agent`, sudo sans mot de passe, clés SSH ED25519).
- **3 VMs déployées en DMZ Externe (VLAN 100) :**
  - `Debian-Icecast2` (`10.100.0.50`) : Icecast 2.4.4 actif, mount point `/joystick-fm` opérationnel (diffusion 128 kbps).
  - `Debian-Mixxx` (`10.100.0.52`) : Régie Auto-DJ sous systemd avec FFmpeg, rotation sur les 11 titres musicaux et jingles officiels.
  - `Debian-Web` (`10.100.0.51`) : Pile LAMP + WordPress 6.x + thème `joystickfm-theme` rétro gaming, permaliens propres `/radio/`, `/podcasts/`, `/blog/` tous validés en HTTP 200 OK.
- **Reverse-Proxy Audio Apache :** `/radio-stream.mp3` relaie fidèlement le flux sans exposer le port 8000 à l'utilisateur.
- **Sécurité & Administration :** Clés SSH ED25519 injectées sur les 3 serveurs pour une administration directe sans mot de passe.
- **Supervision :** Métadonnées API Icecast fonctionnelles (`online: true`) et table Live Chat MariaDB `wp_jfm_chat_messages` active.
