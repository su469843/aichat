/**
 * 管理员控制器
 */
import { Request, Response } from 'express';
import { Database } from '../database/db';
export declare class AdminController {
    private db;
    private userRepo;
    constructor(db: Database);
    /**
     * 获取管理员统计信息
     */
    getStats(req: Request, res: Response): Promise<void>;
    /**
     * 获取所有用户
     */
    listUsers(req: Request, res: Response): Promise<void>;
    /**
     * 删除用户
     */
    deleteUser(req: Request, res: Response): Promise<void>;
    /**
     * 获取系统配置信息
     */
    getSystemInfo(req: Request, res: Response): Promise<void>;
}
export default AdminController;
//# sourceMappingURL=adminController.d.ts.map