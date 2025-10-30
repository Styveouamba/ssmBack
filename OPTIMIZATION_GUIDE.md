# Guide d'Optimisation des Positions

## 🎯 Objectif

Réduire drastiquement le nombre d'écritures en base de données tout en maintenant un affichage temps réel fluide.

## 📊 Résultats attendus

- **Réduction de 80-90%** des écritures en base de données
- **Maintien du temps réel** via cache mémoire
- **Purge automatique** des anciennes données
- **Performance optimisée** avec index appropriés

## 🔧 Configuration

### Variables d'environnement

```bash
# Distance minimale pour sauvegarder (mètres)
POSITION_MIN_DISTANCE_METERS=10

# Temps minimum entre sauvegardes (secondes)
POSITION_MIN_TIME_SECONDS=30

# Seuil de vitesse pour réduire fréquence (km/h)
POSITION_MIN_SPEED_THRESHOLD=5

# Durée de rétention des données (jours)
POSITION_TTL_DAYS=7

# Taille des batches pour nettoyage
POSITION_CLEANUP_BATCH_SIZE=1000

# Âge maximum du cache (millisecondes)
POSITION_CACHE_MAX_AGE=300000
```

## 🚀 Utilisation

### 1. Démarrage du serveur

```bash
npm run dev
```

### 2. Test de l'optimisation

```bash
npm run test-optimization
```

### 3. Statistiques des positions

```bash
npm run position-stats
```

### 4. Nettoyage manuel

```bash
# Voir ce qui serait supprimé (dry-run)
npm run cleanup-positions cleanup 7 --dry-run

# Supprimer les positions > 7 jours
npm run cleanup-positions cleanup 7
```

## 📈 Stratégies d'optimisation

### 1. Filtrage intelligent

**Conditions de sauvegarde :**
- Distance parcourue ≥ 10 mètres OU
- Temps écoulé ≥ 30 secondes OU
- Changement de vitesse ≥ 10 km/h

**Cas spéciaux :**
- Utilisateur stationnaire (< 5 km/h) : fréquence réduite de 50%
- Première position : toujours sauvegardée
- Changement significatif de vitesse : priorité haute

### 2. Double système

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client GPS    │───▶│  Cache Mémoire   │───▶│  Affichage UI   │
│                 │    │  (Temps réel)    │    │  (Temps réel)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │                       ▼
         │              ┌──────────────────┐
         └─────────────▶│  Base de données │
                        │   (Filtré)       │
                        └──────────────────┘
```

### 3. Purge automatique

- **TTL MongoDB** : Suppression automatique après 7 jours
- **Cache mémoire** : Nettoyage toutes les 2 minutes
- **Script manuel** : Nettoyage personnalisé disponible

## 🔍 Monitoring

### Métriques importantes

1. **Taux de filtrage** : % de positions non sauvegardées
2. **Utilisateurs actifs** : Nombre de positions en cache
3. **Taille de la DB** : Évolution du stockage
4. **Performance** : Temps de réponse des requêtes

### Logs à surveiller

```bash
# Positions sauvegardées
Position saved for user 123: 48.8566, 2.3522

# Positions filtrées
Position filtered for user 123: Position filtered - insufficient change

# Nettoyage du cache
Cache cleanup: removed 5 inactive users
```

## 🛠️ Maintenance

### Nettoyage régulier

```bash
# Quotidien - Statistiques
0 6 * * * npm run position-stats

# Hebdomadaire - Nettoyage (dry-run)
0 2 * * 0 npm run cleanup-positions cleanup 30 --dry-run

# Mensuel - Nettoyage réel
0 3 1 * * npm run cleanup-positions cleanup 30
```

### Surveillance des performances

```javascript
// Vérifier le taux de filtrage
const stats = await PositionOptimizer.getStats();
console.log(`Taux de filtrage: ${stats.filterRate}%`);

// Vérifier la taille du cache
const cacheSize = livePositionManager.getActiveCount();
console.log(`Utilisateurs actifs: ${cacheSize}`);
```

## 🚨 Alertes recommandées

1. **Taux de filtrage < 50%** : Configuration trop permissive
2. **Cache > 1000 utilisateurs** : Possible fuite mémoire
3. **DB > 1M positions** : Nettoyage nécessaire
4. **Temps de réponse > 500ms** : Index à optimiser

## 📋 Checklist de déploiement

- [ ] Variables d'environnement configurées
- [ ] Index MongoDB créés
- [ ] TTL activé
- [ ] Scripts de nettoyage testés
- [ ] Monitoring en place
- [ ] Alertes configurées
- [ ] Documentation équipe mise à jour

## 🔧 Dépannage

### Problème : Trop de positions sauvegardées

**Solution :**
1. Augmenter `POSITION_MIN_DISTANCE_METERS`
2. Augmenter `POSITION_MIN_TIME_SECONDS`
3. Vérifier la logique de filtrage

### Problème : Affichage temps réel saccadé

**Solution :**
1. Vérifier la connexion WebSocket
2. Réduire `POSITION_CACHE_MAX_AGE`
3. Optimiser la fréquence d'envoi côté client

### Problème : Base de données qui grossit

**Solution :**
1. Vérifier le TTL MongoDB
2. Exécuter le nettoyage manuel
3. Réduire `POSITION_TTL_DAYS`

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs serveur
2. Exécuter `npm run position-stats`
3. Consulter cette documentation
4. Contacter l'équipe technique