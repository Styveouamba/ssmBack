# 🔧 Solution pour l'erreur Render "tsc: Permission denied"

## ❌ Problème rencontré
```
sh: tsc: Permission denied
error: failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code 126
```

## ✅ Solution recommandée : SANS Docker

**Dans le dashboard Render, configurez :**

```
Environment: Node
Build Command: npm install && npm run build
Start Command: npm run start:render
```

**Pourquoi ça marche mieux :**
- Pas de problèmes de permissions Docker
- Build plus rapide
- Moins de complexité
- Render gère Node.js nativement

## 🐳 Alternative : Docker corrigé

Si vous voulez absolument utiliser Docker, le `Dockerfile` a été corrigé :

**Changements apportés :**
1. `npm ci` au lieu de `npm ci --only=production`
2. Installation des devDependencies pour TypeScript
3. `npx tsc` pour éviter les problèmes de permissions
4. Nettoyage après build

## 🚀 Étapes de déploiement Render (SANS Docker)

### 1. Dashboard Render
1. Allez sur [render.com](https://render.com)
2. "New +" → "Web Service"
3. Connectez votre repo GitHub
4. **Configuration :**
   ```
   Name: ssm-mobility-backend
   Environment: Node
   Build Command: npm install && npm run build
   Start Command: npm run start:render
   ```

### 2. Variables d'environnement
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your_secret_key_here
FRONTEND_URL=https://your-frontend.com
NODE_ENV=production
```

### 3. Déploiement
- Render détecte automatiquement les changements GitHub
- Build automatique à chaque push
- Logs disponibles en temps réel

## 🎯 Pourquoi cette solution fonctionne

1. **Pas de Docker** = Pas de problèmes de permissions
2. **npm install** = Installe toutes les dépendances (dev incluses)
3. **npm run build** = Compile TypeScript correctement
4. **npm run start:render** = Lance server.js avec Socket.io

## 🔍 Test de votre configuration

Avant de déployer, testez localement :
```bash
npm run debug-render  # Vérifie la config
npm run build         # Test de compilation
npm run start:render  # Test du serveur
```

## 🎉 Résultat attendu

Après déploiement :
- ✅ API REST fonctionnelle
- ✅ Socket.io opérationnel
- ✅ WebSockets disponibles
- ✅ Base de données connectée

**URL de test :** `https://votre-app.onrender.com/api/health`

Cette solution évite complètement les problèmes Docker et utilise les capacités natives de Render pour Node.js !