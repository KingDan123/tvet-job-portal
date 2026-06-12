/**
 * GET /api/officer/employers - List employers with CRM data (FLW-4)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { companies, employerContacts, placements } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const userResult = await requireRole(request, ['officer', 'admin']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    // Fetch all companies
    const companiesList = await db.query.companies.findMany({
      columns: {
        id: true,
        name: true,
        sector: true,
        city: true,
      },
      orderBy: [desc(companies.createdAt)],
      limit: 100,
    });

    // Enrich with CRM data
    const enrichedCompanies = await Promise.all(
      companiesList.map(async (company) => {
        // Count contacts
        const [contactsResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(employerContacts)
          .where(eq(employerContacts.companyId, company.id));

        // Get last contact date
        const lastContact = await db.query.employerContacts.findFirst({
          where: eq(employerContacts.companyId, company.id),
          orderBy: [desc(employerContacts.createdAt)],
        });

        // Count hires
        const [hiresResult] = await db
          .select({ count: sql<number>`count(*)` })
          .from(placements)
          .where(eq(placements.companyId, company.id));

        const contactCount = Number(contactsResult.count) || 0;
        const hiresCount = Number(hiresResult.count) || 0;

        // Determine status
        let agreementStatus = 'prospect';
        if (hiresCount > 0) agreementStatus = 'active';
        else if (contactCount === 0) agreementStatus = 'prospect';
        else if (lastContact && new Date(lastContact.createdAt).getTime() < Date.now() - 90 * 24 * 60 * 60 * 1000) {
          agreementStatus = 'inactive';
        }

        return {
          ...company,
          contactCount,
          lastContactDate: lastContact?.createdAt || null,
          agreementStatus,
          hiresCount,
        };
      })
    );

    // Apply filter
    const filtered = enrichedCompanies.filter(company => {
      if (filter === 'all') return true;
      return company.agreementStatus === filter;
    });

    return NextResponse.json({
      success: true,
      data: filtered,
    });
  } catch (error) {
    console.error('Employers fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employers' },
      { status: 500 }
    );
  }
}
