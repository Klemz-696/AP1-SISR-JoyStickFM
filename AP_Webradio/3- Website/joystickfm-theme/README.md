# 🎮 JoyStick FM — WebRadio Gaming
## Projet BTS SIO TS1 — Documentation complète

---

## 📋 Table des matières

1. [Présentation du projet](#présentation)
2. [Arborescence](#arborescence)
3. [Détail des fichiers](#détail-des-fichiers)
4. [Mise en place de l'infrastructure](#infrastructure)
5. [Hébergement Apache](#hébergement-apache)
6. [Sécurité](#sécurité)
7. [Tests](#tests)
8. [Déploiement FTP/SFTP](#déploiement)

---

## 🎯 Présentation

**JoyStick FM** est une WebRadio Gaming thématique réalisée dans le cadre du BTS SIO 2ème année — Groupe TS1 — Promotion 2025-2026.

| Champ | Valeur |
|---|---|
| Projet | WebRadio Gaming |
| Technos | HTML5, CSS3, JavaScript ES6+, PHP 8.2, WordPress 6.x |
| Serveur | Apache 2.4 + Icecast 2.4 + MariaDB |
| Réseau | Intranet BTS SIO — VLAN 10.10.10.0/24 |
| Virtualisation | VMware vSphere (3 VMs Debian 12) |
| Thème | Gaming / Pixel Art / Néon Rétro-Futuriste |

### 👥 Équipe de développement

| Pseudo | Nom | Rôle |
|---|---|---|
| **Klemz** | Clément SAUZÈDE | Chef de projet / Développeur Full-Stack |
| **Steakman63** | Nathan PEREZ | Développeur Back-End / Infrastructure |
| **Pingouy** | Robin JAMES | Développeur Front-End / UX Design |
| **Krem Brûlé** | Clément DURU | Administrateur Réseau / Streaming |

### Fonctionnalités principales
- ✅ Diffusion flux audio en direct (Icecast 2.4 — MP3 128 kbps)
- ✅ Lecteur HTML5 custom avec visualiseur Web Audio API
- ✅ 3 podcasts gaming avec mini-lecteurs HTML5
- ✅ Blog gaming — 6 articles complets (images + vidéos YouTube intégrées)
- ✅ Formulaire de contact fonctionnel (Formspree + validation JS)
- ✅ Console de démarrage animée (page d'accueil)
- ✅ Floating player persistant cross-page
- ✅ 18 Easter Eggs avec barre XP style Minecraft (sessionStorage)
- ✅ Konami Code mobile (swipes + taps)
- ✅ Logo DVD Bouncer décoratif avec effet "Retour vers le Futur"
- ✅ Responsive complet (360/480/600/768/1024px)
- ✅ Media Session API (notifications mobiles)
- ✅ Plan de Reprise d'Activité automatisé (scripts Bash + systemd)

---

## 📁 Arborescence

```
Site-Web-WordPress/
│
├── README.md               ← Ce fichier
├── style.css               ← Fichier de déclaration du thème WordPress
│
├── front-page.php          ← Page d'accueil (hero, podcasts, actus, CTA)
├── page-radio.php          ← Page d'écoute en direct (lecteur Icecast)
├── page-podcasts.php       ← Page podcasts (filtres par catégorie)
├── page-blog.php           ← Blog gaming (6 articles, lecture inline)
├── page-contact.php        ← Formulaire de contact (Formspree)
├── page-mentions-legales.php
├── page-politique-confidentialite.php
├── page-plan-du-site.php
├── header.php              ← En-tête commun + console boot
├── footer.php              ← Pied de page + floating player + XP bar
├── home.php                ← Redirect vers front-page (WordPress)
├── index.php               ← Page 404 de secours
│
├── generate_doc.py         ← Script de génération de documentation
│
└── assets/
    ├── audio/
    │   ├── AUDIO_FILES.md          ← Inventaire des fichiers audio
    │   ├── dvd/
    │   │   └── googoo-gaga-dvd.mp3     ← Son effet coin DVD Bouncer
    │   ├── easter-eggs/
    │   │   ├── 67.mp3
    │   │   ├── canette.mp3
    │   │   ├── doom.mp3
    │   │   ├── hadouken.mp3
    │   │   ├── konami.mp3
    │   │   ├── mario.mp3
    │   │   ├── masse-fart.mp3
    │   │   ├── nose.mp3
    │   │   ├── nyan.mp3
    │   │   ├── pokemon.mp3
    │   │   ├── react-burger-minecraft.mp3
    │   │   ├── rickroll.mp3
    │   │   ├── sonic.mp3
    │   │   ├── sylvain-durif.mp3
    │   │   ├── tk78-manges-tes-morts.mp3
    │   │   ├── tk78-musique.mp3
    │   │   ├── victory.mp3
    │   │   └── zelda.mp3
    │   ├── meme/
    │   │   ├── react-burger-minecraft.mp3
    │   │   ├── roblox.mp3
    │   │   ├── we-are-charlie-kirk-funk.mp3
    │   │   └── ça-marche-pas-tk78.mp3
    │   ├── musique/
    │   │   ├── Arcade Bastion - VLAN 2077.mp3
    │   │   ├── Pixel Drift - Neon Override.mp3
    │   │   ├── Root.exe - Ragequit.mp3
    │   │   ├── SavePoint Beats - Sauvegarde Nocturne.mp3
    │   │   ├── Zéro Ping - Glitch dans la Matrice.mp3
    │   │   ├── drill.mp3
    │   │   ├── rap.mp3
    │   │   └── rock.mp3
    │   ├── podcasts/
    │   │   ├── ia-vs-joueurs.mp3
    │   │   ├── ikea.mp3
    │   │   └── minecraft.mp3
    │   └── radio/
    │       ├── ia-vs-joueurs-radio.mp3
    │       ├── ikea-radio.mp3
    │       └── intro-radio.mp3
    │
    ├── css/
    │   ├── CSS_FILES.md            ← Inventaire des fichiers CSS
    │   ├── style.css               ← Styles principaux, variables, composants
    │   ├── animations.css          ← Keyframes et classes d'animation
    │   ├── responsive.css          ← Media queries (360/480/600/768/1024px)
    │   └── xp-bar-styles.css       ← Barre XP style Minecraft (Easter Eggs)
    │
    ├── images/
    │   ├── IMAGES_FILES.md         ← Inventaire des fichiers images
    │   ├── favicon.svg
    │   ├── affiche.png
    │   ├── artwork.png
    │   ├── dvd/
    │   │   ├── logo-dvd.png            ← Logo DVD Bouncer
    │   │   └── tk-dvd.jpeg             ← Image effet coin DVD
    │   ├── blog/
    │   │   ├── e-sport/
    │   │   ├── futur/
    │   │   ├── nintendo/
    │   │   ├── ost/
    │   │   ├── pixel-art/
    │   │   └── types-joueur/
    │
    ├── js/
    │   ├── JS_FILES.md             ← Inventaire des fichiers JavaScript
    │   ├── dvd-bouncer.js          ← Logo DVD animé + effet coin
    │   ├── easter-eggs.js          ← 18 easter eggs + barre XP
    │   ├── form-validation.js      ← Validation formulaire contact
    │   ├── main.js                 ← Boot, nav burger, Konami Code, scroll
    │   └── radio-player.js         ← Lecteur Icecast, mini-lecteurs podcasts
    │
    ├── php/
    │   ├── PHP_FILES.md            ← Inventaire des fichiers PHP
    │   ├── functions.php           ← Enqueue scripts/styles, proxy Icecast
    │   ├── icecast-proxy.php       ← Proxy JSON statut Icecast (CORS)
    │   └── stream-proxy.php        ← Proxy flux audio binaire (CORS)
    │
    └── video/
        ├── VIDEO_FILES.md          ← Inventaire des fichiers vidéo
        └── final.mp4               ← Vidéo pop-up finale (18/18 Easter Eggs)
```

---

## 📄 Détail des fichiers

### Templates PHP (thème WordPress)

| Fichier | Rôle |
|---|---|
| `front-page.php` | Hero animé, 3 podcasts récents, 3 actus gaming, CTA radio, popup affiche |
| `page-radio.php` | Lecteur principal Icecast, visualiseur Web Audio API, programme du jour |
| `page-podcasts.php` | Grille de 3 podcasts, filtres par catégorie, mini-lecteurs HTML5 |
| `page-blog.php` | 6 articles gaming, article à la une, lecture inline, vidéos YouTube |
| `page-contact.php` | Formulaire Formspree, FAQ accordéon, message de succès animé |
| `page-mentions-legales.php` | Éditeur, hébergement, propriété intellectuelle (LCEN) |
| `page-politique-confidentialite.php` | RGPD, données collectées, droits utilisateurs, cookies |
| `page-plan-du-site.php` | Architecture complète, stats, stack technique, infrastructure, Easter Eggs |
| `header.php` | DOCTYPE, CSS, navigation, console boot, modal Easter Egg |
| `footer.php` | Navigation, stack tech, XP bar Easter Eggs, floating player, scripts JS |
| `home.php` | Redirect vers front-page (WordPress blog page) |
| `index.php` | Page 404 de secours obligatoire WordPress |

### CSS

| Fichier | Contenu clé |
|---|---|
| `style.css` | Variables CSS, typographie VT323/Orbitron/Share Tech Mono, boutons, cards, header/footer, radio player, formulaire, floating player |
| `animations.css` | 15+ keyframes (slideUp, fadeIn, glitch, neonFlicker, vizBounce, eggPop...) |
| `responsive.css` | 22 sections — breakpoints 360/480/600/768/1024px, burger menu, adaptations mobiles complètes |
| `xp-bar-styles.css` | Barre XP style Minecraft authentique, compteur Press Start 2P, animations |

### JavaScript

| Fichier | Fonctions principales |
|---|---|
| `main.js` | `initBoot()`, `initNav()`, `initKonami()` (clavier + mobile swipes), `initScrollAnimations()`, `initParticles()`, `initCursorAura()` |
| `radio-player.js` | `FloatingPlayer`, `RadioPlayer`, `MiniPlayer`, `VolumeState`, `SessionState`, `RadioState`, Media Session API, fix iOS sliders |
| `dvd-bouncer.js` | Canvas fixe, `requestAnimationFrame`, rebonds adaptatifs, couleurs néon, effet coin "88 MPH" avec flash/image/son |
| `easter-eggs.js` | `EGG_TRACKER` (sessionStorage), 18 œufs, barre XP Minecraft, pop-up finale avec confettis canvas, bouton "Revoir la victoire" |
| `form-validation.js` | Règles de validation, affichage erreurs dynamiques, compteur caractères, honeypot anti-spam, envoi Formspree |

### PHP (assets)

| Fichier | Rôle |
|---|---|
| `functions.php` | Enqueue CSS/JS, proxy Icecast via WP AJAX, suppression barre admin, sécurité version WP |
| `icecast-proxy.php` | Récupère `/status-json.xsl` depuis Icecast 2, contourne le CORS, retourne JSON (listeners, titre, artiste) |
| `stream-proxy.php` | Relaye le flux audio binaire depuis Icecast, contourne le CORS navigateur, streaming chunk par chunk |

---

## 🏗 Infrastructure

### VMs vSphere

| VM | IP | Rôle | Services |
|---|---|---|---|
| **Pare-feu** | 10.10.10.1 | OPNsense | NAT, filtrage ports, blocage port 8000 extérieur |
| **VM Mixxx** | 10.10.10.10 | Régie audio | Mixxx Auto-DJ, XFCE, encodage MP3 128 kbps |
| **VM Web** | 10.10.10.11 | Portail web | Apache 2.4, MariaDB, PHP 8.2, WordPress 6.x |
| **VM Icecast** | 10.10.10.12 | Diffuseur | Icecast 2.4 (port 8000), mount `/joystick-fm` |

### Icecast 2 — Configuration clé (`/etc/icecast2/icecast.xml`)

```xml
<icecast>
  <limits>
    <clients>100</clients>
    <sources>5</sources>
    <burst-size>65535</burst-size>
  </limits>
  <authentication>
    <source-password>MonMotDePasse_Source</source-password>
    <admin-user>admin</admin-user>
    <admin-password>MonMotDePasse_Admin</admin-password>
  </authentication>
  <hostname>localhost</hostname>
  <listen-socket>
    <port>8000</port>
  </listen-socket>
  <mount>
    <mount-name>/joystick-fm</mount-name>
    <max-listeners>50</max-listeners>
  </mount>
</icecast>
```

```bash
sudo systemctl enable icecast2 && sudo systemctl start icecast2
```

### Mixxx — Configuration diffusion live

```
Mixxx > Préférences > Diffusion en direct
- Type : Icecast2
- Hôte : 10.10.10.12
- Port : 8000
- Login : source
- Mot de passe : MonMotDePasse_Source
- Point de montage : /joystick-fm
- Format : MP3 — 128 kbps — 44 100 Hz — Stéréo
```

### Plan de Reprise d'Activité (PRA)

Les services sont configurés pour redémarrer automatiquement sans intervention :
- `apache2`, `mariadb`, `icecast2` — activés via `systemd` au boot
- VM Mixxx — auto-login LightDM + script Bash `xdotool` (Ctrl+L + Shift+F12)
- **Délai de reprise estimé : < 60 secondes** après redémarrage des serveurs

---

## 🌐 Hébergement Apache — VirtualHost

```apache
<VirtualHost *:80>
    ServerName joystickfm.local
    DocumentRoot /var/www/html/wordpress

    # Reverse Proxy flux audio (contourne CORS)
    ProxyPass "/radio-stream.mp3" "http://10.10.10.12:8000/joystick-fm" flushpackets=on disablereuse=on
    ProxyPassReverse "/radio-stream.mp3" "http://10.10.10.12:8000/joystick-fm"

    <Directory /var/www/html/wordpress>
        Options -Indexes -FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Headers sécurité
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "DENY"
    Header always set Content-Security-Policy "default-src 'self' fonts.googleapis.com fonts.gstatic.com formspree.io; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com;"

    ErrorLog ${APACHE_LOG_DIR}/joystickfm_error.log
    CustomLog ${APACHE_LOG_DIR}/joystickfm_access.log combined
</VirtualHost>
```

```bash
sudo a2enmod proxy proxy_http headers
sudo a2ensite joystickfm.conf
sudo systemctl reload apache2
```

---

## 📤 Déploiement SFTP

```bash
# Via rsync (recommandé — mise à jour incrémentale)
rsync -avz --progress ./Site-Web-WordPress/ user@10.10.10.11:/var/www/html/wordpress/wp-content/themes/joystickfm/

# Via SCP (copie complète)
scp -r ./Site-Web-WordPress/* user@10.10.10.11:/var/www/html/wordpress/wp-content/themes/joystickfm/
```

> ⚠️ Toujours utiliser SFTP/SSH (port 22) — FTP en clair est désactivé sur OPNsense.

---

## 🔐 Sécurité

| Risque | Contre-mesure |
|---|---|
| **Sniffing / Interception** | SFTP uniquement — FTP désactivé |
| **Stream Hijacking Icecast** | `<source-password>` fort + port 8000 bloqué depuis l'extérieur (OPNsense) |
| **DDoS flux audio** | `<clients>100</clients>` dans icecast.xml (validé JMeter : 0% d'erreur) |
| **XSS formulaire** | CSP Apache + validation JS (honeypot anti-spam) + Formspree |
| **Directory Listing** | `Options -Indexes` dans Apache |
| **Surcharge Reverse Proxy** | `flushpackets=on disablereuse=on` dans ProxyPass |

---

## 🧪 Tests de charge (Apache JMeter)

| Paramètre | Valeur | Résultat |
|---|---|---|
| Utilisateurs simultanés | 100 | ✅ Stable |
| Taux d'erreur | 0.00% | ✅ Parfait |
| Bande passante consommée | ~12,8 Mbps | ✅ Sous la limite Gigabit |
| Limite clients Icecast | `<clients>100</clients>` | ✅ Respectée |

---

## 🥚 Les 18 Easter Eggs

| # | Thème | Déclencheur |
|---|---|---|
| 1 | 🎮 Konami Code | Séquence clavier ↑↑↓↓←→←→BA (+ version mobile swipes) |
| 2 | 🎵 Rickroll | 5× clic sur le texte du logo "JoyStick FM" |
| 3 | 🌈 Nyan Cat | 3× clic rapide sur un horaire (page Radio) |
| 4 | 🍄 Mario 1-UP | 5× clic sur un titre d'émission (page Radio) |
| 5 | 💀 DOOM IDDQD | 5× clic sur l'icône 🎮 du logo |
| 6 | 🔥 Hadouken | 3× clic dans une colonne du footer |
| 7 | ⚡ Pokémon | 4× clic sur la vignette d'un podcast |
| 8 | 🔴 FNAF Honk | Clic sur le © dans le footer |
| 9 | 🗡️ Zelda | Double-clic sur la description footer |
| 10 | 💨 Sonic | Survol prolongé 1,5s sur un lien de navigation |
| 11 | 🍔 TK Burger | 15× clic sur le bouton Play (page Radio) |
| 12 | 🖼️ Affiche | Maintien clic/toucher 5s sur l'image de l'affiche (accueil) |
| 13 | 🔊 WEEEE | 5× clic sur le bouton haut-parleur 🔊 (page Radio) |
| 14 | 🔢 67 | Clic sur "v6.7" dans l'écran de démarrage |
| 15 | ⚡ Klemz | Clic sur "Klemz" dans l'écran de démarrage |
| 16 | 🥩 Steakman63 | Clic sur "Steakman63" dans l'écran de démarrage |
| 17 | 🐧 Pingouy | Clic sur "Pingouy" dans l'écran de démarrage |
| 18 | 🍮 Krem Brûlé | Clic sur "Krem Brûlé" dans l'écran de démarrage |

Progression suivie via `sessionStorage` avec barre XP style Minecraft dans le footer.  
**18/18 → pop-up finale avec vidéo `final.mp4` et pluie de confettis canvas.**

---

## 🖼️ Fonctionnalité décorative — DVD Bouncer

Le script `dvd-bouncer.js` anime un logo DVD rebondissant en arrière-plan de toutes les pages (canvas fixe, opacité 18%, z-index:0). Quand le logo atteint un coin, un effet "Retour vers le Futur" se déclenche : flash lumineux, lignes de vitesse, texte "88 MPH !", image `tk-dvd.jpeg` et son `googoo-gaga-dvd.mp3`. Cette fonctionnalité est purement décorative — aucune interaction requise.

---

*JoyStick FM — BTS SIO TS1 — Promotion 2025-2026 — Lycée Sidoine Apollinaire, Clermont-Ferrand*
