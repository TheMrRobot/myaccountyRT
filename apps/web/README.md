# MyAccount Frontend - React Application

Interface utilisateur moderne et responsive pour la plateforme MyAccount.

## 🚀 Technologies

- **React 18** - Library UI
- **TypeScript** - Type safety
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Styling utility-first
- **shadcn/ui** - Composants UI modernes
- **React Router** - Navigation
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **React Hook Form** - Gestion des formulaires
- **Zod** - Validation de schémas
- **Axios** - HTTP client
- **Lucide React** - Icônes
- **Sonner** - Toast notifications

## 📦 Installation

```bash
# Installer les dépendances
pnpm install

# Démarrer le serveur de développement
cd apps/web
pnpm dev
```

L'application sera accessible à http://localhost:3001

## 🔧 Configuration

### Proxy API

Le fichier `vite.config.ts` configure un proxy vers le backend :

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  },
}
```

Cela permet d'appeler l'API backend sans problèmes CORS en développement.

### Variables d'environnement

Créez un fichier `.env` si nécessaire :

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## 📁 Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI de base (shadcn/ui)
│   ├── Layout.tsx      # Layout principal avec sidebar
│   └── ProtectedRoute.tsx
├── pages/              # Pages de l'application
│   ├── auth/           # Pages d'authentification
│   ├── dashboard/      # Page dashboard
│   ├── quotes/         # Pages des devis
│   └── customers/      # Pages des clients
├── services/           # Services API
│   ├── auth.service.ts
│   ├── quote.service.ts
│   └── customer.service.ts
├── store/              # State management (Zustand)
│   └── auth.store.ts
├── types/              # Types TypeScript
│   └── index.ts
├── lib/                # Utilitaires
│   ├── axios.ts        # Instance Axios configurée
│   └── utils.ts        # Fonctions utilitaires
├── styles/             # Styles globaux
│   └── globals.css
├── App.tsx             # Composant racine avec routes
└── main.tsx            # Point d'entrée
```

## 🎨 Features Implémentées

### Authentication
- ✅ Page de login avec formulaires
- ✅ JWT token management avec auto-refresh
- ✅ Protected routes
- ✅ Déconnexion

### Dashboard
- ✅ Statistiques (devis, chiffre d'affaires)
- ✅ Devis récents
- ✅ Navigation rapide

### Devis (Quotes)
- ✅ Liste avec filtres et recherche
- ✅ Vue détaillée d'un devis
- ✅ Téléchargement PDF
- ✅ Export CSV/XLSX
- ✅ Duplication de devis
- ✅ Badges de statut
- ✅ **Formulaire de création** (React Hook Form + Zod)
- ✅ **Support vente et location** avec champs conditionnels
- ✅ Sélection client depuis la base
- ✅ Dates et paramètres de location

### Clients (Customers)
- ✅ Liste avec recherche
- ✅ Vue en grille
- ✅ Distinction B2B/B2C
- ✅ **Formulaire de création** avec modal
- ✅ **Formulaire d'édition** avec modal
- ✅ **Suppression** avec confirmation
- ✅ Validation Zod (email, champs requis)
- ✅ Champs dynamiques (B2B vs B2C)

### UI/UX
- ✅ Design responsive (mobile-friendly)
- ✅ Sidebar avec navigation
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling
- ✅ Format français (dates, devises)

## 🔐 Authentification

Comptes de démonstration disponibles :

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| admin@democompany.be | admin123 | Admin |
| commercial@democompany.be | admin123 | Commercial |
| accounting@democompany.be | admin123 | Comptable |

## 🛠️ Scripts Disponibles

```bash
# Développement
pnpm dev              # Démarrer en mode développement (port 3001)

# Build
pnpm build            # Build pour production

# Preview
pnpm preview          # Preview du build de production

# Linting
pnpm lint             # Linter le code
```

## 🌐 API Integration

Tous les appels API passent par le service axios configuré dans `lib/axios.ts` :

- ✅ Auto-ajout du JWT token dans les headers
- ✅ Refresh automatique du token sur 401
- ✅ Gestion des erreurs centralisée
- ✅ Redirection vers /login si authentification échoue

### Exemple d'utilisation

```typescript
import { quoteService } from '@/services/quote.service';

// Dans un composant
const { data: quotes } = useQuery({
  queryKey: ['quotes'],
  queryFn: () => quoteService.getAll(),
});
```

## 🎯 Prochaines Étapes

### Formulaires ✅ COMPLÉTÉ
- [x] Formulaire création/édition de devis
- [x] Formulaire création/édition de client
- [ ] Gestion des lignes de devis (inline editing)

### Modules Additionnels
- [ ] Module Véhicules (liste, CRUD, formulaires)
- [ ] Module Factures (liste, vue détail, création depuis devis)
- [ ] Module Dépenses (liste, workflow approbation, upload justificatifs)

### Améliorations
- [ ] Pagination sur les listes
- [ ] Tri des colonnes
- [ ] Filtres avancés (dates, montants)
- [ ] Dark mode
- [ ] Prévisualisation PDF inline
- [ ] Upload de fichiers (drag & drop)
- [ ] Gestion des lignes de devis dans la page de détail

### Tests
- [ ] Tests unitaires (Vitest)
- [ ] Tests composants (React Testing Library)
- [ ] Tests E2E (Playwright)

## 📚 Documentation Composants

### Composants UI (shadcn/ui)

Les composants de base sont dans `components/ui/` :

- **Button** : Bouton avec variantes (default, destructive, outline, etc.)
- **Input** : Champ de saisie
- **Card** : Conteneur avec header, content, footer
- **Badge** : Badge de statut

### Services API

Tous les services retournent des Promises et gèrent automatiquement :
- Les headers JWT
- Les erreurs HTTP
- Le refresh du token

### React Query

Configuration dans `main.tsx` :
- `refetchOnWindowFocus`: false
- `retry`: 1
- `staleTime`: 5 minutes

## 🐛 Debug

### Backend non accessible

Vérifiez que le backend tourne sur le port 3000 :
```bash
cd apps/backend
pnpm dev
```

### Erreurs CORS

Le proxy Vite devrait gérer les CORS. Si problème, vérifiez `vite.config.ts`.

### Token expiré

Le refresh automatique devrait gérer l'expiration. Si problème, déconnectez-vous et reconnectez-vous.

## 📖 Ressources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TanStack Query](https://tanstack.com/query)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

Développé avec ❤️ pour une expérience utilisateur moderne
