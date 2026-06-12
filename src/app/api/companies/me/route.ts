import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { companies } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2),
  sector: z.string().optional(),
  sizeRange: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  tinNumber: z.string().optional(),
});

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

    return NextResponse.json({ success: true, data: company });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userResult = requireRole(request, ['company']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

    const body = await request.json();
    const data = profileSchema.parse(body);

    const [updated] = await db.update(companies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(companies.userId, user.id))
      .returning();

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
