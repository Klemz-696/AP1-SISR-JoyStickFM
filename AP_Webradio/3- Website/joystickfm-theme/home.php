<?php
// home.php — Page des articles (si page d'accueil statique configurée)
// Redirige vers front-page.php car on utilise des pages statiques
get_header(); ?>

<main id="main-content">
  <div class="container" style="padding:3rem 0;text-align:center;">
    <p class="pixel-label">📰 Derniers articles</p>
    <h1>Le <span class="neon-text-blue">Blog</span> JoyStick FM</h1>
    <p style="color:var(--texte-dim);margin-top:1rem;">
      <a href="<?php echo home_url('/blog'); ?>" class="btn btn-primary" style="margin-top:1.5rem;">
        📰 Voir tous les articles
      </a>
    </p>
  </div>
</main>

<?php get_footer(); ?>