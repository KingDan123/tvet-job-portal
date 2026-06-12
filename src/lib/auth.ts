/**
 * Authentication utilities
 * JWT token generation, password hashing, session management
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWTPayload, AuthUser } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'tvet-hub-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'tvet-hub-refresh-secret-change-in-production';

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate access token (15 minutes)
 */
export function generateAccessToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '15m' });
}

/**
 * Generate refresh token (7 days)
 */
export function generateRefreshToken(user: AuthUser): string {
  return jwt.sign(user, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Generate random OTP (6 digits)
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate random verification token
 */
export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
