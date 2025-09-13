/**
 * Feature flags for dental interface A/B testing
 */

interface FeatureFlags {
  useAdaptiveDentalBuilder: boolean;
  showDentalConfiguration: boolean;
  enableDentalPatternAnalysis: boolean;
}

// Default feature flags - can be overridden by environment variables or remote config
const defaultFlags: FeatureFlags = {
  useAdaptiveDentalBuilder: false, // Start with false for safe rollout
  showDentalConfiguration: true,
  enableDentalPatternAnalysis: true,
};

// Environment-based overrides
const environmentFlags: Partial<FeatureFlags> = {
  useAdaptiveDentalBuilder: process.env.NEXT_PUBLIC_USE_ADAPTIVE_DENTAL === 'true',
  showDentalConfiguration: process.env.NEXT_PUBLIC_SHOW_DENTAL_CONFIG !== 'false',
  enableDentalPatternAnalysis: process.env.NEXT_PUBLIC_ENABLE_DENTAL_PATTERN_ANALYSIS !== 'false',
};

// Merge flags
export const featureFlags: FeatureFlags = {
  ...defaultFlags,
  ...environmentFlags,
};

// Feature flag checker functions
export const shouldUseAdaptiveDentalBuilder = (): boolean => {
  return featureFlags.useAdaptiveDentalBuilder;
};

export const shouldShowDentalConfiguration = (): boolean => {
  return featureFlags.showDentalConfiguration;
};

export const shouldEnableDentalPatternAnalysis = (): boolean => {
  return featureFlags.enableDentalPatternAnalysis;
};

// A/B testing helper - can be enhanced with user segments, random assignment, etc.
export const getDentalBuilderVariant = (userId?: string): 'legacy' | 'adaptive' => {
  // For now, use feature flag
  if (shouldUseAdaptiveDentalBuilder()) {
    return 'adaptive';
  }
  
  // Future: implement user-based A/B testing
  // if (userId) {
  //   const hash = simpleHash(userId);
  //   return hash % 2 === 0 ? 'adaptive' : 'legacy';
  // }
  
  return 'legacy';
};

// Simple hash function for A/B testing (if needed in future)
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}