# Projet AP 1 — VPN, Interconnexion et Services Réseau
### BTS SIO SISR (2e année) — Lycée Sidoine Apollinaire (Clermont-Ferrand)
**Binôme :** Clément SAUZÈDE (Étudiant 04) & Mathys DUTHILLEUL (Étudiant 10)

---

## 📌 Organisation Générale du Répertoire de Travail

Ce répertoire est structuré de manière professionnelle pour documenter l'intégralité du projet, archiver les guides de configuration de référence et tracer l'avancement chronologique séance par séance (journal de bord d'avancement) :

```
AP 1/
│
├── README.md                                          <-- Index général du projet & Navigation
│
├── 00_Documentation_Base/                             <-- Guides techniques complets de référence (M1, M2, M3)
│   ├── 00_SYNTHESE_ET_REPARTITION_DES_TACHES.md      <-- Gouvernance du binôme & matrice E5
│   ├── 01_ARCHITECTURE_ET_PLAN_D_ADRESSAGE.md        <-- Topologie & Plan d'adressage complet
│   ├── 02_OPNSENSE_SECURITE_ET_QOS.md                <-- Furtivité pare-feu & Shaper QoS 2 Mb/s
│   ├── 03_VPN_IPSEC_NOMADE_ET_SITE_A_SITE.md         <-- Tunnels IPsec IKEv2 nomade & intersite B2B
│   ├── 04_SERVICES_WINDOWS_ET_DOCKER_IMMICH_MINECRAFT.md <-- Win Server, Immich & Minecraft
│   ├── 05_SAUVEGARDE_AUTOMATISEE_POWERSHELL.md       <-- Procédure de sauvegarde Robocopy
│   ├── 06_MIGRATION_WEBRADIO_ICECAST.md              <-- Bascule Icecast sans coupure audio
│   ├── 07_MISSION3_HONEYPOT_LAMP.md                  <-- Honeypot leurre & Alerting mail
│   ├── 08_DOSSIER_DE_RECETTE_ET_COMPETENCES_SISR.md  <-- 23 fiches de tests & matrice E5
│   ├── 09_COLLABORATION_ET_ACCES_PROXMOX.md          <-- Guide d'accès partagé aux VM
│   ├── 10_GUIDE_CONFIGURATION_OPNSENSE_PAS_A_PAS.md  <-- Déploiement post-install OPNsense
│   ├── 11_FEUILLE_DE_ROUTE_INTEGRALE_ET_DEPLOIEMENT.md <-- Référentiel maître : Tous les détails de A à Z
│   ├── GUIDE_ACTION_CLEMENT_ETU04.md                  <-- Plan de vol autonome Clément (Lead & JoyStick FM)
│   └── GUIDE_ACTION_MATHYS_ETU10.md                   <-- Plan de vol autonome Mathys (Win Server, Client, Recette)
│
├── 01_Journal_de_Bord/                                <-- Suivi d'avancement par journée de travail
│   ├── Seance_01_2026-09-08/                         <-- SÉANCE 1 (Lancement, Choix & Cadrage)
│   │   ├── AP1_Plan_d_Adressage_Sauzede_Duthilleul.pdf <-- 📄 LIVRABLE 1 : Plan d'adressage officiel (PDF)
│   │   ├── AP1_Plan_d_Adressage_Complet.html          <-- Source HTML du plan d'adressage
│   │   ├── Resume_Avancement_2026-09-08.pdf           <-- 📄 SYNTHÈSE D'AVANCEMENT SÉANCE 1 (PDF)
│   │   └── Resume_Avancement_2026-09-08.html          <-- Source HTML de la synthèse d'avancement
│   ├── Seance_02_2026-09-22/                         <-- SÉANCE 2 (Socle Proxmox, SMB & Découplage)
│   │   ├── Resume_Avancement_2026-09-22.pdf           <-- 📄 SYNTHÈSE D'AVANCEMENT SÉANCE 2 (PDF)
│   │   └── Resume_Avancement_2026-09-22.html          <-- Source HTML de la synthèse d'avancement
│   ├── Seance_03_2026-09-28/                         <-- SÉANCE 3 (Sauvegardes Validées, OPNsense 23.1, WireGuard)
│   │   ├── Resume_Avancement_2026-09-28.pdf           <-- 📄 SYNTHÈSE D'AVANCEMENT SÉANCE 3 (PDF)
│   │   └── Resume_Avancement_2026-09-28.html          <-- Source HTML de la synthèse d'avancement
│   └── Seance_04_2026-10-04/                         <-- SÉANCE 4 (Template Proxmox & Déploiement WebRadio 100%)
│       ├── Resume_Avancement_2026-10-04.pdf           <-- 📄 SYNTHÈSE D'AVANCEMENT SÉANCE 4 (PDF)
│       └── Resume_Avancement_2026-10-04.html          <-- Source HTML de la synthèse d'avancement
│
├── Livrables_Officiels/                               <-- Dossier des PDF finalisés à rendre au professeur
│   ├── AP1_Plan_d_Adressage_Sauzede_Duthilleul.pdf   <-- Livrable N°1 : Plan d'adressage & topologie
│   ├── Resume_Avancement_2026-09-08.pdf              <-- Livrable Suivi : Compte-rendu séance 1
│   ├── Resume_Avancement_2026-09-22.pdf              <-- Livrable Suivi : Compte-rendu séance 2
│   ├── Resume_Avancement_2026-09-28.pdf              <-- Livrable Suivi : Compte-rendu séance 3
│   ├── Resume_Avancement_2026-10-04.pdf              <-- Livrable Suivi : Compte-rendu séance 4
│   ├── ETAT_DES_LIEUX_COMPLET_PROJET_AP1.pdf         <-- 📄 DOSSIER MAÎTRE : Bilan consolidé 4 pages (Examen E5)
│   ├── Livrable_Domaine_1_Reseau_Securite_OPNsense.pdf <-- 📄 Domaine 1 : Réseau, Furtivité & OPNsense
│   ├── Livrable_Domaine_2_VPN_WireGuard_et_IPsec.pdf <-- 📄 Domaine 2 : VPN WireGuard & IPsec B2B
│   ├── Livrable_Domaine_3_Services_Stockage_Sauvegardes.pdf <-- 📄 Domaine 3 : Services SMB, Sauvegardes & Immich
│   ├── Livrable_Domaine_4_WebRadio_JoyStick_FM.pdf   <-- 📄 Domaine 4 : WebRadio JoyStick FM (Icecast & WP)
│   └── Livrable_Domaine_5_Securite_Active_Minecraft_Supervision.pdf <-- 📄 Domaine 5 : Honeypot, Minecraft & Supervision
│
├── scripts/                                           <-- Scripts opérationnels
│   ├── Backup-Documents.ps1                           <-- Script PowerShell Robocopy de sauvegarde
│   ├── backup-documents.sh                            <-- Script Bash rsync CIFS de sauvegarde (Linux Mint)
│   ├── compile_pdfs.ps1                               <-- Script de compilation PDF automatisé
│   ├── deploy_webradio_icecast.sh                     <-- Déploiement Icecast 2.4 sur 10.100.0.50
│   ├── deploy_webradio_wordpress.sh                   <-- Déploiement LAMP & WordPress sur 10.100.0.51
│   ├── deploy_webradio_streamer_playlist.sh          <-- Déploiement régie Auto-DJ sur 10.100.0.52
│   ├── finalize_webradio_wordpress.sh                 <-- Finalisation WP-CLI et pages officielles
│   └── fix_apache_permalinks.sh                       <-- Réécriture Apache AllowOverride et .htaccess
│
└── Sujet_Officiel/                                    <-- Sujet d'origine du professeur
    ├── AP1 v2 - VPN et interconnexion.pdf
    └── AP1 v2 - VPN et interconnexion.odt
```

---

## 🎯 Accès Rapide aux Livrables Officiels au Format PDF

| Document PDF | Emplacement | Description & Contenu |
| :--- | :---: | :--- |
| **🏆 ÉTAT DES LIEUX COMPLET (MAÎTRE)** | [📄 Consulter le PDF](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/Livrables_Officiels/ETAT_DES_LIEUX_COMPLET_PROJET_AP1.pdf) | **Dossier de synthèse officiel pour l'épreuve E5 (4 pages).** Cartographie des 9 VM, rétrospective séances 1 à 4, matrice intégrale des 23 tests de recette (96% conformité), correspondance compétences BTS SIO SISR (B1 & B2). |
| **Domaine 1 : Réseau & Sécurité OPNsense** | [📄 Consulter le PDF](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/Livrables_Officiels/Livrable_Domaine_1_Reseau_Securite_OPNsense.pdf) | **Topologie 4 zones & durcissement.** Plan d'adressage IP (règles .4 et .10), furtivité pare-feu (anti-Nmap, blocage ping WAN), Traffic Shaper QoS 2 Mb/s (dummynet) et filtrage inter-VLANs. |
| **Domaine 2 : VPN & Mobilité Sécurisée** | [📄 Consulter le PDF](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/Livrables_Officiels/Livrable_Domaine_2_VPN_WireGuard_et_IPsec.pdf) | **Tunnels d'entreprise.** WireGuard nomade validé (tunnel `10.200.100.0/24`, ChaCha20, handshake prouvé) et architecture IPsec IKEv2 B2B intersite avec filtrage chirurgical restreint à Immich. |
| **Domaine 3 : Services, Stockage & Sauvegardes** | [📄 Consulter le PDF](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/Livrables_Officiels/Livrable_Domaine_3_Services_Stockage_Sauvegardes.pdf) | **Services internes DMZ 300.** Serveur de fichiers SMB `10.30.0.20`, sauvegarde incrémentale automatisée prouvée via credentials sécurisés (`/etc/smbcredentials-clement`), et hébergement photo Immich sous Docker Compose. |
| **Domaine 4 : WebRadio JoyStick FM** | [📄 Consulter le PDF](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/Livrables_Officiels/Livrable_Domaine_4_WebRadio_JoyStick_FM.pdf) | **Haute disponibilité multimédia DMZ 100.** Golden Template Debian 12, Icecast 2.4 (`.50`), Auto-DJ 11 titres (`.52`), CMS WordPress & thème rétro (`.51`), Reverse-Proxy `/radio-stream.mp3`, API live metadata et Live Chat MariaDB. |
| **Domaine 5 : Sécurité Active & Minecraft** | [📄 Consulter le PDF](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/Livrables_Officiels/Livrable_Domaine_5_Securite_Active_Minecraft_Supervision.pdf) | **Défense & Gaming d'entreprise.** Honeypot LAMP (`.99`), détection des scans en direct, cloisonnement anti-rebond Zero-Trust validé, serveur Minecraft PaperMC autonome avec contournement DPI, et supervision Uptime Kuma. |
| **Plan d'Adressage Complet** | [📄 Consulter le PDF](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/Livrables_Officiels/AP1_Plan_d_Adressage_Sauzede_Duthilleul.pdf) | **Premier livrable officiel exigé par le sujet.** Contient la topologie vectorielle (SVG), les 4 zones réseau, les VLANs 100/200/300, l'IP WAN fixe `192.168.101.41` et l'inventaire complet des adresses IP. |
| **Synthèses d'Avancement (Séances 1 à 4)** | [📄 Séance 1](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/Livrables_Officiels/Resume_Avancement_2026-09-08.pdf) • [📄 Séance 2](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/Livrables_Officiels/Resume_Avancement_2026-09-22.pdf) • [📄 Séance 3](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/Livrables_Officiels/Resume_Avancement_2026-09-28.pdf) • [📄 Séance 4](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/Livrables_Officiels/Resume_Avancement_2026-10-04.pdf) | **Journaux de bord chronologiques officiels (2 pages par séance).** Traçabilité exacte des décisions techniques, des audits et des PV de recette séance par séance. |
| **Idées d'Approfondissement & Évolutions** | [📝 Consulter le document](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/00_Documentation_Base/14_IDEES_APPROFONDISSEMENT_ET_EVOLUTIONS.md) | **Feuille de route d'innovations futures.** Jeu de cartes à collectionner JoyStick TCG (boosters par écoute radio, raretés, duels), authentification légère, et hub Minecraft multi-jeux (Bedwars, Hikabrain, OneBlock, Survie). |

---

## 👥 Rôles & Responsabilités au sein du Binôme

* **Clément SAUZÈDE (Étudiant 04) — Lead Réseau, Sécurité & WebRadio JoyStick FM :**
  * Concepteur et créateur de la WebRadio **JoyStick FM** : migration V2V (VMware vSphere ➔ Proxmox VE), conversion des disques `qm importdisk`, réadressage DMZ (`10.100.0.50` à `.52`), configuration Icecast, Apache/WP et reprise Auto-DJ Mixxx.
  * Architecture réseau, plan d'adressage global, durcissement et furtivité du pare-feu OPNsense (anti-Nmap, blocage ICMP, filtrage WAN).
  * Serveur VPN IPsec IKEv2 (PKI, autorité de certification, certificats serveurs & nomades) et tunnel intersite B2B.
  * Traffic Shaper QoS (Pipes/Queues 2 Mb/s, priorités interactives).
  * Développement du script PowerShell Robocopy de sauvegarde (`Backup-Documents.ps1`).
* **Mathys DUTHILLEUL (Étudiant 10) — Admin Systèmes & Services Internes :**
  * Déploiement initial de la VM OPNsense sur Proxmox VE, capture et fixation du bail WAN (`192.168.101.41`).
  * Déploiement et administration de la VM Windows Server 2022 (`SRV-FILES` en `10.30.0.20`, rôle SMB et WinRM).
  * Déploiement des services conteneurisés sous Docker Compose (`SRV-IMMICH` en `10.30.0.21` et `SRV-MINECRAFT` en `10.30.0.22`).
  * Configuration du poste client employé, import des certificats VPN et validation des recettes utilisateurs.

---

## 📅 Protocole de Suivi pour les Prochaines Séances

Lors de chaque nouvelle séance de travail (ex: séance du 15/09/2026) :
1. Un nouveau sous-dossier `01_Journal_de_Bord/Seance_02_YYYY-MM-DD/` sera créé.
2. Les preuves de tests (captures d'écran, logs Nmap/Iperf, exports XML) y seront versées.
3. Un nouveau fichier PDF synthétisant le travail accompli et le travail restant sera généré et dupliqué dans `Livrables_Officiels/`.

