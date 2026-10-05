# JoyStick FM — Plan consolidé d’amélioration du serveur Minecraft

Version 2.0 — 5 octobre 2026  
Projet : `Klemz-696/AP1-SISR-JoyStickFM`  
Destination : agent de développement habituel dans Antigravity.  
Statut : cahier des charges consolidé ; aucune intervention sur GitHub ou la VM effectuée pour ce document.

## 1. Rôles et mandat

Perplexity fournit uniquement le cadrage, les spécifications, les documents et les prompts. Il ne modifie pas le dépôt, ne lance pas Copilot et ne déploie aucun composant.

L’agent habituel analyse l’existant et réalise l’ensemble des lots décrits dans ce document. La demande « faire tous les lots » ne signifie pas produire seulement un plan ou s’arrêter après le hub. Elle ne signifie pas non plus fusionner toutes les modifications ou les déployer sans tests.

L’agent peut avancer sur l’audit, les sources, la conception, les essais isolés et les travaux non destructifs. Il regroupe les décisions réellement bloquantes au début. Après validation des décisions et du plan de changement, il déroule tous les lots autorisés ; il ne redemande pas le questionnaire complet et ne sollicite pas systématiquement un accord pour chaque fichier. Les changements d’identité, opérations destructives, coupures non prévues et modifications réseau requièrent toujours un accord spécifique.

Ne pas lancer d’autres agents autonomes en concurrence, ni confier implicitement le travail à GitHub Copilot. Vérifier l’état Git local et préserver les modifications utilisateur avant chaque opération.

## 2. Documents de référence et niveau de preuve

Base principale : rapport `Rapport_Amelioration_Serveur_Minecraft_Et_Axes_Progres.md`, daté du 5 octobre 2026, et réponses A1–T7 de l’utilisateur. Le rapport annonce hub, Survie, claims, RTP, isolation des inventaires, BedWars et BlockHunt. Il indique les versions `ScreamingBedWars 0.2.44` et `BlockHunt 0.2.1`.

L’utilisateur précise toutefois qu’aucune partie complète n’a été testée car il est seul sur le serveur. Par conséquent, aucune fonction multijoueur ne doit être considérée validée de bout en bout sur la seule base du rapport. Distinguer installation, chargement de plugin, configuration, test console, test simulé et recette avec vrais joueurs.

Les formulations « élimination totale du lag », « inventaires hermétiques », « protection absolue » sont des affirmations du rapport à contrôler, pas des garanties à reprendre. Pré-générer une zone ne teste pas les joueurs sortant de cette zone, le reset des arènes, le coût des plugins ou les données de profil.

Infrastructure déclarée : Debian 12 `srv-minecraft`, IP `10.30.0.22`, Docker `minecraft_ap1`, Paper 26.2 / Java 25 LTS. La mention ancienne « Minecraft 1.21 » doit être vérifiée contre la commande `version` : ne pas fixer les dépendances sur une branche historique par erreur.

Le réseau/NAT est décrit comme opérationnel. Ne pas relancer le précédent chantier VPN dans cette mission, sauf observation d’une régression. L’adresse `192.168.101.37` est un point d’entrée privé du réseau lycée et n’est pas une preuve d’exposition Internet globale.

## 3. Décisions fonctionnelles consolidées

### 3.1 Vision

- Mélange équilibré de Survie durable et mini-jeux rapides.
- Public : classe/binôme, élèves autorisés du lycée et amis invités ; l’ajout de ces catégories ne vaut pas ouverture générale à tout Internet.
- Usage initial : petits groupes de 2–8 joueurs ; cible de recette ultérieure 10–15 simultanés.
- Les 25 places affichées ne constituent pas une capacité démontrée.
- Stabiliser BedWars/BlockHunt et le hub avant d’ajouter les duels, tout en donnant une priorité forte à Rush/Hikabrain.
- Base évolutive avec livraisons réellement jouables, pas catalogue de boutons décoratifs.

### 3.2 Hub et accueil

- Hub principal et lobby mini-jeux dans deux mondes séparés.
- Protection contre la chute : barrières et retour instantané sans dégâts.
- Exploration de toute la plateforme ; parkour et secrets ensuite.
- Identité visuelle : néon JoyStick FM, violet/cyan, éléments rétro.
- Menu toujours accessible, complété par PNJ et/ou portails.
- Attente conviviale avec informations ; enrichissement progressif par parkour, spectateurs et classements à préciser.

### 3.3 Mini-jeux

- Conserver/stabiliser BedWars et BlockHunt.
- Ajouter Rush et Hikabrain dans des lots distincts.
- BedWars : plusieurs formats, notamment solo et duo ; liste exacte et nombre d’arènes à proposer.
- Rush : inspiration fidèle du FunCraft historique, formats 1v1 et 2v2 ; pas simple renommage d’un BedWars générique.
- Hikabrain : inspiration FunCraft avec objectif au lit adverse, pas objectif portail.
- Combat réglé par mode, pas une seule mécanique appliquée aveuglément à la Survie et aux duels.
- Files d’attente simples et défis directs pour les duels.
- Statistiques personnelles ; aucun classement compétitif global imposé.
- BlockHunt : joueur trouvé => éliminé puis spectateur, ensuite chasseur secondaire après un délai à définir.
- Maps : mélange de créations originales et ressources autorisées, provenance/droits/coordonnées vérifiés.
- Une première map par mode puis rotation progressive ; les variantes solo/duo peuvent nécessiter plusieurs configurations d’une même conception.

### 3.4 Survie

- Vanilla avec protections, sans économie, métiers ou quêtes ajoutés par défaut.
- Tombe récupérable à la mort ; pas de keepInventory imposé comme remplacement de la tombe.
- Réapparition au dernier point de respawn valide (lit ; préciser le comportement de l’ancre du Nether), sinon hub.
- PvP actif selon les protections définies.
- Overworld, Nether et End.
- Monde permanent ; aucune réinitialisation saisonnière automatique.
- Choix d’entrée : spawn Survie, dernière position sûre ou RTP.
- Le choix S5 concernant le barème des claims n’a pas été donné. Conserver les données existantes et demander la règle manquante.

### 3.5 Exploitation

- RAM augmentable : l’utilisateur peut fournir au moins 30 Go si nécessaire.
- Ce budget disponible n’est pas une consigne d’allouer automatiquement 30 Go au heap d’une JVM.
- Administration : utilisateur et binôme ; élèves choisis pour des rôles limités si nécessaire.
- « Pas de restriction » sur les comptes : clarification obligatoire des identités acceptées et de l’autorisation d’accès ; ne signifie jamais « authentification inutile ».
- Maintenance annoncée hors cours ; brèves interruptions de test possibles ; minimiser les interruptions inutiles.
- Sauvegarde quotidienne et avant déploiement, avec test de restauration.
- Lien avec Webradio/TCG : identité visuelle et liens seulement ; pas d’économie partagée ni de migration des comptes Web dans ce chantier.
- L’agent réalise tous les lots, avec tests et comptes rendus progressifs.

## 4. Six arbitrages restants

Les propositions ci-dessous ne sont pas encore approuvées. Ne pas arrêter tout l’audit en les attendant ; ne pas déployer les règles dépendantes sans réponse.

### D1 — Barème des claims (S5 manquant)

Choisir conservation des paramètres actuels, claims généreux et progressifs, ou gestion par administration. Proposition : claims progressifs adaptés à la construction, avec limites explicites et vérification des protections PvP. Les valeurs initiales, vitesse d’acquisition, plafond et confiance entre joueurs doivent être fixés après lecture de la configuration réelle.

### D2 — Sens de « pas de restriction » sur les comptes

Distinguer :
- Comptes Microsoft/Mojang authentifiés et sans whitelist de pseudos, dans le périmètre autorisé.
- Comptes non vérifiés par Mojang également acceptés, avec authentification locale et protection des identités.
- Élargissement du public au-delà du lycée et des invités, qui est une autre décision.

Proposition : si les deux types de comptes sont souhaités, exiger un dispositif d’authentification compatible, protéger spécifiquement les comptes staff et prévoir les impacts sur UUID/claims/tombes/inventaires. Ne pas mettre `online-mode=false` en considérant LuckPerms comme une authentification.

### D3 — BlockHunt : délai spectateur puis chasseur

Fixer durée, changement de rôle, conservation du compteur de cachés et conditions de victoire. Proposition : 30 secondes de spectateur puis conversion contrôlée en chasseur, uniquement si la partie est encore active. Ce délai n’est pas décidé par l’utilisateur.

Un joueur trouvé cesse immédiatement de compter parmi les cachés. La partie ne doit pas attendre sa conversion pour constater une victoire. Le spectateur ne peut pas communiquer d’informations en jeu via un mécanisme ajouté, interagir avec les blocs ou rejoindre physiquement les cachés ; les règles sociales restent à définir.

### D4 — Référence historique FunCraft

Obtenir si possible période/version ou vidéo de référence pour Rush et Hikabrain. La source archivée retrouvée décrit Rush MDT et HikaBrain, mais ne fixe pas toutes les variantes historiques.

À clarifier : Rush libre ou MDT ; destruction du lit uniquement TNT ou autre ; TNTFly oui/non ; kits et ressources ; durée et règles de victoire. Hikabrain : nombre de points pour gagner, action sur le lit (toucher/interaction), reset après point, kits, formats et knockback. Proposition de match à 5 points possible, mais pas présentée comme règle historique vérifiée.

### D5 — Tombe : confidentialité et récupération

Fixer délai de protection, accès du propriétaire, vol après délai, expiration et politique de remboursement d’erreur. Proposition : accès propriétaire et administration autorisée, aucune expiration destructive automatique au départ ; aucune de ces valeurs n’est encore validée.

Prévoir la perte dans le vide, la lave, un claim adverse, le Nether/End, les chunks déchargés et une reconnexion. La tombe ne doit pas être créée au hub lors de l’événement de respawn si la mort a eu lieu en Survie.

### D6 — Classements et indicateurs au lobby

J9 fixe des statistiques personnelles tandis que H6 cite des classements possibles au lobby. Proposition : afficher informations de modes, statistiques personnelles ou scores de parkour ; pas de classement PvP public sans accord spécifique. Clarifier si un classement collectif est souhaité ultérieurement.

## 5. Référence FunCraft : ce qui est vérifié

Archive non officielle de la page des jeux : https://funcraft.nixuge.me/jeux

Elle présente Rush MDT : « Attaque la base de l’équipe adverse en suivant le chemin pour détruire leur lit », dans des bases aériennes.

Elle présente HikaBrain : « Protège ton lit et marque un maximum de points en touchant celui de tes adversaires », sur un pont aérien.

Une présentation tierce datée de 2018 décrit un Rush avec destruction du lit par TNT, ressources auprès d’un ender chest, PNJ et TNTFly : https://www.bananatic.com/fr/jeux/minecraft-292/mg-pr-sentation-4-rush-12098

Ce témoignage est une piste historique, pas une spécification complète ou autorité couvrant toutes les périodes. Ne pas convertir toutes ses descriptions en exigences automatiquement approuvées.

Ne pas utiliser des noms FunCraft pour promettre une affiliation. S’inspirer des mécaniques, développer l’identité JoyStick FM et ne pas récupérer maps, code ou assets historiques sans droit vérifié.

## 6. Architecture à analyser avant décision

### 6.1 État actuel à préserver

Auditer `docker-compose.yml`, mounts, versions/JARs, configurations générées, fichiers de mondes et stockage des profils. Vérifier les incohérences entre scripts historiques et corrections déployées. Ne pas relancer un script qui réintroduit wildcard admin, purge ItemJoin, ancien routing ou menus.

État du hub, Survie, claims et isolation : documenté, à tester. État BedWars/BlockHunt : configuration annoncée, aucun match complet validé par l’utilisateur.

### 6.2 Option monolithique ou instances séparées

Ne pas imposer une refonte en réseau proxy d’emblée. Comparer :

A. Un Paper multi-mondes avec règles et combats propres aux modes ; plus proche de l’existant, mais examiner interférences de plugins, inventories, scoreboard et lifecycle.

B. Plusieurs instances dédiées derrière un point d’entrée contrôlé ; isolation plus explicite des modes, mais changements d’administration, routage, authentification et transferts de joueurs plus importants.

La RAM disponible rend l’option B envisageable, pas obligatoire. Préserver l’adresse de jeu actuelle et les droits réseau. Toute nouvelle exposition ou modification de NAT requiert accord. Ne pas exposer directement des backends en contournant l’authentification prévue.

L’agent présente une recommandation fondée sur compatibilité réelle, CPU disponible, nombre de joueurs, maintenance et état du projet. Pas de migration vers une autre version du serveur sans sauvegarde, plan et accord.

### 6.3 Ressources

Mesurer vCPU, stockage, RAM totale libre de la VM/hyperviseur et mémoire utilisée par les autres services. Réserver une marge système. Le plan mémoire doit distinguer budget VM, heap JVM, mémoire native et autres processus. Évaluer une montée progressive mesurée ; pas d’allocation « autant que possible » sans raison.

Cible initiale 2–8, recette ensuite 10–15. Mesurer TPS/MSPT, mémoire/GC, temps de reset, disque et chargement des chunks. Ne pas garantir la capacité à partir du seul nombre de slots ni d’un test sans joueurs.

## 7. Hub principal et lobby mini-jeux

### 7.1 Monde hub

Conserver la plateforme actuelle et vérifier sa véritable emprise. Garde-corps invisible aux bordures extérieures utiles, pas une cage autour du seul spawn. Couvrir angles et irrégularités, sans obstruer les passages/portails prévus.

Retour anti-vide spécifique aux mondes d’accueil : détecter une chute hors zone sûre avant dégâts/mort, puis téléporter vers un point valide. Le seuil Y < 50 du rapport est une proposition à adapter au parkour et aux parties explorables. Ne jamais appliquer ce rattrapage aux chutes en match, sous peine d’empêcher les éliminations.

Conserver Adventure, météo/temps choisis, absence de dégâts adaptée au lobby et permissions. Une protection des interactions doit être testée, pas annoncée absolue du seul fait du gamemode.

### 7.2 Monde lobby_minijeux

Créer un Void lobby distinct, avec géométrie générée par script/manifeste vérifié. Palette néon/rétro, signalétique JoyStick FM, zones pour BedWars, Rush, Hikabrain et BlockHunt, informations, règles et disponibilité. Prévoir zones d’attente et retour hub.

Conserver les lobbies d’attente internes des plugins : le lobby commun ne remplace pas la réservation d’une arène, le minimum de joueurs ou le countdown. Un joueur ne doit appartenir à deux files simultanément.

### 7.3 Navigation

Boussole/menu toujours disponible depuis les mondes d’accueil. Proposer une commande de menu accessible ailleurs sans injecter automatiquement un objet protégé dans les kits. Depuis un match, la sortie doit passer par leave/forfeit adapté au plugin, puis transfert vers le lobby/hub.

PNJ/portails : commander join ou menu approprié, pas téléportation brute dans l’arène. Ne pas donner des permissions de téléportation globale aux joueurs pour rendre les boutons fonctionnels. Afficher mode indisponible ou arène en cours si la partie ne peut être rejointe.

## 8. Survie permanente, claims et tombes

Survie naturelle existante à conserver : pas de régénération de `survie`, seed ou constructions sans demande explicite. Pré-génération et bordure doivent être vérifiées et dimensionnées ; préserver monde permanent et données GP.

Nether/End : auditer existants, générer/importer si absents et établir les liens de portails corrects. Le partage d’inventaire s’applique au groupe Survie incluant ses trois dimensions, pas aux arènes.

Réapparition : point valide dans une dimension de Survie selon règle finale, sinon hub. Mort => capture fiable du contenu pertinent pour la tombe à l’emplacement de mort ; respawn => équipement cohérent sans duplication. Préciser inventaire, armure, offhand et XP. Ender chest doit rester persistant et ne doit pas être vidé dans la tombe sans exigence explicite.

Tombe : plugin compatible ou module ciblé, données persistantes, propriétaire et permissions, récupération atomique, sécurité en cas de double clic/serveur arrêté. Prévoir espace insuffisant, récupération partielle et audit admin sans exposer un endpoint de duplication.

PvP « selon protections » : lire les règles GP actuelles, claims, spawn, zones, confiance et anti-combat-log. Demander les réglages PvP dans/par les claims si le choix manque. Ne pas introduire une économie de survie, récompenses inter-jeux ou métiers.

Entrée Survie : menu spawn/dernière position/RTP ; dernière position sûre enregistrée par dimension ; si invalide, fallback explicite. RTP audité pour bordure, liquide/lave/dangers, place, claims, cooldown et charge serveur. `/spreadplayers` ne doit pas être traité comme preuve de toutes ces garanties.

## 9. BedWars multi-formats

Vérifier le plugin installé, sa compatibilité, les formats de YAML, les arènes et reset. Faire une partie complète avant de considérer stable.

Formats confirmés : solo et duo, d’autres possibles. Déployer les premiers selon fréquentation : une arène jouable à deux en solo et une configuration duo sont proposées ; le nombre d’équipes exact par variante doit être fixé. Éviter trop de files qui diluent 2–8 joueurs.

Maps symétriques, lits et orientations, spawns, generators, shops et upgrades définis dans un manifeste commun. Attente, équipe, démarrage, mort lit intact, lit détruit, spectateur, victoire et reset doivent suivre l’autorité du plugin.

Séparer inventaires et statistiques par mode. Vérifier les mécanismes du plugin et Multiverse afin d’éviter doubles restores. Aucun équipement acheté en match ne doit sortir vers la Survie ou un autre mini-jeu.

## 10. Rush façon FunCraft

Traiter Rush comme une vraie spécification historique : règles de destruction du lit, respawn, élimination, victoire, ressources, shops, kits, blocs, TNT, knockback et construction.

Formats confirmés 1v1 et 2v2. Autres types d’équipes éventuellement demandés à terme ; ne pas inventer une première livraison 4 équipes si elle n’est pas choisie. Réutiliser un moteur BedWars seulement s’il reproduit les règles finales, sinon adaptateur/module compatible et justifié.

Si TNTFly est retenu, tester propulsion, dégâts, protections et interaction GrimAC de façon ciblée. Ne pas désactiver globalement l’anti-cheat sur tout le serveur pour rendre le mode jouable. Réglages historiques de combat à documenter et éprouver sur la version Paper actuelle.

Chaque partie doit restaurer son template sans blocs persistants ou destruction du lobby. Déconnexion, forfait, parties privées et challenges doivent avoir des règles écrites. Minimum deux joueurs pour un vrai duel ; un test solo ne prouve pas ce fonctionnement.

## 11. Hikabrain façon FunCraft

Objectif au lit adverse : toucher/interagir avec le lit marque un point selon la règle finale, et non détruire un portail ou jouer un BedWars à achats. Distinguer lit objectif et respawn propre à chaque équipe.

Le cycle proposé à spécifier : attente => match => point => reset contrôlé joueurs/blocs/kit => reprise => score cible => résultat => nettoyage. Fixer score cible, bloc autorisé, protections autour des lits, mort, retour après chute, kits et temps de pause entre points.

Format initial proposé 1v1. Le 2v2 Hikabrain n’a pas été explicitement fixé dans J6 ; il peut être proposé, contrairement au 2v2 Rush confirmé. Prévoir paramètres compatibles avec extension.

Point atomique : ne pas compter deux contacts dans la même transition, empêcher un joueur spectateur de marquer, traiter contact simultané et joueur déconnecté. Les règles exactes de simultanéité doivent être écrites.

Le module retenu doit être compatible avec moteur/API actuels. Un plugin historique 1.8/1.9 portant le nom Hikabrain n’est pas automatiquement utilisable sous Paper 26.2. Pas de téléchargement d’un JAR ancien non vérifié au seul motif de fidélité historique.

## 12. BlockHunt à conversion différée

États explicites : caché actif, chasseur initial, spectateur temporaire après découverte, chasseur secondaire, spectateur de fin, sorti.

À la découverte : retirer du décompte des cachés immédiatement, quitter le déguisement, bloquer interaction et dégâts pendant la phase spectateur ; démarrer un timer lié à la partie. À expiration : convertir en chasseur si le match est encore actif et le joueur présent. Annuler les timers si partie terminée ou sortie.

Si tous les cachés sont trouvés avant expiration, terminer le match immédiatement ; ne pas faire apparaître des chasseurs après fin/reset. Le nombre de découvertes/statistiques ne doit pas augmenter lors d’une conversion seule.

Déconnexion/reconnexion : définir si le rôle est repris ou si le joueur reste spectateur ; pas de rejoin permettant de redevenir caché après avoir été trouvé. Tester compatibilité déguisements, packets et anticheat.

## 13. Statistiques et interface

Statistiques personnelles par mode : parties, victoires/défaites et indicateurs pertinents (lits/points/découvertes) à proposer. Pas d’ELO, de récompenses compétitives ou classement PvP public imposé.

Persistance avec ID joueur authentifié selon stratégie retenue, export et sauvegarde. Garder les APIs natives des plugins si elles sont fiables et éviter doubles compteurs. Définir forfaits/abandon pour ne pas donner de victoire exploitée sans règle.

TAB : hub/lobby/Survie selon besoin ; ne pas écraser le scoreboard BedWars/Hika/BlockHunt. Pendant le match, priorité aux informations propres à la partie. Affichage stats via menu, commande ou PNJ personnel.

Hologrammes : identité/texte et liens Webradio, informations de modes, disponibilité. Installer un composant supplémentaire seulement si nécessaire et compatible. Classement public en attente de D6.

## 14. Identité et administration

Séparer accès réseau, identité du compte Minecraft et autorisations staff. Public lycée/invités ne doit pas se transformer implicitement en serveur Internet ouvert sans contrôles.

Pour des comptes non vérifiés par Mojang : étudier authentification locale sûre, comptes staff protégés, sessions, récupération et compatibilité proxy si utilisé. Ne pas stocker de mots de passe en clair. Vérifier le comportement avant authentification (mouvement, commandes, inventaire, joins) et l’effet d’un pseudo imité.

Ne pas changer `online-mode`, identité UUID ou forwarding sans plan de migration/test des inventories, claims, tombes, stats et permissions. La conservation des pseudos n’est pas à elle seule une migration correcte.

Rôles proposés : administrateur propriétaire, administrateur binôme, modérateur élève limité. Aucun `*` global. RCON/SSH non fournis aux modérateurs ; permissions auditables. Logs opérationnels sans secrets, règles de sanctions compréhensibles et collecte minimale.

## 15. Tests lorsque l’utilisateur est seul

L’absence d’autres joueurs est une contrainte explicite. L’agent ne doit ni demander à l’utilisateur de trouver immédiatement huit personnes ni annoncer des matchs testés sans participants.

Trois niveaux complémentaires :

1. Tests automatiques des règles et états : points simultanés, conversion différée, leave, timer expiré, autorisations, reset, conservation d’inventaires.
2. Clients de test autorisés sur environnement isolé si techniquement possible et compatible : connexions multiples, événements réseau, rôles, rejoins et commandes. Aucun compte tiers ou automatisation sur un serveur extérieur.
3. Recette réelle à deux puis petit groupe d’élèves/amis dès disponible : ressenti combat, lag, PNJ/menu, fluidité et cas exploitables.

Les NPCs ou commandes RCON peuvent aider les checks mais ne remplacent pas de vrais événements de clients ni une validation du combat. Si un client de test est incompatible avec la version ou l’authentification choisie, signaler la limite ; ne pas désactiver la sécurité de production pour simuler une population.

Tenir une matrice `test automatisé / simulation / joueur réel / non testé`. Déployer d’abord accès pilote pour les modes encore sans recette réelle. Un plugin chargé sans erreur n’est pas un match validé.

## 16. Sauvegardes et déploiement

Sauvegarde quotidienne et avant chaque déploiement autorisé ; données mondes, joueurs, plugins/stores, configs et manifests. Fixer rétention et budget disque avec propositions explicites. Vérifier l’espace avant backup et conserver un jeu restaurable.

La copie quotidienne doit être cohérente : méthode d’arrêt planifié ou sauvegarde/snapshot avec coordination des écritures et des stockages. Ne pas copier une base active en considérant arbitrairement tous ses fichiers cohérents.

Restauration testée en copie isolée avant première livraison large. Le script de déploiement décrit fichiers, hashes, versions, source/licence des assets, modifications prévues, UID/GID, timeouts et rollback.

Pas de `/reload confirm` pour les changements de JARs ; redémarrage contrôlé. Pas de chmod global rendant secrets lisibles à tous. Pas de `chown` vers un compte non aligné avec les IDs du conteneur. Pas de suppression de mondes pour corriger un profil.

Maintenances annoncées hors cours ; changements regroupés ; petites coupures de test selon créneau accepté. En cas d’incident, restaurer un état connu et présenter le diagnostic, pas poursuivre toutes les étapes en cascade.

## 17. Lots à réaliser intégralement

### Lot 0 — Audit, choix bloquants et staging

État Git/VM, versions exactes, examen des réglages réellement déployés, backups, compatibilité, plan mémoire et choix d’architecture. Résoudre D1–D6 au bon moment. Vérifier qu’aucune tâche concurrente ne travaille sur les mêmes fichiers. Préparer environnement test et preuve de restauration.

### Lot 1 — Stabilisation BedWars/BlockHunt et inventaires

Contrôler cycle complet, profils et commandes de sortie/respawn. Corriger duplications/pertes avant d’ajouter du contenu. Ne pas confondre installation actuelle avec validation de match. Implémenter tests automatiques et limites de recette solo.

### Lot 2 — Hub sécurisé et lobby mini-jeux

Barrières, anti-vide propre, deux lieux d’accueil, signalétique, menu et PNJ/portails. Zones conviviales initiales ; architecture prévue pour parkour/secrets. Vérifier que fallback anti-vide ne s’applique jamais aux arènes.

### Lot 3 — Survie complète avec tombes

Préserver monde permanent, lier Nether/End, claims validés, PvP conforme, tombes récupérables, respawn lit sinon hub, menu spawn/dernière position/RTP. Vérifier transitions et reprise après crash.

### Lot 4 — Rush 1v1 et 2v2

Spécification historique finalisée, arène originale ou autorisée, formats, kits/generators/shops adaptés, règles TNT selon validation, challenges et file. Cycle/anticheat/reset éprouvés.

### Lot 5 — Hikabrain au lit adverse

Kit et règle de points validés, arène, marquage atomique et resets, duels/file, statistiques. Exclure objectif portail. Examiner option 2v2 sans l’annoncer comme déjà approuvée.

### Lot 6 — Multi-formats et BlockHunt final

Compléter les variantes BedWars décidées et le cycle BlockHunt spectateur => chasseur secondaire. Éviter fragmentation des files à faible fréquentation.

### Lot 7 — Finition et exploitation

Stats personnelles, scoreboard compatible, première map soignée par mode, parkour/secrets selon scope, onboarding staff/joueurs, sauvegardes quotidiennes et recette 10–15. Préparer rotation de maps future ; ne pas multiplier immédiatement les séries inachevées.

Les lots 1/2 peuvent être rapprochés pour réparer le hub rapidement, sans négliger le contrôle des parties. Cette séquence couvre toutes les demandes ; ce n’est pas une autorisation de réduire le périmètre à un seul lot.

## 18. Critères de sortie et définition de fini

- Deux lieux d’accueil utiles, navigables et protégés contre les chutes sans cage centrale imposée.
- Survie persistante avec trois dimensions, claims et tombe fonctionnelle ; respawn lit/point valide sinon hub.
- BedWars dans les premiers formats retenus, avec join/mort/victoire/reset.
- Rush 1v1/2v2 et Hikabrain correspondant aux règles FunCraft finalisées, pas simples étiquettes de menu.
- BlockHunt gérant élimination/spectateur/conversion différée sans timers orphelins.
- Files/défis, sorties et reconnexions cohérents ; pas de fuite d’inventaire.
- Identité et permissions réellement protégées selon les comptes acceptés.
- Statistiques personnelles, affichages utiles, liens Webradio et identité néon/rétro.
- Source/licence/coordonnées de maps vérifiées ; première map finie par mode, extension possible.
- Sauvegarde quotidienne + avant déploiement, restauration démontrée et rollback documenté.
- Capacité de joueurs mesurée et niveaux de validation décrits honnêtement.

Tout ce qui reste non testé avec vrais joueurs doit apparaître dans le compte rendu, même si des simulations sont positives. Ne pas annoncer 100 % opérationnel sans préciser le périmètre testé.

## 19. Prompt de transmission à l’agent

Tu es l’agent responsable de l’implémentation complète du serveur Minecraft JoyStick FM. Lis intégralement ce plan v2 et le rapport d’amélioration associé, puis compare-les aux fichiers et services réellement présents.

Tu dois réaliser tous les lots, pas seulement produire un plan ou stabiliser le hub. Perplexity reste uniquement sur le cadrage et ne doit effectuer aucune action projet.

Commence par vérifier les versions/état Git/VM, préserver les données, identifier les six arbitrages restants et présenter une recommandation technique. L’utilisateur est seul pour tester : prévois tests automatisés/clients isolés lorsque possibles et indique les limites de validation humaine.

Après accord sur les décisions critiques et le plan de changement, avance sur l’ensemble des lots autorisés, avec comptes rendus progressifs, plutôt que redemander chaque ancienne question. N’attends pas une validation de chaque fichier ; demande un accord spécifique pour migration d’identité, changements réseau, destruction de données ou interruption non prévue.

Préserve le monde Survie, développe les deux lobbies, reproduis les règles de Rush/Hikabrain retenues avec objectif Hikabrain au lit adverse, installe la tombe, complète BedWars multi-formats et la conversion différée BlockHunt. N’invente ni la règle FunCraft exacte non sourcée, ni les licences/maps/coordonnées, ni un test multijoueur non effectué.

Livre les scripts idempotents, YAML natifs correspondant aux plugins, manifests et procédures d’exploitation ; pas de JAR historique incompatible installé au hasard, pas de reload global, pas de wildcard admin, pas de purge d’inventaires. Ne change pas l’authentification en prétendant que « pas de restriction » dispense de sécurité.

Pas de reset saisonnier, pas d’économie Survie/TCG partagée, pas de classement PvP public imposé. RAM disponible ne signifie pas heap 30 Go obligatoire. Le résultat doit être une base évolutive entièrement jouable avec limites documentées.

## 20. Sources publiques utilisées pour le cadrage

- Archive de la page des jeux FunCraft, non officielle : https://funcraft.nixuge.me/jeux
- Présentation historique tierce du Rush, 2018 : https://www.bananatic.com/fr/jeux/minecraft-292/mg-pr-sentation-4-rush-12098
- Explications du risque d’identité et de migration UUID en offline-mode : https://www.holy.gg/en/post/set-up-offline-mode-minecraft-server
- Paper : https://papermc.io/downloads/paper
- Recommandations rechargement/redémarrage : https://docs.papermc.io/paper/reference/commands/

Les sources historiques ne sont pas une confirmation d’une compatibilité plugin actuelle. Le rapport utilisateur et ses réponses font autorité pour les souhaits ; les valeurs proposées et points non tranchés restent identifiés comme tels.
