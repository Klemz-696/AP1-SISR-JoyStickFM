/* ============================================================
   JOYSTICK FM — easter-eggs.js  v8.9
   Sélecteurs corrigés · XP Bar v2 · 18 Easter Eggs
   NOUVEAUTÉS v8.9 :
     - Impossible de déclencher 2 pop-ups easter egg en même temps.
       Un flag global _EGG_MODAL_OPEN bloque l'ouverture d'un
       second modal si un est déjà visible.
     - Si l'egg final (18/18) se déclenche alors qu'un autre modal
       est ouvert (cas typique : l'utilisateur trouve le 18ème egg
       et sa pop-up s'affiche, puis le final voudrait s'ouvrir),
       le final est mis en file d'attente (_pendingFinalEgg = true)
       et se lance automatiquement dès la fermeture du modal en cours.
     - _modal() et l'egg 13 (WEEEE, qui gère son propre show/hide)
       utilisent tous les deux ce système de verrou.
   NOUVEAUTÉS v8.8 :
     - Fermeture des pop-ups easter egg UNIQUEMENT via le bouton
       [ FERMER ] ou la touche Échap. Le clic sur le fond sombre
       (backdrop) ne ferme plus le modal.
     - _modal() centralise désormais 100% de la logique de
       fermeture (bouton + Échap). Les eggs individuels n'ont
       plus besoin d'attacher leurs propres listeners de fermeture.
     - Suppression de tous les modal.addEventListener('click', ...)
       qui permettaient la fermeture au clic en dehors du contenu.
   NOUVEAUTÉS v8.7 (CORRECTIFS iOS/MOBILE) :
     - _playAudioIOS() : nouvelle fonction audio pour iOS.
       Utilise fetch + AudioContext.decodeAudioData() pour
       contourner le blocage autoplay de Safari Mobile.
       Le touchend qui déclenche l'egg est un geste valide,
       donc l'AudioContext est autorisé.
     - Egg 12 (Affiche) : remplace _playAudio() par
       _playAudioIOS() pour que le son fonctionne sur iPhone.
     - Egg 13 (WEEEE) : le slider de volume dans la pop-up
       est maintenant patché avec des touch events manuels
       (touchstart/touchmove) pour iOS, où les events "input"
       sur <input type="range"> ne déclenchent pas de son.
   NOUVEAUTÉS v8.6 :
     - Bouton footer « 🏆 REVOIR LA VICTOIRE »
     - Egg 13 WEEEE : barre de volume dans la pop-up

   ╔══════════════════════════════════════════════════════════╗
   ║           GUIDE D'ACTIVATION DES EASTER EGGS             ║
   ╠══════════════════════════════════════════════════════════╣
   ║  1. 🎮 Konami Code  → Clavier : ↑↑↓↓←→←→BA             ║
   ║     (Mobile : 8 swipes directionnels + 2 taps rapides)  ║
   ║  2. 🎵 Rickroll     → 5× clic sur "JoyStick FM"         ║
   ║  3. 🌈 Nyan Cat     → 3× clic rapide sur un horaire     ║
   ║  4. 🍄 Mario 1-UP   → 5× clic sur un titre d'émission   ║
   ║  5. 💀 DOOM IDDQD   → 5× clic sur l'icône 🎮 du logo    ║
   ║  6. 🔥 Hadouken     → 3× clic dans une colonne footer    ║
   ║  7. ⚡ Pokémon      → 4× clic sur la vignette podcast   ║
   ║  8. 🔴 FNAF Honk    → 1× clic sur le © dans le footer   ║
   ║  9. 🗡️  Zelda       → Double-clic sur les crédits footer ║
   ║  10.💨 Sonic        → Survol 1,5s sur un lien nav        ║
   ║  11.🍔 TK Burger    → 15× clic sur le bouton Play radio  ║
   ║  12.🖼️  Affiche      → Maintien clic 5s sur l'affiche    ║
   ║  13.🔊 WEEEE        → 5× clic sur le bouton haut-parleur ║
   ║  14.🔢 67           → 1× clic sur "v6.7" (écran boot)   ║
   ║  15.⚡ Klemz        → 1× clic sur "Klemz" (boot)        ║
   ║  16.🥩 Steakman63   → 1× clic sur "Steakman63" (boot)   ║
   ║  17.🐧 Pingouy      → 1× clic sur "Pingouy" (boot)      ║
   ║  18.🍮 Krem Brûlé   → 1× clic sur "Krem Brûlé" (boot)  ║
   ╚══════════════════════════════════════════════════════════╝
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────────────────
   VERROU GLOBAL — un seul modal easter egg à la fois
   _EGG_MODAL_OPEN  : true quand un modal est actuellement visible.
   _pendingFinalEgg : true si le final (18/18) est en attente
                      d'ouverture (un autre modal était déjà ouvert
                      quand les 18 eggs ont été complétés).
   ────────────────────────────────────────────────────────── */
let _EGG_MODAL_OPEN  = false;
let _pendingFinalEgg = false;

/* ──────────────────────────────────────────────────────────
   SYSTÈME DE SUIVI — XP BAR
   ────────────────────────────────────────────────────────── */
const EGG_TRACKER = (function () {
  const KEY   = 'jfm_eggs_found';
  const TOTAL = 18;

  const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) || []; } catch(e) { return []; } };
  const save = a  => { try { sessionStorage.setItem(KEY, JSON.stringify(a)); } catch(e) {} };

  function markFound(id) {
    const found = load();
    if (found.includes(id)) return false;
    found.push(id);
    save(found);
    _updateBar(found.length);
    return true;
  }

  function _updateBar(count) {
    const pct = Math.round((count / TOTAL) * 100);
    document.querySelectorAll('.egg-xp-fill').forEach(bar => {
      bar.style.width = pct + '%';
      bar.classList.remove('xp-flash');
      void bar.offsetWidth;
      bar.classList.add('xp-flash');
      if (count === TOTAL) bar.classList.add('max-level');
    });
    document.querySelectorAll('.egg-xp-count').forEach(el => el.textContent = count);
    document.querySelectorAll('.egg-xp-pct').forEach(el  => el.textContent = pct + '%');
    if (count === TOTAL) {
      if (_EGG_MODAL_OPEN) {
        /* Un modal est déjà ouvert (l egg qui vient d etre trouve est affiche) :
           on met le final en file d attente - il se lancera a la fermeture. */
        _pendingFinalEgg = true;
      } else {
        setTimeout(_triggerFinalEgg, 700);
      }
    }
  }

  /* ══════════════════════════════════════════════════════════
     POP-UP FINALE — 18/18 eggs trouvés
     ══════════════════════════════════════════════════════════ */
  function _triggerFinalEgg(isReplay) {
    /* v8.9 — ne pas ouvrir si un autre modal est déjà visible */
    if (_EGG_MODAL_OPEN && !isReplay) {
      _pendingFinalEgg = true;
      return;
    }
    const modal = document.getElementById('easter-egg-modal');
    const body  = document.getElementById('easter-egg-content');
    if (!modal) return;

    const videoSrc = (window.THEME_URI || '') + '/assets/video/final.mp4';

    if (!document.getElementById('jfm-final-modal-style')) {
      const st = document.createElement('style');
      st.id = 'jfm-final-modal-style';
      st.textContent = `
        #easter-egg-modal.show .egg-content {
          max-width: 1280px !important;
          width: 97vw !important;
          padding: 2rem 2.25rem !important;
        }
        #jfm-final-outer {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 2.25rem;
          width: 100%;
        }
        #jfm-final-vid-col {
          flex: 0 0 58%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.1rem;
        }
        #jfm-final-txt-col {
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
          max-height: 74vh;
          padding-right: .4rem;
        }
        #jfm-final-txt-col::-webkit-scrollbar { width: 4px; }
        #jfm-final-txt-col::-webkit-scrollbar-thumb { background: rgba(0,195,255,.4); border-radius: 2px; }
        @media (max-width: 680px) {
          #easter-egg-modal.show .egg-content {
            width: 99vw !important;
            padding: 1rem !important;
            max-height: 92vh !important;
            overflow-y: auto !important;
          }
          #jfm-final-outer    { flex-direction: column; gap: 1.2rem; }
          #jfm-final-vid-col  { flex: none; width: 100%; }
          #jfm-final-txt-col  { max-height: none; overflow-y: visible; }
        }
        #egg-replay-wrap {
          margin-top: .65rem;
          text-align: center;
        }
        #jfm-replay-btn {
          display: inline-flex;
          align-items: center;
          gap: .45rem;
          font-family: var(--font-pixel);
          font-size: .75rem;
          color: #FFD700;
          background: rgba(255,215,0,.08);
          border: 1px solid rgba(255,215,0,.35);
          border-radius: var(--radius, 6px);
          padding: .5rem 1rem;
          cursor: pointer;
          transition: background .2s, box-shadow .2s, transform .15s;
          text-shadow: 0 0 8px rgba(255,215,0,.6);
          letter-spacing: .06em;
        }
        #jfm-replay-btn:hover {
          background: rgba(255,215,0,.18);
          box-shadow: 0 0 16px rgba(255,215,0,.4);
          transform: translateY(-2px);
        }
        #jfm-replay-btn:active { transform: scale(.97); }
      `;
      document.head.appendChild(st);
    }

    body.innerHTML = `
      <div id="jfm-final-outer">
        <div id="jfm-final-vid-col">
          <div style="text-align:center;">
            <div style="font-size:3.8rem;animation:spin 2.5s linear infinite;display:inline-block;line-height:1;margin-bottom:.5rem">🏆</div>
            <h2 style="
              font-family:var(--font-pixel);font-size:2rem;letter-spacing:.1em;
              background:linear-gradient(90deg,var(--bleu-neon),var(--violet),var(--rose-neon),#FFD700,var(--vert-neon));
              -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
              margin:0 0 .35rem;line-height:1.2;">100&nbsp;%&nbsp;COMPLÉTÉ&nbsp;!</h2>
            <p style="color:#FFD700;font-family:var(--font-pixel);font-size:1.05rem;margin:0;
                      text-shadow:0 0 12px rgba(255,215,0,.9);">★ ACHIEVEMENT UNLOCKED ★</p>
          </div>
          <div style="
            width:100%;border-radius:var(--radius,6px);overflow:hidden;
            box-shadow:0 0 32px rgba(0,195,255,.5),0 0 70px rgba(0,195,255,.18);
            border:2px solid rgba(0,195,255,.45);">
            <video id="final-egg-video"
              src="${videoSrc}"
              autoplay controls
              style="width:100%;display:block;background:#000;aspect-ratio:16/9;object-fit:contain;"
              preload="auto">
              Votre navigateur ne supporte pas la balise vidéo.
            </video>
          </div>
          <p style="color:var(--vert-neon);font-size:.9rem;font-family:var(--font-pixel);
                    text-shadow:0 0 10px rgba(57,255,20,.7);margin:0;text-align:center;">
            +9999 XP — LEVEL MAX ATTEINT 🚀
          </p>
        </div>
        <div id="jfm-final-txt-col">
          <p style="color:var(--texte);font-size:.80rem;margin:0;line-height:1.85;">
            Félicitations, vrai chasseur d'easter eggs&nbsp;!<br>
            Tu as trouvé les <strong style="color:var(--bleu-neon);font-size:.75rem">18 secrets</strong>
            cachés dans JoyStick FM.&nbsp;🎮<br>
            <span style="color:var(--texte-dim);font-size:.6rem;">
              Tu connais ce site mieux que ses créateurs.
            </span>
          </p>
          <details style="width:100%;" open>
            <summary style="
              font-family:var(--font-pixel);font-size:.75rem;color:var(--bleu-neon);
              text-shadow:var(--glow-bleu);list-style:none;cursor:pointer;
              text-align:center;padding:.45rem .65rem;
              background:rgba(0,195,255,.08);
              border:1px solid rgba(0,195,255,.25);border-radius:var(--radius,6px);
              margin-bottom:.55rem;">
              ▾ TOUS LES EASTER EGGS (18/18)
            </summary>
            <div style="
              background:rgba(255,215,0,.06);
              border:1px solid rgba(255,215,0,.2);
              border-radius:var(--radius,6px);padding:.8rem 1.1rem;">
              <div style="font-family:var(--font-pixel);font-size:1.1rem;color:#FFD700;line-height:2.3;">
                🎮 Konami Code — <span style="color:var(--texte-dim)">↑↑↓↓←→←→BA</span><br>
                🎵 Rickroll — <span style="color:var(--texte-dim)">5× clic texte logo</span><br>
                🌈 Nyan Cat — <span style="color:var(--texte-dim)">3× clic horaire (radio)</span><br>
                🍄 Mario 1-UP — <span style="color:var(--texte-dim)">5× clic titre émission (radio)</span><br>
                💀 DOOM IDDQD — <span style="color:var(--texte-dim)">5× clic icône 🎮</span><br>
                🔥 Hadouken — <span style="color:var(--texte-dim)">3× clic colonne footer</span><br>
                ⚡ Pokémon — <span style="color:var(--texte-dim)">4× clic vignette podcast</span><br>
                🔴 FNAF Honk — <span style="color:var(--texte-dim)">Clic sur le © footer</span><br>
                🗡️ Zelda — <span style="color:var(--texte-dim)">Double-clic crédits footer</span><br>
                💨 Sonic — <span style="color:var(--texte-dim)">Survol 1,5s lien nav</span><br>
                🍔 TK Burger — <span style="color:var(--texte-dim)">15× clic bouton Play (radio)</span><br>
                🖼️ Affiche — <span style="color:var(--texte-dim)">Maintien 5s image affiche</span><br>
                🔊 WEEEE — <span style="color:var(--texte-dim)">5× clic bouton 🔇 (radio)</span><br>
                🔢 67 — <span style="color:var(--texte-dim)">Clic sur « v6.7 » (boot)</span><br>
                ⚡ Klemz — <span style="color:var(--texte-dim)">Clic sur « Klemz » (boot)</span><br>
                🥩 Steakman63 — <span style="color:var(--texte-dim)">Clic sur « Steakman63 » (boot)</span><br>
                🐧 Pingouy — <span style="color:var(--texte-dim)">Clic sur « Pingouy » (boot)</span><br>
                🍮 Krem Brûlé — <span style="color:var(--texte-dim)">Clic sur « Krem Brûlé » (boot)</span>
              </div>
            </div>
          </details>
        </div>
      </div>`;

    function stopVideo() {
      const v = document.getElementById('final-egg-video');
      if (v) { v.pause(); v.currentTime = 0; }
    }

    /* v8.8/v8.9 — fermeture uniquement via bouton ou Échap, pas au clic sur le fond */
    const closeFn = () => {
      stopVideo();
      modal.classList.remove('show');
      document.removeEventListener('keydown', _onEscFinal);
      _EGG_MODAL_OPEN = false;   // v8.9 : libère le verrou
      _showReplayBtn();
    };
    function _onEscFinal(ev) {
      if (ev.key === 'Escape') closeFn();
    }
    document.getElementById('egg-close-btn')?.addEventListener('click', closeFn, { once: true });
    document.addEventListener('keydown', _onEscFinal);

    _EGG_MODAL_OPEN = true;      // v8.9 : pose le verrou
    modal.classList.add('show');
    if (!isReplay) _spawnConfetti();
  }

  function _showReplayBtn() {
    if (document.getElementById('jfm-replay-btn')) return;
    const anchor =
      document.querySelector('.egg-xp-bar')?.closest('div, section, footer') ||
      document.querySelector('.footer-bottom')                                ||
      document.querySelector('footer');
    if (!anchor) return;
    const wrap = document.createElement('div');
    wrap.id = 'egg-replay-wrap';
    const btn = document.createElement('button');
    btn.id        = 'jfm-replay-btn';
    btn.innerHTML = '🏆 REVOIR LA VICTOIRE';
    btn.addEventListener('click', () => _triggerFinalEgg(true));
    wrap.appendChild(btn);
    anchor.appendChild(wrap);
  }

  (function _initReplayBtn() {
    const apply = () => {
      try {
        const found = JSON.parse(sessionStorage.getItem('jfm_eggs_found')) || [];
        if (found.length >= 18) {
          if (document.readyState === 'complete') _showReplayBtn();
          else window.addEventListener('load', _showReplayBtn, { once: true });
        }
      } catch(e) {}
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
    else apply();
  })();

  function _spawnConfetti() {
    if (document.getElementById('jfm-confetti')) return;
    const canvas = document.createElement('canvas');
    canvas.id = 'jfm-confetti';
    Object.assign(canvas.style, {
      position:'fixed', top:'0', left:'0', width:'100%', height:'100%',
      pointerEvents:'none', zIndex:'99999'
    });
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx    = canvas.getContext('2d');
    const COLORS = ['#00C3FF','#B24BF3','#FF2D78','#FFD700','#39FF14','#FF6B35'];
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: Math.random() * 8 + 5,
      h: Math.random() * 6 + 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speed: Math.random() * 3 + 2,
      drift: (Math.random() - .5) * 2,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - .5) * 6
    }));
    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      pieces.forEach(p => {
        p.y += p.speed; p.x += p.drift; p.rot += p.rotSpeed;
        if (p.y < canvas.height + 20) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctx.restore();
      });
      if (alive) frame = requestAnimationFrame(draw);
      else canvas.remove();
    };
    frame = requestAnimationFrame(draw);
    setTimeout(() => { cancelAnimationFrame(frame); canvas.remove(); }, 6000);
  }

  function init() {
    const apply = () => {
      const count = load().length;
      const pct   = Math.round((count / TOTAL) * 100);
      document.querySelectorAll('.egg-xp-fill').forEach(b  => {
        b.style.width = pct + '%';
        if (count === TOTAL) b.classList.add('max-level');
      });
      document.querySelectorAll('.egg-xp-count').forEach(el => el.textContent = count);
      document.querySelectorAll('.egg-xp-pct').forEach(el  => el.textContent = pct + '%');
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
    else apply();
  }

  return { markFound, getCount: () => load().length, init, TOTAL, _triggerFinal: _triggerFinalEgg };
})();

EGG_TRACKER.init();


/* ──────────────────────────────────────────────────────────
   UTILITAIRES AUDIO
   ────────────────────────────────────────────────────────── */
function _playAudio(path, fallback) {
  const a = new Audio(path);
  a.volume = .6;
  a.play().catch(() => _beep(fallback));
  return a;
}

/* ── NOUVEAU v8.7 : audio iOS-compatible via AudioContext ──
   Sur iOS/Safari, new Audio().play() est bloqué en dehors
   d'un geste utilisateur. Mais fetch() + decodeAudioData()
   fonctionne si appelé depuis un handler tactile valide.
   Utilisé par les eggs 12 et 13 déclenchés via touchstart/touchend.
   ────────────────────────────────────────────────────────── */
function _playAudioIOS(path, fallbackFreqs) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (!isIOS) {
    // Sur desktop, comportement normal
    return _playAudio(path, fallbackFreqs || []);
  }

  // Sur iOS : AudioContext + fetch + decodeAudioData
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();

    fetch(path)
      .then(r => r.arrayBuffer())
      .then(buf => ctx.decodeAudioData(buf))
      .then(decoded => {
        const src  = ctx.createBufferSource();
        const gain = ctx.createGain();
        src.buffer = decoded;
        gain.gain.value = 0.6;
        src.connect(gain);
        gain.connect(ctx.destination);
        src.start(0);
      })
      .catch(() => _beep(fallbackFreqs || []));

    // Retourne un objet factice compatible avec l'interface Audio
    return {
      _iosCtx: ctx,
      pause() { try { ctx.suspend(); } catch(e) {} },
      volume: 0.6
    };
  } catch(e) {
    return _playAudio(path, fallbackFreqs || []);
  }
}

/* ── NOUVEAU v8.7 : patch slider iOS ──
   Sur iOS, l'événement "input" sur <input type="range"> ne se
   déclenche pas pendant le glissement tactile. On remplace par
   des événements touchstart/touchmove calculant la valeur manuellement.
   ────────────────────────────────────────────────────────── */
function _patchIOSSlider(slider, callback) {
  if (!slider) return;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!isIOS) {
    // Sur desktop l'event "input" natif suffit
    slider.addEventListener('input', () => callback(parseFloat(slider.value)));
    return;
  }

  // Sur iOS : on calcule la valeur à partir de la position tactile
  const getValFromTouch = (touch) => {
    const rect = slider.getBoundingClientRect();
    const min  = parseFloat(slider.min)  || 0;
    const max  = parseFloat(slider.max)  || 100;
    const pct  = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
    return min + pct * (max - min);
  };

  slider.addEventListener('touchstart', (e) => {
    e.stopPropagation();
    const val = getValFromTouch(e.touches[0]);
    slider.value = val;
    callback(val);
  }, { passive: false });

  slider.addEventListener('touchmove', (e) => {
    e.preventDefault(); // empêche le scroll pendant le drag du slider
    const val = getValFromTouch(e.touches[0]);
    slider.value = val;
    callback(val);
  }, { passive: false });

  // Fallback : event input natif (fonctionne au moins au touchend sur certains iOS)
  slider.addEventListener('input', () => callback(parseFloat(slider.value)));
}

function _beep(freqs) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach((f,i) => {
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type='square';
      o.frequency.setValueAtTime(f, ctx.currentTime+i*.12);
      g.gain.setValueAtTime(.07, ctx.currentTime+i*.12);
      g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime+i*.12+.1);
      o.start(ctx.currentTime+i*.12); o.stop(ctx.currentTime+i*.12+.15);
    });
  } catch(e) {}
}

/* ──────────────────────────────────────────────────────────
   REGISTRE AUDIO DU BOOT SCREEN
   ────────────────────────────────────────────────────────── */
const _bootAudioRegistry = (function () {
  const _all = [];

  function _isBootHidden(el) {
    if (!el) return true;
    const s = el.style;
    if (s.display === 'none' || s.visibility === 'hidden') return true;
    if (parseFloat(s.opacity) === 0) return true;
    if (el.classList.contains('hidden') ||
        el.classList.contains('fade-out') ||
        el.classList.contains('closing') ||
        el.classList.contains('gone')) return true;
    return false;
  }

  function stopAll() {
    _all.forEach(a => {
      try { a.pause(); a.currentTime = 0; } catch(e) {}
    });
    _all.length = 0;
  }

  function play(path, fallback) {
    stopAll();
    const a = _playAudio(path, fallback);
    _all.push(a);
    a.addEventListener('ended', () => {
      const i = _all.indexOf(a);
      if (i !== -1) _all.splice(i, 1);
    }, { once: true });
    return a;
  }

  function _watchBoot() {
    const boot = document.getElementById('console-boot');
    if (!boot) return;

    const attrObs = new MutationObserver(() => {
      if (_isBootHidden(boot)) { stopAll(); attrObs.disconnect(); nodeObs.disconnect(); }
    });
    attrObs.observe(boot, { attributes: true, attributeFilter: ['style', 'class'] });

    const nodeObs = new MutationObserver(mutations => {
      mutations.forEach(m => {
        m.removedNodes.forEach(n => {
          if (n === boot || n.contains?.(boot)) {
            stopAll(); attrObs.disconnect(); nodeObs.disconnect();
          }
        });
      });
    });
    nodeObs.observe(document.body, { childList: true, subtree: true });

    function _clickGuard() {
      requestAnimationFrame(() => {
        if (_isBootHidden(boot) || !document.contains(boot)) {
          stopAll();
          attrObs.disconnect();
          nodeObs.disconnect();
          document.removeEventListener('click',   _clickGuard, true);
          document.removeEventListener('keydown', _keyGuard,   true);
        }
      });
    }
    function _keyGuard(e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') _clickGuard();
    }
    document.addEventListener('click',   _clickGuard, true);
    document.addEventListener('keydown', _keyGuard,   true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _watchBoot);
  else _watchBoot();

  return { play, stop: stopAll };
})();

window.jfmStopBootAudio = () => _bootAudioRegistry.stop();


/* ──────────────────────────────────────────────────────────
   UTILITAIRE — Multi-clic sur sélecteur CSS
   ────────────────────────────────────────────────────────── */
function _onClick(selector, needed, delay, cb) {
  function attach() {
    document.querySelectorAll(selector).forEach(el => {
      if (el['_oc_'+selector]) return;
      el['_oc_'+selector] = true;
      let n=0, t;
      el.addEventListener('click', e => {
        clearTimeout(t);
        n++;
        t = setTimeout(()=>{ n=0; }, delay);
        if (n >= needed) { n=0; clearTimeout(t); cb(e, el); }
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
  document.addEventListener('DOMContentLoaded', attach);
}

/* ──────────────────────────────────────────────────────────
   HELPER — ouvre le modal
   v8.8 : fermeture UNIQUEMENT via bouton [ FERMER ] ou Échap.
          Le clic sur le fond sombre NE ferme plus le modal.
          Tous les listeners de fermeture sont centralisés ici ;
          les eggs individuels n'ont plus à les gérer.
   ────────────────────────────────────────────────────────── */
function _modal(html, onClose) {
  /* v8.9 — bloquer si un modal est déjà ouvert */
  if (_EGG_MODAL_OPEN) return;

  const modal    = document.getElementById('easter-egg-modal');
  const body     = document.getElementById('easter-egg-content');
  const closeBtn = document.getElementById('egg-close-btn');
  if (!modal) return;

  _EGG_MODAL_OPEN = true;        // v8.9 : pose le verrou
  body.innerHTML = html;
  modal.classList.add('show');

  function _close() {
    modal.classList.remove('show');
    document.removeEventListener('keydown', _onEsc);
    _EGG_MODAL_OPEN = false;     // v8.9 : libère le verrou
    if (typeof onClose === 'function') onClose();
    /* v8.9 — si le final était en attente, on le lance maintenant */
    if (_pendingFinalEgg) {
      _pendingFinalEgg = false;
      setTimeout(EGG_TRACKER._triggerFinal, 400);
    }
  }
  function _onEsc(e) {
    if (e.key === 'Escape') _close();
  }

  closeBtn?.addEventListener('click', _close, { once: true });
  document.addEventListener('keydown', _onEsc);

  /* ⚠️ Pas de listener sur modal lui-même : clic sur le fond désactivé */
}


/* ════════════════════════════════════════════════════════════
   EGG 1 — Konami Code (PC & Mobile)
   ════════════════════════════════════════════════════════════ */
(function initKonami() {
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  const ARROWS = ['↑','↑','↓','↓','←','→','←','→','B','A'];
  let idx = 0;
  let resetTimer = null;

  // --- Indicateur visuel PC dans le footer ---
  const footerHint = document.querySelector('.footer-bottom p:last-child');
  if (footerHint && footerHint.textContent.includes('BA')) {
      footerHint.innerHTML = ARROWS.map(a => `<span>${a}</span>`).join('') + ' 🎮';
  }

  function updateHint() {
      if (!footerHint) return;
      const spans = footerHint.querySelectorAll('span');
      spans.forEach((span, i) => {
          if (i < idx) {
              span.style.color = 'var(--bleu-neon)';
              span.style.textShadow = 'var(--glow-bleu)';
          } else {
              span.style.color = 'var(--texte-dim)';
              span.style.textShadow = 'none';
          }
      });
  }
  document.addEventListener('keydown', (e) => {
      // Ignorer si l'utilisateur tape dans le chat
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      if (e.key.toLowerCase() === KONAMI[idx].toLowerCase() || e.key === KONAMI[idx]) {
          idx++;
          updateHint();
          clearTimeout(resetTimer);
          resetTimer = setTimeout(() => { idx = 0; updateHint(); }, 3000);

          if (idx === KONAMI.length) {
              successKonami();
          }
      } else {
          idx = 0;
          if (e.key.toLowerCase() === KONAMI[0].toLowerCase() || e.key === KONAMI[0]) {
              idx = 1;
          }
          updateHint();
      }
  });

  // Fonction globale appelée pour déclencher manuellement (ex: boutons tactiles)
  window.triggerKonamiEgg = function() {
      successKonami();
  };

  function successKonami() {
    idx = 0;
    updateHint();
    EGG_TRACKER.markFound('konami');
 
    // Son konami
    _playAudio((window.THEME_URI || '') + '/assets/audio/easter-eggs/konami.mp3', [523, 659, 784, 1046]);
 
    // Pop-up easter egg avec bouton pour lancer le jeu
    _modal(`
      <div style="font-size:3.5rem;margin-bottom:.75rem;animation:eggPop .4s cubic-bezier(.34,1.56,.64,1)">🕹️</div>
      <h2 style="font-family:var(--font-pixel);font-size:1.8rem;color:#FFD700;
                 text-shadow:0 0 10px rgba(255,215,0,.5);margin-bottom:.75rem">KONAMI CODE VALIDÉ !</h2>
      <p style="color:var(--texte);font-size:.85rem;margin-bottom:.75rem;line-height:1.7">
        Le code de triche le plus célèbre de l'histoire du jeu vidéo.<br>
        Gradius, Contra, Metal Gear... tu connais tes classiques.
      </p>
      <p style="color:var(--bleu-neon);font-size:.75rem;font-family:var(--font-pixel);margin-bottom:1.4rem">+ 30 Vies ajoutées 👾</p>
      <button id="jfm-play-game-btn" style="
        display:inline-flex;align-items:center;gap:.55rem;
        font-family:var(--font-pixel);font-size:.8rem;
        color:#000;background:#ffe600;
        border:none;border-radius:6px;
        padding:.7rem 1.4rem;cursor:pointer;
        box-shadow:0 0 22px rgba(255,230,0,.6), 0 0 50px rgba(255,230,0,.2);
        transition:transform .15s,box-shadow .15s;
        letter-spacing:.08em;text-transform:uppercase;
        animation:eggPop .5s .1s cubic-bezier(.34,1.56,.64,1) both;">
        🎮 JOUER AU JEU SECRET
      </button>
      <p style="color:var(--texte-dim);font-size:.65rem;font-family:var(--font-pixel);margin-top:.75rem;opacity:.7">
        Ferme la pop-up pour rester sur le site
      </p>`,
    () => { /* onClose — rien à faire */ });
 
    // Attacher l'event sur le bouton après que le modal est dans le DOM
    requestAnimationFrame(() => {
      const btn = document.getElementById('jfm-play-game-btn');
      if (!btn) return;
      btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'scale(1.07) translateY(-2px)';
        btn.style.boxShadow = '0 0 32px rgba(255,230,0,.9), 0 0 70px rgba(255,230,0,.3)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.boxShadow = '0 0 22px rgba(255,230,0,.6), 0 0 50px rgba(255,230,0,.2)';
      });
      btn.addEventListener('click', () => {
        // FIX v5.0 : utiliser le bouton FERMER officiel pour que _EGG_MODAL_OPEN
        // soit correctement remis à false via _close() — sans ça, _modal() bloque
        // et le Konami Code ne re-déclenche plus la pop-up après une partie.
        const closeBtn = document.getElementById('egg-close-btn');
        if (closeBtn) {
          closeBtn.click();
        } else {
          const modal = document.getElementById('easter-egg-modal');
          if (modal) modal.classList.remove('show');
        }
        // Ouvrir le jeu après un léger délai (laisser _close() s'exécuter)
        setTimeout(() => {
          if (window.JFM_GAME) {
            // Signaler au jeu que l'ouverture vient du Konami Code
            window._jfmOpenedViaKonami = true;
            window.JFM_GAME.openGameOverlay();
          } else {
            console.warn('JFM_GAME non disponible — vérifier que joystick-launch-game.js est chargé');
          }
        }, 80);
      });
    });
  }
})();


/* ════════════════════════════════════════════════════════════
   KONAMI MOBILE — Swipes directionnels + 2 taps rapides
   Séquence : ↑ ↑ ↓ ↓ ← → ← → + TAP TAP
   Compatible iOS Safari et Android Chrome
   ════════════════════════════════════════════════════════════ */
(function initKonamiMobile() {
  // Uniquement sur appareils tactiles
  if (!('ontouchstart' in window) && navigator.maxTouchPoints < 1) return;

  const SWIPE_SEQ = ['up','up','down','down','left','right','left','right'];
  const SWIPE_LABELS = ['↑','↑','↓','↓','←','→','←','→','TAP','TAP'];
  const MIN_SWIPE_DIST  = 35;  // px minimum pour valider un swipe
  const MAX_SWIPE_TIME  = 600; // ms max pour effectuer le swipe
  const TAP_MAX_DIST    = 20;  // px max déplacement pour un tap
  const TAP_TIMEOUT     = 800; // ms pour les 2 taps consécutifs
  const RESET_TIMEOUT   = 4000;// ms d'inactivité pour reset la séquence

  let swipeIdx = 0;      // index dans SWIPE_SEQ (0-7)
  let tapCount  = 0;     // taps restants (0, 1 ou 2 après les swipes)
  let phase     = 'swipe'; // 'swipe' | 'tap'
  let resetTimer = null;
  let tapTimer   = null;

  // Touch tracking
  let touchStartX = 0, touchStartY = 0, touchStartTime = 0;

  // Indicateur visuel mobile (hors indicateur footer PC)
  let mobileHint = null;

  function getMobileHint() {
    if (mobileHint && document.body.contains(mobileHint)) return mobileHint;
    mobileHint = document.getElementById('jfm-konami-mobile-hint');
    if (!mobileHint) {
      mobileHint = document.createElement('div');
      mobileHint.id = 'jfm-konami-mobile-hint';
      mobileHint.style.cssText = [
        'position:fixed',
        'bottom:env(safe-area-inset-bottom,16px)',
        'left:50%',
        'transform:translateX(-50%)',
        'z-index:99990',
        'background:rgba(0,0,20,0.92)',
        'border:1px solid rgba(0,195,255,0.4)',
        'border-radius:10px',
        'padding:8px 16px',
        'display:flex',
        'gap:6px',
        'align-items:center',
        'font-family:monospace',
        'font-size:1.1rem',
        'pointer-events:none',
        'transition:opacity 0.3s',
        'opacity:0',
        'will-change:opacity',
      ].join(';');
      document.body.appendChild(mobileHint);
    }
    return mobileHint;
  }

  function renderHint() {
    const hint = getMobileHint();
    const totalDone = phase === 'swipe' ? swipeIdx : SWIPE_SEQ.length + tapCount;
    if (totalDone === 0) {
      hint.style.opacity = '0';
      return;
    }
    hint.style.opacity = '1';
    const spans = SWIPE_LABELS.map((lbl, i) => {
      const done  = i < totalDone;
      const next  = i === totalDone;
      const color = done ? '#00c3ff' : next ? '#ffe600' : 'rgba(255,255,255,0.2)';
      const shadow = done ? '0 0 8px rgba(0,195,255,0.8)' : next ? '0 0 6px rgba(255,230,0,0.6)' : 'none';
      return `<span style="color:${color};text-shadow:${shadow};transition:color 0.15s">${lbl}</span>`;
    });
    hint.innerHTML = spans.join(' ');
    // Auto-masquer si inactif
    clearTimeout(hint._hideTimer);
    hint._hideTimer = setTimeout(() => { hint.style.opacity = '0'; }, 3500);
  }

  function resetSeq() {
    swipeIdx = 0; tapCount = 0; phase = 'swipe';
    clearTimeout(resetTimer); clearTimeout(tapTimer);
    renderHint();
  }

  function scheduleReset() {
    clearTimeout(resetTimer);
    resetTimer = setTimeout(resetSeq, RESET_TIMEOUT);
  }

  function advanceSwipe(dir) {
    if (phase !== 'swipe') return;
    if (dir === SWIPE_SEQ[swipeIdx]) {
      swipeIdx++;
      scheduleReset();
      renderHint();
      if (swipeIdx === SWIPE_SEQ.length) {
        // Swipes terminés → passer en phase tap
        phase = 'tap';
        tapCount = 0;
        // Démarrer le timer tap
        tapTimer = setTimeout(() => {
          if (phase === 'tap' && tapCount < 2) resetSeq();
        }, TAP_TIMEOUT * 3);
      }
    } else {
      // Mauvais swipe : recommencer depuis le début ou depuis la 1ère étape si on a ↑
      const wasFirst = (dir === SWIPE_SEQ[0]);
      resetSeq();
      if (wasFirst) {
        swipeIdx = 1;
        scheduleReset();
        renderHint();
      }
    }
  }

  function handleTap() {
    if (phase !== 'tap') return;
    clearTimeout(tapTimer);
    tapCount++;
    renderHint();
    if (tapCount >= 2) {
      // Séquence complète !
      resetSeq();
      // Déclencher le Konami egg (même fonction que le clavier)
      if (typeof window.triggerKonamiEgg === 'function') {
        window.triggerKonamiEgg();
      }
    } else {
      // Attendre le 2ème tap
      tapTimer = setTimeout(() => {
        if (phase === 'tap' && tapCount < 2) resetSeq();
      }, TAP_TIMEOUT);
    }
  }

  // ── Listeners touch ──
  document.addEventListener('touchstart', (e) => {
    // Ignorer si le jeu est ouvert ou un modal easter egg est visible
    if (document.getElementById('jfm-game-overlay')?.classList.contains('visible')) return;
    if (document.getElementById('easter-egg-modal')?.classList.contains('show')) return;
    
    // CORRECTION : On ne bloque le swipe QUE si tu touches explicitement la barre de recherche ou un formulaire.
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

    touchStartX    = e.touches[0].clientX;
    touchStartY    = e.touches[0].clientY;
    touchStartTime = Date.now();
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (document.getElementById('jfm-game-overlay')?.classList.contains('visible')) return;
    if (document.getElementById('easter-egg-modal')?.classList.contains('show')) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const dt = Date.now() - touchStartTime;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // CORRECTION : Tolérance de temps augmentée à 1500ms au lieu de 600ms pour laisser le temps de glisser !
    if (dt > 1500) return; 

    // Tolérance de distance de TAP augmentée à 40px
    if (dist < 40) {
      handleTap();
      return;
    }

    if (dist < MIN_SWIPE_DIST) return;

    // Déterminer la direction dominante
    const dir = Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? 'right' : 'left')
      : (dy > 0 ? 'down'  : 'up');

    advanceSwipe(dir);
  }, { passive: true });

  // Afficher un indice de démarrage discret après 5 secondes sur mobile
  setTimeout(() => {
    const h = getMobileHint();
    if (swipeIdx === 0 && phase === 'swipe') {
      h.innerHTML = '<span style="color:rgba(0,195,255,0.4);font-size:0.8rem">↑↑↓↓←→←→ 🎮</span>';
      h.style.opacity = '0.6';
      setTimeout(() => { if (swipeIdx === 0) h.style.opacity = '0'; }, 3000);
    }
  }, 5000);

})();


/* ════════════════════════════════════════════════════════════
   EGG 2 — Rickroll : 5× clic sur .logo (hors .logo-icon)
   ════════════════════════════════════════════════════════════ */
(function () {
  let n=0, t, aud=null;
  function attach() {
    document.querySelectorAll('.logo').forEach(logo => {
      if (logo._rickAttached) return;
      logo._rickAttached = true;
      logo.addEventListener('click', e => {
        if (e.target.closest('.logo-icon')) return;
        e.preventDefault();
        n++; clearTimeout(t);
        t = setTimeout(()=>{ n=0; }, 1500);
        if (n < 5) return;
        n = 0;
        EGG_TRACKER.markFound('rickroll');
        if (aud) { aud.pause(); aud=null; }
        aud = _playAudio((window.THEME_URI || '') + '/assets/audio/easter-eggs/rickroll.mp3', [330,330,392,440,392,330]);
        _modal(`
          <div style="font-size:3rem;margin-bottom:1rem">🎵</div>
          <h2 style="font-family:var(--font-pixel);font-size:1.5rem;color:var(--rose-neon);
                     text-shadow:var(--glow-rose);margin-bottom:.75rem">NEVER GONNA GIVE YOU UP</h2>
          <p style="color:var(--texte);font-size:.85rem;margin-bottom:.75rem">
            Tu viens de te faire Rickroll. Classique.<br>Loi d'Internet depuis 2007. 🦆
          </p>
          <p style="color:var(--bleu-neon);font-size:.75rem;font-family:var(--font-pixel)">🔊 Écoute bien...</p>`,
        () => { if(aud){aud.pause();aud=null;} });
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
})();


/* ════════════════════════════════════════════════════════════
   EGG 3 — Nyan Cat : 3× clic sur .schedule-time
   ════════════════════════════════════════════════════════════ */
(function () {
  let aud=null;
  _onClick('.schedule-time, .schedule-hours', 3, 2000, () => {
    EGG_TRACKER.markFound('nyan');
    if (aud) { aud.pause(); aud=null; }
    aud = _playAudio((window.THEME_URI || '') + '/assets/audio/easter-eggs/nyan.mp3', [784,988,1175,988,784,784,988]);
    _modal(`
      <div style="font-size:4rem;margin-bottom:.5rem;animation:spin 1s linear infinite;display:inline-block">🌈</div>
      <h2 style="font-family:var(--font-pixel);font-size:1.8rem;
                 background:linear-gradient(90deg,#f00,#f90,#ff0,#0f0,#00f,#90f);
                 -webkit-background-clip:text;-webkit-text-fill-color:transparent;
                 background-clip:text;margin-bottom:.75rem">NYAN CAT MODE</h2>
      <p style="color:var(--texte);font-size:.85rem;margin-bottom:.75rem">
        🐱 Pop Tart Cat activé ! (YouTube, 2011)<br>Tu scrutais les horaires un peu trop attentivement.
      </p>
      <p style="color:var(--texte-dim);font-size:.7rem;font-family:var(--font-pixel)">+9999 points de culture internet</p>`,
    () => { if(aud){aud.pause();aud=null;} });
  });
})();


/* ════════════════════════════════════════════════════════════
   EGG 4 — Mario 1-UP : 5× clic sur .schedule-show-title
   ════════════════════════════════════════════════════════════ */
_onClick('.schedule-show-title, .schedule-title', 5, 3000, () => {
  EGG_TRACKER.markFound('mario');
  _modal(`
    <div style="font-size:3.5rem;margin-bottom:.75rem;animation:eggPop .4s cubic-bezier(.34,1.56,.64,1)">🍄</div>
    <h2 style="font-family:var(--font-pixel);font-size:1.8rem;color:var(--vert-neon);
               text-shadow:0 0 10px rgba(57,255,20,.5);margin-bottom:.75rem">1-UP OBTENU !</h2>
    <p style="color:var(--texte);font-size:.85rem;margin-bottom:.75rem">
      Super Mario Bros. — Nintendo, 1985.<br>Tu viens de sauver la princesse Peach. Encore.
    </p>
    <p style="color:var(--bleu-neon);font-size:.75rem;font-family:var(--font-pixel)">It's-a me, Mario ! 🎩</p>`);
  _playAudio((window.THEME_URI || '') + '/assets/audio/easter-eggs/mario.mp3', [784,988,1319,698,1047,1319,1568]);
});


/* ════════════════════════════════════════════════════════════
   EGG 5 — DOOM IDDQD : 5× clic sur .logo-icon
   ════════════════════════════════════════════════════════════ */
(function () {
  function attach() {
    document.querySelectorAll('.logo-icon').forEach(el => {
      if (el._doomAttached) return;
      el._doomAttached = true;
      let n=0, t;
      el.addEventListener('click', e => {
        e.stopPropagation();
        e.preventDefault();
        n++; clearTimeout(t);
        t = setTimeout(()=>{ n=0; }, 3000);
        if (n < 5) return;
        n = 0;
        EGG_TRACKER.markFound('doom');
        _modal(`
          <div style="font-size:3.5rem;margin-bottom:.75rem">💀</div>
          <h2 style="font-family:var(--font-pixel);font-size:1.8rem;color:var(--rose-neon);
                     text-shadow:var(--glow-rose);margin-bottom:.75rem">IDDQD — GOD MODE</h2>
          <p style="color:var(--vert-neon);font-family:var(--font-pixel);font-size:1rem;margin-bottom:.5rem">DEGREELESSNESS MODE ON</p>
          <p style="color:var(--texte);font-size:.85rem;margin-bottom:.75rem">
            DOOM — id Software, 1993. Le FPS qui a tout changé. 🔫
          </p>
          <p style="color:var(--texte-dim);font-size:.75rem;font-family:var(--font-pixel)">
            "THEY ARE RAGE, BRUTAL, WITHOUT MERCY." — Mick Gordon
          </p>`);
        _playAudio((window.THEME_URI || '') + '/assets/audio/easter-eggs/doom.mp3', [55,55,110,55,82,73,55,55]);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
})();


/* ════════════════════════════════════════════════════════════
   EGG 6 — Hadouken : 3× clic sur .footer-col
   ════════════════════════════════════════════════════════════ */
_onClick('.footer-col', 3, 2000, () => {
  EGG_TRACKER.markFound('hadouken');
  _modal(`
    <div style="font-size:3.5rem;margin-bottom:.75rem;animation:spin .5s ease">🔥</div>
    <h2 style="font-family:var(--font-pixel);font-size:1.8rem;
               background:linear-gradient(90deg,#f00,#f90,#ff0);
               -webkit-background-clip:text;-webkit-text-fill-color:transparent;
               background-clip:text;margin-bottom:.75rem">HADOUKEN !!!</h2>
    <p style="color:var(--rose-neon);font-family:var(--font-pixel);font-size:1.1rem;margin-bottom:.5rem">↓ ↘ → + POING</p>
    <p style="color:var(--texte);font-size:.85rem;margin-bottom:.75rem">
      Street Fighter II — Capcom, 1991. Ryu sort sa boule de feu légendaire. 🥋
    </p>
    <p style="color:var(--texte-dim);font-size:.7rem;font-family:var(--font-pixel)">PERFECT! YOU WIN! 🏆</p>`);
  _playAudio((window.THEME_URI || '') + '/assets/audio/easter-eggs/hadouken.mp3', [220,277,330,415,523,659,830,1046]);
});


/* ════════════════════════════════════════════════════════════
   EGG 7 — Pokémon : 4× clic sur .card-thumb
   ════════════════════════════════════════════════════════════ */
_onClick('.card-thumb, .podcast-cover, .podcast-thumb, .podcast-art', 4, 3000, () => {
  EGG_TRACKER.markFound('pokemon');
  const flash = document.createElement('div');
  flash.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:99999;pointer-events:none;opacity:1;transition:opacity .3s';
  document.body.appendChild(flash);
  setTimeout(()=>{ flash.style.opacity='0'; }, 50);
  setTimeout(()=>{ flash.remove(); }, 350);
  _modal(`
    <div style="font-size:3.5rem;margin-bottom:.75rem">⚡</div>
    <h2 style="font-family:var(--font-pixel);font-size:1.5rem;color:#FFD700;
               text-shadow:0 0 10px rgba(255,215,0,.6);margin-bottom:.75rem">Un PIKACHU sauvage apparaît !</h2>
    <p style="color:var(--texte);font-size:.85rem;margin-bottom:.75rem">
      Pokémon Rouge — Game Freak / Nintendo, 1996.<br>La fanfare de rencontre la plus iconique. 🎮
    </p>
    <p style="color:var(--texte-dim);font-size:.75rem;font-family:var(--font-pixel);margin-bottom:.5rem">
      ▶ COMBAT &nbsp;▷ SAC &nbsp;▷ POKÉMON &nbsp;▷ FUITE
    </p>
    <p style="color:var(--bleu-neon);font-size:.7rem;font-family:var(--font-pixel)">Gotta catch 'em all ! 💛</p>`);
  _playAudio((window.THEME_URI || '') + '/assets/audio/easter-eggs/pokemon.mp3', [523,523,523,392,523,659,392]);
});


/* ════════════════════════════════════════════════════════════
   EGG 8 — FNAF Honk : clic sur #fnaf-nose  (le © du footer)
   ════════════════════════════════════════════════════════════ */
(function () {
  function attach() {
    document.querySelectorAll('#fnaf-nose').forEach(el => {
      if (el._fnafAttached) return;
      el._fnafAttached = true;
      el.addEventListener('click', () => {
        EGG_TRACKER.markFound('fnaf');
        el.style.cssText += 'display:inline-block;transform:scale(1.8) rotate(20deg);transition:transform .15s ease';
        setTimeout(()=>{ el.style.transform='scale(1) rotate(0deg)'; }, 200);
        _playAudio((window.THEME_URI || '') + '/assets/audio/easter-eggs/nose.mp3', [400,300]);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
})();


/* ════════════════════════════════════════════════════════════
   EGG 9 — Zelda : double-clic sur #footer-credits
   ════════════════════════════════════════════════════════════ */
(function () {
  function attach() {
    document.querySelectorAll('#footer-credits').forEach(el => {
      if (el._zeldaAttached) return;
      el._zeldaAttached = true;
      el.addEventListener('dblclick', () => {
        EGG_TRACKER.markFound('zelda');
        const flash = document.createElement('div');
        flash.style.cssText = 'position:fixed;inset:0;background:radial-gradient(circle,rgba(255,215,0,.35) 0%,transparent 70%);z-index:99999;pointer-events:none;opacity:1;transition:opacity .4s';
        document.body.appendChild(flash);
        setTimeout(()=>{ flash.style.opacity='0'; }, 50);
        setTimeout(()=>{ flash.remove(); }, 450);
        _modal(`
          <div style="font-size:3.5rem;margin-bottom:.75rem;animation:eggPop .4s cubic-bezier(.34,1.56,.64,1)">🗡️</div>
          <h2 style="font-family:var(--font-pixel);font-size:1.6rem;color:#FFD700;
                     text-shadow:0 0 12px rgba(255,215,0,.7);margin-bottom:.75rem">IT'S DANGEROUS TO GO ALONE !</h2>
          <p style="color:var(--texte);font-size:.85rem;margin-bottom:.75rem">
            The Legend of Zelda — Nintendo, 1986. 🧝
          </p>
          <p style="color:#FFD700;font-family:var(--font-pixel);font-size:1rem;margin-bottom:.4rem">▶ TAKE THIS !</p>
          <p style="color:var(--texte-dim);font-size:.7rem;font-family:var(--font-pixel)">Triforce débloquée — Courage ✦ Sagesse ✦ Puissance</p>`);
        _playAudio((window.THEME_URI || '') + '/assets/audio/easter-eggs/zelda.mp3', [392,523,659,784,659,784,880,1047]);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
})();


/* ════════════════════════════════════════════════════════════
   EGG 10 — Sonic : survol 1,5 s sur nav a
   ════════════════════════════════════════════════════════════ */
(function () {
  function attach() {
    document.querySelectorAll('nav a').forEach(el => {
      if (el._sonicAttached) return;
      el._sonicAttached = true;
      let timer;
      el.addEventListener('mouseenter', () => {
        timer = setTimeout(() => {
          EGG_TRACKER.markFound('sonic');
          const streak = document.createElement('div');
          streak.style.cssText = 'position:fixed;top:50%;left:-10%;width:55%;height:5px;margin-top:-2.5px;'
            + 'background:linear-gradient(90deg,transparent,#1E90FF,#00BFFF,#87CEEB,transparent);'
            + 'z-index:99999;pointer-events:none;animation:sonicLine .45s ease-out forwards';
          document.body.appendChild(streak);
          setTimeout(()=>{ streak.remove(); }, 500);
          _modal(`
            <div style="font-size:3.5rem;margin-bottom:.75rem">💨</div>
            <h2 style="font-family:var(--font-pixel);font-size:1.6rem;color:#1E90FF;
                       text-shadow:0 0 12px rgba(30,144,255,.7);margin-bottom:.75rem">GOTTA GO FAST !</h2>
            <p style="color:var(--texte);font-size:.85rem;margin-bottom:.75rem">
              Sonic the Hedgehog — SEGA / Sonic Team, 1991. 🦔
            </p>
            <p style="color:#1E90FF;font-family:var(--font-pixel);font-size:1rem;margin-bottom:.4rem">▶ RINGS COLLECTED : 999</p>
            <p style="color:var(--texte-dim);font-size:.7rem;font-family:var(--font-pixel)">ALL CHAOS EMERALDS OBTAINED — SUPER SONIC MODE 💎</p>`);
          _playAudio((window.THEME_URI || '') + '/assets/audio/easter-eggs/sonic.mp3', [659,784,988,1319,1047,784,1047,1319]);
        }, 1500);
      });
      el.addEventListener('mouseleave', () => clearTimeout(timer));
      el.addEventListener('click',      () => clearTimeout(timer));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();

  if (!document.getElementById('sonic-keyframe')) {
    const s = document.createElement('style');
    s.id = 'sonic-keyframe';
    s.textContent = '@keyframes sonicLine{0%{left:-10%;opacity:1}100%{left:110%;opacity:0}}';
    document.head.appendChild(s);
  }
})();


/* ════════════════════════════════════════════════════════════
   EGG 11 — TK ça marche pas : 6× clic sur #main-play-btn
   ⚠️  page-radio.php — id="main-play-btn"
   ════════════════════════════════════════════════════════════ */
(function () {
  function attach() {
    const btn = document.getElementById('main-play-btn');
    if (!btn || btn._tkBurgerAttached) return;
    btn._tkBurgerAttached = true;

    btn._tkCount = 0;
    btn._tkTimer = null;
    let aud = null;

    btn.addEventListener('click', () => {
      setTimeout(() => {
        btn._tkCount++;
        clearTimeout(btn._tkTimer);
        btn._tkTimer = setTimeout(() => { btn._tkCount = 0; }, 15000);
        if (btn._tkCount < 6) return;
        btn._tkCount = 0;
        clearTimeout(btn._tkTimer);

        EGG_TRACKER.markFound('tkburger');

        btn.style.transition = 'transform .1s ease';
        [0,1,2,3,4,5].forEach(i => {
          setTimeout(() => {
            btn.style.transform = i % 2 === 0
              ? 'rotate(-8deg) scale(1.15)'
              : 'rotate(8deg) scale(1.15)';
          }, i * 80);
        });
        setTimeout(() => { btn.style.transform = ''; }, 560);

        if (aud) { aud.pause(); aud = null; }
        aud = _playAudio(
          (window.THEME_URI || '') + '/assets/audio/easter-eggs/marche-pas-tk78.mp3',
          [220, 196, 165, 147, 131, 110]
        );
        _modal(`
          <div style="font-size:3.5rem;margin-bottom:.75rem;animation:eggPop .4s cubic-bezier(.34,1.56,.64,1)">🍔</div>
          <h2 style="font-family:var(--font-pixel);font-size:1.5rem;color:var(--rose-neon);
                     text-shadow:var(--glow-rose);margin-bottom:.75rem">SPAM DÉTECTÉ !!!</h2>
          <p style="color:var(--texte);font-size:1rem;margin-bottom:.75rem;line-height:1.6">
            Ça marche pas ?<br>
            <span style="color:var(--rose-neon);font-family:var(--font-pixel)">Arrête de spam trou du fion !</span>
          </p>
          <p style="color:#FFD700;font-family:var(--font-pixel);font-size:1.1rem;margin-bottom:.4rem;
                    text-shadow:0 0 10px rgba(255,215,0,.8)">✨ Gloire à TK ! ✨</p>
          <p style="color:var(--texte-dim);font-size:.7rem;font-family:var(--font-pixel)">6× clic = mauvaise idée 🍔</p>`,
        () => { if (aud) { aud.pause(); aud = null; } });
      }, 80);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
})();


/* ════════════════════════════════════════════════════════════
   EGG 12 — Affiche : maintien clic 5s sur l'image de l'affiche
   ⚠️  front-page.php — #popup-affiche img
   v8.7 : utilise _playAudioIOS() pour le son sur iPhone/Safari
          (le touchstart est un geste valide = AudioContext OK)
   ════════════════════════════════════════════════════════════ */
(function () {
  let holdTimer = null;
  let aud       = null;

  function resetAfficheFlag() {
    const img = document.querySelector('#popup-affiche img');
    if (img) img._afficheAttached = false;
  }

  function attachToImg() {
    requestAnimationFrame(() => {
      const img = document.querySelector('#popup-affiche img');
      if (!img || img._afficheAttached) return;
      img._afficheAttached = true;

      img.addEventListener('contextmenu', e => e.preventDefault());

      const startHold = () => {
        clearTimeout(holdTimer);
        img.style.transition = 'filter .3s ease';
        holdTimer = setTimeout(() => {
          img.style.filter = 'brightness(2) saturate(3) hue-rotate(180deg)';
          setTimeout(() => { img.style.filter = ''; }, 600);

          EGG_TRACKER.markFound('affiche');

          // v8.7 : _playAudioIOS() fonctionne sur iPhone car touchstart = geste valide
          if (aud) { try { aud.pause(); } catch(e) {} aud = null; }
          aud = _playAudioIOS(
            (window.THEME_URI || '') + '/assets/audio/easter-eggs/react-burger-minecraft.mp3',
            [330, 294, 262, 220, 196, 175, 165]
          );
          _modal(`
            <div style="font-size:3.5rem;margin-bottom:.75rem;animation:eggPop .4s cubic-bezier(.34,1.56,.64,1)">🖼️</div>
            <h2 style="font-family:var(--font-pixel);font-size:1.8rem;
                       background:linear-gradient(90deg,var(--rose-neon),#ff6b35,#ffd700);
                       -webkit-background-clip:text;-webkit-text-fill-color:transparent;
                       background-clip:text;margin-bottom:.75rem">SALAUD DE BURGER !!!</h2>
            <p style="color:var(--texte);font-size:.95rem;margin-bottom:.75rem;line-height:1.6">
              Tu as tenu 5 secondes sur l'affiche...<br>
              <span style="color:var(--rose-neon);font-family:var(--font-pixel);font-size:.85rem">
                T'as vraiment rien d'autre à faire ? 🍔
              </span>
            </p>
            <p style="color:var(--texte-dim);font-size:.7rem;font-family:var(--font-pixel)">Burger de la honte activé 🏆</p>`,
          () => { if (aud) { try { aud.pause(); } catch(e) {} aud = null; } });
        }, 2500);
      };

      const cancelHold = () => {
        clearTimeout(holdTimer);
        img.style.filter = '';
      };

      img.addEventListener('mousedown',   startHold);
      img.addEventListener('touchstart',  startHold,  { passive: true });
      img.addEventListener('mouseup',     cancelHold);
      img.addEventListener('mouseleave',  cancelHold);
      img.addEventListener('touchend',    cancelHold);
      img.addEventListener('touchcancel', cancelHold);
    });
  }

  function bindPopupClose() {
    const popup    = document.getElementById('popup-affiche');
    const closeBtn = document.getElementById('close-affiche');
    if (!popup) return;
    closeBtn?.addEventListener('click', resetAfficheFlag);
    popup.addEventListener('click', e => {
      if (e.target === popup) resetAfficheFlag();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && popup.style.display === 'flex') resetAfficheFlag();
    });
  }

  function observePopup() {
    const popup = document.getElementById('popup-affiche');
    if (!popup) return;
    bindPopupClose();
    const obs = new MutationObserver(() => {
      const isVisible = popup.style.display !== 'none' && popup.style.display !== '';
      if (isVisible) attachToImg();
    });
    obs.observe(popup, { attributes: true, attributeFilter: ['style'] });
    document.getElementById('btn-affiche-groupe')?.addEventListener('click', () => {
      setTimeout(attachToImg, 100);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      attachToImg();
      observePopup();
    });
  } else {
    attachToImg();
    observePopup();
  }
})();


/* ════════════════════════════════════════════════════════════
   EGG 13 — WEEEE : 5× clic sur #mute-btn (haut-parleur radio)
   ⚠️  page-radio.php — id="mute-btn"
   v8.7 : slider de volume patché avec _patchIOSSlider()
          pour que le glissement tactile fonctionne sur iPhone.
   ════════════════════════════════════════════════════════════ */
(function () {
  function attach() {
    const btn = document.getElementById('mute-btn');
    if (!btn || btn._weeeeAttached) return;
    btn._weeeeAttached = true;

    btn._weeeeCount = 0;
    btn._weeeeTimer = null;
    let aud = null;

    const handleClick = () => {
      setTimeout(() => {
        btn._weeeeCount++;
        clearTimeout(btn._weeeeTimer);
        btn._weeeeTimer = setTimeout(() => { btn._weeeeCount = 0; }, 6000);
        if (btn._weeeeCount < 5) return;

        btn._weeeeCount = 0;
        clearTimeout(btn._weeeeTimer);

        EGG_TRACKER.markFound('weeee');

        // Flash arc-en-ciel
        const flash = document.createElement('div');
        flash.style.cssText = [
          'position:fixed', 'inset:0',
          'background:linear-gradient(135deg,rgba(255,0,128,.25),rgba(0,245,255,.25),rgba(180,79,255,.25))',
          'z-index:99999', 'pointer-events:none', 'opacity:1', 'transition:opacity .5s'
        ].join(';');
        document.body.appendChild(flash);
        setTimeout(() => { flash.style.opacity = '0'; }, 80);
        setTimeout(() => { flash.remove(); }, 600);

        // Rebond du bouton
        btn.style.transition = 'transform .15s ease';
        [0,1,2,3].forEach(i => {
          setTimeout(() => {
            btn.style.transform = i % 2 === 0
              ? 'scale(1.6) rotate(-15deg)'
              : 'scale(1.6) rotate(15deg)';
          }, i * 100);
        });
        setTimeout(() => { btn.style.transform = ''; }, 500);

        /* ── Pop-up avec barre de volume ── */
        const modal = document.getElementById('easter-egg-modal');
        const body  = document.getElementById('easter-egg-content');
        if (!modal) return;

        body.innerHTML = `
          <div style="font-size:3.5rem;margin-bottom:.75rem;animation:eggPop .4s cubic-bezier(.34,1.56,.64,1)">🔊</div>
          <h2 style="font-family:var(--font-pixel);font-size:1.5rem;
                     background:linear-gradient(90deg,var(--bleu-neon),var(--violet),var(--rose-neon));
                     -webkit-background-clip:text;-webkit-text-fill-color:transparent;
                     background-clip:text;margin-bottom:.75rem">WEEEE AAAAAARE...</h2>
          <p style="color:var(--texte);font-size:.95rem;margin-bottom:.5rem;line-height:1.7">
            5 fois sur le haut-parleur ?<br>
            <span style="color:var(--bleu-neon);font-family:var(--font-pixel);font-size:.8rem">
              Mute/Unmute c'est stylé mais là... 🔇
            </span>
          </p>
          <p style="color:var(--vert-neon);font-family:var(--font-pixel);font-size:.85rem;margin-bottom:.4rem">
            🎵 ...THE CHAMPIONS 🎵
          </p>
          <p style="color:var(--texte-dim);font-size:.7rem;font-family:var(--font-pixel);margin-bottom:1rem">
            We are the champions, my friends 🏆
          </p>

          <!-- ── Barre de volume (egg 13 uniquement) ── -->
          <div style="
            display:flex;align-items:center;gap:.7rem;
            background:rgba(0,195,255,.07);
            border:1px solid rgba(0,195,255,.2);
            border-radius:var(--radius,6px);
            padding:.55rem .85rem;margin-top:.25rem;">
            <span id="weeee-vol-icon" style="font-size:1.1rem;line-height:1;flex-shrink:0">🔊</span>
            <input
              id="weeee-vol-slider"
              type="range"
              min="0" max="100" value="60"
              style="
                flex:1;-webkit-appearance:none;appearance:none;
                height:5px;border-radius:3px;outline:none;cursor:pointer;
                touch-action: none; /* <-- LIGNE AJOUTÉE POUR IPHONE */
                background:linear-gradient(to right,var(--bleu-neon) 60%,rgba(255,255,255,.15) 60%);
              "
            />
            <span id="weeee-vol-label" style="
              font-family:var(--font-pixel);font-size:.7rem;
              color:var(--bleu-neon);min-width:2.5rem;text-align:right;
              text-shadow:var(--glow-bleu)">60%</span>
          </div>`;

        /* Inject slider thumb styles once */
        if (!document.getElementById('weeee-slider-style')) {
          const ss = document.createElement('style');
          ss.id = 'weeee-slider-style';
          ss.textContent = `
            #weeee-vol-slider::-webkit-slider-thumb {
              -webkit-appearance:none;appearance:none;
              width:18px;height:18px;border-radius:50%;
              background:var(--bleu-neon);
              box-shadow:0 0 6px rgba(0,195,255,.7);
              cursor:pointer;
            }
            #weeee-vol-slider::-moz-range-thumb {
              width:18px;height:18px;border:none;border-radius:50%;
              background:var(--bleu-neon);
              box-shadow:0 0 6px rgba(0,195,255,.7);
              cursor:pointer;
            }
          `;
          document.head.appendChild(ss);
        }

        /* v8.8/v8.9 — fermeture uniquement via bouton ou Échap
           + verrou anti-double-modal + lancement du final en attente */
        if (_EGG_MODAL_OPEN) return; // v8.9 : bloquer si un modal est déjà visible
        const closeBtn = document.getElementById('egg-close-btn');
        function _closeWeeee() {
          modal.classList.remove('show');
          document.removeEventListener('keydown', _onEscWeeee);
          _EGG_MODAL_OPEN = false;   // v8.9 : libère le verrou
          if (aud) { aud.pause(); aud = null; }
          /* v8.9 — si le final était en attente, on le lance maintenant */
          if (_pendingFinalEgg) {
            _pendingFinalEgg = false;
            setTimeout(EGG_TRACKER._triggerFinal, 400);
          }
        }
        function _onEscWeeee(e) {
          if (e.key === 'Escape') _closeWeeee();
        }
        closeBtn?.addEventListener('click', _closeWeeee, { once: true });
        document.addEventListener('keydown', _onEscWeeee);

        _EGG_MODAL_OPEN = true;      // v8.9 : pose le verrou
        modal.classList.add('show');

        /* Lance le son */
        if (aud) { aud.pause(); aud = null; }
        aud = _playAudio(
          (window.THEME_URI || '') + '/assets/audio/easter-eggs/we-are-funk.mp3',
          [523, 659, 784, 880, 988, 1047, 988, 880]
        );
        aud.volume = 0.6;

        /* ── v8.7 : patch iOS slider ──
           Le slider est dans le DOM à ce stade (modal.classList.add('show') avant).
           On utilise requestAnimationFrame pour s'assurer que le DOM est rendu
           avant d'attacher les événements tactiles.
        ── */
        requestAnimationFrame(() => {
          const slider = document.getElementById('weeee-vol-slider');
          const label  = document.getElementById('weeee-vol-label');
          const icon   = document.getElementById('weeee-vol-icon');
          if (!slider) return;

          const updateFromValue = (rawVal) => {
            const v = Math.round(parseFloat(rawVal));
            if (aud) aud.volume = v / 100;
            if (label) label.textContent = v + '%';
            if (icon)  icon.textContent  = v === 0 ? '🔇' : v < 40 ? '🔉' : '🔊';
            /* Met à jour le dégradé de la track */
            slider.style.background =
              `linear-gradient(to right,var(--bleu-neon) ${v}%,rgba(255,255,255,.15) ${v}%)`;
          };

          // Patch iOS : remplace l'event "input" par des touch events manuels
          _patchIOSSlider(slider, updateFromValue);
        });

      }, 80);
    };

    btn.addEventListener('click',    handleClick);
    btn.addEventListener('touchend', e => {
      e.preventDefault();
      handleClick();
    }, { passive: false });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
})();


/* ════════════════════════════════════════════════════════════
   EGG 14 — 67 : clic sur "v6.7" dans l'écran de boot
   ⚠️  PAGE accueil — id="boot-version"
   ════════════════════════════════════════════════════════════ */
(function () {
  function attach() {
    const el = document.getElementById('boot-version');
    if (!el || el._67Attached) return;
    el._67Attached = true;

    let aud = null;

    el.addEventListener('click', () => {
      EGG_TRACKER.markFound('67');

      el.style.color = 'var(--rose-neon)';
      el.style.textShadow = 'var(--glow-rose)';
      setTimeout(() => { el.style.color = ''; el.style.textShadow = ''; }, 600);

      if (aud) { aud.pause(); aud = null; }
      aud = _bootAudioRegistry.play(
        (window.THEME_URI || '') + '/assets/audio/easter-eggs/67.mp3',
        [196, 220, 247, 262, 294, 330, 349, 392]
      );
      _modal(`
        <div style="font-size:3.5rem;margin-bottom:.75rem;animation:eggPop .4s cubic-bezier(.34,1.56,.64,1)">🔢</div>
        <h2 style="font-family:var(--font-pixel);font-size:2rem;
                   color:var(--rose-neon);text-shadow:var(--glow-rose);
                   margin-bottom:.75rem;letter-spacing:.15em">67 !</h2>
        <p style="color:var(--texte);font-size:.9rem;margin-bottom:.75rem;line-height:1.7">
          v6.7 — pas un hasard...<br>
          <span style="color:var(--rose-neon);font-family:var(--font-pixel);font-size:.85rem">
            T'as cliqué sur le numéro de version. Respect. 🎤
          </span>
        </p>
        <p style="color:var(--texte-dim);font-size:.7rem;font-family:var(--font-pixel)">PROJET BTS SIO · TS1 · 2026 🏆</p>`,
      () => { if (aud) { aud.pause(); aud = null; } });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
})();


/* ════════════════════════════════════════════════════════════
   EGG 15 — Klemz : clic sur "Klemz" dans l'écran de boot
   ════════════════════════════════════════════════════════════ */
(function () {
  function attach() {
    const el = document.getElementById('boot-klemz');
    if (!el || el._klemzAttached) return;
    el._klemzAttached = true;

    let aud = null;

    el.addEventListener('click', () => {
      EGG_TRACKER.markFound('klemz');

      el.style.transition = 'color .15s ease, text-shadow .15s ease, transform .1s ease';
      el.style.color = 'var(--bleu-neon)';
      el.style.textShadow = 'var(--glow-bleu)';
      [0,1,2,3].forEach(i => {
        setTimeout(() => {
          el.style.transform = i % 2 === 0 ? 'translateX(-3px)' : 'translateX(3px)';
        }, i * 60);
      });
      setTimeout(() => { el.style.color = ''; el.style.textShadow = ''; el.style.transform = ''; }, 350);

      if (aud) { aud.pause(); aud = null; }
      aud = _bootAudioRegistry.play(
        (window.THEME_URI || '') + '/assets/audio/easter-eggs/canette.mp3',
        [523, 659, 784, 880, 1047]
      );
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
})();


/* ════════════════════════════════════════════════════════════
   EGG 16 — Steakman63 : clic sur "Steakman63" dans l'écran de boot
   ════════════════════════════════════════════════════════════ */
(function () {
  function attach() {
    const el = document.getElementById('boot-steakman');
    if (!el || el._steakmanAttached) return;
    el._steakmanAttached = true;

    let aud = null;

    el.addEventListener('click', () => {
      EGG_TRACKER.markFound('steakman');

      el.style.transition = 'color .15s ease, text-shadow .15s ease';
      el.style.color = 'var(--rose-neon)';
      el.style.textShadow = 'var(--glow-rose)';
      setTimeout(() => { el.style.color = ''; el.style.textShadow = ''; }, 500);

      if (aud) { aud.pause(); aud = null; }
      aud = _bootAudioRegistry.play(
        (window.THEME_URI || '') + '/assets/audio/easter-eggs/tk78-manges-tes-morts.mp3',
        [330, 330, 392, 440, 494, 523, 494, 440]
      );
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
})();


/* ════════════════════════════════════════════════════════════
   EGG 17 — Pingouy : clic sur "Pingouy" dans l'écran de boot
   ════════════════════════════════════════════════════════════ */
(function () {
  function attach() {
    const el = document.getElementById('boot-pingouy');
    if (!el || el._pingouyAttached) return;
    el._pingouyAttached = true;

    let aud = null;

    el.addEventListener('click', () => {
      EGG_TRACKER.markFound('pingouy');

      el.style.transition = 'color .15s ease, text-shadow .15s ease, transform .2s ease';
      el.style.color = 'var(--vert-neon)';
      el.style.textShadow = '0 0 10px rgba(57,255,20,.7)';
      el.style.transform = 'rotate(-5deg) scale(1.1)';
      setTimeout(() => { el.style.color = ''; el.style.textShadow = ''; el.style.transform = ''; }, 500);

      if (aud) { aud.pause(); aud = null; }
      aud = _bootAudioRegistry.play(
        (window.THEME_URI || '') + '/assets/audio/easter-eggs/masse-fart.mp3',
        [110, 98, 87, 73, 65, 55]
      );
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
})();


/* ════════════════════════════════════════════════════════════
   EGG 18 — Krem Brûlé : clic sur "Krem Brûlé" dans l'écran de boot
   ════════════════════════════════════════════════════════════ */
(function () {
  function attach() {
    const el = document.getElementById('boot-krembrule');
    if (!el || el._krembruleAttached) return;
    el._krembruleAttached = true;

    let aud = null;

    el.addEventListener('click', () => {
      EGG_TRACKER.markFound('krembrule');

      el.style.transition = 'color .15s ease, text-shadow .15s ease, transform .2s ease';
      el.style.color = 'var(--violet)';
      el.style.textShadow = 'var(--glow-violet)';
      el.style.transform = 'scale(1.15)';
      setTimeout(() => { el.style.color = ''; el.style.textShadow = ''; el.style.transform = ''; }, 500);

      if (aud) { aud.pause(); aud = null; }
      aud = _bootAudioRegistry.play(
        (window.THEME_URI || '') + '/assets/audio/easter-eggs/sylvain-durif.mp3',
        [392, 440, 494, 523, 587, 659, 698, 784]
      );
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
})();


/* ════════════════════════════════════════════════════════════
   FERMETURE DU MODAL
   v8.8 — Le clic sur le fond sombre NE ferme plus le modal.
          Seuls le bouton [ FERMER ] et la touche Échap ferment.
          La logique principale est dans _modal() et _triggerFinalEgg().
          Ce bloc gère uniquement l'initialisation du bouton au
          chargement de la page (cas sans egg actif au démarrage).
   ════════════════════════════════════════════════════════════ */
(function () {
  function attach() {
    const modal = document.getElementById('easter-egg-modal');
    const btn   = document.getElementById('egg-close-btn');
    if (!modal) return;
    /* Le bouton ferme le modal (fallback de sécurité si _modal() ne l'a pas capté) */
    btn?.addEventListener('click', () => { modal.classList.remove('show'); _EGG_MODAL_OPEN = false; });
    /* ⚠️ Pas de listener sur modal lui-même : clic sur le fond désactivé */
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach);
  else attach();
})();