/**
 * JWT认证中间件
 */
import { Request, Response, NextFunction } from 'express';
import { JWTPayload } from '../types/auth';
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const adminMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const optionalAuthMiddleware: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map