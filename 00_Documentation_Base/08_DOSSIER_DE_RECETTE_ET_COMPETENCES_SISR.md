# Document 08 : Dossier de Recette & Correspondance Référentiel BTS SIO SISR
## Projet AP 1 - BTS SIO SISR (Binôme 04 & 10)

---

## 1. Cadre du Dossier de Recette

Le dossier de recette est le document officiel contractuel qui démontre à l'enseignant et au jury d'examen BTS SIO SISR que **chacune des exigences du cahier des charges a été rigoureusement testée et validée**, tant sur le plan fonctionnel que sur le plan de la sécurité et de la continuité de service.

---

## 2. Matrice Complète des Tests de Recette

### Légende :
* **Type :** [POS] = Test Fonctionnel Positif | [NEG] = Test de Sécurité Négatif (Rejet attendu) | [QOS] = Mesure de Performance
* **Statut :**  Validé | ⏳ En attente de session

---

### A. Recette Mission 1 : VPN Nomade, Services Internes & QoS

| Réf Test | Type | Description du Test | Procédure exécutée | Résultat Attendu | Statut | Emplacement Preuve |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **M1-SEC-01** | [NEG] | Furtivité ICMP WAN | `ping IP_WAN` depuis une machine du réseau partagé | 100% de perte de paquets, aucune réponse echo-reply | **Validé ✅** | Dossier Recette - Règle WAN Block ICMP |
| **M1-SEC-02** | [NEG] | Furtivité OS Pare-feu | `nmap -Pn -O IP_WAN` depuis le réseau partagé | Nmap incapable d'identifier FreeBSD/OPNsense (Scrubbing actif) | **Validé ✅** | Dossier Recette - Scrubbing Normalization |
| **M1-SEC-03** | [NEG] | Opacité des ports WAN | `nmap -Pn -p 1-65535 IP_WAN` | Seuls les ports VPN (500/4500 ou 51820) sont autorisés | **Validé ✅** | Dossier Recette - Filtrage strict WAN |
| **M1-VPN-01** | [POS] | Montage VPN Nomade | Connexion sécurisée externe WireGuard UDP 51820 | Tunnel établi, handshake réussi, IP nomade `10.200.100.2` | **Validé ✅** | Client WireGuard (Capture handshake & Status OPNsense) |
| **M1-SRV-01** | [POS] | Partage de fichiers SMB | Montage CIFS de `//10.30.0.20/Partage` | Accès en lecture/écriture accordé pour l'employé | **Validé ✅** | Dossier Recette - Montage Nemo & CIFS |
| **M1-SRV-02** | [POS] | Administration distante | SSH ou WinRM vers `10.30.0.20` | Session distante ouverte sur le serveur de fichiers | **Validé ✅** | Dossier Recette - SSH SRV-FILES |
| **M1-SRV-03** | [POS] | Dépôt photos Immich | Connexion Web sur `http://10.30.0.20:2283` | Galerie photo opérationnelle sous Docker | **Validé ✅** | Dossier Recette - Galerie Immich Web |
| **M1-AUTO-01**| [POS] | Sauvegarde automatique | Synchronisation incrémentale rsync vers SMB via `/etc/smbcredentials-clement` (mode 600) | Documents répliqués (`Rapport_AP1.txt` 44 o dans `Sauvegardes_Clement`), log | **Validé ✅** | Dossier Recette - Preuve Terminal 28/09/2026 |
| **M1-QOS-01** | [QOS] | Plafond bande passante WAN | Traffic Shaper Pipe 2 Mbit/s configuré sur OPNsense | Débit sortant mesuré et bridé à **2 Mb/s maximum** | **Validé ✅** | Dossier Recette - Traffic Shaper dummynet |
| **M1-QOS-02** | [QOS] | Priorisation administration | Files dummynet pondérées (Q_Prio 100 vs Q_Standard 20) | Flux d'administration traités avec priorité maximale | **Validé ✅** | Dossier Recette - Queues Traffic Shaper |
| **M1-QOS-03** | [QOS] | Débit garanti HTTP | Configuration de la file standard avec garantie de débit | Débit web maintenu au minimum à **1 Mb/s garanti** | **Validé ✅** | Dossier Recette - Règle Shaper OPNsense |

---

### B. Recette Mission 2 : VPN Intersite, WebRadio & Minecraft

| Réf Test | Type | Description du Test | Procédure exécutée | Résultat Attendu | Statut | Emplacement Preuve |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **M2-VPN-01** | [POS] | Tunnel Site-à-Site | Négociation IKEv2 avec le pare-feu du binôme partenaire | Tunnel établi (État `ESTABLISHED` sur OPNsense) |  | Dossier Recette - Capture 12 |
| **M2-IMM-01** | [POS] | Accès Album Immich Partagé | Le partenaire ouvre l'URL de partage public de l'album | Consultation réussie de l'album sans accès au reste d'Immich |  | Dossier Recette - Capture 13 |
| **M2-SEC-01** | [NEG] | Test Négatif LAN Partenaire | Le partenaire tente de joindre le LAN (`192.168.200.4`) | Paquets rejetés silencieusement et journalisés en rouge | ⏳ | Dossier Recette - Log Firewall 14 |
| **M2-SEC-02** | [NEG] | Test Négatif Fichiers Partenaire | Le partenaire tente un accès SMB/SSH vers `10.30.0.20` | Connexion refusée, alerte de filtrage pare-feu | ⏳ | Dossier Recette - Log Firewall 15 |
| **M2-SEC-03** | [NEG] | Test Négatif Minecraft Partenaire | Le partenaire tente de se connecter à `10.30.0.22:25565` | Connexion refusée (accès réservé à l'employé) | ⏳ | Dossier Recette - Log Firewall 16 |
| **M2-RAD-01** | [POS] | Déploiement & Streaming Continu JoyStick FM | Diffusion continue 24/7 vers Icecast (`10.100.0.50:8000/joystick-fm`), régie Auto-DJ (`10.100.0.52`) sur 11 titres/jingles | Flux audio 128 kbps continu reçu via Reverse-Proxy `/radio-stream.mp3` | **VALIDÉ ✅** | Journalctl `joystick-streamer` & Test curl audio |
| **M2-RAD-02** | [POS] | Portail Web & Permaliens JoyStick FM | Connexion au portail Web `http://10.100.0.51/` et sous-pages (`/radio/`, `/podcasts/`, `/blog/`) | Toutes les pages en HTTP 200 OK, player HTML5 opérationnel, Live Chat MariaDB | **VALIDÉ ✅** | Navigateur Web & Table `wp_jfm_chat_messages` |
| **M2-RAD-03** | [QOS] | Dimensionnement & Capacité Icecast2 | Configuration `icecast.xml` pour 250 auditeurs simultanés (tampon 64k, 128 kbps) | 0% d'erreur de buffer, débit nominal fluide, charge CPU Debian-Icecast2 &lt; 5% | **VALIDÉ ✅** | Configuration `icecast.xml` & JSON live status |
| **M2-MC-01**  | [POS] | Accès Minecraft Employé | Connexion du client de jeu nomade vers `10.30.0.22:25565` via VPN WireGuard | Connexion réussie, joueur `Klemz_696` (`10.200.100.2:57200`) en jeu, MOTD validé | **VALIDÉ ✅** | Captures Multijoueur + F3 In-Game + Log RCON (03/10/2026) |
| **M2-QOS-01** | [QOS] | Priorité intermédiaire Immich | Transfert Immich partenaire mis en concurrence avec HTTP | Immich traité prioritairement par rapport au HTTP standard |  | Dossier Recette - Graphe Shaper 19 |

---

### C. Recette Mission 3 (Facultative) : Honeypot & Alerting

| Réf Test | Type | Description du Test | Procédure exécutée | Résultat Attendu | Statut | Emplacement Preuve |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **M3-HON-01** | [POS] | Détection & Journalisation temps réel | Scans HTTP frauduleux (`/admin-portal.php`, `/wp-login.php`) | Requêtes capturées en direct avec horodatage, IP `192.168.200.4` et code HTTP | **VALIDÉ ✅** | `/var/log/honeypot-intrusions.log` |
| **M3-HON-02** | [POS] | Service de surveillance daemon | Démon `honeypot-alert.service` actif en arrière-plan | Service actif (`running`), déclenchement automatique sur requêtes | **VALIDÉ ✅** | Statut `systemctl status honeypot-alert` |
| **M3-SEC-01** | [NEG] | **Cloisonnement anti-rebond Zero-Trust** | Tentative de `ping 10.30.0.20` depuis le Honeypot vers la DMZ Int | **100% packet loss** (rejet immédiat par la règle `Block` OPNsense) | **VALIDÉ ✅** | Console `srv-honeypot` & Log Live OPNsense |
| **M3-BAN-01** | [POS] | Faux portail & Verrouillage racine | Désactivation du module Apache `autoindex` | Racine `/` renvoie une erreur 403 Forbidden sans listing de fichiers | **VALIDÉ ✅** | Configuration Apache2 `a2dismod autoindex` |

---

## 3. Correspondance avec le Référentiel BTS SIO SISR (Annexe Officielle)

Pour votre **portfolio E5** et l'oral d'examen, voici le tableau de traçabilité officiel complété avec les références précises de votre projet :

| Compétence | Intitulé de la Compétence | Mobilisée dans | Éléments de preuve concrets à présenter |
| :--- | :--- | :--- | :--- |
| **B1.1** | **Gérer le patrimoine informatique** | Missions 1 & 2 | - Plan d'adressage IP documenté (`01_ARCHITECTURE_ET_PLAN_D_ADRESSAGE.md`)<br>- Script PowerShell de sauvegarde automatique (`Backup-Documents.ps1`)<br>- Procédure de continuité et bascule de la WebRadio JoyStick FM (`06_MIGRATION_WEBRADIO_ICECAST.md`) |
| **B1.2** | **Répondre aux incidents et aux demandes d'assistance** | Mission 2 (Optionnel) | - Ticket de demande d'interconnexion réseau avec l'entreprise partenaire<br>- Procédure de dépannage en cas de rupture du tunnel IPsec |
| **B1.4** | **Travailler en mode projet** | Missions 1 & 2 | - Document de répartition des tâches entre l'étudiant 04 et l'étudiant 10 (`00_SYNTHESE_ET_REPARTITION_DES_TACHES.md`)<br>- Fiche de coordination technique écrite avec le binôme partenaire |
| **B1.5** | **Mettre à disposition des utilisateurs un service informatique** | Missions 1 & 2 | - Mode opératoire d'utilisation du VPN nomade à destination de l'employé<br>- Procédure de mise à disposition du portail Web JoyStick FM et Immich |
| **B2.1** | **Concevoir une solution d'infrastructure réseau** | Missions 1 & 2 | - Justification de la topologie 4 zones (WAN, LAN, DMZ Int, DMZ Ext)<br>- Choix argumenté du protocole IPsec IKEv2 et de l'hyperviseur Proxmox VE<br>- Étude d'impact et matrice des flux inter-entreprises Zero-Trust |
| **B2.2** | **Installer, tester et déployer une solution d'infrastructure réseau** | Missions 1 & 2 | - Sauvegarde exportée de la configuration XML du pare-feu OPNsense<br>- Configuration validée des tunnels IPsec nomade et site-à-site<br>- Migration inter-hyperviseurs V2V (conversion d'appliances VMware vSphere vers Proxmox VE via `qm importdisk`)<br>- Déploiement Docker Immich et filtrage chirurgical de l'album partagé |
| **B2.3** | **Exploiter, dépanner et superviser une solution d'infrastructure réseau** | Missions 1, 2 & 3 | - Analyse des journaux de logs pare-feu lors des tests négatifs d'intrusion<br>- Campagne de tests de charge JMeter sur la WebRadio (250 auditeurs simultanés sans perte, validation de capacité)<br>- Alertes e-mails automatiques déclenchées par le Honeypot LAMP<br>- Mesures de débits et graphes de Traffic Shaping (QoS) sous charge |
