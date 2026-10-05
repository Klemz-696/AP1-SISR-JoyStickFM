#!/bin/bash
set -e

echo "=========================================================="
echo " 🚀 CONFIGURATION AUTOMATIQUE DE L'EXPÉRIENCE MINECRAFT"
echo "=========================================================="

DATA_DIR="/opt/minecraft/data"
PLUGINS_DIR="${DATA_DIR}/plugins"

mkdir -p "${PLUGINS_DIR}/DeluxeMenus/gui_menus"
mkdir -p "${PLUGINS_DIR}/ItemJoin"
mkdir -p "${PLUGINS_DIR}/LPC"
mkdir -p "${PLUGINS_DIR}/TAB"
mkdir -p "${PLUGINS_DIR}/Essentials"

# 1. DeluxeMenus
echo "[1/6] Configuration de DeluxeMenus..."
cat << 'EOF' > "${PLUGINS_DIR}/DeluxeMenus/config.yml"
check_updates: false
menus:
  games:
    file: games.yml
EOF

cat << 'EOF' > "${PLUGINS_DIR}/DeluxeMenus/gui_menus/games.yml"
menu_title: '&8&l[ &6JoyStick & Co &8- &eModes de Jeu &8&l]'
open_command:
  - games
  - menu
size: 27
items:
  'filler':
    material: BLACK_STAINED_GLASS_PANE
    slots:
      - 0
      - 1
      - 2
      - 3
      - 4
      - 5
      - 6
      - 7
      - 8
      - 9
      - 10
      - 12
      - 14
      - 16
      - 17
      - 18
      - 19
      - 20
      - 21
      - 23
      - 24
      - 25
      - 26
    display_name: ' '
  'survival':
    material: GRASS_BLOCK
    slot: 11
    display_name: '&a&l🌍 MONDE SURVIE'
    lore:
      - '&7Aventure multijoueur classique !'
      - '&8▸ &fClaims de terrains protégés'
      - '&8▸ &fÉconomie locale et commerces'
      - '&8▸ &fRessources et constructions libres'
      - ''
      - '&a➜ Clique pour rejoindre la Survie !'
    left_click_commands:
      - '[close]'
      - '[player] mv tp world'
      - '[sound] ENTITY_PLAYER_LEVELUP'
  'bedwars':
    material: RED_BED
    slot: 13
    display_name: '&c&l🛏️ MINI-JEU BEDWARS'
    lore:
      - '&7Protège ton lit et élimine tes adversaires !'
      - '&8▸ &fGénérateurs de ressources automatiques'
      - '&8▸ &fBoutique d armes et améliorations'
      - '&8▸ &fArènes dynamiques'
      - ''
      - '&c➜ Clique pour rejoindre BedWars !'
    left_click_commands:
      - '[close]'
      - '[player] mv tp minijeux'
      - '[sound] ENTITY_EXPERIENCE_ORB_PICKUP'
  'blockhunt':
    material: BOOKSHELF
    slot: 15
    display_name: '&e&l🎭 CACHE-CACHE (BLOCKHUNT)'
    lore:
      - '&7Transforme-toi en bloc pour te cacher !'
      - '&8▸ &fÉchappe aux chasseurs avant la fin'
      - '&8▸ &fArènes immersives et stratégie'
      - ''
      - '&e➜ Clique pour rejoindre le Cache-Cache !'
    left_click_commands:
      - '[close]'
      - '[player] bh join'
      - '[sound] ENTITY_CHICKEN_EGG'
  'spawn':
    material: NETHER_STAR
    slot: 22
    display_name: '&b&l🏛️ RETOUR AU LOBBY'
    lore:
      - '&7Retourne instantanément au spawn du Hub.'
      - ''
      - '&b➜ Clique pour te téléporter !'
    left_click_commands:
      - '[close]'
      - '[player] spawn'
      - '[sound] ENTITY_ENDERMAN_TELEPORT'
EOF

# 2. ItemJoin
echo "[2/6] Configuration de ItemJoin..."
cat << 'EOF' > "${PLUGINS_DIR}/ItemJoin/items.yml"
items-v4:
  game-selector:
    id: COMPASS
    slot: 4
    name: '&6&l✦ MENU DES JEUX ✦ &7(Clic-Droit)'
    lore:
      - '&7Clique pour choisir ton mode de jeu :'
      - '&8▸ &aSurvie'
      - '&8▸ &cBedWars'
      - '&8▸ &eCache-Cache'
      - ''
      - '&e➜ Clic-droit pour ouvrir le menu'
    commands:
      right-click:
        - 'player: menu'
      left-click:
        - 'player: menu'
    enabled-worlds:
      - hub
      - hub_void
    triggers:
      - join
      - respawn
      - world-change
    itemflags:
      - HIDE_ATTRIBUTES
    give-on-world-switch: true
    clear-on-world-switch: true
    drop-full: false
    item-movement: false
    modify-item: false
    movement-type: false
    drop-creative: false
    death-drops: false
EOF

# 3. LPC (Chat format)
echo "[3/6] Configuration de LPC (Chat)..."
cat << 'EOF' > "${PLUGINS_DIR}/LPC/config.yml"
chat-format: "{prefix}{name}&8: &f{message}"
group-formats: {}
EOF

# 4. TAB (Scoreboard & Tablist)
echo "[4/6] Configuration de TAB (Scoreboard & Tablist)..."
cat << 'EOF' > "${PLUGINS_DIR}/TAB/config.yml"
header-footer:
  enabled: true
  header:
    - "&6&l★ JOYSTICK & CO ★ &7- &bServeur Officiel"
    - "&7Connecté sur le réseau AP1 BTS SIO"
    - ""
  footer:
    - ""
    - "&7WebRadio & Actualités : &ewww.klemz.live"

scoreboard:
  enabled: true
  toggle-command: /sb
  remember-toggle-choice: false
  hidden-by-default: false
  use-numbers: false
  static-number: 0
  delay-on-join-milliseconds: 0
  scoreboards:
    default:
      title: "&6&lJOYSTICK & CO"
      lines:
        - "&7&m────────────────────"
        - "&fJoueur : &e%player_name%"
        - "&fGrade : %luckperms_prefix%"
        - "&fMonde : &a%world%"
        - "&fEn ligne : &b%online%/20"
        - "&7&m────────────────────"
        - "&ewww.klemz.live"

placeholders:
  date-format: "dd/MM/yyyy"
  time-format: "HH:mm:ss"
  time-offset: 2
EOF

# 5. Message d'accueil Essentials
echo "[5/6] Configuration du message de bienvenue Essentials..."
cat << 'EOF' > "${PLUGINS_DIR}/Essentials/motd.txt"
&8&m─────────────────────────────────────────────────────────────
&6&l               ★ JOYSTICK & CO — SERVEUR OFFICIEL ★
&7       Bienvenue sur l'infrastructure Minecraft de la WebRadio !
&8▸ &fJoueur : &e{PLAYER}
&8▸ &fSite & Radio : &bhttps://webradio.klemz.live
&8▸ &fPour jouer : &aUtilise la Boussole dans ta main &f(Clic-Droit) !
&8&m─────────────────────────────────────────────────────────────
EOF

# Permissions
chown -R 1000:1000 "${PLUGINS_DIR}"
chmod -R 755 "${PLUGINS_DIR}"

# 6. Redémarrage du conteneur Minecraft
echo "[6/6] Redémarrage du serveur Minecraft pour charger les nouveaux modules..."
docker restart minecraft_ap1

echo "Attente de la fin du démarrage du serveur..."
sleep 8
until docker logs --tail 10 minecraft_ap1 2>&1 | grep -q "Done"; do
    echo "Démarrage en cours..."
    sleep 3
done

echo "Serveur démarré avec succès !"

# Configuration RCON LuckPerms
echo "Configuration des rôles et permissions LuckPerms..."
docker exec -i minecraft_ap1 rcon-cli lp creategroup joueur 2>/dev/null || true
docker exec -i minecraft_ap1 rcon-cli lp creategroup vip 2>/dev/null || true
docker exec -i minecraft_ap1 rcon-cli lp creategroup admin 2>/dev/null || true

# Préfixes
docker exec -i minecraft_ap1 rcon-cli lp group default meta setprefix 10 "&7[Joueur] &f"
docker exec -i minecraft_ap1 rcon-cli lp group joueur meta setprefix 20 "&7[Joueur] &f"
docker exec -i minecraft_ap1 rcon-cli lp group vip meta setprefix 50 "&6[VIP] &e"
docker exec -i minecraft_ap1 rcon-cli lp group admin meta setprefix 100 "&c[Admin] &c"

# Permissions
docker exec -i minecraft_ap1 rcon-cli lp group default permission set essentials.spawn true
docker exec -i minecraft_ap1 rcon-cli lp group default permission set essentials.motd true
docker exec -i minecraft_ap1 rcon-cli lp group default permission set deluxemenus.open.games true
docker exec -i minecraft_ap1 rcon-cli lp group default permission set deluxemenus.open.menu true
docker exec -i minecraft_ap1 rcon-cli lp group default permission set itemjoin.use true
docker exec -i minecraft_ap1 rcon-cli lp group default permission set multiverse.access.* true
docker exec -i minecraft_ap1 rcon-cli lp group default permission set lpc.chatcolor true

docker exec -i minecraft_ap1 rcon-cli lp group admin permission set '*' true

# Assigner Klemz_696 comme Admin
docker exec -i minecraft_ap1 rcon-cli lp user Klemz_696 parent set admin

echo "=========================================================="
echo " ✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !"
echo "=========================================================="
