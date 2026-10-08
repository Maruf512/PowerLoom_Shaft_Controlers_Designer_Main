<#
.SYNOPSIS
  Launch both backend (Django) and frontend (Next.js) dev servers for LAN access.

.USAGE
  Right-click -> Run with PowerShell,  or:
    .\start-dev.ps1
    .\start-dev.ps1 -BackendPort 8000 -FrontendPort 3000
    .\start-dev.ps1 -NoMigrate      # skip 'manage.py migrate'
  Or double-click start-dev.bat

  Backend : http://<your-lan-ip>:8000/admin/
  Frontend: http://<your-lan-ip>:3000  (open this on phones/other PCs on the same WiFi)
  Close the two popup windows to stop the servers.
#>
param(
  [int]$BackendPort = 8000,
  [int]$FrontendPort = 3000,
  [switch]$NoMigrate
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $Root "backend"
$FrontendDir = Join-Path $Root "frontend"

# --- checks ---------------------------------------------------------------
if (!(Test-Path (Join-Path $BackendDir "manage.py"))) { throw "manage.py not found in $BackendDir" }
if (!(Test-Path (Join-Path $FrontendDir "package.json"))) { throw "package.json not found in $FrontendDir" }
if (!(Get-Command node -ErrorAction SilentlyContinue)) { throw "node not found on PATH. Install Node.js first." }

# --- python (prefer backend venv) -----------------------------------------
$VenvPython = Join-Path $BackendDir "env\Scripts\python.exe"
$Python = if (Test-Path $VenvPython) { $VenvPython } else { "python" }
Write-Host "Using python: $Python"

# --- detect LAN ip so other devices can reach both servers -----------------
$LanIp = Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" -and $_.PrefixOrigin -ne "WellKnown" } |
  Select-Object -First 1 -ExpandProperty IPAddress
if (!$LanIp) { $LanIp = "127.0.0.1" }
$ApiUrl = "http://${LanIp}:${BackendPort}"
Write-Host "LAN IP detected: $LanIp"

# --- migrate ----------------------------------------------------------------
if (!$NoMigrate) {
  Write-Host "Running migrations..."
  & $Python (Join-Path $BackendDir "manage.py") migrate
}

# --- shell for popup windows (pwsh if present, else powershell) -------------
$Shell = if (Get-Command pwsh -ErrorAction SilentlyContinue) { "pwsh" } else { "powershell" }

# --- backend window ----------------------------------------------------------
$BackendCmd = "Set-Location '$BackendDir'; & '$Python' manage.py runserver 0.0.0.0:$BackendPort"
Start-Process $Shell -ArgumentList "-NoExit", "-Command", $BackendCmd

# --- frontend window (auto-install deps on first run, LAN api url) -----------
# --turbopack = much faster dev startup + hot reload (Next 15).
# Use .\start-prod.ps1 instead when you only want to RUN, not edit.
$FrontendCmd = "Set-Location '$FrontendDir'; " +
  "`$env:NEXT_PUBLIC_BASE_URL='$ApiUrl'; " +
  "`$env:NEXT_PUBLIC_API_URL='$ApiUrl'; " +
  "if (!(Test-Path 'node_modules')) { Write-Host 'Installing frontend deps (first run)...'; npm install }; " +
  "npm run dev -- --turbopack -p $FrontendPort"
Start-Process $Shell -ArgumentList "-NoExit", "-Command", $FrontendCmd

Write-Host ""
Write-Host "Servers launching in two new windows:" -ForegroundColor Green
Write-Host "  Backend : http://$LanIp`:$BackendPort/admin/"
Write-Host "  Frontend: http://$LanIp`:$FrontendPort"
Write-Host "Open the frontend URL on any phone/PC on the same WiFi."
Write-Host "Close the popup windows to stop the servers."
