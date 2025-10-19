"use strict";
/**
 * 辅助工具函数
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMessageId = exports.generateSessionId = void 0;
/**
 * 生成会话ID
 */
const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
exports.generateSessionId = generateSessionId;
/**
 * 生成消息ID
 */
const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
exports.generateMessageId = generateMessageId;
//# sourceMappingURL=helper.js.map