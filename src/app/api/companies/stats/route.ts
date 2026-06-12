import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { jobs, companies, applications } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const userResult = requireRole(request, ['company']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

    const company = await db.query.companies.findFirst({
      where: eq(companies.userId, user.id),
    });

    if (!company) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    // Active Jobs
    const activeJobs = await db
      .select({ count: sql<number>`count(*)` })
      .from(jobs)
      .where(and(eq(jobs.companyId, company.id), eq(jobs.status, 'active')));

    // Applications Summary
    const appsSummary = await db
      .select({
        status: applications.status,
        count: sql<number>`count(*)`.mapWith(Number)
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(jobs.companyId, company.id))
      .groupBy(applications.status);

    const stats = {
      activeJobs: Number(activeJobs[0].count),
      totalApplications: appsSummary.reduce((sum, item) => sum + item.count, 0),
      pendingReview: appsSummary.find(i => i.status === 'applied')?.count || 0,
      shortlisted: appsSummary.find(i => i.status === 'shortlisted')?.count || 0,
      hired: appsSummary.find(i => i.status === 'hired')?.count || 0,
      tier: company.subscriptionTier
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
