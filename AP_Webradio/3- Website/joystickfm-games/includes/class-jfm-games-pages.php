<?php
/**
 * JoyStick FM Games — Gestion des Pages, Shortcodes & Endpoints AJAX
 *
 * Responsabilité : Provisionnement idempotent des pages /jeux, /activites, /compte,
 * rendu des shortcodes et gestion des requêtes asynchrones d'authentification.
 */

if (!defined('ABSPATH')) {
    exit;
}

class JFM_Games_Pages {

    /**
     * Initialisation des hooks WordPress
     */
    public static function init() {
        // Enregistrement des shortcodes
        add_shortcode('jfm_games_portal', [__CLASS__, 'render_games_portal']);
        add_shortcode('jfm_activities_portal', [__CLASS__, 'render_activities_portal']);
        add_shortcode('jfm_account_portal', [__CLASS__, 'render_account_portal']);

        // Endpoints AJAX pour les actions joueurs
        $ajax_actions = ['jfm_register', 'jfm_login', 'jfm_logout', 'jfm_recover', 'jfm_player_status'];
        foreach ($ajax_actions as $action) {
            add_action("wp_ajax_{$action}", [__CLASS__, "handle_{$action}"]);
            add_action("wp_ajax_nopriv_{$action}", [__CLASS__, "handle_{$action}"]);
        }
    }

    /**
     * Provisionnement idempotent des pages sans écraser le contenu existant
     */
    public static function provision_pages() {
        $pages = [
            'jeux' => [
                'title'   => 'Espace Jeux',
                'content' => '[jfm_games_portal]'
            ],
            'activites' => [
                'title'   => 'Activités & Communauté',
                'content' => '[jfm_activities_portal]'
            ],
            'compte' => [
                'title'   => 'Espace Joueur',
                'content' => '[jfm_account_portal]'
            ]
        ];

        foreach ($pages as $slug => $data) {
            $existing = get_page_by_path($slug);
            if (!$existing) {
                wp_insert_post([
                    'post_name'      => $slug,
                    'post_title'     => $data['title'],
                    'post_content'   => $data['content'],
                    'post_status'    => 'publish',
                    'post_type'      => 'page',
                    'comment_status' => 'closed',
                    'ping_status'    => 'closed'
                ]);
            }
        }
    }

    /**
     * Rendu du portail de jeux [jfm_games_portal]
     */
    public static function render_games_portal() {
        $player = JFM_Games_Auth::get_current_player();
        $is_logged = ($player !== null);
        $login_url = home_url('/compte?redirect_to=' . urlencode(home_url('/jeux')));

        ob_start();
        ?>
        <div class="jfm-portal-wrap">
            <div class="jfm-portal-header">
                <span class="jfm-badge-tag">PORTAIL ARCADE & TCG</span>
                <h1 class="jfm-portal-title">SALLE DES JEUX JOYSTICK FM</h1>
                <p class="jfm-portal-desc">
                    Relevez les défis de la station, collectionnez des cartes légendaires et gagnez des JoyCoins !
                </p>
                <?php if ($is_logged): ?>
                    <div class="jfm-player-strip">
                        <span>Joueur : <strong style="color:var(--bleu-neon);"><?php echo esc_html($player->username_display); ?></strong></span>
                        <span>🪙 <strong><?php echo (int)$player->joycoins; ?></strong> JoyCoins</span>
                        <span>⚡ Niveau <strong><?php echo floor((int)$player->xp / 100) + 1; ?></strong></span>
                        <a href="<?php echo home_url('/compte'); ?>" class="jfm-mini-btn">Mon Compte</a>
                    </div>
                <?php else: ?>
                    <div class="jfm-guest-warning">
                        <span>⚠️ La connexion à un compte joueur est obligatoire pour lancer les jeux et sauvegarder votre progression.</span>
                        <a href="<?php echo esc_url($login_url); ?>" class="jfm-btn-neon-small">Se connecter / S'inscrire</a>
                    </div>
                <?php endif; ?>
            </div>

            <div class="jfm-games-grid">
                <!-- JEU 1 : CATAPULTE ARCADE -->
                <div class="jfm-game-card">
                    <div class="jfm-game-badge jfm-badge-live">DISPONIBLE</div>
                    <div class="jfm-game-icon">🎯</div>
                    <h2 class="jfm-game-name">CATAPULTE ARCADE</h2>
                    <p class="jfm-game-pitch">
                        Projetez votre héros le plus loin possible dans les airs à l'aide du trébuchet rétro ! Récupérez des bonus en vol et battez les records de la radio.
                    </p>
                    <ul class="jfm-game-features">
                        <li>🎮 Physique aérienne dynamique & piqué</li>
                        <li>🏆 Classement des meilleurs tirs</li>
                        <li>⭐ 100% jouable PC (ZQSD) & Tactile</li>
                    </ul>
                    <div class="jfm-game-action">
                        <?php if ($is_logged): ?>
                            <button type="button" class="jfm-btn-play" onclick="if(window.JFM_GAME && window.JFM_GAME.openGameOverlay){ window.JFM_GAME.openGameOverlay(); } else { alert('Erreur chargement moteur jeu.'); }">
                                ▶ LANCER LA PARTIE
                            </button>
                        <?php else: ?>
                            <a href="<?php echo esc_url($login_url); ?>" class="jfm-btn-play jfm-btn-locked">
                                🔒 CONNEXION REQUISE POUR JOUER
                            </a>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- JEU 2 : JOYSTICK TCG -->
                <div class="jfm-game-card jfm-card-tcg">
                    <div class="jfm-game-badge jfm-badge-soon">BÊTA PROCHAINEMENT · LOT 2</div>
                    <div class="jfm-game-icon">🃏</div>
                    <h2 class="jfm-game-name">JOYSTICK TCG</h2>
                    <p class="jfm-game-pitch">
                        Le jeu de cartes à collectionner virtuel aux couleurs de JoyStick FM et de la culture geek. Ouvrez des boosters, découvrez des cartes holographiques et échangez avec vos amis !
                    </p>
                    <ul class="jfm-game-features">
                        <li>📦 10 boosters gratuits offerts à l'inscription</li>
                        <li>✨ 40 cartes, 4 raretés & finitions holographiques</li>
                        <li>🤝 Marché d'échanges en JoyCoins entre joueurs</li>
                    </ul>
                    <div class="jfm-game-action">
                        <button type="button" class="jfm-btn-play jfm-btn-disabled" disabled>
                            ⏳ EN COURS DE DÉVELOPPEMENT (LOT 2)
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Rendu de la page Activités [jfm_activities_portal]
     */
    public static function render_activities_portal() {
        ob_start();
        ?>
        <div class="jfm-portal-wrap">
            <div class="jfm-portal-header">
                <span class="jfm-badge-tag">COMMUNAUTÉ & INTERACTION</span>
                <h1 class="jfm-portal-title">ACTIVITÉS JOYSTICK FM</h1>
                <p class="jfm-portal-desc">
                    Découvrez toutes les façons d'interagir avec votre radio gaming préférée, que ce soit en direct, en jeu ou sur les ondes.
                </p>
            </div>

            <div class="jfm-activities-grid">
                <div class="jfm-activity-item">
                    <div class="jfm-act-icon">📡</div>
                    <h3>Écoute Active & Récompenses</h3>
                    <p>Écoutez le flux Icecast en direct. Chaque palier de 5 minutes d'écoute active vous rapporte des JoyCoins pour enrichir votre collection !</p>
                    <a href="<?php echo home_url('/radio'); ?>" class="jfm-link-neon">Aller au Direct →</a>
                </div>

                <div class="jfm-activity-item">
                    <div class="jfm-act-icon">🎮</div>
                    <h3>Salle des Jeux Arcade</h3>
                    <p>Défiez la physique avec le jeu de Catapulte et préparez-vous à collectionner les cartes virtuelles dans le futur JoyStick TCG.</p>
                    <a href="<?php echo home_url('/jeux'); ?>" class="jfm-link-neon">Entrer dans les Jeux →</a>
                </div>

                <div class="jfm-activity-item">
                    <div class="jfm-act-icon">🥚</div>
                    <h3>Chasse aux 18 Easter Eggs</h3>
                    <p>Des secrets rétro sont disséminés sur tout le site (Konami Code, sons rétro, clics cachés). Trouvez-les pour débloquer des trophées !</p>
                    <span class="jfm-badge-subtle">18 Secrets à découvrir</span>
                </div>

                <div class="jfm-activity-item">
                    <div class="jfm-act-icon">💬</div>
                    <h3>Live Chat & Soundboard</h3>
                    <p>Discutez avec la communauté et les animateurs en temps réel. Les joueurs connectés bénéficient d'un pseudo certifié et de réactions exclusives.</p>
                    <button type="button" class="jfm-btn-neon-small" onclick="document.getElementById('jfm-chat-toggle')?.click();">Ouvrir le Chat</button>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Rendu de la page Compte Joueur [jfm_account_portal]
     */
    public static function render_account_portal() {
        $player = JFM_Games_Auth::get_current_player();
        $redirect_to = sanitize_url($_GET['redirect_to'] ?? home_url('/jeux'));

        ob_start();
        ?>
        <div class="jfm-portal-wrap jfm-account-wrap">
            <?php if ($player): ?>
                <!-- PROFIL DU JOUEUR CONNECTÉ -->
                <div class="jfm-account-card">
                    <div class="jfm-account-header">
                        <div class="jfm-avatar-circle">🎮</div>
                        <div>
                            <span class="jfm-badge-tag">COMPTE CERTIFIÉ</span>
                            <h2 class="jfm-account-name"><?php echo esc_html($player->username_display); ?></h2>
                            <p class="jfm-account-meta">Inscrit sur JoyStick FM · Joueur indépendant de WordPress</p>
                        </div>
                    </div>

                    <div class="jfm-stats-grid">
                        <div class="jfm-stat-box">
                            <span class="jfm-stat-val">🪙 <?php echo (int)$player->joycoins; ?></span>
                            <span class="jfm-stat-lbl">JoyCoins Dépensables</span>
                        </div>
                        <div class="jfm-stat-box">
                            <span class="jfm-stat-val">⚡ <?php echo (int)$player->xp; ?> XP</span>
                            <span class="jfm-stat-lbl">Progression (Niveau <?php echo floor((int)$player->xp / 100) + 1; ?>)</span>
                        </div>
                        <div class="jfm-stat-box">
                            <span class="jfm-stat-val">📦 <?php echo (int)$player->free_boosters_available; ?></span>
                            <span class="jfm-stat-lbl">Boosters Disponibles</span>
                        </div>
                    </div>

                    <div class="jfm-account-actions">
                        <a href="<?php echo esc_url($redirect_to); ?>" class="jfm-btn-play">▶ RETOURNER AUX JEUX</a>
                        <button type="button" class="jfm-btn-danger" id="jfm-btn-logout">Déconnexion</button>
                    </div>
                </div>
            <?php else: ?>
                <!-- FORMULAIRES DE CONNEXION / INSCRIPTION -->
                <div class="jfm-auth-container">
                    <div class="jfm-auth-tabs" role="tablist">
                        <button type="button" class="jfm-tab-btn active" data-tab="login">Connexion</button>
                        <button type="button" class="jfm-tab-btn" data-tab="register">Créer un compte</button>
                        <button type="button" class="jfm-tab-btn" data-tab="recover">Code de secours</button>
                    </div>

                    <!-- TAB 1 : CONNEXION -->
                    <form id="jfm-form-login" class="jfm-auth-form active" novalidate>
                        <input type="hidden" name="action" value="jfm_login">
                        <input type="hidden" name="redirect_to" value="<?php echo esc_attr($redirect_to); ?>">
                        <?php wp_nonce_field('jfm_auth_nonce', 'jfm_nonce'); ?>

                        <div class="jfm-form-field">
                            <label for="jfm-login-user">Pseudo du joueur</label>
                            <input type="text" id="jfm-login-user" name="username" required autocomplete="username" placeholder="Ex: PixelKnight">
                        </div>

                        <div class="jfm-form-field">
                            <label for="jfm-login-pin">Code PIN secret</label>
                            <input type="password" id="jfm-login-pin" name="pin" required autocomplete="current-password" placeholder="4 à 8 chiffres ou caractères" maxlength="16">
                        </div>

                        <div class="jfm-form-field-checkbox">
                            <label>
                                <input type="checkbox" name="remember_me" value="1" checked> Se souvenir de moi pendant 30 jours
                            </label>
                        </div>

                        <div class="jfm-form-msg" id="jfm-login-msg"></div>

                        <button type="submit" class="jfm-btn-play">SE CONNECTER</button>
                    </form>

                    <!-- TAB 2 : INSCRIPTION -->
                    <form id="jfm-form-register" class="jfm-auth-form" novalidate>
                        <input type="hidden" name="action" value="jfm_register">
                        <input type="hidden" name="redirect_to" value="<?php echo esc_attr($redirect_to); ?>">
                        <?php wp_nonce_field('jfm_auth_nonce', 'jfm_nonce'); ?>

                        <div class="jfm-form-field">
                            <label for="jfm-reg-user">Choisis ton pseudo (3 à 30 caractères)</label>
                            <input type="text" id="jfm-reg-user" name="username" required placeholder="Ex: RetroGamer64" maxlength="30">
                            <small>Lettres, chiffres, tirets et points acceptés. Insensible à la casse.</small>
                        </div>

                        <div class="jfm-form-field">
                            <label for="jfm-reg-pin">Code PIN secret (4 à 16 caractères)</label>
                            <input type="password" id="jfm-reg-pin" name="pin" required placeholder="Code secret facile à retenir" maxlength="16">
                        </div>

                        <div class="jfm-bonus-announcement">
                            🎁 <strong>Pack de Bienvenue offert :</strong> 100 JoyCoins + 10 boosters JoyStick TCG crédités à l'inscription !
                        </div>

                        <div class="jfm-form-msg" id="jfm-reg-msg"></div>

                        <button type="submit" class="jfm-btn-play">CRÉER MON COMPTE GRATUIT</button>
                    </form>

                    <!-- TAB 3 : CODE DE SECOURS -->
                    <form id="jfm-form-recover" class="jfm-auth-form" novalidate>
                        <input type="hidden" name="action" value="jfm_recover">
                        <?php wp_nonce_field('jfm_auth_nonce', 'jfm_nonce'); ?>

                        <div class="jfm-form-field">
                            <label for="jfm-rec-user">Ton pseudo</label>
                            <input type="text" id="jfm-rec-user" name="username" required placeholder="Ex: RetroGamer64">
                        </div>

                        <div class="jfm-form-field">
                            <label for="jfm-rec-code">Code de secours unique (fourni à l'inscription)</label>
                            <input type="text" id="jfm-rec-code" name="recovery_code" required placeholder="JFM-XXXX-XXXX-XXXX">
                        </div>

                        <div class="jfm-form-field">
                            <label for="jfm-rec-pin">Nouveau code PIN secret</label>
                            <input type="password" id="jfm-rec-pin" name="new_pin" required placeholder="Nouveau code PIN (min 4 car.)" maxlength="16">
                        </div>

                        <div class="jfm-form-msg" id="jfm-rec-msg"></div>

                        <button type="submit" class="jfm-btn-play">RÉINITIALISER MON CODE PIN</button>
                    </form>

                    <!-- MODAL POPUP DU CODE DE SECOURS APRÈS INSCRIPTION -->
                    <div id="jfm-recovery-modal" class="jfm-modal" style="display:none;">
                        <div class="jfm-modal-content">
                            <h3>⚠️ SAUVEGARDEZ VOTRE CODE DE SECOURS</h3>
                            <p>Ce code aléatoire est le <strong>seul moyen</strong> de récupérer votre compte en cas d'oubli de votre code PIN. Il ne sera <strong>plus jamais réaffiché</strong>.</p>
                            <div class="jfm-recovery-box" id="jfm-display-recovery-code"></div>
                            <button type="button" class="jfm-btn-play" id="jfm-btn-copy-code">COPIER & CONTINUER</button>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Traitement AJAX : Inscription
     */
    public static function handle_jfm_register() {
        check_ajax_referer('jfm_auth_nonce', 'jfm_nonce');

        $username = sanitize_text_field(wp_unslash($_POST['username'] ?? ''));
        $pin      = sanitize_text_field(wp_unslash($_POST['pin'] ?? ''));

        list($ok, $res) = JFM_Games_Auth::register($username, $pin);

        if (!$ok) {
            wp_send_json_error(['message' => $res]);
        }

        wp_send_json_success($res);
    }

    /**
     * Traitement AJAX : Connexion
     */
    public static function handle_jfm_login() {
        check_ajax_referer('jfm_auth_nonce', 'jfm_nonce');

        $username = sanitize_text_field(wp_unslash($_POST['username'] ?? ''));
        $pin      = sanitize_text_field(wp_unslash($_POST['pin'] ?? ''));
        $remember = !empty($_POST['remember_me']);

        list($ok, $res) = JFM_Games_Auth::login($username, $pin, $remember);

        if (!$ok) {
            wp_send_json_error(['message' => $res]);
        }

        wp_send_json_success($res);
    }

    /**
     * Traitement AJAX : Déconnexion
     */
    public static function handle_jfm_logout() {
        JFM_Games_Auth::logout();
        wp_send_json_success(['message' => 'Déconnecté avec succès.']);
    }

    /**
     * Traitement AJAX : Récupération
     */
    public static function handle_jfm_recover() {
        check_ajax_referer('jfm_auth_nonce', 'jfm_nonce');

        $username = sanitize_text_field(wp_unslash($_POST['username'] ?? ''));
        $code     = sanitize_text_field(wp_unslash($_POST['recovery_code'] ?? ''));
        $new_pin  = sanitize_text_field(wp_unslash($_POST['new_pin'] ?? ''));

        list($ok, $res) = JFM_Games_Auth::recover_account($username, $code, $new_pin);

        if (!$ok) {
            wp_send_json_error(['message' => $res]);
        }

        wp_send_json_success($res);
    }

    /**
     * Traitement AJAX : Statut de session joueur
     */
    public static function handle_jfm_player_status() {
        $player = JFM_Games_Auth::get_current_player();
        if ($player) {
            wp_send_json_success([
                'logged_in'     => true,
                'player_id'     => (int)$player->id,
                'username'      => $player->username_display,
                'joycoins'      => (int)$player->joycoins,
                'xp'            => (int)$player->xp,
                'free_boosters' => (int)$player->free_boosters_available
            ]);
        } else {
            wp_send_json_success([
                'logged_in' => false
            ]);
        }
    }
}
