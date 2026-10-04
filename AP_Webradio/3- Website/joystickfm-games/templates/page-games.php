<?php
if (!defined('ABSPATH')) {
    exit;
}
get_header();
?>
<main id="main-content">
  <?php
  while (have_posts()) {
      the_post();
      echo do_shortcode(get_the_content());
  }
  ?>
</main>
<?php
get_footer();
