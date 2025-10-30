import mongoose from "mongoose";
import { config } from "./config";

// Cache de connexion pour les fonctions serverless
let cachedConnection: typeof mongoose | null = null;

const connectDB = async (): Promise<typeof mongoose> => {
  // Si on a déjà une connexion en cache, on la réutilise
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("Using cached MongoDB connection");
    return cachedConnection;
  }

  try {
    // Configuration optimisée pour serverless
    const connection = await mongoose.connect(config.MONGO_URI, {
      bufferCommands: false, // Désactive le buffering pour serverless
      maxPoolSize: 1, // Limite le pool de connexions
    });
    
    cachedConnection = connection;
    console.log("MongoDB Connected...");
    return connection;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error connecting to MongoDB:", err.message);
    } else {
      console.error("Error connecting to MongoDB:", err);
    }
    
    // En mode serverless, on ne fait pas process.exit
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    throw err;
  }
};

export default connectDB;
