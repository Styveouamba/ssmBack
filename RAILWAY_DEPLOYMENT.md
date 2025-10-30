# Déploiement sur Railway

Railway est parfait pour votre app avec Socket.io car il supporte les applications traditionnelles.

## 🚀 Déploiement rapide

### 1. Via GitHub (Recommandé)

1. **Pushez votre code sur GitHub**
2. **Allez sur [railway.app](https://railway.app)**
3. **Connectez-vous avec GitHub**
4. **Cliquez sur "New Project" → "Deploy from GitHub repo"**
5. **Sélectionnez votre repository**

### 2. Via Railway CLI

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter
railway login

# Initialiser le projet
railway init

# Déployer
railway up
```

## ⚙️ Configuration

### Variables d'environnement (Railway Dashboard)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

### Configuration automatique

Railway détecte automatiquement :
- `package.json` pour les dépendances
- `railway.json` pour la configuration
- Script de démarrage : `npm run start:railway`

## 🔧 Fonctionnalités supportées

✅ **Socket.io** - Fonctionne parfaitement  
✅ **WebSockets** - Support complet  
✅ **Base de données MongoDB** - Connexion persistante  
✅ **Variables d'environnement** - Interface simple  
✅ **Logs en temps réel** - Dashboard intégré  
✅ **Domaine personnalisé** - Gratuit  
✅ **SSL automatique** - Inclus  

## 💰 Tarification

- **Hobby Plan** : $5/mois avec $5 de crédit inclus
- **Usage-based** : Payez seulement ce que vous utilisez
- **Pas de limite de temps** : Contrairement à Heroku

## 🌐 URLs après déploiement

Votre app sera disponible à :
- `https://votre-app-name.up.railway.app`
- API endpoints : `/api/auth/*`, `/api/technicians/position/*`
- Socket.io : `wss://votre-app-name.up.railway.app`

## 🔍 Test de santé

Après déploiement, testez :
```bash
curl https://votre-app-name.up.railway.app/api/health
```