// src/socket.ts
import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "./config/config";
import Position from "./models/Position";
import { PositionOptimizer } from "./utils/positionOptimizer";
import { livePositionManager } from "./models/LivePosition";

let io: IOServer | null = null;

export const initSocket = (server: HttpServer) => {
  io = new IOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
  });

  // Middleware d'authentification pour Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Auth token required"));

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as { id: string; role?: string };
      socket.data.userId = decoded.id;
      socket.data.role = decoded.role;
      return next();
    } catch (err) {
      console.warn("Socket auth failed:", err);
      return next(new Error("Auth failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}, User: ${socket.data.userId}`);
    
    // Rejoindre les rooms appropriées
    socket.join(`user:${socket.data.userId}`);
    if (socket.data.role === 'admin') {
      socket.join('admins');
    }

    // Écouter les mises à jour de position en temps réel
    socket.on("position:update", async (payload) => {
      try {
        const { latitude, longitude, speed, timestamp } = payload;
        
        if (latitude === undefined || longitude === undefined) {
          socket.emit("error", { message: "Latitude et longitude requises" });
          return;
        }

        const ts = timestamp ? new Date(timestamp) : new Date();

        // Toujours mettre à jour la position live (en mémoire)
        livePositionManager.updatePosition(
          socket.data.userId,
          latitude,
          longitude,
          speed || 0,
          ts
        );

        // Utiliser la sauvegarde optimisée pour la DB
        const result = await PositionOptimizer.savePositionOptimized(
          socket.data.userId,
          latitude,
          longitude,
          speed || 0,
          ts
        );

        // Préparer les données pour l'émission temps réel
        const updateData = {
          technicianId: socket.data.userId,
          latitude,
          longitude,
          speed: speed || 0,
          timestamp: ts,
          _id: result.position?._id,
          saved: result.saved,
          reason: result.reason
        };

        // Émettre aux admins pour surveillance globale
        socket.to('admins').emit("position:updated", updateData);
        
        // Émettre au technicien pour sa propre position (temps réel)
        socket.emit("position:updated", updateData);
        
        // Confirmation de sauvegarde (optionnel, pour debug)
        socket.emit("position:confirmed", updateData);

        if (result.saved) {
          console.log(`Position saved for user ${socket.data.userId}: ${latitude}, ${longitude}`);
        } else {
          console.log(`Position filtered for user ${socket.data.userId}: ${result.reason}`);
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour de position:", error);
        socket.emit("error", { message: "Erreur lors de la sauvegarde de la position" });
      }
    });

    // Demander la dernière position d'un technicien (pour les admins)
    socket.on("position:get-latest", async (technicianId) => {
      if (socket.data.role !== 'admin') {
        socket.emit("error", { message: "Non autorisé" });
        return;
      }

      try {
        const latestPosition = await Position.findOne({ technician: technicianId })
          .sort({ timestamp: -1 })
          .populate('technician', 'firstName lastName')
          .lean();

        socket.emit("position:latest", latestPosition);
      } catch (error) {
        console.error("Erreur lors de la récupération de la position:", error);
        socket.emit("error", { message: "Erreur lors de la récupération" });
      }
    });

    // Demander sa propre position (pour les techniciens)
    socket.on("position:get-my-latest", async () => {
      try {
        const latestPosition = await Position.findOne({ technician: socket.data.userId })
          .sort({ timestamp: -1 })
          .populate('technician', 'firstName lastName')
          .lean();

        socket.emit("position:my-latest", latestPosition);
      } catch (error) {
        console.error("Erreur lors de la récupération de ma position:", error);
        socket.emit("error", { message: "Erreur lors de la récupération de votre position" });
      }
    });

    // Demander sa position live (en mémoire)
    socket.on("position:get-my-live", () => {
      try {
        const livePosition = livePositionManager.getPosition(socket.data.userId);
        socket.emit("position:my-live", livePosition);
      } catch (error) {
        console.error("Erreur lors de la récupération de ma position live:", error);
        socket.emit("error", { message: "Erreur lors de la récupération de votre position live" });
      }
    });

    socket.on("technician:online", (payload) => {
  console.log(`👷 Technicien ${payload.userId} en ligne via socket ${socket.id}`);
  socket.join(`technician:${payload.userId}`);
});

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}, User: ${socket.data.userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
