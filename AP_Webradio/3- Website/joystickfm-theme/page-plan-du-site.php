<?php
/* Template Name: Plan du Site */
get_header(); 
?>
<main id="main-content">
  <section style="padding:3rem 0 1rem;text-align:center;">
    <div class="container">
      <p class="pixel-label">🗺️ Architecture du site</p>
      <h1 style="margin:0.75rem 0;">Plan du <span class="neon-text-blue">Site</span></h1>
      <p style="color:var(--texte-dim);max-width:500px;margin:0 auto;">
        Vue complète de l'architecture de JoyStick FM — toutes les pages et fonctionnalités du projet.
      </p>
    </div>
  </section>

  <section class="section" style="padding-top:2rem;">
    <div class="container" style="max-width:1000px;">

      <!-- Statistiques du projet -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:1rem;margin-bottom:3rem;" id="stats-grid">
        <div class="card" style="padding:1.25rem;text-align:center;">
          <div style="font-family:var(--font-pixel);font-size:2rem;color:var(--bleu-neon);text-shadow:var(--glow-bleu);">7</div>
          <div style="font-size:0.75rem;color:var(--texte-dim);font-family:var(--font-tech);margin-top:0.25rem;">PAGES WP</div>
        </div>
        <div class="card" style="padding:1.25rem;text-align:center;">
          <div style="font-family:var(--font-pixel);font-size:2rem;color:var(--rose-neon);">18</div>
          <div style="font-size:0.75rem;color:var(--texte-dim);font-family:var(--font-tech);margin-top:0.25rem;">EASTER EGGS</div>
        </div>
        <div class="card" style="padding:1.25rem;text-align:center;">
          <div style="font-family:var(--font-pixel);font-size:2rem;color:var(--vert-neon);">3</div>
          <div style="font-size:0.75rem;color:var(--texte-dim);font-family:var(--font-tech);margin-top:0.25rem;">PODCASTS</div>
        </div>
        <div class="card" style="padding:1.25rem;text-align:center;">
          <div style="font-family:var(--font-pixel);font-size:2rem;color:var(--violet);">6</div>
          <div style="font-size:0.75rem;color:var(--texte-dim);font-family:var(--font-tech);margin-top:0.25rem;">ARTICLES</div>
        </div>
        <div class="card" style="padding:1.25rem;text-align:center;">
          <div style="font-family:var(--font-pixel);font-size:2rem;color:var(--bleu-neon);">3</div>
          <div style="font-size:0.75rem;color:var(--texte-dim);font-family:var(--font-tech);margin-top:0.25rem;">VMs vSphere</div>
        </div>
      </div>

      <!-- Arborescence des pages -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin-bottom:2rem;">
        <div class="card" style="padding:1.75rem;">
          <h2 style="font-size:1rem;color:var(--blanc);margin-bottom:1rem;">🏠 Pages Principales</h2>
          <ul style="list-style:none;padding:0;font-size:0.85rem;color:var(--texte);line-height:2.2;">
            <li>▸ <a href="<?php echo home_url('/'); ?>">Accueil</a>
              <span style="color:var(--texte-dim);font-size:0.75rem;"> — Hero, podcasts, actus, CTA radio</span>
            </li>
            <li>▸ <a href="<?php echo home_url('/radio'); ?>">Écoute en direct</a>
              <span style="color:var(--texte-dim);font-size:0.75rem;"> — Lecteur Icecast, visualiseur, programme</span>
            </li>
            <li>▸ <a href="<?php echo home_url('/podcasts'); ?>">Podcasts</a>
              <span style="color:var(--texte-dim);font-size:0.75rem;"> — 3 épisodes, filtres par catégorie</span>
            </li>
            <li>▸ <a href="<?php echo home_url('/blog'); ?>">Blog Gaming</a>
              <span style="color:var(--texte-dim);font-size:0.75rem;"> — 6 articles, lecture inline</span>
            </li>
            <li>▸ <a href="<?php echo home_url('/contact'); ?>">Contact</a>
              <span style="color:var(--texte-dim);font-size:0.75rem;"> — Formulaire Formspree, FAQ</span>
            </li>
          </ul>
        </div>
        <div class="card" style="padding:1.75rem;">
          <h2 style="font-size:1rem;color:var(--blanc);margin-bottom:1rem;">⚖️ Pages Légales</h2>
          <ul style="list-style:none;padding:0;font-size:0.85rem;color:var(--texte);line-height:2.2;">
            <li>▸ <a href="<?php echo home_url('/mentions-legales'); ?>">Mentions légales</a>
              <span style="color:var(--texte-dim);font-size:0.75rem;"> — Éditeur, hébergement, propriété intellectuelle</span>
            </li>
            <li>▸ <a href="<?php echo home_url('/politique-de-confidentialite'); ?>">Politique de confidentialité</a>
              <span style="color:var(--texte-dim);font-size:0.75rem;"> — RGPD, données collectées, droits</span>
            </li>
            <li>▸ <a href="<?php echo home_url('/plan-du-site'); ?>" style="color:var(--bleu-neon);">Plan du site</a>
              <span style="color:var(--texte-dim);font-size:0.75rem;"> — Cette page</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Stack technique -->
      <div class="card" style="padding:1.75rem;margin-bottom:2rem;">
        <h2 style="font-size:1rem;color:var(--blanc);margin-bottom:1.25rem;">🛠️ Stack Technique</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1.25rem;">

          <div>
            <div style="font-family:var(--font-tech);font-size:0.7rem;color:var(--bleu-neon);letter-spacing:0.1em;margin-bottom:0.5rem;">FRONT-END</div>
            <ul style="list-style:none;padding:0;font-size:0.82rem;color:var(--texte-dim);line-height:1.9;">
              <li>▸ HTML5 / CSS3 (variables, animations)</li>
              <li>▸ JavaScript ES6+ (Vanilla)</li>
              <li>▸ Web Audio API (visualiseur)</li>
              <li>▸ Canvas API (DVD Bouncer)</li>
              <li>▸ Media Session API (notifs mobiles)</li>
              <li>▸ Polices : VT323, Orbitron, Share Tech Mono</li>
            </ul>
          </div>

          <div>
            <div style="font-family:var(--font-tech);font-size:0.7rem;color:var(--violet);letter-spacing:0.1em;margin-bottom:0.5rem;">BACK-END</div>
            <ul style="list-style:none;padding:0;font-size:0.82rem;color:var(--texte-dim);line-height:1.9;">
              <li>▸ WordPress 6.x (thème sur-mesure)</li>
              <li>▸ PHP 8.2</li>
              <li>▸ Apache 2.4 (Reverse Proxy)</li>
              <li>▸ MariaDB</li>
            </ul>
          </div>

          <div>
            <div style="font-family:var(--font-tech);font-size:0.7rem;color:var(--vert-neon);letter-spacing:0.1em;margin-bottom:0.5rem;">STREAMING</div>
            <ul style="list-style:none;padding:0;font-size:0.82rem;color:var(--texte-dim);line-height:1.9;">
              <li>▸ Icecast 2.4 (flux MP3 128kbps)</li>
              <li>▸ Mixxx (AutoDJ)</li>
              <li>▸ Mount point : /joystick-fm</li>
              <li>▸ Format : MP3 44 100 Hz Stéréo</li>
            </ul>
          </div>

          <div>
            <div style="font-family:var(--font-tech);font-size:0.7rem;color:var(--rose-neon);letter-spacing:0.1em;margin-bottom:0.5rem;">RÉSEAU / SÉCURITÉ</div>
            <ul style="list-style:none;padding:0;font-size:0.82rem;color:var(--texte-dim);line-height:1.9;">
              <li>▸ Proxmox VE (hyperviseur)</li>
              <li>▸ VLAN 100 DMZ (10.100.0.0/24)</li>
              <li>▸ OPNsense (pare-feu, NAT)</li>
              <li>▸ SSH uniquement (pas de FTP)</li>
            </ul>
          </div>

        </div>
      </div>

      <!-- Infrastructure -->
      <div class="card" style="padding:1.75rem;margin-bottom:2rem;">
        <h2 style="font-size:1rem;color:var(--blanc);margin-bottom:1.25rem;">🖧 Infrastructure Réseau</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;">
          
          <div style="background:rgba(0,245,255,0.04);border:1px solid rgba(0,245,255,0.15);border-radius:var(--radius);padding:1rem;">
            <div style="font-family:var(--font-pixel);font-size:1.1rem;color:var(--bleu-neon);margin-bottom:0.25rem;">🎧 VM Mixxx</div>
            <div style="font-family:var(--font-mono);color:var(--vert-neon);font-size:0.8rem;margin-bottom:0.5rem;">10.100.0.52</div>
            <div style="font-size:0.78rem;color:var(--texte-dim);">Régie de diffusion audio.<br>AutoDJ + connexion Icecast.</div>
          </div>

          <div style="background:rgba(57,255,20,0.04);border:1px solid rgba(57,255,20,0.15);border-radius:var(--radius);padding:1rem;">
            <div style="font-family:var(--font-pixel);font-size:1.1rem;color:var(--vert-neon);margin-bottom:0.25rem;">🌐 VM WordPress</div>
            <div style="font-family:var(--font-mono);color:var(--vert-neon);font-size:0.8rem;margin-bottom:0.5rem;">10.100.0.51</div>
            <div style="font-size:0.78rem;color:var(--texte-dim);">Site web dynamique.<br>Apache2, PHP, MariaDB, WordPress.</div>
          </div>

          <div style="background:rgba(180,79,255,0.04);border:1px solid rgba(180,79,255,0.15);border-radius:var(--radius);padding:1rem;">
            <div style="font-family:var(--font-pixel);font-size:1.1rem;color:var(--violet);margin-bottom:0.25rem;">📡 VM Icecast</div>
            <div style="font-family:var(--font-mono);color:var(--vert-neon);font-size:0.8rem;margin-bottom:0.5rem;">10.100.0.50</div>
            <div style="font-size:0.78rem;color:var(--texte-dim);">Serveur de flux audio.<br>Icecast 2.4, port 8000.</div>
          </div>

        </div>
      </div>

      <!-- Fonctionnalité décorative DVD Bouncer -->
      <div class="card" style="padding:1.75rem;margin-bottom:2rem;border-color:rgba(255,107,53,0.4);">
        <h2 style="font-size:1rem;color:#ff6b35;margin-bottom:1.25rem;">🖼️ Fonctionnalité Décorative — DVD Bouncer</h2>
        <p style="font-size:0.85rem;color:var(--texte);line-height:1.8;">
          Le logo JoyStick FM rebondit en arrière-plan de toutes les pages du site, simulant le classique économiseur d'écran DVD. 
          Cette fonctionnalité est purement décorative (aucune interaction requise) et s'active automatiquement au chargement de chaque page.
        </p>
        <p style="font-size:0.82rem;color:var(--texte-dim);margin-top:0.75rem;">
          ✨ Lorsque le logo atteint un coin de l'écran, un effet <em>Retour vers le Futur</em> se déclenche : flash lumineux, lignes de vitesse et "88 MPH !".
        </p>
      </div>

      <!-- Easter Eggs -->
      <div class="card" style="padding:1.75rem;margin-bottom:2rem;border-color:var(--violet);">
        <h2 style="font-size:1rem;color:var(--violet);margin-bottom:1.25rem;">🥚 Les 18 Easter Eggs</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:0.6rem;">
          <?php
          $eggs = [
            ['🎮', 'Konami Code', '↑↑↓↓←→←→BA au clavier (ou swipes mobile)'],
            ['🎵', 'Rickroll', '5× clic sur le texte du logo'],
            ['🌈', 'Nyan Cat', '3× clic sur un horaire (page Radio)'],
            ['🍄', 'Mario 1-UP', '5× clic sur un titre d\'émission'],
            ['💀', 'DOOM IDDQD', '5× clic sur l\'icône 🎮 du logo'],
            ['🔥', 'Hadouken', '3× clic dans une colonne du footer'],
            ['⚡', 'Pokémon', '4× clic sur la vignette d\'un podcast'],
            ['🔴', 'FNAF Honk', 'Clic sur le © dans le footer'],
            ['🗡️', 'Zelda', 'Double-clic sur la description footer'],
            ['💨', 'Sonic', 'Laisser la souris 1,5s sur un lien nav'],
            ['🍔', 'TK Burger', '15× clic sur le bouton Play (radio)'],
            ['🖼️', 'Affiche', 'Maintenir 5s clic sur l\'affiche du groupe'],
            ['🔊', 'WEEEE', '5× clic sur le bouton haut-parleur (radio)'],
            ['🔢', '67', 'Clic sur "v6.7" (écran de démarrage)'],
            ['⚡', 'Klemz', 'Clic sur "Klemz" (écran de démarrage)'],
            ['🥩', 'Steakman63', 'Clic sur "Steakman63" (écran de démarrage)'],
            ['🐧', 'Pingouy', 'Clic sur "Pingouy" (écran de démarrage)'],
            ['🍮', 'Krem Brûlé', 'Clic sur "Krem Brûlé" (écran de démarrage)'],
          ];
          foreach ($eggs as $egg): ?>
          <div style="display:flex;align-items:center;gap:0.75rem;padding:0.5rem 0.75rem;
                      background:rgba(180,79,255,0.04);border-radius:var(--radius);
                      border:1px solid rgba(180,79,255,0.1);">
            <span style="font-size:1.3rem;flex-shrink:0;"><?php echo $egg[0]; ?></span>
            <div>
              <div style="font-family:var(--font-tech);font-size:0.72rem;color:var(--blanc);"><?php echo $egg[1]; ?></div>
              <div style="font-size:0.72rem;color:var(--texte-dim);"><?php echo $egg[2]; ?></div>
            </div>
          </div>
          <?php endforeach; ?>
        </div>
        <p style="text-align:center;margin-top:1rem;font-family:var(--font-pixel);font-size:0.75rem;color:var(--texte-dim);">
          Suivi de progression visible dans la barre XP du footer 🏆 — 18/18 débloque la vidéo finale !
        </p>
      </div>

      <div style="text-align:center;margin-top:2.5rem;margin-bottom:1rem;">
        <a href="<?php echo home_url('/'); ?>" class="btn btn-primary">🏠 Retour à l'accueil</a>
      </div>
    </div>
  </section>
</main>
<?php get_footer(); ?>
