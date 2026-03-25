#Requires -Version 5.1
<#
  Inicializa el stack Docker: Postgres + API + Nginx (web), aplica SQL y muestra URL local.
  Uso (desde la raíz del repo):
    .\scripts\docker-init.ps1
  Opcional - túnel Cloudflare:
    .\scripts\docker-init.ps1 -WithTunnel
#>
param(
  [switch]$WithTunnel
)

$ErrorActionPreference = "Stop"
# Raíz del repo = carpeta padre de scripts/
$Root = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $Root "docker-compose.yml"))) {
  Write-Error "No se encontró docker-compose.yml. Ejecutá: .\scripts\docker-init.ps1 desde el clon del repo."
}

Set-Location $Root

if (-not (Test-Path (Join-Path $Root ".env"))) {
  if (Test-Path (Join-Path $Root ".env.example")) {
    Copy-Item (Join-Path $Root ".env.example") (Join-Path $Root ".env")
    Write-Host "==> Creado .env desde .env.example (revisá JWT_SECRET y CLIENT_ORIGIN)." -ForegroundColor DarkYellow
  }
}

function Test-Command($Name) {
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

if (-not (Test-Command "docker")) {
  Write-Error "Docker no está en PATH. Instalá Docker Desktop y reintentá."
}

Write-Host "==> FireBurst: construyendo e iniciando contenedores..." -ForegroundColor Cyan
$composeArgs = @("compose")
if ($WithTunnel) {
  $composeArgs += @("--profile", "tunnel")
}
$composeArgs += @("up", "-d", "--build")
& docker @composeArgs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "==> Esperando a Postgres..." -ForegroundColor Cyan
$ready = $false
for ($i = 0; $i -lt 60; $i++) {
  & docker compose exec -T postgres pg_isready -U postgres 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) { $ready = $true; break }
  Start-Sleep -Seconds 1
}
if (-not $ready) {
  Write-Error "Postgres no respondió a tiempo."
}

Write-Host "==> Comprobando base de datos..." -ForegroundColor Cyan
$hasUsers = (& docker compose exec -T postgres psql -U postgres -d fireburst_people -tAc "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='users'" 2>$null).Trim()

if ($hasUsers -eq "1") {
  Write-Host "==> La base ya tiene tablas; omitiendo schema/seed (usá docker compose down -v para empezar de cero)." -ForegroundColor DarkYellow
} else {
  Write-Host "==> Aplicando schema y datos (SQL)..." -ForegroundColor Cyan
  $schema = Join-Path $Root "server\sql\schema.sql"
  $seed = Join-Path $Root "server\sql\seed.sql"
  $seedUsers = Join-Path $Root "server\sql\seed-users.sql"
  if (-not (Test-Path $schema)) { Write-Error "No se encuentra $schema" }

  Get-Content $schema -Raw -Encoding UTF8 | & docker compose exec -T postgres psql -U postgres -d fireburst_people -v ON_ERROR_STOP=1
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

  if (Test-Path $seed) {
    Get-Content $seed -Raw -Encoding UTF8 | & docker compose exec -T postgres psql -U postgres -d fireburst_people -v ON_ERROR_STOP=1
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  }

  if (Test-Path $seedUsers) {
    Get-Content $seedUsers -Raw -Encoding UTF8 | & docker compose exec -T postgres psql -U postgres -d fireburst_people -v ON_ERROR_STOP=1
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  }
}

Write-Host ""
Write-Host "Listo." -ForegroundColor Green
Write-Host "  - App local:    http://localhost:8080" -ForegroundColor Yellow
Write-Host "  - Credenciales: admin@fireburst.local / FireBurst2025!  |  demo@fireburst.local / demo1234" -ForegroundColor Yellow
if ($WithTunnel) {
  Write-Host "  - Túnel: revisá Cloudflare Zero Trust y usá CLIENT_ORIGIN=https://<tu-url-del-túnel> en .env" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "Si es la primera vez, copiá .env.example a .env y ajustá JWT_SECRET y CLIENT_ORIGIN." -ForegroundColor DarkGray
