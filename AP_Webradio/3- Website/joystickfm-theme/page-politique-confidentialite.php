<?php
/* Template Name: Politique de Confidentialité */
get_header();
?>
<main id="main-content">
  <section style="padding:3rem 0 1rem;text-align:center;">
    <div class="container">
      <p class="pixel-label">🔒 RGPD & Vie privée</p>
      <h1 style="margin:0.75rem 0;">Politique de <span class="neon-text-violet">Confidentialité</span></h1>
      <p style="color:var(--texte-dim);max-width:600px;margin:0 auto;">
        JoyStick FM s'engage à protéger votre vie privée et à respecter le Règlement Général sur la Protection des Données (RGPD — Règlement UE 2016/679).
      </p>
    </div>
  </section>

  <section class="section" style="padding-top:2rem;">
    <div class="container" style="max-width:860px;">

      <!-- Responsable du traitement -->
      <div class="card" style="padding:2rem;margin-bottom:1.5rem;">
        <h2 style="font-size:1.1rem;color:var(--violet);margin-bottom:1.25rem;font-family:var(--font-tech);letter-spacing:0.1em;">👤 RESPONSABLE DU TRAITEMENT</h2>
        <div style="background:rgba(180,79,255,0.05);border:1px solid rgba(180,79,255,0.2);border-radius:var(--radius);padding:1rem 1.5rem;font-size:0.9rem;">
          <strong style="color:var(--blanc);">JoyStick FM</strong> — Projet BTS SIO TS1<br>
          Lycée Sidoine Apollinaire — Clermont-Ferrand (63000)<br>
          Contact : <a href="mailto:contact.joystickfm@gmail.com">contact.joystickfm@gmail.com</a>
        </div>
        <p style="font-size:0.85rem;color:var(--texte-dim);margin-top:0.75rem;">
          Ce site étant un projet pédagogique non commercial, il ne dispose pas d'un Délégué à la Protection des Données (DPO) formellement désigné. Pour toute question relative à vos données, contactez directement l'équipe via l'adresse ci-dessus.
        </p>
      </div>

      <!-- Données collectées -->
      <div class="card" style="padding:2rem;margin-bottom:1.5rem;">
        <h2 style="font-size:1.1rem;color:var(--violet);margin-bottom:1.25rem;font-family:var(--font-tech);letter-spacing:0.1em;">📋 DONNÉES COLLECTÉES</h2>

        <h3 style="font-size:0.95rem;color:var(--blanc);margin-bottom:0.5rem;">1. Formulaire de contact</h3>
        <p style="font-size:0.9rem;color:var(--texte);margin-bottom:0.5rem;">
          Lorsque vous utilisez notre formulaire de contact, les données suivantes sont collectées : <strong>nom/pseudo</strong>, <strong>adresse e-mail</strong> et <strong>message</strong>. Ces données sont transmises via le service tiers <strong>Formspree</strong> (formspree.io) et ne sont pas stockées sur nos propres serveurs.
        </p>
        <p style="font-size:0.9rem;color:var(--texte);margin-bottom:1.25rem;">
          <strong>Finalité :</strong> permettre à l'équipe de vous répondre. <strong>Durée de conservation :</strong> les données sont gérées conformément à la politique de confidentialité de Formspree.
        </p>

        <h3 style="font-size:0.95rem;color:var(--blanc);margin-bottom:0.5rem;">2. Données de navigation — Icecast</h3>
        <p style="font-size:0.9rem;color:var(--texte);margin-bottom:1.25rem;">
          Lorsque vous écoutez le flux radio, notre serveur Icecast enregistre votre adresse IP, le navigateur utilisé et la durée d'écoute à des fins de comptage des auditeurs. Ces journaux sont conservés localement sur le serveur de streaming et ne sont pas transmis à des tiers.
        </p>

        <h3 style="font-size:0.95rem;color:var(--blanc);margin-bottom:0.5rem;">3. Stockage local (sessionStorage)</h3>
        <p style="font-size:0.9rem;color:var(--texte);">
          Le site utilise <code>sessionStorage</code> — stockage local dans votre navigateur, effacé à la fermeture de l'onglet — pour mémoriser :
        </p>
        <ul style="margin:0.5rem 0 0 1.5rem;color:var(--texte);font-size:0.9rem;line-height:2;">
          <li>Le niveau de volume audio choisi</li>
          <li>L'état de lecture en cours (pour la persistance entre pages)</li>
          <li>La progression dans les Easter Eggs (barre XP — 18 secrets)</li>
        </ul>
        <p style="font-size:0.9rem;color:var(--texte-dim);margin-top:0.5rem;">Ces données ne quittent jamais votre appareil et ne sont jamais transmises à des serveurs.</p>

        <h3 style="font-size:0.95rem;color:var(--blanc);margin-bottom:0.5rem;margin-top:1.25rem;">4. Fonctionnalité décorative — DVD Bouncer</h3>
        <p style="font-size:0.9rem;color:var(--texte);">
          Le logo DVD Bouncer animé en arrière-plan des pages fonctionne exclusivement côté navigateur via l'API Canvas HTML5. Il n'utilise pas de cookies, ne collecte aucune donnée et ne transmet aucune information à des serveurs extérieurs.
        </p>
      </div>

      <!-- Cookies -->
      <div class="card" style="padding:2rem;margin-bottom:1.5rem;">
        <h2 style="font-size:1.1rem;color:var(--violet);margin-bottom:1.25rem;font-family:var(--font-tech);letter-spacing:0.1em;">🍪 COOKIES</h2>
        <p style="font-size:0.9rem;color:var(--texte);margin-bottom:0.75rem;">
          JoyStick FM n'utilise <strong>aucun cookie publicitaire, analytique ou de traçage</strong>. Les seuls cookies présents peuvent être ceux déposés automatiquement par WordPress pour la gestion de session d'administration (cookie <code>wordpress_*</code>), uniquement visibles si vous êtes connecté en tant qu'administrateur.
        </p>
        <div style="background:rgba(57,255,20,0.05);border:1px solid rgba(57,255,20,0.2);border-radius:var(--radius);padding:1rem 1.5rem;font-size:0.9rem;">
          ✅ <strong style="color:var(--vert-neon);">Aucun cookie de suivi tiers</strong> — Aucun Google Analytics, Facebook Pixel ou outil de tracking similaire n'est présent sur ce site.
        </div>
      </div>

      <!-- Droits des utilisateurs -->
      <div class="card" style="padding:2rem;margin-bottom:1.5rem;">
        <h2 style="font-size:1.1rem;color:var(--violet);margin-bottom:1.25rem;font-family:var(--font-tech);letter-spacing:0.1em;">🛡️ VOS DROITS (RGPD)</h2>
        <p style="font-size:0.9rem;color:var(--texte);margin-bottom:0.75rem;">
          Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :
        </p>
        <ul style="margin:0 0 1rem 1.5rem;color:var(--texte);font-size:0.9rem;line-height:2.2;">
          <li><strong style="color:var(--bleu-neon);">Droit d'accès</strong> — Obtenir une copie des données vous concernant</li>
          <li><strong style="color:var(--bleu-neon);">Droit de rectification</strong> — Corriger des données inexactes</li>
          <li><strong style="color:var(--bleu-neon);">Droit à l'effacement</strong> — Demander la suppression de vos données</li>
          <li><strong style="color:var(--bleu-neon);">Droit d'opposition</strong> — S'opposer à un traitement de données</li>
          <li><strong style="color:var(--bleu-neon);">Droit à la portabilité</strong> — Recevoir vos données dans un format structuré</li>
        </ul>
        <p style="font-size:0.9rem;color:var(--texte);">
          Pour exercer ces droits, contactez-nous à <a href="mailto:contact.joystickfm@gmail.com">contact.joystickfm@gmail.com</a>. Vous pouvez également adresser une réclamation à la <strong>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés) sur <a href="https://www.cnil.fr" target="_blank" rel="noopener">www.cnil.fr</a>.
        </p>
      </div>

      <!-- Sécurité -->
      <div class="card" style="padding:2rem;margin-bottom:1.5rem;">
        <h2 style="font-size:1.1rem;color:var(--violet);margin-bottom:1.25rem;font-family:var(--font-tech);letter-spacing:0.1em;">🔐 SÉCURITÉ DES DONNÉES</h2>
        <p style="font-size:0.9rem;color:var(--texte);margin-bottom:0.75rem;">
          Les mesures de sécurité mises en place dans le cadre de ce projet pédagogique incluent :
        </p>
        <ul style="margin:0 0 0.75rem 1.5rem;color:var(--texte);font-size:0.9rem;line-height:2.2;">
          <li>Réseau isolé en VLAN — le site n'est pas accessible depuis Internet</li>
          <li>Pare-feu OPNsense avec règles de filtrage strictes</li>
          <li>Validation des données côté serveur (formulaires)</li>
          <li>Honeypot anti-spam sur le formulaire de contact</li>
          <li>Mots de passe forts sur tous les services (Icecast, WordPress, SSH)</li>
          <li>Accès SSH uniquement — FTP non chiffré désactivé</li>
        </ul>
        <p style="font-size:0.85rem;color:var(--texte-dim);">
          Ce projet étant de nature pédagogique sur un réseau interne, il ne fait pas l'objet d'une certification de sécurité officielle (ISO 27001, etc.).
        </p>
      </div>

      <div style="text-align:center;margin-bottom:2rem;">
        <a href="<?php echo home_url('/'); ?>" class="btn btn-ghost">← Retour à l'accueil</a>
      </div>
    </div>
  </section>
</main>
<?php get_footer(); ?>
