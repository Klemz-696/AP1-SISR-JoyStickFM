<?php
/**
 * JoyStick FM — chat-install.php
 * Crée la table des messages du chat en base de données.
 * À appeler UNE SEULE FOIS, puis supprimer ou protéger.
 */
defined('ABSPATH') || require_once dirname(__FILE__, 4) . '/wp-load.php';

global $wpdb;
$charset = $wpdb->get_charset_collate();
$table = $wpdb->prefix . 'jfm_chat_messages';

$sql = "CREATE TABLE IF NOT EXISTS {$table} (
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

if ($wpdb->last_error) {
    die('Erreur SQL : ' . $wpdb->last_error);
}

echo 'Table ' . $table . ' créée avec succès.';