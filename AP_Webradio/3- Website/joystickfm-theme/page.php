<?php
/**
 * JoyStick FM — page.php
 * Modèle de page WordPress standard exécutant the_content() pour les shortcodes et pages du portail.
 */

get_header();
?>

<main id="main-content" role="main">
  <div class="container" style="padding: 2.5rem 1rem;">
    <?php
    if (have_posts()) :
      while (have_posts()) : the_post();
        the_content();
      endwhile;
    endif;
    ?>
  </div>
</main>

<?php get_footer(); ?>
