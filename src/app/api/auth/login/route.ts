/**
 * POST /api/auth/login
 * User login endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { verifyPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    // Find user
    const user = await db.query.users.findFirst({
      where: and(
        eq(users.email, data.email),
        eq(users.isActive, true)
      ),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate tokens
    const authUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId || undefined,
      languagePref: user.languagePref,
    };

    const accessToken = generateAccessToken(authUser);
    const refreshToken = generateRefreshToken(authUser);

    // Update last login
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    const response = NextResponse.json({
      success: true,
      data: {
        user: authUser,
        accessToken,
      },
    });

    // Set refresh token as HTTP-only cookie
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
