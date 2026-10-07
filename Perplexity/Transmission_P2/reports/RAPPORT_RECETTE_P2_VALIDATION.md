# JoyStick FM — Rapport de Clôture et Validation Recette Joueur P2
**Phase :** Phase P2 — Refonte Hub, Lobby Mini-Jeux et Parkour  
**Date de validation :** 7 octobre 2026  
**Auteur :** Agent Antigravity  
**Destinataire :** Équipe Projet JoyStick FM & Perplexity  
**Statut officiel :** **VALIDÉ PAR RECETTE JOUEUR IN-GAME**  
**Périmètre d'exécution :** Staging local isolé (`127.0.0.1:25566`) uniquement  
**Production (VM `10.30.0.22`, `/opt/minecraft/data`) :** **STRICTEMENT INTACTE ET NON TOUCHÉE**  
**Dépôt Git branche `main` :** **STRICTEMENT INTACT, AUCUN PUSH EFFECTUÉ**  

---

## 1. Synthèse Exécutive et Validation Joueur

La recette complète joueur in-game de la **Phase P2** a été exécutée et validée avec succès sur le serveur de staging local par le compte joueur non-OP (`Klemz_696`).

L'ensemble des objectifs fixés par le mandat P2 sont atteints :
1. **Navigation et Menus :** Navigation fluide via la boussole (`/games` ou clic-droit boussole), exécutée côté console (`[console] mv tp %player_name% ...`), accessible sans permissions d'administration pour les joueurs ordinaires. Les boutons des jeux non déployés (BedWars, Rush, BlockHunt, Survie) sont explicitement désactivés et inoffensifs (messages d'information clairs, aucune commande inconnue déclenchée).
2. **Anti-vide et Sécurité :** Fin définitive des boucles de rubberbanding. En cas de chute dans le vide sous le seuil critique (Y < 50 au Hub / Lobby, Y < 55 sur Hikabrain), la vélocité et la distance de chute sont immédiatement réinitialisées et le joueur est téléporté de façon stable au spawn sécurisé (avec sol plein et deux blocs d'air libres).
3. **Parkour Opérationnel :** Le parcours de saut du lobby mini-jeux fonctionne de bout en bout (départ plaque dorée, checkpoints intermédiaires plaques de pierre, retour instantané au dernier checkpoint en cas de chute, arrivée victorieuse sur le bloc d'émeraude avec sons et effets).
4. **PNJ d'Accueil Natifs :** Intégration de villageois natifs balisés (`jfm_npc`) sans dépendance à Citizens. Contrôle d'authentification AuthMe dynamique (fail-closed), protection totale contre tous les dégâts, persistance assurée par le forçage des chunks de spawn (`/forceload`).
5. **Affichage et Placeholders :** Expansion `Player` de PlaceholderAPI fonctionnelle. Variables brutes résolues (`%player_name%`, `%player_world%`, `%player_ping%`). Le statut des statistiques est honnêtement présenté comme « Statistiques de jeu : En cours de préparation (Phase P3 / Lot 7) ».
6. **PvP Spam Click Hikabrain :** Réduction drastique du cooldown d'attaque (attribut `GENERIC_ATTACK_SPEED = 100.0`) sur l'arène `hikabrain_jfm` avec sauvegarde et restauration systématique de l'attribut à la sortie du monde.

---

## 2. Inventaire des Fichiers et Empreintes Figées (SHA256)

L'ensemble des sources, binaires et configurations validés lors de cette recette P2 est figé dans le dossier d'archive local `scratch/recette_p2/` :

| Composant | Fichier Source / Staging | Emplacement Figé (`scratch/recette_p2/`) | Taille (octets) | Empreinte SHA256 |
|---|---|---|---|---|
| **Code Source Hub** | `scratch/src/fm/joystick/hub/JoyStickHub.java` | `src/JoyStickHub.java` | 41 675 | `0f20a62705685dc83d3c14983a54307cabab354362bd217d80498d303c0bfece` |
| **Binaire Déployé** | `scratch/staging_p0_2/data/plugins/JoyStickHub.jar` | `JoyStickHub-1.6.0-p2.jar` | 19 899 | `874b0e901ca734ed4ae2968243d9acf685e171ef78a95a36523a03c690ed529c` |
| **Menu des Jeux** | `.../DeluxeMenus/gui_menus/games.yml` | `configs/games.yml` | 5 993 | `105f178f3491a9117b3622de423a925349b995a916c31a432cdf7ca608670647` |
| **Objets d'Accueil** | `.../ItemJoin/items.yml` | `configs/items.yml` | 1 556 | `41ed2f693c37c82eb931406c036281300dfe0419cea52881119471397a9cbc11` |
| **Mondes Multiverse** | `.../Multiverse-Core/worlds.yml` | `configs/multiverse_worlds.yml` | 10 103 | `aa4e6cfc7f04e025ca9a5df3f1c121224833ac9caa36691259b9288cccaf763e` |
| **Groupes Inventaires** | `.../Multiverse-Inventories/groups.yml` | `configs/multiverse_inventories_groups.yml` | 878 | `2a08091606d7be2a1a36138d5e980fbf16622633065e8ae85501f7ff20570229` |
| **Spawn Essentials** | `.../Essentials/spawn.yml` | `configs/essentials_spawn.yml` | 109 | `0a71aa7f93ca970afabb207077cf31c15226feb04273f700e7d519fa76ea0849` |
| **Spawn AuthMe** | `.../AuthMe/spawn.yml` | `configs/authme_spawn.yml` | 198 | `8a3e4d87d71bf6bcd3e9dd4cef499e7aeec8ffbccdd18a75dcbc0b19aa166c0f` |
| **Manifeste des Cartes** | `.../phase2/P2_MAP_MANIFEST.json` | `P2_MAP_MANIFEST.json` | 2 152 | `842099d62d4b3d36ea4906ecb726dc06e1f3922265c58c159aabd694129d829b` |

---

## 3. Détail des Validations Techniques

### 3.1. Navigation & Menus (DeluxeMenus + ItemJoin)
- **Problème initial :** Les commandes `[player] mv tp ...` échouaient pour les joueurs non-OP dépourvus de permissions `multiverse.teleport.*`.
- **Solution appliquée :** Conversion des actions de téléportation en exécution console avec injection du placeholder :
  - Hub Central : `[console] execute in minecraft:hub_p2_candidate run tp %player_name% 0.5 65.0 0.5 0 0`
  - Lobby Mini-Jeux : `[console] mv tp %player_name% lobby_minijeux_p2_candidate`
  - Hikabrain : `[console] execute in minecraft:hikabrain_jfm run tp %player_name% 0.5 65.0 0.5 0 0`
- **Sécurisation des modes indisponibles :** BedWars, Rush, BlockHunt et Survie renvoient un simple message explicatif sans tenter d'exécuter de commande inexistante.

### 3.2. Mécanisme Anti-Vide et Sauvetage
- **Problème initial :** L'appel à `event.setCancelled(true)` dans `PlayerMoveEvent` réassignait le joueur à sa position précédente (`from`), laquelle était déjà sous le seuil du vide, annulant la téléportation et créant une boucle infinie de rubberbanding.
- **Solution appliquée :**
  - Suppression pure et simple de l'annulation d'événement.
  - Réinitialisation de la vélocité (`player.setVelocity(new Vector(0, 0, 0))`) et de la distance de chute (`player.setFallDistance(0f)`).
  - Téléportation au spawn vérifié (sol solide + 2 blocs libres) avec son `ENTITY_ENDERMAN_TELEPORT`.

### 3.3. PNJ d'Accueil Natifs
- **Architecture :** Villageois natifs sans IA (`NoAI: 1b`), invulnérables (`Invulnerable: 1b`), silencieux (`Silent: 1b`), balisés par `jfm_npc`.
- **Dispatching des interactions :** Écouteur `PlayerInteractEntityEvent` interceptant le clic droit :
  - Empêche l'ouverture de l'interface d'échange commercial.
  - Vérifie que le joueur est authentifié auprès d'AuthMe (fail-closed).
  - Déclenche l'action associée au tag spécifique (`jfm_npc_lobby` -> TP Lobby Mini-Jeux, `jfm_npc_hikabrain` -> TP Hikabrain, `jfm_npc_parkour` -> TP départ parkour, `jfm_npc_hub` -> TP Hub, `jfm_npc_menu` -> ouverture `/games`).

### 3.4. Parkour
- **Détection :** Détecteurs d'interaction sur plaques de pression physiques sans commande externe :
  - Départ : Plaque de pression dorée (`12.5, 64.0, 9.5`) -> chronomètre démarré.
  - Checkpoints : Plaques de pression en pierre (`12.5, 67.0, 26.5` et `12.5, 71.0, 42.5`) -> enregistrement du point de chute.
  - Chute : Chute sous Y=50 téléporte immédiatement au dernier checkpoint validé avec son et message informatif.
  - Arrivée : Bloc d'émeraude (`12.5, 73.0, 58.5`) -> son de victoire, feu d'artifice, temps affiché en chat.

---

## 4. Backlog des Améliorations Non Bloquantes (Délais et Finitions)

Conformément à la consigne, les points de confort et de finitions cosmétiques sont conservés dans un registre d'améliorations non bloquantes pour les phases ultérieures (Phase P6 — Finitions & Navigation ou Lot 7) :

1. **Orientation des PNJ (Yaw/Pitch) :** Ajustement au degré près de l'orientation du regard des villageois pour faire face précisément aux points d'arrivée des joueurs.
2. **Text Displays & Hologrammes :** Remplacement éventuel des noms au-dessus des villageois par des entités `text_display` 1.20+ avec ombrage et fond translucide personnalisé.
3. **Micro-délais & Sons contextuels :** Ajout de sons d'ambiance ou de particules légères à l'activation des plaques de checkpoint du parkour.
4. **Localisation multilingue :** Centralisation des messages textuels dans `messages.yml` pour le support multi-langues.

---

## 5. Dossier de Transmission pour la Phase P3 (Survie, Dimensions, Respawn)

### 5.1. État des Mondes Survie / Nether / End et Portails

| Monde / Dimension | Statut Staging Actuel | Statut Référence VM / Dépôt | Emplacement Fichiers | Risques et Points d'Attention pour P3 |
|---|---|---|---|---|
| **`survie` (Overworld)** | Non importé en staging (isolé) | Présent dans `/opt/minecraft/data` (VM) et `minecraft/data/...` | `minecraft/data/world/dimensions/minecraft/survie` (36 fichiers `.mca`) | **À PRÉSERVER STRICTEMENT**. Contient toutes les constructions réelles des joueurs. Ne jamais réinitialiser ni écraser par une génération vierge. |
| **`survie_nether`** | **ABSENT** | **ABSENT DU DISQUE** | N/A | Multiverse ne référence actuellement que `minecraft:the_nether` (dimension vanilla du monde par défaut). Aucune dimension `survie_nether` dédiée n'a été créée. |
| **`survie_the_end`** | **ABSENT** | **ABSENT DU DISQUE** | N/A | Idem Nether : seule `minecraft:the_end` existe sur le disque. Aucune dimension `survie_the_end` dédiée n'existe. |
| **Liaison Portails** | Non configurée | Non configurée | N/A | **AUCUN PLUGIN DE PORTAIL INSTALLÉ** (`Multiverse-NetherPortals` absent). Sans routage, l'allumage d'un portail en `survie` tente de lier le Nether vanilla `the_nether`, ce qui crée un conflit avec le groupe d'inventaires. |

### 5.2. Configurations de Respawn et Groupes d'Inventaires

1. **Multiverse-Inventories (`groups.yml`) :**
   - Le groupe `survie` regroupe `survie`, `survie_nether` et `survie_the_end` avec partage intégral (`shares: [all]`).
   - L'inventaire de Survie est **strictement étanche** vis-à-vis du groupe `hub` (`hub`, `lobby_minijeux`, `hub_p2_candidate`, `lobby_minijeux_p2_candidate`) et des 5 arènes mini-jeux.
2. **Gestion du Respawn (Décisions D1 / D5) :**
   - `Multiverse-Core/worlds.yml` pour `survie` : `respawn-world: survie`, `bed-respawn: true`, `anchor-respawn: true`.
   - `JoyStickHub.java` (lignes 807-829) : L'écouteur `onPlayerRespawn` préserve le respawn sur lit (`isBedSpawn()`) et sur ancre de réapparition (`isAnchorSpawn()`). En l'absence de lit ou d'ancre, le joueur réapparaît au spawn officiel du monde `survie` et son `GameMode.SURVIVAL` est garanti.
   - Système de tombes (Décision D5 - Option B) : Un fichier de configuration modèle existe dans `Perplexity/JoyStickFM_Production_Lots_0_a_7/Lot_3_Survie_et_Tombes/lot3_graves_config.yml` prévoyant une protection exclusive de 30 minutes. **Aucun plugin de tombes n'est actuellement déployé**. Le respawn reste 100% vanilla sans claim (Décision D1).
3. **Intégrité des Objets et Boussoles :**
   - L'item de navigation ItemJoin (`game-selector`) possède le drapeau `auto-remove` et n'est injecté que sur les mondes Hub/Lobby. Il disparaît automatiquement dès qu'un joueur pénètre en Survie.
   - `JoyStickHub.java` ne contient **aucune instruction de purge d'inventaire**. Les boussoles fabriquées par les joueurs en survie sont protégées.

### 5.3. Sources Actuelles de JoyStickHub
- **Emplacement du code :** `scratch/src/fm/joystick/hub/JoyStickHub.java`
- **Méthodes clés relatives à la Survie :**
  - `onWorldChange` (lignes 379-385) : Bascule immédiate en `GameMode.SURVIVAL` lors de l'entrée dans un monde dont le nom commence par `survie` (sauf si le joueur est en `CREATIVE` et possède la permission staff).
  - `onPlayerRespawn` (lignes 814-829) : Respect du lit et de l'ancre, redirection vers le spawn de `survie` et maintien du mode Survie.
  - Pas d'interférence avec les événements de minage, craft ou ramassage d'objets (préservation 100% vanilla).

### 5.4. Inventaire des Fichiers Disponibles vs Éléments Manquants pour P3

| Statut | Élément | Chemin / Référence | Action Requise en Phase P3 |
|---|---|---|---|
| **DISPONIBLE** | Dossier Monde Survie (Overworld) | `minecraft/data/world/dimensions/minecraft/survie` | Import propre en staging sous `survie` sans modifier la source. |
| **DISPONIBLE** | Source Java JoyStickHub v1.6.0-p2 | `scratch/src/fm/joystick/hub/JoyStickHub.java` | Base de travail pour les compléments de lifecycle P3. |
| **DISPONIBLE** | Configuration Multiverse-Inventories | `scratch/staging_p0_2/data/plugins/Multiverse-Inventories/groups.yml` | Groupe `survie` déjà déclaré et isolé. |
| **DISPONIBLE** | Modèle de configuration Tombes (D5) | `Perplexity/.../Lot_3_Survie_et_Tombes/lot3_graves_config.yml` | Base de référence si le système de tombes est activé. |
| **MANQUANT** | Mondes Nether et End Survie dédiés | N/A (non créés sur disque) | **Arbitrage requis** : Générer `survie_nether` et `survie_the_end` OU relier `the_nether`/`the_end` de façon contrôlée. |
| **MANQUANT** | Plugin de liaison de portails | `Multiverse-NetherPortals.jar` absent | À installer si des dimensions séparées `survie_nether`/`survie_the_end` sont créées. |
| **MANQUANT** | Binaire du plugin de Tombes | Aucun plugin de tombes présent dans `plugins/` | Choisir et installer le plugin de tombes validé si D5-Option B est maintenue. |
| **MANQUANT** | Mécanisme RTP (Random Teleport) | Aucun plugin RTP présent | Valider la commande `/rtp` ou script vanilla `spreadplayers`. |

---

## 6. Conclusion et Clôture P2

La Phase P2 est **clôturée avec succès** sur l'environnement de staging.  
Toutes les sources et configurations sont archivées et hashées.  
Aucune modification n'a été apportée à la production (`10.30.0.22`), au monde Survie, ni à la branche Git `main`.

La Phase P3 peut désormais être initiée sur ces bases stables.
