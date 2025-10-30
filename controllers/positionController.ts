import { Request, Response } from "express";
import Position from "../models/Position";
import { IUser } from "../models/users";
import { getIO } from "../socket";

// Interface pour TypeScript pour accéder au user injecté par le middleware
interface PositionRequest extends Request {
  user?: IUser;
}

export const sendPosition = async (req: PositionRequest, res: Response) => {
  const { latitude, longitude, speed, timestamp } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: "Latitude et longitude requises" });
  }
  if (!req.user) {
    return res.status(401).json({ message: "Utilisateur non authentifié" });
  }

  try {
    const ts = timestamp ? new Date(timestamp) : new Date();

    const positionDoc = await Position.create({
      technician: req.user._id,
      location: {
        type: "Point",
        coordinates: [longitude, latitude], // [lng, lat]
      },
      latitude,
      longitude,
      speed: speed || 0,
      timestamp: ts,
    });

    // Emit via Socket.io pour le temps réel
    try {
      const io = getIO();
      const updateData = {
        technicianId: req.user._id,
        latitude,
        longitude,
        speed: speed || 0,
        timestamp: ts,
        _id: positionDoc._id,
      };

      // Émettre aux admins seulement
      io.to("admins").emit("position:updated", updateData);

      // Émettre au technicien pour confirmation
      io.to(`user:${req.user._id}`).emit("position:confirmed", updateData);
    } catch (err) {
      // Si socket non initialisé, continuer sans bloquer
      console.warn("Socket.io not initialized or emit failed:", err);
    }

    return res.status(201).json({
      message: "Position enregistrée avec succès",
      position: positionDoc,
    });
  } catch (err: unknown) {
    console.error("Erreur lors de l'enregistrement de la position:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Nouvelle fonction pour récupérer la position actuelle d'un technicien
export const getCurrentPosition = async (
  req: PositionRequest,
  res: Response
) => {
  const { userId } = req.params;

  if (!req.user) {
    return res.status(401).json({ message: "Utilisateur non authentifié" });
  }

  // Vérifier les permissions
  if (req.user.role !== "admin" && req.user._id?.toString() !== userId) {
    return res
      .status(403)
      .json({ message: "Non autorisé à accéder à cette position" });
  }

  try {
    const latestPosition = await Position.findOne({ technician: userId })
      .sort({ timestamp: -1 })
      .populate("technician", "firstName lastName email role")
      .lean();

    if (!latestPosition) {
      return res
        .status(404)
        .json({ message: "Aucune position trouvée pour ce technicien" });
    }

    return res.status(200).json({
      message: "Position récupérée avec succès",
      position: latestPosition,
    });
  } catch (err: unknown) {
    console.error("Erreur lors de la récupération de la position:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Fonction pour récupérer toutes les positions actuelles (pour les admins)
export const getAllCurrentPositions = async (
  req: PositionRequest,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Utilisateur non authentifié" });
  }

  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Accès réservé aux administrateurs" });
  }

  try {
    // Récupérer la dernière position de chaque technicien
    const positions = await Position.aggregate([
      {
        $sort: { technician: 1, timestamp: -1 },
      },
      {
        $group: {
          _id: "$technician",
          latestPosition: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$latestPosition" },
      },
      {
        $lookup: {
          from: "users",
          localField: "technician",
          foreignField: "_id",
          as: "technician",
        },
      },
      {
        $unwind: "$technician",
      },
      {
        $project: {
          latitude: 1,
          longitude: 1,
          speed: 1,
          timestamp: 1,
          "technician.firstName": 1,
          "technician.lastName": 1,
          "technician.email": 1,
          "technician._id": 1,
        },
      },
    ]);

    return res.status(200).json({
      message: "Positions récupérées avec succès",
      count: positions.length,
      positions,
    });
  } catch (err: unknown) {
    console.error("Erreur lors de la récupération des positions:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
// Fonction pour récupérer toutes les positions live (en mémoire)
export const getLivePositions = async (req: PositionRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Utilisateur non authentifié" });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Accès réservé aux administrateurs" });
  }

  try {
    const { livePositionManager } = await import("../models/LivePosition");
    const livePositions = livePositionManager.getAllPositions();

    return res.status(200).json({
      message: "Positions live récupérées avec succès",
      count: livePositions.length,
      positions: livePositions,
      activeUsers: livePositionManager.getActiveCount()
    });
  } catch (err: unknown) {
    console.error("Erreur lors de la récupération des positions live:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// Fonction pour récupérer ma propre position actuelle (pour les techniciens)
export const getMyCurrentPosition = async (req: PositionRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Utilisateur non authentifié" });
  }

  try {
    // Récupérer la position live d'abord (plus récente)
    const { livePositionManager } = await import("../models/LivePosition");
    const livePosition = livePositionManager.getPosition(req.user._id?.toString() || "");

    if (livePosition) {
      return res.status(200).json({
        message: "Position live récupérée avec succès",
        position: {
          latitude: livePosition.latitude,
          longitude: livePosition.longitude,
          speed: livePosition.speed,
          timestamp: livePosition.timestamp,
          isLive: true,
          technician: {
            _id: req.user._id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email
          }
        },
      });
    }

    // Si pas de position live, récupérer la dernière en DB
    const latestPosition = await Position.findOne({ technician: req.user._id?.toString() })
      .sort({ timestamp: -1 })
      .populate('technician', 'firstName lastName email role')
      .lean();

    if (!latestPosition) {
      return res.status(404).json({ 
        message: "Aucune position trouvée",
        suggestion: "Envoyez votre première position via l'application mobile"
      });
    }

    return res.status(200).json({
      message: "Position récupérée avec succès",
      position: {
        ...latestPosition,
        isLive: false
      },
    });
  } catch (err: unknown) {
    console.error("Erreur lors de la récupération de ma position:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};