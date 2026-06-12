/**
 * Authentication and authorization middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './auth';
import { UserRole } from './types';

/**
 * Extract and verify JWT from Authorization header
 */
export async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return await verifyAccessToken(token);
}

/**
 * Require authentication
 */
export async function requireAuth(request: NextRequest) {
  const user = await getAuthUser(request);

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  return user;
}

/**
 * Require specific role(s)
 */
export async function requireRole(request: NextRequest, allowedRoles: UserRole[]) {
  const user = await getAuthUser(request);

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { success: false, error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return user;
}
