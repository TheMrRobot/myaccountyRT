# Script de test de connexion PostgreSQL
# Teste différentes méthodes de connexion

Write-Host "`n=== Test de Connexion PostgreSQL ===" -ForegroundColor Cyan

# Vérifier que le container tourne
Write-Host "`n[1] Vérification du container..." -ForegroundColor Yellow
$container = docker ps --filter "name=myaccount-postgres" --format "{{.Status}}"
if ($container) {
    Write-Host "✓ Container PostgreSQL: $container" -ForegroundColor Green
} else {
    Write-Host "✗ Container PostgreSQL n'est pas démarré!" -ForegroundColor Red
    Write-Host "  Lancer: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

# Vérifier le healthcheck
Write-Host "`n[2] Vérification du healthcheck..." -ForegroundColor Yellow
$health = docker inspect myaccount-postgres --format "{{.State.Health.Status}}"
Write-Host "  Status: $health" -ForegroundColor $(if ($health -eq "healthy") { "Green" } else { "Yellow" })

# Tester la connexion depuis le container
Write-Host "`n[3] Test de connexion depuis le container..." -ForegroundColor Yellow
$result = docker exec myaccount-postgres psql -U myaccount -d myaccount_db -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Connexion OK depuis le container" -ForegroundColor Green
} else {
    Write-Host "✗ Échec de connexion depuis le container" -ForegroundColor Red
    Write-Host $result
}

# Afficher les logs récents
Write-Host "`n[4] Logs PostgreSQL récents..." -ForegroundColor Yellow
docker logs myaccount-postgres --tail 15

# Instructions de connexion
Write-Host "`n=== Paramètres de Connexion ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour HeidiSQL / Navicat / DBeaver, essayez:" -ForegroundColor Green
Write-Host ""
Write-Host "Option 1 - localhost:" -ForegroundColor Yellow
Write-Host "  Host: localhost" -ForegroundColor White
Write-Host "  Port: 5432" -ForegroundColor White
Write-Host "  User: myaccount" -ForegroundColor White
Write-Host "  Password: myaccount_dev_pass" -ForegroundColor White
Write-Host "  Database: myaccount_db" -ForegroundColor White
Write-Host ""
Write-Host "Option 2 - 127.0.0.1 (essayez celle-ci si Option 1 échoue):" -ForegroundColor Yellow
Write-Host "  Host: 127.0.0.1" -ForegroundColor White
Write-Host "  Port: 5432" -ForegroundColor White
Write-Host "  User: myaccount" -ForegroundColor White
Write-Host "  Password: myaccount_dev_pass" -ForegroundColor White
Write-Host "  Database: myaccount_db" -ForegroundColor White
Write-Host ""
Write-Host "Option 3 - host.docker.internal:" -ForegroundColor Yellow
Write-Host "  Host: host.docker.internal" -ForegroundColor White
Write-Host "  Port: 5432" -ForegroundColor White
Write-Host "  User: myaccount" -ForegroundColor White
Write-Host "  Password: myaccount_dev_pass" -ForegroundColor White
Write-Host "  Database: myaccount_db" -ForegroundColor White
Write-Host ""

# Vérifier les ports
Write-Host "`n[5] Vérification du port 5432..." -ForegroundColor Yellow
$portCheck = netstat -an | findstr ":5432"
if ($portCheck) {
    Write-Host "✓ Port 5432 est ouvert:" -ForegroundColor Green
    Write-Host $portCheck -ForegroundColor White
} else {
    Write-Host "✗ Port 5432 n'est pas accessible" -ForegroundColor Red
}

Write-Host "`n=== Dépannage ===" -ForegroundColor Cyan
Write-Host "Si la connexion échoue toujours:" -ForegroundColor Yellow
Write-Host "  1. Essayez 127.0.0.1 au lieu de localhost" -ForegroundColor White
Write-Host "  2. Vérifiez le pare-feu Windows" -ForegroundColor White
Write-Host "  3. Redémarrez Docker Desktop" -ForegroundColor White
Write-Host "  4. Essayez: docker-compose down && docker-compose up -d" -ForegroundColor White
Write-Host "  5. Attendez 20-30 secondes après le démarrage" -ForegroundColor White
Write-Host ""
