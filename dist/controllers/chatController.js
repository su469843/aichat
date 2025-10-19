"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = void 0;
const helper_1 = require("../utils/helper");
// 临时存储聊天会话 (后续可替换为数据库)
const chatSessions = new Map();
exports.chatController = {
    /**
     * 发送消息
     */
    async sendMessage(request) {
        try {
            const { message, sessionId } = request;
            if (!message) {
                return {
                    success: false,
                    message: '消息不能为空',
                    error: 'Message is required',
                };
            }
            // 获取或创建会话
            const sid = sessionId || (0, helper_1.generateSessionId)();
            let session = chatSessions.get(sid);
            if (!session) {
                session = {
                    id: sid,
                    title: message.substring(0, 50),
                    messages: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            }
            // 添加用户消息
            const userMessage = {
                role: 'user',
                content: message,
                timestamp: new Date(),
            };
            session.messages.push(userMessage);
            // 这里应该调用AI模型API获取回复
            // 暂时返回测试消息
            const assistantMessage = {
                role: 'assistant',
                content: `收到你的消息: "${message}"\n\n(这是一个测试回复，实际的AI模型集成将在下一步进行)`,
                timestamp: new Date(),
            };
            session.messages.push(assistantMessage);
            session.updatedAt = new Date();
            // 保存会话
            chatSessions.set(sid, session);
            return {
                success: true,
                message: '消息已处理',
                sessionId: sid,
                data: {
                    userMessage,
                    assistantMessage,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: '处理消息时出错',
                error: error.message,
            };
        }
    },
    /**
     * 获取聊天历史
     */
    async getChatHistory(sessionId) {
        try {
            const session = chatSessions.get(sessionId);
            if (!session) {
                return {
                    success: false,
                    message: '找不到该会话',
                    error: 'Session not found',
                };
            }
            return {
                success: true,
                message: '获取历史成功',
                data: {
                    session,
                    messageCount: session.messages.length,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                message: '获取历史时出错',
                error: error.message,
            };
        }
    },
    /**
     * 创建新会话
     */
    async createSession() {
        try {
            const sessionId = (0, helper_1.generateSessionId)();
            const session = {
                id: sessionId,
                title: 'New Chat',
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            chatSessions.set(sessionId, session);
            return {
                success: true,
                message: '会话创建成功',
                sessionId,
                data: { session },
            };
        }
        catch (error) {
            return {
                success: false,
                message: '创建会话时出错',
                error: error.message,
            };
        }
    },
};
exports.default = exports.chatController;
//# sourceMappingURL=chatController.js.map