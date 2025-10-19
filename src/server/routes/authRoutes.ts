/**
 * 认证路由
 */
import { Router, Request, Response } from 'express';
import AuthController from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { initializeDatabase } from '../database/db';

export const createAuthRoutes = (): Router => {
  const router = Router();

  router.post('/register', async (req: Request, res: Response) => {
    try {
      const db = await initializeDatabase();
      const controller = new AuthController(db);
      await controller.register(req, res);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  router.post('/login', async (req: Request, res: Response) => {
    try {
      const db = await initializeDatabase();
      const controller = new AuthController(db);
      await controller.login(req, res);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  router.post('/verify-email', async (req: Request, res: Response) => {
    try {
      const db = await initializeDatabase();
      const controller = new AuthController(db);
      await controller.verifyEmail(req, res);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  router.get('/me', authMiddleware, async (req: Request, res: Response) => {
    try {
      const db = await initializeDatabase();
      const controller = new AuthController(db);
      await controller.getCurrentUser(req, res);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  return router;
};

export default createAuthRoutes;
