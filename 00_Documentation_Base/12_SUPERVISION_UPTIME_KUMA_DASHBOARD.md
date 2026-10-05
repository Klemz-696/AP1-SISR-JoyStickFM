# 📊 Document 12 : Supervision & Tableau de Bord Unifié — Uptime Kuma
## Projet AP 1 - BTS SIO SISR (Binôme 04 & 10)
*Auteurs : Clément SAUZÈDE (04 - Lead Réseau) & Mathys DUTHILLEUL (10 - Admin Systèmes)*  
*Hôte de Supervision : `Poste-Clement-projet` (VM 11011 — Linux Mint)*  
*Adresses d'accès : `http://192.168.200.4:3001` (LAN/WireGuard) & `http://100.88.228.38:3001` (Tailscale)*  

---

## 🎯 1. Contexte & Enjeux du Référentiel BTS SIO SISR

Dans une infrastructure informatique d'entreprise distribuée (multi-VLANs, DMZ, tunnels VPN nomades et liaisons inter-sites), l'administrateur système et réseau doit disposer d'une **visibilité continue et centralisée** sur l'état de santé des serveurs et la disponibilité des services (SLA).

La brique de supervision **Uptime Kuma** est déployée sur le bastion d'administration de l'employé nomade (`Poste-Clement-projet`) pour assurer :
1. **La surveillance proactive** (détection de coupure en moins de 30 secondes).
2. **L'observabilité des métriques clés** (temps de réponse ICMP/HTTP, ping réseau, statut des ports).
3. **Le suivi applicatif spécifique** (sonde Minecraft native affichant les joueurs connectés et le MOTD).
4. **La publication d'une page d'état (Status Page)** accessible aux utilisateurs et au jury d'examen.

---

## 🗺️ 2. Architecture de Supervision Globale

```
                ┌────────────────────────────────────────────────────────┐
                │      Poste-Clement-projet (VM 11011 - Linux Mint)      │
                │     IP LAN: 192.168.200.4 | Tailscale: 100.88.228.38   │
                │                                                        │
                │     ┌────────────────────────────────────────────┐     │
                │     │        Conteneur Docker Uptime Kuma        │     │
                │     │       Port 3001 (Web Dashboard)            │     │
                │     └─────────────────────┬──────────────────────┘     │
                └───────────────────────────┼────────────────────────────┘
                                            │
           ┌────────────────────────────────┼────────────────────────────────┐
           │ Sondes ICMP & TCP              │ Sondes Web & API               │ Sonde Dédiée
           ▼                                ▼                                ▼
┌──────────────────────┐         ┌──────────────────────┐         ┌──────────────────────┐
│   ROUTEUR / FIREWALL │         │     DMZ EXTERNE      │         │     DMZ INTERNE      │
│ OPNsense (200.254)   │         │ Honeypot (100.99:80) │         │ Samba SMB (30.20:445)│
│  • Ping passerelle   │         │ Icecast (100.50:8000)│         │ Immich (30.21:2283)  │
│  • WebGUI HTTPS (443)│         │ WordPress (100.51:80)│         │ PaperMC (30.22:25565)│
└──────────────────────┘         └──────────────────────┘         └──────────────────────┘
```

---

## 📋 3. Matrice d'Homologation des 12 Sondes de Supervision

| ID | Cible | Machine / IP | Type de Sonde | Port / URL | Fréquence | Seuil d'Alerte |
| :---: | :--- | :--- | :---: | :--- | :---: | :---: |
| **S01** | Passerelle LAN | OPNsense (`192.168.200.254`) | **Ping (ICMP)** | - | 20s | > 50 ms |
| **S02** | WebGUI Pare-feu | OPNsense (`192.168.200.254`) | **HTTP(s)** | `https://192.168.200.254` *(Ignore SSL)* | 30s | Code != 200 |
| **S03** | Bastion Admin | Poste-Clément (`192.168.200.4`) | **Ping (ICMP)** | - | 30s | > 20 ms |
| **S04** | Serveur Fichiers | SRV-FILES (`10.30.0.20`) | **Ping (ICMP)** | - | 20s | > 30 ms |
| **S05** | Partage Samba | SRV-FILES (`10.30.0.20`) | **Port TCP** | Port `445` (SMB) | 30s | Conn. Refused |
| **S06** | Serveur Photos | SRV-IMMICH (`10.30.0.21`) | **Ping (ICMP)** | - | 20s | > 30 ms |
| **S07** | Application Immich | SRV-IMMICH (`10.30.0.21`) | **HTTP(s)** | `http://10.30.0.21:2283` | 30s | Code != 200 |
| **S08** | Serveur Minecraft | srv-minecraft (`10.30.0.22`) | **Ping (ICMP)** | - | 20s | > 30 ms |
| **S09** | Moteur PaperMC | srv-minecraft (`10.30.0.22`) | **Minecraft Ping** | Port `25565` *(Java Edition)* | 15s | Serveur offline |
| **S10** | Honeypot Leurre | SRV-HONEYPOT (`10.100.0.99`) | **Ping (ICMP)** | - | 20s | > 30 ms |
| **S11** | Page Web Leurre | SRV-HONEYPOT (`10.100.0.99`) | **HTTP(s)** | `http://10.100.0.99:80` | 30s | Code != 200 |
| **S12** | WebRadio Stream | Icecast (`10.100.0.50`) | **HTTP(s)** | `http://10.100.0.50:8000` | 30s | Code != 200 |

> [!NOTE]
> **La sonde S09 (Minecraft Ping)** d'Uptime Kuma interroge le protocole de statut Minecraft (SLP). Elle extrait dynamiquement le MOTD officiel (`§6AP 1 BTS SIO...`), le nombre de joueurs en jeu (`x / 10`), la version du moteur (`Paper 26.2`) et le temps de latence en millisecondes.

---

## 🛠️ 4. Procédure de Déploiement en 1 Ligne sur Poste-Clément

Un script automatisé est disponible dans le référentiel du projet : [`scripts/deploy_uptime_kuma.sh`](file:///c:/Users/sauze/Desktop/AP%201/scripts/deploy_uptime_kuma.sh).

### Exécution sur la VM Linux Mint (`Poste-Clement-projet`) :
```bash
# 1. Se connecter sur le poste Clément (via Terminal, SSH ou noVNC)
# 2. Exécuter le script de déploiement officiel
sudo bash /home/posteclement/AP_1/scripts/deploy_uptime_kuma.sh
```

*(Ou en copiant/collant directement ces 3 commandes Docker dans un terminal) :*
```bash
sudo mkdir -p /opt/uptime-kuma/data
sudo docker run -d --restart=always -p 3001:3001 -v /opt/uptime-kuma/data:/app/data --name uptime-kuma louislam/uptime-kuma:2
```

---

## 🖥️ 5. Prise en Main & Configuration du Dashboard

### A. Premier Accès & Initialisation
1. Ouvrez un navigateur sur :
   - En réseau local / VPN : **`http://192.168.200.4:3001`**
   - De l'extérieur via Tailscale : **`http://100.88.228.38:3001`**
2. Créez le compte administrateur principal :
   - **Nom d'utilisateur :** `admin`
   - **Mot de passe :** `Sisr2026!Kuma` (ou le mot de passe fort du binôme).

### B. Ajout Rapide d'une Sonde (Exemple Sonde Minecraft)
1. Cliquez sur **`+ Ajouter une nouvelle sonde`** en haut à gauche.
2. **Type de sonde :** Sélectionnez **`Serveur Minecraft`** dans la liste déroulante.
3. **Nom convivial :** `Serveur Minecraft Paper 26.2 (Mission 2)`
4. **Nom d'hôte :** `10.30.0.22`
5. **Port :** `25565`
6. **Intervalle de pulsation :** `20 secondes`
7. Cliquez sur **`Enregistrer`**.  
👉 La sonde passe instantanément en **Vert (Up)** et affiche le ping en millisecondes ainsi que les joueurs en ligne !

### C. Création de la "Status Page" Publique (Effet WOW pour l'Évaluation)
1. Cliquez sur **`Pages de statut`** dans la barre de navigation.
2. Cliquez sur **`Nouvelle page de statut`** :
   - **Titre :** `État des Services Informatiques — AP 1 BTS SIO`
   - **Chemin (Slug) :** `status` (URL : `http://192.168.200.4:3001/status/status`)
   - **Description :** `Supervision en temps réel des infrastructures réseau, DMZ et services applicatifs (Groupe 04 & 10)`.
3. Glissez-déposez l'ensemble des 12 sondes par catégories (**Infrastructure Réseau**, **Production Interne**, **Services Publics**).
4. Cliquez sur **`Enregistrer`**.

---

## 🔔 6. Notifications & Alerting en Temps Réel

Uptime Kuma permet d'envoyer instantanément des notifications dès qu'un service tombe ou redevient disponible :
- **Discord Webhook** : Alerte sur le serveur d'entraide des étudiants.
- **Telegram Bot** : Notification push directe sur smartphone.
- **Email SMTP** : Relais via le serveur Postfix de la Mission 3.

---

## 🏆 7. Preuves Attendues pour le Dossier de Recette (Compétence SISR)

Pour valider l'activité **« B1.2 - Gérer le patrimoine informatique (Superviser les services) »** :
1. **Capture globale du Dashboard** : Grille des 12 sondes toutes vertes avec les graphiques de temps de réponse.
2. **Capture de la Sonde Minecraft** : Détail de la sonde affichant le port 25565, le temps de réponse et la détection active du serveur Paper.
3. **Test de Coupure Incident (Recette)** :
   - Couper temporairement le conteneur Honeypot (`docker stop` ou `systemctl stop apache2`).
   - Observer le passage de la sonde en **Rouge (Down)** en moins de 30 secondes avec horodatage précis de l'incident.
   - Redémarrer le service et valider le retour au statut **Vert (Up)**.
