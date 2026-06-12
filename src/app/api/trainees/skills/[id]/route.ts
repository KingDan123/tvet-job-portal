/**
 * DELETE /api/trainees/skills/[id] - Remove a skill
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { traineeProfiles, traineeSkills } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userResult = await requireRole(request, ['trainee']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

    const { id } = await params;

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

    // Delete skill
    await db.delete(traineeSkills).where(
      and(
        eq(traineeSkills.traineeId, trainee.id),
        eq(traineeSkills.skillId, id)
      )
    );

    return NextResponse.json({
      success: true,
      message: 'Skill removed successfully',
    });
  } catch (error) {
    console.error('Skill remove error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove skill' },
      { status: 500 }
    );
  }
}
