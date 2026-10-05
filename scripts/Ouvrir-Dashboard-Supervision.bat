@echo off
chcp 65001 > nul
echo ==========================================================
echo  📊 OUVERTURE DU DASHBOARD DE SUPERVISION UPTIME KUMA
echo ==========================================================
echo.
echo Tentative d'ouverture via IP LAN (192.168.200.4)...
start http://192.168.200.4:3001
echo.
echo Si vous etes en nomade hors VPN WireGuard, utilisez Tailscale :
echo start http://100.88.228.38:3001
echo.
pause
