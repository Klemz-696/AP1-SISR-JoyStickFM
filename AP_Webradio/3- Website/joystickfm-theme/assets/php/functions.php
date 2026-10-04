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
 2. ENQUEUE DES SCRIPTS ET STYLES
 ══════════════════════════════════════════════ */
function joystickfm_enqueue()
{
    $v = '6.0.' . filemtime(get_template_directory() . '/assets/js/radio-player.js');

    wp_enqueue_style('jfm-style', get_template_directory_uri() . '/assets/css/style.css', [], $v);
    wp_enqueue_style('jfm-animations', get_template_directory_uri() . '/assets/css/animations.css', ['jfm-style'], $v);
    wp_enqueue_style('jfm-responsive', get_template_directory_uri() . '/assets/css/responsive.css', ['jfm-style'], $v);
    wp_enqueue_style('jfm-xpbar', get_template_directory_uri() . '/assets/css/xp-bar-styles.css', ['jfm-style'], $v);

    wp_enqueue_script('jfm-easter-eggs', get_template_directory_uri() . '/assets/js/easter-eggs.js', [], $v, true);
    wp_enqueue_script('jfm-radio-player', get_template_directory_uri() . '/assets/js/radio-player.js', ['jfm-easter-eggs'], $v, true);
    wp_enqueue_script('jfm-main', get_template_directory_uri() . '/assets/js/main.js', ['jfm-radio-player'], $v, true);
    wp_enqueue_script('jfm-dvd-bouncer', get_template_directory_uri() . '/assets/js/dvd-bouncer.js', ['jfm-easter-eggs'], $v, true);

    if (is_page('contact')) {
        wp_enqueue_script('jfm-form', get_template_directory_uri() . '/assets/js/form-validation.js', [], $v, true);
    }

    wp_localize_script('jfm-radio-player', 'JFM_CONFIG', [
        'theme_uri' => get_template_directory_uri(),
        'icecast_proxy' => get_template_directory_uri() . '/assets/php/icecast-proxy.php',
        'ajaxurl' => admin_url('admin-ajax.php'),
        'home_url' => home_url('/'),
    ]);
}
add_action('wp_enqueue_scripts', 'joystickfm_enqueue');

/* ----------------------------------------------
3. ENQUEUE CHAT
 ---------------------------------------------- */
function joystickfm_enqueue_chat()
{
    $v = '1.0.' . filemtime(get_template_directory() . '/assets/css/chat.css');

    wp_enqueue_style('jfm-chat',
        get_template_directory_uri() . '/assets/css/chat.css',
    [], $v
    );

    wp_enqueue_script('jfm-chat',
        get_template_directory_uri() . '/assets/js/chat.js',
    ['jquery'], $v, true
    );

    wp_localize_script('jfm-chat', 'JFM_CHAT', [
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('jfm_chat_nonce'),
        'upload_size' => 4,
    ]);
}
add_action('wp_enqueue_scripts', 'joystickfm_enqueue_chat');

/* ----------------------------------------------
 4. CR�ATION DE LA TABLE CHAT
 ---------------------------------------------- */
function joystickfm_create_chat_table()
{
    global $wpdb;
    $table = $wpdb->prefix . 'jfm_chat_messages';
    $charset = $wpdb->get_charset_collate();

    // La requ�te SQL exacte (adapt�e de ton chat-install.php)
    $sql = "CREATE TABLE $table (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL DEFAULT 'Anonyme',
        message TEXT,
        type ENUM('text','image','gif','mixed') NOT NULL DEFAULT 'text',
        file_url VARCHAR(500) DEFAULT NULL,
        ip_hash VARCHAR(64) NOT NULL DEFAULT '',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY idx_created (created_at)
    ) $charset;";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta($sql);
}

// Hook de v�rification � l'initialisation (s'assure que la table existe toujours)
add_action('init', function () {
    if (!get_option('jfm_chat_table_created')) {
        joystickfm_create_chat_table();
        update_option('jfm_chat_table_created', '1');
    }
});

/* ----------------------------------------------
 5. INCLUSION DES HANDLERS PHP CHAT
 ---------------------------------------------- */
require_once get_template_directory() . '/assets/php/chat-handler.php';
require_once get_template_directory() . '/assets/php/upload-handler.php';

/* ----------------------------------------------
 6. PROXY ICECAST VIA AJAX WORDPRESS
 ---------------------------------------------- */
function joystickfm_icecast_status()
{
    $icecast_url = 'http://10.10.10.12:8000/status-json.xsl';
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
 7. BARRE D'ADMIN / SÉCURITÉ
 ══════════════════════════════════════════════ */
add_filter('show_admin_bar', '__return_false');
remove_action('wp_head', 'wp_generator');

function joystickfm_wp_title($title, $sep)
{
    if (is_feed())
        return $title;
    $title .= get_bloginfo('name', 'display');
    $site_description = get_bloginfo('description', 'display');
    if ($site_description && (is_home() || is_front_page()))
        $title .= " $sep $site_description";
    return $title;
}
add_filter('wp_title', 'joystickfm_wp_title', 10, 2);