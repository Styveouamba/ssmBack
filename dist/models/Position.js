"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const PositionSchema = new mongoose_1.Schema({
    technician: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    // GeoJSON point (preferred for geospatial queries)
    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
            default: "Point",
        },
        coordinates: {
            type: [Number],
            required: true, // [lng, lat]
        },
    },
    // Garder latitude/longitude en champs séparés si tu veux (facilité)
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    speed: {
        type: Number,
        default: 0,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
// Index géospatial 2dsphere (nécessaire pour requêtes geo)
PositionSchema.index({ location: "2dsphere" });
// TTL index - purge automatique des positions après 7 jours
const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 jours
PositionSchema.index({ createdAt: 1 }, { expireAfterSeconds: TTL_SECONDS });
// Index simple sur timestamp pour les requêtes de tri
PositionSchema.index({ timestamp: -1 });
// Index composé pour optimiser les requêtes fréquentes
PositionSchema.index({ technician: 1, timestamp: -1 });
PositionSchema.index({ technician: 1, createdAt: -1 });
const Position = mongoose_1.default.model("Position", PositionSchema);
exports.default = Position;
