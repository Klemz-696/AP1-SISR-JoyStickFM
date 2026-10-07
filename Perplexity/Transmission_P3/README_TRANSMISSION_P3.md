# JoyStick FM — Dossier de Transmission Finale P3 vers Perplexity
**Branche Git :** `docs/transmission-p3-2026-10-08`  
**Dossier :** `Perplexity/Transmission_P3/`  
**Date :** 8 octobre 2026  
**Émetteur :** Agent Antigravity  
**Destinataire :** Perplexity (Spécialiste Architecture Minecraft & Cadrage Serveur)  

---

## 1. Contexte & Objectif

La **Phase P3 (Survie, Dimensions, Portails & Respawn)** a été configurée et validée sur l'environnement de **staging local** (`127.0.0.1:25566`) au niveau console et configuration.

Ce dossier regroupe **exclusivement les copies textuelles expurgées et validées** nécessaires à Perplexity pour auditer et préparer la suite du projet, sans toucher à la production et sans lancer P4.

---

## 2. Décisions d'Architecture & Précisions Majeures P3

Conformément aux instructions et décisions formelles :

1. **Survie sans claims :**
   - Aucune revendication de terrain (claims) n'est active sur le monde Survie (décision D1 respectée).
   - Le plugin GriefPrevention est désactivé sur le monde `survie` (`survie: Disabled`).

2. **Groupe Survie Multiverse-Inventories (MVI) :**
   - Le groupe d'inventaire `survie` contient très exactement les 3 mondes :
     - `survie` (Overworld Survie)
     - `world_nether` (Nether lié)
     - `world_the_end` (End lié)
   - Partage total (`shares: all`).
   - Étanchéité absolue : aucun de ces mondes n'apparaît dans un autre groupe d'inventaires (`hub`, `bedwars`, `hikabrain`, `blockhunt`, `rush`, `legacy_world`, `legacy_minijeux`).
   - Aucune donnée joueur n'a été modifiée ou supprimée.

3. **Portails configurés dans les deux sens (Multiverse-NetherPortals) :**
   - Plugin `Multiverse-NetherPortals` v5.1.0 installé et configuré (`links.yml`).
   - Liaisons bidirectionnelles actives et vérifiées :
     - **Nether :** `survie <---> world_nether`
     - **End :** `survie <---> world_the_end`
   - Les portails vanilla relient fidèlement les dimensions du groupe Survie sans fuite vers les lobbies ou les arènes.

4. **Respawn lit/ancre puis spawn Survie :**
   - **Priorité 1 :** Lit valide ou Ancre de réapparition (`bed-respawn: true`, `anchor-respawn: true`).
   - **Priorité 2 :** Spawn officiel du monde `survie` à `(-16, 72, 16)` avec sol sécurisé (`respawn-world: survie`).
   - Mode de jeu garanti : `GameMode.SURVIVAL`.
   - Aucun renvoi involontaire des joueurs de Survie au Hub central lors d'une mort ou d'un respawn.

5. **Tombes différées :**
   - Aucun plugin tiers de tombes n'est déployé et aucun délai de 30 minutes n'est adopté.
   - Mécanique vanilla standard conservée : drop immédiat des objets au sol lors du décès (`keepInventory: false`).

6. **Boussole absente de Survie/Nether/End :**
   - L'item de sélection de jeux `game-selector` (ItemJoin) est configuré avec l'attribut `auto-remove` et restreint aux mondes : `hub`, `lobby_minijeux`, `hub_p2_candidate`, `lobby_minijeux_p2_candidate`.
   - L'objet est automatiquement retiré des inventaires lors de l'accès à `survie`, `world_nether` ou `world_the_end`.

7. **Messages ItemJoin inutiles désactivés :**
   - Les messages d'échec d'écrasement et d'inventaire (`failedOverwrite`, `failedInventory`) dans `en-lang.yml` ont été vidés (`''`).
   - Les joueurs ne reçoivent plus de messages d'erreur intempestifs lors des changements de monde.

8. **Tests console/configuration réussis :**
   - Tous les contrôles automatisés via console RCON et inspection des fichiers de configuration ont réussi avec succès (audit des mondes, validation MVI, liaisons MVNP, coordonnées de spawn, étanchéité des groupes).

9. **Tests avec client réel encore non exécutés :**
   - Les tests nécessitant un joueur physique connecté (traversée de portail en jeu, mort avec lit/ancre, vérification visuelle des drops au sol) sont explicitement consignés comme : **NON TESTÉ (CLIENT JOUEUR REQUIS)**.

10. **Production et branche main intactes :**
    - Le serveur de production distant (`10.30.0.22`, `/opt/minecraft/data`) n'a subi **aucune modification, aucun transfert et aucun déploiement**.
    - La branche Git `main` est **strictement intacte** (aucun commit direct, aucune fusion).
    - La présente publication s'effectue exclusivement sur la branche dédiée `docs/transmission-p3-2026-10-08`.

---

## 3. Structure des Fichiers du Dossier

```text
Perplexity/Transmission_P3/
├── README_TRANSMISSION_P3.md             # Cette notice de cadrage et de transmission P3
├── SHA256SUMS.txt                        # Sommes de contrôle cryptographiques de tous les fichiers
├── src/
│   ├── JoyStickHub.java                  # Code source Java JoyStickHub actuel P2/P3
│   ├── plugin.yml                        # Métadonnées du plugin JoyStickHub
│   └── compile_p2.py                     # Script de compilation automatisé
├── configs/
│   ├── Multiverse-Inventories/
│   │   └── groups.yml                    # Configuration exacte MVI (groupe survie étanche)
│   ├── Multiverse-Core/
│   │   └── worlds.yml                    # Paramètres des mondes (respawn-world: survie)
│   ├── Multiverse-NetherPortals/
│   │   └── links.yml                     # Liaisons bidirectionnelles nether/end
│   ├── DeluxeMenus/
│   │   └── games.yml                     # Menu GUI /games avec bouton Survie fonctionnel
│   ├── ItemJoin/
│   │   ├── items.yml                     # Items d'accueil (boussole limitée aux lobbies)
│   │   └── en-lang.yml                   # Messages désactivés (failedOverwrite, failedInventory)
│   ├── Essentials/
│   │   └── spawn.yml                     # Configuration du spawn Essentials
│   └── AuthMe/
│       └── spawn.yml                     # Configuration du spawn AuthMe
├── manifests/
│   └── P2_MAP_MANIFEST_FINAL.json        # Manifeste officiel vérifié des cartes
└── reports/
    └── RAPPORT_RECETTE_P3_VALIDATION.md  # Rapport complet de validation technique P3
```

---

## 4. Règles d'Exclusion et de Confidentialité

Ce dossier **ne contient aucun élément prohibé** :
- Aucun fichier JAR compilé ;
- Aucun monde Minecraft complet ni fichier de région `.mca` ;
- Aucune donnée de joueur (`playerdata/`, `stats/`, inventaires `.json`) ;
- Aucune base de données AuthMe ou LuckPerms ;
- Aucun identifiant, mot de passe, jeton ou clé privée ;
- Aucune archive de sauvegarde complète.
