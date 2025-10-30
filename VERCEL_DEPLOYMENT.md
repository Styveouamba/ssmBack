# Déploiement sur Vercel

## Configuration requise

### 1. Variables d'environnement
Dans votre dashboard Vercel, ajoutez ces variables d'environnement :

- `MONGODB_URI` : Votre chaîne de connexion MongoDB Atlas
- `JWT_SECRET` : Clé secrète pour JWT (générez une clé sécurisée)
- `FRONTEND_URL` : URL de votre frontend (ex: https://monapp.vercel.app)
- `NODE_ENV` : `production`

### 2. Commandes de déploiement

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel --prod
```

### 3. Configuration automatique

Le projet est configuré avec :
- `vercel.json` pour la configuration serverless
- Export par défaut de l'app Express
- Gestion des CORS pour votre frontend
- Connexion automatique à MongoDB

### 4. Limitations Vercel

⚠️ **Important** : Socket.io ne fonctionne pas en mode serverless sur Vercel.
Pour les WebSockets, considérez :
- Utiliser Vercel Edge Functions
- Déployer sur Railway, Render ou Heroku
- Utiliser des alternatives comme Server-Sent Events

### 5. Test local

```bash
npm run dev  # Mode développement avec Socket.io
```

### 6. URLs d'API

Après déploiement, vos endpoints seront disponibles à :
- `https://votre-app.vercel.app/api/auth/*`
- `https://votre-app.vercel.app/api/technicians/position/*`