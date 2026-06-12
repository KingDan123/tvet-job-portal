/**
 * Shared TypeScript types for TVET Hub
 */

export type UserRole = 'trainee' | 'company' | 'officer' | 'admin';
export type Language = 'en' | 'am' | 'om';
export type EmploymentStatus = 'seeking' | 'employed' | 'not_seeking';
export type SubscriptionTier = 'free' | 'professional' | 'business' | 'enterprise';
export type JobStatus = 'draft' | 'active' | 'expired' | 'filled';
export type ApplicationStatus = 'applied' | 'reviewed' | 'shortlisted' | 'referred' | 'hired' | 'rejected';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  institutionId?: string;
  languagePref: Language;
}

export interface JWTPayload extends AuthUser {
  iat: number;
  exp: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface JobFilters {
  sector?: string;
  fieldOfStudy?: string;
  region?: string;
  employmentType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface MatchScore {
  traineeId: string;
  jobId: string;
  score: number;
  breakdown: {
    fieldMatch: number;
    skillOverlap: number;
    locationMatch: number;
    recency: number;
  };
}
