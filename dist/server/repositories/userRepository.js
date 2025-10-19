"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const uuid_1 = require("uuid");
class UserRepository {
    constructor(db) {
        this.db = db;
    }
    /**
     * 创建用户
     */
    async create(email, username, passwordHash) {
        const userId = (0, uuid_1.v4)();
        const now = new Date();
        await this.db.execute(`INSERT INTO users (id, email, username, password_hash, is_admin, is_verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, false, false, ?, ?)`, [userId, email, username, passwordHash, now, now]);
        return {
            id: userId,
            email,
            username,
            passwordHash,
            isAdmin: false,
            isVerified: false,
            createdAt: now,
            updatedAt: now,
        };
    }
    /**
     * 根据邮箱查找用户
     */
    async findByEmail(email) {
        const result = await this.db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (!result || result.length === 0) {
            return null;
        }
        return this.mapToUser(result[0]);
    }
    /**
     * 根据ID查找用户
     */
    async findById(id) {
        const result = await this.db.query('SELECT * FROM users WHERE id = ?', [id]);
        if (!result || result.length === 0) {
            return null;
        }
        return this.mapToUser(result[0]);
    }
    /**
     * 更新用户验证状态
     */
    async updateVerificationStatus(email, isVerified) {
        await this.db.execute('UPDATE users SET is_verified = ?, updated_at = ? WHERE email = ?', [isVerified, new Date(), email]);
    }
    /**
     * 设置验证token
     */
    async setVerificationToken(email, token) {
        await this.db.execute('UPDATE users SET verification_token = ? WHERE email = ?', [token, email]);
    }
    /**
     * 更新密码
     */
    async updatePassword(userId, passwordHash) {
        await this.db.execute('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?', [passwordHash, new Date(), userId]);
    }
    /**
     * 获取所有用户
     */
    async findAll(limit = 10, offset = 0) {
        const result = await this.db.query('SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
        return result.map((row) => this.mapToUser(row));
    }
    /**
     * 获取用户总数
     */
    async count() {
        const result = await this.db.query('SELECT COUNT(*) as count FROM users', []);
        return result[0]?.count || 0;
    }
    /**
     * 删除用户
     */
    async delete(userId) {
        await this.db.execute('DELETE FROM users WHERE id = ?', [userId]);
    }
    /**
     * 将数据库行映射到User对象
     */
    mapToUser(row) {
        const data = row;
        return {
            id: data.id,
            email: data.email,
            username: data.username,
            passwordHash: data.password_hash,
            isAdmin: Boolean(data.is_admin),
            isVerified: Boolean(data.is_verified),
            verificationToken: data.verification_token,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    }
}
exports.UserRepository = UserRepository;
exports.default = UserRepository;
//# sourceMappingURL=userRepository.js.map