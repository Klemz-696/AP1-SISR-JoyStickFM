<?php
/**
 * Plugin Name: JoyStick FM Games
 * Description: Authentification joueurs, sessions et portail jeux (lot 1).
 * Version: 1.0.0
 * Author: BTS SIO TS1
 */

if (!defined('ABSPATH')) {
    exit;
}

define('JFM_GAMES_VERSION', '1.0.0');

require_once __DIR__ . '/includes/class-jfm-games-utils.php';
require_once __DIR__ . '/includes/class-jfm-games-migrator.php';
require_once __DIR__ . '/includes/class-jfm-games-auth.php';
require_once __DIR__ . '/includes/class-jfm-games-pages.php';

final class JFM_Games_Plugin
{
    private static ?self $instance = null;
    private JFM_Games_Auth $auth;
    private JFM_Games_Pages $pages;

    private function __construct()
    {
        $this->auth = new JFM_Games_Auth();
        $this->pages = new JFM_Games_Pages($this->auth);

        $this->auth->hooks();
        $this->pages->hooks();
    }

    public static function instance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function auth(): JFM_Games_Auth
    {
        return $this->auth;
    }
}

register_activation_hook(__FILE__, ['JFM_Games_Migrator', 'activate']);
register_deactivation_hook(__FILE__, ['JFM_Games_Migrator', 'deactivate']);
add_action('plugins_loaded', ['JFM_Games_Plugin', 'instance']);

function jfm_games_is_active(): bool
{
    return class_exists('JFM_Games_Plugin');
}

function jfm_games_auth(): ?JFM_Games_Auth
{
    if (!class_exists('JFM_Games_Plugin')) {
        return null;
    }
    return JFM_Games_Plugin::instance()->auth();
}

function jfm_games_is_player_authenticated(): bool
{
    $auth = jfm_games_auth();
    return $auth ? $auth->is_authenticated() : false;
}

function jfm_games_get_current_player(): ?array
{
    $auth = jfm_games_auth();
    return $auth ? $auth->get_current_player() : null;
}

function jfm_games_get_login_url(string $returnTo = ''): string
{
    $safe = JFM_Games_Utils::validate_local_return_to($returnTo ?: home_url('/jeux/'));
    return add_query_arg('return_to', rawurlencode($safe), home_url('/compte/'));
}
