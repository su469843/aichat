"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRepository = exports.MessageRepository = void 0;
/**
 * 消息存储库
 * 提供 SQL 数据库操作接口
 */
const db_1 = require("../database/db");
const helper_1 = require("../utils/helper");
class MessageRepository {
    /**
     * 保存消息到数据库
     */
    async saveMessage(sessionId, role, content) {
        const db = (0, db_1.getDatabase)();
        const messageId = (0, helper_1.generateMessageId)();
        const sql = `
      INSERT INTO messages (id, session_id, role, content, created_at)
      VALUES ($1, $2, $3, $4, NOW())
    `;
        await db.execute(sql, [messageId, sessionId, role, content]);
        return messageId;
    }
    /**
     * 获取会话的所有消息
     */
    async getSessionMessages(sessionId) {
        const db = (0, db_1.getDatabase)();
        const sql = `
      SELECT id, role, content, created_at as timestamp
      FROM messages
      WHERE session_id = $1
      ORDER BY created_at ASC
    `;
        const rows = await db.query(sql, [sessionId]);
        return rows.map((row) => ({
            id: row.id,
            role: row.role,
            content: row.content,
            timestamp: row.timestamp,
        }));
    }
    /**
     * 获取指定数量的最新消息
     */
    async getLatestMessages(sessionId, limit = 10) {
        const db = (0, db_1.getDatabase)();
        const sql = `
      SELECT id, role, content, created_at as timestamp
      FROM messages
      WHERE session_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
        const rows = await db.query(sql, [sessionId, limit]);
        return rows
            .reverse()
            .map((row) => ({
            id: row.id,
            role: row.role,
            content: row.content,
            timestamp: row.timestamp,
        }));
    }
    /**
     * 删除指定消息
     */
    async deleteMessage(messageId) {
        const db = (0, db_1.getDatabase)();
        const sql = `
      DELETE FROM messages
      WHERE id = $1
    `;
        await db.execute(sql, [messageId]);
    }
    /**
     * 删除会话的所有消息
     */
    async deleteSessionMessages(sessionId) {
        const db = (0, db_1.getDatabase)();
        const sql = `
      DELETE FROM messages
      WHERE session_id = $1
    `;
        await db.execute(sql, [sessionId]);
    }
}
exports.MessageRepository = MessageRepository;
exports.messageRepository = new MessageRepository();
//# sourceMappingURL=messageRepository.js.map