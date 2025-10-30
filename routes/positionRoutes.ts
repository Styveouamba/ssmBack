import express from "express";
import {
  sendPosition,
  getCurrentPosition,
  getAllCurrentPositions,
  getLivePositions,
  getMyCurrentPosition,
} from "../controllers/positionController";
import { protect } from "../middleware/auth";
import { getPositionsHistory } from "../controllers/positionHistoryController";

const router = express.Router();

// Envoi d'une position (protégé)
router.post("/", protect, sendPosition);

// Récupérer toutes les positions actuelles (admin seulement)
router.get("/current/all", protect, getAllCurrentPositions);

// Récupérer toutes les positions live (temps réel, admin seulement)
router.get("/live/all", protect, getLivePositions);

// Récupérer la position actuelle d'un technicien spécifique
router.get("/current/:userId", protect, getCurrentPosition);

// Récupérer ma propre position actuelle (pour les techniciens)
router.get("/my-current", protect, getMyCurrentPosition);

// Récupérer historique de positions pour un user (admin ou owner)
router.get("/history/:userId", protect, getPositionsHistory);

export default router;
