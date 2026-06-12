/**
 * GET /api/trainees/skills - Get trainee's skills
 * POST /api/trainees/skills - Add a skill
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { traineeProfiles, traineeSkills, skills } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';
import { z } from 'zod';

const skillAddSchema = z.object({
  skillId: z.string().uuid(),
  proficiencyLevel: z.number().min(1).max(5),
});

export async function GET(request: NextRequest) {
  try {
    const userResult = await requireRole(request, ['trainee']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

    // Get trainee profile
    const trainee = await db.query.traineeProfiles.findFirst({
      where: eq(traineeProfiles.userId, user.id),
    });

    if (!trainee) {
      return NextResponse.json(
        { success: false, error: 'Trainee profile not found' },
        { status: 404 }
      );
    }

    // Get trainee's skills
    const traineeSkillsList: any = await db.query.traineeSkills.findMany({
      where: eq(traineeSkills.traineeId, trainee.id),
      with: {
        skill: true,
      },
    });

    const skillsData = traineeSkillsList.map((ts: any) => ({
      id: ts.skill.id,
      nameEn: ts.skill.nameEn,
      nameAm: ts.skill.nameAm,
      nameOm: ts.skill.nameOm,
      category: ts.skill.category,
      proficiencyLevel: ts.proficiencyLevel,
    }));

    return NextResponse.json({
      success: true,
      data: skillsData,
    });
  } catch (error) {
    console.error('Skills fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userResult = await requireRole(request, ['trainee']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

    const body = await request.json();
    const data = skillAddSchema.parse(body);

    // Get trainee profile
    const trainee = await db.query.traineeProfiles.findFirst({
      where: eq(traineeProfiles.userId, user.id),
    });

    if (!trainee) {
      return NextResponse.json(
        { success: false, error: 'Trainee profile not found' },
        { status: 404 }
      );
    }

    // Check if skill exists
    const skill = await db.query.skills.findFirst({
      where: eq(skills.id, data.skillId),
    });

    if (!skill) {
      return NextResponse.json(
        { success: false, error: 'Skill not found' },
        { status: 404 }
      );
    }

    // Check if already added
    const existing = await db.query.traineeSkills.findFirst({
      where: and(
        eq(traineeSkills.traineeId, trainee.id),
        eq(traineeSkills.skillId, data.skillId)
      ),
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Skill already added' },
        { status: 400 }
      );
    }

    // Add skill
    await db.insert(traineeSkills).values({
      traineeId: trainee.id,
      skillId: data.skillId,
      proficiencyLevel: data.proficiencyLevel,
    });

    return NextResponse.json({
      success: true,
      message: 'Skill added successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Skill add error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add skill' },
      { status: 500 }
    );
  }
}
