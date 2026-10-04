/* ============================================
   JOYSTICK FM — main.js
   Menu responsive, console boot, Konami Code
   v6.5 — AJOUT : Konami Code mobile (swipe + taps)
   ============================================ */

'use strict';

/* ────────────────────────────────────────────
   1. CONSOLE BOOT ANIMATION
   ──────────────────────────────────────────── */
(function initBoot() {
  const overlay = document.getElementById('console-boot');
  if (!overlay) return;

  const bar  = overlay.querySelector('.boot-bar');
  const text = overlay.querySelector('.boot-text');

  const messages = [
    'INITIALISATION SYSTÈME...',
    'CHARGEMENT DES MODULES AUDIO...',
    'CONNEXION AU SERVEUR ICECAST...',
    'CALIBRATION DES JOYSTICKS...',
    'DÉMARRAGE DE JOYSTICK FM...',
    'APPUYEZ SUR START ▶'
  ];

  document.body.classList.add('boot-loading');

  function preventWheel(e) { e.preventDefault(); }
  window.addEventListener('wheel', preventWheel, { passive: false });

  function preventTouch(e) { e.preventDefault(); }
  window.addEventListener('touchmove', preventTouch, { passive: false });

  const SCROLL_KEYS = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',
                       'PageUp','PageDown','Home','End',' '];
  function preventKeyScroll(e) {
    if (SCROLL_KEYS.includes(e.key)) e.preventDefault();
  }
  window.addEventListener('keydown', preventKeyScroll);

  let progress = 0;
  let msgIndex = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 18 + 8;
    if (progress > 100) progress = 100;
    if (bar) bar.style.width = progress + '%';

    const idx = Math.min(
      Math.floor((progress / 100) * messages.length),
      messages.length - 1
    );
    if (idx !== msgIndex) {
      msgIndex = idx;
      if (text) text.textContent = messages[msgIndex];
    }

    if (progress >= 100) {
      clearInterval(interval);
      if (text) text.textContent = messages[messages.length - 1];

      setTimeout(() => {
        let startBtn = overlay.querySelector('#boot-start-btn');
        if (!startBtn) {
          startBtn = document.createElement('button');
          startBtn.id = 'boot-start-btn';
          startBtn.innerHTML = '▶ &nbsp; START';
          startBtn.className = 'animate-slide-up animate-fade-in';
          startBtn.style.cssText = [
            'display:inline-flex',
            'align-items:center',
            'justify-content:center',
            'gap:0.5rem',
            'margin-top:2.5rem',
            'padding:1rem 3.5rem',
            'background:linear-gradient(135deg,var(--bleu-neon),var(--violet))',
            'border:none',
            'border-radius:8px',
            'color:var(--noir)',
            'font-family:var(--font-tech)',
            'font-size:1.2rem',
            'font-weight:900',
            'letter-spacing:0.2em',
            'cursor:pointer',
            'box-shadow:0 0 30px rgba(0,245,255,0.5)',
            'text-transform:uppercase',
            'transition: transform 0.2s, box-shadow 0.2s'
          ].join(';');

          startBtn.onmouseenter = () => {
            startBtn.style.transform = 'scale(1.05)';
            startBtn.style.boxShadow = '0 0 40px rgba(180,79,255,0.7)';
          };
          startBtn.onmouseleave = () => {
            startBtn.style.transform = 'scale(1)';
            startBtn.style.boxShadow = '0 0 30px rgba(0,245,255,0.5)';
          };

          overlay.appendChild(startBtn);
        }

        startBtn.addEventListener('click', () => {
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            function beep(freq, dur, delay) {
              const osc  = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.type = 'square';
              osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
              gain.gain.setValueAtTime(0.06, ctx.currentTime + delay);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
              osc.start(ctx.currentTime + delay);
              osc.stop(ctx.currentTime + delay + dur + 0.05);
            }
            beep(220, 0.10, 0.00);
            beep(330, 0.10, 0.15);
            beep(440, 0.10, 0.30);
            beep(880, 0.20, 0.45);
          } catch(e) {}

          startBtn.onmouseenter = null;
          startBtn.onmouseleave = null;
          startBtn.style.transform = 'scale(0.95)';
          startBtn.style.opacity   = '0.6';

          overlay.style.animation = 'fadeIn 0.5s reverse forwards';

          setTimeout(() => {
            overlay.style.display = 'none';
            document.body.classList.remove('boot-loading');
            window.removeEventListener('wheel', preventWheel);
            window.removeEventListener('touchmove', preventTouch);
            window.removeEventListener('keydown', preventKeyScroll);
            document.querySelectorAll('.stagger-children').forEach(el => {
              el.style.visibility = 'visible';
            });
          }, 400);
        }, { once: true });
      }, 500);
    }
  }, 100);

})();

/* ────────────────────────────────────────────
   2. NAVIGATION RESPONSIVE (BURGER)
   ──────────────────────────────────────────── */
(function initNav() {
  const burger = document.querySelector('.burger');
  const navUl  = document.querySelector('nav ul');
  if (!burger || !navUl) return;

  burger.addEventListener('click', () => {
    const isOpen = navUl.classList.toggle('open');
    burger.classList.toggle('open');
    burger.setAttribute('aria-expanded', isOpen);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('header')) {
      navUl.classList.remove('open');
      burger.classList.remove('open');
    }
  });

  navUl.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navUl.classList.remove('open');
      burger.classList.remove('open');
    });
  });

  const current = window.location.pathname.split('/').pop() || 'index.html';
  navUl.querySelectorAll('a').forEach(link => {
    if (link.getAttribute('href') === current) link.classList.add('active');
  });
})();


/* ────────────────────────────────────────────
   3. INTERSECTION OBSERVER (scroll animations)
   ──────────────────────────────────────────── */
(function initScrollAnimations() {
  const opts = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-slide-up');
        observer.unobserve(entry.target);
      }
    });
  }, opts);

  document.querySelectorAll('.card, .section-header, .stat-item').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
})();

/* ────────────────────────────────────────────
   4. HEADER SCROLL EFFECT
   ──────────────────────────────────────────── */
(function initHeaderScroll() {
  const header = document.querySelector('body > header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
})();

/* ────────────────────────────────────────────
   5. PIXEL PARTICLES (hero deco)
   ──────────────────────────────────────────── */
(function initParticles() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className = 'pixel-particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      top:  ${Math.random() * 100}%;
      --dur: ${4 + Math.random() * 6}s;
      animation-delay: -${Math.random() * 6}s;
      background: ${Math.random() > 0.5 ? 'var(--bleu-neon)' : 'var(--violet)'};
      width:  ${2 + Math.floor(Math.random() * 3) * 2}px;
      height: ${2 + Math.floor(Math.random() * 3) * 2}px;
    `;
    hero.appendChild(p);
  }
})();

/* ────────────────────────────────────────────
   6. AURA CURSEUR — Ombre colorée fluide
   ──────────────────────────────────────────── */
/* ────────────────────────────────────────────
   7. KONAMI CODE MOBILE — Indicateur + relais
   Sur mobile, si easter-eggs.js est chargé il gère lui-même les swipes.
   main.js expose un indicateur Konami dans le footer pour le clavier (PC).
   ──────────────────────────────────────────── */
(function initKonamiKeyboard() {
  // Indicateur footer PC (sans easter-eggs.js)
  if (typeof EGG_TRACKER !== 'undefined') return; // easter-eggs.js gère déjà tout

  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
                  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  const LABELS = ['↑','↑','↓','↓','←','→','←','→','B','A'];
  let idx = 0, timer = null;

  const footerHint = document.querySelector('.footer-bottom p:last-child');
  if (footerHint && footerHint.textContent.match(/BA|↑↑/)) {
    footerHint.innerHTML = LABELS.map(l => `<span>${l}</span>`).join('') + ' 🎮';
  }

  function paint() {
    if (!footerHint) return;
    footerHint.querySelectorAll('span').forEach((s, i) => {
      s.style.color       = i < idx ? 'var(--bleu-neon)' : 'var(--texte-dim)';
      s.style.textShadow  = i < idx ? 'var(--glow-bleu)' : 'none';
    });
  }

  document.addEventListener('keydown', e => {
    if (['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) return;
    if (e.key.toLowerCase() === KONAMI[idx].toLowerCase() || e.key === KONAMI[idx]) {
      idx++;
      paint();
      clearTimeout(timer);
      timer = setTimeout(() => { idx = 0; paint(); }, 3000);
      if (idx === KONAMI.length) {
        idx = 0; paint();
        if (typeof window.triggerKonamiEgg === 'function') window.triggerKonamiEgg();
      }
    } else {
      idx = 0;
      if (e.key.toLowerCase() === KONAMI[0].toLowerCase()) idx = 1;
      paint();
    }
  });
})();

/* ────────────────────────────────────────────
   8. AURA CURSEUR — Ombre colorée fluide
   ──────────────────────────────────────────── */
(function initCursorAura() {
  if (window.matchMedia('(hover: none)').matches) return;

  const aura = document.createElement('div');
  aura.id = 'cursor-aura';
  document.body.appendChild(aura);

  if (!document.getElementById('cursor-aura-style')) {
    const style = document.createElement('style');
    style.id = 'cursor-aura-style';
    style.textContent = `
      #cursor-aura {
        position: fixed; width: 100px; height: 100px;
        border-radius: 50%; pointer-events: none; z-index: 99999;
        top: 0; left: 0; transform: translate(-50%, -50%);
        background: radial-gradient(circle at center, rgba(0, 245, 255, 0.10) 0%, rgba(180, 79, 255, 0.05) 40%, transparent 70%);
        mix-blend-mode: screen; filter: blur(2px);
        will-change: transform;
      }
      #cursor-aura-ring {
        position: fixed; width: 20px; height: 20px;
        border-radius: 50%; pointer-events: none; z-index: 99999;
        top: 0; left: 0; transform: translate(-50%, -50%);
        border: 1px solid rgba(0, 245, 255, 0.15);
        box-shadow: 0 0 8px rgba(0, 245, 255, 0.06), inset 0 0 8px rgba(180, 79, 255, 0.04);
        filter: blur(0.5px); will-change: transform;
      }
    `;
    document.head.appendChild(style);
  }

  const ring = document.createElement('div');
  ring.id = 'cursor-aura-ring';
  document.body.appendChild(ring);

  let mX = window.innerWidth  / 2;
  let mY = window.innerHeight / 2;
  let aX = mX, aY = mY;
  let rX = mX, rY = mY;
  const EASE_AURA = 0.25;
  const EASE_RING = 0.45;

  document.addEventListener('mousemove', (e) => { mX = e.clientX; mY = e.clientY; }, { passive: true });
  document.addEventListener('mouseleave', () => { aura.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { aura.style.opacity = '1'; ring.style.opacity = '1'; });

  function tick() {
    aX += (mX - aX) * EASE_AURA; aY += (mY - aY) * EASE_AURA;
    rX += (mX - rX) * EASE_RING; rY += (mY - rY) * EASE_RING;
    aura.style.transform = `translate3d(${aX.toFixed(1)}px, ${aY.toFixed(1)}px, 0) translate3d(-50%, -50%, 0)`;
    ring.style.transform = `translate3d(${rX.toFixed(1)}px, ${rY.toFixed(1)}px, 0) translate3d(-50%, -50%, 0)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();