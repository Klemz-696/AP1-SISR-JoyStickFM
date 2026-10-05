# 🚀 DOCUMENT DE REPRISE DE SESSION — MIGRATION VERS GROS PC
*Date de génération : 03/10/2026 16:15*
*Binôme : Clément SAUZÈDE (04 - Lead Réseau) & Mathys DUTHILLEUL (10 - Admin Systèmes)*
*Contexte : AP 1 BTS SIO SISR — Lycée Sidoine Apollinaire*

---

## 📌 1. PROMPT DE REPRISE IMMÉDIATE POUR ANTIGRAVITY SUR LE GROS PC
> **Instructions pour Clément :**  
> Lorsque tu ouvres Antigravity IDE sur ton gros PC dans le dossier `AP 1`, colle simplement le message suivant dans le chat :
> 
> ```text
> Bonjour Antigravity, nous reprenons le travail sur l'AP 1 BTS SIO depuis mon gros PC.
> Lis attentivement le fichier REPRISE_SESSION_GROS_PC.md situé à la racine du projet.
> 
> Résumé rapide :
> - Mission 1 (VPN Nomade WireGuard, Samba \\10.30.0.20\Partage, backup rsync/CIFS) est 100% VALIDÉE.
> - Mission 3 (Honeypot 10.100.0.99, alerting, anti-rebond Zero-Trust) est 100% VALIDÉE.
> - Mission 2 (Serveur Minecraft Paper 26.2 sur 10.30.0.22:25565) est 100% VALIDÉ et testé en jeu par Klemz_696 (WireGuard 10.200.100.2:29036).
> 
> Nous nous étions arrêtés aux plans d'action suivants :
> 1. Préparation du VPN IPsec Intergroupes B2B sur OPNsense.
> 2. Supervision globale de tout le projet (Uptime Kuma, Netdata).
> 3. Gestion simplifiée des plugins du serveur Minecraft.
> Confirme-moi que tu as tout en mémoire et dis-moi par quoi nous commençons !
> ```

---

## 🌐 2. CARTOGRAPHIE COMPLÈTE DE L'INFRASTRUCTURE

| VM ID | Nom de la VM | OS | Rôle & Services | IP Réseau | Ports Actifs |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **11008** | `OPNsense-projet` | FreeBSD | Pare-feu / Routeur / WireGuard / QoS | WAN: `192.168.101.37`<br>LAN: `192.168.200.254`<br>DMZ_INT: `10.30.0.254`<br>DMZ_EXT: `10.100.0.254` | 51820 (WireGuard)<br>443 (Web GUI)<br>8000 & 80 (NAT) |
| **11010** | `SRV-FILES-projet` | Linux Debian | Serveur de fichiers Samba (`/srv/partage`) | `10.30.0.20/24` | 445 (SMB), 22 (SSH) |
| **11011** | `Poste-Clement-projet` | Linux Mint | Bastion d'administration & Sauvegardes | LAN: `192.168.200.4`<br>WAN SIO: `192.168.100.172`<br>Tailscale: `100.88.228.38` | 22 (SSH) |
| **11013** | `SRV-HONEYPOT-projet`| Debian 12 | Honeypot LAMP (Mission 3) | `10.100.0.99/24` (DMZ Ext) | 80 (Apache leurre), 22 (SSH) |
| **11016** | `SRV-IMMICH-projet` | Debian 12 | Hébergement photos Immich (Docker) | `10.30.0.21/24` | 2283 (Immich Web), 22 |
| **11017** | `srv-minecraft` | Debian 12 | Serveur Minecraft autonome (Docker) | `10.30.0.22/24` | 25565 (Jeu), 22 (SSH) |
| **-** | `Debian_Icecast2` | Debian | WebRadio - Streaming Icecast (Mission 2) | `10.100.0.50/24` (DMZ Ext) | 8000 (Stream) |
| **-** | `Debian_Web` | Debian | WebRadio - Site WordPress (Mission 2) | `10.100.0.51/24` (DMZ Ext) | 80 (Web) |
| **-** | `Debian_Mixxx` | Debian | WebRadio - Auto-DJ Mixxx (Mission 2) | `10.100.0.52/24` (DMZ Ext) | - |

---

## 🔑 3. IDENTIFIANTS & CLÉS CRYPTOGRAPHIQUES

### WireGuard VPN Nomade (Mission 1)
- **OPNsense (Serveur Nomade) :**
  - IP Tunnel : `10.200.100.1/24` (Port UDP `51820`)
  - Public Key : `K50IYYDVUQN9OkUvIWnNZzLlGg05cotWZLoMOZnwnWU=`
  - Private Key : `8O3TaYPXju4NK8uHsGlm+3TiwJARhlOY0BFSMOwNiX8=`
- **PC Portable Clément (`desktop-7t3hsh1`) :**
  - IP Tunnel : `10.200.100.2/24`
  - Public Key : `hmXSqKhmpEabrbqydVEniHiEMZuzmu7OhQ4OgpGhRBY=`
  - Private Key : `mDzMSk7jB6qeqAoTEiw6slX5t8Fn0/rFdjjLQasp62Q=`
  - AllowedIPs : `10.30.0.0/24, 10.100.0.0/24, 192.168.200.0/24`
- **Fichier de configuration client :**
```ini
[Interface]
PrivateKey = mDzMSk7jB6qeqAoTEiw6slX5t8Fn0/rFdjjLQasp62Q=
Address = 10.200.100.2/24
DNS = 1.1.1.1

[Peer]
PublicKey = K50IYYDVUQN9OkUvIWnNZzLlGg05cotWZLoMOZnwnWU=
Endpoint = 192.168.101.37:51820
AllowedIPs = 10.30.0.0/24, 10.100.0.0/24, 192.168.200.0/24
PersistentKeepalive = 25
```
*(Ce même profil peut être importé dans le client WireGuard du gros PC dès lors que le portable n'est pas connecté simultanément).*

### Comptes et Services
- **Samba (`SRV-FILES`) :** Utilisateur `employe04` sur partage `\\10.30.0.20\Partage`.
- **Minecraft (`srv-minecraft`) :**
  - Emplacement : `/opt/minecraft/docker-compose.yml`
  - Données : `/opt/minecraft/data/`
  - Opérateur (OP) : `Klemz_696`
  - Commande RCON : `docker exec -i minecraft_ap1 rcon-cli op <Pseudo>`
- **Honeypot (`SRV-HONEYPOT`) :**
  - Script d'alerte : `/usr/local/bin/honeypot-alert.sh`
  - Log intrusions : `/var/log/honeypot-intrusions.log`
  - Service : `systemctl status honeypot-alert`

---

## 🏆 4. ÉTAT D'AVANCEMENT EXACT DES MISSIONS

1. **Mission 1 (100% VALIDÉE ✅)** :
   - VPN Nomade WireGuard fonctionnel et fluide.
   - Partage de fichiers authentifié SMB accessible et testé.
   - Sauvegarde automatique quotidienne rsync/CIFS validée.
   - Traffic Shaper OPNsense 2 Mb/s actif.
2. **Mission 3 (100% VALIDÉE ✅)** :
   - Honeypot LAMP actif dans la DMZ Externe (`10.100.0.99`).
   - Alerting en direct dans les logs.
   - Règle de blocage anti-rebond Zero-Trust validée (100% packet loss vers le réseau interne).
3. **Mission 2 (Partiellement validée)** :
   - **Minecraft : 100% VALIDÉ ✅** (Docker Paper 26.2-129 sous Java 25, contournement du blocage SNI académique par bundler Mojang/Paperclip local, BlueMap épuré pour optimiser la RAM/CPU, joueur `Klemz_696` connecté et authentifié avec succès via WireGuard `10.200.100.2:29036` sur `10.30.0.22:25565`).
   - **Tunnel IPsec B2B Intergroupes :** Fiche prête, règles Zero-Trust planifiées.
   - **WebRadio JoyStick FM :** Mise de côté temporairement sur demande de Clément.
   - **Supervision :** Plan d'architecture rédigé (Uptime Kuma, Netdata, Insight).

---

## 📋 5. PROCHAINES ACTIONS DÈS LA REPRISE SUR LE GROS PC
1. **Activer le VPN WireGuard sur le gros PC : VALIDÉ ✅** (Tunnel opérationnel, utilisé pour administrer et jouer sur `10.30.0.22`).
2. **Gestion simplifiée des plugins Minecraft** : Utilisation du script de déploiement automatique `Deploy-Plugin.ps1` ou panel Crafty.
3. **Configurer la phase 1 et 2 du VPN IPsec B2B sur OPNsense** pour être prêts à s'interconnecter avec l'autre groupe partenaire.
4. **Déployer Uptime Kuma** pour monitorer l'ensemble des 7 VM du projet sur un dashboard unique.
