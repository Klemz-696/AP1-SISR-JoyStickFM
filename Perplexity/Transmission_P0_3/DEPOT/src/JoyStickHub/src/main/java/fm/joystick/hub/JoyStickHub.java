package fm.joystick.hub;

import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.GameMode;
import org.bukkit.Location;
import org.bukkit.Material;
import org.bukkit.Sound;
import org.bukkit.World;
import org.bukkit.block.Block;
import org.bukkit.entity.Player;
import org.bukkit.entity.Villager;
import org.bukkit.event.Event;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.block.BlockBreakEvent;
import org.bukkit.event.block.BlockPlaceEvent;
import org.bukkit.event.block.Action;
import org.bukkit.event.entity.EntityDamageEvent;
import org.bukkit.event.entity.PlayerDeathEvent;
import org.bukkit.event.player.PlayerChangedWorldEvent;
import org.bukkit.event.player.PlayerInteractEntityEvent;
import org.bukkit.event.player.PlayerInteractEvent;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerMoveEvent;
import org.bukkit.event.player.PlayerRespawnEvent;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.EquipmentSlot;
import org.bukkit.inventory.meta.ItemMeta;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.plugin.Plugin;
import org.bukkit.util.Vector;

import java.util.Locale;
import java.util.List;
import java.util.HashSet;
import java.util.Set;
import java.lang.reflect.Method;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class JoyStickHub extends JavaPlugin implements Listener {

    private final Map<UUID, String> lastDeathWorld = new ConcurrentHashMap<>();
    private final Set<UUID> pendingMenuOpen = new HashSet<>();
    private AuthMeGate authMeGate;
    
    // Hikabrain scores
    private int hikaRedScore = 0;
    private int hikaBlueScore = 0;
    private long lastHikaPointTime = 0;

    // Coordonnées Grand Hub Terrestre (Pavillon Central)
    private static final double HUB_SPAWN_X = 0.5;
    private static final double HUB_SPAWN_Y = 65.0;
    private static final double HUB_SPAWN_Z = 0.5;

    @Override
    public void onEnable() {
        authMeGate = new AuthMeGate(this);
        authMeGate.initialize();
        getServer().getPluginManager().registerEvents(this, this);
        getLogger().info("JoyStickHub " + getDescription().getVersion() + " — correctif non destructif des inventaires actif.");
    }

    @Override
    public void onDisable() {
        pendingMenuOpen.clear();
        getLogger().info("JoyStickHub désactivé proprement.");
    }

    // --- 1. BOUSSOLE DU MENU : OUVERTURE IMMÉDIATE SANS JUMPTO ---
    @EventHandler(priority = EventPriority.LOWEST, ignoreCancelled = false)
    public void onCompassInteract(PlayerInteractEvent event) {
        Player player = event.getPlayer();
        if (!isLobbyWorld(player.getWorld()) || event.getHand() != EquipmentSlot.HAND) {
            return;
        }
        Action action = event.getAction();
        if (action != Action.RIGHT_CLICK_AIR && action != Action.RIGHT_CLICK_BLOCK) {
            return;
        }
        if (!isLegacyMenuCompass(event.getItem())) {
            return;
        }

        // Cancel only this lobby UI object's vanilla use (not ordinary compasses).
        // PlayerInteractEvent can already be cancelled by vanilla prediction.
        event.setUseInteractedBlock(Event.Result.DENY);
        event.setUseItemInHand(Event.Result.DENY);
        event.setCancelled(true);

        // LOWEST is not proof that AuthMe has already processed the event.
        // Authentication is explicitly checked, and unavailable API means denied.
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
                if (!player.isOnline() || !isLobbyWorld(player.getWorld())
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

    // --- 2. CLIC SUR LES PNJ DU LOBBY MINI-JEUX : DÉCLENCHEMENT DU JEU ---
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
            } else if (name.contains("RETOUR AU HUB")) {
                player.sendMessage("§6§lJoyStick FM §7» §eRetour au Grand Hub...");
                player.performCommand("spawn");
            }
        }
    }

    // --- 3. PROTECTION STRICTE ANTI-CASSE & ANTI-POSE DANS LE HUB ET LOBBY ---
    @EventHandler(priority = EventPriority.HIGHEST, ignoreCancelled = true)
    public void onBlockBreak(BlockBreakEvent event) {
        Player player = event.getPlayer();
        String w = player.getWorld().getName().toLowerCase(Locale.ROOT);
        if (w.equals("hub") || w.equals("lobby_minijeux")) {
            if (player.getGameMode() != GameMode.CREATIVE) {
                event.setCancelled(true);
                player.sendMessage("§c§lJoyStick FM §7» §eLa destruction de blocs est interdite dans les zones d'accueil !");
            }
        }
    }

    @EventHandler(priority = EventPriority.HIGHEST, ignoreCancelled = true)
    public void onBlockPlace(BlockPlaceEvent event) {
        Player player = event.getPlayer();
        String w = player.getWorld().getName().toLowerCase(Locale.ROOT);
        if (w.equals("hub") || w.equals("lobby_minijeux")) {
            if (player.getGameMode() != GameMode.CREATIVE) {
                event.setCancelled(true);
                player.sendMessage("§c§lJoyStick FM §7» §eLa pose de blocs est interdite dans les zones d'accueil !");
            }
        }
    }

    // --- 4. GAMEMODE UNIQUEMENT : AUCUNE PURGE D'INVENTAIRE ---
    @EventHandler(priority = EventPriority.HIGHEST, ignoreCancelled = true)
    public void onWorldChange(PlayerChangedWorldEvent event) {
        Player player = event.getPlayer();
        handleWorldInventoryAndGamemode(player);
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onPlayerJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        handleWorldInventoryAndGamemode(player);
    }

    private void handleWorldInventoryAndGamemode(Player player) {
        World world = player.getWorld();
        if (world == null) {
            return;
        }
        String worldName = world.getName().toLowerCase(Locale.ROOT);
        if (worldName.equals("survie") || worldName.startsWith("survie_")) {
            if (player.getGameMode() != GameMode.SURVIVAL
                    && player.getGameMode() != GameMode.CREATIVE) {
                player.setGameMode(GameMode.SURVIVAL);
                player.sendMessage("§6§lJoyStick FM §7» §aMode Survie actif !");
            }
            return;
        }
        if (isLobbyWorld(world)
                && player.getGameMode() != GameMode.ADVENTURE
                && player.getGameMode() != GameMode.CREATIVE) {
            player.setGameMode(GameMode.ADVENTURE);
        }
        // Inventory ownership stays with Multiverse-Inventories and the game plugins.
        // ItemJoin supplies/removes its own lobby objects via its configured triggers.
        // Do not clear gear, remove ordinary compasses or grant objects from delayed tasks.
    }

    private boolean isLobbyWorld(World world) {
        if (world == null) {
            return false;
        }
        String name = world.getName().toLowerCase(Locale.ROOT);
        return name.equals("hub") || name.equals("lobby_minijeux");
    }

    private boolean isLegacyMenuCompass(ItemStack item) {
        if (item == null || item.getType() != Material.COMPASS || !item.hasItemMeta()) {
            return false;
        }
        ItemMeta meta = item.getItemMeta();
        if (meta == null || !meta.hasDisplayName() || !meta.hasLore()) {
            return false;
        }
        String displayName = ChatColor.stripColor(meta.getDisplayName());
        if (!"✦ MENU DES JEUX ✦ (Clic-Droit)".equals(displayName)) {
            return false;
        }
        List<String> lore = meta.getLore();
        return lore != null && !lore.isEmpty()
                && "Cliquez pour ouvrir la sélection des jeux :".equals(
                        ChatColor.stripColor(lore.get(0)));
        // Transitional UI signature, not an authentication or permissions mechanism.
        // No item is deleted based on this signature. Persistent identity comes in phase 6.
    }

    // --- 5. SAUVETAGE DU VIDE SANS DEGATS ---
    @EventHandler(priority = EventPriority.HIGHEST, ignoreCancelled = true)
    public void onPlayerMove(PlayerMoveEvent event) {
        Player player = event.getPlayer();
        Location to = event.getTo();
        if (to == null) return;

        World world = player.getWorld();
        String wName = world.getName().toLowerCase(Locale.ROOT);

        // Grand Hub Terrestre : chute sous Y=60 -> TP au spawn
        if (wName.equals("hub")) {
            if (to.getY() < 60.0) {
                Location spawn = new Location(world, HUB_SPAWN_X, HUB_SPAWN_Y, HUB_SPAWN_Z, 0f, 0f);
                player.setVelocity(new Vector(0, 0, 0));
                player.setFallDistance(0f);
                player.teleport(spawn);
                player.playSound(spawn, Sound.ENTITY_ENDERMAN_TELEPORT, 0.8f, 1.2f);
                player.sendMessage("§6§lJoyStick FM §7» §eChute rattrapée ! Vous avez été repositionné au spawn.");
            }
        }
        // Lobby Mini-Jeux : chute sous Y=50
        else if (wName.equals("lobby_minijeux")) {
            if (to.getY() < 50.0) {
                Location spawn = new Location(world, 0.5, 65.0, 0.5, 0f, 0f);
                player.setVelocity(new Vector(0, 0, 0));
                player.setFallDistance(0f);
                player.teleport(spawn);
                player.playSound(spawn, Sound.ENTITY_ENDERMAN_TELEPORT, 0.8f, 1.2f);
                player.sendMessage("§6§lJoyStick FM §7» §eChute rattrapée au Lobby des Mini-Jeux.");
            }
        }
        // Hikabrain : chute dans le vide sous Y=55
        else if (wName.equals("hikabrain_jfm")) {
            if (to.getY() < 55.0) {
                Location respawn = (to.getZ() < 0) 
                    ? new Location(world, 0.5, 65.0, -21.5, 0f, 0f)
                    : new Location(world, 0.5, 65.0, 21.5, 180f, 0f);
                player.setVelocity(new Vector(0, 0, 0));
                player.setFallDistance(0f);
                player.teleport(respawn);
                player.playSound(respawn, Sound.ENTITY_ENDERMAN_TELEPORT, 0.6f, 1.5f);
            }
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

    // --- 7. IMMUNITÉ TOTALE VOID/FALL DANS LE HUB ---
    @EventHandler(priority = EventPriority.HIGHEST, ignoreCancelled = true)
    public void onEntityDamage(EntityDamageEvent event) {
        if (!(event.getEntity() instanceof Player player)) return;
        String wName = player.getWorld().getName().toLowerCase(Locale.ROOT);
        if (wName.equals("hub") || wName.equals("lobby_minijeux")) {
            if (event.getCause() == EntityDamageEvent.DamageCause.VOID ||
                event.getCause() == EntityDamageEvent.DamageCause.FALL) {
                event.setCancelled(true);
            }
        }
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
            // Preserve all inventory items, including ordinary compasses.
            // ItemJoin/Multiverse own their marked lobby items and profile transitions.
        }
    }

    /** Optional-at-load, mandatory-for-this-menu AuthMe v3 bridge.
     * Reflection avoids adding an AuthMe JAR to the compile classpath.
     * This protects the compass route only, not every server command or NPC.
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
