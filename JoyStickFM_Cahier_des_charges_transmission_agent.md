# JoyStickFM — Cahier des charges et transmission à l’agent de développement

Version : 1.0 — 4 octobre 2026  
Projet : `Klemz-696/AP1-SISR-JoyStickFM`  
Statut : cadrage à transmettre ; aucune implémentation décrite ici n’est réputée terminée ou validée.

## 1. Mandat et règle de coordination

L’utilisateur demande à Perplexity un rôle de cadrage, d’organisation et de rédaction uniquement. Perplexity ne doit plus coder, lancer un agent, modifier le dépôt, fusionner une PR, installer un plugin ou déployer une modification. L’agent habituel de l’utilisateur possède déjà le contexte et sera le seul responsable du développement.

Ce document remplace l’organisation antérieure qui confiait un premier lot à Copilot. Il ne remplace pas les connaissances utiles déjà présentes dans la session de l’agent habituel et ne commande pas de recommencer le projet.

### 1.1 Incident à traiter avant tout nouveau développement

Une tâche GitHub Copilot a été lancée par Perplexity avant cette clarification :

- PR : https://github.com/Klemz-696/AP1-SISR-JoyStickFM/pull/1
- Titre demandé : `feat(games): lot 1 — comptes joueurs, portail Jeux et Activités`.
- Job : `174388609-1404599492-ef96eb24-b3ba-4b1f-9ad6-d418e7e50f7c`.
- Workflow : https://github.com/Klemz-696/AP1-SISR-JoyStickFM/actions/runs/37221134866
- Dernier état observé pendant la préparation de cette transmission : `running`.
- L’arrêt effectif n’a pas été confirmé. Ne pas écrire qu’il a eu lieu sans vérification.

Priorité de l’agent habituel : vérifier la situation actuelle, faire arrêter la session si elle tourne encore, et vérifier son état final avant d’écrire dans les zones concernées. GitHub fournit l’action `Stop session` dans la vue des journaux de session ; elle arrête le run tout en conservant les commits déjà poussés. Si l’agent ne possède pas l’outil ou les droits nécessaires, donner immédiatement à l’utilisateur la manipulation exacte et attendre la confirmation d’arrêt.

Ne pas fusionner la PR #1. Ne pas la fermer ou supprimer sa branche comme simple substitut non vérifié à l’arrêt d’une session. Une éventuelle clôture sans fusion pourra être proposée après arrêt ; conserver les changements produits tant qu’ils n’ont pas été inspectés et que l’utilisateur n’a pas décidé de leur sort. Ne pas mentionner `@copilot` dans un commentaire susceptible de lancer une nouvelle session.

Un éventuel code produit par cette tâche est un matériau non validé, pas une base imposée. L’agent habituel décidera avec l’utilisateur s’il est utile de le relire, d’en reprendre une partie ou de l’écarter. Aucun cherry-pick, merge, reset, nettoyage ou écrasement silencieux.

### 1.2 Mode de travail désormais demandé

1. Préserver l’état local et les changements existants.
2. Lire ce document et tenir compte du contexte déjà connu.
3. Effectuer un audit ciblé, pas une réécriture globale.
4. Présenter le plan, les écarts et les quelques arbitrages nécessaires.
5. Attendre la validation de ce plan avant de développer.
6. Développer ensuite par lots testables et documentés, avec comptes rendus honnêtes.
7. Demander une autorisation explicite avant fusion ou déploiement ; un accord de développement n’autorise pas automatiquement une mise en production.

## 2. Objectif et limites du périmètre

Ajouter au site existant un espace de jeux cohérent avec son thème. Après connexion à son compte joueur, l’utilisateur choisit entre :

- Le jeu de catapulte arcade déjà présent.
- Un nouveau jeu de cartes à collectionner, appelé provisoirement JoyStick TCG.

La première version aboutie du TCG doit être réellement utilisable : collection, boosters, raretés, variante holographique, doublons, recyclage, succès, économie, échanges entre joueurs et marché. Les combats sont souhaités pour l’avenir, mais ne sont pas requis pour cette première version. Le nom TCG ne doit pas être interprété comme l’obligation de développer des duels maintenant.

S’ajoutent les comptes joueurs, l’intégration au chat, les récompenses liées à l’écoute, ainsi que des évolutions multimédias détaillées plus loin. Ne pas réduire l’objectif final à une simple galerie ou à une maquette d’ouverture de boosters. Une livraison intermédiaire peut afficher honnêtement le TCG comme non disponible, mais le programme complet doit aller jusqu’aux échanges et au marché.

Ne pas créer un nouveau site ou changer de stack sans besoin démontré et accord utilisateur. Conserver WordPress, PHP, MariaDB et le JavaScript existant dans la mesure où l’audit confirme leur présence. Pas d’argent réel, pas de paiement, pas de NFT ni de mécanisme blockchain.

## 3. Éléments connus et audit requis

### 3.1 Repères observés dans le dépôt

Ces éléments proviennent de recherches ciblées, pas d’un audit complet :

- Le site se trouve dans `AP_Webradio/3- Website/joystickfm-theme`.
- Le thème contient `functions.php`, `header.php`, `footer.php`, `style.css` et plusieurs templates de pages.
- La catapulte est dans `assets/js/joystick-launch-game.js`.
- Les Easter Eggs font notamment appel à `window.JFM_GAME.openGameOverlay()`.
- `functions.php` charge le jeu et plusieurs scripts de navigation/audio.
- Le chat utilise notamment `assets/js/chat.js`, `assets/php/chat-handler.php` et une table MariaDB préfixée de type `jfm_chat_messages`.
- Les références à Joycoins et au TCG trouvées lors du premier examen étaient dans les documents d’évolution. Cela ne prouve pas l’absence de tout prototype ailleurs.
- La branche par défaut observée était `main`.

### 3.2 Audit ciblé à mener

Examiner l’état Git et l’environnement réel : branche, remotes, changements non committés, correspondance entre dépôt et code servi, version PHP, WordPress/MariaDB et méthodes d’installation. Repérer les plugins déjà présents, la création actuelle des pages, les permaliens, les styles et le système de configuration.

Lire les fichiers pertinents : thème, catapulte, Easter Eggs, lecteur radio, chat, uploads, proxy des métadonnées et scripts de déploiement. Ne pas déduire les comportements des seuls noms de fichiers ou de la documentation.

Vérifier les appels qui lancent les jeux, les points d’insertion du header/footer, les dépendances JS, la persistance audio existante, la provenance des titres du flux et les permissions du chat.

Le site est destiné au réseau du lycée et à l’accès VPN. L’URL finale et la disponibilité du HTTPS restent à vérifier. Le VPN ne doit pas être considéré comme un remplacement du chiffrement HTTPS pour les identifiants et sessions. Ne pas modifier OPNsense, WireGuard, Apache ou les VMs sans autorisation spécifique.

## 4. Registre des choix utilisateur

Les choix ci-dessous sont validés dans le message de l’utilisateur. Les précisions libres priment sur une lettre d’option lorsqu’elles détaillent ou modifient cette option.

| Référence | Choix retenu |
|---|---|
| A1 | B : plugin métier ; thème pour l’interface. |
| A2 | Page d’accès aux deux jeux depuis header/footer et nouvelle page Activités ; esprit de C. |
| A3 | C : catalogue JSON initial puis interface d’administration. |
| A4 | B : stockage relationnel MariaDB. |
| A5 | Réseau du lycée et accès VPN ; URL/HTTPS non précisés. |
| G1 | A enrichi : collection, boosters, succès, échanges et marché ; combats plus tard. |
| G2 | Culture Internet/memes ou univers équivalent ; cartes faciles à produire avec assets gratuits récupérables en ligne. |
| G3 | 40 cartes au départ ; extensible ; 10 boosters initiaux de 5 cartes ; 1 booster gratuit toutes les 10 minutes. |
| G4 | C : quatre raretés et variante holographique indépendante. |
| G5 | B : 5 cartes, au moins une rare ; probabilités affichées, tirage serveur. |
| G6 | C : recyclage manuel des doublons en fragments. |
| G7 | Mélange des effets proposés, adapté au PC et au téléphone ; finition visuelle soignée. |
| G8 | Source à déterminer : récupérer gratuitement assets et informations, puis leur attribuer une rareté. |
| U1 | B : compte joueur indépendant de WordPress. |
| U2 | A : pseudo unique insensible à la casse, avec identifiant interne. |
| U3 | B : option Se souvenir de moi pendant 30 jours ; révocation serveur. |
| U4 | B + C : code de récupération et réinitialisation manuelle administrateur, sans e-mail obligatoire. |
| U5 | A : connexion obligatoire pour jouer. La recommandation B du questionnaire n’a pas été choisie. |
| U6 | B : identité du compte dans le chat ; invités identifiés comme tels. |
| R1 | B : Joycoins dépensables et XP de progression distincte ; sans argent réel. |
| R2 | B : paliers d’écoute de 5 minutes. |
| R3 | 10 Joycoins toutes les 5 minutes ; booster à 60 Joycoins. |
| R4 | A : écoute en arrière-plan autorisée pendant une lecture active. |
| R5 | B : récompense d’Easter Egg une seule fois par compte et succès permanent. |
| R6 | B : objectifs DVD quotidiens plafonnés. |
| R7 | B : une seule session d’écoute récompensée par compte. |
| R8 | A : démonstrateur raisonnablement protégé. |
| M1 | B : titre/artiste et pochette locale ; image de secours. |
| M2 | A : polling du proxy toutes les 10–15 secondes et cache serveur. |
| M3 | Source des titres à déterminer par audit. |
| M4 | C : réactions/badges, réponses, présence et modération. |
| M5 | A : soundboard local avec baisse temporaire du volume radio. |
| M6 | Recommandation retenue : rechargements entre pages acceptés pour le premier lot. |
| M7 | B : lots testables et documentés. |

## 5. Architecture attendue

### 5.1 Plugin et thème

Créer ou étendre un plugin métier dédié, nom proposé `joystickfm-games`. Il gère comptes, sessions, catalogue, possessions, boosters, récompenses, transactions, XP, fragments, succès, échanges et marché. Les données et les règles doivent survivre à un changement de thème.

Le thème reste responsable du rendu cohérent avec le site. Définir une interface claire entre plugin et thème : services, hooks, shortcodes ou endpoints selon l’existant et la solution la plus simple. Éviter de dupliquer les règles dans PHP et JavaScript. Ne pas imposer un framework supplémentaire ou un service externe permanent sans justification.

Les migrations doivent être versionnées, répétables sans duplication et compatibles avec les données existantes. Utiliser les préfixes WordPress, pas des noms `wp_` codés en dur. Définir ce qui arrive si le plugin est désactivé : pas d’erreur fatale du thème ni de suppression des données. La désinstallation destructive doit être séparée, explicite et précédée d’une sauvegarde.

### 5.2 Autorité serveur

Le serveur fait autorité pour les possessions, monnaies, XP, fragments, boosters disponibles, récompenses et transferts. Le navigateur déclenche une action et affiche sa réponse ; il ne décide pas du résultat d’un tirage ou d’un gain.

Prévoir validation des entrées, requêtes préparées, échappement des sorties, autorisation par ressource, protections CSRF appropriées, limitation d’abus et erreurs lisibles. Une protection raisonnable ne signifie pas une économie gérée exclusivement dans localStorage.

### 5.3 Modèle relationnel proposé, à adapter

| Entité | Responsabilité |
|---|---|
| Joueurs | ID interne, pseudo canonique/visible, secret haché, statut et dates. |
| Sessions | Empreinte du jeton, joueur, expiration, révocation et renouvellement. |
| Récupération | Secret haché à usage unique et suivi du renouvellement. |
| Catalogue/cartes | Identifiants stables, métadonnées, rareté, série, licence et visibilité. |
| Possessions | Carte, joueur, variante holo, quantité ou exemplaire et état de verrouillage. |
| Boosters | Droits initiaux/gratuits/achetés/gagnés, ouverture et provenance. |
| Portefeuille/transactions | Joycoins, XP et fragments séparés ; journal et idempotence. |
| Écoute/récompenses | Session active, temps validé et paliers déjà attribués. |
| Succès | Définition, progression et attribution unique. |
| Échanges | Participants, cartes proposées, statut et journal des transferts. |
| Marché | Annonce, propriétaire, prix, réservation et transaction de vente. |
| Administration | Journal des opérations sensibles, sans secrets. |

Les noms de tables et détails de conception ne sont pas imposés. Décider notamment entre quantités agrégées et exemplaires individuels : les deux sont possibles si rareté/variante, verrouillage et traçabilité restent cohérents. Ne pas ajouter une table sans nécessité.

## 6. Navigation et expérience utilisateur

Chemins indicatifs, à adapter aux permaliens et pages réellement existants :

- `/activites/` : présentation des activités et lien vers l’espace Jeux. Ne pas inventer une activité Minecraft supplémentaire dans ce lot ; la reprendre uniquement si pertinente dans le site actuel et validée.
- `/jeux/` : choix entre catapulte et JoyStick TCG.
- Un écran de compte/connexion intégré au thème.
- Une page dédiée au TCG ; `/collection/` ou `/jeux/tcg/` à choisir pour éviter les doublons de navigation.

Ajouter Jeux et Activités au header/footer et à la navigation mobile. Prévoir la présentation de l’état connecté et, quand disponibles, solde/niveau et accès rapide à la collection. Les routes exactes n’ont pas été imposées par l’utilisateur.

La connexion est obligatoire pour jouer aux deux jeux. Un accès direct, un bouton ou un Easter Egg conduisant au jeu doit respecter ce parcours. Après connexion, retour vers une destination locale validée. La radio et les pages générales restent consultables sans compte.

Ne pas réécrire la catapulte. Réutiliser son moteur et conserver son comportement, ses commandes et sa compatibilité tactile. Un jeu exécuté dans le navigateur ne peut pas être rendu impossible à exécuter localement par un simple contrôle JavaScript ; protéger réellement la sauvegarde, les données joueur et toute récompense côté serveur.

La possibilité de consulter une collection publique sans jouer, les profils publics et les classements persistants restent hors décision explicite : proposer seulement s’ils ont une utilité et ne pas les substituer au périmètre demandé.

## 7. Comptes joueurs indépendants

### 7.1 Inscription et identité

Pas de création automatique d’utilisateur WordPress. Les joueurs n’accèdent pas à wp-admin. Les administrateurs conservent leur authentification WordPress habituelle pour gérer le plugin.

Le pseudo est unique sans distinction de casse, avec ID technique interne. Définir une normalisation précise et compatible avec la base ; valider l’unicité par contrainte en base, pas seulement par formulaire. Préserver la casse d’affichage si souhaité. Documenter limites de longueur et caractères autorisés.

Le questionnaire parle d’un PIN ; sa longueur exacte n’a pas été fixée. Proposer un format suffisamment robuste avec limitation des tentatives. Aucun PIN, jeton ou code de récupération en clair dans la base, les logs, Git ou les URLs. Les historiques antérieurs proposant un stockage faible ne font pas autorité.

### 7.2 Sessions

Option Se souvenir de moi pendant 30 jours. Définir et documenter également la durée sans cette option. Utiliser des jetons opaques aléatoires, révocables et expirant côté serveur ; conserver seulement une empreinte des secrets lorsque possible. Renouveler l’identifiant de session après authentification, éviter la fixation de session et révoquer après récupération du compte.

Cookies adaptés : HttpOnly, SameSite approprié et Secure en HTTPS. Ne pas fonder l’authentification joueur indépendante sur un nonce public WordPress. Toute route métier vérifie la session joueur et les droits sur la ressource ; prévoir une protection CSRF réellement liée au contexte de session.

Les pages personnalisées et réponses d’authentification ne doivent pas être servies à d’autres joueurs par un cache partagé. Vérifier le comportement sous reverse proxy et les en-têtes de cache.

Pas de bascule silencieuse vers une authentification non chiffrée : l’absence de HTTPS doit être signalée avant installation réelle. Une exception de développement doit être explicite, limitée et désactivée par défaut.

### 7.3 Récupération et administration

À l’inscription, fournir un code de récupération fort à sauvegarder, sans imposer d’e-mail. Le code est à usage unique et renouvelé après utilisation ; il ne doit pas être relu en clair depuis l’administration. Prévoir l’explication et l’étape de sauvegarde dans l’interface.

Un administrateur WordPress autorisé peut réinitialiser un compte après une vérification d’identité appropriée à ce démonstrateur. Définir le protocole, les permissions et le journal. L’administrateur ne récupère jamais le PIN existant. Révoquer les sessions après réinitialisation et avertir des implications de la perte d’un code sans e-mail.

### 7.4 Chat

Pour un joueur connecté, le serveur détermine son ID et son pseudo à partir de la session, jamais du seul corps de la requête. Un invité est signalé comme invité et ne peut pas obtenir un badge d’identité vérifiée en choisissant le pseudo d’un compte.

Conserver le chat existant et les anciens messages ; définir une migration compatible. Il ne s’agit pas d’interdire le chat à tous les invités : la connexion obligatoire concerne les jeux. Auditer uploads, HTML, XSS et contrôles actuels avant enrichissement.

## 8. Catalogue et assets

### 8.1 Production des premières cartes

Objectif : 40 cartes distinctes pour la première série, puis catalogue extensible. Ne pas bloquer toute la mécanique parce que les visuels définitifs ne sont pas encore choisis. Une phase provisoire typographique ou illustrée avec des assets libres est possible, clairement distinguée du catalogue final.

L’utilisateur veut des cartes faciles à produire à partir de ressources Internet gratuites, avec informations et rareté. Il n’a pas nommé le site qui utilise Wikipédia ; ne pas prétendre l’avoir identifié ni copier son catalogue, sa marque ou son design.

### 8.2 Importation proposée

Proposer un import administrateur avec recherche/sélection de la source, aperçu, contrôle des droits et validation avant publication. Wikimedia Commons et son API de fichiers/métadonnées constituent une piste ; les motifs humoristiques originaux avec illustrations libres constituent une alternative. OpenMoji peut servir de source sous respect de sa licence CC BY-SA 4.0.

Une image accessible gratuitement n’est pas automatiquement librement réutilisable. Les memes populaires peuvent cumuler des droits sur photo, personnage, marque ou personnes représentées. La distribution privée lycée/VPN ne transforme pas ces images en domaine public. Écarter toute image sans provenance ou statut de réutilisation compréhensible ; ne pas faire de scraping massif ni de collecte incontrôlée.

L’import doit conserver auteur, source, URL de référence, licence, lien de licence, crédits nécessaires et modifications effectuées. Examiner les contenus externes comme non fiables : assainir les métadonnées HTML, limiter taille et types de fichiers, contrôler les URLs distantes et éviter SSRF. Préférer stockage/cache local des visuels validés pour que les ouvertures de boosters ne dépendent pas d’un service tiers.

L’API n’attribue pas la rareté. La rareté appartient au catalogue du jeu et à son équilibrage. Ne pas la recalculer selon un nombre de vues ou une popularité fluctuante sans décision explicite.

### 8.3 Structure minimale d’une carte

- ID stable, slug, nom et description originale.
- Série, catégorie et tags.
- Image, texte alternatif et éventuel visuel de secours.
- Rareté parmi quatre niveaux ; noms proposés : commune, rare, épique, légendaire.
- Métadonnées de provenance, licence, auteur et crédits.
- État brouillon/publié/retiré et règles d’obtention.
- Champs optionnels pour le futur combat, sans inventer maintenant un moteur de duel.

La variante holo est une propriété distincte de la rareté : une carte commune peut être holographique si le modèle retenu le permet. Conserver les possessions lors du retrait d’une carte du tirage ; un import ou changement d’image ne doit pas casser les IDs.

Démarrer avec un JSON versionné puis fournir l’administration WordPress. Définir qui fait autorité après édition, comment exporter et comment réimporter sans écraser silencieusement les ajustements administrateur.

## 9. Boosters, collection et fragments

### 9.1 Règles confirmées

- 10 boosters de départ par nouveau compte, attribués une seule fois.
- Chaque booster contient 5 cartes.
- Au moins une rare ou supérieure par booster.
- Une recharge gratuite toutes les 10 minutes.
- Achat d’un booster à 60 Joycoins.
- À l’avenir, obtention supplémentaire par des jeux.
- Les doublons sont possibles et conservés.
- Recyclage manuel en fragments ; aucune conversion automatique imposée.

Les 10 boosters produisent 50 tirages, pas une garantie de posséder toutes les 40 cartes. La consommation, le tirage et l’attribution des possessions doivent être une opération serveur atomique et idempotente. Un double clic ou une requête répétée ne doit pas consommer plusieurs boosters ou dupliquer les cartes.

### 9.2 Règles non tranchées

Le plafond de boosters gratuits, le stockage hors connexion, le moment du démarrage du compteur et son interaction avec les 10 boosters initiaux restent ouverts. Ne pas assimiler automatiquement la dotation de 10 à une réserve maximale de 10.

Proposer un modèle simple avant de coder : réserve plafonnée ou non, accumulation hors connexion ou uniquement pendant une session, comportement lorsque la réserve est pleine et calcul au retour. Utiliser l’heure du serveur et un calcul persistant, pas uniquement un minuteur de navigateur.

Définir les probabilités exactes, les slots, la garantie rare et la probabilité holo. Les probabilités affichées doivent correspondre au véritable algorithme. Une garantie rare change la distribution d’un booster : ne pas afficher un taux brut indépendant comme s’il décrivait tous les slots.

Les sources initiale/gratuite/achetée/gagnée peuvent partager un contenu, mais leur provenance doit rester traçable. La différence éventuelle de contenu n’est pas choisie.

### 9.3 Collection et recyclage

Afficher recherche, filtres pertinents, compteurs de possession, rareté, holo, progression de série et fiche détaillée. Concevoir les états vides, chargement, erreur et pagination si le catalogue s’agrandit.

Pour le recyclage, choix explicite de carte/quantité, aperçu des fragments et confirmation. Ne pas recycler une carte verrouillée pour échange ou vente. La valeur des fragments et leurs usages restent à valider ; ne pas promettre de fabrication de cartes si elle n’est pas retenue. Prévenir le recyclage involontaire du dernier exemplaire selon la règle choisie.

## 10. Joycoins, XP et récompenses

Joycoins : monnaie dépensable. XP : progression indépendante. Fragments : ressource de recyclage distincte. Pas de transfert implicite entre ces ressources et pas d’argent réel.

### 10.1 Écoute

Attribuer 10 Joycoins pour chaque palier de 5 minutes d’écoute active ; un booster coûte 60 Joycoins, soit 30 minutes d’écoute avec ce seul mécanisme.

Autoriser l’arrière-plan. Valider raisonnablement la progression à partir d’un protocole de session/heartbeat et de l’heure serveur, sans faire confiance à une durée arbitraire envoyée par le navigateur. Suspendre les gains en pause, arrêt ou erreur de lecture. Ne pas exiger la visibilité de l’onglet si l’utilisateur a choisi l’écoute en arrière-plan.

Une seule session récompensée par compte : gérer onglets, reconnexions et appareils concurrents sans cumuler les gains. Définir la prise de relais et la conservation des minutes partielles. Ne pas créditer des heures d’absence sur un simple heartbeat tardif. Ne pas promettre de vérifier que l’utilisateur entend le son.

Avec les règles choisies, un booster gratuit revient trois fois plus fréquemment qu’un booster acheté par écoute seule. Signaler ce choix d’équilibrage et proposer des plafonds si nécessaire, sans modifier les valeurs validées.

### 10.2 Succès et mini-jeux

Un Easter Egg récompensé une fois par compte et un succès permanent : contrainte d’unicité/idempotence côté serveur. Conserver la possibilité de redéclencher l’effet visuel ou sonore sans répéter le gain.

Le mini-jeu DVD doit proposer des objectifs quotidiens plafonnés, pas un gain infini à chaque coin. Barèmes et plafond non définis. Définir le fuseau du jour de jeu pour éviter les incohérences de reset.

Les récompenses de la catapulte et les futurs gains de boosters par les jeux sont évolutifs. Ne pas inventer de conversion score → Joycoins comme une exigence approuvée. Les scores navigateur doivent recevoir un niveau de confiance cohérent avec le démonstrateur.

Définir séparément les règles XP/niveaux et les badges. Ne pas confondre le solde dépensable avec la progression du niveau.

## 11. Échanges et marché

Ces fonctions sont nécessaires à la première version aboutie, même si elles viennent après la collection. Elles ne doivent pas être reportées indéfiniment sous prétexte que les combats sont futurs.

### 11.1 Échanges

Proposer un parcours simple : joueur destinataire, cartes/quantités offertes et demandées, proposition, acceptation ou refus, annulation et éventuelle expiration. Règles sur Joycoins dans les échanges, échange asymétrique et durée de réservation à valider.

Vérifier propriété et disponibilité lors de la proposition puis de l’acceptation. Verrouiller ou réserver les quantités de manière cohérente. Ne pas permettre le recyclage/la vente d’une quantité engagée. Refuser l’échange avec soi-même. Le transfert de toutes les cartes est atomique ; aucune moitié d’échange ne doit rester appliquée.

Prévoir affichage clair des variantes holo, confirmation du contenu et journal. Si la proposition est modifiée, une acceptation ancienne ne doit pas valider un autre contenu.

### 11.2 Marché

Hypothèse proposée : annonces entre joueurs, achat en Joycoins uniquement. Confirmer cette interprétation et la distinguer d’une boutique système de cartes.

Chaque annonce identifie carte, variante, quantité, prix et vendeur. Achat : disponibilité et solde vérifiés, débit/crédit/transfert atomiques, protection contre deux acheteurs simultanés. Autoriser l’annulation selon une règle explicite. Interdire achat à soi-même et solde négatif.

Frais, bornes de prix, limites d’annonces, durée et politiques de modération restent à définir. Prévoir index et pagination pour ne pas charger tout le marché côté navigateur. Aucune spéculation en argent réel.

## 12. Multimédia et chat enrichi

### 12.1 Métadonnées radio

Afficher titre/artiste et pochette locale, avec un visuel de secours. Interroger le proxy toutes les 10–15 secondes ; cache serveur pour éviter une interrogation amont par chaque auditeur.

Auditer les métadonnées réellement émises par le streamer et celles renvoyées par Icecast/proxy. Si les titres ne sont pas transmis, proposer l’enrichissement du streamer ou de la playlist ; un proxy ne peut pas inventer le morceau en cours. Ne pas déduire un titre d’un état `online`.

Assainir les données et prévoir états hors ligne, erreur et métadonnées anciennes. Aucune API externe de pochette n’est requise par le choix M1.

### 12.2 Chat

Ajouter après audit : réactions, badges, réponses à un message, présence et modération. Définir les permissions, les mesures anti-spam, le traitement des anciens messages et les règles sur messages supprimés/réponses orphelines.

La présence doit être approximative et expirer selon une durée documentée, pas présenter comme connecté un utilisateur dont l’onglet est fermé depuis longtemps. Réserver les badges administrateur/modérateur à des permissions vérifiées.

Conserver les protections uploads et vérifier XSS, contenus HTML, rate limiting et affichage mobile. Éviter la collecte inutile de données personnelles. Définir rétention des messages et journaux selon l’usage lycée.

### 12.3 Soundboard et continuité

Sons locaux au navigateur du joueur uniquement, pas de diffusion dans le chat ni d’injection Icecast. Baisser temporairement le volume radio puis restaurer le niveau courant de façon correcte, y compris après arrêt/erreur et changements de volume pendant un son.

Rechargements entre pages acceptés pour le premier lot. Conserver les fonctionnalités de reprise existantes si utiles, mais ne pas transformer le site en SPA ni lancer une refonte de navigation seulement pour une lecture continue non exigée.

## 13. Direction visuelle et accessibilité

Même identité que le thème existant : reprendre les couleurs, polices et composants réellement audités. Viser une interface soignée, pas ajouter des effets qui masquent les informations.

Collection lisible, cartes reconnaissables, fiche détaillée, animation de booster, reflets/holo et inclinaison au pointeur. Sur tactile : ne pas rendre l’inclinaison ou le survol indispensables ; commandes directes, boutons lisibles, aucun débordement horizontal. Limiter les effets lourds aux interactions et ne pas faire tourner en permanence des animations coûteuses.

Respecter `prefers-reduced-motion`, navigation clavier, focus, labels, erreurs de formulaire et contrastes. La rareté ne doit pas être signalée uniquement par une couleur. Prévoir ouverture sans animation ou animation réduite, fermeture accessible et retour du focus. Éviter le lancement sonore automatique.

Tester au minimum des tailles représentatives : petit téléphone, téléphone courant, tablette et écran PC ; vérifier clavier/souris/tactile. Les tailles exactes et appareils de recette seront documentés par l’agent, pas annoncés comme déjà testés.

## 14. Administration

Administration via WordPress, réservée aux comptes administrateur/modérateur dotés des capacités adéquates ; joueurs indépendants du système WordPress.

Périmètre : catalogue, import JSON, import/validation des assets, crédits/licences, visibilité, probabilité de tirage, paramètres de boosters et récompenses, récupération des comptes et modération du chat/marché selon les lots.

Journaliser les opérations sensibles, distinguer opérations administratives et gains normaux, préserver les possessions. Une attribution manuelle de monnaie ou carte doit être traçable et explicitement autorisée, pas un endpoint public de debug.

Pas de codes secrets dans le dépôt. Documenter configuration, sauvegarde de la base et retour arrière. Ne pas exécuter des migrations destructives au premier affichage d’une page.

## 15. Arbitrages restant ouverts

Ces points n’ont pas été décidés dans le questionnaire. L’agent doit les regrouper dans une proposition concise avec recommandation et impact, pas poser à nouveau les questions déjà résolues.

| Point | Décision attendue | Quand |
|---|---|---|
| URL/HTTPS | Adresse réelle, certificat et reverse proxy. | Avant activation réelle des comptes. |
| PIN | Format, longueur et durée de session sans mémorisation. | Lot comptes. |
| Boosters gratuits | Plafond, hors connexion, compteur plein, interaction avec dotation initiale. | Avant recharge du lot TCG. |
| Probabilités | Noms des raretés, distribution par slot, taux holo, garantie rare. | Avant tirages. |
| Catalogue final | 40 sujets, visuels, sources et validation des licences. | Avant publication de la série. |
| Fragments | Valeur par carte/variante, usage et protection du dernier exemplaire. | Avant recyclage. |
| XP | Barèmes, seuils de niveaux et attribution des badges. | Lot récompenses. |
| Écoute | Minutes partielles, reprise, bascule appareils, plafonds éventuels. | Lot récompenses. |
| DVD/Easter Eggs | Objectifs, gains, plafonds et fuseau quotidien. | Lot récompenses. |
| Échanges | Quantités, expiration, possibilité d’offres asymétriques et monnaie. | Avant échanges. |
| Marché | Joueur-joueur ou boutique complémentaire, prix, frais, limites et expiration. | Avant marché. |
| Métadonnées | Source réelle des titres et mapping des pochettes. | Audit puis lot multimédia. |
| Modération | Rôles, rétention, sanctions et visibilité de l’historique. | Avant chat enrichi/marché. |

Si une proposition n’est pas encore validée, la marquer `proposée`, ne pas l’intégrer à la colonne des choix confirmés. Les dépendances réellement bloquantes doivent être signalées ; les autres ne doivent pas empêcher l’audit ou la préparation.

## 16. Plan de réalisation proposé

Ce découpage est une proposition de mise en œuvre par l’agent habituel ; il ne commande pas de lancer un autre agent. Chaque lot doit avoir périmètre, tests, documentation et validation.

### Phase 0 — Arrêt, audit et plan

Vérifier/arrêter Copilot ; préserver le dépôt local ; auditer le code et le site ; présenter architecture, écarts, migrations et arbitrages. Aucun nouveau développement avant accord sur le plan. Livrable : rapport ciblé et ordre des lots.

### Lot 1 — Comptes et accès aux jeux

Plugin métier, tables joueurs/sessions, inscription/connexion/récupération, interface de compte, Activités, portail Jeux, header/footer/mobile, catapulte intégrée et identité joueur dans le chat. Documentation d’installation et HTTPS. TCG encore indisponible mais annoncé honnêtement.

Critère de sortie : parcours de compte réellement testé ; catapulte accessible via ce parcours ; radio/chat général non cassés ; aucune promesse de TCG fini.

### Lot 2 — Collection et boosters

Catalogue de 40 cartes, modèle rareté/holo, dotation initiale, recharge gratuite, ouverture atomique, collection, doublons, recyclage, administration et gestion des assets/crédits. Achat à 60 Joycoins connecté au portefeuille dès qu’il est disponible ; ne pas simuler un débit dans le navigateur.

Critère de sortie : droits de boosters persistants, collections sauvegardées, règles de tirage exactes et licences validées ou catalogue clairement provisoire.

### Lot 3A — Économie et récompenses

Portefeuille/journal, Joycoins/XP/fragments, écoute active et session unique, achat de boosters, succès et objectifs quotidiens. Implémenter les transactions communes avant les opérations qui en dépendent, même si un socle doit être préparé au lot 2.

Critère de sortie : gains et achats idempotents, aucun crédit multi-onglet ou solde négatif, reprise correcte après erreur.

### Lot 3B — Échanges et marché

Échanges, annonces, réservation/verrouillage, achats atomiques, historique et administration minimale. Ce sous-lot appartient à la première version aboutie, contrairement aux combats.

Critère de sortie : tests de concurrence, pas de duplication, pertes ou double vente ; parcours annulation/refus/expiration vérifié.

### Lot 4 — Multimédia et finition

Métadonnées/pochettes, chat enrichi/modération, soundboard, finition visuelle, accessibilité, performance et recette globale lycée/VPN.

Critère de sortie : recette de bout en bout, installation reproductible, retour arrière documenté, limites connues présentées.

### Évolutions hors première version

Combats IA ou multijoueurs, nouvelles séries, catégories de boosters et récompenses supplémentaires par d’autres jeux. Conserver une architecture évolutive sans développer ces fonctions maintenant.

## 17. Matrice de tests minimale

| Domaine | Cas à couvrir |
|---|---|
| Inscription | Pseudo valide/invalide, casse, collision concurrente et duplication. |
| Connexion | PIN valide/invalide, limitation des essais, réponses ne divulguant pas les secrets. |
| Sessions | Rotation, expiration, révocation, déconnexion, récupération et cookies. |
| Autorisations | Invité refusé sur actions joueur, ressource d’un autre joueur refusée, admin séparé. |
| CSRF/retour | Requête sans protection, origine inattendue, destination externe refusée. |
| Récupération | Code correct/incorrect/réutilisé, renouvellement et révocation des sessions. |
| Plugin/pages | Activations répétées, données préservées, page existante non écrasée, désactivation propre. |
| Navigation | Header/footer/mobile, accès direct, lancement Easter Egg et retour après connexion. |
| Catalogue | Import valide/invalide, IDs stables, HTML assaini, médias/licences manquants. |
| Boosters | 10 initiaux une fois, 5 cartes, garantie rare, double clic, requête répétée et concurrence. |
| Recharge | Limite 10 minutes, plein/vide, hors connexion selon règle, horloge client modifiée. |
| Tirages | Probabilités conformes, holo distinct, absence d’autorité du navigateur. |
| Collection | Doublons, filtres, variante et conservation après retrait de catalogue. |
| Recyclage | Quantités, confirmation, carte verrouillée, double demande et fragments exacts. |
| Écoute | Pause/erreur/reprise, onglet masqué, concurrence onglets/appareils, délais excessifs. |
| Achats | Solde suffisant/insuffisant, double requête, rollback, provenance du booster. |
| Succès/DVD | Attribution unique, plafond quotidien, fuseau et répétition sans nouveau gain. |
| Échanges | Acceptation/refus/annulation/expiration, contenu modifié, verrouillage et rollback. |
| Marché | Deux acheteurs simultanés, double vente, achat à soi-même, solde négatif et annulation. |
| Chat | Invité marqué, usurpation refusée, anciens messages, réactions/réponses et modération. |
| Métadonnées | En ligne/hors ligne, titre absent, pochettes de secours, cache et données assainies. |
| Soundboard | Diminution/restauration volume, sons successifs, arrêt/erreur et contrôle mobile. |
| Interface | Clavier, focus, petit écran, tactile, animations réduites et performances. |
| Déploiement | Sauvegarde, migration, installation, rollback et HTTPS réel ; tests lycée/VPN si accessibles. |

Distinguer tests automatisés, contrôles de syntaxe et recette manuelle. Indiquer commande, résultat, environnement et limites. Un lint réussi ne prouve pas le fonctionnement d’un parcours HTTP. Une simulation de règles ne remplace pas les tests d’authentification/routage/concurrence. Ne jamais annoncer un test VPN ou navigateur qui n’a pas été exécuté.

## 18. Livrables et preuve d’achèvement

À chaque lot : résumé des changements, fichiers concernés, migrations, paramètres et valeurs validées, tests réellement exécutés, captures utiles si possibles, limites, prochaines étapes et instructions d’installation. Un README/guide administrateur doit couvrir les comptes, récupération, catalogue, assets, boosters, économie et marché au fur et à mesure.

Prévoir une recette officielle synthétique pour le projet BTS SIO : objectifs, étapes, résultats attendus/observés et preuves. Ne pas inventer des résultats ni une validation du jury.

Avant déploiement : sauvegarde, environnement de test, compatibilité de versions, activation plugin, pages, migrations, caches, HTTPS, régression radio/chat et plan de retour arrière. Aucun déploiement automatique à la suite d’un commit.

Définition de fini pour la première version aboutie : les deux jeux sont accessibles au bon endroit après connexion ; le TCG dispose d’un catalogue validé, de possessions persistantes, de boosters et d’une économie cohérente, du recyclage, de succès, d’échanges et d’un marché ; administration et documentation existent ; tests et limites sont connus. Les combats ne sont pas requis.

## 19. Première réponse attendue de l’agent habituel

Ne pas redemander tout le questionnaire. Répondre avec :

1. État observé de Copilot et preuve de l’arrêt, ou manipulation encore nécessaire.
2. État du dépôt/local et différences pertinentes avec le site réel.
3. Compréhension du périmètre et confirmation qu’aucun autre agent ne développe en parallèle.
4. Plan d’exécution adapté à l’existant et ordre des dépendances.
5. Liste courte des décisions réellement bloquantes avec recommandations, clairement non validées.
6. Périmètre précis du premier lot proposé, tests et conditions d’installation.

Puis attendre la validation de l’utilisateur avant les modifications de code. Pendant ce temps, aucun lancement d’agent externe, aucune fusion et aucun déploiement.

## 20. Références techniques à consulter

Références publiques de cadrage, non preuves d’une implémentation du projet. Vérifier les détails applicables au moment du développement.

- Gestion/arrêt des sessions Copilot : https://docs.github.com/en/copilot/how-tos/copilot-on-github/use-copilot-agents/manage-and-track-agents
- Sessions et cookies : https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- API fichiers MediaWiki : https://www.mediawiki.org/wiki/API:Imageinfo
- Métadonnées Commons : https://www.mediawiki.org/wiki/Extension:CommonsMetadata
- Licences Commons : https://commons.wikimedia.org/wiki/Commons:Licensing
- FAQ/licence OpenMoji : https://openmoji.org/faq/

Les recommandations et les arbitrages de ce document sont distincts des exigences validées dans le registre. La priorité va aux choix explicites de l’utilisateur, puis aux impératifs de protection des données et aux contraintes réelles de l’existant.
