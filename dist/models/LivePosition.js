"use strict";
// Modèle pour les positions en temps réel (en mémoire)
// Utilisé pour l'affichage temps réel sans surcharger la DB
Object.defineProperty(exports, "__esModule", { value: true });
exports.livePositionManager = void 0;
class LivePositionManager {
    constructor() {
        this.positions = new Map();
        this.MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes
    }
    /**
     * Met à jour la position live d'un technicien
     */
    updatePosition(technicianId, latitude, longitude, speed, timestamp = new Date()) {
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
    getPosition(technicianId) {
        const position = this.positions.get(technicianId);
        if (!position)
            return null;
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
    getAllPositions() {
        const now = Date.now();
        const activePositions = [];
        for (const [technicianId, position] of this.positions.entries()) {
            const age = now - position.lastUpdate.getTime();
            if (age <= this.MAX_AGE_MS) {
                activePositions.push(position);
            }
            else {
                // Nettoyer les positions expirées
                this.positions.delete(technicianId);
            }
        }
        return activePositions;
    }
    /**
     * Supprime la position d'un technicien
     */
    removePosition(technicianId) {
        this.positions.delete(technicianId);
    }
    /**
     * Nettoie les positions expirées
     */
    cleanup() {
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
    getActiveCount() {
        this.cleanup();
        return this.positions.size;
    }
}
// Instance singleton
exports.livePositionManager = new LivePositionManager();
// Nettoyage automatique toutes les 2 minutes
setInterval(() => {
    exports.livePositionManager.cleanup();
}, 2 * 60 * 1000);
