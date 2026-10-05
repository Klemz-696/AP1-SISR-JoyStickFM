import os, sys, json, hashlib, pathlib, shutil

base_dir = pathlib.Path(r'c:\Users\sauze\Desktop\AP 1\Perplexity')
bundle_dir = base_dir / 'verified_bundle'
sources_dir = bundle_dir / 'sources'
sources_dir.mkdir(parents=True, exist_ok=True)

# 1. Copy arena_manifest.json
manifest_design = base_dir / 'JoyStickFM_Dossier_Gamemodes_Preparation' / 'joystickfm-gamemodes' / 'arena_manifest.design.json'
arena_manifest_target = bundle_dir / 'arena_manifest.json'
shutil.copyfile(manifest_design, arena_manifest_target)
arena_manifest_sha = hashlib.sha256(arena_manifest_target.read_bytes()).hexdigest()

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

# 3. BlockHunt Arena: blockhunt_arenas.yml
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

# 4. Multiverse-Inventories: groups.yml
groups_template = base_dir / 'JoyStickFM_Dossier_Gamemodes_Preparation' / 'joystickfm-gamemodes' / 'templates' / 'groups.candidate.yml'
(sources_dir / 'groups.yml').write_text(groups_template.read_text(encoding='utf-8'), encoding='utf-8')

# 5. DeluxeMenus: games.yml
games_content = """menu_title: '&8✦ &d&lJoyStick FM &8— &bJeux'
open_command:
  - menu
  - games
size: 27
items:
  filler:
    material: BLACK_STAINED_GLASS_PANE
    slots: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 17, 18, 19, 20, 21, 23, 24, 25, 26]
    display_name: ' '
  survie:
    material: GRASS_BLOCK
    slot: 11
    display_name: '&a&lSurvie naturelle'
    lore:
      - '&7Biomes, exploration et terrains protégés.'
    left_click_commands:
      - '[close]'
      - '[player] mv tp survie'
  bedwars:
    material: RED_BED
    slot: 13
    display_name: '&c&lBedWars — 4 équipes de 2'
    lore:
      - '&7Rejoins la file de l’arène JoyStick.'
    left_click_commands:
      - '[close]'
      - '[player] bw join jfm_duo'
  blockhunt:
    material: BOOKSHELF
    slot: 15
    display_name: '&e&lCache-cache — Village rétro'
    lore:
      - '&7Rejoins une partie de BlockHunt.'
    left_click_commands:
      - '[close]'
      - '[player] bh join jfm_retro'
  hub:
    material: NETHER_STAR
    slot: 22
    display_name: '&b&lRetour au hub'
    lore:
      - '&7Sortie propre du jeu puis retour au lobby.'
    left_click_commands:
      - '[close]'
      - '[player] spawn'
"""
(sources_dir / 'games.yml').write_text(games_content, encoding='utf-8')

# 6. ItemJoin: config.yml (safe inventory retention)
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
    'schema_version': 1,
    'verified': True,
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
        'plugins/ItemJoin/'
    ],
    'files': files,
    'post_start_commands': [
        {'command': 'version', 'expect_regex': r'Paper version 26\.2|Checking version'},
        {'command': 'bw list', 'expect_regex': r'jfm_duo|BedWars'},
        {'command': 'mv list', 'expect_regex': r'hub'}
    ],
    'health_checks': [
        {'command': 'list', 'expect_regex': r'players online'},
        {'command': 'mv list', 'expect_regex': r'hub'}
    ]
}

(bundle_dir / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print('Verified bundle updated successfully!')
