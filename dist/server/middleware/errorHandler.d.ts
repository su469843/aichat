/**
 * 错误处理中间件
 */
import { Express, Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string);
}
export declare const errorHandler: (err: Error | AppError, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const setupErrorHandler: (app: Express) => void;
//# sourceMappingURL=errorHandler.d.ts.map