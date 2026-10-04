<?php
if (!defined('ABSPATH')) {
    exit;
}

final class JFM_Games_Auth
{
    private const COOKIE_NAME = 'jfm_player_session';
    private const FLASH_COOKIE = 'jfm_player_flash';

    private ?array $currentPlayer = null;
    private ?array $currentSession = null;

    public function hooks(): void
    {
        add_action('init', [$this, 'authenticate_from_cookie'], 1);
        add_action('init', [$this, 'cleanup_expired_sessions']);

        add_action('admin_post_nopriv_jfm_player_register', [$this, 'handle_register']);
        add_action('admin_post_jfm_player_register', [$this, 'handle_register']);
        add_action('admin_post_nopriv_jfm_player_login', [$this, 'handle_login']);
        add_action('admin_post_jfm_player_login', [$this, 'handle_login']);
        add_action('admin_post_nopriv_jfm_player_logout', [$this, 'handle_logout']);
        add_action('admin_post_jfm_player_logout', [$this, 'handle_logout']);
        add_action('admin_post_nopriv_jfm_player_recover', [$this, 'handle_recover']);
        add_action('admin_post_jfm_player_recover', [$this, 'handle_recover']);
        add_action('admin_post_nopriv_jfm_player_revoke_other', [$this, 'handle_revoke_other_sessions']);
        add_action('admin_post_jfm_player_revoke_other', [$this, 'handle_revoke_other_sessions']);

        add_action('admin_menu', [$this, 'register_admin_page']);
        add_action('admin_post_jfm_admin_player_reset', [$this, 'handle_admin_reset']);
        add_action('admin_notices', [$this, 'render_admin_notice']);
    }

    public function is_authenticated(): bool
    {
        return $this->currentPlayer !== null && $this->currentSession !== null;
    }

    public function get_current_player(): ?array
    {
        return $this->currentPlayer;
    }

    public function get_current_session(): ?array
    {
        return $this->currentSession;
    }

    public function issue_form_token(string $action): string
    {
        $id = wp_generate_password(20, false, false);
        $token = bin2hex(random_bytes(16));
        set_transient('jfm_form_token_' . $id, [
            'action' => $action,
            'hash' => hash('sha256', $token),
            'created_at' => time(),
        ], 30 * MINUTE_IN_SECONDS);

        return $id . '.' . $token;
    }

    public function verify_form_token(string $action, ?string $packed): bool
    {
        if (!JFM_Games_Utils::is_same_origin_request()) {
            return false;
        }

        $packed = (string) $packed;
        if ($packed === '' || strpos($packed, '.') === false) {
            return false;
        }

        [$id, $token] = explode('.', $packed, 2);
        if ($id === '' || $token === '') {
            return false;
        }

        $key = 'jfm_form_token_' . sanitize_key($id);
        $saved = get_transient($key);
        delete_transient($key);
        if (!is_array($saved)) {
            return false;
        }

        if (($saved['action'] ?? '') !== $action) {
            return false;
        }

        return hash_equals((string) ($saved['hash'] ?? ''), hash('sha256', $token));
    }

    public function must_use_https(): bool
    {
        return !defined('JFM_GAMES_ALLOW_INSECURE_HTTP') || JFM_GAMES_ALLOW_INSECURE_HTTP !== true;
    }

    private function can_process_auth_without_https(): bool
    {
        if ($this->must_use_https() && !is_ssl()) {
            return false;
        }
        return true;
    }

    public function authenticate_from_cookie(): void
    {
        $cookie = $_COOKIE[self::COOKIE_NAME] ?? '';
        if (!is_string($cookie) || $cookie === '' || strpos($cookie, '.') === false) {
            return;
        }

        [$selector, $token] = explode('.', $cookie, 2);
        if ($selector === '' || $token === '') {
            $this->clear_session_cookie();
            return;
        }

        global $wpdb;
        $tableSessions = $wpdb->prefix . 'jfm_player_sessions';
        $tablePlayers = $wpdb->prefix . 'jfm_players';

        $row = $wpdb->get_row($wpdb->prepare(
            "SELECT s.*, p.username_display, p.username_norm
             FROM {$tableSessions} s
             INNER JOIN {$tablePlayers} p ON p.id = s.player_id
             WHERE s.selector = %s
             LIMIT 1",
            $selector
        ));

        if (!$row) {
            $this->clear_session_cookie();
            return;
        }

        if ($row->revoked_at !== null || strtotime((string) $row->expires_at) < time()) {
            $this->clear_session_cookie();
            return;
        }

        $tokenHash = hash('sha256', $token);
        if (!hash_equals((string) $row->token_hash, $tokenHash)) {
            $this->clear_session_cookie();
            return;
        }

        $now = current_time('mysql');
        $wpdb->update($tableSessions, ['last_seen_at' => $now], ['id' => (int) $row->id], ['%s'], ['%d']);

        $this->currentSession = [
            'id' => (int) $row->id,
            'player_id' => (int) $row->player_id,
            'expires_at' => (string) $row->expires_at,
            'csrf_hash' => (string) $row->csrf_hash,
        ];

        $this->currentPlayer = [
            'id' => (int) $row->player_id,
            'username_display' => (string) $row->username_display,
            'username_norm' => (string) $row->username_norm,
        ];
    }

    private function create_session(int $playerId, bool $remember): void
    {
        global $wpdb;
        $tableSessions = $wpdb->prefix . 'jfm_player_sessions';

        $selector = bin2hex(random_bytes(9));
        $token = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
        $csrf = bin2hex(random_bytes(16));

        $expiresTs = time() + ($remember ? 30 * DAY_IN_SECONDS : 12 * HOUR_IN_SECONDS);
        $expiresAt = gmdate('Y-m-d H:i:s', $expiresTs);
        $now = current_time('mysql');

        $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
        $ua = (string) ($_SERVER['HTTP_USER_AGENT'] ?? 'unknown');

        $wpdb->insert($tableSessions, [
            'player_id' => $playerId,
            'selector' => $selector,
            'token_hash' => hash('sha256', $token),
            'csrf_hash' => hash('sha256', $csrf),
            'ip_hash' => hash('sha256', $ip),
            'user_agent_hash' => hash('sha256', $ua),
            'expires_at' => $expiresAt,
            'created_at' => $now,
            'last_seen_at' => $now,
        ], ['%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s']);

        $sessionId = (int) $wpdb->insert_id;
        $this->set_session_cookie($selector . '.' . $token, $expiresTs);

        $this->currentSession = [
            'id' => $sessionId,
            'player_id' => $playerId,
            'expires_at' => $expiresAt,
            'csrf_hash' => hash('sha256', $csrf),
        ];

        $this->refresh_current_player($playerId);
    }

    private function refresh_current_player(int $playerId): void
    {
        global $wpdb;
        $tablePlayers = $wpdb->prefix . 'jfm_players';
        $player = $wpdb->get_row($wpdb->prepare("SELECT id, username_display, username_norm FROM {$tablePlayers} WHERE id=%d", $playerId));
        if ($player) {
            $this->currentPlayer = [
                'id' => (int) $player->id,
                'username_display' => (string) $player->username_display,
                'username_norm' => (string) $player->username_norm,
            ];
        }
    }

    private function revoke_player_sessions(int $playerId, ?int $exceptSessionId = null): void
    {
        global $wpdb;
        $tableSessions = $wpdb->prefix . 'jfm_player_sessions';

        if ($exceptSessionId !== null) {
            $wpdb->query($wpdb->prepare(
                "UPDATE {$tableSessions} SET revoked_at = %s WHERE player_id = %d AND id <> %d AND revoked_at IS NULL",
                current_time('mysql'),
                $playerId,
                $exceptSessionId
            ));
            return;
        }

        $wpdb->query($wpdb->prepare(
            "UPDATE {$tableSessions} SET revoked_at = %s WHERE player_id = %d AND revoked_at IS NULL",
            current_time('mysql'),
            $playerId
        ));
    }

    private function set_session_cookie(string $value, int $expires): void
    {
        $secure = is_ssl();
        setcookie(self::COOKIE_NAME, $value, [
            'expires' => $expires,
            'path' => COOKIEPATH ?: '/',
            'domain' => COOKIE_DOMAIN ?: '',
            'secure' => $secure,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        $_COOKIE[self::COOKIE_NAME] = $value;
    }

    private function clear_session_cookie(): void
    {
        setcookie(self::COOKIE_NAME, '', [
            'expires' => time() - HOUR_IN_SECONDS,
            'path' => COOKIEPATH ?: '/',
            'domain' => COOKIE_DOMAIN ?: '',
            'secure' => is_ssl(),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        unset($_COOKIE[self::COOKIE_NAME]);
        $this->currentPlayer = null;
        $this->currentSession = null;
    }

    private function fail_and_redirect(string $message, string $returnTo): void
    {
        $token = wp_generate_password(20, false, false);
        set_transient('jfm_error_' . $token, $message, 5 * MINUTE_IN_SECONDS);
        wp_safe_redirect(add_query_arg('jfm_error', rawurlencode($token), $returnTo));
        exit;
    }

    private function set_recovery_flash(int $playerId, string $code): void
    {
        $token = wp_generate_password(24, false, false);
        set_transient('jfm_recovery_flash_' . $token, [
            'player_id' => $playerId,
            'code' => $code,
        ], 10 * MINUTE_IN_SECONDS);

        setcookie(self::FLASH_COOKIE, $token, [
            'expires' => time() + 10 * MINUTE_IN_SECONDS,
            'path' => COOKIEPATH ?: '/',
            'domain' => COOKIE_DOMAIN ?: '',
            'secure' => is_ssl(),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        $_COOKIE[self::FLASH_COOKIE] = $token;
    }

    public function pull_recovery_flash_for_current_player(): ?string
    {
        if (!$this->is_authenticated()) {
            return null;
        }

        $token = $_COOKIE[self::FLASH_COOKIE] ?? '';
        if (!is_string($token) || $token === '') {
            return null;
        }

        $key = 'jfm_recovery_flash_' . sanitize_key($token);
        $payload = get_transient($key);
        delete_transient($key);

        setcookie(self::FLASH_COOKIE, '', [
            'expires' => time() - HOUR_IN_SECONDS,
            'path' => COOKIEPATH ?: '/',
            'domain' => COOKIE_DOMAIN ?: '',
            'secure' => is_ssl(),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        unset($_COOKIE[self::FLASH_COOKIE]);

        if (!is_array($payload)) {
            return null;
        }

        if ((int) ($payload['player_id'] ?? 0) !== (int) $this->currentPlayer['id']) {
            return null;
        }

        return (string) ($payload['code'] ?? '');
    }

    public function pull_error_from_query(): ?string
    {
        $token = sanitize_text_field(wp_unslash($_GET['jfm_error'] ?? ''));
        if ($token === '') {
            return null;
        }

        $key = 'jfm_error_' . sanitize_key($token);
        $message = get_transient($key);
        delete_transient($key);
        return is_string($message) ? $message : null;
    }

    private function enforce_rate_limit(string $scope, string $identifier, int $max, int $windowSeconds): bool
    {
        $key = 'jfm_rl_' . md5($scope . '|' . $identifier);
        $count = (int) get_transient($key);
        if ($count >= $max) {
            return false;
        }
        set_transient($key, $count + 1, $windowSeconds);
        return true;
    }

    public function handle_register(): void
    {
        $returnTo = JFM_Games_Utils::validate_local_return_to($_POST['return_to'] ?? home_url('/compte/'));

        if (!$this->verify_form_token('register', $_POST['jfm_form_token'] ?? null)) {
            $this->fail_and_redirect('Session invalide. Recharge la page et réessaie.', $returnTo);
        }

        if (!$this->can_process_auth_without_https()) {
            $this->fail_and_redirect('Connexion sécurisée HTTPS obligatoire pour créer un compte joueur.', $returnTo);
        }

        $usernameRaw = (string) wp_unslash($_POST['username'] ?? '');
        $pin = (string) ($_POST['pin'] ?? '');
        $pinConfirm = (string) ($_POST['pin_confirm'] ?? '');

        $username = JFM_Games_Utils::clean_username_display($usernameRaw);
        $usernameNorm = JFM_Games_Utils::normalize_username($usernameRaw);

        if ($username === '' || $usernameNorm === '') {
            $this->fail_and_redirect('Pseudo obligatoire.', $returnTo);
        }

        if (!JFM_Games_Utils::is_valid_pin($pin) || $pin !== $pinConfirm) {
            $this->fail_and_redirect('PIN invalide (4 à 12 chiffres) ou confirmation différente.', $returnTo);
        }

        $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
        if (!$this->enforce_rate_limit('register_ip', $ip, 10, 10 * MINUTE_IN_SECONDS)) {
            $this->fail_and_redirect('Trop de tentatives d’inscription. Réessaie dans quelques minutes.', $returnTo);
        }

        global $wpdb;
        $tablePlayers = $wpdb->prefix . 'jfm_players';
        $recoveryCode = JFM_Games_Utils::random_recovery_code();

        $inserted = $wpdb->insert($tablePlayers, [
            'username_display' => $username,
            'username_norm' => $usernameNorm,
            'pin_hash' => password_hash($pin, PASSWORD_DEFAULT),
            'recovery_hash' => password_hash($recoveryCode, PASSWORD_DEFAULT),
            'recovery_issued_at' => current_time('mysql'),
            'created_at' => current_time('mysql'),
            'updated_at' => current_time('mysql'),
        ], ['%s', '%s', '%s', '%s', '%s', '%s', '%s']);

        if ($inserted === false) {
            $this->fail_and_redirect('Pseudo déjà utilisé (insensible à la casse) ou erreur base de données.', $returnTo);
        }

        $playerId = (int) $wpdb->insert_id;
        $this->revoke_player_sessions($playerId);
        $this->create_session($playerId, !empty($_POST['remember_me']));
        $this->set_recovery_flash($playerId, $recoveryCode);

        wp_safe_redirect(add_query_arg('jfm_registered', '1', $returnTo));
        exit;
    }

    public function handle_login(): void
    {
        $returnTo = JFM_Games_Utils::validate_local_return_to($_POST['return_to'] ?? home_url('/jeux/'));

        if (!$this->verify_form_token('login', $_POST['jfm_form_token'] ?? null)) {
            $this->fail_and_redirect('Session invalide. Recharge la page et réessaie.', $returnTo);
        }

        if (!$this->can_process_auth_without_https()) {
            $this->fail_and_redirect('Connexion sécurisée HTTPS obligatoire pour les comptes joueurs.', $returnTo);
        }

        $usernameRaw = (string) wp_unslash($_POST['username'] ?? '');
        $pin = (string) ($_POST['pin'] ?? '');
        $usernameNorm = JFM_Games_Utils::normalize_username($usernameRaw);

        $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
        if (!$this->enforce_rate_limit('login_account', $usernameNorm . '|' . $ip, 8, 10 * MINUTE_IN_SECONDS)) {
            $this->fail_and_redirect('Trop de tentatives de connexion. Réessaie plus tard.', $returnTo);
        }

        global $wpdb;
        $tablePlayers = $wpdb->prefix . 'jfm_players';
        $player = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$tablePlayers} WHERE username_norm=%s LIMIT 1", $usernameNorm));

        if (!$player || !password_verify($pin, (string) $player->pin_hash)) {
            $this->fail_and_redirect('Identifiants invalides.', $returnTo);
        }

        $playerId = (int) $player->id;
        $this->revoke_player_sessions($playerId);
        $this->create_session($playerId, !empty($_POST['remember_me']));

        wp_safe_redirect($returnTo);
        exit;
    }

    public function handle_logout(): void
    {
        $returnTo = JFM_Games_Utils::validate_local_return_to($_POST['return_to'] ?? home_url('/'));

        if (!$this->is_authenticated()) {
            wp_safe_redirect($returnTo);
            exit;
        }

        if (!$this->verify_form_token('logout', $_POST['jfm_form_token'] ?? null)) {
            $this->fail_and_redirect('Action refusée (CSRF).', $returnTo);
        }

        global $wpdb;
        $tableSessions = $wpdb->prefix . 'jfm_player_sessions';
        $wpdb->update($tableSessions, ['revoked_at' => current_time('mysql')], ['id' => (int) $this->currentSession['id']], ['%s'], ['%d']);

        $this->clear_session_cookie();
        wp_safe_redirect($returnTo);
        exit;
    }

    public function handle_recover(): void
    {
        $returnTo = JFM_Games_Utils::validate_local_return_to($_POST['return_to'] ?? home_url('/compte/'));

        if (!$this->verify_form_token('recover', $_POST['jfm_form_token'] ?? null)) {
            $this->fail_and_redirect('Session invalide. Recharge la page et réessaie.', $returnTo);
        }

        if (!$this->can_process_auth_without_https()) {
            $this->fail_and_redirect('Connexion sécurisée HTTPS obligatoire pour récupérer un compte.', $returnTo);
        }

        $usernameNorm = JFM_Games_Utils::normalize_username((string) wp_unslash($_POST['username'] ?? ''));
        $recoveryCode = strtoupper(trim((string) wp_unslash($_POST['recovery_code'] ?? '')));
        $newPin = (string) ($_POST['new_pin'] ?? '');
        $newPinConfirm = (string) ($_POST['new_pin_confirm'] ?? '');

        if (!JFM_Games_Utils::is_valid_pin($newPin) || $newPin !== $newPinConfirm) {
            $this->fail_and_redirect('Nouveau PIN invalide.', $returnTo);
        }

        $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
        if (!$this->enforce_rate_limit('recover_account', $usernameNorm . '|' . $ip, 6, 10 * MINUTE_IN_SECONDS)) {
            $this->fail_and_redirect('Trop de tentatives de récupération. Réessaie plus tard.', $returnTo);
        }

        global $wpdb;
        $tablePlayers = $wpdb->prefix . 'jfm_players';
        $player = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$tablePlayers} WHERE username_norm=%s LIMIT 1", $usernameNorm));

        if (!$player || !password_verify($recoveryCode, (string) $player->recovery_hash)) {
            $this->fail_and_redirect('Code de récupération invalide.', $returnTo);
        }

        $newRecoveryCode = JFM_Games_Utils::random_recovery_code();
        $updated = $wpdb->update($tablePlayers, [
            'pin_hash' => password_hash($newPin, PASSWORD_DEFAULT),
            'recovery_hash' => password_hash($newRecoveryCode, PASSWORD_DEFAULT),
            'recovery_issued_at' => current_time('mysql'),
            'updated_at' => current_time('mysql'),
        ], ['id' => (int) $player->id], ['%s', '%s', '%s', '%s'], ['%d']);

        if ($updated === false) {
            $this->fail_and_redirect('Erreur lors de la récupération.', $returnTo);
        }

        $this->revoke_player_sessions((int) $player->id);
        $this->create_session((int) $player->id, false);
        $this->set_recovery_flash((int) $player->id, $newRecoveryCode);

        wp_safe_redirect(add_query_arg('jfm_recovered', '1', $returnTo));
        exit;
    }

    public function handle_revoke_other_sessions(): void
    {
        $returnTo = JFM_Games_Utils::validate_local_return_to($_POST['return_to'] ?? home_url('/compte/'));

        if (!$this->is_authenticated()) {
            $this->fail_and_redirect('Connexion requise.', $returnTo);
        }

        if (!$this->verify_form_token('revoke_other', $_POST['jfm_form_token'] ?? null)) {
            $this->fail_and_redirect('Action refusée (CSRF).', $returnTo);
        }

        $this->revoke_player_sessions((int) $this->currentPlayer['id'], (int) $this->currentSession['id']);
        wp_safe_redirect(add_query_arg('jfm_revoked', '1', $returnTo));
        exit;
    }

    public function cleanup_expired_sessions(): void
    {
        if (mt_rand(1, 100) !== 1) {
            return;
        }

        global $wpdb;
        $tableSessions = $wpdb->prefix . 'jfm_player_sessions';
        $wpdb->query($wpdb->prepare(
            "UPDATE {$tableSessions} SET revoked_at=%s WHERE revoked_at IS NULL AND expires_at < %s",
            current_time('mysql'),
            current_time('mysql')
        ));
    }

    public function register_admin_page(): void
    {
        add_management_page(
            'JFM Comptes joueurs',
            'JFM Comptes joueurs',
            'manage_options',
            'jfm-player-accounts',
            [$this, 'render_admin_page']
        );
    }

    public function render_admin_page(): void
    {
        if (!current_user_can('manage_options')) {
            wp_die('Accès refusé');
        }

        global $wpdb;
        $players = $wpdb->get_results("SELECT id, username_display, username_norm, created_at, updated_at FROM {$wpdb->prefix}jfm_players ORDER BY id DESC LIMIT 200");

        echo '<div class="wrap"><h1>Comptes joueurs JoyStick FM</h1>';
        echo '<p>Réinitialisation manuelle (PIN + code récupération). Le PIN actuel n’est jamais affiché.</p>';

        echo '<table class="widefat striped"><thead><tr><th>ID</th><th>Pseudo</th><th>Normalisé</th><th>Créé</th><th>Actions</th></tr></thead><tbody>';
        foreach ((array) $players as $p) {
            echo '<tr>';
            echo '<td>' . (int) $p->id . '</td>';
            echo '<td>' . esc_html((string) $p->username_display) . '</td>';
            echo '<td>' . esc_html((string) $p->username_norm) . '</td>';
            echo '<td>' . esc_html((string) $p->created_at) . '</td>';
            echo '<td>';
            echo '<form method="post" action="' . esc_url(admin_url('admin-post.php')) . '">';
            wp_nonce_field('jfm_admin_player_reset_' . (int) $p->id);
            echo '<input type="hidden" name="action" value="jfm_admin_player_reset">';
            echo '<input type="hidden" name="player_id" value="' . (int) $p->id . '">';
            echo '<button type="submit" class="button button-primary">Réinitialiser PIN + code</button>';
            echo '</form>';
            echo '</td></tr>';
        }
        echo '</tbody></table></div>';
    }

    public function handle_admin_reset(): void
    {
        if (!current_user_can('manage_options')) {
            wp_die('Accès refusé');
        }

        $playerId = absint($_POST['player_id'] ?? 0);
        check_admin_referer('jfm_admin_player_reset_' . $playerId);

        if ($playerId <= 0) {
            wp_safe_redirect(admin_url('tools.php?page=jfm-player-accounts'));
            exit;
        }

        global $wpdb;
        $tablePlayers = $wpdb->prefix . 'jfm_players';

        $temporaryPin = (string) random_int(100000, 999999);
        $newRecoveryCode = JFM_Games_Utils::random_recovery_code();

        $updated = $wpdb->update($tablePlayers, [
            'pin_hash' => password_hash($temporaryPin, PASSWORD_DEFAULT),
            'recovery_hash' => password_hash($newRecoveryCode, PASSWORD_DEFAULT),
            'recovery_issued_at' => current_time('mysql'),
            'updated_at' => current_time('mysql'),
        ], ['id' => $playerId], ['%s', '%s', '%s', '%s'], ['%d']);

        if ($updated !== false) {
            $this->revoke_player_sessions($playerId);
            $this->insert_admin_log(get_current_user_id(), $playerId, 'admin_reset_credentials', 'PIN+recovery regenerated');

            $notice = [
                'message' => sprintf(
                    'Compte #%d réinitialisé. PIN temporaire: %s — nouveau code récupération: %s',
                    $playerId,
                    $temporaryPin,
                    $newRecoveryCode
                ),
                'type' => 'success',
            ];
            set_transient('jfm_admin_notice_' . get_current_user_id(), $notice, 10 * MINUTE_IN_SECONDS);
        }

        wp_safe_redirect(admin_url('tools.php?page=jfm-player-accounts'));
        exit;
    }

    private function insert_admin_log(int $adminUserId, int $playerId, string $action, string $details): void
    {
        global $wpdb;
        $table = $wpdb->prefix . 'jfm_player_admin_log';
        $wpdb->insert($table, [
            'admin_user_id' => $adminUserId,
            'target_player_id' => $playerId,
            'action' => $action,
            'details' => $details,
            'created_at' => current_time('mysql'),
        ], ['%d', '%d', '%s', '%s', '%s']);
    }

    public function render_admin_notice(): void
    {
        if (!current_user_can('manage_options')) {
            return;
        }
        $key = 'jfm_admin_notice_' . get_current_user_id();
        $notice = get_transient($key);
        if (!is_array($notice)) {
            return;
        }
        delete_transient($key);
        $class = (($notice['type'] ?? '') === 'success') ? 'notice notice-success' : 'notice notice-warning';
        echo '<div class="' . esc_attr($class) . '"><p>' . esc_html((string) ($notice['message'] ?? '')) . '</p></div>';
    }
}
