/**
 * POST /api/auth/register
 * User registration endpoint for all roles
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, traineeProfiles, companies } from '@/db/schema';
import { hashPassword, generateVerificationToken } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  role: z.enum(['trainee', 'company', 'officer', 'admin']),
  languagePref: z.enum(['en', 'am', 'om']).default('en'),
  institutionId: z.string().uuid().optional(),
  // Role-specific fields
  fullName: z.string().optional(), // for trainee
  companyName: z.string().optional(), // for company
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, data.email),
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);
    const verificationToken = generateVerificationToken();

    // Create user
    const [newUser] = await db.insert(users).values({
      email: data.email,
      passwordHash,
      phone: data.phone,
      role: data.role,
      languagePref: data.languagePref,
      institutionId: data.institutionId,
      verificationToken,
      isVerified: false,
      isActive: true,
    }).returning();

    // Create role-specific profile
    if (data.role === 'trainee' && data.fullName) {
      await db.insert(traineeProfiles).values({
        userId: newUser.id,
        fullName: data.fullName,
        employmentStatus: 'seeking',
      });
    } else if (data.role === 'company' && data.companyName) {
      await db.insert(companies).values({
        userId: newUser.id,
        name: data.companyName,
        subscriptionTier: 'free',
        employerBadge: 'none',
      });
    }

    // TODO: Send verification email/SMS with token

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}
