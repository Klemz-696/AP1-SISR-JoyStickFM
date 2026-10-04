<?php
/**
 * JoyStick FM — page-jeux.php
 * Template dédié pour l'Univers de Jeu Autonome (JoyStick Games Standalone)
 * 
 * Ce modèle charge une application plein écran (100vh) immersive sans le header 
 * ni le footer conventionnels de la WebRadio, avec cockpit de jeu et menu de retour radio.
 */

// Sécurité WordPress
if (!defined('ABSPATH')) {
    exit;
}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?> class="jfm-standalone-game-html">
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>🎮 JoyStick Games — Cockpit Arcade & JoyStick TCG</title>
  <meta name="description" content="Univers de jeu JoyStick FM : collection de cartes légendaires JoyStick TCG, ouverture de boosters 3D et Catapulte Arcade.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,400;0,600;0,700;1,700&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet">
  <?php wp_head(); ?>
  <style>
    /* Reset & Styles spécifiques pour le template standalone plein écran */
    html.jfm-standalone-game-html,
    body.jfm-standalone-game-body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      min-height: 100vh !important;
      background: #06070d !important;
      overflow-x: hidden !important;
    }
    body.jfm-standalone-game-body #site-header,
    body.jfm-standalone-game-body .site-header,
    body.jfm-standalone-game-body #site-footer,
    body.jfm-standalone-game-body .site-footer,
    body.jfm-standalone-game-body footer,
    body.jfm-standalone-game-body .dvd-screen-wrap,
    body.jfm-standalone-game-body .dvd-badge-btn,
    body.jfm-standalone-game-body .easter-bar,
    body.jfm-standalone-game-body #jfm-mobile-bar {
      display: none !important;
    }
  </style>
</head>
<body <?php body_class('jfm-standalone-game-body'); ?>>

  <!-- CONTENU PRINCIPAL DE L'UNIVERS DE JEU -->
  <div id="jfm-standalone-game-root" class="jfm-standalone-root">
    <?php
    if (have_posts()) :
      while (have_posts()) : the_post();
        the_content();
      endwhile;
    else :
      echo do_shortcode('[jfm_games_portal]');
    endif;
    ?>
  </div>

  <?php wp_footer(); ?>
</body>
</html>
