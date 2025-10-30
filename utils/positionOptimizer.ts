import Position from "../models/Position";
import { positionConfig } from "../config/positionConfig";

interface CachedPosition {
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: Date;
}

// Cache en mémoire des dernières positions
const lastPositions = new Map<string, CachedPosition>();

export class PositionOptimizer {
  // Configuration dynamique basée sur les variables d'environnement
  private static get MIN_DISTANCE_METERS() { return positionConfig.minDistanceMeters; }
  private static get MIN_TIME_SECONDS() { return positionConfig.minTimeSeconds; }
  private static get MIN_SPEED_THRESHOLD() { return positionConfig.minSpeedThreshold; }

  /**
   * Calcule la distance entre deux points en mètres (formule de Haversine)
   */
  private static calculateDistance(
    lat1: number, lon1: number, 
    lat2: number, lon2: number
  ): number {
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * Détermine si une position doit être sauvegardée
   */
  static shouldSavePosition(
    userId: string,
    latitude: number,
    longitude: number,
    speed: number = 0,
    timestamp: Date = new Date()
  ): boolean {
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
    const distance = this.calculateDistance(
      lastPosition.latitude, lastPosition.longitude,
      latitude, longitude
    );

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
  static updateCache(
    userId: string,
    latitude: number,
    longitude: number,
    speed: number,
    timestamp: Date
  ): void {
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
  static cleanupCache(): void {
    const now = new Date();
    const maxAge = positionConfig.cacheMaxAge;

    for (const [userId, position] of lastPositions.entries()) {
      if (now.getTime() - position.timestamp.getTime() > maxAge) {
        lastPositions.delete(userId);
      }
    }
  }

  /**
   * Sauvegarde optimisée d'une position
   */
  static async savePositionOptimized(
    userId: string,
    latitude: number,
    longitude: number,
    speed: number = 0,
    timestamp: Date = new Date()
  ): Promise<{ saved: boolean; reason?: string; position?: any }> {
    
    if (!this.shouldSavePosition(userId, latitude, longitude, speed, timestamp)) {
      return { 
        saved: false, 
        reason: "Position filtered - insufficient change" 
      };
    }

    try {
      const position = await Position.create({
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
    } catch (error) {
      console.error("Erreur lors de la sauvegarde optimisée:", error);
      throw error;
    }
  }
}

// Nettoyage automatique du cache toutes les heures
setInterval(() => {
  PositionOptimizer.cleanupCache();
}, 60 * 60 * 1000);