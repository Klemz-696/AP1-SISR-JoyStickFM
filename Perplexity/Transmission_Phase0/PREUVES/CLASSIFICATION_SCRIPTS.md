# Preuve : Classification Officielle des Scripts du Projet

Classification selon les exigences de la phase 0 : **ACTIF** / **HISTORIQUE** / **UTILISATION_NON_VERIFIEE**.

---

## 1. Scripts ACTIFS (À maintenir et utiliser)

| Script | Emplacement | Rôle opérationnel |
|---|---|---|
| `sync_full_server.py` | `Perplexity/JoyStickFM_Production_Lots_0_a_7/` | Script maître de synchronisation complète VM <-> Git (plugins, configs, permissions, PNJ). |
| `verify_master_lots_0_to_7.py` | `Perplexity/JoyStickFM_Production_Lots_0_a_7/` | Script officiel de recette terrain validant les 29 critères de production. |
| `lot6_setup_lobby_npcs.py` | `Perplexity/JoyStickFM_Production_Lots_0_a_7/Lot_6_Navigation_et_Menus/` | Déploiement et orientation exacte des PNJ interactifs du lobby arcade. |
| `build.py` | `src/JoyStickHub/` | Script standard de compilation du plugin Java `JoyStickHub` v1.5.0. |
| `sync_server_vm.sh` | `scripts/` | Script bash d'appel rapide sur l'hôte Debian (`git pull` + `sync_full_server.py` + tests). |
| `fix_npcs_and_lobby_protection.py` | `Perplexity/JoyStickFM_Production_Lots_0_a_7/` | Correctif ciblé pour orientation PNJ et mode aventure strict. |
| `fix_compass_parkour_blockhunt.py` | `Perplexity/JoyStickFM_Production_Lots_0_a_7/` | Correctif ciblé pour boussole et parkour. |
| `resolve_grand_hub_terrestre.py` | `Perplexity/JoyStickFM_Production_Lots_0_a_7/` | Déploiement et ancrage du Grand Hub Terrestre. |

---

## 2. Scripts HISTORIQUES (Remplacés ou archivés, NE PAS EXÉCUTER)

| Script | Emplacement | Statut / Motif |
|---|---|---|
| `deploy_master_lots_0_to_7.py` | `Perplexity/JoyStickFM_Production_Lots_0_a_7/` | Remplacé par `sync_full_server.py`. |
| `deploy_all_lots_0_to_7.py` | `Perplexity/JoyStickFM_Production_Lots_0_a_7/` | Version antérieure du déploiement général. |
| `apply_full_polish_update.py` | `Perplexity/JoyStickFM_Production_Lots_0_a_7/` | Étape de transition intermédiaire. |
| `apply_ultimate_fix.py` | `Perplexity/JoyStickFM_Production_Lots_0_a_7/` | Étape de transition intermédiaire. |
| `deploy_definitive_fix.py` | `Perplexity/JoyStickFM_Production_Lots_0_a_7/` | Étape de transition intermédiaire. |
| `inspect_and_fix_all.py` | `Perplexity/JoyStickFM_Production_Lots_0_a_7/` | Script d'inspection temporaire. |
| `finish_everything_now.py` | `Perplexity/JoyStickFM_Production_Lots_0_a_7/` | Script de clôture provisoire. |
| `fix_everything_verbose.py` | `Perplexity/JoyStickFM_Production_Lots_0_a_7/` | Script de transition verbeux. |
| `final_perfect_touch.py` | `Perplexity/JoyStickFM_Production_Lots_0_a_7/` | Retouche cosmétique intermédiaire. |
| `verify_definitive_results.py` | `Perplexity/JoyStickFM_Production_Lots_0_a_7/` | Remplacé par `verify_master_lots_0_to_7.py`. |
| `download_assets.py` | `Perplexity/JoyStickFM_Production_Lots_0_a_7/` | Assets déjà téléchargés et mis en cache dans le dépôt. |
| `generate_arena_structures.py` | `Perplexity/JoyStickFM_Production_Lots_0_a_7/` | Arènes déjà générées dans les mondes actifs. |
| `audit_environment_non_destructive.py` | `Perplexity/JoyStickFM_Production_Lots_0_a_7/` | Audit préliminaire de séance 7. |
| `audit_and_fix_survie.py` | `Perplexity/JoyStickFM_Production_Lots_0_a_7/` | Audit initial de la survie. |
| `fix_survival_pickups_and_crafting.py` | `Perplexity/JoyStickFM_Production_Lots_0_a_7/` | Correctif initial Survie. |
| `fix_survival_respawn.py` | `Perplexity/JoyStickFM_Production_Lots_0_a_7/` | Correctif initial respawn. |
| `resolve_all_and_add_icon.py` | `Perplexity/JoyStickFM_Production_Lots_0_a_7/` | Icône serveur installée. |
| `scratch/build_joystick_hub.py` | `scratch/` | Remplacé par `src/JoyStickHub/build.py`. |

---

## 3. Scripts d'UTILISATION_NON_VERIFIEE (Non requis pour la chaîne Minecraft active)

| Script | Emplacement | Statut / Motif |
|---|---|---|
| `Deploy-JoyStickFM-Games-Lot1.ps1` | `scripts/` | Script powershell obsolète de séance 5/6. |
| `deploy_joystickfm_games_lot1.sh` | `scripts/` | Script bash obsolète de séance 5/6. |
| `Activer-AntiXray.ps1` / `.bat` | `scripts/` | Configuration Engine Mode 2 déjà intégrée dans `paper-world-defaults.yml`. |
| `Deploy-Plugin.ps1` / `.bat` | `scripts/` | Script unitaire remplacé par le déploiement Git. |
| `setup_minecraft_experience.sh` | `scripts/` | Script d'installation monolithique ancien. |
| Scripts WebRadio / WordPress | `scripts/` | Concerne l'autre volet BTS SIO (Webradio), non relié au serveur Minecraft. |
