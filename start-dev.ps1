# Script de démarrage pour MyAccount SaaS
# Usage: .\start-dev.ps1

Write-Host "🚀 Démarrage de MyAccount SaaS..." -ForegroundColor Green
Write-Host ""

# Vérifier si Docker Desktop est lancé
Write-Host "📦 Vérification de Docker..." -ForegroundColor Cyan
$dockerRunning = docker info 2>&1 | Select-String "Server Version"
if (-not $dockerRunning) {
    Write-Host "❌ Docker n'est pas démarré. Veuillez lancer Docker Desktop et réessayer." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker est actif" -ForegroundColor Green
Write-Host ""

# Démarrer PostgreSQL et Redis avec Docker Compose
Write-Host "🐘 Démarrage de PostgreSQL et Redis..." -ForegroundColor Cyan
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Échec du démarrage de Docker Compose" -ForegroundColor Red
    exit 1
}

Write-Host "✅ PostgreSQL et Redis démarrés" -ForegroundColor Green
Write-Host ""

# Attendre que PostgreSQL soit prêt
Write-Host "⏳ Attente de PostgreSQL (15 secondes)..." -ForegroundColor Cyan
Start-Sleep -Seconds 15
Write-Host "✅ PostgreSQL devrait être prêt" -ForegroundColor Green
Write-Host ""

# Vérifier si le fichier .env existe
if (-not (Test-Path "apps/backend/.env")) {
    Write-Host "⚠️  Fichier .env manquant, création..." -ForegroundColor Yellow
    Copy-Item "apps/backend/.env.example" "apps/backend/.env"
    Write-Host "✅ Fichier .env créé depuis .env.example" -ForegroundColor Green
    Write-Host ""
}

# Générer le client Prisma
Write-Host "🔧 Génération du client Prisma..." -ForegroundColor Cyan
Set-Location apps/backend
pnpm db:generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Échec de la génération du client Prisma" -ForegroundColor Red
    Set-Location ../..
    exit 1
}

Write-Host "✅ Client Prisma généré" -ForegroundColor Green
Write-Host ""

# Push du schéma vers la base de données
Write-Host "📊 Création du schéma de base de données..." -ForegroundColor Cyan
pnpm db:push

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Échec de la création du schéma" -ForegroundColor Red
    Write-Host "💡 Vérifiez que PostgreSQL est bien démarré avec: docker ps" -ForegroundColor Yellow
    Set-Location ../..
    exit 1
}

Write-Host "✅ Schéma de base de données créé" -ForegroundColor Green
Write-Host ""

# Peupler la base de données avec des données de démo
Write-Host "🌱 Peuplement avec des données de démo..." -ForegroundColor Cyan
pnpm db:seed

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Échec du seed (peut-être déjà fait?)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Données de démo créées" -ForegroundColor Green
}

Write-Host ""
Set-Location ../..

# Informations finales
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host "✨ MyAccount SaaS est prêt!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Pour démarrer l'application:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Terminal 1 (Backend):" -ForegroundColor Yellow
Write-Host "    cd apps/backend" -ForegroundColor White
Write-Host "    pnpm dev" -ForegroundColor White
Write-Host ""
Write-Host "  Terminal 2 (Frontend):" -ForegroundColor Yellow
Write-Host "    cd apps/web" -ForegroundColor White
Write-Host "    pnpm dev" -ForegroundColor White
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  - Frontend:  http://localhost:3001" -ForegroundColor White
Write-Host "  - Backend:   http://localhost:3000/api/v1" -ForegroundColor White
Write-Host "  - Swagger:   http://localhost:3000/api/docs" -ForegroundColor White
Write-Host ""
Write-Host "Comptes de démonstration:" -ForegroundColor Cyan
Write-Host "  - admin@democompany.be / admin123 (Admin)" -ForegroundColor White
Write-Host "  - commercial@democompany.be / admin123 (Commercial)" -ForegroundColor White
Write-Host "  - accounting@democompany.be / admin123 (Comptable)" -ForegroundColor White
Write-Host ""
