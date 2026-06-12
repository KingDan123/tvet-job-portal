/**
 * GET /api/officer/dashboard/stats
 * Dashboard statistics for ILJC officers
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { 
  traineeProfiles, 
  referrals, 
  placements, 
  trainingSessions,
  companies,
  employerContacts
} from '@/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const userResult = requireRole(request, ['officer', 'admin']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

    // Get counts for different metrics
    const [totalGraduatesResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(traineeProfiles)
      .where(user.institutionId ? eq(traineeProfiles.userId, user.institutionId) : sql`true`);

    const [seekingEmploymentResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(traineeProfiles)
      .where(and(
        eq(traineeProfiles.employmentStatus, 'seeking'),
        user.institutionId ? eq(traineeProfiles.userId, user.institutionId) : sql`true`
      ));

    const [activePlacementsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(placements)
      .where(eq(placements.status, 'active'));

    const [pendingReferralsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(referrals)
      .where(and(
        eq(referrals.officerId, user.id),
        eq(referrals.status, 'pending')
      ));

    // Get upcoming training sessions (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const [upcomingTrainingResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(trainingSessions)
      .where(and(
        user.institutionId ? eq(trainingSessions.institutionId, user.institutionId) : sql`true`,
        gte(trainingSessions.scheduledAt, new Date())
      ));

    // Get companies with active engagements
    const [companiesEngagedResult] = await db
      .select({ count: sql<number>`count(DISTINCT ${employerContacts.companyId})` })
      .from(employerContacts)
      .where(eq(employerContacts.officerId, user.id));

    return NextResponse.json({
      success: true,
      data: {
        totalGraduates: Number(totalGraduatesResult.count) || 0,
        seekingEmployment: Number(seekingEmploymentResult.count) || 0,
        activePlacements: Number(activePlacementsResult.count) || 0,
        pendingReferrals: Number(pendingReferralsResult.count) || 0,
        upcomingTrainingSessions: Number(upcomingTrainingResult.count) || 0,
        companiesEngaged: Number(companiesEngagedResult.count) || 0,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
