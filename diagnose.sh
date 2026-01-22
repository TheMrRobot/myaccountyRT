#!/bin/bash

# Diagnostic script for MyAccount SaaS setup issues
# Run this in bash/zsh to diagnose Docker and database issues

echo -e "\n\033[1;36m=== MyAccount SaaS Diagnostic Tool ===\033[0m"
echo -e "\033[1;36mThis script will check your environment setup\n\033[0m"

# Check 1: Docker installation
echo -e "\033[1;33m[1/7] Checking Docker installation...\033[0m"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "\033[1;32m✓ Docker is installed: $DOCKER_VERSION\033[0m"
else
    echo -e "\033[1;31m✗ Docker is not installed\033[0m"
    echo -e "\033[1;33m   → Install Docker Desktop from: https://www.docker.com/products/docker-desktop\033[0m"
    exit 1
fi

# Check 2: Docker daemon running
echo -e "\n\033[1;33m[2/7] Checking if Docker is running...\033[0m"
if docker info &> /dev/null; then
    echo -e "\033[1;32m✓ Docker daemon is running\033[0m"
else
    echo -e "\033[1;31m✗ Docker daemon is not running\033[0m"
    echo -e "\033[1;33m   → Start Docker Desktop and wait for it to fully initialize\033[0m"
    exit 1
fi

# Check 3: Docker Compose
echo -e "\n\033[1;33m[3/7] Checking Docker Compose...\033[0m"
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo -e "\033[1;32m✓ Docker Compose is available: $COMPOSE_VERSION\033[0m"
else
    echo -e "\033[1;31m✗ Docker Compose not found\033[0m"
    exit 1
fi

# Check 4: .env file
echo -e "\n\033[1;33m[4/7] Checking .env file...\033[0m"
if [ -f "apps/backend/.env" ]; then
    echo -e "\033[1;32m✓ .env file exists\033[0m"
    if grep -q "DATABASE_URL" apps/backend/.env; then
        echo -e "\033[1;32m✓ DATABASE_URL is configured\033[0m"
    else
        echo -e "\033[1;31m✗ DATABASE_URL not found in .env\033[0m"
    fi
else
    echo -e "\033[1;31m✗ .env file missing\033[0m"
    echo -e "\033[1;33m   → Run: cp apps/backend/.env.example apps/backend/.env\033[0m"
    exit 1
fi

# Check 5: Docker containers
echo -e "\n\033[1;33m[5/7] Checking Docker containers...\033[0m"
if docker ps --format "{{.Names}}" | grep -q "myaccount-postgres"; then
    echo -e "\033[1;32m✓ PostgreSQL container is running\033[0m"
else
    echo -e "\033[1;31m✗ PostgreSQL container is not running\033[0m"
    echo -e "\033[1;33m   → Run: docker-compose up -d\033[0m"
    echo -e "\n\033[1;36mStarting containers now...\033[0m"
    docker-compose up -d
    echo -e "\033[1;36mWaiting 15 seconds for PostgreSQL to initialize...\033[0m"
    sleep 15
fi

# Check 6: PostgreSQL logs
echo -e "\n\033[1;33m[6/7] Checking PostgreSQL logs...\033[0m"
if docker logs myaccount-postgres 2>&1 | tail -20 | grep -q "database system is ready to accept connections"; then
    echo -e "\033[1;32m✓ PostgreSQL is ready\033[0m"
else
    echo -e "\033[1;33m⚠ PostgreSQL may not be ready yet\033[0m"
    echo -e "\n\033[1;36mRecent PostgreSQL logs:\033[0m"
    docker logs myaccount-postgres --tail 10
fi

# Check 7: Port 5432
echo -e "\n\033[1;33m[7/7] Checking port 5432...\033[0m"
if lsof -i :5432 &> /dev/null || netstat -tuln 2>/dev/null | grep -q ":5432" || ss -tuln 2>/dev/null | grep -q ":5432"; then
    echo -e "\033[1;32m✓ Port 5432 is in use (PostgreSQL is listening)\033[0m"
else
    echo -e "\033[1;31m✗ Port 5432 is not in use\033[0m"
    echo -e "\033[1;33m   → PostgreSQL may not be running correctly\033[0m"
fi

# Final status
echo -e "\n\033[1;36m=== Diagnostic Summary ===\033[0m"
echo -e "\033[1;32mIf all checks passed, try running:\033[0m"
echo -e "  cd apps/backend"
echo -e "  pnpm db:generate"
echo -e "  pnpm db:push"
echo -e "  pnpm db:seed"

echo -e "\n\033[1;33mIf issues persist, check:\033[0m"
echo -e "  1. Docker Desktop is fully started"
echo -e "  2. Wait at least 15 seconds after 'docker-compose up'"
echo -e "  3. Check logs: docker logs myaccount-postgres"
echo -e "  4. Restart Docker Desktop completely"
echo ""
