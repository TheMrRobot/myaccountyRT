#!/bin/bash

# Script de démarrage pour MyAccount SaaS
# Usage: ./start-dev.sh

set -e

echo "🚀 Démarrage de MyAccount SaaS..."
echo ""

# Vérifier si Docker est lancé
echo "📦 Vérification de Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas démarré. Veuillez lancer Docker et réessayer."
    exit 1
fi
echo "✅ Docker est actif"
echo ""

# Démarrer PostgreSQL et Redis avec Docker Compose
echo "🐘 Démarrage de PostgreSQL et Redis..."
docker-compose up -d

echo "✅ PostgreSQL et Redis démarrés"
echo ""

# Attendre que PostgreSQL soit prêt
echo "⏳ Attente de PostgreSQL (15 secondes)..."
sleep 15
echo "✅ PostgreSQL devrait être prêt"
echo ""

# Vérifier si le fichier .env existe
if [ ! -f "apps/backend/.env" ]; then
    echo "⚠️  Fichier .env manquant, création..."
    cp apps/backend/.env.example apps/backend/.env
    echo "✅ Fichier .env créé depuis .env.example"
    echo ""
fi

# Générer le client Prisma
echo "🔧 Génération du client Prisma..."
cd apps/backend
pnpm db:generate

echo "✅ Client Prisma généré"
echo ""

# Push du schéma vers la base de données
echo "📊 Création du schéma de base de données..."
pnpm db:push

echo "✅ Schéma de base de données créé"
echo ""

# Peupler la base de données avec des données de démo
echo "🌱 Peuplement avec des données de démo..."
if pnpm db:seed; then
    echo "✅ Données de démo créées"
else
    echo "⚠️  Échec du seed (peut-être déjà fait?)"
fi

echo ""
cd ../..

# Informations finales
echo "═══════════════════════════════════════"
echo "✨ MyAccount SaaS est prêt!"
echo "═══════════════════════════════════════"
echo ""
echo "Pour démarrer l'application:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd apps/backend"
echo "    pnpm dev"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd apps/web"
echo "    pnpm dev"
echo ""
echo "URLs:"
echo "  - Frontend:  http://localhost:3001"
echo "  - Backend:   http://localhost:3000/api/v1"
echo "  - Swagger:   http://localhost:3000/api/docs"
echo ""
echo "Comptes de démonstration:"
echo "  - admin@democompany.be / admin123 (Admin)"
echo "  - commercial@democompany.be / admin123 (Commercial)"
echo "  - accounting@democompany.be / admin123 (Comptable)"
echo ""
