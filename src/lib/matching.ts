/**
 * Matching Algorithm Service
 * Scores trainee-job compatibility based on multiple factors
 * Used by ILJC officers for smart referrals (FLW-6)
 */

import { db } from '@/db';
import { traineeProfiles, jobs, traineeSkills, skills } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { MatchScore } from './types';

interface MatchWeights {
  fieldMatch: number;    // 40 points
  skillOverlap: number;  // 30 points
  locationMatch: number; // 20 points
  recency: number;       // 10 points
}

const DEFAULT_WEIGHTS: MatchWeights = {
  fieldMatch: 40,
  skillOverlap: 30,
  locationMatch: 20,
  recency: 10,
};

/**
 * Calculate match score for a trainee and job
 */
export async function calculateMatchScore(
  traineeId: string,
  jobId: string,
  weights: MatchWeights = DEFAULT_WEIGHTS
): Promise<MatchScore> {
  // Fetch trainee profile
  const trainee = await db.query.traineeProfiles.findFirst({
    where: eq(traineeProfiles.id, traineeId),
    with: {
      skills: {
        with: {
          skill: true,
        },
      },
    },
  });

  // Fetch job details
  const job = await db.query.jobs.findFirst({
    where: eq(jobs.id, jobId),
  });

  if (!trainee || !job) {
    throw new Error('Trainee or job not found');
  }

  const breakdown = {
    fieldMatch: 0,
    skillOverlap: 0,
    locationMatch: 0,
    recency: 0,
  };

  // 1. Field of Study Match (40 points)
  if (job.fieldOfStudy && trainee.program) {
    const jobFields = job.fieldOfStudy as string[];
    if (jobFields.includes(trainee.program)) {
      breakdown.fieldMatch = weights.fieldMatch;
    } else {
      // Partial match for related fields (e.g., Automotive vs Mechanics)
      breakdown.fieldMatch = weights.fieldMatch * 0.5;
    }
  }

  // 2. Skill Overlap (30 points)
  if (job.skillsRequired && trainee.skills.length > 0) {
    const jobSkillIds = job.skillsRequired as string[];
    const traineeSkillIds = trainee.skills.map((ts: any) => ts.skillId);
    const overlap = jobSkillIds.filter(id => traineeSkillIds.includes(id)).length;
    const overlapRatio = jobSkillIds.length > 0 ? overlap / jobSkillIds.length : 0;
    breakdown.skillOverlap = weights.skillOverlap * overlapRatio;
  }

  // 3. Location Match (20 points)
  if (job.locationRegion && trainee.region) {
    if (job.locationRegion === trainee.region) {
      breakdown.locationMatch = weights.locationMatch;
      // Bonus for zone match
      if (job.locationZone && job.locationZone === trainee.zone) {
        breakdown.locationMatch *= 1.2;
      }
    } else {
      // Neighboring regions get partial points
      breakdown.locationMatch = weights.locationMatch * 0.3;
    }
  }

  // 4. Recency (10 points) - favor recent graduates
  if (trainee.graduationYear) {
    const currentYear = new Date().getFullYear();
    const yearsSinceGrad = currentYear - trainee.graduationYear;
    if (yearsSinceGrad <= 1) {
      breakdown.recency = weights.recency;
    } else if (yearsSinceGrad <= 3) {
      breakdown.recency = weights.recency * 0.7;
    } else {
      breakdown.recency = weights.recency * 0.4;
    }
  }

  const totalScore = Math.round(
    breakdown.fieldMatch + breakdown.skillOverlap + breakdown.locationMatch + breakdown.recency
  );

  return {
    traineeId,
    jobId,
    score: Math.min(100, totalScore), // Cap at 100
    breakdown,
  };
}

/**
 * Find top N matching trainees for a job
 */
export async function findTopMatchesForJob(
  jobId: string,
  limit: number = 5
): Promise<MatchScore[]> {
  // Get all trainees seeking employment
  const seekingTrainees = await db.query.traineeProfiles.findMany({
    where: eq(traineeProfiles.employmentStatus, 'seeking'),
  });

  const scores: MatchScore[] = [];

  for (const trainee of seekingTrainees) {
    try {
      const score = await calculateMatchScore(trainee.id, jobId);
      scores.push(score);
    } catch (error) {
      console.error(`Error calculating match for trainee ${trainee.id}:`, error);
    }
  }

  // Sort by score descending and return top N
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Find top N matching jobs for a trainee
 */
export async function findTopMatchesForTrainee(
  traineeId: string,
  limit: number = 5
): Promise<MatchScore[]> {
  // Get all active jobs
  const activeJobs = await db.query.jobs.findMany({
    where: eq(jobs.status, 'active'),
  });

  const scores: MatchScore[] = [];

  for (const job of activeJobs) {
    try {
      const score = await calculateMatchScore(traineeId, job.id);
      scores.push(score);
    } catch (error) {
      console.error(`Error calculating match for job ${job.id}:`, error);
    }
  }

  // Sort by score descending and return top N
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
