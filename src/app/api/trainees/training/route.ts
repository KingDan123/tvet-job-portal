/**
 * GET /api/trainees/training - Get trainee's training sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { traineeProfiles, sessionAttendance, trainingSessions } from '@/db/schema';
import { eq, gte, lte } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const userResult = await requireRole(request, ['trainee']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'upcoming';

    // Get trainee profile
    const trainee = await db.query.traineeProfiles.findFirst({
      where: eq(traineeProfiles.userId, user.id),
    });

    if (!trainee) {
      return NextResponse.json(
        { success: false, error: 'Trainee profile not found' },
        { status: 404 }
      );
    }

    // Get attendance records
    const attendanceRecords: any = await db.query.sessionAttendance.findMany({
      where: eq(sessionAttendance.traineeId, trainee.id),
      with: {
        session: true,
      },
    });

    const now = new Date();
    const sessionsData = attendanceRecords
      .map((record: any) => ({
        ...record.session,
        attended: record.attended,
      }))
      .filter((session: any) => {
        const sessionDate = new Date(session.scheduledAt);
        if (filter === 'upcoming') {
          return sessionDate >= now;
        } else {
          return sessionDate < now;
        }
      });

    return NextResponse.json({
      success: true,
      data: sessionsData,
    });
  } catch (error) {
    console.error('Training sessions fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch training sessions' },
      { status: 500 }
    );
  }
}
