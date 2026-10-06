# JoyStick FM — Dossier de Transmission de la Phase 0

Ce dossier rassemble l'ensemble des fichiers préparés pour l'analyse et le cadrage de la **Phase 0** par **Perplexity**.
Il s'agit de **copies de transmission expurgées de leurs secrets**, destinées à la lecture et à l'analyse architecturale, et **non d'une configuration directement déployable**.

---

## 1. Métadonnées de Transmission

- **Date de collecte et vérification** : 6 octobre 2026 à 20:45 CEST
- **Dépôt source** : `Klemz-696/AP1-SISR-JoyStickFM`
- **Branche Git dédiée** : `docs/transmission-phase0-2026-10-06`
- **Objectif** : Permettre à Perplexity d'analyser l'état réel et factuel du serveur, de concevoir les fiches de refonte et d'identifier toutes les anomalies sans risque de fuite de secrets.

---

## 2. Structure du Dossier

- **`VM/`** : Fichiers réels de production du conteneur Docker `minecraft_ap1` (PaperMC 26.2, Java 25, 8 Go RAM), organisés selon leur chemin relatif sur la VM hôte Debian (`/opt/minecraft/docker-compose.yml`, `/opt/minecraft/data/server.properties`, `/opt/minecraft/data/plugins/...`).
- **`DEPOT/`** : Code source Java du plugin custom `JoyStickHub` v1.5.0, descripteur `plugin.yml`, `pom.xml` Maven, scripts d'automatisation actifs et rapports officiels des séances 6 et 7.
- **`PREUVES/`** : Éléments probants matériels :
  - `COMPARAISON_HASHES_SOURCES_ET_JARS.md` : Preuve cryptographique de la correspondance exacte entre le code source Java et le JAR déployé sur la VM (SHA-256 : `1d09151e5073979a45808ad1c8f57e49aa052644d39db0a0b60fd2df8308a3e4`).
  - `RELEVE_TELEMETRIE_VM.md` : Télémétrie brute en lecture seule de la VM (8 Go RAM, 20.0 TPS, OpenJDK 25 LTS).
  - `CONTRAT_LUCKPERMS_ROLES.md` : Matrice lisible des permissions par groupe (`default`, `joueur`, `vip`, `modo`, `admin`).
  - `MANIFESTE_CARTES_COMMUNAUTAIRES.md` : Origine, auteurs et coordonnées des mondes et arènes.
  - `CLASSIFICATION_SCRIPTS.md` : Classification des scripts en ACTIF, HISTORIQUE et UTILISATION_NON_VERIFIEE.
- **`CHEMINS.txt`** : Table de correspondance exhaustive des chemins source, VM et destination.
- **`ETAT_ACTUEL.txt`** : Synthèse de l'état réel et résolution des divergences.
- **`INVENTAIRE_FICHIERS.csv`** : Matrice complète des empreintes SHA-256, tailles et statuts.
- **`MANQUANTS_ET_ANOMALIES.md`** : Relevé exhaustif des fichiers absents et des anomalies sources non corrigées.
- **`RAPPORT_VERIFICATION_PHASE0.md`** : Rapport de conformité technique global.

---

## 3. Masquage des Secrets & Données Exclues

Conformément aux exigences de sécurité BTS SIO SISR :
1. **Secrets masqués** : Les mots de passe RCON (`server.properties`), mots de passe MySQL et clés partagées (`AuthMe/config.yml`) ont été remplacés par `SECRET_MASQUE`.
2. **Exclusions strictes** :
   - Aucun fichier `.env` ou clé privée n'est inclus.
   - Aucune base de données d'authentification (`authme.db`) ni table de comptes n'est présente.
   - Aucun profil joueur (`playerdata/`, inventaires `userdata/`) n'est transmis.
   - Aucun binaire lourd (`.jar`) ni archive volumineuse n'est publié dans ce dossier de consultation.

---

## 4. Fichiers Absents et Limitations

- **Fichiers d'override absents** : `/opt/minecraft/docker-compose.override.yml` et `compose.override.yml` n'existent pas sur la VM (non requis).
- **Fichiers par monde absents** : `paper-world.yml` par monde individuel n'est pas utilisé par PaperMC 26.2 (centralisé dans `paper-world-defaults.yml`).
- **Cartes complètes** : Les mondes binaires complets (régions `.mca`) ne sont pas transmis ici pour des raisons évidentes de taille et d'inutilité pour l'analyse des règles et configurations.
