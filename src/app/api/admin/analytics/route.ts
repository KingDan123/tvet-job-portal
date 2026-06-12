import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { placements, companies } from '@/db/schema';
import { sql, eq } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const userResult = requireRole(request, ['admin']);
    if (userResult instanceof NextResponse) return userResult;

    // Placements by Sector
    const sectorStats = await db
      .select({ sector: companies.sector, count: sql<number>`count(*)`.mapWith(Number) })
      .from(placements)
      .innerJoin(companies, eq(placements.companyId, companies.id))
      .groupBy(companies.sector);

    // Placements by Region
    const regionStats = await db
      .select({ region: companies.region, count: sql<number>`count(*)`.mapWith(Number) })
      .from(placements)
      .innerJoin(companies, eq(placements.companyId, companies.id))
      .groupBy(companies.region);

    const total = sectorStats.reduce((sum, s) => sum + s.count, 0);

    const data = {
      total,
      bySector: Object.fromEntries(sectorStats.map(s => [s.sector || 'Uncategorized', s.count])),
      byRegion: Object.fromEntries(regionStats.map(r => [r.region || 'Unknown', r.count])),
    };

    return NextResponse.json({ success: true, data });
  } catch (error) { return NextResponse.json({ success: false }, { status: 500 }); }
}
