# MyAccount SaaS - Plateforme Multi-tenant

Plateforme SaaS modulaire multi-tenant pour la gestion de devis (vente/location), véhicules, livraisons, factures et dépenses.

## 🎯 Objectifs du Projet

- Plateforme multi-entreprises (multi-tenant) avec cloisonnement des données
- Architecture modulaire extensible (modules activables par client)
- Gestion complète de devis de vente et de location
- Gestion de parc de véhicules
- Module de livraison intégré aux devis
- Facturation avec conversion depuis devis
- Gestion des dépenses avec justificatifs

## 🏗️ Architecture

### Stack Technique

**Backend:**
- NestJS (Node.js + TypeScript)
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Swagger/OpenAPI

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- TanStack Query (React Query)
- Zustand

**Infrastructure:**
- Docker & Docker Compose
- Turborepo (monorepo)
- pnpm

### Structure du Projet

```
myaccount-saas/
├── apps/
│   ├── backend/          # API NestJS ✅
│   └── web/              # Frontend React ✅
├── packages/             # Packages partagés (à créer)
├── docker-compose.yml    # Services Docker
└── turbo.json           # Configuration Turborepo
```

## 📦 Modules

### Core (Socle)
- ✅ **Authentication** - JWT, 2FA, gestion sessions
- ✅ **Organizations** - Gestion organisations/entreprises
- ✅ **Users** - Utilisateurs et RBAC
- ✅ **Customers** - Clients et contacts
- ✅ **Products** - Produits et services
- ✅ **Taxes** - Configuration TVA
- ✅ **Settings** - Paramètres, numérotation, templates
- ✅ **Audit** - Logs d'audit
- ✅ **Files** - Gestion fichiers et uploads

### Modules Métier
- ✅ **Quotes** - Devis vente et location
- ✅ **Vehicles** - Gestion parc véhicules
- ✅ **Delivery** - Prestations de livraison
- ✅ **Invoices** - Facturation
- ✅ **Expenses** - Gestion dépenses

## 🚀 Démarrage Rapide

### Prérequis

- Node.js >= 18
- pnpm >= 8
- Docker & Docker Compose

### Installation

```bash
# Installer les dépendances pour tout le monorepo
pnpm install

# Démarrer les services Docker (PostgreSQL, Redis)
pnpm docker:up

# Générer le client Prisma
cd apps/backend
pnpm db:generate

# Créer la base de données
pnpm db:push

# Peupler avec des données de démonstration
pnpm db:seed

# Démarrer le backend en mode dev (terminal 1)
pnpm dev
```

### Démarrer le Frontend

Dans un nouveau terminal :

```bash
# Démarrer le frontend React (terminal 2)
cd apps/web
pnpm dev
```

L'application sera accessible à :
- **Backend API**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api/docs
- **Frontend**: http://localhost:3001

### Comptes de Démonstration

Utilisez ces comptes pour vous connecter au frontend :

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| admin@democompany.be | admin123 | Administrateur |
| commercial@democompany.be | admin123 | Commercial |
| accounting@democompany.be | admin123 | Comptable |

### Variables d'environnement

Copier `.env.example` vers `.env` dans `apps/backend/` et configurer:

```env
DATABASE_URL="postgresql://myaccount:myaccount_dev_pass@localhost:5432/myaccount_db"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=3000
```

## 📚 Documentation API

Une fois le backend démarré, la documentation Swagger est disponible à:
- http://localhost:3000/api/docs

## 🔐 Sécurité

- **Multi-tenancy**: Isolation stricte des données par `organizationId`
- **RBAC**: 4 rôles (Admin, Commercial, Compta, Lecture seule)
- **JWT**: Access token (15min) + Refresh token (7j)
- **Rate Limiting**: Protection anti-brute force
- **Audit Logs**: Traçabilité complète

### Rôles et Permissions

| Rôle | Permissions |
|------|------------|
| **ADMIN** | Tous les accès + gestion utilisateurs/modules |
| **COMMERCIAL** | Devis, véhicules, livraisons |
| **ACCOUNTING** | Factures, dépenses, exports |
| **READ_ONLY** | Consultation uniquement |

## 📊 Modèle de Données

### Entités Principales

**Core:**
- Organization, User, Role, Permission
- Customer, Contact, Address
- Product, Tax
- DocumentNumbering, AuditLog

**Métier:**
- Quote, QuoteLine, QuoteAttachment
- Vehicle, VehicleDocument
- Delivery
- Invoice, InvoiceLine, Payment
- Expense, ExpenseCategory, ExpenseAttachment

Voir le schéma complet dans `apps/backend/prisma/schema.prisma`

## 🗓️ Plan de Développement

### ✅ Sprint 1 - Core (100% Complété)
- [x] Architecture et setup projet (Turborepo + pnpm)
- [x] Prisma schema complet (20+ modèles)
- [x] Module Authentication (JWT, guards, strategies, refresh tokens)
- [x] Module Organizations (multi-tenant)
- [x] Module Users (RBAC avec 4 rôles)
- [x] Module Customers (B2B/B2C, adresses, contacts)
- [x] Module Products (produits et services)
- [x] Module Taxes (gestion TVA)
- [x] Module Settings (numérotation automatique)
- [x] Module Audit (logs de traçabilité)
- [x] Module Files (upload et gestion fichiers)

### ✅ Sprint 2 - Devis Vente (100% Complété)
- [x] CRUD Devis de vente et location
- [x] Lignes de devis avec calculs (HT, TVA, TTC)
- [x] Génération PDF professionnelle (Puppeteer)
- [x] Exports CSV/XLSX (ExcelJS avec styling)
- [x] Duplication de devis
- [x] Gestion statuts et workflow
- [x] Numérotation automatique (QV-XXXXX, QL-XXXXX)

### ✅ Sprint 3 - Location & Véhicules (100% Complété)
- [x] Module Véhicules (CRUD complet)
- [x] Gestion documents véhicules (carte grise, assurance, contrôle)
- [x] Devis de location avec période et kilométrage
- [x] Vérification disponibilité véhicules
- [x] Tracking maintenance et statuts

### ✅ Sprint 4 - Livraison & Facturation (100% Complété)
- [x] Module Livraison (intégré aux devis)
- [x] Calcul coûts de livraison (fixe + distance)
- [x] Support trajet retour
- [x] Conversion devis → facture automatique
- [x] Module Facturation complet
- [x] Gestion paiements multiples
- [x] Calcul automatique des statuts (PAID, PARTIAL)

### ✅ Sprint 5 - Dépenses & Finalisation (100% Complété)
- [x] Module Dépenses avec uploads multiples
- [x] Catégorisation personnalisable
- [x] Workflow d'approbation (DRAFT → SUBMITTED → APPROVED/REJECTED)
- [x] Calcul automatique TVA (TTC → HT)
- [x] Exports pour comptabilité
- [x] Security hardening (CORS, Helmet, Rate Limiting)

### ✅ Sprint 6 - Frontend React (80% Complété)

**Pages Implémentées:**
- [x] Page de Login avec authentification JWT
- [x] Dashboard avec statistiques et KPIs
- [x] Liste des devis avec filtres, recherche et exports
- [x] Détail d'un devis avec téléchargement PDF
- [x] Liste des clients avec recherche

**Features UI:**
- [x] Layout responsive avec Sidebar et Header
- [x] Navigation mobile (hamburger menu)
- [x] Protected routes avec redirection
- [x] Toast notifications (succès/erreur)
- [x] Loading states sur toutes les pages
- [x] Status badges avec couleurs
- [x] Format français (dates, devises)
- [x] Boutons d'export CSV/XLSX
- [x] Téléchargement PDF des devis

**État Technique:**
- [x] React 18 + TypeScript
- [x] Vite pour build ultra-rapide
- [x] Tailwind CSS + shadcn/ui
- [x] React Query pour data fetching
- [x] Zustand pour state management
- [x] Axios avec JWT interceptors
- [x] Auto-refresh des tokens JWT

**À Faire:**
- [ ] Formulaires création/édition devis
- [ ] Formulaires création/édition clients
- [ ] Pages Véhicules, Factures, Dépenses
- [ ] Pagination des listes
- [ ] Filtres avancés
- [ ] Dark mode

## 🧪 Tests

```bash
# Tests unitaires
pnpm test

# Tests e2e
pnpm test:e2e

# Coverage
pnpm test:cov
```

## 📝 Scripts Disponibles

```bash
pnpm dev              # Démarrer en mode développement
pnpm build            # Build pour production
pnpm lint             # Linter le code
pnpm format           # Formatter avec Prettier

# Database
pnpm db:generate      # Générer client Prisma
pnpm db:push          # Push schema vers DB (dev)
pnpm db:migrate       # Créer migration
pnpm db:studio        # Ouvrir Prisma Studio

# Docker
pnpm docker:up        # Démarrer services
pnpm docker:down      # Arrêter services
```

## 🎨 Frontend (À venir)

Le frontend React sera développé dans `apps/web/` avec:
- Interface responsive
- Dashboard avec KPIs
- Gestion complète des modules
- Génération et prévisualisation PDF
- Upload de fichiers drag & drop

## 🔧 Configuration Prisma

Le schéma Prisma inclut:
- 20+ modèles de données
- Relations complexes entre entités
- Enums pour types et statuts
- Index optimisés pour performance
- Support multi-tenant natif

## 📖 Ressources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)

## 🤝 Contribution

Ce projet suit les conventions:
- Commits conventionnels (feat, fix, docs, refactor)
- Branches: feature/, bugfix/, hotfix/
- TypeScript strict mode
- ESLint + Prettier

## 📄 Licence

Propriétaire - Tous droits réservés

## 🏁 État du Projet

**Version**: 1.0.0 (MVP Backend + Frontend Complété ✅)

**Progression Backend**:
- ✅ Architecture et setup (100%)
- ✅ Prisma schema complet (20+ modèles)
- ✅ Authentication system (JWT + Refresh tokens)
- ✅ Core modules (9 modules - 100%)
- ✅ Business modules (5 modules - 100%)
- ✅ PDF Generation (Puppeteer)
- ✅ Exports CSV/XLSX (ExcelJS)
- ✅ 85+ endpoints API REST
- ✅ Documentation Swagger complète
- ✅ Multi-tenant + RBAC + Audit

**Progression Frontend**:
- ✅ Setup Vite + React + TypeScript
- ✅ Routing avec React Router
- ✅ Authentication (Login, JWT, Protected Routes)
- ✅ Layout responsive (Sidebar, Header)
- ✅ Dashboard avec statistiques
- ✅ Module Devis (liste, détail, exports, PDF)
- ✅ Module Clients (liste, recherche)
- ✅ React Query pour data fetching
- ✅ Zustand pour state management
- ✅ shadcn/ui components
- ✅ Toast notifications
- ✅ Loading states & error handling

**Backend MVP: 100% ✅**
**Frontend MVP: 80% ✅**

**Prochaines Étapes**:
- ⏳ Formulaires création/édition (Devis, Clients)
- ⏳ Modules Véhicules, Factures, Dépenses (Frontend)
- ⏳ Tests unitaires et E2E
- ⏳ CI/CD Pipeline
- ⏳ Déploiement production

---

Développé avec ❤️ pour une gestion d'entreprise efficace
