// Modèle pour les positions en temps réel (en mémoire)
// Utilisé pour l'affichage temps réel sans surcharger la DB

export interface LivePosition {
  technicianId: string;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: Date;
  lastUpdate: Date;
}

class LivePositionManager {
  private positions = new Map<string, LivePosition>();
  private readonly MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Met à jour la position live d'un technicien
   */
  updatePosition(
    technicianId: string,
    latitude: number,
    longitude: number,
    speed: number,
    timestamp: Date = new Date()
  ): void {
    this.positions.set(technicianId, {
      technicianId,
      latitude,
      longitude,
      speed,
      timestamp,
      lastUpdate: new Date()
    });
  }

  /**
   * Récupère la position live d'un technicien
   */
  getPosition(technicianId: string): LivePosition | null {
    const position = this.positions.get(technicianId);
    if (!position) return null;

    // Vérifier si la position n'est pas trop ancienne
    const age = Date.now() - position.lastUpdate.getTime();
    if (age > this.MAX_AGE_MS) {
      this.positions.delete(technicianId);
      return null;
    }

    return position;
  }

  /**
   * Récupère toutes les positions live actives
   */
  getAllPositions(): LivePosition[] {
    const now = Date.now();
    const activePositions: LivePosition[] = [];

    for (const [technicianId, position] of this.positions.entries()) {
      const age = now - position.lastUpdate.getTime();
      if (age <= this.MAX_AGE_MS) {
        activePositions.push(position);
      } else {
        // Nettoyer les positions expirées
        this.positions.delete(technicianId);
      }
    }

    return activePositions;
  }

  /**
   * Supprime la position d'un technicien
   */
  removePosition(technicianId: string): void {
    this.positions.delete(technicianId);
  }

  /**
   * Nettoie les positions expirées
   */
  cleanup(): void {
    const now = Date.now();
    for (const [technicianId, position] of this.positions.entries()) {
      const age = now - position.lastUpdate.getTime();
      if (age > this.MAX_AGE_MS) {
        this.positions.delete(technicianId);
      }
    }
  }

  /**
   * Retourne le nombre de positions actives
   */
  getActiveCount(): number {
    this.cleanup();
    return this.positions.size;
  }
}

// Instance singleton
export const livePositionManager = new LivePositionManager();

// Nettoyage automatique toutes les 2 minutes
setInterval(() => {
  livePositionManager.cleanup();
}, 2 * 60 * 1000);