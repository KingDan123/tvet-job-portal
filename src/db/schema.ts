/**
 * TVET Hub Database Schema
 * Complete schema for Ethiopian National TVET Job Portal
 * Supports multi-college federation, multi-role auth, and freemium model
 */

import { pgTable, text, timestamp, uuid, varchar, integer, boolean, jsonb, pgEnum, index, uniqueIndex, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================
// ENUMS
// ============================================================

export const userRoleEnum = pgEnum('user_role', ['trainee', 'company', 'officer', 'admin']);
export const languageEnum = pgEnum('language_pref', ['en', 'am', 'om']);
export const employmentStatusEnum = pgEnum('employment_status', ['seeking', 'employed', 'not_seeking']);
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'professional', 'business', 'enterprise']);
export const employerBadgeEnum = pgEnum('employer_badge', ['none', 'verified', 'partner']);
export const jobStatusEnum = pgEnum('job_status', ['draft', 'active', 'expired', 'filled']);
export const employmentTypeEnum = pgEnum('employment_type', ['full', 'part', 'contract', 'internship']);
export const applicationStatusEnum = pgEnum('application_status', [
  'applied', 'reviewed', 'shortlisted', 'referred', 'hired', 'rejected'
]);
export const referralStatusEnum = pgEnum('referral_status', ['pending', 'acknowledged', 'hired', 'rejected']);
export const trainingTypeEnum = pgEnum('training_type', ['soft_skill', 'technical', 'orientation']);
export const contactTypeEnum = pgEnum('contact_type', ['visit', 'call', 'email', 'meeting']);
export const placementStatusEnum = pgEnum('placement_status', ['active', 'resigned', 'terminated', 'promoted']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'expired', 'cancelled']);
export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);

// ============================================================
// CORE TABLES
// ============================================================

/**
 * Institutions - TVET colleges across Ethiopia
 */
export const institutions = pgTable('institutions', {
  id: uuid('id').primaryKey().defaultRandom(),
  nameEn: varchar('name_en', { length: 255 }).notNull(),
  nameAm: varchar('name_am', { length: 255 }),
  nameOm: varchar('name_om', { length: 255 }),
  region: varchar('region', { length: 100 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  moeCode: varchar('moe_code', { length: 50 }).unique(),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 20 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  moeCodeIdx: index('institutions_moe_code_idx').on(table.moeCode),
}));

/**
 * Users - All system users (trainees, companies, officers, admins)
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').references(() => institutions.id),
  role: userRoleEnum('role').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  passwordHash: text('password_hash').notNull(),
  languagePref: languageEnum('language_pref').default('en').notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  verificationToken: varchar('verification_token', { length: 100 }),
  resetToken: varchar('reset_token', { length: 100 }),
  resetTokenExpiry: timestamp('reset_token_expiry'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
  institutionIdx: index('users_institution_idx').on(table.institutionId),
}));

/**
 * Trainee Profiles - TVET students and graduates
 */
export const traineeProfiles = pgTable('trainee_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  gender: genderEnum('gender'),
  birthDate: timestamp('birth_date'),
  region: varchar('region', { length: 100 }),
  zone: varchar('zone', { length: 100 }),
  woreda: varchar('woreda', { length: 100 }),
  studentId: varchar('student_id', { length: 50 }),
  program: varchar('program', { length: 255 }), // e.g., "Automotive Technology"
  level: integer('level'), // 1-5
  graduationYear: integer('graduation_year'),
  gpa: decimal('gpa', { precision: 3, scale: 2 }),
  profileCompletePct: integer('profile_complete_pct').default(0),
  employmentStatus: employmentStatusEnum('employment_status').default('seeking').notNull(),
  cvUrl: text('cv_url'),
  photoUrl: text('photo_url'),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: uniqueIndex('trainee_profiles_user_idx').on(table.userId),
  programIdx: index('trainee_profiles_program_idx').on(table.program),
  statusIdx: index('trainee_profiles_status_idx').on(table.employmentStatus),
  graduationIdx: index('trainee_profiles_graduation_idx').on(table.graduationYear),
}));

/**
 * Skills - TVET competency taxonomy
 */
export const skills = pgTable('skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  nameEn: varchar('name_en', { length: 255 }).notNull(),
  nameAm: varchar('name_am', { length: 255 }),
  nameOm: varchar('name_om', { length: 255 }),
  category: varchar('category', { length: 100 }), // e.g., "Technical", "Soft Skill"
  tvetCode: varchar('tvet_code', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index('skills_category_idx').on(table.category),
}));

/**
 * Trainee Skills - Junction table
 */
export const traineeSkills = pgTable('trainee_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  traineeId: uuid('trainee_id').references(() => traineeProfiles.id, { onDelete: 'cascade' }).notNull(),
  skillId: uuid('skill_id').references(() => skills.id, { onDelete: 'cascade' }).notNull(),
  proficiencyLevel: integer('proficiency_level').default(3), // 1-5
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  traineeSkillIdx: uniqueIndex('trainee_skills_trainee_skill_idx').on(table.traineeId, table.skillId),
}));

/**
 * Certifications - Uploaded certificates and credentials
 */
export const certifications = pgTable('certifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  traineeId: uuid('trainee_id').references(() => traineeProfiles.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  issuer: varchar('issuer', { length: 255 }),
  issueDate: timestamp('issue_date'),
  expiryDate: timestamp('expiry_date'),
  fileUrl: text('file_url').notNull(),
  verifiedAt: timestamp('verified_at'),
  verifiedBy: uuid('verified_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  traineeIdx: index('certifications_trainee_idx').on(table.traineeId),
}));

/**
 * Companies - Employers
 */
export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  tinNumber: varchar('tin_number', { length: 50 }),
  sector: varchar('sector', { length: 100 }),
  sizeRange: varchar('size_range', { length: 50 }), // e.g., "1-10", "11-50", "51-200"
  region: varchar('region', { length: 100 }),
  city: varchar('city', { length: 100 }),
  address: text('address'),
  website: varchar('website', { length: 255 }),
  description: text('description'),
  subscriptionTier: subscriptionTierEnum('subscription_tier').default('free').notNull(),
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  isVerified: boolean('is_verified').default(false).notNull(),
  verificationDocsUrl: text('verification_docs_url'),
  employerBadge: employerBadgeEnum('employer_badge').default('none').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: uniqueIndex('companies_user_idx').on(table.userId),
  tierIdx: index('companies_tier_idx').on(table.subscriptionTier),
  verifiedIdx: index('companies_verified_idx').on(table.isVerified),
}));

/**
 * Jobs - Job postings
 */
export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  titleEn: varchar('title_en', { length: 255 }).notNull(),
  titleAm: varchar('title_am', { length: 255 }),
  titleOm: varchar('title_om', { length: 255 }),
  descriptionEn: text('description_en').notNull(),
  descriptionAm: text('description_am'),
  descriptionOm: text('description_om'),
  sector: varchar('sector', { length: 100 }),
  fieldOfStudy: text('field_of_study').array(), // Array of programs
  skillsRequired: text('skills_required').array(), // Array of skill IDs
  locationRegion: varchar('location_region', { length: 100 }),
  locationZone: varchar('location_zone', { length: 100 }),
  locationWoreda: varchar('location_woreda', { length: 100 }),
  employmentType: employmentTypeEnum('employment_type').notNull(),
  salaryMin: decimal('salary_min', { precision: 12, scale: 2 }),
  salaryMax: decimal('salary_max', { precision: 12, scale: 2 }),
  currency: varchar('currency', { length: 10 }).default('ETB'),
  vacancies: integer('vacancies').default(1),
  status: jobStatusEnum('status').default('draft').notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  companyIdx: index('jobs_company_idx').on(table.companyId),
  statusIdx: index('jobs_status_idx').on(table.status),
  createdIdx: index('jobs_created_idx').on(table.createdAt),
  sectorIdx: index('jobs_sector_idx').on(table.sector),
}));

/**
 * Applications - Job applications from trainees
 */
export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  traineeId: uuid('trainee_id').references(() => traineeProfiles.id, { onDelete: 'cascade' }).notNull(),
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'cascade' }).notNull(),
  status: applicationStatusEnum('status').default('applied').notNull(),
  coverLetter: text('cover_letter'),
  matchScore: integer('match_score'), // 0-100
  rejectionReason: text('rejection_reason'),
  notes: text('notes'),
  appliedAt: timestamp('applied_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  traineeJobIdx: uniqueIndex('applications_trainee_job_idx').on(table.traineeId, table.jobId),
  statusIdx: index('applications_status_idx').on(table.status),
  jobIdx: index('applications_job_idx').on(table.jobId),
}));

/**
 * Referrals - ILJC officer referrals (FLW-5)
 */
export const referrals = pgTable('referrals', {
  id: uuid('id').primaryKey().defaultRandom(),
  traineeId: uuid('trainee_id').references(() => traineeProfiles.id, { onDelete: 'cascade' }).notNull(),
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'cascade' }).notNull(),
  officerId: uuid('officer_id').references(() => users.id).notNull(),
  letterUrl: text('letter_url'),
  status: referralStatusEnum('status').default('pending').notNull(),
  employerResponseAt: timestamp('employer_response_at'),
  followupDueAt: timestamp('followup_due_at'),
  notes: text('notes'),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  traineeIdx: index('referrals_trainee_idx').on(table.traineeId),
  officerIdx: index('referrals_officer_idx').on(table.officerId),
  statusIdx: index('referrals_status_idx').on(table.status),
}));

/**
 * Training Sessions - Pre-employment training (FLW-3)
 */
export const trainingSessions = pgTable('training_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').references(() => institutions.id).notNull(),
  officerId: uuid('officer_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: trainingTypeEnum('type').notNull(),
  scheduledAt: timestamp('scheduled_at').notNull(),
  duration: integer('duration'), // minutes
  location: varchar('location', { length: 255 }),
  capacity: integer('capacity'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  institutionIdx: index('training_sessions_institution_idx').on(table.institutionId),
  scheduledIdx: index('training_sessions_scheduled_idx').on(table.scheduledAt),
}));

/**
 * Session Attendance - Training attendance tracking
 */
export const sessionAttendance = pgTable('session_attendance', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => trainingSessions.id, { onDelete: 'cascade' }).notNull(),
  traineeId: uuid('trainee_id').references(() => traineeProfiles.id, { onDelete: 'cascade' }).notNull(),
  attended: boolean('attended').default(false).notNull(),
  notes: text('notes'),
  markedAt: timestamp('marked_at').defaultNow().notNull(),
}, (table) => ({
  sessionTraineeIdx: uniqueIndex('session_attendance_session_trainee_idx').on(table.sessionId, table.traineeId),
}));

/**
 * Employer Contacts - CRM for ILJC officers (FLW-4)
 */
export const employerContacts = pgTable('employer_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  officerId: uuid('officer_id').references(() => users.id).notNull(),
  contactType: contactTypeEnum('contact_type').notNull(),
  notes: text('notes'),
  outcome: text('outcome'),
  nextFollowupAt: timestamp('next_followup_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  companyIdx: index('employer_contacts_company_idx').on(table.companyId),
  officerIdx: index('employer_contacts_officer_idx').on(table.officerId),
}));

/**
 * Employer Agreements - Partnership agreements tracking
 */
export const employerAgreements = pgTable('employer_agreements', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  officerId: uuid('officer_id').references(() => users.id).notNull(),
  agreementType: varchar('agreement_type', { length: 100 }).notNull(),
  signedAt: timestamp('signed_at'),
  docUrl: text('doc_url'),
  validUntil: timestamp('valid_until'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  companyIdx: index('employer_agreements_company_idx').on(table.companyId),
}));

/**
 * Placements - Successful job placements (FLW-9)
 */
export const placements = pgTable('placements', {
  id: uuid('id').primaryKey().defaultRandom(),
  traineeId: uuid('trainee_id').references(() => traineeProfiles.id, { onDelete: 'cascade' }).notNull(),
  jobId: uuid('job_id').references(() => jobs.id),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  salary: decimal('salary', { precision: 12, scale: 2 }),
  employmentType: employmentTypeEnum('employment_type').notNull(),
  status: placementStatusEnum('status').default('active').notNull(),
  placedAt: timestamp('placed_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  traineeIdx: index('placements_trainee_idx').on(table.traineeId),
  companyIdx: index('placements_company_idx').on(table.companyId),
  statusIdx: index('placements_status_idx').on(table.status),
}));

/**
 * Placement Followups - 30/60/90 day check-ins (FLW-8, FLW-9)
 */
export const placementFollowups = pgTable('placement_followups', {
  id: uuid('id').primaryKey().defaultRandom(),
  placementId: uuid('placement_id').references(() => placements.id, { onDelete: 'cascade' }).notNull(),
  followupDay: integer('followup_day').notNull(), // 30, 60, 90
  scheduledAt: timestamp('scheduled_at').notNull(),
  completedAt: timestamp('completed_at'),
  traineeSatisfaction: integer('trainee_satisfaction'), // 1-5
  employerSatisfaction: integer('employer_satisfaction'), // 1-5
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  placementIdx: index('placement_followups_placement_idx').on(table.placementId),
}));

/**
 * Tracer Surveys - Labor market and graduate tracking
 */
export const tracerSurveys = pgTable('tracer_surveys', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').references(() => institutions.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  questions: jsonb('questions').notNull(), // Array of question objects
  dispatchedAt: timestamp('dispatched_at'),
  closesAt: timestamp('closes_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  institutionIdx: index('tracer_surveys_institution_idx').on(table.institutionId),
}));

/**
 * Tracer Responses - Survey responses from graduates
 */
export const tracerResponses = pgTable('tracer_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  surveyId: uuid('survey_id').references(() => tracerSurveys.id, { onDelete: 'cascade' }).notNull(),
  traineeId: uuid('trainee_id').references(() => traineeProfiles.id, { onDelete: 'cascade' }).notNull(),
  placementId: uuid('placement_id').references(() => placements.id),
  responses: jsonb('responses').notNull(), // Object with questionId: answer
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
}, (table) => ({
  surveyTraineeIdx: uniqueIndex('tracer_responses_survey_trainee_idx').on(table.surveyId, table.traineeId),
}));

/**
 * Subscriptions - Company subscription tracking
 */
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  plan: subscriptionTierEnum('plan').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('ETB'),
  paymentRef: varchar('payment_ref', { length: 255 }),
  provider: varchar('provider', { length: 50 }), // e.g., "chapa"
  status: subscriptionStatusEnum('status').default('active').notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  companyIdx: index('subscriptions_company_idx').on(table.companyId),
  statusIdx: index('subscriptions_status_idx').on(table.status),
}));

/**
 * Invoices - Payment invoices
 */
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('ETB'),
  pdfUrl: text('pdf_url'),
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  paidAt: timestamp('paid_at'),
}, (table) => ({
  subscriptionIdx: index('invoices_subscription_idx').on(table.subscriptionId),
}));

/**
 * Audit Log - System-wide audit trail (FLW-10)
 */
export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 100 }),
  entityId: uuid('entity_id'),
  oldValue: jsonb('old_value'),
  newValue: jsonb('new_value'),
  ip: varchar('ip', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdx: index('audit_log_user_idx').on(table.userId),
  actionIdx: index('audit_log_action_idx').on(table.action),
  createdIdx: index('audit_log_created_idx').on(table.createdAt),
}));

// ============================================================
// RELATIONS (for Drizzle query builder)
// ============================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  institution: one(institutions, {
    fields: [users.institutionId],
    references: [institutions.id],
  }),
  traineeProfile: one(traineeProfiles),
  company: one(companies),
}));

export const traineeProfilesRelations = relations(traineeProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [traineeProfiles.userId],
    references: [users.id],
  }),
  skills: many(traineeSkills),
  certifications: many(certifications),
  applications: many(applications),
  referrals: many(referrals),
  placements: many(placements),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  user: one(users, {
    fields: [companies.userId],
    references: [users.id],
  }),
  jobs: many(jobs),
  placements: many(placements),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  trainee: one(traineeProfiles, {
    fields: [applications.traineeId],
    references: [traineeProfiles.id],
  }),
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
}));
