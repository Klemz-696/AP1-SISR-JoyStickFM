# joystickfm-games (lot 1)

Plugin WordPress autonome pour les comptes joueurs et le portail jeux JoyStick FM.

## Prérequis (issus du code audité)
- WordPress 6.x
- PHP >= 7.4
- MariaDB/MySQL (via `$wpdb`)
- Thème `joystickfm-theme` actif

## Installation / activation
1. Copier le dossier `joystickfm-games` dans `wp-content/plugins/`.
2. Activer le plugin dans WordPress (`Extensions`).
3. Vérifier la création idempotente des tables :
   - `{prefix}jfm_players`
   - `{prefix}jfm_player_sessions`
   - `{prefix}jfm_player_admin_log`
4. Vérifier la création idempotente des pages : `/jeux`, `/activites`, `/compte`.

## Sécurité lot 1
- PIN : haché (`password_hash`), vérifié (`password_verify`), jamais exposé.
- Sessions : cookie opaque `HttpOnly`, `SameSite=Lax`, `Secure` quand HTTPS.
- HTTPS obligatoire par défaut pour les opérations compte joueur.
  - Exception dev explicite : `define('JFM_GAMES_ALLOW_INSECURE_HTTP', true);`.
- Code récupération : affiché une fois, haché, régénéré après usage.
- Reset admin : capacité `manage_options`, nonce WP, journalisation admin.

## Retour arrière (sans suppression des données)
1. Désactiver le plugin dans WordPress.
2. Le thème reste fonctionnel sans erreur fatale.
3. Les tables joueurs/sessions/journal sont conservées.

## Recette manuelle (desktop/mobile)
1. Créer un compte joueur depuis `/compte`.
2. Vérifier affichage unique du code de récupération.
3. Se déconnecter/reconnecter (PIN valide/invalide).
4. Vérifier redirection locale `return_to` (rejeter destination externe).
5. Depuis `/jeux`, lancer catapulte connecté ; en invité, redirection vers `/compte`.
6. Déclencher le Konami Code en invité : doit mener à la connexion.
7. Chat connecté : pseudo serveur imposé ; invité : préfixe `Invité`.
8. Dans WP admin > Outils > JFM Comptes joueurs : reset manuel et révocation sessions.

## Limites connues lot 1
- Pas d’économie Joycoins/XP (lot 3).
- TCG en préparation (lot 2), pas de combats (reportés).
- Pas de validation réseau lycée/VPN/HTTPS réel depuis cette PR locale.
