# JS_FILES.md — JoyStick FM
> Dernière mise à jour : v8.7

Inventaire complet des fichiers JavaScript du projet.
Tous les scripts sont en mode `'use strict'` et chargés en **footer** (WordPress `wp_enqueue_script`).

---

## 📦 Ordre de chargement (footer.php / functions.php)

```
1. easter-eggs.js     (dépendance : aucune)
2. radio-player.js    (dépendance : easter-eggs.js)
3. main.js            (dépendance : radio-player.js)
4. dvd-bouncer.js     (dépendance : easter-eggs.js)
5. form-validation.js (chargé uniquement sur page-contact.php)
```

---

## 📄 Fichiers — `assets/js/`

---

### `easter-eggs.js` — v8.7

Système complet de 18 easter eggs avec suivi de progression.

| Composant | Description |
|---|---|
| `EGG_TRACKER` | Module IIFE — suivi sessionStorage, mise à jour XP bar, pop-up finale 18/18 |
| `_playAudio()` | Lecture audio standard (desktop) |
| `_playAudioIOS()` | Lecture audio iOS via `fetch() + AudioContext.decodeAudioData()` (eggs 12 & 13) |
| `_patchIOSSlider()` | Patch touch events sur `<input type="range">` pour iOS |
| `_beep()` | Fallback synthétique Web Audio API si fichier MP3 manquant |
| `_bootAudioRegistry` | Gestion du son pendant l'écran boot (s'arrête à la fermeture) |
| `_onClick()` | Utilitaire multi-clic sur sélecteur CSS |
| `triggerKonamiEgg()` | Egg 1 — appelée depuis `main.js` |
| Eggs 2–18 | IIFEs autonomes avec listeners attachés au DOM |

**Easter Eggs implémentés :**

| # | ID | Déclencheur |
|---|---|---|
| 1 | `konami` | `triggerKonamiEgg()` depuis main.js |
| 2 | `rickroll` | 5× clic `.logo` (hors `.logo-icon`) |
| 3 | `nyan` | 3× clic `.schedule-time` / `.schedule-hours` |
| 4 | `mario` | 5× clic `.schedule-show-title` / `.schedule-title` |
| 5 | `doom` | 5× clic `.logo-icon` |
| 6 | `hadouken` | 3× clic `.footer-col` |
| 7 | `pokemon` | 4× clic `.card-thumb` / `.podcast-cover` etc. |
| 8 | `fnaf` | 1× clic `#fnaf-nose` |
| 9 | `zelda` | Double-clic `#footer-credits` |
| 10 | `sonic` | Survol 1,5s `nav a` |
| 11 | `tkburger` | 15× clic `#main-play-btn` |
| 12 | `affiche` | Maintien 5s sur `#popup-affiche img` |
| 13 | `weeee` | 5× clic `#mute-btn` |
| 14 | `67` | 1× clic `#boot-version` |
| 15 | `klemz` | 1× clic `#boot-klemz` |
| 16 | `steakman` | 1× clic `#boot-steakman` |
| 17 | `pingouy` | 1× clic `#boot-pingouy` |
| 18 | `krembrule` | 1× clic `#boot-krembrule` |

---

### `radio-player.js` — v6.5

Lecteur radio Icecast + mini-lecteurs podcasts + floating player persistant.

| Classe / Module | Description |
|---|---|
| `patchIOSSlider()` | Rend les sliders `<input type="range">` fonctionnels sur iOS |
| `formatTime()` | Formatage mm:ss |
| `PlayerRegistry` | Registre global — `stopAll()` garantit qu'un seul audio joue à la fois |
| `VolumeState` | Persistance du volume via `sessionStorage` |
| `SessionState` | Persistance de la piste podcast cross-page |
| `RadioState` | Persistance de l'état de la radio cross-page |
| `FloatingPlayer` | Barre audio fixe en bas de page — seek avec drag, gestion volume iOS |
| `RadioPlayer` | Lecteur Icecast — Web Audio API, Media Session API, Reverse Proxy |
| `MiniPlayer` | Mini-lecteurs podcast — fallback simulation si audio indisponible |
| `preloadDurations()` | Précharge les durées audio via `<audio preload="metadata">` |
| `PROGRAMME` | Tableau des émissions — mise en évidence automatique selon l'heure |

---

### `main.js` — v6.5

Point d'entrée principal — initialisation de l'interface.

| Fonction | Description |
|---|---|
| `initBoot()` | Console boot animée — barre de progression + messages séquentiels + bouton START |
| `initNav()` | Navigation responsive — burger menu, fermeture au clic extérieur |
| `initKonami()` | Konami Code clavier — ↑↑↓↓←→←→BA |
| `initKonamiMobile()` | Konami Code tactile — 8 swipes directionnels + 2 taps rapides + indicateur visuel |
| `initScrollAnimations()` | IntersectionObserver — animation slideUp au scroll |
| `initHeaderScroll()` | Classe `.scrolled` sur le header après 40px de scroll |
| `initParticles()` | 12 particules pixel colorées dans la section hero |
| `initCursorAura()` | Curseur aura néon flou (desktop uniquement — ignoré sur touch) |

---

### `dvd-bouncer.js` — v1.0

Fonctionnalité décorative — logo DVD rebondissant en arrière-plan.

| Composant | Description |
|---|---|
| Canvas `#dvd-bouncer-canvas` | Canvas fixe `z-index:0`, `opacity:0.18`, derrière tout le contenu |
| Boucle `drawLogo()` | `requestAnimationFrame` — 1,4 px/frame, rebonds 4 bords, changement de couleur néon |
| `isInCorner()` | Détection coin (2 bords simultanés, tolérance 4px) |
| `triggerCornerEffect()` | Effet "Retour vers le Futur" : flash, lignes de vitesse, "88 MPH !", image + son |
| Overlay `#dvd-corner-overlay` | `z-index:99996` — flash, image `tk-dvd.jpeg`, texte "88 MPH !" |
| Animations CSS injectées | `dvdFlash`, `dvdLightning`, `dvdImgIn`, `dvdImgOut`, `dvdGlow`, `dvdSpeedLine`, `dvdMph` |
| `visibilitychange` | Pause automatique quand l'onglet est en arrière-plan (économie CPU) |
| `MutationObserver` | Attend la fin du boot screen avant de démarrer (page accueil) |
| Cooldown | 90 frames (~1,5s) empêchent le re-déclenchement immédiat |

**Configuration :**
```javascript
const SPEED_BASE  = 1.4;   // px/frame
const LOGO_SIZE   = 80;    // px
const CORNER_ZONE = 4;     // px de tolérance coin
const COLORS = ['#00f5ff', '#b44fff', '#ff2d78', '#39ff14', '#ffa500', '#ffff00', '#ff6b35', '#00bfff'];
```

---

### `form-validation.js`

Validation du formulaire de contact (chargé uniquement sur `page-contact.php`).

| Composant | Description |
|---|---|
| `RULES` | Règles de validation par champ (required, minLength, maxLength, pattern) |
| Validation temps réel | `blur` → validation, `input` → nettoyage erreur + compteur caractères |
| Soumission | Validation complète → `fetch()` vers Formspree → affichage succès |
| Honeypot | Champ `#website` caché — si rempli = bot détecté |
| Sons feedback | `_playErrorSound()` (sawtooth) + `_playSuccessSound()` (notes do-mi-sol-do) |

---

## 📐 Variables globales exposées

| Variable | Définie dans | Valeur |
|---|---|---|
| `window.THEME_URI` | `header.php` + `footer.php` | URL du thème WordPress |
| `window.floatingPlayer` | `radio-player.js` | Instance `FloatingPlayer` |
| `window.radioPlayer` | `radio-player.js` | Instance `RadioPlayer` (page radio uniquement) |
| `window.jfmStopBootAudio` | `easter-eggs.js` | Arrête les sons du boot screen |
| `triggerKonamiEgg` | `easter-eggs.js` | Fonction globale appelée par `main.js` |
