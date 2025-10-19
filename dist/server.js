"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 主服务器入口文件
 */
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const appConfig_1 = __importDefault(require("./server/config/appConfig"));
const authRoutes_1 = __importDefault(require("./server/routes/authRoutes"));
const adminRoutes_1 = __importDefault(require("./server/routes/adminRoutes"));
const db_1 = require("./server/database/db");
const errorHandler_1 = require("./server/middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = appConfig_1.default.port;
// 中间件
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// API 路由
app.use('/api/auth', (0, authRoutes_1.default)());
app.use('/api/admin', (0, adminRoutes_1.default)());
// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'AI Chat API is running' });
});
// 获取配置信息
app.get('/api/config', (req, res) => {
    res.json({
        modelMode: appConfig_1.default.modelMode,
        nodeEnv: appConfig_1.default.nodeEnv,
    });
});
// 静态文件服务（前端构建输出）
const publicPath = path_1.default.join(__dirname, '../dist/public');
app.use(express_1.default.static(publicPath));
// 错误处理
(0, errorHandler_1.setupErrorHandler)(app);
// 提供前端 HTML（用于SPA路由）
app.get('*', (req, res) => {
    const filePath = path_1.default.join(publicPath, 'index.html');
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).json({ success: false, error: 'Not found' });
        }
    });
});
// 启动服务器
const server = app.listen(PORT, async () => {
    console.log(`\n╔════════════════════════════════════════╗`);
    console.log(`║   🚀 AI Chat Server is running         ║`);
    console.log(`║   📍 http://localhost:${PORT}              ║`);
    console.log(`║   📦 Mode: ${appConfig_1.default.modelMode.padEnd(20)}   ║`);
    console.log(`║   🌍 Env: ${appConfig_1.default.nodeEnv.padEnd(20)}     ║`);
    console.log(`╚════════════════════════════════════════╝\n`);
    console.log('📚 Available API endpoints:');
    console.log('  Authentication:');
    console.log('    - POST   /api/auth/register      (注册新用户)');
    console.log('    - POST   /api/auth/login         (用户登录)');
    console.log('    - POST   /api/auth/verify-email  (验证邮箱)');
    console.log('    - GET    /api/auth/me            (获取当前用户)');
    console.log('  Admin:');
    console.log('    - GET    /api/admin/stats        (系统统计)');
    console.log('    - GET    /api/admin/users        (用户列表)');
    console.log('    - DELETE /api/admin/users/:id    (删除用户)');
    console.log('    - GET    /api/admin/system-info  (系统信息)\n');
    // 初始化数据库
    try {
        await (0, db_1.initializeDatabase)();
        console.log('✅ Database initialized successfully\n');
    }
    catch (error) {
        console.error('❌ Failed to initialize database:', error);
    }
});
// 优雅关闭
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
exports.default = app;
//# sourceMappingURL=server.js.map