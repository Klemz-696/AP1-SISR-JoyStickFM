# JoyStick FM — État des Mondes Survie / Dimensions, Portails et Règles P3
**Document de cadrage pour :** Perplexity (Préparation des correctifs Phase P3)  
**Date :** 7 octobre 2026  
**Auteur :** Agent Antigravity  
**Périmètre d'audit :** Copie locale des données de référence (`minecraft/data/`) uniquement.  
> [!IMPORTANT]
> **Avertissement de périmètre :** Ce relevé est établi strictement à partir des fichiers et arborescences présents dans la copie locale du dépôt (`Perplexity/.../minecraft/data/world/dimensions/minecraft/`). Il ne prétend en aucun cas avoir vérifié ou inspecté la machine virtuelle de production (`10.30.0.22`), laquelle est demeurée totalement isolée et intouchée.

---

## 1. Dimensions Réellement Présentes dans la Copie Locale

Dans l'arborescence Paper/Minecraft moderne de la copie locale (`minecraft/data/world/dimensions/minecraft/`), les dimensions physiques existantes sont :

| Dossier Dimension | Type d'Environnement | Taille Données | Fichiers Régions (`region/*.mca`) | Présence Dossier Dédié |
|---|---|---|---|---|
| **`survie`** | Overworld (Normal) | ~200 Mo | 36 fichiers (193 474 560 octets) | **OUI** (Dossier racine complet avec chunks, POI, entités) |
| **`the_nether`** | Nether | 2,3 Mo | 4 fichiers (2 310 144 octets) | **OUI** (`r.-1.-1.mca`, `r.-1.0.mca`, `r.0.-1.mca`, `r.0.0.mca`) |
| **`the_end`** | The End | 2,4 Mo | 4 fichiers (2 392 064 octets) | **OUI** (`r.-1.-1.mca`, `r.-1.0.mca`, `r.0.-1.mca`, `r.0.0.mca`) |
| **`survie_nether`** | Nether | N/A | Aucun | **NON** (N'existe pas sur le disque) |
| **`survie_the_end`** | The End | N/A | Aucun | **NON** (N'existe pas sur le disque) |

### 1.1. Contenu Existant des Nether et End à Préserver
- **`the_nether` :** Les 4 fichiers régions `r.-1.-1.mca`, `r.-1.0.mca`, `r.0.-1.mca`, `r.0.0.mca` contiennent le monde Nether déjà exploré et généré autour de l'origine `(0, 0)`. Ce monde contient potentiellement des structures et des modifications de joueurs. **Il est strictement interdit de le régénérer ou de l'écraser.**
- **`the_end` :** Les 4 fichiers régions contiennent l'île centrale de l'End avec les piliers d'obsidienne et le portail de sortie. **Il est strictement interdit de le réinitialiser ou de le supprimer.**
- **`survie` (Overworld) :** 36 régions mca réparties de X=-3 à X=+2 et Z=-3 à Z=+2. Ce dossier renferme l'intégralité des constructions permanentes des joueurs. **Préservation absolue requise.**

---

## 2. Routage des Portails et Respawn Actuel

### 2.1. État Actuel des Portails
- **Constat :** Aucun plugin de liaison de portails inter-mondes (`Multiverse-NetherPortals` ou `Multiverse-Portals`) n'est présent dans le répertoire `plugins/`.
- **Comportement par défaut :** En environnement Bukkit/Paper multi-mondes sans plugin de redirection :
  - Un portail Nether allumé dans le monde racine lie vers `the_nether`.
  - Un portail allumé dans un monde secondaire nommé `survie` cherche nativement une dimension `survie_nether`. Comme cette dimension n'existe pas sur le disque, l'activation échoue ou renvoie vers un comportement non maîtrisé.
- **Enjeu Phase P3 :** Perplexity doit concevoir une solution propre :
  - Soit lier proprement `survie` vers `the_nether` et `the_end` avec une gestion des portails compatible.
  - Soit formaliser la création de dimensions dédiées sans jamais écraser le contenu existant.

### 2.2. Configuration du Respawn
- **Multiverse-Core (`worlds.yml`) :**
  ```yaml
  minecraft:survie:
    respawn-world: survie
    bed-respawn: true
    anchor-respawn: true
  ```
- **Code Actuel JoyStickHub (`JoyStickHub.java` lignes 807-829) :**
  ```java
  @EventHandler(priority = EventPriority.HIGHEST)
  public void onPlayerRespawn(PlayerRespawnEvent event) {
      Player player = event.getPlayer();
      String deathWorld = lastDeathWorld.remove(player.getUniqueId());

      if (deathWorld != null && (deathWorld.equalsIgnoreCase("survie") || deathWorld.startsWith("survie_"))) {
          if (!event.isBedSpawn() && !event.isAnchorSpawn()) {
              World survieWorld = Bukkit.getWorld("survie");
              if (survieWorld != null) {
                  Location spawn = survieWorld.getSpawnLocation();
                  event.setRespawnLocation(spawn);
              }
          }
          player.setGameMode(GameMode.SURVIVAL);
      }
  }
  ```

---

## 3. Règles et Décisions Fixées pour la Phase P3

Perplexity doit impérativement aligner ses propositions de correctifs sur les règles décisionnelles suivantes :

1. **Survie Sans Claims (Décision D1) :**
   - GriefPrevention claims est **désactivé** sur le monde `survie` (`survie: Disabled`).
   - La Survie est une expérience libre vanilla pure sans revendications de terrain à la pelle d'or.
2. **Ordre de Priorité du Respawn :**
   - **Priorité 1 :** Lit du joueur (`event.isBedSpawn()`) ou Ancre de réapparition (`event.isAnchorSpawn()`).
   - **Priorité 2 :** En l'absence de lit/ancre valide, respawn au **spawn officiel du monde Survie** (jamais renvoyé au Hub central).
   - **Maintien du mode :** Forcer `GameMode.SURVIVAL` au respawn (aucun contournement Adventure/Creative).
3. **Gestion des Tombes (Décision D5 clarifiée) :**
   - **Tombes différées :** Aucun plugin de tombes n'est actuellement déployé.
   - **Aucun délai de 30 minutes adopté :** Le projet rejette formellement le projet de délai de protection exclusif de 30 minutes esquissé dans certains brouillons.
   - Le gameplay de mort reste le comportement vanilla classique (drop d'inventaire immédiat au sol, ramassage libre), préservant la simplicité et évitant des dépendances logicielles instables.
4. **Intégrité des Inventaires :**
   - Le groupe `survie` de Multiverse-Inventories (`survie`, `survie_nether`, `survie_the_end`) est 100% étanche par rapport aux Lobbies et aux Mini-jeux.
   - Aucune purge d'objet ne doit être introduite dans le code Java. Les boussoles fabriquées en Survie doivent être préservées.
