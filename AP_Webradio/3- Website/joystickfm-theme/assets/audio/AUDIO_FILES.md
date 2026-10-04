# AUDIO_FILES.md — JoyStick FM
> Dernière mise à jour : v8.7

Inventaire complet des fichiers audio utilisés dans le projet.
Tous les fichiers sont au format **MP3** sauf mention contraire.

---

## 🖼️ DVD Bouncer — `assets/audio/dvd/`

| Fichier | Usage | Notes |
|---|---|---|
| `googoo-gaga-dvd.mp3` | Son joué lors de l'effet coin "88 MPH" du DVD Bouncer | Volume : 0.7 — Se termine automatiquement (ferme l'overlay) |

---

## 🎙️ Podcasts — `assets/audio/podcasts/`

| Fichier | Titre du podcast | Durée |
|---|---|---|
| `minecraft.mp3` | Où Steve de Minecraft range-t-il 64 blocs de pierre ? | 22:14 |
| `ikea.mp3` | Speedrun de la vraie vie : IKEA en 3h | 18:07 |
| `ia-vs-joueurs.mp3` | IA vs Joueurs : qui triche en premier ? | 31:45 |

---

## 📻 Radio — `assets/audio/radio/`

| Fichier | Usage |
|---|---|
| `intro-radio.mp3` | Jingle d'introduction de la radio |
| `ia-vs-joueurs-radio.mp3` | Version radio du podcast IA vs Joueurs |
| `ikea-radio.mp3` | Version radio du podcast IKEA |

---

## 🎵 Musique — `assets/audio/musique/`

Titres diffusés en rotation sur le flux Icecast via Mixxx Auto-DJ.

| Fichier | Artiste — Titre |
|---|---|
| `Arcade Bastion - VLAN 2077.mp3` | Arcade Bastion — VLAN 2077 |
| `Pixel Drift - Neon Override.mp3` | Pixel Drift — Neon Override |
| `Root.exe - Ragequit.mp3` | Root.exe — Ragequit |
| `SavePoint Beats - Sauvegarde Nocturne.mp3` | SavePoint Beats — Sauvegarde Nocturne |
| `Zéro Ping - Glitch dans la Matrice.mp3` | Zéro Ping — Glitch dans la Matrice |
| `drill.mp3` | Drill gaming |
| `rap.mp3` | Rap gaming |
| `rock.mp3` | Rock gaming |

---

## 🥚 Easter Eggs — `assets/audio/easter-eggs/`

| Fichier | Easter Egg | Déclencheur |
|---|---|---|
| `konami.mp3` | 🎮 Konami Code | Séquence clavier ↑↑↓↓←→←→BA (ou swipes mobile) |
| `rickroll.mp3` | 🎵 Rickroll | 5× clic sur le texte du logo |
| `nyan.mp3` | 🌈 Nyan Cat | 3× clic rapide sur un horaire (page Radio) |
| `mario.mp3` | 🍄 Mario 1-UP | 5× clic sur un titre d'émission (page Radio) |
| `doom.mp3` | 💀 DOOM IDDQD | 5× clic sur l'icône 🎮 du logo |
| `hadouken.mp3` | 🔥 Hadouken | 3× clic dans une colonne du footer |
| `pokemon.mp3` | ⚡ Pokémon | 4× clic sur la vignette d'un podcast |
| `nose.mp3` | 🔴 FNAF Honk | Clic sur le © footer (`#fnaf-nose`) |
| `zelda.mp3` | 🗡️ Zelda | Double-clic sur `#footer-credits` |
| `sonic.mp3` | 💨 Sonic | Survol prolongé 1,5s sur un lien de navigation |
| `react-burger-minecraft.mp3` | 🍔 TK Burger | 15× clic sur le bouton Play (page Radio) |
| `tk78-musique.mp3` | — | Musique thème TK78 |
| `tk78-manges-tes-morts.mp3` | 🥩 Steakman63 | Clic sur "Steakman63" (écran de démarrage) |
| `masse-fart.mp3` | 🐧 Pingouy | Clic sur "Pingouy" (écran de démarrage) |
| `sylvain-durif.mp3` | 🍮 Krem Brûlé | Clic sur "Krem Brûlé" (écran de démarrage) |
| `canette.mp3` | ⚡ Klemz | Clic sur "Klemz" (écran de démarrage) |
| `victory.mp3` | Victoire | Son générique de victoire |
| `67.mp3` | 🔢 67 | Clic sur "v6.7" (écran de démarrage) |

> **Fallback synthétique :** Si un fichier MP3 est manquant, `_playEggSound()` génère un son 8-bit via Web Audio API. Aucune erreur visible pour l'utilisateur.

---

## 😄 Mèmes — `assets/audio/meme/`

| Fichier | Usage |
|---|---|
| `react-burger-minecraft.mp3` | Son mème burger Minecraft |
| `roblox.mp3` | Son mème Roblox |
| `we-are-charlie-kirk-funk.mp3` | 🔊 WEEEE — 5× clic sur le bouton haut-parleur (page Radio) |
| `ça-marche-pas-tk78.mp3` | 🍔 TK Burger — "Ça marche pas ?" — 15× clic Play (page Radio) |

---

## 📐 Recommandations techniques

- **Format :** MP3 (compatibilité universelle) — AAC acceptable en alternative
- **Durée :** ≤ 5 s pour les Easter Eggs (sauf Rickroll : plus long)
- **Volume master :** 0.6 (défini dans `_playAudioFile`) — 0.7 pour le DVD Bouncer
- **Sample rate :** 44 100 Hz recommandé
- **Bitrate :** 128 kbps suffisant pour les jingles courts

### Compatibilité iOS/Safari
Les sons des Easter Eggs 12 (Affiche) et 13 (WEEEE) utilisent `_playAudioIOS()` via `fetch() + AudioContext.decodeAudioData()` pour contourner le blocage autoplay de Safari Mobile. Le son de démarrage de boot utilise `_bootAudioRegistry` qui s'arrête automatiquement à la fermeture de l'écran boot.
