/**
 * POST /api/applications - Submit job application
 * GET /api/applications - Get user's applications
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { applications, traineeProfiles, jobs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';
import { calculateMatchScore } from '@/lib/matching';
import { z } from 'zod';

const applicationSchema = z.object({
  jobId: z.string().uuid(),
  coverLetter: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Only trainees can apply
    const userResult = requireRole(request, ['trainee']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

    const body = await request.json();
    const data = applicationSchema.parse(body);

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

    // Check if job exists and is active
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, data.jobId),
    });

    if (!job || job.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Job not found or inactive' },
        { status: 404 }
      );
    }

    // Check if already applied
    const existing = await db.query.applications.findFirst({
      where: and(
        eq(applications.traineeId, trainee.id),
        eq(applications.jobId, data.jobId)
      ),
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You have already applied to this job' },
        { status: 400 }
      );
    }

    // Calculate match score
    const matchScore = await calculateMatchScore(trainee.id, data.jobId);

    // Create application
    const [newApplication] = await db.insert(applications).values({
      traineeId: trainee.id,
      jobId: data.jobId,
      coverLetter: data.coverLetter,
      matchScore: matchScore.score,
      status: 'applied',
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        ...newApplication,
        matchScore: matchScore.score,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Application error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userResult = requireRole(request, ['trainee']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

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

    // Fetch applications with job and company details
    const userApplications = await db.query.applications.findMany({
      where: eq(applications.traineeId, trainee.id),
      with: {
        job: {
          with: {
            company: {
              columns: {
                id: true,
                name: true,
                sector: true,
                city: true,
                employerBadge: true,
              },
            },
          },
        },
      },
      orderBy: (applications, { desc }) => [desc(applications.appliedAt)],
    });

    return NextResponse.json({
      success: true,
      data: userApplications,
    });
  } catch (error) {
    console.error('Applications fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
