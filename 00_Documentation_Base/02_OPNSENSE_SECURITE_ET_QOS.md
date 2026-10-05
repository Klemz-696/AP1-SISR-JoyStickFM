# Document 02 : Sécurisation OPNsense & Qualité de Service (QoS)
## Projet AP 1 - BTS SIO SISR (Binôme 04 & 10)

---

## 1. Objectifs de Sécurité & Furtivité du Pare-feu

Le cahier des charges impose des conditions strictes d'opacité vis-à-vis de l'Internet simulé (le VLAN partagé du lycée) :
1. **Aucune réponse aux requêtes ICMP** (le pare-feu ne doit pas répondre au `ping` sur son interface WAN).
2. **Impossibilité de deviner l'OS du pare-feu** lors d'un scan réseau (`nmap -O`).
3. **Seul le port du VPN doit être ouvert depuis l'extérieur** (en Mission 1), puis le port 8000 d'Icecast en DMZ externe (en Mission 2).

---

## 2. Procédure de Durcissement (Hardening) sur OPNsense

### Étape 1 : Bloquer totalement les requêtes ICMP sur le WAN
Par défaut, OPNsense bloque tout le trafic entrant sur le WAN. Cependant, il faut vérifier qu'aucune règle implicite ne répond au ping :
1. Rendez-vous dans **Firewall > Rules > WAN**.
2. Assurez-vous qu'aucune règle n'autorise `ICMP`.
3. Ajoutez si nécessaire une règle explicite tout en haut :
   * **Action :** `Block` (ou `Drop` pour ne renvoyer aucun paquet d'erreur)
   * **Interface :** `WAN`
   * **Direction :** `in`
   * **TCP/IP Version :** `IPv4`
   * **Protocol :** `ICMP`
   * **ICMP type :** `Echo request` (ou `any`)
   * **Source :** `any`
   * **Destination :** `WAN address`
   * **Log :** Cocher `Log packets that are handled by this rule` (pour le dossier de recette).

---

### Étape 2 : Masquage de l'empreinte OS (*Scrubbing / Normalisation TCP*)
Nmap détermine le système d'exploitation cible en analysant la taille des fenêtres TCP, le TTL, les drapeaux non conformes et les réponses ICMP de rejet. Pour neutraliser cela :
1. Allez dans **Firewall > Settings > Normalization**.
2. Créez une règle de normalisation sur l'interface **WAN** :
   * **Interface :** `WAN`
   * **Direction :** `in`
   * **Protocol :** `any`
   * **Source / Destination :** `any`
   * **Max-MSS :** `1460` (évite la fragmentation)
   * Cochez **IP-Random-Id** (aléatorise l'identifiant des paquets IP, faussant la détection d'OS).
3. Dans **Firewall > Settings > Advanced** :
   * **State Policy :** Laissez en mode strict par défaut.
   * Cochez **Disable reply-to** si nécessaire selon la configuration du routage.
   * Assurez-vous que l'option de rejet par défaut est bien silencieuse (**Drop** et non **Reject** avec `TCP-RST` ou `ICMP Port Unreachable`, ce qui trahirait la présence du pare-feu).

---

### Étape 3 : Exposition stricte des ports (VPN & Services Publics)
Dans **Firewall > Rules > WAN**, seules les règles suivantes sont autorisées (les règles NAT génèrent automatiquement leur règle de filtrage associée) :
* **Règle 1 (VPN Nomade WireGuard) :**
  * Action : `Pass` | Protocol : `UDP` | Destination : `WAN address` | Port : `51820`
* **Règle 2 (VPN IPsec IKE / ESP - Intersite B2B) :**
  * Action : `Pass` | Protocol : `UDP` | Port destination : `500` (IKE) et `4500` (NAT-T) | Protocol `ESP`
* **Règles 3 & 4 (Destination NAT - Mission 2) :**
  * **Portail WebRadio HTTP (80) :** `Pass` | Protocol `TCP` | Destination `WAN address:80` ➔ Redirigé par NAT vers `10.100.0.51:80` (`Debian_Web`)
  * **Serveur Minecraft Communautaire (25565) :** `Pass` | Protocol `TCP` | Destination `WAN address:25565` ➔ Redirigé par NAT vers `10.30.0.22:25565` (`srv-minecraft`)
  * *(Optionnel) Flux brut Icecast (8000) :* `Pass` | Protocol `TCP` | Destination `WAN address:8000` ➔ Redirigé vers `10.100.0.50:8000`
* *Toutes les autres requêtes entrantes sont bloquées silencieusement par la règle implicite de fin (Default Drop).*

---

## 3. Preuves de Sécurité attendues pour le Dossier de Recette

Pour valider cette partie dans le dossier de recette, l'**Étudiant 04** exécute les commandes suivantes depuis un poste situé sur le VLAN partagé (WAN) ciblant l'IP du pare-feu (`192.168.101.37`) :

```bash
# 1. Test ICMP (doit renvoyer 100% de perte de paquets)
ping 192.168.101.37

# 2. Scan de ports rapide (seuls 51820/udp, 80/tcp et 25565/tcp doivent être accessibles)
nmap -Pn -p 80,25565,8000,51820 192.168.101.37
nmap -Pn -sU -p 51820,500,4500 192.168.101.37

# 3. Test de détection du Système d'Exploitation (doit échouer ou indiquer OS inconnu)
nmap -Pn -O 192.168.101.37
```
> **Résultat attendu dans le rapport :** Capture d'écran démontrant `100% packet loss` au ping, `Too many fingerprints match this host` ou `OS detection failed` sur Nmap, et seuls les ports déclarés (WireGuard, WebRadio HTTP et Minecraft) ouverts.


---

## 4. Configuration du Traffic Shaper (Qualité de Service - QoS)

Le cahier des charges impose de garantir la continuité et la fluidité des communications sur le VPN selon 3 critères :
1. **Trafic global sortant via le VPN limité à 2 Mb/s.**
2. **Trafic ICMP et SSH prioritaire sur le VPN.**
3. **Trafic HTTP garanti à 1 Mb/s sur le VPN.**
4. *(Mission 2)* **Trafic Immich intersite priorisé entre SSH et HTTP.**

---

### Implémentation sous OPNsense (Module Traffic Shaper / `ipfw dummynet`)

Rendez-vous dans **Firewall > Traffic Shaper** :

#### A. Création des Tuyaux (Pipes)
1. Dans l'onglet **Pipes**, cliquez sur `+` pour créer le canal principal :
   * **Bandwidth :** `2`
   * **Bandwidth Metric :** `Mbit/s`
   * **Mask :** `none`
   * **Description :** `Pipe_VPN_Global_Out_2M`
2. Créer un second tuyau pour la bande passante garantie HTTP :
   * **Bandwidth :** `1`
   * **Bandwidth Metric :** `Mbit/s`
   * **Description :** `Pipe_HTTP_Guaranteed_1M`

#### B. Création des Files d'Attente (Queues) avec Poids (Weights)
Dans l'onglet **Queues**, créez les files rattachées au tuyau global `Pipe_VPN_Global_Out_2M` :

| Nom de la Queue | Pipe Parent | Poids (*Weight* 1-100) | Rôle & Priorité |
| :--- | :--- | :--- | :--- |
| **`Queue_Priority_SSH_ICMP`** | `Pipe_VPN_Global_Out_2M` | **90** | **Priorité Haute :** Administration SSH et sondes ICMP |
| **`Queue_Immich_Intersite`** | `Pipe_VPN_Global_Out_2M` | **60** | **Priorité Moyenne+ (M2) :** Flux album photo partenaire |
| **`Queue_Default`** | `Pipe_VPN_Global_Out_2M` | **20** | **Priorité Standard :** Reste des flux non catégorisés |

*Note pour le HTTP :* Le flux HTTP est dirigé vers le tuyau dédié `Pipe_HTTP_Guaranteed_1M` rattaché à la bande passante globale, assurant qu'il bénéficie d'au moins 1 Mb/s garanti dès que le canal est sollicité.

#### C. Création des Règles d'Aiguillage (Rules)
Dans l'onglet **Rules**, classez les flux circulant sur l'interface virtuelle IPsec :

1. **Règle ICMP & SSH (Haute priorité) :**
   * Interface : `IPsec`
   * Direction : `out`
   * Protocol : `ICMP` ou `TCP (port 22, 5985)`
   * Target : `Queue_Priority_SSH_ICMP`
2. **Règle Web Immich (Priorité intermédiaire M2) :**
   * Interface : `IPsec`
   * Direction : `out`
   * Protocol : `TCP (port 2283)`
   * Target : `Queue_Immich_Intersite`
3. **Règle HTTP Garanti :**
   * Interface : `IPsec`
   * Direction : `out`
   * Protocol : `TCP (port 80, 443)`
   * Target : `Pipe_HTTP_Guaranteed_1M`

---

## 5. Protocole de Mesure et Validation de la QoS (Iperf3)

Pour prouver dans le dossier de recette que la limitation à 2 Mb/s et les priorités fonctionnent :
1. Installer `iperf3` sur le serveur en DMZ interne (`10.4.1.20`) et sur le client nomade (`10.4.100.4`).
2. Lancer le serveur iperf3 sur la machine en DMZ :
   ```bash
   iperf3 -s
   ```
3. Lancer un test de débit depuis le client VPN connecté :
   ```bash
   # Test du débit maximal sortant via le VPN
   iperf3 -c 10.4.1.20 -t 15
   ```
   *Résultat attendu :* Le débit affiché reste plafonné entre **1.9 Mb/s et 2.0 Mb/s** (limitation respectée).

4. **Test de priorisation sous saturation :**
   * Lancer un téléchargement massif saturant les 2 Mb/s.
   * Lancer simultanément un `ping -t 10.4.1.20` ou une session SSH : le temps de réponse reste stable et faible (< 5 ms) grâce à la queue prioritaire.
