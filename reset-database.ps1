# Script de réinitialisation complète de PostgreSQL
# Supprime TOUT et recrée proprement

Write-Host "`n=== Réinitialisation Complète PostgreSQL ===" -ForegroundColor Cyan
Write-Host "Ce script va:" -ForegroundColor Yellow
Write-Host "  1. Arrêter tous les containers" -ForegroundColor White
Write-Host "  2. Supprimer les containers" -ForegroundColor White
Write-Host "  3. Supprimer les volumes (données PostgreSQL)" -ForegroundColor White
Write-Host "  4. Recréer avec la bonne configuration" -ForegroundColor White
Write-Host ""

$confirmation = Read-Host "Continuer? (y/N)"
if ($confirmation -ne "y" -and $confirmation -ne "Y") {
    Write-Host "Annulé." -ForegroundColor Yellow
    exit 0
}

Write-Host "`n[1/6] Arrêt des containers..." -ForegroundColor Yellow
docker-compose down
Write-Host "✓ Containers arrêtés" -ForegroundColor Green

Write-Host "`n[2/6] Suppression des volumes..." -ForegroundColor Yellow
docker volume rm myaccountyrt_postgres_data -f 2>$null
docker volume rm myaccountyrt_redis_data -f 2>$null
Write-Host "✓ Volumes supprimés" -ForegroundColor Green

Write-Host "`n[3/6] Vérification du nettoyage..." -ForegroundColor Yellow
$remainingContainers = docker ps -a | Select-String "myaccount"
$remainingVolumes = docker volume ls | Select-String "myaccount"

if ($remainingContainers) {
    Write-Host "⚠ Containers restants:" -ForegroundColor Yellow
    Write-Host $remainingContainers
    docker rm -f myaccount-postgres myaccount-redis 2>$null
}

if ($remainingVolumes) {
    Write-Host "⚠ Volumes restants:" -ForegroundColor Yellow
    Write-Host $remainingVolumes
}

Write-Host "✓ Nettoyage complet" -ForegroundColor Green

Write-Host "`n[4/6] Redémarrage avec docker-compose..." -ForegroundColor Yellow
docker-compose up -d
Write-Host "✓ Containers démarrés" -ForegroundColor Green

Write-Host "`n[5/6] Attente de l'initialisation PostgreSQL (30 secondes)..." -ForegroundColor Yellow
Write-Host "PostgreSQL crée la base de données et configure le mot de passe..." -ForegroundColor White

for ($i = 30; $i -gt 0; $i--) {
    Write-Host -NoNewline "`r  Temps restant: $i secondes  "
    Start-Sleep -Seconds 1
}
Write-Host "`n✓ Attente terminée" -ForegroundColor Green

Write-Host "`n[6/6] Vérification de l'état..." -ForegroundColor Yellow
$health = docker inspect myaccount-postgres --format "{{.State.Health.Status}}" 2>$null
Write-Host "  Status PostgreSQL: $health" -ForegroundColor $(if ($health -eq "healthy") { "Green" } else { "Yellow" })

# Test de connexion
Write-Host "`n=== Test de Connexion ===" -ForegroundColor Cyan
$result = docker exec myaccount-postgres psql "postgresql://myaccount:myaccount_dev_pass@localhost:5432/myaccount_db" -c "SELECT version();" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ PostgreSQL fonctionne correctement!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vous pouvez maintenant:" -ForegroundColor Green
    Write-Host "  1. Connecter HeidiSQL/Navicat avec:" -ForegroundColor White
    Write-Host "     Host: 127.0.0.1" -ForegroundColor White
    Write-Host "     Port: 5432" -ForegroundColor White
    Write-Host "     User: myaccount" -ForegroundColor White
    Write-Host "     Password: myaccount_dev_pass" -ForegroundColor White
    Write-Host "     Database: myaccount_db" -ForegroundColor White
    Write-Host ""
    Write-Host "  2. Initialiser le schéma Prisma:" -ForegroundColor White
    Write-Host "     cd apps\backend" -ForegroundColor White
    Write-Host "     pnpm db:generate" -ForegroundColor White
    Write-Host "     pnpm db:push" -ForegroundColor White
    Write-Host "     pnpm db:seed" -ForegroundColor White
} else {
    Write-Host "✗ Erreur de connexion:" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    Write-Host "`nLogs PostgreSQL:" -ForegroundColor Yellow
    docker logs myaccount-postgres --tail 20
}

Write-Host ""
