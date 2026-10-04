# Cahier des charges — Jeux JoyStick FM (lot 1 implémenté)

## Décisions validées (à respecter)
- **A1** : plugin métier autonome (`joystickfm-games`), thème conservé pour l’interface.
- **A2** : accès aux deux jeux via header/footer + page **Activités**.
- **A3** : catalogue JSON initial puis administration WordPress.
- **A4** : données relationnelles MariaDB préfixées WordPress, indépendantes du thème.
- **A5** : cible réseau lycée + VPN ; URL/HTTPS à vérifier au déploiement réel.

## Lot 1 (périmètre implémenté)
1. Plugin `joystickfm-games` avec migrations versionnées idempotentes, sans suppression des données à la désactivation.
2. Comptes joueurs indépendants de WordPress : inscription, connexion, déconnexion, profil de session, récupération, reset manuel admin WP.
3. PIN jamais stocké en clair (`password_hash` / `password_verify`), pseudo normalisé unique en base (insensible à la casse).
4. Code de récupération aléatoire fort, affiché une fois, stocké haché, invalidé après usage puis régénéré.
5. Sessions opaques (cookie HttpOnly + SameSite ; `Secure` sous HTTPS), rotation à la connexion, révocation/expiration serveur.
6. Pages `/jeux`, `/activites`, `/compte` créées de manière idempotente ; redirection de retour uniquement locale validée.
7. Portail jeux : catapulte disponible après connexion ; TCG affiché « en préparation » (pas de faux bouton fonctionnel).
8. Chat : identité connectée imposée côté serveur ; invités explicitement marqués ; aucun pseudo navigateur ne valide une identité joueur.

## Sécurité lot 1
- Authentification joueur indépendante (les nonces/cookies publics WordPress ne valent pas authentification joueur).
- Contrôle d’origine + jeton CSRF dédié sur les formulaires joueurs.
- Limitation des tentatives (compte + source).
- Requêtes SQL préparées / API `$wpdb` paramétrées.
- Échappement des sorties.
- Aucun secret en URL, logs applicatifs, ni localStorage.
- En HTTP non sécurisé : blocage des opérations compte joueur par défaut.
  - Exception développement explicitement opt-in via constante `JFM_GAMES_ALLOW_INSECURE_HTTP` (désactivée par défaut).

## Contraintes rappelées
- **U1** : aucune création automatique d’utilisateur WordPress joueur.
- **U5** : connexion obligatoire pour jouer ; radio/pages publiques accessibles.
- **U6** : pseudo serveur imposé dans le chat pour un connecté ; invités identifiés.
- Pas de merge auto, pas de déploiement infra, pas de modification VM réelle dans cette PR.
