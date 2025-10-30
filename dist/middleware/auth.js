"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const users_1 = __importDefault(require("../models/users"));
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return res.status(401).json({ message: "Non autorisé, token manquant" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.JWT_SECRET);
        const user = await users_1.default.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "Utilisateur non trouvé" });
        }
        req.user = user;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Token invalide" });
    }
};
exports.protect = protect;
