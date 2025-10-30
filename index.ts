import express, { Request, Response } from "express";
import { createServer } from "http";
import { initSocket } from "./socket";

import connectDB from "./config/db";
import positionRoutes from "./routes/positionRoutes";
import authRoutes from "./routes/authRoutes";
import cors from "cors";

const app = express();

// Configuration CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("🚀 Backend TypeScript + MongoDB fonctionne !");
});

app.get("/api/health", async (_req: Request, res: Response) => {
  try {
    await connectDB();
    res.status(200).json({
      status: "OK",
      message: "API is running",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
    });
  }
});

app.use("/api/technicians/position", positionRoutes);
app.use("/api/auth", authRoutes);

// Connexion à la base de données
connectDB().catch((err) => {
  console.error("Erreur lors de la connexion à la base de données :", err);
});

// Pour le développement local
if (process.env.NODE_ENV !== "production") {
  const httpServer = createServer(app);

  // Init Socket.io (toute la logique est maintenant dans socket.ts)
  initSocket(httpServer);

  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// ========================
// EXPORT APP POUR VERCEL
// ========================
export default app;
