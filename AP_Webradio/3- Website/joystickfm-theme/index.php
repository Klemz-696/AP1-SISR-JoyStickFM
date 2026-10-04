<?php
// Fichier de secours obligatoire pour WordPress
// 404.php — JoyStick FM WordPress Theme
// Ce fichier est utilisé pour afficher une page d'erreur 404 personnalisée lorsque le contenu demandé n'est pas trouvé. Il est essentiel pour garantir une bonne expérience utilisateur même en cas de lien
get_header(); 
?>

<main id="main-content">
  <section class="section" style="text-align:center;">
    <div class="container">
      <h1 class="neon-text-rose">Erreur 404</h1>
      <p style="color:var(--texte-dim);">Oups, le contenu que vous cherchez n'existe pas ou n'a pas de modèle assigné.</p>
      <a href="<?php echo home_url(); ?>" class="btn btn-primary" style="margin-top: 2rem;">← Retour à l'accueil</a>
    </div>
  </section>
</main>

<?php get_footer(); ?>