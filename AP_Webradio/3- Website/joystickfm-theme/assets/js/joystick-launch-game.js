/* ============================================================
   JOYSTICK FM — joystick-launch-game.js  v6.0
   Jeu catapulte arcade — Trebuchet (Google Garden Gnome style)

   NOUVEAUTÉS v6.0 :
   - Leaderboard agrandi (textes lisibles, panneaux élargis)
   - Adaptation mobile complète
   - Physique aérienne : quasi 0 perte de vitesse dans les airs
   - Personnages allégés : GROUND_FRIC élevé, aerodynamics++
   - Catapulte encore plus rapide et puissante (×3.0)
   - Caméra corrigée : suit le joueur vers le HAUT
   - Écran de fin agrandi, textes lisibles
   - Saisie du pseudo déplacée sous le leaderboard
   - Un seul gant de boxe (plus compact)
   - Navigation ZQSD + souris (clic personnage/skin)
   - Cooldown 5 secondes sur la compétence piqué
   - Système d'achievements avec toast
   - Skins / cosmétiques par personnage
   - Grande fenêtre + effet CRT cathodique
   ============================================================ */

'use strict';

(function () {

/* ══════════════════════════════════════════════════════════
   STYLES DU JEU
══════════════════════════════════════════════════════════ */
const GAME_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

#jfm-game-overlay, #jfm-game-overlay * {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: geometricPrecision;
}
#jfm-game-overlay {
  position: fixed; inset: 0; z-index: 100000;
  background: #000; overflow: hidden;
  opacity: 0; transition: opacity .35s ease;
  font-family: 'Orbitron', monospace;
  /* Forcer paysage sur mobile */
  width: 100dvw; height: 100dvh;
}
#jfm-game-overlay.visible { opacity: 1; }

body.jfm-game-active {
  overflow: hidden !important;
  touch-action: none !important;
  overscroll-behavior: none !important;
  position: fixed !important; width: 100% !important;
}
/* ── Bouton Fermer ── */
#jfm-game-close {
  position: absolute; top: 10px; right: 12px; z-index: 30;
  background: rgba(255,68,136,.14); border: 2px solid rgba(255,68,136,.55);
  color: #ff4488; font-size: 1.2rem;
  width: 40px; height: 40px; border-radius: 50%;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  padding: 0; line-height: 1;
  transition: background .2s, transform .15s, box-shadow .2s;
  box-shadow: 0 0 10px rgba(255,68,136,.2);
}
#jfm-game-close:hover { background:rgba(255,68,136,.28); box-shadow:0 0 22px rgba(255,68,136,.5); transform:scale(1.1) rotate(15deg); }
#jfm-game-close:active { transform:scale(.93); }

/* ── Canvas wrapper ── */
#jfm-crt-wrap {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
}
/* Coin légèrement arrondi uniquement (halo supprimé) */
#jfm-crt-wrap::before {
  content:''; position:absolute; inset:-2px; border-radius:6px;
  box-shadow: 0 0 0 2px rgba(0,240,255,.12), 0 0 30px rgba(0,240,255,.15);
  pointer-events:none; z-index:2;
}
#jfm-game-canvas {
  display: block;
  width: 100dvw !important; height: 100dvh !important;
  image-rendering: auto;
  border-radius: 0;
  position: relative; z-index: 1;
}

/* ── Saisie pseudo — sous le leaderboard ── */
#jfm-lb-name-wrap {
  position: absolute;
  /* positionné dynamiquement via JS selon taille LB */
  left: 12px; top: 420px;
  z-index: 15;
  display: none; flex-direction: row; align-items: center; gap: 8px;
  background: rgba(5,0,20,.95);
  border: 1px solid rgba(0,240,255,.45); border-radius: 8px;
  padding: 8px 12px;
}
@media (max-width: 600px), (max-height: 450px) {
  #jfm-lb-name-wrap { left:4px; gap:5px; padding:6px 8px; }
}
#jfm-lb-name-input {
  font-family: 'Share Tech Mono', monospace; font-size: .8rem;
  background: rgba(0,240,255,.08); border: 1px solid rgba(0,240,255,.4);
  color: #00f0ff; padding: 7px 10px; text-align: center;
  border-radius: 5px; outline: none; width: 130px; letter-spacing: .06em;
}
#jfm-lb-name-input::placeholder { color: rgba(0,240,255,.35); }
#jfm-lb-name-save {
  font-family: 'Orbitron', monospace; font-size: .55rem;
  background: rgba(255,230,0,.12); border: 1px solid rgba(255,230,0,.5);
  color: #ffe600; padding: 7px 12px; cursor: pointer;
  border-radius: 5px; letter-spacing: .06em; transition: background .2s; white-space: nowrap;
}
#jfm-lb-name-save:hover { background: rgba(255,230,0,.25); }

/* ── Achievement toast ── */
#jfm-ach-toast {
  position: absolute; top: 12px; left: 50%;
  transform: translateX(-50%) translateY(-80px); opacity: 0;
  transition: transform .35s cubic-bezier(.34,1.56,.64,1), opacity .3s ease;
  z-index: 20; background: rgba(5,0,25,.97);
  border: 2px solid rgba(255,230,0,.7); border-radius: 10px; padding: 8px 16px;
  display: flex; align-items: center; gap: 9px;
  pointer-events: none; box-shadow: 0 0 24px rgba(255,230,0,.3); white-space: nowrap;
}
#jfm-ach-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
.jfm-at-icon { font-size: 1.3rem; line-height:1; }
.jfm-at-body { display: flex; flex-direction: column; gap: 2px; }
.jfm-at-label { font-family:'Orbitron',monospace; font-size:.38rem; color:#ffe600; letter-spacing:.1em; }
.jfm-at-name  { font-family:'Orbitron',monospace; font-size:.52rem; color:#fff; }

/* ── Bouton Réessayer — positionné dynamiquement par JS à droite du cooldown ── */
#jfm-retry-btn {
  position: absolute;
  z-index: 15;
  background: transparent; border: none;
  color: #00f0ff; font-size: 1.4rem;
  width: 76px; height: 76px; border-radius: 50%;
  cursor: pointer; padding: 0; line-height: 1;
  display: none; align-items: center; justify-content: center;
  transition: filter .2s, transform .15s;
  box-shadow:
    0 0 0 3px rgba(0,240,255,.22),
    0 0 0 6px rgba(0,240,255,.09),
    0 0 22px rgba(0,240,255,.28);
}
#jfm-retry-btn.visible { display: flex; }
#jfm-retry-btn .jfm-rb-inner {
  width: 100%; height: 100%;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,240,255,.10);
  border: 2.5px solid rgba(0,240,255,.55);
  font-size: 1.5rem;
  transition: background .2s;
}
#jfm-retry-btn:hover .jfm-rb-inner { background: rgba(0,240,255,.28); }
#jfm-retry-btn:hover { filter: drop-shadow(0 0 12px #00f0ff); transform: scale(1.1) rotate(-18deg); }
#jfm-retry-btn:active { transform: scale(.93); }
/* Label sous le bouton */
#jfm-retry-btn::after {
  content: 'RETRY';
  position: absolute;
  bottom: -18px; left: 50%;
  transform: translateX(-50%);
  font-family: 'Share Tech Mono', monospace;
  font-size: .58rem;
  color: #00f0ff;
  white-space: nowrap;
  letter-spacing: .08em;
  opacity: .85;
}

/* Contrôles mobiles masqués (tap canvas suffit) */
#jfm-mobile-controls { display: none !important; }
`



/* ══════════════════════════════════════════════════════════
   DOM — Overlay
══════════════════════════════════════════════════════════ */
function createOverlay() {
  if (document.getElementById('jfm-game-overlay')) {
    return;
  }

  const st = document.createElement('style');
  st.textContent = GAME_STYLES;
  document.head.appendChild(st);

  const overlay = document.createElement('div');
  overlay.id = 'jfm-game-overlay';

  const closeBtn = document.createElement('button');
  closeBtn.id = 'jfm-game-close';
  closeBtn.textContent = '✕';
  closeBtn.title = 'Quitter le jeu';
  closeBtn.addEventListener('click', closeGameOverlay);

  // CRT wrapper + canvas
  const crtWrap = document.createElement('div');
  crtWrap.id = 'jfm-crt-wrap';

  const canvas = document.createElement('canvas');
  canvas.id = 'jfm-game-canvas';
  crtWrap.appendChild(canvas);

  // Name input — inside crtWrap so it's positioned relative to canvas
  const lbWrap = document.createElement('div');
  lbWrap.id = 'jfm-lb-name-wrap';
  lbWrap.innerHTML = `
    <p style="font-family:'Orbitron',monospace;font-size:.52rem;color:#ffe600;margin:0;letter-spacing:.06em;">▼ ENTRER TON NOM ▼</p>
    <input id="jfm-lb-name-input" maxlength="12" placeholder="TON NOM ICI" type="text" tabindex="-1" autocomplete="off">
    <button id="jfm-lb-name-save">✔ SAUVEGARDER</button>
  `;

  // Achievement toast
  const achToast = document.createElement('div');
  achToast.id = 'jfm-ach-toast';
  achToast.innerHTML = `
    <div class="jfm-at-icon">🏆</div>
    <div class="jfm-at-body">
      <div class="jfm-at-label">ACHIEVEMENT UNLOCKED</div>
      <div class="jfm-at-name" id="jfm-at-name-text">—</div>
    </div>`;

  // Mobile controls
  const mobControls = document.createElement('div');
  mobControls.id = 'jfm-mobile-controls';
  mobControls.innerHTML = `
    <button class="jfm-mob-btn" id="jfm-mob-action">ACTION<br>▶</button>
  `;

  // Retry button
  const retryBtn = document.createElement('button');
  retryBtn.id = 'jfm-retry-btn';
  retryBtn.title = 'Réessayer';
  retryBtn.innerHTML = '<div class="jfm-rb-inner">↺</div>';
  retryBtn.style.display = 'none';
  retryBtn.addEventListener('click', () => {
    // Animation flash sur clic
    retryBtn.classList.add('jfm-rb-flash');
    setTimeout(() => retryBtn.classList.remove('jfm-rb-flash'), 220);
    const lbWrap = document.getElementById('jfm-lb-name-wrap');
    if (lbWrap) lbWrap.style.display = 'none';
    reset();
  });

  overlay.appendChild(closeBtn);
  overlay.appendChild(crtWrap);
  crtWrap.appendChild(lbWrap);
  crtWrap.appendChild(retryBtn);
  overlay.appendChild(achToast);
  overlay.appendChild(mobControls);
  document.body.appendChild(overlay);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('jfm-game-overlay')?.classList.contains('visible')) {
      closeGameOverlay();
    }
  });
}

function openGameOverlay() {
  if (typeof window.JFM_PLAYER_AUTH !== 'undefined' && !window.JFM_PLAYER_AUTH.logged_in) {
    if (window.JFM_PLAYER_AUTH.login_url) {
      window.location.href = window.JFM_PLAYER_AUTH.login_url;
    }
    return;
  }
  createOverlay();
  lbNamePending = false;
  const overlay = document.getElementById('jfm-game-overlay');
  overlay.style.display = 'flex';
  requestAnimationFrame(() => {
    overlay.classList.add('visible');
    initGame();
  });
}

function closeGameOverlay() {
  const overlay = document.getElementById('jfm-game-overlay');
  if (!overlay) return;
  overlay.classList.remove('visible');
  stopGame();
  const lbWrap = document.getElementById('jfm-lb-name-wrap');
  if (lbWrap) lbWrap.style.display = 'none';
  setTimeout(() => { overlay.style.display = 'none'; }, 400);
}

/* ══════════════════════════════════════════════════════════
   GAME ENGINE — CONSTANTES
══════════════════════════════════════════════════════════ */

let canvas, ctx;
let W, H, GY;
let rafId = null;
let gameRunning = false;

// -- Physique --
const GRAVITY     = 0.10;   // physique molle
const DIVE_ACCEL  = 0.45;
const DIVE_DUR    = 20;
const GROUND_FRIC = 0.88;   // friction modérée — conserve mieux la vitesse horizontale
const AIR_FRIC    = 0.9985; // légère résistance de l'air
const BOUNCE_DAMPEN = 0.76; // amortissement des rebonds (augmenté pour plus de hauteur)

// -- Cooldown compétence --
const DIVE_COOLDOWN = 120; // 2 secondes @ 60fps

// -- Trebuchet (v6.0 encore plus puissant) --
const PIV_X       = 120;
const PIV_Y_OFF   = 90;
const ARM_L       = 100;
const ARM_REST    = Math.PI * 0.75;
const ARM_MAX     = Math.PI * 1.90;
const SWING_ACCEL = 0.0012;  // catapulte lente — physique molle

// -- Safe zone : aucun obstacle avant 200m --
const LAUNCH_X  = 280;
const SAFE_END  = LAUNCH_X + 500;

// -- State machine --
let state = 'menu';
let selChar = 0;
let currentDist = 0;
let maxDist = 0;
let best = 0;
let camX = 0;
let camY = 0;
let frame = 0;
let particles = [];
let trails = [];
let terrain = [];
let terrainMaxX = 0;
let flowerPosX = [];

// Trebuchet state
let armAngle = ARM_REST;
let armSpeed = 0;
let armActualSpeed = 0; // vitesse angulaire réelle (peut être négative lors du retour)

// Dive state
let isDiving = false;
let diveFrames = 0;
let canDive = true;
let diveCooldownTimer = 0;

// Death
let deathTimer = 0;
let bestUpdated = false;
let lbNamePending = false;
let lbSavedThisRun = false;

// Cannon absorption
let isAbsorbed = false;
let absorbTimer = 0;
let absorbCannon = null;
let bounceCount = 0;
let cannonHitCount = 0;
let diveUsedCount = 0;
let minDist = 0; // distance minimale (territoire négatif)
let maxAlt = 0; // altitude maximale atteinte (en mètres)
let gloveHitCount = 0;
let butterflyCount = 0;
let cloudHitCount = 0;
let consecGloves = 0;
let wasNegative = false;
let airborneFr = 0; // frames consécutives en vol
let runFrame = 0; // frame counter for current run

// Canon secret — repositionné à -500m (échelle 5px/m → x = -2500px)
const SECRET_CANNON = { x: -2500, w: 88, h: 60, type: 'secret_cannon', hit: false };
let secretFired = false;

// Première partie : afficher les contrôles, ensuite bouton toggle
let hasPlayedOnce = false;
let showControlsOverlay = false;
let showTrophiesPanel = false;
let showArchivesPanel = false;
let trophiesPanelScroll = 0;
try { hasPlayedOnce = !!localStorage.getItem('jfm_played_once'); } catch(e) {}

// Mobile detection
const isMobile = /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent) ||
  (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1);


// Catapulte retour de force (si joueur ne se découple pas)
let catapulteReturning = false;
let catapulteReturnSpeed = 0;

// Bouton Réessayer DOM
let retryBtnShown = false;
// Delta-time scale (updated each frame)
let _dtScale = 1.0;

/* ══════════════════════════════════════════════════════════
   SONS — Web Audio API synthétisés
══════════════════════════════════════════════════════════ */
let _audioCtx = null;
function _getAudio() {
  if (!_audioCtx) {
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }
  return _audioCtx;
}
function _playSound(type) {
  const ac = _getAudio();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    const t = ac.currentTime;
    if (type === 'launch') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.12);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.28);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t); osc.stop(t + 0.35);
    } else if (type === 'swing') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.linearRampToValueAtTime(400, t + 0.15);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.start(t); osc.stop(t + 0.18);
    } else if (type === 'bounce') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.start(t); osc.stop(t + 0.15);
    } else if (type === 'glove') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.1);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.start(t); osc.stop(t + 0.15);
    } else if (type === 'cannon') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.22);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.start(t); osc.stop(t + 0.28);
    } else if (type === 'land') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, t);
      osc.frequency.exponentialRampToValueAtTime(20, t + 0.4);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.start(t); osc.stop(t + 0.5);
    } else if (type === 'return_force') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.3);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t); osc.stop(t + 0.35);
    } else if (type === 'menu') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.setValueAtTime(550, t + 0.08);
      osc.frequency.setValueAtTime(660, t + 0.16);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.start(t); osc.stop(t + 0.28);
    } else if (type === 'butterfly') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.08);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.20);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.start(t); osc.stop(t + 0.28);
    } else if (type === 'cloud_bounce') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.linearRampToValueAtTime(500, t + 0.1);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.start(t); osc.stop(t + 0.18);
    } else if (type === 'mud_splat') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.linearRampToValueAtTime(40, t + 0.25);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t); osc.stop(t + 0.35);
    } else if (type === 'dive_start') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(500, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.15);
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.start(t); osc.stop(t + 0.18);
    } else if (type === 'achievement') {
      // Jingle achievement 3 notes montantes
      const osc2 = ac.createOscillator();
      const gain2 = ac.createGain();
      osc2.connect(gain2); gain2.connect(ac.destination);
      osc.type = 'triangle'; osc2.type = 'triangle';
      osc.frequency.setValueAtTime(523, t); osc.frequency.setValueAtTime(659, t+0.12); osc.frequency.setValueAtTime(784, t+0.24);
      osc2.frequency.setValueAtTime(1046, t+0.24);
      gain.gain.setValueAtTime(0.18, t); gain.gain.setValueAtTime(0.18, t+0.12); gain.gain.setValueAtTime(0.18, t+0.24); gain.gain.exponentialRampToValueAtTime(0.001, t+0.5);
      gain2.gain.setValueAtTime(0.22, t+0.24); gain2.gain.exponentialRampToValueAtTime(0.001, t+0.5);
      osc.start(t); osc.stop(t+0.45);
      osc2.start(t+0.24); osc2.stop(t+0.5);
    } else if (type === 'solar') {
      // Son mystérieux en atteignant le système solaire
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.6);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
      osc.start(t); osc.stop(t + 0.7);
    } else if (type === 'milkyway') {
      // Accord cosmique
      for (let h = 1; h <= 3; h++) {
        const oh = ac.createOscillator();
        const gh = ac.createGain();
        oh.connect(gh); gh.connect(ac.destination);
        oh.type = 'sine';
        oh.frequency.setValueAtTime(110 * h, t);
        gh.gain.setValueAtTime(0.08 / h, t);
        gh.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
        oh.start(t); oh.stop(t + 1.2);
      }
    }
  } catch(e) {}
}

// Son de gant selon niveau de puissance
function _playGlovePowerSound(level) {
  const ac = _getAudio();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    const t = ac.currentTime;
    const freqs = [80, 120, 180, 260, 400];
    const vols  = [0.15, 0.22, 0.3, 0.38, 0.5];
    osc.type = 'square';
    osc.frequency.setValueAtTime(freqs[level-1] || 120, t);
    osc.frequency.exponentialRampToValueAtTime((freqs[level-1] || 120) * 0.4, t + 0.15);
    gain.gain.setValueAtTime(vols[level-1] || 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.start(t); osc.stop(t + 0.18);
  } catch(e) {}
}

// Character
const ch = { x: 0, y: 0, vx: 0, vy: 0, rot: 0, angV: 0 };

/* ══════════════════════════════════════════════════════════
   PERSONNAGES — aerodynamics nettement améliorés
══════════════════════════════════════════════════════════ */
const CHARS = [
  // mu     : coefficient de friction de Coulomb (Rigid Body Dynamics)
  //          élevé = la base griffe le sol → culbute rapide
  //          faible = surface glissante → glisse loin avant de tourner
  // shapeType : utilisé pour les effets visuels et le label dans le menu
  //
  //  Moments d'inertie calculés à runtime : I = mass*(4*hw²+4*hh²)/12
  //  hw = size*hitW, hh = size*hitH
  //  CTRL PAD  I≈279  JOY STICK I≈119  MEGA PAD  I≈768
  //  RETRO X   I≈350  HEADSET   I≈191  ARCADE    I≈505
  // diveType : 'vertical'  → piqué droit vers le bas (standard)
  //            'diagonal'  → piqué diagonal + boost de vélocité horizontale
  //            'zerograv'  → annulation temporaire de la gravité (suspension)
  //            'heavy'     → piqué vertical mais masse doublée (écrasement)
  //
  // JOY STICK (jaune, idx 1) : mu relevé à 0.72 — force la culbute immédiate
  //   au contact sol ; vx → ω converti agressivement, plus de glissade.
  //
  // MEGA PAD  (vert,  idx 2) : shapeType 'tri' → hitbox triangle à coins
  //   légèrement arrondis ; les trois sommets créent un effet "roue carrée"
  //   avec transfert de torque asymétrique à chaque rebond.
  { name: 'CTRL PAD',  col: '#00f0ff', acc: '#003344', mass: 1.0, aerodynamics: 0.9994, bounciness: 0.44, size: 22, hitW: 0.72, hitH: 1.10, locked: false, desc: 'Equilibre - Culbutes regulieres',       skill: 'PIQUE', mu: 0.52, shapeType: 'round', diveType: 'vertical'  },
  { name: 'JOY STICK', col: '#ffe600', acc: '#333300', mass: 0.7, aerodynamics: 0.9997, bounciness: 0.34, size: 18, hitW: 0.82, hitH: 0.95, locked: false, desc: 'Leger - Culbute nette, pique diagonal',  skill: 'PIQUE', mu: 0.72, shapeType: 'hex',   diveType: 'diagonal'  },
  { name: 'MEGA PAD',  col: '#00ff88', acc: '#003322', mass: 1.8, aerodynamics: 0.9920, bounciness: 0.48, size: 30, hitW: 0.80, hitH: 1.30, locked: false, desc: 'Lourd - Triangle devastateur (torque)',  skill: 'PIQUE', mu: 0.78, shapeType: 'tri',   diveType: 'heavy'     },
  { name: 'RETRO X',   col: '#ff4488', acc: '#440022', mass: 1.2, aerodynamics: 0.9960, bounciness: 0.47, size: 24, hitW: 0.72, hitH: 1.00, locked: false, desc: 'Hybride - Roule sur les coins',          skill: 'PIQUE', mu: 0.46, shapeType: 'oval',  diveType: 'vertical'  },
  { name: 'HEADSET',   col: '#bb44ff', acc: '#220044', mass: 0.9, aerodynamics: 0.9996, bounciness: 0.49, size: 20, hitW: 0.70, hitH: 1.05, locked: true,  desc: 'Debloque a 500m',                        skill: 'PIQUE', mu: 0.50, shapeType: 'round', diveType: 'zerograv'  },
  { name: 'ARCADE',    col: '#ff8800', acc: '#331100', mass: 1.4, aerodynamics: 0.9870, bounciness: 0.53, size: 26, hitW: 0.80, hitH: 0.98, locked: true,  desc: 'Debloque a 1000m',                        skill: 'PIQUE', mu: 0.34, shapeType: 'hex',  diveType: 'diagonal'  },
];

/* ══════════════════════════════════════════════════════════
   SKINS / COSMÉTIQUES
══════════════════════════════════════════════════════════ */
const SKINS = [
  // CTRL PAD
  [{ col:'#00f0ff',acc:'#003344',name:'Cyan' },   { col:'#ff4488',acc:'#440022',name:'Rose' },   { col:'#ffe600',acc:'#443300',name:'Gold' }],
  // JOY STICK
  [{ col:'#ffe600',acc:'#333300',name:'Gold' },   { col:'#00ff88',acc:'#003322',name:'Vert' },   { col:'#bb44ff',acc:'#220044',name:'Violet' }],
  // MEGA PAD
  [{ col:'#00ff88',acc:'#003322',name:'Vert' },   { col:'#ff8800',acc:'#331100',name:'Orange' }, { col:'#00f0ff',acc:'#003344',name:'Ice' }],
  // RETRO X
  [{ col:'#ff4488',acc:'#440022',name:'Rose' },   { col:'#00f0ff',acc:'#003344',name:'Cyan' },   { col:'#ffe600',acc:'#443300',name:'Gold' }],
  // HEADSET
  [{ col:'#bb44ff',acc:'#220044',name:'Violet' }, { col:'#ff4488',acc:'#440022',name:'Rose' },   { col:'#00f0ff',acc:'#003344',name:'Ice' }],
  // ARCADE
  [{ col:'#ff8800',acc:'#331100',name:'Orange' }, { col:'#00ff88',acc:'#003322',name:'Vert' },   { col:'#ff4488',acc:'#440022',name:'Rose' }],
];

let selSkin = [0, 0, 0, 0, 0, 0];

function getCharSkin(idx) {
  return SKINS[idx]?.[selSkin[idx]] || { col: CHARS[idx].col, acc: CHARS[idx].acc };
}

function loadSkinsFromStorage() {
  try { const s = JSON.parse(localStorage.getItem('jfm_skins_v1')); if (Array.isArray(s)) selSkin = s; } catch(e) {}
}
function saveSkinsToStorage() {
  try { localStorage.setItem('jfm_skins_v1', JSON.stringify(selSkin)); } catch(e) {}
}

/* ══════════════════════════════════════════════════════════
   ACHIEVEMENTS
══════════════════════════════════════════════════════════ */
const ACHIEVEMENTS = {
  KEY: 'jfm_achievements_v1',
  _list: [
    // ── DISTANCE ─────────────────────────────────────────────────────────────
    { id: 'dist_1000',      icon: '🏆', name: 'KILOMÈTRE',        desc: 'Atteindre 1000m',              hint: 'Utilise les canons et les gants pour conserver ta vitesse.' },
    { id: 'dist_2000',      icon: '🌟', name: '2 KILOMÈTRES',     desc: 'Atteindre 2000m',              hint: 'Enchaîne les canons et optimise le timing du lancer.' },
    { id: 'dist_5000',      icon: '🌌', name: 'LÉGENDE',          desc: 'Atteindre 5000m',              hint: 'La distance ultime. Demande perfection et acharnement.' },
    // ── ALTITUDE ─────────────────────────────────────────────────────────────
    { id: 'alt_1000',       icon: '🌠', name: 'GALAXIE',          desc: 'Atteindre 1200m en altitude',  hint: 'Combine les gants max + piqué sur nuage pour exploser en hauteur.' },
    { id: 'alt_2000',       icon: '🌌', name: 'VOIE LACTÉE',      desc: 'Atteindre 2200m en altitude',  hint: 'Utilise MEGA PAD et enchaine les propulsions verticales.' },
    { id: 'alt_5000',       icon: '🔭', name: 'ESPACE PROFOND',   desc: 'Atteindre 5000m en altitude',  hint: 'Quasi impossible. Tous les éléments doivent se combiner parfaitement.' },
    // ── REBONDS ──────────────────────────────────────────────────────────────
    { id: 'bounce_20',      icon: '🎡', name: 'BOULE DE FLIPPER', desc: '20 rebonds en un essai',       hint: 'Reste sur le sol longtemps en choisissant MEGA PAD ou RETRO X.' },
    { id: 'bounce_50',      icon: '🌀', name: 'REBOND ÉTERNEL',   desc: '50 rebonds en un essai',       hint: 'MEGA PAD en terrain plat, sans mourir dans la boue.' },
    // ── TERRITOIRE NÉGATIF ────────────────────────────────────────────────────
    { id: 'neg_500',        icon: '💀', name: '-500M',            desc: 'Atteindre -500m',              hint: 'Lance-toi en arrière depuis la catapulte, explore le territoire secret.' },
    { id: 'dist_neg_comeback', icon: '🔄', name: 'REVENANT',     desc: 'Aller négatif puis +100m',     hint: 'Va en territoire négatif puis utilise les rebonds pour revenir.' },
    // ── CANONS ───────────────────────────────────────────────────────────────
    { id: 'cannon_5run',    icon: '🏹', name: 'BOULET DE CANON',  desc: '5 canons en un seul essai',    hint: 'Reste bas au sol pour traverser un maximum de canons.' },
    { id: 'cannon_total10', icon: '🧨', name: 'EXPERT CANON',     desc: '10 canons au total',           hint: "S'accumule sur plusieurs parties." },
    { id: 'secret_fire',    icon: '🌋', name: 'CANON SECRET',     desc: 'Trouver et déclencher le canon secret', hint: "Il est là où tu ne le cherches pas... regarde à gauche du départ." },
    // ── GANTS & COMBOS ───────────────────────────────────────────────────────
    { id: 'glove_lvl5',     icon: '👊', name: 'POWER GLOVE',      desc: 'Toucher un gant de puissance 5★', hint: 'Les gants violets (★★★★★) sont les plus puissants. Ils propulsent très haut.' },
    { id: 'glove_dive',     icon: '⬇️', name: 'COMBO PIQUÉ-GANT', desc: 'Toucher un gant en plein piqué', hint: "Active le piqué juste avant d'atterrir sur un gant pour un boost ultime." },
    // ── PAPILLONS ────────────────────────────────────────────────────────────
    { id: 'butterfly_boost', icon: '🦋', name: 'TURBO PAPILLON',  desc: 'Vitesse de boost papillon > 25', hint: "Arrive sur un papillon à pleine vitesse — plus tu es rapide, plus tu montes." },
    // ── NUAGES ───────────────────────────────────────────────────────────────
    { id: 'cloud_dive',     icon: '⚡', name: 'FOUDRE',           desc: 'Percuter un nuage en piquant', hint: "Active le piqué au-dessus d'un nuage et percute-le en chute libre." },
    // ── PIQUÉ ────────────────────────────────────────────────────────────────
    { id: 'dive_use',       icon: '🦅', name: 'AIGLE ROYAL',      desc: 'Utiliser le piqué 10 fois au total', hint: "S'accumule entre les parties." },
    // ── CATAPULTE ────────────────────────────────────────────────────────────
    { id: 'backward_launch', icon: '↩️', name: 'À RECULONS !',    desc: 'Être lancé en arrière par la catapulte', hint: "Ne lâche pas et laisse la catapulte faire son retour forcé." },
    { id: 'perfect_timing',  icon: '🎯', name: 'TIMING PARFAIT',  desc: 'Lancer avec un timing parfait',hint: "Relâche au milieu exact de la zone verte de l'indicateur." },
    { id: 'fast_launch',     icon: '💨', name: 'PROPULSION MAX',  desc: 'Vitesse de lancement > 18',    hint: 'Utilise JOY STICK (léger) avec un timing parfait.' },
    // ── PERSONNAGES ──────────────────────────────────────────────────────────
    { id: 'all_chars',      icon: '🎮', name: 'COLLECTIONNEUR',   desc: 'Débloquer tous les personnages', hint: 'Atteins 500m pour HEADSET et 1000m pour ARCADE.' },
    // ── MARATHON ─────────────────────────────────────────────────────────────
    { id: 'run_100',        icon: '🏅', name: 'CENTURION',        desc: '100 parties jouées',            hint: 'La persévérance récompensée.' },
    { id: 'total_10km',     icon: '🗺', name: 'GLOBE-TROTTER',    desc: '10 000m cumulés toutes parties', hint: "S'accumule automatiquement." },
    // ── SPÉCIAUX ─────────────────────────────────────────────────────────────
    { id: 'big_air',        icon: '🌤', name: 'PLEIN AIR',        desc: '400 frames consécutives en vol', hint: "Monte très haut pour rester longtemps en l'air." },
    { id: 'no_dive_200',    icon: '🧘', name: 'ZEN',              desc: 'Atteindre 200m sans utiliser le piqué', hint: 'Relâche totalement — ne touche jamais Espace en vol.' },
  ],

  _data() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch(e) { return []; }
  },
  _save(d) { try { localStorage.setItem(this.KEY, JSON.stringify(d)); } catch(e) {} },

  unlock(id) {
    const d = this._data();
    if (d.includes(id)) return false;
    d.push(id);
    this._save(d);
    const def = this._list.find(a => a.id === id);
    if (def) _showAchievementToast(def);
    return true;
  },
  isUnlocked(id) { return this._data().includes(id); },
  getAll()       { const d = this._data(); return this._list.map(a => ({ ...a, unlocked: d.includes(a.id) })); },
};

let _achToastQueue = [];
let _achToastActive = false;

function _showAchievementToast(def) {
  _achToastQueue.push(def);
  if (!_achToastActive) _processAchToastQueue();
}

function _processAchToastQueue() {
  if (!_achToastQueue.length) { _achToastActive = false; return; }
  _achToastActive = true;
  const def = _achToastQueue.shift();
  const toast = document.getElementById('jfm-ach-toast');
  if (!toast) { _achToastActive = false; return; }
  const icon  = toast.querySelector('.jfm-at-icon');
  const nameEl = document.getElementById('jfm-at-name-text');
  if (icon)   icon.textContent  = def.icon;
  if (nameEl) nameEl.textContent = def.name;
  toast.classList.add('show');
  _playSound('achievement');
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(_processAchToastQueue, 400);
  }, 2800);
}

/* ══════════════════════════════════════════════════════════
   LEADERBOARD — structure temporelle Daily / Weekly / Monthly
   + Archives mensuelles automatiques
══════════════════════════════════════════════════════════ */
const LEADERBOARD = {
  KEY:         'jfm_leaderboard_v4',
  ARCHIVE_KEY: 'jfm_leaderboard_archives',
  _active:     'best',   // 'best' | 'worst' | 'alt'
  _period:     'Monthly', // 'Daily' | 'Weekly' | 'Monthly'
  _scroll:     { best: 0, worst: 0, alt: 0 },
  _archiveScroll: 0,

  /* ── Structure de données vide ── */
  _emptyPeriods() {
    return { Daily: [], Weekly: [], Monthly: [] };
  },
  _emptyData() {
    return {
      best:  this._emptyPeriods(),
      worst: this._emptyPeriods(),
      alt:   this._emptyPeriods(),
      meta:  { lastMonth: this._currentMonthKey() }
    };
  },

  /* ── Clé du mois courant (ex: "2026-03") ── */
  _currentMonthKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  },

  /* ── Lit les données courantes ── */
  _data() {
    try {
      const raw = JSON.parse(localStorage.getItem(this.KEY));
      if (!raw || !raw.best || !raw.best.Daily) return this._emptyData();
      return raw;
    } catch(e) { return this._emptyData(); }
  },
  _save(d) { try { localStorage.setItem(this.KEY, JSON.stringify(d)); } catch(e) {} },

  /* ── Lit les archives ── */
  _archives() {
    try { return JSON.parse(localStorage.getItem(this.ARCHIVE_KEY)) || {}; }
    catch(e) { return {}; }
  },
  _saveArchives(a) { try { localStorage.setItem(this.ARCHIVE_KEY, JSON.stringify(a)); } catch(e) {} },

  /* ── Archivage mensuel ── */
  checkAndArchive() {
    const d    = this._data();
    const curM = this._currentMonthKey();
    if (!d.meta) d.meta = { lastMonth: curM };
    if (d.meta.lastMonth === curM) return; // même mois → rien à faire

    // Déplace Monthly → archive
    const archives = this._archives();
    const archKey  = 'Archive_' + d.meta.lastMonth.replace('-', '_');
    archives[archKey] = {
      month: d.meta.lastMonth,
      best:  [...(d.best.Monthly  || [])],
      worst: [...(d.worst.Monthly || [])],
      alt:   [...(d.alt.Monthly   || [])],
    };
    this._saveArchives(archives);

    // Réinitialise Monthly uniquement
    d.best.Monthly  = [];
    d.worst.Monthly = [];
    d.alt.Monthly   = [];
    d.meta.lastMonth = curM;
    this._save(d);
  },

  /* ── Ajoute un score ── */
  add(name, score, charName, altitude) {
    if (!name) return;
    const now  = Date.now();
    const d    = this._data();
    const entry = { name: name.toUpperCase().slice(0, 12), score, char: charName, ts: now };

    if (score > 0) {
      ['Daily','Weekly','Monthly'].forEach(p => {
        d.best[p].push({...entry});
        d.best[p].sort((a, b) => b.score - a.score);
      });
    }
    if (score < 0) {
      ['Daily','Weekly','Monthly'].forEach(p => {
        d.worst[p].push({...entry});
        d.worst[p].sort((a, b) => a.score - b.score);
      });
    }
    if (altitude > 0) {
      const altEntry = { name: entry.name, score: altitude, char: charName, ts: now };
      ['Daily','Weekly','Monthly'].forEach(p => {
        d.alt[p].push({...altEntry});
        d.alt[p].sort((a, b) => b.score - a.score);
      });
    }
    this._save(d);
  },

  /* ── Lit toutes les entrées pour l'onglet et la période actifs ── */
  getAll(type) {
    const d = this._data();
    return (d[type]?.[this._period] || []);
  },

  getTop(type, n = 5) {
    return this.getAll(type).slice(0, n);
  }
};

// Scroll leaderboard sur la zone correspondante
function _lbHandleWheel(dy) {
  const allEntries = LEADERBOARD.getAll(LEADERBOARD._active);
  const isSmall = W < 600 || H < 400;
  const listH   = isSmall ? 19 : 22;
  const maxRows  = Math.floor((H * 0.55) / listH);
  const visibleCount = Math.max(4, Math.min(maxRows, 12));
  const maxScroll = Math.max(0, allEntries.length - visibleCount);
  LEADERBOARD._scroll[LEADERBOARD._active] = Math.max(0,
    Math.min(maxScroll, LEADERBOARD._scroll[LEADERBOARD._active] + (dy > 0 ? 1 : -1)));
}

/* ══════════════════════════════════════════════════════════
   RESIZE
══════════════════════════════════════════════════════════ */
function resize() {
  if (!canvas) return;
  W = canvas.width  = Math.min(window.innerWidth,  1920);
  H = canvas.height = Math.min(window.innerHeight, 1080);
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  GY = H - 110;
  SECRET_CANNON.y = GY - SECRET_CANNON.h;
}

/* ══════════════════════════════════════════════════════════
   TERRAIN GENERATION
══════════════════════════════════════════════════════════ */
function genTerrain(sx, n) {
  const startX = Math.max(sx, SAFE_END);
  const MIN_SAME_DIST = 520; // ↑ distance minimale entre éléments du même type (était 380)

  for (let i = 0; i < n; i++) {
    const x = startX + i * (340 + Math.random() * 380); // ↑ espacement plus grand (était 220+280)
    const r = Math.random();

    let newType, newElem;

    if (r < 0.20) {
      newType = 'boxing_glove';
    } else if (r < 0.34) {
      newType = 'cloud';
    } else if (r < 0.48) {
      newType = 'cannon';
    } else if (r < 0.60) {
      newType = 'fly';
    } else if (r < 0.70) {
      newType = 'mud';
    } else {
      newType = 'boxing_glove';
    }

    // Vérifier qu'aucun élément du même type n'est trop proche
    const tooClose = terrain.some(e => e.type === newType && Math.abs(e.x - x) < MIN_SAME_DIST);
    if (tooClose) continue;

    if (newType === 'boxing_glove') {
      const h = 42 + Math.random() * 24;
      const w = h * 0.85;
      const powerLevel = Math.floor(Math.random() * 5) + 1; // 1 à 5
      const powValues  = [0.55, 0.9, 1.4, 1.95, 2.7];
      const gloveColors = ['#aaaaaa', '#ffe600', '#ff8800', '#ff3300', '#cc00ff'];
      newElem = { type: 'boxing_glove', x, y: GY - h, w, h,
        pow: powValues[powerLevel - 1], powerLevel,
        gloveCol: gloveColors[powerLevel - 1],
        hit: false, gloveAnim: Math.random() * Math.PI * 2 };
    } else if (newType === 'cloud') {
      newElem = { type: 'cloud', x: x + Math.random() * 100, y: 80 + Math.random() * (H * 0.28), w: 120 + Math.random() * 80, h: 30, hit: false };
    } else if (newType === 'cannon') {
      newElem = { type: 'cannon', x, y: GY - 60, w: 54, h: 60, hit: false };
    } else if (newType === 'fly') {
      newElem = { type: 'fly', x: x + Math.random() * 60, y: GY - (70 + Math.random() * 100), w: 72, h: 18, hit: false };
    } else if (newType === 'mud') {
      newElem = { type: 'mud', x, y: GY - 16, w: 90 + Math.random() * 60, h: 18 };
    }

    if (newElem) {
      terrain.push(newElem);
      if (x > terrainMaxX) terrainMaxX = x;
    }
  }
}

/* ══════════════════════════════════════════════════════════
   TREBUCHET
══════════════════════════════════════════════════════════ */
function getPivY() { return GY - PIV_Y_OFF; }

function getArmTipPos(angle, worldSpace) {
  const px = worldSpace ? PIV_X : PIV_X - camX;
  const py = getPivY();
  return { x: px + Math.cos(angle) * ARM_L, y: py + Math.sin(angle) * ARM_L };
}

/* ══════════════════════════════════════════════════════════
   LAUNCH
══════════════════════════════════════════════════════════ */
function doLaunch() {
  _playSound('launch');
  const c = CHARS[selChar];
  const tip = getArmTipPos(armAngle, true);

  const omega = (armActualSpeed !== 0) ? armActualSpeed : armSpeed;
  const tangentX = -Math.sin(armAngle) * omega * ARM_L;
  const tangentY =  Math.cos(armAngle) * omega * ARM_L;

  const massScale = 1.0 / Math.sqrt(c.mass);

  ch.x  = tip.x;
  ch.y  = tip.y;
  // Multiplicateur porté à 3.0 (encore plus puissant qu'avant)
  ch.vx = tangentX * massScale * 1.6;
  ch.vy = tangentY * massScale * 1.6;

  // Force montante uniquement si on lance vers l'avant (pas lors d'un lancer en retour)
  if (ch.vx > 0 && ch.vy > -1.5) ch.vy = -1.5 - Math.abs(ch.vx) * 0.12;

  ch.rot  = 0;
  ch.angV = (Math.random() - 0.5) * 0.3;
  currentDist = 0;
  maxDist = 0;
  canDive = true;
  isDiving  = false;
  diveFrames = 0;
  diveCooldownTimer = 0;
  cannonHitCount = 0;
  diveUsedCount = 0;
  lbSavedThisRun = false;
  state  = 'flying';
  camX   = 0;
  camY   = 0;

  // Le bouton retry sera affiché uniquement pendant le vol (géré dans drawHUD)
  retryBtnShown = true;

  ACHIEVEMENTS.unlock('first_launch');
  if (ch.vx < 0) ACHIEVEMENTS.unlock('backward_launch');
  if (Math.abs(ch.vx) > 18) ACHIEVEMENTS.unlock('fast_launch');
  // Track run count
  try {
    const rc = parseInt(localStorage.getItem('jfm_run_count') || '0') + 1;
    localStorage.setItem('jfm_run_count', rc);
    if (rc >= 10)  ACHIEVEMENTS.unlock('run_10');
    if (rc >= 50)  ACHIEVEMENTS.unlock('run_50');
    if (rc >= 100) ACHIEVEMENTS.unlock('run_100');
  } catch(e) {}
  // Track chars played
  try {
    const cp = JSON.parse(localStorage.getItem('jfm_chars_played') || '[]');
    if (!cp.includes(selChar)) { cp.push(selChar); localStorage.setItem('jfm_chars_played', JSON.stringify(cp)); }
    if (cp.length >= 2) ACHIEVEMENTS.unlock('play_2_chars');
    if (cp.length >= 3) ACHIEVEMENTS.unlock('play_3_chars');
  } catch(e) {}
  _showRetryBtn();
  // Marquer qu'une partie a été jouée (pour masquer les contrôles)
  if (!hasPlayedOnce) {
    hasPlayedOnce = true;
    try { localStorage.setItem('jfm_played_once', '1'); } catch(e) {}
  }
}

/* ── Afficher le bouton Réessayer ── */
function _showRetryBtn() {
  const rb = document.getElementById('jfm-retry-btn');
  if (rb && !rb.classList.contains('visible')) {
    rb.classList.add('visible');
    rb.style.display = 'flex';
  }
}

/* ══════════════════════════════════════════════════════════
   PHYSICS
══════════════════════════════════════════════════════════ */
function physics() {
  const c   = CHARS[selChar];
  const hwX = c.size * c.hitW;
  const hwY = c.size * c.hitH;

  /* ── Cooldown piqué ── */
  if (diveCooldownTimer > 0) {
    diveCooldownTimer -= _dtScale;
    if (diveCooldownTimer <= 0) { diveCooldownTimer = 0; canDive = true; } // Auto-reset quand le timer expire
  }

  /* ── 1. Absorption cannon ── */
  if (isAbsorbed) {
    absorbTimer--;
    if (absorbCannon) {
      ch.x = absorbCannon.x + absorbCannon.w / 2;
      ch.y = absorbCannon.y + absorbCannon.h / 2;
    }
    if (absorbTimer <= 0) {
      isAbsorbed = false;
      const isSecret = absorbCannon && absorbCannon.type === 'secret_cannon';
      if (isSecret) {
        // Canon secret — puissance maximale
        ch.vx = 45; ch.vy = -22; secretFired = true;
        if (absorbCannon) {
          ch.x = absorbCannon.x + absorbCannon.w + hwX;
          ch.y = absorbCannon.y - hwY;
          spawnP(ch.x, ch.y, '#ff4400', 30);
          spawnP(ch.x, ch.y, '#ffaa00', 16);
        }
        ACHIEVEMENTS.unlock('secret_fire');
      } else {
        if (absorbCannon) {
          ch.vx = 22; ch.vy = -10;
          ch.x  = absorbCannon.x + absorbCannon.w + hwX;
          ch.y  = absorbCannon.y - hwY;
          spawnP(ch.x, ch.y, '#ff8800', 22);
          setTimeout(() => { if (absorbCannon) absorbCannon.hit = false; }, 800);
        }
      }
      absorbCannon = null;
      if (diveCooldownTimer <= 0) canDive = true;
    }
    camX += (ch.x - W * 0.3 - camX) * 0.08;
    _updateCamY();
    return;
  }

  const _dt = _dtScale;
  /* ── 2. Gravité ── */
  ch.vy += GRAVITY * c.mass * _dt;

  /* ── 3. Aérodynamisme — quasi nulle en l'air, normale au sol ── */
  const isAirborne = ch.y + hwY < GY - 20;
  ch.vx *= isAirborne ? AIR_FRIC : c.aerodynamics;

  /* ── 4. Piqué — comportement selon diveType ── */
  if (isDiving && diveFrames > 0) {
    const dt = c.diveType || 'vertical';
    if (dt === 'zerograv') {
      // Annulation de gravité : neutralise le +gravity appliqué juste avant,
      // puis applique une légère descente progressive
      ch.vy -= GRAVITY * c.mass * _dt;  // contre-force exacte
      ch.vy += 0.04 * _dt;              // descente lente contrôlée
    } else if (dt === 'heavy') {
      ch.vy += DIVE_ACCEL * 2.2 * _dt; // écrasement amplifié
    } else {
      ch.vy += DIVE_ACCEL * _dt;        // vertical / diagonal : standard
    }
    diveFrames -= _dt;
    if (diveFrames <= 0) isDiving = false;
  }

  /* ── 5. Déplacement ── */
  ch.x   += ch.vx * _dt;
  ch.y   += ch.vy * _dt;
  ch.rot += ch.angV * _dt;
  // Amortissement angulaire aérien — dépend de l'inertie (masse × taille)
  // Personnages légers et petits perdent leur spin plus vite
  const airAngDamp = 0.970 + c.mass * 0.006 + c.size * 0.0003;
  ch.angV *= Math.pow(Math.min(0.992, airAngDamp), _dt);
  camX   += (ch.x - W * 0.3 - camX) * 0.08;
  _updateCamY();

  // Distance temps réel
  currentDist = Math.floor((ch.x - LAUNCH_X) / 5.0);
  if (currentDist > maxDist) maxDist = currentDist;
  if (currentDist < minDist) minDist = currentDist;
  const altM = Math.max(0, Math.round((GY - ch.y) / 5.0));
  if (altM > maxAlt) maxAlt = altM;
  runFrame++;
  // Airborne frames
  const hwYa = CHARS[selChar].size * CHARS[selChar].hitH;
  if (ch.y + hwYa < GY - 5) { airborneFr++; if (airborneFr > 400) ACHIEVEMENTS.unlock('big_air'); }
  else airborneFr = 0;

  // Déblocage personnages
  if (maxDist >= 500)  { CHARS[4].locked = false; ACHIEVEMENTS.unlock('unlock_headset'); }
  if (maxDist >= 1000) { CHARS[5].locked = false; ACHIEVEMENTS.unlock('unlock_arcade'); }

  // Achievements distance
  if (maxDist >= 50)   ACHIEVEMENTS.unlock('dist_50');
  if (maxDist >= 100)  ACHIEVEMENTS.unlock('dist_100');
  if (maxDist >= 200) {
    ACHIEVEMENTS.unlock('dist_200');
    if (diveUsedCount === 0) ACHIEVEMENTS.unlock('no_dive_200');
  }
  if (maxDist >= 300)  ACHIEVEMENTS.unlock('dist_300');
  if (maxDist >= 500)  ACHIEVEMENTS.unlock('dist_500');
  if (maxDist >= 1000) {
    ACHIEVEMENTS.unlock('dist_1000');
    if (!CHARS[4].locked && !CHARS[5].locked) ACHIEVEMENTS.unlock('all_chars');
  }
  if (maxDist >= 2000) ACHIEVEMENTS.unlock('dist_2000');
  if (maxDist >= 5000) ACHIEVEMENTS.unlock('dist_5000');

  // Altitude achievements — calés sur les nouvelles zones de fond
  if (maxAlt >= 100)  ACHIEVEMENTS.unlock('alt_100');
  if (maxAlt >= 500)  ACHIEVEMENTS.unlock('alt_500');
  if (maxAlt >= 1200) { if (!ACHIEVEMENTS.isUnlocked('alt_1000')) _playSound('solar');   ACHIEVEMENTS.unlock('alt_1000'); }
  if (maxAlt >= 2200) { if (!ACHIEVEMENTS.isUnlocked('alt_2000')) _playSound('milkyway'); ACHIEVEMENTS.unlock('alt_2000'); }
  if (maxAlt >= 5000) ACHIEVEMENTS.unlock('alt_5000');

  // Territoire négatif
  if (currentDist < 0) { ACHIEVEMENTS.unlock('negative'); wasNegative = true; }
  if (currentDist < -200) ACHIEVEMENTS.unlock('neg_200');
  if (currentDist < -500) ACHIEVEMENTS.unlock('neg_500');
  if (wasNegative && currentDist >= 100) ACHIEVEMENTS.unlock('dist_neg_comeback');

  /* ══════════════════════════════════════════════════════
     6. COLLISION SOL — RIGID BODY DYNAMICS (Point de Contact)
     ══════════════════════════════════════════════════════
     Algorithme :
     1. Calcul des 4 coins du rectangle AABB tourné (rotation = ch.rot)
     2. Identification du Point de Contact P : le coin avec la plus grande
        coordonnée Y (le plus bas sur l'écran)
     3. Vecteur CG→P : (dx, dy) = offset du coin par rapport au centre de masse
     4. Snap anti-pénétration : translate ch.y pour que P soit exactement sur GY
     5. Vitesse du point de contact :
          v_px = vx - ω*dy    (composante horizontale)
          v_py = vy + ω*dx    (composante verticale = vitesse d'impact)
     6. Impulsion normale (rebond) :
          Dénominateur = 1/m + dx²/I
          J_n = (1+e) * v_py / dénominateur   [si v_py > 0 = impact réel]
          Δvy = -J_n / m          → rebond vertical
          Δω  = -dx * J_n / I     → couple de renversement (Torque)
     7. Impulsion tangentielle (friction de Coulomb = culbute) :
          v_tang = vx - ω_new * dy   (glissement au sol)
          J_t_stop = -v_tang / (1/m + dy²/I)   [pour stopper le glissement]
          J_t = clamp(J_t_stop, -μ*J_n, +μ*J_n)
          Δvx = J_t / m           → freinage / accélération par friction
          Δω += -dy * J_t / I     → spin par friction (grip = accroche)
     Moment d'inertie : I = m * (4*hw² + 4*hh²) / 12   (rectangle)
     ════════════════════════════════════════════════════ */
  {
    // ── Demi-dimensions de la hitbox ──
    const hw = c.size * c.hitW;   // demi-largeur (pixels)
    const hh = c.size * c.hitH;   // demi-hauteur (pixels)

    // ── Moment d'inertie du rectangle ──
    // I = m * (w² + h²) / 12  avec w = 2*hw, h = 2*hh
    const I = c.mass * (4 * hw * hw + 4 * hh * hh) / 12.0;

    // ── 1 & 2. Coins du rectangle tourné — trouver le plus bas ──
    // Coins en espace local : (±hw, ±hh)
    // Rotation vers espace monde : wx = lx*cos - ly*sin, wy = lx*sin + ly*cos
    const cos_r = Math.cos(ch.rot);
    const sin_r = Math.sin(ch.rot);

    // Les 4 offsets monde (wx, wy) de chaque coin
    const corners_wy = [
       hw * sin_r + hh * cos_r,   // coin (+hw, +hh) → bas-droit local
      -hw * sin_r + hh * cos_r,   // coin (-hw, +hh) → bas-gauche local
       hw * sin_r - hh * cos_r,   // coin (+hw, -hh) → haut-droit local
      -hw * sin_r - hh * cos_r,   // coin (-hw, -hh) → haut-gauche local
    ];
    const corners_wx = [
       hw * cos_r - hh * sin_r,
      -hw * cos_r - hh * sin_r,
       hw * cos_r + hh * sin_r,
      -hw * cos_r + hh * sin_r,
    ];

    // Coin le plus bas (max wy en coords écran Y vers le bas)
    let maxWy = corners_wy[0], bestIdx = 0;
    for (let ci = 1; ci < 4; ci++) {
      if (corners_wy[ci] > maxWy) { maxWy = corners_wy[ci]; bestIdx = ci; }
    }
    const contactWorldY = ch.y + maxWy;

    // ── Détection ──
    if (contactWorldY >= GY) {

      // ── 3. Snap anti-pénétration (AVANT calcul des forces) ──
      const penetration = contactWorldY - GY;
      ch.y -= penetration;
      // Vecteur CG→P (après snap, la coordonnée Y du contact est exactement GY)
      const dx =  corners_wx[bestIdx];          // décalage horizontal du point de contact
      const dy  = maxWy - penetration;          // décalage vertical (maintenant = GY - ch.y)

      // ── Boue — stoppe immédiatement ──
      const mud = terrain.find(t =>
        t.type === 'mud' &&
        ch.x + hwX > t.x && ch.x - hwX < t.x + t.w
      );
      if (mud) {
        ch.vx = 0; ch.vy = 0; ch.angV = 0;
        spawnP(ch.x, ch.y, '#774411', 28);
        spawnP(ch.x, ch.y, '#552200', 14);
        ACHIEVEMENTS.unlock('mud_death');
        _playSound('mud_splat');
        state = 'dead'; deathTimer = 140;
        return;
      }

      const wasDiving = isDiving;
      isDiving = false; diveFrames = 0;
      if (diveCooldownTimer <= 0) canDive = true;

      // ── Coefficient de restitution (bounciness) ──
      // Le piqué augmente légèrement l'énergie de rebond
      const e = Math.min(0.96, c.bounciness * (wasDiving ? 1.30 : 1.0));

      // ── Friction de Coulomb μ — propre à chaque personnage ──
      const mu = c.mu || 0.50;

      // ── 5. Vitesse du point de contact (coords écran : Y vers le bas, ω CW positif) ──
      //   v_px = vx - ω * dy
      //   v_py = vy + ω * dx
      const v_py = ch.vy + ch.angV * dx;   // composante d'impact (>0 = vers le sol)

      // Appliquer uniquement si le point de contact approche le sol
      if (v_py > 0) {

        // ── 6. Impulsion normale (rebond vertical) ──
        //   J_n = (1+e) * v_py / (1/m + dx²/I)
        const denom_n = 1.0 / c.mass + (dx * dx) / I;
        const J_n = (1.0 + e) * v_py / denom_n;

        ch.vy    -= J_n / c.mass;       // rebond vers le haut
        ch.angV  -= dx * J_n / I;       // couple de renversement (Torque)
                                        // si dx>0 (coin droit) → ω diminue (rotation arrière)
                                        // si dx<0 (coin gauche) → ω augmente (rotation avant)

        // ── 7. Impulsion tangentielle (friction = culbute) ──
        // Vitesse de glissement du point de contact (après impulsion normale)
        const v_tang = ch.vx - ch.angV * dy;
        // Impulsion pour stopper le glissement (solution exacte)
        const denom_t = 1.0 / c.mass + (dy * dy) / I;
        const J_t_stop = -v_tang / denom_t;
        // Clampage par frottement de Coulomb : |J_t| ≤ μ * J_n
        const J_t_max = mu * J_n;
        const J_t = Math.max(-J_t_max, Math.min(J_t_max, J_t_stop));

        ch.vx    += J_t / c.mass;       // freinage / poussée horizontale par accroche
        ch.angV  -= dy * J_t / I;       // spin par friction :
                                        //   glissement forward + contact en bas → spin CW
                                        //   ω fort + contact en bas → vx accéléré (grip)

        // Clampage de la vélocité angulaire — plus strict pour le triangle
        // (sommets éloignés → torque naturellement élevé → risque d'explosion numérique)
        const maxAngV = c.shapeType === 'tri' ? 2.8 : 4.5;
        ch.angV = Math.max(-maxAngV, Math.min(maxAngV, ch.angV));

        // Amortissement angulaire au sol proportionnel à la friction (anti-cacahuète)
        // Le triangle bénéficie d'un amortissement renforcé à chaque rebond
        const groundAngDamp = c.shapeType === 'tri' ? 0.72 : 0.88;
        ch.angV *= groundAngDamp;

        // ── Particules visuelles proportionnelles à l'énergie d'impact ──
        const impactEnergy = J_n;   // énergie proportionnelle à l'impulsion
        const pCol = c.col;
        if (wasDiving) {
          spawnP(ch.x, ch.y, '#ff4488', 20);
          spawnP(ch.x, ch.y, pCol, 14);
          spawnTrail(ch.x, GY);
          spawnTrail(ch.x + dx, GY); // trace au point de contact réel
        } else if (impactEnergy > 6) {
          spawnP(ch.x, ch.y, pCol, Math.min(24, Math.floor(impactEnergy * 0.55)));
          if (impactEnergy > 14) spawnTrail(ch.x, GY);
        }
        if (impactEnergy > 3.5) _playSound('bounce');

        bounceCount++;
        // Achievements rebonds
        if (bounceCount >= 3)  ACHIEVEMENTS.unlock('bounce_3');
        if (bounceCount >= 5)  ACHIEVEMENTS.unlock('bounce_5');
        if (bounceCount >= 10) ACHIEVEMENTS.unlock('bounce_10');
        if (bounceCount >= 15) ACHIEVEMENTS.unlock('bounce_15');
        if (bounceCount >= 20) ACHIEVEMENTS.unlock('bounce_20');
        if (bounceCount >= 30) ACHIEVEMENTS.unlock('bounce_30');
        if (bounceCount >= 50) ACHIEVEMENTS.unlock('bounce_50');

        // ── Sleep state : seuil d'arrêt basé sur l'énergie cinétique résiduelle ──
        // KE_lin = ½mv² | KE_rot = ½Iω²
        const KE_lin = 0.5 * c.mass * (ch.vx * ch.vx + ch.vy * ch.vy);
        const KE_rot = 0.5 * I * ch.angV * ch.angV;
        // Seuil d'arrêt : personnages lourds s'arrêtent plus facilement car leur
        // inertie amortit naturellement les micro-rebonds
        const KE_sleep = 0.28 * c.mass * I / 200.0;

        if (KE_lin + KE_rot < KE_sleep || (Math.abs(ch.vy) < 0.9 && Math.abs(ch.vx) < 0.7)) {
          ch.vx = 0; ch.vy = 0; ch.angV = 0;
          state = 'dead'; deathTimer = 140;
          flowerPosX.push(ch.x);
          _playSound('land');
        }
      }
    }
  }

  /* ── 7. Canon secret ── */
  if (!secretFired && !isAbsorbed) {
    const sc = SECRET_CANNON;
    const inX = ch.x + hwX > sc.x && ch.x - hwX < sc.x + sc.w;
    const inY = ch.y + hwY >= sc.y && ch.y <= sc.y + sc.h + 10;
    if (inX && inY) {
      isAbsorbed = true; absorbTimer = 50; absorbCannon = sc;
      ch.vx = 0; ch.vy = 0;
      ch.x = sc.x + sc.w / 2; ch.y = sc.y + sc.h / 2;
      spawnP(ch.x, ch.y, '#ff4400', 18);
      if (diveCooldownTimer <= 0) canDive = true;
    }
  }

  /* ── 8. Collisions terrain ── */
  for (const t of terrain) {
    if (t.hit) continue;
    const inX = ch.x + hwX > t.x - 4 && ch.x - hwX < t.x + t.w + 4;
    if (!inX) continue;

    if (t.type === 'boxing_glove') {
      // Hitbox au niveau du sol : le gant peut être touché depuis le haut ou depuis le sol
      const gloveTopY = GY - t.h;
      const inY = (ch.y + hwY >= gloveTopY && ch.y + hwY <= GY) && ch.vy >= 0;
      const atGround = ch.y + hwY >= GY - hwY - 4;

      if (inY || atGround) {
        const wasDiving = isDiving;
        isDiving = false; diveFrames = 0;
        if (diveCooldownTimer <= 0) canDive = true;

        // Vitesse d'impact → force verticale selon puissance du gant (1-5)
        const impactSpeed = Math.sqrt(ch.vx * ch.vx + ch.vy * ch.vy);
        const upForce = Math.max(7, impactSpeed * t.pow * 0.75 * (wasDiving ? 1.5 : 1.0));

        // Gant = UNIQUEMENT vers le haut — vx INCHANGÉ
        ch.vy = -upForce;
        // Particules proportionnelles à la puissance
        const pLvl = t.powerLevel || 1;
        const pCols = ['#aaaaaa','#ffe600','#ff8800','#ff3300','#cc00ff'];
        spawnP(ch.x, ch.y, pCols[pLvl-1] || '#ff4400', 4 + pLvl * 3);
        spawnP(ch.x, ch.y, '#ffaa00', pLvl * 2);

        ch.y = gloveTopY - hwY;
        ch.angV = (Math.random() - 0.5) * 0.25;
        t.hit = true; bounceCount++; gloveHitCount++;
        ACHIEVEMENTS.unlock('glove_first');
        if (gloveHitCount >= 5) ACHIEVEMENTS.unlock('glove_5');
        if ((t.powerLevel || 1) === 5) ACHIEVEMENTS.unlock('glove_lvl5');
        if (isDiving || wasDiving) ACHIEVEMENTS.unlock('glove_dive');
        _playSound('glove');
        _playGlovePowerSound(t.powerLevel || 1);
        setTimeout(() => { t.hit = false; }, 600);
      }
    }

    else if (t.type === 'cannon' &&
             ch.x > t.x + 4 && ch.x < t.x + t.w - 4 &&
             ch.y + hwY >= t.y + 8 && ch.y <= t.y + t.h && !isAbsorbed) {
      isAbsorbed = true; absorbTimer = 60; absorbCannon = t;
      ch.vx = 0; ch.vy = 0;
      ch.x = t.x + t.w / 2; ch.y = t.y + t.h / 2;
      spawnP(ch.x, ch.y, '#ff8800', 12);
      t.hit = true;
      if (diveCooldownTimer <= 0) canDive = true;
      cannonHitCount++;
      ACHIEVEMENTS.unlock('cannon_1');
      if (cannonHitCount >= 3) ACHIEVEMENTS.unlock('cannon_3');
      if (cannonHitCount >= 5) ACHIEVEMENTS.unlock('cannon_5run');
      try {
        let totCan = parseInt(localStorage.getItem('jfm_total_cannons') || '0') + 1;
        localStorage.setItem('jfm_total_cannons', totCan);
        if (totCan >= 10) ACHIEVEMENTS.unlock('cannon_total10');
      } catch(e) {}
    }

    else if (t.type === 'fly' &&
             ch.y + hwY >= t.y && ch.y <= t.y + t.h + 6 && ch.vy > 0) {
      const wasDiving = isDiving;
      isDiving = false; diveFrames = 0;
      if (diveCooldownTimer <= 0) canDive = true;
      // Les papillons portent le joueur en l'air ET en avant selon sa vitesse courante
      const speed = Math.sqrt(ch.vx * ch.vx + ch.vy * ch.vy);
      const speedFactor = Math.max(1, speed * 0.14);
      const liftForce = (10 + speedFactor * 3.5) * (wasDiving ? 1.6 : 1.0);
      const forwardBoost = speedFactor * 2.2;
      ch.vy = -liftForce;
      const dir = ch.vx >= 0 ? 1 : -1;
      ch.vx = dir * (Math.abs(ch.vx) + forwardBoost);
      ch.y = t.y - hwY;
      ch.angV = (Math.random() - 0.5) * 0.3;
      spawnP(ch.x, ch.y, '#ffdd44', 14);
      spawnP(ch.x, ch.y, '#ff88cc', 8);
      t.hit = true; bounceCount++; butterflyCount++;
      ACHIEVEMENTS.unlock('butterfly_first');
      if (butterflyCount >= 5) ACHIEVEMENTS.unlock('butterfly_5');
      if (liftForce + forwardBoost > 25) ACHIEVEMENTS.unlock('butterfly_boost');
      _playSound('butterfly');
      setTimeout(() => { t.hit = false; }, 500);
    }

    else if (t.type === 'cloud' &&
             ch.x > t.x && ch.x < t.x + t.w &&
             ch.y + hwY >= t.y && ch.y <= t.y + t.h + 8 && ch.vy > 0) {
      const wasDiving = isDiving;
      isDiving = false; diveFrames = 0;
      if (diveCooldownTimer <= 0) canDive = true;
      if (wasDiving) {
        const impactForce = c.mass * Math.abs(ch.vy);
        ch.vy = -(Math.abs(ch.vy) * 1.1 + impactForce * 0.2); // ↓ réduit (était 1.5 + 0.35)
        ch.vx += impactForce * 0.05; // ↓ réduit (était 0.08)
      } else { ch.vy = -Math.abs(ch.vy) * 1.1 * BOUNCE_DAMPEN; } // ↓ réduit (était 1.5)
      ch.y = t.y - hwY;
      spawnP(ch.x, ch.y, '#aae0ff', 7); bounceCount++; cloudHitCount++;
      ACHIEVEMENTS.unlock('cloud_first');
      if (cloudHitCount >= 5) ACHIEVEMENTS.unlock('cloud_5');
      if (wasDiving) ACHIEVEMENTS.unlock('cloud_dive');
      _playSound('cloud_bounce');
    }
  }

  /* ── 9. Génération terrain + nettoyage ── */
  if (ch.x + W > terrainMaxX - 400) genTerrain(terrainMaxX + 200, 12);
  const cullX = ch.x - W * 2.5;
  if (terrain.length > 80 && terrain[0].x < cullX) {
    let cut = 0;
    while (cut < terrain.length && terrain[cut].x < cullX) cut++;
    if (cut > 0) terrain.splice(0, cut);
  }
}

/* ── Mise à jour caméra verticale — réactive ── */
function _updateCamY() {
  const targetCamY = Math.max(0, (H * 0.42 - ch.y));
  // Lerp plus rapide si écart important (suit mieux les grands sauts)
  const diff = targetCamY - camY;
  const speed = Math.abs(diff) > 80 ? 0.18 : 0.09;
  camY += diff * speed;
  camY = Math.max(0, camY);
}

/* ══════════════════════════════════════════════════════════
   PARTICLES
══════════════════════════════════════════════════════════ */
function spawnP(x, y, col, n) {
  for (let i = 0; i < n; i++)
    particles.push({ x, y, vx: (Math.random()-0.5)*9, vy: -Math.random()*9-1, col, life: 1, s: 3+Math.random()*5 });
}
function spawnTrail(x, y) { trails.push({ x, y: y - 4, life: 1 }); }
function tickP() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.24; p.life -= 0.025;
    if (p.life <= 0) particles.splice(i, 1);
  }
  for (let i = trails.length - 1; i >= 0; i--) {
    trails[i].life -= 0.003;
    if (trails[i].life <= 0) trails.splice(i, 1);
  }
}

/* ══════════════════════════════════════════════════════════
   RESET
══════════════════════════════════════════════════════════ */
function reset() {
  armAngle = ARM_REST; armSpeed = 0;
  isDiving = false; diveFrames = 0; canDive = true;
  isAbsorbed = false; absorbTimer = 0; absorbCannon = null;
  bounceCount = 0; currentDist = 0; maxDist = 0; minDist = 0; maxAlt = 0;
  gloveHitCount = 0; butterflyCount = 0; cloudHitCount = 0; consecGloves = 0;
  wasNegative = false; airborneFr = 0; runFrame = 0;
  camX = 0; camY = 0; frame = 0;
  particles = []; trails = []; terrain = []; terrainMaxX = 0;
  flowerPosX = []; bestUpdated = false; secretFired = false;
  lbSavedThisRun = false; lbNamePending = false;
  diveCooldownTimer = 0;
  cannonHitCount = 0;
  diveUsedCount = 0;
  catapulteReturning = false;
  catapulteReturnSpeed = 0;
  armActualSpeed = 0;
  retryBtnShown = false;
  SECRET_CANNON.hit = false;
  SECRET_CANNON.y = GY - SECRET_CANNON.h;

  const tipRest = getArmTipPos(ARM_REST, true);
  ch.x = tipRest.x; ch.y = tipRest.y;
  ch.vx = 0; ch.vy = 0; ch.rot = 0; ch.angV = 0;

  genTerrain(SAFE_END, 40);
  state = 'menu';

  const lbWrap = document.getElementById('jfm-lb-name-wrap');
  if (lbWrap) lbWrap.style.display = 'none';
}

/* ══════════════════════════════════════════════════════════
   DRAWING
══════════════════════════════════════════════════════════ */
function drawBg() {
  // Altitude réelle en mètres (position monde, sans camY)
  const altMeters = Math.max(0, (GY - ch.y) / 5.0);
  // altFactor : 0=sol, 1=espace profond (atteint à 4000m) — pour transitions visuelles progressives
  const altFactor = Math.min(1, altMeters / 4000);

  // ── ZONES D'ALTITUDE ──
  // < 1200m  : fond de base avec bâtiments en arrière-plan
  // 1200-2200m : galaxie (nébuleuses, étoiles denses)
  // > 2200m  : voie lactée

  // Fade entre zones
  const cityFade   = Math.max(0, Math.min(1, (1200 - altMeters) / 500)); // 1=en ville, 0 à 1200m+
  const galaxyFade = Math.max(0, Math.min(1, (altMeters - 1000) / 600)); // 0 à 1000m, 1 à 1600m+
  const mwFade     = Math.max(0, Math.min(1, (altMeters - 2200) / 800)); // 0 à 2200m, 1 à 3000m+

  // ── Gradient de ciel ──
  const g = ctx.createLinearGradient(0, 0, 0, H);
  if (altMeters < 150) {
    // Sol/ville : nuit violette profonde
    g.addColorStop(0, '#03000f'); g.addColorStop(0.6, '#060020'); g.addColorStop(1, '#0a0030');
  } else if (altMeters < 1200) {
    // Atmosphère basse : montée progressive vers le bleu nuit
    const t = Math.min(1, (altMeters - 150) / 1050);
    g.addColorStop(0, `rgb(${Math.round(3+t*3)},${Math.round(0+t*5)},${Math.round(15+t*35)})`);
    g.addColorStop(0.5, '#020012'); g.addColorStop(1, '#04000a');
  } else if (altMeters < 2200) {
    // Galaxie : espace profond bleu-violet
    const t = Math.min(1, (altMeters - 1200) / 1000);
    g.addColorStop(0, `rgb(${Math.round(6-t*6)},${Math.round(4-t*4)},${Math.round(50-t*50)})`);
    g.addColorStop(0.4, `rgba(8,0,${Math.round(40-t*40)},.9)`);
    g.addColorStop(1, '#000004');
  } else {
    // Voie Lactée : espace absolu
    g.addColorStop(0, '#000003'); g.addColorStop(0.5, '#000002'); g.addColorStop(1, '#000000');
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // ── Étoiles (plus nombreuses et colorées selon altitude) ──
  ctx.save();
  const starCount = Math.floor(40 + altFactor * 220);
  for (let i = 0; i < starCount; i++) {
    const sx = ((i * 137.508 + camX * (0.005 + i * 0.0001)) % W + W) % W;
    const sy = ((i * 97.33 + camY * 0.004) % (H * 0.95) + H * 0.95) % (H * 0.95);
    const br = (0.3 + 0.7 * Math.sin(frame * 0.018 + i * 0.9)) * Math.max(0.15, galaxyFade);
    ctx.globalAlpha = br;
    // Étoiles colorées en haute altitude
    if (altMeters > 1600 && i % 7 === 0)       ctx.fillStyle = '#ffddb0';
    else if (altMeters > 1800 && i % 11 === 0) ctx.fillStyle = '#b0d8ff';
    else if (altMeters > 2000 && i % 13 === 0) ctx.fillStyle = '#ffb0b0';
    else                                         ctx.fillStyle = '#fff';
    const sz = altMeters > 2000 && i % 5 === 0 ? 2 : 1;
    ctx.fillRect(sx, sy, sz, sz);
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // ── VOIE LACTÉE — visible au-delà de 2200m ──
  if (altMeters > 2200) {
    const mlAlpha = Math.min(0.55, mwFade * 0.55);
    ctx.save();
    ctx.globalAlpha = mlAlpha;
    const mlGrad = ctx.createLinearGradient(0, H * 0.05, W, H * 0.65);
    mlGrad.addColorStop(0,   'rgba(160,100,255,0)');
    mlGrad.addColorStop(0.2, 'rgba(200,160,255,.55)');
    mlGrad.addColorStop(0.4, 'rgba(255,240,255,.7)');
    mlGrad.addColorStop(0.6, 'rgba(180,130,255,.55)');
    mlGrad.addColorStop(0.8, 'rgba(120,80,200,.35)');
    mlGrad.addColorStop(1,   'rgba(80,40,160,0)');
    ctx.fillStyle = mlGrad;
    ctx.save();
    ctx.translate(W * 0.5, H * 0.4);
    ctx.rotate(-0.38);
    ctx.fillRect(-W * 0.9, -H * 0.12, W * 1.8, H * 0.24);
    // Nœud central brillant
    const mlCore = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.25);
    mlCore.addColorStop(0, 'rgba(255,245,255,.55)');
    mlCore.addColorStop(0.4, 'rgba(200,170,255,.3)');
    mlCore.addColorStop(1, 'rgba(150,100,200,0)');
    ctx.fillStyle = mlCore;
    ctx.beginPath(); ctx.ellipse(0, 0, W * 0.3, H * 0.08, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.restore();

    // Étoiles denses de la Voie Lactée
    ctx.save();
    for (let i = 0; i < 120; i++) {
      const sx = ((i * 53.7 + camX * 0.003) % W + W) % W;
      const sy = ((i * 41.3 - camY * 0.003 + W * 0.4) % (H * 0.7) + H * 0.1);
      const br = Math.sin(frame * 0.022 + i * 0.7) * 0.5 + 0.5;
      ctx.globalAlpha = mlAlpha * 1.5 * br;
      ctx.fillStyle = i % 3 === 0 ? '#ffeedd' : '#ffffff';
      ctx.fillRect(sx, sy, 1, 1);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ── NÉBULEUSE GALACTIQUE — visible entre 1200m et 2200m ──
  if (altMeters > 1200) {
    const nebAlpha = Math.min(0.28, galaxyFade * 0.28) * (altMeters < 2200 ? 1 : Math.max(0, 1 - (altMeters - 2200) / 400));
    ctx.save();
    // Nébuleuse bleue-verte
    const neb1 = ctx.createRadialGradient(W * 0.75, H * 0.22, 0, W * 0.75, H * 0.22, W * 0.3);
    neb1.addColorStop(0, `rgba(0,180,255,${nebAlpha * 1.4})`);
    neb1.addColorStop(0.4, `rgba(0,100,200,${nebAlpha})`);
    neb1.addColorStop(1, 'rgba(0,50,120,0)');
    ctx.fillStyle = neb1;
    ctx.beginPath(); ctx.ellipse(W * 0.75, H * 0.22, W * 0.32, H * 0.18, 0.3, 0, Math.PI * 2); ctx.fill();
    // Nébuleuse rose
    const neb2 = ctx.createRadialGradient(W * 0.22, H * 0.15, 0, W * 0.22, H * 0.15, W * 0.22);
    neb2.addColorStop(0, `rgba(255,60,180,${nebAlpha})`);
    neb2.addColorStop(0.5, `rgba(180,30,120,${nebAlpha * 0.6})`);
    neb2.addColorStop(1, 'rgba(80,0,60,0)');
    ctx.fillStyle = neb2;
    ctx.beginPath(); ctx.ellipse(W * 0.22, H * 0.15, W * 0.25, H * 0.14, -0.2, 0, Math.PI * 2); ctx.fill();
    // Nébuleuse violette supplémentaire (zone galaxie)
    const neb3 = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.4);
    neb3.addColorStop(0, `rgba(80,0,160,${nebAlpha * 0.6})`);
    neb3.addColorStop(0.6, `rgba(40,0,100,${nebAlpha * 0.3})`);
    neb3.addColorStop(1, 'rgba(0,0,40,0)');
    ctx.fillStyle = neb3;
    ctx.beginPath(); ctx.ellipse(W * 0.5, H * 0.5, W * 0.5, H * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // ── SYSTÈME SOLAIRE — visible > 1000m ──
  if (altMeters > 1000) {
    const solarAlpha = Math.min(1, (altMeters - 1000) / 500);
    _drawSolarSystem(altFactor, solarAlpha);
  }

  // ── LUNE — visible > 200m ──
  if (altMeters > 200) {
    const moonAlt = Math.min(1, (altMeters - 200) / 300);
    _drawMoon(altFactor * moonAlt + moonAlt * 0.5);
  }

  // ── GRILLE PERSPECTIVE + VILLE — fond de base sous 1200m ──
  if (altMeters < 1200) {
    _drawGrid(cityFade);
    _drawCity(cityFade);
  }

  // ── COUCHE ATMOSPHÉRIQUE (halo bleu, transition 100m-1200m) ──
  if (altMeters > 100 && altMeters < 1200) {
    const hazeT = altMeters < 600 ? (altMeters - 100) / 500 : 1 - (altMeters - 600) / 600;
    const hazeAlpha = Math.max(0, hazeT * 0.18);
    ctx.save();
    const hazeG = ctx.createLinearGradient(0, 0, 0, H);
    hazeG.addColorStop(0, `rgba(0,80,200,${hazeAlpha})`);
    hazeG.addColorStop(0.4, `rgba(0,40,120,${hazeAlpha * 0.5})`);
    hazeG.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = hazeG;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

/* ── Grille perspective ── */
function _drawGrid(alpha) {
  const gs = 100, ox = (camX * 0.25) % gs;
  const gyVis = GY + camY;
  ctx.save(); ctx.globalAlpha = alpha;
  for (let r = 0; r < 8; r++) {
    const y = gyVis - r * 30;
    if (y < 0 || y > H) continue;
    const a = 0.04 + r * 0.035;
    ctx.strokeStyle = `rgba(100,0,220,${a})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  for (let x = -ox; x < W + gs; x += gs) {
    ctx.strokeStyle = 'rgba(60,0,130,.2)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, gyVis - 240); ctx.lineTo(x - 55, gyVis); ctx.stroke();
  }
  ctx.globalAlpha = 1; ctx.restore();
}

/* ── Silhouette ville ── */
function _drawCity(alpha) {
  const cOff = camX * 0.12;
  const cOffY = camY * 0.05;
  ctx.save(); ctx.globalAlpha = alpha;
  for (let i = 0; i < 26; i++) {
    const bx = ((i * 179 + 40) % 1600 - cOff % 1600 + 1600) % 1600 - 120;
    const bh = 40 + (i * 53) % 100, bw = 20 + (i * 31) % 42;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(0,50,140,.5)' : 'rgba(50,0,100,.5)';
    ctx.fillRect(bx, GY - 200 - bh + cOffY, bw, bh);
    ctx.fillStyle = 'rgba(255,220,0,.3)';
    for (let wy = bh - 8; wy > 8; wy -= 12) {
      if ((i + wy) % 3 !== 0) continue;
      for (let wx = 3; wx < bw - 3; wx += 8)
        ctx.fillRect(bx + wx, GY - 200 - bh + cOffY + wy, 4, 6);
    }
  }
  ctx.globalAlpha = 1; ctx.restore();
}

/* ── Lune ── */
function _drawMoon(altFactor) {
  const moonAlpha = Math.min(1, (altFactor - 0.10) / 0.15);
  // Position fixe dans le ciel (légère parallaxe)
  const moonX = W * 0.82 - camX * 0.015;
  const moonY = H * 0.12 + camY * 0.008;
  const moonR = Math.min(38, W * 0.038) * (0.6 + moonAlpha * 0.4);
  ctx.save();
  ctx.globalAlpha = moonAlpha * 0.92;
  // Halo lunaire
  const moonGlow = ctx.createRadialGradient(moonX, moonY, moonR * 0.7, moonX, moonY, moonR * 2.2);
  moonGlow.addColorStop(0, 'rgba(200,220,255,.18)');
  moonGlow.addColorStop(1, 'rgba(100,130,200,0)');
  ctx.fillStyle = moonGlow;
  ctx.beginPath(); ctx.arc(moonX, moonY, moonR * 2.2, 0, Math.PI * 2); ctx.fill();
  // Disque
  const moonFill = ctx.createRadialGradient(moonX - moonR * 0.25, moonY - moonR * 0.25, 0, moonX, moonY, moonR);
  moonFill.addColorStop(0, '#eef2ff');
  moonFill.addColorStop(0.5, '#ccd4ee');
  moonFill.addColorStop(1, '#8899bb');
  ctx.fillStyle = moonFill;
  ctx.beginPath(); ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2); ctx.fill();
  // Cratères
  ctx.fillStyle = 'rgba(100,120,160,.4)';
  const craters = [[0.3,0.2,0.18],[-0.2,0.35,0.12],[0.1,-0.3,0.10],[-0.35,-0.1,0.08]];
  craters.forEach(([dx,dy,r]) => {
    ctx.beginPath(); ctx.arc(moonX + dx * moonR, moonY + dy * moonR, r * moonR, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1; ctx.restore();
}

/* ── Système solaire ── */
function _drawSolarSystem(altFactor, solarAlpha) {
  if (solarAlpha === undefined) solarAlpha = 1;
  // Les planètes apparaissent progressivement entre 30% et 80% de hauteur
  const planets = [
    // Planètes affichées plus haut (oy réduit) pour ne pas dépasser en bas de l'écran
    { name:'MERCURY', col:'#b5b5b5', r:5,  ox:W*0.55, oy:H*0.12, spd:0.0008, thr:0.32, lunes:0 },
    { name:'VENUS',   col:'#f0c060', r:8,  ox:W*0.40, oy:H*0.10, spd:0.0005, thr:0.35, lunes:0 },
    { name:'MARS',    col:'#dd5533', r:7,  ox:W*0.70, oy:H*0.08, spd:0.0004, thr:0.38, lunes:1 },
    { name:'JUPITER', col:'#d4956a', r:18, ox:W*0.25, oy:H*0.20, spd:0.00018, thr:0.45, lunes:2 },
    { name:'SATURN',  col:'#e8d08c', r:14, ox:W*0.68, oy:H*0.22, spd:0.00012, thr:0.50, lunes:1, ring:true },
    { name:'URANUS',  col:'#88dddd', r:11, ox:W*0.35, oy:H*0.06, spd:0.00008, thr:0.60, lunes:0 },
    { name:'NEPTUNE', col:'#3366ff', r:10, ox:W*0.80, oy:H*0.14, spd:0.00006, thr:0.65, lunes:0 },
  ];

  ctx.save();
  planets.forEach((p, pi) => {
    if (altFactor < p.thr) return;
    const pAlpha = Math.min(0.95, (altFactor - p.thr) / 0.12 * 0.95) * solarAlpha;
    // Légère dérive selon la distance parcourue (parallaxe lente)
    const px = (p.ox - camX * 0.008 + W * 10) % (W * 1.1) - W * 0.05;
    const py = p.oy + Math.sin(frame * p.spd + pi * 1.4) * 12 - camY * 0.006;
    if (py < -p.r * 3 || py > H + p.r * 3) return;

    ctx.globalAlpha = pAlpha;

    // Halo planétaire
    const halo = ctx.createRadialGradient(px, py, p.r * 0.5, px, py, p.r * 2.8);
    halo.addColorStop(0, p.col + '44');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(px, py, p.r * 2.8, 0, Math.PI * 2); ctx.fill();

    // Anneau de Saturne
    if (p.ring) {
      ctx.save();
      ctx.strokeStyle = p.col + 'aa';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.ellipse(px, py, p.r * 2.5, p.r * 0.55, 0.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = p.col + '55';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(px, py, p.r * 3.0, p.r * 0.68, 0.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Corps de la planète
    const planetFill = ctx.createRadialGradient(px - p.r * 0.3, py - p.r * 0.3, 0, px, py, p.r);
    planetFill.addColorStop(0, '#ffffff44');
    planetFill.addColorStop(0.3, p.col);
    planetFill.addColorStop(1, p.col + '88');
    ctx.fillStyle = planetFill;
    ctx.beginPath(); ctx.arc(px, py, p.r, 0, Math.PI * 2); ctx.fill();

    // Bandes atmosphériques (pour Jupiter et Saturne)
    if (p.r >= 13) {
      ctx.save();
      ctx.globalAlpha = pAlpha * 0.35;
      ctx.strokeStyle = 'rgba(0,0,0,.5)';
      ctx.lineWidth = p.r * 0.22;
      for (let b = -1; b <= 1; b++) {
        ctx.beginPath();
        ctx.ellipse(px, py + b * p.r * 0.28, p.r * 0.95, p.r * 0.14, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Lunes
    for (let l = 0; l < p.lunes; l++) {
      const luneAngle = frame * 0.015 * (l + 1) + pi + l * 2.1;
      const luneR = p.r * (0.6 + l * 0.4);
      const lx = px + Math.cos(luneAngle) * (p.r + 10 + l * 8);
      const ly = py + Math.sin(luneAngle) * (p.r + 10 + l * 8) * 0.4;
      ctx.fillStyle = '#cccccc';
      ctx.beginPath(); ctx.arc(lx, ly, Math.max(2, p.r * 0.18), 0, Math.PI * 2); ctx.fill();
    }

    // Label planète (visible seulement si assez opaque)
    if (pAlpha > 0.6 && p.r >= 7) {
      ctx.fillStyle = 'rgba(200,220,255,.6)';
      ctx.font = '7px Share Tech Mono, monospace'; ctx.textAlign = 'center';
      ctx.fillText(p.name, px, py + p.r + 11);
    }
  });

  // Soleil — très grand, visible seulement à ultra-haute altitude (> 70%)
  if (altFactor > 0.70) {
    const sunAlpha = Math.min(0.9, (altFactor - 0.70) / 0.18 * 0.9);
    const sunX = (W * 0.50 - camX * 0.003 + W * 100) % (W * 1.2) - W * 0.1;
    const sunY = H * 0.08 - camY * 0.004;
    const sunR = Math.min(50, W * 0.05);
    ctx.globalAlpha = sunAlpha;
    // Couronne solaire
    for (let cr = 3; cr >= 1; cr--) {
      const coronaG = ctx.createRadialGradient(sunX, sunY, sunR * 0.7, sunX, sunY, sunR * cr * 1.8);
      coronaG.addColorStop(0, `rgba(255,200,60,${0.12 / cr})`);
      coronaG.addColorStop(1, 'rgba(255,120,0,0)');
      ctx.fillStyle = coronaG;
      ctx.beginPath(); ctx.arc(sunX, sunY, sunR * cr * 1.8, 0, Math.PI * 2); ctx.fill();
    }
    // Disque solaire
    const sunFill = ctx.createRadialGradient(sunX - sunR * 0.2, sunY - sunR * 0.2, 0, sunX, sunY, sunR);
    sunFill.addColorStop(0, '#ffffff');
    sunFill.addColorStop(0.4, '#ffee88');
    sunFill.addColorStop(0.8, '#ffaa22');
    sunFill.addColorStop(1, '#ff6600');
    ctx.fillStyle = sunFill;
    ctx.beginPath(); ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,240,180,.7)';
    ctx.font = '8px Share Tech Mono, monospace'; ctx.textAlign = 'center';
    ctx.fillText('SOLEIL', sunX, sunY + sunR + 12);
  }

  ctx.globalAlpha = 1; ctx.restore();
}

function drawGround() {
  const g = ctx.createLinearGradient(0, GY - 6, 0, H);
  g.addColorStop(0, '#1a0060');
  g.addColorStop(0.05, '#0d0038');
  g.addColorStop(1, '#04000f');
  ctx.fillStyle = g;
  ctx.fillRect(0, GY - 6, W, H - GY + 6);
  ctx.save();
  ctx.shadowColor = '#9900ff'; ctx.shadowBlur = 18;
  ctx.fillStyle = '#cc66ff';
  ctx.fillRect(0, GY - 3, W, 3);
  ctx.restore();

  for (const fx of flowerPosX) {
    const sx = fx - camX;
    if (sx < -60 || sx > W + 60) continue;
    ctx.save();
    ctx.font = '18px serif'; ctx.textAlign = 'center';
    ctx.fillText('🌸', sx, GY - 2);
    ctx.restore();
  }
}

function drawTrails() {
  for (const t of trails) {
    const cx = t.x - camX;
    ctx.globalAlpha = t.life * 0.9;
    const hue = (t.x * 0.4) % 360;
    ctx.fillStyle = `hsl(${hue},100%,70%)`;
    ctx.fillRect(cx - 4, t.y, 8, 2);
    ctx.fillRect(cx - 1, t.y - 4, 2, 10);
    ctx.fillStyle = '#fff';
    ctx.fillRect(cx - 1, t.y - 1, 2, 2);
    ctx.globalAlpha = 1;
  }
}

/* ── Un seul gant de boxe — posé au sol, avec niveau de puissance 1-5 ── */
function drawBoxingGlove(tx, ty, tw, th, gloveAnim, isHit, powerLevel, gloveCol) {
  ctx.save();
  const pLvl = powerLevel || 1;
  const pCol = gloveCol || '#cc2200';
  const glowCol = isHit ? '#ffaa00' : pCol;
  ctx.shadowColor = glowCol;
  ctx.shadowBlur = isHit ? 45 : (10 + pLvl * 5);

  // Tige centrale ancrée au sol
  const stemW = tw * 0.14;
  const stemH = th * 0.35;
  ctx.fillStyle = '#442200';
  ctx.fillRect(tx + tw * 0.5 - stemW / 2, GY - stemH, stemW, stemH);

  // Animation balancement — plus énergique selon puissance
  const swingAmp = 0.06 + pLvl * 0.03;
  const swing = Math.sin(frame * (0.07 + pLvl * 0.01) + gloveAnim) * swingAmp;
  const baseX = tx + tw * 0.5;
  const gloveCenterY = GY - th * 0.55;

  const scale = 0.65 + pLvl * 0.06;
  ctx.save();
  ctx.translate(baseX, gloveCenterY);
  ctx.rotate(swing);
  _drawSingleGlove(0, 0, tw * scale, th * scale * 1.1, isHit, pCol);
  ctx.restore();

  // Étoiles de puissance au-dessus du gant
  ctx.save();
  ctx.globalAlpha = 0.9;
  const starY = gloveCenterY - th * scale * 0.65 - 10;
  const starColors = ['#aaaaaa','#ffe600','#ff8800','#ff3300','#cc00ff'];
  const sc = starColors[pLvl - 1];
  ctx.fillStyle = sc; ctx.shadowColor = sc; ctx.shadowBlur = 8;
  ctx.font = `${9 + pLvl}px serif`; ctx.textAlign = 'center';
  const stars = '★'.repeat(pLvl);
  ctx.fillText(stars, baseX, starY);
  // Puissance en chiffre
  ctx.font = `bold 8px Orbitron, monospace`;
  ctx.fillStyle = sc; ctx.shadowBlur = 5;
  ctx.fillText('×' + ['0.6','1.0','1.5','2.0','2.7'][pLvl-1], baseX, starY + 12);
  ctx.restore();

  ctx.restore();
}

function _drawSingleGlove(x, y, gw, gh, isHit, baseCol) {
  ctx.save();
  const bc = baseCol || '#cc2200';
  const col1 = isHit ? '#ffaa00' : bc;
  const col2 = isHit ? '#ff6600' : bc + 'cc';
  const grad = ctx.createLinearGradient(-gw/2, -gh/2, gw/2, gh/2);
  grad.addColorStop(0, col1);
  grad.addColorStop(1, col2);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, gw * 0.48, gh * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = col2;
  ctx.beginPath();
  ctx.ellipse(gw * 0.2, -gh * 0.1, gw * 0.32, gh * 0.38, -0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffe600';
  ctx.fillRect(-gw * 0.4, gh * 0.28, gw * 0.8, gh * 0.14);

  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, gw * 0.35, gh * 0.35, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.ellipse(-gw * 0.1, -gh * 0.1, gw * 0.15, gh * 0.18, -0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawTerrain() {
  // Canon secret
  if (!secretFired) {
    const sc = SECRET_CANNON;
    const stx = sc.x - camX;
    if (stx > -200 && stx < W + 100) {
      ctx.save();
      ctx.shadowColor = '#ff2200'; ctx.shadowBlur = sc.hit ? 45 : 20;
      const grad = ctx.createLinearGradient(stx + sc.w, 0, stx, 0);
      grad.addColorStop(0, '#220800'); grad.addColorStop(0.5, '#cc3300'); grad.addColorStop(1, '#ff6600');
      ctx.fillStyle = grad;
      if (ctx.roundRect) ctx.roundRect(stx, sc.y + 14, sc.w, sc.h * 0.55, [sc.w * 0.4, 0, 0, sc.w * 0.4]);
      else ctx.rect(stx, sc.y + 14, sc.w, sc.h * 0.55);
      ctx.fill();
      ctx.fillStyle = '#1a0800'; ctx.fillRect(stx - 6, GY - 14, sc.w + 12, 14);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
      ctx.fillText('←', stx + sc.w / 2, sc.y + sc.h * 0.55);
      ctx.fillStyle = '#ff4400'; ctx.shadowColor = '#ff4400'; ctx.shadowBlur = 10;
      ctx.font = '8px Share Tech Mono, monospace';
      ctx.fillText('??SECRET??', stx + sc.w / 2, sc.y - 8);
      ctx.restore(); ctx.textAlign = 'left';
    }
  }

  for (const t of terrain) {
    const tx = t.x - camX;
    if (tx < -300 || tx > W + 300) continue;

    if (t.type === 'boxing_glove') {
      drawBoxingGlove(tx, t.y, t.w, t.h, t.gloveAnim || 0, t.hit, t.powerLevel, t.gloveCol);
    }

    else if (t.type === 'cloud') {
      ctx.save();
      ctx.shadowColor = '#88ccff'; ctx.shadowBlur = t.hit ? 25 : 10;
      ctx.fillStyle = 'rgba(140,195,255,.75)';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(tx, t.y, t.w, t.h, 15);
      else {
        ctx.moveTo(tx + 15, t.y); ctx.lineTo(tx + t.w - 15, t.y);
        ctx.quadraticCurveTo(tx + t.w, t.y, tx + t.w, t.y + 15);
        ctx.lineTo(tx + t.w, t.y + t.h - 15);
        ctx.quadraticCurveTo(tx + t.w, t.y + t.h, tx + t.w - 15, t.y + t.h);
        ctx.lineTo(tx + 15, t.y + t.h);
        ctx.quadraticCurveTo(tx, t.y + t.h, tx, t.y + t.h - 15);
        ctx.lineTo(tx, t.y + 15);
        ctx.quadraticCurveTo(tx, t.y, tx + 15, t.y);
        ctx.closePath();
      }
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.45)';
      ctx.font = '10px Share Tech Mono, monospace'; ctx.textAlign = 'center';
      ctx.fillText('~FM~', tx + t.w / 2, t.y + t.h / 2 + 4);
      ctx.restore(); ctx.textAlign = 'left';
    }

    else if (t.type === 'cannon') {
      ctx.save();
      ctx.shadowColor = '#ff8800'; ctx.shadowBlur = t.hit ? 35 : 14;
      const grad = ctx.createLinearGradient(tx, 0, tx + t.w, 0);
      grad.addColorStop(0, '#221100'); grad.addColorStop(0.5, '#ff7700'); grad.addColorStop(1, '#ffcc33');
      ctx.fillStyle = grad;
      if (ctx.roundRect) ctx.roundRect(tx, t.y + 14, t.w, t.h * 0.55, [t.w * 0.4, 0, 0, t.w * 0.4]);
      else ctx.rect(tx, t.y + 14, t.w, t.h * 0.55);
      ctx.fill();
      ctx.fillStyle = '#332200'; ctx.fillRect(tx - 6, GY - 14, t.w + 12, 14);
      ctx.fillStyle = '#4a3300';
      ctx.beginPath(); ctx.arc(tx + 8, GY - 7, 7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(tx + t.w - 8, GY - 7, 7, 0, Math.PI * 2); ctx.fill();
      if (t.hit) {
        ctx.font = '20px serif'; ctx.textAlign = 'center';
        ctx.fillText('🔥', tx + t.w * 0.8, t.y + t.h * 0.4);
      }
      ctx.fillStyle = '#fff'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
      ctx.fillText('→', tx + t.w / 2, t.y + t.h * 0.55);
      ctx.restore(); ctx.textAlign = 'left';
    }

    else if (t.type === 'fly') {
      // Dessin papillon stylisé
      ctx.save();
      const btCx = tx + t.w / 2;
      const btCy = t.y + t.h / 2;
      const flapT = frame * 0.16 + t.x * 0.002;
      const flapA = Math.abs(Math.sin(flapT)) * 0.7 + 0.1;
      const hitPulse = t.hit ? 1.4 : 1;
      // Halo
      ctx.shadowColor = t.hit ? '#ffe844' : '#ff88cc';
      ctx.shadowBlur = t.hit ? 30 : 12;
      // Aile supérieure gauche
      ctx.fillStyle = t.hit ? '#ffe844' : `hsl(${290 + (t.x%40)}, 100%, 68%)`;
      ctx.beginPath();
      ctx.ellipse(btCx - 3, btCy - 5, (t.w * 0.4 * flapA) * hitPulse, t.h * 0.65 * hitPulse, -0.4 - flapA * 0.5, 0, Math.PI*2);
      ctx.fill();
      // Aile supérieure droite
      ctx.fillStyle = t.hit ? '#ffcc22' : `hsl(${310 + (t.x%30)}, 100%, 72%)`;
      ctx.beginPath();
      ctx.ellipse(btCx + 3, btCy - 5, (t.w * 0.4 * flapA) * hitPulse, t.h * 0.65 * hitPulse, 0.4 + flapA * 0.5, 0, Math.PI*2);
      ctx.fill();
      // Aile inférieure gauche (plus petite)
      ctx.fillStyle = t.hit ? '#ffaa00' : `hsl(${270 + (t.x%50)}, 90%, 60%)`;
      ctx.beginPath();
      ctx.ellipse(btCx - 2, btCy + 4, (t.w * 0.28 * flapA) * hitPulse, t.h * 0.42 * hitPulse, -0.6 - flapA * 0.3, 0, Math.PI*2);
      ctx.fill();
      // Aile inférieure droite
      ctx.fillStyle = t.hit ? '#ffbb11' : `hsl(${300 + (t.x%35)}, 90%, 65%)`;
      ctx.beginPath();
      ctx.ellipse(btCx + 2, btCy + 4, (t.w * 0.28 * flapA) * hitPulse, t.h * 0.42 * hitPulse, 0.6 + flapA * 0.3, 0, Math.PI*2);
      ctx.fill();
      // Corps central (fin)
      ctx.fillStyle = '#220033';
      ctx.beginPath();
      ctx.ellipse(btCx, btCy, 2.5, t.h * 0.55, 0, 0, Math.PI*2);
      ctx.fill();
      // Antennes
      ctx.strokeStyle = '#cc88ff'; ctx.lineWidth = 1; ctx.shadowBlur = 3;
      ctx.beginPath();
      ctx.moveTo(btCx - 1, btCy - t.h * 0.5);
      ctx.quadraticCurveTo(btCx - 8, btCy - t.h * 0.9, btCx - 12, btCy - t.h * 0.85);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(btCx + 1, btCy - t.h * 0.5);
      ctx.quadraticCurveTo(btCx + 8, btCy - t.h * 0.9, btCx + 12, btCy - t.h * 0.85);
      ctx.stroke();
      // Petits cercles au bout des antennes
      ctx.fillStyle = '#ff88cc'; ctx.shadowBlur = 5;
      ctx.beginPath(); ctx.arc(btCx - 12, btCy - t.h * 0.85, 2, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(btCx + 12, btCy - t.h * 0.85, 2, 0, Math.PI*2); ctx.fill();
      // Label "PORTE!" si hit
      if (t.hit) {
        ctx.fillStyle = '#ffe844'; ctx.shadowColor = '#ffe844'; ctx.shadowBlur = 10;
        ctx.font = 'bold 9px Orbitron, monospace'; ctx.textAlign = 'center';
        ctx.fillText('PORTE!', btCx, btCy - t.h - 8);
      }
      ctx.restore();
    }

    else if (t.type === 'mud') {
      ctx.fillStyle = '#3a1500';
      ctx.fillRect(tx, GY - t.h, t.w, t.h);
      ctx.fillStyle = '#5a2a0a';
      for (let mx = 0; mx < t.w; mx += 12) ctx.fillRect(tx + mx + 2, GY - t.h + 3, 7, 6);
      ctx.fillStyle = '#ff5500'; ctx.font = '9px Share Tech Mono, monospace'; ctx.textAlign = 'left';
      ctx.fillText('⚠ BOUE ⚠', tx + 4, GY - t.h - 6);
    }
  }
}

function drawLauncher() {
  const lx = PIV_X - camX;
  const ly = GY;
  const pivX = lx, pivY = ly - PIV_Y_OFF;

  const a   = armAngle;
  const ex  = pivX + Math.cos(a) * ARM_L;
  const ey  = pivY + Math.sin(a) * ARM_L;
  const cx2 = pivX - Math.cos(a) * ARM_L * 0.38;
  const cy2 = pivY - Math.sin(a) * ARM_L * 0.38;

  ctx.save();
  const baseW = 88;
  ctx.strokeStyle = '#cc88ff'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.shadowColor = '#9944cc'; ctx.shadowBlur = 14;
  ctx.beginPath(); ctx.moveTo(lx - baseW / 2 + 8, ly); ctx.lineTo(pivX, pivY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(lx + baseW / 2 - 8, ly); ctx.lineTo(pivX, pivY); ctx.stroke();
  ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(lx - baseW / 2, ly - 4); ctx.lineTo(lx + baseW / 2, ly - 4); ctx.stroke();
  ctx.lineWidth = 5;
  const midY = ly - PIV_Y_OFF * 0.45;
  ctx.beginPath(); ctx.moveTo(lx - baseW / 2 + 20, midY); ctx.lineTo(lx + baseW / 2 - 20, midY); ctx.stroke();
  ctx.lineWidth = 8; ctx.strokeStyle = '#aa66ee';
  ctx.beginPath(); ctx.moveTo(lx - baseW / 2 - 10, ly); ctx.lineTo(lx - baseW / 2 + 24, ly); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(lx + baseW / 2 + 10, ly); ctx.lineTo(lx + baseW / 2 - 24, ly); ctx.stroke();

  ctx.fillStyle = '#ffe600'; ctx.shadowColor = '#ffe600'; ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.arc(pivX, pivY, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff8800';
  ctx.beginPath(); ctx.arc(pivX, pivY, 5, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 22;
  ctx.beginPath(); ctx.moveTo(pivX, pivY); ctx.lineTo(ex, ey); ctx.stroke();

  ctx.strokeStyle = '#ff4488'; ctx.lineWidth = 6;
  ctx.shadowColor = '#ff4488'; ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.moveTo(pivX, pivY); ctx.lineTo(cx2, cy2); ctx.stroke();

  ctx.fillStyle = '#ff4488'; ctx.shadowColor = '#ff4488'; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.arc(cx2, cy2, 14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff8888';
  ctx.beginPath(); ctx.arc(cx2 - 4, cy2 - 4, 5, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#00f0ff'; ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 28;
  ctx.beginPath(); ctx.arc(ex, ey, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.arc(ex - 3, ey - 3, 3, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#00f0ff'; ctx.shadowBlur = 8;
  ctx.font = 'bold 9px Share Tech Mono, monospace'; ctx.textAlign = 'center';
  ctx.fillText('JFM', lx, ly - 10);
  ctx.restore(); ctx.textAlign = 'left';
}

function drawBottle(x, y, sz, rot, col, acc, shapeIdx) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.shadowColor = col; ctx.shadowBlur = 20;

  // shapeType → si mapping: round=0, hex=1, tri=2, rect=3, oval=4
  const shapeMap = { round: 0, hex: 1, tri: 2, rect: 3, oval: 4 };
  // Accept either string shapeType or legacy numeric index
  const si = typeof shapeIdx === 'string'
    ? (shapeMap[shapeIdx] ?? 0)
    : shapeIdx % 5;

  if (si === 0) {
    // ── Round (CTRL PAD, HEADSET) ──
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.ellipse(0, sz * 0.3, sz * 0.7, sz * 0.9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -sz * 0.55, sz * 0.3, sz * 0.45, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = acc;
    ctx.beginPath(); ctx.arc(0, -sz * 0.9, sz * 0.22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath(); ctx.ellipse(-sz * 0.2, -sz * 0.1, sz * 0.18, sz * 0.38, -0.4, 0, Math.PI * 2); ctx.fill();
  } else if (si === 1) {
    // ── Hexagone (JOY STICK, ARCADE) ──
    ctx.fillStyle = col;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 - Math.PI / 6, r = sz * 0.82;
      if (i === 0) ctx.moveTo(Math.cos(ang) * r, Math.sin(ang) * r + sz * 0.22);
      else ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r + sz * 0.22);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillRect(-sz * 0.22, -sz * 0.62, sz * 0.44, sz * 0.42);
    ctx.fillStyle = acc;
    ctx.beginPath(); ctx.arc(0, -sz * 0.88, sz * 0.25, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath(); ctx.ellipse(sz * 0.15, sz * 0.1, sz * 0.25, sz * 0.38, 0.3, 0, Math.PI * 2); ctx.fill();
  } else if (si === 2) {
    // ── Triangle à coins arrondis (MEGA PAD) — allongé, base large ──
    // Triangle isocèle : pointe haute, base large → effet "flèche"
    // Sommet haut (apex) plus éloigné, base (deux sommets bas) très écartée
    const apexY  = -sz * 1.3;         // pointe haute
    const baseY  =  sz * 0.85;        // ligne de base
    const baseHW =  sz * 1.10;        // demi-largeur de la base (très large)
    const r      =  sz * 0.13;        // rayon d'arrondi des coins

    const pts = [
      { x: 0,       y: apexY  },      // sommet haut (apex)
      { x:  baseHW, y: baseY  },      // bas-droit
      { x: -baseHW, y: baseY  },      // bas-gauche
    ];

    ctx.fillStyle = col;
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const prev = pts[(i + 2) % 3];
      const curr = pts[i];
      const next = pts[(i + 1) % 3];
      const ax = curr.x - prev.x, ay = curr.y - prev.y;
      const bx = curr.x - next.x, by = curr.y - next.y;
      const la = Math.hypot(ax, ay), lb = Math.hypot(bx, by);
      const p1x = curr.x - (ax / la) * r, p1y = curr.y - (ay / la) * r;
      const p2x = curr.x - (bx / lb) * r, p2y = curr.y - (by / lb) * r;
      if (i === 0) ctx.moveTo(p1x, p1y);
      else         ctx.lineTo(p1x, p1y);
      ctx.quadraticCurveTo(curr.x, curr.y, p2x, p2y);
    }
    ctx.closePath(); ctx.fill();

    // Accent intérieur centré sur le centre de gravité visuel
    const cgy = (apexY + baseY + baseY) / 3;
    ctx.fillStyle = acc;
    ctx.beginPath(); ctx.arc(0, cgy, sz * 0.28, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.beginPath(); ctx.ellipse(-sz * 0.22, cgy - sz * 0.2, sz * 0.18, sz * 0.28, -0.4, 0, Math.PI * 2); ctx.fill();

    // Contour des arêtes — renforce l'aspect "rigid"
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2;
    ctx.stroke();
  } else if (si === 3) {
    // ── Rectangle arrondi (rect) ──
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(-sz * 0.65, sz * 0.9); ctx.lineTo(sz * 0.65, sz * 0.9);
    ctx.lineTo(sz * 0.65, -sz * 0.2);
    ctx.quadraticCurveTo(sz * 0.65, -sz * 1.05, 0, -sz * 1.05);
    ctx.quadraticCurveTo(-sz * 0.65, -sz * 1.05, -sz * 0.65, -sz * 0.2);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = acc;
    ctx.beginPath(); ctx.arc(0, -sz * 0.85, sz * 0.28, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(-sz * 0.65, sz * 0.1, sz * 1.3, sz * 0.22);
  } else {
    // ── Oval (RETRO X) ──
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.ellipse(0, sz * 0.2, sz * 0.72, sz * 0.95, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = acc;
    ctx.beginPath(); ctx.ellipse(sz * 0.18, -sz * 0.85, sz * 0.18, sz * 0.28, 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(sz * 0.28, -sz * 1.0, sz * 0.12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath(); ctx.ellipse(-sz * 0.22, -sz * 0.1, sz * 0.2, sz * 0.46, -0.3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.5;
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawCharacter() {
  if (isAbsorbed) return;
  const c  = CHARS[selChar];
  const sk = getCharSkin(selChar);
  const sz = c.size;
  const sh = c.shapeType || 'round';
  if (state === 'menu' || state === 'ready') {
    const tip = getArmTipPos(armAngle, false);
    drawBottle(tip.x, tip.y, sz, 0, sk.col, sk.acc, sh);
  } else if (state === 'swinging') {
    const tip = getArmTipPos(armAngle, false);
    drawBottle(tip.x, tip.y, sz, Math.sin(frame * 0.15) * 0.08, sk.col, sk.acc, sh);
  } else if (state === 'flying' || state === 'dead') {
    drawBottle(ch.x - camX, ch.y, sz, ch.rot, sk.col, sk.acc, sh);
  }
}

function drawParticles() {
  for (const p of particles) {
    ctx.save(); ctx.globalAlpha = p.life;
    ctx.shadowColor = p.col; ctx.shadowBlur = 9;
    ctx.fillStyle = p.col;
    ctx.fillRect(p.x - camX - p.s / 2, p.y - p.s / 2, p.s, p.s);
    ctx.restore();
  }
}

/* ══════════════════════════════════════════════════════════
   MINIMAP — joueur ancré à gauche (avance) ou droite (recule)
══════════════════════════════════════════════════════════ */
function drawMinimap() {
  if (camY < 40) return;

  const isSmall = W < 600 || H < 400;
  const mmW = isSmall ? Math.min(140, W * 0.32) : 220;
  const mmH = isSmall ? 60 : 100;
  const mmX = 16, mmY = H - mmH - 12;
  const viewRange = W * 2.5;

  // Ancrage dynamique : joueur à gauche si vx > 0, à droite si vx < 0
  const goingLeft = ch.vx < -0.5;
  // playerRatio : proportion horizontale où se trouve le joueur dans la minimap
  // 0.18 = proche du bord gauche, 0.82 = proche du bord droit
  const playerRatio = goingLeft ? 0.82 : 0.18;
  const mmCamX = camX - viewRange * playerRatio;
  const mmScale = mmW / viewRange;

  ctx.save();
  ctx.fillStyle = 'rgba(2,0,18,.92)';
  ctx.strokeStyle = 'rgba(0,240,255,.4)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.roundRect(mmX, mmY, mmW, mmH, 5); ctx.fill(); ctx.stroke();

  // Header
  ctx.fillStyle = 'rgba(0,240,255,.6)';
  ctx.font = (isSmall ? '6' : '8') + 'px Share Tech Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('MAP', mmX + 4, mmY + (isSmall ? 9 : 11));

  // Ligne sol
  const gyMM = mmY + mmH * 0.78;
  ctx.strokeStyle = '#8833cc'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(mmX + 2, gyMM); ctx.lineTo(mmX + mmW - 2, gyMM); ctx.stroke();

  // Sol rempli
  ctx.fillStyle = 'rgba(40,0,80,.6)';
  ctx.fillRect(mmX + 2, gyMM, mmW - 4, mmH - (mmH - gyMM + mmY) + mmY - 2);

  // Terrain
  for (const t of terrain) {
    const rx = mmX + (t.x - mmCamX) * mmScale;
    if (rx < mmX - 2 || rx > mmX + mmW + 2) continue;
    const tw2 = Math.max(2, t.w * mmScale);

    if (t.type === 'boxing_glove') {
      const gh = Math.max(4, t.h * mmScale * 2.5);
      ctx.fillStyle = t.hit ? '#ffaa00' : '#ff3300';
      ctx.shadowColor = '#ff3300'; ctx.shadowBlur = 3;
      ctx.fillRect(rx - tw2 * 0.5, gyMM - gh, tw2, gh);
      ctx.shadowBlur = 0;
    } else if (t.type === 'cannon') {
      ctx.fillStyle = '#ff8800';
      ctx.shadowColor = '#ff8800'; ctx.shadowBlur = 2;
      ctx.fillRect(rx - tw2 * 0.5, gyMM - 5, tw2, 5);
      ctx.shadowBlur = 0;
    } else if (t.type === 'cloud') {
      const cloudY = mmY + 4 + (t.y / GY) * (gyMM - mmY - 8);
      ctx.fillStyle = 'rgba(150,210,255,.75)';
      ctx.fillRect(rx - Math.max(3, t.w * mmScale * 0.5), cloudY - 2, Math.max(6, t.w * mmScale), 4);
    } else if (t.type === 'fly') {
      const flyY = mmY + 4 + (t.y / GY) * (gyMM - mmY - 8);
      ctx.fillStyle = t.hit ? '#ffe844' : '#ff88cc';
      ctx.shadowColor = '#ff88cc'; ctx.shadowBlur = 2;
      ctx.fillRect(rx - 4, flyY - 2, 10, 4);
      ctx.shadowBlur = 0;
    } else if (t.type === 'mud') {
      ctx.fillStyle = '#5a2a0a';
      ctx.fillRect(rx - tw2 * 0.5, gyMM - 3, tw2, 3);
    }
  }

  // Joueur — point clignotant à la position ancrée
  const pxMM = mmX + (ch.x - mmCamX) * mmScale;
  const heightRatio = Math.max(0, Math.min(1, (GY - ch.y) / Math.max(camY + 50, H * 0.5)));
  const pyMM = gyMM - heightRatio * (gyMM - mmY - 14);
  if (pxMM >= mmX + 2 && pxMM <= mmX + mmW - 2) {
    const blink = Math.sin(frame * 0.22) > 0;
    const c = CHARS[selChar];
    ctx.shadowColor = c.col; ctx.shadowBlur = blink ? 10 : 4;
    ctx.fillStyle = blink ? c.col : c.col + 'aa';
    ctx.beginPath(); ctx.arc(pxMM, Math.max(mmY + 8, Math.min(gyMM - 2, pyMM)), blink ? 4 : 3, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Indicateur de direction
  ctx.fillStyle = goingLeft ? '#ff6666' : '#66ff88';
  ctx.font = '7px Share Tech Mono, monospace'; ctx.textAlign = 'right';
  ctx.fillText(goingLeft ? '◀' : '▶', mmX + mmW - 4, mmY + (isSmall ? 9 : 11));

  ctx.restore();
}
/* ══════════════════════════════════════════════════════════
   LEADERBOARD — BEST / WORST — toujours visible, milieu-gauche
══════════════════════════════════════════════════════════ */
function drawLeaderboard() {
  if (state === 'menu') return;

  const isSmall = W < 600 || H < 400;
  const lbW   = isSmall ? Math.min(200, W * 0.38) : 270;
  const tabH  = isSmall ? 20 : 24;
  const periH = isSmall ? 17 : 20;  // hauteur barre période
  const listH = isSmall ? 19 : 22;
  const titleH = isSmall ? 16 : 18;

  // Nombre d'entrées visibles = dynamique selon hauteur dispo
  const maxRows = Math.floor((H * 0.55) / listH);
  const visibleCount = Math.max(4, Math.min(maxRows, 12));

  const allEntries  = LEADERBOARD.getAll(LEADERBOARD._active);
  const scrollOff   = LEADERBOARD._scroll[LEADERBOARD._active] || 0;
  const entries     = allEntries.slice(scrollOff, scrollOff + visibleCount);

  const totalH = tabH + periH + titleH + listH * visibleCount + 16;
  const lbX = 10;
  const lbY = 10;

  ctx.save();
  ctx.fillStyle = 'rgba(0,0,15,.92)';
  ctx.strokeStyle = 'rgba(0,240,255,.3)'; ctx.lineWidth = 1.2;
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(lbX, lbY, lbW, totalH, 8); ctx.fill(); ctx.stroke(); }
  else { ctx.fillRect(lbX, lbY, lbW, totalH); ctx.strokeRect(lbX, lbY, lbW, totalH); }

  // ── Onglets catégorie : BEST / WORST / ALT ──
  const tabs = [['best','🏆'],['worst','💀'],['alt','↑']];
  const tw = lbW / 3;
  tabs.forEach(([key, label], i) => {
    const tabX  = lbX + i * tw;
    const active = LEADERBOARD._active === key;
    const tabCol = key === 'best' ? '#00f0ff' : key === 'worst' ? '#ff4444' : '#00ff88';
    ctx.fillStyle = active ? tabCol + '30' : 'rgba(0,0,0,.18)';
    ctx.fillRect(tabX, lbY, tw, tabH);
    ctx.strokeStyle = active ? tabCol : 'rgba(255,255,255,.07)'; ctx.lineWidth = active ? 1.5 : 0.5;
    ctx.strokeRect(tabX, lbY, tw, tabH);
    ctx.fillStyle = active ? tabCol : '#444';
    ctx.font = (active ? 'bold ' : '') + (isSmall ? '7' : '9') + 'px Orbitron, monospace';
    ctx.textAlign = 'center';
    const tabLabel = isSmall ? label : (key === 'best' ? '🏆 BEST' : key === 'worst' ? '💀 WORST' : '↑ ALT');
    ctx.fillText(tabLabel, tabX + tw / 2, lbY + tabH * 0.73);
  });

  // ── Sous-onglets période : Daily / Weekly / Monthly ──
  const periods  = ['Daily','Weekly','Monthly'];
  const pLabels  = isSmall ? ['J','S','M'] : ['JOUR','SEMAINE','MOIS'];
  const pW       = lbW / 3;
  const periY    = lbY + tabH;
  const periCols = { Daily: '#ffe600', Weekly: '#ff8800', Monthly: '#00f0ff' };
  periods.forEach((p, i) => {
    const px     = lbX + i * pW;
    const active = LEADERBOARD._period === p;
    const pc     = periCols[p];
    ctx.fillStyle = active ? pc + '28' : 'rgba(0,0,0,.1)';
    ctx.fillRect(px, periY, pW, periH);
    ctx.strokeStyle = active ? pc : 'rgba(255,255,255,.04)'; ctx.lineWidth = active ? 1 : 0.5;
    ctx.strokeRect(px, periY, pW, periH);
    ctx.fillStyle = active ? pc : '#333';
    ctx.font = (active ? 'bold ' : '') + (isSmall ? '6' : '8') + 'px Orbitron, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(pLabels[i], px + pW / 2, periY + periH * 0.74);
  });

  // Mémorise géométrie des sous-onglets pour les clics
  drawLeaderboard._periY  = periY;
  drawLeaderboard._periH  = periH;
  drawLeaderboard._periW  = pW;

  // ── Titre ──
  const isAlt  = LEADERBOARD._active === 'alt';
  const isBest = LEADERBOARD._active === 'best';
  const tabColA = isBest ? '#00f0ff' : isAlt ? '#00ff88' : '#ff6666';
  ctx.fillStyle = tabColA + '88';
  ctx.font = 'bold ' + (isSmall ? '6' : '8') + 'px Orbitron, monospace';
  ctx.textAlign = 'center';
  const titleY = lbY + tabH + periH + (isSmall ? 11 : 13);
  const titleLabel = isBest ? '— MEILLEURS SCORES —' : isAlt ? '— MEILLEURES ALTITUDES —' : '— PIRES SCORES —';
  ctx.fillText(titleLabel, lbX + lbW / 2, titleY);

  // ── Entrées (scroll illimité) ──
  const pyStart  = lbY + tabH + periH + titleH + 2;
  const scoreCol = isBest ? '#00f0ff' : isAlt ? '#00ff88' : '#ff6666';
  const fs  = isSmall ? '9' : '11';
  const unit = isAlt ? 'm alt' : 'm';

  entries.forEach((e, i) => {
    const rank = scrollOff + i + 1;
    const medalCol = rank === 1 ? (isBest || isAlt ? '#ffe600' : '#ff4444') :
                     rank === 2 ? (isBest || isAlt ? '#cccccc' : '#cc2222') :
                     rank === 3 ? (isBest || isAlt ? '#cc7700' : '#991111') : '#666';
    const entryY = pyStart + i * listH + listH * 0.78;
    if (i % 2 === 0) {
      ctx.fillStyle = 'rgba(255,255,255,.035)';
      ctx.fillRect(lbX + 2, pyStart + i * listH, lbW - 4, listH - 1);
    }
    ctx.fillStyle = medalCol;
    ctx.font = 'bold ' + fs + 'px Share Tech Mono, monospace'; ctx.textAlign = 'left';
    ctx.fillText(rank + '.', lbX + 6, entryY);
    ctx.fillStyle = '#ccc';
    ctx.font = fs + 'px Share Tech Mono, monospace';
    ctx.fillText(e.name.slice(0, 9), lbX + 24, entryY);
    ctx.fillStyle = scoreCol; ctx.textAlign = 'right';
    ctx.font = 'bold ' + fs + 'px Share Tech Mono, monospace';
    ctx.fillText(e.score + unit, lbX + lbW - 5, entryY);
  });

  if (entries.length === 0) {
    ctx.fillStyle = '#333'; ctx.font = (isSmall ? '8' : '10') + 'px Share Tech Mono, monospace'; ctx.textAlign = 'center';
    ctx.fillText('— vide —', lbX + lbW / 2, pyStart + listH * 2);
  }

  // ── Indicateur scroll (illimité) ──
  if (allEntries.length > visibleCount) {
    const hasUp   = scrollOff > 0;
    const hasDown = scrollOff + visibleCount < allEntries.length;
    ctx.fillStyle = 'rgba(0,240,255,.5)';
    ctx.font = '10px serif'; ctx.textAlign = 'center';
    if (hasUp)   ctx.fillText('▲', lbX + lbW - 10, lbY + tabH + periH + titleH + 6);
    if (hasDown) ctx.fillText('▼', lbX + lbW - 10, lbY + totalH - 6);
    ctx.fillStyle = 'rgba(0,240,255,.3)';
    ctx.font = '7px Share Tech Mono, monospace';
    ctx.fillText(
      scrollOff + 1 + '-' + Math.min(scrollOff + visibleCount, allEntries.length) + '/' + allEntries.length,
      lbX + lbW / 2, lbY + totalH - 5
    );
  }

  drawLeaderboard._lastBottom = lbY + totalH;
  drawLeaderboard._lbW  = lbW;
  drawLeaderboard._lbY  = lbY;
  drawLeaderboard._tabH = tabH;
  drawLeaderboard._tw   = tw;
  drawLeaderboard._totalH = totalH;

  ctx.textAlign = 'left'; ctx.restore();
}

/* ══════════════════════════════════════════════════════════
   ANGLE INDICATOR
══════════════════════════════════════════════════════════ */
function drawAngleIndicator() {
  if (state !== 'swinging') return;

  const range = ARM_MAX - ARM_REST;
  const progress = (armAngle - ARM_REST) / range;
  const pct = Math.max(0, Math.min(1, progress));
  const good = pct >= 0.35 && pct <= 0.70;
  const ok   = (pct >= 0.20 && pct < 0.35) || (pct > 0.70 && pct <= 0.85);
  const col  = good ? '#00ff88' : ok ? '#ffe600' : '#ff4444';

  const gH = 200, gW = 22, gx = 32, gy = H / 2 - gH / 2;

  ctx.save();
  ctx.fillStyle = 'rgba(0,255,136,.10)';
  ctx.fillRect(gx, gy + gH * 0.30, gW, gH * 0.35);
  ctx.fillStyle = '#0a0a0a'; ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
  ctx.fillRect(gx, gy, gW, gH); ctx.strokeRect(gx, gy, gW, gH);
  const fh = gH * pct;
  const gr = ctx.createLinearGradient(0, gy + gH, 0, gy + gH - fh);
  gr.addColorStop(0, col); gr.addColorStop(1, col + '44');
  ctx.fillStyle = gr; ctx.fillRect(gx, gy + gH - fh, gW, fh);
  if (good) {
    ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 18;
    ctx.fillStyle = 'rgba(0,255,136,.25)'; ctx.fillRect(gx, gy + gH - fh, gW, fh);
  }
  ctx.restore();
  ctx.save();
  ctx.fillStyle = '#888'; ctx.font = '11px Share Tech Mono, monospace'; ctx.textAlign = 'center';
  ctx.fillText('TIMING', gx + gW / 2, gy - 12);
  ctx.fillStyle = col; ctx.textAlign = 'left'; ctx.font = '13px Share Tech Mono, monospace';
  const label = good ? 'PARFAIT!' : ok ? 'BON' : (pct < 0.20 ? 'TROP TOT' : 'TROP TARD');
  ctx.fillText(label, gx + gW + 12, gy + gH - fh + 4);
  ctx.restore();
}

/* ══════════════════════════════════════════════════════════
   HUD — avec cooldown piqué animé (cercle + flèche)
══════════════════════════════════════════════════════════ */
function drawHUD() {
  const c  = CHARS[selChar];
  const sk = getCharSkin(selChar);
  ctx.save();

  const hudSmall = W < 600 || H < 400;
  const distCol = currentDist < 0 ? '#ff4444' : '#00f0ff';
  const distSign = currentDist >= 0 ? '+' : '';
  const altitude = Math.max(0, Math.round((GY - ch.y) / 2.5));

  // ── Constantes de design uniformisées ──
  const LABEL_FONT   = `${hudSmall ? 8 : 10}px Orbitron, monospace`;
  const VALUE_FONT_L = `bold ${hudSmall ? 34 : 50}px Orbitron, monospace`;
  const VALUE_FONT_M = `bold ${hudSmall ? 15 : 20}px Share Tech Mono, monospace`;
  const VALUE_FONT_S = `bold ${hudSmall ? 12 : 15}px Share Tech Mono, monospace`;
  const SEP_COL      = 'rgba(255,255,255,0.10)';

  // ── BOÎTE SCORE CENTRALE ──
  const centerX   = W / 2;
  const scoreBoxW = hudSmall ? 230 : 370;
  const scoreBoxH = hudSmall ? 96 : 128;
  const boxTop    = 8;

  ctx.fillStyle = 'rgba(0,0,15,0.68)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(centerX - scoreBoxW / 2, boxTop, scoreBoxW, scoreBoxH, 14);
  else ctx.rect(centerX - scoreBoxW / 2, boxTop, scoreBoxW, scoreBoxH);
  ctx.fill();
  ctx.strokeStyle = distCol + '55'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(centerX - scoreBoxW / 2, boxTop, scoreBoxW, scoreBoxH, 14);
  else ctx.rect(centerX - scoreBoxW / 2, boxTop, scoreBoxW, scoreBoxH);
  ctx.stroke();

  // Barre de couleur haute
  ctx.fillStyle = distCol + '33';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(centerX - scoreBoxW / 2, boxTop, scoreBoxW, 3, [14, 14, 0, 0]);
  else ctx.rect(centerX - scoreBoxW / 2, boxTop, scoreBoxW, 3);
  ctx.fill();

  // ── LIGNE 1 : Label DISTANCE ──
  const row0Y = boxTop + (hudSmall ? 16 : 20);
  ctx.fillStyle = distCol + '88';
  ctx.font = LABEL_FONT; ctx.textAlign = 'center';
  ctx.fillText('▸ DISTANCE ◂', centerX, row0Y);

  // ── LIGNE 2 : Valeur distance principale ──
  const row1Y = boxTop + (hudSmall ? 44 : 60);
  ctx.shadowColor = distCol; ctx.shadowBlur = 26;
  ctx.fillStyle = distCol;
  ctx.font = VALUE_FONT_L; ctx.textAlign = 'center';
  ctx.fillText(distSign + currentDist + ' m', centerX, row1Y);
  ctx.shadowBlur = 0;

  // ── Séparateur ──
  const sep1Y = boxTop + (hudSmall ? 50 : 68);
  ctx.strokeStyle = SEP_COL; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(centerX - scoreBoxW / 2 + 20, sep1Y);
  ctx.lineTo(centerX + scoreBoxW / 2 - 20, sep1Y);
  ctx.stroke();

  // ── LIGNE 3 : MAX à gauche | RECORD à droite ──
  const row2Y   = boxTop + (hudSmall ? 67 : 90);
  const colOff  = hudSmall ? 70 : 95;

  // MAX
  ctx.fillStyle = '#ffe600'; ctx.shadowColor = '#ffe600'; ctx.shadowBlur = 5;
  ctx.font = VALUE_FONT_M; ctx.textAlign = 'center';
  ctx.fillText(maxDist + ' m', centerX - colOff, row2Y);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,230,0,0.55)';
  ctx.font = LABEL_FONT;
  ctx.fillText('MAX', centerX - colOff, row2Y - (hudSmall ? 12 : 15));

  // Séparateur vertical
  ctx.strokeStyle = SEP_COL; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(centerX, row2Y - (hudSmall ? 16 : 20));
  ctx.lineTo(centerX, row2Y + (hudSmall ? 3 : 4));
  ctx.stroke();

  // RECORD
  ctx.fillStyle = best > 0 && maxDist >= best ? '#ffe600' : '#888';
  ctx.shadowColor = best > 0 && maxDist >= best ? '#ffe600' : 'transparent';
  ctx.shadowBlur  = best > 0 && maxDist >= best ? 5 : 0;
  ctx.font = VALUE_FONT_S; ctx.textAlign = 'center';
  ctx.fillText(best + ' m', centerX + colOff, row2Y);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(180,180,180,0.55)';
  ctx.font = LABEL_FONT;
  ctx.fillText('RECORD', centerX + colOff, row2Y - (hudSmall ? 12 : 15));

  // ── Séparateur ──
  const sep2Y = boxTop + (hudSmall ? 74 : 99);
  ctx.strokeStyle = SEP_COL; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(centerX - scoreBoxW / 2 + 20, sep2Y);
  ctx.lineTo(centerX + scoreBoxW / 2 - 20, sep2Y);
  ctx.stroke();

  // ── LIGNE 4 : Altitude ──
  const altCol = altitude > 2200 ? '#cc00ff' : altitude > 1200 ? '#bb44ff' : altitude > 200 ? '#00f0ff' : '#00ff88';
  const row3Y  = boxTop + (hudSmall ? 87 : 117);
  const arrowB = altitude > 10 ? Math.sin(frame * 0.15) * 1.5 : 0;
  ctx.fillStyle = altCol + '88';
  ctx.font = LABEL_FONT; ctx.textAlign = 'center';
  ctx.fillText('↑ ALTITUDE', centerX, row3Y - (hudSmall ? 1 : 1));
  ctx.fillStyle = altCol;
  ctx.shadowColor = altitude > 0 ? altCol : 'transparent';
  ctx.shadowBlur  = altitude > 0 ? 7 : 0;
  ctx.font = `bold ${hudSmall ? 13 : 17}px Orbitron, monospace`;
  ctx.fillText(altitude + ' m', centerX, row3Y + (hudSmall ? 11 : 15) + arrowB);
  ctx.shadowBlur = 0;

  // Cooldown — bas centre, adaptatif
  if (state === 'flying') {
    // Afficher/masquer le bouton retry (uniquement pendant le vol)
    const rb = document.getElementById('jfm-retry-btn');
    if (rb) {
      if (retryBtnShown) {
        rb.classList.add('visible'); rb.style.display = 'flex';
      } else {
        rb.classList.remove('visible'); rb.style.display = 'none';
      }
    }
    const hudSmall = W < 600 || H < 400;
    const iconR = hudSmall ? 28 : 40;

    // ── Layout côte à côte centré en bas : [ Retry ] gap [ Cooldown ] ──
    const gap    = hudSmall ? 16 : 26;
    const retryD = iconR * 2;
    const totalW = retryD + gap + retryD;
    const startX = Math.round(W / 2 - totalW / 2);

    const retryX = startX;
    const iconX  = startX + retryD + gap + iconR;
    const iconY  = H - iconR - (hudSmall ? 30 : 46);

    if (rb && rb.classList.contains('visible')) {
      const rbSize = retryD;
      rb.style.position  = 'absolute';
      rb.style.width     = rbSize + 'px';
      rb.style.height    = rbSize + 'px';
      rb.style.left      = retryX + 'px';
      rb.style.top       = (iconY - iconR) + 'px';
      rb.style.bottom    = 'auto';
      rb.style.transform = 'none';
    }
    ctx.save();

    if (diveCooldownTimer > 0) {
      // Fond sombre du cercle
      ctx.fillStyle = 'rgba(0,0,0,.55)';
      ctx.beginPath(); ctx.arc(iconX, iconY, iconR, 0, Math.PI * 2); ctx.fill();

      // Arc de progression (sens horaire, de haut en bas)
      const progress = 1 - (diveCooldownTimer / DIVE_COOLDOWN);
      ctx.strokeStyle = '#ff7744';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#ff7744'; ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(iconX, iconY, iconR - 3, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.stroke();

      // Arc restant (fond gris)
      ctx.strokeStyle = 'rgba(255,120,68,.18)';
      ctx.lineWidth = 5;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(iconX, iconY, iconR - 3, -Math.PI / 2 + progress * Math.PI * 2, -Math.PI / 2 + Math.PI * 2);
      ctx.stroke();

      // Flèche vers le bas (grisée), taille proportionnelle au cercle
      const asz = iconR * 0.32;
      ctx.fillStyle = 'rgba(255,120,68,.5)';
      ctx.beginPath();
      ctx.moveTo(iconX, iconY - asz * 1.1);
      ctx.lineTo(iconX + asz * 0.8, iconY + asz * 0.2);
      ctx.lineTo(iconX + asz * 0.35, iconY + asz * 0.2);
      ctx.lineTo(iconX + asz * 0.35, iconY + asz * 1.1);
      ctx.lineTo(iconX - asz * 0.35, iconY + asz * 1.1);
      ctx.lineTo(iconX - asz * 0.35, iconY + asz * 0.2);
      ctx.lineTo(iconX - asz * 0.8, iconY + asz * 0.2);
      ctx.closePath();
      ctx.fill();

      // Texte secondes
      ctx.fillStyle = '#ff7744'; ctx.shadowBlur = 0;
      ctx.font = `bold ${hudSmall ? 10 : 13}px Share Tech Mono, monospace`; ctx.textAlign = 'center';
      ctx.fillText((diveCooldownTimer / 60).toFixed(1) + 's', iconX, iconY + iconR + (hudSmall ? 16 : 20));

    } else if (canDive) {
      // Disponible : cercle vert pulsant
      const pulse = 0.7 + Math.sin(frame * 0.12) * 0.3;
      ctx.globalAlpha = pulse;
      ctx.fillStyle = 'rgba(255,68,136,.15)';
      ctx.beginPath(); ctx.arc(iconX, iconY, iconR, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = '#ff4488'; ctx.lineWidth = 3;
      ctx.shadowColor = '#ff4488'; ctx.shadowBlur = 14 * pulse;
      ctx.beginPath(); ctx.arc(iconX, iconY, iconR - 2, 0, Math.PI * 2); ctx.stroke();

      ctx.globalAlpha = 1;

      // Flèche vers le bas animée, taille proportionnelle
      const asz2 = iconR * 0.32;
      const bounce = Math.sin(frame * 0.18) * 4;
      ctx.fillStyle = '#ff4488';
      ctx.shadowColor = '#ff4488'; ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(iconX, iconY - asz2 * 1.1 + bounce);
      ctx.lineTo(iconX + asz2 * 0.8, iconY + asz2 * 0.2 + bounce);
      ctx.lineTo(iconX + asz2 * 0.35, iconY + asz2 * 0.2 + bounce);
      ctx.lineTo(iconX + asz2 * 0.35, iconY + asz2 * 1.1 + bounce);
      ctx.lineTo(iconX - asz2 * 0.35, iconY + asz2 * 1.1 + bounce);
      ctx.lineTo(iconX - asz2 * 0.35, iconY + asz2 * 0.2 + bounce);
      ctx.lineTo(iconX - asz2 * 0.8, iconY + asz2 * 0.2 + bounce);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ff4488'; ctx.shadowBlur = 0;
      ctx.font = `bold ${hudSmall ? 9 : 11}px Share Tech Mono, monospace`; ctx.textAlign = 'center';
      ctx.fillText('PIQUÉ', iconX, iconY + iconR + (hudSmall ? 16 : 20));

    } else {
      // Épuisé
      ctx.fillStyle = 'rgba(60,60,60,.6)';
      ctx.beginPath(); ctx.arc(iconX, iconY, iconR, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(iconX, iconY, iconR - 2, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#444';
      ctx.font = 'bold 9px Share Tech Mono, monospace'; ctx.textAlign = 'center';
      ctx.fillText('USED', iconX, iconY + 4);
    }

    ctx.restore();
  }

  // Masquer le retry btn si pas en vol
  if (state !== 'flying') {
    const rbh = document.getElementById('jfm-retry-btn');
    if (rbh) { rbh.classList.remove('visible'); rbh.style.display = 'none'; }
  }

  ctx.restore();
}

/* ══════════════════════════════════════════════════════════
   MENU — sélection personnage redessinée
══════════════════════════════════════════════════════════ */
function drawMenu() {
  ctx.save();

  // Titre
  ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 40;
  ctx.fillStyle = '#00f0ff';
  const menuFS = W < 700 ? Math.max(22, W * 0.055) : 52;
  ctx.font = `bold ${menuFS}px Orbitron, monospace`; ctx.textAlign = 'center';
  ctx.fillText('JOYSTICK LAUNCH', W / 2, W < 700 ? 38 : 78);
  ctx.shadowBlur = 0;

  ctx.fillStyle = 'rgba(0,240,255,.55)'; ctx.font = '13px Share Tech Mono, monospace';
  ctx.fillText('← → · Q D  pour choisir', W / 2, 140);
  // Call-to-action principal
  const ctaAlpha = 0.65 + Math.sin(frame * 0.06) * 0.35;
  ctx.globalAlpha = ctaAlpha;
  ctx.fillStyle = '#ffe600'; ctx.shadowColor = '#ffe600'; ctx.shadowBlur = 12;
  ctx.font = 'bold 16px Orbitron, monospace';
  ctx.fillText('▶  CLIQUER ou ESPACE POUR JOUER  ◀', W / 2, 162);
  ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  ctx.restore();

  // Cartes personnages — adaptatif
  const isSmallMenu = W < 700 || H < 420;
  const cW = isSmallMenu ? Math.floor((W - 40) / CHARS.length - 8) : 155;
  const cH = isSmallMenu ? Math.min(H - 120, 200) : 240;
  const gap = isSmallMenu ? 6 : 12;
  const tot = CHARS.length * (cW + gap) - gap;
  const sx  = W / 2 - tot / 2;
  const menuTitleH = isSmallMenu ? 70 : 110;
  const cy  = menuTitleH + (H - menuTitleH - cH) / 2;

  CHARS.forEach((c, i) => {
    const cx = sx + i * (cW + gap);
    const sel = i === selChar;
    const lk = c.locked;
    const sk = getCharSkin(i);

    ctx.save();

    // Fond carte avec glow si sélectionné
    if (sel) {
      ctx.shadowColor = sk.col; ctx.shadowBlur = 45;
    }
    const grad = ctx.createLinearGradient(cx, cy, cx, cy + cH);
    if (sel) {
      grad.addColorStop(0, sk.col + '22');
      grad.addColorStop(1, sk.col + '08');
    } else {
      grad.addColorStop(0, '#0d0d22');
      grad.addColorStop(1, '#070710');
    }
    ctx.fillStyle = grad;
    ctx.strokeStyle = sel ? sk.col : (lk ? '#222' : '#2a2a44');
    ctx.lineWidth = sel ? 3 : 1;
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(cx, cy, cW, cH, 16); ctx.fill(); ctx.stroke(); }
    else { ctx.fillRect(cx, cy, cW, cH); ctx.strokeRect(cx, cy, cW, cH); }
    ctx.restore();

    // Séparateur haut couleur
    if (!lk) {
      ctx.save();
      ctx.fillStyle = sel ? sk.col : sk.col + '66';
      ctx.shadowColor = sk.col; ctx.shadowBlur = sel ? 14 : 0;
      if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(cx, cy, cW, 4, [16, 16, 0, 0]); ctx.fill(); }
      else ctx.fillRect(cx, cy, cW, 4);
      ctx.restore();
    }

    if (lk) {
      // ── Personnage verrouillé ──
      ctx.save();
      // Icone cadenas pulsant
      const lockPulse = 0.85 + Math.sin(frame * 0.04 + i * 0.8) * 0.15;
      ctx.globalAlpha = lockPulse;
      ctx.fillStyle = '#333'; ctx.font = '44px serif'; ctx.textAlign = 'center';
      ctx.fillText('🔒', cx + cW / 2, cy + cH / 2 - 6);
      ctx.globalAlpha = 1;
      // Condition de déblocage
      ctx.fillStyle = '#555'; ctx.font = 'bold 9px Orbitron, monospace'; ctx.textAlign = 'center';
      ctx.fillText(c.desc.toUpperCase(), cx + cW / 2, cy + cH / 2 + 28);
      // Barre de progression vers déblocage
      const unlockThresh = i === 4 ? 500 : i === 5 ? 1000 : 0;
      if (unlockThresh > 0 && best > 0) {
        const progPct = Math.min(1, best / unlockThresh);
        const pbW = cW - 30, pbX = cx + 15, pbY = cy + cH * 0.78;
        ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(pbX, pbY, pbW, 5);
        const pbGrad = ctx.createLinearGradient(pbX, 0, pbX + pbW, 0);
        pbGrad.addColorStop(0, '#4488ff'); pbGrad.addColorStop(1, '#44ddff');
        ctx.fillStyle = pbGrad;
        ctx.fillRect(pbX, pbY, pbW * progPct, 5);
        ctx.fillStyle = 'rgba(180,220,255,.4)'; ctx.font = '7px Share Tech Mono, monospace';
        ctx.fillText(best + ' / ' + unlockThresh + 'm', cx + cW / 2, pbY - 3);
      }
      ctx.restore();
    } else {
      // ── Particules orbitales pour le perso sélectionné ──
      if (sel) {
        ctx.save();
        const nOrbit = 5;
        for (let p = 0; p < nOrbit; p++) {
          const pa = frame * 0.055 + (p / nOrbit) * Math.PI * 2;
          const pr = cW * 0.32 + Math.sin(frame * 0.08 + p * 1.1) * 4;
          const px = cx + cW / 2 + Math.cos(pa) * pr;
          const py = cy + cH * 0.35 + Math.sin(pa) * pr * 0.45;
          const pAlpha = 0.4 + 0.6 * ((p % 2 === 0) ? Math.sin(frame * 0.1 + p) * 0.5 + 0.5 : 1);
          ctx.globalAlpha = pAlpha;
          ctx.fillStyle = sk.col;
          ctx.shadowColor = sk.col; ctx.shadowBlur = 8;
          const psz = 2.5 + Math.sin(frame * 0.12 + p * 0.7) * 1;
          ctx.beginPath(); ctx.arc(px, py, psz, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
        ctx.restore();
      }

      // ── Personnage 3D (bottle) ──
      const animRot = sel
        ? Math.sin(frame * 0.07) * 0.18
        : Math.sin(frame * 0.04 + i * 1.2) * 0.06;
      const animY = sel ? Math.sin(frame * 0.09) * 5 : 0;
      const charScale = sel ? (isSmallMenu ? 1.0 : 1.3) : (isSmallMenu ? 0.85 : 1.1);
      drawBottle(cx + cW / 2, cy + cH * 0.34 + animY, c.size * charScale, animRot, sk.col, sk.acc, c.shapeType || 'round');

      // ── Halo forme géométrique (icone shape sous le perso) ──
      const shapeIcons = { round: '⬤', hex: '⬡', tri: '▲', rect: '▬', oval: '⬭' };
      const shapeDescs = {
        round: 'Culbute régulière',
        hex:   'Culbute nette · diagonal',
        tri:   'Triangle · torque brutal',
        rect:  'Roue carrée · couple fort',
        oval:  'Grip · roule en avant'
      };
      ctx.save();
      const shapeCol = sel ? sk.col : 'rgba(180,180,200,.4)';
      ctx.fillStyle = shapeCol; ctx.shadowColor = sel ? sk.col : 'transparent'; ctx.shadowBlur = sel ? 6 : 0;
      ctx.font = (isSmallMenu ? 9 : 11) + 'px Orbitron, monospace'; ctx.textAlign = 'center';
      ctx.fillText((shapeIcons[c.shapeType] || '?') + ' ' + (shapeDescs[c.shapeType] || ''), cx + cW / 2, cy + cH * 0.57);
      ctx.shadowBlur = 0;
      ctx.restore();

      // ── Nom du personnage ──
      ctx.save();
      ctx.fillStyle = sel ? sk.col : '#aaa';
      ctx.shadowColor = sel ? sk.col : 'transparent'; ctx.shadowBlur = sel ? 14 : 0;
      ctx.font = `${sel ? 'bold 13' : '11'}px Orbitron, monospace`;
      ctx.textAlign = 'center';
      const nameParts = c.name.split(' ');
      const nameY0 = cy + cH * 0.64;
      const nameStep = isSmallMenu ? 13 : 16;
      nameParts.forEach((ln, li) => ctx.fillText(ln, cx + cW / 2, nameY0 + li * nameStep));
      ctx.restore();

      // ── Stats bars — Masse · Aéro · Rebond · Friction μ · Inertie ──
      ctx.save();
      const hw_s = c.size * c.hitW, hh_s = c.size * c.hitH;
      const I_s  = c.mass * (4*hw_s*hw_s + 4*hh_s*hh_s) / 12;
      const labels5  = ['MASSE', 'AÉRO', 'REBOND', 'FRICTION μ', 'INERTIE'];
      const vals5    = [
        1 - (c.mass - 0.5) / 1.5,          // masse inversée (léger = barre haute)
        (c.aerodynamics - 0.985) / 0.015,   // aéro (0→1)
        c.bounciness / 0.6,                 // rebond (0→1)
        (c.mu || 0.5) / 0.85,               // friction μ (0→1)
        1 - Math.min(1, (I_s - 80) / 700),  // inertie inversée (faible I = agile)
      ];
      const cols5 = ['#ff4488', '#00f0ff', '#00ff88', '#ffe600', '#bb44ff'];
      const bw = cW - 22, bh = isSmallMenu ? 4 : 5;
      const statsY0 = cy + cH * 0.77;
      labels5.forEach((lb, li) => {
        const bx = cx + 11, by = statsY0 + li * (isSmallMenu ? 10 : 12);
        ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(bx, by, bw, bh);
        const fc = ctx.createLinearGradient(bx, by, bx + bw, by);
        fc.addColorStop(0, cols5[li]); fc.addColorStop(1, cols5[li] + '66');
        ctx.fillStyle = fc;
        const barFill = Math.min(Math.max(vals5[li], 0), 1);
        const animFill = sel ? barFill * (0.85 + 0.15 * Math.sin(frame * 0.06 + li * 0.8)) : barFill;
        ctx.fillRect(bx, by, bw * animFill, bh);
        ctx.fillStyle = sel ? 'rgba(200,200,255,.6)' : 'rgba(150,150,180,.35)';
        ctx.font = (isSmallMenu ? 6 : 7) + 'px Share Tech Mono, monospace'; ctx.textAlign = 'left';
        ctx.fillText(lb, bx, by - 1);
      });
      ctx.restore();

      // ── Badge "SKILL" style chip ──
      if (!isSmallMenu && sel) {
        ctx.save();
        const chipY = cy + cH - 30;
        const chipW = cW - 20, chipH = 14;
        ctx.fillStyle = 'rgba(255,68,136,.15)';
        if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(cx + 10, chipY, chipW, chipH, 7); ctx.fill(); }
        else ctx.fillRect(cx + 10, chipY, chipW, chipH);
        ctx.strokeStyle = '#ff4488'; ctx.lineWidth = 1;
        if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(cx + 10, chipY, chipW, chipH, 7); ctx.stroke(); }
        ctx.fillStyle = '#ff4488'; ctx.shadowColor = '#ff4488'; ctx.shadowBlur = 6;
        ctx.font = 'bold 8px Orbitron, monospace'; ctx.textAlign = 'center';
        ctx.fillText('✦ ' + (c.skill || 'PIQUÉ') + ' ✦', cx + cW / 2, chipY + 10);
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // ── Sélecteur skin ──
      if (sel) {
        const skinY = cy + cH - 13;
        const skin = SKINS[i][selSkin[i]];
        ctx.save();
        ctx.fillStyle = '#666'; ctx.font = '7px Share Tech Mono, monospace'; ctx.textAlign = 'center';
        ctx.fillText('SKIN', cx + cW / 2, skinY - 1);
        // Couleurs des skins disponibles
        SKINS[i].forEach((sk2, si) => {
          const dotX = cx + cW / 2 - (SKINS[i].length - 1) * 7 + si * 14;
          const dotR = si === selSkin[i] ? 4.5 : 3;
          ctx.fillStyle = sk2.col;
          ctx.shadowColor = si === selSkin[i] ? sk2.col : 'transparent';
          ctx.shadowBlur = si === selSkin[i] ? 8 : 0;
          ctx.beginPath(); ctx.arc(dotX, skinY + 8, dotR, 0, Math.PI * 2); ctx.fill();
        });
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.font = '9px serif'; ctx.textAlign = 'left';
        ctx.fillText('◀', cx + 6, skinY + 10);
        ctx.textAlign = 'right';
        ctx.fillText('▶', cx + cW - 6, skinY + 10);
        ctx.restore();
      }
    }
  });

  // Rebuild click zones avec nouvelles dimensions
  _menuClickZones = [];
  CHARS.forEach((c, i) => {
    const cx = sx + i * (cW + gap);
    const skinY = cy + cH - 14;
    _menuClickZones.push({ type: 'char', idx: i, x: cx, y: cy, w: cW, h: cH - 20 });
    _menuClickZones.push({ type: 'skinL', idx: i, x: cx,       y: skinY - 14, w: 26, h: 22 });
    _menuClickZones.push({ type: 'skinR', idx: i, x: cx + cW - 26, y: skinY - 14, w: 26, h: 22 });
  });

  ctx.textAlign = 'left';

  if (best > 0) {
    ctx.save(); ctx.fillStyle = '#ffe600'; ctx.shadowColor = '#ffe600'; ctx.shadowBlur = 14;
    ctx.font = 'bold 16px Share Tech Mono, monospace'; ctx.textAlign = 'center';
    ctx.fillText('🏆  RECORD : ' + best + ' m', W / 2, cy + cH + 40);
    ctx.restore();
  }

  // ── Boutons en bas du menu (uniquement si partie déjà jouée) ──
  if (hasPlayedOnce) {
    _drawMenuButtons(cy + cH + 64);
  }

  if (!showTrophiesPanel && !showArchivesPanel) _drawAchievementBar();
  if (showTrophiesPanel)  _drawTrophyPanel();
  if (showArchivesPanel)  _drawArchivesPanel();
  ctx.textAlign = 'left';
}

// Zones de clic des boutons menu
let _menuBtnZones = [];

function _drawMenuButtons(baseY) {
  _menuBtnZones = [];

  const buttons = [
    { label: showControlsOverlay ? '✕ TOUCHES'  : '⌨ TOUCHES',  col: '#00f0ff', action: 'toggleControls' },
    { label: showTrophiesPanel   ? '✕ TROPHÉES' : '🏆 TROPHÉES', col: '#ffe600', action: 'trophies'       },
    { label: showArchivesPanel   ? '✕ ARCHIVES' : '📁 ARCHIVES', col: '#ff8800', action: 'archives'       },
    { label: '⛶ PLEIN ÉCRAN',                                     col: '#ff4488', action: 'fullscreen'     },
  ];

  const n    = buttons.length;
  const btnH = 34;
  const gap  = 12;
  // Largeur dynamique : occupe 80% de la fenêtre, répartie également
  const totalAvail = Math.min(W * 0.80, 720);
  const btnW = Math.floor((totalAvail - gap * (n - 1)) / n);
  const totalW = btnW * n + gap * (n - 1);
  const startX = Math.round(W / 2 - totalW / 2);

  buttons.forEach((btn, i) => {
    const bx = startX + i * (btnW + gap);
    const by = baseY;
    _menuBtnZones.push({ x: bx, y: by, w: btnW, h: btnH, action: btn.action });

    // Fond actif si panneau ouvert
    const isActive = (btn.action === 'trophies' && showTrophiesPanel) ||
                     (btn.action === 'archives'  && showArchivesPanel) ||
                     (btn.action === 'toggleControls' && showControlsOverlay);

    ctx.save();
    ctx.fillStyle = isActive ? btn.col + '28' : 'rgba(0,0,20,0.82)';
    ctx.strokeStyle = isActive ? btn.col : btn.col + '66';
    ctx.lineWidth = isActive ? 2 : 1.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, by, btnW, btnH, 8);
    else ctx.rect(bx, by, btnW, btnH);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = btn.col;
    ctx.shadowColor = isActive ? btn.col : 'transparent';
    ctx.shadowBlur  = isActive ? 12 : 0;
    ctx.font = 'bold 9px Orbitron, monospace';
    ctx.textAlign = 'center';
    // Tronquer le label si trop long pour le bouton
    let label = btn.label;
    while (label.length > 4 && ctx.measureText(label).width > btnW - 16) {
      label = label.slice(0, -1);
    }
    ctx.fillText(btn.label, bx + btnW / 2, by + btnH * 0.65);
    ctx.restore();
  });
}

function _drawAchievementBar() {
  const allAch = ACHIEVEMENTS.getAll();
  const unlocked = allAch.filter(a => a.unlocked);
  if (!unlocked.length) return;

  const startY = H - 40;
  const iconSize = 22;
  const startX = W / 2 - (unlocked.length * (iconSize + 4)) / 2;

  ctx.save();
  ctx.font = `${iconSize}px serif`;
  ctx.textAlign = 'left';
  unlocked.forEach((a, i) => {
    const ix = startX + i * (iconSize + 4);
    ctx.fillText(a.icon, ix, startY);
  });

  ctx.fillStyle = 'rgba(0,240,255,.4)';
  ctx.font = '9px Share Tech Mono, monospace'; ctx.textAlign = 'center';
  ctx.fillText(unlocked.length + '/' + allAch.length + ' achievements', W / 2, startY + 14);
  ctx.restore();
}

/* ── Panneau Archives — records mensuels passés ── */
function _drawArchivesPanel() {
  const archives = LEADERBOARD._archives();
  const keys     = Object.keys(archives).sort().reverse(); // du plus récent au plus ancien

  const pW = Math.min(520, W * 0.72);
  const pX = W / 2 - pW / 2;
  const pY = H * 0.12;
  const pH = Math.min(H * 0.78, 520);
  const rowH = 20;
  const headerH = 36;

  ctx.save();
  // Fond
  ctx.fillStyle = 'rgba(3,0,18,.97)';
  ctx.strokeStyle = 'rgba(255,136,0,.5)'; ctx.lineWidth = 1.5;
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(pX, pY, pW, pH, 10); ctx.fill(); ctx.stroke(); }
  else { ctx.fillRect(pX, pY, pW, pH); ctx.strokeRect(pX, pY, pW, pH); }

  // Titre
  ctx.fillStyle = '#ff8800'; ctx.shadowColor = '#ff8800'; ctx.shadowBlur = 14;
  ctx.font = 'bold 13px Orbitron, monospace'; ctx.textAlign = 'center';
  ctx.fillText('📁 ARCHIVES MENSUELLES', W / 2, pY + 22);
  ctx.shadowBlur = 0;

  // Séparateur
  ctx.strokeStyle = 'rgba(255,136,0,.3)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pX + 10, pY + headerH); ctx.lineTo(pX + pW - 10, pY + headerH); ctx.stroke();

  if (keys.length === 0) {
    ctx.fillStyle = '#444'; ctx.font = '11px Share Tech Mono, monospace';
    ctx.fillText('Aucune archive disponible.', W / 2, pY + pH / 2);
    ctx.fillStyle = 'rgba(200,200,200,.35)'; ctx.font = '9px Share Tech Mono, monospace';
    ctx.fillText('Les records mensuels sont archivés au changement de mois.', W / 2, pY + pH / 2 + 18);
    ctx.restore(); return;
  }

  // Scroll
  const scroll = LEADERBOARD._archiveScroll || 0;
  const innerH = pH - headerH - 10;
  const contentY = pY + headerH + 4;

  // Clip zone
  ctx.save();
  ctx.beginPath(); ctx.rect(pX, contentY, pW, innerH); ctx.clip();

  let yCursor = contentY - scroll;

  keys.forEach((archKey) => {
    const arch    = archives[archKey];
    const monthLbl = arch.month || archKey.replace('Archive_','').replace('_','-');

    // En-tête mois
    if (yCursor > contentY - 30 && yCursor < contentY + innerH + 10) {
      ctx.fillStyle = 'rgba(255,136,0,.15)';
      ctx.fillRect(pX + 8, yCursor, pW - 16, 22);
      ctx.fillStyle = '#ff8800'; ctx.font = 'bold 10px Orbitron, monospace'; ctx.textAlign = 'left';
      ctx.fillText('📅 ' + monthLbl, pX + 14, yCursor + 15);
    }
    yCursor += 26;

    // Top 3 BEST du mois
    const top3Best  = (arch.best  || []).slice(0, 3);
    const top3Worst = (arch.worst || []).slice(0, 3);
    const top3Alt   = (arch.alt   || []).slice(0, 3);

    const sections = [
      { label: '🏆 BEST', entries: top3Best,  col: '#00f0ff', unit: 'm'     },
      { label: '💀 WORST', entries: top3Worst, col: '#ff4444', unit: 'm'     },
      { label: '↑ ALT',   entries: top3Alt,   col: '#00ff88', unit: 'm alt' },
    ];

    sections.forEach(sec => {
      if (sec.entries.length === 0) return;
      if (yCursor > contentY - 20 && yCursor < contentY + innerH) {
        ctx.fillStyle = sec.col + '55'; ctx.font = 'bold 8px Orbitron, monospace'; ctx.textAlign = 'left';
        ctx.fillText(sec.label, pX + 14, yCursor + 11);
      }
      yCursor += 16;
      sec.entries.forEach((e, idx) => {
        if (yCursor > contentY - rowH && yCursor < contentY + innerH) {
          if (idx % 2 === 0) { ctx.fillStyle = 'rgba(255,255,255,.025)'; ctx.fillRect(pX + 10, yCursor, pW - 20, rowH - 2); }
          const medals = ['🥇','🥈','🥉'];
          ctx.fillStyle = '#aaa'; ctx.font = '9px Share Tech Mono, monospace'; ctx.textAlign = 'left';
          ctx.fillText(medals[idx] + ' ' + e.name.slice(0,10), pX + 20, yCursor + 13);
          ctx.fillStyle = sec.col; ctx.textAlign = 'right';
          ctx.font = 'bold 9px Share Tech Mono, monospace';
          ctx.fillText(e.score + sec.unit, pX + pW - 16, yCursor + 13);
          if (e.char) {
            ctx.fillStyle = '#555'; ctx.font = '7px Share Tech Mono, monospace'; ctx.textAlign = 'right';
            ctx.fillText(e.char, pX + pW - 16, yCursor + 13 - 9);
          }
        }
        yCursor += rowH;
      });
    });

    // Séparateur entre mois
    if (yCursor > contentY - 4 && yCursor < contentY + innerH) {
      ctx.strokeStyle = 'rgba(255,136,0,.15)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(pX + 20, yCursor); ctx.lineTo(pX + pW - 20, yCursor); ctx.stroke();
    }
    yCursor += 10;
  });

  const totalContentH = yCursor - (contentY - scroll);
  ctx.restore(); // fin du clip

  // Scrollbar verticale
  if (totalContentH > innerH) {
    const sbW = 5, sbX = pX + pW - 10;
    const ratio   = innerH / totalContentH;
    const sbH     = Math.max(20, innerH * ratio);
    const sbY     = contentY + (scroll / totalContentH) * innerH;
    ctx.fillStyle = 'rgba(255,136,0,.18)'; ctx.fillRect(sbX, contentY, sbW, innerH);
    ctx.fillStyle = '#ff8800'; ctx.fillRect(sbX, sbY, sbW, sbH);
    // Mémorise pour le scroll
    drawLeaderboard._archMaxScroll = Math.max(0, totalContentH - innerH);
  }

  // ── Bouton fermer — EN DESSOUS du panneau ──
  const closeBtnW = 160, closeBtnH = 32;
  const closeBtnX = W / 2 - closeBtnW / 2;
  const closeBtnY = pY + pH + 10;
  ctx.fillStyle = 'rgba(255,136,0,.14)';
  ctx.strokeStyle = 'rgba(255,136,0,.6)'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(closeBtnX, closeBtnY, closeBtnW, closeBtnH, 8);
  else ctx.rect(closeBtnX, closeBtnY, closeBtnW, closeBtnH);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ff8800'; ctx.shadowColor = '#ff8800'; ctx.shadowBlur = 6;
  ctx.font = 'bold 10px Orbitron, monospace'; ctx.textAlign = 'center';
  ctx.fillText('✕  FERMER ARCHIVES', W / 2, closeBtnY + closeBtnH * 0.65);
  ctx.shadowBlur = 0;

  // Mémoriser zone de fermeture
  _drawArchivesPanel._closeZone = { x: closeBtnX, y: closeBtnY, w: closeBtnW, h: closeBtnH };
  _drawArchivesPanel._panelZone = { x: pX, y: pY, w: pW, h: pH };
  _drawArchivesPanel._innerH    = innerH;
  _drawArchivesPanel._contentY  = contentY;

  ctx.restore();
}

function statBar(x, y, w, h, v, col) {
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = col; ctx.fillRect(x, y, w * Math.min(Math.max(v, 0), 1), h);
}

/* ══════════════════════════════════════════════════════════
   TROPHY PANEL — grille des achievements avec statut
══════════════════════════════════════════════════════════ */
function _drawTrophyPanel() {
  const allAch = ACHIEVEMENTS.getAll();
  const unlockedCount = allAch.filter(a => a.unlocked).length;

  const panW = Math.min(W - 40, 900);
  const panH = Math.min(H - 40, 560);
  const panX = W / 2 - panW / 2;
  const panY = H / 2 - panH / 2;

  ctx.save();

  // ── Fond + bordure ──
  ctx.fillStyle = 'rgba(4,0,20,.97)';
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(panX, panY, panW, panH, 18); ctx.fill(); }
  else ctx.fillRect(panX, panY, panW, panH);
  // Barre colorée haut
  const hdrGrad = ctx.createLinearGradient(panX, 0, panX + panW, 0);
  hdrGrad.addColorStop(0, '#ffe600'); hdrGrad.addColorStop(0.5, '#ffaa00'); hdrGrad.addColorStop(1, '#ffe600');
  ctx.fillStyle = hdrGrad;
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(panX, panY, panW, 4, [18,18,0,0]); ctx.fill(); }
  else ctx.fillRect(panX, panY, panW, 4);
  ctx.strokeStyle = 'rgba(255,230,0,.35)'; ctx.lineWidth = 1.5;
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(panX, panY, panW, panH, 18); ctx.stroke(); }

  // ── Titre + compteur ──
  ctx.fillStyle = '#ffe600'; ctx.shadowColor = '#ffe600'; ctx.shadowBlur = 22;
  ctx.font = 'bold 22px Orbitron, monospace'; ctx.textAlign = 'center';
  ctx.fillText('🏆  TROPHÉES', W / 2, panY + 34);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,230,0,.55)'; ctx.font = '11px Share Tech Mono, monospace';
  ctx.fillText(unlockedCount + ' / ' + allAch.length + ' obtenus', W / 2, panY + 52);

  // Barre de progression globale
  const barW = panW * 0.55, barH = 7;
  const barX = W / 2 - barW / 2, barY = panY + 58;
  ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(barX, barY, barW, barH);
  const progGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  progGrad.addColorStop(0, '#ffe600'); progGrad.addColorStop(1, '#ff8800');
  ctx.fillStyle = progGrad;
  ctx.fillRect(barX, barY, barW * (unlockedCount / Math.max(1, allAch.length)), barH);

  // ── Grille des trophées ──
  const COLS      = W < 700 ? 2 : 3;
  const CELL_W    = (panW - 40) / COLS;
  const CELL_H    = 88;
  const GRID_X    = panX + 20;
  const GRID_TOP  = panY + 78;
  const maxVisible = Math.floor((panH - 80) / CELL_H);
  const maxScroll  = Math.max(0, allAch.length - maxVisible * COLS);
  trophiesPanelScroll = Math.max(0, Math.min(maxScroll, trophiesPanelScroll));

  // Clip zone grille
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(panX + 4, GRID_TOP, panW - 8, panH - 82, 14);
  else ctx.rect(panX + 4, GRID_TOP, panW - 8, panH - 82);
  ctx.clip();

  const startItem = trophiesPanelScroll * COLS;
  const endItem   = Math.min(allAch.length, startItem + maxVisible * COLS);

  for (let k = startItem; k < endItem; k++) {
    const ach = allAch[k];
    const col = (k - startItem) % COLS;
    const row = Math.floor((k - startItem) / COLS);
    const cx  = GRID_X + col * CELL_W;
    const cy  = GRID_TOP + row * CELL_H;

    const locked = !ach.unlocked;
    const cellAlpha = locked ? 0.45 : 1.0;
    ctx.globalAlpha = cellAlpha;

    // Fond cellule
    const cellGrad = ctx.createLinearGradient(cx, cy, cx, cy + CELL_H - 4);
    if (!locked) {
      cellGrad.addColorStop(0, 'rgba(255,200,0,.12)');
      cellGrad.addColorStop(1, 'rgba(255,150,0,.04)');
    } else {
      cellGrad.addColorStop(0, 'rgba(255,255,255,.03)');
      cellGrad.addColorStop(1, 'rgba(0,0,0,0)');
    }
    ctx.fillStyle = cellGrad;
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(cx + 3, cy + 3, CELL_W - 6, CELL_H - 6, 10); ctx.fill(); }
    else ctx.fillRect(cx + 3, cy + 3, CELL_W - 6, CELL_H - 6);

    // Bordure cellule
    ctx.strokeStyle = locked ? 'rgba(80,80,80,.3)' : 'rgba(255,200,0,.45)';
    ctx.lineWidth = 1.2;
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(cx + 3, cy + 3, CELL_W - 6, CELL_H - 6, 10); ctx.stroke(); }

    // Badge icône
    const iconSize = 32;
    const iconX = cx + 14, iconY = cy + 12;
    ctx.fillStyle = locked ? 'rgba(80,80,80,.5)' : 'rgba(255,200,0,.18)';
    ctx.beginPath(); ctx.arc(iconX + iconSize * 0.5, iconY + iconSize * 0.4, iconSize * 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.font = locked ? '18px serif' : '22px serif'; ctx.textAlign = 'center';
    ctx.fillText(locked ? '🔒' : ach.icon, iconX + iconSize * 0.5, iconY + iconSize * 0.62);

    // Nom achievement
    ctx.fillStyle = locked ? '#555' : '#ffe600';
    if (!locked) { ctx.shadowColor = '#ffe600'; ctx.shadowBlur = 6; }
    ctx.font = 'bold 10px Orbitron, monospace'; ctx.textAlign = 'left';
    const nameX = cx + 56, nameMaxW = CELL_W - 66;
    let name = ach.name;
    // Truncate if too long
    ctx.font = 'bold 10px Orbitron, monospace';
    while (name.length > 3 && ctx.measureText(name).width > nameMaxW) name = name.slice(0,-1) + '…';
    ctx.fillText(name, nameX, cy + 22);
    ctx.shadowBlur = 0;

    // Description (obtained) or hint (locked)
    ctx.fillStyle = locked ? '#333' : 'rgba(255,255,255,.6)';
    ctx.font = '8px Share Tech Mono, monospace';
    const desc = locked ? (ach.hint || '???') : ach.desc;
    // Wrap text manually
    const words = desc.split(' ');
    let line = '', lineY = cy + 36;
    for (let w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > nameMaxW + 6 && line) {
        ctx.fillText(line, nameX, lineY);
        line = w; lineY += 11;
        if (lineY > cy + CELL_H - 10) break;
      } else { line = test; }
    }
    if (line) ctx.fillText(line, nameX, lineY);

    // Checkmark si obtenu
    if (!locked) {
      ctx.fillStyle = '#00ff88'; ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 8;
      ctx.font = '14px serif'; ctx.textAlign = 'right';
      ctx.fillText('✓', cx + CELL_W - 10, cy + 22);
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;
  }
  ctx.restore(); // fin du clip

  // ── Indicateurs scroll ──
  if (maxScroll > 0) {
    const arrX = panX + panW - 18;
    const arrTop = GRID_TOP + 10;
    const arrBot = panY + panH - 16;
    ctx.fillStyle = trophiesPanelScroll > 0 ? 'rgba(255,200,0,.8)' : 'rgba(255,255,255,.2)';
    ctx.font = '14px serif'; ctx.textAlign = 'center';
    ctx.fillText('▲', arrX, arrTop);
    ctx.fillStyle = trophiesPanelScroll < maxScroll ? 'rgba(255,200,0,.8)' : 'rgba(255,255,255,.2)';
    ctx.fillText('▼', arrX, arrBot);
    ctx.fillStyle = 'rgba(255,200,0,.35)'; ctx.font = '8px Share Tech Mono, monospace';
    ctx.fillText((trophiesPanelScroll+1) + '/' + (maxScroll+1), arrX, panY + panH - 28);
  }

  // ── Bouton fermer — positionné EN DESSOUS du panneau ──
  const closeBtnW = 160, closeBtnH = 32;
  const closeBtnX = W / 2 - closeBtnW / 2;
  const closeBtnY = panY + panH + 10;
  ctx.fillStyle = 'rgba(255,230,0,.14)';
  ctx.strokeStyle = 'rgba(255,230,0,.6)'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(closeBtnX, closeBtnY, closeBtnW, closeBtnH, 8);
  else ctx.rect(closeBtnX, closeBtnY, closeBtnW, closeBtnH);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffe600'; ctx.shadowColor = '#ffe600'; ctx.shadowBlur = 6;
  ctx.font = 'bold 10px Orbitron, monospace'; ctx.textAlign = 'center';
  ctx.fillText('✕  FERMER TROPHÉES', W / 2, closeBtnY + closeBtnH * 0.65);
  ctx.shadowBlur = 0;
  _drawTrophyPanel._closeZone = { x: closeBtnX, y: closeBtnY, w: closeBtnW, h: closeBtnH };

  ctx.restore(); ctx.textAlign = 'left';
}

/* ══════════════════════════════════════════════════════════
   GAME OVER — refonte complète, polices Orbitron
══════════════════════════════════════════════════════════ */
function drawDead() {
  const fade = Math.min(1, (140 - deathTimer) / 35);
  ctx.save(); ctx.globalAlpha = fade * 0.85;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.restore();
  if (fade < 0.3) return;
  const a = Math.min(1, (fade - 0.3) / 0.7);
  ctx.save(); ctx.globalAlpha = a;

  const panW = Math.min(680, W - 20);
  const panH = Math.min(500, H - 20);
  const panX = W / 2 - panW / 2, panY = H / 2 - panH / 2;

  // Fond panneau
  const panGrad = ctx.createLinearGradient(panX, panY, panX, panY + panH);
  panGrad.addColorStop(0, 'rgba(12,0,35,.97)');
  panGrad.addColorStop(1, 'rgba(5,0,18,.97)');
  ctx.fillStyle = panGrad;
  ctx.strokeStyle = 'rgba(255,68,136,.6)'; ctx.lineWidth = 2;
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(panX, panY, panW, panH, 20); ctx.fill(); ctx.stroke(); }
  else { ctx.fillRect(panX, panY, panW, panH); ctx.strokeRect(panX, panY, panW, panH); }

  // Barre de couleur en haut
  const topGrad = ctx.createLinearGradient(panX, 0, panX + panW, 0);
  topGrad.addColorStop(0, '#ff4488'); topGrad.addColorStop(0.5, '#ff88cc'); topGrad.addColorStop(1, '#ff4488');
  ctx.fillStyle = topGrad;
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(panX, panY, panW, 5, [20, 20, 0, 0]); ctx.fill(); }
  else ctx.fillRect(panX, panY, panW, 5);

  // GAME OVER
  ctx.shadowColor = '#ff4488'; ctx.shadowBlur = 60;
  ctx.fillStyle = '#ff4488';
  const goFS = Math.min(54, panW * 0.08);
  ctx.font = `bold ${goFS}px Orbitron, monospace`; ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', W / 2, panY + Math.min(82, panH * 0.17));
  ctx.shadowBlur = 0;

  // Distance
  ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 40;
  ctx.fillStyle = '#00f0ff';
  const distFS = Math.min(52, panW * 0.077);
  ctx.font = `bold ${distFS}px Orbitron, monospace`;
  ctx.fillText(maxDist + ' M', W / 2, panY + Math.min(158, panH * 0.31));
  ctx.shadowBlur = 0;

  if (currentDist < 0) {
    ctx.fillStyle = '#ff4444';
    ctx.font = `bold 13px Orbitron, monospace`;
    ctx.fillText('MIN : ' + currentDist + ' M', W / 2, panY + 186);
  }

  // Stats — police et alignement uniformisés
  const statFont = `bold 13px Share Tech Mono, monospace`;
  const statLblFont = `9px Orbitron, monospace`;
  const stat1X = W / 2 - 105, stat2X = W / 2 + 105;
  const statY  = panY + 218, statLblY = panY + 205;

  ctx.fillStyle = 'rgba(0,240,255,.4)'; ctx.font = statLblFont;
  ctx.fillText('REBONDS', stat1X, statLblY);
  ctx.fillStyle = '#aaa'; ctx.font = statFont;
  ctx.fillText(bounceCount, stat1X, statY);

  ctx.fillStyle = 'rgba(150,150,150,.4)'; ctx.font = statLblFont;
  ctx.fillText('RECORD', stat2X, statLblY);
  ctx.fillStyle = '#aaa'; ctx.font = statFont;
  ctx.fillText(best + ' m', stat2X, statY);

  // Nouveau record
  if (maxDist > 0 && maxDist >= best) {
    ctx.fillStyle = '#ffe600'; ctx.shadowColor = '#ffe600'; ctx.shadowBlur = 28;
    ctx.font = 'bold 22px Orbitron, monospace';
    const pulse = 1 + Math.sin(frame * 0.12) * 0.06;
    ctx.save(); ctx.translate(W / 2, panY + 264); ctx.scale(pulse, pulse);
    ctx.fillText('★  NOUVEAU RECORD  ★', 0, 0);
    ctx.restore(); ctx.shadowBlur = 0;
  }

  // Séparateur
  const sepY = panY + 295;
  const sepGrad = ctx.createLinearGradient(panX + 40, 0, panX + panW - 40, 0);
  sepGrad.addColorStop(0, 'transparent'); sepGrad.addColorStop(0.5, 'rgba(0,240,255,.3)'); sepGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = sepGrad; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(panX + 40, sepY); ctx.lineTo(panX + panW - 40, sepY); ctx.stroke();

  if (lbSavedThisRun) {
    ctx.fillStyle = '#00ff88'; ctx.font = 'bold 14px Orbitron, monospace';
    ctx.fillText('✔  SCORE ENREGISTRÉ', W / 2, panY + 332);
    ctx.fillStyle = '#888'; ctx.font = '14px Share Tech Mono, monospace';
    ctx.fillText('ESPACE pour rejouer  ·  ← → / Q D : changer de perso', W / 2, panY + 364);
  } else if (maxDist > 0 && !lbNamePending) {
    ctx.fillStyle = '#ffe600'; ctx.font = 'bold 15px Orbitron, monospace';
    ctx.fillText('ENTRER TON NOM ➤  (formulaire en haut à gauche)', W / 2, panY + 332);
    ctx.fillStyle = '#777'; ctx.font = '13px Share Tech Mono, monospace';
    ctx.fillText('ESPACE : rejouer sans sauvegarder', W / 2, panY + 362);
  } else if (lbNamePending) {
    ctx.fillStyle = '#ffe600'; ctx.font = 'bold 15px Orbitron, monospace';
    ctx.fillText('ENTRER TON NOM ➤  (formulaire en haut à gauche)', W / 2, panY + 332);
    ctx.fillStyle = '#777'; ctx.font = '13px Share Tech Mono, monospace';
    ctx.fillText('ESPACE : rejouer sans sauvegarder', W / 2, panY + 362);
  } else {
    ctx.fillStyle = '#999'; ctx.font = '14px Share Tech Mono, monospace';
    ctx.fillText('ESPACE pour rejouer  ·  ← → / Q D : changer de perso', W / 2, panY + 342);
  }

  // Instruction bouton réessayer
  if (deathTimer <= 0) {
    ctx.fillStyle = 'rgba(0,240,255,.4)'; ctx.font = '11px Share Tech Mono, monospace';
    ctx.fillText('ou clique ↓ RÉESSAYER', W / 2, panY + panH - 16);
  }

  ctx.restore(); ctx.textAlign = 'left';
}

function drawInstructions() {
  if (state !== 'ready' && state !== 'menu') return;

  // Si le joueur a déjà joué : on dessine uniquement le bouton toggle dans le menu
  // L'affichage réel des contrôles est géré par showControlsOverlay
  if (hasPlayedOnce && !showControlsOverlay) return;

  const lines = [
    '① ESPACE / CLIC → démarrer le swing',
    '② ESPACE / CLIC au bon moment → lancer !',
    '③ ESPACE / CLIC en vol → PIQUÉ ▼ (cooldown 5s)',
    '   Navigation : ← → ou Q D ou CLIC sur personnage',
  ];
  ctx.save();
  const bx = W / 2 - 380, by = H - 168, bw = 760, bh = 152;
  ctx.fillStyle = 'rgba(0,0,15,.85)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 12);
  else ctx.rect(bx, by, bw, bh);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,240,255,.4)'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 12);
  else ctx.rect(bx, by, bw, bh);
  ctx.stroke();
  ctx.fillStyle = '#ccc'; ctx.font = '14px Share Tech Mono, monospace'; ctx.textAlign = 'center';
  lines.forEach((l, i) => ctx.fillText(l, W / 2, by + 32 + i * 30));
  ctx.restore(); ctx.textAlign = 'left';
}

/* ══════════════════════════════════════════════════════════
   EFFET CRT — scanlines + vignette
══════════════════════════════════════════════════════════ */
function drawCRT() {
  // Scanlines légères uniquement (pas de vignette)
  ctx.save();
  ctx.globalAlpha = 0.03;
  ctx.fillStyle = '#000';
  for (let y = 0; y < H; y += 5) ctx.fillRect(0, y, W, 1);
  ctx.globalAlpha = 1;
  ctx.restore();
}

/* ══════════════════════════════════════════════════════════
   MAIN LOOP
══════════════════════════════════════════════════════════ */
// Delta-time: normalize physics to 60 fps regardless of display refresh rate
let _lastTs = 0;
const _TARGET_DT = 1000 / 60; // 16.67ms

function loop(ts) {
  if (!gameRunning) return;
  rafId = requestAnimationFrame(loop);

  // Cap dt to 2 frames to avoid spiral of death on tab focus
  const rawDt = _lastTs ? Math.min(ts - _lastTs, _TARGET_DT * 2.5) : _TARGET_DT;
  _lastTs = ts;
  // Number of physics steps this frame (0 or 1 at 60hz, sometimes 2 at very slow frames)
  const dtScale = rawDt / _TARGET_DT; // ~1.0 at 60hz, ~0.5 at 120hz, ~2.0 at 30hz

  if (state === 'flying' || state === 'dead' || state === 'swinging') frame += dtScale;
  _dtScale = dtScale;

  // Swing
  if (state === 'swinging') {
    if (catapulteReturning) {
      // Retour de force : la catapulte revient en arrière
      catapulteReturnSpeed += 0.0018;
      armActualSpeed = -catapulteReturnSpeed; // négatif = bras qui recule
      armAngle -= catapulteReturnSpeed;
      if (armAngle <= ARM_REST) {
        armAngle = ARM_REST;
        armSpeed = 0;
        catapulteReturning = false;
        catapulteReturnSpeed = 0;
        _playSound('return_force');
      }
    } else {
      armSpeed += SWING_ACCEL;
      armActualSpeed = armSpeed;
      armAngle += armSpeed;
      if (armAngle >= ARM_MAX) {
        // Au lieu de téléporter : retour de force
        armAngle = ARM_MAX;
        armSpeed = 0;
        catapulteReturning = true;
        catapulteReturnSpeed = 0.003;
        _playSound('return_force');
      }
    }
  }

  if (state === 'flying') { physics(); tickP(); }

  if (state === 'dead') {
    deathTimer--;
    tickP();
    camX += (ch.x - W * 0.3 - camX) * 0.08;
    if (!bestUpdated && maxDist > best) {
      best = maxDist; bestUpdated = true;
      ACHIEVEMENTS.unlock('record_broken');
    }
    if (!bestUpdated && maxDist > 0) {
      try {
        const td = parseInt(localStorage.getItem('jfm_total_dist') || '0') + maxDist;
        localStorage.setItem('jfm_total_dist', td);
        if (td >= 10000) ACHIEVEMENTS.unlock('total_10km');
      } catch(e) {}
    }

    if (!lbNamePending && !lbSavedThisRun && deathTimer <= 100) {
      lbNamePending = true;
      _showLbNameInput();
    }
  }

  // Dessin
  ctx.clearRect(0, 0, W, H);
  drawBg();

  // CORRECTION CAMÉRA : ctx.translate(0, camY) — le monde se décale VERS LE BAS
  // quand le joueur monte, donc la caméra suit bien vers le HAUT
  ctx.save();
  ctx.translate(0, camY);
  drawTrails();
  drawGround();
  drawTerrain();
  drawLauncher();
  drawCharacter();
  drawParticles();
  ctx.restore();

  // UI fixe
  if (state === 'menu') { drawMenu(); drawInstructions(); }
  else {
    drawHUD();
    drawAngleIndicator();
    if (state === 'ready') drawInstructions();
  }
  if (state === 'dead') drawDead();

  // Leaderboard — toujours affiché hors menu
  if (state !== 'menu') drawLeaderboard();

  // Minimap
  if (camY > 60 && (state === 'flying' || state === 'dead')) drawMinimap();

  // Effet CRT (toujours en dernier)
  drawCRT();
}

/* ══════════════════════════════════════════════════════════
   LEADERBOARD — saisie du nom DOM
══════════════════════════════════════════════════════════ */
function _showLbNameInput() {
  const wrap = document.getElementById('jfm-lb-name-wrap');
  if (!wrap) return;
  wrap.style.display = 'flex';
  // Positionner sous le leaderboard
  const lbBottom = (drawLeaderboard._lastBottom || 280) + 6;
  wrap.style.top = lbBottom + 'px';
  const input = document.getElementById('jfm-lb-name-input');
  const saveBtn = document.getElementById('jfm-lb-name-save');
  if (input) { input.value = ''; input.blur(); setTimeout(() => { if (document.activeElement === input) input.blur(); }, 50); }

  const doSave = () => {
    const name = (input?.value || '').trim();
    if (!name) return;
    // Save best distance (positive) AND worst (negative) AND altitude
    const scoreToSave = maxDist > 0 ? maxDist : (minDist < 0 ? minDist : 0);
    LEADERBOARD.add(name, scoreToSave, CHARS[selChar].name, maxAlt);
    // Also save negative score separately if player went negative
    if (minDist < 0 && maxDist > 0) {
      LEADERBOARD.add(name, minDist, CHARS[selChar].name, 0);
    }
    lbSavedThisRun = true;
    lbNamePending = false;
    wrap.style.display = 'none';
  };

  saveBtn?.removeEventListener('click', saveBtn._lbHandler);
  saveBtn._lbHandler = doSave;
  saveBtn?.addEventListener('click', doSave);

  if (input) {
    input.removeEventListener('keydown', input._lbKeyHandler);
    input._lbKeyHandler = (e) => { if (e.key === 'Enter') doSave(); e.stopPropagation(); };
    input.addEventListener('keydown', input._lbKeyHandler);
  }
}

/* ══════════════════════════════════════════════════════════
   INPUT — Clavier, souris, mobile
══════════════════════════════════════════════════════════ */
function onAction() {
  if (state === 'menu') {
    state = 'ready';
    // Retry btn affiché uniquement en vol
  } else if (state === 'ready') {
    state = 'swinging'; armAngle = ARM_REST; armSpeed = 0;
  } else if (state === 'swinging') {
    // Check timing for achievement
    const range = ARM_MAX - ARM_REST;
    const pct = Math.max(0, Math.min(1, (armAngle - ARM_REST) / range));
    if (pct >= 0.45 && pct <= 0.55) ACHIEVEMENTS.unlock('perfect_timing');
    doLaunch();
  } else if (state === 'flying') {
    if (canDive && diveCooldownTimer <= 0) {
      const c = CHARS[selChar];
      const dt = c.diveType || 'vertical';
      isDiving = true;
      diveFrames = DIVE_DUR;
      canDive = false;
      diveCooldownTimer = DIVE_COOLDOWN;
      diveUsedCount++;

      if (dt === 'diagonal') {
        // Piqué diagonal : boost horizontal × 1.6 + accélération verticale standard
        ch.vx *= 1.6;
        ch.vy += DIVE_ACCEL * 4;
      } else if (dt === 'heavy') {
        // Piqué lourd : masse doublée temporairement via gravité augmentée
        ch.vy += DIVE_ACCEL * 8;   // impact immédiat
        ch.vx *= 0.5;              // freine l'horizontal pour aller droit en bas
      } else if (dt === 'zerograv') {
        // Suspension gravitaire : annule la vitesse verticale et freeze brièvement
        ch.vy = 0;
        diveFrames = DIVE_DUR * 1.8; // suspension plus longue
      }
      // 'vertical' : comportement standard géré dans physics()

      ACHIEVEMENTS.unlock('dive_first');
      if (diveUsedCount >= 3)  ACHIEVEMENTS.unlock('dive_3run');
      if (diveUsedCount >= 10) ACHIEVEMENTS.unlock('dive_use');
      _playSound('dive_start');
    }
  } else if (state === 'dead' && deathTimer <= 0) {
    const lbWrap = document.getElementById('jfm-lb-name-wrap');
    if (lbWrap) lbWrap.style.display = 'none';
    reset();
  }
}

function _navLeft() {
  if (state === 'menu' || (state === 'dead' && deathTimer <= 0)) {
    let n = (selChar - 1 + CHARS.length) % CHARS.length;
    while (CHARS[n].locked && n !== selChar) n = (n - 1 + CHARS.length) % CHARS.length;
    selChar = n;
    if (state === 'dead') reset();
  }
}
function _navRight() {
  if (state === 'menu' || (state === 'dead' && deathTimer <= 0)) {
    let n = (selChar + 1) % CHARS.length;
    while (CHARS[n].locked && n !== selChar) n = (n + 1) % CHARS.length;
    selChar = n;
    if (state === 'dead') reset();
  }
}
function _cycleSkin(dir) {
  if (CHARS[selChar].locked) return;
  const skins = SKINS[selChar];
  selSkin[selChar] = (selSkin[selChar] + dir + skins.length) % skins.length;
  saveSkinsToStorage();
  ACHIEVEMENTS.unlock('skin_change');
}

function onKeyDown(e) {
  if (!gameRunning) return;
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

  const key = e.key;
  const keyLow = key.toLowerCase();

  // Entrée = Réessayer — UNIQUEMENT pendant le vol (pas menu, pas game over)
  if (key === 'Enter' && state === 'flying') {
    e.preventDefault();
    const lbWrap = document.getElementById('jfm-lb-name-wrap');
    if (lbWrap) lbWrap.style.display = 'none';
    reset();
    return;
  }

  // Action : Espace
  if (key === ' ' || e.code === 'Space') { e.preventDefault(); onAction(); return; }

  // Navigation gauche : ArrowLeft, Q (AZERTY), A (QWERTY)
  if (key === 'ArrowLeft' || keyLow === 'q' || keyLow === 'a') {
    e.preventDefault(); _navLeft(); return;
  }
  // Navigation droite : ArrowRight, D
  if (key === 'ArrowRight' || keyLow === 'd') {
    e.preventDefault(); _navRight(); return;
  }

  // Cycle skin : Z / W (haut = skin suivant) ou S (bas = skin précédent)
  if (state === 'menu') {
    if (keyLow === 'z' || keyLow === 'w') { e.preventDefault(); _cycleSkin(1); return; }
    if (keyLow === 's') { e.preventDefault(); _cycleSkin(-1); return; }
  }

  // Leaderboard tab switch
  if (key === 'Tab' && (state === 'flying' || state === 'dead')) {
    e.preventDefault();
    const tabs = ['best', 'worst'];
    const idx = tabs.indexOf(LEADERBOARD._active);
    LEADERBOARD._active = tabs[(idx + 1) % tabs.length];
  }

  // Trophy panel scroll
  if (showTrophiesPanel && state === 'menu') {
    if (key === 'ArrowDown' || key === 'PageDown') { e.preventDefault(); trophiesPanelScroll++; return; }
    if (key === 'ArrowUp'   || key === 'PageUp')   { e.preventDefault(); trophiesPanelScroll = Math.max(0, trophiesPanelScroll-1); return; }
  }
}

// Références mémorisées pour les zones de clic du menu
let _menuClickZones = [];

function _buildMenuClickZones() {
  _menuClickZones = [];
  const cW = 155, cH = 195, gap = 12;
  const tot = CHARS.length * (cW + gap) - gap;
  const sx  = W / 2 - tot / 2, cy = H / 2 - cH / 2 - 20;
  CHARS.forEach((c, i) => {
    const cx = sx + i * (cW + gap);
    const skinY = cy + 165;
    _menuClickZones.push({
      type: 'char', idx: i,
      x: cx, y: cy, w: cW, h: cH - 16
    });
    // Flèches skin (uniquement perso sélectionné et débloqué)
    _menuClickZones.push({ type: 'skinL', idx: i, x: cx,         y: skinY - 14, w: 22, h: 22 });
    _menuClickZones.push({ type: 'skinR', idx: i, x: cx + cW - 22, y: skinY - 14, w: 22, h: 22 });
  });
}

function onCanvasClick(e) {
  if (!gameRunning) return;
  const rect = canvas.getBoundingClientRect();
  const cx = (e.clientX - rect.left) * (W / rect.width);
  const cy = (e.clientY - rect.top)  * (H / rect.height);

  // Clic leaderboard tabs — haut à gauche
  if (state !== 'menu') {
    const isSmall = W < 600 || H < 400;
    const lbClickW = isSmall ? Math.min(200, W * 0.38) : 270;
    const tabH = isSmall ? 20 : 24;
    const periH = isSmall ? 17 : 20;
    const lbX = 10, lbY = 10;
    const tw = lbClickW / 3;
    const tabs = ['best', 'worst', 'alt'];
    // ── Clic onglets catégorie ──
    if (cy >= lbY && cy <= lbY + tabH && cx >= lbX && cx <= lbX + lbClickW) {
      const tabIdx = Math.floor((cx - lbX) / tw);
      if (tabs[tabIdx]) { LEADERBOARD._active = tabs[tabIdx]; LEADERBOARD._scroll[tabs[tabIdx]] = 0; }
      return;
    }
    // ── Clic sous-onglets période ──
    const periY = lbY + tabH;
    if (cy >= periY && cy <= periY + periH && cx >= lbX && cx <= lbX + lbClickW) {
      const pIdx = Math.floor((cx - lbX) / tw);
      const pKeys = ['Daily','Weekly','Monthly'];
      if (pKeys[pIdx]) { LEADERBOARD._period = pKeys[pIdx]; LEADERBOARD._scroll[LEADERBOARD._active] = 0; }
      return;
    }
    // Scroll via clic sur les flèches ▲▼
    const maxRows  = Math.floor((H * 0.55) / (isSmall ? 19 : 22));
    const visibleCount = Math.max(4, Math.min(maxRows, 12));
    const listH  = isSmall ? 19 : 22;
    const titleH = isSmall ? 16 : 18;
    const totalH = tabH + periH + titleH + listH * visibleCount + 16;
    if (cx >= lbX + lbClickW - 18 && cx <= lbX + lbClickW) {
      if (cy >= lbY + tabH + periH && cy <= lbY + tabH + periH + titleH + 12) { _lbHandleWheel(-1); return; }
      if (cy >= lbY + totalH - 14 && cy <= lbY + totalH) { _lbHandleWheel(1); return; }
    }
  }

  // ── Clic panneau Archives ──
  if (showArchivesPanel && state === 'menu') {
    // Bouton fermer (sous le panneau)
    const cz = _drawArchivesPanel._closeZone;
    if (cz && cx >= cz.x && cx <= cz.x + cz.w && cy >= cz.y && cy <= cz.y + cz.h) {
      showArchivesPanel = false; return;
    }
    // Absorber uniquement les clics À L'INTÉRIEUR du panneau
    const pz = _drawArchivesPanel._panelZone;
    if (pz && cx >= pz.x && cx <= pz.x + pz.w && cy >= pz.y && cy <= pz.y + pz.h) {
      return; // clic dans le panneau = absorbé
    }
    // Clic hors du panneau → on laisse passer (permet de cliquer sur les boutons menu)
  }

  // ── Clic panneau Trophées (bouton fermer externe + absorption) ──
  if (showTrophiesPanel && state === 'menu') {
    const cz = _drawTrophyPanel._closeZone;
    if (cz && cx >= cz.x && cx <= cz.x + cz.w && cy >= cz.y && cy <= cz.y + cz.h) {
      showTrophiesPanel = false; return;
    }
    // Absorber uniquement les clics à l'intérieur du panneau
    const panW = Math.min(W - 40, 900);
    const panH = Math.min(H - 40, 560);
    const panX = W / 2 - panW / 2;
    const panY = H / 2 - panH / 2;
    if (cx >= panX && cx <= panX + panW && cy >= panY && cy <= panY + panH) return;
    // Clic hors du panneau → on laisse passer
  }

  // Clic en vol → piqué (dive)
  if (state === 'flying') {
    onAction();
    return;
  }
  // Clic état ready → action
  if (state === 'ready' || state === 'swinging') {
    onAction();
    return;
  }
  // Clic personnage / skin en menu
  if (state === 'menu' || (state === 'dead' && deathTimer <= 0)) {
    // Boutons menu (contrôles / plein écran)
    if (state === 'menu' && _menuBtnZones.length) {
      for (const z of _menuBtnZones) {
        if (cx >= z.x && cx <= z.x + z.w && cy >= z.y && cy <= z.y + z.h) {
          if (z.action === 'toggleControls') {
            showControlsOverlay = !showControlsOverlay;
          } else if (z.action === 'trophies') {
            showTrophiesPanel = !showTrophiesPanel;
            if (showTrophiesPanel) showArchivesPanel = false;
            trophiesPanelScroll = 0;
          } else if (z.action === 'archives') {
            showArchivesPanel = !showArchivesPanel;
            if (showArchivesPanel) showTrophiesPanel = false;
            LEADERBOARD._archiveScroll = 0;
          } else if (z.action === 'fullscreen') {
            _toggleFullscreen();
          }
          return;
        }
      }
    }
    if (!_menuClickZones.length) _buildMenuClickZones();
    for (const z of _menuClickZones) {
      if (cx >= z.x && cx <= z.x + z.w && cy >= z.y && cy <= z.y + z.h) {
        if (z.type === 'char' && !CHARS[z.idx].locked) {
          selChar = z.idx;
          if (state === 'dead') reset();
        } else if (z.type === 'skinL' && z.idx === selChar) {
          _cycleSkin(-1);
        } else if (z.type === 'skinR' && z.idx === selChar) {
          _cycleSkin(1);
        }
        return;
      }
    }
    // Clic en dehors des cartes → action
    onAction();
  }
}

function _toggleFullscreen() {
  const overlay = document.getElementById('jfm-game-overlay');
  if (!overlay) return;
  if (!document.fullscreenElement) {
    (overlay.requestFullscreen || overlay.webkitRequestFullscreen || overlay.mozRequestFullScreen)?.call(overlay);
  } else {
    (document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen)?.call(document);
  }
}

let _keyDownRef;
function attachInputs() {
  _keyDownRef = onKeyDown;
  document.addEventListener('keydown', _keyDownRef);
  canvas?.addEventListener('click', onCanvasClick);
  canvas?.addEventListener('wheel', _onLbWheel, { passive: true });
  _attachMobileControls();
}

function _onLbWheel(e) {
  if (!gameRunning) return;
  const rect = canvas.getBoundingClientRect();
  const cx = (e.clientX - rect.left) * (W / rect.width);
  const cy = (e.clientY - rect.top) * (H / rect.height);

  // Trophy panel scroll
  if (showTrophiesPanel && state === 'menu') {
    const panW = Math.min(W - 40, 900);
    const panH = Math.min(H - 40, 560);
    const panX = W / 2 - panW / 2, panY = H / 2 - panH / 2;
    if (cx >= panX && cx <= panX + panW && cy >= panY && cy <= panY + panH) {
      trophiesPanelScroll += (e.deltaY > 0 ? 1 : -1);
      return;
    }
  }

  // Archives panel scroll
  if (showArchivesPanel && state === 'menu') {
    const pz = _drawArchivesPanel._panelZone;
    if (pz && cx >= pz.x && cx <= pz.x + pz.w && cy >= pz.y && cy <= pz.y + pz.h) {
      const maxScroll = drawLeaderboard._archMaxScroll || 0;
      const step = 30;
      LEADERBOARD._archiveScroll = Math.max(0,
        Math.min(maxScroll, (LEADERBOARD._archiveScroll || 0) + (e.deltaY > 0 ? step : -step)));
      return;
    }
  }

  const isSmall = W < 600 || H < 400;
  const lbClickW = isSmall ? Math.min(200, W * 0.38) : 270;
  const lbX = 10, lbY = 10;
  const tabH  = isSmall ? 20 : 24;
  const periH = isSmall ? 17 : 20;
  const listH = isSmall ? 19 : 22;
  const maxRows = Math.floor((H * 0.55) / listH);
  const visibleCount = Math.max(4, Math.min(maxRows, 12));
  const titleH = isSmall ? 16 : 18;
  const totalH = tabH + periH + titleH + listH * visibleCount + 16;
  if (cx >= lbX && cx <= lbX + lbClickW && cy >= lbY && cy <= lbY + totalH) {
    _lbHandleWheel(e.deltaY);
  }
}
function detachInputs() {
  if (_keyDownRef) document.removeEventListener('keydown', _keyDownRef);
  _keyDownRef = null;
  canvas?.removeEventListener('click', onCanvasClick);
  canvas?.removeEventListener('wheel', _onLbWheel);
}

/* ── Contrôles mobiles (touch) ── */
function _attachMobileControls() {
  const actBtn   = document.getElementById('jfm-mob-action');
  const leftBtn  = document.getElementById('jfm-mob-left');
  const rightBtn = document.getElementById('jfm-mob-right');

  const addTap = (el, fn) => {
    if (!el) return;
    el.addEventListener('touchend', (e) => { e.preventDefault(); fn(); }, { passive: false });
    el.addEventListener('click', fn);
  };

  addTap(actBtn,   () => onAction());
  addTap(leftBtn,  () => _navLeft());
  addTap(rightBtn, () => _navRight());

  let touchStartX = 0, touchStartY = 0;
  canvas?.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  canvas?.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) < 15 && Math.abs(dy) < 15) onAction();
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════════
   INIT / STOP
══════════════════════════════════════════════════════════ */
function initGame() {
  canvas = document.getElementById('jfm-game-canvas');
  ctx    = canvas.getContext('2d');
  loadSkinsFromStorage();
  resize();
  window.addEventListener('resize', () => { resize(); _menuClickZones = []; });
  gameRunning = true;
  // ── Vérification archivage mensuel au démarrage ──
  LEADERBOARD.checkAndArchive();
  reset();
  attachInputs();
  loop();
}

function stopGame() {
  gameRunning = false;
  if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  detachInputs();
  window.removeEventListener('resize', resize);
  const lbWrap = document.getElementById('jfm-lb-name-wrap');
  if (lbWrap) lbWrap.style.display = 'none';
}

/* ══════════════════════════════════════════════════════════
   EXPOSITION PUBLIQUE
══════════════════════════════════════════════════════════ */
window.JFM_GAME = { openGameOverlay, closeGameOverlay };

// Polyfill roundRect
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    const rad = Array.isArray(r) ? r[0] : r;
    this.beginPath();
    this.moveTo(x + rad, y); this.lineTo(x + w - rad, y);
    this.quadraticCurveTo(x + w, y, x + w, y + rad);
    this.lineTo(x + w, y + h - rad);
    this.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    this.lineTo(x + rad, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - rad);
    this.lineTo(x, y + rad);
    this.quadraticCurveTo(x, y, x + rad, y);
    this.closePath();
    return this;
  };
}

})();