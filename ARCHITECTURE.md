# Architecture Technique - Plateforme SaaS Multi-tenant

## Vue d'ensemble

Plateforme SaaS modulaire multi-tenant pour la gestion de devis, véhicules, livraisons, factures et dépenses.

## Stack Technique

### Backend
- **Framework**: NestJS (Node.js + TypeScript)
- **ORM**: Prisma
- **Base de données**: PostgreSQL
- **Authentification**: JWT + bcrypt
- **Validation**: class-validator, class-transformer
- **PDF**: Puppeteer
- **Fichiers**: Multer + stockage local (S3-compatible en production)
- **Exports**: ExcelJS

### Frontend
- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Routing**: React Router v6
- **Data Fetching**: TanStack Query (React Query)
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Tables**: TanStack Table

### Infrastructure
- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Containerization**: Docker + Docker Compose
- **Linting**: ESLint + Prettier

## Architecture Modulaire

### Principe
Chaque module est un module NestJS autonome qui peut être activé/désactivé par organisation.

### Modules Core (Sprint 1)
```
core/
├── auth/          # Authentification, sessions, 2FA
├── organizations/ # Gestion organisations
├── users/         # Utilisateurs et rôles
├── rbac/          # Permissions et contrôle d'accès
├── customers/     # Clients et contacts
├── products/      # Produits et services
├── taxes/         # Configuration TVA
├── settings/      # Paramètres généraux, numérotation
├── audit/         # Logs d'audit
└── files/         # Gestion fichiers
```

### Modules Métier (Sprints 2-5)
```
modules/
├── quotes/        # Devis vente et location (Sprint 2-3)
├── vehicles/      # Gestion véhicules (Sprint 3)
├── delivery/      # Livraisons (Sprint 4)
├── invoicing/     # Facturation (Sprint 4)
└── expenses/      # Dépenses (Sprint 5)
```

## Modèle de Données

### Multi-tenancy
- Toutes les entités métier incluent `organizationId`
- Isolation stricte au niveau application (Row Level Security)
- Index sur `organizationId` pour performance

### Entités Principales

#### Core
- `Organization`: Entreprise cliente
- `User`: Utilisateurs (lié à Organization)
- `Role`: Rôles (Admin, Commercial, Compta, Lecture)
- `Permission`: Permissions granulaires
- `Customer`: Clients (B2B/B2C)
- `Contact`: Contacts clients
- `Address`: Adresses (facturation/livraison)
- `Product`: Produits/Services
- `Tax`: Configuration TVA
- `DocumentNumbering`: Numérotation documents
- `AuditLog`: Traçabilité

#### Quotes (Devis)
- `Quote`: Devis (type: SALE/RENTAL)
- `QuoteLine`: Lignes de devis
- `QuoteAttachment`: Pièces jointes

#### Vehicles
- `Vehicle`: Véhicules
- `VehicleDocument`: Documents (carte grise, assurance)
- `VehicleAvailability`: Disponibilité

#### Delivery
- `Delivery`: Livraison (lié à Quote)

#### Invoicing
- `Invoice`: Facture
- `InvoiceLine`: Lignes facture
- `Payment`: Paiements

#### Expenses
- `Expense`: Dépense
- `ExpenseCategory`: Catégories
- `ExpenseAttachment`: Justificatifs

## Sécurité

### Multi-tenant Isolation
- Middleware global vérifiant `organizationId`
- Guards NestJS pour RBAC
- Validation stricte des requêtes

### Authentification
- JWT (access token 15min + refresh token 7j)
- Bcrypt pour hash des mots de passe
- 2FA optionnel (TOTP)
- Rate limiting (anti-brute force)

### RBAC
```typescript
Permissions:
- quotes.read/write/delete/export
- invoices.read/write/validate/send
- vehicles.read/write
- expenses.read/write/approve
- settings.manage
- users.manage
- modules.manage
```

### Audit
- Log toutes opérations sensibles
- Rétention configurable
- Export possible

## Performance

### Base de données
- Index sur: `organizationId`, dates, statuts, numéros documents
- Connexion pool optimisé
- Requêtes optimisées (eager/lazy loading)

### API
- Pagination par défaut
- Filtres et recherche optimisés
- Cache stratégique (Redis phase 2)

### PDF Generation
- Jobs asynchrones via Bull (phase 2)
- Templating avec variables

## Exports

### Formats
- PDF: Devis, Factures
- CSV/XLSX: Listes (devis, factures, dépenses)

### Structure
```typescript
export interface ExportConfig {
  format: 'csv' | 'xlsx' | 'pdf';
  filters?: FilterDto;
  columns?: string[];
}
```

## API REST

### Structure
```
/api/v1/
├── auth/
├── organizations/
├── users/
├── customers/
├── products/
├── quotes/
├── vehicles/
├── invoices/
├── expenses/
└── settings/
```

### Standards
- RESTful conventions
- OpenAPI/Swagger documentation
- Versioning API (v1, v2...)
- Error handling standardisé

## Frontend Architecture

### Structure
```
apps/web/
├── src/
│   ├── components/      # Composants réutilisables
│   │   ├── ui/         # shadcn/ui components
│   │   ├── forms/      # Formulaires
│   │   └── layout/     # Layout components
│   ├── features/       # Features par module
│   │   ├── auth/
│   │   ├── quotes/
│   │   ├── vehicles/
│   │   ├── invoices/
│   │   └── expenses/
│   ├── lib/            # Utilitaires
│   ├── hooks/          # Custom hooks
│   ├── stores/         # Zustand stores
│   └── api/            # API client
```

### Routing
```typescript
/login
/dashboard
/customers
/products
/quotes
  /quotes/new
  /quotes/:id
/vehicles
/invoices
/expenses
/settings
```

## Déploiement

### Environnements
- Development (local Docker)
- Staging (pré-production)
- Production

### CI/CD (Phase 2)
- Tests automatisés
- Build et déploiement automatiques
- Migrations DB automatiques

## Prochaines Phases

### Phase 2 (Post-MVP)
- Emailing intégré (SendGrid/Postmark)
- Calcul distance (Google Maps API)
- OCR justificatifs (Tesseract)
- Peppol/e-invoicing
- Marketplace de modules
- Cache Redis
- Jobs asynchrones (Bull)
- Monitoring (Sentry, DataDog)

### Modules Additionnels Futurs
- Stock et achats
- CRM avancé
- Comptabilité complète
- Paie
- Signature électronique
- Planification/planning

## Conventions de Code

### TypeScript
- Strict mode activé
- Pas de `any` (utiliser `unknown`)
- Interfaces pour DTOs
- Types pour domain models

### Naming
- camelCase: variables, fonctions
- PascalCase: classes, interfaces, types
- UPPER_CASE: constantes, enums
- kebab-case: fichiers

### Git
- Commits conventionnels (feat, fix, docs, refactor, test)
- Branches: feature/, bugfix/, hotfix/
- Pull requests obligatoires

## Tests (Phase 2)

### Backend
- Unit tests (Jest)
- Integration tests
- E2E tests (Supertest)

### Frontend
- Unit tests (Vitest)
- Component tests (Testing Library)
- E2E tests (Playwright)
