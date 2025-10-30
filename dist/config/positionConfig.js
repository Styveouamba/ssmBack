"use strict";
// Configuration pour l'optimisation des positions
Object.defineProperty(exports, "__esModule", { value: true });
exports.positionConfig = void 0;
exports.validatePositionConfig = validatePositionConfig;
// Configuration par défaut
const defaultConfig = {
    minDistanceMeters: 10,
    minTimeSeconds: 30,
    minSpeedThreshold: 5,
    ttlDays: 7,
    cleanupBatchSize: 1000,
    cacheMaxAge: 5 * 60 * 1000, // 5 minutes
};
// Configuration basée sur les variables d'environnement
exports.positionConfig = {
    minDistanceMeters: parseInt(process.env.POSITION_MIN_DISTANCE_METERS ||
        String(defaultConfig.minDistanceMeters)),
    minTimeSeconds: parseInt(process.env.POSITION_MIN_TIME_SECONDS ||
        String(defaultConfig.minTimeSeconds)),
    minSpeedThreshold: parseInt(process.env.POSITION_MIN_SPEED_THRESHOLD ||
        String(defaultConfig.minSpeedThreshold)),
    ttlDays: parseInt(process.env.POSITION_TTL_DAYS || String(defaultConfig.ttlDays)),
    cleanupBatchSize: parseInt(process.env.POSITION_CLEANUP_BATCH_SIZE ||
        String(defaultConfig.cleanupBatchSize)),
    cacheMaxAge: parseInt(process.env.POSITION_CACHE_MAX_AGE || String(defaultConfig.cacheMaxAge)),
};
// Validation de la configuration
function validatePositionConfig(config) {
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
validatePositionConfig(exports.positionConfig);
console.log("📍 Configuration des positions:", {
    minDistance: `${exports.positionConfig.minDistanceMeters}m`,
    minTime: `${exports.positionConfig.minTimeSeconds}s`,
    minSpeed: `${exports.positionConfig.minSpeedThreshold}km/h`,
    ttl: `${exports.positionConfig.ttlDays} jours`,
    batchSize: exports.positionConfig.cleanupBatchSize,
    cacheAge: `${exports.positionConfig.cacheMaxAge / 1000}s`,
});
