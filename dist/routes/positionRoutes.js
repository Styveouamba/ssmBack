"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const positionController_1 = require("../controllers/positionController");
const auth_1 = require("../middleware/auth");
const positionHistoryController_1 = require("../controllers/positionHistoryController");
const router = express_1.default.Router();
// Envoi d'une position (protégé)
router.post("/", auth_1.protect, positionController_1.sendPosition);
// Récupérer toutes les positions actuelles (admin seulement)
router.get("/current/all", auth_1.protect, positionController_1.getAllCurrentPositions);
// Récupérer toutes les positions live (temps réel, admin seulement)
router.get("/live/all", auth_1.protect, positionController_1.getLivePositions);
// Récupérer la position actuelle d'un technicien spécifique
router.get("/current/:userId", auth_1.protect, positionController_1.getCurrentPosition);
// Récupérer ma propre position actuelle (pour les techniciens)
router.get("/my-current", auth_1.protect, positionController_1.getMyCurrentPosition);
// Récupérer historique de positions pour un user (admin ou owner)
router.get("/history/:userId", auth_1.protect, positionHistoryController_1.getPositionsHistory);
exports.default = router;
