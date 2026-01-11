/**
 * Feature Flag System - Type Definitions and Registry
 *
 * Design Decisions:
 * - Server flags (no NEXT_PUBLIC_) are inaccessible from client
 * - Client flags use NEXT_PUBLIC_ prefix for Next.js compatibility
 * - All flags default to false (safe rollback)
 */

import { env } from '~/env.mjs';

/**
 * All available feature flags with their metadata
 */
export const FeatureFlags = {
  // Server-only flags (security-sensitive operations)
  AGENT_ENABLED: {
    key: 'AGENT_ENABLED',
    envVar: 'FEATURE_AGENT_ENABLED',
    description: 'Agentic provider discovery system',
    context: 'server' as const,
    defaultValue: false,
  },
  CHECKLY_ENABLED: {
    key: 'CHECKLY_ENABLED',
    envVar: 'FEATURE_CHECKLY_ENABLED',
    description: 'Checkly synthetic monitoring',
    context: 'server' as const,
    defaultValue: false,
  },

  // Client-accessible flags
  RUM_ENABLED: {
    key: 'RUM_ENABLED',
    envVar: 'NEXT_PUBLIC_FEATURE_RUM_ENABLED',
    description: 'Real User Monitoring',
    context: 'client' as const,
    defaultValue: false,
  },
} as const;

export type FeatureFlagKey = keyof typeof FeatureFlags;

/**
 * Type-safe feature flag values interface
 */
export interface FeatureFlagValues {
  AGENT_ENABLED: boolean;
  CHECKLY_ENABLED: boolean;
  RUM_ENABLED: boolean;
}

/**
 * Get all feature flag values from environment
 */
export function getFeatureFlagValues(): FeatureFlagValues {
  return {
    AGENT_ENABLED: env.FEATURE_AGENT_ENABLED ?? false,
    CHECKLY_ENABLED: env.FEATURE_CHECKLY_ENABLED ?? false,
    RUM_ENABLED: env.NEXT_PUBLIC_FEATURE_RUM_ENABLED ?? false,
  };
}

/**
 * Client-safe subset of flags (excludes server-only)
 */
export type ClientFeatureFlagValues = Pick<FeatureFlagValues, 'RUM_ENABLED'>;

export function getClientFeatureFlagValues(): ClientFeatureFlagValues {
  return {
    RUM_ENABLED: env.NEXT_PUBLIC_FEATURE_RUM_ENABLED ?? false,
  };
}
