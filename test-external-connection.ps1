# Test de connexion PostgreSQL depuis Windows (comme HeidiSQL/Navicat)
Write-Host "`n=== Test de Connexion Externe PostgreSQL ===" -ForegroundColor Cyan

$HostAddr = "127.0.0.1"
$Port = 5432
$User = "myaccount"
$Password = "myaccount_dev_pass"
$Database = "myaccount_db"

# Test 1: Verifier que le port est ouvert
Write-Host "`n[1] Test du port 5432..." -ForegroundColor Yellow
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.Connect($HostAddr, $Port)
    $tcpClient.Close()
    Write-Host "OK - Port 5432 est accessible" -ForegroundColor Green
} catch {
    Write-Host "ERREUR - Port 5432 non accessible!" -ForegroundColor Red
    Write-Host "  Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n  Solutions:" -ForegroundColor Yellow
    Write-Host "  1. Verifier que le container tourne: docker ps" -ForegroundColor White
    Write-Host "  2. Verifier les logs: docker logs myaccount-postgres" -ForegroundColor White
    Write-Host "  3. Recreer: docker-compose down -v && docker-compose up -d" -ForegroundColor White
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
        Write-Host "  OK - PostgreSQL ecoute sur toutes les interfaces" -ForegroundColor Green
    } else {
        Write-Host "  ATTENTION - PostgreSQL ecoute uniquement sur: $($listenAddr.Trim())" -ForegroundColor Yellow
    }
}

# Test 4: pg_hba.conf
Write-Host "`n[4] Regles d'authentification (pg_hba.conf):" -ForegroundColor Yellow
docker exec myaccount-postgres cat /var/lib/postgresql/data/pg_hba.conf | Select-String -Pattern "^host" | Select-Object -First 5

# Test 5: Test avec psql depuis Windows (si installe)
Write-Host "`n[5] Test de connexion avec psql (depuis Windows):" -ForegroundColor Yellow
$env:PGPASSWORD = $Password
$psqlTest = & psql -h $HostAddr -p $Port -U $User -d $Database -c "SELECT version();" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK - Connexion psql reussie!" -ForegroundColor Green
    Write-Host $psqlTest
} else {
    if ($psqlTest -match "psql.*not recognized" -or $psqlTest -match "terme.*pas reconnu") {
        Write-Host "INFO - psql non installe sur Windows (normal)" -ForegroundColor Yellow
        Write-Host "  On va tester autrement..." -ForegroundColor White
    } else {
        Write-Host "ERREUR - Connexion psql echouee:" -ForegroundColor Red
        Write-Host $psqlTest -ForegroundColor Red
    }
}

# Test 6: Test avec Docker exec + host (simule connexion externe)
Write-Host "`n[6] Test avec authentification par mot de passe:" -ForegroundColor Yellow
$result = docker exec myaccount-postgres psql "postgresql://${User}:${Password}@127.0.0.1:5432/${Database}" -c "SELECT 'Connection OK' as status;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK - Authentification par mot de passe fonctionne!" -ForegroundColor Green
    Write-Host $result
} else {
    Write-Host "ERREUR - Authentification par mot de passe echoue!" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    Write-Host "`n  Le mot de passe n'est peut-etre pas correctement configure." -ForegroundColor Yellow
    Write-Host "  Solution: Recreer le container avec -v" -ForegroundColor White
    Write-Host "    docker-compose down -v" -ForegroundColor White
    Write-Host "    docker volume rm myaccountyrt_postgres_data -f" -ForegroundColor White
    Write-Host "    docker-compose up -d" -ForegroundColor White
}

# Test 7: Lister les utilisateurs PostgreSQL
Write-Host "`n[7] Utilisateurs PostgreSQL:" -ForegroundColor Yellow
docker exec myaccount-postgres psql -U $User -d $Database -c "\du" 2>$null

Write-Host "`n=== Parametres pour HeidiSQL/Navicat ===" -ForegroundColor Cyan
Write-Host "Type de reseau: PostgreSQL (TCP/IP)" -ForegroundColor Yellow
Write-Host "Host/IP: 127.0.0.1" -ForegroundColor White
Write-Host "Port: 5432" -ForegroundColor White
Write-Host "Utilisateur: myaccount" -ForegroundColor White
Write-Host "Mot de passe: myaccount_dev_pass" -ForegroundColor White
Write-Host "Base de donnees: myaccount_db" -ForegroundColor White
Write-Host ""
Write-Host "Pour HeidiSQL:" -ForegroundColor Yellow
Write-Host "  - Network type: PostgreSQL (TCP/IP)" -ForegroundColor White
Write-Host "  - Library: libpq (PostgreSQL native)" -ForegroundColor White
Write-Host ""
Write-Host "Si ca ne marche toujours pas:" -ForegroundColor Yellow
Write-Host "  1. Dans HeidiSQL, cliquez Test pour voir le message d erreur exact" -ForegroundColor White
Write-Host "  2. Essayez d abord sans specifier de database" -ForegroundColor White
Write-Host "  3. Verifiez que vous utilisez libpq et pas un autre driver" -ForegroundColor White
Write-Host ""
