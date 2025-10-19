"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
/**
 * 认证服务 - 处理用户注册、登录、验证等
 */
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const resend_1 = require("resend");
const appConfig_1 = __importDefault(require("../config/appConfig"));
const resend = new resend_1.Resend(appConfig_1.default.email.apiKey);
class AuthService {
    /**
     * 哈希密码
     */
    static async hashPassword(password) {
        return bcryptjs_1.default.hash(password, 10);
    }
    /**
     * 验证密码
     */
    static async verifyPassword(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    }
    /**
     * 生成JWT Token
     */
    static generateToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            isAdmin: user.isAdmin,
        };
        return jsonwebtoken_1.default.sign(payload, appConfig_1.default.jwt.secret, {
            expiresIn: appConfig_1.default.jwt.expiresIn,
        });
    }
    /**
     * 验证JWT Token
     */
    static verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, appConfig_1.default.jwt.secret);
        }
        catch {
            return null;
        }
    }
    /**
     * 生成邮件验证token
     */
    static generateVerificationToken() {
        return (0, uuid_1.v4)();
    }
    /**
     * 发送验证邮件
     */
    static async sendVerificationEmail(email, token) {
        if (!appConfig_1.default.email.apiKey) {
            console.warn('Resend API key not configured, skipping email send');
            return true; // 开发环境中返回true
        }
        try {
            const verifyLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify?token=${token}&email=${email}`;
            await resend.emails.send({
                from: appConfig_1.default.email.fromEmail,
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
        }
        catch (error) {
            console.error('Failed to send verification email:', error);
            return false;
        }
    }
    /**
     * 发送密码重置邮件
     */
    static async sendPasswordResetEmail(email, resetToken) {
        if (!appConfig_1.default.email.apiKey) {
            console.warn('Resend API key not configured');
            return true;
        }
        try {
            const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
            await resend.emails.send({
                from: appConfig_1.default.email.fromEmail,
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
        }
        catch (error) {
            console.error('Failed to send password reset email:', error);
            return false;
        }
    }
}
exports.AuthService = AuthService;
exports.default = AuthService;
//# sourceMappingURL=authService.js.map