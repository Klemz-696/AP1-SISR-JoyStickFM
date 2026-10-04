/* ============================================================
   JOYSTICK FM — dvd-bouncer.js
   Logo DVD animé qui rebondit en fond de fenêtre.
   Quand il touche un coin : effet "Retour vers le Futur"
   avec flash, image tk-dvd et son santa-goo-goo-ga-ga.mp3
   ============================================================ */

'use strict';

(function initDVDBouncer() {

  /* ── Config ── */
  const SPEED_BASE   = 1.4;   // px/frame de base
  const LOGO_SIZE    = 80;    // px (width & height du logo)
  const CORNER_ZONE  = 4;     // px de tolérance pour détecter un coin
  const COLORS = [
    '#00f5ff', '#b44fff', '#ff2d78', '#39ff14',
    '#ffa500', '#ffff00', '#ff6b35', '#00bfff',
  ];

  /* ── Création du canvas de fond ── */
  const canvas = document.createElement('canvas');
  canvas.id = 'dvd-bouncer-canvas';
  canvas.style.cssText = [
    'position:fixed',
    'top:0', 'left:0',
    'width:100%', 'height:100%',
    'pointer-events:none',
    'z-index:9999',           // Derrière tout le contenu
    'opacity:0.18',        // Subtil en fond
  ].join(';');
  document.body.insertBefore(canvas, document.body.firstChild);

  const ctx = canvas.getContext('2d');

  /* ── Overlay "Retour vers le Futur" ── */
  const overlay = document.createElement('div');
  overlay.id = 'dvd-corner-overlay';
  overlay.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:99996',
    'pointer-events:none',
    'display:none',
    'align-items:center',
    'justify-content:center',
    'overflow:hidden',
  ].join(';');

  /* Image tk-dvd */
  const tkImg = document.createElement('img');
  tkImg.id  = 'dvd-tk-img';
  tkImg.alt = 'TK DVD';
  tkImg.src = (window.THEME_URI || '') + '/assets/images/dvd/tk-dvd.jpeg';
  tkImg.style.cssText = [
    'max-width:min(80vw,520px)',
    'max-height:min(70vh,400px)',
    'object-fit:contain',
    'border-radius:12px',
    'position:relative',
    'z-index:2',
    'opacity:0',
    'transition:opacity .12s ease',
    'box-shadow:0 0 60px rgba(0,245,255,0.9), 0 0 120px rgba(180,79,255,0.5)',
    'border:3px solid #fff',
  ].join(';');

  overlay.appendChild(tkImg);
  document.body.appendChild(overlay);

  /* Inject CSS animations une seule fois */
  if (!document.getElementById('dvd-bouncer-styles')) {
    const style = document.createElement('style');
    style.id = 'dvd-bouncer-styles';
    style.textContent = `
      /* ── Flash électrique "88 mph" ── */
      @keyframes dvdFlash {
        0%   { background: rgba(255,255,255,0); }
        5%   { background: rgba(255,255,255,0.95); }
        12%  { background: rgba(0,245,255,0.7); }
        20%  { background: rgba(255,255,255,0.85); }
        30%  { background: rgba(180,79,255,0.6); }
        40%  { background: rgba(255,255,255,0.9); }
        55%  { background: rgba(255,165,0,0.5); }
        70%  { background: rgba(255,255,255,0.6); }
        85%  { background: rgba(0,245,255,0.3); }
        100% { background: rgba(255,255,255,0); }
      }

      /* ── Lignes d'éclairs horizontales ── */
      @keyframes dvdLightning {
        0%,100% { opacity: 0; transform: scaleX(0) translateY(0); }
        10%     { opacity: 1; transform: scaleX(1) translateY(0); }
        20%     { opacity: 0.6; transform: scaleX(0.8) translateY(2px); }
        35%     { opacity: 1; transform: scaleX(1.1) translateY(-1px); }
        50%     { opacity: 0.4; transform: scaleX(0.6) translateY(3px); }
        65%     { opacity: 0.8; transform: scaleX(0.9) translateY(-2px); }
        80%     { opacity: 0.2; transform: scaleX(0.4) translateY(0); }
      }

      /* ── Entrée de l'image ── */
      @keyframes dvdImgIn {
        0%   { transform: scale(0.3) rotate(-8deg); opacity: 0; filter: brightness(3) saturate(2); }
        40%  { transform: scale(1.08) rotate(2deg); opacity: 1; filter: brightness(1.5) saturate(1.5); }
        60%  { transform: scale(0.97) rotate(-1deg); filter: brightness(1.2) saturate(1.2); }
        100% { transform: scale(1) rotate(0deg); opacity: 1; filter: brightness(1) saturate(1); }
      }

      /* ── Sortie de l'image ── */
      @keyframes dvdImgOut {
        0%   { transform: scale(1) rotate(0deg); opacity: 1; filter: brightness(1); }
        30%  { transform: scale(1.1) rotate(3deg); filter: brightness(2); }
        100% { transform: scale(0.1) rotate(-15deg); opacity: 0; filter: brightness(4) saturate(0); }
      }

      /* ── Vignette colorée autour de l'image ── */
      @keyframes dvdGlow {
        0%,100% { box-shadow: 0 0 60px rgba(0,245,255,0.9), 0 0 120px rgba(180,79,255,0.5); }
        33%     { box-shadow: 0 0 80px rgba(255,45,120,0.9), 0 0 140px rgba(255,45,120,0.4); }
        66%     { box-shadow: 0 0 80px rgba(57,255,20,0.9), 0 0 140px rgba(57,255,20,0.4); }
      }

      /* ── Particules de vitesse ── */
      @keyframes dvdSpeedLine {
        0%   { transform: translateX(-110%) scaleX(0.5); opacity: 0; }
        20%  { opacity: 0.9; }
        80%  { opacity: 0.6; }
        100% { transform: translateX(110%) scaleX(1.5); opacity: 0; }
      }

      /* ── Texte "88 mph !" ── */
      @keyframes dvdMph {
        0%   { opacity: 0; transform: translate(-50%,-50%) scale(0.2) skewX(-15deg); }
        20%  { opacity: 1; transform: translate(-50%,-50%) scale(1.3) skewX(-15deg); }
        50%  { opacity: 1; transform: translate(-50%,-50%) scale(1) skewX(0deg); }
        80%  { opacity: 1; transform: translate(-50%,-50%) scale(1.05) skewX(5deg); }
        100% { opacity: 0; transform: translate(-50%,-50%) scale(1.5) skewX(10deg); }
      }

      #dvd-corner-overlay { transition: none !important; }
      #dvd-corner-overlay.active { display: flex !important; }

      #dvd-tk-img.img-in  {
        animation: dvdImgIn  0.45s cubic-bezier(0.34,1.56,0.64,1) forwards,
                   dvdGlow   1.2s ease-in-out infinite;
      }
      #dvd-tk-img.img-out {
        animation: dvdImgOut 0.4s ease-in forwards;
        animation-delay: 0.05s;
      }
    `;
    document.head.appendChild(style);
  }

  /* ── État du logo ── */
  let W = window.innerWidth;
  let H = window.innerHeight;

  let x  = Math.random() * (W - LOGO_SIZE);
  let y  = Math.random() * (H - LOGO_SIZE);
  let vx = SPEED_BASE * (Math.random() > 0.5 ? 1 : -1);
  let vy = SPEED_BASE * (Math.random() > 0.5 ? 1 : -1);

  let colorIdx   = 0;
  let rafId      = null;
  let cornerCooldown = 0;  // frames de cooldown après un coin
  let isCornerAnim   = false;

  /* ── Resize ── */
  window.addEventListener('resize', () => {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;
    if (x + LOGO_SIZE > W) x = W - LOGO_SIZE;
    if (y + LOGO_SIZE > H) y = H - LOGO_SIZE;
  }, { passive: true });

  canvas.width  = W;
  canvas.height = H;

  /* ── Charge l'image du logo DVD ── */
  const logoImg = new Image();
  logoImg.src = (window.THEME_URI || '') + '/assets/images/dvd/logo-dvd.png';

  /* ── Vérifie si on est dans un coin ── */
  function isInCorner() {
    const atLeft   = x <= CORNER_ZONE;
    const atRight  = x >= W - LOGO_SIZE - CORNER_ZONE;
    const atTop    = y <= CORNER_ZONE;
    const atBottom = y >= H - LOGO_SIZE - CORNER_ZONE;
    return (atLeft || atRight) && (atTop || atBottom);
  }

  /* ── Déclenche l'animation "88 mph" ── */
  function triggerCornerEffect() {
    if (isCornerAnim) return;
    isCornerAnim   = true;
    cornerCooldown = 90; // ~1.5s à 60fps

    /* === Flash background === */
    overlay.style.background = 'transparent';
    overlay.classList.add('active');

    // Injecte les éléments d'effet dans l'overlay
    overlay.innerHTML = '';

    /* Flash layer */
    const flashLayer = document.createElement('div');
    flashLayer.style.cssText = [
      'position:absolute', 'inset:0',
      'animation: dvdFlash 0.8s ease-out forwards',
      'z-index:1',
    ].join(';');
    overlay.appendChild(flashLayer);

    /* Speed lines */
    for (let i = 0; i < 8; i++) {
      const line = document.createElement('div');
      const topPct = 10 + Math.random() * 80;
      const w      = 30 + Math.random() * 50;
      const h      = 1 + Math.random() * 3;
      const delay  = Math.random() * 0.3;
      const color  = COLORS[Math.floor(Math.random() * COLORS.length)];
      line.style.cssText = [
        'position:absolute',
        `top:${topPct}%`,
        'left:0', 'right:0',
        `height:${h}px`,
        `background:linear-gradient(90deg, transparent, ${color}, transparent)`,
        `opacity:0`,
        `animation: dvdSpeedLine ${0.3 + Math.random() * 0.4}s ease-out ${delay}s forwards`,
        'z-index:1',
      ].join(';');
      overlay.appendChild(line);
    }

    /* Image TK-DVD */
    const img = document.createElement('img');
    img.id  = 'dvd-tk-img-anim';
    img.alt = 'TK DVD';
    img.src = (window.THEME_URI || '') + '/assets/images/dvd/tk-dvd.jpeg';
    img.style.cssText = [
      'max-width:min(80vw,520px)',
      'max-height:min(70vh,400px)',
      'object-fit:contain',
      'border-radius:12px',
      'position:relative',
      'z-index:3',
      'opacity:1',
      'animation: dvdImgIn 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards',
      'box-shadow:0 0 60px rgba(0,245,255,0.9), 0 0 120px rgba(180,79,255,0.5)',
      'border:3px solid rgba(255,255,255,0.8)',
    ].join(';');
    overlay.appendChild(img);

    /* Texte "88 mph !" */
    const mph = document.createElement('div');
    mph.textContent = '88 MPH !';
    mph.style.cssText = [
      'position:absolute',
      'top:15%', 'left:50%',
      'transform:translate(-50%,-50%)',
      'font-family:"VT323", monospace',
      'font-size:clamp(2.5rem,8vw,5rem)',
      'color:#FFD700',
      'text-shadow:0 0 20px #FFD700, 0 0 40px #ff6b35, 2px 2px 0 #000',
      'white-space:nowrap',
      'z-index:4',
      'letter-spacing:0.15em',
      'animation: dvdMph 1.4s ease-out forwards',
      'pointer-events:none',
    ].join(';');
    overlay.appendChild(mph);

    /* === Son === */
    const snd = new Audio((window.THEME_URI || '') + '/assets/audio/dvd/googoo-gaga-dvd.mp3');
    snd.volume = 0.7;

    const playSound = () => {
      snd.play().catch(() => {});
    };

    // Tente de jouer directement (fonctionne si un geste a eu lieu avant)
    playSound();

    /* === Durée : on attend la fin du son pour masquer === */
    let hideTimer;

    const hideOverlay = () => {
      // Animation de sortie de l'image
      if (img && img.parentNode) {
        img.style.animation = 'dvdImgOut 0.4s ease-in forwards';
        img.style.animationDelay = '0.05s';
      }
      if (mph && mph.parentNode) {
        mph.style.opacity = '0';
        mph.style.transition = 'opacity 0.2s';
      }
      setTimeout(() => {
        overlay.classList.remove('active');
        overlay.innerHTML = '';
        isCornerAnim = false;
      }, 450);
    };

    snd.addEventListener('ended', hideOverlay, { once: true });

    // Fallback : si le son ne se charge pas ou dure > 8s
    hideTimer = setTimeout(hideOverlay, 8000);

    snd.addEventListener('ended', () => clearTimeout(hideTimer), { once: true });
  }

  /* ── Boucle d'animation principale ── */
  function drawLogo() {
    ctx.clearRect(0, 0, W, H);

    /* Déplace le logo */
    x += vx;
    y += vy;

    /* Rebonds sur les bords */
    let bounced = false;
    if (x <= 0) {
      x  = 0;
      vx = Math.abs(vx);
      bounced = true;
      colorIdx = (colorIdx + 1) % COLORS.length;
    } else if (x >= W - LOGO_SIZE) {
      x  = W - LOGO_SIZE;
      vx = -Math.abs(vx);
      bounced = true;
      colorIdx = (colorIdx + 1) % COLORS.length;
    }

    if (y <= 0) {
      y  = 0;
      vy = Math.abs(vy);
      bounced = true;
      if (!bounced || x > CORNER_ZONE && x < W - LOGO_SIZE - CORNER_ZONE)
        colorIdx = (colorIdx + 1) % COLORS.length;
    } else if (y >= H - LOGO_SIZE) {
      y  = H - LOGO_SIZE;
      vy = -Math.abs(vy);
      bounced = true;
    }

    if (bounced) colorIdx = (colorIdx + 1) % COLORS.length;

    /* Coin détecté ? */
    if (cornerCooldown > 0) {
      cornerCooldown--;
    } else if (bounced && isInCorner()) {
      triggerCornerEffect();
    }

    /* Dessine le logo avec la couleur courante */
    ctx.save();
    if (logoImg.complete && logoImg.naturalWidth > 0) {
      // Ombre colorée (glow)
      ctx.shadowColor  = COLORS[colorIdx];
      ctx.shadowBlur   = 18;

      // Technique offscreen canvas : colorie exactement le logo avec COLORS[colorIdx]
      // 1) Dessine le logo original sur un canvas temporaire
      if (!drawLogo._offCanvas) {
        drawLogo._offCanvas = document.createElement('canvas');
        drawLogo._offCtx    = drawLogo._offCanvas.getContext('2d');
      }
      const off    = drawLogo._offCanvas;
      const offCtx = drawLogo._offCtx;
      off.width  = LOGO_SIZE;
      off.height = LOGO_SIZE;

      // Dessine l'image (garde l'alpha du PNG)
      offCtx.clearRect(0, 0, LOGO_SIZE, LOGO_SIZE);
      offCtx.globalCompositeOperation = 'source-over';
      offCtx.drawImage(logoImg, 0, 0, LOGO_SIZE, LOGO_SIZE);

      // 2) Remplis la silhouette avec la couleur cible (source-in = ne peint que les pixels opaques)
      offCtx.globalCompositeOperation = 'source-in';
      offCtx.fillStyle = COLORS[colorIdx];
      offCtx.fillRect(0, 0, LOGO_SIZE, LOGO_SIZE);

      // 3) Dessine le résultat colorié sur le canvas principal
      ctx.drawImage(off, x, y, LOGO_SIZE, LOGO_SIZE);
    } else {
      /* Fallback texte si l'image n'est pas chargée */
      ctx.font      = 'bold 14px "Orbitron", monospace';
      ctx.fillStyle = COLORS[colorIdx];
      ctx.shadowColor  = COLORS[colorIdx];
      ctx.shadowBlur   = 12;
      ctx.textAlign = 'center';
      ctx.fillText('DVD', x + LOGO_SIZE / 2, y + LOGO_SIZE / 2 + 5);
    }
    ctx.restore();

    rafId = requestAnimationFrame(drawLogo);
  }

  /* ── Démarre l'animation ── */
  function startBouncer() {
    if (rafId) return;
    canvas.style.display = 'block';
    drawLogo();
  }

  /* ── Stoppe l'animation et masque le canvas ── */
  function stopBouncer() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    ctx.clearRect(0, 0, W, H);
    canvas.style.display = 'none';
  }

  /* ── Persistance : lit l'état sauvegardé ── */
  let _bouncerEnabled = false;
  try { _bouncerEnabled = localStorage.getItem('jfm_dvd_bouncer') === '1'; } catch(e) {}

  /* ── Canvas masqué par défaut ── */
  canvas.style.display = 'none';

  /* ── Synchronise le toggle (s'il existe déjà dans le DOM) ── */
  function _syncToggle() {
    const toggle = document.getElementById('dvd-bouncer-toggle');
    if (!toggle) return;
    toggle.checked = _bouncerEnabled;
  }

  /* ── API publique : toggle ON/OFF ── */
  window.dvdBouncerSetEnabled = function(enabled) {
    _bouncerEnabled = !!enabled;
    try { localStorage.setItem('jfm_dvd_bouncer', _bouncerEnabled ? '1' : '0'); } catch(e) {}
    _syncToggle();
    if (_bouncerEnabled) {
      startBouncer();
    } else {
      stopBouncer();
      // Masque aussi l'overlay corner si actif
      overlay.classList.remove('active');
      overlay.innerHTML = '';
      isCornerAnim = false;
    }
  };

  /* ── Démarre si l'état sauvegardé est ON ── */
  function _initIfEnabled() {
    _syncToggle();
    if (_bouncerEnabled) startBouncer();
  }

  /* Attend la fin du boot screen si présent, sinon démarre directement */
  const boot = document.getElementById('console-boot');
  if (boot) {
    const bootObs = new MutationObserver(() => {
      const hidden = boot.style.display === 'none'
        || boot.style.opacity === '0'
        || boot.style.visibility === 'hidden';
      if (hidden) { bootObs.disconnect(); setTimeout(_initIfEnabled, 300); }
    });
    bootObs.observe(boot, { attributes: true, attributeFilter: ['style', 'class'] });

    const bodyObs = new MutationObserver(() => {
      if (!document.body.classList.contains('boot-loading')) {
        bodyObs.disconnect();
        setTimeout(_initIfEnabled, 300);
      }
    });
    bodyObs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _initIfEnabled);
    } else {
      _initIfEnabled();
    }
  }

  /* ── Pause quand l'onglet est en arrière-plan (économie CPU) ── */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    } else if (_bouncerEnabled) {
      startBouncer();
    }
  });

})();