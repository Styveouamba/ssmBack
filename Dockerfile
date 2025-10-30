# Utiliser Node.js 18 LTS
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY tsconfig.json ./

# Installer TOUTES les dépendances (dev incluses pour TypeScript)
RUN npm ci

# Copier le code source
COPY . .

# Compiler TypeScript avec npx pour éviter les problèmes de permissions
RUN npx tsc

# Nettoyer les dev dependencies après build
RUN npm prune --production

# Exposer le port
EXPOSE $PORT

# Commande de démarrage
CMD ["npm", "run", "start:render"]