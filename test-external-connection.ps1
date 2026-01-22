# Test de connexion PostgreSQL depuis Windows (comme HeidiSQL/Navicat)
Write-Host "`n=== Test de Connexion Externe PostgreSQL ===" -ForegroundColor Cyan

$Host = "127.0.0.1"
$Port = 5432
$User = "myaccount"
$Password = "myaccount_dev_pass"
$Database = "myaccount_db"

# Test 1: Vérifier que le port est ouvert
Write-Host "`n[1] Test du port 5432..." -ForegroundColor Yellow
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.Connect($Host, $Port)
    $tcpClient.Close()
    Write-Host "✓ Port 5432 est accessible" -ForegroundColor Green
} catch {
    Write-Host "✗ Port 5432 n'est pas accessible!" -ForegroundColor Red
    Write-Host "  Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n  Solutions:" -ForegroundColor Yellow
    Write-Host "  1. Vérifier que le container tourne: docker ps" -ForegroundColor White
    Write-Host "  2. Vérifier les logs: docker logs myaccount-postgres" -ForegroundColor White
    Write-Host "  3. Recréer: docker-compose down -v && docker-compose up -d" -ForegroundColor White
    exit 1
}

# Test 2: Variables d'environnement du container
Write-Host "`n[2] Variables d'environnement PostgreSQL:" -ForegroundColor Yellow
docker exec myaccount-postgres env | Select-String "POSTGRES"

# Test 3: Configuration listen_addresses
Write-Host "`n[3] Configuration listen_addresses:" -ForegroundColor Yellow
$listenAddr = docker exec myaccount-postgres psql -U $User -d $Database -t -c "SHOW listen_addresses;" 2>$null
if ($listenAddr) {
    Write-Host "  listen_addresses = $($listenAddr.Trim())" -ForegroundColor White
    if ($listenAddr -match "\*" -or $listenAddr -match "0.0.0.0") {
        Write-Host "  ✓ PostgreSQL écoute sur toutes les interfaces" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ PostgreSQL écoute uniquement sur: $($listenAddr.Trim())" -ForegroundColor Yellow
    }
}

# Test 4: pg_hba.conf
Write-Host "`n[4] Règles d'authentification (pg_hba.conf):" -ForegroundColor Yellow
docker exec myaccount-postgres cat /var/lib/postgresql/data/pg_hba.conf | Select-String -Pattern "^host" | Select-Object -First 5

# Test 5: Test avec psql depuis l'hôte (si installé)
Write-Host "`n[5] Test de connexion avec psql (depuis Windows):" -ForegroundColor Yellow
$env:PGPASSWORD = $Password
$psqlTest = & psql -h $Host -p $Port -U $User -d $Database -c "SELECT version();" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Connexion psql OK!" -ForegroundColor Green
    Write-Host $psqlTest
} else {
    if ($psqlTest -match "psql.*not recognized" -or $psqlTest -match "terme.*pas reconnu") {
        Write-Host "⚠ psql n'est pas installé sur Windows (normal)" -ForegroundColor Yellow
        Write-Host "  On va tester autrement..." -ForegroundColor White
    } else {
        Write-Host "✗ Connexion psql échouée:" -ForegroundColor Red
        Write-Host $psqlTest -ForegroundColor Red
    }
}

# Test 6: Test avec Docker exec + host (simule connexion externe)
Write-Host "`n[6] Test avec authentification par mot de passe:" -ForegroundColor Yellow
$result = docker exec myaccount-postgres psql "postgresql://${User}:${Password}@127.0.0.1:5432/${Database}" -c "SELECT 'Connection OK' as status;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Authentification par mot de passe fonctionne!" -ForegroundColor Green
    Write-Host $result
} else {
    Write-Host "✗ Authentification par mot de passe échoue!" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    Write-Host "`n  Le mot de passe n'est peut-être pas correctement configuré." -ForegroundColor Yellow
    Write-Host "  Solution: Recréer le container avec -v" -ForegroundColor White
    Write-Host "    docker-compose down -v" -ForegroundColor White
    Write-Host "    docker volume rm myaccountyrt_postgres_data -f" -ForegroundColor White
    Write-Host "    docker-compose up -d" -ForegroundColor White
}

# Test 7: Lister les utilisateurs PostgreSQL
Write-Host "`n[7] Utilisateurs PostgreSQL:" -ForegroundColor Yellow
docker exec myaccount-postgres psql -U $User -d $Database -c "\du" 2>$null

Write-Host "`n=== Paramètres pour HeidiSQL/Navicat ===" -ForegroundColor Cyan
Write-Host "Type de réseau: PostgreSQL (TCP/IP)" -ForegroundColor Yellow
Write-Host "Host/IP: 127.0.0.1" -ForegroundColor White
Write-Host "Port: 5432" -ForegroundColor White
Write-Host "Utilisateur: myaccount" -ForegroundColor White
Write-Host "Mot de passe: myaccount_dev_pass" -ForegroundColor White
Write-Host "Base de données: myaccount_db" -ForegroundColor White
Write-Host ""
Write-Host "Pour HeidiSQL:" -ForegroundColor Yellow
Write-Host "  - Network type: PostgreSQL (TCP/IP)" -ForegroundColor White
Write-Host "  - Library: libpq (PostgreSQL native)" -ForegroundColor White
Write-Host ""
Write-Host "Si ça ne marche toujours pas:" -ForegroundColor Yellow
Write-Host "  1. Dans HeidiSQL, cliquez 'Test' pour voir le message d'erreur exact" -ForegroundColor White
Write-Host "  2. Essayez d'abord sans spécifier de database" -ForegroundColor White
Write-Host "  3. Vérifiez que vous utilisez libpq et pas un autre driver" -ForegroundColor White
Write-Host ""
