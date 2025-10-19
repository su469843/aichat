"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRoutes = void 0;
/**
 * 聊天相关路由
 */
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
exports.chatRoutes = (0, express_1.Router)();
// 发送消息
exports.chatRoutes.post('/message', async (req, res) => {
    try {
        const result = await chatController_1.chatController.sendMessage(req.body);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
// 获取聊天历史
exports.chatRoutes.get('/history/:sessionId', async (req, res) => {
    try {
        const result = await chatController_1.chatController.getChatHistory(req.params.sessionId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
// 创建新的聊天会话
exports.chatRoutes.post('/session', async (req, res) => {
    try {
        const result = await chatController_1.chatController.createSession();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
exports.default = exports.chatRoutes;
//# sourceMappingURL=chatRoutes.js.map