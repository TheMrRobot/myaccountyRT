# 🚀 Guide de Démarrage Rapide - MyAccount SaaS

## 🩺 Diagnostic des Problèmes

**Si vous rencontrez des erreurs de connexion à la base de données**, lancez d'abord le script de diagnostic :

### Windows (PowerShell)
```powershell
.\diagnose.ps1
```

Ce script va :
- ✅ Vérifier que Docker Desktop est installé et démarré
- ✅ Vérifier que les conteneurs tournent
- ✅ Vérifier que PostgreSQL est prêt
- ✅ Démarrer automatiquement les conteneurs si nécessaire
- ✅ Afficher les logs en cas de problème

## ⚡ Démarrage Automatique (Recommandé)

### Windows (PowerShell)
```powershell
.\start-dev.ps1
```

### Linux/Mac
```bash
./start-dev.sh
```

Ces scripts vont automatiquement :
1. ✅ Vérifier que Docker est lancé
2. ✅ Démarrer PostgreSQL et Redis
3. ✅ Créer le fichier .env si nécessaire
4. ✅ Générer le client Prisma
5. ✅ Créer le schéma de base de données
6. ✅ Peupler avec des données de démo

## 📋 Prérequis

- **Node.js** >= 18
- **pnpm** >= 8
- **Docker Desktop** (avec Docker Compose)

### Installer pnpm
```bash
npm install -g pnpm
```

### Installer Docker Desktop
- **Windows/Mac**: https://www.docker.com/products/docker-desktop
- **Linux**: Installer Docker Engine + Docker Compose

**⚠️ IMPORTANT pour Windows** : Après l'installation de Docker Desktop :
1. Lancez Docker Desktop depuis le menu Démarrer
2. Attendez que l'icône Docker dans la barre des tâches indique "Docker Desktop is running"
3. Cela peut prendre 1-2 minutes au premier démarrage

## 🔧 Démarrage Manuel

Si vous préférez démarrer manuellement :

### 1. Installer les dépendances
```bash
pnpm install
```

### 2. Démarrer Docker
```bash
docker-compose up -d
```

### 3. Créer le fichier .env
Copiez `.env.example` vers `.env` dans `apps/backend/` :
```bash
# Windows
copy apps\backend\.env.example apps\backend\.env

# Linux/Mac
cp apps/backend/.env.example apps/backend/.env
```

### 4. Setup la base de données
```bash
cd apps/backend
pnpm db:generate  # Générer le client Prisma
pnpm db:push      # Créer les tables
pnpm db:seed      # Peupler avec des données de démo
```

### 5. Démarrer les applications

**Terminal 1 - Backend:**
```bash
cd apps/backend
pnpm dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
pnpm dev
```

## 🌐 URLs d'Accès

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api/v1
- **Swagger Docs**: http://localhost:3000/api/docs

## 🔐 Comptes de Démonstration

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| admin@democompany.be | admin123 | Administrateur |
| commercial@democompany.be | admin123 | Commercial |
| accounting@democompany.be | admin123 | Comptable |

## ❌ Résolution de Problèmes

### Erreur: "Authentication failed against database server"

**Cause**: Docker n'est pas lancé, le fichier `.env` n'existe pas, ou PostgreSQL n'est pas prêt.

**Solution rapide**:
```powershell
# 1. LANCER LE DIAGNOSTIC
.\diagnose.ps1

# Ce script va identifier et résoudre automatiquement la plupart des problèmes
```

**Solution manuelle**:
```bash
# 1. Vérifier que Docker Desktop est lancé (icône dans la barre des tâches)

# 2. Vérifier que Docker fonctionne
docker --version
docker info

# 3. Vérifier que PostgreSQL tourne
docker ps | grep postgres

# 4. Si PostgreSQL n'est pas là, le démarrer
docker-compose up -d

# 5. Attendre 15-20 secondes (important!)
timeout /t 15  # Windows
# ou
sleep 15       # Linux/Mac

# 6. Vérifier les logs PostgreSQL
docker logs myaccount-postgres

# 7. Réessayer
cd apps\backend
pnpm db:push
```

### Erreur: "docker: command not found"

**Cause**: Docker Desktop n'est pas installé ou n'est pas dans le PATH.

**Solution**:
1. **Installer Docker Desktop**: https://www.docker.com/products/docker-desktop
2. **Redémarrer votre terminal** après l'installation
3. **Lancer Docker Desktop** depuis le menu Démarrer (Windows) ou Applications (Mac)
4. **Attendre** que Docker Desktop soit complètement démarré (icône verte dans la barre des tâches)
5. **Vérifier**: Ouvrez un NOUVEAU terminal PowerShell et tapez `docker --version`

### Erreur: "Cannot connect to the Docker daemon"

**Cause**: Docker Desktop n'est pas lancé.

**Solution**: Lancez Docker Desktop et attendez qu'il soit complètement démarré.

### Port 5432 déjà utilisé

**Cause**: Un autre PostgreSQL tourne déjà sur le port 5432.

**Solution**:
```bash
# Option 1: Arrêter l'autre PostgreSQL
# Windows: Arrêter le service PostgreSQL depuis les Services
# Linux/Mac: sudo systemctl stop postgresql

# Option 2: Changer le port dans docker-compose.yml
# Modifier la ligne:
#   ports:
#     - '5433:5432'  # Au lieu de 5432:5432
# Et mettre à jour le .env:
#   DATABASE_URL="postgresql://myaccount:myaccount_dev_pass@localhost:5433/myaccount_db?schema=public"
```

### Erreur: "pnpm: command not found"

**Cause**: pnpm n'est pas installé.

**Solution**:
```bash
npm install -g pnpm
```

### Les dépendances ne s'installent pas

**Solution**:
```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules apps/*/node_modules
pnpm install
```

### Prisma client pas à jour

**Solution**:
```bash
cd apps/backend
pnpm db:generate
```

## 🧹 Nettoyage

Pour tout réinitialiser :

```bash
# Arrêter et supprimer les conteneurs Docker
docker-compose down -v

# Supprimer node_modules
rm -rf node_modules apps/*/node_modules

# Réinstaller
pnpm install

# Refaire le setup
./start-dev.sh  # ou start-dev.ps1 sur Windows
```

## 📝 Variables d'Environnement

Le fichier `apps/backend/.env` contient :

```env
# Base de données
DATABASE_URL="postgresql://myaccount:myaccount_dev_pass@localhost:5432/myaccount_db?schema=public"

# JWT (à changer en production !)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"

# App
PORT=3000
NODE_ENV="development"

# CORS (ajuster selon le port du frontend)
CORS_ORIGIN="http://localhost:3001"
```

## 🐳 Commandes Docker Utiles

```bash
# Voir les conteneurs qui tournent
docker ps

# Voir les logs PostgreSQL
docker logs myaccount-postgres

# Voir les logs Redis
docker logs myaccount-redis

# Redémarrer PostgreSQL
docker restart myaccount-postgres

# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ perte de données)
docker-compose down -v

# Voir l'utilisation des ressources
docker stats
```

## 📚 Prochaines Étapes

Une fois l'application lancée :

1. **Se connecter** : http://localhost:3001/login
2. **Utiliser un compte de démo** : admin@democompany.be / admin123
3. **Explorer le Dashboard**
4. **Créer un client** : Menu Clients > Nouveau client
5. **Créer un devis** : Menu Devis > Nouveau devis
6. **Télécharger un PDF** : Ouvrir un devis > Télécharger PDF
7. **Exporter en Excel** : Liste des devis > Export XLSX

## 🆘 Besoin d'Aide ?

Si vous rencontrez toujours des problèmes :

1. Vérifiez les logs Docker : `docker logs myaccount-postgres`
2. Vérifiez que le port 5432 est libre : `netstat -an | findstr 5432` (Windows) ou `lsof -i :5432` (Linux/Mac)
3. Redémarrez Docker Desktop complètement
4. Vérifiez que le fichier `.env` existe bien dans `apps/backend/`
5. Essayez de réinstaller les dépendances : `pnpm install`

---

**Bon développement ! 🚀**
