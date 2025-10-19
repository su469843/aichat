/**
 * 用户数据仓库
 */
import { Database } from '../database/db';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../types/auth';

export class UserRepository {
  constructor(private db: Database) {}

  /**
   * 创建用户
   */
  async create(email: string, username: string, passwordHash: string): Promise<User> {
    const userId = uuidv4();
    const now = new Date();

    await this.db.execute(
      `INSERT INTO users (id, email, username, password_hash, is_admin, is_verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, false, false, ?, ?)`,
      [userId, email, username, passwordHash, now, now]
    );

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
  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!result || result.length === 0) {
      return null;
    }

    return this.mapToUser(result[0]);
  }

  /**
   * 根据ID查找用户
   */
  async findById(id: string): Promise<User | null> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (!result || result.length === 0) {
      return null;
    }

    return this.mapToUser(result[0]);
  }

  /**
   * 更新用户验证状态
   */
  async updateVerificationStatus(email: string, isVerified: boolean): Promise<void> {
    await this.db.execute(
      'UPDATE users SET is_verified = ?, updated_at = ? WHERE email = ?',
      [isVerified, new Date(), email]
    );
  }

  /**
   * 设置验证token
   */
  async setVerificationToken(email: string, token: string): Promise<void> {
    await this.db.execute(
      'UPDATE users SET verification_token = ? WHERE email = ?',
      [token, email]
    );
  }

  /**
   * 更新密码
   */
  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.db.execute(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?',
      [passwordHash, new Date(), userId]
    );
  }

  /**
   * 获取所有用户
   */
  async findAll(limit: number = 10, offset: number = 0): Promise<User[]> {
    const result = await this.db.query(
      'SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    return result.map((row: unknown) => this.mapToUser(row));
  }

  /**
   * 获取用户总数
   */
  async count(): Promise<number> {
    const result = await this.db.query('SELECT COUNT(*) as count FROM users', []);
    return result[0]?.count || 0;
  }

  /**
   * 删除用户
   */
  async delete(userId: string): Promise<void> {
    await this.db.execute('DELETE FROM users WHERE id = ?', [userId]);
  }

  /**
   * 将数据库行映射到User对象
   */
  private mapToUser(row: unknown): User {
    const data = row as Record<string, unknown>;
    return {
      id: data.id as string,
      email: data.email as string,
      username: data.username as string,
      passwordHash: data.password_hash as string,
      isAdmin: Boolean(data.is_admin),
      isVerified: Boolean(data.is_verified),
      verificationToken: data.verification_token as string | undefined,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    };
  }
}

export default UserRepository;
