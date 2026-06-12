import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { jobs, companies, applications } from '@/db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const userResult = requireRole(request, ['company']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

    // Find the company profile for this user
    const company = await db.query.companies.findFirst({
      where: eq(companies.userId, user.id),
    });

    if (!company) {
      return NextResponse.json({ success: false, error: 'Company profile not found' }, { status: 404 });
    }

    // Fetch jobs with applicant counts
    const companyJobs = await db
      .select({
        id: jobs.id,
        titleEn: jobs.titleEn,
        status: jobs.status,
        sector: jobs.sector,
        employmentType: jobs.employmentType,
        vacancies: jobs.vacancies,
        createdAt: jobs.createdAt,
        applicantCount: sql<number>`count(${applications.id})`.mapWith(Number),
      })
      .from(jobs)
      .leftJoin(applications, eq(applications.jobId, jobs.id))
      .where(eq(jobs.companyId, company.id))
      .groupBy(jobs.id)
      .orderBy(desc(jobs.createdAt));

    return NextResponse.json({
      success: true,
      data: companyJobs,
    });
  } catch (error) {
    console.error('Fetch company jobs error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
