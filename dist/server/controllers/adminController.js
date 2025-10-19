"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const userRepository_1 = __importDefault(require("../repositories/userRepository"));
class AdminController {
    constructor(db) {
        this.db = db;
        this.userRepo = new userRepository_1.default(db);
    }
    /**
     * 获取管理员统计信息
     */
    async getStats(req, res) {
        try {
            const totalUsers = await this.userRepo.count();
            const sessionsResult = await this.db.query('SELECT COUNT(*) as count FROM sessions', []);
            const totalSessions = sessionsResult[0]?.count || 0;
            const messagesResult = await this.db.query('SELECT COUNT(*) as count FROM messages', []);
            const totalMessages = messagesResult[0]?.count || 0;
            const verifiedResult = await this.db.query('SELECT COUNT(*) as count FROM users WHERE is_verified = true', []);
            const verifiedUsers = verifiedResult[0]?.count || 0;
            const stats = {
                totalUsers,
                totalSessions,
                totalMessages,
                verifiedUsers,
            };
            res.json({ success: true, data: stats });
        }
        catch (error) {
            console.error('Get stats error:', error);
            res.status(500).json({ success: false, error: 'Failed to get stats' });
        }
    }
    /**
     * 获取所有用户
     */
    async listUsers(req, res) {
        try {
            const limit = Math.min(parseInt(req.query.limit) || 10, 100);
            const offset = parseInt(req.query.offset) || 0;
            const users = await this.userRepo.findAll(limit, offset);
            const total = await this.userRepo.count();
            res.json({
                success: true,
                data: users.map((u) => ({
                    id: u.id,
                    email: u.email,
                    username: u.username,
                    isAdmin: u.isAdmin,
                    isVerified: u.isVerified,
                    createdAt: u.createdAt,
                })),
                pagination: { limit, offset, total },
            });
        }
        catch (error) {
            console.error('List users error:', error);
            res.status(500).json({ success: false, error: 'Failed to list users' });
        }
    }
    /**
     * 删除用户
     */
    async deleteUser(req, res) {
        try {
            const { userId } = req.params;
            const user = await this.userRepo.findById(userId);
            if (!user) {
                res.status(404).json({ success: false, error: 'User not found' });
                return;
            }
            // 不允许删除管理员
            if (user.isAdmin) {
                res.status(400).json({ success: false, error: 'Cannot delete admin users' });
                return;
            }
            await this.userRepo.delete(userId);
            res.json({ success: true, message: 'User deleted successfully' });
        }
        catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({ success: false, error: 'Failed to delete user' });
        }
    }
    /**
     * 获取系统配置信息
     */
    async getSystemInfo(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    nodeEnv: process.env.NODE_ENV,
                    version: '1.0.0',
                    uptime: process.uptime(),
                    timestamp: new Date(),
                },
            });
        }
        catch (error) {
            console.error('Get system info error:', error);
            res.status(500).json({ success: false, error: 'Failed to get system info' });
        }
    }
}
exports.AdminController = AdminController;
exports.default = AdminController;
//# sourceMappingURL=adminController.js.map