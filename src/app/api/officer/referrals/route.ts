/**
 * GET /api/officer/referrals - List referrals
 * POST /api/officer/referrals - Create new referral (FLW-5)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { referrals } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';
import { z } from 'zod';

const referralCreateSchema = z.object({
  traineeId: z.string().uuid(),
  jobId: z.string().uuid(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const userResult = await requireRole(request, ['officer', 'admin']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build conditions
    const conditions: any[] = [eq(referrals.officerId, user.id)];
    
    if (status && status !== 'all') {
      conditions.push(eq(referrals.status, status as any));
    }

    // Fetch referrals with related data
    const referralsList = await db.query.referrals.findMany({
      where: and(...conditions),
      with: {
        trainee: {
          columns: {
            id: true,
            fullName: true,
            program: true,
          },
        },
        job: {
          columns: {
            id: true,
            titleEn: true,
          },
          with: {
            company: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [desc(referrals.sentAt)],
      limit: 100,
    });

    return NextResponse.json({
      success: true,
      data: referralsList,
    });
  } catch (error) {
    console.error('Referrals fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userResult = await requireRole(request, ['officer', 'admin']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

    const body = await request.json();
    const data = referralCreateSchema.parse(body);

    // Create referral with follow-up date (7 days from now)
    const followupDate = new Date();
    followupDate.setDate(followupDate.getDate() + 7);

    const [newReferral] = await db.insert(referrals).values({
      traineeId: data.traineeId,
      jobId: data.jobId,
      officerId: user.id,
      notes: data.notes,
      status: 'pending',
      followupDueAt: followupDate,
    }).returning();

    // TODO: Generate PDF letter
    // TODO: Send email notification to company
    // TODO: Send SMS to trainee

    return NextResponse.json({
      success: true,
      message: 'Referral created successfully',
      data: newReferral,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Referral creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create referral' },
      { status: 500 }
    );
  }
}
