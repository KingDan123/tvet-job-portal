import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { applications, jobs, companies } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum(['applied', 'reviewed', 'shortlisted', 'referred', 'hired', 'rejected']),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userResult = requireRole(request, ['company', 'officer']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

    const { id: appId } = await params;
    const body = await request.json();
    const { status } = statusSchema.parse(body);

    // If company, verify application belongs to their job
    if (user.role === 'company') {
      const application = await db.query.applications.findFirst({
        where: eq(applications.id, appId),
        with: {
          job: { with: { company: true } }
        }
      });

      if (!application || application.job.company.userId !== user.id) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
      }
    }

    // Update status
    await db.update(applications)
      .set({ status, updatedAt: new Date() })
      .where(eq(applications.id, appId));

    return NextResponse.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update status' }, { status: 500 });
  }
}
