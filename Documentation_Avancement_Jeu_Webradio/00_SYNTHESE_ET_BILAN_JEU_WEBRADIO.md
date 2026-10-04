# 🎮 JoyStick FM — Bilan & Synthèse d'Avancement du Jeu WebRadio
**Projet AP 1 — BTS SIO SISR (Option SISR - Lycée Sidoine Apollinaire)**  
**Binôme :** Clément SAUZÈDE (Étu 04 - Lead Réseau & Dev) & Mathys DUTHILLEUL (Étu 10 - Admin Systèmes)  
**Date d'archivage / mise en réserve :** 05 Octobre 2026  
**État du module :** 100% Fonctionnel, validé et déployé sur le serveur WebRadio (`10.100.0.51`)

---

## 📌 1. Vue d'Ensemble & Objectifs Atteints

Le module **JoyStick Games** a été conçu pour transformer la WebRadio JoyStick FM en une véritable plateforme multimédia interactive et communautaire. Il combine :
1. **Un jeu de cartes à collectionner rétro (JoyStick TCG)** composé de 40 cartes uniques réparties en 4 catégories (Hardware, Héros, Studio FM, Objets/Sorts) et 4 niveaux de rareté (Commune, Rare, Épique, Légendaire).
2. **Un mini-jeu Catapulte Arcade rétro** sous HTML5 Canvas avec physique réaliste, gestion des highscores et synchronisation du meilleur record dans le profil du joueur.
3. **Un système complet d'authentification autonome et sécurisée** (compte joueur avec pseudo, code PIN à 4 chiffres, code de secours, solde de JoyCoins, XP et niveaux).
4. **Un Studio Avatar interactif** permettant d'importer une photo personnalisée (avec recadrage) ou d'arborer l'illustration d'une carte débloquée.
5. **Un univers de jeu totalement indépendant (« Standalone »)** qui s'exécute en plein écran (100vh) dans un onglet dédié sans être parasité par l'interface conventionnelle de la radio.

---

## 🎯 2. Tableau de Conformité des Exigences Utilisateur

| Exigence Demandée | Implémentation Réalisée | Fichiers Clés | Statut |
| :--- | :--- | :--- | :---: |
| **Booster 3D au centre de l'écran** | Booster texturé placé rigoureusement au centre de la scène, avec survol interactif, badge pulsant *« 👆 CLIQUER POUR OUVRIR »* et gros bouton néon sous le paquet. | `class-jfm-games-pages.php`<br>`games-portal.css` | **VALIDÉ ✅** |
| **Animation d'ouverture du booster** | Animation de tremblement progressif (`boosterShake`) puis déchirure spectaculaire avec flash blanc lumineux et transition fluide vers la scène de pioche. | `portal.js`<br>`games-portal.css` | **VALIDÉ ✅** |
| **Pioche carte par carte (Card-by-Card)** | Modale cinéma affichant la carte face cachée avec dos rétro cybernétique JoyStick TCG 1986. Clic sur la carte ou sur le bouton pour déclencher une rotation 3D à 180° (`rotateY(180deg)`). | `portal.js`<br>`games-portal.css` | **VALIDÉ ✅** |
| **Suspense & Tri par rareté** | Tri algorithmique strict par rareté croissante (`commune` ➔ `rare` ➔ `epique` ➔ `legendaire`) à la fois côté serveur PHP et côté client JS. Les cartes légendaires apparaissent toujours en dernière position. | `class-jfm-games-tcg.php`<br>`portal.js` | **VALIDÉ ✅** |
| **Animations & Sons de rareté** | Auras lumineuses et particules sonores Web Audio adaptées à chaque rareté (Aura dorée + carillon pour Légendaire, violette pour Épique, cyan pour Rare). | `portal.js`<br>`games-portal.css` | **VALIDÉ ✅** |
| **Option « Tout révéler d'un coup »** | Bouton `⚡ TOUT RÉVÉLER D'UN COUP` dans la barre supérieure de la modale permettant d'accéder instantanément au récapitulatif des 5 cartes. | `class-jfm-games-pages.php`<br>`portal.js` | **VALIDÉ ✅** |
| **Décompte du prochain booster** | Compteur dynamique en temps réel (`⏳ Prochain booster gratuit dans : MM:SS`). Badge de réclamation immédiate dès la fin du compte à rebours. | `portal.js` | **VALIDÉ ✅** |
| **Enchaînement direct des boosters** | Bouton proéminent `📦 OUVRIR LE PROCHAIN BOOSTER (X restant) »` sur le récapitulatif permettant d'enchaîner les ouvertures sans fermer la modale ni repasser par la collection. | `portal.js`<br>`class-jfm-games-pages.php` | **VALIDÉ ✅** |
| **Style des boutons (Déconnexion & Avatar)** | Bouton de déconnexion stylisé en rouge néon cyber (`.jfm-btn-danger-cyber`). Bouton de remise à zéro de l'avatar stylisé avec icône (`.jfm-btn-reset-avatar`). | `games-portal.css`<br>`class-jfm-games-pages.php` | **VALIDÉ ✅** |
| **Bouton de suppression de compte** | Bouton `🗑 Supprimer mon compte` sur la page `/compte` et dans le profil de jeu, avec modale de confirmation et suppression en cascade dans MariaDB (inventaire, sessions, logs, compte). | `class-jfm-games-auth.php`<br>`class-jfm-games-pages.php` | **VALIDÉ ✅** |
| **Page de jeu à part (Standalone)** | Template dédié `page-jeux.php` purgeant le header et le footer radio. Affichage 100vh gaming cockpit. Liens dans le header, le footer et `/activites` avec `target="_blank"`. | `page-jeux.php`<br>`header.php`<br>`footer.php` | **VALIDÉ ✅** |
| **Espace Compte complet (`/compte`)** | Affichage de l'avatar réel, pseudo, niveau d'XP, solde de JoyCoins, total de cartes débloquées (X/40 - Y%), record Catapulte Arcade et bouton plein écran. | `class-jfm-games-pages.php`<br>`portal.js` | **VALIDÉ ✅** |

---

## 💻 3. Déploiement & Environnement Serveur

- **Hôte cible :** VM Debian 12 `Debian_Web` (`10.100.0.51`) dans le VLAN DMZ Externe (100).
- **Base de données :** MariaDB `joystickfm_db` (tables `wp_jfm_players`, `wp_jfm_tcg_cards`, `wp_jfm_player_cards`, `wp_jfm_player_sessions`, `wp_jfm_daily_claims`).
- **Thème :** `/var/www/html/wp-content/themes/joystickfm-theme/` (avec `page-jeux.php`).
- **Plugin :** `/var/www/html/wp-content/plugins/joystickfm-games/`.
- **Dépôt Git :** Branche `main` synchronisée (`commit b63e9c1`).

Ce module est entièrement stable, testé et prêt à être réactivé ou étendu à tout moment.
