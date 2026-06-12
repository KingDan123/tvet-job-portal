/**
 * GET /api/skills - Get all available skills
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { skills } from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    const allSkills = await db.query.skills.findMany({
      orderBy: (skills, { asc }) => [asc(skills.category), asc(skills.nameEn)],
    });

    return NextResponse.json({
      success: true,
      data: allSkills,
    });
  } catch (error) {
    console.error('Skills fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}
