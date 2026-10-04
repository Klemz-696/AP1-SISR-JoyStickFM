# Document 03 : Déploiement des Tunnels VPN (WireGuard, IPsec Nomade & Site-à-Site)
## Projet AP 1 - BTS SIO SISR (Binôme 04 & 10)

---

## 1. Choix & Stratégie VPN pour le BTS SIO SISR

Dans le cadre du BTS SIO SISR, nous disposons d'une architecture VPN à deux volets :
1. **VPN Nomade (Mission 1) :**
   * **WireGuard (Choix Moderne & Recommandé) :** Chiffrement de pointe (ChaCha20-Poly1305, Curve25519), code source ultra-compact (~4 000 lignes contre 100 000+ pour IPsec), roaming automatique transparent, zéro surcharge X.509 et déploiement 1-clic. Nécessite OPNsense 23.1+ (plugin `os-wireguard`).
   * **IPsec IKEv2 (Socle Traditionnel) :** Chiffrement AES-256-GCM, échange de clés DH 14 / Curve25519, gestion PKI avec certificats X.509.
2. **VPN Site-à-Site B2B (Mission 2) :**
   * **IPsec IKEv2 inter-entreprises :** Standard universel d'interconnexion sécurisée de réseaux d'entreprises avec clé pré-partagée (PSK) et filtrage chirurgical Zero-Trust.

---

## 2. Mission 1 : Serveur VPN Nomade WireGuard (OPNsense 23.1)

### 2.1. Installation du Plugin sous OPNsense
1. Aller dans **System > Firmware > Plugins**.
2. Rechercher `os-wireguard` et cliquer sur le `+` pour l'installer.
3. Actualiser la page : le menu **VPN > WireGuard** est désormais disponible.

### 2.2. Configuration du Serveur Local (Instance OPNsense)
1. Aller dans **VPN > WireGuard > Local** et cliquer sur `+` :
   * **Name :** `WG_Nomade`
   * **Listen Port :** `51820`
   * **Tunnel Address :** `10.200.100.1/24`
   * **Private Key :** Cliquer sur l'icône de génération de clé (la Public Key se calcule automatiquement).
2. Cliquer sur **Save**.

### 2.3. Déclaration du Client Nomade (Endpoints)
1. Aller dans **VPN > WireGuard > Endpoints** et cliquer sur `+` :
   * **Name :** `Client_Clement_04`
   * **Public Key :** *Renseigner la clé publique générée sur le poste client de Clément.*
   * **Allowed IPs :** `10.200.100.2/32`
2. Éditer le serveur local `WG_Nomade` pour lui rattacher ce endpoint dans **Peers**.
3. Activer le service dans **VPN > WireGuard > General** (cocher *Enable WireGuard*) et cliquer sur **Apply**.

### 2.4. Règles de Filtrage Pare-feu
1. **Firewall > Rules > WAN :**
   * Action : `Pass` | Proto : `UDP` | Port Dest : `51820` | Description : `Autoriser flux VPN WireGuard Nomade`.
2. **Firewall > Rules > WireGuard (Interface de groupe) :**
   * Action : `Pass` | Proto : `any` | Dest : `10.30.0.0/24` (DMZ Interne) | Description : `Acces ressources entreprise pour nomades`.

### 2.5. Configuration du Poste Client (Linux Mint & Windows)
Fichier de configuration client `wg0.conf` :
```ini
[Interface]
PrivateKey = <CLE_PRIVEE_CLIENT>
Address = 10.200.100.2/24
DNS = 192.168.200.254

[Peer]
PublicKey = <CLE_PUBLIQUE_OPNSENSE>
Endpoint = 192.168.101.41:51820
AllowedIPs = 10.30.0.0/24, 192.168.200.0/24
PersistentKeepalive = 25
```
* **Sur Linux Mint :** `sudo nmcli connection import type wireguard file wg0.conf` puis `nmcli connection up wg0`.
* **Sur Windows :** Importer `wg0.conf` dans l'application officielle WireGuard et cliquer sur *Activer*.

---

## 3. Mission 1 (Alternative) : Serveur VPN Nomade IPsec IKEv2

### Étape 1 : Création de la PKI Interne sur OPNsense
1. Aller dans **System > Trust > Authorities** :
   * **Descriptive name :** `AP1-CA-Internal` | Method : `Create an internal Certificate Authority` | Clé : `4096 bit` RSA | SHA256.
2. Aller dans **System > Trust > Certificates** :
   * **Type :** `Server Certificate` | CN : `192.168.101.41` | SAN : `IP:192.168.101.41`.
3. Créer l'utilisateur dans **System > Access > Users** : `employe04`.

### Étape 2 : Configuration IPsec IKEv2
1. **VPN > IPsec > Mobile Clients :**
   * Activer l'extension client nomade IKEv2.
   * Virtual IPv4 Pool : `10.200.100.0/24`.
2. **VPN > IPsec > Connections :**
   * Version : `IKEv2` | Interface : `WAN` | Auth : `EAP-MSCHAPv2`.
   * Chiffrement Phase 1 : `AES-256-GCM / SHA256 / DH14 (2048-bit) ou Curve25519`.
   * Phase 2 (Child SA) : Local `10.30.0.0/24`, Remote `10.200.100.0/24`.

---

## 4. Mission 2 : Configuration du Tunnel VPN Site-à-Site B2B

La Mission 2 relie votre site à celui du binôme partenaire désigné par l'enseignant.

```
 [ NOTRE INFRASTRUCTURE ]                             [ INFRASTRUCTURE PARTENAIRE ]
 DMZ Interne : 10.30.0.0/24                           Réseau Partenaire : 192.168.X.0/24
 OPNsense WAN : 192.168.101.41  <=== Tunnel IPsec ===> OPNsense Partenaire : 192.168.101.XX
                                  (IKEv2 / PSK)
```

### Fiche de Coordination Technique avec le Partenaire

| Paramètre | Notre Site (Binôme 04 & 10) | Site Partenaire |
| :--- | :--- | :--- |
| **IP Publique WAN** | `192.168.101.41` (ou `.37`) | *IP WAN Partenaire* |
| **Réseau Local exposé** | `10.30.0.21/32` (Uniquement Immich !) | *Réseau Partenaire* |
| **Version IKE** | `IKEv2` | `IKEv2` |
| **Authentification** | `Clé Prépartagée (Pre-Shared Key - PSK)` | Identique |
| **Clé Secrète PSK** | `AP1_SecretKey_BTS_SISR_2026!` | Identique |
| **Chiffrement Phase 1** | `AES-256-GCM / SHA256 / DH14` | Identique |
| **Chiffrement Phase 2** | `AES-256-GCM / SHA256 / DH14` | Identique |

---

### Règles de Pare-feu Intersite & Tests Négatifs Obligatoires (Zero-Trust)

Dans **Firewall > Rules > IPsec**, le principe Zero-Trust impose de **verrouiller strictement** le tunnel :

#### Règle 1 : Autorisation ciblée de l'album Immich (Seul flux légitime)
* **Action :** `Pass` | **Interface :** `IPsec` | **Protocol :** `TCP`
* **Source :** Sous-réseau du partenaire
* **Destination :** `10.30.0.21` (Serveur Immich) | **Port Destination :** `2283`
* **Description :** `Autoriser consultation album Immich partenaire`

#### Règle 2 : Blocage explicite et journalisation de tout le reste (Tests Négatifs)
* **Action :** `Block` | **Interface :** `IPsec` | **Protocol :** `any`
* **Source :** Sous-réseau du partenaire | **Destination :** `any`
* **Log :** **Cocher absolument** `Log packets that are handled by this rule`
* **Description :** `BLOQUER ET LOGUER TOUTE INTRUSION PARTENAIRE`

---

## 5. Preuves attendues pour le Dossier de Recette (Mission 2)

1. **Test Positif (Succès) :**
   * Depuis un poste chez le partenaire, ouverture d'un navigateur web à l'adresse :
     `http://10.30.0.21:2283/share/MON_ALBUM_PARTAGE`
   * L'album s'affiche correctement sans donner accès à l'interface d'administration globale d'Immich.
2. **Tests Négatifs (Échecs journalisés indispensables pour le jury) :**
   * Le partenaire lance un `ping 10.30.0.20` (Serveur de fichiers) ➔ **Rejeté (Request timed out)**.
   * Le partenaire tente une connexion SSH ou SMB vers `10.30.0.20` ➔ **Rejeté**.
   * Le partenaire tente de joindre le serveur Minecraft `10.30.0.22:25565` ➔ **Rejeté**.
   * Dans **Firewall > Log Files > Live View**, filtrer sur l'interface `IPsec` et capturer les lignes rouges de blocage prouvant que les tentatives d'accès non autorisées sont arrêtées et tracées.
