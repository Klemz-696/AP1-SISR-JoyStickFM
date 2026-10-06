package fm.joystick.hub;

import org.bukkit.Bukkit;
import org.bukkit.GameMode;
import org.bukkit.Location;
import org.bukkit.Material;
import org.bukkit.Sound;
import org.bukkit.World;
import org.bukkit.block.Block;
import org.bukkit.entity.Player;
import org.bukkit.entity.Villager;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
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
import org.bukkit.inventory.ItemStack;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.util.Vector;

import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class JoyStickHub extends JavaPlugin implements Listener {

    private final Map<UUID, String> lastDeathWorld = new ConcurrentHashMap<>();
    
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
        getServer().getPluginManager().registerEvents(this, this);
        getLogger().info("JoyStickHub v1.5.0 (PNJ Interactifs, Protection Lobby & Gamemode Strict) actif !");
    }

    @Override
    public void onDisable() {
        getLogger().info("JoyStickHub désactivé proprement.");
    }

    // --- 1. BOUSSOLE DU MENU : OUVERTURE IMMÉDIATE SANS JUMPTO ---
    @EventHandler(priority = EventPriority.LOWEST, ignoreCancelled = false)
    public void onCompassInteract(PlayerInteractEvent event) {
        ItemStack item = event.getItem();
        if (item != null && item.getType() == Material.COMPASS) {
            event.setCancelled(true);
            Player player = event.getPlayer();
            player.performCommand("dm open games");
            player.playSound(player.getLocation(), Sound.UI_BUTTON_CLICK, 0.8f, 1.2f);
        }
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

    // --- 4. GESTION STRICTE DU GAMEMODE & RETRAIT DE LA BOUSSOLE EN SURVIE ---
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
        if (world == null) return;
        String wName = world.getName().toLowerCase(Locale.ROOT);

        // A. MONDE SURVIE : SURVIVAL STRICT & RETRAIT DE LA BOUSSOLE
        if (wName.equals("survie") || wName.startsWith("survie_")) {
            player.getInventory().remove(Material.COMPASS);
            ItemStack slot4 = player.getInventory().getItem(4);
            if (slot4 != null && slot4.getType() == Material.COMPASS) {
                player.getInventory().setItem(4, null);
            }

            if (player.getGameMode() != GameMode.SURVIVAL && player.getGameMode() != GameMode.CREATIVE) {
                player.setGameMode(GameMode.SURVIVAL);
                player.sendMessage("§6§lJoyStick FM §7» §aMode Survie actif !");
            }
        } 
        // B. HUB & LOBBY MINI-JEUX : ADVENTURE STRICT & ATTRIBUTION BOUSSOLE
        else if (wName.equals("hub") || wName.equals("lobby_minijeux")) {
            if (player.getGameMode() != GameMode.ADVENTURE && player.getGameMode() != GameMode.CREATIVE) {
                player.setGameMode(GameMode.ADVENTURE);
            }

            // Purge d'éventuels items de combat résiduels (BlockHunt, BedWars)
            boolean hasBattleGear = false;
            for (ItemStack item : player.getInventory().getContents()) {
                if (item != null) {
                    Material mat = item.getType();
                    if (mat == Material.DIAMOND_SWORD || mat == Material.IRON_SWORD ||
                        mat == Material.BOW || mat == Material.ARROW ||
                        mat.name().contains("IRON_") || mat.name().contains("DIAMOND_")) {
                        hasBattleGear = true;
                        break;
                    }
                }
            }

            if (hasBattleGear) {
                player.getInventory().clear();
                player.getInventory().setArmorContents(null);
            }

            // Redonner la boussole
            Bukkit.getScheduler().runTaskLater(this, () -> {
                if (!player.getInventory().contains(Material.COMPASS)) {
                    Bukkit.dispatchCommand(Bukkit.getConsoleSender(), "itemjoin get game-selector " + player.getName());
                }
            }, 5L);
        }
        // C. AUTRES MONDES (MINI-JEUX)
        else {
            Bukkit.getScheduler().runTaskLater(this, () -> {
                if (!player.getInventory().contains(Material.COMPASS)) {
                    Bukkit.dispatchCommand(Bukkit.getConsoleSender(), "itemjoin get game-selector " + player.getName());
                }
            }, 5L);
        }
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
            Bukkit.getScheduler().runTaskLater(this, () -> {
                player.getInventory().remove(Material.COMPASS);
            }, 2L);
        }
    }
}
