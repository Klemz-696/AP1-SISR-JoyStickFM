# Preuve : Comparaison Cryptographique des Sources et Binaires JoyStickHub

**Date du relevé** : 6 octobre 2026  
**Auteur du contrôle** : Contrôle cryptographique SHA-256 automatisé

---

## 1. Sources Java (JoyStickHub.java)

| Emplacement | Taille (octets) | Empreinte SHA-256 | Correspondance |
|---|---|---|---|
| `phase0/DEPOT/Perplexity/JoyStickFM_Production_Lots_0_a_7/src/fm/joystick/hub/JoyStickHub.java` | 15 417 | `7129ac534567a79ad1faf4b5a3882faa504fee54e0815ac1d7a7f0ff0076deaa` | **100% IDENTIQUE** |
| `phase0/DEPOT/src/JoyStickHub/src/main/java/fm/joystick/hub/JoyStickHub.java` | 15 417 | `7129ac534567a79ad1faf4b5a3882faa504fee54e0815ac1d7a7f0ff0076deaa` | **100% IDENTIQUE** |
| `scratch/src/fm/joystick/hub/JoyStickHub.java` (espace local initial) | 15 417 | `7129ac534567a79ad1faf4b5a3882faa504fee54e0815ac1d7a7f0ff0076deaa` | **100% IDENTIQUE** |

**Conclusion Sources** : L'intégralité des sources Java dans le dépôt, l'arborescence Maven et l'espace de compilation local partagent rigoureusement le même hash SHA-256.

---

## 2. Binaire Déployé (JoyStickHub.jar)

| Emplacement | Taille (octets) | Empreinte SHA-256 | Statut |
|---|---|---|---|
| `phase0/DEPOT/Perplexity/JoyStickFM_Production_Lots_0_a_7/JoyStickHub.jar` | 6 957 | `1d09151e5073979a45808ad1c8f57e49aa052644d39db0a0b60fd2df8308a3e4` | **100% IDENTIQUE** |
| `phase0/VM/data/plugins/JoyStickHub.jar` | 6 957 | `1d09151e5073979a45808ad1c8f57e49aa052644d39db0a0b60fd2df8308a3e4` | **100% IDENTIQUE** |
| VM de Production : `/opt/minecraft/data/plugins/JoyStickHub.jar` | 6 957 | `1d09151e5073979a45808ad1c8f57e49aa052644d39db0a0b60fd2df8308a3e4` | **100% IDENTIQUE** |

**Conclusion Binaire** : Le binaire déployé en production sur le conteneur Docker `minecraft_ap1` correspond au bit près au fichier JAR versionné dans le dépôt Git.

---

## 3. Inspection Interne du JAR

- **Contenu de l'archive ZIP** :
  - `plugin.yml` (201 octets)
  - `fm/joystick/hub/JoyStickHub.class` (13 570 octets)
- **Contenu du descripteur `plugin.yml`** :
  ```yaml
  name: JoyStickHub
  version: 1.5.0
  main: fm.joystick.hub.JoyStickHub
  api-version: '1.20'
  folia-supported: true
  description: Plugin natif JoyStick FM (PNJ Interactifs, Protection Lobby & Gamemode Strict)
  ```
- **Ligne de compilation reproductible** :
  `javac -cp "<lib_paper_api_jars>" -d target/classes src/main/java/fm/joystick/hub/JoyStickHub.java`
