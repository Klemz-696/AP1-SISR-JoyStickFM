# AP 1 - VPN, Interconnexion et Services Réseau
## BTS SIO SISR (2e Année) - Synthèse du Projet & Organisation de l'Équipe

---

###  Identité du Projet & Binôme
* **Diplôme :** BTS SIO - Option SISR (Solutions d'Infrastructure, Systèmes et Réseaux)
* **Épreuve visée :** E5 (Administration des réseaux et systèmes informatiques)
* **Plateforme de virtualisation :** Proxmox VE (environnement du lycée)
* **Pare-feu / Routeur central :** OPNsense
* **Technologie VPN retenue :** IPsec (IKEv2) & Option moderne WireGuard (ChaCha20-Poly1305)
* **Étudiant 1 (Vous) :** N° Étudiant **04** (Clément SAUZÈDE - Lead Réseau, Sécurité & WebRadio)
* **Étudiant 2 (Binôme) :** N° Étudiant **10** (Mathys DUTHILLEUL - Admin Systèmes, Services Internes & Minecraft)

---

## 1. Vue d'ensemble du Projet

Le projet AP 1 consiste à concevoir, déployer, sécuriser et documenter une infrastructure d'entreprise distribuée à travers trois missions progressives :

```
                               [ INTERNET SIMULÉ / VLAN PARTAGÉ LYCÉE ]
                                                  |
                                                  | (DHCP capté puis IP Fixe)
                                      +-----------+-----------+
                                      |   Pare-feu OPNsense   |
                                      |   (Routeur Unique)    |
                                      +-----+-----+-----+-----+
                                            |     |     |
                 +--------------------------+     |     +--------------------------+
                 |                                |                                |
           [ ZONE LAN ]                  [ DMZ INTERNE ]                    [ DMZ EXTERNE ]
                 |                                |                                |
        Postes de travail             - Serveur de fichiers             - WebRadio Icecast
        - Poste Étu 04 (.4)             (Windows Server SMB/WinRM)        (Mission 2 - Migrée)
        - Poste Étu 10 (.10)          - Serveur Immich (Docker)         - Serveur LAMP Honeypot
                                      - Serveur Minecraft (Mission 2)     (Mission 3 - Leurre)
```

### Les 3 Missions du Cahier des Charges :
1. **Mission 1 - VPN Nomade & Sécurisation :**
   * Raccordement au VLAN partagé avec adresse IP fixe (obtenue par DHCP initial puis figée).
   * VPN nomade IPsec IKEv2 pour l'accès de l'employé depuis l'extérieur.
   * Accès au serveur de fichiers Windows Server (partage SMB et administration PowerShell / WinRM).
   * Service d'auto-hébergement de photos Immich.
   * Sauvegarde quotidienne automatique des documents de l'employé vers le serveur de fichiers.
   * Cloisonnement strict, discrétion totale du pare-feu (bloquer ping ICMP, masquer l'OS, seul le port VPN ouvert).
   * Limitation de débit (Traffic Shaper QoS) : 2 Mb/s global VPN, priorité ICMP/SSH, garantie 1 Mb/s HTTP.

2. **Mission 2 - Interconnexion Intersite (Extranet B2B) :**
   * Tunnel IPsec Site-à-Site avec un binôme partenaire désigné.
   * Filtrage chirurgical : seul l'accès à un album partagé Immich est autorisé. Tout le reste est bloqué et journalisé (tests négatifs).
   * Migration transparente (zéro coupure perceptible) de la WebRadio de l'établissement (Icecast) en DMZ externe.
   * Ajout d'un serveur Minecraft accessible via le VPN.
   * Ajustement de la QoS : priorisation du flux Immich intersite entre SSH et HTTP.

3. **Mission 3 (Optionnelle / Bonus) - Honeypot & Défense active :**
   * Déploiement d'un faux serveur web LAMP en DMZ externe.
   * Redirection furtive des attaques web vers ce leurre.
   * Alerte mail automatique à l'administrateur avec journaux d'attaque et bannissement automatique d'IP.

---

## 2. Répartition de la Charge de Travail Adaptée (Binôme 04 / 10)

L'**étudiant 04** dispose de plus d'expérience technique, tandis que l'**étudiant 10 a pris l'initiative de démarrer le déploiement de la VM OPNsense**. La répartition est donc organisée selon une dynamique agile **Lead Architecte / Administrateur Socle** :

| Domaine | **Étudiant 04 — Clément (Lead Réseau, Sécurité & WebRadio)** | **Étudiant 10 — Mathys (Admin Systèmes & Services Internes)** |
| :--- | :--- | :--- |
| **Mission 1** | **[100% VALIDÉ ET FONCTIONNEL ✅]** :<br>- **Déploiement VPN Nomade WireGuard validé en direct** (tunnel `10.200.100.0/24`, handshake établi, client nomade `10.200.100.2`, filtrage strict vers DMZ Interne)<br>- **Sauvegarde automatique des documents validée** : montage CIFS sécurisé `/etc/smbcredentials-clement` (droits 600) vers `//10.30.0.20/Partage`, synchronisation incrémentale `rsync` prouvée (`Rapport_AP1.txt`) et cron.<br>- Configuration OPNsense (Scrubbing anti-Nmap, blocage ICMP WAN, furtivité totale)<br>- Implémentation du Traffic Shaper QoS (Pipes, Queues dummynet 2 Mb/s) | - Déploiement initial de la VM OPNsense et assignation des interfaces Proxmox<br>- Récupération du bail DHCP WAN du lycée et bascule en IP statique `192.168.101.37`<br>- Installation de la VM Windows Server (`SRV-FILES` en `10.30.0.20`, rôle SMB & WinRM)<br>- Déploiement du serveur d'hébergement photo Immich sous Docker Compose<br>- Configuration du poste client Employé et validation des accès SMB |
| **Mission 2** | **[WEBRADIO JOYSTICK FM 100% DÉPLOYÉE ET OPÉRATIONNELLE ✅]** :<br>- **Création Golden Image Debian 12 Proxmox** (script `prepare_template.sh`, qemu-guest-agent, sudo sans mot de passe, purge machine-id, clés SSH ED25519)<br>- **Déploiement modulaire des 3 VMs en DMZ Externe (VLAN 100)** : `Debian-Icecast2` (`10.100.0.50`), `Debian-Web` (`10.100.0.51`), `Debian-Mixxx` (`10.100.0.52`)<br>- **Icecast 2.4.4 opérationnel** sur port 8000, mount `/joystick-fm` (250 auditeurs simultanés, MP3 128 kbps)<br>- **Régie Auto-DJ Streamer continue** sous service systemd `joystick-streamer` avec boucle aléatoire sur les 11 titres/jingles officiels JoyStick FM<br>- **Portail Web WordPress 6.x & thème sur-mesure `joystickfm-theme`** : permaliens `/radio/`, `/podcasts/`, `/blog/` validés en HTTP 200 OK, reverse-proxy Apache transparent `/radio-stream.mp3`, intégration API live `online: true` et table Live Chat MariaDB<br>- [À venir : Établissement du tunnel IPsec Site-à-Site B2B avec le partenaire et filtrage chirurgical Immich] | - Coordination écrite avec le binôme partenaire (Fiche d'interconnexion B2B)<br>- **Serveur Minecraft [100% VALIDÉ ET FONCTIONNEL ✅]** : VM 11017 (`10.30.0.22`), conteneur Docker autonome Minecraft 1.20.4 (port 25565), contournement du blocage DPI académique, accès nomade via WireGuard validé en jeu réel (`Klemz_696` en `10.200.100.2`), élévation opérateur RCON et MOTD officiel.<br>- Configuration de l'album partagé par lien web public sur Immich<br>- Recette des flux WebRadio et participation aux tests de charge JMeter |
| **Mission 3** | **[100% VALIDÉ ET FONCTIONNEL ✅]** :<br>- Déploiement `SRV-HONEYPOT` (VM 11013 Debian 12, DMZ Ext `10.100.0.99`)<br>- Pile Apache sans index (`autoindex` désactivé)<br>- Service temps réel `/usr/local/bin/honeypot-alert.sh` + daemon systemd actif capturant les scans (`/var/log/honeypot-intrusions.log`)<br>- **Cloisonnement étanche anti-rebond Zero-Trust validé en conditions réelles** : règle `Block` OPNsense prioritaire, tentative de ping vers la DMZ Interne (`10.30.0.20`) bloquée à 100% (packet loss 100%) | - Participation aux tests d'intrusion simulés et validation des journaux d'attaque<br>- Vérification de l'étanchéité du réseau interne |
| **Livrables** | - Export de configuration OPNsense & Preuves de furtivité<br>- Procédure technique de migration WebRadio JoyStick FM (`06_MIGRATION_WEBRADIO_ICECAST.md`)<br>- Preuves de sauvegarde incrémentale validées (logs rsync & captures)<br>- Graphes de bande passante QoS et journal des tests négatifs de sécurité | - Plan d'adressage IP détaillé (application stricte des règles .4 et .10)<br>- Mode opératoire utilisateur pour le client VPN nomade et le partage Immich<br>- Fiche d'interconnexion partenaire et dossier de recette des services internes |
| **Commun** | **Recette croisée, tests fonctionnels finaux et dossier de compétences BTS SIO SISR (Épreuve E5)** |

> 📌 **Accès partagé aux VM sous Proxmox :** Pour collaborer directement sur les VM sans être bloqué par la séparation des comptes étudiants Proxmox, consultez le document [`09_COLLABORATION_ET_ACCES_PROXMOX.md`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/00_Documentation_Base/09_COLLABORATION_ET_ACCES_PROXMOX.md).

---

## 3. Guide de Lecture des Documents Générés

Pour faciliter votre travail étape par étape, la documentation a été découpée en guides techniques complets :

1. [`01_ARCHITECTURE_ET_PLAN_D_ADRESSAGE.md`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/01_ARCHITECTURE_ET_PLAN_D_ADRESSAGE.md) : Plan d'adressage IP complet, sous-réseaux, passerelles, convention `.4` et `.10`, configuration Proxmox (Linux Bridges).
2. [`02_OPNSENSE_SECURITE_ET_QOS.md`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/02_OPNSENSE_SECURITE_ET_QOS.md) : Configuration des interfaces, furtivité (anti-Nmap, blocage ICMP), limitation de débit et Traffic Shaping.
3. [`03_VPN_IPSEC_NOMADE_ET_SITE_A_SITE.md`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/03_VPN_IPSEC_NOMADE_ET_SITE_A_SITE.md) : Guide pas-à-pas pour monter le VPN Nomade IKEv2 et le VPN Site-à-Site inter-entreprises.
4. [`04_SERVICES_WINDOWS_ET_DOCKER_IMMICH_MINECRAFT.md`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/04_SERVICES_WINDOWS_ET_DOCKER_IMMICH_MINECRAFT.md) : Installation Windows Server (SMB/WinRM) et utilisation justifiée de Docker pour Immich et Minecraft.
5. [`05_SAUVEGARDE_AUTOMATISEE_POWERSHELL.md`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/05_SAUVEGARDE_AUTOMATISEE_POWERSHELL.md) : Script PowerShell de sauvegarde avec Robocopy, planification de tâche et tests de restauration.
6. [`06_MIGRATION_WEBRADIO_ICECAST.md`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/06_MIGRATION_WEBRADIO_ICECAST.md) : Méthode de bascule sans coupure perceptible pour la WebRadio existante vers la DMZ externe.
7. [`07_MISSION3_HONEYPOT_LAMP.md`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/07_MISSION3_HONEYPOT_LAMP.md) : Mise en place du pot de miel LAMP, alerting mail et bannissement automatique.
8. [`08_DOSSIER_DE_RECETTE_ET_COMPETENCES_SISR.md`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/08_DOSSIER_DE_RECETTE_ET_COMPETENCES_SISR.md) : Fiches de tests de recette, tests négatifs de sécurité et matrice des compétences B1/B2 pour l'épreuve E5.
9. [`09_COLLABORATION_ET_ACCES_PROXMOX.md`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/00_Documentation_Base/09_COLLABORATION_ET_ACCES_PROXMOX.md) : Guide d'accès partagé aux VM sous Proxmox VE (solution enseignant ou autonomie réseau via WebGUI/SSH/RDP).
10. [`10_GUIDE_CONFIGURATION_OPNSENSE_PAS_A_PAS.md`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/00_Documentation_Base/10_GUIDE_CONFIGURATION_OPNSENSE_PAS_A_PAS.md) : Guide pas-à-pas de configuration post-installation d'OPNsense (console, interfaces, IP statiques, DMZ, accès partagé et sauvegarde XML).
11. [`11_FEUILLE_DE_ROUTE_INTEGRALE_ET_DEPLOIEMENT.md`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/00_Documentation_Base/11_FEUILLE_DE_ROUTE_INTEGRALE_ET_DEPLOIEMENT.md) : **Référentiel maître exhaustif** — Déploiement et configuration détaillée des 8 éléments de A à Z.
12. [`GUIDE_VPN_WIREGUARD_COMPLET.md`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/00_Documentation_Base/GUIDE_VPN_WIREGUARD_COMPLET.md) : **Guide dédié WireGuard** — Architecture, configuration OPNsense, clients Linux Mint & Windows, protocole de recette et troubleshooting.
13. [`GUIDE_ACTION_CLEMENT_ETU04.md`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/00_Documentation_Base/GUIDE_ACTION_CLEMENT_ETU04.md) : **Feuille de route autonome de Clément (04)** — Actions Lead Réseau, JoyStick FM & Services Cœur.
14. [`GUIDE_ACTION_MATHYS_ETU10.md`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/00_Documentation_Base/GUIDE_ACTION_MATHYS_ETU10.md) : **Feuille de route autonome de Mathys (10)** — Guide pas-à-pas Windows Server, Client, Honeypot & Recette.
