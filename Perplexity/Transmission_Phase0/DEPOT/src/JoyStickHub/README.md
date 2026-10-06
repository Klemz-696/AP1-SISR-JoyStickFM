# JoyStickHub — Plugin Spigot/PaperMC JoyStick FM (v1.5.0)

Plugin officiel natif développé sur-mesure pour le serveur Minecraft **JoyStick FM** (PaperMC 26.2 / 1.20+).

## Fonctionnalités principales

1. **Menu des Jeux par Boussole** :
   - Clic-droit avec la boussole (`COMPASS`) ouvre directement le menu DeluxeMenus (`/dm open games` ou `/menu`).
   - Interception prioritaire (`EventPriority.LOWEST`) désactivant toute téléportation sauvage `/jumpto` de WorldEdit.
   - Retrait automatique de la boussole dans le monde `survie` pour ne pas encombrer l'inventaire des joueurs.

2. **PNJ Interactifs du Lobby des Mini-Jeux** :
   - Écoute les clics-droits (`PlayerInteractEntityEvent`) sur les villageois nommés.
   - Routage automatique selon le nom du PNJ :
     - **BedWars** : `/bw join jfm_duo`
     - **BlockHunt** : `/bh join jfm_retro`
     - **Rush FunCraft** : `/bw join rush_1v1`
     - **Hikabrain** : `/mv tp hikabrain_jfm`
     - **Retour Hub** : `/spawn`
   - Sons immersifs et messages de confirmation immédiats.

3. **Protection Intégrale des Lobbies & Gamemode Strict** :
   - Annulation stricte du cassage et placement de blocs (`BlockBreakEvent`, `BlockPlaceEvent`) dans `hub` et `lobby_minijeux` pour les joueurs hors Créatif.
   - Forçage automatique du mode Aventure (`ADVENTURE`) à l'arrivée dans `hub` et `lobby_minijeux`.
   - Protection totale contre les chutes dans le vide (`VOID`) et dégâts de chute (`FALL`).

4. **Gestion du Mode Survie & Lits** :
   - Préservation des respawns de lits et ancres de réapparition dans `survie` (les joueurs ne sont pas éjectés au spawn central du hub lors d'une mort en survie).
   - Mode Survie (`SURVIVAL`) restauré automatiquement.

5. **Mini-Jeu Hikabrain Intégré** :
   - Détection des points lorsqu'un joueur saute dans le portail adverse.
   - Sons de victoire, message broadcast et téléportation automatique au spawn d'arène.

---

## Compilation

### Option 1 : Via Python (rapide, sans Maven)
```bash
python build.py
```

### Option 2 : Via Maven
```bash
mvn clean package
```
Le fichier JAR produit est déployé dans :
`Perplexity/JoyStickFM_Production_Lots_0_a_7/JoyStickHub.jar` et sur le serveur `/opt/minecraft/data/plugins/JoyStickHub.jar`.
