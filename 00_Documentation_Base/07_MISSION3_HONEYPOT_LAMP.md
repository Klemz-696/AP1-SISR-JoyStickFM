# Document 07 : Mission 3 (Bonus) - Déploiement d'un Honeypot LAMP & Alerting
## Projet AP 1 - BTS SIO SISR (Binôme 04 & 10)

---

## 1. Contexte & Enjeux de la Mission 3

La Mission 3 (facultative) apporte une forte valeur ajoutée à votre dossier professionnel pour la compétence **B2.3 (Exploiter, dépanner et superviser une solution d'infrastructure réseau)** :
> *« Vous souhaitez qu'une attaque visant votre pare-feu soit détournée vers un service qui a l'air vulnérable, sans jamais donner accès à quoi que ce soit de sensible, et que toute tentative soit journalisée et signalée automatiquement. Un serveur LAMP ne contenant aucune page web est ajouté dans votre DMZ externe, aux côtés de la webradio. »*

---

## 2. Architecture & Cloisonnement Étanche

```
                                  [ ATTAQUANT SUR LE WAN ]
                                             |
                                             | Tentative de scan HTTP (Port 80/443)
                                             v
                                   [ PARE-FEU OPNSENSE ]
                                             |
                                             | Redirection NAT (Port Forwarding silencieux)
                                             v
  [ DMZ EXTERNE : 10.100.0.0/24 ]
  +---------------------------------------------------------------------------------+
  |  [ SRV-HONEYPOT (LAMP) : 10.100.0.99 ]                                          |
  |  - Apache2 écoute sur le port 80/443 sans aucun site web (Page d'erreur 403/404) |
  |  - Script de détection en temps réel analysant `/var/log/apache2/access.log`    |
  |  - Envoi immédiat d'un e-mail d'alerte avec les logs vers l'administrateur       |
  |  - Déclencheur Fail2ban ou script API OPNsense pour bannir l'IP attaquante      |
  +---------------------------------------------------------------------------------+
                                             |
                                             X  BLOQUÉ PAR LE PARE-FEU
                                             |
                   [ INTERDICTION ABSOLUE D'ACCÉDER AU LAN OU À LA DMZ INTERNE ]
```

---

## 3. Déploiement du Serveur LAMP Leurre (`10.100.0.99`)

Sur une machine virtuelle Debian minimale en DMZ externe :

### Étape 1 : Installation du serveur Web Apache
```bash
sudo apt update && sudo apt install -y apache2 php bsd-mailx postfix curl fail2ban
# Supprimer la page d'accueil par défaut pour ne laisser aucun contenu web
sudo rm -f /var/www/html/index.html
```

### Étape 2 : Script d'alerte par e-mail (`/usr/local/bin/honeypot-alert.sh`)
Créez un script qui surveille les requêtes suspectes et transmet immédiatement un e-mail contenant les détails (IP de l'attaquant, User-Agent, heure, URL ciblée) :

```bash
#!/bin/bash
# Surveillance du journal Apache et alerting
LOG_FILE="/var/log/apache2/access.log"
ADMIN_EMAIL="admin-reseau@bts-sio.local"

tail -Fn0 "$LOG_FILE" | while read line; do
    # Extraction de l'IP et de la requête
    IP=$(echo "$line" | awk '{print $1}')
    URL=$(echo "$line" | awk '{print $7}')
    
    # Envoi de l'e-mail d'alerte
    SUBJECT="[ALERTE SÉCURITÉ HONEYPOT] Tentative de connexion suspecte depuis $IP"
    BODY="Une tentative d'accès au leurre Web a été détectée sur le pare-feu AP1.\n\nDétails de la requête :\n$line\n\nAction : L'adresse IP $IP a été consignée et transmise pour blocage pare-feu."
    
    echo -e "$BODY" | mail -s "$SUBJECT" "$ADMIN_EMAIL"
    echo "[HONEYPOT DETECT] Alerte transmise pour l'IP $IP - URL: $URL"
done
```

Rendre le script exécutable et l'enregistrer comme service `systemd` :
```bash
sudo chmod +x /usr/local/bin/honeypot-alert.sh
```

---

## 4. Configuration OPNsense : Redirection NAT & Cloisonnement

### A. Redirection NAT des attaques web vers le Honeypot
Dans **Firewall > NAT > Port Forward** :
* **Interface :** `WAN`
* **Protocol :** `TCP`
* **Destination :** `WAN address`
* **Destination port range :** `HTTP (80)` et `HTTPS (443)`
* **Redirect target IP :** `10.100.0.99` (Serveur Honeypot)
* **Redirect target port :** `80`
* **Description :** `Redirection furtive vers Honeypot LAMP`

### B. Cloisonnement étanche de sécurité (Anti-Rebond)
Pour respecter le cahier des charges : *« Le serveur LAMP n'est pas utilisable par un pirate en cas de compromission : pas d'accès vers l'extérieur de la DMZ externe »* :
1. Dans **Firewall > Rules > DMZ_EXT**, créer une règle prioritaire :
   * **Action :** `Block`
   * **Source :** `10.100.0.99` (Honeypot uniquement)
   * **Destination :** `any`
   * **Log :** `Log packets handled by this rule`
   * *Explication :* Le honeypot peut recevoir des requêtes entrantes redirigées, mais ne peut initier **aucune connexion sortante** vers le LAN, la DMZ interne ou Internet. En cas de prise de contrôle par un attaquant, celui-ci est piégé dans un bac à sable hermétique.

---

## 5. Blocage Automatique des Attaquants (Type Fail2ban)

Pour répondre à la clause facultative de bannissement automatique :
1. Installer et activer **Fail2ban** sur le serveur Honeypot.
2. Configurer une prison Apache (`/etc/fail2ban/jail.local`) :
   ```ini
   [apache-honeypot]
   enabled  = true
   port     = http,https
   filter   = apache-auth
   logpath  = /var/log/apache2/access.log
   maxretry = 3
   findtime = 600
   bantime  = 3600
   ```
3. En variante OPNsense : utiliser le plugin `os-intrusion-detection-content-et-open` ou ajouter dynamiquement l'IP dans une table d'alias bloquante OPNsense via son API REST.

---

## 6. Fiche de Preuve pour le Dossier de Recette (Mission 3)

1. **Simulation d'une attaque depuis le WAN :**
   * Depuis une machine de test sur le WAN Lycée (ex: `posteclement` ou un PC externe), exécuter un scan ou une requête HTTP :
     ```bash
     curl -i http://192.168.101.4/admin/login.php
     ```
2. **Preuve de redirection :**
   * Montrer les journaux Apache du Honeypot (`/var/log/apache2/access.log`) enregistrant l'accès à `admin/login.php`.
3. **Preuve de réception de l'alerte e-mail :**
   * Capture d'écran des logs ou du client de messagerie affichant l'alerte avec le sujet `[ALERTE SÉCURITÉ HONEYPOT]` et l'IP attaquante.
4. **Preuve du cloisonnement anti-rebond :**
   * Tenter un ping ou une connexion SSH depuis le Honeypot (`10.100.0.99`) vers le serveur de fichiers interne (`10.30.0.20`) ➔ Échec immédiat bloqué par la règle OPNsense.
