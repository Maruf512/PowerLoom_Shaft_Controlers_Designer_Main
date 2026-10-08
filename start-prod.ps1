<#
.SYNOPSIS
  Fast RUN mode: build the frontend once, then start everything from
  prebuilt files. Much quicker to launch than dev mode (no compiling).

.USAGE
    .\start-prod.ps1              # build only if needed, then run
    .\start-prod.ps1 -Rebuild     # force a fresh 'npm run build'
    .\start-prod.ps1 -NoMigrate  # skip 'manage.py migrate'

  IMPORTANT: the frontend API address is baked in at BUILD time. If your
  WiFi/LAN IP changes, run once with -Rebuild so phones/other PCs can
  still reach the backend.

  Backend : http://<your-lan-ip>:8000/admin/
  Frontend: http://<your-lan-ip>:3000
  Close the two popup windows to stop the servers.
#>
param(
  [int]$BackendPort = 8000,
  [int]$FrontendPort = 3000,
  [switch]$Rebuild,
  [switch]$NoMigrate
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $Root "backend"
$FrontendDir = Join-Path $Root "frontend"

if (!(Test-Path (Join-Path $BackendDir "manage.py"))) { throw "manage.py not found in $BackendDir" }
if (!(Test-Path (Join-Path $FrontendDir "package.json"))) { throw "package.json not found in $FrontendDir" }
if (!(Get-Command node -ErrorAction SilentlyContinue)) { throw "node not found on PATH. Install Node.js first." }

$VenvPython = Join-Path $BackendDir "env\Scripts\python.exe"
$Python = if (Test-Path $VenvPython) { $VenvPython } else { "python" }

# --- LAN ip (baked into the frontend at build time) --------------------------
$LanIp = Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" -and $_.PrefixOrigin -ne "WellKnown" } |
  Select-Object -First 1 -ExpandProperty IPAddress
if (!$LanIp) { $LanIp = "127.0.0.1" }
$ApiUrl = "http://${LanIp}:${BackendPort}"
Write-Host "LAN IP: $LanIp"

# --- build frontend once (skip if already built) ------------------------------
$BuildId = Join-Path $FrontendDir ".next\BUILD_ID"
if ($Rebuild -or !(Test-Path $BuildId)) {
  Write-Host "Building frontend (one-time ~30s, baked API: $ApiUrl)..."
  $env:NEXT_PUBLIC_BASE_URL = $ApiUrl
  $env:NEXT_PUBLIC_API_URL = $ApiUrl
  Push-Location $FrontendDir
  try {
    if (!(Test-Path "node_modules")) { npm install }
    npm run build
  } finally {
    Pop-Location
  }
} else {
  Write-Host "Reusing existing frontend build (skip compile). Use -Rebuild to rebuild."
}

if (!$NoMigrate) {
  Write-Host "Running migrations..."
  & $Python (Join-Path $BackendDir "manage.py") migrate --skip-checks
}

$Shell = if (Get-Command pwsh -ErrorAction SilentlyContinue) { "pwsh" } else { "powershell" }

# --noreload/--skip-checks: fastest Django startup for run-only mode
$BackendCmd = "Set-Location '$BackendDir'; & '$Python' manage.py runserver 0.0.0.0:$BackendPort --noreload --skip-checks"
Start-Process $Shell -ArgumentList "-NoExit", "-Command", $BackendCmd

# next start serves prebuilt files: starts in ~2s, no compiling
$FrontendCmd = "Set-Location '$FrontendDir'; npm run start -- -p $FrontendPort"
Start-Process $Shell -ArgumentList "-NoExit", "-Command", $FrontendCmd

Write-Host ""
Write-Host "Servers launching in two new windows (fast mode):" -ForegroundColor Green
Write-Host "  Backend : http://$LanIp`:$BackendPort/admin/"
Write-Host "  Frontend: http://$LanIp`:$FrontendPort"
Write-Host "Close the popup windows to stop the servers."
