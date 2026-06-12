import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { placementFollowups } from '@/db/schema';
import { requireRole } from '@/lib/middleware';
import { z } from 'zod';

const followupSchema = z.object({
  followupDay: z.number(),
  traineeSatisfaction: z.number().min(1).max(5),
  employerSatisfaction: z.number().min(1).max(5),
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userResult = requireRole(request, ['officer', 'admin']);
    if (userResult instanceof NextResponse) return userResult;

    const { id: placementId } = await params;
    const body = await request.json();
    const data = followupSchema.parse(body);

    await db.insert(placementFollowups).values({
      placementId,
      followupDay: data.followupDay,
      traineeSatisfaction: data.traineeSatisfaction,
      employerSatisfaction: data.employerSatisfaction,
      notes: data.notes,
      scheduledAt: new Date(),
      completedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
