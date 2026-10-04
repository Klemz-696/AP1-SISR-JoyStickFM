<?php
/**
 * JoyStick FM Games — Moteur JoyStick TCG (Trading Card Game)
 *
 * Responsabilité : Gestion du catalogue des 40 cartes, ouverture de boosters
 * probabilistes sécurisés côté serveur, album de collection et inventaire persistant.
 */

if (!defined('ABSPATH')) {
    exit;
}

class JFM_Games_TCG {

    const FREE_BOOSTER_INTERVAL_SECONDS = 600; // 10 minutes
    const BOOSTER_PRICE_JOYCOINS = 50;
    const RECYCLE_VALUE_JOYCOINS = 20;

    /**
     * Initialisation des routes AJAX
     */
    public static function init() {
        $ajax_actions = [
            'jfm_tcg_get_collection',
            'jfm_tcg_open_booster',
            'jfm_tcg_claim_free_booster',
            'jfm_tcg_buy_booster',
            'jfm_tcg_recycle_card'
        ];

        foreach ($ajax_actions as $action) {
            add_action("wp_ajax_{$action}", [__CLASS__, "handle_{$action}"]);
            add_action("wp_ajax_nopriv_{$action}", [__CLASS__, "handle_unauthorized"]);
        }
    }

    /**
     * Réponse pour les invités non connectés
     */
    public static function handle_unauthorized() {
        wp_send_json_error([
            'message' => 'Connexion requise pour accéder au jeu de cartes JoyStick TCG.',
            'code'    => 'auth_required'
        ], 401);
    }

    /**
     * Endpoint : Récupère la collection de cartes et statistiques du joueur
     */
    public static function handle_jfm_tcg_get_collection() {
        $player = JFM_Games_Auth::get_current_player();
        if (!$player) {
            self::handle_unauthorized();
        }

        global $wpdb;
        $prefix = $wpdb->prefix;
        $table_cards = "{$prefix}jfm_tcg_cards";
        $table_inv   = "{$prefix}jfm_tcg_inventory";

        // Récupération de l'ensemble du catalogue avec les possessions du joueur
        $sql = "
            SELECT 
                c.id, c.slug, c.name, c.category, c.rarity, c.power, c.description, c.lore, c.icon, c.bg_gradient,
                COALESCE(SUM(CASE WHEN i.is_holo = 0 THEN i.quantity ELSE 0 END), 0) AS qty_normal,
                COALESCE(SUM(CASE WHEN i.is_holo = 1 THEN i.quantity ELSE 0 END), 0) AS qty_holo
            FROM {$table_cards} c
            LEFT JOIN {$table_inv} i ON c.id = i.card_id AND i.player_id = %d
            GROUP BY c.id
            ORDER BY 
                FIELD(c.rarity, 'legendary', 'epic', 'rare', 'common'),
                c.power DESC,
                c.id ASC
        ";

        $cards_raw = $wpdb->get_results($wpdb->prepare($sql, $player->id));

        $cards = [];
        $unique_discovered = 0;
        $total_holos = 0;

        foreach ($cards_raw as $c) {
            $qty_normal = (int)$c->qty_normal;
            $qty_holo   = (int)$c->qty_holo;
            $is_owned   = ($qty_normal > 0 || $qty_holo > 0);

            if ($is_owned) {
                $unique_discovered++;
            }
            if ($qty_holo > 0) {
                $total_holos += $qty_holo;
            }

            $cards[] = [
                'id'          => (int)$c->id,
                'slug'        => $c->slug,
                'name'        => $c->name,
                'category'    => $c->category,
                'rarity'      => $c->rarity,
                'power'       => (int)$c->power,
                'description' => $c->description,
                'lore'        => $c->lore,
                'icon'        => $c->icon,
                'bg_gradient' => $c->bg_gradient,
                'qty_normal'  => $qty_normal,
                'qty_holo'    => $qty_holo,
                'is_owned'    => $is_owned
            ];
        }

        // Calcul du délai pour le booster gratuit suivant
        $now = time();
        $last_free_ts = $player->last_free_booster_at ? strtotime($player->last_free_booster_at) : 0;
        $elapsed = $now - $last_free_ts;
        $can_claim_free = ($elapsed >= self::FREE_BOOSTER_INTERVAL_SECONDS || empty($player->last_free_booster_at));
        $seconds_remaining = $can_claim_free ? 0 : (self::FREE_BOOSTER_INTERVAL_SECONDS - $elapsed);

        wp_send_json_success([
            'cards' => $cards,
            'stats' => [
                'total_catalog'      => count($cards),
                'unique_discovered'  => $unique_discovered,
                'completion_pct'     => count($cards) > 0 ? round(($unique_discovered / count($cards)) * 100) : 0,
                'total_holos'        => $total_holos,
                'available_boosters' => (int)$player->free_boosters_available,
                'joycoins'           => (int)$player->joycoins,
                'xp'                 => (int)$player->xp,
                'can_claim_free'     => $can_claim_free,
                'seconds_remaining'  => $seconds_remaining
            ]
        ]);
    }

    /**
     * Endpoint : Tirage aléatoire sécurisé d'un booster de 5 cartes
     */
    public static function handle_jfm_tcg_open_booster() {
        check_ajax_referer('jfm_tcg_nonce', 'security');

        $player = JFM_Games_Auth::get_current_player();
        if (!$player) {
            self::handle_unauthorized();
        }

        if ((int)$player->free_boosters_available <= 0) {
            wp_send_json_error([
                'message' => 'Aucun booster disponible. Patientez pour le prochain booster gratuit ou achetez-en avec vos JoyCoins !',
                'code'    => 'no_boosters'
            ], 400);
        }

        global $wpdb;
        $prefix = $wpdb->prefix;
        $table_cards     = "{$prefix}jfm_tcg_cards";
        $table_inventory = "{$prefix}jfm_tcg_inventory";
        $table_players   = "{$prefix}jfm_players";

        // Récupération de toutes les cartes du catalogue par rareté
        $all_cards = $wpdb->get_results("SELECT * FROM {$table_cards}");
        if (empty($all_cards)) {
            wp_send_json_error(['message' => 'Catalogue de cartes vide.'], 500);
        }

        $cards_by_rarity = [
            'common'    => [],
            'rare'      => [],
            'epic'      => [],
            'legendary' => []
        ];

        foreach ($all_cards as $c) {
            $cards_by_rarity[$c->rarity][] = $c;
        }

        // 5 cartes par booster :
        // Slots 1, 2, 3 : Standard
        // Slot 4 : Standard bonifié
        // Slot 5 : GARANTI Rare ou supérieur (Rare 70%, Epic 23%, Legendary 7%)
        $drawn_cards = [];

        // Fonction helper de tirage de rareté
        $pick_rarity = function ($weights) {
            $rand = mt_rand(1, 100);
            $cumulative = 0;
            foreach ($weights as $rarity => $w) {
                $cumulative += $w;
                if ($rand <= $cumulative) {
                    return $rarity;
                }
            }
            return 'common';
        };

        // Slots 1 à 3 (Common 70%, Rare 22%, Epic 7%, Legendary 1%)
        for ($i = 0; $i < 3; $i++) {
            $rarity = $pick_rarity(['common' => 70, 'rare' => 22, 'epic' => 7, 'legendary' => 1]);
            $pool = !empty($cards_by_rarity[$rarity]) ? $cards_by_rarity[$rarity] : $all_cards;
            $card_obj = $pool[array_rand($pool)];
            $is_holo = (mt_rand(1, 100) <= 10); // 10% de chance d'être holographique
            $drawn_cards[] = ['card' => $card_obj, 'is_holo' => $is_holo ? 1 : 0];
        }

        // Slot 4 (Common 50%, Rare 35%, Epic 12%, Legendary 3%)
        $rarity4 = $pick_rarity(['common' => 50, 'rare' => 35, 'epic' => 12, 'legendary' => 3]);
        $pool4 = !empty($cards_by_rarity[$rarity4]) ? $cards_by_rarity[$rarity4] : $all_cards;
        $card_obj4 = $pool4[array_rand($pool4)];
        $is_holo4 = (mt_rand(1, 100) <= 10);
        $drawn_cards[] = ['card' => $card_obj4, 'is_holo' => $is_holo4 ? 1 : 0];

        // Slot 5 (GARANTI RARE OU MIEUX : Rare 70%, Epic 23%, Legendary 7%)
        $rarity5 = $pick_rarity(['rare' => 70, 'epic' => 23, 'legendary' => 7]);
        $pool5 = !empty($cards_by_rarity[$rarity5]) ? $cards_by_rarity[$rarity5] : $cards_by_rarity['rare'];
        $card_obj5 = $pool5[array_rand($pool5)];
        $is_holo5 = (mt_rand(1, 100) <= 15); // Bonus 15% de chance holo sur le slot rare garanti !
        $drawn_cards[] = ['card' => $card_obj5, 'is_holo' => $is_holo5 ? 1 : 0];

        // Transaction MariaDB : décrémenter le booster, ajouter l'XP et insérer dans l'inventaire
        $wpdb->query('START TRANSACTION');

        try {
            // Décrémentation du booster et gain de 30 XP + 5 JoyCoins
            $updated_player = $wpdb->query($wpdb->prepare("
                UPDATE {$table_players}
                SET 
                    free_boosters_available = free_boosters_available - 1,
                    xp = xp + 30,
                    joycoins = joycoins + 5
                WHERE id = %d AND free_boosters_available > 0
            ", $player->id));

            if (!$updated_player) {
                throw new Exception('Impossible de déduire le booster.');
            }

            // Insertion des 5 cartes dans l'inventaire
            foreach ($drawn_cards as $drawn) {
                $cid = (int)$drawn['card']->id;
                $holo = (int)$drawn['is_holo'];

                $wpdb->query($wpdb->prepare("
                    INSERT INTO {$table_inventory} (player_id, card_id, is_holo, quantity, first_acquired_at)
                    VALUES (%d, %d, %d, 1, NOW())
                    ON DUPLICATE KEY UPDATE quantity = quantity + 1
                ", $player->id, $cid, $holo));
            }

            $wpdb->query('COMMIT');
        } catch (Exception $e) {
            $wpdb->query('ROLLBACK');
            wp_send_json_error(['message' => 'Erreur lors de l\'enregistrement des cartes : ' . $e->getMessage()], 500);
        }

        // Formatage de la réponse pour le client
        $response_cards = [];
        foreach ($drawn_cards as $d) {
            $c = $d['card'];
            $response_cards[] = [
                'id'          => (int)$c->id,
                'slug'        => $c->slug,
                'name'        => $c->name,
                'category'    => $c->category,
                'rarity'      => $c->rarity,
                'power'       => (int)$c->power,
                'description' => $c->description,
                'lore'        => $c->lore,
                'icon'        => $c->icon,
                'bg_gradient' => $c->bg_gradient,
                'is_holo'     => ($d['is_holo'] === 1)
            ];
        }

        // Récupération des soldes à jour
        $fresh_player = $wpdb->get_row($wpdb->prepare("SELECT free_boosters_available, joycoins, xp FROM {$table_players} WHERE id = %d", $player->id));

        wp_send_json_success([
            'message'            => 'Booster ouvert avec succès !',
            'cards'              => $response_cards,
            'available_boosters' => (int)$fresh_player->free_boosters_available,
            'joycoins'           => (int)$fresh_player->joycoins,
            'xp'                 => (int)$fresh_player->xp
        ]);
    }

    /**
     * Endpoint : Réclamer le booster gratuit toutes les 10 minutes
     */
    public static function handle_jfm_tcg_claim_free_booster() {
        check_ajax_referer('jfm_tcg_nonce', 'security');

        $player = JFM_Games_Auth::get_current_player();
        if (!$player) {
            self::handle_unauthorized();
        }

        $now = time();
        $last_free_ts = $player->last_free_booster_at ? strtotime($player->last_free_booster_at) : 0;
        $elapsed = $now - $last_free_ts;

        if ($elapsed < self::FREE_BOOSTER_INTERVAL_SECONDS && !empty($player->last_free_booster_at)) {
            $remaining = self::FREE_BOOSTER_INTERVAL_SECONDS - $elapsed;
            wp_send_json_error([
                'message'   => "Prochain booster gratuit disponible dans " . ceil($remaining / 60) . " minute(s).",
                'remaining' => $remaining
            ], 400);
        }

        global $wpdb;
        $table_players = "{$wpdb->prefix}jfm_players";

        $wpdb->query($wpdb->prepare("
            UPDATE {$table_players}
            SET 
                free_boosters_available = free_boosters_available + 1,
                last_free_booster_at = NOW()
            WHERE id = %d
        ", $player->id));

        $new_boosters = (int)$wpdb->get_var($wpdb->prepare("SELECT free_boosters_available FROM {$table_players} WHERE id = %d", $player->id));

        wp_send_json_success([
            'message'            => '🎁 1 Booster gratuit ajouté à votre inventaire !',
            'available_boosters' => $new_boosters
        ]);
    }

    /**
     * Endpoint : Acheter un booster avec des JoyCoins
     */
    public static function handle_jfm_tcg_buy_booster() {
        check_ajax_referer('jfm_tcg_nonce', 'security');

        $player = JFM_Games_Auth::get_current_player();
        if (!$player) {
            self::handle_unauthorized();
        }

        if ((int)$player->joycoins < self::BOOSTER_PRICE_JOYCOINS) {
            wp_send_json_error([
                'message' => 'JoyCoins insuffisants (50 JoyCoins requis). Jouez à la Catapulte ou écoutez la radio pour en gagner !'
            ], 400);
        }

        global $wpdb;
        $table_players = "{$wpdb->prefix}jfm_players";

        $wpdb->query($wpdb->prepare("
            UPDATE {$table_players}
            SET 
                joycoins = joycoins - %d,
                free_boosters_available = free_boosters_available + 1
            WHERE id = %d AND joycoins >= %d
        ", self::BOOSTER_PRICE_JOYCOINS, $player->id, self::BOOSTER_PRICE_JOYCOINS));

        $fresh = $wpdb->get_row($wpdb->prepare("SELECT joycoins, free_boosters_available FROM {$table_players} WHERE id = %d", $player->id));

        wp_send_json_success([
            'message'            => '🛒 Booster acheté avec succès !',
            'joycoins'           => (int)$fresh->joycoins,
            'available_boosters' => (int)$fresh->free_boosters_available
        ]);
    }

    /**
     * Endpoint : Recycler un doublon en JoyCoins (+20 JoyCoins)
     */
    public static function handle_jfm_tcg_recycle_card() {
        check_ajax_referer('jfm_tcg_nonce', 'security');

        $player = JFM_Games_Auth::get_current_player();
        if (!$player) {
            self::handle_unauthorized();
        }

        $card_id = isset($_POST['card_id']) ? (int)$_POST['card_id'] : 0;
        $is_holo = isset($_POST['is_holo']) ? (int)$_POST['is_holo'] : 0;

        if ($card_id <= 0) {
            wp_send_json_error(['message' => 'Identifiant de carte invalide.'], 400);
        }

        global $wpdb;
        $prefix = $wpdb->prefix;
        $table_inv     = "{$prefix}jfm_tcg_inventory";
        $table_players = "{$prefix}jfm_players";

        // Vérification que le joueur possède bien un doublon (quantité > 1)
        $inv = $wpdb->get_row($wpdb->prepare("
            SELECT quantity FROM {$table_inv}
            WHERE player_id = %d AND card_id = %d AND is_holo = %d
        ", $player->id, $card_id, $is_holo));

        if (!$inv || (int)$inv->quantity <= 1) {
            wp_send_json_error(['message' => 'Vous ne pouvez recycler que des doublons (au moins 2 exemplaires requis).'], 400);
        }

        $recycle_gain = ($is_holo === 1) ? 50 : self::RECYCLE_VALUE_JOYCOINS;

        $wpdb->query('START TRANSACTION');
        try {
            $wpdb->query($wpdb->prepare("
                UPDATE {$table_inv}
                SET quantity = quantity - 1
                WHERE player_id = %d AND card_id = %d AND is_holo = %d AND quantity > 1
            ", $player->id, $card_id, $is_holo));

            $wpdb->query($wpdb->prepare("
                UPDATE {$table_players}
                SET joycoins = joycoins + %d
                WHERE id = %d
            ", $recycle_gain, $player->id));

            $wpdb->query('COMMIT');
        } catch (Exception $e) {
            $wpdb->query('ROLLBACK');
            wp_send_json_error(['message' => 'Erreur lors du recyclage.'], 500);
        }

        $new_coins = (int)$wpdb->get_var($wpdb->prepare("SELECT joycoins FROM {$table_players} WHERE id = %d", $player->id));

        wp_send_json_success([
            'message'   => "♻️ Carte recyclée ! +{$recycle_gain} JoyCoins crédités.",
            'joycoins'  => $new_coins
        ]);
    }
}
