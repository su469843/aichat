/**
 * 用户数据仓库
 */
import { Database } from '../database/db';
import { User } from '../types/auth';
export declare class UserRepository {
    private db;
    constructor(db: Database);
    /**
     * 创建用户
     */
    create(email: string, username: string, passwordHash: string): Promise<User>;
    /**
     * 根据邮箱查找用户
     */
    findByEmail(email: string): Promise<User | null>;
    /**
     * 根据ID查找用户
     */
    findById(id: string): Promise<User | null>;
    /**
     * 更新用户验证状态
     */
    updateVerificationStatus(email: string, isVerified: boolean): Promise<void>;
    /**
     * 设置验证token
     */
    setVerificationToken(email: string, token: string): Promise<void>;
    /**
     * 更新密码
     */
    updatePassword(userId: string, passwordHash: string): Promise<void>;
    /**
     * 获取所有用户
     */
    findAll(limit?: number, offset?: number): Promise<User[]>;
    /**
     * 获取用户总数
     */
    count(): Promise<number>;
    /**
     * 删除用户
     */
    delete(userId: string): Promise<void>;
    /**
     * 将数据库行映射到User对象
     */
    private mapToUser;
}
export default UserRepository;
//# sourceMappingURL=userRepository.d.ts.map