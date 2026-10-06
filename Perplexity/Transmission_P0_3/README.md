# JoyStick FM — Transmission Ciblée P0.3 (Candidat Validé & Menu Fusionné)

**Date :** 7 octobre 2026  
**Version candidate :** `1.5.3-player-menu-review`  
**Branche Git de transmission :** `docs/transmission-p03-2026-10-07`  
**Dépôt :** `Klemz-696/AP1-SISR-JoyStickFM`  
**Statut de validation :** `COMPILATION ET ROUTAGE CONSOLE ACCEPTÉS — RECETTE JOUEUR EN ATTENTE`

---

## 1. Contexte et Objectif de la Transmission

Conformément au document `Prompt_Agent_Transmission_Ciblee_P0_3.md` et à la note de synthèse `P0_3_Validation_Partielle_Et_Suite.md`, ce dossier rassemble **l'état exact et complet des fichiers sources et configurations utilisés lors de la recette P0.3**.

Cette transmission a pour but de fournir à Perplexity la référence faisant autorité pour préparer la Phase 1 (refonte BedWars/Rush, gestion des inventaires, cycle de vie et leave).

---

## 2. Inventaire des Fichiers Transmis

| Fichier | Emplacement dans cette transmission | Taille (octets) | SHA-256 | Source / Provenance locale |
|---|---|---|---|---|
| `JoyStickHub.java` | `DEPOT/src/JoyStickHub/src/main/java/fm/joystick/hub/JoyStickHub.java` | 21 010 | `3bb089afdb49c4f60ffc9868e5ca63405d87d4759d04f94e7d39e864d8bcacbf` | `scratch/recette_p0_3/JoyStickFM_P0_3/src/JoyStickHub/src/main/java/fm/joystick/hub/JoyStickHub.java` |
| `plugin.yml` | `DEPOT/src/JoyStickHub/src/main/resources/plugin.yml` | 277 | `9d50ca5b5294d658fef625bddddb19dd7269531d47938f93b8947013c8c82cad` | `scratch/recette_p0_3/JoyStickFM_P0_3/src/JoyStickHub/src/main/resources/plugin.yml` |
| `build_safe.py` | `DEPOT/src/JoyStickHub/build_safe.py` | 3 936 | `3e6125907068e5de5ec5ff0f090173c28194358f1afcdb5ec87d4056c58c09b4` | `scratch/recette_p0_3/JoyStickFM_P0_3/src/JoyStickHub/build_safe.py` |
| `items.yml` | `STAGING/data/plugins/ItemJoin/items.yml` | 1 480 | `84ff59c72cd07b06686264f343fd80c6c5a146fd19e9677e9eb0ac1ee9283b21` | `scratch/staging_p0_2/data/plugins/ItemJoin/items.yml` |
| `games.yml` | `STAGING/data/plugins/DeluxeMenus/gui_menus/games.yml` | 5 905 | `71fb5d29dfc1cc36bdc2fc98ac51a7b8a116657ca6a7128676c40750625674a6` | `scratch/staging_p0_2/data/plugins/DeluxeMenus/gui_menus/games.yml` |
| `BUILD_MANIFEST.json` | `PREUVES/BUILD_MANIFEST.json` | 10 150 | `09f903d5195beda11fa53cab3c93b5b9913c1b78431036fe4b3b54728225631a` | `scratch/recette_p0_3/JoyStickFM_P0_3/src/JoyStickHub/target/safe-build/BUILD_MANIFEST.json` |
| `INVENTAIRE_SHA256.csv` | `INVENTAIRE_SHA256.csv` | 1 310 | `bf5a5569fb91a25f1eb42732d203534ebe2c6e4f8fb72af251ea0cbb8d2cdc3b` | Généré lors de la collecte |
| `README.md` | `README.md` | — | — | Présent document |

---

## 3. Particularités Clés et Préservation des Intentions

### 3.1. Menu Fusionné DeluxeMenus (`games.yml`) — Nouveau Référentiel
- Le fichier `games.yml` inclus dans `STAGING/data/plugins/DeluxeMenus/gui_menus/games.yml` est le **menu complet fusionné** réellement chargé en staging.
- Il **conserve explicitement** les commandes de sortie de mini-jeux dans les slots de retour (`hub` en slot 4 et `quit_lobby` en slot 8) :
  - `[player] bh leave` (BlockHunt / Cache-Cache)
  - `[player] bw leave` (BedWars / Rush)
- Il intègre `register_command: true` (commande enregistrée : `menu`), permettant à la commande `deluxemenus:menu` d'ouvrir l'interface sous permission non-OP.
- La ligne de lore de la Survie Vanilla (slot 10) spécifie : `&7Tombes récupérables prévues ultérieurement (D5).`

### 3.2. Configuration ItemJoin (`items.yml`)
- `game-selector` possède `commands: []`, garantissant l'absence de conflit ou de double ouverture native.
- `JoyStickHub` est l'unique détenteur du déclenchement du menu et du feedback sonore.

### 3.3. Plugin JoyStickHub (`JoyStickHub.java` & `plugin.yml`)
- Commande exécutée pour l'ouverture du menu : `player.performCommand("deluxemenus:menu");`.
- Protection `AuthMeGate` (v3 via réflexion) : fail-closed si AuthMe absent, non initialisé ou joueur non authentifié.
- Recontrôle du joueur en ligne, du monde lobby et de l'authentification AuthMe au tick planifié.

---

## 4. Métriques Précises du Binaire JAR (Non Publié)

Conformément aux consignes de sécurité et d'hygiène de versionnement, aucun binaire JAR, aucune sauvegarde de monde et aucune base de données locale (AuthMe / LuckPerms) ne sont publiés sur le dépôt.

Les métriques exactes relevées sur l'artefact compilé localement sont les suivantes :

- **Nom du fichier JAR :** `JoyStickHub-1.5.3-player-menu-review.jar`
- **Taille réelle du fichier JAR sur disque (archive ZIP) :** **9 877 octets**
- **Empreinte SHA-256 du JAR :**  
  `2127b7dc8eb027bef21e825f826c74b20442acdbe9f661ae729884b7a6754524`
- **Compilateur :** `javac 25.0.2` (option `--release 25`, encodage `UTF-8`)
- **Détail interne des entrées de l'archive ZIP :**
  - `fm/joystick/hub/JoyStickHub$AuthMeGate.class` :
    - Taille décompressée : **3 618 octets**
    - Taille compressée : **1 894 octets**
  - `fm/joystick/hub/JoyStickHub.class` :
    - Taille décompressée : **15 073 octets**
    - Taille compressée : **7 351 octets**
  - `plugin.yml` :
    - Taille décompressée : **277 octets**
    - Taille compressée : **208 octets**
- **Cumul décompressé des classes/ressources :** **18 968 octets** *(la valeur brute 18 966/18 968 correspond à la somme décompressée du contenu, à ne pas confondre avec le fichier JAR final de 9 877 octets)*.
- **Cumul du flux compressé :** 9 453 octets.

---

## 5. Matrice des Tests Réellement Exécutés

| Élément | Preuve / Observation Staging | Statut Retenu |
|---|---|---|
| Compilation Safe JDK 25 | `javac 25.0.2`, retour code 0, journal sans erreur | **VALIDÉ** |
| Chargement Paper 1.21.4 | `[JoyStickHub] Loading server plugin JoyStickHub v1.5.3-player-menu-review` | **VALIDÉ** |
| Enregistrement Commande DeluxeMenus | `[DeluxeMenus] Registered command: menu for menu: games` | **VALIDÉ** |
| Routage Commande Console | Envoi de `deluxemenus:menu` renvoie `Menus can only be opened by players!` | **VALIDÉ** (atteint le handler joueur) |
| Configuration Groupe Default LuckPerms | Audit `luckperms:group/default` : aucun nœud explicite | **AUDITÉ** |
| Événements Client & Clic Boussole | Aucun joueur connecté en session de test | **RECETTE JOUEUR EN ATTENTE** |
| Vérification In-Game AuthMe | Absence de client authentifié physiquement | **RECETTE JOUEUR EN ATTENTE** |
| Déclenchement / Reset Mini-Jeux | Aucune partie lancée | **NON EXÉCUTÉ** |

---

## 6. Intégrité de la Production et de la Branche Principale

- **Aucune connexion à la production :** La VM de production (`10.30.0.22`), le conteneur (`minecraft_ap1`) et les volumes de données (`/opt/minecraft/data`) sont strictement intacts et n'ont subi aucune modification.
- **Branche `main` intacte :** Aucun commit ni push n'a été effectué sur la branche `main`. La présente transmission est isolée sur la branche dédiée `docs/transmission-p03-2026-10-07`.
- **Absence de secrets :** Aucun secret, mot de passe, token, ni adresse IP interne n'est présent dans les fichiers transmis.
