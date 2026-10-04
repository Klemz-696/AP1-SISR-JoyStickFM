<?php
/* Template Name: Page Blog */
// page-blog.php — JoyStick FM WordPress Theme
// Ce fichier est un template personnalisé pour la page du blog. Il affiche une liste d'articles avec un style unique, différent de la page d'accueil ou des autres pages statiques. Assurez-vous que cette page est assignée au template "Page Blog" dans l'éditeur WordPress pour que ce code soit utilisé.
get_header(); 
?>

<main id="main-content">
  <section style="padding:3rem 0 1rem;text-align:center;">
    <div class="container">
      <p class="pixel-label">📰 Journal Gaming</p>
      <h1 style="margin:0.75rem 0;">Le <span class="neon-text-blue">Blog</span> JoyStick FM</h1>
      <p style="color:var(--texte-dim);max-width:500px;margin:0 auto;">Articles, analyses, coups de cœur et mauvais avis sur l'industrie du jeu vidéo.</p>
    </div>
  </section>

  <section class="section" style="padding-top:2rem;">
    <div class="container">
      <div class="blog-grid stagger-children" id="blog-grid">

        <article class="card" style="grid-column:1 / -1;display:grid;grid-template-columns:1fr 1.2fr;gap:0;" id="featured-article" data-article="1">
          <div class="article-img" style="height:100%;min-height:220px;font-size:5rem;" aria-hidden="true">🌌</div>
          <div class="card-body" style="padding:2rem;">
            <div class="card-meta">
              <span class="card-tag tag-gaming">À LA UNE</span>
              <time datetime="2026-11-05" style="color:var(--texte-dim);font-size:0.8rem;">05 Nov 2026</time>
            </div>
            <h2 class="card-title" style="font-size:1.4rem;margin-bottom:0.75rem;">Les 10 OST de jeux vidéo qui ont changé notre rapport à la musique</h2>
            <p style="font-size:0.9rem;color:var(--texte-dim);margin-bottom:1.5rem;">De Halo 3 à Hollow Knight en passant par Journey, certaines bandes-son ont transcendé leur support pour devenir de vraies œuvres musicales.</p>
            <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
              <a href="#article-1" class="btn btn-primary btn-read">Lire l'article</a>
              <span style="color:var(--texte-dim);font-size:0.8rem;">⏱ 8 min de lecture</span>
            </div>
          </div>
        </article>

        <article class="card" data-article="2">
          <div class="article-img" aria-hidden="true">🏆</div>
          <div class="card-body">
            <div class="card-meta"><span class="card-tag tag-retro">Rétro</span><time datetime="2026-10-28">28 Oct 2026</time></div>
            <h3 class="card-title">Retour sur la NES : 40 ans de pixels et de joie</h3>
            <p style="font-size:0.85rem;color:var(--texte-dim);">En 1983, Nintendo lançait la Famicom au Japon et révolutionnait l'industrie.</p>
            <div style="display:flex;align-items:center;gap:1rem;margin-top:1rem;flex-wrap:wrap;">
              <a href="#article-2" class="btn btn-ghost btn-read" style="font-size:0.75rem;">Lire →</a>
              <span style="color:var(--texte-dim);font-size:0.75rem;">⏱ 5 min</span>
            </div>
          </div>
        </article>

        <article class="card" data-article="3">
          <div class="article-img" aria-hidden="true">⚡</div>
          <div class="card-body">
            <div class="card-meta"><span class="card-tag tag-debat">E-sport</span><time datetime="2026-10-15">15 Oct 2026</time></div>
            <h3 class="card-title">E-sport en 2026 : quand jouer devient un métier</h3>
            <p style="font-size:0.85rem;color:var(--texte-dim);">Salaires, entraînements, burn-out : tour d'horizon des réalités du jeu compétitif professionnel.</p>
            <div style="display:flex;align-items:center;gap:1rem;margin-top:1rem;flex-wrap:wrap;">
              <a href="#article-3" class="btn btn-ghost btn-read" style="font-size:0.75rem;">Lire →</a>
              <span style="color:var(--texte-dim);font-size:0.75rem;">⏱ 6 min</span>
            </div>
          </div>
        </article>

        <article class="card" data-article="4">
          <div class="article-img" aria-hidden="true">🎨</div>
          <div class="card-body">
            <div class="card-meta"><span class="card-tag tag-gaming">Art</span><time datetime="2026-10-05">05 Oct 2026</time></div>
            <h3 class="card-title">Le pixel art : d'une contrainte technique à un choix artistique</h3>
            <p style="font-size:0.85rem;color:var(--texte-dim);">Comment une limitation hardware des années 80 est devenue un style esthétique pleinement assumé.</p>
            <div style="display:flex;align-items:center;gap:1rem;margin-top:1rem;flex-wrap:wrap;">
              <a href="#article-4" class="btn btn-ghost btn-read" style="font-size:0.75rem;">Lire →</a>
              <span style="color:var(--texte-dim);font-size:0.75rem;">⏱ 7 min</span>
            </div>
          </div>
        </article>

        <article class="card" data-article="5">
          <div class="article-img" aria-hidden="true">😴</div>
          <div class="card-body">
            <div class="card-meta"><span class="card-tag tag-humour">Humour</span><time datetime="2026-09-22">22 Sep 2026</time></div>
            <h3 class="card-title">Les 7 types de joueurs que vous croisez dans tout MMO</h3>
            <p style="font-size:0.85rem;color:var(--texte-dim);">Le tryhard, le casual, l'AFK permanent, le toxic en herbe... Une étude de terrain approfondie.</p>
            <div style="display:flex;align-items:center;gap:1rem;margin-top:1rem;flex-wrap:wrap;">
              <a href="#article-5" class="btn btn-ghost btn-read" style="font-size:0.75rem;">Lire →</a>
              <span style="color:var(--texte-dim);font-size:0.75rem;">⏱ 4 min</span>
            </div>
          </div>
        </article>

        <article class="card" data-article="6">
          <div class="article-img" aria-hidden="true">🔮</div>
          <div class="card-body">
            <div class="card-meta"><span class="card-tag tag-theorie">Avenir</span><time datetime="2026-09-10">10 Sep 2026</time></div>
            <h3 class="card-title">Le jeu vidéo en 2034 : nos prédictions (absurdes)</h3>
            <p style="font-size:0.85rem;color:var(--texte-dim);">VR totale, abonnements, IA dans les NPCs... On se mouille avec des prédictions.</p>
            <div style="display:flex;align-items:center;gap:1rem;margin-top:1rem;flex-wrap:wrap;">
              <a href="#article-6" class="btn btn-ghost btn-read" style="font-size:0.75rem;">Lire →</a>
              <span style="color:var(--texte-dim);font-size:0.75rem;">⏱ 5 min</span>
            </div>
          </div>
        </article>

      </div>
      <p id="page-info" style="text-align:center;margin-top:0.75rem;color:var(--texte-dim);font-family:var(--font-pixel);font-size:0.9rem;">Page 1 / 1 — 6 articles</p>

      <div id="article-modal" style="display:none;margin-top:3rem;padding:2.5rem;background:var(--noir-card);border:1px solid var(--bleu-neon);border-radius:var(--radius-lg);animation:fadeIn 0.3s ease;">
        <button id="close-article-top" class="btn btn-ghost" style="margin-bottom:1.5rem;font-size:0.75rem;">← Retour aux articles</button>
        <div id="article-body"></div>
        <div style="text-align:center;margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid var(--noir-border);">
          <button id="close-article-bottom" class="btn btn-ghost" style="font-size:0.75rem;">← Retour aux articles</button>
        </div>
      </div>

    </div>
  </section>
</main>

<script>
<?php
// Chemin de base pour les images (WordPress)
$theme_uri = get_template_directory_uri();
?>
document.addEventListener('DOMContentLoaded', () => {
  const BASE = '<?php echo $theme_uri; ?>';

  const ARTICLES = {
    1: { 
      title: 'Les 10 OST de jeux vidéo qui ont changé notre rapport à la musique', 
      content: `
        <h2 style="margin-bottom:1rem;color:var(--bleu-neon);">De l'accompagnement à l'art majeur</h2>
        <p>Il fut un temps où la musique de jeu vidéo n'était qu'une suite de bips générés par des puces sonores limitées. Aujourd'hui, les bandes originales (OST) sont jouées par des orchestres symphoniques à guichets fermés, comme le célèbre "Video Games Live", et remportent des Grammy Awards. Retour sur 10 chefs-d'œuvre.</p>

        <br><h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">1. Hollow Knight (Christopher Larkin)</h3>
        <p>La bande-son de ce Metroidvania indépendant est un modèle de narration atmosphérique. Le thème de la "City of Tears" transmet instantanément le sentiment de solitude d'un royaume englouti.</p>
        <img src='${BASE}/assets/images/blog/ost/hollow-knight.png' alt='Hollow Knight - City of Tears'>
        <div style="margin: 0 auto 2rem; max-width: 550px; background: var(--noir-card); border: 1px solid var(--bleu-neon); border-radius: var(--radius); padding: 0.5rem;">
          <div class="player-track-name" style="width: 100%; border: none; margin-bottom: 0.5rem; text-align: center; color: var(--bleu-neon); font-family: var(--font-tech);">Hollow Knight — City of Tears</div>
          <iframe width="100%" height="110" src="https://www.youtube.com/embed/MJDn70jh1V0?controls=1&showinfo=0&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="border-radius: 4px;" allowfullscreen></iframe>
        </div>

        <br><h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">2. Journey (Austin Wintory)</h3>
        <p>C'est une date historique : "Journey" fut la première bande-son de jeu vidéo à être nominée aux Grammy Awards en 2013. Le morceau final, "Apotheosis", arrache encore des larmes aux joueurs.</p>
        <img src='${BASE}/assets/images/blog/ost/journey.jpg' alt='Journey - Austin Wintory'>
        <div style="margin: 0 auto 2rem; max-width: 550px; background: var(--noir-card); border: 1px solid var(--bleu-neon); border-radius: var(--radius); padding: 0.5rem;">
          <div class="player-track-name" style="width: 100%; border: none; margin-bottom: 0.5rem; text-align: center; color: var(--bleu-neon); font-family: var(--font-tech);">Journey — Apotheosis</div>
          <iframe width="100%" height="110" src="https://www.youtube.com/embed/ypNgvc6c6Cc?controls=1&showinfo=0&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="border-radius: 4px;" allowfullscreen></iframe>
        </div>

        <br><h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">3. DOOM Eternal (Mick Gordon)</h3>
        <p>Mick Gordon a inventé le genre "Argent Metal". En utilisant des synthétiseurs soviétiques brisés et des guitares accordées à l'extrême, il a créé un mur de son d'une brutalité inégalée.</p>
        <img src='${BASE}/assets/images/blog/ost/doom-eternal.jpg' alt='DOOM Eternal - Mick Gordon'>
        <div style="margin: 0 auto 2rem; max-width: 550px; background: var(--noir-card); border: 1px solid var(--bleu-neon); border-radius: var(--radius); padding: 0.5rem;">
          <div class="player-track-name" style="width: 100%; border: none; margin-bottom: 0.5rem; text-align: center; color: var(--bleu-neon); font-family: var(--font-tech);">DOOM Eternal — The Only Thing They Fear Is You</div>
          <iframe width="100%" height="110" src="https://www.youtube.com/embed/kpnW68Q8ltc?controls=1&showinfo=0&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="border-radius: 4px;" allowfullscreen></iframe>
        </div>

        <br><h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">4. Final Fantasy VII (Nobuo Uematsu)</h3>
        <p>La prouesse de FF7 sur PS1 fut de mélanger des thèmes orchestraux grandioses (le mythique "One-Winged Angel") et des mélodies de personnages intimes ("Aerith's Theme").</p>
        <img src='${BASE}/assets/images/blog/ost/final-fantasy-vii.jpeg' alt='Final Fantasy VII - Nobuo Uematsu'>
        <div style="margin: 0 auto 2rem; max-width: 550px; background: var(--noir-card); border: 1px solid var(--bleu-neon); border-radius: var(--radius); padding: 0.5rem;">
          <div class="player-track-name" style="width: 100%; border: none; margin-bottom: 0.5rem; text-align: center; color: var(--bleu-neon); font-family: var(--font-tech);">Final Fantasy VII — Aerith's Theme</div>
          <iframe width="100%" height="110" src="https://www.youtube.com/embed/kR8rk3K6qzo?controls=1&showinfo=0&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="border-radius: 4px;" allowfullscreen></iframe>
        </div>

        <br><h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">5. Nier: Automata (Keiichi Okabe)</h3>
        <p>Okabe a créé une langue imaginaire chantée par Emi Evans pour donner une sensation d'humanité perdue dans un monde de machines. Une merveille technique et émotionnelle.</p>
        <img src='${BASE}/assets/images/blog/ost/nier-automata.jpg' alt='Nier Automata - Keiichi Okabe'>
        <div style="margin: 0 auto 2rem; max-width: 550px; background: var(--noir-card); border: 1px solid var(--bleu-neon); border-radius: var(--radius); padding: 0.5rem;">
          <div class="player-track-name" style="width: 100%; border: none; margin-bottom: 0.5rem; text-align: center; color: var(--bleu-neon); font-family: var(--font-tech);">NieR: Automata — Weight of the World</div>
          <iframe width="100%" height="110" src="https://www.youtube.com/embed/f1-eY31Bw7A?controls=1&showinfo=0&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="border-radius: 4px;" allowfullscreen></iframe>
        </div>

        <br><h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">6. Celeste (Lena Raine)</h3>
        <p>Un jeu sur l'anxiété nécessitait une musique à la hauteur. Lena Raine utilise des synthétiseurs qui s'accélèrent pour simuler des crises de panique, avant de s'apaiser.</p>
        <img src='${BASE}/assets/images/blog/ost/celeste.jpg' alt='Celeste - Lena Raine'>
        <div style="margin: 0 auto 2rem; max-width: 550px; background: var(--noir-card); border: 1px solid var(--bleu-neon); border-radius: var(--radius); padding: 0.5rem;">
          <div class="player-track-name" style="width: 100%; border: none; margin-bottom: 0.5rem; text-align: center; color: var(--bleu-neon); font-family: var(--font-tech);">Celeste — Resurrections</div>
          <iframe width="100%" height="110" src="https://www.youtube.com/embed/1rwAvUvvQzQ?controls=1&showinfo=0&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="border-radius: 4px;" allowfullscreen></iframe>
        </div>

        <br><h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">7. The Legend of Zelda: Ocarina of Time (Koji Kondo)</h3>
        <p>Un cas unique où la musique <em>est</em> le jeu. Apprendre à jouer les mélodies sur l'ocarina virtuel a marqué une génération entière.</p>
        <img src='${BASE}/assets/images/blog/ost/legend-of-zelda-ocarina-of-time.jpeg' alt='Zelda Ocarina of Time - Koji Kondo'>
        <div style="margin: 0 auto 2rem; max-width: 550px; background: var(--noir-card); border: 1px solid var(--bleu-neon); border-radius: var(--radius); padding: 0.5rem;">
          <div class="player-track-name" style="width: 100%; border: none; margin-bottom: 0.5rem; text-align: center; color: var(--bleu-neon); font-family: var(--font-tech);">Zelda: OoT — Gerudo Valley</div>
          <iframe width="100%" height="110" src="https://www.youtube.com/embed/0hEYvdMoF2g?controls=1&showinfo=0&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="border-radius: 4px;" allowfullscreen></iframe>
        </div>

        <br><h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">8. Persona 5 (Shoji Meguro)</h3>
        <p>Acid jazz, funk, et J-pop. Persona 5 a prouvé qu'un jeu de rôle n'avait pas besoin de violons épiques pour être épique. "Last Surprise" est un banger absolu.</p>
        <img src='${BASE}/assets/images/blog/ost/persona-5.jpg' alt='Persona 5 - Shoji Meguro'>
        <div style="margin: 0 auto 2rem; max-width: 550px; background: var(--noir-card); border: 1px solid var(--bleu-neon); border-radius: var(--radius); padding: 0.5rem;">
          <div class="player-track-name" style="width: 100%; border: none; margin-bottom: 0.5rem; text-align: center; color: var(--bleu-neon); font-family: var(--font-tech);">Persona 5 — Last Surprise</div>
          <iframe width="100%" height="110" src="https://www.youtube.com/embed/ZNGqBDRJgvo?controls=1&showinfo=0&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="border-radius: 4px;" allowfullscreen></iframe>
        </div>

        <br><h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">9. Skyrim (Jeremy Soule)</h3>
        <p>L'album s'écoute comme on lit une saga d'heroic fantasy. Des chœurs vikings enregistrés à 30 voix puis superposés pour sonner comme une armée de 90 guerriers.</p>
        <img src='${BASE}/assets/images/blog/ost/skyrim.jpg' alt='Skyrim - Jeremy Soule'>
        <div style="margin: 0 auto 2rem; max-width: 550px; background: var(--noir-card); border: 1px solid var(--bleu-neon); border-radius: var(--radius); padding: 0.5rem;">
          <div class="player-track-name" style="width: 100%; border: none; margin-bottom: 0.5rem; text-align: center; color: var(--bleu-neon); font-family: var(--font-tech);">Skyrim — Dragonborn</div>
          <iframe width="100%" height="110" src="https://www.youtube.com/embed/813-3iL5OsE?controls=1&showinfo=0&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="border-radius: 4px;" allowfullscreen></iframe>
        </div>

        <br><h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">10. Undertale (Toby Fox)</h3>
        <p>Développeur et compositeur, Toby Fox a utilisé les "leitmotivs" avec une maestria digne de Wagner. Des mélodies simples en 8-bit qui évoluent en compositions orchestrales poignantes.</p>
        <img src='${BASE}/assets/images/blog/ost/undertale.jpeg' alt='Undertale - Toby Fox'>
        <p>Il y a tellement de banger que l'on ne peut pas tous les lister ici. "Megalovania", "Spear of Justice", "Spider Dance", "Asgore", et "Hopes and Dreams" sont autant de morceaux qui ont marqué les joueurs.</p>
        <p>Alors on vous a fait une petite sélection des morceaux les plus emblématiques de l'album :</p>
        
        <div style="margin: 0 auto 2rem; max-width: 550px; background: var(--noir-card); border: 1px solid var(--bleu-neon); border-radius: var(--radius); padding: 0.5rem;">
          <div class="player-track-name" style="width: 100%; border: none; margin-bottom: 0.5rem; text-align: center; color: var(--bleu-neon); font-family: var(--font-tech);">Undertale — Megalovania</div>
          <iframe width="100%" height="110" src="https://www.youtube.com/embed/KK3KXAECte4?controls=1&showinfo=0&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="border-radius: 4px;" allowfullscreen></iframe>
        </div>
        
        <div style="margin: 0 auto 2rem; max-width: 550px; background: var(--noir-card); border: 1px solid var(--bleu-neon); border-radius: var(--radius); padding: 0.5rem;">
          <div class="player-track-name" style="width: 100%; border: none; margin-bottom: 0.5rem; text-align: center; color: var(--bleu-neon); font-family: var(--font-tech);">Undertale — Spear of Justice</div>
          <iframe width="100%" height="315" src="https://www.youtube.com/embed/XGzYhJcm-Jw?rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="border-radius: 4px;" allowfullscreen></iframe>
        </div>
        
        <div style="margin: 0 auto 2rem; max-width: 550px; background: var(--noir-card); border: 1px solid var(--bleu-neon); border-radius: var(--radius); padding: 0.5rem;">
          <div class="player-track-name" style="width: 100%; border: none; margin-bottom: 0.5rem; text-align: center; color: var(--bleu-neon); font-family: var(--font-tech);">Undertale — Spider Dance</div>
          <iframe width="100%" height="315" src="https://www.youtube.com/embed/5qZqqUgb1Rw?rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="border-radius: 4px;" allowfullscreen></iframe>
        </div>
        
        <div style="margin: 0 auto 2rem; max-width: 550px; background: var(--noir-card); border: 1px solid var(--bleu-neon); border-radius: var(--radius); padding: 0.5rem;">
          <div class="player-track-name" style="width: 100%; border: none; margin-bottom: 0.5rem; text-align: center; color: var(--bleu-neon); font-family: var(--font-tech);">Undertale — Asgore</div>
          <iframe width="100%" height="315" src="https://www.youtube.com/embed/42kI2lT0x6U?rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="border-radius: 4px;" allowfullscreen></iframe>
        </div>
        
        <div style="margin: 0 auto 2rem; max-width: 550px; background: var(--noir-card); border: 1px solid var(--bleu-neon); border-radius: var(--radius); padding: 0.5rem;">
          <div class="player-track-name" style="width: 100%; border: none; margin-bottom: 0.5rem; text-align: center; color: var(--bleu-neon); font-family: var(--font-tech);">Undertale — Hopes And Dreams</div>
          <iframe width="100%" height="315" src="https://www.youtube.com/embed/wbO3p7_Mf30?rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="border-radius: 4px;" allowfullscreen></iframe>
        </div>
        
        <div style="margin: 0 auto 2rem; max-width: 550px; background: var(--noir-card); border: 1px solid var(--bleu-neon); border-radius: var(--radius); padding: 0.5rem;">
          <div class="player-track-name" style="width: 100%; border: none; margin-bottom: 0.5rem; text-align: center; color: var(--bleu-neon); font-family: var(--font-tech);">Undertale — Last Goodbye</div>
          <iframe width="100%" height="315" src="https://www.youtube.com/embed/oiaO05_ImsA?rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="border-radius: 4px;" allowfullscreen></iframe>
        </div>
        
        <div style="margin: 0 auto 2rem; max-width: 550px; background: var(--noir-card); border: 1px solid var(--bleu-neon); border-radius: var(--radius); padding: 0.5rem;">
          <div class="player-track-name" style="width: 100%; border: none; margin-bottom: 0.5rem; text-align: center; color: var(--bleu-neon); font-family: var(--font-tech);">Undertale — Battle Against A True Hero</div>
          <iframe width="100%" height="315" src="https://www.youtube.com/embed/xV4pZgTe94E?rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" style="border-radius: 4px;" allowfullscreen></iframe>
        </div>

        <br><p style="margin-top:2rem;font-style:italic;text-align:center;">Et vous, quelle OST manque à ce classement ?<br>Venez en débattre en live sur JoyStick FM !</p>
      ` 
    },
    2: { 
      title: 'Retour sur la NES : 40 ans de pixels et de joie', 
      content: `
        <h2 style="margin-bottom:1rem;color:var(--bleu-neon);">1983 : Le grand crash de l'industrie</h2>
        <p>Le saviez-vous ? En 1983, l'industrie du jeu vidéo nord-américaine s'effondre de manière spectaculaire. Les ventes chutent de 3 milliards de dollars à moins de 100 millions en moins de deux ans. Le marché est inondé de jeux bâclés — le tristement célèbre <em>E.T. the Extra-Terrestrial</em> sur Atari 2600 en est le symbole : sorti en six semaines pour coïncider avec les fêtes de Noël, il fut si mauvais qu'Atari enterra des millions de cartouches invendues dans le désert du Nouveau-Mexique.</p>
        <p>Les médias américains proclament la mort du jeu vidéo. Les chaînes de grande distribution retirent les rayons jeux. Et pourtant, à 10 000 kilomètres de là, une entreprise japonaise est sur le point de tout changer.</p>
        
        <br><h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">La naissance de la Famicom (juillet 1983)</h3>
        <p>Le 15 juillet 1983, Nintendo lance sa <strong>Family Computer</strong> (Famicom) au Japon au prix de 14 800 yens. Les premières cartouches (Donkey Kong, Popeye, Mario Bros.) rappellent les succès des bornes d'arcade. En 1984, la Famicom domine le marché japonais avec plus de 2,5 millions d'unités vendues.</p>
        <img src='${BASE}/assets/images/blog/nintendo/famicom.png' alt='Nintendo Famicom'>
        
        <br><h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">La conquête de l'Amérique (1985)</h3>
        <p>Pour pénétrer un marché américain traumatisé, Nintendo usa d'une ruse marketing géniale : la NES fut présentée non pas comme une console de jeux vidéo, mais comme un <em>système de divertissement</em>. Vendue avec le <strong>Zapper</strong> et <strong>R.O.B.</strong>, la NES ressemblait à un appareil électronique parmi d'autres. Le résultat : l'industrie du jeu vidéo nord-américaine renaît littéralement de ses cendres.</p>
        <img src='${BASE}/assets/images/blog/nintendo/nes.png' alt='Nintendo NES'>
        
        <br><h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">40 ans plus tard : un héritage intact</h3>
        <p>En 2023, Nintendo célébrait les 40 ans de la Famicom. La NES Classic Mini (2016) s'est arrachée à plus de 2,3 millions d'exemplaires en quelques semaines. Speedrunners, chiptune musicians, développeurs indépendants... tous puisent encore leur inspiration dans ce boîtier gris et rouge.</p>
        <img src='${BASE}/assets/images/blog/nintendo/nes-mini-classic.png' alt='Nintendo NES Mini Classic'>
        
        <br><p style="margin-top:1.5rem;font-style:italic;color:var(--texte-dim);">Quel est votre jeu NES préféré ? Venez en débattre sur le Discord de la radio !</p>
      `
    },
    3: { 
      title: 'E-sport en 2026 : quand jouer devient un métier', 
      content: `
        <h2 style="margin-bottom:1rem;color:var(--bleu-neon);">Un milliard de spectateurs, des stades pleins</h2>
        <p>En 2026, l'industrie génère plus de 2 milliards de dollars de revenus annuels, remplit des stades de 60 000 places, et la finale du championnat mondial de League of Legends est regardée par plus d'auditeurs que la finale de la NBA. Les joueurs professionnels sont des athlètes reconnus dans de nombreux pays.</p>
        <h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">Salaires : du SMIC aux millions</h3>
        <p>La réalité salariale de l'e-sport est une pyramide très étroite. Un joueur en Ligue Académique gagne entre 1 500 et 3 000 euros par mois. Un joueur en LEC (League of Legends EMEA Championship) touche entre 10 000 et 50 000 euros mensuels. Et les stars mondiales comme Faker ont des contrats estimés à plusieurs millions d'euros par an.</p>
        <img src='${BASE}/assets/images/blog/e-sport/joueur-0.png' alt='Joueur e-sport professionnel #1'>
        <h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">La réalité de l'entraînement</h3>
        <p>Un joueur pro s'entraîne en moyenne <strong>10 à 12 heures par jour</strong> : scrims, analyse vidéo, sport physique obligatoire pour prévenir les TMS, séances de nutrition, et suivi psychologique. Exactement comme un footballeur professionnel.</p>
        <img src='${BASE}/assets/images/blog/e-sport/joueur-1.png' alt='Joueur e-sport professionnel #2'>
        <p style="margin-top:1.5rem;font-style:italic;color:var(--texte-dim);">L'e-sport est-il un vrai sport ? Venez-en parler avec le crew de JoyStick FM !</p>
      `
    },
    4: { 
      title: "Le pixel art : d'une contrainte technique à un choix artistique", 
      content: `
        <h2 style="margin-bottom:1rem;color:var(--bleu-neon);">Faire plus avec moins : la nécessité des origines</h2>
        <p>Dans les années 80 et 90, le pixel art n'était pas un style : c'était une <strong>nécessité absolue</strong>. Les développeurs devaient faire rentrer des univers entiers dans des cartouches de quelques kilo-octets. La NES ne pouvait afficher que 52 couleurs simultanées, avec des sprites limités à 8×8 ou 16×16 pixels. Sur Commodore 64, certains graphistes réalisaient des portraits expressifs avec 16 couleurs fixes et une résolution de 160x200 pixels. Chaque pixel comptait, littéralement.</p>

        <h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">Les contraintes techniques qui ont façonné l'esthétique</h3>
        <p>Comprendre le pixel art, c'est comprendre les contraintes hardware qui l'ont engendré. Les programmeurs de l'époque avaient développé des techniques ingénieuses pour contourner les limitations :</p>
        <ul style="margin-left:1.5rem;color:var(--texte);line-height:2.2;">
          <li><strong style="color:var(--bleu-neon);">Le dithering</strong> — Alterner deux couleurs en damier pour simuler une troisième teinte. Utilisé massivement sur GameBoy, dont la palette ne comptait que 4 nuances de vert.</li>
          <li><strong style="color:var(--bleu-neon);">L'antialiasing manuel</strong> — Placer manuellement des pixels intermédiaires sur les contours pour adoucir les "escaliers" (jaggies).</li>
          <li><strong style="color:var(--bleu-neon);">L'animation économique</strong> — Bouger 3 ou 4 frames pour simuler une animation fluide (le walk cycle de Mario Bros. ne compte que 3 frames).</li>
          <li><strong style="color:var(--bleu-neon);">Les palettes de couleurs partagées</strong> — Sur NES, chaque tuile de 8x8 pixels ne pouvait utiliser que 4 couleurs d'une sous-palette. Les graphistes organisaient leur niveau entier autour de cette contrainte.</li>
        </ul>
        <img src='${BASE}/assets/images/blog/pixel-art/contraintes.png' alt='Contraintes techniques du pixel art'>

        <br><h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">L'imagination au pouvoir</h3>
        <p>Le pixel art fonctionne comme l'impressionnisme. Il ne montre pas les détails, il les <em>suggère</em>. Un sprite de 16x16 pixels représentant un héros demande au cerveau du joueur de faire la moitié du travail pour "compléter" l'image — exactement comme notre cerveau perçoit un visage dans une tache de café. Cette complétion cognitive crée une <strong>implication émotionnelle plus forte</strong> qu'un modèle 3D hyperréaliste où tout est donné clé en main.</p>
        <p>C'est le paradoxe fascinant du pixel art : en montrant moins, il évoque davantage.</p>
        <img src='${BASE}/assets/images/blog/pixel-art/imagination.png' alt='L\'imagination au pouvoir du pixel art'>

        <br><h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">Le renouveau indépendant : un choix esthétique revendiqué</h3>
        <p>Aujourd'hui, alors que l'Unreal Engine 5 permet de créer des environnements photoréalistes en 4K avec du ray-tracing en temps réel, pourquoi la scène indépendante continue-t-elle de plébisciter le pixel art ? La réponse tient en trois raisons :</p>
        <ol style="margin-left:1.5rem;color:var(--texte);line-height:2.2;">
          <li><strong style="color:var(--bleu-neon);">La nostalgie consciente</strong> — Pour les joueurs de 25-40 ans, le pixel art <em>est</em> le jeu vidéo. Stardew Valley (Eric Barone, développé seul) a vendu plus de 20 millions d'exemplaires précisément parce que son esthétique SNES déclenche une madeleine de Proust chez toute une génération.</li>
          <li><strong style="color:var(--bleu-neon);">L'accessibilité de création</strong> — Un développeur solo peut maîtriser le pixel art avec des outils comme <strong>Aseprite</strong>, <strong>Piskel</strong> ou même GraphicsGale. Créer un sprite 32x32 de qualité demande des heures, pas des années d'apprentissage de la 3D.</li>
          <li><strong style="color:var(--bleu-neon);">Une identité visuelle forte</strong> — Dans un marché saturé de jeux hyperréalistes, le pixel art se distingue immédiatement. Dead Cells, Celeste, Undertale, Shovel Knight, Blasphemous — ces titres sont reconnaissables en un coup d'œil.</li>
        </ol>
        <img src='${BASE}/assets/images/blog/pixel-art/independant.jpg' alt='Le pixel art dans les jeux indépendants'>

        <br><h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">Les outils du pixel artiste moderne</h3>
        <p><strong>Aseprite</strong> est devenu la référence absolue : gestion des animations frame par frame, palettes customisables, onion-skinning (voir les frames précédentes en transparence), export automatique des spritesheets. Disponible à moins de 20€, son code source est même open-source. Pour les débutants, <strong>Piskel</strong> (gratuit, en ligne) permet de se lancer sans installation. Et pour les puristes qui veulent recréer les contraintes NES exactes, des outils comme <strong>NES Screen Tool</strong> forcent le respect des limitations hardware d'origine.</p>
        <img src='${BASE}/assets/images/blog/pixel-art/outils.jpg' alt='Outils de création de pixel art'>
        <br><p style="margin-top:1.5rem;font-style:italic;color:var(--texte-dim);">Vous faites du pixel art ? Envoyer vos créations aux crew !</p>
      `
    },
    5: { 
      title: 'Les 7 types de joueurs que vous croisez dans tout MMO', 
      content: `
        <h2 style="margin-bottom:1rem;color:var(--bleu-neon);">Sociologie d'Azeroth — guide de terrain</h2>
        <p>Que vous jouiez à World of Warcraft, Final Fantasy XIV, Guild Wars 2 ou Elder Scrolls Online, vous avez inévitablement croisé ces sept archétypes humains. Plus de vingt ans de MMORPGs nous ont permis d'établir cette taxonomie exhaustive. Petit guide de survie en milieu multijoueur hostile :</p>
        
        <ol style="margin-left:1.5rem;line-height:1.4;">
          <br><li style="margin-bottom:1.25rem;">
            <strong style="color:var(--bleu-neon);font-size:1rem;">Le Tryhardeur Toxique</strong>
            <p style="color:var(--texte);margin-top:0.4rem;">Il connaît les pourcentages de dégâts (DPS) au dixième près, récite le BiS (Best in Slot) de chaque classe de mémoire et a lu les logs de combat de tout votre groupe avant même que vous ayez chargé l'instance. Ses phrases fétiches : "T'as pas les prérequis pour cette raid", "Sérieusement, 2.4k de DPS en 2026 ?" et le classique "Je refais avec des vrais joueurs". Il rage-quit dès le second wipe. À éviter à tout prix dans les groupes pick-up.</p>
          </li>
          <img src='${BASE}/assets/images/blog/types-joueur/toxic.png' alt='Le Tryhardeur Toxique'>

          <br><li style="margin-bottom:1.25rem;">
            <strong style="color:var(--bleu-neon);font-size:1rem;">Le Fantôme Éternel (AFK)</strong>
            <p style="color:var(--texte);margin-top:0.4rem;">"Je reviens, je vais chercher de l'eau". Il n'est jamais revenu. Sa légende raconte qu'il erre encore quelque part entre le réfrigérateur et le couloir. On le reconnaît à son personnage qui marche en ligne droite contre un mur depuis 20 minutes, ou à son icône AFK qui clignote dans le menu de groupe. Son afk n'a jamais de cause réelle — la vraie raison, c'est probablement un épisode de série Netflix.</p>
          </li>
          <img src='${BASE}/assets/images/blog/types-joueur/afk.png' alt='Le Fantôme Éternel (AFK)'>

          <br><li style="margin-bottom:1.25rem;">
            <strong style="color:var(--bleu-neon);font-size:1rem;">Le PNJ Vivant (RP Player)</strong>
            <p style="color:var(--texte);margin-top:0.4rem;">Il ne joue pas un personnage, il <em>est</em> son personnage. Il marche au lieu de courir (la touche Shift, il ne connaît pas), s'assoit sur les chaises des tavernes virtuelles pendant des heures, et refuse catégoriquement de parler en dehors du roleplay de son personnage. Si vous lui demandez "C'est quoi la rotation DPS du Paladin ?", il vous répondra : "Sire, je suis un Paladin de la Lumière sacrée, non point un mercenaire calculateur." Fascinant, parfois agaçant, toujours attachant.</p>
          </li>
          <img src='${BASE}/assets/images/blog/types-joueur/rp.png' alt='Le PNJ Vivant (RP Player)'>

          <br><li style="margin-bottom:1.25rem;">
            <strong style="color:var(--bleu-neon);font-size:1rem;">Le Magnat de l'Hôtel des Ventes</strong>
            <p style="color:var(--texte);margin-top:0.4rem;">Il ne se bat jamais. Il n'a peut-être même jamais atteint le niveau maximum. Son seul terrain de jeu, c'est l'Hôtel des Ventes (ou Auction House selon les jeux). Il achète les matériaux de craft au prix bas le matin, les revend transformés en soirée. Il spécule sur les nouvelles extensions, anticipe les patches qui augmentent la demande de certains objets, et possède probablement plus d'or que la banque centrale du serveur. Si vous lui parlez, il vous donnera des conseils financiers qui valent pour le vrai monde aussi.</p>
          </li>
          <img src='${BASE}/assets/images/blog/types-joueur/magnat.png' alt='Le Magnat de l\'Hôtel des Ventes'>

          <br><li style="margin-bottom:1.25rem;">
            <strong style="color:var(--bleu-neon);font-size:1rem;">Le Wikinaute (Meta Slave)</strong>
            <p style="color:var(--texte);margin-top:0.4rem;">Avant même que le jeu soit sorti, il a lu les 47 pages du wiki non-officiel, calculé le build optimal sur trois feuilles de calcul et regardé les streams des bêta-testeurs coréens. Il connaît chaque donjon par cœur avant d'y mettre les pieds. D'un côté, c'est pratique dans un groupe (il vous guide). De l'autre, il gâche un peu la magie de la découverte. Sa phrase fétiche : "Attends, le boss drop le set légendaire uniquement le mardi entre 18h et 20h si Jupiter est en opposition avec Mars."</p>
          </li>
          <img src='${BASE}/assets/images/blog/types-joueur/wiki.png' alt='Le Wikinaute (Meta Slave)'>

          <br><li style="margin-bottom:1.25rem;">
            <strong style="color:var(--bleu-neon);font-size:1rem;">Le Social Butterfly</strong>
            <p style="color:var(--texte);margin-top:0.4rem;">Pour lui, le contenu est un prétexte. Ce qui compte vraiment, c'est la guilde, le Discord vocal, les soirées à refaire le monde en tuant des monstres. Il est en ligne 6 heures par jour mais en combat réel peut-être 20 minutes. Il organise les anniversaires virtuels des membres de la guilde, les "mariages" entre personnages (oui, ça existe), et les randonnées en zone neutre juste pour le roleplay. Il connaît la vraie vie de chaque guildmate et est souvent le cœur émotionnel qui maintient la communauté soudée.</p>
          </li>
          <img src='${BASE}/assets/images/blog/types-joueur/social.png' alt='Le Social Butterfly'>

          <br><li style="margin-bottom:1.25rem;">
            <strong style="color:var(--bleu-neon);font-size:1rem;">Le Chasseur de PvP (Ganker)</strong>
            <p style="color:var(--texte);margin-top:0.4rem;">La seule chose qui l'intéresse, c'est tuer d'autres joueurs. La quête principale ? Connais pas. Les donjons PvE ? Une perte de temps. Son terrain de chasse : les zones PvP ouvertes, les arènes, les battlegrounds. Dans les vieux MMOs à PvP libre, il attendait patiemment en zone de départ les nouveaux joueurs niveau 1 pour les massacrer en deux coups — pratique connue sous le nom de "ganking". Haï par les uns, adulé par les autres, il est le rappel permanent que dans un monde virtuel partagé, tout le monde n'a pas les mêmes intentions.</p>
          </li>
          <img src='${BASE}/assets/images/blog/types-joueur/chasseur.png' alt='Le Chasseur de PvP (Ganker)'>

        </ol>
        <br><p style="margin-top:1.5rem;font-style:italic;color:var(--texte-dim);">Vous vous reconnaissez dans l'un de ces profils ? <br> Venez-en parler avec le crew sur la radio Joystick-FM !</p>
      `
    },
    6: { 
      title: 'Le jeu vidéo en 2034 : nos prédictions (absurdes)', 
      content: `
        <h2 style="margin-bottom:1rem;color:var(--bleu-neon);">Boule de cristal activée — 8 ans d'avance</h2>
        <p>Puisque le marché change à une vitesse folle, l'équipe de JoyStick FM a sorti sa boule de cristal pour des prédictions sur le gaming en 2034. Disclaimer : aucune responsabilité si ces prévisions se révèlent exactes. Ou inexactes. Bref, aucune responsabilité.</p>
        
        <br><h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">1. GTA VI sortira enfin sur PC</h3>
        <p>Blague à part, la durée de développement des jeux "Quadruple A" va devenir <strong>proprement insoutenable</strong>. Des jeux comme Elder Scrolls 6 (annoncé en 2018, toujours pas sorti en 2026) ou The Witcher 4 prendront tellement de temps que les studios ne sortiront plus qu'un seul titre par décennie. Les budgets dépasseront le milliard de dollars pour les productions les plus ambitieuses. Et ironiquement, un RPG indépendant à 20€ fait en pixel art par trois personnes dans un garage sera probablement meilleur.</p>
        <img src='${BASE}/assets/images/blog/futur/blague.png' alt='Blague GTA VI'>

        <br><h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">2. L'IA générative dans les PNJ</h3>
        <p>Les arbres de dialogues prédéfinis vont disparaître. En 2034, vous pourrez parler librement à un aubergiste dans Skyrim 12, et l'IA du jeu générera en temps réel une réponse cohérente avec le lore, l'histoire personnelle du PNJ, et vos 40 dernières heures de jeu. Certains prototypes existent déjà en 2026 (Inworld AI, convAI). Ce sera la norme en 2034. La conséquence inattendue : les gens vont tomber amoureux de leurs PNJs. Des thèses de psychologie seront rédigées là-dessus.</p>
        <img src='${BASE}/assets/images/blog/futur/ia-pnj.png' alt='IA générative dans les PNJ'>

        <br><h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">3. L'abonnement gaming va dégénérer</h3>
        <p>En 2026, nous avons déjà : Xbox Game Pass, PlayStation Plus, Nintendo Switch Online, EA Play, Ubisoft+, Apple Arcade, Netflix Games... En 2034, il y en aura 47. Pour jouer à tous les jeux auxquels vous voulez jouer, il faudra débourser 200€ par mois en abonnements combinés. Une plateforme nommée "The All-Pass" promettra de tout agréger pour 49,99€/mois et ne tiendra évidemment pas sa promesse. La résistance s'organisera : les vieux forums de téléchargement illégal des années 2000 connaîtront un âge d'or inattendu.</p>
        <img src='${BASE}/assets/images/blog/futur/abonnement.png' alt='Abonnements gaming'>

        <br><h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">4. La console unique via le Cloud</h3>
        <p>La fin de la guerre des consoles approche. En 2034, Xbox, PlayStation et Nintendo seront vraisemblablement devenus de simples <strong>marques de services</strong> plutôt que des fabricants de hardware. Plus besoin de boîte à 500€ sous la TV : une simple application sur votre Smart TV, un abonnement Cloud Gaming, et une manette universelle bluetooth. Les latences seront enfin acceptables pour 99% des joueurs. Seuls les 1% de compétiteurs en FPS continueront à réclamer le hardware local.</p>
        <img src='${BASE}/assets/images/blog/futur/cloud.png' alt='Console unique via le Cloud'>

        <br><h3 style="margin:1.5rem 0 0.75rem;color:var(--bleu-neon);">5. Le grand retour du rétro-gaming</h3>
        <p>Paradoxalement, plus la technologie avance, plus la nostalgie se renforce. En 2034, les jeux NES, SNES et PS1 auront entre 40 et 50 ans. Des galeries d'art contemporain exposeront des "pixel art originaux" sous verre comme des tableaux de maître. Des cartouches NES en parfait état se négocieront à des prix d'œuvres d'art aux enchères. Et quelque part, un développeur indépendant sortira un chef-d'œuvre qui tourne sur un processeur équivalent à une GameBoy... et ce sera le jeu de l'année.</p>
        <img src='${BASE}/assets/images/blog/futur/retro.png' alt='Rétro-gaming'>
        <br><p style="margin-top:1.5rem;font-style:italic;color:var(--texte-dim);">Quelle est votre prédiction gaming pour 2034 ? Le crew attend avec impatience votre théories sur la radio Joystick-FM !</p>
      `
    }
  };

  const modal      = document.getElementById('article-modal');
  const body       = document.getElementById('article-body');
  const closeTop   = document.getElementById('close-article-top');
  const closeBot   = document.getElementById('close-article-bottom');
  const grid       = document.getElementById('blog-grid');

  document.querySelectorAll('.btn-read').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const card = btn.closest('[data-article]');
      const id   = card ? parseInt(card.dataset.article) : 1;
      const art  = ARTICLES[id] || ARTICLES[1];
      body.innerHTML = art.content;
      modal.style.display = 'block';
      modal.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  function closeArticle() {
    modal.style.display = 'none';
    grid.scrollIntoView({ behavior: 'smooth' });
    /* Stoppe les vidéos YouTube à la fermeture de l'article */
    body.innerHTML = ''; 
  }

  closeTop?.addEventListener('click', closeArticle);
  closeBot?.addEventListener('click', closeArticle);
});
</script>

<?php get_footer(); ?>