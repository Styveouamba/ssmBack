"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_1 = require("./socket");
const db_1 = __importDefault(require("./config/db"));
const positionRoutes_1 = __importDefault(require("./routes/positionRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
// Configuration CORS
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));
app.use(express_1.default.json());
app.get("/", (_req, res) => {
    res.send("🚀 Backend TypeScript + MongoDB fonctionne !");
});
app.get("/api/health", async (_req, res) => {
    try {
        await (0, db_1.default)();
        res.status(200).json({
            status: 'OK',
            message: 'API is running',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    }
    catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'ERROR',
            message: 'Database connection failed'
        });
    }
});
app.use("/api/technicians/position", positionRoutes_1.default);
app.use("/api/auth", authRoutes_1.default);
// Connexion à la base de données
(0, db_1.default)().catch((err) => {
    console.error("Erreur lors de la connexion à la base de données :", err);
});
// Pour le développement local
if (process.env.NODE_ENV !== 'production') {
    const httpServer = (0, http_1.createServer)(app);
    // Init Socket.io (toute la logique est maintenant dans socket.ts)
    (0, socket_1.initSocket)(httpServer);
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
// ========================
// EXPORT APP POUR VERCEL
// ========================
exports.default = app;
