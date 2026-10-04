# Document 01 : Architecture Réseau & Plan d'Adressage Complet
## Projet AP 1 - BTS SIO SISR (Lycée Sidoine Apollinaire)
### Binôme : Clément SAUZÈDE (Étu 04) & Mathys DUTHILLEUL (Étu 10)

---

## 1. Contexte, Équipe & Normes Métier

* **Établissement :** Lycée Sidoine Apollinaire (Clermont-Ferrand)
* **Formation :** BTS SIO (Services Informatiques aux Organisations) — Option SISR (2e année)
* **Projet :** AP 1 — VPN, interconnexion et services réseau
* **Étudiant 04 (Lead Réseau, Sécurité & WebRadio JoyStick FM) :** Clément SAUZÈDE
* **Étudiant 10 (Admin Systèmes & Services Internes) :** Mathys DUTHILLEUL

### Application stricte des règles du cahier des charges :
1. **Adresse WAN fixe :** Attribuée par le réseau du lycée sur le VLAN partagé, fixée à **`192.168.101.41 /24`** (Passerelle lycée `192.168.101.254`).
2. **Règle du dernier octet des postes clients :**
   * Poste Clément SAUZÈDE ➔ Adresse IP se terminant obligatoirement par **`.4`**.
   * Poste Mathys DUTHILLEUL ➔ Adresse IP se terminant obligatoirement par **`.10`**.
3. **Segmentation stricte par VLANs :**
   * **VLAN 100 :** DMZ Externe (Services publics : WebRadio JoyStick FM, Honeypot LAMP)
   * **VLAN 200 :** LAN d'Entreprise (Postes employés et administration)
   * **VLAN 300 :** DMZ Interne (Services d'infrastructure sensibles : Fichiers SMB, Immich, Minecraft)
4. **Passerelle OPNsense sur chaque zone interne :** Toujours positionnée sur l'adresse **`.254`**.
5. **Absorption du pare-feu WebRadio :** L'ancien pare-feu `OPNSense_Joystick-FM` a été retiré, ses règles NAT étant directement intégrées au pare-feu central `OPNsense-AP1`.

---

## 2. Topologie Réseau & Infrastructure Proxmox VE

```
                                      +---------------------------------------------+
                                      |         PROXMOX VE - LYCÉE SIDOINE          |
                                      +---------------------------------------------+
                                                             |
                                         [ vmbr0 : WAN / VLAN Partagé Lycée ]
                                                 (IP Fixe: 192.168.101.41)
                                                             |
                                                      [ vtnet0 / WAN ]
                                              +-------------------------------+
                                              |       PARE-FEU OPNSENSE       |
                                              +-------------------------------+
                                                |             |              |
                       [ vtnet1 / VLAN 200 ] ---+             |              +--- [ vtnet3 / VLAN 100 ]
                              |                               |                               |
                        [ vmbr1 (LAN) ]             [ vtnet2 / VLAN 300 ]             [ vmbr3 (DMZ_EXT) ]
                       192.168.200.0/24             [ vmbr2 (DMZ_INT) ]                10.100.0.0/24
                              |                        10.30.0.0/24                           |
                  +-----------+-----------+                   |                   +-----------+-----------+
                  |                       |                   |                   |                       |
            Poste Clément           Poste Mathys              |               WebRadio JoyStick FM   Honeypot LAMP
             (Étu 04 : .4)          (Étu 10 : .10)            |             - Icecast (.50)          (Leurre : .99)
                                                              |             - Web Player (.51)
                                      +-----------------------+-------+     - Régie Mixxx (.52)
                                      |               |               |
                                  SRV-FILES       SRV-IMMICH       SRV-MC
                                (Win Server)       (Docker)       (Docker)
                                  (.30.20)         (.30.21)       (.30.22)
```

---

## 3. Plan d'Adressage Synthétique des Réseaux & VLANs

| Zone Réseau | VLAN ID | Sous-réseau CIDR | Masque Sous-réseau | Passerelle OPNsense | Plage Utile | Broadcast | Rôle & Niveau de Sécurité |
| :--- | :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **WAN Lycée** | *Partagé* | `192.168.101.0/24` | `255.255.255.0` | `192.168.101.254` | `192.168.101.1` - `.253` | `192.168.101.255` | Internet simulé non maîtrisé (Hostile) |
| **LAN** | **200** | `192.168.200.0/24` | `255.255.255.0` | `192.168.200.254` | `192.168.200.1` - `.253` | `192.168.200.255` | Réseau bureautique & Postes de travail |
| **DMZ Interne**| **300** | `10.30.0.0/24` | `255.255.255.0` | `10.30.0.254` | `10.30.0.1` - `.253` | `10.30.0.255` | Services d'entreprise sensibles isolés |
| **DMZ Externe**| **100** | `10.100.0.0/24` | `255.255.255.0` | `10.100.0.254` | `10.100.0.1` - `.253` | `10.100.0.255` | Services publics (WebRadio & Honeypot) |
| **VPN Nomade** | *Virtuel* | `10.200.100.0/24` | `255.255.255.0` | `10.200.100.254` | `10.200.100.1` - `.253`| `10.200.100.255`| Pool d'attribution dynamique IKEv2 |
| **Tunnel Site**| *Virtuel* | `10.4.200.0/30` | `255.255.255.252` | `10.4.200.1` | `10.4.200.1` - `.2` | `10.4.200.3` | Interconnexion B2B Binôme partenaire |

---

## 4. Inventaire Exhaustif des Équipements (Postes & Serveurs)

| Nom de Machine | Rôle / Fonction | OS | Zone / VLAN | Adresse IP | Ports d'Écoute | Responsable |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **`OPNsense-AP1`** | Pare-feu / Routeur central | OPNsense (FreeBSD) | WAN / Multi | `192.168.101.41` *(WAN)* | UDP 500, 4500 (IPsec) / TCP 8000, 80 | Clément (04) |
| **`CLT-SAUZEDE`** | Poste Employé / Admin | Windows 11 / Linux | LAN (VLAN 200) | **`192.168.200.4`** | Sortant (SMB, RDP, Web, SSH) | Clément (04) |
| **`CLT-DUTHILLEUL`**| Poste Employé / Admin | Windows 11 / Linux | LAN (VLAN 200) | **`192.168.200.10`** | Sortant (SMB, RDP, Web, SSH) | Mathys (10) |
| **`SRV-FILES`** | Serveur de Fichiers | Windows Server 2022 | DMZ Int (300) | `10.30.0.20` | TCP 445 (SMB), 5985/5986 (WinRM) | Mathys (10) |
| **`SRV-IMMICH`** | Plateforme Photo Immich | Debian 12 / Docker | DMZ Int (300) | `10.30.0.21` | TCP 2283 (HTTP WebGUI Immich) | Mathys (10) |
| **`SRV-MINECRAFT`**| Serveur de jeu Minecraft | Debian 12 / Docker | DMZ Int (300) | `10.30.0.22` | TCP 25565 (Paper Minecraft) | Mathys (10) |
| **`Debian_Icecast2`**| WebRadio : Serveur Icecast | Debian 12 | DMZ Ext (100) | `10.100.0.50` | TCP 8000 (Point de montage `/joystick-fm`) | Clément (04) |
| **`Debian_Web`** | WebRadio : Portail & Reverse Proxy | Debian 12 (Apache/WP) | DMZ Ext (100) | `10.100.0.51` | TCP 80 (Lecteur HTML5 & Reverse Proxy) | Clément (04) |
| **`Debian_Mixxx`** | WebRadio : Régie DJ Auto-DJ | Debian 12 (Mixxx/XFCE) | DMZ Ext (100) | `10.100.0.52` | Sortant vers `10.100.0.50:8000` | Clément (04) |
| **`SRV-HONEYPOT`** | Pot de miel LAMP (Leurre) | Debian 12 (Apache) | DMZ Ext (100) | `10.100.0.99` | TCP 80 / 443 (Redirection d'attaques) | Clément (04) |
| **`NOMADE-04`** | Client distant Clément | Windows 11 (VPN) | Pool Nomade | **`10.200.100.4`** | Tunnel chiffré IPsec IKEv2 | Clément (04) |
| **`NOMADE-10`** | Client distant Mathys | Windows 11 (VPN) | Pool Nomade | **`10.200.100.10`** | Tunnel chiffré IPsec IKEv2 | Mathys (10) |

> 📌 **Note d'intégration :** L'ancien pare-feu de la webradio (`OPNSense_Joystick-FM`) a été supprimé pour respecter la consigne du routeur unique. Ses fonctions de passerelle et de translation NAT sont prises en charge par `OPNsense-AP1`.

---

## 5. Justification de la Méthode d'Attribution WAN

Le réseau partagé de la classe simule Internet. Pour éviter les collisions d'adresses IP entre les binômes tout en garantissant la pérennité de l'accès extérieur :
1. L'interface WAN d'OPNsense a d'abord été initialisée en **mode DHCP**.
2. Elle a capté le bail officiel disponible sur le commutateur du lycée : **`192.168.101.41 /24`**.
3. Cette configuration a été immédiatement **convertie en IPv4 statique** (*Static IPv4*) dans OPNsense avec la passerelle amont `192.168.101.254`.
4. **Bénéfice technique :** L'adresse est sanctuarisée, ne risque pas d'être réattribuée à un autre binôme, et assure la stabilité des tunnels IPsec nomade et site-à-site.
