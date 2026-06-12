import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { systemSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const userResult = await requireRole(request, ['admin']);
    if (userResult instanceof NextResponse) return userResult;

    // Seed default settings if empty
    const existing = await db.select().from(systemSettings);
    if (existing.length === 0) {
      await db.insert(systemSettings).values([
        { key: 'MAINTENANCE_MODE', value: 'false', description: 'Blocks all non-admin access' },
        { key: 'REFERRAL_VALIDITY_DAYS', value: '7', description: 'Days before referral letter expires' },
        { key: 'MAX_FREE_JOBS', value: '3', description: 'Max active jobs for free tier companies' },
      ]);
    }

    const settings = await db.select().from(systemSettings);
    return NextResponse.json({ success: true, data: settings });
  } catch (error) { return NextResponse.json({ success: false }, { status: 500 }); }
}

export async function PUT(request: NextRequest) {
  try {
    const userResult = await requireRole(request, ['admin']);
    if (userResult instanceof NextResponse) return userResult;

    const { key, value } = await request.json();

    await db.update(systemSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(systemSettings.key, key));

    return NextResponse.json({ success: true });
  } catch (error) { return NextResponse.json({ success: false }, { status: 500 }); }
}
