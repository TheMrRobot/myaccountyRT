# Vérification du mot de passe PostgreSQL
Write-Host "`n=== Vérification Configuration PostgreSQL ===" -ForegroundColor Cyan

# 1. Vérifier les variables d'environnement du container
Write-Host "`n[1] Variables d'environnement du container:" -ForegroundColor Yellow
docker exec myaccount-postgres env | findstr POSTGRES

# 2. Tester avec mot de passe depuis l'extérieur
Write-Host "`n[2] Test de connexion avec mot de passe (depuis l'extérieur du container):" -ForegroundColor Yellow
Write-Host "  Mot de passe utilisé: myaccount_dev_pass" -ForegroundColor White

# Test avec PGPASSWORD (simule une connexion externe)
$env:PGPASSWORD = "myaccount_dev_pass"
$result = docker exec -e PGPASSWORD=myaccount_dev_pass myaccount-postgres psql -h localhost -U myaccount -d myaccount_db -c "SELECT 'Connection OK' as status;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Connexion avec mot de passe: OK" -ForegroundColor Green
    Write-Host $result
} else {
    Write-Host "✗ Connexion avec mot de passe: ÉCHEC" -ForegroundColor Red
    Write-Host $result
}

# 3. Vérifier pg_hba.conf (règles d'authentification)
Write-Host "`n[3] Configuration d'authentification PostgreSQL (pg_hba.conf):" -ForegroundColor Yellow
docker exec myaccount-postgres cat /var/lib/postgresql/data/pg_hba.conf | Select-String -Pattern "host.*all.*all"

# 4. Vérifier que PostgreSQL écoute sur toutes les interfaces
Write-Host "`n[4] Interfaces réseau PostgreSQL:" -ForegroundColor Yellow
docker exec myaccount-postgres cat /var/lib/postgresql/data/postgresql.conf | Select-String -Pattern "listen_addresses"

Write-Host "`n=== Résolution ===" -ForegroundColor Cyan
Write-Host "Si le test [2] échoue, le mot de passe n'est peut-être pas correctement défini." -ForegroundColor Yellow
Write-Host "Solution: Recréer le container avec le bon mot de passe" -ForegroundColor White
Write-Host ""
Write-Host "Commandes pour recréer:" -ForegroundColor Green
Write-Host "  docker-compose down -v  # -v pour supprimer aussi les volumes" -ForegroundColor White
Write-Host "  docker-compose up -d" -ForegroundColor White
Write-Host "  # Attendre 20 secondes" -ForegroundColor White
Write-Host ""
