import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { employerContacts, companies } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';
import { z } from 'zod';

const contactSchema = z.object({
  contactType: z.enum(['visit', 'call', 'email', 'meeting']),
  notes: z.string().min(5),
  outcome: z.string().optional(),
  nextFollowupAt: z.string().optional().nullable(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userResult = await requireRole(request, ['officer', 'admin']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

    const { id: companyId } = await params;
    const body = await request.json();
    const data = contactSchema.parse(body);

    await db.insert(employerContacts).values({
      companyId,
      officerId: user.id,
      contactType: data.contactType,
      notes: data.notes,
      outcome: data.outcome,
      nextFollowupAt: data.nextFollowupAt ? new Date(data.nextFollowupAt) : null,
    });

    return NextResponse.json({ success: true, message: 'Contact logged successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to log contact' }, { status: 500 });
  }
}
