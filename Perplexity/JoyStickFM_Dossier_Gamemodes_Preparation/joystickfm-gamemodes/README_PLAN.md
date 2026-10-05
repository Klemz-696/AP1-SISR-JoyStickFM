# JoyStickFM — Plan de résolution des modes Minecraft et contrat d’automatisation

Date : 5 octobre 2026. Statut : dossier de préparation, pas déploiement effectué ni arènes certifiées jouables.

## 1. Résultat de la consultation du projet

Le lien raw fourni n’a pas pu être récupéré. Le connecteur GitHub a confirmé le fichier puis a permis de lire sa section Minecraft dans le diff du commit `f96193ee9d74a03a607701df545aae00a0b04481`, daté du 05/10/2026 à 13:14:14 UTC. Il a également permis de lire `scripts/setup_minecraft_experience.sh` et les changements de documentation de la séance 05. Ce n’est pas un accès à la VM ni une vérification de ses fichiers actuels.

Le document confirme Paper 26.2 build 129, Java 25, conteneur `minecraft_ap1`, `TYPE=CUSTOM`, `CUSTOM_SERVER=paper.jar`, mémoire `3G`, mode Adventure global et difficulté Peaceful globale, hub Void, 22 plugins et menus initiaux vers `world`, `minijeux` et `bh join`.

Paper 26.2 est une ligne de version actuelle distincte de Minecraft 1.21.x ; ne pas chercher systématiquement des exemples « 1.21 » pour ce serveur. Vérifier `version` sur le serveur avant de choisir des JARs, noms de gamerules ou un format de monde. Ne pas remplacer le moteur ni les caches Paperclip/Mojang pour résoudre les mini-jeux.

Les versions/forks/auteurs exacts de BedWars et BlockHunt ne sont pas indiqués. Une liste `plugins` ne suffit pas à choisir leurs formats d’arène. Aucun monde d’arène, schématique, fichier d’arène complet ou jeu de coordonnées validé n’a été trouvé dans les éléments consultés. Ne pas inventer un `arenas.yml` commun à tous les plugins portant ce nom.

## 2. Corrections prioritaires dans l’existant

- Ne pas relancer `setup_minecraft_experience.sh` en production : sa version consultée écrit `menus:` au lieu de `gui_menus:`, des anciennes destinations et accorde `'*'` au groupe admin, alors que la documentation décrit des corrections manuelles ultérieures.
- Ne pas utiliser `reload confirm` pour ajouter ou remplacer des JARs. Paper recommande un redémarrage ; les reloads de configuration propres à un plugin ne sont utilisables que si celui-ci les documente.
- `Clear-Items: Join: true` doit être audité et limité au hub. Une purge globale à la connexion peut entrer en conflit avec la sauvegarde de l’inventaire survie. Ne jamais lancer un `clear` avant d’avoir identifié et sauvegardé le profil courant.
- Le mode Adventure et la difficulté Peaceful peuvent être conservés au hub, mais doivent être remplacés par des propriétés par monde pour la Survie et le gameplay BedWars. Le mode Adventure n’est pas une preuve de protection absolue contre tous les dégâts ou interactions.
- Le Compose consulté publie aussi le port RCON sur la VM et contient un secret RCON statique. Vérifier l’exposition réelle et prévoir rotation/restriction avec l’utilisateur ; ne pas reproduire le secret dans un nouveau livrable. `docker exec ... rcon-cli` ne nécessite pas de publier RCON aux joueurs.
- La documentation utilise `ONLINE_MODE=FALSE`. Sans dispositif d’identité supplémentaire, ne pas présenter un pseudo, une liste blanche ou LuckPerms comme preuve d’authentification du joueur. Présenter la migration ou un mécanisme adapté, sans changer silencieusement les identités/profils existants.
- Des secrets ont été observés dans des documents du dépôt. Les traiter comme sensibles ; les faire retirer et renouveler s’ils sont réellement utilisés. Ne pas les recopier dans les rapports.
- `chown -R srv-minecraft:srv-minecraft` n’est correct que si l’UID/GID de ce compte correspond au processus Docker qui écrit les données. Le script historique utilise `1000:1000`. Auditer puis aligner les IDs ; ne pas appliquer un chown global aveugle.

## 3. Phase d’audit automatisable

Exécuter manuellement ou par l’agent habituel `audit_gamemodes.sh` sur la VM. Il ne modifie pas les fichiers de jeu, ne recharge pas les plugins et ne redémarre pas le serveur. Il lit les versions RCON, les descripteurs `plugin.yml`/`paper-plugin.yml` des JARs, leurs SHA256, les mounts Docker et les seules variables d’environnement sélectionnées sans secret RCON.

Conserver le rapport en privé et le relire avant partage. Les fichiers de configuration réels de BedWars/BlockHunt doivent ensuite être inspectés par l’agent, avec masquage des éventuels secrets : le script d’audit ne les publie pas automatiquement.

Commande de rapport :

```bash
bash audit_gamemodes.sh > gamemodes-audit.txt 2>&1
```

Livrable bloquant pour les adaptateurs : auteur, `main`, version, commandes déclarées, dépendances et SHA256 de BedWars/BlockHunt, documentation correspondant à ces versions, exemples d’arènes générés par ces mêmes versions.

## 4. Architecture de mondes proposée

| Monde | Usage | Mode/autorité | Inventaire |
|---|---|---|---|
| hub | Hub Void actuel, conservé | Adventure et protections lobby | Profil lobby : boussole seulement |
| survie | Overworld naturel | Survival, difficulté normale | Groupe Survie persistant |
| survie_nether | Nether Survie facultatif | Survival | Même groupe Survie |
| survie_the_end | End Survie facultatif | Survival | Même groupe Survie |
| bedwars_jfm | Arène 4 équipes de 2 | Cycle de partie BedWars | Groupe propre + coordination plugin |
| blockhunt_jfm | Village rétro | Cycle de partie BlockHunt | Groupe propre + coordination plugin |
| world/minijeux | Anciens mondes plats | Archivés/non accessibles aux joueurs après migration | Profils existants préservés |

Ne pas supprimer `world`, qui peut contenir des données primaires du serveur, pour créer la Survie. Créer `survie` parallèlement puis changer les destinations. Ne pas copier des dossiers de mondes sous un emplacement supposé : vérifier les mounts, les propriétés Multiverse et les `level.dat` réels. Paper récent peut avoir une disposition différente des anciens exemples 1.21.

## 5. A — Survie naturelle

### 5.1 Création non destructive

Les commandes suivantes utilisent la syntaxe Multiverse actuelle, à confirmer par `mv help` pour la version installée. Elles doivent être exécutées une fois, après vérification que le monde `survie` n’existe pas déjà. Aucun générateur VoidGen et aucun world-type flat.

```bash
docker exec -i minecraft_ap1 rcon-cli -- 'mv create survie normal --world-type normal --seed 6962026'
docker exec -i minecraft_ap1 rcon-cli -- 'mv modify survie set gamemode survival'
docker exec -i minecraft_ap1 rcon-cli -- 'mv modify survie set difficulty normal'
```

La seed `6962026` est un choix proposé, pas une seed déjà observée. Vérifier l’absence de générateur global dans `bukkit.yml` pour ce monde et la génération effective de terrain naturel, structures et ressources. L’existence de mobs et de villages ne prouve pas à elle seule une génération naturelle.

Nether/End facultatifs : les créer avec les environnements `nether` et `the_end`, puis configurer explicitement les liaisons de portails avec un mécanisme compatible. Ils ne sont pas automatiquement reliés à la Survie par leur seul nom. Multiverse-NetherPortals ne figure pas dans la liste fournie.

### 5.2 Pré-génération

Proposition initiale : rayon de 1 000 blocs, bordure correspondante à discuter ; une tâche à la fois sur la VM à 3 Go. C’est une taille de démarrage, pas une garantie de performances.

```bash
docker exec -i minecraft_ap1 rcon-cli -- 'chunky world survie'
docker exec -i minecraft_ap1 rcon-cli -- 'chunky center 0 0'
docker exec -i minecraft_ap1 rcon-cli -- 'chunky radius 1000'
docker exec -i minecraft_ap1 rcon-cli -- 'chunky start'
```

Surveiller mémoire, espace disque, progression et MSPT. `chunky pause survie` suspend proprement la tâche si nécessaire. Le succès de `chunky start` ne signifie pas que la pré-génération est terminée. Vérifier les conditions de mise en pause du serveur vide.

### 5.3 Claims et RTP

GriefPrevention doit être actif en mode Survival sur `survie`, et désactivé dans les arènes pour ne pas empêcher les actions BedWars/BlockHunt. Les protections du hub doivent rester indépendantes. Le premier coffre d’un nouveau joueur peut déclencher un petit claim automatique ; la pelle en or sert à créer/redimensionner ses claims. La protection des coffres s’applique aux claims et ne doit pas être annoncée comme protection globale de tout coffre non revendiqué.

Valeurs proposées : 100 blocs initiaux, 100 blocs/heure, rayon automatique de coffre 4 et `PreventTheft=true`, à valider dans la configuration réellement générée. Ne pas reconstruire un fichier complet avec des clés issues d’une autre version : fusion YAML contrôlée à partir du fichier actuel, sans perdre claims/stockage/messages.

Aucun plugin RTP ne figure explicitement dans la liste. Ajouter un plugin compatible et versionné, ou développer une petite commande serveur avec une vraie recherche de lieu sûr. Le RTP doit vérifier : monde cible, bordure, hauteur, eau/lave/dangers, place pour les pieds et la tête, claims, chargement des chunks, cooldown et nombre maximal d’essais. Ne pas utiliser un `/tp` vers une coordonnée aléatoire à Y=64. Un clic Survie peut téléporter au spawn existant ; RTP accessible ensuite ou première entrée RTP selon choix utilisateur. Ne pas annoncer `/rtp` disponible avant installation/validation.

### 5.4 Mort et état

L’utilisateur demande un retour au hub sans perte d’état. Proposition : conservation explicite de l’inventaire/XP Survie à la mort, puis retour au hub et restauration à l’entrée suivante dans la Survie. Cela change la règle vanilla de mort : faire confirmer le choix plutôt que prétendre que groupes.yml le réalise automatiquement. Retours manuels : sauvegarder le profil Survie avant de charger le hub. Ne pas effacer les profils en cas de problème.

## 6. B — Arène BedWars réellement reproductible

### 6.1 Ne pas associer une map inconnue à des coordonnées inventées

Une URL ZIP ne suffit pas : fixer auteur/licence, URL de référence et téléchargement direct, SHA256, format, origine de collage, rotation et coordonnées vérifiées. Une map ne contient pas automatiquement la configuration de plugin correspondante. Certains plugins enregistrent aussi régions, équipes, bornes, consommables, reset et shops dans plusieurs fichiers.

Aucune ressource téléchargée n’a été validée ici. Le présent dossier n’annonce donc pas de map tierce prête à jouer. Deux chemins possibles :

1. Choisir une map libre, inspecter son contenu et produire son manifeste d’arène automatiquement ; sans inspection, pas de coordonnées certifiées.
2. Générer une petite arène originale et symétrique par script/API. C’est la recommandation pour éliminer dépendances de téléchargement et construction manuelle.

### 6.2 Géométrie proposée, pas arène déjà construite

`arena_manifest.design.json` contient une conception de quatre îles de 25×25 blocs à Y=64, au nord/est/sud/ouest à distance 64 ; île centrale de 21×21 ; quatre îles diamant de 9×9 aux coordonnées diagonales ±30 ; lobby d’attente au-dessus à Y=100.

Pour l’équipe rouge au nord : centre `(0,64,-64)`, spawn au-dessus `(0,65,-64)`, lit pied `(0,65,-68)` et tête `(0,65,-69)`, générateur `(0,65,-60)`, shop `(-4,65,-64)` et upgrades `(4,65,-64)`. Les autres équipes sont des rotations calculées et consignées dans le JSON. Vérifier collisions, sols et orientations dans la construction.

Cette géométrie n’est pas le YAML de BedWars. L’agent devra produire le monde, les moitiés de lits correctes et un fichier natif conforme au plugin identifié, à partir de la même source de coordonnées.

### 6.3 Génération et parties

Construire depuis une même définition de géométrie : petits `fill`/`setblock`, schématique produite automatiquement, API WorldEdit/Paper ou outil équivalent compatible. Le contexte de dimension de chaque commande doit être identifié, pas supposé d’après le nom du dossier. Ne pas utiliser WorldEdit depuis RCON comme si la console possédait automatiquement une sélection et un monde de joueur.

Les PNJ shop et générateurs de ressources doivent être créés/gérés par BedWars, pas de simples villageois et blocs décoratifs sans logique. Prévoir achat, drops, upgrades, détection des deux moitiés du lit, zone de construction, limites, gestion des équipes, lobby d’attente, minimum de joueurs, victoire et reset depuis un template immuable.

Le bouton DeluxeMenus doit exécuter la commande de join de l’arène, pas `mv tp minijeux`. Le clic inscrit dans la file et la partie démarre selon son minimum de joueurs ; « immédiat » ne signifie pas démarrer un match solo incapable de produire une victoire normale. Configuration proposée : 4 équipes de 2, maximum 8, minimum à définir pour les tests puis la production.

### 6.4 Respawn et sorties

BedWars doit rester l’autorité du respawn de match : lit intact => respawn équipe ; lit détruit => élimination/spectateur selon plugin. Ne pas imposer une règle universelle « toute mort au hub ». Retour hub après leave, fin de partie ou abandon traité par le plugin. `/spawn` pendant un match doit appeler leave avant le téléport, sans créer un joueur fantôme ni exporter son kit.

## 7. C — Cache-cache / BlockHunt

Conception proposée : village rétro de 81×81 à Y=64, six petites maisons avec accès traversants, ruelles et accessoires cohérents avec les blocs de déguisement. Origine et spawn cachés `(0.5,65,0.5)` ; spawn chasseurs `(0.5,65,-34.5)` ; attente séparée `(0.5,101,0.5)`.

Le JSON joint donne maisons, limites et palette proposée. Le monde et le YAML natif doivent être générés ensemble après identification du plugin. Vérifier si la version exige régions, lobby, nombre de joueurs, palette de blocs, kits, commandes d’activation ou des fichiers séparés.

Configurer temps de cache initial, relâchement des chasseurs, règles de conversion/élimination, annonce de victoire, spectateurs, reset et restitution d’état. Les durées 20 s de cache et 300 s de partie sont proposées, pas validées. Les faux blocs et les transformations LibsDisguises ne sont pas des constructions de joueurs à conserver. Vérifier la compatibilité de LibsDisguises, ProtocolLib et packetevents avec Paper 26.2 sans prendre leur simple présence comme preuve de fonctionnement.

Aucune mort en cours de match ne doit contourner la logique BlockHunt. Le retour global au hub s’applique après sortie propre, élimination définitive si configurée ou fin de partie.

## 8. D — Inventaires, menus et scoreboard

### 8.1 Isolation

`templates/groups.candidate.yml` propose six groupes distincts : hub, Survie (avec éventuels Nether/End), BedWars, BlockHunt et deux groupes de mondes historiques. Ne pas regrouper BedWars et BlockHunt sous un seul inventaire « mini-jeux ».

`shares: [all]` signifie partage à l’intérieur d’un groupe ; cela n’est pas une consigne de partage entre tous les groupes. Examiner configuration globale, groupes chevauchants et paramètres facultatifs. Multiverse-Inventories documente les changements de monde comme événement de sauvegarde/chargement : il ne suffit donc pas à garantir tous les ordres d’événements de connexion, respawn et plugins de match.

ItemJoin : boussole uniquement au hub ; suppression limitée à cet objet lors d’une sortie, pas purge des objets survie ; attribution après chargement du profil lobby ; vérification des ordres/priorités à la connexion et au retour.

BedWars/BlockHunt : examiner leurs propres mécanismes de sauvegarde/restauration d’inventaire. Une double restauration avec Multiverse peut dupliquer ou écraser les profils. Ne pas désactiver au hasard une option : adopter une autorité explicite et tester toutes les transitions.

### 8.2 DeluxeMenus

`templates/games.template.yml` est un fichier complet de structure de menu, mais comporte volontairement des marqueurs `__CMD_*__` non déployables. Ils doivent être remplacés par les commandes effectivement prises en charge. La registration doit utiliser `gui_menus:` et préserver les autres menus.

L’agent doit choisir entre une petite commande de routage centrale ou les commandes natives vérifiées. Le retour hub a une logique dépendante du mode : il ne doit pas devenir un simple `mv tp hub` aveugle pendant un match. Pas de permission générale de téléportation permettant de rejoindre directement l’arène au milieu d’une partie. Ne pas donner `multiverse.access.*` comme raccourci sans analyse.

### 8.3 TAB

`templates/TAB.scoreboard.fragment.yml` est un fragment à fusionner avec le config généré, pas un remplacement du config complet. Il présente rang, ping, nombre de joueurs et monde avec couleurs violet/cyan. Vérifier PlaceholderAPI et ses expansions pour `%player_name%` et `%luckperms_prefix%`. `%ping%`, `%online%` et `%world%` sont documentés par TAB.

Pour un nom de mode lisible, utiliser des scoreboards conditionnels monde/état si la version le permet. Pour les matchs, éviter que TAB remplace le scoreboard nécessaire au plugin de jeu : décider désactivation TAB en arène ou intégration compatible. Un scoreboard partagé sur un serveur n’est pas une raison de supprimer les informations de lit/équipes de BedWars.

## 9. E — Script global et limites honnêtes

Le script joint `deploy_gamemodes.sh` est un orchestrateur Bash pour un bundle final vérifié par l’agent. Il n’est pas un générateur de YAML universel pour BedWars/BlockHunt et n’embarque aucune map tierce inventée.

Ce qu’il fait :

- Mode `--plan` par défaut : téléchargement/staging dans un dossier temporaire, validation de SHA256, chemins, provenance et marqueurs non résolus, sans mutation des fichiers de production.
- Vérification du moteur et des empreintes de JARs attendus.
- Mode `--apply` explicitement autorisé par `APPROVED_MAINTENANCE=YES`.
- Sauvegarde complète des données sur serveur arrêté, fichiers de sauvegarde privés.
- Copie atomique des fichiers déclarés avec UID/GID audités, sans chown récursif global.
- Redémarrage contrôlé, attente bornée basée sur les nouveaux logs et RCON.
- Exécution des commandes RCON spécifiées avec vérification des réponses.
- Marqueur d’idempotence pour ne pas reconstruire la même géométrie à chaque exécution.

Limites importantes :

- `manifest.example.json` est volontairement incomplet et `verified=false` ; l’orchestrateur le refuse. Ce verrou évite d’installer un faux pack prêt à jouer.
- L’agent doit produire les maps et configs natifs, les contrôles de santé spécifiques et le `manifest.json` complet. Les mondes déjà présents exigent un plan de migration, pas un écrasement implicite.
- Le script accepte des fichiers individuels téléchargés ou locaux ; les archives de maps doivent être extraites et auditées en staging par l’agent avant construction du bundle : pas de ZIP arbitraire extrait en production.
- Le script ne parse pas seul le schéma natif de chaque plugin. Cette validation reste un préalable du bundle.
- Il nécessite un serveur actuellement joignable par RCON pour les contrôles et ne remplace pas un déploiement initial Docker.
- Aucune restauration automatique complète après une phase RCON : en échec, conserver sauvegarde et logs et suivre une procédure de retour arrière validée. Après certaines erreurs il laisse le serveur arrêté ; ne pas redémarrer avant examen.
- La copie des nouveaux mondes doit respecter leur emplacement réel ; la whitelist de chemins prévue est volontairement restrictive et doit être adaptée par l’agent au layout constaté, sans autoriser hub/world/playerdata.
- Les checks RCON réussis ne prouvent pas un match multijoueur complet. Une recette avec joueurs reste obligatoire.

Utilisation après création du bundle final :

```bash
bash deploy_gamemodes.sh --plan /chemin/bundle-verifie
# Seulement après recette et autorisation de maintenance :
APPROVED_MAINTENANCE=YES TARGET_UID=<UID_AUDITE> TARGET_GID=<GID_AUDITE> \
  bash deploy_gamemodes.sh --apply /chemin/bundle-verifie
```

Les marqueurs UID/GID ci-dessus ne sont pas des valeurs prêtes à copier. Ne pas créer `srv-minecraft` ou changer les identités Docker seulement pour satisfaire une ligne chown.

## 10. Contrat de réalisation pour l’agent habituel

Tu implémentes ; Perplexity ne touche ni dépôt ni VM. Lis ce dossier, le dernier état local et les fichiers réellement déployés. Ne répète pas le chantier VPN résolu dans le journal courant. Ne relance pas le script historique dangereux.

Ordre : audit et backup => identité/sécurité sans casser comptes => isolation/session => Survie et claims/RTP => arène BedWars => arène BlockHunt => menus/scoreboard => pack reproductible et recette.

Produis les fichiers demandés par l’utilisateur sous leurs vrais chemins plugin, pas sous un nom supposé. Si le plugin ne supporte pas ce qui est demandé, proposer remplacement compatible ou adaptateur ciblé avec impact et accord. Si une configuration exige un joueur pour des commandes de sélection, utiliser une API ou une génération de config documentée, pas prétendre que la console a un joueur.

Utiliser le manifeste géométrique comme source unique pour les blocs et YAML. Ajouter une vérification des bornes, sols, directions de lits, points de spawn et emplacements générateurs/shops. Fixer sources, versions, SHA256 et licences. Prévoir export/sauvegarde des templates avant le premier match puis reset automatique.

Le script final doit être testable en copie/staging, inclure dry-run, rollback documenté, maintenance et timeouts ; pas de suppression silencieuse des mondes ou profils. Vérifier la sémantique RCON : un code retour shell nul ne prouve pas que le plugin a accepté la commande.

## 11. Recette obligatoire

- Hub après connexion : Adventure, boussole, pas d’objet Survie importé, pas de purge de profil Survie.
- Survie : génération naturelle réelle, minage/construction, difficultés et mobs adaptés, claim pelle/coffre, intrus bloqué, RTP sûr et limité.
- Survie => hub => Survie : conservation exacte inventaire/armure/offhand/ender chest/XP selon paramètres ; même après déconnexion/reboot.
- Mort Survie : règle validée, pas de disparition ni duplication ; retour hub selon choix.
- BedWars : join via menu, attente, équipes, ressources, shops, lit détruit, respawn lit intact, élimination après destruction, victoire et reset.
- BlockHunt : join, déguisement, délai cache, chasse, élimination/conversion selon plugin, victoire et reset.
- `/spawn` en match : leave effectif avant hub ; pas de joueur fantôme, kit transféré ou slot bloqué.
- Déconnexion pendant match, reconnexion et reboot : état cohérent et inventaire principal intact.
- Pas de transfert d’items entre deux mini-jeux ou vers la Survie.
- TAB : placeholders résolus, ping/joueurs/rang corrects, scoreboard BedWars non cassé.
- Performances : génération et reset ne saturent pas la VM ; aucun chiffre de capacité garanti sans mesures.
- Deux déploiements identiques : pas de doublon d’arène ni reconstruction de la Survie.

## 12. Sources et provenance

Projet (section Minecraft et scripts lus dans le diff) :
https://github.com/Klemz-696/AP1-SISR-JoyStickFM/commit/f96193ee9d74a03a607701df545aae00a0b04481

Sources publiques utilisées pour le cadrage, à vérifier contre les versions installées :
- https://papermc.io/downloads/paper
- https://docs.papermc.io/paper/reference/commands/
- https://mvplugins.org/core/fundamentals/commands-usage/
- https://mvplugins.org/core/fundamentals/world-properties/
- https://mvplugins.org/inventories/reference/sharing-details/
- https://github.com/pop4959/Chunky/wiki/Commands
- https://docs.griefprevention.com/configuration/
- https://github.com/NEZNAMY/TAB/wiki/Placeholders

Aucun téléchargement de plugin/map ni aucun test sur la VM n’a été exécuté par Perplexity. Les scripts du dossier sont des livrables à examiner et appliquer par l’agent habituel, pas une annonce d’installation terminée.
