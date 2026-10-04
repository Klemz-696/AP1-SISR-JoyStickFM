<?php
/* Template Name: Mentions Légales */
get_header();
?>
<main id="main-content">
  <section style="padding:3rem 0 1rem;text-align:center;">
    <div class="container">
      <p class="pixel-label">⚖️ Informations légales</p>
      <h1 style="margin:0.75rem 0;">Mentions <span class="neon-text-blue">Légales</span></h1>
      <p style="color:var(--texte-dim);max-width:600px;margin:0 auto;">
        Conformément aux dispositions des articles 6-III et 19 de la Loi n°&nbsp;2004-575 du 21 juin 2004
        pour la Confiance dans l'Économie Numérique (LCEN), nous vous informons des éléments suivants.
      </p>
    </div>
  </section>

  <section class="section" style="padding-top:2rem;">
    <div class="container" style="max-width:860px;">

      <!-- Éditeur du site -->
      <div class="card" style="padding:2rem;margin-bottom:1.5rem;">
        <h2 style="font-size:1.1rem;color:var(--bleu-neon);margin-bottom:1.25rem;font-family:var(--font-tech);letter-spacing:0.1em;">🖥️ ÉDITEUR DU SITE</h2>
        <dl style="display:grid;grid-template-columns:200px 1fr;gap:0.6rem 1.5rem;font-size:0.9rem;">
          <dt style="color:var(--texte-dim);">Nom du site</dt>
          <dd style="color:var(--texte);">JoyStick FM — WebRadio Gaming</dd>

          <dt style="color:var(--texte-dim);">Nature du projet</dt>
          <dd style="color:var(--texte);">Projet pédagogique réalisé dans le cadre du BTS Services Informatiques aux Organisations (BTS SIO), options SISR et SLAM. Ce site est produit à des fins exclusivement pédagogiques et n'est pas destiné à une exploitation commerciale.</dd>

          <dt style="color:var(--texte-dim);">Établissement</dt>
          <dd style="color:var(--texte);">Lycée Sidoine Apollinaire — 34 Rue du Maréchal Joffre, 63000 Clermont-Ferrand</dd>

          <dt style="color:var(--texte-dim);">Niveau d'études</dt>
          <dd style="color:var(--texte);">BTS SIO 2ème année — Groupe TS1 — Promotion 2025-2026</dd>

          <dt style="color:var(--texte-dim);">Équipe de développement</dt>
          <dd style="color:var(--texte);">
            Sauzède Clément (alias Klemz) — Chef de projet / Développeur Full-Stack<br>
            Perez Nathan (alias Steakman63) — Développeur Back-End / Infrastructure<br>
            James Robin (alias Pingouy) — Développeur Front-End / UX Design<br>
            Duru Clément (alias Krem Brûlé) — Administrateur Réseau / Streaming
          </dd>

          <dt style="color:var(--texte-dim);">Contact</dt>
          <dd style="color:var(--texte);"><a href="mailto:contact.joystickfm@gmail.com">contact.joystickfm@gmail.com</a></dd>

          <dt style="color:var(--texte-dim);">Année de création</dt>
          <dd style="color:var(--texte);">2026</dd>
        </dl>
      </div>

      <!-- Hébergement et infrastructure -->
      <div class="card" style="padding:2rem;margin-bottom:1.5rem;">
        <h2 style="font-size:1.1rem;color:var(--bleu-neon);margin-bottom:1.25rem;font-family:var(--font-tech);letter-spacing:0.1em;">🖧 HÉBERGEMENT ET INFRASTRUCTURE</h2>
        <dl style="display:grid;grid-template-columns:200px 1fr;gap:0.6rem 1.5rem;font-size:0.9rem;">
          <dt style="color:var(--texte-dim);">Type d'hébergement</dt>
          <dd style="color:var(--texte);">Serveur local hébergé sur l'infrastructure interne du lycée Sidoine Apollinaire. Le site n'est pas accessible depuis Internet public.</dd>

          <dt style="color:var(--texte-dim);">Virtualisation</dt>
          <dd style="color:var(--texte);">Proxmox VE — 3 machines virtuelles Debian 12 sur un VLAN dédié (10.100.0.0/24)</dd>

          <dt style="color:var(--texte-dim);">Serveur web</dt>
          <dd style="color:var(--texte);">VM WordPress (10.100.0.51) — Apache 2.4, PHP 8.2, MariaDB, WordPress 6.x</dd>

          <dt style="color:var(--texte-dim);">Serveur radio</dt>
          <dd style="color:var(--texte);">VM Icecast (10.100.0.50) — Icecast 2.4, diffusion audio MP3 128 kbps en streaming HTTP</dd>

          <dt style="color:var(--texte-dim);">Logiciel DJ</dt>
          <dd style="color:var(--texte);">VM Mixxx (10.100.0.52) — Auto-DJ, logiciel libre de gestion des playlists et streaming</dd>

          <dt style="color:var(--texte-dim);">Pare-feu / Routage</dt>
          <dd style="color:var(--texte);">OPNsense — Gestion du NAT, port forwarding et règles de filtrage réseau</dd>
        </dl>
      </div>

      <!-- Propriété intellectuelle -->
      <div class="card" style="padding:2rem;margin-bottom:1.5rem;">
        <h2 style="font-size:1.1rem;color:var(--bleu-neon);margin-bottom:1.25rem;font-family:var(--font-tech);letter-spacing:0.1em;">©️ PROPRIÉTÉ INTELLECTUELLE</h2>
        <p style="font-size:0.9rem;color:var(--texte);margin-bottom:1rem;">
          L'ensemble des éléments constituant le site JoyStick FM (code source, design, textes, images originales) est protégé par le droit d'auteur conformément aux articles L.111-1 et suivants du Code de la propriété intellectuelle français.
        </p>
        <p style="font-size:0.9rem;color:var(--texte);margin-bottom:1rem;">
          <strong style="color:var(--blanc);">Contenus musicaux :</strong> Les titres diffusés sur la radio appartiennent à leurs auteurs et compositeurs respectifs. La diffusion est effectuée dans un cadre strictement pédagogique et non commercial, au sein d'un réseau local intranet.
        </p>
        <p style="font-size:0.9rem;color:var(--texte);margin-bottom:1rem;">
          <strong style="color:var(--blanc);">Marques citées :</strong> Nintendo, Sega, Valve, id Software, Capcom, Konami et toutes les autres marques mentionnées dans les contenus éditoriaux appartiennent à leurs propriétaires respectifs. Leur citation est effectuée dans un but pédagogique et informatif uniquement.
        </p>
        <p style="font-size:0.9rem;color:var(--texte);">
          <strong style="color:var(--blanc);">Logiciels utilisés :</strong> WordPress (GPL v2+), Icecast (GPL v2), Mixxx (GPL v2), Apache (Apache License 2.0), MariaDB (GPL v2).
        </p>
      </div>

      <!-- Fonctionnalités interactives -->
      <div class="card" style="padding:2rem;margin-bottom:1.5rem;">
        <h2 style="font-size:1.1rem;color:var(--bleu-neon);margin-bottom:1.25rem;font-family:var(--font-tech);letter-spacing:0.1em;">🎮 FONCTIONNALITÉS INTERACTIVES</h2>
        <p style="font-size:0.9rem;color:var(--texte);margin-bottom:0.75rem;">
          Le site intègre plusieurs fonctionnalités interactives à caractère pédagogique et ludique :
        </p>
        <ul style="margin:0 0 1rem 1.5rem;color:var(--texte);font-size:0.9rem;line-height:2.2;">
          <li><strong style="color:var(--bleu-neon);">18 Easter Eggs</strong> — Secrets interactifs déclenchés par des combinaisons de clics, survols ou séquences de touches. Leur progression est suivie via <code>sessionStorage</code>.</li>
          <li><strong style="color:var(--bleu-neon);">DVD Bouncer</strong> — Logo DVD animé en arrière-plan de toutes les pages, purement décoratif. Ne nécessite aucune interaction de l'utilisateur pour s'activer.</li>
          <li><strong style="color:var(--bleu-neon);">Konami Code mobile</strong> — Séquence de swipes tactiles permettant d'activer le Konami Code sur appareils mobiles.</li>
        </ul>
        <p style="font-size:0.9rem;color:var(--texte);">
          Ces fonctionnalités sont utilisées dans un cadre parodique et éducatif. Toute ressemblance avec des situations réelles relève du pur hasard (ou d'un Konami Code).
        </p>
      </div>

      <!-- Responsabilité -->
      <div class="card" style="padding:2rem;margin-bottom:1.5rem;">
        <h2 style="font-size:1.1rem;color:var(--bleu-neon);margin-bottom:1.25rem;font-family:var(--font-tech);letter-spacing:0.1em;">⚠️ LIMITATION DE RESPONSABILITÉ</h2>
        <p style="font-size:0.9rem;color:var(--texte);margin-bottom:1rem;">
          Les informations, contenus et données présents sur ce site sont fournis à titre pédagogique et peuvent être fictifs ou approximatifs. JoyStick FM ne saurait être tenu responsable de l'utilisation qui est faite de ces informations.
        </p>
        <p style="font-size:0.9rem;color:var(--texte);">
          Les easter eggs, personnages et références culturelles présents sur ce site sont utilisés dans un cadre parodique et éducatif. Toute ressemblance avec des situations réelles relève du pur hasard (ou d'un Konami Code).
        </p>
      </div>

      <div style="text-align:center;margin-bottom:2rem;">
        <a href="<?php echo home_url('/'); ?>" class="btn btn-ghost">← Retour à l'accueil</a>
      </div>
    </div>
  </section>
</main>
<?php get_footer(); ?>
