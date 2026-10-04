<?php
/**
 * JoyStick FM — functions.php
 * Fonctions WordPress du thème sur-mesure
 */

/* ══════════════════════════════════════════════
 1. SUPPORT DU THÈME
 ══════════════════════════════════════════════ */
function joystickfm_setup()
{
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption']);
}
add_action('after_setup_theme', 'joystickfm_setup');

/* ══════════════════════════════════════════════
 2. ENQUEUE DES SCRIPTS ET STYLES (CENTRALISÉ)
 ══════════════════════════════════════════════ */
function joystickfm_enqueue()
{
    $v = '6.0.' . time(); // Utilisation de time() pour forcer le rafraîchissement du cache pendant tes tests

    // --- 1. LES STYLES (CSS & FONTS) ---
    wp_enqueue_style('jfm-fonts-pixel', 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Share+Tech+Mono&display=swap', [], null);
    wp_enqueue_style('jfm-style', get_template_directory_uri() . '/assets/css/style.css', [], $v);
    wp_enqueue_style('jfm-animations', get_template_directory_uri() . '/assets/css/animations.css', ['jfm-style'], $v);
    wp_enqueue_style('jfm-responsive', get_template_directory_uri() . '/assets/css/responsive.css', ['jfm-style'], $v);
    wp_enqueue_style('jfm-xpbar', get_template_directory_uri() . '/assets/css/xp-bar-styles.css', ['jfm-style'], $v);

    // Le CSS du Chat
    wp_enqueue_style('jfm-chat-style', get_template_directory_uri() . '/assets/css/chat.css', [], $v);

    // --- 2. FORCER JQUERY ---
    wp_enqueue_script('jquery');

    // --- 3. LES SCRIPTS (JS) ---
    wp_enqueue_script('jfm-launch-game', get_template_directory_uri() . '/assets/js/joystick-launch-game.js', [], $v, true);
    wp_enqueue_script('jfm-easter-eggs', get_template_directory_uri() . '/assets/js/easter-eggs.js', ['jfm-launch-game'], $v, true);
    wp_enqueue_script('jfm-radio-player', get_template_directory_uri() . '/assets/js/radio-player.js', ['jfm-easter-eggs'], $v, true);
    wp_enqueue_script('jfm-main', get_template_directory_uri() . '/assets/js/main.js', ['jfm-radio-player'], $v, true);
    wp_enqueue_script('jfm-dvd-bouncer', get_template_directory_uri() . '/assets/js/dvd-bouncer.js', ['jfm-easter-eggs'], $v, true);

    if (is_page('contact')) {
        wp_enqueue_script('jfm-form', get_template_directory_uri() . '/assets/js/form-validation.js', [], $v, true);
    }

    // Le JS du Chat (dépend de jquery)
    wp_enqueue_script('jfm-chat-script', get_template_directory_uri() . '/assets/js/chat.js', array('jquery'), $v, true);

    $current_request = isset($_SERVER['REQUEST_URI']) ? wp_unslash($_SERVER['REQUEST_URI']) : '/jeux/';
    $default_login_url = home_url('/compte/');
    if (function_exists('jfm_games_get_login_url')) {
        $default_login_url = jfm_games_get_login_url($current_request);
    }

    $player_auth = [
        'logged_in' => false,
        'login_url' => $default_login_url,
        'player_name' => '',
    ];

    if (function_exists('jfm_games_is_player_authenticated') && jfm_games_is_player_authenticated()) {
        $player = function_exists('jfm_games_get_current_player') ? jfm_games_get_current_player() : null;
        $player_auth['logged_in'] = true;
        $player_auth['player_name'] = isset($player['username_display']) ? (string) $player['username_display'] : '';
    }

    wp_localize_script('jfm-launch-game', 'JFM_PLAYER_AUTH', $player_auth);

    // --- 4. LES VARIABLES GLOBALES (Localize) ---
    wp_localize_script('jfm-radio-player', 'JFM_CONFIG', [
        'theme_uri' => get_template_directory_uri(),
        'icecast_proxy' => get_template_directory_uri() . '/assets/php/icecast-proxy.php',
        'ajaxurl' => admin_url('admin-ajax.php'),
        'home_url' => home_url('/'),
    ]);

    wp_localize_script('jfm-chat-script', 'JFM_CHAT', [
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('jfm_chat_nonce'),
        'upload_size' => 4,
        'is_admin' => current_user_can('manage_options'), // ← Ligne à ajouter
        'logged_in' => $player_auth['logged_in'],
        'player_name' => $player_auth['player_name'],
    ]);
}
add_action('wp_enqueue_scripts', 'joystickfm_enqueue');


/* ══════════════════════════════════════════════
 3. CRÉATION DE LA TABLE CHAT
 ══════════════════════════════════════════════ */
function joystickfm_create_chat_table()
{
    global $wpdb;
    $table = $wpdb->prefix . 'jfm_chat_messages';
    $charset = $wpdb->get_charset_collate();

    // Ne recrée pas si elle existe déjà
    if ($wpdb->get_var("SHOW TABLES LIKE '{$table}'") === $table) {
        return;
    }

    $sql = "CREATE TABLE {$table} (
        id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        username    VARCHAR(50)     NOT NULL DEFAULT 'Anonyme',
        message     TEXT,
        type        ENUM('text','image','gif','mixed') NOT NULL DEFAULT 'text',
        file_url    VARCHAR(500)    DEFAULT NULL,
        ip_hash     VARCHAR(64)     NOT NULL DEFAULT '',
        created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_created (created_at)
    ) {$charset};";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta($sql);
}
// Crée la table à chaque activation du thème
add_action('after_switch_theme', 'joystickfm_create_chat_table');
// Crée aussi si elle n'existe pas encore (sécurité)
add_action('init', function () {
    if (!get_option('jfm_chat_table_created')) {
        joystickfm_create_chat_table();
        global $wpdb;
        $table = $wpdb->prefix . 'jfm_chat_messages';
        if ($wpdb->get_var("SHOW TABLES LIKE '{$table}'") === $table) {
            update_option('jfm_chat_table_created', '1');
        }
    }
});

/* ══════════════════════════════════════════════
 4. INCLUSION DES HANDLERS PHP CHAT
 ══════════════════════════════════════════════ */
require_once get_template_directory() . '/assets/php/chat-handler.php';
require_once get_template_directory() . '/assets/php/upload-handler.php';

/* ══════════════════════════════════════════════
 5. PROXY ICECAST VIA AJAX WORDPRESS
 ══════════════════════════════════════════════ */
function joystickfm_icecast_status()
{
    $icecast_url = 'http://10.100.0.50:8000/status-json.xsl';
    $response = wp_remote_get($icecast_url, ['timeout' => 3, 'sslverify' => false]);

    if (is_wp_error($response)) {
        wp_send_json(['online' => false, 'listeners' => 0, 'title' => 'JoyStick FM', 'artist' => '—']);
        return;
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    if (!$data || !isset($data['icestats'])) {
        wp_send_json(['online' => false, 'listeners' => 0, 'title' => 'JoyStick FM', 'artist' => '—']);
        return;
    }

    $icestats = $data['icestats'];
    $source = $icestats['source'] ?? null;

    if (isset($source['listenurl']))
        $source = [$source];

    $found = null;
    if (is_array($source)) {
        foreach ($source as $s) {
            if (strpos($s['listenurl'] ?? '', 'joystick-fm') !== false) {
                $found = $s;
                break;
            }
        }
        if (!$found)
            $found = $source[0] ?? null;
    }

    if (!$found) {
        wp_send_json(['online' => false, 'listeners' => 0, 'title' => 'JoyStick FM — Hors ligne', 'artist' => '—']);
        return;
    }

    $listeners = (int)($found['listeners'] ?? 0);
    $rawTitle = trim($found['title'] ?? '');
    $rawArtist = trim($found['artist'] ?? '');
    $title = $artist = '—';

    if ($rawArtist && $rawTitle) {
        $artist = $rawArtist;
        $title = $rawTitle;
    }
    elseif ($rawTitle && strpos($rawTitle, ' - ') !== false) {
        [$artist, $title] = explode(' - ', $rawTitle, 2);
    }
    else {
        $title = $rawTitle ?: 'JoyStick FM';
        $artist = 'JoyStick FM';
    }

    wp_send_json(['online' => true, 'listeners' => $listeners, 'title' => trim($title), 'artist' => trim($artist)]);
}
add_action('wp_ajax_nopriv_icecast_status', 'joystickfm_icecast_status');
add_action('wp_ajax_icecast_status', 'joystickfm_icecast_status');

/* ══════════════════════════════════════════════
 6. BARRE D'ADMIN / SÉCURITÉ
 ══════════════════════════════════════════════ */
add_filter('show_admin_bar', '__return_false');
remove_action('wp_head', 'wp_generator');

function joystickfm_wp_title($title, $sep)
{
    if (is_feed())
        return $title;
    global $page, $paged;
    $title .= get_bloginfo('name', 'display');
    $site_description = get_bloginfo('description', 'display');
    if ($site_description && (is_home() || is_front_page()))
        $title .= " $sep $site_description";
    return $title;
}
add_filter('wp_title', 'joystickfm_wp_title', 10, 2);

/* ══════════════════════════════════════════════
 7. TÂCHE CRON : ARCHIVAGE ET NETTOYAGE DU CHAT
 ══════════════════════════════════════════════ */
// 1. Planification de la tâche toutes les 24h
if (!wp_next_scheduled('jfm_daily_chat_archive_event')) {
    wp_schedule_event(time(), 'daily', 'jfm_daily_chat_archive_event');
}
add_action('jfm_daily_chat_archive_event', 'joystickfm_archive_chat');

// 2. La fonction d'archivage (La "Garbage Collection")
function joystickfm_archive_chat() {
    global $wpdb;
    $table = $wpdb->prefix . 'jfm_chat_messages';
    
    // Récupérer tous les messages
    $messages = $wpdb->get_results("SELECT * FROM {$table} ORDER BY created_at ASC");
    if (empty($messages)) return;

    $upload_dir = wp_upload_dir();
    $archive_dir = $upload_dir['basedir'] . '/chat_archives';
    
    // Créer le dossier d'archives s'il n'existe pas
    if (!file_exists($archive_dir)) {
        wp_mkdir_p($archive_dir);
    }

    $date_str = current_time('Y-m-d_H-i');
    $zip_path = $archive_dir . '/chat_archive_' . $date_str . '.zip';
    $txt_log = "=== ARCHIVE JOYSTICK FM CHAT - " . current_time('d/m/Y') . " ===\r\n\r\n";

    // Utilisation de la classe native de PHP pour compresser
    $zip = new ZipArchive();
    if ($zip->open($zip_path, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
        
        foreach ($messages as $m) {
            $txt_log .= "[{$m->created_at}] {$m->username} : {$m->message}\r\n";
            
            // Si le message a une pièce jointe
            if (!empty($m->file_url)) {
                // Convertir l'URL web en chemin absolu sur le serveur Debian
                $local_path = str_replace($upload_dir['baseurl'], $upload_dir['basedir'], $m->file_url);
                
                if (file_exists($local_path)) {
                    $txt_log .= "   -> Pièce jointe archivée : " . basename($local_path) . "\r\n";
                    // Ajouter l'image dans le ZIP (dans un sous-dossier medias/)
                    $zip->addFile($local_path, 'medias/' . basename($local_path));
                }
            }
        }
        
        // Ajouter le fichier texte de la conversation dans le ZIP
        $zip->addFromString('conversation_' . $date_str . '.txt', $txt_log);
        $zip->close();

        // 3. NETTOYAGE : Suppression physique des images originelles
        foreach ($messages as $m) {
            if (!empty($m->file_url)) {
                $local_path = str_replace($upload_dir['baseurl'], $upload_dir['basedir'], $m->file_url);
                if (file_exists($local_path)) {
                    unlink($local_path); // Supprime le fichier du disque
                }
            }
        }

        // 4. NETTOYAGE SQL : Remise à zéro de la table (ID repart à 1)
        $wpdb->query("TRUNCATE TABLE {$table}");
    }
}

// ASTUCE DE DEBUG : Permet de déclencher l'archivage manuellement pour tester
if (isset($_GET['force_archive']) && current_user_can('manage_options')) {
    add_action('init', function() {
        joystickfm_archive_chat();
        die('Archivage forcé et terminé ! Regardez dans wp-content/uploads/chat_archives/');
    });
}