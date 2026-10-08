@echo off
REM Double-click fast-run launcher: prebuilt frontend + Django, no compiling.
REM Usage: start-prod.bat [-Rebuild] [-NoMigrate]
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-prod.ps1" %*
pause
