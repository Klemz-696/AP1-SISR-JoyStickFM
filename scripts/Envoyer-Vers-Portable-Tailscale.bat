@echo off
title Transfert Tailscale vers PC Portable
cls
echo ======================================================================
echo  🚀 ENVOI DU PROJET AP 1 VERS LE PC PORTABLE VIA TAILSCALE (TAILDROP)
echo ======================================================================
echo.
echo Machine cible : desktop-7t3hsh1 (100.109.93.125)
echo Fichier source : C:\Users\Klemz\Desktop\AP1_Transfert_Portable_2026-10-03.zip
echo.
echo [1/2] Verification du statut reseau Tailscale...
tailscale status
echo.
echo [2/2] Envoi en cours via Taildrop...
echo (Si le PC portable vient de s'allumer, patientez quelques secondes...)
echo.
tailscale file cp "C:\Users\Klemz\Desktop\AP1_Transfert_Portable_2026-10-03.zip" desktop-7t3hsh1:

if %errorlevel% equ 0 (
    echo.
    echo ======================================================================
    echo  ✅ TRANSFERT REUSSI A 100%% !
    echo ======================================================================
    echo L'archive a ete transmise directement a votre PC Portable.
    echo Sur le portable, verifiez la notification Tailscale ou vos Telechargements.
) else (
    echo.
    echo ======================================================================
    echo  ⚠️ LE PC PORTABLE SEMBLE EN VEILLE OU DECONNECTE DE TAILSCALE
    echo ======================================================================
    echo 1. Allumez votre PC portable et connectez-le a Internet.
    echo 2. Verifiez que l'icone Tailscale est bien activee (Logged in).
    echo 3. Relancez ce script une fois le portable allume !
)
echo.
pause
