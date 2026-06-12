import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { trainingSessions, sessionAttendance, traineeProfiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userResult = requireRole(request, ['officer', 'admin']);
    if (userResult instanceof NextResponse) return userResult;

    const { id: sessionId } = await params;

    const session = await db.query.trainingSessions.findFirst({
      where: eq(trainingSessions.id, sessionId)
    });

    const attendance = await db.query.sessionAttendance.findMany({
      where: eq(sessionAttendance.sessionId, sessionId),
      with: { trainee: true }
    });

    return NextResponse.json({
      success: true,
      sessionTitle: session?.title,
      data: attendance,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}

const toggleSchema = z.object({
  traineeId: z.string().uuid(),
  attended: z.boolean(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userResult = requireRole(request, ['officer', 'admin']);
    if (userResult instanceof NextResponse) return userResult;

    const { id: sessionId } = await params;
    const body = await request.json();
    const { traineeId, attended } = toggleSchema.parse(body);

    await db.update(sessionAttendance)
      .set({ attended, markedAt: new Date() })
      .where(and(
        eq(sessionAttendance.sessionId, sessionId),
        eq(sessionAttendance.traineeId, traineeId)
      ));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}
