# Déploiement sur Render

Render est une excellente alternative à Heroku avec support complet de Socket.io.

## 🚀 Déploiement

### 1. Via Dashboard Render

1. **Allez sur [render.com](https://render.com)**
2. **Connectez-vous avec GitHub**
3. **Cliquez sur "New +" → "Web Service"**
4. **Connectez votre repository GitHub**
5. **Configurez le service :**

```
Name: votre-app-name
Environment: Node
Region: Frankfurt (EU) ou Oregon (US)
Branch: main
Build Command: npm run build
Start Command: npm run start:render
```

### 2. Via Render CLI (Blueprint)

Créez un fichier `render.yaml` :

```yaml
services:
  - type: web
    name: ssm-mobility-backend
    env: node
    buildCommand: npm run build
    startCommand: npm run start:render
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: FRONTEND_URL
        sync: false
```

Puis déployez :
```bash
render deploy
```

## ⚙️ Configuration

### Variables d'environnement

Dans le dashboard Render, ajoutez :

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
JWT_SECRET=your_jwt_secret_key_here (ou généré automatiquement)
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

## 🔧 Fonctionnalités supportées

✅ **Socket.io** - Support complet  
✅ **WebSockets** - Fonctionne parfaitement  
✅ **Base de données** - Connexions persistantes  
✅ **SSL automatique** - Inclus  
✅ **Domaine personnalisé** - Disponible  
✅ **Logs en temps réel** - Interface web  
✅ **Auto-deploy** - Sur push GitHub  
✅ **Health checks** - Monitoring intégré  

## 💰 Tarification

- **Plan gratuit** : 750h/mois (suffisant pour un projet)
- **Starter** : $7/mois pour usage illimité
- **Pas de sleep mode** sur les plans payants

## 🌐 URLs après déploiement

Votre app sera disponible à :
- `https://votre-app-name.onrender.com`
- API endpoints : `/api/auth/*`, `/api/technicians/position/*`
- Socket.io : `wss://votre-app-name.onrender.com`

## ⚡ Optimisations Render

Le `Dockerfile` inclus optimise :
- Build multi-stage pour réduire la taille
- Cache des dépendances npm
- Image Alpine Linux légère

## 🔍 Test de santé

Après déploiement :
```bash
curl https://votre-app-name.onrender.com/api/health
```

## 🚨 Notes importantes

- **Plan gratuit** : L'app peut "dormir" après 15min d'inactivité
- **Cold start** : Premier démarrage peut prendre 30-60 secondes
- **Persistent storage** : Utilisez une base de données externe (MongoDB Atlas)