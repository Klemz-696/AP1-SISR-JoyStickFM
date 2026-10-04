<?php get_header(); ?>

<main id="main-content">

  <section class="hero" aria-label="Présentation JoyStick FM">
    <div class="container">
      <div class="hero-content">
        <p class="hero-eyebrow">WebRadio Gaming — 24h/24</p>
        <h1 class="hero-title">
          La radio des<br>
          <span class="highlight animate-neon">Gamers</span>
        </h1>
        <p class="hero-subtitle">
          Musiques de jeux vidéo, podcasts gaming délirants et culture geek.
          Joueurs, speedrunners et nostalgiques : bienvenue chez vous.
        </p>
        <div class="hero-buttons stagger-children">
          <a href="<?php echo home_url('/radio'); ?>" class="btn btn-primary">▶ Écouter en direct</a>
          <a href="<?php echo home_url('/podcasts'); ?>" class="btn btn-secondary">🎙 Voir les podcasts</a>
          <a href="<?php echo home_url('/blog'); ?>" class="btn btn-secondary">📰 Voir les articles</a>
          <button id="btn-affiche-groupe" class="btn btn-secondary">🖼️ Affiche du groupe</button>
        </div>
      </div>
      <aside class="hero-stats stagger-children" aria-label="Statistiques">
        <div class="stat-item">
          <span class="stat-number" id="stat-listeners">—</span>
          <span class="stat-label">Auditeurs live</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">3</span>
          <span class="stat-label">Podcasts</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">6</span>
          <span class="stat-label">Articles</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">24/7</span>
          <span class="stat-label">En direct</span>
        </div>
      </aside>
    </div>
  </section>

  <section class="section" aria-labelledby="podcasts-title">
    <div class="container">
      <header class="section-header">
        <h2 id="podcasts-title" class="section-title neon-text-blue">🎙 Derniers podcasts</h2>
        <p style="color:var(--texte-dim);margin-top:0.5rem;">Des débats absurdes. Des théories folles. Du fun gaming.</p>
      </header>
      <div class="podcast-grid stagger-children">
        <article class="card podcast-card">
          <div class="card-thumb" aria-hidden="true">⛏️</div>
          <div class="card-body">
            <div class="card-meta">
              <span class="card-tag tag-theorie">Théorie</span>
              <span class="podcast-duration">🕐 22:14</span>
            </div>
            <h3 class="card-title">Où Steve range-t-il ses 64 blocs de pierre ?</h3>
            <p style="font-size:0.88rem;color:var(--texte-dim);">
              On a résolu le plus grand mystère de Minecraft. Inventaire, physique quantique et shulker boxes — tout s'explique.
            </p>
          </div>
        </article>
        <article class="card podcast-card">
          <div class="card-thumb" aria-hidden="true">🏁</div>
          <div class="card-body">
            <div class="card-meta">
              <span class="card-tag tag-humour">Humour</span>
              <span class="podcast-duration">🕐 18:07</span>
            </div>
            <h3 class="card-title">Speedrun de la vraie vie : battre un IKEA en 3h00</h3>
            <p style="font-size:0.88rem;color:var(--texte-dim);">
              On applique les règles du speedrun au montage de meubles. Glitchs autorisés, timer à l'écran.
            </p>
          </div>
        </article>
        <article class="card podcast-card">
          <div class="card-thumb" aria-hidden="true">🤖</div>
          <div class="card-body">
            <div class="card-meta">
              <span class="card-tag tag-debat">Débat</span>
              <span class="podcast-duration">🕐 31:45</span>
            </div>
            <h3 class="card-title">IA vs Joueurs : qui triche en premier ?</h3>
            <p style="font-size:0.88rem;color:var(--texte-dim);">
              AlphaGo, OpenAI Five, MuZero... et demain Mario Kart ?
            </p>
          </div>
        </article>
      </div>
      <div style="text-align:center;margin-top:2rem;">
        <a href="<?php echo home_url('/podcasts'); ?>" class="btn btn-secondary" style="font-size:0.85rem;">🎙 Voir tous les podcasts →<br>3 disponibles</a>
      </div>
    </div>
  </section>

  <section class="section" style="background:var(--noir-card);border-top:1px solid var(--noir-border);" aria-labelledby="news-title">
    <div class="container">
      <header class="section-header">
        <h2 id="news-title" class="section-title neon-text-violet">📰 Actus Gaming</h2>
      </header>
      <div class="blog-grid stagger-children">
        <article class="card">
          <div class="article-img" aria-hidden="true">🌌</div>
          <div class="card-body">
            <div class="card-meta">
              <span class="card-tag tag-gaming">Gaming</span>
              <time datetime="2026-11-01" style="color:var(--texte-dim);font-size:0.8rem;">01 Nov 2026</time>
            </div>
            <h3 class="card-title">Les 10 OST de jeux vidéo qui ont changé notre vie</h3>
            <p style="font-size:0.88rem;color:var(--texte-dim);">De Halo à Hollow Knight, les bandes-son qui déchirent depuis 30 ans.</p>
          </div>
        </article>
        <article class="card">
          <div class="article-img" aria-hidden="true">🏆</div>
          <div class="card-body">
            <div class="card-meta">
              <span class="card-tag tag-retro">Rétro</span>
              <time datetime="2026-10-28">28 Oct 2026</time>
            </div>
            <h3 class="card-title">Retour sur la NES : 40 ans de pixels et de joie</h3>
            <p style="font-size:0.88rem;color:var(--texte-dim);">En 1983, Nintendo lançait la Famicom. Petit hommage à cette révolution.</p>
          </div>
        </article>
        <article class="card">
          <div class="article-img" aria-hidden="true">⚡</div>
          <div class="card-body">
            <div class="card-meta">
              <span class="card-tag tag-debat">E-sport</span>
              <time datetime="2026-10-15">15 Oct 2026</time>
            </div>
            <h3 class="card-title">E-sport : quand le gaming devient profession</h3>
            <p style="font-size:0.88rem;color:var(--texte-dim);">Tour d'horizon des métiers du jeu compétitif en 2026.</p>
          </div>
        </article>
      </div>
      <div style="text-align:center;margin-top:2.5rem;">
        <a href="<?php echo home_url('/blog'); ?>" class="btn btn-secondary" style="font-size:0.85rem;">📰 Voir tous les articles →<br>6 disponibles</a>
      </div>
    </div>
  </section>

  <section class="section" style="text-align:center;" aria-label="Écouter la radio">
    <div class="container">
      <p class="pixel-label">📡 ON AIR — 24h/24</p>
      <h2 style="margin:1rem 0;">Envie d'écouter maintenant ?</h2>
      <p style="color:var(--texte-dim);max-width:500px;margin:0 auto 2rem;">
        Connectez-vous au flux en direct et profitez des meilleures musiques de jeux vidéo, non-stop.
      </p>
      <a href="<?php echo home_url('/radio'); ?>" class="btn btn-primary" style="font-size:0.95rem;padding:1rem 2.5rem;">▶ Écouter en direct la radio</a>
    </div>
  </section>

</main>

<div id="popup-affiche" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:99999; align-items:center; justify-content:center; backdrop-filter:blur(5px); opacity:0; transition: opacity 0.3s ease;">
  <div style="position:relative; max-width:90%; max-height:90%;">
    <button id="close-affiche" style="position:absolute; top:-40px; right:0; background:none; border:none; color:var(--blanc); font-size:2.5rem; cursor:pointer; transition: color 0.2s;">&times;</button>
    <img src="<?php echo get_template_directory_uri(); ?>/assets/images/affiche.png" alt="Affiche du groupe JoyStick FM" style="max-width:100%; max-height:80vh; border:2px solid var(--bleu-neon); border-radius:var(--radius); box-shadow:var(--glow-bleu); object-fit:contain;">
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
  /* ── Popup affiche ── */
  const btnAffiche  = document.getElementById('btn-affiche-groupe');
  const popupAffiche = document.getElementById('popup-affiche');
  const closeAffiche = document.getElementById('close-affiche');

  if (btnAffiche && popupAffiche && closeAffiche) {
    btnAffiche.addEventListener('click', (e) => {
      e.preventDefault();
      popupAffiche.style.display = 'flex';
      setTimeout(() => { popupAffiche.style.opacity = '1'; }, 10);
    });
    closeAffiche.addEventListener('click', () => {
      popupAffiche.style.opacity = '0';
      setTimeout(() => { popupAffiche.style.display = 'none'; }, 300);
    });
    popupAffiche.addEventListener('click', (e) => {
      if (e.target === popupAffiche) {
        popupAffiche.style.opacity = '0';
        setTimeout(() => { popupAffiche.style.display = 'none'; }, 300);
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && popupAffiche.style.display === 'flex') {
        popupAffiche.style.opacity = '0';
        setTimeout(() => { popupAffiche.style.display = 'none'; }, 300);
      }
    });
  }

  /* ── Compteur d'auditeurs réel via proxy Icecast ── */
  const statEl = document.getElementById('stat-listeners');
  if (statEl) {
    const proxyUrl = window.THEME_URI + '/assets/php/icecast-proxy.php';
    function fetchListeners() {
      fetch(proxyUrl + '?t=' + Date.now())
        .then(r => r.json())
        .then(d => {
          statEl.textContent = d.online ? d.listeners : '—';
        })
        .catch(() => { statEl.textContent = '—'; });
    }
    fetchListeners();
    setInterval(fetchListeners, 10000); /* Mise à jour toutes les 10 s sur la home */
  }
});
</script>
<?php get_footer(); ?>