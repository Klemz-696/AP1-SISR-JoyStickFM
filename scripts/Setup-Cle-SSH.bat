@echo off
chcp 65001 > nul
set "SERVER_IP=10.30.0.22"
set "PUBKEY_FILE=%USERPROFILE%\.ssh\id_ed25519.pub"

echo ==========================================================
echo  CLE SSH NOMADE -- SERVEUR MINECRAFT (10.30.0.22)
echo ==========================================================

if not exist "%PUBKEY_FILE%" (
    echo Generation de la cle ED25519...
    ssh-keygen -t ed25519 -f "%USERPROFILE%\.ssh\id_ed25519" -N ""
)

echo Injection de la cle publique sur le serveur...
echo (Veuillez entrer le mot de passe root de %SERVER_IP% une derniere fois)
echo.

type "%PUBKEY_FILE%" | ssh root@%SERVER_IP% "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && sort -u ~/.ssh/authorized_keys -o ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"

if %ERRORLEVEL% equ 0 (
    echo.
    echo ==========================================================
    echo [SUCCES] Cle SSH installee avec succes !
    echo Plus aucun mot de passe ne sera demande.
    echo ==========================================================
) else (
    echo.
    echo ==========================================================
    echo [ERREUR] Echec lors de la copie. Verifiez le mot de passe.
    echo ==========================================================
)

echo.
pause
