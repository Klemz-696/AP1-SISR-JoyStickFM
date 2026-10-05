# 🚀 DOCUMENT DE REPRISE DE SESSION — MIGRATION VERS PC PORTABLE
*Date de génération : 03/10/2026 21:00*  
*Auteurs : Clément SAUZÈDE (04 - Lead Réseau) & Mathys DUTHILLEUL (10 - Admin Systèmes)*  
*Contexte : AP 1 BTS SIO SISR — Lycée Sidoine Apollinaire*  

---

## 📌 1. PROMPT DE REPRISE IMMÉDIATE POUR ANTIGRAVITY SUR LE PC PORTABLE

> **Instructions pour Clément :**  
> Lorsque tu ouvres Antigravity IDE sur ton **PC Portable** dans le dossier `AP 1` transféré, colle simplement le message suivant dans le chat :
> 
> ```text
> Bonjour Antigravity, nous reprenons le travail sur l'AP 1 BTS SIO depuis mon PC PORTABLE.
> Lis attentivement le fichier REPRISE_SESSION_PORTABLE.md situé à la racine du projet.
> 
> Résumé rapide de l'état actuel :
> - Mission 1 (VPN Nomade WireGuard, Samba \\10.30.0.20\Partage, backup rsync/CIFS) est 100% VALIDÉE.
> - Mission 3 (Honeypot 10.100.0.99, alerting temps réel, anti-rebond Zero-Trust) est 100% VALIDÉE.
> - Mission 2 (Serveur Minecraft PaperMC 26.2 sur 10.30.0.22:25565) est 100% VALIDÉ et testé en jeu par Klemz_696 via WireGuard (10.200.100.2:29036).
> - Tout le contexte, l'historique des échanges et les artefacts de la session précédente sont archivés dans '_contexte_ia/'.
> 
> Nous nous étions arrêtés aux 2 chantiers suivants :
> 1. Préparation et configuration du VPN IPsec B2B Intergroupes sur OPNsense (Phase 1 et Phase 2).
> 2. Déploiement de la supervision globale avec Uptime Kuma sur Proxmox.
> 
> Confirme-moi que tu as tout en mémoire et dis-moi par quoi nous commençons !
> ```

---

## 🌐 2. CARTOGRAPHIE COMPLÈTE DE L'INFRASTRUCTURE (RÉFÉRENTIEL MAÎTRE)

| VM ID | Nom de la VM | OS | Rôle & Services | IP Réseau | Ports Actifs & Accès |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **11008** | `OPNsense-projet` | FreeBSD | Pare-feu / Routeur / WireGuard / QoS | WAN: `192.168.101.37`<br>LAN: `192.168.200.254`<br>DMZ_INT: `10.30.0.254`<br>DMZ_EXT: `10.100.0.254` | 51820 UDP (WireGuard)<br>443 TCP (Web GUI)<br>8000 & 80 TCP (NAT) |
| **11010** | `SRV-FILES-projet` | Linux Debian | Serveur de fichiers Samba (`/srv/partage`) | `10.30.0.20/24` (DMZ Int) | 445 TCP (SMB), 22 TCP (SSH) |
| **11011** | `Poste-Clement-projet` | Linux Mint | Bastion d'administration & Sauvegardes | LAN: `192.168.200.4`<br>WAN SIO: `192.168.100.172`<br>Tailscale: `100.88.228.38` | 22 TCP (SSH) |
| **11013** | `SRV-HONEYPOT-projet`| Debian 12 | Honeypot LAMP leurre (Mission 3) | `10.100.0.99/24` (DMZ Ext) | 80 TCP (Leurre), 22 TCP (SSH) |
| **11016** | `SRV-IMMICH-projet` | Debian 12 | Serveur photos Immich (Docker) | `10.30.0.21/24` (DMZ Int) | 2283 TCP (Web), 22 TCP (SSH) |
| **11017** | `srv-minecraft` | Debian 12 | Serveur Minecraft PaperMC 26.2 (Docker) | `10.30.0.22/24` (DMZ Int) | 25565 TCP (Jeu), 25575 TCP (RCON), 22 TCP |
| **-** | `Debian_Icecast2` | Debian | WebRadio - Streaming Icecast (Mission 2) | `10.100.0.50/24` (DMZ Ext) | 8000 TCP (Stream) |
| **-** | `Debian_Web` | Debian | WebRadio - WordPress (Mission 2) | `10.100.0.51/24` (DMZ Ext) | 80 TCP (Web) |
| **-** | `Debian_Mixxx` | Debian | WebRadio - Auto-DJ Mixxx (Mission 2) | `10.100.0.52/24` (DMZ Ext) | - |

---

## 🔑 3. IDENTIFIANTS, SECRETS & CLÉS CRYPTOGRAPHIQUES

### Profil VPN Nomade WireGuard (Fichier `clement-wireguard.conf`)
* **Serveur (OPNsense) :**
  - IP Tunnel : `10.200.100.1/24` (Port UDP `51820` sur Endpoint `192.168.101.37`)
  - Clé Publique : `K50IYYDVUQN9OkUvIWnNZzLlGg05cotWZLoMOZnwnWU=`
* **Client Nomade (PC Portable Clément `desktop-7t3hsh1`) :**
  - IP Tunnel attribuée : `10.200.100.2/24`
  - Clé Privée : `mDzMSk7jB6qeqAoTEiw6slX5t8Fn0/rFdjjLQasp62Q=`
  - Clé Publique : `hmXSqKhmpEabrbqydVEniHiEMZuzmu7OhQ4OgpGhRBY=`
  - Réseaux accessibles (AllowedIPs) : `10.30.0.0/24, 10.100.0.0/24, 192.168.200.0/24`
  > ⚠️ **Règle d'or :** Ne connectez pas le Gros PC et le PC Portable en même temps sur ce même profil WireGuard pour éviter tout conflit d'adresse `10.200.100.2`.

### Services & Comptes
* **Samba (`SRV-FILES`) :** Partage `\\10.30.0.20\Partage` — Utilisateur `employe04`.
* **Minecraft (`srv-minecraft` en `10.30.0.22`) :**
  - Moteur actif : **PaperMC 26.2 (build 129)** sous Java 25 LTS.
  - Répertoire de travail : `/opt/minecraft/docker-compose.yml` et `/opt/minecraft/data/`.
  - Opérateur (Admin OP) : `Klemz_696`.
  - Commande RCON directe : `docker exec -i minecraft_ap1 rcon-cli <COMMANDE>`.
  - Déploiement de plugins : script Windows 1-clic `scripts/Deploy-Plugin.bat`.

---

## 🏆 4. BILAN TECHNIQUE DÉTAILLÉ DU TRAVAIL VALIDÉ AUJOURD'HUI

1. **Mission 1 (100% VALIDÉE ✅)** :
   - Tunnel WireGuard nomade ultra-rapide.
   - Partage de fichiers sécurisé et sauvegardes automatiques incrémentales.
   - QoS Traffic Shaper 2 Mb/s actif sur OPNsense.
2. **Mission 3 (100% VALIDÉE ✅)** :
   - Honeypot LAMP leurre actif en DMZ Externe.
   - Journalisation temps réel et blocage Zero-Trust vérifié vers le réseau interne.
3. **Mission 2 (Avancée majeure aujourd'hui)** :
   - **Contournement du filtrage DPI du pare-feu académique** : Injection locale des bundlers et compilation offline de Paperclip via `-DbundlerRepoDir=/data`.
   - **Épuration de l'architecture** : Retrait de BlueMap et EssentialsX (incompatibilités JVM 25 / Paper résolues), temps de démarrage ramené à moins de 7 secondes.
   - **Migration PaperMC 26.2** : Serveur 100% stable, listening sur `25565`.
   - **Preuve de connexion en jeu validée** :
     ```text
     [17:40:15 INFO]: Klemz_696 joined the game
     [17:40:15 INFO]: Klemz_696[/10.200.100.2:29036] logged in with entity id 60
     ```
   - **Automatisation créée** : Scripts `Deploy-Plugin.bat` et `Deploy-Plugin.ps1` pour ajouter des plugins en Glisser-Déposer sans ligne de commande.

---

## 📂 5. NOUVELLE ARBORESCENCE ORGANISÉE DU PROJET `AP 1`

Le répertoire a été entièrement trié et débarrassé de tout fichier temporaire à la racine :

```text
AP 1/
│
├── README.md                              <-- Documentation générale et index
├── REPRISE_SESSION_PORTABLE.md            <-- CE FICHIER (Guide maître de reprise)
├── REPRISE_SESSION_GROS_PC.md             <-- Archive de la reprise précédente
├── clement-wireguard.conf                 <-- Profil client WireGuard officiel
│
├── 00_Documentation_Base/                 <-- Fiches techniques de référence (M1, M2, M3)
│   ├── 04_SERVICES_WINDOWS_ET_DOCKER_IMMICH_MINECRAFT.md (Mis à jour Paper 26.2 !)
│   └── ...
│
├── 01_Journal_de_Bord/                    <-- Suivi chronologique séance par séance
│   ├── Seance_01_2026-09-08/
│   ├── Seance_02_2026-09-22/
│   ├── Seance_03_2026-09-28/
│   └── Seance_04_2026-10-03/              <-- NOUVEAU : Synthèse complète du 03/10
│
├── Livrables_Officiels/                   <-- Dossiers PDF officiels
├── AP_Webradio/                           <-- Archives de la WebRadio JoyStick FM
├── Sujet_Officiel/                        <-- Sujet BTS SIO officiel
│
├── scripts/                               <-- Scripts opérationnels
│   ├── Deploy-Plugin.bat                  <-- NOUVEAU : Déploiement 1-clic plugins (Glisser-Déposer)
│   ├── Deploy-Plugin.ps1                  <-- NOUVEAU : Script PowerShell d'automatisation SCP/RCON
│   ├── prepare_transfer.py                <-- Script de classement automatique
│   └── ...
│
├── plugins_a_installer/                   <-- NOUVEAU : Dossier de dépôt rapide pour plugins Minecraft
│
├── _contexte_ia/                          <-- NOUVEAU : MÉMOIRE & FIL DE DISCUSSION COMPLET
│   ├── logs/
│   │   ├── transcript.jsonl               <-- Historique complet des messages de la session
│   │   └── transcript_full.jsonl          <-- Historique exhaustif non tronqué
│   └── artifacts/                         <-- Fiches d'échange réseau B2B, guides IPsec, etc.
│
├── _archives_binaires/                    <-- NOUVEAU : Tous les gros JARs et JSONs rangés
│   ├── minecraft_jars/                    <-- paper-26.2-129.jar, mojang_26.2.jar, server.jar...
│   └── manifests_json/                    <-- version_manifest.json, etc.
│
└── _archives_donnees/                     <-- NOUVEAU : Fichiers CSV rangés
```

---

## 💾 6. COMMENT TRANSFÉRER CE DOSSIER VERS LE PC PORTABLE ?

### Option 1 (Recommandée : Via Tailscale Taildrop en 1 clic)
Votre PC portable (`desktop-7t3hsh1` / `100.109.93.125`) et votre gros PC (`desktop-ttel0a4` / `100.117.117.10`) sont interconnectés via votre réseau maillé Tailscale personnel.
1. Allumez votre PC Portable et vérifiez que Tailscale est actif (icône dans la barre des tâches).
2. Sur le Gros PC, double-cliquez simplement sur :  
   👉 **`scripts\Envoyer-Vers-Portable-Tailscale.bat`**  
   *(Ou faites un clic-droit sur l'archive `AP1_Transfert_Portable_2026-10-03.zip` sur votre Bureau > **Send with Tailscale...** > choisissez `desktop-7t3hsh1`).*
3. Sur votre PC Portable, acceptez la notification Tailscale : le fichier se trouve directement dans votre dossier **Téléchargements**.

### Option 2 (Via le lien direct Tailscale dans le navigateur)
1. Sur le Gros PC, lancez le script : `scripts\Serveur-Web-Local-Tailscale.bat`.
2. Sur le PC Portable, ouvrez votre navigateur et tapez :  
   `http://100.117.117.10:8080/AP1_Transfert_Portable_2026-10-03.zip`
3. Le téléchargement démarre immédiatement à la vitesse maximale de votre réseau local !

### Option 3 (Clé USB / Disque externe)
Copiez l'archive `AP1_Transfert_Portable_2026-10-03.zip` (469 Mo) sur une clé USB et décompressez-la sur le bureau du portable.

---

## 🎯 7. PROCHAINES ACTIONS EN REPRENANT SUR LE PORTABLE

Dès que vous ouvrez Antigravity sur votre portable et collez le prompt du **§ 1** :
1. **VPN IPsec B2B Intergroupes** : Configurer la Phase 1 et Phase 2 sur OPNsense avec la fiche d'échange prête dans `_contexte_ia/artifacts/Fiche_Echange_Reseau_B2B.md`.
2. **Supervision Uptime Kuma** : Déployer le conteneur de monitoring sur Proxmox pour surveiller les 7 machines en temps réel.
