/**
 * 认证相关的TypeScript类型
 */

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  isAdmin: boolean;
  isVerified: boolean;
  verificationToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: Omit<User, 'passwordHash' | 'verificationToken'>;
}

export interface VerifyEmailRequest {
  email: string;
  token: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalSessions: number;
  totalMessages: number;
  verifiedUsers: number;
}
