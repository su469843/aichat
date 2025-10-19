"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthRoutes = void 0;
/**
 * 认证路由
 */
const express_1 = require("express");
const authController_1 = __importDefault(require("../controllers/authController"));
const auth_1 = require("../middleware/auth");
const db_1 = require("../database/db");
const createAuthRoutes = () => {
    const router = (0, express_1.Router)();
    router.post('/register', async (req, res) => {
        try {
            const db = await (0, db_1.initializeDatabase)();
            const controller = new authController_1.default(db);
            await controller.register(req, res);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Server error' });
        }
    });
    router.post('/login', async (req, res) => {
        try {
            const db = await (0, db_1.initializeDatabase)();
            const controller = new authController_1.default(db);
            await controller.login(req, res);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Server error' });
        }
    });
    router.post('/verify-email', async (req, res) => {
        try {
            const db = await (0, db_1.initializeDatabase)();
            const controller = new authController_1.default(db);
            await controller.verifyEmail(req, res);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Server error' });
        }
    });
    router.get('/me', auth_1.authMiddleware, async (req, res) => {
        try {
            const db = await (0, db_1.initializeDatabase)();
            const controller = new authController_1.default(db);
            await controller.getCurrentUser(req, res);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Server error' });
        }
    });
    return router;
};
exports.createAuthRoutes = createAuthRoutes;
exports.default = exports.createAuthRoutes;
//# sourceMappingURL=authRoutes.js.map