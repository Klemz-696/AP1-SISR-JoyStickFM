# Document 06 : Migration & Intégration de la WebRadio JoyStick FM en DMZ Externe
## Projet AP 1 - BTS SIO SISR (Binôme 04 & 10)

---

## 1. Contexte & Enjeux de la Mission 2

Le cahier des charges de la Mission 2 stipule :
> *« La direction souhaite migrer la webradio du lycée vers votre nouvelle infrastructure, en DMZ externe, sans interruption perceptible pour les auditeurs. La webradio (Icecast) reste accessible publiquement en streaming, sans passer par le VPN. L'ouverture du port de streaming est la seule exception à la règle "seul le port VPN est ouvert" posée en Mission 1. »*

Dans le cadre de cet atelier, l'infrastructure de la webradio existante du lycée est issue du projet **JoyStick FM** (conçu et développé initialement par **Clément SAUZÈDE — Étudiant 04**). Elle est composée à l'origine de 4 machines virtuelles sous VMware vSphere (réseau `10.10.10.0/24`) dont Clément assure personnellement le transfert inter-hyperviseurs V2V, l'intégration en DMZ Externe et la reconfiguration complète :
1. **`Debian_Icecast2` :** Le serveur de streaming audio (Icecast 2 sur le port 8000, point de montage `/joystick-fm`).
2. **`Debian_Web` :** Le portail auditeurs sous Apache 2.4, MariaDB et CMS WordPress personnalisé, intégrant un Reverse-Proxy audio `/radio-stream.mp3`.
3. **`Debian_Mixxx` :** La régie DJ avec script d'automatisation Bash (`xdotool`) pour l'Auto-DJ et diffusion permanente.
4. **`OPNSense_Joystick-FM` :** L'ancien pare-feu de premier niveau (décommissionné et absorbé).

### Arbitrage d'Architecture pour l'AP1 :
* **Absorption du pare-feu d'origine :** Conformément à la consigne *« Un seul routeur/pare-feu sera utilisé pour ce périmètre »*, la VM `OPNSense_Joystick-FM` **n'est pas redéployée**. Ses règles de filtrage et de translation de ports (NAT) sont **intégralement absorbées par le pare-feu central OPNsense-AP1**.
* **Intégration en DMZ Externe (VLAN 100) :** Les 3 VM Debian sont migrées sur le sous-réseau `10.100.0.0/24` rattaché à l'interface `vtnet3` (passerelle `10.100.0.254`).
* **Double Exposition WAN (Option B validée) :**
  * **Port 8000 :** Flux audio brut Icecast (`http://192.168.101.41:8000/joystick-fm`) pour les lecteurs multimédias externes (VLC, radios IP, conformité stricte au sujet AP1).
  * **Port 80 :** Portail web JoyStick FM (`http://192.168.101.41/`) offrant l'expérience utilisateur complète avec le lecteur dynamique HTML5 et le chat en direct.

---

## 2. Architecture Technique Cible dans l'AP1

```
                                  [ AUDITEURS SUR LE WAN LYCÉE ]
                                                |
                 +------------------------------+------------------------------+
                 | Requête HTTP : Port 80                                      | Requête Audio : Port 8000
                 v                                                             v
  +-----------------------------------------------------------------------------------------+
  |                               PARE-FEU CENTRAL OPNSENSE-AP1                            |
  |                           IP WAN Statique : 192.168.101.41 /24                          |
  +-----------------------------------------------------------------------------------------+
                                                |
                                    [ vtnet3 : Passerelle 10.100.0.254 ]
                                                |
  === DMZ EXTERNE (VLAN 100 - Réseau 10.100.0.0/24) =========================================
       |                                        |                                      |
       v                                        v                                      v
  [ Debian_Web ]                          [ Debian_Icecast2 ]                    [ Debian_Mixxx ]
   IP: 10.100.0.51                         IP: 10.100.0.50                        IP: 10.100.0.52
   - Apache 2.4 (Port 80)                  - Icecast 2.4 (Port 8000)              - Interface XFCE
   - WordPress JoyStick FM                 - Point de montage :                   - Mixxx 2.3+ Auto-DJ
   - Reverse Proxy audio :                   /joystick-fm                         - Script xdotool
     /radio-stream.mp3                     - Encodage MP3 128 kbps                  (reprise auto ON AIR)
     -> http://10.100.0.50:8000/joystick-fm
```

---

## 3. Migration Inter-Hyperviseurs V2V (VMware vSphere ➔ Proxmox VE)

> [!IMPORTANT]
> **Contexte de virtualisation hétérogène (Épreuve E5) :**
> L'infrastructure initiale de la webradio JoyStick FM a été conçue, exploitée et exportée depuis un environnement **VMware vSphere (ESXi)** sous forme d'appliances virtuelles (fichiers `.ovf` et disques virtuels `.vmdk` situés dans `Webradio/4- VMs/`).
>
> Le projet AP 1 étant quant à lui hébergé sur la plateforme **Proxmox VE (KVM/QEMU)** du lycée, cette opération constitue une véritable **migration inter-hyperviseurs V2V (Virtual-to-Virtual)**. Elle nécessite la conversion des disques propriétaires VMware vers le stockage Proxmox et l'adaptation des pilotes virtuels (remplacement de l'émulation VMware par les pilotes para-virtuels **VirtIO** haute performance).

### Étape 1 : Analyse des disques sources VMware vSphere
Les appliances exportées depuis vSphere sont stockées dans le dossier local :
* `Webradio/4- VMs/Icecast/` : Fichier descripteur `.ovf` et disque `Debian_Icecast2-1.vmdk`
* `Webradio/4- VMs/Web/` : Fichier descripteur `.ovf` et disque `Debian_Web-1.vmdk`
* `Webradio/4- VMs/Mixxx/` : Fichier descripteur `.ovf` et disque `Debian_Mixxx-1.vmdk`
*(Note : L'archive `OPNSense/` sous VMware est délaissée puisque ses fonctions sont absorbées par OPNsense-AP1).*

### Étape 2 : Transfert des images VMDK vers le nœud Proxmox
Transférez les trois disques `.vmdk` sur le serveur Proxmox VE (via SFTP / SCP / WinSCP dans le répertoire temporaire `/var/lib/vz/dump/` ou `/tmp/`) :
```bash
# Exemple de transfert depuis le terminal administrateur :
scp "Webradio/4- VMs/Icecast/Debian_Icecast2-1.vmdk" root@proxmox:/tmp/
scp "Webradio/4- VMs/Web/Debian_Web-1.vmdk" root@proxmox:/tmp/
scp "Webradio/4- VMs/Mixxx/Debian_Mixxx-1.vmdk" root@proxmox:/tmp/
```

### Étape 3 : Création des VM réceptrices et conversion à la volée (`qm importdisk`)
Sous Proxmox VE, l'utilitaire en ligne de commande `qm importdisk` assure la **conversion native du format VMware VMDK vers le pool de stockage Proxmox** (format `raw` ou `qcow2` sur `local-lvm`), tout en associant un contrôleur SCSI VirtIO :

```bash
# 1. VM Icecast (VMID 150)
qm create 150 --name "Debian-Icecast2" --memory 2048 --cores 2 --net0 virtio,bridge=vmbr3
qm importdisk 150 /tmp/Debian_Icecast2-1.vmdk local-lvm
qm set 150 --scsihw virtio-scsi-pci --scsi0 local-lvm:vm-150-disk-0 --boot order=scsi0

# 2. VM Web WordPress (VMID 151)
qm create 151 --name "Debian-Web" --memory 2048 --cores 2 --net0 virtio,bridge=vmbr3
qm importdisk 151 /tmp/Debian_Web-1.vmdk local-lvm
qm set 151 --scsihw virtio-scsi-pci --scsi0 local-lvm:vm-151-disk-0 --boot order=scsi0

# 3. VM Mixxx Régie (VMID 152)
qm create 152 --name "Debian-Mixxx" --memory 3072 --cores 2 --net0 virtio,bridge=vmbr3
qm importdisk 152 /tmp/Debian_Mixxx-1.vmdk local-lvm
qm set 152 --scsihw virtio-scsi-pci --scsi0 local-lvm:vm-152-disk-0 --boot order=scsi0
```

### Étape 4 : Optimisation post-migration (Pilotes VirtIO & QEMU Guest Agent)
Une fois les machines démarrées sur Proxmox :
1. **Désinstallation des outils VMware obsolètes :**
   ```bash
   apt-get purge -y open-vm-tools open-vm-tools-desktop
   ```
2. **Installation de l'agent invité KVM/Proxmox :**
   ```bash
   apt-get update && apt-get install -y qemu-guest-agent
   systemctl enable --now qemu-guest-agent
   ```
3. Activer l'option correspondante dans Proxmox : `qm set <VMID> --agent 1`.

---

## 4. Reconfiguration Réseau & Services des VM (Passage en 10.100.0.X)

Dans l'ancien projet, les machines étaient en `10.10.10.X`. Voici les modifications à appliquer pour les intégrer au plan d'adressage AP1 :

### A. Reconfiguration des interfaces (`/etc/network/interfaces`)

* **Sur `Debian_Icecast2` :**
  ```ini
  auto eth0 (ou ens18)
  iface eth0 inet static
      address 10.100.0.50
      netmask 255.255.255.0
      gateway 10.100.0.254
      dns-nameservers 1.1.1.1 8.8.8.8
  ```
* **Sur `Debian_Web` :**
  ```ini
  auto eth0 (ou ens18)
  iface eth0 inet static
      address 10.100.0.51
      netmask 255.255.255.0
      gateway 10.100.0.254
      dns-nameservers 1.1.1.1 8.8.8.8
  ```
* **Sur `Debian_Mixxx` :**
  ```ini
  auto eth0 (ou ens18)
  iface eth0 inet static
      address 10.100.0.52
      netmask 255.255.255.0
      gateway 10.100.0.254
      dns-nameservers 1.1.1.1 8.8.8.8
  ```

---

### B. Mise à jour de la Régie Mixxx (`Debian_Mixxx`)
Dans les préférences de diffusion en direct de Mixxx (*Options > Préférences > Diffusion en direct*) :
* **Hôte :** `10.100.0.50` *(l'IP de Debian_Icecast2)*
* **Port :** `8000`
* **Point de montage :** `/joystick-fm`
* **Type de serveur :** Icecast 2
* **Mot de passe :** *Le mot de passe source défini dans icecast.xml*

---

### C. Mise à jour du Reverse-Proxy Apache (`Debian_Web`)
Dans la configuration du VirtualHost Apache (`/etc/apache2/sites-available/000-default.conf` ou `joystickfm.conf`) :

```apache
# Redirection optimisée iOS / CORS vers la nouvelle IP d'Icecast
ProxyPass "/radio-stream.mp3" "http://10.100.0.50:8000/joystick-fm" flushpackets=on disablereuse=on
ProxyPassReverse "/radio-stream.mp3" "http://10.100.0.50:8000/joystick-fm"
```
Recharger la configuration :
```bash
sudo systemctl reload apache2
```

---

### D. Résolution de l'URL Dynamique WordPress (`wp-config.php`)
Pour éviter que WordPress n'entre en boucle de redirection 301 lors des accès depuis l'IP publique du pare-feu (`192.168.101.41`), vérifiez la présence des directives éprouvées dans `/var/www/html/wp-config.php` :

```php
// Résolution dynamique de l'hôte (compatible IP WAN 192.168.101.41 et accès local)
define('WP_HOME', 'http://' . $_SERVER['HTTP_HOST']);
define('WP_SITEURL', 'http://' . $_SERVER['HTTP_HOST']);
define('CONCATENATE_SCRIPTS', false);
```

---

## 5. Configuration Pare-feu OPNsense-AP1 (Règles NAT & Cloisonnement)

### A. Translation de Ports WAN (Firewall > NAT > Port Forward)
Deux règles de redirection sont créées sur l'interface WAN :

1. **Règle 1 : Streaming Icecast Direct (Conformité Sujet AP1)**
   * **Interface :** `WAN`
   * **Protocol :** `TCP`
   * **Destination :** `WAN address`
   * **Destination Port :** `8000`
   * **Redirect target IP :** `10.100.0.50` (Debian_Icecast2)
   * **Redirect target Port :** `8000`
   * **Description :** `M2 - Flux streaming public Icecast JoyStick FM`

2. **Règle 2 : Portail Web & Player Audio (Expérience Utilisateur Complète)**
   * **Interface :** `WAN`
   * **Protocol :** `TCP`
   * **Destination :** `WAN address`
   * **Destination Port :** `80 (HTTP)`
   * **Redirect target IP :** `10.100.0.51` (Debian_Web)
   * **Redirect target Port :** `80`
   * **Description :** `M2 - Portail Web et Player audio JoyStick FM`

---

### B. Cloisonnement Anti-Rebond de la DMZ Externe (Firewall > Rules > DMZ_EXT)
Pour garantir l'étanchéité de votre réseau interne :
* **Règle 1 :** Bloquer tout trafic de `DMZ_EXT net` vers `LAN net` (`Block & Log`).
* **Règle 2 :** Bloquer tout trafic de `DMZ_EXT net` vers `DMZ_INT net` (`Block & Log`).
* **Règle 3 :** Autoriser le trafic de `DMZ_EXT net` vers `any` uniquement pour les réponses HTTP/Streaming et les requêtes NTP/DNS (`Pass`).

---

## 6. Stratégie de Migration Sans Coupure Audio (*Zero Downtime*)

Pour justifier la continuité de service demandée en Mission 2 :

1. **Phase de Relais Transitoire (Master/Slave Relay) :**
   * Durant la phase de bascule, le nouveau serveur Icecast en DMZ Externe (`10.100.0.50`) intègre temporairement un bloc `<relay>` pointant vers l'ancienne IP de streaming.
   * Les deux instances diffusent simultanément le flux JoyStick FM synchronisé.
2. **Tolérance au Buffer des Auditeurs :**
   * Les clients audio (navigateurs web, VLC) maintiennent un **tampon de préchargement de 5 à 10 secondes**.
   * La mise à jour de la redirection de port sur OPNsense-AP1 s'opère en quelques millisecondes, rendant la transition **totalement imperceptible** à l'écoute.
3. **Validation de Charge (JMeter) :**
   * L'infrastructure a été préalablement validée sous Apache JMeter (`Webradio/2- Tests/`) jusqu'à **250 auditeurs simultanés avec un taux d'erreur de 0%**.

---

## 7. Bilan du Déploiement & Recette Effectuée (04/10/2026)

Le déploiement et la mise en production de la WebRadio JoyStick FM ont été **intégralement réalisés et validés avec succès** :
* **Golden Template Debian 12 :** Déployé sous Proxmox VE avec script `prepare_template.sh` (optimisation, qemu-guest-agent, clés SSH ED25519, purge machine-id).
* **Serveur Icecast 2 (`10.100.0.50:8000`) :** Opérationnel sur le point de montage `/joystick-fm` (128 kbps MP3).
* **Régie Auto-DJ Streamer (`10.100.0.52`) :** Service systemd `joystick-streamer` actif, boucle de diffusion aléatoire continue sur les 11 titres/jingles officiels de JoyStick FM.
* **Portail Web WordPress (`10.100.0.51:80`) :** WordPress 6.x déployé avec le thème sur-mesure `joystickfm-theme`, permaliens réécrits propres (`/radio/`, `/podcasts/`, `/blog/`), Reverse-Proxy audio Apache transparent `/radio-stream.mp3` et API live Icecast `online: true`.
* **Sécurité & Zero-Trust :** Clés SSH déployées sur les 3 serveurs pour une administration sans mot de passe, isolation du port 8000 masqué derrière Apache.
