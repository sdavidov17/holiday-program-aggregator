/**
 * Client-side feature flag helpers
 * Only exposes NEXT_PUBLIC_ flags for security
 */

import { env } from '~/env.mjs';
import type { ClientFeatureFlagValues } from './flags';

/**
 * Check if RUM is enabled (client-safe)
 */
export function isRumEnabled(): boolean {
  return env.NEXT_PUBLIC_FEATURE_RUM_ENABLED ?? false;
}

/**
 * Get all client-accessible feature flags
 */
export function getClientFlags(): ClientFeatureFlagValues {
  return {
    RUM_ENABLED: env.NEXT_PUBLIC_FEATURE_RUM_ENABLED ?? false,
  };
}
