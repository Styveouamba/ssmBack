# Système de Suivi de Position en Temps Réel

## Vue d'ensemble

Ce système permet de suivre les positions des techniciens en temps réel via WebSocket et API REST.

## Stratégies d'optimisation

### 1. Purge automatique (TTL)
- Les positions sont automatiquement supprimées après 7 jours
- Configurable via `POSITION_TTL_DAYS`

### 2. Filtrage intelligent
- Distance minimale : 10 mètres (configurable)
- Temps minimum : 30 secondes entre sauvegardes
- Réduction de fréquence pour utilisateurs stationnaires (< 5 km/h)

### 3. Positions live en mémoire
- Affichage temps réel sans surcharge DB
- Cache automatique avec nettoyage
- API dédiée pour positions live

### 4. Index optimisés
- Index géospatial 2dsphere
- Index composés sur technician + timestamp
- TTL index pour purge automatique

## Fonctionnalités

### 1. Envoi de Position (API REST)
```
POST /api/technicians/position
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 48.8566,
  "longitude": 2.3522,
  "speed": 25,
  "timestamp": "2025-10-29T10:30:00Z"
}
```

### 2. Récupération des Positions

#### Position actuelle d'un technicien
```
GET /api/technicians/position/current/:userId
Authorization: Bearer <token>
```

#### Toutes les positions actuelles (admin seulement)
```
GET /api/technicians/position/current/all
Authorization: Bearer <token>
```

#### Toutes les positions live (temps réel, admin seulement)
```
GET /api/technicians/position/live/all
Authorization: Bearer <token>
```

#### Ma position actuelle (pour les techniciens)
```
GET /api/technicians/position/my-current
Authorization: Bearer <token>
```

#### Historique des positions
```
GET /api/technicians/position/history/:userId?from=2025-10-01&to=2025-10-29&limit=100
Authorization: Bearer <token>
```

## WebSocket Events

### Connexion
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Événements côté client

#### Envoyer une position
```javascript
socket.emit('position:update', {
  latitude: 48.8566,
  longitude: 2.3522,
  speed: 25,
  timestamp: new Date().toISOString()
});
```

#### Demander la dernière position (admin seulement)
```javascript
socket.emit('position:get-latest', 'technicianId');
```

#### Demander ma propre position (pour les techniciens)
```javascript
socket.emit('position:get-my-latest');
socket.emit('position:get-my-live'); // Position en mémoire (plus récente)
```

### Événements côté serveur

#### Position mise à jour (pour les admins)
```javascript
socket.on('position:updated', (data) => {
  console.log('Nouvelle position:', data);
  // data: { technicianId, latitude, longitude, speed, timestamp, _id }
});
```

#### Position mise à jour (pour le technicien - sa propre position)
```javascript
socket.on('position:updated', (data) => {
  console.log('Ma position mise à jour:', data);
  // Mettre à jour l'affichage de ma position sur la carte
});
```

#### Confirmation de position (pour le technicien)
```javascript
socket.on('position:confirmed', (data) => {
  console.log('Position confirmée:', data);
});
```

#### Ma dernière position reçue
```javascript
socket.on('position:my-latest', (position) => {
  console.log('Ma dernière position:', position);
});

socket.on('position:my-live', (position) => {
  console.log('Ma position live:', position);
});
```

#### Dernière position reçue
```javascript
socket.on('position:latest', (position) => {
  console.log('Dernière position:', position);
});
```

#### Gestion des erreurs
```javascript
socket.on('error', (error) => {
  console.error('Erreur:', error.message);
});
```

## Rooms WebSocket

- `user:{userId}` : Room individuelle pour chaque utilisateur
- `admins` : Room pour tous les administrateurs

## Sécurité

- Authentification JWT requise pour toutes les opérations
- Les techniciens ne peuvent voir que leurs propres positions
- Les admins peuvent voir toutes les positions
- Validation des données d'entrée

## Base de Données

### Modèle Position
```javascript
{
  technician: ObjectId, // Référence vers User
  location: {
    type: "Point",
    coordinates: [longitude, latitude] // Format GeoJSON
  },
  latitude: Number,
  longitude: Number,
  speed: Number,
  timestamp: Date,
  createdAt: Date
}
```

### Index
- Index géospatial 2dsphere sur `location`
- Index sur `technician` et `timestamp`

## Exemple d'intégration Frontend

```javascript
// Connexion WebSocket
const socket = io('http://localhost:5000', {
  auth: { token: localStorage.getItem('token') }
});

// Pour un technicien - envoyer sa position
if (navigator.geolocation) {
  navigator.geolocation.watchPosition((position) => {
    socket.emit('position:update', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      speed: position.coords.speed || 0
    });
  });
}

// Pour un admin - écouter les mises à jour
socket.on('position:updated', (data) => {
  updateTechnicianOnMap(data.technicianId, data.latitude, data.longitude);
});
```