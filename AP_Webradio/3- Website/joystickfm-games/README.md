# JoyStick FM Games & Accounts (`joystickfm-games`)

Plugin métier WordPress autonome pour la WebRadio **JoyStick FM** (Projet BTS SIO SISR — Atelier Professionnel 1).

---

## 🎯 Rôle & Responsabilités (Lot 1)

Ce plugin sépare strictement la logique métier du rendu visuel du thème :
1. **Comptes Joueurs Indépendants :**
   - Aucun compte créé dans la table `wp_users` de WordPress.
   - Aucun accès au tableau de bord `/wp-admin` accordé aux joueurs.
   - Pseudos uniques insensibles à la casse (`username_canonical`).
   - Code PIN haché en `BCRYPT` (`cost: 12`), jamais exposé ni logué.
   - Code de secours aléatoire fort (format `JFM-XXXX-XXXX-XXXX`), affiché une seule fois à l'inscription, renouvelé à chaque utilisation.
2. **Sessions Sécurisées à Jetons Opaques :**
   - Jetons cryptographiques aléatoires de 64 caractères hexadécimaux.
   - Seule l'empreinte SHA-256 du jeton est stockée en base de données.
   - Durée par défaut de 7 jours (ou 30 jours si « Se souvenir de moi » est coché).
   - Cookie `HttpOnly`, `SameSite=Lax`, `Secure` sous HTTPS.
   - Déconnexion avec révocation immédiate en base de données.
3. **Portail de Jeux & Activités :**
   - Provisionnement automatique et idempotent des pages `/jeux`, `/activites` et `/compte`.
   - Conditionnement d'accès : **connexion obligatoire pour lancer la Catapulte Arcade**.
   - Annonce claire de l'arrivée du **JoyStick TCG** (Lot 2).
4. **Sécurisation de l'Identité du Chat :**
   - Les joueurs connectés ont leur pseudo certifié automatiquement par le serveur via leur session.
   - Les visiteurs non connectés reçoivent le préfixe « Invité · [Nom] » pour empêcher toute usurpation.

---

## 🗄️ Schéma Relationnel MariaDB

Les tables sont créées avec le préfixe dynamique de WordPress (`$wpdb->prefix`) et préservées à la désactivation :

```sql
-- 1. Joueurs
CREATE TABLE wp_jfm_players (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username_canonical VARCHAR(60) NOT NULL UNIQUE,
    username_display VARCHAR(60) NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    recovery_hash VARCHAR(255) DEFAULT NULL,
    recovery_used_at DATETIME DEFAULT NULL,
    joycoins INT NOT NULL DEFAULT 100,
    xp INT NOT NULL DEFAULT 0,
    free_boosters_available INT NOT NULL DEFAULT 10,
    last_free_booster_at DATETIME DEFAULT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- 2. Sessions à jetons opaques
CREATE TABLE wp_jfm_player_sessions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    player_id BIGINT UNSIGNED NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent VARCHAR(255) DEFAULT NULL,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- 3. Journal des interventions administrateur
CREATE TABLE wp_jfm_player_admin_log (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    admin_user_id BIGINT UNSIGNED NOT NULL,
    player_id BIGINT UNSIGNED NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
```

---

## 🧪 Tests Unitaires Automatisés

Pour exécuter la suite de tests en ligne de commande :
```bash
php tests/run-auth-tests.php
```
*Validation : 25 tests d'assertions couvrant la normalisation, le hachage BCRYPT, l'aléa de secours, le hachage SHA-256 et la syntaxe MariaDB.*
