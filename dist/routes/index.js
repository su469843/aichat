"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
/**
 * 主路由文件
 */
const express_1 = require("express");
const chatRoutes_1 = require("./chatRoutes");
const configRoutes_1 = require("./configRoutes");
exports.router = (0, express_1.Router)();
// API路由
exports.router.use('/chat', chatRoutes_1.chatRoutes);
exports.router.use('/config', configRoutes_1.configRoutes);
// 健康检查
exports.router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'AI Chat API is running' });
});
exports.default = exports.router;
//# sourceMappingURL=index.js.map