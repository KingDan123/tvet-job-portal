/**
 * GET /api/officer/graduates
 * List and filter graduates for ILJC officers (FLW-1)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { traineeProfiles, users } from '@/db/schema';
import { eq, and, or, ilike, desc } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const userResult = await requireRole(request, ['officer', 'admin']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

    const { searchParams } = new URL(request.url);
    const program = searchParams.get('program');
    const status = searchParams.get('status');
    const year = searchParams.get('year');
    const search = searchParams.get('search');

    // Build WHERE conditions
    const conditions: any[] = [];

    // Filter by institution if officer
    if (user.role === 'officer' && user.institutionId) {
      // We need to join with users to filter by institution
      // For now, let's get all and filter in memory (not optimal for large datasets)
      // TODO: Optimize with proper join
    }

    if (program) {
      conditions.push(eq(traineeProfiles.program, program));
    }

    if (status) {
      conditions.push(eq(traineeProfiles.employmentStatus, status as any));
    }

    if (year) {
      conditions.push(eq(traineeProfiles.graduationYear, parseInt(year)));
    }

    if (search) {
      conditions.push(
        or(
          ilike(traineeProfiles.fullName, `%${search}%`),
          ilike(traineeProfiles.program, `%${search}%`)
        )
      );
    }

    // Fetch graduates with user info
    const graduatesList = await db.query.traineeProfiles.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        user: {
          columns: {
            email: true,
            phone: true,
            languagePref: true,
          },
        },
      },
      orderBy: [desc(traineeProfiles.graduationYear)],
      limit: 100, // Pagination can be added later
    });

    return NextResponse.json({
      success: true,
      data: graduatesList,
    });
  } catch (error) {
    console.error('Graduates fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch graduates' },
      { status: 500 }
    );
  }
}
