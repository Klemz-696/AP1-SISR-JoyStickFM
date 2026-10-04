# VIDEO_FILES.md — JoyStick FM
> Dernière mise à jour : v8.7

Inventaire complet des fichiers vidéo utilisés dans le projet.

---

## 🎬 Fichiers — `assets/video/`

| Fichier | Format | Usage | Déclencheur |
|---|---|---|---|
| `final.mp4` | MP4 | Pop-up de victoire finale lorsque les 18 Easter Eggs sont trouvés | Automatique à 18/18 Easter Eggs collectés (barre XP complète) |

---

## 📋 Détails — `final.mp4`

La vidéo `final.mp4` est intégrée dans la pop-up finale du système d'Easter Eggs.

**Conditions de déclenchement :**
- L'utilisateur a trouvé les 18 Easter Eggs du site
- La barre XP atteint 100% dans le footer
- La pop-up s'ouvre automatiquement 700ms après la complétion

**Intégration HTML (générée dynamiquement par `easter-eggs.js`) :**
```html
<video id="final-egg-video"
  src="${videoSrc}"
  autoplay controls
  style="width:100%;aspect-ratio:16/9;object-fit:contain;"
  preload="auto">
  Votre navigateur ne supporte pas la balise vidéo.
</video>
```

**Comportement :**
- Lecture automatique (`autoplay`) à l'ouverture de la pop-up
- Contrôles natifs visibles (`controls`)
- La vidéo s'arrête et se remet à 0 lors de la fermeture du modal
- Accessible via le bouton "🏆 REVOIR LA VICTOIRE" ajouté dans le footer après la première visualisation

---

## 📐 Recommandations techniques

- **Format :** MP4 (H.264) — compatibilité universelle tous navigateurs
- **Résolution recommandée :** 1280×720px minimum
- **Ratio :** 16/9 (imposé par le style CSS `aspect-ratio:16/9`)
- **Codec audio :** AAC
- **Taille :** Garder sous 20 Mo pour un chargement fluide sur le réseau intranet
