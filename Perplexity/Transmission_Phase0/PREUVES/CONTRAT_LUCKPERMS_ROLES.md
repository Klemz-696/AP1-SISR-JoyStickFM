# Preuve : Contrat et Matrice des Permissions LuckPerms

Relevé extrait directement des fichiers de configuration YAML actifs dans `/opt/minecraft/data/plugins/LuckPerms/groups/`.

---

## 1. Hiérarchie des Rôles

```
default  (Groupe de base minimal)
   └── joueur  (Grade Joueur standard avec droits de jeu)
         └── vip  (Grade Donateur / Partenaire Webradio)
               └── modo  (Équipe de modération)
                     └── admin  (Administration système)
```

---

## 2. Matrice Détaillée des Permissions

### A. Groupe `default` (`default.yml`)
- Poids : Non défini
- Héritage : Aucun
- Rôle : Conteneur minimal, les nouveaux joueurs sont promus `joueur`.

### B. Groupe `joueur` (`joueur.yml`)
- Préfixe : `&7[Joueur] `
- Héritage : `default`
- Permissions accordées :
  - **Survie** : `essentials.spawn`, `essentials.tpa`, `essentials.tpaccept`, `essentials.tpdeny`, `essentials.sethome`, `essentials.home`, `essentials.delhome`, `griefprevention.claims` (revendication pelle d'or).
  - **Lobbies & Menus** : `deluxemenus.menu`, `deluxemenus.games`, `itemjoin.use`.
  - **Mini-Jeux** :
    - BedWars : `bedwars.player`, `bedwars.join`, `bedwars.leave`
    - BlockHunt : `blockhunt.player`, `blockhunt.join`, `blockhunt.leave`
  - **Communication** : `lpc.chat` (formatage couleur standard).

### C. Groupe `vip` (`vip.yml`)
- Préfixe : `&6[VIP] `
- Héritage : `joueur`
- Permissions additionnelles :
  - Homes supplémentaires (3 homes au lieu d'1).
  - Accès aux cosmétiques de lobby (sans impact gameplay).

### D. Groupe `modo` (`modo.yml`)
- Préfixe : `&9[Modérateur] `
- Héritage : `vip`
- Permissions additionnelles :
  - `essentials.kick`, `essentials.mute`, `essentials.teleport`, `essentials.invsee`.
  - `coreprotect.inspect`, `coreprotect.lookup` (investigation grief).

### E. Groupe `admin` (`admin.yml`)
- Préfixe : `&c[Admin] `
- Héritage : `modo`
- Permissions accordées : `*` (Accès total maintenance et administration).
