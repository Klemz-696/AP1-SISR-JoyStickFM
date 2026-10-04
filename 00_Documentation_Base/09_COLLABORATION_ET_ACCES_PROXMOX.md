# Document 09 : Guide de Collaboration & Accès Partagé aux VM sur Proxmox VE
## Projet AP 1 - BTS SIO SISR (Binôme 04 & 10)

---

## 1. Problématique & Diagnostic

Dans l'infrastructure Proxmox VE du lycée, les comptes étudiants sont isolés (chacun ne voit et ne contrôle que ses propres VM, souvent limitées par un pool de ressources ou des plages d'ID de VM comme `104` pour l'étudiant 04 et `110` pour l'étudiant 10).

Or, **l'étudiant 10 a déjà commencé à déployer la VM OPNsense**, et **l'étudiant 04 (plus expérimenté)** doit pouvoir intervenir dessus, auditer les configurations, et configurer les briques complexes (IPsec, QoS, Scrubbing).

Voici les deux approches concrètes pour résoudre cette contrainte :
1. **L'approche Système/Droits Proxmox** (si l'enseignant ou vous avez les droits d'administration PVE).
2. **L'approche Réseau & Prise en Main Directe** (**100% autonome**, ne nécessite aucune modification sur Proxmox).

---

## 2. Solution A : Débloquer l'accès partagé dans Proxmox VE (Via l'Enseignant)

Si votre enseignant a configuré les ACLs Proxmox, il peut très simplement vous regrouper en 2 minutes :

### Option 1 : Création d'un Pool de ressources partagé
L'enseignant crée un pool (ex: `Pool-AP1-Binome-04-10`) et accorde les droits aux deux comptes :
```bash
# Commandes exécutées par l'enseignant sur le nœud Proxmox :
pveum pool add Pool-AP1-Binome-04-10
pveum acl modify /pool/Pool-AP1-Binome-04-10 -user etu04@pve -role PVEVMAdmin
pveum acl modify /pool/Pool-AP1-Binome-04-10 -user etu10@pve -role PVEVMAdmin
```
Il suffit ensuite de déplacer la VM OPNsense (et les futures VM) dans ce pool : les deux étudiants voient et contrôlent toutes les VM depuis leur propre compte.

### Option 2 : Délégation directe de la VM existante
Si la VM OPNsense porte par exemple l'ID `1101` (créée par l'étudiant 10), l'enseignant peut autoriser l'étudiant 04 dessus :
```bash
pveum acl modify /vms/1101 -user etu04@pve -role PVEVMAdmin
```

---

## 3. Solution B : Accès Réseau Collaboratif (100% Autonome sans l'Enseignant)

En environnement SISR professionnel, **la console Proxmox (noVNC) n'est utile que pour l'installation initiale de l'OS**. 
Dès que la VM a une adresse IP et un service d'administration actif, **vous n'avez plus besoin d'ouvrir Proxmox pour travailler ensemble**.

```
  [ Poste Physique Étu 04 ]               [ Poste Physique Étu 10 ]
             |                                       |
             +-------------------+-------------------+
                                 |
                     [ Réseau des Postes du Lycée ]
                                 |
                                 v
        +-------------------------------------------------+
        |  ACCÈS DIRECTS SANS PASSER PAR LA CONSOLE PVE : |
        |  - OPNsense      -> WebGUI HTTPS (Port 443/80)  |
        |  - Windows Server -> RDP (3389) & WinRM (5985)  |
        |  - Serveur Linux -> SSH (Port 22)               |
        +-------------------------------------------------+
```

### A. Comment l'Étudiant 04 accède à l'OPNsense déployé par l'Étudiant 10 ?
1. **Depuis le LAN :**
   * L'étudiant 10 connecte son poste client sur le `vmbr1` (LAN) et ouvre `https://192.168.4.254`.
2. **Depuis le réseau du lycée (WAN) :**
   * Par défaut, OPNsense bloque l'accès à son interface web sur le WAN.
   * **Pour collaborer facilement au début**, l'étudiant 10 peut autoriser temporairement l'accès WebGUI sur le WAN :
     * Dans OPNsense : **Firewall > Rules > WAN** > Ajouter une règle :
       * Action : `Pass` | Protocol : `TCP` | Destination : `WAN address` | Port : `443` (HTTPS)
   * **Résultat :** L'étudiant 04 tape simplement l'adresse IP WAN de l'OPNsense dans son navigateur (`https://172.20.10.XX`) et a les pleins accès d'administration en direct !
   *(Cette règle sera supprimée ou restreinte à la fin pour valider le test d'opacité WAN de la Mission 1).*

### B. Comment collaborer sur le Windows Server ?
* L'étudiant 10 installe la VM Windows Server (`10.4.1.20`) et active le **Bureau à distance (RDP)** :
  * *Paramètres > Système > Bureau à distance > Activer*.
* L'étudiant 04 peut alors s'y connecter :
  * Soit via un poste sur le LAN / VPN nomade.
  * Soit via une règle NAT temporaire sur OPNsense redirigeant un port vers le 3389 du serveur Windows.

### C. Comment collaborer sur les conteneurs Docker (Immich / Minecraft) ?
* L'étudiant 04 et 10 installent la clé SSH publique de chacun dans `/home/debian/.ssh/authorized_keys`.
* Les deux peuvent ouvrir une session SSH ou utiliser **VS Code Remote-SSH** en simultané sur la machine.

---

## 4. Réajustement de la dynamique de Binôme (Pair-Programming SISR)

Puisque **l'étudiant 10 a déjà commencé OPNsense** et que **l'étudiant 04 a plus d'expérience**, nous adaptons la méthode de travail sur le modèle **Lead / Mentor** :

```
             ┌────────────────────────────────────────────────────────┐
             │       ÉTU 10 : Déploiement & Configuration Socle       │
             │  (Installation OPNsense, interfaces, IP WAN, règles)  │
             └──────────────────────────┬─────────────────────────────┘
                                        │
                                        ▼  Validation & Co-working
             ┌────────────────────────────────────────────────────────┐
             │      ÉTU 04 : Ingénierie Avancée, Sécurité & QoS       │
             │  (IPsec IKEv2, Shaper dummynet, Scrubbing, Scripts)    │
             └────────────────────────────────────────────────────────┘
```

1. **Sur OPNsense :**
   * **Étu 10** finalise l'attribution des 4 interfaces (`WAN`, `LAN`, `DMZ_INT`, `DMZ_EXT`), le bail DHCP initial WAN et sa fixation en IP statique.
   * **Étu 04** prend le relais pour :
     * Configurer la discrétion (Scrubbing / Normalisation, blocage ICMP).
     * Mettre en place le Traffic Shaper QoS (les 2 Mb/s, les queues et priorités).
     * Monter le serveur IPsec IKEv2 et les certificats.
2. **Sur Windows Server & Sauvegarde :**
   * **Étu 10** configure le partage de fichiers SMB et installe le poste client employé.
   * **Étu 04** valide l'activation de WinRM (PowerShell Remoting) et intègre le script [`scripts/Backup-Documents.ps1`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/scripts/Backup-Documents.ps1).
3. **Sur Docker & WebRadio :**
   * **Étu 04** déploie la pile `docker-compose.yml` d'Immich et du serveur Minecraft.
   * **Étu 10** s'occupe de la récupération et du déploiement de la WebRadio Icecast (dont il a déjà l'expérience grâce au projet précédent).
