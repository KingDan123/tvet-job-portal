import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { institutions } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';
import { z } from 'zod';

const instSchema = z.object({
  nameEn: z.string(),
  moeCode: z.string(),
  region: z.string(),
  city: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const list = await db.query.institutions.findMany({ orderBy: [desc(institutions.createdAt)] });
    return NextResponse.json({ success: true, data: list });
  } catch (error) { return NextResponse.json({ success: false }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const userResult = requireRole(request, ['admin']);
    if (userResult instanceof NextResponse) return userResult;

    const body = await request.json();
    const data = instSchema.parse(body);

    const [newInst] = await db.insert(institutions).values(data).returning();
    return NextResponse.json({ success: true, data: newInst });
  } catch (error) { return NextResponse.json({ success: false }, { status: 500 }); }
}
