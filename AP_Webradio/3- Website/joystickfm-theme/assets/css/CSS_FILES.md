# CSS_FILES.md — JoyStick FM
> Dernière mise à jour : v8.7

Inventaire complet des fichiers CSS du projet.
Ordre de chargement WordPress : `style.css` → `animations.css` → `responsive.css` → `xp-bar-styles.css`

---

## 🎨 Variables globales (`:root` — `style.css`)

### Palette de couleurs

| Variable | Valeur | Usage |
|---|---|---|
| `--noir` | `#0a0a0f` | Fond principal |
| `--noir-card` | `#12121a` | Fond des cards |
| `--noir-border` | `#1e1e2e` | Bordures subtiles |
| `--bleu-neon` | `#00f5ff` | Accent principal |
| `--violet` | `#b44fff` | Accent secondaire |
| `--violet-dark` | `#7b2fbf` | Violet foncé |
| `--rose-neon` | `#ff2d78` | Accent tertiaire / erreurs |
| `--vert-neon` | `#39ff14` | Succès / Easter Eggs XP |
| `--texte` | `#c8c8d4` | Texte courant |
| `--texte-dim` | `#6b6b7f` | Texte atténué / métadonnées |
| `--blanc` | `#f0f0ff` | Texte titres |

### Typographie

| Variable | Valeur |
|---|---|
| `--font-pixel` | `'VT323', monospace` |
| `--font-tech` | `'Orbitron', sans-serif` |
| `--font-mono` | `'Share Tech Mono', monospace` |

### Effets lumineux

| Variable | Usage |
|---|---|
| `--glow-bleu` | `0 0 8px var(--bleu-neon), 0 0 20px ...` |
| `--glow-violet` | Halo violet |
| `--glow-rose` | Halo rose |

### Autres

| Variable | Valeur |
|---|---|
| `--transition` | `0.3s cubic-bezier(0.4,0,0.2,1)` |
| `--radius` | `8px` |
| `--radius-lg` | `16px` |
| `--fp-height` | `72px` (hauteur floating player) |

---

## 📄 Fichiers — `assets/css/`

---

### `style.css`

Styles principaux — ~1100 lignes.

| Section | Contenu |
|---|---|
| Imports Google Fonts | VT323, Orbitron, Share Tech Mono |
| Variables CSS | Voir tableau ci-dessus |
| Reset | `box-sizing`, `html`, `body`, `overflow-x` |
| Scrollbar gaming | Thumb violet avec glow |
| Sélection texte | Fond violet |
| Scanline overlay | `body::before` — lignes horizontales subtiles |
| `main` | `padding-bottom` dynamique (floating player) |
| Typographie | h1–h6, `p`, `a`, `.pixel-label` |
| Layout | `.container`, `.section`, `.section-title`, `.neon-text-*` |
| Header / Nav | `.nav-container`, `.logo`, `nav ul li a`, `.live-badge`, `.burger` |
| Hero | `.hero`, `.hero-content`, `.hero-title`, `.hero-stats`, `.stat-item` |
| Boutons | `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost` |
| Cards | `.card`, `.card-body`, `.card-title`, `.card-meta`, `.card-tag`, tags |
| Podcast cards | `.podcast-grid`, `.podcast-card`, `.audio-player-mini`, `.play-btn-mini` |
| Blog | `.blog-grid`, `.article-img`, `#article-body img` |
| Page Radio | `.radio-player-main`, `.radio-visualizer`, `.viz-bar`, `.now-playing`, `.radio-controls`, `.play-btn-main`, `.volume-row` |
| Formulaire contact | `.form-group`, `.error-msg`, états `.invalid` / `.valid` |
| Footer | `.footer-grid`, `.footer-brand`, `.footer-col`, `.footer-bottom` |
| Console boot | `#console-boot`, `.boot-logo`, `.boot-bar-wrap`, `.boot-bar` |
| Easter Egg modal | `#easter-egg-modal`, `.egg-content`, `.egg-close` |
| Filter pills | `.filter-pills`, `.filter-pill` |
| Floating Player | `.floating-player`, `.fp-info`, `.fp-center`, `.fp-right`, `.fp-progress-wrap` |

---

### `animations.css`

Keyframes et classes utilitaires — ~200 lignes.

| Keyframe | Usage |
|---|---|
| `blink` | Curseur/dot LIVE |
| `livePulse` | Badge LIVE |
| `logoPulse` | Logo nav |
| `gridScroll` | Grille hero |
| `rotateBg` | Fond radial radio player |
| `vizBounce` | Barres visualiseur |
| `eggPop` | Apparition modal Easter Egg |
| `slideUp` | Entrée depuis le bas |
| `fadeIn` | Fondu entrant |
| `glitch1` / `glitch2` | Effet glitch texte |
| `neonFlicker` | Scintillement texte néon |
| `spin` | Loader spinner |
| `eq1` / `eq2` / `eq3` | Égaliseur 3 barres |
| `floatParticle` | Particules hero |

| Classe utilitaire | Usage |
|---|---|
| `.animate-slide-up` | Animation slideUp 0.6s |
| `.animate-fade-in` | Animation fadeIn 0.5s |
| `.animate-neon` | Scintillement néon 8s |
| `.animate-glitch` | Effet glitch avec pseudo-éléments |
| `.stagger-children > *` | Entrée décalée 0.1s–0.6s |
| `.neon-underline` | Soulignement néon au hover |
| `.spinner` | Loader rotatif |
| `.success-icon` | Icône succès formulaire |
| `.pixel-particle` | Particule décorative hero |

---

### `responsive.css`

Adaptation mobile-first complète — 22 sections, ~600 lignes.

| Section | Breakpoints couverts |
|---|---|
| 0. Reset anti-débordement | Global |
| 1. Container | Global |
| 2. Typographie fluide | ≤768px, ≤480px |
| 3. Navigation header | ≤768px (burger, menu déroulant) |
| 4. Hero section | ≤768px, ≤480px |
| 5. Sections — espacements | ≤768px, ≤480px |
| 6. Boutons | ≤480px |
| 7. Cards — grilles | ≤1024px, ≤599px, ≤768px |
| 8. Blog — article une + modale | ≤768px, ≤480px |
| 9. Mini lecteur audio | ≤599px, ≤480px |
| 10. Filtres podcasts | ≤480px (scroll horizontal) |
| 11. Page Radio | ≤768px, ≤480px |
| 12. Contact | ≤768px, ≤480px |
| 13. Plan du site | ≤768px, ≤480px |
| 14. Mentions légales / Politique | ≤768px, ≤480px |
| 15. Floating Player | Variables CSS par breakpoint (72/88/78/64px) |
| 16. Footer | ≤768px, ≤480px |
| 17. Console boot | ≤480px |
| 18. Easter Egg modal | ≤480px |
| 19. Pagination | ≤480px |
| 20. Divers mobile | ≤768px, ≤480px, `hover:none` |
| 21. Grilles inline-style | ≤599px |
| 22. Print | `@media print` |

---

### `xp-bar-styles.css`

Barre XP style Minecraft authentique pour le suivi des Easter Eggs — ~200 lignes.

| Composant | Description |
|---|---|
| Import Google Fonts | Press Start 2P (chiffres Minecraft) |
| `.egg-xp-container` | Conteneur global dans le footer |
| `.egg-xp-header` | En-tête : titre + compteur "X / 18" |
| `.egg-xp-track` | Fond noir + bordures pixel-art + texture quadrillée |
| `.egg-xp-fill` | Dégradé vert Minecraft + reflet + ombre + animation `xpGain` |
| `.egg-xp-fill.xp-flash` | Flash lumineux lors d'un gain XP |
| `.egg-xp-fill.max-level` | Animation `rainbow-flicker` quand 18/18 atteint |
| `.egg-xp-wrap::after` | Ombre portée gris-vert style Minecraft |
| `.egg-xp-footer` | Pourcentage complété |
| `.egg-xp-label` | Texte vert Minecraft avec text-shadow |
| Responsive `≤480px` | Track 9px, polices réduites |

---

## 📐 Recommandations

- **Ordre de chargement strict** : toujours charger dans l'ordre `style.css` → `animations.css` → `responsive.css` → `xp-bar-styles.css`
- **GPU accélération** : `.floating-player`, `.egg-xp-fill`, `.pixel-particle`, `.btn` ont `will-change: transform, opacity` + `transform: translateZ(0)`
- **Polices Google Fonts** : chargées via `@import` dans `style.css` (VT323, Orbitron, Share Tech Mono) et `xp-bar-styles.css` (Press Start 2P)
- **Variables CSS** : toutes les couleurs et effets sont centralisés dans `:root` — modifier `style.css` pour changer le thème global
