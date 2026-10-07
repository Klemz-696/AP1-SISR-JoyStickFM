# JoyStick FM — Rapport de Recette Technique Phase P3
**Phase :** Phase P3 — Préservation de la Survie, Dimensions, Respawn et Portails  
**Date :** 8 octobre 2026  
**Auteur :** Agent Antigravity  
**Destinataire :** Perplexity & Équipe Projet JoyStick FM  
**Statut officiel :** **VALIDÉ AU NIVEAU CONFIGURATION & CONSOLE (TESTS CLIENT EN ATTENTE)**  
**Périmètre d'exécution :** Staging local uniquement (`127.0.0.1:25566`)  
**Production (VM `10.30.0.22`, `/opt/minecraft/data`) :** **STRICTEMENT INTACTE ET NON TOUCHÉE**  
**Dépôt Git branche `main` :** **STRICTEMENT INTACT, AUCUN PUSH EFFECTUÉ**  

---

## 1. Synthèse des Décisions et Résultats

Conformément à la décision formelle confirmée par l'utilisateur pour la Phase P3 :
1. **Périmètre des Dimensions Survie :**
   - La Survie est composée exactement de trois dimensions : `survie` (Overworld), `world_nether` (`minecraft:the_nether`), et `world_the_end` (`minecraft:the_end`).
   - Le Nether et l'End existants servent exclusivement à la Survie.
   - Aucune dimension `survie_nether` ni `survie_the_end` n'a été créée.
   - Les 36 fichiers régions MCA de `survie`, les 4 régions MCA de `world_nether` et les 4 régions MCA de `world_the_end` sont 100% préservés (zéro écrasement, zéro régénération).
2. **Étanchéité Multiverse-Inventories (MVI) :**
   - Le groupe `survie` contient exactement : `survie`, `world_nether`, `world_the_end`.
   - Partage intégral (`shares: all`).
   - Aucun de ces mondes n'apparaît dans aucun autre groupe (`hub`, `bedwars`, `hikabrain`, `blockhunt`, `legacy_world`, `legacy_minijeux`, `rush`).
   - Aucune donnée joueur n'a été supprimée.
3. **Routage des Portails Multiverse :**
   - Installation et validation de [Multiverse-NetherPortals](https://modrinth.com/plugin/multiverse-netherportals) v5.1.0 compatible Paper 26.2.
   - Liaisons bidirectionnelles actives et confirmées :
     - Nether : `survie <---> world_nether`
     - End : `survie <---> world_the_end`
4. **Respawn & Fallback :**
   - Priorité 1 : Lit ou Ancre de réapparition (`bed-respawn: true`, `anchor-respawn: true`).
   - Priorité 2 : Spawn officiel du monde `survie` (`respawn-world: survie` sur toutes les dimensions de survie).
   - Mode garanti : `GameMode.SURVIVAL`.
   - Aucun renvoi involontaire au Hub.
5. **Règles de Survie :**
   - **Sans claims (D1) :** GriefPrevention désactivé sur `survie` (`survie: Disabled`).
   - **Tombes différées :** Aucun plugin de tombes déployé, aucun délai de 30 minutes adopté. La mort reste en mécanique vanilla pure avec drops immédiats au sol (`keepInventory: false`).
6. **Objets et Messages ItemJoin :**
   - La boussole `game-selector` est strictement limitée aux 4 mondes d'accueil (`hub`, `lobby_minijeux`, `hub_p2_candidate`, `lobby_minijeux_p2_candidate`).
   - Elle est totalement absente de `survie`, `world_nether`, `world_the_end`, et des arènes mini-jeux (`auto-remove`).
   - Les messages d'échec d'écrasement ou d'inventaire (`failedOverwrite`, `failedInventory`) ont été désactivés (`''`) pour supprimer les notifications parasites.
7. **Hub Candidat :**
   - Le monde `hub_p2_candidate` est chargé et opérationnel au spawn exact `(0.5, 64.0, 0.5)`.

---

## 2. Matrice de Recette Technique

| Identifiant | Intitulé du Test | Méthode de Contrôle | Résultat Observé | Statut |
|---|---|---|---|---|
| **P3-T01** | **Présence des 3 mondes Survie** | Console RCON `/mv list` | `survie` (NORMAL), `world_nether` (NETHER), `world_the_end` (THE_END) chargés et actifs. | **SUCCÈS** |
| **P3-T02** | **Liaison Portails Nether** | Console RCON `/mvnp list` | `[nether] survie <---> world_nether` bidirectionnel actif. | **SUCCÈS** |
| **P3-T03** | **Liaison Portails End** | Console RCON `/mvnp list` | `[end] survie <---> world_the_end` bidirectionnel actif. | **SUCCÈS** |
| **P3-T04** | **Groupe MVI Survie Exact** | Console RCON `/mvinv info survie` | `Config Worlds: survie, world_nether, world_the_end` | **SUCCÈS** |
| **P3-T05** | **Partage Total Inventaire Survie** | Configuration `groups.yml` | `shares: all` appliqué sur les 3 mondes. | **SUCCÈS** |
| **P3-T06** | **Isolation Multiverse-Inventories** | Script d'analyse d'intersection des 8 groupes | 0 intersection avec les groupes Lobbies et Mini-jeux. | **SUCCÈS** |
| **P3-T07** | **Respawn World Fallback** | Console RCON `/mv info` sur les 3 mondes | `Respawn World: survie`, `bed-respawn: true`, `anchor-respawn: true`. | **SUCCÈS** |
| **P3-T08** | **Sécurité Spawn Survie** | Analyse des blocs à `(-16, 72, 16)` | Sol plein à Y=71, air aux pieds (Y=72), air à la tête (Y=73), ciel dégagé. | **SUCCÈS** |
| **P3-T09** | **Silence Messages ItemJoin** | Configuration `en-lang.yml` | `failedOverwrite: ''`, `failedInventory: ''`. | **SUCCÈS** |
| **P3-T10** | **Exclusion Boussole Hors Lobbies** | Configuration `items.yml` | `game-selector` restreint aux 4 lobbies, absent de Survie et arènes. | **SUCCÈS** |
| **P3-T11** | **Persistance Post-Redémarrage** | Arrêt propre, démarrage et vérification RCON | Tous les liens et groupes persistent intacts. | **SUCCÈS** |
| **P3-T12** | **Traversée Portails Joueur In-Game** | Passage physique à travers un portail allumé | *Nécessite une session de jeu connectée.* | **NON TESTÉ (CLIENT JOUEUR REQUIS)** |
| **P3-T13** | **Validation Lit/Ancre Joueur In-Game** | Mort avec lit/ancre posé en Survie/Nether | *Nécessite une session de jeu connectée.* | **NON TESTÉ (CLIENT JOUEUR REQUIS)** |
| **P3-T14** | **Drop d'Objets à la Mort In-Game** | Vérification du drop immédiat au sol | *Nécessite une session de jeu connectée.* | **NON TESTÉ (CLIENT JOUEUR REQUIS)** |

---

## 3. Garanties d'Intégrité de l'Environnement

1. **Production VM `10.30.0.22` :** Strictement intouchée. Aucun conteneur Docker ni fichier distant n'a été modifié.
2. **Branche Git `main` :** Aucun commit, aucun push, aucune fusion.
3. **Mondes physiques :** Zéro bloc modifié via `/fill` ou génération improvisée. Régions MCA de la copie de sauvegarde conservées byte-for-byte.
4. **Code Java JoyStickHub :** Inchangé (aucun besoin de modification détecté, la compatibilité avec Multiverse et Paper est assurée).
