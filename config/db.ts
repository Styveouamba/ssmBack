import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("MongoDB Connected...");
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error connecting to MongoDB:", err.message);
    } else {
      console.error("Error connecting to MongoDB:", err);
    }
    process.exit(1);
  }
};

export default connectDB;
