# Document 11 : Feuille de Route Intégrale & Guide Technique de Déploiement Exhaustif
## Projet AP 1 - BTS SIO SISR (Binôme 04 & 10)
### Lycée Sidoine Apollinaire • Clôture des Missions 1, 2 & 3

---

## 1. Vue d'Ensemble & Stratégie de Déploiement

Ce document constitue le **référentiel technique maître** du projet AP 1. Il rassemble, de façon exhaustive et ordonnée, **toutes les commandes, procédures d'installation, fichiers de configuration réels et tests unitaires** nécessaires pour monter l'infrastructure complète de A à Z.

### Rappel des Sanctuarisations & Adresses Clés (Cluster pve02) :
* **IP WAN OPNsense :** `192.168.101.37 /24` (Passerelle amont lycée : `192.168.101.254`, nœud `pve02`)
* **VLAN 100 (DMZ Externe) :** `10.100.0.0/24` (Passerelle OPNsense `vtnet3` : `10.100.0.254`)
* **VLAN 200 (LAN Entreprise) :** `192.168.200.0/24` (Passerelle OPNsense `vtnet1` : `192.168.200.254`)
* **VLAN 300 (DMZ Interne) :** `10.30.0.0/24` (Passerelle OPNsense `vtnet2` : `10.30.0.254`)
* **Pool VPN Nomade :** `10.200.100.0/24` (Passerelle virtuelle : `10.200.100.254`)
* **Règle d'or des postes clients :** Clément SAUZÈDE ➔ **`.4`** | Mathys DUTHILLEUL ➔ **`.10`**

### 📊 Tableau de Bord d'Avancement Réel (Mise à jour au 28/09/2026) :
* [x] **Socle Réseau & VMs (pve02) :** VM 11008 (OPNsense), VM 11009 (Poste-Mathys), VM 11010 (SRV-FILES), VM 11011 (Poste-Clement migrée sur pve02 et connectée au LAN).
* [x] **Accès WebGUI OPNsense :** Opérationnel sur `https://192.168.200.254` (et accessible sur WAN avec règle HTTPS).
* [x] **Sécurisation WAN & Furtivité :** Règle de blocage ICMP Echo Request sur le WAN, Normalisation IP Random-id activée, `Block private networks` désactivé pour le réseau lycée.
* [x] **Traffic Shaper QoS (2 Mb/s) :** Pipe WAN 2 Mbps créé, files pondérées (`Q_Prio 100`, `Q_Standard 20`) et règle shaper appliquées.
* [x] **Routage Inter-VLAN & Stockage :** Communication validée vers SRV-FILES (`10.30.0.20`), port 445 accessible et partage SMB `Partage` monté avec succès dans Nemo sur Linux Mint.
* [x] **Serveur de Photos Immich (Mission 2) :** Déployé par Mathys (Docker) et validé accessible (`:2283`) depuis le poste client Linux Mint de Clément.
* [x] **Serveur de Jeu Minecraft (Mission 2 - En cours par Mathys) :** Pris en charge par Mathys DUTHILLEUL (`10.30.0.22`, port 25565, DNS Unbound OPNsense).
* [🔄] **Stratégie VPN Nomade (Mission 1) :** Socle IPsec IKEv2 validé en échange de clés (DH 14/31 Curve25519) ; mise à niveau OPNsense en cours pour déploiement moderne WireGuard (ChaCha20-Poly1305, simplicité opérationnelle et zéro overhead X.509 pour l'épreuve E5).
* [x] **Sauvegarde Automatisée des Documents (Mission 1 - Clément) :** [FAIT ✅] Montage automatique CIFS via fichier de credentials sécurisé et synchronisation incrémentale rsync validée (`Rapport_AP1.txt` répliqué dans `//10.30.0.20/Partage/Sauvegardes_Clement`). Script `backup-documents.sh` prêt avec logs et cron.
* [⏸️] **WebRadio JoyStick FM (DMZ Ext) :** Mise en attente de l'intervention de l'enseignant pour l'import des VMDK vSphere sur le cluster Proxmox.
* [ ] **Honeypot LAMP Leurre (Mission 3 - Clément) :** Déploiement du serveur leurre en DMZ Externe (`10.100.0.99`) avec détection d'intrusions.

---

## 2. ÉLÉMENT 1 : Routeur / Pare-feu Central OPNsense-AP1

### 2.1. Initialisation en Console Proxmox VE
1. Dans la console noVNC Proxmox d'OPNsense, se connecter avec `root` / `opnsense`.
2. **Assignation des interfaces (Option 1 `Assign interfaces`) :**
   * Configurer les VLANs ? `N`
   * WAN Interface : `vtnet0` (Pont `vmbr0` connecté au réseau lycée)
   * LAN Interface : `vtnet1` (Pont `vmbr1` VLAN 200)
   * DMZ Int (OPT1) : `vtnet2` (Pont `vmbr2` VLAN 300)
   * DMZ Ext (OPT2) : `vtnet3` (Pont `vmbr3` VLAN 100)
   * Valider par `y`.
3. **Attribution des adresses IP (Option 2 `Set interface IP address`) :**
   * **Interface WAN (`vtnet0`) :**
     * Configurer DHCP ? `N`
     * IPv4 Address : `192.168.101.41`
     * Masque CIDR : `24`
     * Passerelle IPv4 amont : `192.168.101.254`
     * Configurer IPv6 ? `N`
   * **Interface LAN (`vtnet1`) :**
     * IPv4 Address : `192.168.200.254` / CIDR `24` / Passerelle : Aucune (None).
     * Activer le serveur DHCP ? `Y`
     * Plage DHCP : `192.168.200.50` à `192.168.200.99`.
   * **Interface DMZ Int (`vtnet2`) :**
     * IPv4 Address : `10.30.0.254` / CIDR `24` / Passerelle : Aucune / Pas de DHCP.
   * **Interface DMZ Ext (`vtnet3`) :**
     * IPv4 Address : `10.100.0.254` / CIDR `24` / Passerelle : Aucune / Pas de DHCP.

---

### 2.2. Durcissement & Furtivité Pare-feu (Mission 1 - Anti-Nmap & ICMP)
Accéder à la WebGUI OPNsense (`https://192.168.200.254` ou via le WAN autorisé pour l'administration) :

1. **Blocage du Ping ICMP sur le WAN :**
   * Aller dans **Firewall > Rules > WAN**.
   * Vérifier qu'aucune règle n'autorise le protocole `ICMP`.
   * Ajouter une règle en haut de liste :
     * *Action :* `Block` (ou `Drop` pour ignorer silencieusement sans réponse RST/unreachable).
     * *Interface :* `WAN`
     * *Protocol :* `ICMP` (Type : `Echo Request`).
     * *Source :* `any` | *Destination :* `WAN address`.
2. **Masquage de l'OS & Nettoyage de paquets (Scrubbing) :**
   * Aller dans **Firewall > Settings > Normalization**.
   * Activer **IP Random-ID** (perturbe la détection d'empreinte d'OS par incrémentation d'IPID de Nmap).
   * Activer **Max-MSS** : `1460` (évite la fragmentation des paquets à travers les tunnels IPsec).
   * Activer **Drop fragments** et **Clear DF (Don't Fragment)**.

---

### 2.3. Redirection de Ports WAN (Port Forwarding NAT)
Aller dans **Firewall > NAT > Port Forward** et créer les 3 règles d'exposition :

1. **Règle 1 : Streaming WebRadio Icecast (Conformité AP1)**
   * *Interface :* `WAN` | *TCP/IP :* `IPv4` | *Protocol :* `TCP`
   * *Destination :* `WAN address` | *Port :* `8000`
   * *Redirect Target IP :* `10.100.0.50` (Debian_Icecast2) | *Redirect Target Port :* `8000`
   * *NAT Reflection :* `Enable`
2. **Règle 2 : Portail Web WordPress JoyStick FM (Option B - Lecteur HTML5)**
   * *Interface :* `WAN` | *TCP/IP :* `IPv4` | *Protocol :* `TCP`
   * *Destination :* `WAN address` | *Port :* `80` (HTTP)
   * *Redirect Target IP :* `10.100.0.51` (Debian_Web) | *Redirect Target Port :* `80`
   * *NAT Reflection :* `Enable`
3. **Règle 3 : Redirection Furtive Leurre (Mission 3 - Honeypot)**
   * *Interface :* `WAN` | *Protocol :* `TCP` | *Port :* `8080` (ou attaques ciblées non standards)
   * *Redirect Target IP :* `10.100.0.99` (Honeypot LAMP) | *Redirect Target Port :* `80`

---

### 2.4. Limitation de Débit & Traffic Shaper QoS (Mission 1 & 2)
Aller dans **Firewall > Traffic Shaper** :

1. **Pipes (Canaux physiques simulés) :**
   * Créer Pipe `Pipe_VPN_In` : Bande passante = `2 Mbit/s`.
   * Créer Pipe `Pipe_VPN_Out` : Bande passante = `2 Mbit/s`.
2. **Queues (Files d'attente pondérées) :**
   * `Q_Prioritaire` : Target = `Pipe_VPN_Out`, Poids = `100` (Réservé ICMP & SSH / WinRM).
   * `Q_Immich` : Target = `Pipe_VPN_Out`, Poids = `50` (Priorité intermédiaire Mission 2).
   * `Q_Standard` : Target = `Pipe_VPN_Out`, Poids = `20` (HTTP Web et Minecraft).
3. **Rules (Règles d'affectation des paquets) :**
   * Trafic SSH (Port 22) et ICMP ➔ Dirigé vers `Q_Prioritaire`.
   * Trafic Immich (Port 2283) ➔ Dirigé vers `Q_Immich`.
   * Trafic HTTP / Général ➔ Dirigé vers `Q_Standard`.

---

### 2.5. Serveur VPN Nomade IPsec IKEv2 (Mission 1)
1. **Autorité de Certification (PKI) dans System > Trust > Authorities :**
   * Nom : `CA-AP1-Entreprise`. Méthode : `Internal CA`. Longueur clé : `RSA 4096 bit` ou `ECDSA 384 bit`. Validité : `1825 jours`.
2. **Certificat Serveur Pare-feu dans System > Trust > Certificates :**
   * Nom : `Cert-OPNsense-VPN`. Type : `Server Certificate`. Signé par `CA-AP1-Entreprise`.
   * Subject Alternative Name (SAN) : `IP:192.168.101.41`.
3. **Certificats Clients Nomades :**
   * `Cert-Client-04` (Clément) et `Cert-Client-10` (Mathys). Exportés au format `.p12` avec mot de passe robuste.
4. **Configuration IPsec dans VPN > IPsec > Mobile Clients :**
   * Activer l'extension client nomade IKEv2.
   * Pool d'adresses virtuelles allouées : `10.200.100.0/24`.
   * DNS distribué : `192.168.200.254` (ou DNS lycée `192.168.101.254`).

---

### 2.6. Serveur VPN Nomade WireGuard (Alternative Moderne & Légère - OPNsense 23.1)
1. **Installation du plugin sous OPNsense 23.1 :**
   * Aller dans **System > Firmware > Plugins** et installer **`os-wireguard`**.
2. **Configuration du Serveur Local (VPN > WireGuard > Local) :**
   * Nom : `WG_Nomade` | Port d'écoute : `51820` | Tunnel Address : `10.200.100.1/24`.
   * Génération de la clé privée / publique directement dans l'interface.
3. **Déclaration du Client Nomade (VPN > WireGuard > Endpoints) :**
   * Nom : `Client_Clement` | IP allouée : `10.200.100.2/32`.
4. **Règles de Pare-feu associées :**
   * **WAN :** Règle autorisant le protocole `UDP` vers le port destination `51820`.
   * **WireGuard (Group interface) :** Règle autorisant le trafic vers la DMZ Interne `10.30.0.0/24` (partages SMB, Immich, etc.).

---

## 3. ÉLÉMENT 2 : Serveur de Fichiers Windows Server 2022 (`SRV-FILES`)

### 3.1. Adressage IP & Nom d'Hôte
Dans la console Windows Server 2022 :
```powershell
# 1. Renommage de la machine
Rename-Computer -NewName "SRV-FILES" -Restart -Force

# 2. Configuration IP statique (Ethernet0 rattaché à vmbr2)
Get-NetAdapter | New-NetIPAddress -IPAddress 10.30.0.20 -PrefixLength 24 -DefaultGateway 10.30.0.254
Set-DnsClientServerAddress -InterfaceAlias "Ethernet0" -ServerAddresses ("1.1.1.1","8.8.8.8")
```

### 3.2. Rôle Serveur de Fichiers & Partages SMB
```powershell
# Installation du rôle de partage de fichiers
Install-WindowsFeature -Name FS-FileServer -IncludeManagementTools

# Création des répertoires de stockage
New-Item -Path "C:\Partages\Sauvegardes" -ItemType Directory -Force
New-Item -Path "C:\Partages\Commun" -ItemType Directory -Force

# Création des comptes locaux d'employés
$pwd = ConvertTo-SecureString "P@ssw0rdBTS2026!" -AsPlainText -Force
New-LocalUser -Name "employe04" -Password $pwd -FullName "Employé Clément (04)" -Description "Compte employé Nomade"
New-LocalUser -Name "employe10" -Password $pwd -FullName "Employé Mathys (10)" -Description "Compte employé Interne"

# Création des dossiers personnels
New-Item -Path "C:\Partages\Sauvegardes\employe04" -ItemType Directory -Force
New-Item -Path "C:\Partages\Sauvegardes\employe10" -ItemType Directory -Force

# Création du partage SMB réseau
New-SmbShare -Name "Sauvegardes" -Path "C:\Partages\Sauvegardes" -FullAccess "Administrateur" -ChangeAccess "employe04","employe10"

# Configuration des ACLs NTFS étanches
icacls "C:\Partages\Sauvegardes\employe04" /inheritance:r /grant:r "Administrateur:(OI)(CI)F" "employe04:(OI)(CI)M"
icacls "C:\Partages\Sauvegardes\employe10" /inheritance:r /grant:r "Administrateur:(OI)(CI)F" "employe10:(OI)(CI)M"
```

### 3.3. Activation de PowerShell Remoting (WinRM)
```powershell
Enable-PSRemoting -Force
Set-Service WinRM -StartupType Automatic
Start-Service WinRM
# Vérification du port d'écoute (5985)
Test-NetConnection -ComputerName localhost -Port 5985
```

---

## 4. ÉLÉMENT 3 : Serveur Photo Docker Immich (`SRV-IMMICH`)

### 4.1. Installation du Moteur Docker sous Debian 12
Sur la VM Debian 12 rattachée à `vmbr2` (IP statique `10.30.0.21/24`, passerelle `10.30.0.254`) :
```bash
apt-get update && apt-get install -y ca-certificates curl gnupg lsb-release

# Ajout du dépôt Docker officiel
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update && apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker
```

### 4.2. Déploiement de la Pile Immich (`docker-compose.yml`)
Créer le répertoire `/opt/immich` et les fichiers nécessaires :
```bash
mkdir -p /opt/immich && cd /opt/immich

# Fichier d'environnement .env
cat << 'EOF' > .env
UPLOAD_LOCATION=/opt/immich/library
DB_DATA_LOCATION=/opt/immich/postgres
IMMICH_VERSION=release
DB_PASSWORD=ImmichSecureDatabasePassword2026!
DB_USERNAME=postgres
DB_DATABASE_NAME=immich
EOF

# Fichier docker-compose.yml
cat << 'EOF' > docker-compose.yml
version: "3.8"
services:
  immich-server:
    container_name: immich_server
    image: ghcr.io/immich-app/immich-server:${IMMICH_VERSION:-release}
    volumes:
      - ${UPLOAD_LOCATION}:/usr/src/app/upload
      - /etc/localtime:/etc/localtime:ro
    env_file:
      - .env
    ports:
      - 2283:2283
    depends_on:
      - redis
      - database
    restart: always

  immich-machine-learning:
    container_name: immich_machine_learning
    image: ghcr.io/immich-app/immich-machine-learning:${IMMICH_VERSION:-release}
    volumes:
      - /opt/immich/model-cache:/cache
    restart: always

  redis:
    container_name: immich_redis
    image: redis:6.2-alpine
    restart: always

  database:
    container_name: immich_postgres
    image: tensorchord/pgvecto-rs:pg14-v0.2.0
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_DB: ${DB_DATABASE_NAME}
    volumes:
      - ${DB_DATA_LOCATION}:/var/lib/postgresql/data
    restart: always
EOF

# Lancement des conteneurs
docker compose up -d
```
*Vérification :* Se connecter depuis le navigateur sur `http://10.30.0.21:2283`, créer l'administrateur, importer quelques photos et créer l'album **« Partage Partenaire B2B »** avec génération d'un lien de partage public sans mot de passe.

---

## 5. ÉLÉMENT 4 : Serveur de Jeu Minecraft (`SRV-MINECRAFT`)

Sur la VM Debian 12 rattachée à `vmbr2` (IP statique `10.30.0.22/24`) :
```bash
mkdir -p /opt/minecraft && cd /opt/minecraft

cat << 'EOF' > docker-compose.yml
version: "3.8"
services:
  mc:
    image: itzg/minecraft-server:latest
    container_name: srv_minecraft
    ports:
      - "25565:25565"
    environment:
      EULA: "TRUE"
      TYPE: "PAPER"
      VERSION: "1.20.4"
      MEMORY: "2G"
      SERVER_NAME: "Serveur AP1 BTS SIO"
      MOTD: "Serveur prive BTS SIO SISR - Acces VPN uniquement"
    volumes:
      - ./data:/data
    restart: unless-stopped
EOF

docker compose up -d
```

---

## 6. ÉLÉMENT 5 : Pôle WebRadio JoyStick FM (DMZ Externe VLAN 100)

### 6.1. Migration V2V VMware vSphere vers Proxmox VE
Depuis le shell du nœud Proxmox :
```bash
# 1. Conversion des 3 disques VMDK (situés par exemple dans /tmp/)
qm create 150 --name "Debian-Icecast2" --memory 2048 --cores 2 --net0 virtio,bridge=vmbr3
qm importdisk 150 /tmp/Debian_Icecast2-1.vmdk local-lvm
qm set 150 --scsihw virtio-scsi-pci --scsi0 local-lvm:vm-150-disk-0 --boot order=scsi0

qm create 151 --name "Debian-Web" --memory 2048 --cores 2 --net0 virtio,bridge=vmbr3
qm importdisk 151 /tmp/Debian_Web-1.vmdk local-lvm
qm set 151 --scsihw virtio-scsi-pci --scsi0 local-lvm:vm-151-disk-0 --boot order=scsi0

qm create 152 --name "Debian-Mixxx" --memory 3072 --cores 2 --net0 virtio,bridge=vmbr3
qm importdisk 152 /tmp/Debian_Mixxx-1.vmdk local-lvm
qm set 152 --scsihw virtio-scsi-pci --scsi0 local-lvm:vm-152-disk-0 --boot order=scsi0
```

### 6.2. Reconfiguration Réseau & Services
* **Sur `Debian_Icecast2` (`10.100.0.50`) :**
  Fichier `/etc/network/interfaces` : IP `10.100.0.50/24`, Passerelle `10.100.0.254`.
  Fichier `/etc/icecast2/icecast.xml` :
  ```xml
  <listen-socket>
      <port>8000</port>
      <bind-address>0.0.0.0</bind-address>
  </listen-socket>
  <mount type="normal">
      <mount-name>/joystick-fm</mount-name>
      <password>sourcepassword</password>
      <max-listeners>250</max-listeners>
      <burst-size>65536</burst-size>
  </mount>
  ```
  `systemctl restart icecast2`

* **Sur `Debian_Web` (`10.100.0.51`) :**
  Fichier `/etc/apache2/sites-available/joystickfm.conf` :
  ```apache
  <VirtualHost *:80>
      ServerAdmin webmaster@joystickfm.local
      DocumentRoot /var/www/html

      ProxyPreserveHost On
      # Reverse proxy du flux avec vidage immédiat pour la compatibilité iOS / Safari
      ProxyPass /radio-stream.mp3 http://10.100.0.50:8000/joystick-fm flushpackets=on disablereuse=on
      ProxyPassReverse /radio-stream.mp3 http://10.100.0.50:8000/joystick-fm
  </VirtualHost>
  ```
  Fichier `/var/www/html/wp-config.php` (rendre l'URL dynamique pour le WAN `192.168.101.41`) :
  ```php
  define('WP_SITEURL', 'http://' . $_SERVER['HTTP_HOST']);
  define('WP_HOME', 'http://' . $_SERVER['HTTP_HOST']);
  ```
  `a2enmod proxy proxy_http && systemctl restart apache2`

* **Sur `Debian_Mixxx` (`10.100.0.52`) :**
  Reconfigurer l'IP en `10.100.0.52/24`. Dans Mixxx, Préférences > Diffusion en direct :
  * Type de serveur : `Icecast 2`
  * Hôte : `10.100.0.50` | Port : `8000` | Montage : `/joystick-fm`
  * Format : `MP3` | Débit : `128 kbps`
  * Script Bash xdotool de relance Auto-DJ activé pour garantir le maintien On-Air sous 60 secondes.

---

## 7. ÉLÉMENT 6 : Postes de Travail Clients (`CLT-SAUZEDE` & `CLT-DUTHILLEUL`)

### 7.1. Adressage IP Fixe sur le LAN (VLAN 200)
* **Poste Clément :** `192.168.200.4 /24` | Passerelle `192.168.200.254` | DNS `192.168.200.254`.
* **Poste Mathys :** `192.168.200.10 /24` | Passerelle `192.168.200.254` | DNS `192.168.200.254`.

### 7.2. Intégration du Client VPN Nomade sous Windows 11
1. Double-cliquer sur le certificat racine `CA-AP1-Entreprise.crt` ➔ Installer le certificat dans **Autorités de certification racines de confiance** (Ordinateur local).
2. Double-cliquer sur `Cert-Client-04.p12` ➔ Installer dans **Personnel** (Ordinateur local).
3. Créer la connexion VPN dans les paramètres Windows :
   * Nom de connexion : `VPN-Entreprise-AP1`
   * Nom ou adresse du serveur : `192.168.101.41`
   * Type de réseau privé virtuel (VPN) : `IKEv2`
   * Type d'informations de connexion : `Certificat d'ordinateur`
4. Se connecter : Vérifier l'attribution de l'IP virtuelle `10.200.100.4`.

### 7.3. Déploiement de la Sauvegarde Automatisée des Documents (Mission 1)

#### 7.3.1. Implémentation Linux Mint (Poste Clément `posteclement` / VM 11011 - Validée en conditions réelles ✅)
1. **Création du répertoire de montage :**
   ```bash
   sudo mkdir -p /mnt/partage_sauvegarde
   ```
2. **Création du fichier d'authentification protégé `/etc/smbcredentials-clement` :**
   ```ini
   username=employe04
   password=VOTRE_MOT_DE_PASSE
   ```
   `sudo chmod 600 /etc/smbcredentials-clement`
3. **Montage CIFS silencieux :**
   ```bash
   sudo mount -t cifs //10.30.0.20/Partage /mnt/partage_sauvegarde -o credentials=/etc/smbcredentials-clement,uid=1000,gid=1000
   ```
4. **Création de l'arborescence personnelle & synchronisation rsync :**
   ```bash
   mkdir -p /mnt/partage_sauvegarde/Sauvegardes_Clement
   echo "RApport d'activité AP1 - Clément Sauzède" > ~/Documents/Rapport_AP1.txt
   rsync -avz ~/Documents/ /mnt/partage_sauvegarde/Sauvegardes_Clement/
   ```
5. **Automatisation via crontab avec le script [`scripts/backup-documents.sh`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/scripts/backup-documents.sh) :**
   ```bash
   crontab -e
   # Déclenchement automatique chaque jour à 18h00 :
   0 18 * * * /home/posteclement/scripts/backup-documents.sh > /dev/null 2>&1
   ```

#### 7.3.2. Implémentation Windows (Poste Mathys / Windows 11)
1. Placer le script [`scripts/Backup-Documents.ps1`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/scripts/Backup-Documents.ps1) dans `C:\Scripts\`.
2. Créer une tâche planifiée Windows exécutée quotidiennement à 18h00 :
   ```powershell
   $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File C:\Scripts\Backup-Documents.ps1"
   $trigger = New-ScheduledTaskTrigger -Daily -At 18:00
   Register-ScheduledTask -TaskName "Sauvegarde_Quotidienne_AP1" -Action $action -Trigger $trigger -Description "Sauvegarde Robocopy quotidienne vers SRV-FILES" -User "SYSTEM"
   ```

---

## 8. ÉLÉMENT 7 : Pot de Miel LAMP Leurre (Mission 3 - `SRV-HONEYPOT`)

Sur la VM Debian 12 rattachée à `vmbr3` (IP statique `10.100.0.99/24`) :
1. **Installation d'Apache 2.4 :**
   ```bash
   apt-get update && apt-get install -y apache2 msmtp mailutils fail2ban
   rm /var/www/html/index.html # Page vide / Erreur 403 leurre
   ```
2. **Script d'Alerte Mail Furtif (`/usr/local/bin/honeypot_alert.sh`) :**
   ```bash
   cat << 'EOF' > /usr/local/bin/honeypot_alert.sh
   #!/bin/bash
   tail -F /var/log/apache2/access.log | while read line; do
       IP=$(echo "$line" | awk '{print $1}')
       DATE=$(date '+%Y-%m-%d %H:%M:%S')
       echo -e "Subject: [ALERTE SECURITE] Activite suspecte sur Honeypot\n\nAttaque detectee depuis l'adresse IP : $IP a $DATE\nLog detaille : $line" | sendmail admin@entreprise-ap1.local
   done
   EOF
   chmod +x /usr/local/bin/honeypot_alert.sh
   ```

---

## 9. ÉLÉMENT 8 : Interconnexion Intersite B2B (Mission 2 - Tunnel Partenaire)

1. **Paramètres échangés avec le binôme partenaire :**
   * IP WAN Partenaire : `192.168.101.X`
   * Sous-réseau LAN Partenaire : `192.168.X.0/24`
   * Clé secrète partagée (PSK) : `ClePresharedSuperSecuriseeBTS2026!`
2. **Configuration IPsec Site-à-Site sur OPNsense :**
   * *Phase 1 :* IKEv2, AES-256-GCM, DH Group 14 (2048-bit), SHA256.
   * *Phase 2 :* Local subnet = `10.30.0.21/32` (Seul le serveur Immich est exposé), Remote subnet = `192.168.X.0/24`.
3. **Règle de Filtrage Pare-feu Chirurgicale (Zero-Trust) :**
   * Sur l'interface `IPsec` d'OPNsense :
     * **Autorisé :** Source = `LAN Partenaire` ➔ Destination = `10.30.0.21:2283` (Port HTTP Immich).
     * **Bloqué et Journalisé :** Tout le reste (SMB `445`, SSH `22`, Minecraft `25565`, accès au LAN `192.168.200.0/24`).
