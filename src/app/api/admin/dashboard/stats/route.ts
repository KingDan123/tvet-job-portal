/**
 * GET /api/admin/dashboard/stats
 * Admin dashboard statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { 
  users, 
  traineeProfiles, 
  companies, 
  jobs, 
  applications, 
  placements,
  subscriptions
} from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const userResult = await requireRole(request, ['admin']);
    if (userResult instanceof NextResponse) return userResult;

    // Fetch all counts in parallel
    const [
      totalUsersResult,
      totalGraduatesResult,
      totalCompaniesResult,
      totalJobsResult,
      totalApplicationsResult,
      totalPlacementsResult,
      activeOfficersResult,
      activeSubscriptionsResult,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(traineeProfiles),
      db.select({ count: sql<number>`count(*)` }).from(companies),
      db.select({ count: sql<number>`count(*)` }).from(jobs).where(eq(jobs.status, 'active')),
      db.select({ count: sql<number>`count(*)` }).from(applications),
      db.select({ count: sql<number>`count(*)` }).from(placements),
      db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, 'officer')),
      db.select({ count: sql<number>`count(*)` }).from(subscriptions).where(eq(subscriptions.status, 'active')),
    ]);

    const totalUsers = Number(totalUsersResult[0].count) || 0;
    const totalGraduates = Number(totalGraduatesResult[0].count) || 0;
    const totalCompanies = Number(totalCompaniesResult[0].count) || 0;
    const totalJobs = Number(totalJobsResult[0].count) || 0;
    const totalApplications = Number(totalApplicationsResult[0].count) || 0;
    const totalPlacements = Number(totalPlacementsResult[0].count) || 0;
    const activeOfficers = Number(activeOfficersResult[0].count) || 0;

    // Calculate placement rate
    const placementRate = totalGraduates > 0 
      ? Math.round((totalPlacements / totalGraduates) * 100) 
      : 0;

    // Calculate revenue (mock for now - will be real when payments integrated)
    const revenueThisMonth = 0;
    const mrr = 0;

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalGraduates,
        totalCompanies,
        totalJobs,
        totalApplications,
        totalPlacements,
        placementRate,
        activeOfficers,
        revenueThisMonth,
        mrr,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
