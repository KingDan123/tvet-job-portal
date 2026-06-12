import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tracerSurveys } from '@/db/schema';
import { requireRole } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    const userResult = await requireRole(request, ['admin']);
    if (userResult instanceof NextResponse) return userResult;

    const { title, questions } = await request.json();

    const [newSurvey] = await db.insert(tracerSurveys).values({
      title,
      questions,
      dispatchedAt: new Date(),
    }).returning();

    return NextResponse.json({ success: true, data: newSurvey });
  } catch (error) { return NextResponse.json({ success: false }, { status: 500 }); }
}
