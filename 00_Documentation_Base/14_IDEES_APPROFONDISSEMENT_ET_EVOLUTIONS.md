# Document 14 : Idées d'Approfondissement & Évolutions du Projet AP 1
## WebRadio JoyStick FM, Jeu de Cartes TCG & Serveur Minecraft Multi-Jeux
*Projet AP 1 — BTS SIO SISR (Binôme 04 & 10)*  
*Auteurs : Clément SAUZÈDE (04 - Lead Réseau/Sécurité) & Mathys DUTHILLEUL (10 - Admin Systèmes)*  
*Date : 04 Octobre 2026*

---

## 🎯 1. Vision & Objectifs d'Approfondissement

L'Atelier Professionnel 1 (AP 1) a atteint **96% de conformité contractuelle** : les réseaux, le pare-feu OPNsense, le VPN WireGuard, les sauvegardes, la WebRadio et le serveur Minecraft de base sont 100% opérationnels.

Pour **impressionner le jury de l'épreuve E5** et transformer cette infrastructure en une véritable **vitrine technologique multimédia et ludique**, ce document détaille les pistes d'enrichissement technique sur deux axes majeurs :
1. **La WebRadio & le Portail Web JoyStick FM :** Création d'un jeu de cartes à collectionner virtuel (**JoyStick TCG**), système d'authentification légère, et intégration audio temps réel.
2. **Le Serveur Minecraft d'Entreprise :** Évolution de l'instance Docker vers un hub multi-jeux complet (**Bedwars, Hikabrain, Rush, OneBlock, Cache-Cache, Survie Vanilla+**).

---

## 🃏 2. Axe 1 : Projet JoyStick TCG (Trading Card Game) & Portail Web

### 2.1. Concept Général
Intégrer directement dans le site WordPress (`http://10.100.0.51/tcg/` ou popup interactif) un **jeu de cartes à collectionner en ligne**, thématisé autour de l'univers rétro-gaming de JoyStick FM et des éléments réels du projet BTS SIO (cartes des serveurs, des musiques, des animateurs et des mèmes).

```
[ Écoute de la WebRadio ] ──► [ Gain de JoyCoins / XP ] ──► [ Achat de Boosters ]
            │                                                      │
            ▼                                                      ▼
[ Découverte d'Easter Eggs ] ─────────────────────────────► [ Collection & Duels TCG ]
```

---

### 2.2. Système d'Authentification Léger & Simple

Pour ne pas alourdir l'expérience avec des inscriptions fastidieuses :
* **Formulaire d'entrée minimaliste :** Un simple champ **Pseudo** (3 à 15 caractères) + un **Code PIN secret** à 4 chiffres (ou mot de passe court).
* **Stockage en base MariaDB :**
  ```sql
  CREATE TABLE IF NOT EXISTS wp_jfm_tcg_players (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(30) UNIQUE NOT NULL,
      pin_hash VARCHAR(64) NOT NULL,
      joycoins INT DEFAULT 100,
      xp INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  ```
* **Persistance session :** Stockage d'un token sécurisé dans le `localStorage` du navigateur ou cookie de session PHP pour rester connecté automatiquement à chaque visite.

---

### 2.3. Architecture du Jeu de Cartes & Niveaux de Rareté

Chaque carte dispose de caractéristiques de combat et d'une identité visuelle rétro :
* **Points d'Attaque (ATK) :** Dégâts infligés à la carte adverse.
* **Points de Défense / Vie (HP/DEF) :** Résistance aux attaques.
* **Effet / Capacité Spéciale :** Bonus tactique activable.

#### Échelle des Raretés Visuelles (CSS Holographique) :
1. ⚪ **Commune (60% de chance) :** Bordure grise métallisée (ex : *Câble RJ45 Cat6*, *Packet Loss*, *Steve en Minage*).
2. 🔵 **Rare (25% de chance) :** Bordure cyan néon rétro (ex : *VLAN 2077*, *Switch Proxmox*, *Drill Gamer*).
3. 🟣 **Épique (10% de chance) :** Bordure violette phosphorescente (ex : *OPNsense Shield*, *Glitch dans la Matrice*, *Pingouy*).
4. 🟡 **Légendaire (4% de chance) :** Bordure dorée avec reflet holographique animé en CSS (ex : *Icecast Master Streamer*, *TK Burger Suprême*).
5. 🌈 **Mythique / Glitchée (1% de chance) :** Effet glitch chiptune animé et particules (ex : *Root.exe - Ragequit*, *Konami Code Master*).

#### Exemple de Modélisation des Cartes :
```json
[
  {
    "id": 1,
    "name": "OPNsense Shield",
    "rarity": "epique",
    "type": "Defense",
    "atk": 25,
    "hp": 95,
    "ability": "Scrubbing : Annule la prochaine attaque adverse",
    "image": "assets/images/tcg/opnsense-shield.png"
  },
  {
    "id": 2,
    "name": "Arcade Bastion",
    "rarity": "rare",
    "type": "Attaque",
    "atk": 70,
    "hp": 50,
    "ability": "VLAN 2077 : +15 ATK si la radio est en cours d'écoute",
    "image": "assets/images/tcg/arcade-bastion.png"
  }
]
```

---

### 2.4. Mécanisme des Boosters & Gamification Liée à la Radio

* **Animation d'ouverture de Booster :** Animation CSS 3D où l'utilisateur clique sur le paquet scellé, qui se déchire pour révéler 3 cartes retournées. Chaque carte se retourne avec un son 8-bit lors du clic.
* **Moyens d'obtention des Boosters :**
  1. **Pack de Bienvenue :** 2 boosters offerts à la création du profil.
  2. **Bonus d'écoute Radio :** Un chronomètre JS vérifie que la radio est en lecture (`radio-player.js`). Toutes les 15 minutes d'écoute continue ➔ **+50 JoyCoins** (1 booster = 100 JoyCoins).
  3. **Chasse aux Easter Eggs :** Trouver l'un des 18 Easter Eggs du site débloque immédiatement un **Booster Rare Garanti** !
  4. **Connexion Minecraft :** Jouer sur le serveur Minecraft AP1 débloque des packs exclusifs in-game !

---

### 2.5. Système de Combat / Arène (Tour par Tour Simple)

* **Mode PVE (Solo contre l'IA PNJ) :** Le joueur choisit 3 cartes de son deck et affronte l'ordinateur ("*Le Glitch de la Matrice*").
* **Déroulement d'un duel :**
  1. Phase 1 : Les deux cartes actives s'affrontent.
  2. Phase 2 : Calcul des dégâts (`HP restant = HP - (ATK adverse - DEF/2)`).
  3. Phase 3 : Déclenchement des capacités spéciales.
  4. Victoire : Remporter 2 manches sur 3 rapporte de l'XP et des JoyCoins.

---

## 🎮 3. Axe 2 : Approfondissement du Serveur Minecraft AP 1

### 3.1. Vision de l'Évolution
Actuellement, le serveur tourne sur un moteur autonome **PaperMC / Vanilla 1.20.4** sur la VM 11017 (`10.30.0.22:25565`).  
L'objectif est d'en faire un **Serveur Multi-Jeux complet** accessible par le VPN WireGuard, sans impacter les performances de la VM (allocation 2 à 4 Go RAM).

---

### 3.2. Catalogue des Mini-Jeux à Intégrer

```
                                [ HUB CENTRAL / LOBBY ]
                                          │
        ┌───────────────┬─────────────────┼─────────────────┬───────────────┐
        ▼               ▼                 ▼                 ▼               ▼
   [ Bedwars ]     [ Hikabrain ]       [ Rush ]        [ OneBlock ]   [ Cache-Cache ]
   (Îles volantes)  (Duel réflexes)   (Ponts rapides)   (Survie 1 bloc) (Block Hunt)
```

#### 1. 🛏️ Bedwars / Rush
* **Principe :** 2 à 4 équipes sur des îles flottantes. Chaque équipe a un lit à protéger. Des générateurs de lingots (fer, or, diamant, émeraude) permettent d'acheter des blocs, armures et armes auprès de villageois PNJ.
* **Implémentation :** Plugin Spigot/Paper `BedWars1058` ou `ScreamingBedwars` (open-source, ultra léger).

#### 2. ⚡ Hikabrain / FastBridge
* **Principe :** Mini-jeu frénétique en 1v1 ou 2v2. Deux camps séparés par le vide. Les joueurs disposent de grès illimité, d'une pioche et d'une épée. L'objectif est de poser des blocs à toute vitesse pour sauter dans le portail adverse et marquer des points.
* **Implémentation :** Plugin `Hikabrain` ou arène custom avec réinitialisation de monde instantanée.

#### 3. 📦 OneBlock
* **Principe :** Chaque joueur commence sur un seul bloc flottant dans le vide. À chaque fois qu'il casse ce bloc, celui-ci réapparaît sous une autre forme (terre, minerai, coffre, monstre). Le bloc progresse à travers différentes phases (Plaines, Caverne, Nether, Désert, End).
* **Implémentation :** Plugin `OneBlock` / `AOneBlock` (compatible 1.20.4).

#### 4. 🎭 Cache-Cache (Block Hunt / Prop Hunt)
* **Principe :** Un groupe de "Cachés" se métamorphose en blocs solides de Minecraft (enclume, table de craft, botte de foin) et doit se fondre dans le décor d'une map thématique. Un groupe de "Chasseurs" armés d'épées doit frapper les blocs suspects pour démasquer les joueurs.
* **Implémentation :** Plugin `BlockHunt` ou `HideAndSeek`.

#### 5. 🌲 Survie Vanilla+ avec Claims
* **Principe :** Un monde ouvert avec protection de parcelles contre le pillage (`GriefPrevention` avec une pelle en or), système d'économie (`Vault` + `EssentialsX`), commandes de téléportation sécurisées (`/sethome`, `/spawn`).

---

### 3.3. Architecture Technique Préconisée (Multi-Mondes vs Proxy)

Pour rester sur une seule machine virtuelle Debian légère (`10.30.0.22`) sans multiplier les VMs :
* **Solution retenue : Moteur PaperMC 1.20.4 + Multiverse-Core**
  - `Multiverse-Core` permet de gérer plusieurs mondes étanches sur la même instance Minecraft (`hub`, `bedwars_map`, `oneblock_world`, `survie`).
  - `Multiverse-Inventories` sépare automatiquement les inventaires : un joueur dans l'arène Bedwars ne garde pas ses objets du monde Survie.
  - Consommation mémoire optimisée : ~2.5 Go de RAM suffisent pour faire tourner l'ensemble avec 10 à 15 joueurs simultanés.

---

### 3.4. Passerelle Interactive Web ↔ Minecraft

Créer une synergie unique entre le portail Web JoyStick FM et le serveur Minecraft :
1. **Statut Serveur en direct sur le site :** Widget affichant le nombre de joueurs en ligne, le ping et le MOTD en temps réel sur la page d'accueil ou la page Radio via l'API Query Minecraft (port UDP 25565).
2. **Récompenses Croisées :**
   - Victoire dans une partie de Bedwars ou Hikabrain ➔ Commande RCON automatique donnant un code promo pour **1 Booster TCG Légendaire** sur le site Web !
   - Écouter la radio pendant qu'on joue sur Minecraft ➔ Donne un grade cosmétique `[Auditeur FM]` avec préfixe coloré dans le chat du jeu.

---

## 📅 4. Feuille de Route d'Implémentation Pratique

| Phase | Intitulé de l'Étape | Actions Techniques & Composants |
|:---:|:---|:---|
| **Phase 1** | **Fondations TCG sur le Web** | - Création de la table MySQL `wp_jfm_tcg_players` et `wp_jfm_tcg_cards`<br>- Formulaire de login léger (Pseudo + PIN) en AJAX<br>- Page dédiée `/cartes-tcg` dans le thème WordPress |
| **Phase 2** | **Design & Ouverture des Boosters** | - Design CSS rétro des 20 premières cartes collector JoyStick FM<br>- Script d'ouverture de booster avec animations 3D et sons 8-bit<br>- Lien avec le temps d'écoute de la radio pour le gain de JoyCoins |
| **Phase 3** | **Enrichissement Minecraft** | - Installation du plugin `Multiverse-Core` et `EssentialsX` sur le serveur Docker 10.30.0.22<br>- Création du monde Lobby/Hub avec téléporteurs vers les mini-jeux<br>- Configuration d'une arène Hikabrain / Bedwars et du mode OneBlock |
| **Phase 4** | **Passerelle & Recette E5** | - Intégration du widget de statut Minecraft sur le site web JoyStick FM<br>- Tests complets de charge et validation des performances |

---

## 🏆 5. Valeur Ajoutée pour l'Examen BTS SIO SISR (Épreuve E5)

Présenter ces réalisations lors de la soutenance E5 démontrera des qualités exceptionnelles devant les inspecteurs et professionnels :
* **Polyvalence Système & Réseau :** Capacité à orchestrer à la fois des services d'infrastructure stricts (OPNsense, WireGuard, CIFS) et des services applicatifs modernes (Docker, Reverse-Proxy, Streaming multimédia, Bases de données relationnelles).
* **Capacité d'Innovation & Sens Produit :** Dépasser le cadre scolaire d'une simple consigne technique pour concevoir une expérience utilisateur complète, engageante et cohérente.
* **Maîtrise de l'Automatisation :** Tout est documenté, scripté, reproductible et résilient.
