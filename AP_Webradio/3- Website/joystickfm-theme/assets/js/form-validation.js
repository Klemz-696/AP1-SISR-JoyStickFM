/* ============================================
   JOYSTICK FM — form-validation.js
   Validation formulaire contact, messages d'erreur
   dynamiques, envoi fictif avec confirmation
   ============================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  /* ── Règles de validation ── */
  const RULES = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 60,
      messages: {
        required:  'Veuillez entrer votre pseudo / nom.',
        minLength: 'Minimum 2 caractères requis.',
        maxLength: 'Maximum 60 caractères.',
      }
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      messages: {
        required: 'L\'adresse email est obligatoire.',
        pattern:  'Format d\'email invalide. Ex : gamer@joystick.fm',
      }
    },
    subject: {
      required: true,
      messages: {
        required: 'Veuillez choisir un sujet.',
      }
    },
    message: {
      required: true,
      minLength: 20,
      maxLength: 1000,
      messages: {
        required:  'Le message est obligatoire.',
        minLength: 'Votre message doit contenir au moins 20 caractères.',
        maxLength: 'Maximum 1000 caractères.',
      }
    }
  };

  /* ── Référence des champs ── */
  const fields = {
    name:    form.querySelector('#field-name'),
    email:   form.querySelector('#field-email'),
    subject: form.querySelector('#field-subject'),
    message: form.querySelector('#field-message'),
  };

  /* ── Valide un champ unique ── */
  function validateField(name, value) {
    const rules = RULES[name];
    if (!rules) return null;

    value = value.trim();

    if (rules.required && !value) return rules.messages.required;
    if (value && rules.minLength && value.length < rules.minLength) return rules.messages.minLength;
    if (value && rules.maxLength && value.length > rules.maxLength) return rules.messages.maxLength;
    if (value && rules.pattern && !rules.pattern.test(value)) return rules.messages.pattern;

    return null; // Pas d'erreur
  }

  /* ── Affiche / efface une erreur ── */
  function showError(name, msg) {
    const group = form.querySelector(`[data-group="${name}"]`);
    if (!group) return;
    const errEl = group.querySelector('.error-msg');
    group.classList.add('invalid');
    group.classList.remove('valid');
    if (errEl) errEl.textContent = msg;
  }

  function clearError(name) {
    const group = form.querySelector(`[data-group="${name}"]`);
    if (!group) return;
    const errEl = group.querySelector('.error-msg');
    group.classList.remove('invalid');
    group.classList.add('valid');
    if (errEl) errEl.textContent = '';
  }

  function resetField(name) {
    const group = form.querySelector(`[data-group="${name}"]`);
    if (!group) return;
    group.classList.remove('invalid', 'valid');
  }

  /* ── Validation en temps réel (blur + input) ── */
  Object.keys(fields).forEach(name => {
    const el = fields[name];
    if (!el) return;

    // Validation au départ du champ
    el.addEventListener('blur', () => {
      const err = validateField(name, el.value);
      if (err) showError(name, err);
      else clearError(name);
    });

    // Nettoyage de l'erreur pendant la saisie
    el.addEventListener('input', () => {
      const group = form.querySelector(`[data-group="${name}"]`);
      if (group?.classList.contains('invalid')) {
        const err = validateField(name, el.value);
        if (!err) clearError(name);
      }
      // Compteur caractères (message)
      if (name === 'message') {
        const counter = form.querySelector('#msg-counter');
        if (counter) {
          const len = el.value.length;
          counter.textContent = `${len} / 1000`;
          counter.style.color = len < 20  ? 'var(--rose-neon)'
                              : len > 900 ? '#ffa500'
                              : 'var(--texte-dim)';
        }
      }
    });
  });

/* ── Soumission ── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    // Valide tous les champs
    Object.keys(fields).forEach(name => {
      const el  = fields[name];
      if (!el) return;
      const err = validateField(name, el.value);
      if (err) { showError(name, err); isValid = false; }
      else     { clearError(name); }
    });

    if (!isValid) {
      // Scroll vers la première erreur
      const firstError = form.querySelector('.invalid');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      _playErrorSound();
      return;
    }

    // Appelle la fonction d'envoi si tout est valide
    _submitForm();
  });

  /* ── Envoi Réel via Formspree ── */
  function _submitForm() {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> ENVOI EN COURS...';
    }

    const formData = new FormData(form);

    fetch(form.action, {
      method: form.method,
      body: formData,
      headers: { 'Accept': 'application/json' }
    }).then(response => {
      if (response.ok) {
        _showSuccess();
      } else {
        alert("Erreur lors de l'envoi. Vérifiez votre connexion.");
        if(submitBtn){
            submitBtn.disabled = false;
            submitBtn.innerHTML = '▶ ENVOYER LE MESSAGE';
        }
      }
    }).catch(error => {
      alert("Problème réseau : " + error);
      if(submitBtn) submitBtn.disabled = false;
    });
  }

  /* ── Message de succès ── */
  function _showSuccess() {
    const formContainer = document.getElementById('form-container');
    const successEl     = document.getElementById('form-success');

    if (formContainer) formContainer.style.display = 'none';
    if (successEl)     successEl.style.display     = 'flex';

    // Reset formulaire en arrière-plan
    form.reset();
    Object.keys(fields).forEach(name => resetField(name));

    _playSuccessSound();
  }

  /* ── Sons feedback ── */
  function _playErrorSound() {
    try {
      const ctx  = new (window.AudioContext || window.webkitAudioContext)();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } catch(e) {}
  }

  function _playSuccessSound() {
    try {
      const ctx   = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.07, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.15);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.2);
      });
    } catch(e) {}
  }
});