<?php
/**
 * JoyStick FM Games — Gestionnaire de migrations SQL
 *
 * Responsabilité : Création et évolution idempotente des tables MariaDB
 * pour les comptes joueurs et sessions, sans perte de données.
 */

if (!defined('ABSPATH')) {
    exit;
}

class JFM_Games_Migrator {

    const DB_VERSION = '1.0.0';
    const OPTION_KEY = 'jfm_games_db_version';

    /**
     * Exécute les migrations de schéma
     *
     * @return bool True si réussi
     */
    public static function migrate() {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();
        $prefix = $wpdb->prefix;

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

        // 1. Table des joueurs indépendants de WordPress
        $table_players = "{$prefix}jfm_players";
        $sql_players = "CREATE TABLE {$table_players} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            username_canonical VARCHAR(60) NOT NULL,
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
            PRIMARY KEY  (id),
            UNIQUE KEY uk_canonical (username_canonical),
            KEY idx_status (status)
        ) {$charset_collate};";
        dbDelta($sql_players);

        // 2. Table des sessions joueurs à jetons opaques
        $table_sessions = "{$prefix}jfm_player_sessions";
        $sql_sessions = "CREATE TABLE {$table_sessions} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            player_id BIGINT UNSIGNED NOT NULL,
            token_hash VARCHAR(64) NOT NULL,
            ip_address VARCHAR(45) DEFAULT NULL,
            user_agent VARCHAR(255) DEFAULT NULL,
            expires_at DATETIME NOT NULL,
            revoked_at DATETIME DEFAULT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY uk_token_hash (token_hash),
            KEY idx_player_id (player_id),
            KEY idx_expires_at (expires_at)
        ) {$charset_collate};";
        dbDelta($sql_sessions);

        // 3. Journal d'audit des actions administrateur
        $table_log = "{$prefix}jfm_player_admin_log";
        $sql_log = "CREATE TABLE {$table_log} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            admin_user_id BIGINT UNSIGNED NOT NULL,
            player_id BIGINT UNSIGNED NOT NULL,
            action VARCHAR(50) NOT NULL,
            details TEXT DEFAULT NULL,
            ip_address VARCHAR(45) DEFAULT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY idx_player_audit (player_id),
            KEY idx_created_at (created_at)
        ) {$charset_collate};";
        dbDelta($sql_log);

        update_option(self::OPTION_KEY, self::DB_VERSION);

        return true;
    }

    /**
     * Désactivation propre sans suppression des données
     */
    public static function deactivate() {
        // Règle formelle : Ne jamais supprimer les données à la désactivation
    }
}
