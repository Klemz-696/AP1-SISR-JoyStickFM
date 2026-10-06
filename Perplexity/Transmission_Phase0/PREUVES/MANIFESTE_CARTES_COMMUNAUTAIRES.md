# Preuve : Manifeste des Cartes et Structures du Serveur

Inventaire vérifié des environnements de jeu, de leur source, licence et limites techniques.

---

## 1. Monde `hub` (Grand Hub Architectural Terrestre)
- **Source communautaire** : Minecraft Monday Lobby
- **Auteur** : HeathLoganCampbell
- **Dépôt source** : `https://github.com/HeathLoganCampbell/Minecraft-Monday-Lobby`
- **Archive** : `hub_grand_architectural.zip` (3 709 727 octets, SHA-256 : `41656f705b...`)
- **Type** : Monde complet importé dans Multiverse-Core (`hub`)
- **Coordonnées de spawn central** : `x: 0.5, y: 65.0, z: 0.5`
- **Règles** : PVP désactivé, Fall Damage désactivé, Void Fallback automatique.

---

## 2. Monde `bedwars_jfm` (Arène BedWars Airshow)
- **Source communautaire** : Hypixel Bedwars Maps - Airshow
- **Auteur** : Odsodium
- **Dépôt source** : `https://github.com/Odsodium/Hypixel-Bedwars-Maps`
- **Fichiers région** : `r.-1.-1.mca`, `r.-1.0.mca`, `r.0.-1.mca`, `r.0.0.mca`
- **Type** : Arène 8 équipes / Duos (`jfm_duo`)
- **Générateurs** : Spawns Bronze/Fer dans les bases, Diamant aux îles secondaires, Émeraude au centre.

---

## 3. Monde `lobby_minijeux` (Lobby Arcade Dédié)
- **Source** : Génération procédurale void + structure d'accueil arcade
- **Générateur** : `VoidGen` (monde entièrement vide hors structure)
- **Dimensions de la plateforme** : 33x33 blocs (Quartz lisse, bordures béton violet/cyan)
- **Bornes PNJ** : 5 villageois interactifs orientés vers le centre (BedWars, BlockHunt, Rush, Hikabrain, Spawn Hub).
- **Spawn** : `x: 0.5, y: 65.0, z: 0.5, yaw: 0.0, pitch: 0.0`.

---

## 4. Monde `blockhunt_jfm` (Village Rétro Cache-Cache)
- **Source** : Arène village procédurale optimisée (81x81 blocs)
- **Thème** : Maisons médiévales, ruelles, bottes de foin et cachettes
- **Arène BlockHunt** : `jfm_retro`
- **Rôles** : Hiders (déguisements blocs LibsDisguises) vs Seekers (chasseurs avec épée en diamant).

---

## 5. Monde `rush_jfm` (Arène FunCraft Rush)
- **Source** : Arène Rush FunCraft ponts rapides (1v1 / 2v2)
- **Type** : Deux bases opposées en verre et obsidienne, générateurs rapides de fer/or, île centrale.
- **Arènes configurées** : `rush_1v1` et `rush_2v2`.

---

## 6. Monde `hikabrain_jfm` (Passerelle 1v1 FunCraft)
- **Source** : Passerelle suspendue de 48 blocs de long, 1 bloc de large
- **Objectif** : Sauter dans le lit adverse pour marquer un point (premier à 4 points gagne).

---

## 7. Monde `survie` (Monde Survie Permanent)
- **Nature** : Génération standard PaperMC vanilla préservée
- **Dimensions associées** : `survie_nether`, `survie_the_end`
- **Protection** : Revendications GriefPrevention avec pelle d'or, conservation du spawn des lits.
