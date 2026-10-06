# JoyStick FM — Relevé des Manquants et des Anomalies (Phase 0)

Ce document consigne l'ensemble des fichiers absents, des divergences de configuration et des anomalies techniques identifiées lors de l'audit approfondi de l'existant.

---

## 1. Inventaire des Fichiers Absents

| Fichier recherché | Statut | Nature | Lieu de recherche | Conséquence / Justification |
|---|---|---|---|---|
| `/opt/minecraft/docker-compose.override.yml` | **ABSENT** | Facultatif | Racine `/opt/minecraft/` | Aucun fichier d'override n'est utilisé. La configuration complète réside dans `docker-compose.yml`. |
| `/opt/minecraft/compose.override.yml` | **ABSENT** | Facultatif | Racine `/opt/minecraft/` | Même constat que ci-dessus. Pas de besoin d'override. |
| `paper-world.yml` (par monde individuel) | **ABSENT** | Obsolète | Dossiers `world/`, `hub/`, etc. | PaperMC 26.2 (1.20+) centralise la configuration des mondes dans `config/paper-world-defaults.yml`. Les fichiers par monde ne sont créés qu'en cas de surcharge manuelle. |
| `WorldEdit/*.schem` (schematics d'arènes) | **ABSENT** | Facultatif | `plugins/WorldEdit/schematics/` | Les arènes procédurales (Rush, Hikabrain, Village) ont été bâties via des commandes d'exécution et de remplissage blocs (`fill`, `setblock`), sans dépendance à des fichiers schematics externes. |
| `ItemJoin/items.yml` dans `minecraft/` | **ABSENT DANS COPIE** | Anomalie de copie | `minecraft/data/plugins/ItemJoin/` | La copie locale `minecraft/` comportait des dossiers de plugins vides. Le fichier a été récupéré avec succès depuis `serveur_minecraft/` et le dépôt Git. |

---

## 2. Anomalies Techniques Identifiées dans les Sources

### Anomalie A1 : Écart de Mémoire Heap (2 Go déclarés vs 8 Go réels)
- **Constat** : L'audit brut préliminaire mentionnait `MEMORY=2G`.
- **Réalité terrain** : Le fichier `docker-compose.yml` actif et l'inspection Docker révèlent `MEMORY=8G` et `INIT_MEMORY=4G`.
- **Conséquence** : Aucune saturation mémoire constatée sur le serveur actuel, mais nécessité de documenter la date de passage à 8 Go (6 octobre 2026 à 15:14).

### Anomalie A2 : Coordonnées du Spawn Hub Divergentes
- **Constat** : L'ancien rapport de séance 6 déclarait le spawn à `(-274, 104, 452)`.
- **Réalité terrain** : Le code source de `JoyStickHub.java` (lignes 44-46) et `worlds.yml` fixent le spawn à `(0.5, 65.0, 0.5)`.
- **Conséquence** : Les joueurs atterrissent parfaitement au centre du pavillon d'accueil du Grand Hub Terrestre. La valeur `(-274, 104, 452)` était une ancienne coordonnée d'un monde précédent.

### Anomalie A3 : Groupe Partagé BedWars et Rush dans Multiverse-Inventories
- **Constat** : Dans `groups.yml`, `bedwars_jfm` et `rush_jfm` sont configurés dans `minijeuxgroup`.
- **Risque potentiel** : Un joueur pourrait techniquement conserver un item obtenu en BedWars lors d'une bascule rapide vers Rush si les plugins de mini-jeux ne vidaient pas systématiquement l'inventaire au join/leave.
- **Action requise en Phase 4** : Isoler strictement `rush_jfm` dans un groupe dédié ou s'assurer que le reset d'arène purge intégralement l'inventaire.

### Anomalie A4 : Suppression Large de Boussoles dans JoyStickHub
- **Constat** : Dans `JoyStickHub.java` (ligne 344), la commande `player.getInventory().remove(Material.COMPASS)` retire aveuglément tout objet de type boussole lors du passage en Survie.
- **Risque potentiel** : Si un joueur en Survie possède une boussole normale ou magnétisée (lodestone compass), elle est détruite.
- **Action requise en Phase 3** : Filtrer la suppression en vérifiant le nom de l'objet (NBT / DisplayName : `Menu des Jeux`) plutôt que le matériau brut `Material.COMPASS`.

### Anomalie A5 : Identification des PNJ par CustomName Brut
- **Constat** : Le routage des PNJ dans `JoyStickHub.java` repose sur `p.getCustomName().contains("BedWars")`.
- **Risque potentiel** : Si un joueur malveillant ou un plugin renomme un villageois, il pourrait détourner l'interaction ou provoquer des erreurs. De plus, les scripts de reset utilisaient parfois des `kill @e[type=villager]` larges.
- **Action requise en Phase 6** : Utiliser des Scoreboard Tags stricts (`jfm_npc_bedwars`, etc.) ou des métadonnées persistantes (PersistentDataContainer) pour identifier les PNJ sans ambiguïté.

### Anomalie A6 : Moteur Hikabrain Monothread et Hardcodé
- **Constat** : Dans `JoyStickHub.java`, les scores Hikabrain (`hikaRedScore`, `hikaBlueScore`) sont stockés dans des champs entiers uniques au sein du plugin, et l'attribution des équipes se fait par le signe de l'axe Z (`loc.getZ() < 0`).
- **Risque potentiel** : Impossibilité totale de jouer plusieurs parties simultanées ou d'avoir plus de 2 joueurs sans écraser les scores. Aucun vrai système de lobby d'attente pour Hikabrain.
- **Action requise en Phase 5** : Implémenter un vrai gestionnaire de sessions avec ID de partie, UUID des joueurs, gestion d'équipes rouge/bleue explicite et reset de blocs par rollback.
