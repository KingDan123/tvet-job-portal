import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, ilike, or } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const userResult = requireRole(request, ['admin']);
    if (userResult instanceof NextResponse) return userResult;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const usersList = await db.query.users.findMany({
      where: search ? ilike(users.email, `%${search}%`) : undefined,
      with: { institution: true },
      limit: 100,
    });

    return NextResponse.json({ success: true, data: usersList });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}
