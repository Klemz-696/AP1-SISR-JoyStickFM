package fm.joystick.hub;

import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.GameMode;
import org.bukkit.Location;
import org.bukkit.Material;
import org.bukkit.Sound;
import org.bukkit.World;
import org.bukkit.block.Block;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.entity.Player;
import org.bukkit.entity.Villager;
import org.bukkit.event.Event;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.block.Action;
import org.bukkit.event.block.BlockBreakEvent;
import org.bukkit.event.block.BlockPlaceEvent;
import org.bukkit.event.entity.EntityDamageEvent;
import org.bukkit.event.entity.PlayerDeathEvent;
import org.bukkit.event.player.PlayerChangedWorldEvent;
import org.bukkit.event.player.PlayerInteractEntityEvent;
import org.bukkit.event.player.PlayerInteractEvent;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerMoveEvent;
import org.bukkit.event.player.PlayerRespawnEvent;
import org.bukkit.inventory.EquipmentSlot;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;
import org.bukkit.plugin.Plugin;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.util.Vector;

import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class JoyStickHub extends JavaPlugin implements Listener, CommandExecutor {

    // Gestion des mondes et configurations P2
    public static class WorldSettings {
        public Location spawnLocation;
        public double voidRescueY;
        public GameMode gameMode;
        public boolean protectBlocks;
        public String creditAuthor;
        public String creditLicense;
    }

    private final Map<String, WorldSettings> worldSettingsMap = new HashMap<>();
    private final Map<UUID, String> lastDeathWorld = new ConcurrentHashMap<>();
    private final Set<UUID> pendingMenuOpen = new HashSet<>();
    private AuthMeGate authMeGate;

    // Parkour Engine
    private boolean parkourEnabled = true;
    private String parkourWorld = "lobby_minijeux_p2_candidate";
    private final Set<Material> parkourStartMaterials = new HashSet<>();
    private final Set<Material> parkourCheckpointMaterials = new HashSet<>();
    private final Set<Material> parkourFinishMaterials = new HashSet<>();
    private int parkourFinishMinY = 72;
    private boolean parkourTeleportOnFall = true;

    private final Map<UUID, Long> parkourStartTimes = new ConcurrentHashMap<>();
    private final Map<UUID, Location> parkourCheckpoints = new ConcurrentHashMap<>();
    private final Map<UUID, Integer> parkourCheckpointIndex = new ConcurrentHashMap<>();
    private final Map<UUID, Double> previousAttackSpeed = new ConcurrentHashMap<>();

    // Hikabrain scores
    private int hikaRedScore = 0;
    private int hikaBlueScore = 0;
    private long lastHikaPointTime = 0;

    @Override
    public void onEnable() {
        saveDefaultConfig();
        loadSettings();

        authMeGate = new AuthMeGate(this);
        authMeGate.initialize();

        getServer().getPluginManager().registerEvents(this, this);
        if (getCommand("parkour") != null) {
            getCommand("parkour").setExecutor(this);
        }
        if (getCommand("jhub") != null) {
            getCommand("jhub").setExecutor(this);
        }

        Bukkit.getScheduler().runTaskLater(this, this::ensureNpcs, 40L);

        getLogger().info("JoyStickHub v1.6.0-p2 (Spawns centralisés, Moteur Parkour, Anti-Vide & PNJ Natifs) activé avec succès !");
    }

    @Override
    public void onDisable() {
        pendingMenuOpen.clear();
        parkourStartTimes.clear();
        parkourCheckpoints.clear();
        parkourCheckpointIndex.clear();
        previousAttackSpeed.clear();
        worldSettingsMap.clear();
        getLogger().info("JoyStickHub désactivé proprement.");
    }

    public void loadSettings() {
        reloadConfig();
        FileConfiguration config = getConfig();
        worldSettingsMap.clear();

        ConfigurationSection worldsSec = config.getConfigurationSection("worlds");
        if (worldsSec != null) {
            for (String wName : worldsSec.getKeys(false)) {
                ConfigurationSection wSec = worldsSec.getConfigurationSection(wName);
                if (wSec == null) continue;

                WorldSettings ws = new WorldSettings();
                double x = wSec.getDouble("spawn.x", 0.5);
                double y = wSec.getDouble("spawn.y", 64.0);
                double z = wSec.getDouble("spawn.z", 0.5);
                float yaw = (float) wSec.getDouble("spawn.yaw", 0.0);
                float pitch = (float) wSec.getDouble("spawn.pitch", 0.0);

                World world = Bukkit.getWorld(wName);
                if (world != null) {
                    ws.spawnLocation = new Location(world, x, y, z, yaw, pitch);
                } else {
                    // Deferred location creation if world is loaded dynamically later
                    ws.spawnLocation = new Location(null, x, y, z, yaw, pitch);
                }

                ws.voidRescueY = wSec.getDouble("void_rescue_y", 60.0);
                String gmStr = wSec.getString("gamemode", "ADVENTURE");
                try {
                    ws.gameMode = GameMode.valueOf(gmStr.toUpperCase(Locale.ROOT));
                } catch (Exception e) {
                    ws.gameMode = GameMode.ADVENTURE;
                }
                ws.protectBlocks = wSec.getBoolean("protect_blocks", true);
                ws.creditAuthor = wSec.getString("credit_author", "");
                ws.creditLicense = wSec.getString("credit_license", "");

                worldSettingsMap.put(wName.toLowerCase(Locale.ROOT), ws);
            }
        }

        // Parkour config
        ConfigurationSection pkSec = config.getConfigurationSection("parkour");
        if (pkSec != null) {
            parkourEnabled = pkSec.getBoolean("enabled", true);
            parkourWorld = pkSec.getString("world", "lobby_minijeux_p2_candidate").toLowerCase(Locale.ROOT);
            parkourTeleportOnFall = pkSec.getBoolean("teleport_to_checkpoint_on_fall", true);
            parkourFinishMinY = pkSec.getInt("finish_min_y", 72);

            parkourStartMaterials.clear();
            loadMaterials(pkSec, "start_blocks", "start_block", parkourStartMaterials,
                    Material.RED_WOOL, Material.LIGHT_WEIGHTED_PRESSURE_PLATE);

            parkourCheckpointMaterials.clear();
            loadMaterials(pkSec, "checkpoint_blocks", "checkpoint_block", parkourCheckpointMaterials,
                    Material.LADDER, Material.YELLOW_WOOL, Material.HEAVY_WEIGHTED_PRESSURE_PLATE);

            parkourFinishMaterials.clear();
            loadMaterials(pkSec, "finish_blocks", "finish_block", parkourFinishMaterials,
                    Material.PURPLE_WOOL, Material.EMERALD_BLOCK, Material.SMOOTH_STONE_SLAB);
        }

        getLogger().info("Configuration chargée : " + worldSettingsMap.size() + " mondes configurés.");
    }

    private void loadMaterials(ConfigurationSection sec, String listKey, String singleKey, Set<Material> target, Material... defaults) {
        List<String> list = sec.getStringList(listKey);
        if (list != null && !list.isEmpty()) {
            for (String s : list) {
                try { target.add(Material.valueOf(s.toUpperCase(Locale.ROOT))); } catch (Exception ignored) {}
            }
        }
        String single = sec.getString(singleKey);
        if (single != null && !single.isEmpty()) {
            try { target.add(Material.valueOf(single.toUpperCase(Locale.ROOT))); } catch (Exception ignored) {}
        }
        if (target.isEmpty()) {
            for (Material d : defaults) {
                if (d != null) target.add(d);
            }
        }
    }

    private WorldSettings getWorldSettings(World world) {
        if (world == null) return null;
        String name = world.getName().toLowerCase(Locale.ROOT);
        WorldSettings ws = worldSettingsMap.get(name);
        if (ws != null && ws.spawnLocation != null && ws.spawnLocation.getWorld() == null) {
            ws.spawnLocation.setWorld(world);
        }
        return ws;
    }

    private boolean isProtectedWorld(World world) {
        WorldSettings ws = getWorldSettings(world);
        return ws != null && ws.protectBlocks;
    }

    // --- 1. BOUSSOLE DU MENU : OUVERTURE IMMÉDIATE SANS JUMPTO (AVEC AUTHMIEGATE) ---
    @EventHandler(priority = EventPriority.LOWEST, ignoreCancelled = false)
    public void onCompassInteract(PlayerInteractEvent event) {
        Player player = event.getPlayer();
        if (!isProtectedWorld(player.getWorld()) || event.getHand() != EquipmentSlot.HAND) {
            return;
        }
        Action action = event.getAction();
        if (action != Action.RIGHT_CLICK_AIR && action != Action.RIGHT_CLICK_BLOCK) {
            return;
        }
        if (!isLegacyMenuCompass(event.getItem())) {
            return;
        }

        event.setUseInteractedBlock(Event.Result.DENY);
        event.setUseItemInHand(Event.Result.DENY);
        event.setCancelled(true);

        if (authMeGate == null || !authMeGate.isAuthenticated(player)) {
            if (authMeGate != null && authMeGate.isReady()) {
                player.sendMessage("§6§lJoyStick FM §7» §cConnecte-toi avec /login ou /register avant d'utiliser le menu.");
            } else {
                player.sendMessage("§6§lJoyStick FM §7» §cNavigation temporairement indisponible : contrôle d'authentification non prêt.");
            }
            return;
        }

        UUID playerId = player.getUniqueId();
        UUID requestedWorld = player.getWorld().getUID();
        if (!pendingMenuOpen.add(playerId)) {
            return;
        }
        Bukkit.getScheduler().runTask(this, () -> {
            try {
                if (!player.isOnline() || !isProtectedWorld(player.getWorld())
                        || !requestedWorld.equals(player.getWorld().getUID())
                        || authMeGate == null || !authMeGate.isAuthenticated(player)) {
                    return;
                }
                player.performCommand("deluxemenus:menu");
                player.playSound(player.getLocation(), Sound.UI_BUTTON_CLICK, 0.8f, 1.2f);
            } finally {
                pendingMenuOpen.remove(playerId);
            }
        });
    }

    private boolean isLegacyMenuCompass(ItemStack item) {
        if (item == null || item.getType() != Material.COMPASS || !item.hasItemMeta()) {
            return false;
        }
        ItemMeta meta = item.getItemMeta();
        if (meta == null || !meta.hasDisplayName()) {
            return false;
        }
        String displayName = ChatColor.stripColor(meta.getDisplayName());
        return displayName.contains("MENU") || displayName.contains("JEUX");
    }

    // --- 2. CLIC SUR LES PNJ DU LOBBY MINI-JEUX ---
    @EventHandler(priority = EventPriority.HIGHEST)
    public void onNPCInteract(PlayerInteractEntityEvent event) {
        if (event.getRightClicked() instanceof Villager villager) {
            String name = villager.getCustomName();
            if (name == null) return;

            event.setCancelled(true);
            Player player = event.getPlayer();
            player.playSound(player.getLocation(), Sound.UI_BUTTON_CLICK, 0.8f, 1.2f);

            if (name.contains("BEDWARS")) {
                player.sendMessage("§6§lJoyStick FM §7» §eConnexion à l'arène BedWars...");
                player.performCommand("bw join jfm_duo");
            } else if (name.contains("HIKABRAIN")) {
                player.sendMessage("§6§lJoyStick FM §7» §eTéléportation à l'arène Hikabrain...");
                player.performCommand("mv tp hikabrain_jfm");
            } else if (name.contains("CACHE-CACHE") || name.contains("BLOCKHUNT")) {
                player.sendMessage("§6§lJoyStick FM §7» §eConnexion au Cache-Cache Village...");
                player.performCommand("bh join jfm_retro");
            } else if (name.contains("RUSH")) {
                player.sendMessage("§6§lJoyStick FM §7» §eConnexion au Rush FunCraft...");
                player.performCommand("bw join rush_1v1");
            } else if (name.contains("RETOUR AU HUB") || name.contains("HUB")) {
                player.sendMessage("§6§lJoyStick FM §7» §eRetour au Grand Hub...");
                World hubWorld = Bukkit.getWorld("hub");
                if (hubWorld != null) {
                    player.teleport(hubWorld.getSpawnLocation());
                } else {
                    player.performCommand("spawn");
                }
            }
        }
    }

    // --- 3. PROTECTION STRICTE ANTI-CASSE & ANTI-POSE DANS LES ZONES D'ACCUEIL ---
    @EventHandler(priority = EventPriority.HIGHEST, ignoreCancelled = true)
    public void onBlockBreak(BlockBreakEvent event) {
        Player player = event.getPlayer();
        if (isProtectedWorld(player.getWorld())) {
            if (player.getGameMode() != GameMode.CREATIVE) {
                event.setCancelled(true);
                player.sendMessage("§c§lJoyStick FM §7» §eLa destruction de blocs est interdite dans les zones d'accueil !");
            }
        }
    }

    @EventHandler(priority = EventPriority.HIGHEST, ignoreCancelled = true)
    public void onBlockPlace(BlockPlaceEvent event) {
        Player player = event.getPlayer();
        if (isProtectedWorld(player.getWorld())) {
            if (player.getGameMode() != GameMode.CREATIVE) {
                event.setCancelled(true);
                player.sendMessage("§c§lJoyStick FM §7» §eLa pose de blocs est interdite dans les zones d'accueil !");
            }
        }
    }

    // --- 4. GESTION DU GAMEMODE & ATTRIBUTION/RETRAIT BOUSSOLE ---
    @EventHandler(priority = EventPriority.HIGHEST, ignoreCancelled = true)
    public void onWorldChange(PlayerChangedWorldEvent event) {
        Player player = event.getPlayer();
        handleWorldInventoryAndGamemode(player);
        // Annulation de parkour en cours si changement de monde
        cancelParkour(player, false);
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onPlayerJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        handleWorldInventoryAndGamemode(player);

        // Afficher crédit d'auteur si configuré pour ce monde
        WorldSettings ws = getWorldSettings(player.getWorld());
        if (ws != null && ws.creditAuthor != null && !ws.creditAuthor.isEmpty()) {
            player.sendMessage("§8[Zone d'accueil] §7Carte créée par : §f" + ws.creditAuthor + " §7(Licence: " + ws.creditLicense + ")");
        }
    }

    private void handleWorldInventoryAndGamemode(Player player) {
        World world = player.getWorld();
        if (world == null) return;
        String wName = world.getName().toLowerCase(Locale.ROOT);

        // Réduction du cooldown d'attaque (PvP spam) pour Hikabrain - Sauvegarde et restauration de la valeur précédente
        try {
            org.bukkit.attribute.AttributeInstance attackSpeed = player.getAttribute(org.bukkit.attribute.Attribute.ATTACK_SPEED);
            if (attackSpeed != null) {
                UUID uid = player.getUniqueId();
                if (wName.contains("hikabrain")) {
                    if (!previousAttackSpeed.containsKey(uid)) {
                        previousAttackSpeed.put(uid, attackSpeed.getBaseValue());
                    }
                    attackSpeed.setBaseValue(100.0); // Suppression du cooldown d'attaque (réduction maximale du délai)
                } else {
                    Double prev = previousAttackSpeed.remove(uid);
                    if (prev != null) {
                        attackSpeed.setBaseValue(prev); // Restauration exacte de la valeur précédente
                    }
                }
            }
        } catch (Throwable ignored) {}

        if (wName.equals("survie") || wName.startsWith("survie_")) {
            if (player.getGameMode() != GameMode.SURVIVAL && player.getGameMode() != GameMode.CREATIVE) {
                player.setGameMode(GameMode.SURVIVAL);
                player.sendMessage("§6§lJoyStick FM §7» §aMode Survie actif !");
            }
            return;
        }

        WorldSettings ws = getWorldSettings(world);
        if (ws != null) {
            if (player.getGameMode() != ws.gameMode && player.getGameMode() != GameMode.CREATIVE) {
                player.setGameMode(ws.gameMode);
            }
        }
    }

    // --- 5. SAUVETAGE DU VIDE SANS DEGATS & INTEGRATION PARKOUR ---
    @EventHandler(priority = EventPriority.HIGHEST, ignoreCancelled = true)
    public void onPlayerMove(PlayerMoveEvent event) {
        Player player = event.getPlayer();
        Location to = event.getTo();
        if (to == null) return;

        World world = player.getWorld();
        String wName = world.getName().toLowerCase(Locale.ROOT);

        // Moteur de Parkour - Détection des plaques et blocs
        if (parkourEnabled && wName.equals(parkourWorld)) {
            checkParkourInteraction(player, to);
        }

        // Sauvetage du vide paramétrable par monde
        WorldSettings ws = getWorldSettings(world);
        if (ws != null && to.getY() < ws.voidRescueY) {
            player.setVelocity(new Vector(0, 0, 0));
            player.setFallDistance(0f);

            // Si le joueur est en session de parkour active dans ce monde
            if (parkourEnabled && parkourTeleportOnFall && parkourStartTimes.containsKey(player.getUniqueId())) {
                Location cp = parkourCheckpoints.get(player.getUniqueId());
                if (cp != null) {
                    player.teleport(cp);
                    player.playSound(cp, Sound.ENTITY_ENDERMAN_TELEPORT, 0.8f, 1.2f);
                    player.sendMessage("§6§lJoyStick FM §7» §eChute de parkour ! Retour à votre dernier checkpoint.");
                    return;
                }
            }

            // Téléportation au spawn du monde
            Location spawn = ws.spawnLocation;
            if (spawn != null && spawn.getWorld() != null) {
                player.teleport(spawn);
            } else {
                player.teleport(world.getSpawnLocation());
            }
            player.playSound(player.getLocation(), Sound.ENTITY_ENDERMAN_TELEPORT, 0.8f, 1.2f);
            player.sendMessage("§6§lJoyStick FM §7» §eChute rattrapée ! Vous avez été repositionné au spawn.");
            return;
        }

        // Sauvetage du vide pour l'arène Hikabrain 1v1
        if (wName.equals("hikabrain_jfm") && to.getY() < 55.0) {
            player.setVelocity(new Vector(0, 0, 0));
            player.setFallDistance(0f);
            Location respawn = (to.getZ() < 0)
                ? new Location(world, 0.5, 65.0, -21.5, 0f, 0f)
                : new Location(world, 0.5, 65.0, 21.5, 180f, 0f);
            player.teleport(respawn);
            player.playSound(respawn, Sound.ENTITY_ENDERMAN_TELEPORT, 0.6f, 1.5f);
            player.sendMessage("§6§lJoyStick FM §7» §eChute rattrapée ! Retour à votre base Hikabrain.");
            return;
        }
    }

    // Détection des étapes de Parkour
    private void checkParkourInteraction(Player player, Location loc) {
        Block block = loc.getBlock();
        Block under = loc.clone().subtract(0, 0.5, 0).getBlock();
        UUID uid = player.getUniqueId();

        // 1. Début de Parkour (Laine rouge ou plaque de départ)
        if (isStartBlock(block, under)) {
            if (!parkourStartTimes.containsKey(uid)) {
                parkourStartTimes.put(uid, System.currentTimeMillis());
                parkourCheckpoints.put(uid, loc.clone());
                parkourCheckpointIndex.put(uid, 0);

                player.sendTitle("§a§lPARKOUR COMMENCÉ !", "§eBonne chance !", 5, 30, 10);
                player.playSound(loc, Sound.BLOCK_NOTE_BLOCK_PLING, 1f, 1.5f);
                player.sendMessage("§6§lJoyStick FM §7» §aSession de parkour commencée ! Tapez §e/parkour quit §apour abandonner.");
            }
        }
        // 2. Arrivée (Sur le bloc d'émeraude, laine violette ou sommet à Y >= finishMinY)
        else if (isFinishBlock(block, under, loc.getBlockY()) && parkourStartTimes.containsKey(uid)) {
            long start = parkourStartTimes.remove(uid);
            parkourCheckpoints.remove(uid);
            parkourCheckpointIndex.remove(uid);

            double seconds = (System.currentTimeMillis() - start) / 1000.0;
            String timeStr = String.format(Locale.ROOT, "%.2f", seconds);

            player.sendTitle("§6§l★ VICTOIRE ! ★", "§aTemps : §e" + timeStr + "s", 10, 60, 20);
            player.playSound(loc, Sound.UI_TOAST_CHALLENGE_COMPLETE, 1f, 1f);
            player.sendMessage("§6§lJoyStick FM §7» §a§lFélicitations ! Vous avez terminé le parcours en §e" + timeStr + " secondes §a!");
        }
        // 3. Checkpoint (Échelles, laine jaune/orange ou plaque de pression)
        else if (isCheckpointBlock(block, under) && parkourStartTimes.containsKey(uid)) {
            Location lastCp = parkourCheckpoints.get(uid);
            if (lastCp == null || lastCp.distanceSquared(loc) > 4.0) {
                int nextIdx = parkourCheckpointIndex.getOrDefault(uid, 0) + 1;
                parkourCheckpointIndex.put(uid, nextIdx);
                parkourCheckpoints.put(uid, loc.clone());

                player.playSound(loc, Sound.ENTITY_EXPERIENCE_ORB_PICKUP, 0.9f, 1.3f);
                player.sendMessage("§6§lJoyStick FM §7» §b✦ Checkpoint #" + nextIdx + " validé !");
            }
        }
    }

    private boolean isStartBlock(Block block, Block under) {
        return parkourStartMaterials.contains(block.getType()) || parkourStartMaterials.contains(under.getType());
    }

    private boolean isCheckpointBlock(Block block, Block under) {
        return parkourCheckpointMaterials.contains(block.getType()) || parkourCheckpointMaterials.contains(under.getType());
    }

    private boolean isFinishBlock(Block block, Block under, int y) {
        if (y < parkourFinishMinY) return false;
        return parkourFinishMaterials.contains(block.getType()) || parkourFinishMaterials.contains(under.getType());
    }

    private void cancelParkour(Player player, boolean notify) {
        UUID uid = player.getUniqueId();
        if (parkourStartTimes.remove(uid) != null) {
            parkourCheckpoints.remove(uid);
            parkourCheckpointIndex.remove(uid);
            if (notify) {
                player.sendMessage("§6§lJoyStick FM §7» §cSession de parkour annulée.");
            }
        }
    }

    // Commandes /parkour et /jhub
    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (command.getName().equalsIgnoreCase("jhub")) {
            if (!sender.hasPermission("joystickhub.admin") && !sender.isOp() && (sender instanceof Player)) {
                sender.sendMessage("§cPermission insuffisante.");
                return true;
            }
            if (args.length >= 6 && args[0].equalsIgnoreCase("paste")) {
                String worldName = args[1];
                String schemName = args[2];
                try {
                    int x = Integer.parseInt(args[3]);
                    int y = Integer.parseInt(args[4]);
                    int z = Integer.parseInt(args[5]);
                    pasteSchematic(sender, worldName, schemName, x, y, z);
                } catch (NumberFormatException e) {
                    sender.sendMessage("§cCoordonnées invalides : doivent être des entiers.");
                }
                return true;
            }
            if (args.length > 0 && args[0].equalsIgnoreCase("spawn-npcs")) {
                ensureNpcs();
                sender.sendMessage("§a[JoyStickHub] PNJ d'accueil balisés vérifiés et actualisés.");
                return true;
            }
            if (args.length > 0 && args[0].equalsIgnoreCase("reload")) {
                loadSettings();
                sender.sendMessage("§a[JoyStickHub] Configuration de JoyStickHub rechargée.");
                return true;
            }
            sender.sendMessage("§6[JoyStickHub] Usage : /jhub paste <monde> <schem> <x> <y> <z> | /jhub spawn-npcs | /jhub reload");
            return true;
        }

        if (!(sender instanceof Player player)) {
            sender.sendMessage("Commande réservée aux joueurs.");
            return true;
        }

        if (args.length > 0 && (args[0].equalsIgnoreCase("quit") || args[0].equalsIgnoreCase("reset"))) {
            if (parkourStartTimes.containsKey(player.getUniqueId())) {
                cancelParkour(player, true);
                WorldSettings ws = getWorldSettings(player.getWorld());
                if (ws != null && ws.spawnLocation != null) {
                    player.teleport(ws.spawnLocation);
                }
            } else {
                player.sendMessage("§6§lJoyStick FM §7» §7Vous n'êtes pas en train d'effectuer un parkour.");
            }
            return true;
        }

        if (args.length > 0 && args[0].equalsIgnoreCase("reload") && player.hasPermission("joystickhub.admin")) {
            loadSettings();
            player.sendMessage("§6§lJoyStick FM §7» §aConfiguration de JoyStickHub rechargée.");
            return true;
        }

        player.sendMessage("§6§lJoyStick FM — Moteur Parkour P2");
        player.sendMessage("§7- §e/parkour quit §7: Abandonner le parcours en cours et revenir au spawn");
        return true;
    }

    private void pasteSchematic(CommandSender sender, String worldName, String schemName, int x, int y, int z) {
        World world = Bukkit.getWorld(worldName);
        if (world == null) {
            sender.sendMessage("§cMonde introuvable : " + worldName);
            return;
        }
        java.io.File schemFile = new java.io.File(getDataFolder().getParentFile(), "WorldEdit/schematics/" + schemName);
        if (!schemFile.exists()) {
            schemFile = new java.io.File(schemName);
        }
        if (!schemFile.exists()) {
            sender.sendMessage("§cFichier introuvable : " + schemFile.getAbsolutePath());
            return;
        }
        try {
            com.sk89q.worldedit.extent.clipboard.io.ClipboardFormat format = 
                com.sk89q.worldedit.extent.clipboard.io.ClipboardFormats.findByFile(schemFile);
            if (format == null) {
                sender.sendMessage("§cFormat schematic non supporté : " + schemFile.getName());
                return;
            }
            try (com.sk89q.worldedit.extent.clipboard.io.ClipboardReader reader = format.getReader(new java.io.FileInputStream(schemFile))) {
                com.sk89q.worldedit.extent.clipboard.Clipboard clipboard = reader.read();
                com.sk89q.worldedit.world.World weWorld = com.sk89q.worldedit.bukkit.BukkitAdapter.adapt(world);
                try (com.sk89q.worldedit.EditSession editSession = com.sk89q.worldedit.WorldEdit.getInstance().newEditSession(weWorld)) {
                    com.sk89q.worldedit.function.operation.Operation operation = new com.sk89q.worldedit.session.ClipboardHolder(clipboard)
                            .createPaste(editSession)
                            .to(com.sk89q.worldedit.math.BlockVector3.at(x, y, z))
                            .ignoreAirBlocks(false)
                            .build();
                    com.sk89q.worldedit.function.operation.Operations.complete(operation);
                    sender.sendMessage("§a[JoyStickHub] Collage terminé avec succès pour " + schemName + " dans " + worldName + " à (" + x + "," + y + "," + z + ") !");
                    getLogger().info("Collage réussi : " + schemName + " dans " + worldName);
                }
            }
        } catch (Throwable t) {
            sender.sendMessage("§cErreur lors du collage : " + t.getMessage());
            t.printStackTrace();
        }
    }

    // --- 6. HIKABRAIN ENGINE : MARQUAGE DE POINT AU LIT ADVERSE ---
    @EventHandler(priority = EventPriority.HIGHEST)
    public void onPlayerInteractHikabrain(PlayerInteractEvent event) {
        Player player = event.getPlayer();
        World world = player.getWorld();
        if (!world.getName().equalsIgnoreCase("hikabrain_jfm")) return;

        Block block = event.getClickedBlock();
        if (block == null) return;

        Material mat = block.getType();
        if (mat == Material.RED_BED || mat == Material.BLUE_BED) {
            event.setCancelled(true);
            long now = System.currentTimeMillis();
            if (now - lastHikaPointTime < 3000) return;

            lastHikaPointTime = now;
            boolean hitRedBed = (mat == Material.RED_BED);

            if (hitRedBed) {
                hikaBlueScore++;
                broadcastHikaPoint(world, "Bleue", hikaBlueScore, hikaRedScore);
            } else {
                hikaRedScore++;
                broadcastHikaPoint(world, "Rouge", hikaRedScore, hikaBlueScore);
            }

            if (hikaRedScore >= 5 || hikaBlueScore >= 5) {
                String winner = (hikaRedScore >= 5) ? "Rouge" : "Bleue";
                for (Player p : world.getPlayers()) {
                    p.sendTitle("§6§l★ VICTOIRE ÉQUIPE " + winner.toUpperCase() + " ★", "§aMatch Hikabrain terminé (" + hikaRedScore + " - " + hikaBlueScore + ")", 10, 70, 20);
                    p.playSound(p.getLocation(), Sound.UI_TOAST_CHALLENGE_COMPLETE, 1f, 1.0f);
                }
                hikaRedScore = 0;
                hikaBlueScore = 0;
            }

            resetHikabrainRound(world);
        }
    }

    private void broadcastHikaPoint(World world, String team, int red, int blue) {
        for (Player p : world.getPlayers()) {
            p.sendTitle("§a✦ POINT POUR L'ÉQUIPE " + team.toUpperCase() + " ! ✦", "§eScore : §cRouge " + hikaRedScore + " §7- §9Bleu " + blue, 5, 40, 10);
            p.playSound(p.getLocation(), Sound.ENTITY_PLAYER_LEVELUP, 1f, 1.4f);
            p.sendMessage("§6[Hikabrain] §eL'équipe §b" + team + " §ea marqué un point ! Score actuel : §cRouge " + hikaRedScore + " §7| §9Bleu " + blue);
        }
    }

    private void resetHikabrainRound(World world) {
        for (int z = -18; z <= 18; z++) {
            world.getBlockAt(0, 64, z).setType(Material.SANDSTONE);
        }
        for (Player p : world.getPlayers()) {
            Location loc = p.getLocation();
            Location target = (loc.getZ() < 0)
                ? new Location(world, 0.5, 65.0, -21.5, 0f, 0f)
                : new Location(world, 0.5, 65.0, 21.5, 180f, 0f);
            p.setVelocity(new Vector(0, 0, 0));
            p.setFallDistance(0f);
            p.teleport(target);
        }
    }

    // --- 7. IMMUNITÉ TOTALE VOID/FALL ET PROTECTION DES PNJ BALISÉS ---
    @EventHandler(priority = EventPriority.HIGHEST, ignoreCancelled = true)
    public void onEntityDamage(EntityDamageEvent event) {
        if (event.getEntity().getScoreboardTags().contains("jfm_npc")) {
            event.setCancelled(true);
            return;
        }
        if (!(event.getEntity() instanceof Player player)) return;
        if (isProtectedWorld(player.getWorld())) {
            if (event.getCause() == EntityDamageEvent.DamageCause.VOID ||
                event.getCause() == EntityDamageEvent.DamageCause.FALL) {
                event.setCancelled(true);
            }
        }
    }

    // --- 7.bis. GESTION DES PNJ BALISÉS (VILLAGEOIS NATIFS SANS CITIZENS) ---
    @EventHandler(priority = EventPriority.HIGHEST, ignoreCancelled = false)
    public void onPlayerInteractEntity(PlayerInteractEntityEvent event) {
        org.bukkit.entity.Entity entity = event.getRightClicked();
        if (entity == null || !entity.getScoreboardTags().contains("jfm_npc")) {
            return;
        }

        event.setCancelled(true); // Bloque le menu de commerce vanilla

        Player player = event.getPlayer();
        String wName = player.getWorld().getName().toLowerCase(Locale.ROOT);
        if (!wName.contains("hub") && !wName.contains("lobby")) {
            return;
        }

        if (authMeGate != null && !authMeGate.isAuthenticated(player)) {
            player.sendMessage("§6§lJoyStick FM §7» §cConnecte-toi avec /login ou /register avant d'interagir !");
            return;
        }

        Set<String> tags = entity.getScoreboardTags();
        if (tags.contains("jfm_npc_lobby")) {
            World target = Bukkit.getWorld("lobby_minijeux_p2_candidate");
            if (target != null) {
                player.teleport(new Location(target, 0.5, 64.0, 0.5, 0f, 0f));
                player.playSound(player.getLocation(), Sound.ENTITY_PLAYER_LEVELUP, 0.8f, 1.2f);
                player.sendMessage("§6§lJoyStick FM §7» §aTéléportation vers le Lobby des Mini-Jeux...");
            }
        } else if (tags.contains("jfm_npc_hub")) {
            World target = Bukkit.getWorld("hub_p2_candidate");
            if (target != null) {
                player.teleport(new Location(target, 0.5, 64.0, 0.5, 0f, 0f));
                player.playSound(player.getLocation(), Sound.ENTITY_PLAYER_LEVELUP, 0.8f, 1.2f);
                player.sendMessage("§6§lJoyStick FM §7» §aTéléportation vers le Grand Hub...");
            }
        } else if (tags.contains("jfm_npc_hikabrain")) {
            World target = Bukkit.getWorld("hikabrain_jfm");
            if (target != null) {
                player.teleport(new Location(target, 0.5, 65.0, 0.5, 0f, 0f));
                player.playSound(player.getLocation(), Sound.ENTITY_ENDERMAN_TELEPORT, 0.8f, 1.2f);
                player.sendMessage("§6§lJoyStick FM §7» §eTéléportation vers l'Arène Hikabrain (1v1) !");
            }
        } else if (tags.contains("jfm_npc_parkour")) {
            World target = Bukkit.getWorld("lobby_minijeux_p2_candidate");
            if (target != null) {
                player.teleport(new Location(target, 12.5, 64.0, 9.5, 0f, 0f));
                player.playSound(player.getLocation(), Sound.ENTITY_ENDERMAN_TELEPORT, 0.8f, 1.2f);
                player.sendMessage("§6§lJoyStick FM §7» §eTéléportation au départ du Parkour !");
            }
        } else if (tags.contains("jfm_npc_menu")) {
            player.performCommand("menu");
        }
    }

    public void ensureNpcs() {
        World hubWorld = Bukkit.getWorld("hub_p2_candidate");
        if (hubWorld != null) {
            spawnNpcIfMissing(hubWorld, 2.5, 64.0, 2.5, "§d§l✦ Lobby Mini-Jeux & Parkour ✦", "jfm_npc_lobby", Villager.Profession.CARTOGRAPHER);
            spawnNpcIfMissing(hubWorld, -1.5, 64.0, 2.5, "§e§l✦ Arène Hikabrain (1v1) ✦", "jfm_npc_hikabrain", Villager.Profession.WEAPONSMITH);
            spawnNpcIfMissing(hubWorld, 0.5, 64.0, 4.5, "§b§l✦ Menu des Jeux ✦", "jfm_npc_menu", Villager.Profession.LIBRARIAN);
        }

        World lobbyWorld = Bukkit.getWorld("lobby_minijeux_p2_candidate");
        if (lobbyWorld != null) {
            spawnNpcIfMissing(lobbyWorld, 2.5, 64.0, 2.5, "§a§l✦ Départ du Parkour ✦", "jfm_npc_parkour", Villager.Profession.SHEPHERD);
            spawnNpcIfMissing(lobbyWorld, -1.5, 64.0, 2.5, "§e§l✦ Arène Hikabrain (1v1) ✦", "jfm_npc_hikabrain", Villager.Profession.WEAPONSMITH);
            spawnNpcIfMissing(lobbyWorld, 0.5, 64.0, -2.5, "§f§l✦ Retour au Grand Hub ✦", "jfm_npc_hub", Villager.Profession.CLERIC);
        }
        getLogger().info("[PNJ] Vérification et maintien des PNJ d'accueil balisés terminés.");
    }

    private void spawnNpcIfMissing(World world, double x, double y, double z, String name, String actionTag, Villager.Profession prof) {
        Location loc = new Location(world, x, y, z);
        for (Villager existing : world.getEntitiesByClass(Villager.class)) {
            if (existing.getScoreboardTags().contains("jfm_npc") && existing.getScoreboardTags().contains(actionTag)) {
                existing.setAI(false);
                existing.setInvulnerable(true);
                existing.setSilent(true);
                existing.setCollidable(false);
                existing.setCustomName(name);
                existing.setCustomNameVisible(true);
                return;
            }
        }
        world.spawn(loc, Villager.class, entity -> {
            entity.setAI(false);
            entity.setInvulnerable(true);
            entity.setSilent(true);
            entity.setCollidable(false);
            entity.setRemoveWhenFarAway(false);
            entity.setPersistent(true);
            entity.setCustomName(name);
            entity.setCustomNameVisible(true);
            entity.setProfession(prof);
            entity.addScoreboardTag("jfm_npc");
            entity.addScoreboardTag(actionTag);
        });
    }

    // --- 8. RESPAWN EN SURVIE ---
    @EventHandler(priority = EventPriority.MONITOR)
    public void onPlayerDeath(PlayerDeathEvent event) {
        Player player = event.getEntity();
        lastDeathWorld.put(player.getUniqueId(), player.getWorld().getName());
    }

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

    /**
     * Pont AuthMe v3 dynamique et résilient (Fail-Closed)
     */
    private static final class AuthMeGate {
        private final JavaPlugin owner;
        private Plugin boundPlugin;
        private Object api;
        private Method authenticatedMethod;
        private boolean warningLogged;

        private AuthMeGate(JavaPlugin owner) {
            this.owner = owner;
        }

        private void initialize() {
            boundPlugin = null;
            api = null;
            authenticatedMethod = null;
            Plugin current = owner.getServer().getPluginManager().getPlugin("AuthMe");
            if (current == null || !current.isEnabled()) {
                warnOnce("AuthMe absent ou désactivé : route boussole bloquée.");
                return;
            }
            try {
                Class<?> apiClass = Class.forName("fr.xephi.authme.api.v3.AuthMeApi", true,
                        current.getClass().getClassLoader());
                Object instance = apiClass.getMethod("getInstance").invoke(null);
                if (instance == null) {
                    warnOnce("AuthMe API non initialisée : route boussole bloquée.");
                    return;
                }
                Method method = apiClass.getMethod("isAuthenticated", Player.class);
                if (method.getReturnType() != boolean.class
                        && method.getReturnType() != Boolean.class) {
                    warnOnce("AuthMe API incompatible : route boussole bloquée.");
                    return;
                }
                boundPlugin = current;
                api = instance;
                authenticatedMethod = method;
                warningLogged = false;
            } catch (ReflectiveOperationException | LinkageError | RuntimeException exception) {
                warnOnce("AuthMe API indisponible : " + exception.getClass().getSimpleName());
            }
        }

        private boolean isReady() {
            return boundPlugin != null && boundPlugin.isEnabled()
                    && api != null && authenticatedMethod != null;
        }

        private boolean isAuthenticated(Player player) {
            Plugin current = owner.getServer().getPluginManager().getPlugin("AuthMe");
            if (!isReady() || current != boundPlugin) {
                initialize();
            }
            if (!isReady()) {
                return false;
            }
            try {
                return Boolean.TRUE.equals(authenticatedMethod.invoke(api, player));
            } catch (ReflectiveOperationException | LinkageError | RuntimeException exception) {
                api = null;
                authenticatedMethod = null;
                warnOnce("Contrôle AuthMe échoué : " + exception.getClass().getSimpleName());
                return false;
            }
        }

        private void warnOnce(String message) {
            if (!warningLogged) {
                owner.getLogger().warning(message);
                warningLogged = true;
            }
        }
    }
}
