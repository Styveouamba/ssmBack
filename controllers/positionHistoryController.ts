import { Request, Response } from "express";
import Position from "../models/Position";
import { IUser } from "../models/users";

interface AuthRequest extends Request {
  user?: IUser;
}

// GET /api/technicians/position/history/:userId?from=2025-10-01&to=2025-10-29&limit=100
export const getPositionsHistory = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const { from, to, limit } = req.query;

  if (!req.user) {
    return res.status(401).json({ message: "Utilisateur non authentifié" });
  }

  // Vérifier que l'utilisateur a le droit d'accéder (admin ou propriétaire)
  if (req.user.role !== 'admin' && req.user.id.toString() !== userId) {
    return res.status(403).json({ message: "Non autorisé à accéder à cet historique" });
  }

  const query: any = { technician: userId };
  if (from || to) {
    query.timestamp = {};
    if (from) query.timestamp.$gte = new Date(String(from));
    if (to) query.timestamp.$lte = new Date(String(to));
  }

  const lim = Math.min(parseInt(String(limit || "500"), 10), 1000); // Limiter à 1000 max

  try {
    const positions = await Position.find(query)
      .sort({ timestamp: -1 })
      .limit(lim)
      .populate('technician', 'firstName lastName email')
      .lean()
      .exec();

    return res.status(200).json({ 
      message: "Historique récupéré avec succès",
      count: positions.length, 
      positions 
    });
  } catch (err) {
    console.error("Erreur récupération historique:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
