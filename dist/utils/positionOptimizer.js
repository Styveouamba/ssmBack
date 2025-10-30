"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionOptimizer = void 0;
const Position_1 = __importDefault(require("../models/Position"));
const positionConfig_1 = require("../config/positionConfig");
// Cache en mémoire des dernières positions
const lastPositions = new Map();
class PositionOptimizer {
    // Configuration dynamique basée sur les variables d'environnement
    static get MIN_DISTANCE_METERS() { return positionConfig_1.positionConfig.minDistanceMeters; }
    static get MIN_TIME_SECONDS() { return positionConfig_1.positionConfig.minTimeSeconds; }
    static get MIN_SPEED_THRESHOLD() { return positionConfig_1.positionConfig.minSpeedThreshold; }
    /**
     * Calcule la distance entre deux points en mètres (formule de Haversine)
     */
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Rayon de la Terre en mètres
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    /**
     * Détermine si une position doit être sauvegardée
     */
    static shouldSavePosition(userId, latitude, longitude, speed = 0, timestamp = new Date()) {
        const lastPosition = lastPositions.get(userId);
        if (!lastPosition) {
            // Première position, toujours sauvegarder
            return true;
        }
        // Vérifier le temps écoulé
        const timeDiff = (timestamp.getTime() - lastPosition.timestamp.getTime()) / 1000;
        // Si l'utilisateur est stationnaire (vitesse faible), réduire la fréquence
        if (speed < this.MIN_SPEED_THRESHOLD && timeDiff < this.MIN_TIME_SECONDS * 2) {
            return false;
        }
        // Vérifier la distance parcourue
        const distance = this.calculateDistance(lastPosition.latitude, lastPosition.longitude, latitude, longitude);
        // Sauvegarder si :
        // - Distance significative parcourue OU
        // - Temps minimum écoulé OU
        // - Changement significatif de vitesse
        const significantDistance = distance >= this.MIN_DISTANCE_METERS;
        const timeThreshold = timeDiff >= this.MIN_TIME_SECONDS;
        const speedChange = Math.abs(speed - lastPosition.speed) >= 10; // 10 km/h de différence
        return significantDistance || timeThreshold || speedChange;
    }
    /**
     * Met à jour le cache avec la nouvelle position
     */
    static updateCache(userId, latitude, longitude, speed, timestamp) {
        lastPositions.set(userId, {
            latitude,
            longitude,
            speed,
            timestamp
        });
    }
    /**
     * Nettoie le cache des utilisateurs inactifs
     */
    static cleanupCache() {
        const now = new Date();
        const maxAge = positionConfig_1.positionConfig.cacheMaxAge;
        for (const [userId, position] of lastPositions.entries()) {
            if (now.getTime() - position.timestamp.getTime() > maxAge) {
                lastPositions.delete(userId);
            }
        }
    }
    /**
     * Sauvegarde optimisée d'une position
     */
    static async savePositionOptimized(userId, latitude, longitude, speed = 0, timestamp = new Date()) {
        if (!this.shouldSavePosition(userId, latitude, longitude, speed, timestamp)) {
            return {
                saved: false,
                reason: "Position filtered - insufficient change"
            };
        }
        try {
            const position = await Position_1.default.create({
                technician: userId,
                location: {
                    type: "Point",
                    coordinates: [longitude, latitude],
                },
                latitude,
                longitude,
                speed,
                timestamp,
            });
            // Mettre à jour le cache
            this.updateCache(userId, latitude, longitude, speed, timestamp);
            return { saved: true, position };
        }
        catch (error) {
            console.error("Erreur lors de la sauvegarde optimisée:", error);
            throw error;
        }
    }
}
exports.PositionOptimizer = PositionOptimizer;
// Nettoyage automatique du cache toutes les heures
setInterval(() => {
    PositionOptimizer.cleanupCache();
}, 60 * 60 * 1000);
