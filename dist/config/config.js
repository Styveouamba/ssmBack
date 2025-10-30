"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    MONGO_URI: process.env.MONGO_URI ||
        "mongodb+srv://admin_styve:Cordialement_17@cluster0.w2oaucm.mongodb.net/ssm?retryWrites=true&w=majority&appName=Cluster0",
    JWT_SECRET: process.env.JWT_SECRET ||
        "0f4710d85ca5f36c090a2bcbf8c5eb15c94d8f22ee01c76639bb53fc5b102eeea05ffab98f9e24d885accc0d0bc2bfe95a8e522b61b0b5e09fcd3c04295c0e51",
    JWT_EXPIRE: "1d",
};
