/**
 * GET /api/officer/referrals/[id]/pdf
 * Generate and download referral letter PDF
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { referrals, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';
import { generateReferralLetter } from '@/lib/pdf-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userResult = await requireRole(request, ['officer', 'admin']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

    const { id } = await params;

    // Fetch referral with all related data
    const referral: any = await db.query.referrals.findFirst({
      where: eq(referrals.id, id),
      with: {
        trainee: {
          with: {
            user: {
              columns: {
                email: true,
              },
            },
          },
        },
        job: {
          with: {
            company: true,
          },
        },
      },
    });

    if (!referral) {
      return NextResponse.json(
        { success: false, error: 'Referral not found' },
        { status: 404 }
      );
    }

    // Get officer info
    const officer = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });

    // Get institution info
    const institution: any = user.institutionId
      ? await db.query.institutions.findFirst({
          where: (institutions, { eq }) => eq(institutions.id, user.institutionId!),
        })
      : null;

    // Generate PDF
    const pdf = generateReferralLetter({
      referralId: referral.id,
      date: referral.sentAt || new Date(),
      trainee: {
        fullName: referral.trainee.fullName,
        program: referral.trainee.program || 'N/A',
        level: referral.trainee.level || 3,
        graduationYear: referral.trainee.graduationYear || new Date().getFullYear(),
        studentId: referral.trainee.studentId || undefined,
      },
      job: {
        titleEn: referral.job.titleEn,
        company: {
          name: referral.job.company.name,
          address: referral.job.company.address || undefined,
        },
      },
      officer: {
        name: officer?.email.split('@')[0] || 'ILJC Officer',
        title: 'Employment Officer',
      },
      institution: {
        name: institution?.nameEn || 'TVET Institution',
        address: institution ? `${institution.city}, ${institution.region}` : undefined,
        phone: institution?.contactPhone || undefined,
        email: institution?.contactEmail || undefined,
      },
    });

    // Convert to buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="referral-${id.slice(0, 8)}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
