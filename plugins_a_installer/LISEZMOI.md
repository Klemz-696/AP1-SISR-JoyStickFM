# Dossier de dépôt rapide des Plugins

Déposez simplement vos fichiers `.jar` de plugins ici, puis lancez le script `..\scripts\Deploy-Plugin.bat` (ou `Deploy-Plugin.ps1`).

Le script s'occupe de :
1. Envoyer les plugins par SCP vers `/opt/minecraft/data/plugins/` sur la VM 10.30.0.22.
2. Corriger automatiquement les permissions pour l'utilisateur Docker (`chown 1000:1000`, `chmod 755`).
3. Recharger le serveur via RCON (`reload confirm`) sans coupure de service.
