/**
 * Subscription and feature gate utilities
 * Implements freemium model logic
 */

import { SubscriptionTier } from './types';

export interface SubscriptionFeatures {
  maxActiveJobs: number | null; // null = unlimited
  advancedSearch: boolean;
  directMessaging: boolean;
  analytics: boolean;
  verifiedBadge: boolean;
  bulkExport: boolean;
  apiAccess: boolean;
  dedicatedOfficer: boolean;
}

/**
 * Feature map for each subscription tier
 */
export const TIER_FEATURES: Record<SubscriptionTier, SubscriptionFeatures> = {
  free: {
    maxActiveJobs: 3,
    advancedSearch: false,
    directMessaging: false,
    analytics: false,
    verifiedBadge: false,
    bulkExport: false,
    apiAccess: false,
    dedicatedOfficer: false,
  },
  professional: {
    maxActiveJobs: null,
    advancedSearch: true,
    directMessaging: true,
    analytics: false,
    verifiedBadge: true,
    bulkExport: false,
    apiAccess: false,
    dedicatedOfficer: false,
  },
  business: {
    maxActiveJobs: null,
    advancedSearch: true,
    directMessaging: true,
    analytics: true,
    verifiedBadge: true,
    bulkExport: true,
    apiAccess: false,
    dedicatedOfficer: false,
  },
  enterprise: {
    maxActiveJobs: null,
    advancedSearch: true,
    directMessaging: true,
    analytics: true,
    verifiedBadge: true,
    bulkExport: true,
    apiAccess: true,
    dedicatedOfficer: true,
  },
};

/**
 * Pricing for each tier (ETB per month)
 */
export const TIER_PRICING: Record<SubscriptionTier, number> = {
  free: 0,
  professional: 500,
  business: 1500,
  enterprise: 5000, // starting price, custom for large orgs
};

/**
 * Check if a company has access to a specific feature
 */
export function hasFeatureAccess(tier: SubscriptionTier, feature: keyof SubscriptionFeatures): boolean {
  return TIER_FEATURES[tier][feature] as boolean;
}

/**
 * Get remaining job slots for a company
 */
export function getRemainingJobSlots(tier: SubscriptionTier, currentActiveJobs: number): number | null {
  const maxJobs = TIER_FEATURES[tier].maxActiveJobs;
  if (maxJobs === null) return null; // unlimited
  return Math.max(0, maxJobs - currentActiveJobs);
}

/**
 * Check if subscription is active
 */
export function isSubscriptionActive(expiresAt: Date | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) > new Date();
}
