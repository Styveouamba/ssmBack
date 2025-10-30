import express, { Request, Response } from "express";
import { createServer } from "http";
import { initSocket } from "./socket";

import connectDB from "./config/db";
import positionRoutes from "./routes/positionRoutes";
import authRoutes from "./routes/authRoutes";
import cors from "cors";

const app = express();

// Configuration CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("🚀 Backend TypeScript + MongoDB fonctionne !");
});

app.get("/api/health", async (_req: Request, res: Response) => {
  try {
    await connectDB();
    res.status(200).json({
      status: 'OK',
      message: 'API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      platform: process.env.RAILWAY_ENVIRONMENT ? 'Railway' : process.env.RENDER ? 'Render' : 'Local'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed'
    });
  }
});

app.use("/api/technicians/position", positionRoutes);
app.use("/api/auth", authRoutes);

const httpServer = createServer(app);

// Init Socket.io (fonctionne sur Railway et Render)
initSocket(httpServer);

// Start DB then server
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Platform: ${process.env.RAILWAY_ENVIRONMENT ? 'Railway' : process.env.RENDER ? 'Render' : 'Local'}`);
    });
  })
  .catch((err) => {
    console.error("Erreur lors du démarrage du serveur :", err);
    process.exit(1);
  });

export default app;