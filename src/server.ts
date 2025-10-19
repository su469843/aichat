/**
 * 主服务器入口文件
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import appConfig from './server/config/appConfig';
import createAuthRoutes from './server/routes/authRoutes';
import createAdminRoutes from './server/routes/adminRoutes';
import { initializeDatabase } from './server/database/db';
import { setupErrorHandler } from './server/middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = appConfig.port;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API 路由
app.use('/api/auth', createAuthRoutes());
app.use('/api/admin', createAdminRoutes());

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Chat API is running' });
});

// 获取配置信息
app.get('/api/config', (req, res) => {
  res.json({
    modelMode: appConfig.modelMode,
    nodeEnv: appConfig.nodeEnv,
  });
});

// 静态文件服务（前端构建输出）
const publicPath = path.join(__dirname, '../dist/public');
app.use(express.static(publicPath));

// 错误处理
setupErrorHandler(app);

// 提供前端 HTML（用于SPA路由）
app.get('*', (req, res) => {
  const filePath = path.join(publicPath, 'index.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ success: false, error: 'Not found' });
    }
  });
});

// 启动服务器
const server = app.listen(PORT, async () => {
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║   🚀 AI Chat Server is running         ║`);
  console.log(`║   📍 http://localhost:${PORT}              ║`);
  console.log(`║   📦 Mode: ${appConfig.modelMode.padEnd(20)}   ║`);
  console.log(`║   🌍 Env: ${appConfig.nodeEnv.padEnd(20)}     ║`);
  console.log(`╚════════════════════════════════════════╝\n`);

  console.log('📚 Available API endpoints:');
  console.log('  Authentication:');
  console.log('    - POST   /api/auth/register      (注册新用户)');
  console.log('    - POST   /api/auth/login         (用户登录)');
  console.log('    - POST   /api/auth/verify-email  (验证邮箱)');
  console.log('    - GET    /api/auth/me            (获取当前用户)');
  console.log('  Admin:');
  console.log('    - GET    /api/admin/stats        (系统统计)');
  console.log('    - GET    /api/admin/users        (用户列表)');
  console.log('    - DELETE /api/admin/users/:id    (删除用户)');
  console.log('    - GET    /api/admin/system-info  (系统信息)\n');

  // 初始化数据库
  try {
    await initializeDatabase();
    console.log('✅ Database initialized successfully\n');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
  }
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;
