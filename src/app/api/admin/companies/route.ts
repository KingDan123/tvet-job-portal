/**
 * GET /api/admin/companies - List companies for admin review
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { companies } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const userResult = await requireRole(request, ['admin']);
    if (userResult instanceof NextResponse) return userResult;

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    // Build WHERE conditions
    const conditions: any[] = [];
    
    if (filter === 'pending') {
      conditions.push(eq(companies.isVerified, false));
    } else if (filter === 'verified') {
      conditions.push(eq(companies.isVerified, true));
    }

    // Fetch companies with user info
    const companiesList: any = await db.query.companies.findMany({
      where: conditions.length > 0 ? conditions[0] : undefined,
      with: {
        user: {
          columns: {
            email: true,
          },
        },
      },
      orderBy: [desc(companies.createdAt)],
      limit: 100,
    });

    return NextResponse.json({
      success: true,
      data: companiesList,
    });
  } catch (error) {
    console.error('Admin companies fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}
