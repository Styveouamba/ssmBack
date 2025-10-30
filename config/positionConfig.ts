// Configuration pour l'optimisation des positions

export interface PositionConfig {
  // Distance minimale en mètres pour sauvegarder une nouvelle position
  minDistanceMeters: number;

  // Temps minimum en secondes entre deux sauvegardes
  minTimeSeconds: number;

  // Vitesse minimale en km/h pour réduire la fréquence de sauvegarde
  minSpeedThreshold: number;

  // TTL en jours pour la purge automatique
  ttlDays: number;

  // Taille des batches pour les opérations de nettoyage
  cleanupBatchSize: number;

  // Âge maximum du cache en mémoire (en millisecondes)
  cacheMaxAge: number;
}

// Configuration par défaut
const defaultConfig: PositionConfig = {
  minDistanceMeters: 10,
  minTimeSeconds: 30,
  minSpeedThreshold: 5,
  ttlDays: 7,
  cleanupBatchSize: 1000,
  cacheMaxAge: 5 * 60 * 1000, // 5 minutes
};

// Configuration basée sur les variables d'environnement
export const positionConfig: PositionConfig = {
  minDistanceMeters: parseInt(
    process.env.POSITION_MIN_DISTANCE_METERS ||
      String(defaultConfig.minDistanceMeters)
  ),
  minTimeSeconds: parseInt(
    process.env.POSITION_MIN_TIME_SECONDS ||
      String(defaultConfig.minTimeSeconds)
  ),
  minSpeedThreshold: parseInt(
    process.env.POSITION_MIN_SPEED_THRESHOLD ||
      String(defaultConfig.minSpeedThreshold)
  ),
  ttlDays: parseInt(
    process.env.POSITION_TTL_DAYS || String(defaultConfig.ttlDays)
  ),
  cleanupBatchSize: parseInt(
    process.env.POSITION_CLEANUP_BATCH_SIZE ||
      String(defaultConfig.cleanupBatchSize)
  ),
  cacheMaxAge: parseInt(
    process.env.POSITION_CACHE_MAX_AGE || String(defaultConfig.cacheMaxAge)
  ),
};

// Validation de la configuration
export function validatePositionConfig(config: PositionConfig): void {
  if (config.minDistanceMeters < 0) {
    throw new Error("minDistanceMeters doit être positif");
  }

  if (config.minTimeSeconds < 0) {
    throw new Error("minTimeSeconds doit être positif");
  }

  if (config.minSpeedThreshold < 0) {
    throw new Error("minSpeedThreshold doit être positif");
  }

  if (config.ttlDays < 1) {
    throw new Error("ttlDays doit être au moins 1");
  }

  if (config.cleanupBatchSize < 1) {
    throw new Error("cleanupBatchSize doit être au moins 1");
  }

  if (config.cacheMaxAge < 1000) {
    throw new Error("cacheMaxAge doit être au moins 1000ms");
  }
}

// Valider la configuration au démarrage
validatePositionConfig(positionConfig);

console.log("📍 Configuration des positions:", {
  minDistance: `${positionConfig.minDistanceMeters}m`,
  minTime: `${positionConfig.minTimeSeconds}s`,
  minSpeed: `${positionConfig.minSpeedThreshold}km/h`,
  ttl: `${positionConfig.ttlDays} jours`,
  batchSize: positionConfig.cleanupBatchSize,
  cacheAge: `${positionConfig.cacheMaxAge / 1000}s`,
});
