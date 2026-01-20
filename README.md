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
│   ├── backend/          # API NestJS
│   └── web/              # Frontend React (à créer)
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
# Installer les dépendances
pnpm install

# Démarrer les services Docker (PostgreSQL, Redis)
pnpm docker:up

# Générer le client Prisma
pnpm db:generate

# Créer la base de données
pnpm db:push

# Démarrer le backend en mode dev
pnpm dev
```

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

### ✅ Sprint 1 - Core (Complété)
- [x] Architecture et setup projet
- [x] Prisma schema complet
- [x] Module Authentication (JWT, guards, strategies)
- [ ] Modules: Organizations, Users, Customers, Products, Taxes
- [ ] Settings et Audit logs

### 🔄 Sprint 2 - Devis Vente (En cours)
- [ ] CRUD Devis de vente
- [ ] Lignes de devis avec calculs (HT, TVA, TTC)
- [ ] Génération PDF
- [ ] Exports CSV/XLSX

### Sprint 3 - Location & Véhicules
- [ ] Module Véhicules (CRUD, documents)
- [ ] Devis de location
- [ ] Gestion disponibilité véhicules

### Sprint 4 - Livraison & Facturation
- [ ] Module Livraison
- [ ] Conversion devis → facture
- [ ] Gestion paiements

### Sprint 5 - Dépenses & Finalisation
- [ ] Module Dépenses avec uploads
- [ ] Catégorisation et workflows
- [ ] Exports comptables
- [ ] Security hardening

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

**Version**: 1.0.0 (MVP en développement)

**Progression**:
- ✅ Architecture et setup
- ✅ Prisma schema complet
- ✅ Authentication system
- 🔄 Core modules en cours
- ⏳ Business modules à venir

---

Développé avec ❤️ pour une gestion d'entreprise efficace
