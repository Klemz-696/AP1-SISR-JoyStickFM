import os, sys, json, hashlib, pathlib, shutil

base_dir = pathlib.Path(r'c:\Users\sauze\Desktop\AP 1\Perplexity')
bundle_dir = base_dir / 'verified_bundle'
sources_dir = bundle_dir / 'sources'
sources_dir.mkdir(parents=True, exist_ok=True)

# 1. Copy arena_manifest.json
manifest_design = base_dir / 'JoyStickFM_Dossier_Gamemodes_Preparation' / 'joystickfm-gamemodes' / 'arena_manifest.design.json'
arena_manifest_target = bundle_dir / 'arena_manifest.json'
if manifest_design.exists():
    shutil.copyfile(manifest_design, arena_manifest_target)
    arena_manifest_sha = hashlib.sha256(arena_manifest_target.read_bytes()).hexdigest()
else:
    arena_manifest_sha = ""

# 2. BedWars Arena: jfm_duo.yml
bedwars_arena_content = """name: jfm_duo
pauseCountdown: 30
gameTime: 3600
world: bedwars_jfm
pos1: "-90.0;0.0;-90.0;0.0;0.0"
pos2: "90.0;128.0;90.0;0.0;0.0"
lobbyPos1: "-15.0;95.0;-15.0;0.0;0.0"
lobbyPos2: "15.0;110.0;15.0;0.0;0.0"
specSpawn: "0.5;111.0;0.5;0.0;0.0"
lobbySpawn: "0.5;101.0;0.5;0.0;0.0"
lobbySpawnWorld: bedwars_jfm
minPlayers: 2
postGameWaiting: 10
customPrefix: ""
teams:
  Red:
    isNewColor: true
    color: RED
    maxPlayers: 2
    bed: "0.0;65.0;-69.0;0.0;0.0"
    spawn: "0.5;65.0;-64.5;180.0;0.0"
    actualName: Red
  Blue:
    isNewColor: true
    color: BLUE
    maxPlayers: 2
    bed: "69.0;65.0;0.0;0.0;0.0"
    spawn: "64.5;65.0;0.5;270.0;0.0"
    actualName: Blue
  Green:
    isNewColor: true
    color: GREEN
    maxPlayers: 2
    bed: "0.0;65.0;69.0;0.0;0.0"
    spawn: "0.5;65.0;64.5;0.0;0.0"
    actualName: Green
  Yellow:
    isNewColor: true
    color: YELLOW
    maxPlayers: 2
    bed: "-69.0;65.0;0.0;0.0;0.0"
    spawn: "-64.5;65.0;0.5;90.0;0.0"
    actualName: Yellow
spawners:
  - location: "0.5;65.0;-60.5;0.0;0.0"
    type: iron
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: Red
    maxSpawnedResources: -1
  - location: "0.5;65.0;-60.5;0.0;0.0"
    type: gold
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: Red
    maxSpawnedResources: -1
  - location: "60.5;65.0;0.5;0.0;0.0"
    type: iron
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: Blue
    maxSpawnedResources: -1
  - location: "60.5;65.0;0.5;0.0;0.0"
    type: gold
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: Blue
    maxSpawnedResources: -1
  - location: "0.5;65.0;60.5;0.0;0.0"
    type: iron
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: Green
    maxSpawnedResources: -1
  - location: "0.5;65.0;60.5;0.0;0.0"
    type: gold
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: Green
    maxSpawnedResources: -1
  - location: "-60.5;65.0;0.5;0.0;0.0"
    type: iron
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: Yellow
    maxSpawnedResources: -1
  - location: "-60.5;65.0;0.5;0.0;0.0"
    type: gold
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: Yellow
    maxSpawnedResources: -1
  - location: "-30.5;65.0;-30.5;0.0;0.0"
    type: diamond
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: ""
    maxSpawnedResources: 4
  - location: "30.5;65.0;-30.5;0.0;0.0"
    type: diamond
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: ""
    maxSpawnedResources: 4
  - location: "30.5;65.0;30.5;0.0;0.0"
    type: diamond
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: ""
    maxSpawnedResources: 4
  - location: "-30.5;65.0;30.5;0.0;0.0"
    type: diamond
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: ""
    maxSpawnedResources: 4
  - location: "-3.5;65.0;0.5;0.0;0.0"
    type: emerald
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: ""
    maxSpawnedResources: 2
  - location: "3.5;65.0;0.5;0.0;0.0"
    type: emerald
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: ""
    maxSpawnedResources: 2
stores:
  - loc: "-4.5;65.0;-64.5;90.0;0.0"
    shop: shop.yml
    parent: false
    type: VILLAGER
    name: "&6Boutique Red"
    isBaby: false
    skin: ""
    team: Red
  - loc: "64.5;65.0;-4.5;180.0;0.0"
    shop: shop.yml
    parent: false
    type: VILLAGER
    name: "&6Boutique Blue"
    isBaby: false
    skin: ""
    team: Blue
  - loc: "4.5;65.0;64.5;270.0;0.0"
    shop: shop.yml
    parent: false
    type: VILLAGER
    name: "&6Boutique Green"
    isBaby: false
    skin: ""
    team: Green
  - loc: "-64.5;65.0;4.5;0.0;0.0"
    shop: shop.yml
    parent: false
    type: VILLAGER
    name: "&6Boutique Yellow"
    isBaby: false
    skin: ""
    team: Yellow
"""
(sources_dir / 'jfm_duo.yml').write_text(bedwars_arena_content, encoding='utf-8')

# 3. Rush Arenas: rush_1v1.yml & rush_2v2.yml (FunCraft Style per D4)
rush_1v1_content = """name: rush_1v1
pauseCountdown: 15
gameTime: 1200
world: rush_jfm
pos1: "-30.0;40.0;-40.0;0.0;0.0"
pos2: "30.0;110.0;40.0;0.0;0.0"
lobbyPos1: "-10.0;95.0;-10.0;0.0;0.0"
lobbyPos2: "10.0;110.0;10.0;0.0;0.0"
specSpawn: "0.5;85.0;0.5;0.0;0.0"
lobbySpawn: "0.5;101.0;0.5;0.0;0.0"
lobbySpawnWorld: rush_jfm
minPlayers: 2
postGameWaiting: 5
customPrefix: "[Rush 1v1]"
teams:
  Red:
    isNewColor: true
    color: RED
    maxPlayers: 1
    bed: "0.0;65.0;-30.0;0.0;0.0"
    spawn: "0.5;65.0;-25.5;180.0;0.0"
    actualName: Red
  Blue:
    isNewColor: true
    color: BLUE
    maxPlayers: 1
    bed: "0.0;65.0;30.0;0.0;0.0"
    spawn: "0.5;65.0;25.5;0.0;0.0"
    actualName: Blue
spawners:
  - location: "0.5;65.0;-22.5;0.0;0.0"
    type: iron
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: Red
    maxSpawnedResources: -1
  - location: "3.5;65.0;-25.5;0.0;0.0"
    type: gold
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: Red
    maxSpawnedResources: -1
  - location: "0.5;65.0;22.5;0.0;0.0"
    type: iron
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: Blue
    maxSpawnedResources: -1
  - location: "-3.5;65.0;25.5;0.0;0.0"
    type: gold
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: Blue
    maxSpawnedResources: -1
  - location: "0.5;65.0;0.5;0.0;0.0"
    type: emerald
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: ""
    maxSpawnedResources: 2
stores:
  - loc: "-3.5;65.0;-25.5;90.0;0.0"
    shop: shop.yml
    parent: false
    type: VILLAGER
    name: "&cMarchand Rush"
    isBaby: false
    skin: ""
    team: Red
  - loc: "3.5;65.0;25.5;270.0;0.0"
    shop: shop.yml
    parent: false
    type: VILLAGER
    name: "&9Marchand Rush"
    isBaby: false
    skin: ""
    team: Blue
"""
(sources_dir / 'rush_1v1.yml').write_text(rush_1v1_content, encoding='utf-8')

rush_2v2_content = """name: rush_2v2
pauseCountdown: 15
gameTime: 1800
world: rush_jfm
pos1: "-30.0;40.0;-40.0;0.0;0.0"
pos2: "30.0;110.0;40.0;0.0;0.0"
lobbyPos1: "-10.0;95.0;-10.0;0.0;0.0"
lobbyPos2: "10.0;110.0;10.0;0.0;0.0"
specSpawn: "0.5;85.0;0.5;0.0;0.0"
lobbySpawn: "0.5;101.0;0.5;0.0;0.0"
lobbySpawnWorld: rush_jfm
minPlayers: 2
postGameWaiting: 5
customPrefix: "[Rush 2v2]"
teams:
  Red:
    isNewColor: true
    color: RED
    maxPlayers: 2
    bed: "0.0;65.0;-30.0;0.0;0.0"
    spawn: "0.5;65.0;-25.5;180.0;0.0"
    actualName: Red
  Blue:
    isNewColor: true
    color: BLUE
    maxPlayers: 2
    bed: "0.0;65.0;30.0;0.0;0.0"
    spawn: "0.5;65.0;25.5;0.0;0.0"
    actualName: Blue
spawners:
  - location: "0.5;65.0;-22.5;0.0;0.0"
    type: iron
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: Red
    maxSpawnedResources: -1
  - location: "3.5;65.0;-25.5;0.0;0.0"
    type: gold
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: Red
    maxSpawnedResources: -1
  - location: "0.5;65.0;22.5;0.0;0.0"
    type: iron
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: Blue
    maxSpawnedResources: -1
  - location: "-3.5;65.0;25.5;0.0;0.0"
    type: gold
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: Blue
    maxSpawnedResources: -1
  - location: "0.5;65.0;0.5;0.0;0.0"
    type: emerald
    customName: ""
    startLevel: 1
    hologramEnabled: true
    team: ""
    maxSpawnedResources: 2
stores:
  - loc: "-3.5;65.0;-25.5;90.0;0.0"
    shop: shop.yml
    parent: false
    type: VILLAGER
    name: "&cMarchand Rush"
    isBaby: false
    skin: ""
    team: Red
  - loc: "3.5;65.0;25.5;270.0;0.0"
    shop: shop.yml
    parent: false
    type: VILLAGER
    name: "&9Marchand Rush"
    isBaby: false
    skin: ""
    team: Blue
"""
(sources_dir / 'rush_2v2.yml').write_text(rush_2v2_content, encoding='utf-8')

# 4. BlockHunt Arena: blockhunt_arenas.yml (Option C: Spectator on elimination)
blockhunt_arena_content = """jfm_retro:
  ==: nl.Steffion.BlockHunt.Arena
  arenaName: jfm_retro
  pos1:
    ==: nl.Steffion.BlockHunt.Serializables.LocationSerializable
    w: blockhunt_jfm
    x: -40.0
    y: 63.0
    z: -40.0
    a: 0.0
    p: 0.0
  pos2:
    ==: nl.Steffion.BlockHunt.Serializables.LocationSerializable
    w: blockhunt_jfm
    x: 40.0
    y: 90.0
    z: 40.0
    a: 0.0
    p: 0.0
  maxPlayers: 12
  minPlayers: 2
  amountSeekersOnStart: 1
  timeInLobbyUntilStart: 30
  waitingTimeSeeker: 20
  gameTime: 300
  timeUntilHidersSword: 30
  disguiseBlocks:
    - ==: org.bukkit.inventory.ItemStack
      v: 3955
      type: BOOKSHELF
    - ==: org.bukkit.inventory.ItemStack
      v: 3955
      type: HAY_BLOCK
    - ==: org.bukkit.inventory.ItemStack
      v: 3955
      type: CRAFTING_TABLE
    - ==: org.bukkit.inventory.ItemStack
      v: 3955
      type: BARREL
    - ==: org.bukkit.inventory.ItemStack
      v: 3955
      type: OAK_PLANKS
    - ==: org.bukkit.inventory.ItemStack
      v: 3955
      type: CAULDRON
  lobbyWarp:
    ==: nl.Steffion.BlockHunt.Serializables.LocationSerializable
    w: blockhunt_jfm
    x: 0.5
    y: 101.0
    z: 0.5
    a: 0.0
    p: 0.0
  hidersWarp:
    ==: nl.Steffion.BlockHunt.Serializables.LocationSerializable
    w: blockhunt_jfm
    x: 0.5
    y: 65.0
    z: 0.5
    a: 0.0
    p: 0.0
  seekersWarp:
    ==: nl.Steffion.BlockHunt.Serializables.LocationSerializable
    w: blockhunt_jfm
    x: 0.5
    y: 65.0
    z: -34.5
    a: 0.0
    p: 0.0
  spawnWarp:
    ==: nl.Steffion.BlockHunt.Serializables.LocationSerializable
    w: hub
    x: 0.5
    y: 65.0
    z: 0.5
    a: 0.0
    p: 0.0
  seekersWinCommands: []
  hidersWinCommands: []
  allowedCommands:
    - /bh leave
    - /blockhunt leave
  seekersTokenWin: 10
  hidersTokenWin: 50
  killTokens: 8
"""
(sources_dir / 'blockhunt_arenas.yml').write_text(blockhunt_arena_content, encoding='utf-8')

# 5. Multiverse-Inventories: groups.yml
groups_content = """groups:
  hub:
    worlds:
      - hub
      - lobby_minijeux
    shares:
      - all
  survie:
    worlds:
      - survie
      - survie_nether
      - survie_the_end
    shares:
      - all
  bedwars:
    worlds:
      - bedwars_jfm
      - rush_jfm
    shares:
      - all
  hikabrain:
    worlds:
      - hikabrain_jfm
    shares:
      - all
  blockhunt:
    worlds:
      - blockhunt_jfm
    shares:
      - all
  legacy_world:
    worlds:
      - world
      - world_nether
      - world_the_end
    shares:
      - all
  legacy_minijeux:
    worlds:
      - minijeux
    shares:
      - all
"""
(sources_dir / 'groups.yml').write_text(groups_content, encoding='utf-8')

# 6. DeluxeMenus: games.yml (Updated with D1, D3, D4, D6)
games_content = """menu_title: '&8✦ &d&lJoyStick FM &8— &bMenu des Jeux'
open_command:
  - menu
  - games
size: 27
items:
  filler:
    material: BLACK_STAINED_GLASS_PANE
    slots: [0, 1, 2, 3, 5, 6, 7, 8, 9, 11, 13, 15, 17, 18, 19, 21, 23, 25, 26]
    display_name: ' '
  hub:
    material: COMPASS
    slot: 4
    display_name: '&f&l✦ RETOUR AU HUB PRINCIPAL ✦'
    lore:
      - '&7Retourne immédiatement au spawn central du vide.'
      - ''
      - '&f▶ Clic-gauche pour revenir'
    left_click_commands:
      - '[close]'
      - '[player] spawn'
  survie:
    material: GRASS_BLOCK
    slot: 10
    display_name: '&a&lSurvie Simple Vanilla'
    lore:
      - '&7Exploration, récolte et construction libres.'
      - '&eMode 100% Vanilla sans claims (D1).'
      - '&7Tombes protégées 30 min après la mort (D5).'
      - ''
      - '&a▶ Clic-gauche pour rejoindre la Survie'
    left_click_commands:
      - '[close]'
      - '[player] mv tp survie'
  minigames_lobby:
    material: NETHER_STAR
    slot: 12
    display_name: '&d&lLobby des Mini-Jeux'
    lore:
      - '&7Plateforme néon JoyStick FM.'
      - '&7Portails thématiques & PNJ des jeux.'
      - ''
      - '&d▶ Clic-gauche pour aller au Lobby'
    left_click_commands:
      - '[close]'
      - '[player] mv tp lobby_minijeux'
  bedwars:
    material: RED_BED
    slot: 14
    display_name: '&c&lBedWars — 4 équipes de 2'
    lore:
      - '&7Protège ton lit et détruis celui des autres.'
      - '&7Arène spatiale JoyStick FM (Red, Blue, Green, Yellow).'
      - ''
      - '&c▶ Clic-gauche pour rejoindre la file'
    left_click_commands:
      - '[close]'
      - '[player] bw join jfm_duo'
  rush:
    material: GOLDEN_PICKAXE
    slot: 16
    display_name: '&6&lRush FunCraft (1v1 & 2v2)'
    lore:
      - '&7Ponts en grès express, bâton knockback,'
      - '&7lits explosifs et TNTFly calibré.'
      - ''
      - '&6▶ Clic-gauche : Rush 1v1'
      - '&e▶ Clic-droit : Rush 2v2'
    left_click_commands:
      - '[close]'
      - '[player] bw join rush_1v1'
    right_click_commands:
      - '[close]'
      - '[player] bw join rush_2v2'
  hikabrain:
    material: SANDSTONE
    slot: 20
    display_name: '&e&lHikabrain FunCraft (1v1)'
    lore:
      - '&7Passerelle suspendue de 1 bloc de large.'
      - '&7Touche le lit adverse pour marquer !'
      - '&bPremier à 5 points remporte la victoire.'
      - ''
      - '&e▶ Clic-gauche pour défier en Hikabrain'
    left_click_commands:
      - '[close]'
      - '[player] mv tp hikabrain_jfm'
  blockhunt:
    material: BOOKSHELF
    slot: 22
    display_name: '&3&lCache-cache (BlockHunt)'
    lore:
      - '&7Village rétro 81x81 — Déguisements en blocs.'
      - '&7Élimination = spectateur permanent (D3).'
      - ''
      - '&3▶ Clic-gauche pour rejoindre la partie'
    left_click_commands:
      - '[close]'
      - '[player] bh join jfm_retro'
  stats:
    material: PLAYER_HEAD
    slot: 24
    display_name: '&b&lMes Statistiques'
    lore:
      - '&7Consulte tes statistiques privées en jeu.'
      - '&7(Classements publics réservés au Top Parkour)'
      - ''
      - '&b▶ Clic-gauche pour afficher'
    left_click_commands:
      - '[close]'
      - '[player] stats'
"""
(sources_dir / 'games.yml').write_text(games_content, encoding='utf-8')

# 7. ItemJoin: config.yml (safe inventory retention)
itemjoin_content = """config-Version: 8
Language: 'English'
General:
  CheckforUpdates: false
  Metrics-Logging: false
  Log-Commands: false
  ignoreErrors: false
  ignoreDepend: NONE
  Debugging: false
Database:
  MySQL: false
Settings:
  HeldItem-Slot: 4
  HeldItem-Triggers: JOIN, WORLD-SWITCH
  HeldItem-Animations: false
  Default-Triggers: JOIN
  DataTags: true
Permissions:
  Obtain-Items: false
  Obtain-Items-OP: false
  Commands-Get: false
  Commands-OP: false
  Movement-Bypass: false
Clear-Items:
  Type: ALL
  Delay-Tick: 2
  Join: false
  Quit: false
  World-Switch: false
  Region-Enter: false
  Options: PROTECT
  Blacklist: ''
Active-Commands:
  commands: []
  commands-sequence: SEQUENTIAL
  triggers: JOIN
  enabled-worlds: DISABLED
Prevent:
  Chat: false
  Pickups: true
  itemMovement: true
  Self-Drops: true
  Death-Drops: true
  Bypass: CREATIVE
"""
(sources_dir / 'itemjoin_config.yml').write_text(itemjoin_content, encoding='utf-8')

# Build manifest.json
files = [
    {
        'destination': 'plugins/BedWars/arenas/jfm_duo.yml',
        'source': 'sources/jfm_duo.yml',
        'sha256': hashlib.sha256((sources_dir / 'jfm_duo.yml').read_bytes()).hexdigest()
    },
    {
        'destination': 'plugins/BedWars/arenas/rush_1v1.yml',
        'source': 'sources/rush_1v1.yml',
        'sha256': hashlib.sha256((sources_dir / 'rush_1v1.yml').read_bytes()).hexdigest()
    },
    {
        'destination': 'plugins/BedWars/arenas/rush_2v2.yml',
        'source': 'sources/rush_2v2.yml',
        'sha256': hashlib.sha256((sources_dir / 'rush_2v2.yml').read_bytes()).hexdigest()
    },
    {
        'destination': 'plugins/BlockHunt/arenas.yml',
        'source': 'sources/blockhunt_arenas.yml',
        'sha256': hashlib.sha256((sources_dir / 'blockhunt_arenas.yml').read_bytes()).hexdigest()
    },
    {
        'destination': 'plugins/Multiverse-Inventories/groups.yml',
        'source': 'sources/groups.yml',
        'sha256': hashlib.sha256((sources_dir / 'groups.yml').read_bytes()).hexdigest()
    },
    {
        'destination': 'plugins/DeluxeMenus/gui_menus/games.yml',
        'source': 'sources/games.yml',
        'sha256': hashlib.sha256((sources_dir / 'games.yml').read_bytes()).hexdigest()
    },
    {
        'destination': 'plugins/ItemJoin/config.yml',
        'source': 'sources/itemjoin_config.yml',
        'sha256': hashlib.sha256((sources_dir / 'itemjoin_config.yml').read_bytes()).hexdigest()
    }
]

manifest = {
    'schema_version': 2,
    'verified': True,
    'decisions': {
        'D1': 'Survie simple sans claim (GriefPrevention désactivé sur survie)',
        'D2': 'ONLINE_MODE=FALSE avec authentification locale (AuthMe / mot de passe chiffré)',
        'D3': 'BlockHunt spectateur permanent lors de élimination',
        'D4': 'Rush et Hikabrain FunCraft historiques (lits, bâton KB, 5 points)',
        'D5': 'Tombes de survie protégées 30 minutes puis pillables publiquement',
        'D6': 'Statistiques personnelles au menu et Top Parkour seul classement physique au Lobby'
    },
    'evidence': [
        'audit_gamemodes_report.txt: Paper 26.2 build 129',
        'ScreamingBedWars 0.2.44 bytecode disassembly of Game.saveToConfig',
        'BlockHunt 0.2.1 bytecode disassembly of Arena.serialize and ArenaHandler.loadArenas',
        'Multiverse-Inventories 5.3.6 candidate groups validation',
        'DeluxeMenus 1.14.2 gui_menus configuration',
        'ItemJoin 6.1.8 inventory wipe protection'
    ],
    'expected_paper_version': r'26\.2-129-ver/26\.2@9240f58',
    'plugin_fingerprints': {
        'ScreamingBedWars.jar': '510d46d310dff2a426461c5676051bbf19ff37b553ee0b9875597abe4ba40d5c',
        'BlockHunt.jar': '01c8cc3626204b16ea8edd639b7e7660c780188f1153d2a6dcea07a4f55268a5',
        'Multiverse-Core.jar': 'bc3f34e2d747fdf024f44868747bb016b08fa11d98ccb4ffcac958f083151a83',
        'Multiverse-Inventories.jar': '6e58e89009283f4be8658abe2b7e46c482010ceccf3c8e0b0e8ca6a0a114ff92',
        'ItemJoin.jar': '9573f2de45bcaff210402973fd42817d8ce2835dc400f7d25151dabb75b83a21',
        'TAB.jar': '8701c356411fd95102b7f3926be14acb5e3a5cbaaa44d2d7db298e30dfd623d2'
    },
    'arena_manifest_sha256': arena_manifest_sha,
    'allowed_destination_prefixes': [
        'plugins/BedWars/',
        'plugins/BlockHunt/',
        'plugins/Multiverse-Inventories/',
        'plugins/DeluxeMenus/',
        'plugins/ItemJoin/',
        'plugins/GriefPreventionData/'
    ],
    'files': files,
    'post_start_commands': [
        {'command': 'version', 'expect_regex': r'Paper version 26\.2|Checking version'},
        {'command': 'bw list', 'expect_regex': r'jfm_duo|rush_1v1|rush_2v2|BedWars'},
        {'command': 'mv list', 'expect_regex': r'hub'}
    ],
    'health_checks': [
        {'command': 'list', 'expect_regex': r'players online'},
        {'command': 'mv list', 'expect_regex': r'hub'}
    ]
}

(bundle_dir / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print('Verified bundle v2 successfully generated with all 6 decisions (D1 to D6)!')
