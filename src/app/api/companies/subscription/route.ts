/**
 * GET /api/companies/subscription - Get company subscription info
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { companies, jobs } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';
import { getRemainingJobSlots, isSubscriptionActive } from '@/lib/subscription';

export async function GET(request: NextRequest) {
  try {
    const userResult = await requireRole(request, ['company']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

    // Get company info
    const company = await db.query.companies.findFirst({
      where: eq(companies.userId, user.id),
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Company profile not found' },
        { status: 404 }
      );
    }

    // Count active jobs
    const [activeJobsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(jobs)
      .where(and(
        eq(jobs.companyId, company.id),
        eq(jobs.status, 'active')
      ));

    const activeJobs = Number(activeJobsResult.count) || 0;
    const remainingSlots = getRemainingJobSlots(company.subscriptionTier, activeJobs);
    const isActive = company.subscriptionExpiresAt 
      ? isSubscriptionActive(company.subscriptionExpiresAt)
      : true; // Free tier is always active

    return NextResponse.json({
      success: true,
      data: {
        currentTier: company.subscriptionTier,
        expiresAt: company.subscriptionExpiresAt,
        isActive,
        activeJobs,
        remainingSlots,
      },
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription info' },
      { status: 500 }
    );
  }
}
