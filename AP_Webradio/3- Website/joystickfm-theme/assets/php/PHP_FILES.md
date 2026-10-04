# PHP_FILES.md — JoyStick FM
> Dernière mise à jour : v8.7

Inventaire complet des fichiers PHP du projet (thème WordPress + assets PHP).

---

## 📄 Templates WordPress (racine du thème)

### `front-page.php`
Page d'accueil statique WordPress (`is_front_page()`).

| Composant | Description |
|---|---|
| Section hero | Titre animé, sous-titre, 4 boutons CTA, stats (auditeurs live, podcasts, articles, 24/7) |
| Section podcasts | 3 derniers podcasts avec cards et tags |
| Section blog | 3 dernières actus gaming |
| Section CTA radio | Lien direct vers la page d'écoute |
| Popup affiche | `#popup-affiche` — overlay avec `affiche.png`, ouverture/fermeture JS |
| Compteur auditeurs | Appel AJAX toutes les 10s vers `icecast-proxy.php` |

### `page-radio.php`
Template `/* Template Name: Page Radio */`

| Composant | Description |
|---|---|
| Lecteur principal | `#main-play-btn`, statut flux, compteur auditeurs, visualiseur CSS, "En ce moment" |
| Infos flux | Tableau Icecast : format MP3 128 kbps, 44 100 Hz, mount `/joystick-fm` |
| Programme du jour | 6 créneaux horaires avec mise en évidence dynamique (JS) |

### `page-podcasts.php`
Template `/* Template Name: Page Podcasts */`

| Composant | Description |
|---|---|
| Filtres | Pills de filtre par catégorie (Tous / Théories / Humour / Débats / Rétro / Gaming) |
| 3 podcasts | Cards avec mini-lecteurs HTML5 (`data-src`, `data-duration`) |
| "Aucun résultat" | `#no-results` affiché si filtre vide |
| Script inline | Filtrage des cards par `data-category` |

### `page-blog.php`
Template `/* Template Name: Page Blog */`

| Composant | Description |
|---|---|
| Article à la une | `grid-column: 1/-1` — article OST avec bouton "Lire" |
| 5 articles | Cards avec boutons "Lire →" |
| Modal lecture | `#article-modal` — contenu injecté dynamiquement via JS |
| 6 articles ARTICLES | Objet JS avec contenu HTML complet (images, vidéos YouTube) |
| Fermeture modal | Arrête les vidéos YouTube (`body.innerHTML = ''`) |

### `page-contact.php`
Template `/* Template Name: Page Contact */`

| Composant | Description |
|---|---|
| Formulaire Formspree | `action="https://formspree.io/f/xjgelqpw"` — envoi réel via fetch |
| Champs | Nom, Email, Sujet (select), Message (textarea + compteur) |
| Honeypot | `#website` — champ invisible anti-spam |
| Message succès | `#form-success` — affiché après envoi réussi |
| FAQ | 3 accordéons `<details>` |
| Infos contact | Flux radio, email, école |

### `page-mentions-legales.php`
Template `/* Template Name: Mentions Légales */`

Conforme LCEN art. 6-III et 19. Contient :
- Éditeur du site (BTS SIO TS1, Lycée Sidoine Apollinaire)
- Hébergement et infrastructure (VMware, 3 VMs)
- Propriété intellectuelle (GPL, marques)
- Limitation de responsabilité

### `page-politique-confidentialite.php`
Template `/* Template Name: Politique de Confidentialité */`

Conforme RGPD (Règlement UE 2016/679). Contient :
- Responsable du traitement
- Données collectées (formulaire Formspree, Icecast, sessionStorage)
- Cookies (aucun cookie publicitaire)
- Droits des utilisateurs (accès, rectification, effacement, opposition, portabilité)
- Sécurité des données

### `page-plan-du-site.php`
Template `/* Template Name: Plan du Site */`

Contient :
- Statistiques du projet (7 pages, 18 Easter Eggs, 3 podcasts, 6 articles, 3 VMs)
- Arborescence des pages principales + légales
- Stack technique (Front-end, Back-end, Streaming, Réseau/Sécurité)
- Infrastructure réseau (3 VMs avec IPs et rôles)
- Tableau des 10 Easter Eggs visibles (les 18 ne sont pas tous révélés)

> ⚠️ Le compteur affiché dans `page-plan-du-site.php` indique "10 Easter Eggs" dans la section dédiée — à mettre à jour manuellement si souhaité pour refléter les 18 réels.

### `header.php`
Chargé sur toutes les pages via `get_header()`.

| Composant | Description |
|---|---|
| `<head>` | charset, viewport, meta description, title, favicons, CSS enqueués |
| `window.THEME_URI` | Expose l'URL du thème pour les scripts JS |
| Console boot | `#console-boot` (affiché uniquement sur `is_front_page()`) |
| Modal Easter Egg | `#easter-egg-modal` global |
| Navigation | Logo, menu `<nav>`, badge LIVE, burger |

### `footer.php`
Chargé sur toutes les pages via `get_footer()`.

| Composant | Description |
|---|---|
| Footer grid | Logo + description, Navigation, À propos, Tech Stack |
| XP Bar | `.egg-xp-container` — barre XP Minecraft Easter Eggs |
| Footer bottom | Copyright `#fnaf-nose`, année, crédits |
| Scripts JS | Chargement dans l'ordre : `easter-eggs.js`, `radio-player.js`, `main.js`, `dvd-bouncer.js` |
| Floating player | `#floating-player` — barre audio persistante |
| `window.THEME_URI` | Redéfini en footer pour les scripts chargés après |
| `wp_footer()` | Hook WordPress obligatoire |

### `home.php`
Redirect WordPress — affiché si WordPress utilise une "page des articles" distincte. Redirige vers `/blog`.

### `index.php`
Page 404 de secours WordPress obligatoire. Affiche un message d'erreur néon rose et un bouton retour accueil.

---

## ⚙️ Assets PHP — `assets/php/`

### `functions.php`
Fonctions WordPress du thème.

| Fonction | Description |
|---|---|
| `joystickfm_setup()` | `title-tag`, `post-thumbnails`, `html5` |
| `joystickfm_enqueue()` | Enqueue CSS (style, animations, responsive, xp-bar) + JS (easter-eggs, radio-player, main, dvd-bouncer, form uniquement contact) |
| `joystickfm_icecast_status()` | Proxy AJAX WordPress — récupère statut Icecast, parse JSON, retourne listeners/titre/artiste |
| `show_admin_bar` → `false` | Masque la barre d'admin WordPress en front |
| `joystickfm_wp_title()` | Format du `<title>` propre |
| `remove_action('wp_generator')` | Sécurité — supprime la version WP des balises HTML |

**Ordre d'enqueue JS (avec dépendances) :**
```
jfm-easter-eggs  → (aucune dépendance)
jfm-radio-player → dépend de jfm-easter-eggs
jfm-main         → dépend de jfm-radio-player
jfm-dvd-bouncer  → dépend de jfm-easter-eggs
jfm-form         → (aucune dépendance, contact uniquement)
```

### `icecast-proxy.php`
Proxy PHP pour contourner le CORS du serveur Icecast.

- URL cible : `http://10.10.10.12:8000/status-json.xsl`
- Timeout : 4 secondes
- Retourne JSON : `online`, `listeners`, `title`, `artist`, `server_name`, `bitrate`, `samplerate`, `mount`
- Fallback offline si Icecast inaccessible

```
GET /wp-content/themes/joystickfm/assets/php/icecast-proxy.php
→ {"online":true,"listeners":5,"title":"Pixel Drift - Neon Override","artist":"Pixel Drift",...}
```

### `stream-proxy.php`
Proxy PHP pour le flux audio binaire (contourne CORS navigateur).

- URL cible : `http://10.10.10.12:8000/joystick-fm`
- Streaming chunk par chunk (`CHUNK_SIZE = 8192` octets)
- Headers : `Content-Type: audio/mpeg`, `X-Accel-Buffering: no`
- Arrêt propre si connexion client interrompue (`connection_aborted()`)

> ⚠️ Ce proxy est une alternative à la solution Reverse Proxy Apache. En production, le Reverse Proxy Apache (`ProxyPass`) est préféré pour ses meilleures performances.

---

## 📐 Variables de configuration

| Constante | Fichier | Valeur |
|---|---|---|
| `ICECAST_HOST` | `icecast-proxy.php` | `10.10.10.12` |
| `ICECAST_PORT` | `icecast-proxy.php` | `8000` |
| `ICECAST_MOUNT` | `icecast-proxy.php` | `/joystick-fm` |
| `ICECAST_STREAM_URL` | `stream-proxy.php` | `http://10.10.10.12:8000/joystick-fm` |
| `CHUNK_SIZE` | `stream-proxy.php` | `8192` (octets) |
| `FETCH_TIMEOUT` | `icecast-proxy.php` | `4` secondes |
