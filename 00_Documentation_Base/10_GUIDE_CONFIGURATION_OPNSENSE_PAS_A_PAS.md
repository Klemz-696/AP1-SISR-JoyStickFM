# Document 10 : Guide Pas-à-Pas de Configuration Initiale d'OPNsense
## Projet AP 1 - BTS SIO SISR (Binôme 04 & 10)

---

## 1. Vue d'ensemble du Déploiement

Dès la fin de l'installation d'OPNsense sur Proxmox (après le redémarrage et le retrait du support ISO), le pare-feu démarre en mode console texte. 

La configuration s'effectue en **deux temps** :
1. **Phase 1 (Console Proxmox) :** Affectation des cartes réseau et fixation de l'IP WAN et LAN (5 minutes).
2. **Phase 2 (Interface Web / WebGUI) :** Paramétrage des DMZ, sécurité, accès partagé pour l'étudiant 04, et sauvegarde XML.

---

## 2. Phase 1 : Configuration en Console Texte (Sur Proxmox)

Connectez-vous avec le compte `root` et votre mot de passe d'installation (ou `opnsense` par défaut). Le menu console OPNsense à 13 options s'affiche :

```
--------------------------------------------------
*** OPNsense.localdomain: OPNsense 24.x (amd64) ***
--------------------------------------------------
  0) Logout                       7) Ping host
  1) Assign Interfaces            8) Shell
  2) Set interface IP address     9) pfTop
  3) Reset to factory defaults   10) Filter Logs
  4) Power off system            11) Restart WebGUI
  5) Reboot system               12) Audit Security
  6) Password reset              13) Restore backup
```

---

### Étape 1.1 : Affecter les interfaces réseau (Option 1)
Tapez `1` puis validez avec `Entrée` :
1. **Configure LAGGs now?** ➔ Tapez `n`
2. **Configure VLANs now?** ➔ Tapez `n`
3. **Enter the WAN interface name :** Tapez `vtnet0` *(reliée à vmbr0 / Réseau Lycée)*
4. **Enter the LAN interface name :** Tapez `vtnet1` *(reliée à vmbr1 / Réseau LAN)*
5. **Enter the Optional interface 1 name (OPT1) :** Tapez `vtnet2` *(reliée à vmbr2 / DMZ Interne)*
6. **Enter the Optional interface 2 name (OPT2) :** Tapez `vtnet3` *(reliée à vmbr3 / DMZ Externe)*
7. **Do you want to proceed?** ➔ Tapez `y`

---

### Étape 1.2 : Configurer l'IP du WAN (Option 2 - Méthode Hybride DHCP -> Fixe)
1. Tapez `2` (*Set interface IP address*).
2. Sélectionnez l'interface `1` (**WAN**).
3. **Configure IPv4 address WAN interface via DHCP?** ➔ Tapez `y`.
4. **Configure IPv6 address WAN interface via DHCP6?** ➔ Tapez `n`.
5. Validez les options par défaut jusqu'au retour au menu principal.
6. **Relevez l'adresse IP affichée** pour le WAN (exemple : `172.20.10.45/24` avec passerelle `172.20.10.254`).
7. **Fixez immédiatement cette adresse :**
   * Tapez de nouveau `2` > Sélectionnez `1` (**WAN**).
   * **Configure IPv4 address WAN interface via DHCP?** ➔ Tapez `n`.
   * **Enter the new WAN IPv4 address :** `172.20.10.45` *(celle relevée)*.
   * **Enter the new WAN IPv4 subnet bit count :** `24` *(ou le masque de votre classe)*.
   * **Enter the new WAN IPv4 upstream gateway address :** `172.20.10.254` *(la passerelle lycée)*.
   * **Configure IPv6?** ➔ Tapez `n`.
   * Validez. L'IP WAN est désormais fixe et garantie sans conflit.

---

### Étape 1.3 : Configurer l'IP du LAN (Option 2)
1. Tapez `2` (*Set interface IP address*).
2. Sélectionnez l'interface `2` (**LAN**).
3. **Configure IPv4 address LAN interface via DHCP?** ➔ Tapez `n`.
4. **Enter the new LAN IPv4 address :** `192.168.200.254`
5. **Enter the new LAN IPv4 subnet bit count :** `24`
6. **Enter the new LAN IPv4 upstream gateway address :** Appuyez simplement sur `Entrée` *(Aucune passerelle sur le LAN !)*.
7. **Configure IPv6?** ➔ Tapez `n`.
8. **Do you want to enable the DHCP server on LAN?** ➔ Tapez `y` *(ou `n` si vous fixez manuellement les IP des postes)*.
   * Plage de test : début `192.168.200.50`, fin `192.168.200.99`.
9. **Do you want to revert to HTTP as the webConfigurator protocol?** ➔ Tapez `n` *(Conserver HTTPS)*.

---

## 3. Phase 2 : Configuration dans l'Interface Web (WebGUI)

### Étape 2.1 : Premier accès au WebGUI
* Depuis une VM connectée sur le LAN (`vmbr1`), ouvrez un navigateur web et allez sur :
  `https://192.168.200.254`
* Acceptez l'avertissement de sécurité du certificat auto-signé.
* Connectez-vous avec :
  * **Identifiant :** `root`
  * **Mot de passe :** Le mot de passe défini lors de l'installation.

---

### Étape 2.2 : Assistant Initial (*Setup Wizard*)
L'assistant se lance automatiquement (ou via **System > Wizard**) :
1. **General Information :**
   * **Hostname :** `fw-ap1`
   * **Domain :** `bts-sio.local`
   * **Primary DNS Server :** `1.1.1.1` (ou DNS du lycée)
   * **Secondary DNS Server :** `8.8.8.8`
2. **Time Server Information :**
   * **Timezone :** `Europe/Paris`
3. **Configure WAN Interface :**
   * Vérifiez que l'IP statique et la passerelle amont sont bien renseignées.
   * ⚠️ **TRÈS IMPORTANT POUR LE BTS :** Tout en bas de cette page, **DÉCOCHEZ** absolument :
     * ❌ `Block private networks` (RFC 1918)
     * ❌ `Block bogon networks`
     *(Explication : Le réseau du lycée est un réseau privé comme 172.16.x.x ou 192.168.x.x. Si vous laissez ces cases cochées, OPNsense bloquera tout le trafic venant de la classe et du lycée).*
4. **Configure LAN Interface :**
   * Vérifiez l'adresse `192.168.200.254` et le masque `/24`.
5. **Set Root Password :** Définir le mot de passe définitif du binôme.
6. Cliquez sur **Reload**.

---

### Étape 2.3 : Débloquer l'accès direct pour l'Étudiant 04 depuis le WAN
Pour que l'étudiant 04 puisse se connecter directement depuis son propre PC sans passer par Proxmox :
1. Rendez-vous dans **Firewall > Rules > WAN**.
2. Cliquez sur **Add** (bouton `+` en haut à droite) :
   * **Action :** `Pass`
   * **Interface :** `WAN`
   * **Direction :** `in`
   * **Protocol :** `TCP`
   * **Source :** `any`
   * **Destination :** `WAN address`
   * **Destination port range :** `HTTPS (443)`
   * **Description :** `ACCES TEMPORAIRE COLLABORATION ETUDIANT 04`
3. Cliquez sur **Save** puis sur **Apply changes**.
4. **Test immédiat :** L'étudiant 04 ouvre `https://192.168.101.41` (ou `.37`) depuis son navigateur physique : il accède à l'OPNsense !
*(Note : Cette règle sera désactivée à la fin de la mission pour les tests de furtivité Nmap).*

---

### Étape 2.4 : Activer et Configurer les deux DMZ
Par défaut, `OPT1` et `OPT2` sont désactivées. Il faut les activer et les nommer :

#### A. DMZ Interne (`vtnet2`) :
1. Allez dans **Interfaces > [OPT1]**.
2. Cochez **Enable Interface**.
3. **Description :** `DMZ_INT`
4. **IPv4 Configuration Type :** `Static IPv4`
5. **IPv4 address :** `10.30.0.254`
6. **IPv4 Subnet :** `/24`
7. **IPv4 Upstream Gateway :** `Auto-detect` (laisser vide, pas de passerelle sur une interface interne).
8. Cliquez sur **Save**.

#### B. DMZ Externe (`vtnet3`) :
1. Allez dans **Interfaces > [OPT2]**.
2. Cochez **Enable Interface**.
3. **Description :** `DMZ_EXT`
4. **IPv4 Configuration Type :** `Static IPv4`
5. **IPv4 address :** `10.100.0.254`
6. **IPv4 Subnet :** `/24`
7. **IPv4 Upstream Gateway :** Laisser vide.
8. Cliquez sur **Save** puis **Apply changes**.

---

### Étape 2.5 : Règles de Cloisonnement Initiales des DMZ
1. **Firewall > Rules > DMZ_INT** :
   * Ajouter une règle autorisant la DMZ interne à répondre aux requêtes établies et à accéder à Internet si besoin (mises à jour Docker) :
     * Action : `Pass` | Protocol : `any` | Source : `DMZ_INT net` | Destination : `WAN net` (ou `any` sauf `LAN net`).
2. **Firewall > Rules > DMZ_EXT** :
   * **Bloquer strictement** tout accès vers le LAN et la DMZ Interne :
     * Règle 1 : `Block` | Source : `DMZ_EXT net` | Destination : `LAN net`
     * Règle 2 : `Block` | Source : `DMZ_EXT net` | Destination : `DMZ_INT net`
     * Règle 3 : `Pass` | Source : `DMZ_EXT net` | Destination : `any` (pour sortir vers Internet).

---

## 4. Phase 3 : Furtivité, Sécurité & Sauvegarde XML

Une fois le réseau opérationnel :
1. **Furtivité (Anti-Nmap) :**
   * Appliquer les réglages de scrubbing décrits dans [`02_OPNSENSE_SECURITE_ET_QOS.md`](file:///c:/Users/sauze/Desktop/TS2%20SIO/AP/AP%201/02_OPNSENSE_SECURITE_ET_QOS.md) (*Normalisation TCP et désactivation des réponses ICMP sur le WAN*).
2. **Sauvegarde officielle du fichier de configuration :**
   * Rendez-vous dans **System > Configuration > Backups**.
   * Cliquez sur **Download configuration**.
   * Enregistrez le fichier `config-fw-ap1.xml` dans votre dossier de projet.
   * *Ce fichier constitue l'un des livrables officiels exigés par le sujet pour la Mission 1 !*
