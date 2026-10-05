# JoyStick FM — Rapport d'Amélioration du Serveur Minecraft
**Date :** 5 octobre 2026  
**Auteurs :** Équipe Projet AP 1 (BTS SIO SISR) — JoyStick FM  
**Cible d'infrastructure :** Machine virtuelle `srv-minecraft` (`10.30.0.22`), conteneur Docker `minecraft_ap1` (PaperMC 26.2, Java 25 LTS)

---

## 1. Contexte & Objectifs

Dans le cadre du projet d'infrastructure **JoyStick FM** (AP 1 SISR), le serveur Minecraft constitue l'une des vitrines applicatives majeures hébergées au sein de la DMZ Interne. Initialement conçu comme un serveur Vanilla rudimentaire confronté à de lourdes limites techniques (génération anarchique, saccades, permissions inexistantes, absence de menu de navigation), un chantier complet de modernisation et de sécurisation a été mené.

Le présent rapport dresse le bilan exhaustif des améliorations techniques déployées à ce jour, analyse de manière critique les **problèmes et manques remontés lors des tests en jeu**, et expose la feuille de route pour finaliser l'expérience utilisateur.

---

## 2. Bilan des Améliorations Réalisées (Acquis Techniques)

```mermaid
graph TD
    A["Infrastructure PaperMC 26.2 / Java 25"] --> B["Réseau : Destination NAT OPNsense (25565)"]
    A --> C["Hub Céleste Void (Y=64, Midi permanent)"]
    A --> D["Navigation : Boussole ItemJoin + GUI DeluxeMenus"]
    A --> E["Survie Procédurale (Chunky 16k chunks + Claims)"]
    A --> F["Mini-Jeux : BedWars & BlockHunt"]
    A --> G["Cloisonnement des Inventaires (Multiverse-Inventories)"]
```

### 2.1. Moteur, Performance & Sécurité
- **Migration sous PaperMC 26.2 (build 129)** : Abandon du serveur vanilla au profit d'un moteur asynchrone hautement optimisé, compilé sous **Java 25 LTS (Temurin)** avec 3 Go de mémoire RAM allouée.
- **Redirection de port OPNsense (Destination NAT)** : Création d'une règle de transfert de port WAN (`192.168.101.37:25565` vers DMZ Int `10.30.0.22:25565`) avec règle de filtrage automatique, garantissant l'accès des élèves du lycée sans exposition du port d'administration RCON (25575).
- **Gouvernance des accès (LuckPerms)** : Suppression du wildcard destructeur `'*'` pour les administrateurs, mise en place de permissions granulaires par monde (`luckperms.*`, `multiverse.*`, `deluxemenus.*`, `essentials.*`).
- **Sauvegardes à froid automatisées** : Intégration dans le script d'orchestration `deploy_gamemodes.sh` d'une archive `tar` immuable stockée dans `/opt/minecraft/gamemodes-backups/` avant toute écriture en production.

### 2.2. Hub Principal dans le Vide
- **Génération d'un Hub Void à Y=64** : Remplacement de l'ancien monde plat par une plateforme céleste personnalisée de 13 448 blocs, éliminant tout décalage d'horizon avec le sol plat.
- **Verrouillage environnemental** : Cycle jour/nuit et météo figés (`minecraft:advance_time false` à 6 000 ticks pour un midi éternel, `minecraft:advance_weather false` sur soleil).
- **Mode Aventure Forcé** : Règle `force-gamemode=true` empêchant toute altération, casse ou placement de blocs par les joueurs au hub.

### 2.3. Ergonomie & Navigation Joueur
- **Boussole interactive (`ItemJoin`)** : Attribution automatique au slot 4 de la barre d'action de l'objet `✦ MENU DES JEUX ✦`, incassable et inamovible, restreint au monde `hub`.
- **Menu graphique (`DeluxeMenus`)** : Interface coffre 27 slots accessible par clic droit ou `/menu`, avec routage direct vers chaque mode de jeu.
- **Scoreboard néon (`TAB`)** : Affichage permanent des métriques du joueur (Pseudo, Rang LuckPerms, Ping, Joueurs connectés, Monde actif, Branding JoyStick FM).

### 2.4. Survie Naturelle Pré-générée & Claims
- **Monde `survie` procédural** : Création d'un monde naturel avec seed `6962026`, difficulté `NORMAL` et PvP actif.
- **Pré-génération totale Chunky** : Génération de **16 129 chunks** (rayon de 1 000 blocs) en 3 minutes et 57 secondes, éliminant totalement les lags d'exploration.
- **Protection des parcelles (`GriefPrevention`)** : Claims actifs à la pelle en or, sécurisation automatique du premier coffre posé par un joueur et protection anti-vol (`PreventTheft=true`).
- **Téléportation aléatoire `/rtp`** : Règle vanilla `/spreadplayers` sécurisée, permettant aux explorateurs de se disperser dans la nature en toute sécurité.

### 2.5. Cloisonnement Étanche des Inventaires
- Configuration de 6 groupes distincts dans `Multiverse-Inventories` (`hub`, `survie`, `bedwars`, `blockhunt`, `legacy_world`, `legacy_minijeux`).
- Neutralisation de la purge aveugle d'ItemJoin (`Clear-Items: Join: false, World-Switch: false`), garantissant que les équipements acquis en Survie ne sont jamais effacés lors d'un retour au Hub.

---

## 3. Analyse Critique des Problèmes Actuels & Retours Utilisateur

Malgré les avancées techniques majeures, les tests en conditions réelles révèlent trois faiblesses d'ergonomie et de contenu qui nuisent à l'expérience de jeu :

### ❌ Problème 1 : Absence de bordures invisibles efficaces au Spawn
* **Constat terrain :** Les joueurs apparaissant sur la plateforme du hub peuvent s'approcher du bord et tomber dans le vide sidéral s'ils s'éloignent du centre, entraînant une chute infinie ou une mort punitive au lobby.
* **Cause technique :** Si une rangée de blocs de barrière a été posée au périmètre extérieur de la grande plateforme, la zone immédiate autour du point d'apparition exact n'est pas ceinturée par une bordure haute (cage transparente). De plus, aucun système de détection de chute dans le vide (`void-fallback`) n'est actuellement configuré pour rattraper automatiquement un joueur en chute libre sous `Y=50` et le ramener instantanément à son point de spawn.
* **Impact :** Mauvaise première impression pour les nouveaux arrivants et frustration en cas de mauvaise manipulation.

---

### ❌ Problème 2 : Absence de plateforme dédiée pour le Lobby des Mini-Jeux
* **Constat terrain :** Lorsqu'un joueur souhaite s'adonner aux mini-jeux, il est actuellement téléporté soit dans une file d'attente suspendue dans le vide (`Y=100` au-dessus de l'arène BedWars/BlockHunt), soit vers l'ancien monde `minijeux` qui était un monde plat non scénarisé. Il n'existe pas de "Lobby des Mini-Jeux" convivial où les joueurs peuvent se regrouper avant de lancer un match.
* **Cause technique :** L'architecture actuelle passe directement du Hub général à l'arène de jeu via la commande `/bw join` ou `/bh join`. Il manque un nœud intermédiaire : un **monde lobby dédié aux mini-jeux** (`lobby_minijeux`), équipé d'hologrammes d'explication, de classements et de PNJ interactifs cliquables.
* **Impact :** Manque d'immersion, sentiment d'isolement avant le début des parties et absence d'un espace d'observation pour les spectateurs non engagés dans un match.

---

### ❌ Problème 3 : Modes de jeux rapides très demandés manquants (Hikabrain, Rush, etc.)
* **Constat terrain :** Le serveur propose actuellement du BedWars standard (4 équipes de 2) et du Cache-Cache (BlockHunt). Cependant, la cible lycéenne et étudiante privilégie très largement les modes de jeu PvP compétitifs, rapides et nerveux en 1v1 ou 2v2 :
  - **Rush** : Version accélérée du BedWars avec ponts en grès, bâton knockback, pioches efficacité et lits rapprochés (matchs de 3 à 7 minutes).
  - **Hikabrain** : Duel 1v1 intense sur une passerelle suspendue étroite (1 bloc de large), où chaque joueur dispose d'un bâton de recul, de blocs de grès et d'une épée pour marquer des points dans le portail adverse (matchs de 2 à 5 minutes).
* **Cause technique :** Les plugins actuels (`ScreamingBedWars 0.2.44` et `BlockHunt 0.2.1`) ont été paramétrés pour des formats d'équipes de taille moyenne. Aucun profil d'arène Rush spécifique ni plugin de duel Hikabrain n'a encore été injecté dans la configuration de production.
* **Impact :** Faible rejouabilité pour deux joueurs seuls voulant s'affronter rapidement en duel pendant les pauses.

---

## 4. Cadre des Six Décisions Techniques Validées (D1 à D6)

Suite aux arbitrages soumis à l'équipe projet, les six choix techniques fondamentaux ont été formellement validés et verrouillés pour régir la suite du déploiement :

| Réf. | Domaine | Décision retenue | Justification & Implémentation PaperMC 26.2 |
| :--- | :--- | :--- | :--- |
| **D1** | **Barème des claims (Survie)** | **Pas de claim (Survie 100% simple & vanilla pure)** | Suppression totale des restrictions de parcelles dans `plugins/GriefPreventionData/config.yml` (`Claims.Mode.survie: Disabled`). Les joueurs profitent d'une expérience de survie coopérative classique sans contrainte de pelle en or. |
| **D2** | **Politique des comptes & Auth** | **Option A (online-mode=false + Authentification locale)** | Maintien de l'accessibilité aux élèves sans compte payant officiel, tout en installant un module d'authentification robuste (`AuthMeReloaded` / chiffrement SHA256 avec `/register` et `/login`). Protection absolue des comptes OP/administrateurs et des inventaires contre l'usurpation de pseudo. |
| **D3** | **BlockHunt : Rôle à l'élimination** | **Option C (Spectateur permanent jusqu'à la fin du match)** | Lorsqu'un joueur caché est découvert et éliminé, il passe instantanément en mode spectateur jusqu'à l'issue de la partie. Il ne réapparaît pas en chercheur/chasseur secondaire, garantissant une fin de manche claire et équilibrée. |
| **D4** | **Référence FunCraft : Rush & Hikabrain** | **Option A (Fidèle à l'esprit historique FunCraft 2016–2018)** | **Rush (1v1 & 2v2) :** Lits destructibles (pioche/TNT), ponts en grès à faible coût, bâtons knockback, générateurs accélérés bronze/or/fer, propulsions TNTFly autorisées et tolérées par l'anticheat `GrimAC`.<br>**Hikabrain (1v1) :** Pont suspendu en grès de 1 bloc de large (Y=64, 40 blocs), objectif = franchir la ligne pour cliquer/toucher le lit adverse et marquer 1 point, victoire au premier à **5 points**, réinitialisation instantanée du pont et du kit à chaque point marqué. |
| **D5** | **Survie : Gestion des Tombes** | **Option B (Tombe verrouillée 30 min puis déverrouillée au public)** | À la mort en Survie, une tombe physique sécurise le stuff et les coordonnées sont envoyées au joueur dans le chat. Le joueur dispose d'une période de grâce de **30 minutes** exclusive ; au-delà, la tombe devient pillable par n'importe quel joueur (mécanique de récupération équitable). |
| **D6** | **Classements & Affichage Lobby** | **Option A (Stats personnelles au menu & Top Parkour physique)** | Les statistiques personnelles (victoires, temps, morts) sont consultables en privé dans le menu graphique `/menu`. Le **seul classement public affiché physiquement au Lobby** est le **Top Parkour** (hologramme chronométré), évitant la toxicité des classements PvP compétitifs. |

---

## 5. Plan d'Action Opérationnel par Lots (Lots 0 à 7)

```mermaid
graph TD
    Lot0["Lot 0 : Audit, Staging & Sécurisation"] --> Lot2["Lot 2 : Sécurisation Hub & Création Lobby Mini-Jeux"]
    Lot2 --> Lot1["Lot 1 : Stabilisation BedWars & BlockHunt Spectateur"]
    Lot1 --> Lot3["Lot 3 : Survie Pure & Module de Tombes 30 min"]
    Lot3 --> Lot4["Lot 4 : Mode Rush FunCraft 1v1 & 2v2"]
    Lot4 --> Lot5["Lot 5 : Mode Hikabrain au Lit (5 points)"]
    Lot5 --> Lot6["Lot 6 : Menus, PNJ, Portails & Navigation"]
    Lot6 --> Lot7["Lot 7 : Tests Solo/Duo, Recette & Documentation"]
```

### Lot 0 — Staging, Intégrité & Sauvegardes
- Sauvegarde à froid par archive tar horodatée dans `/opt/minecraft/gamemodes-backups/`.
- Maintien du port forwarding OPNsense WAN `192.168.101.37:25565` vers `10.30.0.22:25565`.
- Heap JVM dimensionné à 3 Go RAM avec headroom système.

### Lot 1 — Stabilisation BedWars & BlockHunt
- Validation de l'arène BedWars `jfm_duo` (4 équipes de 2).
- Blocage du repop chasseur dans BlockHunt (Option C) : joueur éliminé bascule immédiatement en spectateur permanent.

### Lot 2 — Sécurisation Hub & Création du Lobby Mini-Jeux
- **Sécurisation Hub (`hub`)** :
  - Garde-corps de bordures invisibles (`barrier`) de 3 blocs de haut sur le périmètre de la plateforme Y=64.
  - Système de rattrapage anti-chute automatique : tout joueur franchissant `Y < 50` est retéléporté au spawn `(0.5, 65, 0.5)` sans vélocité résiduelle ni dégât.
- **Monde `lobby_minijeux`** :
  - Création du monde Void dédié via `VoidGen` (`mv create lobby_minijeux normal -g VoidGen`).
  - Plateforme circulaire néon stylisée JoyStick FM (quartz, béton violet/cyan, balise centrale).
  - 4 stations d'accueil thématisées : BedWars (Nord), Hikabrain (Sud), BlockHunt (Est), Portail Hub (Ouest).

### Lot 3 — Survie Pure & Système de Tombes
- Application de **D1** : `Claims.Mode.survie: Disabled` dans `GriefPreventionData/config.yml`.
- Application de **D5** : Configuration de la protection exclusive de 30 minutes sur les tombes mortuaires, avant ouverture au pillage libre.

### Lot 4 — Mode Rush FunCraft (1v1 & 2v2)
- Monde `rush_jfm` avec deux bases flottantes séparées par 30 blocs de vide.
- Arènes `rush_1v1` et `rush_2v2` injectées dans ScreamingBedWars : grès pas cher, marchands PNJ dédiés, bâton de recul, TNT et tolérance TNTFly anticheat.

### Lot 5 — Mode Hikabrain au Lit Adverse (1v1)
- Monde `hikabrain_jfm` : passerelle de 1 bloc de large en grès suspendue à Y=64 entre deux bases distantes de 40 blocs.
- Mécanique FunCraft : toucher le lit ennemi rapporte 1 point. Premier à 5 points remporte le duel.
- Réinitialisation instantanée du pont et attribution du kit (épée fer, bâton KB, grès, 2 pommes d'or).

### Lot 6 — Menus Graphiques, PNJ & Routage
- Mise à jour du menu DeluxeMenus (`/menu`) avec 8 entrées optimisées (Survie pure sans claim, Lobby Mini-Jeux, BedWars 4x2, Rush 1v1/2v2, Hikabrain 1v1, BlockHunt, Statistiques privées, Retour Hub).
- Cloisonnement d'inventaires `Multiverse-Inventories` étendu à `lobby_minijeux`, `rush_jfm` et `hikabrain_jfm`.

### Lot 7 — Authentification Locale, Recette & Finition
- Application de **D2** : Module `AuthMeReloaded` / mot de passe chiffré SHA256 pour sécuriser les comptes tout en conservant `ONLINE_MODE=FALSE`.
- Application de **D6** : Mise en place du parcours Top Parkour au Hub avec affichage chronométré.

---

## 6. Conclusion & État d'Avancement

Avec la validation des décisions D1 à D6 et la préparation complète des scripts procéduraux (`generate_minigames_lobby.py`, `generate_rush_arena.py`, `generate_hikabrain_arena.py`, `apply_decisions_d1_d6.py`) et du bundle de configuration (`verified_bundle`), le serveur Minecraft JoyStick FM dispose d'un plan d'exécution sans faille, prêt à être déployé pour offrir une expérience multijoueur complète et fidèle aux attentes des élèves et de l'établissement.
