"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const db_1 = __importDefault(require("../config/db"));
async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }
    try {
        await (0, db_1.default)();
        res.status(200).json({
            status: "OK",
            message: "API is running",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || "development",
        });
    }
    catch (error) {
        console.error("Health check failed:", error);
        res.status(500).json({
            status: "ERROR",
            message: "Database connection failed",
        });
    }
}
