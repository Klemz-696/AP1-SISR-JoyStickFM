<?php
/* Template Name: Page Contact */
// page-contact.php — JoyStick FM WordPress Theme
// Ce fichier est un template personnalisé pour la page de contact. Il contient un formulaire de contact fonctionnel (utilisant Formspree pour le traitement des données) et des informations de contact supplémentaires
get_header(); 
?>

<main id="main-content">
  <section style="padding:3rem 0 1rem;text-align:center;">
    <div class="container">
      <p class="pixel-label">📨 On répond (parfois)</p>
      <h1 style="margin:0.75rem 0;">Nous <span class="neon-text-rose">Contacter</span></h1>
      <p style="color:var(--texte-dim);max-width:480px;margin:0 auto;">Proposition de podcast, partenariat, bug à signaler ou juste envie de dire bonjour ? C'est ici.</p>
    </div>
  </section>

  <section class="section" style="padding-top:2rem;">
    <div class="container">
      <div style="display:grid;grid-template-columns:1fr 1.4fr;gap:3rem;max-width:900px;margin:0 auto;align-items:start;">

        <aside>
          <h2 style="font-size:1.1rem;margin-bottom:1.5rem;">📡 Retrouvez-nous</h2>
          <div style="display:flex;flex-direction:column;gap:1.25rem;">
            <div class="card" style="padding:1.25rem;display:flex;align-items:flex-start;gap:1rem;">
              <span style="font-size:1.5rem;">📻</span>
              <div>
                <div style="font-family:var(--font-tech);font-size:0.75rem;color:var(--texte-dim);letter-spacing:0.1em;margin-bottom:0.25rem;">FLUX RADIO</div>
                <div style="font-family:var(--font-mono);color:var(--bleu-neon);font-size:0.85rem;">radio.joystickfm.local:8000</div>
              </div>
            </div>
            <div class="card" style="padding:1.25rem;display:flex;align-items:flex-start;gap:1rem;">
              <span style="font-size:1.5rem;">✉️</span>
              <div>
                <div style="font-family:var(--font-tech);font-size:0.75rem;color:var(--texte-dim);letter-spacing:0.1em;margin-bottom:0.25rem;">EMAIL</div>
                <div style="font-family:var(--font-mono);color:var(--bleu-neon);font-size:0.85rem;">contact.joystickfm@gmail.com</div>
              </div>
            </div>
            <div class="card" style="padding:1.25rem;display:flex;align-items:flex-start;gap:1rem;">
              <span style="font-size:1.5rem;">🏫</span>
              <div>
                <div style="font-family:var(--font-tech);font-size:0.75rem;color:var(--texte-dim);letter-spacing:0.1em;margin-bottom:0.25rem;">ÉCOLE</div>
                <div style="font-family:var(--font-mono);color:var(--bleu-neon);font-size:0.85rem;">Lycée Sidoine Apollinaire - Clermont-Ferrand</div>
              </div>
            </div>
          </div>

          <div style="margin-top:2rem;">
            <h3 style="font-size:0.9rem;color:var(--texte-dim);margin-bottom:1rem;font-family:var(--font-tech);letter-spacing:0.1em;">FAQ RAPIDE</h3>
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
              <details style="background:var(--noir-card);border:1px solid var(--noir-border);border-radius:var(--radius);padding:0.75rem 1rem;cursor:pointer;">
                <summary style="font-size:0.85rem;color:var(--texte);">Comment écouter la radio ?</summary>
                <p style="font-size:0.82rem;color:var(--texte-dim);margin-top:0.5rem;padding-left:0.5rem;">Rendez-vous sur la page <a href="<?php echo home_url('/radio'); ?>">Direct</a> et cliquez sur le bouton ▶ Play.</p>
              </details>
              <details style="background:var(--noir-card);border:1px solid var(--noir-border);border-radius:var(--radius);padding:0.75rem 1rem;cursor:pointer;">
                <summary style="font-size:0.85rem;color:var(--texte);">Comment proposer un podcast ?</summary>
                <p style="font-size:0.82rem;color:var(--texte-dim);margin-top:0.5rem;padding-left:0.5rem;">Utilisez le formulaire ci-contre avec le sujet "Proposition de podcast".</p>
              </details>
              <details style="background:var(--noir-card);border:1px solid var(--noir-border);border-radius:var(--radius);padding:0.75rem 1rem;cursor:pointer;">
                <summary style="font-size:0.85rem;color:var(--texte);">Y a-t-il un easter egg caché ?</summary>
                <p style="font-size:0.82rem;color:var(--texte-dim);margin-top:0.5rem;padding-left:0.5rem;">↑↑↓↓←→←→BA 🎮</p>
              </details>
            </div>
          </div>
        </aside>

        <div id="form-container">
          <h2 style="font-size:1.1rem;margin-bottom:1.5rem;">✉️ Envoyer un message</h2>
          <form id="contact-form" action="https://formspree.io/f/xjgelqpw" method="POST">
            <div class="form-group" data-group="name">
              <label for="field-name">Pseudo / Nom *</label>
              <input type="text" id="field-name" name="name" placeholder="TheKairi78" autocomplete="name" aria-required="true">
              <span class="error-msg" role="alert"></span>
            </div>
            <div class="form-group" data-group="email">
              <label for="field-email">Adresse email *</label>
              <input type="email" id="field-email" name="email" placeholder="vous@exemple.com" autocomplete="email" aria-required="true">
              <span class="error-msg" role="alert"></span>
            </div>
            <div class="form-group" data-group="subject">
              <label for="field-subject">Sujet *</label>
              <select id="field-subject" name="subject" aria-required="true">
                <option value="">— Choisir un sujet —</option>
                <option value="proposition">🎙 Proposition de podcast</option>
                <option value="partenariat">🤝 Partenariat / collaboration</option>
                <option value="bug">🐛 Signalement de bug</option>
                <option value="musique">🎵 Demande musicale</option>
                <option value="rejoindre">👾 Rejoindre l'équipe</option>
                <option value="autre">💬 Autre</option>
              </select>
              <span class="error-msg" role="alert"></span>
            </div>
            <div class="form-group" data-group="message">
              <label for="field-message">Message * <span id="msg-counter" style="float:right;font-family:var(--font-mono);color:var(--texte-dim);font-size:0.8rem;font-weight:normal;">0 / 1000</span></label>
              <textarea id="field-message" name="message" placeholder="Votre message (20 caractères minimum)..." aria-required="true"></textarea>
              <span class="error-msg" role="alert"></span>
            </div>
            <div style="display:none;" aria-hidden="true">
              <input type="text" id="website" name="website" tabindex="-1" autocomplete="off">
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;font-size:0.9rem;padding:1rem;">▶ ENVOYER LE MESSAGE</button>
            <p style="font-size:0.75rem;color:var(--texte-dim);text-align:center;margin-top:1rem;">* Champs obligatoires. Données fictives — usage pédagogique BTS SIO.</p>
          </form>
        </div>

        <div id="form-success" style="display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:3rem 2rem;background:var(--noir-card);border:1px solid var(--vert-neon);border-radius:var(--radius-lg);animation:fadeIn 0.4s ease;">
          <div class="success-icon" aria-hidden="true">✓</div>
          <h2 style="margin:1.25rem 0 0.5rem;color:var(--vert-neon);">Message envoyé !</h2>
          <p style="color:var(--texte-dim);max-width:320px;font-size:0.9rem;">On a bien reçu votre message. On répondra dès qu'on aura fini notre partie. 🎮</p>
          <p style="font-family:var(--font-pixel);font-size:1rem;color:var(--bleu-neon);margin-top:1rem;">+50 XP OBTENUS</p>
          <a href="<?php echo home_url('/'); ?>" class="btn btn-ghost" style="margin-top:1.5rem;">← Retour à l'accueil</a>
        </div>

      </div>
    </div>
  </section>
</main>

<?php get_footer(); ?>