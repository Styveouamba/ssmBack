"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
// Cache de connexion pour les fonctions serverless
let cachedConnection = null;
const connectDB = async () => {
    // Si on a déjà une connexion en cache, on la réutilise
    if (cachedConnection && mongoose_1.default.connection.readyState === 1) {
        console.log("Using cached MongoDB connection");
        return cachedConnection;
    }
    try {
        // Configuration optimisée pour serverless
        const connection = await mongoose_1.default.connect(config_1.config.MONGO_URI, {
            bufferCommands: false, // Désactive le buffering pour serverless
            maxPoolSize: 1, // Limite le pool de connexions
        });
        cachedConnection = connection;
        console.log("MongoDB Connected...");
        return connection;
    }
    catch (err) {
        if (err instanceof Error) {
            console.error("Error connecting to MongoDB:", err.message);
        }
        else {
            console.error("Error connecting to MongoDB:", err);
        }
        // En mode serverless, on ne fait pas process.exit
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
        throw err;
    }
};
exports.default = connectDB;
