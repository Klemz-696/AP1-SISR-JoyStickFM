<?php
/**
 * JoyStick FM Games — Service d'Authentification & Sessions Joueurs
 *
 * Responsabilité : Inscription, connexion, cycle de vie des sessions,
 * hachage sécurisé, récupération par code fort et journalisation admin.
 */

if (!defined('ABSPATH')) {
    exit;
}

class JFM_Games_Auth {

    const COOKIE_NAME = 'jfm_player_session';
    const SESSION_DURATION_DEFAULT = 604800;   // 7 jours (en secondes)
    const SESSION_DURATION_REMEMBER = 2592000; // 30 jours (en secondes)

    private static $current_player = null;
    private static $player_checked = false;

    /**
     * Inscription d'un nouveau joueur
     *
     * @param string $username
     * @param string $pin
     * @return array [bool $success, mixed $data_or_error]
     */
    public static function register($username, $pin) {
        global $wpdb;

        $ip = JFM_Games_Utils::get_client_ip();
        if (!JFM_Games_Utils::check_rate_limit('register', $ip)) {
            return [false, 'Trop de tentatives depuis votre adresse IP. Veuillez patienter 15 minutes.'];
        }

        list($valid_u, $err_u) = JFM_Games_Utils::validate_username($username);
        if (!$valid_u) {
            return [false, $err_u];
        }

        list($valid_p, $err_p) = JFM_Games_Utils::validate_pin($pin);
        if (!$valid_p) {
            return [false, $err_p];
        }

        $canonical = JFM_Games_Utils::canonicalize_username($username);
        $display = sanitize_text_field(trim($username));

        // Vérification de l'unicité du pseudo
        $table_players = $wpdb->prefix . 'jfm_players';
        $existing = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$table_players} WHERE username_canonical = %s LIMIT 1",
            $canonical
        ));

        if ($existing) {
            return [false, 'Ce pseudo est déjà utilisé. Veuillez en choisir un autre.'];
        }

        // Hachage du code PIN
        $pin_hash = password_hash($pin, PASSWORD_BCRYPT, ['cost' => 12]);

        // Génération du code de secours fort
        $recovery_code = JFM_Games_Utils::generate_recovery_code();
        $recovery_hash = password_hash($recovery_code, PASSWORD_BCRYPT, ['cost' => 12]);

        $now = current_time('mysql');
        $inserted = $wpdb->insert($table_players, [
            'username_canonical'      => $canonical,
            'username_display'        => $display,
            'pin_hash'                => $pin_hash,
            'recovery_hash'           => $recovery_hash,
            'joycoins'                => 100, // Dotation de bienvenue
            'xp'                      => 0,
            'free_boosters_available' => 10,  // 10 boosters initiaux
            'last_free_booster_at'    => $now,
            'status'                  => 'active',
            'created_at'              => $now
        ], ['%s', '%s', '%s', '%s', '%d', '%d', '%d', '%s', '%s', '%s']);

        if (!$inserted) {
            return [false, 'Erreur lors de la création du compte.'];
        }

        $player_id = $wpdb->insert_id;
        JFM_Games_Utils::clear_rate_limit('register', $ip);

        // Connexion immédiate du nouveau compte
        self::create_session($player_id, false);

        return [true, [
            'player_id'     => $player_id,
            'username'      => $display,
            'recovery_code' => $recovery_code, // Renvoyé UNIQUEMENT cette fois-ci pour sauvegarde
            'joycoins'      => 100,
            'free_boosters' => 10
        ]];
    }

    /**
     * Connexion d'un joueur
     *
     * @param string $username
     * @param string $pin
     * @param bool $remember_me
     * @return array [bool $success, mixed $data_or_error]
     */
    public static function login($username, $pin, $remember_me = false) {
        global $wpdb;

        $ip = JFM_Games_Utils::get_client_ip();
        $canonical = JFM_Games_Utils::canonicalize_username($username);

        // Contrôle de limitation de débit sur l'IP et sur le compte
        if (!JFM_Games_Utils::check_rate_limit('login_ip', $ip) ||
            !JFM_Games_Utils::check_rate_limit('login_user', $canonical)) {
            return [false, 'Trop de tentatives infructueuses. Compte temporairement verrouillé pour 15 minutes.'];
        }

        $table_players = $wpdb->prefix . 'jfm_players';
        $player = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table_players} WHERE username_canonical = %s AND status = 'active' LIMIT 1",
            $canonical
        ));

        if (!$player || !password_verify($pin, $player->pin_hash)) {
            return [false, 'Pseudo ou code PIN incorrect.'];
        }

        // Réinitialisation des compteurs d'échec
        JFM_Games_Utils::clear_rate_limit('login_ip', $ip);
        JFM_Games_Utils::clear_rate_limit('login_user', $canonical);

        // Création de la session
        self::create_session($player->id, (bool)$remember_me);

        return [true, [
            'player_id'     => (int)$player->id,
            'username'      => $player->username_display,
            'joycoins'      => (int)$player->joycoins,
            'xp'            => (int)$player->xp,
            'free_boosters' => (int)$player->free_boosters_available
        ]];
    }

    /**
     * Déconnexion du joueur courant
     *
     * @return bool
     */
    public static function logout() {
        global $wpdb;

        $token = self::get_cookie_token();
        if ($token) {
            $token_hash = hash('sha256', $token);
            $table_sessions = $wpdb->prefix . 'jfm_player_sessions';
            $wpdb->update($table_sessions, [
                'revoked_at' => current_time('mysql')
            ], ['token_hash' => $token_hash], ['%s'], ['%s']);
        }

        self::clear_cookie();
        self::$current_player = null;
        self::$player_checked = true;

        return true;
    }

    /**
     * Récupère le joueur actuellement connecté
     *
     * @return object|null
     */
    public static function get_current_player() {
        if (self::$player_checked) {
            return self::$current_player;
        }

        self::$player_checked = true;
        self::$current_player = null;

        $token = self::get_cookie_token();
        if (!$token) {
            return null;
        }

        global $wpdb;
        $token_hash = hash('sha256', $token);
        $table_sessions = $wpdb->prefix . 'jfm_player_sessions';
        $table_players  = $wpdb->prefix . 'jfm_players';

        $row = $wpdb->get_row($wpdb->prepare(
            "SELECT p.id, p.username_canonical, p.username_display, p.joycoins, p.xp, 
                    p.free_boosters_available, p.last_free_booster_at, p.status, s.expires_at
             FROM {$table_sessions} s
             INNER JOIN {$table_players} p ON p.id = s.player_id
             WHERE s.token_hash = %s 
               AND s.revoked_at IS NULL 
               AND s.expires_at > %s 
               AND p.status = 'active'
             LIMIT 1",
            $token_hash,
            current_time('mysql')
        ));

        if ($row) {
            self::$current_player = $row;
        } else {
            // Jeton expiré ou révoqué
            self::clear_cookie();
        }

        return self::$current_player;
    }

    /**
     * Récupération de compte via code de secours à usage unique
     *
     * @param string $username
     * @param string $recovery_code
     * @param string $new_pin
     * @return array [bool $success, mixed $data_or_error]
     */
    public static function recover_account($username, $recovery_code, $new_pin) {
        global $wpdb;

        $canonical = JFM_Games_Utils::canonicalize_username($username);
        list($valid_p, $err_p) = JFM_Games_Utils::validate_pin($new_pin);
        if (!$valid_p) {
            return [false, $err_p];
        }

        $table_players = $wpdb->prefix . 'jfm_players';
        $player = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table_players} WHERE username_canonical = %s AND status = 'active' LIMIT 1",
            $canonical
        ));

        if (!$player || empty($player->recovery_hash)) {
            return [false, 'Informations de récupération invalides.'];
        }

        $clean_code = strtoupper(trim((string)$recovery_code));
        if (!password_verify($clean_code, $player->recovery_hash)) {
            return [false, 'Code de secours incorrect.'];
        }

        // Hachage du nouveau PIN
        $new_pin_hash = password_hash($new_pin, PASSWORD_BCRYPT, ['cost' => 12]);

        // Génération d'un NOUVEAU code de secours pour remplacer l'ancien (à usage unique)
        $new_recovery_code = JFM_Games_Utils::generate_recovery_code();
        $new_recovery_hash = password_hash($new_recovery_code, PASSWORD_BCRYPT, ['cost' => 12]);

        $wpdb->update($table_players, [
            'pin_hash'         => $new_pin_hash,
            'recovery_hash'    => $new_recovery_hash,
            'recovery_used_at' => current_time('mysql')
        ], ['id' => $player->id], ['%s', '%s', '%s'], ['%d']);

        // Révocation de toutes les anciennes sessions du joueur
        self::revoke_all_sessions($player->id);

        return [true, [
            'message'           => 'Code PIN réinitialisé avec succès. Veuillez vous reconnecter.',
            'new_recovery_code' => $new_recovery_code
        ]];
    }

    /**
     * Réinitialisation administrative sécurisée d'un PIN joueur
     *
     * @param int $player_id
     * @param string $new_pin
     * @return array [bool $success, string $message]
     */
    public static function admin_reset_pin($player_id, $new_pin) {
        if (!current_user_can('manage_options')) {
            return [false, 'Permissions insuffisantes.'];
        }

        list($valid_p, $err_p) = JFM_Games_Utils::validate_pin($new_pin);
        if (!$valid_p) {
            return [false, $err_p];
        }

        global $wpdb;
        $table_players = $wpdb->prefix . 'jfm_players';
        $new_pin_hash = password_hash($new_pin, PASSWORD_BCRYPT, ['cost' => 12]);

        $updated = $wpdb->update($table_players, [
            'pin_hash' => $new_pin_hash
        ], ['id' => (int)$player_id], ['%s'], ['%d']);

        if ($updated === false) {
            return [false, 'Erreur lors de la mise à jour en base de données.'];
        }

        self::revoke_all_sessions($player_id);

        // Journal d'audit admin (sans enregistrer le PIN en clair !)
        $table_log = $wpdb->prefix . 'jfm_player_admin_log';
        $wpdb->insert($table_log, [
            'admin_user_id' => get_current_user_id(),
            'player_id'     => (int)$player_id,
            'action'        => 'admin_reset_pin',
            'details'       => 'Réinitialisation manuelle du code PIN et révocation des sessions actives.',
            'ip_address'    => JFM_Games_Utils::get_client_ip(),
            'created_at'    => current_time('mysql')
        ], ['%d', '%d', '%s', '%s', '%s', '%s']);

        return [true, 'Code PIN mis à jour avec succès. Les sessions du joueur ont été révoquées.'];
    }

    /**
     * Crée une session à jeton opaque et dépose le cookie
     */
    private static function create_session($player_id, $remember_me = false) {
        global $wpdb;

        $raw_token = bin2hex(random_bytes(32)); // 64 caractères aléatoires sécurisés
        $token_hash = hash('sha256', $raw_token);

        $duration = $remember_me ? self::SESSION_DURATION_REMEMBER : self::SESSION_DURATION_DEFAULT;
        $expires_time = time() + $duration;
        $expires_at = date('Y-m-d H:i:s', $expires_time);

        $table_sessions = $wpdb->prefix . 'jfm_player_sessions';
        $wpdb->insert($table_sessions, [
            'player_id'   => (int)$player_id,
            'token_hash'  => $token_hash,
            'ip_address'  => JFM_Games_Utils::get_client_ip(),
            'user_agent'  => sanitize_text_field(substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255)),
            'expires_at'  => $expires_at,
            'created_at'  => current_time('mysql')
        ], ['%d', '%s', '%s', '%s', '%s', '%s']);

        self::set_cookie($raw_token, $expires_time);
        self::$player_checked = false; // Forcer rechargement
    }

    /**
     * Révoque toutes les sessions d'un joueur
     */
    public static function revoke_all_sessions($player_id) {
        global $wpdb;
        $table_sessions = $wpdb->prefix . 'jfm_player_sessions';
        $wpdb->update($table_sessions, [
            'revoked_at' => current_time('mysql')
        ], ['player_id' => (int)$player_id, 'revoked_at' => null], ['%s'], ['%d']);
    }

    private static function set_cookie($token, $expires_time) {
        $secure = JFM_Games_Utils::is_ssl_secure();
        
        // Dérogation locale explicite si définie
        if (!$secure && defined('JFM_GAMES_ALLOW_INSECURE_HTTP') && JFM_GAMES_ALLOW_INSECURE_HTTP) {
            $secure = false;
        }

        setcookie(self::COOKIE_NAME, $token, [
            'expires'  => $expires_time,
            'path'     => '/',
            'domain'   => '',
            'secure'   => $secure,
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
        $_COOKIE[self::COOKIE_NAME] = $token;
    }

    private static function clear_cookie() {
        setcookie(self::COOKIE_NAME, '', [
            'expires'  => time() - 3600,
            'path'     => '/',
            'domain'   => '',
            'secure'   => JFM_Games_Utils::is_ssl_secure(),
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
        unset($_COOKIE[self::COOKIE_NAME]);
    }

    private static function get_cookie_token() {
        return $_COOKIE[self::COOKIE_NAME] ?? null;
    }
}
