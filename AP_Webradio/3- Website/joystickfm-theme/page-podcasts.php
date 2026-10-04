<?php
/* Template Name: Page Podcasts */
// page-podcasts.php — JoyStick FM WordPress Theme
// Ce fichier est un template personnalisé pour la page des podcasts. Il affiche une liste d'épisodes avec un style unique, différent de la page d'accueil ou des autres pages statiques. Assurez-vous que cette page est assignée au template "Page Podcasts" dans l'éditeur WordPress pour que ce code soit utilisé.

get_header(); 
?>

<main id="main-content">
  <section style="padding:3rem 0 1rem;text-align:center;">
    <div class="container">
      <p class="pixel-label">🎙 3 épisodes disponibles</p>
      <h1 style="margin:0.75rem 0;">Podcasts <span class="neon-text-violet">Gaming</span></h1>
      <p style="color:var(--texte-dim);max-width:520px;margin:0 auto;">
        Des débats absurdes, des théories folles et de l'humour gaming qui assume totalement son niveau intellectuel.
      </p>
    </div>
  </section>

  <section class="section" style="padding-top:2rem;" aria-labelledby="podcasts-heading">
    <div class="container">
      <div class="filter-pills" role="group" aria-label="Filtrer les podcasts" id="filter-group">
        <button class="filter-pill active" data-filter="all">Tous</button>
        <button class="filter-pill" data-filter="theorie">🧩 Théories</button>
        <button class="filter-pill" data-filter="humour">😂 Humour</button>
        <button class="filter-pill" data-filter="debat">⚔️ Débats</button>
        <button class="filter-pill" data-filter="retro">🕹 Rétro</button>
        <button class="filter-pill" data-filter="gaming">🎮 Gaming</button>
      </div>

      <h2 id="podcasts-heading" class="sr-only">Liste des podcasts</h2>

      <div class="podcast-grid stagger-children" id="podcasts-grid">

        <article class="card podcast-card" data-category="theorie">
          <div class="card-thumb" aria-hidden="true">⛏️</div>
          <div class="card-body">
            <div class="card-meta">
              <span class="card-tag tag-theorie">Théorie</span>
              <span class="podcast-duration">🕐 22:14</span>
              <time datetime="2025-11-01" style="color:var(--texte-dim);font-size:0.75rem;">01/11/2025</time>
            </div>
            <h3 class="card-title">Où Steve de Minecraft range-t-il 64 blocs de pierre ?</h3>
            <p style="font-size:0.85rem;color:var(--texte-dim);margin-bottom:0;">On analyse les lois physiques du jeu, les inventaires à taille infinie et on conclut que Steve soulève 355 tonnes. 🏋️</p>
            <div class="audio-player-mini" data-src="<?php echo get_template_directory_uri(); ?>/assets/audio/podcasts/minecraft.mp3" data-duration="22:14">
              <button class="play-btn-mini" aria-label="Écouter">▶</button>
              <div class="progress-bar-wrap"><div class="progress-bar"></div></div>
              <span class="time-display">0:00 / 22:14</span>
            </div>
          </div>
        </article>

        <article class="card podcast-card" data-category="humour">
          <div class="card-thumb" aria-hidden="true">🏁</div>
          <div class="card-body">
            <div class="card-meta">
              <span class="card-tag tag-humour">Humour</span>
              <span class="podcast-duration">🕐 18:07</span>
              <time datetime="2025-10-25">25/10/2025</time>
            </div>
            <h3 class="card-title">Speedrun de la vraie vie : IKEA en 3h</h3>
            <p style="font-size:0.85rem;color:var(--texte-dim);margin-bottom:0;">Catégorie Any%, glitchs autorisés, passe-droit en caisse compté.</p>
            <div class="audio-player-mini" data-src="<?php echo get_template_directory_uri(); ?>/assets/audio/podcasts/ikea.mp3" data-duration="18:07">
              <button class="play-btn-mini" aria-label="Écouter">▶</button>
              <div class="progress-bar-wrap"><div class="progress-bar"></div></div>
              <span class="time-display">0:00 / 18:07</span>
            </div>
          </div>
        </article>

        <article class="card podcast-card" data-category="debat">
          <div class="card-thumb" aria-hidden="true">🤖</div>
          <div class="card-body">
            <div class="card-meta">
              <span class="card-tag tag-debat">Débat</span>
              <span class="podcast-duration">🕐 31:45</span>
              <time datetime="2025-10-18">18/10/2025</time>
            </div>
            <h3 class="card-title">IA vs Joueurs : qui triche en premier ?</h3>
            <p style="font-size:0.85rem;color:var(--texte-dim);margin-bottom:0;">AlphaGo, OpenAI Five, MuZero... et demain Mario Kart ?</p>
            <div class="audio-player-mini" data-src="<?php echo get_template_directory_uri(); ?>/assets/audio/podcasts/ia-vs-joueurs.mp3" data-duration="31:45">
              <button class="play-btn-mini" aria-label="Écouter">▶</button>
              <div class="progress-bar-wrap"><div class="progress-bar"></div></div>
              <span class="time-display">0:00 / 31:45</span>
            </div>
          </div>
        </article>

      </div>

      <br>
      <p style="color:var(--texte-dim);margin:0 auto;text-align:center;">
        De nombreux autres épisodes sont en préparation,<br>
        alors restez à l'écoute pour plus de débats absurdes !
      </p>
      <p id="no-results" style="display:none;text-align:center;color:var(--texte-dim);font-family:var(--font-pixel);font-size:1.1rem;padding:2rem;">Aucun podcast dans cette catégorie. 😢</p>
    </div>
  </section>
</main>

<script>
document.addEventListener('DOMContentLoaded', () => {
  const pills = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('.podcast-card');
  const noRes = document.getElementById('no-results');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.dataset.filter;
      let visible = 0;
      cards.forEach(card => {
        const show = (filter === 'all' || card.dataset.category === filter);
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      if (noRes) noRes.style.display = visible === 0 ? 'block' : 'none';
    });
  });
});
</script>

<?php get_footer(); ?>