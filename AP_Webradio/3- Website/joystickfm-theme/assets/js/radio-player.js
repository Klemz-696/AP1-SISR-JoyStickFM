/* ============================================
   JOYSTICK FM — radio-player.js
   v6.5 — CORRECTIFS MOBILE COMPLETS
   - Slider volume iOS (input range) : fix via touch events manuels
   - Bouton mute tactile : fix touchend + pointer events
   - Flux radio persistant cross-page (PC + mobile)
   - Media Session : logo + titre dans les notifications
   ============================================ */

'use strict';

/* ──────────────────────────────────────────────────────────
   UTILITAIRE : Rend un <input type="range"> fonctionnel sur iOS
   Safari ignore les événements 'input' sur les sliders dans
   certains contextes. On remplace par des touch events manuels.
   ────────────────────────────────────────────────────────── */
function patchIOSSlider(slider, onValueChange) {
  if (!slider) return;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  // Sur desktop, l'événement 'input' suffit
  slider.addEventListener('input', () => {
    onValueChange(parseFloat(slider.value));
  });

  // Sur iOS/mobile : remplacer par touch events manuels
  if (isIOS || ('ontouchstart' in window)) {
    const getValueFromTouch = (touch) => {
      const rect = slider.getBoundingClientRect();
      const min  = parseFloat(slider.min)  || 0;
      const max  = parseFloat(slider.max)  || 1;
      const step = parseFloat(slider.step) || 0.05;
      let pct = (touch.clientX - rect.left) / rect.width;
      pct = Math.max(0, Math.min(1, pct));
      let val = min + pct * (max - min);
      // Arrondi au step
      val = Math.round(val / step) * step;
      val = Math.max(min, Math.min(max, val));
      return parseFloat(val.toFixed(2));
    };

    slider.addEventListener('touchstart', (e) => {
      e.preventDefault(); // Empêche le scroll pendant le drag
      const val = getValueFromTouch(e.touches[0]);
      slider.value = val;
      onValueChange(val);
    }, { passive: false });

    slider.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const val = getValueFromTouch(e.touches[0]);
      slider.value = val;
      onValueChange(val);
    }, { passive: false });

    slider.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (e.changedTouches[0]) {
        const val = getValueFromTouch(e.changedTouches[0]);
        slider.value = val;
        onValueChange(val);
      }
    }, { passive: false });
  }
}

function formatTime(s) {
  if (!s || isNaN(s) || !isFinite(s)) return '0:00';
  const m   = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

const PlayerRegistry = {
  _players: new Set(),
  register(p)   { this._players.add(p); },
  unregister(p) { this._players.delete(p); },
  stopAll(except) {
    this._players.forEach(p => {
      if (p !== except) p.resetAndStop();
    });
  }
};

const VolumeState = {
  KEY: 'jfm_volume',
  save(vol) { try { sessionStorage.setItem(this.KEY, String(vol)); } catch(e) {} },
  load() {
    try {
      const v = parseFloat(sessionStorage.getItem(this.KEY));
      return isNaN(v) ? 0.8 : Math.max(0, Math.min(1, v));
    } catch(e) { return 0.8; }
  }
};

const SessionState = {
  KEY: 'jfm_player_state',
  save(data) { try { sessionStorage.setItem(this.KEY, JSON.stringify(data)); } catch(e) {} },
  load() {
    try { return JSON.parse(sessionStorage.getItem(this.KEY)) || null; } catch(e) { return null; }
  },
  clear() { try { sessionStorage.removeItem(this.KEY); } catch(e) {} }
};

// ── État de la radio : persiste ENTRE LES PAGES ──
// On utilise sessionStorage pour savoir si la radio était active
const RadioState = {
  KEY: 'jfm_radio_state',
  save(data) { try { sessionStorage.setItem(this.KEY, JSON.stringify(data)); } catch(e) {} },
  load() {
    try { return JSON.parse(sessionStorage.getItem(this.KEY)) || null; } catch(e) { return null; }
  },
  clear() { try { sessionStorage.removeItem(this.KEY); } catch(e) {} }
};

function preloadDurations() {
  document.querySelectorAll('.audio-player-mini').forEach(container => {
    const src = container.dataset.src;
    if (!src) return;
    const probe = new Audio();
    probe.preload = 'metadata';
    probe.addEventListener('loadedmetadata', () => {
      if (!probe.duration || isNaN(probe.duration)) return;
      const dur = formatTime(probe.duration);
      const timeEl = container.querySelector('.time-display');
      if (timeEl) timeEl.textContent = `0:00 / ${dur}`;
      const card  = container.closest('.card, article');
      const badge = card && card.querySelector('.podcast-duration');
      if (badge) badge.textContent = `🕐 ${dur}`;
      container.dataset.duration = dur;
      if (container._playerInstance) container._playerInstance.duration = dur;
    }, { once: true });
    probe.src = src;
  });
}

const PROGRAMME = [
  { start:  0, end:  6, emoji: '🌙', title: 'Night Mode',             subtitle: 'Chiptune et ambiance nocturne' },
  { start:  6, end:  9, emoji: '🌅', title: 'Wake Up Gaming',         subtitle: 'OST relaxantes pour commencer la journée' },
  { start:  9, end: 14, emoji: '🎮', title: 'JoyStick Mix',           subtitle: 'Mix gaming — toutes générations confondues' },
  { start: 14, end: 16, emoji: '🎙', title: 'Le Podcast de la Honte', subtitle: 'Théories, débats et humour gaming absurde' },
  { start: 16, end: 20, emoji: '⚡', title: 'Afternoon Power-Up',     subtitle: 'Énergie maximale — OST épiques' },
  { start: 20, end: 24, emoji: '🌙', title: 'Night Gaming Session',   subtitle: 'Ambiance nocturne, néon et chiptune' },
];
function getCurrentProgram() {
  const h = new Date().getHours();
  return PROGRAMME.find(p => h >= p.start && h < p.end) || PROGRAMME[0];
}

function updateScheduleHighlight() {
  const now = new Date().getHours();
  document.querySelectorAll('.schedule-item').forEach((card, index) => {
    const badge = card.querySelector('.schedule-badge');
    const p     = PROGRAMME[index];
    if (!p) return;
    const isLive = now >= p.start && now < p.end;
    card.classList.toggle('schedule-live', isLive);
    card.style.borderColor = isLive ? 'var(--bleu-neon)' : '';
    card.style.boxShadow   = isLive ? '0 0 20px rgba(0,245,255,0.15)' : '';
    if (badge) {
      badge.innerHTML = isLive
        ? `<span class="live-badge" style="font-size:0.6rem;padding:0.25rem 0.6rem;animation:livePulse 1.5s ease-in-out infinite;"><span class="dot"></span>EN DIRECT</span>`
        : '';
    }
  });
}

/* ══════════════════════════════════════════════════════════
   FLOATING PLAYER
   ══════════════════════════════════════════════════════════ */
class FloatingPlayer {
  constructor() {
    this.container        = document.getElementById('floating-player');
    this.currentPlayer    = null;
    this._savedVolume     = VolumeState.load();
    this._tickId          = null;
    this._crossPageAudio  = null;
    this._crossPageActive = false;
    this._isDragging      = false;

    if (!this.container) return;
    this._injectTimelineStyles();
    this._bindElements();
    this._buildEnhancedTimeline();
    this._bindEvents();
    this._bindTimelineEvents();
    this._applyStoredVolume();
    this._initResponsive();
  }

  _injectTimelineStyles() {
    if (document.getElementById('fp-timeline-styles')) return;
    const style = document.createElement('style');
    style.id = 'fp-timeline-styles';
    style.textContent = `
      #fp-progress-wrap { position: relative !important; overflow: visible !important; height: 6px !important; transition: height 0.15s ease !important; cursor: pointer !important; }
      #fp-progress-wrap:hover, #fp-progress-wrap.fp-dragging { height: 10px !important; }
      #fp-progress { height: 100% !important; border-radius: 3px !important; pointer-events: none !important; transition: width 0.25s linear !important; }
      #fp-progress-wrap.fp-dragging #fp-progress, #fp-progress-wrap:hover #fp-progress { transition: none !important; }
      .fp-thumb { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 14px; height: 14px; border-radius: 50%; background: #fff; box-shadow: 0 0 6px rgba(0,245,255,0.8), 0 0 0 2px var(--bleu-neon, #00f5ff); opacity: 0; transition: opacity 0.15s ease, transform 0.1s ease; pointer-events: none; z-index: 2; cursor: grab; }
      #fp-progress-wrap:hover .fp-thumb, #fp-progress-wrap.fp-dragging .fp-thumb { opacity: 1; }
      #fp-progress-wrap.fp-dragging .fp-thumb { cursor: grabbing; transform: translate(-50%, -50%) scale(1.2); }
      .fp-seek-tooltip { position: absolute; top: -28px; transform: translateX(-50%); background: rgba(8,8,14,0.92); border: 1px solid var(--bleu-neon, #00f5ff); color: #fff; font-family: 'VT323', monospace; font-size: 0.85rem; padding: 2px 6px; border-radius: 4px; pointer-events: none; opacity: 0; transition: opacity 0.1s ease; white-space: nowrap; z-index: 3; }
      #fp-progress-wrap:hover .fp-seek-tooltip, #fp-progress-wrap.fp-dragging .fp-seek-tooltip { opacity: 1; }
      @media (max-width: 480px) { .fp-thumb { width: 12px; height: 12px; } }
    `;
    document.head.appendChild(style);
  }

  _buildEnhancedTimeline() {
    const wrap = document.getElementById('fp-progress-wrap');
    if (!wrap) return;
    wrap.innerHTML = `<div class="fp-progress" id="fp-progress"></div><div class="fp-thumb" id="fp-thumb"></div><div class="fp-seek-tooltip" id="fp-seek-tooltip">0:00</div>`;
    this.fpProgress    = document.getElementById('fp-progress');
    this.fpThumb       = document.getElementById('fp-thumb');
    this.fpSeekTooltip = document.getElementById('fp-seek-tooltip');
  }

  _bindElements() {
    this.fpTitle        = document.getElementById('fp-title');
    this.fpSubtitle     = document.getElementById('fp-subtitle');
    this.fpEmoji        = document.getElementById('fp-emoji');
    this.fpPlayBtn      = document.getElementById('fp-play-btn');
    this.fpProgress     = document.getElementById('fp-progress');
    this.fpProgressWrap = document.getElementById('fp-progress-wrap');
    this.fpTime         = document.getElementById('fp-time');
    this.fpVolume       = document.getElementById('fp-volume');
    this.fpMuteBtn      = document.getElementById('fp-mute-btn');
    this.fpCloseBtn     = document.getElementById('fp-close-btn');
  }

  _applyStoredVolume() {
    const vol = VolumeState.load();
    this._savedVolume = vol;
    if (this.fpVolume) this.fpVolume.value = vol;
    this._updateMuteIcon(vol);
  }

  _initResponsive() {
    const applyLayout = () => {
      const w = window.innerWidth;
      if (!this.container) return;
      this.container.classList.remove('fp-xs', 'fp-sm', 'fp-md');
      if (w <= 360)      this.container.classList.add('fp-xs');
      else if (w <= 480) this.container.classList.add('fp-sm');
      else if (w <= 768) this.container.classList.add('fp-md');
    };
    applyLayout();
    window.addEventListener('resize', applyLayout, { passive: true });
  }

  _bindTimelineEvents() {
    const wrap = document.getElementById('fp-progress-wrap');
    if (!wrap) return;
    const getPercent = (clientX) => {
      const rect = wrap.getBoundingClientRect();
      return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    };
    const updateVisuals = (pct) => {
      const pctStr = (pct * 100) + '%';
      if (this.fpProgress)    this.fpProgress.style.width = pctStr;
      if (this.fpThumb)       this.fpThumb.style.left     = pctStr;
      if (this.fpSeekTooltip) {
        this.fpSeekTooltip.style.left = pctStr;
        const audio = this._getAudio();
        if (audio && audio.duration && isFinite(audio.duration))
          this.fpSeekTooltip.textContent = formatTime(pct * audio.duration);
      }
    };
    const seekTo = (pct) => {
      const audio = this._getAudio();
      if (!audio || !audio.duration || isNaN(audio.duration)) return;
      audio.currentTime = pct * audio.duration;
      this._tick();
    };

    wrap.addEventListener('mousemove', (e) => {
      if (this._isDragging) return;
      const pct = getPercent(e.clientX);
      if (this.fpThumb)       this.fpThumb.style.left       = (pct * 100) + '%';
      if (this.fpSeekTooltip) {
        this.fpSeekTooltip.style.left = (pct * 100) + '%';
        const audio = this._getAudio();
        if (audio && audio.duration && isFinite(audio.duration))
          this.fpSeekTooltip.textContent = formatTime(pct * audio.duration);
      }
    });
    wrap.addEventListener('click', (e) => { if (!this._isDragging) seekTo(getPercent(e.clientX)); });
    wrap.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this._isDragging = true; wrap.classList.add('fp-dragging');
      const onMove = (ev) => updateVisuals(getPercent(ev.clientX));
      const onUp   = (ev) => {
        seekTo(getPercent(ev.clientX));
        this._isDragging = false; wrap.classList.remove('fp-dragging');
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
    });
    wrap.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this._isDragging = true; wrap.classList.add('fp-dragging');
      const onMove = (ev) => { if (ev.touches[0]) updateVisuals(getPercent(ev.touches[0].clientX)); };
      const onEnd  = (ev) => {
        const t = ev.changedTouches[0];
        if (t) seekTo(getPercent(t.clientX));
        this._isDragging = false; wrap.classList.remove('fp-dragging');
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend',  onEnd);
      };
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend',  onEnd);
    }, { passive: false });
  }

  _bindEvents() {
    this.fpPlayBtn?.addEventListener('click', () => {
      const audio = this._getAudio();
      if (!audio) return;
      if (audio.paused) {
        audio.play?.().catch(() => {});
        if (this.currentPlayer) this.currentPlayer.isPlaying = true;
        if (this.currentPlayer?.playBtn) this.currentPlayer.playBtn.textContent = '⏸';
      } else {
        audio.pause?.();
        if (this.currentPlayer) this.currentPlayer.isPlaying = false;
        if (this.currentPlayer?.playBtn) this.currentPlayer.playBtn.textContent = '▶';
      }
      this._syncPlayIcon();
    });

    // ── Slider volume floating player : patché pour iOS ──
    if (this.fpVolume) {
      patchIOSSlider(this.fpVolume, (val) => {
        const audio = this._getAudio();
        if (audio) audio.volume = val;
        if (window.radioPlayer) window.radioPlayer.setVolume(val);
        const mainSlider = document.getElementById('volume-slider');
        if (mainSlider) {
          mainSlider.value = val;
          const pct = mainSlider.nextElementSibling;
          if (pct?.tagName === 'SPAN') pct.textContent = Math.round(val * 100) + '%';
        }
        if (val > 0) this._savedVolume = val;
        VolumeState.save(val);
        this._updateMuteIcon(val);
      });
    }

    // ── Bouton mute floating player : robuste mobile ──
    if (this.fpMuteBtn) {
      const doMute = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const audio = this._getAudio();
        if (!audio) return;
        if (audio.volume > 0) {
          this._savedVolume = audio.volume;
          this._setVolumeEverywhere(0);
        } else {
          this._setVolumeEverywhere(this._savedVolume || 0.8);
        }
      };
      this.fpMuteBtn.addEventListener('click',    doMute);
      this.fpMuteBtn.addEventListener('touchend', doMute, { passive: false });
    }

    this.fpCloseBtn?.addEventListener('click', () => {
      const audio = this._getAudio();
      if (audio?.pause) audio.pause();
      if (audio instanceof HTMLAudioElement) {
        audio.removeAttribute('src');
        audio.load();
      }
      if (this.currentPlayer?.resetAndStop) this.currentPlayer.resetAndStop();
      this._crossPageActive = false;
      SessionState.clear();
      RadioState.clear();
      this.hide();
    });

    window.addEventListener('beforeunload', () => {
      VolumeState.save(this._savedVolume);
      this._saveState();
    });
  }

  _setVolumeEverywhere(val) {
    const audio = this._getAudio();
    if (audio) audio.volume = val;
    if (window.radioPlayer) window.radioPlayer.setVolume(val);
    if (this.fpVolume) this.fpVolume.value = val;
    const mainSlider = document.getElementById('volume-slider');
    if (mainSlider) {
      mainSlider.value = val;
      const pct = mainSlider.nextElementSibling;
      if (pct?.tagName === 'SPAN') pct.textContent = Math.round(val * 100) + '%';
    }
    if (val > 0) this._savedVolume = val;
    VolumeState.save(val);
    this._updateMuteIcon(val);
  }

  attach(player, title, subtitle, emoji) {
    emoji = emoji || '🎵';
    this._crossPageActive = false;
    this.currentPlayer    = player;
    if (this.fpTitle)    this.fpTitle.textContent    = title    || 'Lecture en cours';
    if (this.fpSubtitle) this.fpSubtitle.textContent = subtitle || '';
    if (this.fpEmoji)    this.fpEmoji.textContent    = emoji;
    const vol = VolumeState.load();
    const audio = this._getAudio();
    if (audio) audio.volume = vol;
    if (this.fpVolume) this.fpVolume.value = vol;
    this._savedVolume = vol;
    this._updateMuteIcon(vol);
    this.show();
    this._startTick();
  }

  restoreFromState(state) {
    if (!state || !state.src) { SessionState.clear(); return; }
    this._crossPageActive = true;
    this.currentPlayer    = null;
    const vol   = VolumeState.load();
    const audio = new Audio();
    this._crossPageAudio = audio;
    audio.src     = state.src;
    audio.volume  = vol;
    audio.preload = 'auto';
    if (this.fpTitle)    this.fpTitle.textContent    = state.title    || 'Lecture en cours';
    if (this.fpSubtitle) this.fpSubtitle.textContent = state.subtitle || '';
    if (this.fpEmoji)    this.fpEmoji.textContent    = state.emoji    || '🎵';
    if (this.fpVolume)   this.fpVolume.value         = vol;
    this._savedVolume = vol;
    this._updateMuteIcon(vol);
    audio.addEventListener('loadedmetadata', () => {
      const matchContainer = document.querySelector('.audio-player-mini[data-src="' + state.src + '"]');
      if (matchContainer?._playerInstance) {
        this._crossPageActive = false;
        this._crossPageAudio  = null;
        const mp = matchContainer._playerInstance;
        mp.audio.src = state.src;
        mp.audio.currentTime = state.currentTime || 0;
        mp.audio.volume      = vol;
        mp.audio.play().catch(() => {});
        return;
      }
      audio.currentTime = state.currentTime || 0;
      if (state.isPlaying) audio.play().catch(() => {});
    }, { once: true });
    audio.addEventListener('ended', () => {
      this._crossPageActive = false;
      SessionState.clear();
      this.hide();
    });
    this.show();
    this._startTick();
  }

  _saveState() {
    const audio = this._getAudio();
    if (!audio || audio.paused || audio.ended) return;
    let src = '';
    if (this._crossPageActive && this._crossPageAudio) src = this._crossPageAudio.src;
    else if (this.currentPlayer) {
      const ra = this.currentPlayer._realAudio;
      if (ra instanceof HTMLAudioElement) src = ra.src;
      else if (this.currentPlayer.audio instanceof HTMLAudioElement) src = this.currentPlayer.audio.src;
      else if (this.currentPlayer.src) src = this.currentPlayer.src;
    }
    if (!src || src === window.location.href) return;
    SessionState.save({
      src,
      currentTime: audio.currentTime || 0,
      isPlaying:   !audio.paused,
      volume:      VolumeState.load(),
      title:       this.fpTitle?.textContent    || '',
      subtitle:    this.fpSubtitle?.textContent || '',
      emoji:       this.fpEmoji?.textContent    || '🎵',
    });
  }

  show() {
    if (!this.container) return;
    this.container.classList.add('fp-visible');
    document.querySelector('main')?.classList.add('fp-visible');
  }
  hide() {
    if (!this.container) return;
    this.container.classList.remove('fp-visible');
    document.querySelector('main')?.classList.remove('fp-visible');
    this._stopTick();
    this.currentPlayer    = null;
    this._crossPageActive = false;
  }

  _startTick() { this._stopTick(); this._tickId = setInterval(() => this._tick(), 250); }
  _stopTick()  { if (this._tickId) { clearInterval(this._tickId); this._tickId = null; } }

  _tick() {
    if (this._isDragging) return;
    const audio = this._getAudio();
    if (!audio) return;
    if (audio.duration && isFinite(audio.duration)) {
      const pct = (audio.currentTime / audio.duration) * 100;
      if (this.fpProgress) this.fpProgress.style.width = pct + '%';
      if (this.fpThumb)    this.fpThumb.style.left     = pct + '%';
      if (this.fpTime)     this.fpTime.textContent = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration);
    } else {
      if (this.fpProgress) this.fpProgress.style.width = '0%';
      if (this.fpThumb)    this.fpThumb.style.left     = '0%';
      if (this.fpTime)     this.fpTime.textContent = formatTime(audio.currentTime) + ' / LIVE';
    }
    this._syncPlayIcon();
    if (audio.ended) this.hide();
  }

  _syncPlayIcon() {
    const audio = this._getAudio();
    if (!this.fpPlayBtn) return;
    this.fpPlayBtn.textContent = (!audio || audio.paused) ? '▶' : '⏸';
  }
  _updateMuteIcon(vol) {
    if (!this.fpMuteBtn) return;
    this.fpMuteBtn.textContent = vol === 0 ? '🔇' : vol < 0.5 ? '🔉' : '🔊';
  }
  _getAudio() {
    if (this._crossPageActive && this._crossPageAudio) return this._crossPageAudio;
    if (!this.currentPlayer) return null;
    if (this.currentPlayer._realAudio instanceof HTMLAudioElement) return this.currentPlayer._realAudio;
    if (this.currentPlayer.audio instanceof HTMLAudioElement) return this.currentPlayer.audio;
    return this.currentPlayer.audio || null;
  }
}

/* ══════════════════════════════════════════════════════════
   RADIO PLAYER
   ══════════════════════════════════════════════════════════ */
class RadioPlayer {
  constructor() {
    this.PROXY_URL = window.THEME_URI
      ? window.THEME_URI + '/assets/php/icecast-proxy.php'
      : '/assets/php/icecast-proxy.php';

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    this.isPlaying       = false;
    this.volume          = VolumeState.load();
    this.isMuted         = false;
    this._statusInterval = null;
    this._audioCtx       = null;
    this._analyser       = null;
    this._vizData        = null;
    this._vizRafId       = null;
    this._reusedCrossPage = false;

    // ── Restauration auto si la radio était active avant nav ──
    const savedRadio = RadioState.load();
    const fp = window.floatingPlayer;
    const hasCrossPageRadio = savedRadio?.isPlaying
      && fp?._crossPageActive
      && fp._crossPageAudio instanceof HTMLAudioElement
      && fp._crossPageAudio.src
      && fp._crossPageAudio.src.includes('radio-stream');

    if (hasCrossPageRadio) {
      // Réutiliser l'objet Audio cross-page existant (évite le re-buffering)
      this.audio = fp._crossPageAudio;
      fp._crossPageAudio  = null;
      fp._crossPageActive = false;
      this._reusedCrossPage = true;
    } else {
      // Création sécurisée dans le DOM (fix iOS)
      let existingAudio = document.getElementById('jfm-radio-audio');
      if (!existingAudio) {
        existingAudio = document.createElement('audio');
        existingAudio.id = 'jfm-radio-audio';
        existingAudio.style.display = 'none';
        document.body.appendChild(existingAudio);
      }
      const newAudio = existingAudio.cloneNode(true);
      existingAudio.parentNode.replaceChild(newAudio, existingAudio);
      this.audio = newAudio;
    }

    if (!isIOS && !this._reusedCrossPage) {
      this.audio.crossOrigin = 'anonymous';
    }

    this.audio.volume  = this.volume;
    if (!this._reusedCrossPage) this.audio.preload = 'none';

    this.audio.addEventListener('playing', () => this._onPlaying());
    this.audio.addEventListener('pause',   () => this._onPaused());
    this.audio.addEventListener('error',   (e) => this._onError(e));
    this.audio.addEventListener('waiting', () => this._onBuffering());

    this._bindElements();
    this._bindEvents();
    this._initFromProgram();
    PlayerRegistry.register(this);

    if (savedRadio?.isPlaying) {
      if (this._reusedCrossPage) {
        // Le flux joue déjà, on synchronise l'UI
        this.isPlaying = !this.audio.paused;
        this._updatePlayUI();
        if (this.isPlaying) {
          this._setStatus('EN DIRECT', 'live');
          this._setupVisualizer();
          this._setupMediaSession();
          this._startStatusPolling();
          const prog = getCurrentProgram();
          if (fp) fp.attach(this, `${prog.emoji} ${prog.title}`, '📡 EN DIRECT', '📻');
        }
      } else if (!isIOS) {
        // Pas de flux cross-page à réutiliser : relancer normalement
        setTimeout(() => this.play(), 400);
      } else if (fp) {
        // Sur iOS : afficher un bouton "Reprendre" dans le floating player
        const prog = getCurrentProgram();
        fp.attach(this, `${prog.emoji} ${prog.title}`, 'Tapez Play pour reprendre', '📻');
      }
    }
  }

  _setupMediaSession() {
    if (!('mediaSession' in navigator)) return;

    const artworkUrl = (window.THEME_URI || '') + '/assets/images/artwork.png';

    navigator.mediaSession.metadata = new MediaMetadata({
      title:  'JoyStick FM — En direct',
      artist: 'La WebRadio Gaming 24h/24',
      album:  'Live Stream',
      artwork: [
        { src: artworkUrl, sizes: '512x512', type: 'image/png' },
        { src: artworkUrl, sizes: '256x256', type: 'image/png' },
        { src: artworkUrl, sizes: '128x128', type: 'image/png' },
      ]
    });

    navigator.mediaSession.setActionHandler('play',          () => this.play());
    navigator.mediaSession.setActionHandler('pause',         () => this.pause());
    navigator.mediaSession.setActionHandler('stop',          () => this.pause());
    navigator.mediaSession.setActionHandler('nexttrack',     null);
    navigator.mediaSession.setActionHandler('previoustrack', null);
    navigator.mediaSession.setActionHandler('seekbackward',  null);
    navigator.mediaSession.setActionHandler('seekforward',   null);
  }

  _updateMediaSessionTrack(title, artist) {
    if (!('mediaSession' in navigator)) return;
    const artworkUrl = (window.THEME_URI || '') + '/assets/images/artwork.png';
    navigator.mediaSession.metadata = new MediaMetadata({
      title:  title  || 'JoyStick FM',
      artist: artist || 'JoyStick FM — Live',
      album:  'En direct',
      artwork: [
        { src: artworkUrl, sizes: '512x512', type: 'image/png' },
        { src: artworkUrl, sizes: '256x256', type: 'image/png' },
        { src: artworkUrl, sizes: '128x128', type: 'image/png' },
      ]
    });
  }

  _initFromProgram() {
    const prog = getCurrentProgram();
    if (this.nowTitle)  this.nowTitle.textContent  = `${prog.emoji} ${prog.title}`;
    if (this.nowArtist) this.nowArtist.textContent = prog.subtitle;
  }

  _bindElements() {
    this.playBtn      = document.getElementById('main-play-btn');
    this.playIcon     = document.getElementById('play-icon');
    this.volumeSlider = document.getElementById('volume-slider');
    this.muteBtn      = document.getElementById('mute-btn');
    this.nowTitle     = document.getElementById('now-playing-title');
    this.nowArtist    = document.getElementById('now-playing-artist');
    this.listenersEl  = document.getElementById('listeners-count');
    this.statListeners= document.getElementById('stat-listeners');
    this.statusEl     = document.getElementById('stream-status');
    this.vizBars      = document.querySelectorAll('.viz-bar');
  }

  _bindEvents() {
    // ── Bouton Play/Pause ──
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => this.toggle());
      // Fix mobile : touchend explicite
      this.playBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.toggle();
      }, { passive: false });
    }

    // ── Bouton Mute : robuste mobile ──
    if (this.muteBtn) {
      const doToggleMute = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMute();
      };
      this.muteBtn.addEventListener('click',    doToggleMute);
      this.muteBtn.addEventListener('touchend', doToggleMute, { passive: false });
    }

    // ── Slider volume principal : patché pour iOS ──
    if (this.volumeSlider) {
      this.volumeSlider.value = this.volume;
      const pctEl = this.volumeSlider.nextElementSibling;
      if (pctEl?.tagName === 'SPAN') pctEl.textContent = Math.round(this.volume * 100) + '%';

      patchIOSSlider(this.volumeSlider, (val) => {
        this.setVolume(val);
        if (window.floatingPlayer) {
          if (window.floatingPlayer.fpVolume) window.floatingPlayer.fpVolume.value = val;
          window.floatingPlayer._savedVolume = val;
          window.floatingPlayer._updateMuteIcon(val);
        }
        VolumeState.save(val);
      });
    }
  }

  toggle() { this.isPlaying ? this.pause() : this.play(); }
  forceStop()  { this.pause(); }
  resetAndStop() { this.pause(); }

  play() {
    PlayerRegistry.stopAll(this);

    if (this._audioCtx?.state === 'suspended') this._audioCtx.resume();

    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();

    this.STREAM_URL = window.location.origin + '/radio-stream.mp3?t=' + Date.now();
    this.audio.volume = this.volume;
    this.audio.src = this.STREAM_URL;
    this.audio.load();

    this.isPlaying = true;
    this._updatePlayUI();
    this._setStatus('⟳ CHARGEMENT :<br>Veuillez patienter', 'buffering');
    this._startStatusPolling();

    // Sauvegarde immédiate pour la persistance cross-page
    RadioState.save({ isPlaying: true, volume: this.volume });

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {})
        .catch((e) => {
          if (e.name === 'AbortError') {
            setTimeout(() => {
              if (!this.audio.paused) return;
              this._handlePlayError();
            }, 1500);
            return;
          }
          this._handlePlayError();
        });
    }
  }

  _handlePlayError() {
    this.isPlaying = false;
    this._updatePlayUI();
    this._stopStatusPolling();
    this._setStatus('⚠ Tapez à nouveau sur Play', 'error');
    RadioState.clear();
  }

  pause() {
    this.isPlaying = false;
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();

    this._stopStatusPolling();
    this._stopVizRaf();
    this._animateVizCSS(false);
    this._updatePlayUI();
    this._setStatus('◼ EN PAUSE', 'paused');
    RadioState.clear(); // Plus de persistance quand pausé

    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }

    if (window.floatingPlayer?.currentPlayer === this) {
      window.floatingPlayer.hide();
    }
  }

  _startStatusPolling() {
    this._stopStatusPolling();
    this._fetchIcecastStatus();
    this._statusInterval = setInterval(() => this._fetchIcecastStatus(), 5000);
  }

  _stopStatusPolling() {
    if (this._statusInterval) { clearInterval(this._statusInterval); this._statusInterval = null; }
  }

  _fetchIcecastStatus() {
    fetch(this.PROXY_URL + '?t=' + Date.now())
      .then(r => r.json())
      .then(data => {
        if (!data.online) return;
        const count = data.listeners ?? '—';
        if (this.listenersEl)   this.listenersEl.textContent   = count;
        if (this.statListeners) this.statListeners.textContent = count;

        if (this.isPlaying && data.title) {
          const trackLine = data.artist && data.artist !== '—'
            ? `🎵 ${data.artist} — ${data.title}`
            : `🎵 ${data.title}`;
          if (this.nowTitle)  this.nowTitle.textContent  = trackLine;
          if (this.nowArtist) this.nowArtist.textContent = data.server_name || 'JoyStick FM';

          // Mise à jour Media Session avec le titre en cours
          this._updateMediaSessionTrack(
            data.title  || 'JoyStick FM',
            data.artist || 'JoyStick FM — Live'
          );

          if (window.floatingPlayer?.currentPlayer === this) {
            if (window.floatingPlayer.fpTitle)
              window.floatingPlayer.fpTitle.textContent = trackLine;
            // Ne pas écraser le fpSubtitle — il affiche le statut (EN DIRECT, CHARGEMENT, etc.)
          }
        }
      })
      .catch(() => {});
  }

  _setupVisualizer() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) {
      this._animateVizCSS(true);
      return;
    }
    try {
      if (!this._audioCtx) {
        this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
      if (!this._sourceNode) {
        this._sourceNode = this._audioCtx.createMediaElementSource(this.audio);
        this._analyser   = this._audioCtx.createAnalyser();
        this._analyser.fftSize             = 256;
        this._analyser.smoothingTimeConstant = 0.75;
        this._sourceNode.connect(this._analyser);
        this._analyser.connect(this._audioCtx.destination);
        this._vizData = new Uint8Array(this._analyser.frequencyBinCount);
      }
      this.vizBars.forEach(b => { b.style.animation = 'none'; b.style.height = '4px'; });
      this._drawViz();
    } catch(e) {
      this._animateVizCSS(true);
    }
  }

  _drawViz() {
    if (!this.isPlaying || !this._analyser) return;
    this._vizRafId = requestAnimationFrame(() => this._drawViz());
    this._analyser.getByteFrequencyData(this._vizData);
    const bars  = this.vizBars;
    const total = bars.length;
    bars.forEach((bar, i) => {
      const idx = Math.floor(i * (this._vizData.length * 0.55) / total);
      const val = this._vizData[idx] / 255;
      bar.style.height = Math.max(4, val * 58) + 'px';
    });
  }

  _stopVizRaf() {
    if (this._vizRafId) { cancelAnimationFrame(this._vizRafId); this._vizRafId = null; }
  }

  _animateVizCSS(active) {
    this.vizBars.forEach(bar => {
      if (active) {
        bar.style.animation  = '';
        bar.style.height     = '';
        bar.style.setProperty('--dur', (0.4 + Math.random() * 0.6) + 's');
        bar.style.animationPlayState = 'running';
      } else {
        bar.style.animationPlayState = 'paused';
        bar.style.height = '4px';
      }
    });
  }

  setVolume(val) {
    this.volume = val;
    if (this.audio) this.audio.volume = val;
    this.isMuted = (val === 0);
    VolumeState.save(val);
    this._updateMuteIcon();
    const pctEl = this.volumeSlider?.nextElementSibling;
    if (pctEl?.tagName === 'SPAN') pctEl.textContent = Math.round(val * 100) + '%';
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    const vol    = this.isMuted ? 0 : this.volume;
    if (this.audio) this.audio.volume = vol;
    if (window.floatingPlayer) {
      if (window.floatingPlayer.fpVolume) window.floatingPlayer.fpVolume.value = vol;
      window.floatingPlayer._updateMuteIcon(vol);
    }
    this._updateMuteIcon();
  }

  _onPlaying() {
    this.isPlaying = true;
    this._updatePlayUI();
    this._setStatus('EN DIRECT', 'live');
    this._setupVisualizer();
    this._setupMediaSession();

    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing';
    }

    // Persistance cross-page : on met à jour le flag
    RadioState.save({ isPlaying: true, volume: this.volume });

    const prog = getCurrentProgram();
    if (this.nowTitle)  this.nowTitle.textContent  = `${prog.emoji} ${prog.title}`;
    if (this.nowArtist) this.nowArtist.textContent = prog.subtitle;

    if (window.floatingPlayer) {
      const title = this.nowTitle?.textContent || `${prog.emoji} ${prog.title}`;
      window.floatingPlayer.attach(this, title, '📡 EN DIRECT', '📻');
    }
  }

  _onPaused() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this._updatePlayUI();
    this._animateVizCSS(false);
    this._setStatus('◼ EN PAUSE', 'paused');
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
    // Mettre à jour le floating player
    if (window.floatingPlayer?.currentPlayer === this && window.floatingPlayer.fpSubtitle) {
      window.floatingPlayer.fpSubtitle.textContent = '◼ EN PAUSE';
    }
  }

  _onError(e) {
    if (!this.isPlaying) return;
    this._setStatus('⚠ CONNEXION PERDUE', 'error');
    this._animateVizCSS(false);
    RadioState.clear();
    // Mettre à jour le floating player
    if (window.floatingPlayer?.currentPlayer === this && window.floatingPlayer.fpSubtitle) {
      window.floatingPlayer.fpSubtitle.textContent = '⚠ CONNEXION PERDUE';
    }
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (!isIOS) {
      setTimeout(() => { if (this.isPlaying) this.play(); }, 4000);
    } else {
      this.isPlaying = false;
      this._updatePlayUI();
    }
  }

  _onBuffering() {
    this._setStatus('⟳ CHARGEMENT :<br>Veuillez patienter', 'buffering');
    // Mettre à jour le floating player
    if (window.floatingPlayer?.currentPlayer === this && window.floatingPlayer.fpSubtitle) {
      window.floatingPlayer.fpSubtitle.textContent = '⟳ CHARGEMENT…';
    }
  }

  _updatePlayUI() {
    if (this.playIcon) this.playIcon.textContent = this.isPlaying ? '⏸' : '▶';
    this.playBtn?.setAttribute('aria-label', this.isPlaying ? 'Pause' : 'Lecture');
    this.playBtn?.classList.toggle('playing', this.isPlaying);
  }
  _updateMuteIcon() {
    if (this.muteBtn) this.muteBtn.textContent = this.isMuted ? '🔇' : '🔊';
  }
  _setStatus(msg, type) {
    if (!this.statusEl) return;
    this.statusEl.innerHTML = msg;
    this.statusEl.className = 'stream-status status-' + type;
  }
}

/* ══════════════════════════════════════════════════════════
   MINI PLAYER (Podcasts)
   ══════════════════════════════════════════════════════════ */
class MiniPlayer {
  constructor(container) {
    this.container   = container;
    this.audio       = new Audio();
    this.isPlaying   = false;
    this.src         = container.dataset.src || '';
    this.duration    = container.dataset.duration || '0:00';
    this._simRunning = false;

    this.playBtn      = container.querySelector('.play-btn-mini');
    this.progress     = container.querySelector('.progress-bar');
    this.progressWrap = container.querySelector('.progress-bar-wrap');
    this.timeEl       = container.querySelector('.time-display');

    const card    = container.closest('.card, .podcast-card, article');
    this._title   = card?.querySelector('.card-title')?.textContent.trim() || 'Podcast JoyStick FM';
    this._emoji   = card?.querySelector('.card-thumb')?.textContent.trim() || '🎵';

    this.audio.volume = VolumeState.load();
    PlayerRegistry.register(this);
    this._bindEvents();
  }

  _bindEvents() {
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => this.toggle());
      this.playBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.toggle();
      }, { passive: false });
    }

    this.progressWrap?.addEventListener('click', (e) => {
      const audio = this._realAudio || (this.audio instanceof HTMLAudioElement ? this.audio : null);
      if (!audio?.duration || isNaN(audio.duration)) return;
      const rect = this.progressWrap.getBoundingClientRect();
      const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audio.currentTime = pct * audio.duration;
      this._syncProgress();
      window.floatingPlayer?._tick();
    });

    // Touch seek sur mobile
    this.progressWrap?.addEventListener('touchstart', (e) => {
      if (!e.touches[0]) return;
      const audio = this._realAudio || (this.audio instanceof HTMLAudioElement ? this.audio : null);
      if (!audio?.duration || isNaN(audio.duration)) return;
      const rect = this.progressWrap.getBoundingClientRect();
      const pct  = Math.max(0, Math.min(1, (e.touches[0].clientX - rect.left) / rect.width));
      audio.currentTime = pct * audio.duration;
      this._syncProgress();
    }, { passive: true });

    this._bindAudioEvents();
  }

  _bindAudioEvents() {
    this.audio.addEventListener('loadedmetadata', () => {
      if (!this.audio.duration || isNaN(this.audio.duration)) return;
      const dur = formatTime(this.audio.duration);
      this.duration = dur;
      if (this.timeEl) this.timeEl.textContent = '0:00 / ' + dur;
      const badge = this.container.closest('.card, article')?.querySelector('.podcast-duration');
      if (badge) badge.textContent = '🕐 ' + dur;
    });

    this.audio.addEventListener('timeupdate', () => this._updateProgress());
    this.audio.addEventListener('ended',      () => this._onEnded());
    this.audio.addEventListener('pause',      () => {
      if (!this._simRunning) { this.isPlaying = false; if (this.playBtn) this.playBtn.textContent = '▶'; }
    });
    this.audio.addEventListener('playing', () => {
      this.audio.volume = VolumeState.load();
      this.isPlaying = true;
      if (this.playBtn) this.playBtn.textContent = '⏸';
      window.floatingPlayer?.attach(this, this._title, 'JoyStick FM Podcast', this._emoji);
    });
  }

  _syncProgress() {
    const audio = this._realAudio || (this.audio instanceof HTMLAudioElement ? this.audio : null);
    if (!audio?.duration || isNaN(audio.duration)) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    if (this.progress) this.progress.style.width = pct + '%';
    if (this.timeEl)   this.timeEl.textContent   = formatTime(audio.currentTime) + ' / ' + formatTime(audio.duration);
  }

  toggle() {
    if (this.isPlaying) {
      if (this._simRunning) this._stopSim();
      else this.audio.pause();
    } else {
      PlayerRegistry.stopAll(this);
      if (this.src) {
        if (!this.audio.src || this.audio.src === window.location.href) {
          this.audio.src    = this.src;
          this.audio.volume = VolumeState.load();
        }
        this.audio.play().catch(() => this._startSim());
      } else {
        this._startSim();
      }
    }
  }

  forceStop()    { this._doStop(false); }
  resetAndStop() { this._doStop(true);  }

  _doStop(reset) {
    if (this._simRunning) this._stopSim();
    const audioToStop = this._realAudio instanceof HTMLAudioElement ? this._realAudio : this.audio;
    if (audioToStop instanceof HTMLAudioElement) {
      if (!audioToStop.paused) audioToStop.pause();
      audioToStop.src = '';
      audioToStop.load();
    }
    if (this._realAudio) { this.audio = this._realAudio; this._realAudio = null; }
    this._fakeAudio = null;
    this.isPlaying  = false;
    if (this.playBtn) this.playBtn.textContent = '▶';
    if (reset) {
      if (this.progress) this.progress.style.width = '0%';
      if (this.timeEl)   this.timeEl.textContent   = '0:00 / ' + this.duration;
      this.audio = new Audio();
      this.audio.volume = VolumeState.load();
      this._bindAudioEvents();
    }
  }

  _startSim() {
    this._stopSim();
    const parts  = this.duration.split(':').map(Number);
    const totalS = ((parts[0] || 0) * 60 + (parts[1] || 0)) || 120;
    let elapsed  = 0;
    const fake = { currentTime: 0, duration: totalS, paused: false, volume: VolumeState.load(), ended: false };
    this._fakeAudio = fake;
    this._realAudio = this.audio;
    this.audio      = fake;
    this.isPlaying   = true;
    this._simRunning = true;
    if (this.playBtn) this.playBtn.textContent = '⏸';
    window.floatingPlayer?.attach(this, this._title, 'JoyStick FM Podcast', this._emoji);
    this._simInterval = setInterval(() => {
      if (!this._simRunning) { clearInterval(this._simInterval); return; }
      elapsed++;
      fake.currentTime = elapsed;
      fake.volume = VolumeState.load();
      const pct = Math.min(100, (elapsed / totalS) * 100);
      if (this.progress) this.progress.style.width = pct + '%';
      if (this.timeEl)   this.timeEl.textContent   = formatTime(elapsed) + ' / ' + this.duration;
      if (elapsed >= totalS) this._onEnded();
    }, 1000);
  }

  _stopSim() {
    this._simRunning = false;
    clearInterval(this._simInterval);
    if (this._fakeAudio) this._fakeAudio.paused = true;
    if (this._realAudio) { this.audio = this._realAudio; this._realAudio = null; }
    this._fakeAudio = null;
    this.isPlaying  = false;
    if (this.playBtn) this.playBtn.textContent = '▶';
  }

  _updateProgress() {
    if (!this.audio?.duration || isNaN(this.audio.duration)) return;
    const pct = (this.audio.currentTime / this.audio.duration) * 100;
    if (this.progress) this.progress.style.width = pct + '%';
    if (this.timeEl)   this.timeEl.textContent   = formatTime(this.audio.currentTime) + ' / ' + formatTime(this.audio.duration);
  }

  _onEnded() {
    this._stopSim();
    this.isPlaying = false;
    if (this.playBtn) this.playBtn.textContent = '▶';
    if (this.progress) this.progress.style.width = '0%';
    if (this.timeEl)   this.timeEl.textContent   = '0:00 / ' + this.duration;
    if (window.floatingPlayer?.currentPlayer === this) {
      SessionState.clear();
      window.floatingPlayer.hide();
    }
  }
}

/* ══════════════════════════════════════════════════════════
   INITIALISATION
   ══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  window.floatingPlayer = new FloatingPlayer();

  if (document.getElementById('main-play-btn')) {
    // Page Radio : créer le RadioPlayer
    // Si un podcast était en cours et que la radio n'est PAS active, restaurer le podcast
    const savedPodcast = SessionState.load();
    const savedRadio   = RadioState.load();

    window.radioPlayer = new RadioPlayer();
    updateScheduleHighlight();
    setInterval(updateScheduleHighlight, 60000);

    if (!savedRadio?.isPlaying && savedPodcast?.isPlaying && savedPodcast.src) {
      // Restaurer le podcast cross-page sur la page radio
      setTimeout(() => {
        window.floatingPlayer?.restoreFromState(savedPodcast);
      }, 300);
    }
  } else {
    // Sur les pages sans radio player, on vérifie si la radio ou un podcast doit reprendre
    // Priorité au podcast (SessionState) puis à la radio (RadioState)
    const savedPodcast = SessionState.load();
    const savedRadio   = RadioState.load();
    if (savedPodcast?.isPlaying && savedPodcast.src) {
      setTimeout(() => {
        window.floatingPlayer?.restoreFromState(savedPodcast);
      }, 300);
    } else if (savedRadio?.isPlaying) {
      // Radio active mais on n'est pas sur la page radio :
      // Créer un flux cross-page et l'afficher dans le floating player
      const prog = getCurrentProgram();
      if (window.floatingPlayer) {
        window.floatingPlayer._crossPageActive = true;
        const audio = new Audio();
        const STREAM_URL = window.location.origin + '/radio-stream.mp3';
        audio.src    = STREAM_URL;
        audio.volume = VolumeState.load();
        audio.preload = 'auto';
        window.floatingPlayer._crossPageAudio = audio;
        window.floatingPlayer.currentPlayer   = null;
        if (window.floatingPlayer.fpTitle)    window.floatingPlayer.fpTitle.textContent    = `${prog.emoji} ${prog.title}`;
        if (window.floatingPlayer.fpSubtitle) window.floatingPlayer.fpSubtitle.textContent = '⟳ CHARGEMENT…';
        if (window.floatingPlayer.fpEmoji)    window.floatingPlayer.fpEmoji.textContent    = '📻';
        audio.addEventListener('playing', () => {
          if (window.floatingPlayer.fpSubtitle) window.floatingPlayer.fpSubtitle.textContent = '📡 EN DIRECT';
        }, { once: true });
        audio.addEventListener('waiting', () => {
          if (window.floatingPlayer.fpSubtitle) window.floatingPlayer.fpSubtitle.textContent = '⟳ CHARGEMENT…';
        });
        audio.play().catch(() => {});
        window.floatingPlayer.show();
        window.floatingPlayer._startTick();
      }
    }
  }

  document.querySelectorAll('.audio-player-mini').forEach(container => {
    container._playerInstance = new MiniPlayer(container);
  });

  preloadDurations();

  // Slider volume principal : application du volume stocké
  const mainSlider = document.getElementById('volume-slider');
  if (mainSlider) {
    const vol = VolumeState.load();
    mainSlider.value = vol;
    const pctEl = mainSlider.nextElementSibling;
    if (pctEl?.tagName === 'SPAN') pctEl.textContent = Math.round(vol * 100) + '%';
  }
});