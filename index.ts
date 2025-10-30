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

app.use("/api/technicians/position", positionRoutes);
app.use("/api/auth", authRoutes);

const httpServer = createServer(app);

// Init Socket.io (toute la logique est maintenant dans socket.ts)
initSocket(httpServer);

// Start DB then server
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Erreur lors du démarrage du serveur :", err);
    process.exit(1);
  });

  // ========================
// EXPORT APP POUR VERCEL
// ========================
//  export default app;