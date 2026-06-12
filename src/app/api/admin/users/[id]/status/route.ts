import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userResult = requireRole(request, ['admin']);
    if (userResult instanceof NextResponse) return userResult;

    const { id } = await params;
    const { isActive } = await request.json();

    await db.update(users)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(users.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}
