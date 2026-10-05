@echo off
title Serveur de telechargement Tailscale
cls
echo ======================================================================
echo  🌐 SERVEUR DE TELECHARGEMENT DIRECT TAILSCALE (GROS PC -> PORTABLE)
echo ======================================================================
echo.
echo Votre IP Tailscale (Gros PC) : 100.117.117.10
echo.
echo Depuis votre PC portable, ouvrez simplement votre navigateur sur :
echo.
echo   http://100.117.117.10:8080/AP1_Transfert_Portable_2026-10-03.zip
echo.
echo Le telechargement demarrera immediatement au debit maximal de votre reseau !
echo (Laissez cette fenetre ouverte pendant le telechargement).
echo ======================================================================
echo.
python -m http.server 8080 --directory "C:\Users\Klemz\Desktop"
pause
