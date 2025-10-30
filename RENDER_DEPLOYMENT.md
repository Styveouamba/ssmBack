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

**Option A - Configuration manuelle (Recommandée) :**
Utilisez le dashboard web avec ces paramètres :
```
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm run start:render
```

**Option B - Blueprint YAML :**
Le fichier `render.yaml` est configuré, mais la méthode manuelle est plus simple.

```bash
# Si vous voulez utiliser le blueprint
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

## 🔧 Résolution des problèmes courants

### Erreur "tsc: Permission denied"

**Solution 1 - Sans Docker (Recommandé) :**
```
Build Command: npm install && npm run build
Start Command: npm run start:render
```

**Solution 2 - Dockerfile corrigé :**
- Utilise `npm ci` (pas `--only=production`)
- Compile avec `npx tsc`
- Multi-stage build pour optimiser

**Solution 3 - Dockerfile alternatif :**
Renommez `Dockerfile.alternative` en `Dockerfile` pour un build multi-stage optimisé.

### Build qui échoue

1. **Vérifiez les logs** dans le dashboard Render
2. **Testez localement** : `npm run build`
3. **Utilisez la méthode sans Docker** (plus simple)