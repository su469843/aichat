"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminRoutes = void 0;
/**
 * 管理员路由
 */
const express_1 = require("express");
const adminController_1 = __importDefault(require("../controllers/adminController"));
const auth_1 = require("../middleware/auth");
const db_1 = require("../database/db");
const createAdminRoutes = () => {
    const router = (0, express_1.Router)();
    // 应用认证中间件
    router.use(auth_1.authMiddleware);
    router.use(auth_1.adminMiddleware);
    router.get('/stats', async (req, res) => {
        try {
            const db = await (0, db_1.initializeDatabase)();
            const controller = new adminController_1.default(db);
            await controller.getStats(req, res);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Server error' });
        }
    });
    router.get('/users', async (req, res) => {
        try {
            const db = await (0, db_1.initializeDatabase)();
            const controller = new adminController_1.default(db);
            await controller.listUsers(req, res);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Server error' });
        }
    });
    router.delete('/users/:userId', async (req, res) => {
        try {
            const db = await (0, db_1.initializeDatabase)();
            const controller = new adminController_1.default(db);
            await controller.deleteUser(req, res);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Server error' });
        }
    });
    router.get('/system-info', async (req, res) => {
        try {
            const db = await (0, db_1.initializeDatabase)();
            const controller = new adminController_1.default(db);
            await controller.getSystemInfo(req, res);
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Server error' });
        }
    });
    return router;
};
exports.createAdminRoutes = createAdminRoutes;
exports.default = exports.createAdminRoutes;
//# sourceMappingURL=adminRoutes.js.map