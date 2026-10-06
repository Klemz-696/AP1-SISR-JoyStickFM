# Configuration & Déploiement du Serveur Minecraft JoyStick FM

Ce dossier contient l'ensemble des fichiers de configuration et d'infrastructure réels extraits du serveur Minecraft en production (VM Debian 12 `srv-minecraft` / IP `10.30.0.22`, conteneur Docker `minecraft_ap1`).

## Architecture des fichiers

- `docker-compose.yml` : Configuration Docker Compose pour le serveur PaperMC 26.2 (Java 25, 8 Go RAM).
- `server.properties` : Paramètres officiels du serveur (MOTD, online-mode, ports, whitelist, etc.).
- `bukkit.yml` : Paramètres Bukkit (optimisation des ticks, gestion des mondes).
- `spigot.yml` : Optimisation Spigot (rayons d'entités, activation anti-xray, bungeecord false).
- `commands.yml` : Alias de commandes natifs (ex: `/menu`, `/spawn`).
- `config/` :
  - `paper-global.yml` : Paramètres globaux PaperMC (optimisation multithread, timungs/spark).
  - `paper-world-defaults.yml` : Paramètres mondes PaperMC (optimisations anti-xray Engine Mode 2, collisions, chunk loading).
- `plugins_configs/` : Configurations actives de tous les plugins Spigot / PaperMC :
  - `AuthMe` : Sécurité et enregistrement hors-ligne des comptes joueurs.
  - `BedWars` : Arènes BedWars et Rush FunCraft (`jfm_duo`, `rush_1v1`).
  - `BlockHunt` : Cache-Cache avec déguisements LibsDisguises (`jfm_retro`).
  - `CoreProtect` : Journalisation et anti-grief rollback des blocs.
  - `DeluxeMenus` : Menu graphique de sélection des jeux (`/menu`, `/dm open games`).
  - `Essentials` : Gestion des téléportations, messages et permissions économiques.
  - `GriefPreventionData` : Revendications de terrains à la pelle d'or pour la Survie.
  - `GrimAC` : Anti-cheat prédictif 3.x basé sur la simulation physique des paquets.
  - `ItemJoin` : Attribution automatique de la boussole interactive dans les lobbies.
  - `JoyStickHub` : Plugin natif (routage PNJ, protection casse/pose de blocs, immunité void, chrono parkour).
  - `LPC` : Formatage propre du tchat avec préfixes des grades.
  - `LuckPerms` : Permissions et hiérarchie des grades (`joueur`, `vip`, `moderateur`, `administrateur`).
  - `Multiverse-Core` & `Multiverse-Inventories` : Gestion des 6 mondes et séparation stricte des inventaires entre Survie et Mini-Jeux.
  - `TAB` : Affichage dynamique du TabList et scoreboard d'accueil.
  - `VoidGen` : Générateur de mondes entièrement vides pour les arènes mini-jeux.

---

## Déploiement & Synchronisation

Pour synchroniser ces configurations directement sur la VM de production, exécutez sur la VM :
```bash
cd /opt/minecraft/repo
git pull origin main
python3 Perplexity/JoyStickFM_Production_Lots_0_a_7/sync_full_server.py
```
