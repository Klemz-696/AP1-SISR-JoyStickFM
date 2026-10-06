# Preuve : Relevé Télémétrique de la VM de Production

**Date et Heure du relevé** : Mardi 6 octobre 2026 à 20:39:12 CEST  
**Méthode d'acquisition** : Commandes SSH en lecture seule sur `srv-minecraft` (`10.30.0.22`)  
**Compte d'exécution** : `root@10.30.0.22` (lecture seule stricte)

---

## 1. État Système & Conteneur

- **Système d'exploitation hôte** : Debian 12 (Linux 6.1.0-28-amd64 x86_64)
- **Uptime de la VM** : 1 jour, 2h 51 min
- **Charge système (load average)** : 0.01, 0.03, 0.00 (charge CPU quasi nulle, pas de saturation)
- **Conteneur Docker** : `minecraft_ap1`
  - Statut : `Up 4 hours (healthy)`
  - Image de base : `itzg/minecraft-server:latest`
  - Ports exposés : `0.0.0.0:25565->25565/tcp`, `[::]:25565->25565/tcp`
  - Volume bind mount : `/opt/minecraft/data:/data`

---

## 2. Environnement JVM & Moteur Minecraft

- **Moteur Serveur** : PaperMC 26.2 (build 129 stable)
- **Java Runtime** : OpenJDK version 25.0.4.1+1 LTS (Temurin-25.0.4.1+1)
- **Allocation Mémoire (Heap)** :
  - `MEMORY=8G` (Allocation maximale : 8 192 Mo)
  - `INIT_MEMORY=4G` (Allocation initiale : 4 096 Mo)
- **Options JVM** : `-DbundlerRepoDir=/data`
- **Utilisateur & Groupe interne** : `UID=1000`, `GID=1000` (`srv-minecraft`)
- **Stabilité TPS mesurée en direct** :
  - 1 minute : **20.0 TPS**
  - 5 minutes : **20.0 TPS**
  - 15 minutes : **20.0 TPS**
- **Mode En Ligne (Online Mode)** : `FALSE` (mode hors-ligne sécurisé par AuthMe SHA-256)
- **Joueurs connectés au moment du relevé** : 0 / 10
