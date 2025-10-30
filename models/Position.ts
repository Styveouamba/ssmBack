import mongoose, { Document, Schema, Model } from "mongoose";
import { IUser } from "./users";

// Interface pour TypeScript
export interface IPosition extends Document {
  technician: IUser["_id"];
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  latitude: number; // duplicated for convenience
  longitude: number;
  speed?: number;
  timestamp: Date;
  createdAt: Date;
}

const PositionSchema: Schema<IPosition> = new Schema({
  technician: {
    type: mongoose.Schema.Types.ObjectId,
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

const Position: Model<IPosition> = mongoose.model<IPosition>("Position", PositionSchema);
export default Position;
