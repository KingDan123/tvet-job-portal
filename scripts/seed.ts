/**
 * Database Seeding Script
 * Populates the database with sample data for development and testing
 */

import { db } from '../src/db';
import { 
  institutions, 
  users, 
  traineeProfiles, 
  companies, 
  skills, 
  jobs 
} from '../src/db/schema';
import { hashPassword } from '../src/lib/auth';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // 1. Create Institutions
    console.log('Creating institutions...');
    const [gwptc, atc, dti] = await db.insert(institutions).values([
      {
        nameEn: 'General Wingate Polytechnic College',
        nameAm: 'ጄኔራል ዊንጌት ፖሊቴክኒክ ኮሌጅ',
        region: 'Addis Ababa',
        city: 'Addis Ababa',
        moeCode: 'GWPTC-001',
        contactEmail: 'info@gwptc.edu.et',
        isActive: true,
      },
      {
        nameEn: 'Adama Technical College',
        nameAm: 'አዳማ ቴክኒክ ኮሌጅ',
        region: 'Oromia',
        city: 'Adama',
        moeCode: 'ATC-002',
        contactEmail: 'info@adamatc.edu.et',
        isActive: true,
      },
      {
        nameEn: 'Don Bosco Technical Institute',
        region: 'Addis Ababa',
        city: 'Addis Ababa',
        moeCode: 'DBTI-003',
        isActive: true,
      },
    ]).returning();

    // 2. Create Skills
    console.log('Creating skills taxonomy...');
    const skillsData = [
      { nameEn: 'Welding', nameAm: 'ብረት መስራት', category: 'Technical', tvetCode: 'WLD-001' },
      { nameEn: 'Carpentry', nameAm: 'አናጺነት', category: 'Technical', tvetCode: 'CRP-001' },
      { nameEn: 'Plumbing', nameAm: 'የቧንቧ ስራ', category: 'Technical', tvetCode: 'PLM-001' },
      { nameEn: 'Electrical Installation', category: 'Technical', tvetCode: 'ELC-001' },
      { nameEn: 'Automotive Repair', category: 'Technical', tvetCode: 'AUT-001' },
      { nameEn: 'Computer Repair', category: 'Technical', tvetCode: 'CMP-001' },
      { nameEn: 'Communication Skills', category: 'Soft Skill', tvetCode: 'COM-001' },
      { nameEn: 'Teamwork', category: 'Soft Skill', tvetCode: 'TWK-001' },
      { nameEn: 'Problem Solving', category: 'Soft Skill', tvetCode: 'PSL-001' },
      { nameEn: 'Time Management', category: 'Soft Skill', tvetCode: 'TIM-001' },
    ];
    
    const createdSkills = await db.insert(skills).values(skillsData).returning();

    // 3. Create Sample Users and Profiles
    console.log('Creating sample users...');
    
    // Admin
    const [adminUser] = await db.insert(users).values({
      email: 'admin@gwptc.edu.et',
      passwordHash: await hashPassword('admin123'),
      role: 'admin',
      institutionId: gwptc.id,
      languagePref: 'en',
      isVerified: true,
      isActive: true,
    }).returning();

    // ILJC Officer
    const [officerUser] = await db.insert(users).values({
      email: 'officer@gwptc.edu.et',
      passwordHash: await hashPassword('officer123'),
      role: 'officer',
      institutionId: gwptc.id,
      languagePref: 'en',
      isVerified: true,
      isActive: true,
    }).returning();

    // Sample Trainees
    const traineeUsers = await db.insert(users).values([
      {
        email: 'abebe.kebede@student.et',
        passwordHash: await hashPassword('trainee123'),
        role: 'trainee',
        institutionId: gwptc.id,
        languagePref: 'am',
        isVerified: true,
        isActive: true,
      },
      {
        email: 'fatuma.ali@student.et',
        passwordHash: await hashPassword('trainee123'),
        role: 'trainee',
        institutionId: atc.id,
        languagePref: 'om',
        isVerified: true,
        isActive: true,
      },
      {
        email: 'yohannes.tesfaye@student.et',
        passwordHash: await hashPassword('trainee123'),
        role: 'trainee',
        institutionId: dti.id,
        languagePref: 'en',
        isVerified: true,
        isActive: true,
      },
    ]).returning();

    // Create trainee profiles
    await db.insert(traineeProfiles).values([
      {
        userId: traineeUsers[0].id,
        fullName: 'Abebe Kebede',
        gender: 'male',
        region: 'Addis Ababa',
        zone: 'Addis Ketema',
        program: 'Automotive Technology',
        level: 4,
        graduationYear: 2024,
        gpa: '3.45',
        employmentStatus: 'seeking',
        profileCompletePct: 85,
      },
      {
        userId: traineeUsers[1].id,
        fullName: 'Fatuma Ali',
        gender: 'female',
        region: 'Oromia',
        zone: 'East Shewa',
        program: 'Computer Maintenance',
        level: 3,
        graduationYear: 2025,
        gpa: '3.72',
        employmentStatus: 'seeking',
        profileCompletePct: 70,
      },
      {
        userId: traineeUsers[2].id,
        fullName: 'Yohannes Tesfaye',
        gender: 'male',
        region: 'Addis Ababa',
        program: 'Electrical Installation',
        level: 4,
        graduationYear: 2024,
        gpa: '3.28',
        employmentStatus: 'seeking',
        profileCompletePct: 90,
      },
    ]);

    // Sample Companies
    const companyUsers = await db.insert(users).values([
      {
        email: 'hr@ethioconstruction.et',
        passwordHash: await hashPassword('company123'),
        role: 'company',
        languagePref: 'en',
        isVerified: true,
        isActive: true,
      },
      {
        email: 'jobs@skylight.et',
        passwordHash: await hashPassword('company123'),
        role: 'company',
        languagePref: 'en',
        isVerified: true,
        isActive: true,
      },
    ]).returning();

    const createdCompanies = await db.insert(companies).values([
      {
        userId: companyUsers[0].id,
        name: 'Ethio Construction PLC',
        tinNumber: 'TIN123456789',
        sector: 'Construction',
        sizeRange: '51-200',
        region: 'Addis Ababa',
        city: 'Addis Ababa',
        subscriptionTier: 'professional',
        isVerified: true,
        employerBadge: 'verified',
      },
      {
        userId: companyUsers[1].id,
        name: 'SkyLight Hotel',
        tinNumber: 'TIN987654321',
        sector: 'Hospitality',
        sizeRange: '11-50',
        region: 'Addis Ababa',
        city: 'Addis Ababa',
        subscriptionTier: 'free',
        isVerified: false,
        employerBadge: 'none',
      },
    ]).returning();

    // Sample Jobs
    console.log('Creating sample jobs...');
    await db.insert(jobs).values([
      {
        companyId: createdCompanies[0].id,
        titleEn: 'Electrician - Commercial Projects',
        titleAm: 'የኤሌክትሪክ ባለሙያ - ንግድ ፕሮጀክቶች',
        descriptionEn: 'We are looking for skilled electricians to join our commercial construction projects. Must have TVET Level 3+ certification in Electrical Installation.',
        descriptionAm: 'የኤሌክትሪክ ጭነት ባለሙያዎችን እንፈልጋለን።',
        sector: 'Construction',
        fieldOfStudy: ['Electrical Installation', 'Electrical Engineering'],
        skillsRequired: [createdSkills[3].id], // Electrical Installation
        locationRegion: 'Addis Ababa',
        employmentType: 'full',
        salaryMin: '8000',
        salaryMax: '15000',
        currency: 'ETB',
        vacancies: 5,
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      {
        companyId: createdCompanies[1].id,
        titleEn: 'Maintenance Technician',
        descriptionEn: 'Seeking a multi-skilled technician for hotel maintenance. Knowledge of plumbing, electrical, and carpentry required.',
        sector: 'Hospitality',
        fieldOfStudy: ['Plumbing', 'Electrical Installation', 'General Maintenance'],
        locationRegion: 'Addis Ababa',
        employmentType: 'full',
        salaryMin: '6000',
        salaryMax: '10000',
        vacancies: 2,
        status: 'active',
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
      },
      {
        companyId: createdCompanies[0].id,
        titleEn: 'Welder - Structural Steel',
        descriptionEn: 'Experienced welder needed for large-scale construction projects. Must pass welding certification test.',
        sector: 'Construction',
        fieldOfStudy: ['Metal Work', 'Welding'],
        skillsRequired: [createdSkills[0].id], // Welding
        locationRegion: 'Oromia',
        locationZone: 'East Shewa',
        employmentType: 'contract',
        salaryMin: '10000',
        salaryMax: '18000',
        vacancies: 3,
        status: 'active',
      },
    ]);

    console.log('✅ Seed completed successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:    admin@gwptc.edu.et / admin123');
    console.log('Officer:  officer@gwptc.edu.et / officer123');
    console.log('Trainee:  abebe.kebede@student.et / trainee123');
    console.log('Company:  hr@ethioconstruction.et / company123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
