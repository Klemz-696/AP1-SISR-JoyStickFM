# 📋 Guide de Reprise & Backlog des Évolutions du Jeu WebRadio
**Document Stratégique & Opérationnel**  
**Chemin :** `Documentation_Avancement_Jeu_Webradio/02_GUIDE_DE_REPRISE_ET_BACKLOG_EVOLUTIONS.md`

---

## 🚀 1. Procédure de Reprise Immédiate

Lorsque l'on souhaite reprendre le développement du jeu WebRadio plus tard, voici les commandes clés et rappels d'infrastructure :

### A. Accès au serveur WebRadio
```bash
# Depuis le poste de développement Windows :
ssh root@10.100.0.51
```

### B. Emplacements des fichiers en production
- **Template autonome :** `/var/www/html/wp-content/themes/joystickfm-theme/page-jeux.php`
- **Plugin de jeu :** `/var/www/html/wp-content/plugins/joystickfm-games/`
- **Moteur visuel & sons :** `/var/www/html/wp-content/plugins/joystickfm-games/assets/js/portal.js`
- **Feuille de style 3D :** `/var/www/html/wp-content/plugins/joystickfm-games/assets/css/games-portal.css`

### C. Déploiement rapide après modification locale
```powershell
# Commande SCP pour déployer les fichiers modifiés depuis la racine du projet :
scp -o BatchMode=yes "AP_Webradio/3- Website/joystickfm-theme/page-jeux.php" root@10.100.0.51:/var/www/html/wp-content/themes/joystickfm-theme/
scp -o BatchMode=yes "AP_Webradio/3- Website/joystickfm-games/assets/css/games-portal.css" root@10.100.0.51:/var/www/html/wp-content/plugins/joystickfm-games/assets/css/
scp -o BatchMode=yes "AP_Webradio/3- Website/joystickfm-games/assets/js/portal.js" root@10.100.0.51:/var/www/html/wp-content/plugins/joystickfm-games/assets/js/
scp -o BatchMode=yes "AP_Webradio/3- Website/joystickfm-games/includes/class-jfm-games-pages.php" root@10.100.0.51:/var/www/html/wp-content/plugins/joystickfm-games/includes/
```

---

## 🔮 2. Backlog des Évolutions Futures Envisagées

Voici la liste des fonctionnalités imaginées pour étendre l'univers de jeu lors de la prochaine phase de développement :

### 1. Marché d'Échange de Cartes (Trading Market B2B / Auditeurs)
- Permettre à deux joueurs d'échanger des cartes en double contre des cartes manquantes.
- Système de proposition d'échange avec délai d'expiration (48h) et validation mutuelle par code PIN.

### 2. Mode Arène / Duel de Cartes JoyStick TCG
- Système de combat tour par tour utilisant les statistiques de puissance (`power`) et les catégories des cartes (Hardware > Hero > Item > Legend).
- Possibilité de défier d'autres auditeurs connectés ou un bot IA rétro.

### 3. Passerelle Interactive WebRadio ↔ Serveur Minecraft AP 1
- **Liaison de comptes :** Possibilité pour un joueur d'associer son pseudo Minecraft (ex: `Klemz_696`) à son compte JoyStick FM.
- **Récompenses croisées :**
  - Ouvrir une carte Légendaire sur le WebRadio TCG ➔ Débloque un titre ou une épée personnalisée sur le serveur Minecraft.
  - Vaincre un boss ou remporter une manche Bedwars sur Minecraft ➔ Crédite automatiquement 100 JoyCoins et 2 boosters gratuits sur le site web.

### 4. Nouvelles Séries de Boosters Thématiques
- Extension « Édition Bornes d'Arcade 1990 » (15 nouvelles cartes).
- Extension « Édition Consoles Portables » (Game Boy, Game Gear, Lynx, PSP).
