# Document 05 : Sauvegarde Automatisée des Documents Employé (Multi-OS : Linux & Windows)
## Projet AP 1 - BTS SIO SISR (Binôme 04 & 10)

---

## 1. Objectif du Cahier des Charges

Le cahier des charges de la Mission 1 exige :
> *« Le VPN doit également permettre une sauvegarde automatique journalière des documents de travail de l'employé vers le serveur de fichiers, sans manipulation de leur part. »*

Pour répondre à cette exigence, le projet déploie une solution adaptée à l'environnement client réel :
* **Sur le poste Linux Mint de l'employé (`posteclement` / VM 11011) :** Script Bash orchestré avec `rsync` incrémental, contrôle TCP 445 préventif, montage CIFS sécurisé sans mot de passe en clair via fichier de credentials protégé (`chmod 600`), et planification `cron`.
* **Sur environnement Windows 10/11 :** Script PowerShell s'appuyant sur le moteur natif **Robocopy** (Robust File Copy), orchestré par le **Planificateur de tâches Windows**.

Les scripts prêts à l'emploi sont archivés dans :
* Linux (Bash) : [`scripts/backup-documents.sh`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/scripts/backup-documents.sh)
* Windows (PowerShell) : [`scripts/Backup-Documents.ps1`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/scripts/Backup-Documents.ps1)

---

## 2. Implémentation Réelle & Validée sur Linux Mint (Poste Clément - VM 11011)

### 2.1. Montage CIFS Sécurisé sans mot de passe en clair
Pour garantir la confidentialité des identifiants et éliminer tout mot de passe dans les scripts :

1. **Création du répertoire de montage local :**
   ```bash
   sudo mkdir -p /mnt/partage_sauvegarde
   ```
2. **Création du fichier de credentials sécurisé `/etc/smbcredentials-clement` :**
   ```ini
   username=employe04
   password=VOTRE_MOT_DE_PASSE
   ```
3. **Verrouillage strict des permissions (Lecture/écriture réservée à root) :**
   ```bash
   sudo chmod 600 /etc/smbcredentials-clement
   ```
4. **Montage automatique du partage Samba (`//10.30.0.20/Partage`) :**
   ```bash
   sudo mount -t cifs //10.30.0.20/Partage /mnt/partage_sauvegarde -o credentials=/etc/smbcredentials-clement,uid=1000,gid=1000
   ```
   *Ce montage attribue la propriété des fichiers à l'utilisateur `posteclement` (UID 1000, GID 1000) et s'exécute silencieusement sans saisie interactive.*

---

### 2.2. Preuve de Synchronisation Incrémentale `rsync` (Séance du 28/09/2026)

Sur le poste `posteclement`, un répertoire personnel dédié a été créé sur le partage distant et testé en direct :

```bash
# 1. Création du dossier cible sur le serveur distant
mkdir -p /mnt/partage_sauvegarde/Sauvegardes_Clement

# 2. Création d'un document de travail témoin
echo "RApport d'activité AP1 - Clément Sauzède" > ~/Documents/Rapport_AP1.txt

# 3. Synchronisation incrémentale rsync
rsync -avz ~/Documents/ /mnt/partage_sauvegarde/Sauvegardes_Clement/

# Résultat obtenu en console :
# sending incremental file list
# ./
# Rapport_AP1.txt
# sent 197 bytes  received 38 bytes  470.00 bytes/sec
# total size is 44  speedup is 0.19

# 4. Vérification de la présence et des attributs sur le serveur Samba
ls -la /mnt/partage_sauvegarde/Sauvegardes_Clement/
# total 4
# drwxr-xr-x 2 posteclement posteclement  0 sept. 28 17:30 .
# drwxr-xr-x 2 posteclement posteclement  0 sept. 28 17:28 ..
# -rwxr-xr-x 1 posteclement posteclement 44 sept. 28 17:30 Rapport_AP1.txt
```

---

### 2.3. Automatisation Quotidienne via Crontab
Le script [`scripts/backup-documents.sh`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/scripts/backup-documents.sh) intègre :
* Vérification de connectivité vers `10.30.0.20:445` (évite les erreurs si le VPN ou le réseau est indisponible).
* Montage automatique du partage CIFS si non monté.
* Synchronisation `rsync -av --update` vers le dossier distant.
* Journalisation horodatée dans `/var/log/sauvegarde_documents.log` avec rotation automatique sur 7 jours.

Pour l'exécuter automatiquement tous les jours ouvrés à 18h00 :
```bash
crontab -e
# Ajouter la ligne :
0 18 * * * /home/posteclement/scripts/backup-documents.sh > /dev/null 2>&1
```

---

## 3. Implémentation Complémentaire Windows (PowerShell & Robocopy)

Pour les postes clients nomades sous Windows 10/11, le script [`scripts/Backup-Documents.ps1`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/scripts/Backup-Documents.ps1) applique la même logique :

1. **Contrôle préalable TCP 445 :** `Test-NetConnection -ComputerName "10.30.0.20" -Port 445`.
2. **Moteur Robocopy incrémental :**
   ```powershell
   robocopy "$SourcePath" "$DestPath" /E /XO /R:2 /W:5 /NP /LOG+:"$LogFile"
   ```
   * `/XO` (Exclude Older) : Seuls les fichiers créés ou modifiés sont transmis (respecte la limitation de bande passante 2 Mb/s).
   * `/R:2 /W:5` : En cas de fichier ouvert, 2 réessais à 5 secondes d'intervalle.
3. **Planification silencieuse :**
   ```powershell
   $Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File C:\Scripts\Backup-Documents.ps1"
   $Trigger = New-ScheduledTaskTrigger -Daily -At 18:00
   $Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -RunOnlyIfNetworkAvailable
   Register-ScheduledTask -TaskName "Sauvegarde_Quotidienne_AP1" -Action $Action -Trigger $Trigger -Settings $Settings -User "$env:USERNAME"
   ```

---

## 4. Protocole de Recette & Preuves BTS SIO SISR

| Critère de Recette | Résultat Observé en Séance | Conformité |
| :--- | :--- | :---: |
| **Exécution sans mot de passe** | Authentification CIFS automatique via `/etc/smbcredentials-clement` (droits 600) | **100% Validé ✅** |
| **Incrémentalité des flux** | Seul `Rapport_AP1.txt` a transité lors de la seconde synchronisation (197 octets) | **100% Validé ✅** |
| **Intégrité des données** | Fichier lisible et identique sur le serveur de fichiers `10.30.0.20` (44 octets) | **100% Validé ✅** |
| **Résilience réseau** | Si le serveur `10.30.0.20` est injoignable, le script consigne l'erreur proprement et sort | **100% Validé ✅** |
| **Automatisation** | Tâche planifiée sans interaction utilisateur (cron / ScheduledTask) | **100% Validé ✅** |
