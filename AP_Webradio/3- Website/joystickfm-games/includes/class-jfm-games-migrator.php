<?php
if (!defined('ABSPATH')) {
    exit;
}

final class JFM_Games_Migrator
{
    public const SCHEMA_VERSION = '1.0.0';

    public static function activate(): void
    {
        self::run_migrations();
        self::ensure_pages();
        flush_rewrite_rules();
    }

    public static function deactivate(): void
    {
        flush_rewrite_rules();
    }

    public static function run_migrations(): void
    {
        $current = (string) get_option('jfm_games_schema_version', '0.0.0');
        if (version_compare($current, self::SCHEMA_VERSION, '>=')) {
            return;
        }

        global $wpdb;
        $charset = $wpdb->get_charset_collate();
        $players = $wpdb->prefix . 'jfm_players';
        $sessions = $wpdb->prefix . 'jfm_player_sessions';
        $adminLogs = $wpdb->prefix . 'jfm_player_admin_log';

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        dbDelta("CREATE TABLE {$players} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            username_display VARCHAR(30) NOT NULL,
            username_norm VARCHAR(30) NOT NULL,
            pin_hash VARCHAR(255) NOT NULL,
            recovery_hash VARCHAR(255) NOT NULL,
            recovery_issued_at DATETIME NOT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY uniq_username_norm (username_norm)
        ) {$charset};");

        dbDelta("CREATE TABLE {$sessions} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            player_id BIGINT UNSIGNED NOT NULL,
            selector VARCHAR(24) NOT NULL,
            token_hash CHAR(64) NOT NULL,
            csrf_hash CHAR(64) NOT NULL,
            ip_hash CHAR(64) NOT NULL,
            user_agent_hash CHAR(64) NOT NULL,
            expires_at DATETIME NOT NULL,
            revoked_at DATETIME NULL,
            created_at DATETIME NOT NULL,
            last_seen_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY uniq_selector (selector),
            KEY idx_player (player_id),
            KEY idx_expiry (expires_at),
            KEY idx_revoked (revoked_at)
        ) {$charset};");

        dbDelta("CREATE TABLE {$adminLogs} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            admin_user_id BIGINT UNSIGNED NOT NULL,
            target_player_id BIGINT UNSIGNED NOT NULL,
            action VARCHAR(60) NOT NULL,
            details TEXT NULL,
            created_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            KEY idx_target (target_player_id),
            KEY idx_created (created_at)
        ) {$charset};");

        update_option('jfm_games_schema_version', self::SCHEMA_VERSION, false);
    }

    public static function ensure_pages(): void
    {
        $pages = [
            'jeux' => [
                'post_title' => 'Jeux',
                'post_content' => '[jfm_games_portal]',
            ],
            'activites' => [
                'post_title' => 'Activités',
                'post_content' => '[jfm_games_activities]',
            ],
            'compte' => [
                'post_title' => 'Compte joueur',
                'post_content' => '[jfm_games_account]',
            ],
        ];

        foreach ($pages as $slug => $page) {
            $existing = get_page_by_path($slug, OBJECT, 'page');
            if ($existing instanceof WP_Post) {
                continue;
            }

            wp_insert_post([
                'post_type' => 'page',
                'post_status' => 'publish',
                'post_title' => $page['post_title'],
                'post_name' => $slug,
                'post_content' => $page['post_content'],
                'post_author' => get_current_user_id() ?: 1,
            ]);
        }
    }
}
