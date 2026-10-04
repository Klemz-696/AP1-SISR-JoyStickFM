<?php
// header.php — JoyStick FM WordPress Theme
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#0a0a0f">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="description" content="JoyStick FM — La WebRadio Gaming. Musiques, podcasts et culture jeux vidéo en direct.">
  <title><?php wp_title('|', true, 'right');
bloginfo('name'); ?></title>

  <link rel="icon" type="image/svg+xml" href="<?php echo get_template_directory_uri(); ?>/assets/images/favicon.svg?v=2">
  
  <?php wp_head(); ?>
  
  <script>
    window.THEME_URI = "<?php echo get_template_directory_uri(); ?>";
  </script>
</head>
<body <?php body_class(); ?>>

  <?php if (is_front_page()): ?>
  <div id="console-boot" role="dialog" aria-label="Démarrage JoyStick FM" aria-modal="true">
    <div class="boot-logo">JOYSTICK FM</div>
    <div class="boot-bar-wrap">
      <div class="boot-bar" id="boot-bar-fill"></div>
    </div>
    <div class="boot-text">INITIALISATION...</div>
    <p style="color:var(--texte-dim);font-family:var(--font-pixel);font-size:1.5rem;margin-top:1rem;">
      <span id="boot-version" style="cursor:pointer;user-select:none;" title="v6.7 🤫">v6.7</span> — TS1 SIO — 2026<br><br>
      Sauzède Clément - <span id="boot-klemz" style="cursor:pointer;user-select:none;transition:color .2s;" title="Klemz ⚡">Klemz</span><br>
      Perez Nathan - <span id="boot-steakman" style="cursor:pointer;user-select:none;transition:color .2s;" title="Steakman63 🥩">Steakman63</span><br>
      James Robin - <span id="boot-pingouy" style="cursor:pointer;user-select:none;transition:color .2s;" title="Pingouy 🐧">Pingouy</span><br>
      Duru Clément - <span id="boot-krembrule" style="cursor:pointer;user-select:none;transition:color .2s;" title="Krem Brûlé 🍮">Krem Brûlé</span>
    </p>
  </div>
  <?php
endif; ?>

  <div id="easter-egg-modal" role="dialog" aria-modal="true" aria-label="Easter egg">
    <div class="egg-content">
      <div id="easter-egg-content"></div>
      <button class="egg-close" id="egg-close-btn">[ FERMER ]</button>
    </div>
  </div>

  <header role="banner">
    <div class="nav-container">
      <a href="<?php echo home_url('/'); ?>" class="logo" aria-label="JoyStick FM — Accueil">
        <div class="logo-icon" aria-hidden="true">🎮</div>
        <span class="logo-text">Joy<span>Stick</span>&nbsp;FM</span>
      </a>
      <nav role="navigation" aria-label="Navigation principale">
        <ul id="nav-menu">
          <li><a href="<?php echo home_url('/'); ?>"         <?php if (is_front_page()) echo 'class="active"'; ?>>🏠 Accueil</a></li>
          <li><a href="<?php echo home_url('/radio'); ?>"    <?php if (is_page('radio')) echo 'class="active"'; ?>>📡 Direct</a></li>
          <li><a href="<?php echo home_url('/jeux'); ?>" target="_blank" rel="noopener noreferrer" <?php if (is_page('jeux')) echo 'class="active"'; ?>>🎮 Jeux ↗</a></li>
          <li><a href="<?php echo home_url('/activites'); ?>"<?php if (is_page('activites')) echo 'class="active"'; ?>>⚡ Activités</a></li>
          <li><a href="<?php echo home_url('/podcasts'); ?>" <?php if (is_page('podcasts')) echo 'class="active"'; ?>>🎙 Podcasts</a></li>
          <li><a href="<?php echo home_url('/blog'); ?>"     <?php if (is_page('blog')) echo 'class="active"'; ?>>📰 Blog</a></li>
          <li><a href="<?php echo home_url('/contact'); ?>"  <?php if (is_page('contact')) echo 'class="active"'; ?>>✉ Contact</a></li>
        </ul>
      </nav>
      <div class="header-actions">
        <?php 
        $current_player = function_exists('jfm_games_get_current_player') ? jfm_games_get_current_player() : null;
        if ($current_player): 
          $p_avatar = !empty($current_player->avatar_url) ? $current_player->avatar_url : '';
          $card_avatar_icon = '🃏';
          if (!empty($p_avatar) && strpos($p_avatar, 'card:') === 0) {
              global $wpdb;
              $card_id = (int)substr($p_avatar, 5);
              $found_icon = $wpdb->get_var($wpdb->prepare("SELECT icon FROM {$wpdb->prefix}jfm_tcg_cards WHERE id = %d", $card_id));
              if ($found_icon) {
                  $card_avatar_icon = $found_icon;
              }
          }
        ?>
          <a href="<?php echo home_url('/compte'); ?>" class="jfm-header-account-btn" aria-label="Espace Joueur" title="<?php echo esc_attr($current_player->username_display); ?> (<?php echo (int)$current_player->joycoins; ?> JoyCoins)">
            <span class="jfm-account-avatar" aria-hidden="true">
              <?php if (!empty($p_avatar) && strpos($p_avatar, 'data:image/') === 0): ?>
                <img src="<?php echo esc_attr($p_avatar); ?>" alt="" class="jfm-header-avatar-img" />
              <?php elseif (!empty($p_avatar) && strpos($p_avatar, 'card:') === 0): ?>
                <span class="jfm-header-avatar-card"><?php echo esc_html($card_avatar_icon); ?></span>
              <?php else: ?>
                <span class="jfm-header-avatar-default">👤</span>
              <?php endif; ?>
            </span>
            <span class="jfm-account-name"><?php echo esc_html($current_player->username_display); ?></span>
            <span class="jfm-header-coins"><span aria-hidden="true">🪙</span> <?php echo (int)$current_player->joycoins; ?></span>
          </a>
        <?php else: ?>
          <a href="<?php echo home_url('/compte'); ?>" class="jfm-header-account-btn jfm-header-guest" aria-label="Connexion Joueur">
            <span class="jfm-account-avatar" aria-hidden="true">👤</span>
            <span class="jfm-guest-text">Connexion</span>
          </a>
        <?php endif; ?>
        <a href="<?php echo home_url('/radio'); ?>" class="live-badge" aria-label="Écouter en direct">
          <span class="dot" aria-hidden="true"></span>LIVE
        </a>
        <button class="burger" id="burger-btn" aria-label="Ouvrir le menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>