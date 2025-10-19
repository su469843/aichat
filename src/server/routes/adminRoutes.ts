/**
 * 管理员路由
 */
import { Router, Request, Response } from 'express';
import AdminController from '../controllers/adminController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { initializeDatabase } from '../database/db';

export const createAdminRoutes = (): Router => {
  const router = Router();

  // 应用认证中间件
  router.use(authMiddleware);
  router.use(adminMiddleware);

  router.get('/stats', async (req: Request, res: Response) => {
    try {
      const db = await initializeDatabase();
      const controller = new AdminController(db);
      await controller.getStats(req, res);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  router.get('/users', async (req: Request, res: Response) => {
    try {
      const db = await initializeDatabase();
      const controller = new AdminController(db);
      await controller.listUsers(req, res);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  router.delete('/users/:userId', async (req: Request, res: Response) => {
    try {
      const db = await initializeDatabase();
      const controller = new AdminController(db);
      await controller.deleteUser(req, res);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  router.get('/system-info', async (req: Request, res: Response) => {
    try {
      const db = await initializeDatabase();
      const controller = new AdminController(db);
      await controller.getSystemInfo(req, res);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  return router;
};

export default createAdminRoutes;
