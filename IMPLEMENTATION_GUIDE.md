# Guide d'Implémentation - MyAccount SaaS

## 📋 Table des Matières

1. [Installation et Configuration](#installation-et-configuration)
2. [Architecture du Projet](#architecture-du-projet)
3. [Modules Implémentés](#modules-implémentés)
4. [Authentification et Sécurité](#authentification-et-sécurité)
5. [Utilisation de l'API](#utilisation-de-lapi)
6. [Prochaines Étapes](#prochaines-étapes)

## 📦 Installation et Configuration

### Prérequis

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Docker** et **Docker Compose**
- **PostgreSQL** 16 (via Docker)

### Installation

```bash
# 1. Cloner le repository (déjà fait)
cd /home/user/myaccountyRT

# 2. Installer les dépendances
pnpm install

# 3. Démarrer PostgreSQL et Redis avec Docker
pnpm docker:up

# 4. Copier le fichier d'environnement
cp apps/backend/.env.example apps/backend/.env

# 5. Générer le client Prisma
cd apps/backend
pnpm db:generate

# 6. Créer la base de données et les tables
pnpm db:push

# 7. Peupler la base avec des données de démonstration
pnpm db:seed

# 8. Démarrer le serveur backend
pnpm dev
```

Le serveur backend sera accessible à:
- **API**: http://localhost:3000/api/v1
- **Documentation Swagger**: http://localhost:3000/api/docs

### Variables d'Environnement

Configurer le fichier `apps/backend/.env`:

```env
# Base de données
DATABASE_URL="postgresql://myaccount:myaccount_dev_pass@localhost:5432/myaccount_db?schema=public"

# JWT
JWT_SECRET="votre-clé-secrète-très-longue-et-sécurisée"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="votre-clé-refresh-secrète"
JWT_REFRESH_EXPIRES_IN="7d"

# Application
NODE_ENV="development"
PORT=3000
API_PREFIX="api/v1"

# CORS
CORS_ORIGIN="http://localhost:5173"

# Upload de fichiers
MAX_FILE_SIZE=10485760  # 10 MB
UPLOAD_PATH="./uploads"

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

## 🏗️ Architecture du Projet

### Structure des Dossiers

```
myaccountyRT/
├── apps/
│   └── backend/                    # Application NestJS
│       ├── prisma/
│       │   ├── schema.prisma       # Schéma Prisma
│       │   └── seed.ts             # Script de seed
│       └── src/
│           ├── core/               # Modules Core
│           │   ├── auth/           # Authentification (JWT, guards)
│           │   ├── users/          # Gestion utilisateurs
│           │   ├── organizations/  # Gestion organisations
│           │   ├── customers/      # Clients et contacts
│           │   ├── products/       # Produits et services
│           │   ├── taxes/          # Configuration TVA
│           │   ├── settings/       # Paramètres et numérotation
│           │   ├── audit/          # Logs d'audit
│           │   ├── files/          # Gestion fichiers
│           │   └── prisma/         # Service Prisma
│           ├── modules/            # Modules Métier
│           │   ├── quotes/         # Devis (vente/location)
│           │   ├── vehicles/       # Gestion véhicules
│           │   ├── delivery/       # Livraisons
│           │   ├── invoices/       # Facturation
│           │   └── expenses/       # Dépenses
│           ├── app.module.ts       # Module principal
│           └── main.ts             # Point d'entrée
├── docker-compose.yml              # Services Docker
├── turbo.json                      # Configuration Turborepo
├── package.json                    # Dependencies
└── README.md                       # Documentation
```

### Technologies Utilisées

**Backend:**
- **NestJS** - Framework Node.js
- **Prisma** - ORM pour PostgreSQL
- **JWT** - Authentification
- **Passport** - Stratégies d'authentification
- **Bcrypt** - Hash des mots de passe
- **Swagger** - Documentation API
- **Helmet** - Sécurité HTTP
- **Multer** - Upload de fichiers

## 📚 Modules Implémentés

### ✅ Modules Core (Sprint 1)

#### 1. Authentication (`core/auth`)
- Login avec email/password
- JWT (access token + refresh token)
- Changement de mot de passe
- Guards et decorators

**Endpoints:**
```
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/change-password
```

#### 2. Users (`core/users`)
- CRUD utilisateurs
- Gestion des rôles (ADMIN, COMMERCIAL, ACCOUNTING, READ_ONLY)
- Activation/désactivation

**Endpoints:**
```
GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id
```

#### 3. Organizations (`core/organizations`)
- CRUD organisations
- Configuration modules activés
- Informations légales (TVA, IBAN)

**Endpoints:**
```
GET    /api/v1/organizations
POST   /api/v1/organizations
GET    /api/v1/organizations/:id
PATCH  /api/v1/organizations/:id
DELETE /api/v1/organizations/:id
```

#### 4. Customers (`core/customers`)
- CRUD clients (B2B/B2C)
- Gestion adresses (facturation/livraison)
- Gestion contacts

**Endpoints:**
```
GET    /api/v1/customers
POST   /api/v1/customers
GET    /api/v1/customers/:id
PATCH  /api/v1/customers/:id
DELETE /api/v1/customers/:id
POST   /api/v1/customers/:id/addresses
DELETE /api/v1/customers/:id/addresses/:addressId
POST   /api/v1/customers/:id/contacts
DELETE /api/v1/customers/:id/contacts/:contactId
```

#### 5. Products (`core/products`)
- CRUD produits et services
- Gestion prix et TVA
- SKU et unités

**Endpoints:**
```
GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/:id
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id
```

#### 6. Taxes (`core/taxes`)
- CRUD taxes
- Taux par défaut
- Validation avant suppression

**Endpoints:**
```
GET    /api/v1/taxes
POST   /api/v1/taxes
GET    /api/v1/taxes/:id
PATCH  /api/v1/taxes/:id
DELETE /api/v1/taxes/:id
```

#### 7. Settings (`core/settings`)
- Numérotation documents (devis, factures)
- Configuration par type de document

**Endpoints:**
```
GET    /api/v1/settings/numbering
GET    /api/v1/settings/numbering/:type
PATCH  /api/v1/settings/numbering/:type
```

#### 8. Audit (`core/audit`)
- Logs d'audit (lecture seule)
- Filtrage par entité, utilisateur, action
- Pagination

**Endpoints:**
```
GET    /api/v1/audit
GET    /api/v1/audit/entity/:entity/:entityId
GET    /api/v1/audit/user/:userId
```

#### 9. Files (`core/files`)
- Upload fichiers (simple/multiple)
- Téléchargement
- Suppression

**Endpoints:**
```
POST   /api/v1/files/upload         (single file)
POST   /api/v1/files/upload/multiple (multiple files)
GET    /api/v1/files/download/:filename
DELETE /api/v1/files/:filename
```

---

### ✅ Modules Métier (Sprints 2-5)

#### 1. Quotes (`modules/quotes`)
- CRUD devis (vente/location)
- Gestion lignes avec calculs automatiques
- Changement de statut avec validation
- Duplication de devis

**Endpoints:**
```
GET    /api/v1/quotes
POST   /api/v1/quotes
GET    /api/v1/quotes/:id
PATCH  /api/v1/quotes/:id
DELETE /api/v1/quotes/:id
POST   /api/v1/quotes/:id/lines
PATCH  /api/v1/quotes/:id/lines/:lineId
DELETE /api/v1/quotes/:id/lines/:lineId
POST   /api/v1/quotes/:id/duplicate
PATCH  /api/v1/quotes/:id/status
```

**Calculs:**
- Ligne: `subtotal = qty × price × (1 - discount/100)`
- Ligne: `taxAmount = subtotal × taxRate/100`
- Ligne: `total = subtotal + taxAmount`
- Document: somme de toutes les lignes

#### 2. Vehicles (`modules/vehicles`)
- CRUD véhicules
- Upload documents (carte grise, assurance)
- Vérification disponibilité

**Endpoints:**
```
GET    /api/v1/vehicles
POST   /api/v1/vehicles
GET    /api/v1/vehicles/:id
PATCH  /api/v1/vehicles/:id
DELETE /api/v1/vehicles/:id
POST   /api/v1/vehicles/:id/documents (upload)
DELETE /api/v1/vehicles/:id/documents/:documentId
GET    /api/v1/vehicles/:id/availability?startDate=&endDate=
```

#### 3. Delivery (`modules/delivery`)
- Création/modification livraison
- Calcul coût de livraison
- Lié à un devis (1-to-1)

**Endpoints:**
```
POST   /api/v1/delivery
GET    /api/v1/delivery/quote/:quoteId
PATCH  /api/v1/delivery/quote/:quoteId
DELETE /api/v1/delivery/quote/:quoteId
```

**Calcul:**
- `cost = fixedPrice + (distance × pricePerKm) × (hasReturn ? 2 : 1)`

#### 4. Invoices (`modules/invoices`)
- CRUD factures
- Création depuis devis accepté
- Gestion paiements
- Mise à jour automatique du statut

**Endpoints:**
```
GET    /api/v1/invoices
POST   /api/v1/invoices
GET    /api/v1/invoices/:id
PATCH  /api/v1/invoices/:id
DELETE /api/v1/invoices/:id
POST   /api/v1/invoices/from-quote/:quoteId
POST   /api/v1/invoices/:id/payments
DELETE /api/v1/invoices/:id/payments/:paymentId
```

**Statuts:**
- `PAID`: paidAmount >= total
- `PARTIAL`: 0 < paidAmount < total
- `SENT`: facture envoyée

#### 5. Expenses (`modules/expenses`)
- CRUD dépenses
- Upload justificatifs
- Workflow d'approbation
- Gestion catégories

**Endpoints:**
```
GET    /api/v1/expenses
POST   /api/v1/expenses
GET    /api/v1/expenses/:id
PATCH  /api/v1/expenses/:id
DELETE /api/v1/expenses/:id
POST   /api/v1/expenses/:id/attachments (upload)
DELETE /api/v1/expenses/:id/attachments/:attachmentId
PATCH  /api/v1/expenses/:id/status
GET    /api/v1/expenses/categories/all
POST   /api/v1/expenses/categories
PATCH  /api/v1/expenses/categories/:id
```

**Calcul TVA:**
- Si TTC fourni: `HT = TTC / (1 + taxRate/100)`
- `taxAmount = HT × taxRate/100`

## 🔐 Authentification et Sécurité

### Obtenir un Token JWT

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@democompany.be",
    "password": "admin123"
  }'
```

**Réponse:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@democompany.be",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN",
    "organizationId": "uuid"
  }
}
```

### Utiliser le Token

```bash
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Rôles et Permissions

| Rôle | Permissions |
|------|------------|
| **ADMIN** | Tous les accès (users, settings, modules, etc.) |
| **COMMERCIAL** | Devis, véhicules, livraisons, clients |
| **ACCOUNTING** | Factures, dépenses, exports, taxes |
| **READ_ONLY** | Consultation uniquement |

### Sécurité

- **Rate Limiting**: 100 requêtes/minute par IP
- **Helmet**: Protection headers HTTP
- **CORS**: Configuré pour frontend
- **JWT**: Token expiré après 15 minutes
- **Refresh Token**: 7 jours
- **Bcrypt**: Hash mots de passe (10 rounds)
- **Multi-tenant**: Isolation stricte par `organizationId`

## 🚀 Utilisation de l'API

### Exemples de Requêtes

#### 1. Créer un Client

```bash
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "B2B",
    "companyName": "Tech Solutions",
    "vatNumber": "BE0111222333",
    "email": "contact@techsolutions.be",
    "phone": "+32 2 111 22 33"
  }'
```

#### 2. Créer un Devis

```bash
curl -X POST http://localhost:3000/api/v1/quotes \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-uuid",
    "type": "SALE",
    "validUntil": "2026-02-28T23:59:59Z",
    "customerNotes": "Merci pour votre confiance"
  }'
```

#### 3. Ajouter une Ligne au Devis

```bash
curl -X POST http://localhost:3000/api/v1/quotes/quote-uuid/lines \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product-uuid",
    "description": "Service de déménagement",
    "quantity": 5,
    "unitPrice": 150,
    "discount": 0,
    "taxId": "tax-uuid"
  }'
```

#### 4. Convertir Devis en Facture

```bash
curl -X POST http://localhost:3000/api/v1/invoices/from-quote/quote-uuid \
  -H "Authorization: Bearer TOKEN"
```

#### 5. Upload de Fichier (Dépense)

```bash
curl -X POST http://localhost:3000/api/v1/expenses/expense-uuid/attachments \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@/path/to/receipt.pdf" \
  -F "name=Facture essence" \
  -F "type=receipt"
```

### Documentation Interactive

Accéder à Swagger UI pour tester interactivement:
- http://localhost:3000/api/docs

## 📝 Prochaines Étapes

### Phase Immédiate

1. **Frontend React** (apps/web/)
   - Setup Vite + React + TypeScript
   - Tailwind CSS + shadcn/ui
   - TanStack Query pour API calls
   - Routing et authentification
   - Pages principales (Dashboard, Clients, Devis, Factures, etc.)

2. **Génération PDF**
   - Service PDF avec Puppeteer
   - Templates pour devis et factures
   - Variables dynamiques
   - Branding personnalisé

3. **Exports CSV/XLSX**
   - Service d'export avec ExcelJS
   - Endpoints pour exporter listes
   - Filtres et colonnes personnalisables

4. **Tests**
   - Tests unitaires (Jest)
   - Tests d'intégration
   - Tests E2E (Supertest)

### Phase 2 (Post-MVP)

- **Emailing**: Envoi de devis/factures par email
- **OCR**: Lecture automatique des justificatifs
- **Calcul distance**: Intégration Google Maps API
- **Peppol/e-invoicing**: Facturation électronique
- **Signature électronique**: Signature de devis
- **Planning**: Calendrier de réservations
- **Notifications**: Alertes en temps réel
- **Marketplace**: Modules tiers

### Déploiement Production

1. **Infrastructure**
   - Serveur cloud (AWS, DigitalOcean, etc.)
   - PostgreSQL managé
   - Redis pour cache
   - S3 pour fichiers

2. **CI/CD**
   - GitHub Actions
   - Tests automatisés
   - Déploiement automatique

3. **Monitoring**
   - Sentry (erreurs)
   - Logs centralisés
   - Métriques de performance

## 🎯 État Actuel

### ✅ Complété

- [x] Architecture complète
- [x] Prisma schema (20+ modèles)
- [x] Tous les modules Core (8 modules)
- [x] Tous les modules Métier (5 modules)
- [x] Authentification JWT
- [x] RBAC (4 rôles)
- [x] Multi-tenant
- [x] Upload de fichiers
- [x] Audit logs
- [x] Seed data
- [x] Documentation API (Swagger)

### 🔄 En Cours

- [ ] Frontend React
- [ ] Génération PDF
- [ ] Exports CSV/XLSX

### ⏳ À Venir

- [ ] Tests complets
- [ ] Déploiement
- [ ] Features Phase 2

## 📖 Ressources Utiles

- **Prisma Studio**: `pnpm db:studio` - Interface graphique pour la DB
- **Swagger UI**: http://localhost:3000/api/docs - Documentation API interactive
- **Logs**: Le backend affiche les requêtes SQL en mode développement

## 🆘 Support

En cas de problème:

1. Vérifier les logs du serveur
2. Vérifier que PostgreSQL est bien démarré (`pnpm docker:up`)
3. Regénérer le client Prisma (`pnpm db:generate`)
4. Vérifier les variables d'environnement

---

**Développé avec ❤️ pour une gestion d'entreprise efficace**
