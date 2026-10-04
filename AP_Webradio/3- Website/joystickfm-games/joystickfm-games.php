<?php
/**
 * Plugin Name: JoyStick FM Games & Accounts
 * Plugin URI: https://github.com/Klemz-696/AP1-SISR-JoyStickFM
 * Description: Moteur autonome de comptes joueurs indépendants, sessions sécurisées à jetons opaques, et portail des jeux JoyStick FM (Catapulte Arcade & JoyStick TCG).
 * Version: 1.0.0
 * Author: Clément SAUZÈDE & Mathys DUTHILLEUL (BTS SIO SISR)
 * License: GPL-2.0+
 * Text Domain: joystickfm-games
 */

if (!defined('ABSPATH')) {
    exit;
}

define('JFM_GAMES_VERSION', '1.0.0');
define('JFM_GAMES_PATH', plugin_dir_path(__FILE__));
define('JFM_GAMES_URL', plugin_dir_url(__FILE__));

// Dérogation d'environnement local pour les cookies de session sous HTTP
if (!defined('JFM_GAMES_ALLOW_INSECURE_HTTP')) {
    define('JFM_GAMES_ALLOW_INSECURE_HTTP', true);
}

// Chargement des classes du plugin
require_once JFM_GAMES_PATH . 'includes/class-jfm-games-migrator.php';
require_once JFM_GAMES_PATH . 'includes/class-jfm-games-utils.php';
require_once JFM_GAMES_PATH . 'includes/class-jfm-games-auth.php';
require_once JFM_GAMES_PATH . 'includes/class-jfm-games-pages.php';

// Activation et désactivation du plugin
register_activation_hook(__FILE__, function () {
    JFM_Games_Migrator::migrate();
    JFM_Games_Pages::provision_pages();
    flush_rewrite_rules();
});

register_deactivation_hook(__FILE__, function () {
    JFM_Games_Migrator::deactivate();
    flush_rewrite_rules();
});

// Initialisation au chargement de WordPress
add_action('init', function () {
    JFM_Games_Pages::init();
});

// Chargement des feuilles de style et scripts du portail
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style(
        'jfm-games-portal',
        JFM_GAMES_URL . 'assets/css/games-portal.css',
        [],
        JFM_GAMES_VERSION
    );

    wp_enqueue_script(
        'jfm-games-portal-js',
        JFM_GAMES_URL . 'assets/js/portal.js',
        ['jquery'],
        JFM_GAMES_VERSION,
        true
    );

    $player = JFM_Games_Auth::get_current_player();

    wp_localize_script('jfm-games-portal-js', 'JFM_GAMES_CONFIG', [
        'ajax_url'    => admin_url('admin-ajax.php'),
        'nonce'       => wp_create_nonce('jfm_auth_nonce'),
        'logged_in'   => ($player !== null),
        'player'      => $player ? [
            'id'            => (int)$player->id,
            'username'      => $player->username_display,
            'joycoins'      => (int)$player->joycoins,
            'xp'            => (int)$player->xp,
            'free_boosters' => (int)$player->free_boosters_available
        ] : null,
        'account_url' => home_url('/compte'),
        'games_url'   => home_url('/jeux')
    ]);
});

/**
 * Fonctions d'API publique pour le thème et les intégrations externes
 */
if (!function_exists('jfm_games_get_current_player')) {
    /**
     * Retourne l'objet joueur courant ou null
     *
     * @return object|null
     */
    function jfm_games_get_current_player() {
        return JFM_Games_Auth::get_current_player();
    }
}

if (!function_exists('jfm_games_is_logged_in')) {
    /**
     * Vérifie si un joueur est actuellement connecté
     *
     * @return bool
     */
    function jfm_games_is_logged_in() {
        return (JFM_Games_Auth::get_current_player() !== null);
    }
}
