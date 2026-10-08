@echo off
REM Double-click launcher: starts backend + frontend dev servers in two windows.
REM Usage: start-dev.bat [-BackendPort 8000] [-FrontendPort 3000] [-NoMigrate]
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-dev.ps1" %*
pause
