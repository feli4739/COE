@echo off
REM Inicializa Docker (Postgres + API + Nginx) y la base si está vacía.
REM Uso: docker-init.bat          o  docker-init.bat -WithTunnel
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\docker-init.ps1" %*
exit /b %ERRORLEVEL%
