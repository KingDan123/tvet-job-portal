/**
 * GET /api/jobs - List and filter jobs
 * POST /api/jobs - Create new job (company only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { jobs, companies } from '@/db/schema';
import { eq, and, or, ilike, desc, sql } from 'drizzle-orm';
import { getAuthUser, requireRole } from '@/lib/middleware';
import { hasFeatureAccess, getRemainingJobSlots } from '@/lib/subscription';
import { z } from 'zod';

const jobCreateSchema = z.object({
  titleEn: z.string().min(5),
  titleAm: z.string().optional(),
  titleOm: z.string().optional(),
  descriptionEn: z.string().min(20),
  descriptionAm: z.string().optional(),
  descriptionOm: z.string().optional(),
  sector: z.string().optional(),
  fieldOfStudy: z.array(z.string()).optional(),
  skillsRequired: z.array(z.string()).optional(),
  locationRegion: z.string().optional(),
  locationZone: z.string().optional(),
  locationWoreda: z.string().optional(),
  employmentType: z.enum(['full', 'part', 'contract', 'internship']),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  vacancies: z.number().min(1).default(1),
  expiresAt: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const sector = searchParams.get('sector');
    const fieldOfStudy = searchParams.get('fieldOfStudy');
    const region = searchParams.get('region');
    const employmentType = searchParams.get('employmentType');

    const offset = (page - 1) * limit;

    // Build WHERE conditions
    const conditions: any[] = [eq(jobs.status, 'active')];

    if (search) {
      conditions.push(
        or(
          ilike(jobs.titleEn, `%${search}%`),
          ilike(jobs.descriptionEn, `%${search}%`)
        )
      );
    }

    if (sector) {
      conditions.push(eq(jobs.sector, sector));
    }

    if (region) {
      conditions.push(eq(jobs.locationRegion, region));
    }

    if (employmentType) {
      conditions.push(eq(jobs.employmentType, employmentType as any));
    }

    if (fieldOfStudy) {
      conditions.push(sql`${jobs.fieldOfStudy} @> ARRAY[${fieldOfStudy}]::text[]`);
    }

    // Fetch jobs with company info
    const jobsList = await db.query.jobs.findMany({
      where: and(...conditions),
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
      limit,
      offset,
      orderBy: [desc(jobs.createdAt)],
    });

    // Count total
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(jobs)
      .where(and(...conditions));

    const total = Number(countResult.count);

    return NextResponse.json({
      success: true,
      data: jobsList,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Jobs fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only companies can create jobs
    const userResult = requireRole(request, ['company']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

    const body = await request.json();
    const data = jobCreateSchema.parse(body);

    // Get company profile
    const company = await db.query.companies.findFirst({
      where: eq(companies.userId, user.id),
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company profile not found' },
        { status: 404 }
      );
    }

    // Check subscription limits
    const activeJobsCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(jobs)
      .where(and(
        eq(jobs.companyId, company.id),
        eq(jobs.status, 'active')
      ));

    const remainingSlots = getRemainingJobSlots(
      company.subscriptionTier,
      Number(activeJobsCount[0].count)
    );

    if (remainingSlots !== null && remainingSlots <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job posting limit reached. Please upgrade your subscription.',
          currentTier: company.subscriptionTier,
        },
        { status: 403 }
      );
    }

    // Create job
    const [newJob] = await db.insert(jobs).values({
      companyId: company.id,
      titleEn: data.titleEn,
      titleAm: data.titleAm,
      titleOm: data.titleOm,
      descriptionEn: data.descriptionEn,
      descriptionAm: data.descriptionAm,
      descriptionOm: data.descriptionOm,
      sector: data.sector,
      fieldOfStudy: data.fieldOfStudy,
      skillsRequired: data.skillsRequired,
      locationRegion: data.locationRegion,
      locationZone: data.locationZone,
      locationWoreda: data.locationWoreda,
      employmentType: data.employmentType,
      salaryMin: data.salaryMin?.toString(),
      salaryMax: data.salaryMax?.toString(),
      vacancies: data.vacancies,
      status: 'active',
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Job created successfully',
      data: newJob,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Job creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create job' },
      { status: 500 }
    );
  }
}
