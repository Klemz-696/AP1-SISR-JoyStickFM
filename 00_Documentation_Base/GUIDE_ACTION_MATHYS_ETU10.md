# Guide d'Action Opérationnel — Mathys DUTHILLEUL (Étudiant 10)
## Admin Systèmes & Support Déploiement
### Atelier Professionnalisant AP 1 • BTS SIO SISR (Binôme 04 & 10)

---

## 🎯 Votre Rôle & Objectifs dans le Projet

Vous êtes en charge du socle système Windows Server 2022, de la préparation des postes de travail clients, de la coordination avec le binôme partenaire extérieur et de l'exécution des tests de recette (captures d'écran pour l'épreuve E5).

> [!NOTE]
> **Autonomie & Sérénité :**
> Ce guide vous donne toutes les étapes pas-à-pas, avec les commandes exactes à copier/coller. Vous pouvez réaliser vos missions à votre rythme, sans bloquer Clément et sans être bloqué par lui.

---

## 📋 PLAN DE VOL DE MATHYS (5 ÉTAPES MAJEURES)

```
[ Étape M1 ] Windows Server 2022 : Installation, IP .20, Rôle SMB & Partages
     │
[ Étape M2 ] Poste Client Mathys : IP .10, Test Réseau & Montage du Partage SMB
     │
[ Étape M3 ] Coordination Partenaire : Échange des Adresses pour le Tunnel B2B
     │
[ Étape M4 ] Pot de Miel LAMP Leurre : Déploiement Debian .99 & Apache
     │
[ Étape M5 ] Campagne de Recette : Tests Fonctionnels & Captures d'Écran E5
```

---

## 🖥️ Étape M1 : Déploiement du Serveur de Fichiers Windows Server (`SRV-FILES`)

> **📍 Pendant que vous faites cette étape, Clément réalise :**
> L'étape **C1** de son côté (Configuration du pare-feu OPNsense, du WAN statique et du Traffic Shaper).

### 1. Création de la VM sous Proxmox VE :
* Créer une VM nommée `SRV-FILES` (VMID par exemple `120`).
* RAM : `4096 Mo` (4 Go) | CPU : `2 cœurs`.
* Disque : `40 Go` sur `local-lvm`.
* Réseau : Pont **`vmbr2`** (DMZ Interne - VLAN 300).
* Installer Windows Server 2022 Standard (Expérience utilisateur / GUI).

### 2. Configuration IP & PowerShell (Ouvrir PowerShell en Administrateur) :
Copiez et collez directement ce bloc de commandes :
```powershell
# Renommage du serveur
Rename-Computer -NewName "SRV-FILES" -Force

# Configuration de l'IP statique (10.30.0.20)
Get-NetAdapter | New-NetIPAddress -IPAddress 10.30.0.20 -PrefixLength 24 -DefaultGateway 10.30.0.254
Set-DnsClientServerAddress -InterfaceAlias (Get-NetAdapter).Name -ServerAddresses ("1.1.1.1","8.8.8.8")

# Installation du rôle de partage de fichiers SMB
Install-WindowsFeature -Name FS-FileServer -IncludeManagementTools

# Création des dossiers de partage
New-Item -Path "C:\Partages\Sauvegardes\employe04" -ItemType Directory -Force
New-Item -Path "C:\Partages\Sauvegardes\employe10" -ItemType Directory -Force

# Création des utilisateurs employés
$pass = ConvertTo-SecureString "P@ssw0rdBTS2026!" -AsPlainText -Force
New-LocalUser -Name "employe04" -Password $pass -FullName "Employe Clement"
New-LocalUser -Name "employe10" -Password $pass -FullName "Employe Mathys"

# Création du partage SMB
New-SmbShare -Name "Sauvegardes" -Path "C:\Partages\Sauvegardes" -FullAccess "Administrateur" -ChangeAccess "employe04","employe10"

# Application des droits d'accès stricts (NTFS)
icacls "C:\Partages\Sauvegardes\employe04" /inheritance:r /grant:r "Administrateur:(OI)(CI)F" "employe04:(OI)(CI)M"
icacls "C:\Partages\Sauvegardes\employe10" /inheritance:r /grant:r "Administrateur:(OI)(CI)F" "employe10:(OI)(CI)M"

# Activation de WinRM pour l'administration à distance
Enable-PSRemoting -Force
Restart-Computer -Force
```

> 🤝 **Quand solliciter Clément ?**
> Une fois la machine redémarrée, dites à Clément : *« Ma VM SRV-FILES est prête en 10.30.0.20, tu peux tester si elle ping depuis OPNsense »*.

---

## 💻 Étape M2 : Configuration de votre Poste Client (`CLT-DUTHILLEUL`)

> **📍 Pendant que vous faites cette étape, Clément réalise :**
> L'étape **C2** de son côté (Migration V2V sous Proxmox de la WebRadio JoyStick FM).

### 1. Configuration Réseau du Poste Client :
* Ouvrir les paramètres réseau de votre machine cliente (reliée sur **`vmbr1`** / VLAN 200).
* Fixer l'adresse IP manuellement (respect de la règle `.10`) :
  * Adresse IPv4 : **`192.168.200.10`**
  * Masque de sous-réseau : `255.255.255.0` (`/24`)
  * Passerelle par défaut : `192.168.200.254`
  * Serveur DNS : `192.168.200.254` (ou `1.1.1.1`)

### 2. Test d'Accès au Partage de Fichiers :
1. Appuyer sur `Windows + R`, taper : `\\10.30.0.20\Sauvegardes` et valider.
2. S'authentifier avec `employe10` / `P@ssw0rdBTS2026!`.
3. Vérifier que vous pouvez créer un fichier texte dans votre dossier `employe10`.
4. Vérifier que l'accès au dossier `employe04` vous est **refusé** (preuve de sécurité NTFS pour l'oral E5).

---

## 🤝 Étape M3 : Coordination avec le Binôme Partenaire (Mission 2)

> **📍 Pendant que vous faites cette étape, Clément réalise :**
> L'étape **C3** de son côté (Déploiement des conteneurs Docker Immich et Minecraft).

### Votre mission de contact :
Rapprochez-vous du binôme partenaire désigné par l'enseignant pour la Mission 2 et complétez la **Fiche de Liaison Inter-Entreprises** :

| Paramètre à recueillir | Valeur à demander au Partenaire | Valeur de Notre Entreprise (à leur donner) |
| :--- | :--- | :--- |
| **IP WAN OPNsense** | `192.168.101.____` | **`192.168.101.41`** |
| **Sous-réseau LAN distant** | `192.168.____.0/24` | `192.168.200.0/24` |
| **IP Serveur Immich cible** | `10.____.____.____` | **`10.30.0.21`** (Notre serveur) |
| **Clé Partagée (PSK)** | *À convenir ensemble* | `ClePartenaireSecreteBTS2026!` |

> 🤝 **Quand solliciter Clément ?**
> Dès que vous avez l'adresse IP WAN et le sous-réseau du partenaire, donnez-les à Clément : *« Clément, voici les IP du partenaire pour que tu puisses monter le tunnel IPsec Site-à-Site »*.

---

## 🍯 Étape M4 : Déploiement de la VM Honeypot LAMP (`SRV-HONEYPOT`)

> **📍 Pendant que vous faites cette étape, Clément réalise :**
> L'étape **C4** de son côté (Configuration de l'autorité de certification PKI et du serveur VPN Nomade).

### 1. Déploiement de la VM sous Proxmox VE :
* Créer une VM Debian 12 minimale nommée `SRV-HONEYPOT` (VMID par exemple `160`).
* RAM : `1024 Mo` (1 Go) | CPU : `1 cœur`.
* Réseau : Pont **`vmbr3`** (DMZ Externe - VLAN 100).
* IP Fixe : `10.100.0.99/24` | Passerelle : `10.100.0.254`.

### 2. Installation d'Apache Leurre :
Connectez-vous en terminal sur la VM et lancez :
```bash
apt-get update && apt-get install -y apache2 mailutils msmtp
# Vider le site web pour afficher une page blanche ou erreur 403 leurre
rm -f /var/www/html/index.html
touch /var/www/html/index.html
systemctl restart apache2
```

---

## 📸 Étape M5 : Campagne de Tests de Recette & Captures d'Écran E5

> **📍 Pendant que vous faites cette étape, Clément réalise :**
> L'étape **C5** de son côté (Montage du tunnel IPsec Site-à-Site et filtrage chirurgical).

Votre rôle est capital : vous devez réaliser et archiver les **captures d'écran de preuve** demandées par la grille d'évaluation BTS SIO SISR :

1. **Capture 1 (Sécurité WAN) :** Faire un `ping 192.168.101.41` depuis le réseau lycée ➔ Montrer 100% de paquets perdus.
2. **Capture 2 (WebRadio JoyStick FM) :**
   * Ouvrir `http://192.168.101.41/` ➔ Capturer la page d'accueil du site web et le lecteur en lecture.
   * Ouvrir `http://192.168.101.41:8000/joystick-fm` dans VLC ➔ Capturer la lecture du flux direct.
3. **Capture 3 (Accès SMB Sécurisé) :**
   * Capturer la fenêtre de l'explorateur Windows sur `\\10.30.0.20\Sauvegardes\employe10`.
   * Capturer le message d'erreur d'accès refusé lors du clic sur `employe04`.
4. **Capture 4 (Client VPN Nomade) :**
   * Importer le certificat `Cert-Client-10.p12` (fourni par Clément) sur votre poste.
   * Connecter le VPN Windows vers `192.168.101.41` ➔ Capturer l'état `Connecté` avec l'adresse IP `10.200.100.10`.
5. **Capture 5 (Partage Photo Immich B2B) :**
   * Ouvrir dans le navigateur le lien public généré par Clément pour l'album partagé.
   * Capturer la galerie photo sans authentification requise.
