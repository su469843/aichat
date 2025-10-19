/**
 * 认证服务 - 处理用户注册、登录、验证等
 */
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';
import appConfig from '../config/appConfig';
import { User, LoginRequest, RegisterRequest, JWTPayload } from '../types/auth';

const resend = new Resend(appConfig.email.apiKey);

export class AuthService {
  /**
   * 哈希密码
   */
  static async hashPassword(password: string): Promise<string> {
    return bcryptjs.hash(password, 10);
  }

  /**
   * 验证密码
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(password, hash);
  }

  /**
   * 生成JWT Token
   */
  static generateToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };
    return jwt.sign(payload, appConfig.jwt.secret, {
      expiresIn: appConfig.jwt.expiresIn as string | number,
    } as unknown as jwt.SignOptions);
  }

  /**
   * 验证JWT Token
   */
  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, appConfig.jwt.secret) as JWTPayload;
    } catch {
      return null;
    }
  }

  /**
   * 生成邮件验证token
   */
  static generateVerificationToken(): string {
    return uuidv4();
  }

  /**
   * 发送验证邮件
   */
  static async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    if (!appConfig.email.apiKey) {
      console.warn('Resend API key not configured, skipping email send');
      return true; // 开发环境中返回true
    }

    try {
      const verifyLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?token=${token}&email=${email}`;
      
      await resend.emails.send({
        from: appConfig.email.fromEmail,
        to: email,
        subject: 'Verify Your Email - AI Chat',
        html: `
          <h1>Welcome to AI Chat!</h1>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${verifyLink}" style="padding: 10px 20px; background-color: #0084ff; color: white; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
          <p>Or copy and paste this link:</p>
          <p>${verifyLink}</p>
          <p>This link expires in 24 hours.</p>
        `,
      });

      return true;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return false;
    }
  }

  /**
   * 发送密码重置邮件
   */
  static async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    if (!appConfig.email.apiKey) {
      console.warn('Resend API key not configured');
      return true;
    }

    try {
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      
      await resend.emails.send({
        from: appConfig.email.fromEmail,
        to: email,
        subject: 'Reset Your Password - AI Chat',
        html: `
          <h1>Password Reset Request</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}" style="padding: 10px 20px; background-color: #0084ff; color: white; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
          <p>This link expires in 1 hour.</p>
        `,
      });

      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }
}

export default AuthService;
