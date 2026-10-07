# JoyStick FM — Dossier de Transmission Finale P2 vers P3
**Branche Git :** `docs/transmission-p2-2026-10-07`  
**Dossier :** `Perplexity/Transmission_P2/`  
**Date :** 7 octobre 2026  
**Émetteur :** Agent Antigravity  
**Destinataire :** Perplexity (Spécialiste Architecture Minecraft & Cadrage Phase P3)  

---

## 1. Objectif du Dossier

Ce dossier regroupe **exclusivement les copies textuelles expurgées et validées** de la Phase P2.  
Il a été conçu pour permettre à Perplexity de générer directement ses analyses, recommandations et correctifs pour la **Phase P3 (Survie, Dimensions, Respawn)** sur la base des fichiers exacts actuellement en production locale staging.

**Règles de sécurité appliquées :**
- Aucun fichier binaire (aucun JAR, aucun fichier `.schematic`, aucun `.mca`).
- Aucun secret, mot de passe, hash d'utilisateur ou clé d'API.
- Configurations AuthMe et Essentials expurgées des données sensibles.
- Branche isolée `docs/transmission-p2-2026-10-07`, aucun push sur `main`.

---

## 2. Structure des Fichiers Transmis

```text
Perplexity/Transmission_P2/
├── README_TRANSMISSION_P2.md             # Cette notice de cadrage
├── SHA256SUMS.txt                        # Sommes de contrôle SHA256 des fichiers du dossier
├── src/
│   ├── JoyStickHub.java                  # Code source complet JoyStickHub v1.6.0-p2 (validé in-game)
│   ├── plugin.yml                        # Déclaration du plugin Bukkit/Paper
│   └── compile_p2.py                     # Script de compilation automatisé
├── configs/
│   ├── JoyStickHub_config.yml            # Configuration complète des mondes, parkour et combat
│   ├── games.yml                         # Menu DeluxeMenus /games (boutons console sécurisés)
│   ├── items.yml                         # Objets d'accueil ItemJoin (boussole de navigation)
│   ├── worlds.yml                        # Configuration des mondes Multiverse-Core
│   ├── groups.yml                        # Groupes d'inventaires Multiverse-Inventories (8 groupes)
│   ├── Essentials/
│   │   ├── spawn.yml                     # Définition du spawn par défaut Essentials
│   │   └── config_extract_respawn.yml    # Extrait expurgé des paramètres de respawn Essentials
│   └── AuthMe/
│       ├── spawn.yml                     # Coordonnées du spawn AuthMe
│       └── config_extract_spawn.yml      # Extrait expurgé des priorités de spawn AuthMe
├── manifests/
│   └── P2_MAP_MANIFEST_FINAL.json        # Manifeste officiel vérifié des cartes P2
└── reports/
    ├── RAPPORT_RECETTE_P2_VALIDATION.md   # Compte-rendu officiel de validation in-game de la recette P2
    └── ETAT_MONDES_SURVIE_DIMENSIONS.md   # Relevé technique des mondes Survie/Nether/End pour P3
```

---

## 3. Synthèse des Éléments Clés pour la Phase P3

1. **Intégrité de la Survie :**  
   Le monde Survie (`minecraft:survie`) contient 36 fichiers régions de constructions permanentes. Il ne doit sous aucun prétexte être régénéré ni écrasé.
2. **Dimensions Nether et End :**  
   Les dimensions `the_nether` et `the_end` existent avec du contenu exploré (4 régions chacune), mais **aucune dimension dédiée `survie_nether` ou `survie_the_end` n'existe actuellement**.
3. **Portails :**  
   Aucun plugin `Multiverse-NetherPortals` n'est installé. Une solution de routage propre doit être cadrée pour P3.
4. **Respawn & Mort :**  
   - Priorité : Lit / Ancre -> Spawn du monde `survie` en `GameMode.SURVIVAL`.
   - Pas de claims (GriefPrevention désactivé sur `survie`, Décision D1).
   - Tombes différées : **aucun délai de 30 minutes adopté**, mort vanilla classique maintenue pour l'instant.
