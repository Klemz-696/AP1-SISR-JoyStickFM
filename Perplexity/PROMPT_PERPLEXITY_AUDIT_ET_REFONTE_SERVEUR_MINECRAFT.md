# PROMPT MAÎTRE POUR PERPLEXITY AI : AUDIT ET REFONTE ARCHITECTURALE MINECRAFT PAPERMC 26.2

> **Instructions pour l'utilisateur :** Copiez l'intégralité du texte ci-dessous et collez-le directement dans votre fil de discussion Perplexity. Ce prompt synthétise l'architecture, les logs réels, les causes de blocage et demande une refonte propre et définitive.

---

```markdown
# MISSION : AUDIT APPROFONDI ET REFONTE TECHNIQUE D'UN SERVEUR MINECRAFT PAPERMC 26.2 (JOYSTICK FM)

Tu es un expert senior en ingénierie d'infrastructure Minecraft (PaperMC, Java 25, architecture multi-mondes Multiverse, orchestrations Docker et écosystème de plugins Bukkit/Spigot).

Nous développons le serveur Minecraft officiel du projet réseau **JoyStick FM** (BTS SIO SISR). Malgré plusieurs scripts de corrections automatiques via RCON, **4 dysfonctionnements majeurs persistent en boucle lors des tests en jeu**. Nous avons besoin que tu analyses en profondeur la topologie, les interactions entre plugins, et que tu nous fournisses la refonte architecturale complète et le script Python définitif.

---

## 1. SPÉCIFICATIONS TECHNIQUES DE L'INFRASTRUCTURE

- **Hôte :** VM Debian 12 (`srv-minecraft`, IP DMZ `10.30.0.22`), 22,35 Go RAM allouée, 15 cœurs vCPU, stockage sur volume SSD.
- **Moteur :** Conteneur Docker `minecraft_ap1`, image PaperMC 26.2 (build 129), environnement d'exécution **Java 25 LTS (Temurin)**.
- **Mémoire JVM :** `-Xms16G -Xmx16G` avec Garbage Collector G1GC optimisé Aikar (15 threads parallèles).
- **Réseau :** Port forwarding NAT OPNsense (`192.168.101.37:25565` vers `10.30.0.22:25565`). Le port d'administration RCON (25575) est strictement local.
- **Topologie des Mondes (Multiverse-Core 5.8.1) :**
  - `hub` : Monde d'accueil Void à Y=64, spawn à `X: 0, Y: 65, Z: 0`. Plateforme en quartz et béton de 33x33 blocs.
  - `world` : Overworld standard (clé `minecraft:overworld`).
  - `lobby_minijeux` : Salle d'attente mini-jeux avec PNJ.
  - `survie` : Monde naturel pré-généré Chunky (seed `6962026`, claims désactivés selon décision D1).
  - `rush_jfm` & `hikabrain_jfm` : Mondes d'arènes rapides (BedWars / duel de lit 1v1).
- **Plugins installés et actifs :**
  `Multiverse-Core 5.8.1`, `Multiverse-Inventories 5.3.6`, `ItemJoin 6.1.8`, `DeluxeMenus 1.14.1`, `EssentialsX 2.22.0`, `LuckPerms 5.4.156`, `GriefPrevention 16.18.7`, `BedWars 0.2.44`, `BlockHunt 0.2.1`, `TAB 5.4.0`, `Vault`.

---

## 2. LES 4 PROBLÈMES IDENTIFIÉS LORS DES TESTS EN JEU

### ❌ Problème 1 : ItemJoin & La Boussole de Navigation (`✦ MENU DES JEUX ✦`)
- **Constat :** Dans la console, chaque tentative d'exécution de `/itemjoin get game-selector` ou `/ij get game-selector` retourne inlassablement :
  `[ItemJoin] The item game-selector does not exist!`
- **Effets pervers observés :**
  1. Le joueur n'a pas la boussole configurée dans son inventaire au spawn ou au respawn.
  2. Si on lui donne une boussole ordinaire (`give compass`), lorsqu'il clique droit, EssentialsX intercepte le clic avec sa fonctionnalité `/jumpto` et affiche dans le chat : *"Pas d'endroit libre trouvé autour de vous"*.
  3. Pire : un ancien item parasite resté dans l'inventaire réclame de l'argent et affiche : `[ItemJoin] You do not have enough to run this command! You have $0.0 of the required $10.0.`.
- **Ce que l'on veut :** Une boussole interactive inamovible (au slot 4) qui, au clic droit ou gauche, exécute la commande `/menu` pour ouvrir le GUI DeluxeMenus, **sans jamais être interceptée par Essentials**, donnée à la première connexion et à chaque respawn.

### ❌ Problème 2 : Chute dans le Vide & Mort Inutile au Hub
- **Constat :** Lorsqu'un joueur saute de la plateforme du Hub céleste (située à Y=64), il tombe dans le vide et meurt de dégâts du vide (`fell out of the world`) à Y=-64. À son respawn, il a perdu son inventaire.
- **Tentatives ayant échoué :**
  - Poser un plancher de barrières invisibles à Y=35 : la chute de 29 blocs inflige des dégâts de chute mortels si la gamerule est contournée, et le joueur se retrouve coincé sur une vitre invisible sans pouvoir remonter.
  - Utiliser un `repeating_command_block` avec `@a[y=-128,dy=186]` : le sélecteur ne s'active pas à temps ou le bloc n'est pas évalué correctement par PaperMC pendant la vitesse de chute libre.
- **Ce que l'on veut :** Dès qu'un joueur saute ou tombe de la plateforme du Hub (Y < 60), il ne doit **JAMAIS mourir du vide**. Il doit être instantanément et doucement retéléporté au spawn central (`0.5, 65.0, 0.5`) avec réinitialisation de sa vélocité, sans aucun dégât.

### ❌ Problème 3 : Le Top Parkour & Son Chronomètre
- **Constat :**
  1. Marcher sur la plaque de départ ne démarre aucun chronomètre.
  2. Les logs RCON indiquent : `setblock 6 66 0 light_weighted_pressure_plate ==> Could not set the block`. Minecraft refuse de poser une plaque de pression sur un bloc de commande (`command_block`).
  3. Sous la plateforme d'émeraude à Y=72, un bloc de commande orange pendait de façon très inesthétique dans le vide à Y=71.
- **Ce que l'on veut :**
  - Un socle de départ propre en quartz avec une vraie plaque d'or.
  - Un système de chronométrage réactif : dès que le joueur s'élance, le chrono démarre (feedback sonore + titre à l'écran).
  - À l'arrivée sur le podium d'émeraude : balise lumineuse active, validation de la victoire, arrêt du chrono et feux d'artifice/particules.
  - Aucun bloc de commande orange visible suspendu dans le ciel.

### ❌ Problème 4 : Le Classement Holographique du Parkour
- **Constat :** Les essais précédents ont superposé 26 entités `text_display` les unes sur les autres, ou ont affiché du JSON brut `{"text":"...", "color":"gold"}`. De plus, la commande RCON `kill @e[type=text_display]` a échoué avec `Error: Player not found` car EssentialsX a intercepté la commande `/kill`.
- **Ce que l'on veut :** Un unique panneau holographique haute définition au départ du parkour, aux couleurs vives du serveur JoyStick FM (or, cyan, jaune), parfaitement espacé et aéré, sans aucun texte brut JSON.

---

## 3. CE QUE TU DOIS NOUS FOURNIR

1. **Diagnostic architectural complet :**
   - Pourquoi ItemJoin 6.1.8 rejette-t-il `game-selector` ? Quel est le schéma YAML exact et obligatoire attendu par la version 6.x d'ItemJoin (syntaxe des clés racines, triggers, permissions, commandes) ?
   - Pourquoi EssentialsX persiste-t-il à détourner le clic de la boussole même après `lp user Klemz_696 permission set essentials.jumpto false` ? Comment le neutraliser définitivement dans `Essentials/config.yml` ?
   - Quelle est la méthode professionnelle et infaillible sous PaperMC 26.2 pour implémenter un `Void Fallback` (téléportation automatique sans mort) ?
2. **Configuration exacte des fichiers YAML :**
   - Le fichier `/data/plugins/ItemJoin/items.yml` complet, minimaliste et sans aucune erreur.
   - Les modifications exactes dans `/data/plugins/Essentials/config.yml`.
3. **Script Python d'orchestration maître (`deploy_definitive_fix.py`) :**
   - Un script Python autonome et verbeux, exécutable sur l'hôte Debian (`root@debian:/opt/minecraft/repo#`), communiquant avec le conteneur `minecraft_ap1` via `docker exec -i minecraft_ap1 rcon-cli -- ...` et `docker cp`.
   - Ce script doit purger tous les résidus, reconfigurer les plugins, poser les blocs physiques sans erreur `Could not set the block`, forcer l'attribution de la boussole et garantir le bon fonctionnement du parkour et de l'anti-vide.
```
