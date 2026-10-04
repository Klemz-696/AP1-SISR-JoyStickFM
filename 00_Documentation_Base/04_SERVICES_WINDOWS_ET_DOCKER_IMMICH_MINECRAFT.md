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

Dans le cadre de la Mission 2, un serveur Minecraft a été déployé dans le VLAN 300 (DMZ Interne) sur la VM dédiée `srv-minecraft` (VM 11017, Debian 12 Bookworm, IP `10.30.0.22/24`). Le serveur est accessible de manière sécurisée par l'employé nomade via le tunnel **VPN WireGuard** (`10.200.100.0/24`).

### 4.1. Analyse Technique : Contournement du Filtrage DPI Académique
Lors du déploiement initial sous Docker, le téléchargement automatique de PaperMC/Mojang a échoué avec l'erreur `recvAddress(..) failed with error(-104): Connection reset by peer`.
- **Cause identifiée par audit réseau (`curl -Iv`)** : Le pare-feu académique du lycée (Stormshield/Fortinet) réalise du *Deep Packet Inspection* (DPI) sur le champ SNI TLS (`api.papermc.io`, `piston-meta.mojang.com`) et bloque la catégorie "Gaming" en injectant des paquets TCP RST.
- **Solution d'ingénierie appliquée** : Injection directe du binaire autonome `server.jar` (Mojang Vanilla 1.20.4) dans le volume persistant `/opt/minecraft/data/server.jar`, permettant un démarrage 100% autonome et hors-ligne via le mode `CUSTOM`.

### 4.2. Configuration `docker-compose.yml` en Production (`/opt/minecraft/`)
```yaml
services:
  minecraft-server:
    image: itzg/minecraft-server:latest
    container_name: minecraft_ap1
    ports:
      - "25565:25565"
    environment:
      EULA: "TRUE"
      TYPE: "CUSTOM"
      CUSTOM_SERVER: "server.jar"
      ONLINE_MODE: "FALSE" # Autorise les comptes de test et clients scolaires
      MOTD: "§6[AP1 SIO] §aServeur JoyStick & Co §7- §bMission 2"
      MEMORY: "2G"
      DIFFICULTY: "normal"
      MAX_PLAYERS: "20"
      VIEW_DISTANCE: "8"
      TZ: "Europe/Paris"
    volumes:
      - ./data:/data
    restart: unless-stopped
```

### 4.3. Administration via RCON
Élévation de privilèges administrateur (Opérateur) via la console Docker sans arrêt de service :
```bash
docker exec -i minecraft_ap1 rcon-cli op Klemz_696
# Résultat : Made Klemz_696 a server operator
```

### 4.4. Preuves de Recette Validées en Séance (03/10/2026) :
1. **Écoute locale sur la VM** :
   ```text
   root@debian:~# ss -tlnp | grep 25565
   LISTEN 0      4096         0.0.0.0:25565      0.0.0.0:*    users:(("docker-proxy",pid=103384,fd=8))
   ```
2. **Test de socket TCP depuis le poste Nomade Windows via WireGuard** :
   ```powershell
   PS C:\Users\sauze> Test-NetConnection -ComputerName 10.30.0.22 -Port 25565
   ComputerName     : 10.30.0.22
   RemotePort       : 25565
   InterfaceAlias   : WG-Tunnel-VPN-AP1
   SourceAddress    : 10.200.100.2
   TcpTestSucceeded : True
   ```
3. **Journal de connexion joueur en direct** :
   ```text
   [Server thread/INFO]: Klemz_696[/10.200.100.2:57200] logged in with entity id 351 at (-15.5, 74.0, -57.5)
   [Server thread/INFO]: Klemz_696 joined the game
   ```
4. **Vérification en jeu** : MOTD affiché `[AP1 SIO] Serveur JoyStick & Co - Mission 2`, latence verte (5 barres), connexion multijoueur fluide sous Minecraft 1.20.4.

