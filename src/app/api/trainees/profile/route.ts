/**
 * GET /api/trainees/profile - Get trainee profile
 * PUT /api/trainees/profile - Update trainee profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { traineeProfiles, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireRole } from '@/lib/middleware';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  fullName: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  birthDate: z.string().datetime().optional(),
  region: z.string().optional(),
  zone: z.string().optional(),
  woreda: z.string().optional(),
  studentId: z.string().optional(),
  program: z.string().optional(),
  level: z.number().min(1).max(5).optional(),
  graduationYear: z.number().optional(),
  gpa: z.number().min(0).max(4).optional(),
  employmentStatus: z.enum(['seeking', 'employed', 'not_seeking']).optional(),
  bio: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const userResult = await requireRole(request, ['trainee']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

    const profile = await db.query.traineeProfiles.findFirst({
      where: eq(traineeProfiles.userId, user.id),
      with: {
        skills: {
          with: {
            skill: true,
          },
        },
        certifications: true,
        user: {
          columns: {
            email: true,
            phone: true,
            languagePref: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userResult = await requireRole(request, ['trainee']);
    if (userResult instanceof NextResponse) return userResult;
    const user = userResult;

    const body = await request.json();
    const data = profileUpdateSchema.parse(body);

    // Get current profile
    const profile = await db.query.traineeProfiles.findFirst({
      where: eq(traineeProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Calculate profile completeness
    const fields = [
      data.fullName || profile.fullName,
      data.gender || profile.gender,
      data.birthDate || profile.birthDate,
      data.region || profile.region,
      data.program || profile.program,
      data.graduationYear || profile.graduationYear,
      data.bio || profile.bio,
    ];
    const filledFields = fields.filter(f => f !== null && f !== undefined).length;
    const profileCompletePct = Math.round((filledFields / fields.length) * 100);

    // Update profile
    const updateData: any = {
      ...data,
      profileCompletePct,
      updatedAt: new Date(),
    };

    if (data.birthDate) {
      updateData.birthDate = new Date(data.birthDate);
    }

    const [updatedProfile] = await db
      .update(traineeProfiles)
      .set(updateData)
      .where(eq(traineeProfiles.userId, user.id))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
