"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Script de test de la configuration
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Charger les variables d'environnement
const config_1 = require("../config/config");
const positionConfig_1 = require("../config/positionConfig");
console.log("🔧 Test de la configuration\n");
console.log("📊 Configuration générale:");
console.log(`  PORT: ${process.env.PORT}`);
console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`  FRONTEND_URL: ${process.env.FRONTEND_URL}`);
console.log(`  JWT_SECRET: ${config_1.config.JWT_SECRET ? '✅ Défini' : '❌ Manquant'}`);
console.log(`  MONGO_URI: ${config_1.config.MONGO_URI ? '✅ Défini' : '❌ Manquant'}`);
console.log("\n📍 Configuration des positions:");
console.log(`  Distance minimale: ${positionConfig_1.positionConfig.minDistanceMeters}m`);
console.log(`  Temps minimum: ${positionConfig_1.positionConfig.minTimeSeconds}s`);
console.log(`  Seuil de vitesse: ${positionConfig_1.positionConfig.minSpeedThreshold}km/h`);
console.log(`  TTL: ${positionConfig_1.positionConfig.ttlDays} jours`);
console.log(`  Taille batch: ${positionConfig_1.positionConfig.cleanupBatchSize}`);
console.log(`  Âge cache: ${positionConfig_1.positionConfig.cacheMaxAge / 1000}s`);
console.log("\n✅ Configuration chargée avec succès !");
// Test de calcul d'optimisation
console.log("\n🧮 Estimation d'optimisation:");
const positionsPerHour = 360; // 1 position toutes les 10 secondes
const hoursPerDay = 24;
const positionsPerDay = positionsPerHour * hoursPerDay;
console.log(`  Sans optimisation: ${positionsPerDay.toLocaleString()} positions/jour/utilisateur`);
// Estimation basée sur les paramètres
const estimatedReduction = 85; // 85% de réduction estimée
const optimizedPositions = Math.round(positionsPerDay * (100 - estimatedReduction) / 100);
console.log(`  Avec optimisation: ${optimizedPositions.toLocaleString()} positions/jour/utilisateur`);
console.log(`  Réduction estimée: ${estimatedReduction}%`);
console.log(`  Économie: ${(positionsPerDay - optimizedPositions).toLocaleString()} positions/jour/utilisateur`);
// Pour 100 utilisateurs
const users = 100;
console.log(`\n👥 Pour ${users} utilisateurs:`);
console.log(`  Sans optimisation: ${(positionsPerDay * users).toLocaleString()} positions/jour`);
console.log(`  Avec optimisation: ${(optimizedPositions * users).toLocaleString()} positions/jour`);
console.log(`  Économie totale: ${((positionsPerDay - optimizedPositions) * users).toLocaleString()} positions/jour`);
