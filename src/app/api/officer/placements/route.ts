/**
 * GET /api/officer/placements - List placements with follow-ups (FLW-9)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { placements } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const userResult = requireRole(request, ['officer', 'admin']);
    if (userResult instanceof NextResponse) return userResult;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build conditions
    const conditions: any[] = [];
    
    if (status && status !== 'all') {
      conditions.push(eq(placements.status, status as any));
    }

    // Fetch placements with related data
    const placementsList: any = await db.query.placements.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        trainee: {
          columns: {
            id: true,
            fullName: true,
            program: true,
          },
        },
        company: {
          columns: {
            id: true,
            name: true,
            sector: true,
          },
        },
        job: {
          columns: {
            id: true,
            titleEn: true,
          },
        },
      },
      orderBy: [desc(placements.placedAt)],
      limit: 100,
    });

    // Get follow-ups for each placement
    const enrichedPlacements = await Promise.all(
      placementsList.map(async (placement: any) => {
        const followupsList = await db.query.placementFollowups.findMany({
          where: (placementFollowups, { eq }) => eq(placementFollowups.placementId, placement.id),
          orderBy: (placementFollowups, { asc }) => [asc(placementFollowups.followupDay)],
        });

        return {
          ...placement,
          followups: followupsList,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedPlacements,
    });
  } catch (error) {
    console.error('Placements fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch placements' },
      { status: 500 }
    );
  }
}
