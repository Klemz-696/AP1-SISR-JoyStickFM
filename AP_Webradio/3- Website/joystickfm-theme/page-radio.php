<?php
/* Template Name: Page Radio */
get_header();
?>

<main id="main-content">
  <section style="padding:3rem 0 1rem;text-align:center;">
    <div class="container">
      <p class="pixel-label">📡 Flux en direct — Icecast 2</p>
      <h1 style="margin:0.75rem 0;">Écouter <span class="neon-text-blue">JoyStick FM</span></h1>
      <p style="color:var(--texte-dim);max-width:500px;margin:0 auto;">
        Connectez-vous au flux live. Musiques de jeux vidéo, ambiance gaming, 24h/24.
      </p>
    </div>
  </section>

  <section class="section" style="padding-top:2rem;" aria-labelledby="player-title">
    <div class="container">

      <div class="radio-player-main">
        <h2 id="player-title" style="text-align:center;font-size:1.1rem;color:var(--texte-dim);
            font-family:var(--font-tech);letter-spacing:0.15em;margin-bottom:1.5rem;">
          🎵 JOYSTICK FM — GAMING RADIO
        </h2>

        <!-- Statut + compteur d'auditeurs sur la même ligne -->
        <div style="display:flex;align-items:center;justify-content:center;gap:1.5rem;margin-bottom:1rem;flex-wrap:wrap;">
          <span class="stream-status status-paused" id="stream-status"
                style="font-family:var(--font-tech);font-size:0.75rem;letter-spacing:0.15em;
                       padding:0.3rem 1rem;border-radius:20px;background:rgba(255,255,255,0.05);
                       border:1px solid var(--noir-border);">
            ◼ EN PAUSE
          </span>
          <span style="display:flex;align-items:center;gap:0.4rem;font-family:var(--font-tech);
                       font-size:0.75rem;color:var(--texte-dim);letter-spacing:0.1em;">
            👥
            <span id="listeners-count" style="font-family:var(--font-pixel);font-size:1.1rem;
                  color:var(--vert-neon);min-width:2rem;display:inline-block;text-align:center;">—</span>
            auditeurs
          </span>
        </div>

        <div class="radio-visualizer" aria-hidden="true">
          <div class="viz-bar" style="height:12px;--dur:0.5s;"></div>
          <div class="viz-bar" style="height:28px;--dur:0.7s;"></div>
          <div class="viz-bar" style="height:18px;--dur:0.4s;"></div>
          <div class="viz-bar" style="height:36px;--dur:0.6s;"></div>
          <div class="viz-bar" style="height:22px;--dur:0.8s;"></div>
          <div class="viz-bar" style="height:44px;--dur:0.5s;"></div>
          <div class="viz-bar" style="height:30px;--dur:0.9s;"></div>
          <div class="viz-bar" style="height:50px;--dur:0.45s;"></div>
          <div class="viz-bar" style="height:38px;--dur:0.7s;"></div>
          <div class="viz-bar" style="height:26px;--dur:0.55s;"></div>
          <div class="viz-bar" style="height:42px;--dur:0.65s;"></div>
          <div class="viz-bar" style="height:16px;--dur:0.8s;"></div>
          <div class="viz-bar" style="height:34px;--dur:0.5s;"></div>
          <div class="viz-bar" style="height:20px;--dur:0.7s;"></div>
          <div class="viz-bar" style="height:46px;--dur:0.4s;"></div>
        </div>

        <div class="now-playing" aria-live="polite" aria-label="Titre en cours">
          <span class="now-playing-label">🎵 EN CE MOMENT</span>
          <span class="now-playing-title" id="now-playing-title">Appuyez sur ▶ pour démarrer</span>
          <span style="display:block;font-size:0.8rem;color:var(--texte-dim);
                       font-family:var(--font-tech);margin-top:0.25rem;" id="now-playing-artist">—</span>
        </div>

        <div class="radio-controls" role="group" aria-label="Contrôles du lecteur">
          <button class="play-btn-main" id="main-play-btn" aria-label="Lecture / Pause">
            <span id="play-icon">▶</span>
          </button>
        </div>

        <div class="volume-row" role="group" aria-label="Volume">
          <button class="ctrl-btn" id="mute-btn" aria-label="Muet / Son" title="Muet">🔊</button>
          <label for="volume-slider" class="sr-only">Volume</label>
          <input type="range" id="volume-slider" min="0" max="1" step="0.05" value="0.8" aria-label="Contrôle du volume">
          <span style="font-family:var(--font-pixel);font-size:0.9rem;min-width:2.5rem;text-align:right;">80%</span>
        </div>
      </div>

      <!-- Informations du flux -->
      <div style="max-width:700px;margin:2rem auto 0;padding:1.5rem;
                  background:var(--noir-card);border:1px solid var(--noir-border);border-radius:var(--radius-lg);">
        <h3 style="font-size:0.85rem;margin-bottom:1rem;color:var(--texte-dim);">📶 INFORMATIONS FLUX</h3>
        <dl style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem 1.5rem;font-size:0.85rem;">
          <dt style="color:var(--texte-dim);">Serveur</dt>
          <dd style="color:var(--bleu-neon);font-family:var(--font-mono);">Icecast 2.4</dd>
          <dt style="color:var(--texte-dim);">Format</dt>
          <dd style="color:var(--bleu-neon);font-family:var(--font-mono);">MP3 — 128 kbps</dd>
          <dt style="color:var(--texte-dim);">Fréquence</dt>
          <dd style="color:var(--bleu-neon);font-family:var(--font-mono);">44 100 Hz — Stéréo</dd>
          <dt style="color:var(--texte-dim);">Mount point</dt>
          <dd style="color:var(--bleu-neon);font-family:var(--font-mono);">/joystick-fm</dd>
          <dt style="color:var(--texte-dim);">Relais</dt>
          <dd style="color:var(--bleu-neon);font-family:var(--font-mono);">10.100.0.50:8000</dd>
          <dt style="color:var(--texte-dim);">Diffusion</dt>
          <dd style="color:var(--bleu-neon);font-family:var(--font-mono);">Mixxx Auto-DJ</dd>
        </dl>
      </div>
    </div>
  </section>

  <section class="section" style="padding-top:2rem;" aria-labelledby="program-title">
    <div class="container">
      <header class="section-header">
        <h2 id="program-title" class="section-title neon-text-violet">📅 Programme du jour</h2>
        <p style="color:var(--texte-dim);margin-top:0.5rem;font-size:0.85rem;">Le programme en cours est automatiquement mis en évidence selon l'heure.</p>
      </header>
      <div style="max-width:700px;margin:0 auto;">
        <div style="display:flex;flex-direction:column;gap:0.75rem;">

          <div class="card schedule-item" style="display:flex;align-items:center;gap:1rem;padding:1rem 1.5rem;">
            <div class="schedule-hours" style="font-family:var(--font-tech);font-size:0.75rem;color:var(--bleu-neon);min-width:100px;text-align:center;">00:00 — 06:00</div>
            <div style="flex:1;">
              <div class="schedule-title" style="font-weight:700;color:var(--blanc);">🌙 Night Mode</div>
              <div style="font-size:0.8rem;color:var(--texte-dim);">Chiptune et ambiance nocturne</div>
            </div>
            <div class="schedule-badge"></div>
          </div>

          <div class="card schedule-item" style="display:flex;align-items:center;gap:1rem;padding:1rem 1.5rem;">
            <div class="schedule-hours" style="font-family:var(--font-tech);font-size:0.75rem;color:var(--bleu-neon);min-width:100px;text-align:center;">06:00 — 09:00</div>
            <div style="flex:1;">
              <div class="schedule-title" style="font-weight:700;color:var(--blanc);">🌅 Wake Up Gaming</div>
              <div style="font-size:0.8rem;color:var(--texte-dim);">OST relaxantes pour commencer la journée</div>
            </div>
            <div class="schedule-badge"></div>
          </div>

          <div class="card schedule-item" style="display:flex;align-items:center;gap:1rem;padding:1rem 1.5rem;">
            <div class="schedule-hours" style="font-family:var(--font-tech);font-size:0.75rem;color:var(--bleu-neon);min-width:100px;text-align:center;">09:00 — 14:00</div>
            <div style="flex:1;">
              <div class="schedule-title" style="font-weight:700;color:var(--blanc);">🎮 JoyStick Mix</div>
              <div style="font-size:0.8rem;color:var(--texte-dim);">Mix gaming — toutes générations confondues</div>
            </div>
            <div class="schedule-badge"></div>
          </div>

          <div class="card schedule-item" style="display:flex;align-items:center;gap:1rem;padding:1rem 1.5rem;">
            <div class="schedule-hours" style="font-family:var(--font-tech);font-size:0.75rem;color:var(--bleu-neon);min-width:100px;text-align:center;">14:00 — 16:00</div>
            <div style="flex:1;">
              <div class="schedule-title" style="font-weight:700;color:var(--blanc);">🎙 Le Podcast de la Honte</div>
              <div style="font-size:0.8rem;color:var(--texte-dim);">Théories, débats et humour gaming absurde</div>
            </div>
            <div class="schedule-badge"></div>
          </div>

          <div class="card schedule-item" style="display:flex;align-items:center;gap:1rem;padding:1rem 1.5rem;">
            <div class="schedule-hours" style="font-family:var(--font-tech);font-size:0.75rem;color:var(--bleu-neon);min-width:100px;text-align:center;">16:00 — 20:00</div>
            <div style="flex:1;">
              <div class="schedule-title" style="font-weight:700;color:var(--blanc);">⚡ Afternoon Power-Up</div>
              <div style="font-size:0.8rem;color:var(--texte-dim);">Énergie maximale — OST épiques</div>
            </div>
            <div class="schedule-badge"></div>
          </div>

          <div class="card schedule-item" style="display:flex;align-items:center;gap:1rem;padding:1rem 1.5rem;">
            <div class="schedule-hours" style="font-family:var(--font-tech);font-size:0.75rem;color:var(--bleu-neon);min-width:100px;text-align:center;">20:00 — 00:00</div>
            <div style="flex:1;">
              <div class="schedule-title" style="font-weight:700;color:var(--blanc);">🌙 Night Gaming Session</div>
              <div style="font-size:0.8rem;color:var(--texte-dim);">Ambiance nocturne, néon et chiptune</div>
            </div>
            <div class="schedule-badge"></div>
          </div>

        </div>
      </div>
    </div>
  </section>

</main>

<?php get_footer(); ?>