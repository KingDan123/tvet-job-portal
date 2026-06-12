import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { traineeProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum(['seeking', 'employed', 'not_seeking']),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userResult = await requireRole(request, ['officer', 'admin']);
    if (userResult instanceof NextResponse) return userResult;

    const { id } = await params;
    const body = await request.json();
    const { status } = statusSchema.parse(body);

    await db.update(traineeProfiles)
      .set({ employmentStatus: status, updatedAt: new Date() })
      .where(eq(traineeProfiles.id, id));

    return NextResponse.json({ success: true, message: 'Status updated' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}
