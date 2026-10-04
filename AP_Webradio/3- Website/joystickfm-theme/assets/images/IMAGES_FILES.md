# IMAGES_FILES.md — JoyStick FM
> Dernière mise à jour : v8.7

Inventaire complet des fichiers images utilisés dans le projet.
Formats présents : **PNG, JPEG, SVG**

---

## 🌐 Racine — `assets/images/`

| Fichier | Format | Usage |
|---|---|---|
| `favicon.svg` | SVG | Favicon du site (onglet navigateur) |
| `affiche.png` | PNG | Affiche promotionnelle du groupe — popup bouton "🖼️ Affiche du groupe" (page accueil) |
| `artwork.png` | PNG | Artwork radio — utilisé dans la Media Session API (notifications mobiles Android/iOS) |

---

## 🖼️ DVD Bouncer — `assets/images/dvd/`

| Fichier | Format | Usage |
|---|---|---|
| `logo-dvd.png` | PNG | Logo animé rebondissant sur le canvas (DVD Bouncer) |
| `tk-dvd.jpeg` | JPEG | Image affichée dans l'overlay lors de l'effet coin "88 MPH" |

---

## 📰 Blog — `assets/images/blog/`

### `blog/e-sport/`

| Fichier | Format | Article |
|---|---|---|
| `joueur-0.png` | PNG | E-sport en 2026 : quand jouer devient un métier |
| `joueur-1.png` | PNG | E-sport en 2026 : quand jouer devient un métier |

### `blog/futur/`

| Fichier | Format | Article |
|---|---|---|
| `abonnement.png` | PNG | Le jeu vidéo en 2034 : nos prédictions |
| `blague.png` | PNG | Le jeu vidéo en 2034 : nos prédictions |
| `cloud.png` | PNG | Le jeu vidéo en 2034 : nos prédictions |
| `ia-pnj.png` | PNG | Le jeu vidéo en 2034 : nos prédictions |
| `retro.png` | PNG | Le jeu vidéo en 2034 : nos prédictions |

### `blog/nintendo/`

| Fichier | Format | Article |
|---|---|---|
| `famicom.png` | PNG | Retour sur la NES : 40 ans de pixels et de joie |
| `nes.png` | PNG | Retour sur la NES : 40 ans de pixels et de joie |
| `nes-mini-classic.png` | PNG | Retour sur la NES : 40 ans de pixels et de joie |

### `blog/ost/`

| Fichier | Format | Article |
|---|---|---|
| `hollow-knight.png` | PNG | Les 10 OST de jeux vidéo qui ont changé notre rapport à la musique |
| `journey.jpg` | JPEG | Les 10 OST de jeux vidéo qui ont changé notre rapport à la musique |
| `doom-eternal.jpg` | JPEG | Les 10 OST de jeux vidéo qui ont changé notre rapport à la musique |
| `final-fantasy-vii.jpeg` | JPEG | Les 10 OST de jeux vidéo qui ont changé notre rapport à la musique |
| `nier-automata.jpg` | JPEG | Les 10 OST de jeux vidéo qui ont changé notre rapport à la musique |
| `celeste.jpg` | JPEG | Les 10 OST de jeux vidéo qui ont changé notre rapport à la musique |
| `legend-of-zelda-ocarina-of-time.jpeg` | JPEG | Les 10 OST de jeux vidéo qui ont changé notre rapport à la musique |
| `persona-5.jpg` | JPEG | Les 10 OST de jeux vidéo qui ont changé notre rapport à la musique |
| `skyrim.jpg` | JPEG | Les 10 OST de jeux vidéo qui ont changé notre rapport à la musique |
| `undertale.jpeg` | JPEG | Les 10 OST de jeux vidéo qui ont changé notre rapport à la musique |

### `blog/pixel-art/`

| Fichier | Format | Article |
|---|---|---|
| `contraintes.png` | PNG | Le pixel art : d'une contrainte technique à un choix artistique |
| `imagination.png` | PNG | Le pixel art : d'une contrainte technique à un choix artistique |
| `independant.jpg` | JPEG | Le pixel art : d'une contrainte technique à un choix artistique |
| `outils.jpg` | JPEG | Le pixel art : d'une contrainte technique à un choix artistique |

### `blog/types-joueur/`

| Fichier | Format | Article |
|---|---|---|
| `afk.png` | PNG | Les 7 types de joueurs que vous croisez dans tout MMO |
| `chasseur.png` | PNG | Les 7 types de joueurs que vous croisez dans tout MMO |
| `magnat.png` | PNG | Les 7 types de joueurs que vous croisez dans tout MMO |
| `rp.png` | PNG | Les 7 types de joueurs que vous croisez dans tout MMO |
| `social.png` | PNG | Les 7 types de joueurs que vous croisez dans tout MMO |
| `toxic.png` | PNG | Les 7 types de joueurs que vous croisez dans tout MMO |
| `wiki.png` | PNG | Les 7 types de joueurs que vous croisez dans tout MMO |

---

## 📐 Recommandations techniques

- **Favicon :** SVG vectoriel — s'adapte à toutes les résolutions sans perte de qualité
- **Blog / Illustrations :** PNG pour les images avec transparence ou pixel art ; JPEG/JPEG pour les photos
- **DVD Bouncer :** `logo-dvd.png` — taille d'affichage 80×80px (mais fichier source de meilleure résolution recommandé pour les écrans Retina)
- **Artwork radio :** 512×512px minimum requis par la Media Session API pour les notifications mobiles
- **Optimisation :** Toutes les images de blog sont affichées avec `max-width:100%`, `height:auto` et `object-fit:contain` dans le lecteur d'articles
