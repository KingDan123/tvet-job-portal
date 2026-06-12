/**
 * POST /api/admin/companies/[id]/verify
 * Verify or reject a company
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { companies } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';
import { z } from 'zod';

const verifySchema = z.object({
  approved: z.boolean(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userResult = await requireRole(request, ['admin']);
    if (userResult instanceof NextResponse) return userResult;

    const { id } = await params;
    const body = await request.json();
    const data = verifySchema.parse(body);

    // Update company verification status
    const [updatedCompany] = await db
      .update(companies)
      .set({
        isVerified: data.approved,
        employerBadge: data.approved ? 'verified' : 'none',
        updatedAt: new Date(),
      })
      .where(eq(companies.id, id))
      .returning();

    if (!updatedCompany) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    // TODO: Send email notification to company

    return NextResponse.json({
      success: true,
      message: data.approved ? 'Company verified' : 'Company rejected',
      data: updatedCompany,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Company verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify company' },
      { status: 500 }
    );
  }
}
