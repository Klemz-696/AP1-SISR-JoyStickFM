# 🛠 Spécifications Techniques & Architecture du Jeu JoyStick FM
**Document Technique de Référence**  
**Chemin :** `Documentation_Avancement_Jeu_Webradio/01_ARCHITECTURE_TECHNIQUE_ET_SPECIFICATIONS.md`

---

## 1. Architecture Modulaire

Le jeu est composé de deux composants interdépendants créés sur-mesure :

```
wp-content/
├── themes/
│   └── joystickfm-theme/
│       ├── page-jeux.php          <-- Template Autonome Plein Écran (Standalone 100vh)
│       ├── header.php             <-- Liens target="_blank" vers /jeux/ et badge profil
│       └── footer.php             <-- Liens target="_blank" dans la barre mobile et footer
└── plugins/
    └── joystickfm-games/
        ├── joystickfm-games.php   <-- Initialisation, création des tables MariaDB
        ├── includes/
        │   ├── class-jfm-games-auth.php   <-- Sessions, PIN, Codes de secours, Suppression de compte
        │   ├── class-jfm-games-tcg.php    <-- Catalogue des 40 cartes, tirage, tri de rareté
        │   ├── class-jfm-games-pages.php  <-- Rendus HTML, endpoints AJAX, modales
        │   └── class-jfm-games-utils.php  <-- Fonctions d'aide et formatage
        └── assets/
            ├── css/
            │   └── games-portal.css       <-- Moteur 3D CSS (perspective, flip, auras, cockpit)
            └── js/
                ├── portal.js              <-- Moteur d'ouverture, pioche carte par carte, sons
                └── games-arcade.js        <-- Moteur physique HTML5 Canvas (Catapulte)
```

---

## 2. Modèle Relationnel MariaDB (`joystickfm_db`)

### Table `wp_jfm_players`
- `id` (BIGINT AUTO_INCREMENT PRIMARY KEY)
- `username` (VARCHAR 50 UNIQUE) : Identifiant de connexion normalisé en minuscules.
- `username_display` (VARCHAR 50) : Nom d'affichage respectant la casse du joueur.
- `pin_hash` (VARCHAR 255) : Hachage sécurisé du code PIN (`wp_hash_password`).
- `recovery_code_hash` (VARCHAR 255) : Hachage du code de secours hexadécimal à 8 caractères.
- `joycoins` (INT DEFAULT 100) : Solde de monnaie virtuelle pour acheter des boosters.
- `xp` (INT DEFAULT 0) : Points d'expérience gagnés en ouvrant des boosters ou en jouant.
- `free_boosters_available` (INT DEFAULT 10) : Boosters offerts à l'inscription.
- `last_free_booster_claim` (DATETIME) : Horodatage du dernier booster quotidien réclamé.
- `avatar_url` (TEXT) : Photo personnalisée Base64 Data URL ou référence de carte `card:<id>`.
- `created_at` (DATETIME)

### Table `wp_jfm_tcg_cards`
- `id` (INT AUTO_INCREMENT PRIMARY KEY)
- `slug` (VARCHAR 50 UNIQUE) : Identifiant technique (ex: `gameboy-dmg`, `zelda-snes`).
- `name` (VARCHAR 100) : Nom complet de la carte.
- `category` (ENUM: `hardware`, `hero`, `legend`, `item`).
- `rarity` (ENUM: `common`, `rare`, `epic`, `legendary`).
- `power` (INT) : Valeur de puissance (10 à 99).
- `quote` (TEXT) : Citation ou description rétro.
- `icon` (VARCHAR 20) : Emoji ou glyphe thématique.
- `bg_gradient` (VARCHAR 100) : Style CSS de dégradé néon adapté à la catégorie.

### Table `wp_jfm_player_cards`
- `id` (BIGINT AUTO_INCREMENT PRIMARY KEY)
- `player_id` (BIGINT REFERENCES `wp_jfm_players(id)`)
- `card_id` (INT REFERENCES `wp_jfm_tcg_cards(id)`)
- `quantity` (INT DEFAULT 1) : Gestion des doublons (recyclables contre des JoyCoins).
- `is_holo` (TINYINT(1) DEFAULT 0) : Indicateur de variante brillante holographique (10% de chance).
- `obtained_at` (DATETIME)

### Table `wp_jfm_player_sessions`
- `id` (BIGINT AUTO_INCREMENT PRIMARY KEY)
- `player_id` (BIGINT)
- `session_token` (VARCHAR 64 UNIQUE) : Token de session cryptographique transmis par cookie sécurisé `jfm_player_token`.
- `expires_at` (DATETIME)
- `ip_address` (VARCHAR 45)

---

## 3. Endpoints AJAX WordPress (`admin-ajax.php`)

Tous les appels AJAX utilisent la validation de nonces CSRF (`wp_create_nonce` / `check_ajax_referer`) :

| Action AJAX | Rôle Technique | Paramètres | Réponse JSON |
| :--- | :--- | :--- | :--- |
| `jfm_login` | Authentification joueur | `username`, `pin`, `remember_me` | `{success: true, redirect_url}` |
| `jfm_register` | Création de compte | `username`, `pin` | `{success: true, recovery_code}` |
| `jfm_logout` | Révocation de session | - | `{success: true}` |
| `jfm_recover` | Réinitialisation PIN | `username`, `recovery_code`, `new_pin` | `{success: true}` |
| `jfm_delete_account` | Purge intégrale du compte | - (Session active) | `{success: true}` |
| `jfm_open_booster` | Déballage d'un booster | - (Vérifie solde boosters) | `{success: true, cards: [...sorted]}` |
| `jfm_buy_booster` | Achat contre 50 JoyCoins | - (Vérifie solde coins) | `{success: true, cards: [...sorted]}` |
| `jfm_claim_free_booster`| Réclamation booster périodique | - (Vérifie cooldown) | `{success: true}` |
| `jfm_get_collection` | Liste des cartes du joueur | - | `{success: true, catalog, owned}` |
| `jfm_recycle_card` | Recyclage doublon (+15 coins) | `card_id` | `{success: true, joycoins}` |
| `jfm_update_avatar` | Enregistrement de l'avatar | `avatar_url` (Base64 ou `card:id`) | `{success: true}` |
| `jfm_reset_avatar` | Rétablissement avatar par défaut | - | `{success: true}` |

---

## 4. Logique de Pioche & Tri de Rareté

Pour garantir une expérience spectaculaire (le « Reveal Thrill ») :
1. **Génération côté serveur :** La méthode `JFM_Games_TCG::open_booster($player_id)` tire 5 cartes au hasard en garantissant au moins une carte de rareté Rare ou supérieure.
2. **Tri ordonné :** Avant de renvoyer le résultat, les cartes sont triées par rareté croissante :
   - Poids 1 : `common`
   - Poids 2 : `rare`
   - Poids 3 : `epic`
   - Poids 4 : `legendary`
3. **Double sécurité côté client :** `portal.js` applique un second tri préventif afin qu'une carte Légendaire ne soit jamais révélée en premier, garantissant le suspense jusqu'à la 5ème carte.
