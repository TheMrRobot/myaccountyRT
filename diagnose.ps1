# Diagnostic script for MyAccount SaaS setup issues
# Run this in PowerShell to diagnose Docker and database issues

Write-Host "`n=== MyAccount SaaS Diagnostic Tool ===" -ForegroundColor Cyan
Write-Host "This script will check your environment setup`n" -ForegroundColor Cyan

# Check 1: Docker Desktop
Write-Host "[1/7] Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker is installed: $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "✗ Docker command failed" -ForegroundColor Red
        Write-Host "   → Install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "✗ Docker is not installed" -ForegroundColor Red
    Write-Host "   → Install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check 2: Docker daemon running
Write-Host "`n[2/7] Checking if Docker is running..." -ForegroundColor Yellow
try {
    $dockerInfo = docker info 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker daemon is running" -ForegroundColor Green
    } else {
        Write-Host "✗ Docker daemon is not running" -ForegroundColor Red
        Write-Host "   → Start Docker Desktop and wait for it to fully initialize" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "✗ Cannot connect to Docker daemon" -ForegroundColor Red
    Write-Host "   → Start Docker Desktop and wait for it to fully initialize" -ForegroundColor Yellow
    exit 1
}

# Check 3: Docker Compose
Write-Host "`n[3/7] Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker Compose is available: $composeVersion" -ForegroundColor Green
    } else {
        Write-Host "✗ Docker Compose not found" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Docker Compose not found" -ForegroundColor Red
    exit 1
}

# Check 4: .env file
Write-Host "`n[4/7] Checking .env file..." -ForegroundColor Yellow
if (Test-Path "apps\backend\.env") {
    Write-Host "✓ .env file exists" -ForegroundColor Green
    $envContent = Get-Content "apps\backend\.env" -Raw
    if ($envContent -match "DATABASE_URL") {
        Write-Host "✓ DATABASE_URL is configured" -ForegroundColor Green
    } else {
        Write-Host "✗ DATABASE_URL not found in .env" -ForegroundColor Red
    }
} else {
    Write-Host "✗ .env file missing" -ForegroundColor Red
    Write-Host "   → Run: copy apps\backend\.env.example apps\backend\.env" -ForegroundColor Yellow
    exit 1
}

# Check 5: Docker containers
Write-Host "`n[5/7] Checking Docker containers..." -ForegroundColor Yellow
$containers = docker ps --format "{{.Names}}" 2>$null
if ($containers -match "myaccount-postgres") {
    Write-Host "✓ PostgreSQL container is running" -ForegroundColor Green
} else {
    Write-Host "✗ PostgreSQL container is not running" -ForegroundColor Red
    Write-Host "   → Run: docker-compose up -d" -ForegroundColor Yellow
    Write-Host "`nStarting containers now..." -ForegroundColor Cyan
    docker-compose up -d
    Write-Host "Waiting 15 seconds for PostgreSQL to initialize..." -ForegroundColor Cyan
    Start-Sleep -Seconds 15
}

# Check 6: PostgreSQL logs
Write-Host "`n[6/7] Checking PostgreSQL logs..." -ForegroundColor Yellow
$logs = docker logs myaccount-postgres --tail 20 2>$null
if ($logs -match "database system is ready to accept connections") {
    Write-Host "✓ PostgreSQL is ready" -ForegroundColor Green
} else {
    Write-Host "⚠ PostgreSQL may not be ready yet" -ForegroundColor Yellow
    Write-Host "`nRecent PostgreSQL logs:" -ForegroundColor Cyan
    docker logs myaccount-postgres --tail 10
}

# Check 7: Port 5432
Write-Host "`n[7/7] Checking port 5432..." -ForegroundColor Yellow
$port = netstat -an | findstr ":5432"
if ($port) {
    Write-Host "✓ Port 5432 is in use (PostgreSQL is listening)" -ForegroundColor Green
} else {
    Write-Host "✗ Port 5432 is not in use" -ForegroundColor Red
    Write-Host "   → PostgreSQL may not be running correctly" -ForegroundColor Yellow
}

# Final status
Write-Host "`n=== Diagnostic Summary ===" -ForegroundColor Cyan
Write-Host "If all checks passed, try running:" -ForegroundColor Green
Write-Host "  cd apps\backend" -ForegroundColor White
Write-Host "  pnpm db:generate" -ForegroundColor White
Write-Host "  pnpm db:push" -ForegroundColor White
Write-Host "  pnpm db:seed" -ForegroundColor White

Write-Host "`nIf issues persist, check:" -ForegroundColor Yellow
Write-Host "  1. Docker Desktop is fully started (check system tray)" -ForegroundColor White
Write-Host "  2. Wait at least 15 seconds after docker-compose up" -ForegroundColor White
Write-Host "  3. Check logs: docker logs myaccount-postgres" -ForegroundColor White
Write-Host "  4. Restart Docker Desktop completely" -ForegroundColor White
Write-Host ""
