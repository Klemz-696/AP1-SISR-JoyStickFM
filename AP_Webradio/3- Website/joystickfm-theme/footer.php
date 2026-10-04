<footer role="contentinfo">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="<?php echo home_url(); ?>" class="logo" aria-label="JoyStick FM — Accueil">
            <div class="logo-icon" aria-hidden="true">🎮</div>
            <span class="logo-text">Joy<span>Stick</span> FM</span>
          </a>
          <p id="footer-credits">La WebRadio Gaming 24h/24 pour les passionnés de jeux vidéo, de culture geek et de bonne musique.</p>
          <div style="margin-top:1rem;">
            <a href="mailto:contact.joystickfm@gmail.com" style="color:var(--texte-dim);font-size:0.8rem;font-family:var(--font-mono);">
              ✉ contact.joystickfm@gmail.com
            </a>
          </div>
        </div>

        <div class="footer-col">
          <h4>Navigation</h4>
          <ul>
            <li><a href="<?php echo home_url(); ?>">🏠 Accueil</a></li>
            <li><a href="<?php echo home_url('/radio'); ?>">📡 Écouter en direct</a></li>
            <?php if (function_exists('jfm_games_is_active') && jfm_games_is_active()): ?>
            <li><a href="<?php echo home_url('/jeux'); ?>">🕹 Jeux</a></li>
            <li><a href="<?php echo home_url('/activites'); ?>">🏆 Activités</a></li>
            <li><a href="<?php echo home_url('/compte'); ?>">👤 Compte joueur</a></li>
            <?php endif; ?>
            <li><a href="<?php echo home_url('/podcasts'); ?>">🎙 Podcasts</a></li>
            <li><a href="<?php echo home_url('/blog'); ?>">📰 Blog</a></li>
            <li><a href="<?php echo home_url('/contact'); ?>">✉ Contact</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>À propos</h4>
          <ul>
            <li><a href="<?php echo home_url('/contact'); ?>">Nous contacter</a></li>
            <li><a href="<?php echo home_url('/mentions-legales'); ?>">Mentions légales</a></li>
            <li><a href="<?php echo home_url('/politique-de-confidentialite'); ?>">Politique de confidentialité</a></li>
            <li><a href="<?php echo home_url('/plan-du-site'); ?>">Plan du site</a></li>
            <li><span style="color:var(--texte-dim);font-size:0.85rem;">Projet BTS SIO — TS1</span></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Tech Stack</h4>
          <div style="margin-bottom:0.9rem;display:flex;align-items:center;gap:0.55rem;">
            <span style="font-family:var(--font-mono);font-size:0.78rem;color:var(--texte-dim);">📀 DVD Bouncer</span>
            <label for="dvd-bouncer-toggle" title="Activer / Désactiver le DVD Bouncer en fond de page"
              style="position:relative;display:inline-flex;align-items:center;cursor:pointer;width:40px;height:22px;flex-shrink:0;">
              <input type="checkbox" id="dvd-bouncer-toggle"
                style="opacity:0;position:absolute;width:0;height:0;"
                onchange="if(typeof window.dvdBouncerSetEnabled==='function')window.dvdBouncerSetEnabled(this.checked);">
              <span class="dvd-track"
                style="position:absolute;inset:0;border-radius:22px;background:rgba(0,245,255,.08);border:1.5px solid rgba(0,245,255,.28);transition:background .2s,border-color .2s;"></span>
              <span class="dvd-thumb"
                style="position:absolute;left:3px;top:3px;width:14px;height:14px;border-radius:50%;background:var(--texte-dim,#888);transition:transform .2s,background .2s;"></span>
            </label>
          </div>
          <style>
            #dvd-bouncer-toggle:checked ~ .dvd-track { background:rgba(0,245,255,.22)!important;border-color:var(--bleu-neon,#00f5ff)!important; }
            #dvd-bouncer-toggle:checked ~ .dvd-thumb { transform:translateX(18px)!important;background:var(--bleu-neon,#00f5ff)!important; }
          </style>
          <ul>
            <li style="color:var(--texte-dim);font-size:0.85rem;">🖧 Icecast 2 Server</li>
            <li style="color:var(--texte-dim);font-size:0.85rem;">🐧 Debian / Apache2</li>
            <li style="color:var(--texte-dim);font-size:0.85rem;">🌐 HTML5 / CSS3 / JS</li>
            <li style="color:var(--texte-dim);font-size:0.85rem;">🎧 Mixxx</li>
          </ul>
          <div style="margin-top:1rem;">
            <div style="font-family:var(--font-tech);font-size:0.7rem;color:var(--texte-dim);letter-spacing:0.1em;margin-bottom:0.5rem;">FLUX ICECAST</div>
            <code style="font-family:var(--font-mono);font-size:0.75rem;color:var(--bleu-neon);background:rgba(0,245,255,0.05);padding:0.25rem 0.5rem;border-radius:4px;">
              :8000/joystick-fm
            </code>
          </div>
        </div>
      </div>
      
      <div class="egg-xp-container" role="status" aria-label="Progression des easter eggs">
        <div class="egg-xp-header">
          <span class="egg-xp-title">🥚 Easter Eggs — XP</span>
          <span class="egg-xp-counter"><span class="egg-xp-count">0</span>&thinsp;/&thinsp;18</span>
        </div>
        <div class="egg-xp-wrap">
          <div class="egg-xp-track" aria-label="Barre de progression">
            <div class="egg-xp-fill" style="width:0%"></div>
          </div>
        </div>
        <div class="egg-xp-footer">
          <span class="egg-xp-label"><span class="egg-xp-pct">0%</span> complété</span>
        </div>
      </div>

      <div class="footer-bottom">
        <p>
          <span id="fnaf-nose" style="cursor:pointer;user-select:none;" title="Honk! 🤡">©</span>
          <span id="footer-year">2026</span> JoyStick FM — Projet BTS SIO.
          <span style="color:var(--texte-dim);font-size:0.8rem;">Mentions fictives à des fins pédagogiques.</span>
        </p>
        <p style="color:var(--texte-dim);font-family:var(--font-pixel);font-size:0.75rem;">
          ↑↑↓↓←→←→BA 🎮
        </p>
      </div>
    </div>
  </footer>

  <div id="floating-player" class="floating-player" role="region" aria-label="Lecteur audio en cours" aria-live="polite">
    <div class="fp-info">
      <span class="fp-emoji" id="fp-emoji" aria-hidden="true">🎵</span>
      <div class="fp-text">
        <span class="fp-title" id="fp-title">Aucune lecture en cours</span>
        <span class="fp-subtitle" id="fp-subtitle">—</span>
      </div>
    </div>
    <div class="fp-center">
      <button class="fp-play-btn" id="fp-play-btn" aria-label="Lecture / Pause">▶</button>
      <div class="fp-progress-wrap" id="fp-progress-wrap" title="Cliquer pour naviguer">
        <div class="fp-progress" id="fp-progress"></div>
      </div>
      <span class="fp-time" id="fp-time">0:00 / 0:00</span>
    </div>
    <div class="fp-right">
      <button class="fp-btn" id="fp-mute-btn" aria-label="Muet / Son">🔊</button>
      <label for="fp-volume" style="display:none;">Volume</label>
      <input type="range" id="fp-volume" class="fp-vol-slider" min="0" max="1" step="0.05" value="0.8" aria-label="Volume du lecteur">
      <button class="fp-btn fp-close-btn" id="fp-close-btn" aria-label="Fermer le lecteur">✕</button>
    </div>
  </div>  

<div id="jfm-chat-overlay" aria-hidden="true"></div>

<button id="jfm-chat-toggle"
        aria-label="Ouvrir le chat en direct"
        aria-expanded="false"
        title="Live Chat"
        style="position:fixed;bottom:20px;right:20px;z-index:9999997;">
    <span class="jfm-chat-label-icon" style="font-size: 1.5rem; line-height: 1;">💬</span>
    <span id="jfm-chat-badge" hidden>0</span>
</button>

<div id="jfm-chat-popup"
     role="dialog"
     aria-label="Chat JoyStick FM"
     aria-modal="true"
     hidden>
     
    <div id="jfm-chat-header">
        <div id="jfm-chat-header-title">Live Chat</div>
        <div class="jfm-chat-controls">
            <button id="jfm-chat-dock-left" title="Ancrer à gauche" aria-label="Ancrer à gauche">◧</button>
            <button id="jfm-chat-dock-right" title="Ancrer à droite" aria-label="Ancrer à droite">◨</button>
            <button id="jfm-chat-close" title="Fermer le chat" aria-label="Fermer le chat">✕</button>
        </div>
    </div>

    <div id="jfm-chat-messages" role="log" aria-live="polite" aria-label="Messages du chat" aria-atomic="false"></div>

    <div id="jfm-chat-preview" hidden>
        <img id="jfm-chat-preview-img" src="" alt="Aperçu">
        <button type="button" id="jfm-chat-preview-remove" aria-label="Supprimer la pièce jointe">✕</button>
    </div>

    <div id="jfm-chat-divider"></div>

    <form id="jfm-chat-form" novalidate autocomplete="off">
        <div id="jfm-chat-input-row">
            <input type="text" id="jfm-chat-username" name="jfm_username" placeholder="Pseudo" maxlength="30" aria-label="Ton pseudo">
            <input type="text" id="jfm-chat-message" name="jfm_message" placeholder="Ton message…" maxlength="500" aria-label="Ton message">
            <label for="jfm-chat-file" title="Joindre une image / GIF (max 4 Mo)" aria-label="Joindre un fichier">
                📎
                <input type="file" id="jfm-chat-file" name="chatfile" accept="image/jpeg,image/png,image/webp,image/gif" hidden>
            </label>
            <button type="submit" aria-label="Envoyer">▶</button>
        </div>
    </form>
</div>

<?php wp_footer(); ?>
</body>
</html>