/**
 * JWT认证中间件
 */
import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/authService';
import { JWTPayload } from '../types/auth';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, error: 'No token provided' });
    return;
  }

  const payload = AuthService.verifyToken(token);
  if (!payload) {
    res.status(401).json({ success: false, error: 'Invalid token' });
    return;
  }

  req.user = payload;
  next();
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user?.isAdmin) {
    res.status(403).json({ success: false, error: 'Admin access required' });
    return;
  }
  next();
};

export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    const payload = AuthService.verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  next();
};
