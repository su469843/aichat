/**
 * 认证控制器
 */
import { Request, Response } from 'express';
import { Database } from '../database/db';
export declare class AuthController {
    private db;
    private userRepo;
    constructor(db: Database);
    /**
     * 用户注册
     */
    register(req: Request, res: Response): Promise<void>;
    /**
     * 用户登录
     */
    login(req: Request, res: Response): Promise<void>;
    /**
     * 验证邮箱
     */
    verifyEmail(req: Request, res: Response): Promise<void>;
    /**
     * 获取当前用户信息
     */
    getCurrentUser(req: Request, res: Response): Promise<void>;
}
export default AuthController;
//# sourceMappingURL=authController.d.ts.map