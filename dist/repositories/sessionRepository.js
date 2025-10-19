"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionRepository = exports.SessionRepository = void 0;
/**
 * 聊天会话存储库
 * 提供 SQL 数据库操作接口
 */
const db_1 = require("../database/db");
const helper_1 = require("../utils/helper");
class SessionRepository {
    /**
     * 创建新的聊天会话
     */
    async createSession(userId, title = 'New Chat') {
        const db = (0, db_1.getDatabase)();
        const sessionId = (0, helper_1.generateSessionId)();
        const sql = `
      INSERT INTO chat_sessions (id, user_id, title, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
    `;
        await db.execute(sql, [sessionId, userId || null, title]);
        return sessionId;
    }
    /**
     * 获取聊天会话
     */
    async getSession(sessionId) {
        const db = (0, db_1.getDatabase)();
        const sql = `
      SELECT id, user_id, title, created_at, updated_at
      FROM chat_sessions
      WHERE id = $1
    `;
        const rows = await db.query(sql, [sessionId]);
        return rows.length > 0 ? rows[0] : null;
    }
    /**
     * 获取用户的所有会话
     */
    async getUserSessions(userId) {
        const db = (0, db_1.getDatabase)();
        const sql = `
      SELECT id, user_id, title, created_at, updated_at
      FROM chat_sessions
      WHERE user_id = $1
      ORDER BY updated_at DESC
    `;
        return await db.query(sql, [userId]);
    }
    /**
     * 更新会话标题
     */
    async updateSessionTitle(sessionId, title) {
        const db = (0, db_1.getDatabase)();
        const sql = `
      UPDATE chat_sessions
      SET title = $1, updated_at = NOW()
      WHERE id = $2
    `;
        await db.execute(sql, [title, sessionId]);
    }
    /**
     * 删除会话（同时删除所有消息）
     */
    async deleteSession(sessionId) {
        const db = (0, db_1.getDatabase)();
        const sql = `
      DELETE FROM chat_sessions
      WHERE id = $1
    `;
        await db.execute(sql, [sessionId]);
    }
}
exports.SessionRepository = SessionRepository;
exports.sessionRepository = new SessionRepository();
//# sourceMappingURL=sessionRepository.js.map