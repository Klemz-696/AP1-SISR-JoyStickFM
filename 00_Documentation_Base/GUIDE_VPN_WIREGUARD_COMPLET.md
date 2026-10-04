# Guide Complet : Déploiement et Recette du VPN WireGuard Nomade (Mission 1)
## Projet AP 1 - BTS SIO SISR (Binôme 04 & 10)

---

## 1. Contexte, Architecture & Plan d'Adressage

Le VPN Nomade permet à un collaborateur distant (ex. télétravailleur, administrateur système itinérant) d'accéder de manière sécurisée et chiffrée aux ressources internes de l'entreprise (serveurs en DMZ Interne, partages de fichiers SMB, etc.) depuis l'extérieur (WAN Lycée / Internet).

### 1.1. Pourquoi WireGuard ? (Argumentaire SISR / Épreuve E5)
* **Cryptographie de pointe :** ChaCha20 pour le chiffrement symétrique, Poly1305 pour l'authentification, Curve25519 pour l'échange de clés ECDH, BLAKE2s pour le hachage.
* **Simplicité et robustesse du code :** ~4 000 lignes de code (dans le noyau Linux) contre plus de 100 000 lignes pour OpenVPN et IPsec/StrongSwan. Surface d'attaque drastiquement réduite, auditabilité maximale.
* **Performance et légèreté :** Débit supérieur, latence quasi nulle, handshake instantané en UDP sans négociation complexe d'associations de sécurité (SA Phase 1 / Phase 2).
* **Roaming transparent :** Grâce à l'association cryptographique (Cryptokey Routing), le client peut changer d'adresse IP (ex. passage Wi-Fi ➔ 4G/Partage de connexion) sans interruption du tunnel.

### 1.2. Schéma Architectural & Adressage

```
 [ Client Nomade ]                           [ OPNsense Firewall ]                     [ DMZ Interne ]
 Poste Clément (Linux Mint)                  Serveur WireGuard                         SRV-WIN (10.30.0.20)
 IP WAN Lycée : 192.168.101.X                WAN : 192.168.101.4                       SRV-IMMICH (10.30.0.21)
 IP Tunnel : 10.200.100.2/24                 IP Tunnel : 10.200.100.1/24               SRV-MC (10.30.0.22)
          |                                           |                                      |
          +===============[ Tunnel UDP 51820 ]========+--------------------------------------+
```

| Rôle | Machine | Interface / Réseau | Adresse IP | Port d'écoute |
| :--- | :--- | :--- | :--- | :--- |
| **Serveur VPN** | Pare-feu OPNsense (VM 11008) | WAN (`vtnet0`) | `192.168.101.4` | `UDP 51820` |
| **Passerelle VPN** | OPNsense (Interface WireGuard) | Tunnel WireGuard (`wg0`) | `10.200.100.1/24` | - |
| **Client Nomade 1** | `posteclement` (VM 11011 Linux Mint) | Tunnel WireGuard | `10.200.100.2/32` | Dynamique |
| **Client Nomade 2** | PC Portable Windows / Mathys | Tunnel WireGuard | `10.200.100.3/32` | Dynamique |
| **Ressource cible** | `SRV-WIN` (Partage SMB) | DMZ Interne (VLAN 30) | `10.30.0.20` | `TCP 445` |

---

## 2. Configuration Côté Serveur (OPNsense)

### 2.1. Installation du Plugin `os-wireguard`
1. Rendez-vous sur l'interface d'administration OPNsense : `https://192.168.200.254/` (depuis le LAN) ou `https://192.168.101.4/`.
2. Allez dans **System > Firmware > Plugins**.
3. Dans la barre de recherche, tapez `wireguard`.
4. Repérez la ligne `os-wireguard` et cliquez sur le bouton `+` (Installer) à droite.
5. Une fois l'installation terminée, actualisez la page : une nouvelle entrée **VPN > WireGuard** apparaît dans le menu de gauche.

---

### 2.2. Création de l'Instance Locale (Serveur WireGuard)
1. Allez dans **VPN > WireGuard > Local**.
2. Cliquez sur le bouton `+` pour ajouter une instance :
   * **Enabled :** Coché ✅
   * **Name :** `WG_SERVER_NOMADE`
   * **Public Key :** *(Laisser vide au départ)*
   * **Private Key :** Cliquez sur l'icône de **baguette magique / engrenage** pour générer automatiquement une paire de clés.
     * **IMPORTANT :** Copiez la **Public Key** générée et notez-la dans un bloc-notes ! Elle servira pour la configuration des clients.
   * **Listen Port :** `51820`
   * **Tunnel Address :** `10.200.100.1/24`
   * **Peers :** *(Laisser vide pour l'instant, nous y rattacherons les endpoints créés à l'étape suivante).*
3. Cliquez sur **Save**.

---

### 2.3. Déclaration du Client Nomade (Endpoint)
1. Allez dans **VPN > WireGuard > Endpoints**.
2. Cliquez sur `+` pour ajouter le client :
   * **Enabled :** Coché ✅
   * **Name :** `Client_Clement_04`
   * **Public Key :** Collez la clé publique du client (générée sur le poste client, voir Section 3).
   * **Allowed IPs :** `10.200.100.2/32` *(Adresse IP stricte allouée au client dans le tunnel).*
3. Cliquez sur **Save**.
4. Retournez dans **VPN > WireGuard > Local** :
   * Éditez `WG_SERVER_NOMADE`.
   * Dans le champ **Peers**, sélectionnez `Client_Clement_04`.
   * Cliquez sur **Save**.
5. Allez dans **VPN > WireGuard > General** :
   * Cochez **Enable WireGuard**.
   * Cliquez sur **Apply**.

---

### 2.4. Règles de Filtrage Pare-feu (Firewall Rules)

#### Règle A : Autoriser l'établissement du tunnel depuis le WAN
1. Allez dans **Firewall > Rules > WAN**.
2. Cliquez sur `+` (Add rule en haut de liste) :
   * **Action :** `Pass`
   * **Interface :** `WAN`
   * **Direction :** `in`
   * **TCP/IP Version :** `IPv4`
   * **Protocol :** `UDP`
   * **Source :** `any`
   * **Destination :** `WAN address`
   * **Destination port range :** `51820` to `51820`
   * **Description :** `Autoriser flux VPN WireGuard Nomade (Port 51820)`
3. Cliquez sur **Save** puis **Apply changes**.

#### Règle B : Autoriser les clients VPN à joindre la DMZ Interne
1. Allez dans **Firewall > Rules > WireGuard** (Interface de groupe créée automatiquement par le plugin) :
2. Cliquez sur `+` :
   * **Action :** `Pass`
   * **Interface :** `WireGuard (Group)`
   * **Direction :** `in`
   * **TCP/IP Version :** `IPv4`
   * **Protocol :** `any`
   * **Source :** `WireGuard net` (ou `10.200.100.0/24`)
   * **Destination :** `DMZ_INTERNE net` (ou `10.30.0.0/24`)
   * **Description :** `Autoriser acces clients VPN WireGuard vers DMZ Interne`
3. Cliquez sur **Save** puis **Apply changes**.

---

## 3. Configuration Côté Client

### 3.1. Méthode A : Client Linux Mint (`posteclement`, VM 11011)

#### 1. Installation des paquets
```bash
sudo apt update
sudo apt install -y wireguard wireguard-tools resolvconf
```

#### 2. Génération de la paire de clés du client
```bash
sudo umask 077
sudo mkdir -p /etc/wireguard
cd /etc/wireguard
wg genkey | sudo tee client_clement_private.key | wg pubkey | sudo tee client_clement_public.key
```
Affichez la clé publique pour la renseigner dans l'Endpoint OPNsense :
```bash
cat /etc/wireguard/client_clement_public.key
```

#### 3. Rédaction du fichier de configuration `/etc/wireguard/wg0.conf`
```bash
sudo nano /etc/wireguard/wg0.conf
```
Contenu exact du fichier :
```ini
[Interface]
Address = 10.200.100.2/24
PrivateKey = <COLLER_LE_CONTENU_DE_client_clement_private.key>
DNS = 1.1.1.1

[Peer]
# Clé publique du serveur WireGuard OPNsense
PublicKey = <COLLER_LA_CLE_PUBLIQUE_OPNSENSE>
# Adresse WAN du pare-feu OPNsense et port d'écoute
Endpoint = 192.168.101.4:51820
# Réseaux routés dans le tunnel : DMZ Interne et sous-réseau VPN
AllowedIPs = 10.30.0.0/24, 10.200.100.0/24
# Maintien de connexion actif à travers le NAT
PersistentKeepalive = 25
```

#### 4. Démarrage et activation au boot
* **Démarrage manuel :**
  ```bash
  sudo wg-quick up wg0
  ```
* **Arrêt du tunnel :**
  ```bash
  sudo wg-quick down wg0
  ```
* **Activation permanente au démarrage de la machine :**
  ```bash
  sudo systemctl enable wg-quick@wg0
  sudo systemctl start wg-quick@wg0
  ```

---

### 3.2. Méthode B : Client Windows (PC Portable Perso / Ordinateur Lycée)

1. Téléchargez et installez le client officiel : [https://www.wireguard.com/install/](https://www.wireguard.com/install/).
2. Lancez l'application **WireGuard**.
3. Cliquez sur **Ajouter un tunnel** > **Ajouter un tunnel vide...** :
   * WireGuard génère automatiquement une paire de clés.
   * Notez la **Clé publique** affichée en haut (à coller dans un Endpoint OPNsense).
4. Remplissez le fichier avec le texte suivant :
   ```ini
   [Interface]
   PrivateKey = <Cle_Privee_Auto_Generee>
   Address = 10.200.100.3/24
   DNS = 1.1.1.1

   [Peer]
   PublicKey = <Cle_Publique_OPNsense>
   Endpoint = 192.168.101.4:51820
   AllowedIPs = 10.30.0.0/24, 10.200.100.0/24
   PersistentKeepalive = 25
   ```
5. Cliquez sur **Enregistrer** puis sur **Activer**.

---

## 4. Protocole de Recette & Validation des Tests (Preuves SISR)

Pour valider le fonctionnement devant le jury de BTS SIO, suivez rigoureusement ce protocole de test :

### Test 1 : Vérification de l'établissement du Handshake
* **Sur le client Linux (`posteclement`) :**
  ```bash
  sudo wg show
  ```
  *Résultat attendu :*
  ```text
  interface: wg0
    public key: ...
    private key: (hidden)
    listening port: ...

  peer: <Cle_Publique_OPNsense>
    endpoint: 192.168.101.4:51820
    allowed ips: 10.30.0.0/24, 10.200.100.0/24
    latest handshake: 14 seconds ago
    transfer: 1.42 KiB received, 2.18 KiB sent
  ```
  > **Point de contrôle :** `latest handshake` doit afficher une valeur récente (< 2 minutes) et `transfer` doit afficher des octets reçus ET envoyés.

* **Sur l'interface OPNsense :**
  Allez dans **VPN > WireGuard > Diagnostics** (ou **List / Status**) : le peer `Client_Clement_04` doit afficher un voyant vert avec l'heure du dernier handshake et les volumes de données échangés.

---

### Test 2 : Ping de la passerelle VPN (OPNsense)
Depuis le client distant :
```bash
ping -c 4 10.200.100.1
```
*Résultat attendu : 0% packet loss, temps de réponse < 2 ms.*

---

### Test 3 : Accès aux services internes en DMZ Interne
Depuis le client distant :
```bash
# Test ICMP vers le serveur Windows
ping -c 4 10.30.0.20

# Test port SMB
nc -zv 10.30.0.20 445
```
*Résultat attendu : `Connection to 10.30.0.20 445 port [tcp/microsoft-ds] succeeded!`*

---

### Test 4 : Montage du partage Samba à travers le tunnel VPN
```bash
sudo mount -t cifs //10.30.0.20/Partage /mnt/partage_sauvegarde -o credentials=/etc/smbcredentials-clement,iocharset=utf8
ls -l /mnt/partage_sauvegarde
```
*Résultat attendu : Le contenu du partage de fichiers distant s'affiche correctement à travers le tunnel.*

---

## 5. Guide de Dépannage (Troubleshooting)

| Symptôme | Cause Probable | Solution |
| :--- | :--- | :--- |
| `latest handshake` reste vide, 0 octets reçus | Clé publique erronée ou port UDP bloqué | 1. Vérifier que la clé publique dans OPNsense Endpoint correspond exactement à celle du client.<br>2. Vérifier la règle WAN : UDP 51820 autorisé vers `WAN address`. |
| Handshake OK, mais `ping 10.200.100.1` échoue | Règle de pare-feu WireGuard absente | Vérifier **Firewall > Rules > WireGuard** : créer une règle `Pass` sur l'interface WireGuard. |
| `ping 10.200.100.1` OK, mais impossible de joindre `10.30.0.20` | `AllowedIPs` client incomplet ou routage interne | 1. Vérifier que `10.30.0.0/24` est bien dans `AllowedIPs` du client `wg0.conf`.<br>2. Vérifier que la passerelle par défaut de `SRV-WIN` est bien `10.30.0.254` (OPNsense). |
| Coupures intermittentes de connexion | NAT timeout sur la box / routeur | S'assurer que `PersistentKeepalive = 25` est bien présent dans la section `[Peer]` du client. |
