# Guide d'Action Opérationnel — Clément SAUZÈDE (Étudiant 04)
## Lead Réseau, Sécurité & WebRadio JoyStick FM
### Atelier Professionnalisant AP 1 • BTS SIO SISR (Binôme 04 & 10)

---

## 🎯 Votre Rôle & Périmètre d'Intervention

Vous pilotez l'architecture réseau globale, la sécurité du pare-feu OPNsense, le Traffic Shaping, l'infrastructure VPN IPsec et l'intégration complète de votre projet de WebRadio **JoyStick FM** (migration V2V VMware ➔ Proxmox).

> [!TIP]
> **Autonomie & Zéro Blocage :**
> Ce guide est structuré par étapes chronologiques indépendantes. Vous n'avez **jamais besoin d'attendre Mathys** pour avancer. Chaque étape indique ce que Mathys fait en parallèle et les points précis où vous validerez son travail.

---

## 📋 PLAN DE VOL RÉAJUSTÉ DE CLÉMENT

```
[ Étape C1 - FAIT ✅ ] OPNsense : Interfaces, Sécurité WAN, Normalisation & Shaper QoS (2 Mb/s)
     │
[ Étape C2 - FAIT ✅ ] Validation Immich (:2283) & Partage SMB (Mission 2)
     │
[ Étape C3 - FAIT ✅ ] Sauvegarde Automatisée des Documents (Mission 1) [100% VALIDÉ EN DIRECT ✅]
     │
[ Étape C4 - EN COURS ⏳ ] Finalisation Mise à Jour OPNsense (23.1) & Déploiement WireGuard (Mission 1)
     │
[ Étape C5 - EN COURS ⏳ ] Déploiement du Honeypot LAMP Leurre (Mission 3 - 10.100.0.99)
     │
[ Étape C6 - EN ATTENTE ENSEIGNANT ⏸️ ] WebRadio JoyStick FM : Migration V2V VMware->Proxmox
```

---

## 🚀 Étape C1 : Initialisation & Sécurisation Avancée d'OPNsense

> **📍 Pendant que vous faites cette étape, Mathys réalise :**
> L'étape **M1** de son côté (Déploiement sous Proxmox de la VM Windows Server 2022 et création des partages SMB).

### Actions à réaliser :
1. **[FAIT ✅] Accéder à la console Proxmox d'OPNsense :**
   * Interfaces physiques rattachées :
     * `vtnet0` (WAN) ➔ IP Fixe / DHCP : `192.168.101.37 /24` | Passerelle : `192.168.101.254` (pve02).
     * `vtnet1` (LAN VLAN 200) ➔ IP : `192.168.200.254 /24`.
     * `vtnet2` (DMZ Int VLAN 300) ➔ IP : `10.30.0.254 /24`.
     * `vtnet3` (DMZ Ext VLAN 100) ➔ IP : `10.100.0.254 /24`.
2. **[FAIT ✅] Durcir le pare-feu (WebGUI `https://192.168.200.254`) :**
   * **Bloqué ICMP WAN :** Règle créée dans *Firewall > Rules > WAN* (Action: Block, Proto: ICMP Echo Request).
   * **Masquage OS (Scrubbing) :** Dans *Firewall > Settings > Normalization*, **IP Random-ID** coché et actif. *(Note : Max-MSS et Drop fragments se configurent via le bouton `+` de `Detailed settings`).*
3. **[FAIT ✅] Configurer le Traffic Shaper QoS (2 Mb/s) :**
   * Dans *Firewall > Traffic Shaper* :
     * Pipe `Pipe_2Mbps_WAN` créé et plafonné à `2 Mbit/s`.
     * Files pondérées : `Q_Prio_Admin` (Poids 100) et `Q_Standard_Web` (Poids 20).
     * Règle appliquée sur l'interface WAN.
4. **[FAIT ✅] Vérification du durcissement :**
   * Ping ICMP WAN bloqué, normalisation active, limitation 2 Mb/s opérationnelle.

---

## 💾 Étape C3-Bis : [100% VALIDÉ EN DIRECT ✅] Sauvegarde Automatisée des Documents (Mission 1)

> **📍 Réalisé et validé par Clément sur son poste Linux Mint (`posteclement` / VM 11011) vers `SRV-FILES` (`10.30.0.20`) :**

1. **[VALIDÉ ✅] Création du point de montage CIFS :**
   ```bash
   sudo mkdir -p /mnt/partage_sauvegarde
   ```
2. **[VALIDÉ ✅] Sécurisation des identifiants (zéro mot de passe en clair dans les scripts) :**
   * Fichier `/etc/smbcredentials-clement` contenant :
     ```ini
     username=employe04
     password=VOTRE_MOT_DE_PASSE
     ```
   * Droits stricts appliqués : `sudo chmod 600 /etc/smbcredentials-clement` (lecture seule pour root).
3. **[VALIDÉ ✅] Montage réseau sans mot de passe :**
   ```bash
   sudo mount -t cifs //10.30.0.20/Partage /mnt/partage_sauvegarde -o credentials=/etc/smbcredentials-clement,uid=1000,gid=1000
   ```
4. **[VALIDÉ ✅] Création du dossier personnel sur le Samba et synchronisation incrémentale rsync :**
   ```bash
   mkdir -p /mnt/partage_sauvegarde/Sauvegardes_Clement
   echo "RApport d'activité AP1 - Clément Sauzède" > ~/Documents/Rapport_AP1.txt
   rsync -avz ~/Documents/ /mnt/partage_sauvegarde/Sauvegardes_Clement/
   ```
   *Preuve constatée :* Transfert incrémental exécuté avec succès, fichier `Rapport_AP1.txt` bien présent sur le serveur avec droits `drwxr-xr-x posteclement posteclement`.
5. **[VALIDÉ ✅] Script d'automatisation et planification crontab :**
   * Script [`scripts/backup-documents.sh`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/scripts/backup-documents.sh) prêt avec test TCP 445, rotation des logs sur 7 jours.
   * Planifié dans `crontab -e` :
     ```bash
     0 18 * * * /home/posteclement/scripts/backup-documents.sh > /dev/null 2>&1
     ```

---

## 🔐 Étape C4 : VPN Nomade — Finalisation Mise à Jour OPNsense (23.1) & WireGuard

> **📍 Répartition en direct :**
> * **Mathys (Étudiant 10) :** Déploie le serveur **Minecraft** (`SRV-MC` en `10.30.0.22`, port 25565 avec Unbound DNS OPNsense).
> * **Clément (Étudiant 04) :** Finalise la mise à niveau OPNsense, installe WireGuard, puis déploie le **Honeypot LAMP (Mission 3)**.

### A. État de la mise à jour OPNsense (VM 11008) :
* **En cours en direct :** 86 paquets téléchargés et mis à jour (`unbound`, `suricata`, `lighttpd`, `openssl 1.1.1u`, `opnsense-update 23.1.11`...).
* **Dès que le téléchargement et l'installation se terminent :**
  1. Redémarrer OPNsense (depuis la console option 5 ou via le bouton Reboot de la WebGUI).
  2. Dans Proxmox > VM 11008 > Hardware > Processors : Vérifier que le type est réglé sur **`host`** pour bénéficier de l'accélération matérielle AES-NI du CPU serveur.

### B. Déploiement immédiat de WireGuard Nomade :
1. Dans OPNsense > **System > Firmware > Plugins** :
   * Rechercher et installer le plugin **`os-wireguard`** (en 1 clic).
   * Recharger l'interface : l'onglet **VPN > WireGuard** apparaît dans le menu latéral.
2. **Configuration du Serveur Local (Local) :**
   * Cliquer sur `+` (Add Server) :
     * Nom : `WG_Nomade`
     * Port d'écoute : `51820`
     * Tunnel Address : `10.200.100.1/24`
     * Cliquer sur le bouton clé pour générer la **Private Key** (la Public Key se calcule automatiquement).
3. **Déclaration du Client Nomade Clément (Endpoints) :**
   * Cliquer sur `+` (Add Endpoint) :
     * Nom : `Client_Clement_04`
     * Public Key : *Clé publique générée sur le poste client de Clément*
     * Allowed IPs : `10.200.100.2/32`
4. **Pare-feu OPNsense :**
   * **Firewall > Rules > WAN :**
     * Action: `Pass` | Proto: `UDP` | Port dest: `51820` | Description: `Autoriser VPN WireGuard Nomade`.
   * **Firewall > Rules > WireGuard (Interface de groupe) :**
     * Action: `Pass` | Proto: `any` | Dest: `10.30.0.0/24` | Description: `Acces DMZ Interne pour nomades`.
5. **Connexion Client 1-Clic sur Linux Mint / Windows :**
   * Sur Linux Mint : `sudo apt install wireguard` ou importer le fichier `.conf` dans NetworkManager.
   * Test de connectivité immédiat : `ping 10.30.0.20` et accès au partage `//10.30.0.20/Partage`.

---

## 🍯 Étape C5 : Déploiement du Honeypot LAMP Leurre (Mission 3)

> **📍 Clément configure le pare-feu et le serveur leurre en DMZ Externe pendant que Mathys finalise Minecraft :**

### Actions à réaliser :
1. **Sur la VM Dédiée `SRV-HONEYPOT` (`10.100.0.99` sous Debian 12 en DMZ Externe) :**
   * Installer Apache 2 et les utilitaires de sécurité :
     ```bash
     sudo apt update && sudo apt install -y apache2 fail2ban mailutils
     sudo rm /var/www/html/index.html   # Provoque une erreur 403 Forbidden leurre
     ```
2. **Sur OPNsense (Redirection NAT WAN) :**
   * Dans **Firewall > NAT > Port Forward** :
     * Interface : `WAN` | Proto : `TCP` | Port dest : `8080` (ou port exposé pour attirer les scanners).
     * Redirect target IP : `10.100.0.99` | Redirect target port : `80`.
     * NAT Reflection : `Enable`.
3. **Surveillance & Bannissement automatique :**
   * Script d'alerte en écoute sur `/var/log/apache2/access.log` ou Fail2ban avec jail HTTP.

---

## 🌐 Étape C6 : Tunnel IPsec B2B Inter-Entreprises & Filtrage Chirurgical

> **📍 Pendant que vous faites cette étape, Mathys réalise :**
> L'étape **M5** de son côté (Passage de la suite de tests de recette et prises de captures d'écran E5).

### Actions à réaliser :
1. **Récupérer les paramètres collectés par Mathys lors de l'étape M3 :**
   * IP WAN Partenaire (`192.168.101.X`) et sous-réseau partenaire (`192.168.X.0/24`).
2. **Monter le tunnel IPsec Site-à-Site sur OPNsense :**
   * Phase 1 : IKEv2, PSK partagée, AES-256-GCM.
   * Phase 2 : Sous-réseau local = `10.30.0.21/32` (Serveur Immich uniquement).
3. **Appliquer le filtrage chirurgical Zero-Trust sur l'interface IPsec :**
   * Autoriser uniquement le trafic TCP vers `10.30.0.21:2283` (Album Immich).
   * Bloquer et journaliser en rouge tout le reste (SMB `445`, Minecraft `25565`, LAN `192.168.200.0/24`).
4. **Validation finale :**
   * Demander au binôme partenaire d'ouvrir l'album photo partagé.
   * Vérifier dans les logs OPNsense le blocage de ses tentatives de ping ou d'accès SMB.

---

## 📻 Étape C7 : [EN ATTENTE ENSEIGNANT ⏸️] WebRadio JoyStick FM (Migration V2V)

* Dès que les fichiers VMDK sont importés sur le stockage local de Proxmox par l'enseignant :
  * Exécution de `qm importdisk` pour les VM 150 (Icecast), 151 (Web), 152 (Mixxx).
  * Validation du flux continu et de la haute disponibilité.
