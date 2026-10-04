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
        $ajax_actions = ['jfm_register', 'jfm_login', 'jfm_logout', 'jfm_recover', 'jfm_player_status', 'jfm_update_avatar'];
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
    /**
     * Rendu du portail de jeux [jfm_games_portal] (Univers de Jeu Dédié & Immersif)
     */
    public static function render_games_portal() {
        $player = JFM_Games_Auth::get_current_player();
        $is_logged = ($player !== null);
        $login_url = home_url('/compte?redirect_to=' . urlencode(home_url('/jeux')));
        $p_avatar = ($is_logged && !empty($player->avatar_url)) ? $player->avatar_url : '';
        $card_avatar_icon = '🃏';
        $card_avatar_bg = 'linear-gradient(135deg, #00f5ff, #b44fff)';
        if (!empty($p_avatar) && strpos($p_avatar, 'card:') === 0) {
            global $wpdb;
            $card_id = (int)substr($p_avatar, 5);
            $card_row = $wpdb->get_row($wpdb->prepare("SELECT icon, bg_gradient FROM {$wpdb->prefix}jfm_tcg_cards WHERE id = %d", $card_id));
            if ($card_row) {
                if (!empty($card_row->icon)) $card_avatar_icon = $card_row->icon;
                if (!empty($card_row->bg_gradient)) $card_avatar_bg = $card_row->bg_gradient;
            }
        }

        ob_start();
        ?>
        <div class="jfm-game-universe" id="jfm-game-universe">
            <!-- ── BARRE SUPÉRIEURE DU HUB DE JEU (Cockpit Gaming) ── -->
            <header class="jfm-game-topbar" role="banner">
                <div class="jfm-gtb-left">
                    <!-- Menu d'accès au reste du site JoyStick FM -->
                    <div class="jfm-site-switch-wrap">
                        <button type="button" class="jfm-btn-site-menu" id="jfm-btn-site-menu" aria-expanded="false" aria-haspopup="true" title="Accéder au reste du site JoyStick FM">
                            <span class="jfm-btn-site-icon" aria-hidden="true">📻</span>
                            <span class="jfm-btn-site-text">JoyStick FM</span>
                            <span class="jfm-btn-site-arrow" aria-hidden="true">▾</span>
                        </button>
                        <div class="jfm-site-dropdown" id="jfm-site-dropdown" role="menu">
                            <div class="jfm-dropdown-title">PORTAIL WEBRADIO</div>
                            <a href="<?php echo home_url('/'); ?>" class="jfm-dropdown-link" role="menuitem">🏠 Accueil du Site</a>
                            <a href="<?php echo home_url('/radio/'); ?>" class="jfm-dropdown-link" role="menuitem">📡 Écouter en Direct (Live)</a>
                            <a href="<?php echo home_url('/activites/'); ?>" class="jfm-dropdown-link" role="menuitem">⚡ Activités & Communauté</a>
                            <a href="<?php echo home_url('/podcasts/'); ?>" class="jfm-dropdown-link" role="menuitem">🎙 Podcasts</a>
                            <a href="<?php echo home_url('/blog/'); ?>" class="jfm-dropdown-link" role="menuitem">📰 Blog & Actualités</a>
                            <a href="<?php echo home_url('/contact/'); ?>" class="jfm-dropdown-link" role="menuitem">✉ Contact</a>
                            <div class="jfm-dropdown-sep"></div>
                            <a href="<?php echo home_url('/'); ?>" class="jfm-dropdown-link-exit" role="menuitem">← Quitter l'espace jeux</a>
                        </div>
                    </div>

                    <div class="jfm-gtb-divider" aria-hidden="true"></div>
                    <div class="jfm-gtb-brand">
                        <span class="jfm-gtb-brand-badge">ARCADE & TCG</span>
                    </div>
                </div>

                <!-- SOUS-PAGES DU JEU (Navigation principale de l'univers) -->
                <nav class="jfm-game-subnav" aria-label="Navigation principale du jeu">
                    <button type="button" class="jfm-game-nav-tab active" data-subpage="boosters">
                        <span class="jfm-tab-ico" aria-hidden="true">📦</span>
                        <span class="jfm-tab-lbl">Accueil & Boosters</span>
                        <?php if ($is_logged && (int)$player->free_boosters_available > 0): ?>
                            <span class="jfm-tab-pill-badge" id="jfm-nav-boosters-badge"><?php echo (int)$player->free_boosters_available; ?></span>
                        <?php endif; ?>
                    </button>

                    <button type="button" class="jfm-game-nav-tab" data-subpage="collection">
                        <span class="jfm-tab-ico" aria-hidden="true">📖</span>
                        <span class="jfm-tab-lbl">Ma Collection</span>
                        <span class="jfm-tab-pill-prog" id="jfm-nav-prog-badge">--/40</span>
                    </button>

                    <button type="button" class="jfm-game-nav-tab" data-subpage="arcade">
                        <span class="jfm-tab-ico" aria-hidden="true">🎯</span>
                        <span class="jfm-tab-lbl">Catapulte Arcade</span>
                    </button>

                    <button type="button" class="jfm-game-nav-tab" data-subpage="profil">
                        <span class="jfm-tab-ico" aria-hidden="true">👤</span>
                        <span class="jfm-tab-lbl">Profil & Avatar</span>
                    </button>
                </nav>

                <!-- Zone Joueur / Statut à droite -->
                <div class="jfm-gtb-right">
                    <?php if ($is_logged): ?>
                        <div class="jfm-gtb-player-pill" id="jfm-gtb-player-pill" role="button" tabindex="0" title="Gérer mon profil et changer mon avatar">
                            <div class="jfm-gtb-avatar-wrap">
                                <?php if (!empty($p_avatar) && strpos($p_avatar, 'data:image/') === 0): ?>
                                    <img src="<?php echo esc_attr($p_avatar); ?>" alt="Avatar" class="jfm-gtb-avatar-img" />
                                <?php elseif (!empty($p_avatar) && strpos($p_avatar, 'card:') === 0): ?>
                                    <span class="jfm-gtb-avatar-card-icon"><?php echo esc_html($card_avatar_icon); ?></span>
                                <?php else: ?>
                                    <span class="jfm-gtb-avatar-default">👤</span>
                                <?php endif; ?>
                            </div>
                            <div class="jfm-gtb-player-meta">
                                <span class="jfm-gtb-username"><?php echo esc_html($player->username_display); ?></span>
                                <div class="jfm-gtb-chips">
                                    <span class="jfm-chip-coin" title="JoyCoins">🪙 <strong id="jfm-top-coins-val"><?php echo (int)$player->joycoins; ?></strong></span>
                                    <span class="jfm-chip-booster" title="Boosters disponibles">📦 <strong id="jfm-top-boosters-val"><?php echo (int)$player->free_boosters_available; ?></strong></span>
                                </div>
                            </div>
                        </div>
                    <?php else: ?>
                        <a href="<?php echo esc_url($login_url); ?>" class="jfm-btn-neon-small">
                            Connexion / S'inscrire
                        </a>
                    <?php endif; ?>
                </div>
            </header>

            <!-- ── CONTENU DES DIFFÉRENTES SOUS-PAGES DU JEU ── -->
            <main class="jfm-game-main">

                <!-- ══════════════════════════════════════════════════════════
                     SOUS-PAGE 1 : ACCUEIL & OUVERTURE DES BOOSTERS
                     ══════════════════════════════════════════════════════════ -->
                <section id="jfm-subpage-boosters" class="jfm-game-subpage active" aria-labelledby="heading-boosters">
                    <div class="jfm-subpage-inner">
                        <div class="jfm-booster-hero">
                            <span class="jfm-badge-tag">MOTEUR JOYSTICK TCG</span>
                            <h1 id="heading-boosters" class="jfm-portal-title">CHAMBRE DES BOOSTERS</h1>
                            <p class="jfm-portal-desc">
                                Ouvrez des boosters pour révéler des cartes rétro uniques, débloquer des variantes holographiques rares et compléter votre album de 40 cartes.
                            </p>

                            <?php if (!$is_logged): ?>
                                <div class="jfm-guest-warning" style="margin: 1.5rem auto; max-width: 650px;">
                                    <span>⚠️ Connectez-vous pour recevoir <strong>10 boosters gratuits offerts</strong> et sauvegarder votre collection !</span>
                                    <a href="<?php echo esc_url($login_url); ?>" class="jfm-btn-neon-small">Se connecter</a>
                                </div>
                            <?php endif; ?>
                        </div>

                        <!-- Scène Centrale du Booster Pack 3D -->
                        <div class="jfm-booster-stage">
                            <div class="jfm-booster-pack-wrapper">
                                <div class="jfm-booster-pack-3d" id="jfm-booster-visual">
                                    <div class="jfm-bp-shimmer"></div>
                                    <div class="jfm-bp-content">
                                        <div class="jfm-bp-top">
                                            <span class="jfm-bp-edition">ÉDITION 1986</span>
                                            <span class="jfm-bp-count">5 CARTES</span>
                                        </div>
                                        <div class="jfm-bp-logo">
                                            <div class="jfm-bp-icon">🃏</div>
                                            <div class="jfm-bp-title">JOYSTICK</div>
                                            <div class="jfm-bp-sub">TRADING CARD GAME</div>
                                        </div>
                                        <div class="jfm-bp-footer">
                                            <span>✨ RARE GARANTIE</span>
                                            <span>10% HOLO</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Tableau de bord et actions d'ouverture -->
                            <div class="jfm-booster-controls">
                                <div class="jfm-tcg-stats-bar">
                                    <div class="jfm-tcg-stat-item">
                                        <span class="tcg-stat-label">📦 Boosters en stock</span>
                                        <span class="tcg-stat-value" id="jfm-tcg-boosters-count"><?php echo $is_logged ? (int)$player->free_boosters_available : 0; ?></span>
                                    </div>
                                    <div class="jfm-tcg-stat-item">
                                        <span class="tcg-stat-label">🪙 JoyCoins</span>
                                        <span class="tcg-stat-value" id="jfm-tcg-coins-count"><?php echo $is_logged ? (int)$player->joycoins : 0; ?></span>
                                    </div>
                                    <div class="jfm-tcg-stat-item">
                                        <span class="tcg-stat-label">🎯 Album complété</span>
                                        <span class="tcg-stat-value" id="jfm-tcg-completion-text">Chargement...</span>
                                    </div>
                                </div>

                                <div class="jfm-booster-action-buttons">
                                    <?php if ($is_logged): ?>
                                        <button type="button" id="jfm-btn-open-booster" class="jfm-btn-big-booster">
                                            <span class="jfm-btn-icon">⚡</span> OUVRIR UN BOOSTER (5 CARTES)
                                        </button>

                                        <div class="jfm-tcg-sub-actions">
                                            <span id="jfm-tcg-timer-wrap" class="jfm-timer-badge">
                                                ⏳ Prochain booster gratuit dans : <strong id="jfm-tcg-timer-text">--:--</strong>
                                            </span>
                                            <button type="button" id="jfm-btn-claim-free" class="jfm-mini-btn" style="display:none;background:rgba(57,255,20,0.2);color:#39ff14;border-color:#39ff14;">
                                                🎁 Réclamer mon booster gratuit !
                                            </button>
                                            <button type="button" id="jfm-btn-buy-booster" class="jfm-mini-btn">
                                                🛒 Acheter 1 booster (50 🪙)
                                            </button>
                                        </div>
                                    <?php else: ?>
                                        <a href="<?php echo esc_url($login_url); ?>" class="jfm-btn-big-booster" style="text-decoration:none;display:inline-flex;">
                                            🔒 SE CONNECTER POUR OUVRIR VOS 10 BOOSTERS
                                        </a>
                                    <?php endif; ?>
                                </div>

                                <!-- Accès direct vers le classeur -->
                                <div class="jfm-booster-switch-link">
                                    <button type="button" class="jfm-link-btn" onclick="window.JFM_GAMES.switchSubpage('collection')">
                                        📖 Consulter mon album de cartes complété →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- ══════════════════════════════════════════════════════════
                     SOUS-PAGE 2 : MA COLLECTION (CLASSEUR DE CARTES TCG)
                     ══════════════════════════════════════════════════════════ -->
                <section id="jfm-subpage-collection" class="jfm-game-subpage" style="display:none;" aria-labelledby="heading-collection">
                    <div class="jfm-subpage-inner">
                        <div class="jfm-collection-header-wrap">
                            <div class="jfm-ch-left">
                                <span class="jfm-badge-tag">CLASSEUR DE CARTES</span>
                                <h2 id="heading-collection" class="jfm-portal-title" style="margin-bottom:0.4rem;">ALBUM DES 40 CARTES</h2>
                                <p class="jfm-portal-desc" style="margin-bottom:1rem;">
                                    Inspectez vos cartes découvertes, découvrez leur puissance et recyclez vos doublons contre des JoyCoins.
                                </p>
                            </div>
                            <div class="jfm-ch-progression">
                                <div class="jfm-prog-card">
                                    <span class="jfm-prog-label">Progression Album</span>
                                    <div class="jfm-prog-bar-outer">
                                        <div class="jfm-prog-bar-inner" id="jfm-album-prog-bar" style="width:0%;"></div>
                                    </div>
                                    <div class="jfm-prog-details">
                                        <span id="jfm-album-prog-details">0 / 40 découvertes (0%)</span>
                                        <span id="jfm-album-holo-details">✨ 0 Holos</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Filtres tactiles horizontaux -->
                        <div class="jfm-tcg-filters-header">
                            <div class="jfm-tcg-filter-pills" role="tablist" aria-label="Filtrer les cartes">
                                <button type="button" class="jfm-tcg-filter-btn active" data-filter="all">Toutes (40)</button>
                                <button type="button" class="jfm-tcg-filter-btn" data-filter="hardware">Hardware (10)</button>
                                <button type="button" class="jfm-tcg-filter-btn" data-filter="hero">Héros (10)</button>
                                <button type="button" class="jfm-tcg-filter-btn" data-filter="legend">Studio FM (10)</button>
                                <button type="button" class="jfm-tcg-filter-btn" data-filter="item">Objets & Sorts (10)</button>
                                <button type="button" class="jfm-tcg-filter-btn" data-filter="owned">⭐ Possédées</button>
                                <button type="button" class="jfm-tcg-filter-btn" data-filter="holo">✨ Holo</button>
                            </div>
                        </div>

                        <!-- Grille dynamique des 40 cartes -->
                        <div id="jfm-tcg-collection-grid" class="jfm-tcg-cards-grid" aria-live="polite">
                            <div class="jfm-tcg-loading-box">
                                <div class="jfm-spinner"></div>
                                <span>Chargement de votre classeur de cartes...</span>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- ══════════════════════════════════════════════════════════
                     SOUS-PAGE 3 : CATAPULTE ARCADE
                     ══════════════════════════════════════════════════════════ -->
                <section id="jfm-subpage-arcade" class="jfm-game-subpage" style="display:none;" aria-labelledby="heading-arcade">
                    <div class="jfm-subpage-inner">
                        <div class="jfm-arcade-hero">
                            <span class="jfm-badge-tag">SALLE ARCADE 1983</span>
                            <h2 id="heading-arcade" class="jfm-portal-title">CATAPULTE ARCADE</h2>
                            <p class="jfm-portal-desc">
                                Projetez votre héros le plus loin possible dans les airs à l'aide du trébuchet rétro ! Récupérez des JoyCoins en vol et établissez le record de la station.
                            </p>
                        </div>

                        <div class="jfm-arcade-cabinet-stage">
                            <div class="jfm-arcade-cabinet-card">
                                <div class="jfm-cabinet-screen">
                                    <div class="jfm-scanlines"></div>
                                    <div class="jfm-cabinet-badge">ARCADE EDITION</div>
                                    <div class="jfm-cabinet-art">🎯</div>
                                    <div class="jfm-cabinet-title">JOYSTICK CATAPULT</div>
                                    <div class="jfm-cabinet-sub">PHYSICS ENGINE 2D</div>
                                </div>
                                <div class="jfm-cabinet-controls-desc">
                                    <div class="jfm-ctrl-item">
                                        <kbd>Espace</kbd> ou <kbd>Clic / Touch</kbd> : Lancer le tir & Battements d'ailes
                                    </div>
                                    <div class="jfm-ctrl-item">
                                        <kbd>↓</kbd> / <kbd>S</kbd> : Piqué rapide vers les bonus
                                    </div>
                                </div>
                                <div class="jfm-cabinet-action">
                                    <?php if ($is_logged): ?>
                                        <button type="button" class="jfm-btn-play" onclick="if(window.JFM_GAME && window.JFM_GAME.openGameOverlay){ window.JFM_GAME.openGameOverlay(); } else { alert('Erreur chargement moteur arcade.'); }">
                                            ▶ LANCER LA PARTIE ARCADE
                                        </button>
                                    <?php else: ?>
                                        <a href="<?php echo esc_url($login_url); ?>" class="jfm-btn-play jfm-btn-locked">
                                            🔒 CONNEXION REQUISE POUR JOUER
                                        </a>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- ══════════════════════════════════════════════════════════
                     SOUS-PAGE 4 : MON PROFIL & AVATAR
                     ══════════════════════════════════════════════════════════ -->
                <section id="jfm-subpage-profil" class="jfm-game-subpage" style="display:none;" aria-labelledby="heading-profil">
                    <div class="jfm-subpage-inner">
                        <div class="jfm-profile-hero">
                            <span class="jfm-badge-tag">ESPACE JOUEUR</span>
                            <h2 id="heading-profil" class="jfm-portal-title">PROFIL & STUDIO AVATAR</h2>
                            <p class="jfm-portal-desc">
                                Personnalisez votre photo de profil en important une photo à recadrer ou en choisissant une carte de votre collection.
                            </p>
                        </div>

                        <?php if ($is_logged): ?>
                            <div class="jfm-profile-studio-grid">
                                <!-- Colonne 1 : Studio Avatar Interactif -->
                                <div class="jfm-studio-card">
                                    <h3 class="jfm-card-heading">📸 PHOTO DE PROFIL</h3>
                                    
                                    <div class="jfm-avatar-showcase">
                                        <div class="jfm-avatar-big-frame" id="jfm-avatar-big-frame">
                                            <?php if (!empty($p_avatar) && strpos($p_avatar, 'data:image/') === 0): ?>
                                                <img src="<?php echo esc_attr($p_avatar); ?>" alt="Mon Avatar" id="jfm-current-avatar-preview" class="jfm-avatar-img-big" />
                                            <?php elseif (!empty($p_avatar) && strpos($p_avatar, 'card:') === 0): ?>
                                                <div class="jfm-avatar-card-big" id="jfm-current-avatar-preview" style="background:<?php echo esc_attr($card_avatar_bg); ?>;"><?php echo esc_html($card_avatar_icon); ?></div>
                                            <?php else: ?>
                                                <span class="jfm-avatar-default-big" id="jfm-current-avatar-preview">👤</span>
                                            <?php endif; ?>
                                        </div>
                                        <span class="jfm-avatar-caption">Aperçu en jeu & dans le header</span>
                                    </div>

                                    <!-- Sélecteur de méthode d'avatar -->
                                    <div class="jfm-avatar-actions-box">
                                        <div class="jfm-avatar-option-group">
                                            <span class="jfm-group-title">Option A : Importer ma propre photo</span>
                                            <p class="jfm-group-desc">Chargez une image (JPG, PNG, WebP) et recadrez-la à votre guise.</p>
                                            <label class="jfm-btn-upload-file">
                                                <span>📁 Choisir une photo & Recadrer</span>
                                                <input type="file" id="jfm-avatar-file-input" accept="image/png,image/jpeg,image/webp,image/gif" style="display:none;" />
                                            </label>
                                        </div>

                                        <div class="jfm-avatar-divider"><span>OU</span></div>

                                        <div class="jfm-avatar-option-group">
                                            <span class="jfm-group-title">Option B : Utiliser une carte de ma collection</span>
                                            <p class="jfm-group-desc">Arborez fièrement l'illustration d'une des cartes que vous possédez.</p>
                                            <button type="button" class="jfm-mini-btn" id="jfm-btn-pick-card-avatar" style="width:100%;justify-content:center;">
                                                🃏 Choisir une carte comme avatar...
                                            </button>
                                        </div>

                                        <div style="margin-top:1rem;text-align:center;">
                                            <button type="button" class="jfm-btn-link-dim" id="jfm-btn-reset-avatar">
                                                ✕ Réinitialiser l'avatar par défaut
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Colonne 2 : Statistiques et Détails du Compte -->
                                <div class="jfm-studio-card">
                                    <h3 class="jfm-card-heading">⚡ STATISTIQUES JOUEUR</h3>

                                    <div class="jfm-stats-list">
                                        <div class="jfm-stat-row">
                                            <span class="jfm-sr-label">Pseudo du joueur</span>
                                            <span class="jfm-sr-val highlight"><?php echo esc_html($player->username_display); ?></span>
                                        </div>
                                        <div class="jfm-stat-row">
                                            <span class="jfm-sr-label">Solde JoyCoins</span>
                                            <span class="jfm-sr-val">🪙 <?php echo (int)$player->joycoins; ?></span>
                                        </div>
                                        <div class="jfm-stat-row">
                                            <span class="jfm-sr-label">Expérience (XP)</span>
                                            <span class="jfm-sr-val">⚡ <?php echo (int)$player->xp; ?> XP (Niveau <?php echo floor((int)$player->xp / 100) + 1; ?>)</span>
                                        </div>
                                        <div class="jfm-stat-row">
                                            <span class="jfm-sr-label">Boosters en réserve</span>
                                            <span class="jfm-sr-val">📦 <?php echo (int)$player->free_boosters_available; ?></span>
                                        </div>
                                        <div class="jfm-stat-row">
                                            <span class="jfm-sr-label">Date d'inscription</span>
                                            <span class="jfm-sr-val"><?php echo esc_html(date_i18n('d F Y', strtotime($player->created_at))); ?></span>
                                        </div>
                                    </div>

                                    <div class="jfm-profile-extra-links" style="margin-top:2rem;display:flex;flex-direction:column;gap:0.75rem;">
                                        <a href="<?php echo home_url('/compte'); ?>" class="jfm-btn-play" style="text-align:center;text-decoration:none;font-size:0.85rem;padding:0.75rem;">
                                            ⚙ Gérer mon compte complet & code de secours
                                        </a>
                                        <button type="button" class="jfm-btn-logout-small" id="jfm-btn-hub-logout">
                                            Déconnexion du jeu
                                        </button>
                                    </div>
                                </div>
                            </div>
                        <?php else: ?>
                            <div class="jfm-guest-warning" style="margin:2rem auto;max-width:650px;text-align:center;">
                                <p style="font-size:1.1rem;font-weight:bold;margin-bottom:0.5rem;">🔒 Connexion Joueur Requise</p>
                                <p style="margin-bottom:1.2rem;">Connectez-vous pour configurer votre avatar personnalisé et retrouver vos statistiques.</p>
                                <a href="<?php echo esc_url($login_url); ?>" class="jfm-btn-neon-small">Créer un compte / Se connecter</a>
                            </div>
                        <?php endif; ?>
                    </div>
                </section>
            </main>

            <!-- ── MODALE 1 : RÉVÉLATION DU CONTENU DU BOOSTER ── -->
            <div id="jfm-tcg-reveal-modal" class="jfm-modal" style="display:none;" role="dialog" aria-modal="true" aria-labelledby="reveal-title">
                <div class="jfm-modal-content jfm-tcg-reveal-box">
                    <h2 id="reveal-title" style="font-family:var(--jfm-font-title);color:#fff;margin-bottom:0.4rem;font-size:1.5rem;">🎉 CONTENU DU BOOSTER !</h2>
                    <p style="color:var(--texte-dim);font-size:0.88rem;margin-bottom:1.5rem;">5 cartes ajoutées à votre collection permanente.</p>
                    <div id="jfm-tcg-revealed-cards" class="jfm-revealed-cards-grid"></div>
                    <div style="margin-top:2rem;display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
                        <button type="button" id="jfm-tcg-btn-close-reveal" class="jfm-btn-play" style="max-width:260px;">
                            📖 Ranger dans le classeur
                        </button>
                    </div>
                </div>
            </div>

            <!-- ── MODALE 2 : OUTIL DE RECADRAGE DE PHOTO D'AVATAR ── -->
            <div id="jfm-avatar-crop-modal" class="jfm-modal" style="display:none;" role="dialog" aria-modal="true" aria-labelledby="crop-title">
                <div class="jfm-modal-content jfm-cropper-box">
                    <h3 id="crop-title" style="font-family:var(--jfm-font-title);color:#fff;margin-bottom:0.4rem;font-size:1.3rem;">✂ RECADRER MA PHOTO</h3>
                    <p style="color:var(--texte-dim);font-size:0.85rem;margin-bottom:1.2rem;">Glissez pour déplacer, ajustez le zoom pour cadrer votre visage dans le cercle.</p>

                    <!-- Zone de recadrage interactive -->
                    <div class="jfm-crop-workspace">
                        <canvas id="jfm-crop-canvas" width="280" height="280" aria-label="Zone de découpe"></canvas>
                        <div class="jfm-crop-circular-mask" aria-hidden="true"></div>
                    </div>

                    <!-- Contrôle du zoom -->
                    <div class="jfm-crop-controls">
                        <span style="font-size:0.8rem;color:var(--texte-dim);">Zoom :</span>
                        <input type="range" id="jfm-crop-zoom" min="0.5" max="3" step="0.05" value="1" />
                    </div>

                    <div class="jfm-crop-buttons">
                        <button type="button" class="jfm-mini-btn" id="jfm-btn-cancel-crop">Annuler</button>
                        <button type="button" class="jfm-btn-play" id="jfm-btn-save-crop" style="padding:0.6rem 1.4rem;">
                            ✂ Valider & Enregistrer l'avatar
                        </button>
                    </div>
                </div>
            </div>

            <!-- ── MODALE 3 : CHOISIR UNE CARTE DE LA COLLECTION COMME AVATAR ── -->
            <div id="jfm-card-avatar-modal" class="jfm-modal" style="display:none;" role="dialog" aria-modal="true" aria-labelledby="card-avatar-title">
                <div class="jfm-modal-content jfm-card-picker-box">
                    <h3 id="card-avatar-title" style="font-family:var(--jfm-font-title);color:#fff;margin-bottom:0.4rem;font-size:1.3rem;">🃏 CHOISIR UNE CARTE COMME AVATAR</h3>
                    <p style="color:var(--texte-dim);font-size:0.85rem;margin-bottom:1.2rem;">Cliquez sur l'une de vos cartes possédées pour adopter son icône et son éclat.</p>
                    <div id="jfm-cards-avatar-grid" class="jfm-avatar-cards-grid">
                        <!-- Rempli dynamiquement par JS -->
                    </div>
                    <div style="margin-top:1.5rem;text-align:center;">
                        <button type="button" class="jfm-mini-btn" id="jfm-btn-close-card-avatar">Fermer</button>
                    </div>
                </div>
            </div>

            <!-- ── PIED DE PAGE DÉDIÉ AU JEU (Épuré & Rétro) ── -->
            <footer class="jfm-game-footer">
                <span>JoyStick FM Gaming Engine · Lot 2 JoyStick TCG & Catapulte</span>
                <span class="jfm-gf-dot">•</span>
                <a href="<?php echo home_url('/'); ?>" class="jfm-gf-link">Retourner au site WebRadio</a>
            </footer>
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
                'avatar_url'    => !empty($player->avatar_url) ? $player->avatar_url : '',
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

    /**
     * Traitement AJAX : Mise à jour de l'avatar (photo recadrée ou carte)
     */
    public static function handle_jfm_update_avatar() {
        // Accepte le nonce jfm_auth_nonce ou tcg_nonce
        $nonce = $_POST['jfm_nonce'] ?? $_POST['security'] ?? '';
        if (!wp_verify_nonce($nonce, 'jfm_auth_nonce') && !wp_verify_nonce($nonce, 'jfm_tcg_nonce')) {
            wp_send_json_error(['message' => 'Jeton de sécurité invalide.'], 403);
        }

        $player = JFM_Games_Auth::get_current_player();
        if (!$player) {
            wp_send_json_error(['message' => 'Connexion requise pour modifier votre avatar.'], 401);
        }

        $avatar_data = isset($_POST['avatar_data']) ? (string)$_POST['avatar_data'] : '';
        list($ok, $res) = JFM_Games_Auth::update_avatar($player->id, $avatar_data);

        if (!$ok) {
            wp_send_json_error(['message' => $res]);
        }

        wp_send_json_success([
            'message'    => 'Avatar mis à jour avec succès !',
            'avatar_url' => $res
        ]);
    }
}
