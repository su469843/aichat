import { User, JWTPayload } from '../types/auth';
export declare class AuthService {
    /**
     * 哈希密码
     */
    static hashPassword(password: string): Promise<string>;
    /**
     * 验证密码
     */
    static verifyPassword(password: string, hash: string): Promise<boolean>;
    /**
     * 生成JWT Token
     */
    static generateToken(user: User): string;
    /**
     * 验证JWT Token
     */
    static verifyToken(token: string): JWTPayload | null;
    /**
     * 生成邮件验证token
     */
    static generateVerificationToken(): string;
    /**
     * 发送验证邮件
     */
    static sendVerificationEmail(email: string, token: string): Promise<boolean>;
    /**
     * 发送密码重置邮件
     */
    static sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean>;
}
export default AuthService;
//# sourceMappingURL=authService.d.ts.map