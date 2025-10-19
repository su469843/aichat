/**
 * 认证控制器
 */
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import AuthService from '../services/authService';
import UserRepository from '../repositories/userRepository';
import { Database } from '../database/db';
import { RegisterRequest, LoginRequest, VerifyEmailRequest } from '../types/auth';

export class AuthController {
  private userRepo: UserRepository;

  constructor(private db: Database) {
    this.userRepo = new UserRepository(db);
  }

  /**
   * 用户注册
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, username, password } = req.body as RegisterRequest;

      // 验证输入
      if (!email || !username || !password) {
        res.status(400).json({ success: false, error: 'Missing required fields' });
        return;
      }

      // 检查邮箱是否已存在
      const existingUser = await this.userRepo.findByEmail(email);
      if (existingUser) {
        res.status(409).json({ success: false, error: 'Email already exists' });
        return;
      }

      // 哈希密码
      const passwordHash = await AuthService.hashPassword(password);

      // 创建用户
      const user = await this.userRepo.create(email, username, passwordHash);

      // 生成验证token
      const verificationToken = AuthService.generateVerificationToken();
      await this.userRepo.setVerificationToken(email, verificationToken);

      // 发送验证邮件
      await AuthService.sendVerificationEmail(email, verificationToken);

      // 生成token
      const token = AuthService.generateToken(user);

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email to verify.',
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isAdmin: user.isAdmin,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, error: 'Registration failed' });
    }
  }

  /**
   * 用户登录
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as LoginRequest;

      // 验证输入
      if (!email || !password) {
        res.status(400).json({ success: false, error: 'Email and password required' });
        return;
      }

      // 查找用户
      const user = await this.userRepo.findByEmail(email);
      if (!user) {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
        return;
      }

      // 验证密码
      const passwordValid = await AuthService.verifyPassword(password, user.passwordHash);
      if (!passwordValid) {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
        return;
      }

      // 生成token
      const token = AuthService.generateToken(user);

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isAdmin: user.isAdmin,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, error: 'Login failed' });
    }
  }

  /**
   * 验证邮箱
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email, token } = req.body as VerifyEmailRequest;

      if (!email || !token) {
        res.status(400).json({ success: false, error: 'Missing required fields' });
        return;
      }

      // 查找用户
      const user = await this.userRepo.findByEmail(email);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      // 验证token
      if (user.verificationToken !== token) {
        res.status(401).json({ success: false, error: 'Invalid verification token' });
        return;
      }

      // 更新验证状态
      await this.userRepo.updateVerificationStatus(email, true);

      res.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ success: false, error: 'Verification failed' });
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const user = await this.userRepo.findById(req.user.userId);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isAdmin: user.isAdmin,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ success: false, error: 'Failed to get user' });
    }
  }
}

export default AuthController;
