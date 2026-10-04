<?php
/**
 * JoyStick FM — chat-handler.php
 * Actions AJAX pour lire et poster des messages du chat.
 * 
 * Sécurité : nonces WordPress, prepared statements, sanitisation stricte,
 * validation ENUM, whitelist file_url, rate limiting.
 */
defined('ABSPATH') || exit;

define('JFM_CHAT_MAX_LEN', 500);
define('JFM_CHAT_RATE_LIMIT', 5);
define('JFM_CHAT_RATE_WINDOW', 30);
define('JFM_CHAT_USERNAME_MAX', 30);

/* ── Types de messages autorisés ── */
function jfm_allowed_types() {
    return ['text', 'image', 'gif', 'mixed'];
}

/* ── Lire les messages ── */
add_action('wp_ajax_jfm_chat_get', 'jfm_chat_get');
add_action('wp_ajax_nopriv_jfm_chat_get', 'jfm_chat_get');

function jfm_chat_get()
{
    check_ajax_referer('jfm_chat_nonce', 'nonce');

    global $wpdb;
    $table = $wpdb->prefix . 'jfm_chat_messages';
    $since = absint($_GET['since'] ?? 0);

    $rows = $wpdb->get_results($wpdb->prepare(
        "SELECT id, username, message, type, file_url, created_at
         FROM {$table}
         WHERE id > %d AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
         ORDER BY id ASC
         LIMIT 50",
        $since
    ));

    if ($wpdb->last_error) {
        wp_send_json_error(['message' => 'Erreur base de données.'], 500);
    }

    $messages = array_map(function ($r) {
        return [
            'id'         => (int)$r->id,
            'username'   => esc_html($r->username),
            'message'    => esc_html($r->message),
            'type'       => in_array($r->type, jfm_allowed_types(), true) ? $r->type : 'text',
            'file_url'   => $r->file_url ? esc_url($r->file_url) : '',
            'created_at' => sanitize_text_field($r->created_at),
        ];
    }, $rows ?: []);

    wp_send_json_success($messages);
}

/* ── Poster un message ── */
add_action('wp_ajax_jfm_chat_post', 'jfm_chat_post');
add_action('wp_ajax_nopriv_jfm_chat_post', 'jfm_chat_post');

function jfm_chat_post()
{
    check_ajax_referer('jfm_chat_nonce', 'nonce');

    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $ip_hash = hash('sha256', $ip . (defined('AUTH_SALT') ? AUTH_SALT : 'jfm_salt'));

    // Rate limiting
    $transient_key = 'jfm_chat_rl_' . substr($ip_hash, 0, 32);
    $count = (int)get_transient($transient_key);
    if ($count >= JFM_CHAT_RATE_LIMIT) {
        wp_send_json_error(['message' => 'Trop de messages. Attends quelques secondes.'], 429);
    }
    set_transient($transient_key, $count + 1, JFM_CHAT_RATE_WINDOW);

    // ── Détermination serveur de l'identité joueur (anti-usurpation U6) ──
    if (function_exists('jfm_games_get_current_player')) {
        $player = jfm_games_get_current_player();
        if ($player && !empty($player->username_display)) {
            // Joueur authentifié : identité certifiée par sa session
            $username = sanitize_text_field((string)$player->username_display);
        } else {
            // Invité : filtrage et préfixe explicite
            $raw_user = sanitize_text_field(wp_unslash($_POST['username'] ?? ''));
            $raw_user = mb_substr(trim($raw_user), 0, JFM_CHAT_USERNAME_MAX);
            $raw_user = preg_replace('/[<>"\';&\\\\\/]/', '', $raw_user);
            if (empty($raw_user) || strtolower($raw_user) === 'anonyme' || strtolower($raw_user) === 'invite') {
                $username = 'Invité';
            } else {
                $clean = preg_replace('/^Invité(\s*·\s*)?/u', '', $raw_user);
                $username = 'Invité · ' . ($clean ?: 'Anonyme');
            }
        }
    } else {
        $username = sanitize_text_field(wp_unslash($_POST['username'] ?? ''));
        $username = mb_substr(trim($username), 0, JFM_CHAT_USERNAME_MAX);
        $username = preg_replace('/[<>"\';&\\\\\/]/', '', $username);
        if (empty($username)) $username = 'Anonyme';
    }

    $message = sanitize_textarea_field(wp_unslash($_POST['message'] ?? ''));
    $message = mb_substr(trim($message), 0, JFM_CHAT_MAX_LEN);
    // Suppression des balises HTML/script résiduelles
    $message = wp_strip_all_tags($message);

    $file_url = sanitize_url(wp_unslash($_POST['file_url'] ?? ''));
    // Validation whitelist : n'accepter que les URLs du propre site
    if ($file_url && !jfm_validate_file_url($file_url)) {
        $file_url = '';
    }

    if (!$message && !$file_url) {
        wp_send_json_error(['message' => 'Message vide.'], 400);
    }

    // ── Détermination et validation du type ──
    if ($file_url && $message)
        $type = 'mixed';
    elseif ($file_url)
        $type = jfm_detect_file_type($file_url);
    else
        $type = 'text';

    // Validation ENUM — n'accepter que les types autorisés
    if (!in_array($type, jfm_allowed_types(), true)) {
        $type = 'text';
    }

    global $wpdb;
    $table = $wpdb->prefix . 'jfm_chat_messages';

    // Utilisation de $wpdb->insert() avec format strings (prepared statement)
    $inserted = $wpdb->insert($table, [
        'username'   => $username,
        'message'    => $message,
        'type'       => $type,
        'file_url'   => $file_url,
        'ip_hash'    => $ip_hash,
        'created_at' => current_time('mysql'),
    ], ['%s', '%s', '%s', '%s', '%s', '%s']);

    if ($inserted === false) {
        wp_send_json_error(['message' => 'Erreur lors de l\'enregistrement.'], 500);
    }

    wp_send_json_success(['id' => (int)$wpdb->insert_id]);
}

/**
 * Détecte le type de fichier à partir de l'extension URL.
 */
function jfm_detect_file_type($url)
{
    $path = parse_url($url, PHP_URL_PATH);
    if (!$path) return 'image';
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    return $ext === 'gif' ? 'gif' : 'image';
}

/**
 * Valide que l'URL de fichier pointe vers le propre site (whitelist).
 * Empêche les URLs externes malveillantes ou des schémas javascript:.
 */
function jfm_validate_file_url($url)
{
    // Vérifier que c'est une URL HTTP valide
    if (!filter_var($url, FILTER_VALIDATE_URL)) return false;

    // Vérifier le schéma (uniquement http/https)
    $scheme = parse_url($url, PHP_URL_SCHEME);
    if (!in_array($scheme, ['http', 'https'], true)) return false;

    // Vérifier que l'URL pointe vers le propre domaine
    $site_host = parse_url(home_url(), PHP_URL_HOST);
    $url_host  = parse_url($url, PHP_URL_HOST);
    if (!$url_host || strtolower($url_host) !== strtolower($site_host)) return false;

    // Vérifier l'extension du fichier (images uniquement)
    $path = parse_url($url, PHP_URL_PATH);
    $ext  = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    $allowed_exts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!in_array($ext, $allowed_exts, true)) return false;

    return true;
}

/* ── 1. Supprimer un message spécifique (Admin) ── */
add_action('wp_ajax_jfm_chat_delete', 'jfm_chat_delete');
function jfm_chat_delete() {
    check_ajax_referer('jfm_chat_nonce', 'nonce');
    if (!current_user_can('manage_options')) wp_send_json_error(['message' => 'Accès refusé.']);

    $msg_id = absint($_POST['msg_id'] ?? 0);
    if ($msg_id <= 0) wp_send_json_error(['message' => 'ID invalide.']);

    global $wpdb;
    $wpdb->delete(
        $wpdb->prefix . 'jfm_chat_messages',
        ['id' => $msg_id],
        ['%d']
    );
    wp_send_json_success();
}

/* ── 2. Vider tout le chat sans archiver (Admin) ── */
add_action('wp_ajax_jfm_chat_clear', 'jfm_chat_clear');
function jfm_chat_clear() {
    check_ajax_referer('jfm_chat_nonce', 'nonce');
    if (!current_user_can('manage_options')) wp_send_json_error(['message' => 'Accès refusé.']);

    global $wpdb;
    $table = $wpdb->prefix . 'jfm_chat_messages';
    // Utilisation de DELETE au lieu de TRUNCATE pour plus de sécurité (et compat)
    $wpdb->query($wpdb->prepare("DELETE FROM {$table} WHERE 1=%d", 1));
    // Réinitialiser l'auto-increment
    $wpdb->query($wpdb->prepare("ALTER TABLE {$table} AUTO_INCREMENT = %d", 1));
    wp_send_json_success();
}

/* ── 3. Archiver manuellement la conversation (Admin) ── */
add_action('wp_ajax_jfm_chat_archive_manual', 'jfm_chat_archive_manual');
function jfm_chat_archive_manual() {
    check_ajax_referer('jfm_chat_nonce', 'nonce');
    if (!current_user_can('manage_options')) wp_send_json_error(['message' => 'Accès refusé.']);

    // Appel direct à la fonction d'archivage existante
    joystickfm_archive_chat();
    wp_send_json_success(['message' => 'Chat archivé dans wp-content/uploads/chat_archives/ et vidé avec succès.']);
}