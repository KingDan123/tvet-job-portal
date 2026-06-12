/**
 * GET /api/officer/training - List training sessions
 * POST /api/officer/training - Create training session (FLW-3)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { trainingSessions, sessionAttendance } from '@/db/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';
import { z } from 'zod';

const trainingCreateSchema = z.object({
  title: z.string().min(5),
  description: z.string().optional(),
  type: z.enum(['soft_skill', 'technical', 'orientation']),
  scheduledAt: z.string().datetime(),
  duration: z.number().min(30).max(480),
  location: z.string().min(1),
  capacity: z.number().min(1).max(200),
  inviteGraduates: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const userResult = requireRole(request, ['officer', 'admin']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'upcoming';

    const now = new Date();
    let whereCondition;

    // Build filter condition
    switch (filter) {
      case 'upcoming':
        whereCondition = and(
          user.institutionId ? eq(trainingSessions.institutionId, user.institutionId) : sql`true`,
          gte(trainingSessions.scheduledAt, now)
        );
        break;
      case 'past':
        whereCondition = and(
          user.institutionId ? eq(trainingSessions.institutionId, user.institutionId) : sql`true`,
          lte(trainingSessions.scheduledAt, now)
        );
        break;
      default: // 'all'
        whereCondition = user.institutionId 
          ? eq(trainingSessions.institutionId, user.institutionId) 
          : sql`true`;
    }

    // Fetch sessions
    const sessions = await db.query.trainingSessions.findMany({
      where: whereCondition,
      orderBy: [desc(trainingSessions.scheduledAt)],
      limit: 50,
    });

    // Get attendance counts for each session
    const sessionsWithCounts = await Promise.all(
      sessions.map(async (session) => {
        const [countResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(sessionAttendance)
          .where(eq(sessionAttendance.sessionId, session.id));

        return {
          ...session,
          attendanceCount: Number(countResult.count) || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: sessionsWithCounts,
    });
  } catch (error) {
    console.error('Training sessions fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch training sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userResult = requireRole(request, ['officer', 'admin']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

    const body = await request.json();
    const data = trainingCreateSchema.parse(body);

    if (!user.institutionId) {
      return NextResponse.json(
        { success: false, error: 'Institution ID required' },
        { status: 400 }
      );
    }

    // Create training session
    const [newSession] = await db.insert(trainingSessions).values({
      institutionId: user.institutionId,
      officerId: user.id,
      title: data.title,
      description: data.description,
      type: data.type,
      scheduledAt: new Date(data.scheduledAt),
      duration: data.duration,
      location: data.location,
      capacity: data.capacity,
    }).returning();

    // If graduates are invited, create attendance records
    if (data.inviteGraduates && data.inviteGraduates.length > 0) {
      const attendanceRecords = data.inviteGraduates.map(traineeId => ({
        sessionId: newSession.id,
        traineeId,
        attended: false,
      }));

      await db.insert(sessionAttendance).values(attendanceRecords);
    }

    // TODO: Send notification to invited graduates

    return NextResponse.json({
      success: true,
      message: 'Training session created successfully',
      data: newSession,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Training creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create training session' },
      { status: 500 }
    );
  }
}
