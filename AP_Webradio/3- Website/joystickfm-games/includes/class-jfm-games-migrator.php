<?php
/**
 * JoyStick FM Games — Gestionnaire de migrations SQL
 *
 * Responsabilité : Création et évolution idempotente des tables MariaDB
 * pour les comptes joueurs, sessions, et le système de cartes JoyStick TCG (Lot 2).
 */

if (!defined('ABSPATH')) {
    exit;
}

class JFM_Games_Migrator {

    const DB_VERSION = '2.0.0';
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
            avatar_url MEDIUMTEXT DEFAULT NULL,
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

        // Ajout rétrocompatible si colonne manquante
        $col_avatar = $wpdb->get_results("SHOW COLUMNS FROM {$table_players} LIKE 'avatar_url'");
        if (empty($col_avatar)) {
            $wpdb->query("ALTER TABLE {$table_players} ADD COLUMN avatar_url MEDIUMTEXT DEFAULT NULL AFTER recovery_used_at");
        }

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

        // 4. Table du catalogue des cartes JoyStick TCG (Lot 2)
        $table_cards = "{$prefix}jfm_tcg_cards";
        $sql_cards = "CREATE TABLE {$table_cards} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            slug VARCHAR(64) NOT NULL,
            name VARCHAR(100) NOT NULL,
            category VARCHAR(50) NOT NULL,
            rarity ENUM('common', 'rare', 'epic', 'legendary') NOT NULL DEFAULT 'common',
            power INT UNSIGNED NOT NULL DEFAULT 100,
            description TEXT NOT NULL,
            lore TEXT DEFAULT NULL,
            icon VARCHAR(20) NOT NULL DEFAULT '🎮',
            bg_gradient VARCHAR(150) NOT NULL DEFAULT 'linear-gradient(135deg, #1f1f3a, #0a0a14)',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY uk_slug (slug),
            KEY idx_rarity (rarity),
            KEY idx_category (category)
        ) {$charset_collate};";
        dbDelta($sql_cards);

        // 5. Table de l'inventaire des cartes par joueur
        $table_inventory = "{$prefix}jfm_tcg_inventory";
        $sql_inventory = "CREATE TABLE {$table_inventory} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            player_id BIGINT UNSIGNED NOT NULL,
            card_id BIGINT UNSIGNED NOT NULL,
            is_holo TINYINT(1) NOT NULL DEFAULT 0,
            quantity INT UNSIGNED NOT NULL DEFAULT 1,
            first_acquired_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY uk_player_card_holo (player_id, card_id, is_holo),
            KEY idx_player (player_id),
            KEY idx_card (card_id)
        ) {$charset_collate};";
        dbDelta($sql_inventory);

        // 6. Table du marché / échanges entre joueurs
        $table_trades = "{$prefix}jfm_tcg_trades";
        $sql_trades = "CREATE TABLE {$table_trades} (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            seller_id BIGINT UNSIGNED NOT NULL,
            card_id BIGINT UNSIGNED NOT NULL,
            is_holo TINYINT(1) NOT NULL DEFAULT 0,
            price_joycoins INT UNSIGNED NOT NULL DEFAULT 50,
            status VARCHAR(20) NOT NULL DEFAULT 'active',
            buyer_id BIGINT UNSIGNED DEFAULT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME DEFAULT NULL,
            PRIMARY KEY  (id),
            KEY idx_status (status),
            KEY idx_seller (seller_id)
        ) {$charset_collate};";
        dbDelta($sql_trades);

        // Peuplement automatique du catalogue des 40 cartes initiales si vide
        self::seed_cards_catalog($table_cards);

        update_option(self::OPTION_KEY, self::DB_VERSION);

        return true;
    }

    /**
     * Initialisation des 40 cartes du catalogue JoyStick TCG
     *
     * @param string $table_cards Nom complet de la table des cartes
     */
    public static function seed_cards_catalog($table_cards) {
        global $wpdb;

        $count = (int)$wpdb->get_var("SELECT COUNT(*) FROM {$table_cards}");
        if ($count >= 40) {
            return; // Catalogue déjà initialisé
        }

        $cards = [
            // ── FAMILLE 1 : HARDWARE & RÉTRO (10 cartes) ──
            [
                'slug'        => 'gameboy-classic',
                'name'        => 'Game Boy Classic',
                'category'    => 'hardware',
                'rarity'      => 'common',
                'power'       => 120,
                'description' => 'L\'icône grise à écran vert de 1989. Indestructible, elle fonctionne même après une chute.',
                'lore'        => 'Alimentée par 4 piles AA, elle a rythmé tous les voyages scolaires.',
                'icon'        => '📟',
                'bg_gradient' => 'linear-gradient(135deg, #3a404a, #15181e)'
            ],
            [
                'slug'        => 'borne-arcade-1984',
                'name'        => 'Borne Arcade 1984',
                'category'    => 'hardware',
                'rarity'      => 'epic',
                'power'       => 450,
                'description' => 'Meuble en bois massif et écran cathodique vibrant. Insérez une pièce pour continuer.',
                'lore'        => 'Le sanctuaire des high scores et des stick fight endiablés.',
                'icon'        => '🕹️',
                'bg_gradient' => 'linear-gradient(135deg, #7b2fbf, #1c0933)'
            ],
            [
                'slug'        => 'nes-8bit',
                'name'        => 'Console 8-Bit',
                'category'    => 'hardware',
                'rarity'      => 'common',
                'power'       => 140,
                'description' => 'Le standard qui a ressuscité le jeu vidéo. Manettes rectangulaires inoubliables.',
                'lore'        => 'Le clapet de chargement avant et son ressort mythique.',
                'icon'        => '🎮',
                'bg_gradient' => 'linear-gradient(135deg, #404040, #181818)'
            ],
            [
                'slug'        => 'cartouche-doree',
                'name'        => 'Cartouche Dorée',
                'category'    => 'hardware',
                'rarity'      => 'legendary',
                'power'       => 850,
                'description' => 'Artefact or rutilant renfermant la quête de la Triforce. Sa pile défie les siècles.',
                'lore'        => 'Le joyau suprême de toute étagère de collectionneur.',
                'icon'        => '🏆',
                'bg_gradient' => 'linear-gradient(135deg, #ffd700, #b8860b)'
            ],
            [
                'slug'        => 'moniteur-crt',
                'name'        => 'Moniteur CRT Trinitron',
                'category'    => 'hardware',
                'rarity'      => 'common',
                'power'       => 160,
                'description' => 'Zéro latence, phosphore chaud et scanlines parfaites. Le secret des speedrunners.',
                'lore'        => 'Un poids de 25 kg qui fait grincer les bureaux mais sublime le pixel.',
                'icon'        => '📺',
                'bg_gradient' => 'linear-gradient(135deg, #2c3e50, #0f171e)'
            ],
            [
                'slug'        => 'cable-peritel',
                'name'        => 'Câble Péritel Blindé',
                'category'    => 'hardware',
                'rarity'      => 'common',
                'power'       => 110,
                'description' => 'La liaison RGB européenne par excellence. 21 broches de pur signal analogique.',
                'lore'        => 'À brancher avec précaution pour éviter l\'écran monochrome rouge.',
                'icon'        => '🔌',
                'bg_gradient' => 'linear-gradient(135deg, #37474f, #1b2428)'
            ],
            [
                'slug'        => 'pad-6-boutons',
                'name'        => 'Manette 6 Boutons',
                'category'    => 'hardware',
                'rarity'      => 'common',
                'power'       => 150,
                'description' => 'Ergonomie taillée sur mesure pour les Hadoken et les quarts de cercle millimétrés.',
                'lore'        => 'La bénédiction des fans de jeux d\'arcade 16-bit.',
                'icon'        => '🎮',
                'bg_gradient' => 'linear-gradient(135deg, #303f9f, #121858)'
            ],
            [
                'slug'        => 'joystick-hall-effect',
                'name'        => 'JoyStick Magnétique',
                'category'    => 'hardware',
                'rarity'      => 'rare',
                'power'       => 280,
                'description' => 'Capteurs à effet Hall sans friction physique. Zéro dérive de stick pour toujours.',
                'lore'        => 'La précision militaire mise au service des joueurs de JoyStick FM.',
                'icon'        => '🕹️',
                'bg_gradient' => 'linear-gradient(135deg, #00838f, #00363a)'
            ],
            [
                'slug'        => 'memory-card-8mb',
                'name'        => 'Carte Mémoire 8 Mo',
                'category'    => 'hardware',
                'rarity'      => 'common',
                'power'       => 130,
                'description' => '15 blocs précieux. Chaque sauvegarde effacée était un dilemme cornélien.',
                'lore'        => 'Contient encore une sauvegarde de gran turismo à 98.4%.',
                'icon'        => '💾',
                'bg_gradient' => 'linear-gradient(135deg, #455a64, #1c252a)'
            ],
            [
                'slug'        => 'tamagotchi-pixel',
                'name'        => 'Tamagotchi Pixel',
                'category'    => 'hardware',
                'rarity'      => 'rare',
                'power'       => 240,
                'description' => 'Créature virtuelle de poche qui bippait au pire moment en classe.',
                'lore'        => 'Le premier animal de compagnie numérique de toute une génération.',
                'icon'        => '🐣',
                'bg_gradient' => 'linear-gradient(135deg, #d81b60, #4f0923)'
            ],

            // ── FAMILLE 2 : HÉROS & ARCHÉTYPES GAMING (10 cartes) ──
            [
                'slug'        => 'speedrunner-enrage',
                'name'        => 'Le Speedrunner',
                'category'    => 'hero',
                'rarity'      => 'epic',
                'power'       => 480,
                'description' => 'Traverse les murs grâce aux sous-débordements de mémoire. Finit le jeu en 12 minutes.',
                'lore'        => '« Frame perfect or reset. » Aucune seconde n\'est gaspillée.',
                'icon'        => '⏱️',
                'bg_gradient' => 'linear-gradient(135deg, #f57c00, #4d2600)'
            ],
            [
                'slug'        => 'pixel-knight',
                'name'        => 'Le Pixel Knight',
                'category'    => 'hero',
                'rarity'      => 'common',
                'power'       => 170,
                'description' => 'Armure de sprites 16-bit et épée forgée dans les pixels bleus.',
                'lore'        => 'Il saute sur les têtes des boss sans jamais cligner des yeux.',
                'icon'        => '⚔️',
                'bg_gradient' => 'linear-gradient(135deg, #1976d2, #0a3560)'
            ],
            [
                'slug'        => 'boss-glitche',
                'name'        => 'Le Boss Glitché',
                'category'    => 'hero',
                'rarity'      => 'epic',
                'power'       => 520,
                'description' => 'Entité corrompue dont les PV dépassent 65535. Déforme la géométrie du niveau.',
                'lore'        => 'Né d\'une cartouche mal insérée au démarrage.',
                'icon'        => '👾',
                'bg_gradient' => 'linear-gradient(135deg, #6a1b9a, #280a3b)'
            ],
            [
                'slug'        => 'cyber-hacker',
                'name'        => 'Le NetRunner Cyber',
                'category'    => 'hero',
                'rarity'      => 'rare',
                'power'       => 310,
                'description' => 'Infiltre le terminal de commande et réécrit la mémoire en temps réel.',
                'lore'        => 'Une invite root, un câble RJ45 et le monde lui appartient.',
                'icon'        => '💻',
                'bg_gradient' => 'linear-gradient(135deg, #00b0ff, #003e5c)'
            ],
            [
                'slug'        => 'pnj-amical',
                'name'        => 'Le Villageois PNJ',
                'category'    => 'hero',
                'rarity'      => 'common',
                'power'       => 100,
                'description' => 'Répète inlassablement la même phrase depuis des décennies avec le sourire.',
                'lore'        => '« C\'est dangereux d\'aller seul là-bas, prends ceci ! »',
                'icon'        => '🧑‍🌾',
                'bg_gradient' => 'linear-gradient(135deg, #689f38, #2a4115)'
            ],
            [
                'slug'        => 'joueur-tryhard',
                'name'        => 'Le Joueur Tryhard',
                'category'    => 'hero',
                'rarity'      => 'common',
                'power'       => 190,
                'description' => 'Écran 360Hz, boisson énergisante et sueur. Accuse toujours le lag.',
                'lore'        => 'S\'est entraîné 400 heures sur le même virage.',
                'icon'        => '🔥',
                'bg_gradient' => 'linear-gradient(135deg, #e64a19, #541907)'
            ],
            [
                'slug'        => 'imposteur-suspect',
                'name'        => 'L\'Imposteur Suspect',
                'category'    => 'hero',
                'rarity'      => 'common',
                'power'       => 180,
                'description' => 'Rôde près des conduits d\'aération. Évacue les soupçons lors des réunions d\'urgence.',
                'lore'        => '« Je jure que j\'étais en train de faire les fils électriques ! »',
                'icon'        => '🔪',
                'bg_gradient' => 'linear-gradient(135deg, #c2185b, #480820)'
            ],
            [
                'slug'        => 'gardien-donjon',
                'name'        => 'Le Gardien Ancien',
                'category'    => 'hero',
                'rarity'      => 'rare',
                'power'       => 340,
                'description' => 'Colosse de pierre qui ne s\'éveille que lorsque la clé dorée est ramassée.',
                'lore'        => 'Ses coups de massue font trembler la caméra du jeu.',
                'icon'        => '🛡️',
                'bg_gradient' => 'linear-gradient(135deg, #5d4037, #221714)'
            ],
            [
                'slug'        => 'fantome-retro',
                'name'        => 'Le Fantôme Rétro',
                'category'    => 'hero',
                'rarity'      => 'common',
                'power'       => 150,
                'description' => 'Traque le joueur dans le labyrinthe et devient bleu quand une pastille est avalée.',
                'lore'        => 'Sa trajectoire semble erratique mais suit un algorithme impitoyable.',
                'icon'        => '👻',
                'bg_gradient' => 'linear-gradient(135deg, #512da8, #1d0f3f)'
            ],
            [
                'slug'        => 'heros-silencieux',
                'name'        => 'Le Héros Silencieux',
                'category'    => 'hero',
                'rarity'      => 'rare',
                'power'       => 320,
                'description' => 'Ne dit jamais un mot, casse des pots en terre cuite et sauve la princesse.',
                'lore'        => 'Un simple hochement de tête suffit à sceller le destin du royaume.',
                'icon'        => '🗡️',
                'bg_gradient' => 'linear-gradient(135deg, #00796b, #002d27)'
            ],

            // ── FAMILLE 3 : LÉGENDES JOYSTICK FM & STUDIO (10 cartes) ──
            [
                'slug'        => 'klemz-architecte',
                'name'        => 'Klemz l\'Architecte',
                'category'    => 'legend',
                'rarity'      => 'legendary',
                'power'       => 999,
                'description' => 'Fondateur et architecte système. Déploie des infrastructures entières en un script bash.',
                'lore'        => '« Tout est sous contrôle dans la DMZ. Rien ne passe sans iptables. »',
                'icon'        => '⚡',
                'bg_gradient' => 'linear-gradient(135deg, #00f5ff, #7b2fbf)'
            ],
            [
                'slug'        => 'steakman63',
                'name'        => 'Steakman63 le Soundmaster',
                'category'    => 'legend',
                'rarity'      => 'epic',
                'power'       => 500,
                'description' => 'Gardien des décibels et maître du son. Fait vibrer les basses de la WebRadio.',
                'lore'        => 'Règle le gain à la perfection pour que la musique transperce les cœurs.',
                'icon'        => '🥩',
                'bg_gradient' => 'linear-gradient(135deg, #d32f2f, #4a0f0f)'
            ],
            [
                'slug'        => 'pingouy',
                'name'        => 'Pingouy le Modérateur',
                'category'    => 'legend',
                'rarity'      => 'rare',
                'power'       => 350,
                'description' => 'Le manchot le plus rapide du live chat. Aucun troll ne survit à son marteau.',
                'lore'        => 'Glisse sur la banquise du serveur Linux avec une sérénité absolue.',
                'icon'        => '🐧',
                'bg_gradient' => 'linear-gradient(135deg, #0288d1, #013654)'
            ],
            [
                'slug'        => 'krem-brule',
                'name'        => 'Krem Brûlé le Chroniqueur',
                'category'    => 'legend',
                'rarity'      => 'rare',
                'power'       => 330,
                'description' => 'Maître des débats absurdes et des théories gaming scientifiques les plus folles.',
                'lore'        => 'A démontré que Steve peut transporter le poids de 4 tours Eiffel.',
                'icon'        => '🍮',
                'bg_gradient' => 'linear-gradient(135deg, #fbc02d, #614909)'
            ],
            [
                'slug'        => 'micro-shure-vintage',
                'name'        => 'Micro Shure SM7B',
                'category'    => 'legend',
                'rarity'      => 'rare',
                'power'       => 290,
                'description' => 'La voix chaude de la station. Capte chaque souffle et filtre les parasites.',
                'lore'        => 'Le micro de légende sur lequel tous les plus grands se sont exprimés.',
                'icon'        => '🎙️',
                'bg_gradient' => 'linear-gradient(135deg, #616161, #212121)'
            ],
            [
                'slug'        => 'serveur-icecast2',
                'name'        => 'Nœud Icecast 2',
                'category'    => 'legend',
                'rarity'      => 'rare',
                'power'       => 360,
                'description' => 'Diffuse le flux audio 320 kbps 24h/24 sans interruption ni coupure de buffer.',
                'lore'        => 'Le cœur battant de la station radio, connecté aux ondes du monde.',
                'icon'        => '📡',
                'bg_gradient' => 'linear-gradient(135deg, #00897b, #003630)'
            ],
            [
                'slug'        => 'casque-studio',
                'name'        => 'Casque Studio 250Ω',
                'category'    => 'legend',
                'rarity'      => 'common',
                'power'       => 160,
                'description' => 'Réponse en fréquence plate pour déceler le moindre clic parasite en direct.',
                'lore'        => 'Coussinets en velours gris usés par des milliers d\'heures d\'antenne.',
                'icon'        => '🎧',
                'bg_gradient' => 'linear-gradient(135deg, #424242, #1b1b1b)'
            ],
            [
                'slug'        => 'playlist-synthwave',
                'name'        => 'K7 Synthwave 1986',
                'category'    => 'legend',
                'rarity'      => 'common',
                'power'       => 180,
                'description' => 'Bande magnétique aux mélodies de synthétiseurs analogiques et néon rétro.',
                'lore'        => 'À écouter au volant d\'une Testarossa sous un coucher de soleil violet.',
                'icon'        => '📼',
                'bg_gradient' => 'linear-gradient(135deg, #ec407a, #520921)'
            ],
            [
                'slug'        => 'tunnel-wireguard',
                'name'        => 'Tunnel WireGuard Chiffré',
                'category'    => 'legend',
                'rarity'      => 'rare',
                'power'       => 370,
                'description' => 'Le tunnel cryptographique inviolable qui relie le monde extérieur à la DMZ.',
                'lore'        => 'Des clés Noise Protocol échangées en quelques millisecondes.',
                'icon'        => '🔒',
                'bg_gradient' => 'linear-gradient(135deg, #7cb342, #293f11)'
            ],
            [
                'slug'        => 'onde-fm-pure',
                'name'        => 'L\'Émetteur FM Céleste',
                'category'    => 'legend',
                'rarity'      => 'common',
                'power'       => 190,
                'description' => 'L\'antenne érigée sur le toit du monde qui propage le signal gaming sans distorsion.',
                'lore'        => 'Capte même les signaux des galaxies voisines.',
                'icon'        => '📻',
                'bg_gradient' => 'linear-gradient(135deg, #0288d1, #00395c)'
            ],

            // ── FAMILLE 4 : OBJETS, GLITCHES & SORTS (10 cartes) ──
            [
                'slug'        => 'souffler-cartouche',
                'name'        => 'Souffle Magique',
                'category'    => 'item',
                'rarity'      => 'common',
                'power'       => 110,
                'description' => 'Le rituel sacré de toute une génération. Chasse la poussière et répare le jeu.',
                'lore'        => 'Tous les manuels le déconseillaient, mais tout le monde le faisait.',
                'icon'        => '💨',
                'bg_gradient' => 'linear-gradient(135deg, #81d4fa, #1b536b)'
            ],
            [
                'slug'        => 'potion-mana',
                'name'        => 'Potion de Mana Fluo',
                'category'    => 'item',
                'rarity'      => 'common',
                'power'       => 130,
                'description' => 'Restaure l\'énergie de concentration après 6 heures de jeu ininterrompues.',
                'lore'        => 'Un goût chimique de framboise bleue et de succès débloqué.',
                'icon'        => '🧪',
                'bg_gradient' => 'linear-gradient(135deg, #ab47bc, #3d1444)'
            ],
            [
                'slug'        => 'cable-link',
                'name'        => 'Câble Link Antique',
                'category'    => 'item',
                'rarity'      => 'common',
                'power'       => 140,
                'description' => 'Connecte deux consoles dans la cour de récréation pour échanger des monstres.',
                'lore'        => 'Le premier réseau social physique entre jeunes passionnés.',
                'icon'        => '🔗',
                'bg_gradient' => 'linear-gradient(135deg, #78909c, #263238)'
            ],
            [
                'slug'        => 'lag-mystique',
                'name'        => 'Le Lag Mystique',
                'category'    => 'item',
                'rarity'      => 'rare',
                'power'       => 300,
                'description' => 'Anomalie temporelle qui téléporte la cible au moment précis du tir décisif.',
                'lore'        => '999 ms de ping qui inversent miraculeusement l\'issue du duel.',
                'icon'        => '🌀',
                'bg_gradient' => 'linear-gradient(135deg, #5c6bc0, #1a237e)'
            ],
            [
                'slug'        => 'joycoin-supreme',
                'name'        => 'Le JoyCoin Suprême',
                'category'    => 'item',
                'rarity'      => 'epic',
                'power'       => 490,
                'description' => 'La pièce originelle frappée du sceau de la radio. Vaut une fortune au marché.',
                'lore'        => 'Certains disent qu\'elle ouvre la porte des studios secrets de JoyStick FM.',
                'icon'        => '🪙',
                'bg_gradient' => 'linear-gradient(135deg, #ffd700, #ff8f00)'
            ],
            [
                'slug'        => 'konami-code-grave',
                'name'        => 'Le Sceau Konami',
                'category'    => 'item',
                'rarity'      => 'rare',
                'power'       => 380,
                'description' => 'Haut, Haut, Bas, Bas, Gauche, Droite, Gauche, Droite, B, A. Octroie 30 vies.',
                'lore'        => 'Le code le plus célèbre de l\'histoire du jeu vidéo.',
                'icon'        => '⬆️',
                'bg_gradient' => 'linear-gradient(135deg, #26a69a, #004d40)'
            ],
            [
                'slug'        => 'sauvegarde-corrompue',
                'name'        => 'Sauvegarde Maudite',
                'category'    => 'item',
                'rarity'      => 'common',
                'power'       => 150,
                'description' => 'Le pire cauchemar de tout aventurier : le fichier de sauvegarde qui disparaît.',
                'lore'        => 'Une coupure de courant au moment d\'écrire sur la cartouche.',
                'icon'        => '💥',
                'bg_gradient' => 'linear-gradient(135deg, #ef5350, #b71c1c)'
            ],
            [
                'slug'        => 'bruit-blanc',
                'name'        => 'Le Bruit Blanc Cosmique',
                'category'    => 'item',
                'rarity'      => 'common',
                'power'       => 120,
                'description' => 'Le souffle hypnotique capté entre deux stations radio au milieu de la nuit.',
                'lore'        => 'Apaise l\'esprit des joueurs après une défaite cuisante.',
                'icon'        => '🌌',
                'bg_gradient' => 'linear-gradient(135deg, #7e57c2, #311b92)'
            ],
            [
                'slug'        => 'one-up-vert',
                'name'        => 'Champignon 1-UP',
                'category'    => 'item',
                'rarity'      => 'common',
                'power'       => 170,
                'description' => 'Tintement magique qui redonne une chance in extremis.',
                'lore'        => 'Une vie de plus pour retenter le saut impossible.',
                'icon'        => '🍄',
                'bg_gradient' => 'linear-gradient(135deg, #66bb6a, #1b5e20)'
            ],
            [
                'slug'        => 'ecran-glitch-fatal',
                'name'        => 'Écran Bleu Fatal',
                'category'    => 'item',
                'rarity'      => 'rare',
                'power'       => 330,
                'description' => 'Le redouté BSOD qui fige le temps à l\'ultime milliseconde du boss fight.',
                'lore'        => '« Stop Code : KERNEL_GAMING_OVERFLOW »',
                'icon'        => '🖥️',
                'bg_gradient' => 'linear-gradient(135deg, #1e88e5, #0d47a1)'
            ]
        ];

        foreach ($cards as $card) {
            $wpdb->insert(
                $table_cards,
                $card,
                ['%s', '%s', '%s', '%s', '%d', '%s', '%s', '%s', '%s']
            );
        }
    }

    /**
     * Désactivation propre sans suppression des données
     */
    public static function deactivate() {
        // Règle formelle : Ne jamais supprimer les données à la désactivation
    }
}
