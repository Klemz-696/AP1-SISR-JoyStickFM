# Document 04 : Déploiement des Services (Windows Server, Docker Immich & Minecraft)
## Projet AP 1 - BTS SIO SISR (Binôme 04 & 10)

---

## 1. Serveur de Fichiers (Windows Server 2022 / 2025)

Le serveur de fichiers est situé en **DMZ Interne** (`10.4.1.20`). Il doit fournir un partage de fichiers réseau (SMB) et être administrable à distance par ligne de commande (**PowerShell Remoting / WinRM**).

### A. Configuration du Partage SMB
1. Ouvrez le **Gestionnaire de serveur** > **Ajouter des rôles et fonctionnalités**.
2. Vérifiez que le rôle **Services de fichiers et de stockage** > **Serveur de fichiers** est installé.
3. Créez les répertoires sur un volume dédié (ex: `D:\Partages\`) :
   * `D:\Partages\DocumentsEmploye`
   * `D:\Partages\Sauvegardes`
4. Partager le dossier avec les autorisations appropriées :
   * **Nom de partage :** `Sauvegardes$` *(partage masqué)* ou `Sauvegardes`
   * **Autorisations de partage :** Accès complet pour l'administrateur, Lecture/Écriture pour le compte `employe04`.
   * **Autorisations NTFS :** Modifier / Lecture / Écriture pour `employe04`.

### B. Activation et Sécurisation de PowerShell Remoting (WinRM)
Pour satisfaire à la consigne « accessible via SSH ou PowerShell », activez WinRM sur le serveur Windows :

```powershell
# À exécuter sur le serveur Windows Server (en Administrateur)
Enable-PSRemoting -Force
Set-Service -Name WinRM -StartupType Automatic
Start-Service -Name WinRM

# Vérifier l'écoute sur le port WinRM HTTP (5985) et HTTPS (5986)
Get-NetTCPConnection -LocalPort 5985, 5986
```

#### Test d'administration distante depuis le poste client nomade :
Une fois connecté au VPN IPsec nomade, l'employé ouvre PowerShell et se connecte au serveur en ligne de commande :

```powershell
Enter-PSSession -ComputerName 10.4.1.20 -Credential (Get-Credential)
```
> **Preuve pour le dossier de recette :** Capture de l'invite de commande distante `[10.4.1.20]: PS C:\Users\employe04\Documents>` démontrant l'administration distante sans interface graphique.

---

## 2. Pourquoi utiliser Docker pour Immich et Minecraft en BTS SISR ?

Le cahier des charges laisse le choix de l'OS. L'utilisation d'une VM **Debian 12 avec Docker & Docker Compose** pour héberger Immich et Minecraft apporte des arguments décisifs devant le jury d'examen :

1. **Architecture micro-services d'Immich :** Immich n'est pas un simple script PHP. Il se compose de 4 briques interdépendantes :
   * Un serveur backend (Node.js)
   * Une base de données relationnelle **PostgreSQL** avec extension vectorielle `pgvector`
   * Un cache en mémoire **Redis**
   * Un conteneur d'intelligence artificielle / Machine Learning pour la détection des visages et objets.
   * *Installer tout cela manuellement sur un OS classique prendrait des heures et créerait des conflits de versions. Avec Docker Compose, l'infrastructure complète est déployée en 1 minute.*
2. **Infrastructure as Code (IaC) :** Toute la configuration réside dans un simple fichier `docker-compose.yml`. Cela démontre une compétence moderne très valorisée dans le référentiel SISR (Bloc 2).
3. **Isolation et légèreté :** Les conteneurs partagent le noyau Linux, consomment très peu de RAM sur votre Proxmox, et peuvent être sauvegardés ou redémarrés instantanément.

---

## 3. Déploiement d'Immich (DMZ Interne - `10.4.1.21`)

### Étape 1 : Préparation de l'hôte Debian
Sur la VM Debian (`10.4.1.21`) :
```bash
# Installation des prérequis Docker
sudo apt update && sudo apt install -y curl ca-certificates gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Ajout du dépôt Docker officiel
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

### Étape 2 : Fichier `docker-compose.yml` pour Immich
Créez un dossier `/opt/immich` et placez-y le fichier `docker-compose.yml` :

```yaml
name: immich

services:
  immich-server:
    container_name: immich_server
    image: ghcr.io/immich-app/immich-server:release
    volumes:
      - /opt/immich/upload:/usr/src/app/upload
      - /etc/localtime:/etc/localtime:ro
    env_file:
      - .env
    ports:
      - "2283:2283"
    depends_on:
      - redis
      - database
    restart: always

  immich-machine-learning:
    container_name: immich_machine_learning
    image: ghcr.io/immich-app/immich-machine-learning:release
    volumes:
      - /opt/immich/model-cache:/cache
    env_file:
      - .env
    restart: always

  redis:
    container_name: immich_redis
    image: docker.io/redis:6.2-alpine
    restart: always

  database:
    container_name: immich_postgres
    image: docker.io/tensorchord/pgvecto-rs:pg14-v0.2.0
    environment:
      POSTGRES_PASSWORD: DB_Password_AP1_2026!
      POSTGRES_USER: postgres
      POSTGRES_DB: immich
      PGDATA: /var/lib/postgresql/data
    volumes:
      - /opt/immich/pgdata:/var/lib/postgresql/data
    restart: always
```

Créez le fichier de configuration `.env` dans le même dossier :
```ini
UPLOAD_LOCATION=/opt/immich/upload
DB_DATABASE_NAME=immich
DB_USERNAME=postgres
DB_PASSWORD=DB_Password_AP1_2026!
```

Lancez la pile :
```bash
docker compose up -d
```
L'interface est immédiatement accessible sur `http://10.4.1.21:2283`.

### Procédure de création de l'album partagé (Mission 2) :
1. Connectez-vous sur l'interface Immich depuis le poste client nomade.
2. Déposez quelques photographies professionnelles (ex: photos de chantier ou d'infrastructure).
3. Créez un album intitulé **« Événement Partenaire B2B »**.
4. Cliquez sur **Partager (Share)** > **Créer un lien public**.
5. Notez l'URL générée : `http://10.4.1.21:2283/share/XXXX-XXXX-XXXX`.
6. C'est cette URL précise que vous communiquez au binôme partenaire.

---

---

## 4. Déploiement et Recette du Serveur Minecraft (Mission 2 - `10.30.0.22`) [100% VALIDÉ ✅]

Dans le cadre de la Mission 2, un serveur Minecraft haute performance a été déployé dans le VLAN 300 (DMZ Interne) sur la VM dédiée `srv-minecraft` (VM 11017, Debian 12 Bookworm, IP `10.30.0.22/24`). Le serveur répond à un double objectif :
1. **Accès privé et sécurisé pour l'administrateur nomade** via le tunnel **VPN WireGuard** (`10.200.100.0/24`) et le réseau de gestion **Tailscale** (`100.88.228.38`).
2. **Accès public pour les élèves et auditeurs du lycée** via une redirection de port (**Destination NAT**) sur le pare-feu **OPNsense** (`192.168.101.37:25565`).

---

### 4.1. Architecture Moteur & Évolution PaperMC 26.2 (Java 25 LTS)

Pour offrir une expérience de jeu fluide, supporter les mini-jeux JoyStick FM et éliminer la triche, le serveur a migré de Vanilla vers **PaperMC 26.2 (build 129)** sous **Java 25 LTS**. 

Le serveur intègre une pile de **22 plugins Bukkit/Paper** interconnectés :
* **Gouvernance & Sécurité :** `LuckPerms` (RBAC), `EssentialsX` + `EssentialsSpawn`, `CoreProtect` (traçabilité/rollback SQLite), `GrimAC` (anticheat asynchrone), `GriefPrevention`.
* **Multi-Mondes & Génération :** `Multiverse-Core`, `Multiverse-Inventories`, `VoidGen` (générateur de vide absolu), `Chunky` (prégénération de chunks), `WorldEdit`.
* **Gameplay & Menus Interactifs :** `ItemJoin` (distribution automatisée d'objets d'inventaire), `DeluxeMenus` (GUI interactive à base d'inventaires coffres), `BedWars`, `BlockHunt` (Cache-cache).
* **Interface & Réseau :** `TAB` (Scoreboard latéral et tablist néon), `LPC` (formatage chat par rang), `PlaceholderAPI`, `Vault`, `ProtocolLib`, `packetevents`.

---

### 4.2. Contournement Technique du Filtrage DPI Académique

Lors du déploiement sous Docker, le téléchargement automatique de PaperMC/Mojang a été bloqué par le pare-feu académique du lycée (Stormshield/Fortinet) via inspection DPI sur le SNI TLS (`api.papermc.io`, `piston-meta.mojang.com`) injectant des paquets `TCP RST`.
* **Solution d'ingénierie appliquée :** 
  - Pré-chargement du binaire Mojang dans le cache local `/opt/minecraft/data/cache/mojang_26.2.jar`.
  - Configuration du paramètre JVM `-DbundlerRepoDir=/data` dans `docker-compose.yml`.
  - Paperclip assemble ainsi le serveur Paper 26.2 de manière 100% autonome et hors-ligne via le mode `CUSTOM`.

---

### 4.3. Configuration `docker-compose.yml` en Production (`/opt/minecraft/`)

```yaml
services:
  minecraft-server:
    image: itzg/minecraft-server:latest
    container_name: minecraft_ap1
    ports:
      - "25565:25565"
      - "25575:25575"
    environment:
      EULA: "TRUE"
      TYPE: "CUSTOM"
      CUSTOM_SERVER: "paper.jar"
      ONLINE_MODE: "FALSE" # Autorise les comptes scolaires et tests locaux
      MOTD: "§6✦ JOYSTICK FM ✦ §eServeur Communautaire §7- §bAP1 SISR"
      MEMORY: "3G"
      JVM_OPTS: "-DbundlerRepoDir=/data"
      FORCE_GAMEMODE: "TRUE"
      GAMEMODE: "adventure"
      DIFFICULTY: "peaceful"
      ENABLE_RCON: "TRUE"
      RCON_PASSWORD: "adminpassword"
      MAX_PLAYERS: "25"
      VIEW_DISTANCE: "8"
      TZ: "Europe/Paris"
    volumes:
      - ./data:/data
    restart: unless-stopped
```

---

### 4.4. Hub Flottant dans le Vide (Void Lobby) & Sécurisation Périmétrique

Pour garantir un accueil professionnel digne des grands serveurs communautaires :
1. **Monde flottant en plein vide (`hub`)** :
   - Généré via `VoidGen` pour éliminer tout terrain plat, herbe ou structures résiduelles.
   - La plateforme d'accueil (13 448 blocs) flotte à Y=64 au-dessus du vide intersidéral.
2. **Barrières invisibles anti-chute** :
   - 640 blocs de barrière (`barrier`) disposés sur 4 blocs de hauteur (Y=64 à Y=68) ceinturent rigoureusement le périmètre de la plateforme.
   - Les joueurs ne peuvent pas tomber dans le vide ni quitter la zone d'accueil sans passer par le menu des jeux.
3. **Gel permanent du temps et de la météo** :
   - Maintien du midi solaire permanent (6 000 ticks) :
     ```bash
     docker exec -i minecraft_ap1 rcon-cli -- mv gamerule set advance_time false hub
     docker exec -i minecraft_ap1 rcon-cli -- time set 6000 hub
     ```
   - Désactivation permanente de la pluie/orage :
     ```bash
     docker exec -i minecraft_ap1 rcon-cli -- mv gamerule set advance_weather false hub
     docker exec -i minecraft_ap1 rcon-cli -- weather hub sun
     ```
   - Désactivation de l'apparition des monstres :
     ```bash
     docker exec -i minecraft_ap1 rcon-cli -- mv gamerule set spawn_monsters false hub
     ```
4. **Protection anti-grief et anti-casse absolue** :
   - Mode `ADVENTURE` forcé pour tous les joueurs à la connexion (`force-gamemode=true`).
   - Impossibilité physique de poser, déplacer ou casser le moindre bloc de la plateforme.

---

### 4.5. Automatisation du Gameplay : Boussole Magique & GUI DeluxeMenus

1. **Boussole de Sélection des Jeux (`ItemJoin`)** :
   - Tout joueur entrant sur le serveur reçoit automatiquement une boussole légendaire au **slot 4** (centre de la barre d'action) :
     - Nom : `&6&l✦ MENU DES JEUX ✦ &7(Clic-Droit)`
     - Propriétés : Incassable, inamovible de l'inventaire, protégée contre le drop et le vol.
   - Tout ancien objet résiduel ou bloc parasite est automatiquement purgé à la connexion (`Clear-Items: Join: true`).
2. **Menu Graphique Interactif (`DeluxeMenus`)** :
   - Un simple clic-droit sur la boussole ou la saisie de `/menu` ouvre une interface GUI coffre (27 slots) :
     - **🌍 SURVIE NATURELLE** (Slot 11) : Téléporte vers le monde survie procédural (`/mv tp survie`). Intègre la commande `/rtp` (téléportation aléatoire sécurisée dans la zone générée) et la protection des terrains (`GriefPrevention`).
     - **🛏️ MINI-JEU BEDWARS** (Slot 13) : Rejoint la file d'attente de l'arène officielle 4 équipes de 2 (`/bw join jfm_duo`) dans le monde `bedwars_jfm`.
     - **🎭 CACHE-CACHE / BLOCKHUNT** (Slot 15) : Rejoint la partie de BlockHunt (`/bh join jfm_retro`) dans le village rétro 81×81 (`blockhunt_jfm`).
     - **🏛️ RETOUR AU LOBBY** (Slot 22) : Sortie propre et retour au centre du hub (`/spawn`).
3. **Cloisonnement Étanche des Inventaires (`Multiverse-Inventories`)** :
   - 6 groupes d'inventaires indépendants configurés dans `groups.yml` :
     - `hub` : uniquement la boussole magique.
     - `survie` : inventaire persistant partagé (`survie`, `survie_nether`, `survie_the_end`).
     - `bedwars` : inventaire isolé géré par le cycle de match BedWars (`bedwars_jfm`).
     - `blockhunt` : inventaire temporaire de mini-jeu (`blockhunt_jfm`).
     - `legacy_world` & `legacy_minijeux` : profils historiques archivés sans risque d'écrasement.
   - Protection ItemJoin : purge aveugle désactivée (`Clear-Items: Join: false, World-Switch: false`) afin de garantir l'intégrité absolue des inventaires Survie lors des téléportations inter-mondes.
4. **Hiérarchie LuckPerms (RBAC)** :
   - Groupe `default` (Joueurs) : Autorisations d'ouverture du menu, de téléportation inter-mondes Multiverse, d'utilisation de la boussole et permission `/rtp` restreinte au monde `survie` (`world=survie`).
   - Groupe `admin` : Administration complète (`luckperms.*`, `multiverse.*`, `deluxemenus.*`, `essentials.*`, `worldedit.*`) avec suppression du wildcard destructeur `'*'` et neutralisation de l'exemption de spawn (`essentials.spawn-on-join.exempt: false`).

---

### 4.6. Règles de Redirection OPNsense (Destination NAT / Port Forwarding)

Pour permettre aux élèves du lycée d'accéder au serveur Minecraft sans installer de client VPN, une règle de redirection de port a été configurée dans **Firewall > NAT > Destination NAT** sur OPNsense :

| Champ OPNsense | Valeur Minecraft (25565) | Valeur WebRadio HTTP (80) |
| :--- | :--- | :--- |
| **Interface** | `WAN` | `WAN` |
| **TCP/IP Version** | `IPv4` | `IPv4` |
| **Protocol** | `TCP` | `TCP` |
| **Destination** | `WAN address` (`192.168.101.37`) | `WAN address` (`192.168.101.37`) |
| **Destination port range** | `25565` to `25565` | `HTTP (80)` to `HTTP (80)` |
| **Redirect target IP** | `10.30.0.22` *(srv-minecraft)* | `10.100.0.51` *(Debian_Web)* |
| **Redirect target port** | `25565` | `80` |
| **Filter rule association** | `Add associated filter rule` | `Add associated filter rule` |
| **Description** | `NAT WAN vers Serveur Minecraft DMZ Int` | `NAT WAN vers Portail WebRadio DMZ Ext` |

> 🛡️ **Sécurité appliquée :** L'option `Filter rule association: Add associated filter rule` génère automatiquement la règle d'ouverture dans **Firewall > Rules > WAN** ciblant uniquement l'IP interne et le port spécifié, sans exposer la console d'administration RCON (25575) ni l'accès SSH (22).

---

### 4.7. Preuves de Recette Validées en Séance (05/10/2026) :

1. **Écoute locale sur la VM `srv-minecraft`** :
   ```bash
   root@srv-minecraft:~# ss -tlnp | grep 25565
   LISTEN 0      4096         0.0.0.0:25565      0.0.0.0:*    users:(("docker-proxy",pid=103384,fd=8))
   ```
2. **Validation des modules applicatifs en console RCON** :
   ```text
   > plugins
   ℹ Server Plugins (22):
   - ProtocolLib, BedWars, BlockHunt, Chunky, CoreProtect, DeluxeMenus, Essentials, EssentialsSpawn,
     GriefPrevention, GrimAC, ItemJoin, LibsDisguises, LPC, LuckPerms, Multiverse-Core,
     Multiverse-Inventories, packetevents, PlaceholderAPI, TAB, Vault, VoidGen, WorldEdit
   
   > dm reload
   DeluxeMenus successfully reloaded! 1 menu loaded...
   
   > ij reload
   [ItemJoin] 1/1 Custom item(s) loaded!
   ```
3. **Persistance des gamerules du Hub dans le vide** :
   ```text
   minecraft:advance_time: false (Heure figée à 6000 ticks / midi)
   minecraft:advance_weather: false (Météo figée sur sun)
   minecraft:spawn_monsters: false (Zéro monstre)
   gamemode: adventure (Anti-casse actif)
   ```
4. **Test de socket TCP depuis le réseau d'administration** :
   ```powershell
   PS C:\Users\sauze> Test-NetConnection -ComputerName 10.30.0.22 -Port 25565
   ComputerName     : 10.30.0.22
   RemotePort       : 25565
   TcpTestSucceeded : True
   ```
5. **Connexion joueur validée en conditions réelles** :
   ```text
   [12:50:53 INFO]: UUID of player Klemz_696 is 6790a3cc-637a-311a-a2e5-e9ae40ea0459
   [12:50:54 INFO]: Klemz_696 joined the game
   [12:50:54 INFO]: Klemz_696 logged in at ([minecraft:hub]0.5, 65.0, 0.5)
   ```
6. **Vérification en jeu** : Le joueur arrive directement au centre de la plateforme suspendue dans le vide sous un soleil radieux permanent, reçoit sa boussole interactive au slot 4, ouvre le menu des jeux d'un clic-droit et ne peut casser aucun bloc du lobby.

---

### 4.8. Décisions Techniques Fermes (D1 à D6) & Nouveaux Modes de Jeu

Dans le prolongement des retours d'expérience et des tests en séance, six décisions d'arbitrage ont été formellement validées pour enrichir le serveur et calibrer ses règles de jeu :

| Décision | Domaine | Arbitrage Validé | Implémentation Système & Configuration |
| :--- | :--- | :--- | :--- |
| **D1** | **Survie Simple** | **Pas de claim (Vanilla pure)** | `Claims.Mode.survie: Disabled` dans GriefPrevention. Liberté totale de construction et d'exploration, zéro contrainte de parcelles. |
| **D2** | **Comptes & Auth** | **Option A (online-mode=false + AuthMe)** | Maintien de `ONLINE_MODE=FALSE` pour accessibilité scolaire, avec protection par mot de passe chiffré SHA256 (`/register`, `/login`) pour sécuriser les comptes staff et inventaires. |
| **D3** | **BlockHunt** | **Option C (Spectateur permanent)** | Dès qu'un caché est éliminé, il passe instantanément en mode spectateur jusqu'à la fin de la partie (aucun repop en chercheur). |
| **D4** | **Modes FunCraft** | **Option A (Rush & Hikabrain historiques)** | **Rush (1v1 & 2v2) :** Lits destructibles (pioche/TNT), ponts grès économiques, bâton KB, spawners accélérés et TNTFly compatible GrimAC.<br>**Hikabrain (1v1) :** Passerelle de 1 bloc de large à Y=64, objectif toucher le lit adverse pour marquer, premier à 5 points gagne, reset automatique après point. |
| **D5** | **Tombes Survie** | **Option B (30 min de protection puis libre)** | À la mort en Survie, une tombe sécurise l'équipement. Protégée 30 minutes exclusivement pour la victime, puis pillable par tous les joueurs si abandonnée. |
| **D6** | **Classements** | **Option A (Stats privées & Top Parkour)** | Statistiques personnelles privées consultables dans le menu (`/menu`). Seul affichage public physique au Lobby : le **Top Parkour** chronométré. |

#### Nouveaux Mondes et Arènes Déployés :
1. **Lobby des Mini-Jeux (`lobby_minijeux`)** : Monde Void dédié avec une plateforme néon stylisée JoyStick FM (quartz, béton violet/cyan) abritant 4 portails et PNJ d'accès direct vers BedWars, Rush, Hikabrain et BlockHunt.
2. **Arènes Rush (`rush_jfm`)** : Deux bases symétriques suspendues au-dessus du vide (Rouge vs Bleu) distantes de 30 blocs, supportant les formats `rush_1v1` et `rush_2v2`.
3. **Arène Hikabrain (`hikabrain_jfm`)** : Passerelle suspendue de 1 bloc de grès à Y=64 reliant deux plateformes équipées de lits pour le duel au clic en 5 points.
4. **Sécurisation Anti-Chute Hub** : Barrières invisibles périmétriques sur 3 blocs de haut et rattrapage automatique sous `Y=50` retéléportant instantanément au spawn `(0.5, 65, 0.5)` sans vélocité ni dégâts de chute.

---

### 4.9. Montée en Puissance Matérielle (22,35 Go RAM, 15 vCPUs, SSD) & Déploiement des 8 Lots (0 à 7)

Pour accompagner l'ouverture multi-jeux simultanée (BedWars, Rush, Hikabrain, BlockHunt, Survie procédurale), les spécifications de la machine virtuelle `srv-minecraft` ont été augmentées au niveau de l'hyperviseur :
- **Mémoire RAM allouée :** **22,35 Go** (Tas JVM calibré à **16 Go** avec G1GC optimisé pour 15 threads).
- **Processeur :** **15 cœurs vCPU** alloués, assurant une parallélisation complète de la génération Chunky et du ticking asynchrone PaperMC.
- **Stockage :** **Émulation SSD activée** (élimination des temps d'attente d'I/O disque lors des sauvegardes de chunks).

#### Organisation des 8 Lots de Base Produits (`Perplexity/JoyStickFM_Production_Lots_0_a_7/`) :
* **Lot 0 (Staging & Specs) :** `docker-compose.optimized.yml` (16G heap, Aikar G1GC flags), script d'audit matériel et backup tar immuable.
* **Lot 1 (BedWars & BlockHunt) :** Configuration `jfm_duo.yml`, `shop.yml`, `blockhunt_arenas.yml` (D3 spectateur permanent) et isolation Multiverse-Inventories.
* **Lot 2 (Hub & Lobby Mini-Jeux) :** Sécurisation anti-vide du Hub (`lot2_hub_security.py`) et générateur procédural du monde néon `lobby_minijeux` (`lot2_generate_minigames_lobby.py`).
* **Lot 3 (Survie Vanilla & Tombes) :** Désactivation des claims sur `survie` (D1) et module de tombes physiques protégées 30 minutes avant pillage public (D5).
* **Lot 4 (Rush FunCraft) :** Arènes `rush_1v1.yml`, `rush_2v2.yml`, générateur `rush_jfm` et boutique grès/stick KB/TNT.
* **Lot 5 (Hikabrain 1v1) :** Générateur de passerelle suspendue 1 bloc et moteur autonome de scoring au lit adverse en 5 points (`lot5_hikabrain_engine.py`).
* **Lot 6 (Navigation DeluxeMenus) :** Menu 27 slots mis à jour avec boussole ItemJoin et PNJ interactifs d'accès aux files de jeux.
* **Lot 7 (AuthMe & Recette) :** Module d'authentification locale SHA256 (D2), Top Parkour physique au Hub (D6), suite de tests globale (`lot7_full_test_suite.py`) et matrice de recette (`RECETTE_EXPLOITATION_LOTS_0_A_7.md`).
* **Déploiement Maître 1-Clic :** `deploy_all_lots_0_to_7.py` orchestrant l'ensemble de manière totalement automatisée.


