import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { jobs, applications, traineeProfiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userResult = requireRole(request, ['company']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

    const { id: jobId } = await params;

    // Verify job belongs to this company
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, jobId),
      with: { company: true }
    });

    if (!job || job.company.userId !== user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized access to this job' }, { status: 403 });
    }

    // Fetch applicants
    const applicants = await db.query.applications.findMany({
      where: eq(applications.jobId, jobId),
      with: {
        trainee: true
      },
      orderBy: (applications, { desc }) => [desc(applications.matchScore)]
    });

    return NextResponse.json({
      success: true,
      jobTitle: job.titleEn,
      data: applicants,
    });
  } catch (error) {
    console.error('Fetch applicants error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch applicants' }, { status: 500 });
  }
}
