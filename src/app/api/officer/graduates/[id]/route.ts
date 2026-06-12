import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { traineeProfiles, users, traineeSkills, skills } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userResult = requireRole(request, ['officer', 'admin']);
    if (userResult instanceof NextResponse) return userResult;

    const { id } = await params;

    const profile: any = await db.query.traineeProfiles.findFirst({
      where: eq(traineeProfiles.id, id),
      with: {
        user: {
          columns: { email: true, phone: true }
        },
        skills: {
          with: { skill: true }
        }
      }
    });

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('Fetch graduate error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
