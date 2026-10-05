# 📄 Journal de Bord & Synthèse d'Avancement — Séance 05
**Date :** 05 Octobre 2026  
**Auteurs :** Clément SAUZÈDE (Étudiant 04 - Lead Réseau) & Mathys DUTHILLEUL (Étudiant 10 - Admin Systèmes)  
**Projet :** AP 1 BTS SIO SISR — Lycée Sidoine Apollinaire  

---

## 🎯 1. Objectifs de la Séance du 05/10/2026

1. **Audit & Réparation des Accès Réseau Distants et Locaux** :
   - Diagnostic de l'échec de handshake VPN WireGuard nomade et de l'inaccessibilité de la DMZ Interne via Tailscale.
   - Rétablissement des communications vers les VM de production (`srv-minecraft` en `10.30.0.22`, `Debian_Web` en `10.100.0.51`).
2. **Configuration du Pare-Feu OPNsense (Destination NAT / Port Forwarding)** :
   - Mise en place des redirections de ports publiques pour permettre aux élèves et auditeurs du lycée d'accéder au serveur Minecraft (`25565`) et à la WebRadio (`80`) sans passer par un VPN.
   - Validation de la génération automatique des règles de filtrage associées dans **Firewall > Rules > WAN**.
3. **Refonte Intégrale et Modernisation du Serveur Minecraft (PaperMC 26.2 / Java 25 LTS)** :
   - Création et déploiement du Hub en plein vide (**Void Lobby**) sans terrain plat, herbe ou structures résiduelles.
   - Pose d'une barrière invisible périmétrique de 640 blocs de `barrier` pour empêcher toute chute accidentelle dans le vide.
   - Gel permanent du cycle jour/nuit à midi solaire et neutralisation de la météo (soleil permanent, zéro monstre).
   - Verrouillage anti-grief et anti-casse absolu via le forçage du mode **Aventure**.
   - Automatisation de l'inventaire : distribution de la boussole magique interactive au slot 4 (`ItemJoin`) et purge des items résiduels.
   - Menu graphique interactif coffre 27 slots (`DeluxeMenus`) avec téléportation vers Survie, BedWars, Cache-Cache et Spawn.
4. **Recette Globale et Mise à Jour Documentaire** :
   - Validation de la persistance post-reboot, vérification des règles de sécurité et mise à jour des référentiels techniques du projet.

---

## 🛠️ 2. Réalisations Techniques et Incidents Résolus

### A. Diagnostic & Résolution des Accès Réseau (WireGuard & Tailscale)

* **Incident 1 (Handshake WireGuard)** :
  - *Cause identifiée* : Le profil local `WG-Tunel-VPN-AP1.conf` pointait vers `92.132.39.186:51820` (IP publique Livebox du domicile de Clément), provoquant un bouclage réseau local écrasant la route `192.168.1.0/24`. L'instance OPNsense du lycée écoute en réalité sur le réseau privé lycée `192.168.101.37:51820`.
  - *Correction* : Réajustement des endpoints et bascule sur la connectivité de gestion sécurisée.
* **Incident 2 (Accès Tailscale à la DMZ Interne)** :
  - *Cause identifiée* : Le bastion `posteclement` (`100.88.228.38`) n'annonçait pas le sous-réseau `10.30.0.0/24` sur le tailnet.
  - *Correction* : Exécution de `tailscale set --advertise-routes=10.30.0.0/24` et approbation de la route dans la console Tailscale. L'accès SSH et TCP 25565 vers `10.30.0.22` est désormais immédiat et 100% stable depuis le PC portable.

---

### B. Configuration OPNsense 24.x : Destination NAT (Port Forwarding)

Dans l'interface WebGUI d'OPNsense 24.x, la redirection de ports s'effectue dans **Firewall > NAT > Destination NAT** :

| Champ Paramètre | Règle 1 : Serveur Minecraft | Règle 2 : WebRadio JoyStick FM |
| :--- | :--- | :--- |
| **Interface** | `WAN` | `WAN` |
| **TCP/IP Version** | `IPv4` | `IPv4` |
| **Protocol** | `TCP` | `TCP` |
| **Destination** | `WAN address` (`192.168.101.37`) | `WAN address` (`192.168.101.37`) |
| **Destination port range** | `25565` to `25565` | `HTTP (80)` to `HTTP (80)` |
| **Redirect target IP** | `10.30.0.22` *(srv-minecraft)* | `10.100.0.51` *(Debian_Web)* |
| **Redirect target port** | `25565` | `HTTP (80)` |
| **Filter rule association** | `Add associated filter rule` | `Add associated filter rule` |
| **Description** | `NAT WAN vers Serveur Minecraft DMZ Int` | `NAT WAN vers Portail WebRadio DMZ Ext` |

> 🛡️ **Sécurité validée** : L'option `Add associated filter rule` a automatiquement créé les autorisations correspondantes dans **Firewall > Rules > WAN** sans exposer les ports d'administration sensibles (SSH 22, RCON 25575, WebGUI 443).

---

### C. Refonte Intégrale du Serveur Minecraft (`srv-minecraft` en `10.30.0.22`)

#### 1. Hub Void (Monde Flottant dans le Vide)
* **Incident initial** : Le joueur se reconnectait sur un monde plat classique (`hub`) avec herbe et structures, tandis que le monde vide créé était dans `hub_void`.
* **Résolution** :
  - Remplacement physique des fichiers région de `hub` par les chunks purs générés via `VoidGen` (13 448 blocs de plateforme flottant à Y=64 au-dessus du vide).
  - Suppression définitive de `hub_void` pour éliminer toute confusion.
  - Pose de 640 blocs de barrière invisible (`barrier`) de Y=64 à Y=68 sur tout le périmètre de la plateforme pour interdire les chutes.

#### 2. Gel Permanent du Cycle Jour/Nuit et de la Météo
* **Incident initial** : Le cycle jour/nuit continuait de tourner malgré l'envoi de `gamerule doDaylightCycle false`.
* **Cause technique** : Sur PaperMC 26.2 (1.21), Mojang et Paper ont renommé les gamerules en notation snake_case `minecraft:advance_time`.
* **Résolution appliquée et vérifiée** :
  ```bash
  # Gel du temps à 6000 ticks (Midi solaire permanent)
  docker exec -i minecraft_ap1 rcon-cli -- mv gamerule set advance_time false hub
  docker exec -i minecraft_ap1 rcon-cli -- time set 6000 hub

  # Désactivation de la météo (Soleil permanent)
  docker exec -i minecraft_ap1 rcon-cli -- mv gamerule set advance_weather false hub
  docker exec -i minecraft_ap1 rcon-cli -- weather hub sun

  # Suppression des apparitions de monstres
  docker exec -i minecraft_ap1 rcon-cli -- mv gamerule set spawn_monsters false hub
  ```

#### 3. Protection Anti-Grief et Forçage du Mode Aventure
* **Incident initial** : Le compte joueur pouvait poser et casser des blocs du lobby car son profil était resté en Survie (`/gamemode survival`) et le groupe `admin` LuckPerms possédait le wildcard `'*'`.
* **Résolution** :
  - Configuration de `force-gamemode=true` et `gamemode=adventure` dans `server.properties` et Multiverse.
  - Retrait du wildcard `'*'` dans LuckPerms et affectation de permissions administratives explicites (`luckperms.*`, `multiverse.*`, `deluxemenus.*`, `essentials.*`, `worldedit.*`).
  - Neutralisation de l'exemption de spawn (`essentials.spawn-on-join.exempt: false`).
  - Purge intégrale des profils résiduels (`world/players/data/` et `Essentials/userdata/`). À la connexion, chaque joueur est forcé en mode **Aventure** et ne peut altérer aucun bloc.

#### 4. Automatisation du Gameplay (Boussole Magique & DeluxeMenus)
* **Distribution automatisée (`ItemJoin`)** :
  - Purge automatique des objets invalides ou parasites à la connexion (`Clear-Items: Join: true`).
  - Distribution d'une boussole légendaire `✦ MENU DES JEUX ✦` au **slot 4** (milieu de la barre d'action).
  - L'objet est incassable, inamovible et non jetable.
* **Menu Graphique Interactif (`DeluxeMenus`)** :
  - Correction de l'arborescence de configuration (`gui_menus:` au lieu de `menus:`), validant le chargement de `games.yml`.
  - Un clic-droit sur la boussole ou la commande `/menu` ouvre une interface graphique interactive :
    - 🌍 **Survie** (`/mv tp world`)
    - 🛏️ **BedWars** (`/mv tp minijeux`)
    - 🎭 **Cache-Cache / BlockHunt** (`/bh join`)
    - 🏛️ **Retour au Spawn** (`/spawn`)

---

## 📊 3. Tableau Récapitulatif de l'Infrastructure à date

| Service / VM | Rôle / Port | IP Réseau | Statut Recette |
| :--- | :--- | :--- | :---: |
| **`OPNsense-projet`** | Passerelle, NAT 25565/80, QoS, WireGuard | `192.168.101.37` / `10.30.0.254` | **100% FONCTIONNEL ✅** |
| **`Poste-Clément`** | Bastion Linux Mint, Uptime Kuma v2, Tailscale | `192.168.200.4:3001` (`100.88.228.38`) | **100% FONCTIONNEL ✅** |
| **`SRV-FILES-projet`** | Serveur de Fichiers & Partage SMB (Port 445) | `10.30.0.20` | **100% FONCTIONNEL ✅** |
| **`SRV-IMMICH-projet`** | Serveur Photos & Portail Web (Port 2283) | `10.30.0.21` | **100% FONCTIONNEL ✅** |
| **`srv-minecraft`** | PaperMC 26.2 (22 Plugins, Void Lobby, NAT 25565) | `10.30.0.22` | **100% FONCTIONNEL ✅** |
| **`WebRadio JoyStick FM`** | Icecast (8000), WordPress Player (80), Régie (52) | `10.100.0.50` à `.52` | **100% FONCTIONNEL ✅** |
| **`SRV-HONEYPOT-projet`** | Leurre LAMP & Journalisation d'attaques (Port 80) | `10.100.0.99` | **100% FONCTIONNEL ✅** |

---

## 📌 4. Preuves de Recette Validées en Séance

1. **Vérification RCON des 22 Plugins et Menus** :
   ```text
   > plugins
   ℹ Server Plugins (22):
   - ProtocolLib, BedWars, BlockHunt, Chunky, CoreProtect, DeluxeMenus, Essentials,
     EssentialsSpawn, GriefPrevention, GrimAC, ItemJoin, LibsDisguises, LPC, LuckPerms,
     Multiverse-Core, Multiverse-Inventories, packetevents, PlaceholderAPI, TAB, Vault,
     VoidGen, WorldEdit

   > dm reload
   DeluxeMenus successfully reloaded! 1 menu loaded...

   > ij reload
   [ItemJoin] 1/1 Custom item(s) loaded!
   ```
2. **Persistance des Gamerules du Hub Void** :
   ```text
   minecraft:advance_time: false (Temps figé à 6000 ticks / 12h00)
   minecraft:advance_weather: false (Météo figée sur sun)
   minecraft:spawn_monsters: false (Zéro monstre)
   gamemode: adventure (Anti-casse actif)
   ```
3. **Connexion Joueur et Interface Validées en Direct** :
   ```text
   [12:50:53 INFO]: UUID of player Klemz_696 is 6790a3cc-637a-311a-a2e5-e9ae40ea0459
   [12:50:54 INFO]: Klemz_696 joined the game
   [12:50:54 INFO]: Klemz_696 logged in at ([minecraft:hub]0.5, 65.0, 0.5)
   ```
4. **Comportement en Jeu** :
   - Arrivée immédiate au centre de la plateforme suspendue dans le vide sous un soleil radieux permanent.
   - Boussole dorée présente dans la barre d'action (slot 4).
   - Clic-droit ouvrant instantanément le menu des modes de jeu.
   - Impossible de casser ou poser un bloc.
   - Barrières invisibles opérationnelles sur tout le pourtour.
