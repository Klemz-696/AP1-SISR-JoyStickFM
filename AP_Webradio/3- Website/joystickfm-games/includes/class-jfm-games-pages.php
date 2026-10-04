<?php
if (!defined('ABSPATH')) {
    exit;
}

final class JFM_Games_Pages
{
    private JFM_Games_Auth $auth;

    public function __construct(JFM_Games_Auth $auth)
    {
        $this->auth = $auth;
    }

    public function hooks(): void
    {
        add_shortcode('jfm_games_portal', [$this, 'render_portal_shortcode']);
        add_shortcode('jfm_games_activities', [$this, 'render_activities_shortcode']);
        add_shortcode('jfm_games_account', [$this, 'render_account_shortcode']);

        add_filter('template_include', [$this, 'template_include'], 99);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
    }

    public function enqueue_assets(): void
    {
        wp_register_script(
            'jfm-games-portal',
            plugins_url('assets/portal.js', dirname(__FILE__, 2) . '/joystickfm-games.php'),
            [],
            JFM_GAMES_VERSION,
            true
        );

        $returnTo = JFM_Games_Utils::validate_local_return_to($_SERVER['REQUEST_URI'] ?? '/jeux/');
        wp_localize_script('jfm-games-portal', 'JFM_PLAYER_AUTH', [
            'logged_in' => $this->auth->is_authenticated(),
            'login_url' => add_query_arg('return_to', rawurlencode($returnTo), home_url('/compte/')),
        ]);

        wp_enqueue_script('jfm-games-portal');
    }

    public function template_include(string $template): string
    {
        if (is_page('jeux') || is_page('activites') || is_page('compte')) {
            $custom = dirname(__FILE__, 2) . '/templates/page-games.php';
            if (file_exists($custom)) {
                return $custom;
            }
        }

        return $template;
    }

    public function render_portal_shortcode(): string
    {
        $isAuthed = $this->auth->is_authenticated();
        $loginUrl = add_query_arg('return_to', rawurlencode(home_url('/jeux/')), home_url('/compte/'));

        ob_start();
        ?>
        <section class="section" style="padding-top:2rem;">
            <div class="container">
                <p class="pixel-label">🕹️ Portail Jeux</p>
                <h1 style="margin:0.75rem 0;">Jeux JoyStick FM</h1>
                <p style="color:var(--texte-dim);max-width:760px;">
                    La catapulte arcade est disponible dès maintenant pour les comptes joueurs connectés.
                    JoyStick TCG est en préparation (lot 2), sans combat livré dans ce lot.
                </p>

                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;margin-top:1.5rem;">
                    <article class="card" style="padding:1.25rem;">
                        <h2 style="font-size:1.15rem;">🎯 Catapulte Arcade</h2>
                        <p style="color:var(--texte-dim);">Jeu existant intégré au portail.</p>
                        <?php if ($isAuthed): ?>
                            <button id="jfm-open-catapult" class="btn btn-primary" type="button">▶ Lancer la catapulte</button>
                        <?php else: ?>
                            <a class="btn btn-primary" href="<?php echo esc_url($loginUrl); ?>">🔐 Se connecter pour jouer</a>
                        <?php endif; ?>
                    </article>

                    <article class="card" style="padding:1.25rem;opacity:.9;">
                        <h2 style="font-size:1.15rem;">🃏 JoyStick TCG</h2>
                        <p style="color:var(--texte-dim);">En préparation (lot 2). Collection / boosters / recyclage à venir.</p>
                        <span class="btn btn-secondary" aria-disabled="true" style="pointer-events:none;opacity:.8;">Bientôt disponible</span>
                    </article>
                </div>
            </div>
        </section>
        <?php
        return (string) ob_get_clean();
    }

    public function render_activities_shortcode(): string
    {
        ob_start();
        ?>
        <section class="section" style="padding-top:2rem;">
            <div class="container">
                <p class="pixel-label">🏆 Activités</p>
                <h1 style="margin:0.75rem 0;">Activités JoyStick FM</h1>
                <p style="color:var(--texte-dim);max-width:760px;">
                    Cette page centralise les activités liées aux jeux et récompenses. Le périmètre économie/TCG complet est documenté pour les lots suivants.
                </p>
                <div class="card" style="padding:1.25rem;margin-top:1rem;">
                    <h2 style="font-size:1.1rem;">Statut lot 1</h2>
                    <ul style="margin-left:1.2rem;color:var(--texte-dim);">
                        <li>Authentification joueur indépendante de WordPress.</li>
                        <li>Accès jeu catapulte réservé aux comptes connectés.</li>
                        <li>Chat relié à l’identité serveur pour les joueurs connectés.</li>
                    </ul>
                </div>
            </div>
        </section>
        <?php
        return (string) ob_get_clean();
    }

    public function render_account_shortcode(): string
    {
        $isAuthed = $this->auth->is_authenticated();
        $player = $this->auth->get_current_player();
        $session = $this->auth->get_current_session();

        $returnToInput = JFM_Games_Utils::validate_local_return_to($_REQUEST['return_to'] ?? home_url('/jeux/'));
        $error = $this->auth->pull_error_from_query();
        $recoveryFlash = $this->auth->pull_recovery_flash_for_current_player();

        ob_start();
        ?>
        <section class="section" style="padding-top:2rem;">
            <div class="container" style="max-width:980px;">
                <p class="pixel-label">👤 Compte joueur</p>
                <h1 style="margin:0.75rem 0;">Authentification joueurs</h1>
                <p style="color:var(--texte-dim);max-width:760px;">
                    PIN stocké haché (password_hash/password_verify), pseudo normalisé unique en base,
                    sessions serveur opaques (cookie HttpOnly, SameSite=Lax<?php echo is_ssl() ? ', Secure' : ''; ?>).
                </p>

                <?php if ($this->auth->must_use_https() && !is_ssl()): ?>
                    <div class="card" style="padding:1rem;border-color:var(--rose-neon);margin:1rem 0;">
                        <strong>HTTPS requis :</strong> les actions compte joueur sont bloquées tant que le site n’est pas servi en HTTPS.
                        Exception développement possible uniquement via constante explicite <code>JFM_GAMES_ALLOW_INSECURE_HTTP</code> (désactivée par défaut).
                    </div>
                <?php endif; ?>

                <?php if ($error): ?>
                    <div class="card" style="padding:1rem;border-color:var(--rose-neon);margin:1rem 0;">
                        <?php echo esc_html($error); ?>
                    </div>
                <?php endif; ?>

                <?php if ($recoveryFlash): ?>
                    <div class="card" style="padding:1rem;border-color:var(--vert-neon);margin:1rem 0;">
                        <strong>Code de récupération (affiché une seule fois) :</strong>
                        <code style="display:inline-block;margin-left:.5rem;"><?php echo esc_html($recoveryFlash); ?></code>
                    </div>
                <?php endif; ?>

                <?php if ($isAuthed && $player && $session): ?>
                    <div class="card" style="padding:1.25rem;margin-top:1rem;">
                        <h2 style="font-size:1.1rem;">Session active</h2>
                        <p><strong>Pseudo :</strong> <?php echo esc_html($player['username_display']); ?></p>
                        <p><strong>ID joueur :</strong> #<?php echo (int) $player['id']; ?></p>
                        <p><strong>Expire le :</strong> <?php echo esc_html((string) $session['expires_at']); ?></p>

                        <div style="display:flex;flex-wrap:wrap;gap:.75rem;margin-top:1rem;">
                            <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                                <input type="hidden" name="action" value="jfm_player_revoke_other">
                                <input type="hidden" name="return_to" value="<?php echo esc_attr($returnToInput); ?>">
                                <input type="hidden" name="jfm_form_token" value="<?php echo esc_attr($this->auth->issue_form_token('revoke_other')); ?>">
                                <button type="submit" class="btn btn-secondary">🔒 Révoquer les autres sessions</button>
                            </form>

                            <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                                <input type="hidden" name="action" value="jfm_player_logout">
                                <input type="hidden" name="return_to" value="<?php echo esc_attr(home_url('/')); ?>">
                                <input type="hidden" name="jfm_form_token" value="<?php echo esc_attr($this->auth->issue_form_token('logout')); ?>">
                                <button type="submit" class="btn btn-primary">⏻ Se déconnecter</button>
                            </form>
                        </div>
                    </div>
                <?php else: ?>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;margin-top:1rem;">
                        <form class="card" style="padding:1rem;" method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                            <h2 style="font-size:1rem;">Inscription</h2>
                            <input type="hidden" name="action" value="jfm_player_register">
                            <input type="hidden" name="return_to" value="<?php echo esc_attr($returnToInput); ?>">
                            <input type="hidden" name="jfm_form_token" value="<?php echo esc_attr($this->auth->issue_form_token('register')); ?>">
                            <label for="jfm-reg-user">Pseudo</label>
                            <input id="jfm-reg-user" name="username" required maxlength="30" class="jfm-auth-input" type="text">
                            <label for="jfm-reg-pin">PIN (4 à 12 chiffres)</label>
                            <input id="jfm-reg-pin" name="pin" required inputmode="numeric" pattern="[0-9]{4,12}" class="jfm-auth-input" type="password">
                            <label for="jfm-reg-pin2">Confirmer PIN</label>
                            <input id="jfm-reg-pin2" name="pin_confirm" required inputmode="numeric" pattern="[0-9]{4,12}" class="jfm-auth-input" type="password">
                            <label style="display:flex;align-items:center;gap:.5rem;margin:.6rem 0;">
                                <input type="checkbox" name="remember_me" value="1"> Se souvenir de moi (30 jours)
                            </label>
                            <button class="btn btn-primary" type="submit">Créer le compte</button>
                        </form>

                        <form class="card" style="padding:1rem;" method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                            <h2 style="font-size:1rem;">Connexion</h2>
                            <input type="hidden" name="action" value="jfm_player_login">
                            <input type="hidden" name="return_to" value="<?php echo esc_attr($returnToInput); ?>">
                            <input type="hidden" name="jfm_form_token" value="<?php echo esc_attr($this->auth->issue_form_token('login')); ?>">
                            <label for="jfm-log-user">Pseudo</label>
                            <input id="jfm-log-user" name="username" required maxlength="30" class="jfm-auth-input" type="text">
                            <label for="jfm-log-pin">PIN</label>
                            <input id="jfm-log-pin" name="pin" required inputmode="numeric" pattern="[0-9]{4,12}" class="jfm-auth-input" type="password">
                            <label style="display:flex;align-items:center;gap:.5rem;margin:.6rem 0;">
                                <input type="checkbox" name="remember_me" value="1"> Se souvenir de moi (30 jours)
                            </label>
                            <button class="btn btn-primary" type="submit">Se connecter</button>
                        </form>

                        <form class="card" style="padding:1rem;" method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                            <h2 style="font-size:1rem;">Récupération</h2>
                            <input type="hidden" name="action" value="jfm_player_recover">
                            <input type="hidden" name="return_to" value="<?php echo esc_attr($returnToInput); ?>">
                            <input type="hidden" name="jfm_form_token" value="<?php echo esc_attr($this->auth->issue_form_token('recover')); ?>">
                            <label for="jfm-rec-user">Pseudo</label>
                            <input id="jfm-rec-user" name="username" required maxlength="30" class="jfm-auth-input" type="text">
                            <label for="jfm-rec-code">Code de récupération</label>
                            <input id="jfm-rec-code" name="recovery_code" required class="jfm-auth-input" type="text" autocomplete="off">
                            <label for="jfm-rec-pin">Nouveau PIN</label>
                            <input id="jfm-rec-pin" name="new_pin" required inputmode="numeric" pattern="[0-9]{4,12}" class="jfm-auth-input" type="password">
                            <label for="jfm-rec-pin2">Confirmer nouveau PIN</label>
                            <input id="jfm-rec-pin2" name="new_pin_confirm" required inputmode="numeric" pattern="[0-9]{4,12}" class="jfm-auth-input" type="password">
                            <button class="btn btn-secondary" type="submit">Récupérer le compte</button>
                        </form>
                    </div>
                <?php endif; ?>
            </div>
        </section>

        <style>
            .jfm-auth-input{width:100%;margin:.35rem 0 .75rem;border:1px solid var(--noir-border);background:var(--noir-card);color:var(--blanc);padding:.55rem .65rem;border-radius:6px}
            .jfm-auth-input:focus{outline:2px solid var(--bleu-neon);outline-offset:1px}
            @media (prefers-reduced-motion: reduce){.btn{transition:none!important}}
        </style>
        <?php

        return (string) ob_get_clean();
    }
}
