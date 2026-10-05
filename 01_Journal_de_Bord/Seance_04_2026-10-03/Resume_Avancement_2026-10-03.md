# 📄 Journal de Bord & Synthèse d'Avancement — Séance 04
**Date :** 03 Octobre 2026  
**Auteurs :** Clément SAUZÈDE (Étudiant 04 - Lead Réseau) & Mathys DUTHILLEUL (Étudiant 10 - Admin Systèmes)  
**Projet :** AP 1 BTS SIO SISR — Lycée Sidoine Apollinaire  

---

## 🎯 1. Objectifs de la Séance

1. **Reprise opérationnelle sur le Gros PC** : Import du profil VPN WireGuard client et validation de l'accessibilité à l'ensemble du réseau local Proxmox (`10.30.0.0/24`, `10.100.0.0/24`, `192.168.200.0/24`).
2. **Évolution du Serveur Minecraft (Mission 2)** :
   - Migration de Vanilla 1.20.4 vers **PaperMC 26.2 (build 129)** sous **Java 25 LTS**.
   - Diagnostic et contournement du filtrage académique bloquant les téléchargements de patches Mojang.
   - Épuration des services superflus (retrait de BlueMap pour optimiser la mémoire et supprimer les erreurs de structure de dimensions).
3. **Validation de Recette en Jeu** : Connexion effective du compte opérateur `Klemz_696` via le tunnel nomade WireGuard.
4. **Mise en place de la gouvernance administrative** : Procédures de whitelist, blacklist, élévation de privilèges RCON et déploiement simplifié de plugins.

---

## 🛠️ 2. Réalisations Techniques et Incidents Résolus

### A. Contournement du Filtrage DPI Académique (Paperclip / Bundler)
* **Incident** : Lors du lancement initial du conteneur `itzg/minecraft-server`, le téléchargement automatique du binaire mojang (`mojang_26.2.jar`) a échoué avec des erreurs `Connection reset by peer` dues au pare-feu d'établissement (DPI sur le SNI TLS).
* **Résolution** :
  - Téléchargement du binaire Mojang depuis une liaison extérieure saine.
  - Transfert via `scp` dans `/opt/minecraft/data/cache/mojang_26.2.jar`.
  - Configuration du paramètre JVM `-DbundlerRepoDir=/data` dans `docker-compose.yml`.
  - Paperclip a ainsi pu assembler le serveur Paper 26.2 en 100% hors-ligne.

### B. Assainissement du Serveur & Optimisation
* **Retrait de BlueMap** : Le plugin provoquait des avertissements de chargement (`NoSuchFileException` sur les dossiers de dimensions séparés de Paper). Sur décision d'arbitrage technique, BlueMap a été retiré, libérant 400 Mo de RAM et fermant le port 8100.
* **Résolution de l'incompatibilité JVM 25** : Le plugin EssentialsX patché générait une `VerifyError` sous Java 25. Les commandes natives de Paper ont été privilégiées pour assurer un temps de boot inférieur à 7 secondes et zéro crash.

### C. Validation de Connexion Réelle (Recette)
* **Test de connexion en direct** :
  ```text
  [17:40:14 INFO]: UUID of player Klemz_696 is 6790a3cc-637a-311a-a2e5-e9ae40ea0459
  [17:40:15 INFO]: Klemz_696 joined the game
  [17:40:15 INFO]: Klemz_696[/10.200.100.2:29036] logged in with entity id 60 at ([minecraft:overworld]55.58, 71.0, 33.41)
  ```
* La liaison entre le client Minecraft de Clément (IP WireGuard `10.200.100.2`) et le serveur Paper (`10.30.0.22:25565`) est validée avec succès.

### D. Déploiement Plugins de Gouvernance & Anti-Xray Natif (Soirée du 03/10/2026)
* **Injection Clé SSH Nomade** : Clé ED25519 du PC portable installée dans `/root/.ssh/authorized_keys`, éliminant toute saisie de mot de passe lors des transferts et de l'administration.
* **Activation Anti-Xray Engine Mode 2** : Configuration de l'obfuscation asynchrone des blocs cachés (`diamond_ore`, `ancient_debris`, etc.) dans `paper-world-defaults.yml`. Les tricheurs utilisant des packs ou mods X-Ray ne reçoivent aucun minerai masqué dans les paquets réseau.
* **Déploiement de 4 Plugins de Référence** :
  ```text
  [PluginInitializerManager] Bukkit plugins (4):
   - Chunky (1.5.3), CoreProtect (24.1), GrimAC (2.3.74-abb95b6), LuckPerms (5.5.71)
  ```
  - **LuckPerms** (Contrôle d'accès RBAC des joueurs et administrateurs).
  - **CoreProtect** (Audit, traçabilité et rollback anti-grief avec stockage SQLite).
  - **GrimAC** (Anticheat moderne asynchrone contre les cheats de déplacement).
  - **Chunky** (Prégénération de chunks pour fluidifier le serveur).

### E. Déploiement & Pérennisation de la Supervision Uptime Kuma v2 (Nuit du 03/10/2026)
* **Bastion d'administration Linux Mint (`Poste-Clément`)** :
  - Installation de Docker et Docker Compose.
  - Déploiement du conteneur officiel `louislam/uptime-kuma:2` avec persistance `/opt/uptime-kuma/data/kuma.db`.
  - Service opérationnel sur le port `3001` accessible en LAN (`http://192.168.200.4:3001`) et via Tailscale (`http://100.88.228.38:3001`).
* **Dashboard & Page de Statut Publique (`/status/default`)** :
  - Intégration du logo et favicon haute définition `icone_supervision_kuma.jpg` (bouclier néon cyberpunk et monitoring).
  - Organisation hiérarchique en 3 groupes de VLANs :
    1. `🌐 Infrastructure Réseau & Bastions (LAN 200)` : Passerelle OPNsense, WebGUI Pare-Feu, Poste-Clément, Poste-Mathys.
    2. `🏢 DMZ Interne — Données & Applications (VLAN 300)` : SRV-FILES, Partage SMB (445), SRV-IMMICH, Immich Web (2283), srv-minecraft, Moteur Paper (25565 avec GameDig et icône `🎮`).
    3. `🛡️ DMZ Externe — Sécurité & Médias (VLAN 100)` : SRV-HONEYPOT, Service Web Leurre (80), Flux Icecast (8000), WordPress (80), Mixxx.
* **Résolution de l'incident Honeypot (HTTP 404)** :
  - Leurre Apache sans site web (`index.html` supprimé conformément au sujet) répondant en code 404.
  - Ajout du code `404` dans les codes acceptés de la sonde HTTP, passant la sonde immédiatement au **VERT (100% UP)**.
* **Résultat de Recette** : **100% de disponibilité** sur le LAN et la DMZ Interne.

---

## 📊 3. Tableau Récapitulatif de l'Infrastructure à date

| Service / VM | Rôle / Port | IP Réseau | Statut Supervision |
| :--- | :--- | :--- | :---: |
| **`OPNsense-projet`** | Routeur, Pare-Feu, Passerelle LAN & DMZ | `192.168.200.254` / `10.30.0.254` | **100% VERT ✅** |
| **`Poste-Clément`** | Bastion Admin & Serveur **Uptime Kuma v2** | `192.168.200.4:3001` (`100.88.228.38`) | **100% VERT ✅** |
| **`Poste-Mathys`** | Poste Technicien / Administration | `192.168.200.10` | **100% VERT ✅** |
| **`SRV-FILES-projet`** | Serveur de Fichiers & Partage SMB (Port 445) | `10.30.0.20` | **100% VERT ✅** |
| **`SRV-IMMICH-projet`** | Serveur Photos & Portail Web (Port 2283) | `10.30.0.21` | **100% VERT ✅** |
| **`srv-minecraft`** | Paper 26.2 (4 Plugins, Anti-Xray, Port 25565) | `10.30.0.22` | **100% VERT ✅** |
| **`SRV-HONEYPOT-projet`** | Pot de Miel LAMP Leurre (Port 80 - Alerte) | `10.100.0.99` | **100% VERT ✅** |
| **`WebRadio JoyStick FM`** | Icecast (8000), Portail Web (80), Régie (52) | `10.100.0.50` à `.52` | *En cours de déploiement* |

---

## 📌 4. Prochaines Actions Prioritaires

1. **Déploiement WebRadio JoyStick FM (DMZ Externe)** :
   * Création des VM Debian depuis l'ISO Proxmox standard (sans importation VMDK/OVA, compte étudiant restreint).
   * Déploiement automatisé d'Icecast2 (`10.100.0.50`), du portail Web Player (`10.100.0.51`) et du streamer audio (`10.100.0.52`).
   * Bascule des 3 dernières jauges Uptime Kuma à 100% Vert.
2. **Tunnel IPsec B2B Intergroupes (Mission 2)** :
   * Configuration des Phases 1 et 2 sur OPNsense dès réception des paramètres de l'autre groupe.
   * Filtrage chirurgical strict vers l'album partagé Immich.


