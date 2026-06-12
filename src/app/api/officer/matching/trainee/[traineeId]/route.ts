/**
 * GET /api/officer/matching/trainee/[traineeId]
 * Find top matching jobs for a trainee (FLW-6)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/middleware';
import { findTopMatchesForTrainee } from '@/lib/matching';
import { db } from '@/db';
import { traineeProfiles, jobs } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ traineeId: string }> }
) {
  try {
    const userResult = await requireRole(request, ['officer', 'admin']);
    if (userResult instanceof NextResponse) return userResult;

    const { traineeId } = await params;

    // Find top matches
    const matches = await findTopMatchesForTrainee(traineeId, 10);

    // Enrich with trainee and job details
    const enrichedMatches = await Promise.all(
      matches.map(async (match) => {
        const trainee = await db.query.traineeProfiles.findFirst({
          where: eq(traineeProfiles.id, match.traineeId),
        });

        const job = await db.query.jobs.findFirst({
          where: eq(jobs.id, match.jobId),
          with: {
            company: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        });

        return {
          ...match,
          trainee: trainee ? {
            fullName: trainee.fullName,
            program: trainee.program,
            graduationYear: trainee.graduationYear,
          } : null,
          job: job ? {
            titleEn: job.titleEn,
            company: job.company,
          } : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedMatches.filter(m => m.trainee && m.job),
    });
  } catch (error) {
    console.error('Matching error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to find matches' },
      { status: 500 }
    );
  }
}
