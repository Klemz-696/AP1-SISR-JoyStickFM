@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0Deploy-Plugin.ps1" "%~1"
pause
