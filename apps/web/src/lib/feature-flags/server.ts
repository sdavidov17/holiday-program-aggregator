/**
 * Server-side feature flag helpers
 * Use in: tRPC routers, API routes, getServerSideProps
 */

import { TRPCError } from '@trpc/server';
import { env } from '~/env.mjs';
import { logger } from '~/utils/logger';
import type { FeatureFlagKey } from './flags';
import { FeatureFlags, getFeatureFlagValues } from './flags';

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  const values = getFeatureFlagValues();
  return values[flag] ?? false;
}

/**
 * Specific helper for Agent system
 * Matches the pattern documented in agent-system.md
 */
export function isAgentEnabled(): boolean {
  return env.FEATURE_AGENT_ENABLED ?? false;
}

/**
 * Specific helper for Checkly
 */
export function isChecklyEnabled(): boolean {
  return env.FEATURE_CHECKLY_ENABLED ?? false;
}

/**
 * Specific helper for RUM (can be used server-side too)
 */
export function isRumEnabled(): boolean {
  return env.NEXT_PUBLIC_FEATURE_RUM_ENABLED ?? false;
}

/**
 * Guard function that throws TRPCError if feature is disabled
 * Use in tRPC routers for feature-gated endpoints
 *
 * @example
 * ```typescript
 * requireFeature('AGENT_ENABLED');
 * // Code here only runs if feature is enabled
 * ```
 */
export function requireFeature(flag: FeatureFlagKey, options?: { message?: string }): void {
  if (!isFeatureEnabled(flag)) {
    const flagMeta = FeatureFlags[flag];
    logger.warn(`Feature flag access denied: ${flag}`, { correlationId: 'feature-flag-check' }, {
      flag,
      description: flagMeta.description,
    });

    throw new TRPCError({
      code: 'FORBIDDEN',
      message: options?.message ?? `Feature '${flagMeta.description}' is not enabled`,
    });
  }
}

/**
 * Higher-order function to wrap async operations with feature check
 *
 * @example
 * ```typescript
 * const result = await withFeatureFlag('AGENT_ENABLED', async () => {
 *   return db.providerLead.findMany();
 * }, []);
 * ```
 */
export function withFeatureFlag<T>(
  flag: FeatureFlagKey,
  fn: () => T | Promise<T>,
  fallback?: T,
): T | Promise<T> {
  if (!isFeatureEnabled(flag)) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Feature '${flag}' is not enabled`);
  }
  return fn();
}

/**
 * Log all feature flag states (useful for debugging/startup)
 */
export function logFeatureFlagStates(): void {
  const values = getFeatureFlagValues();
  logger.info('Feature flag states', { correlationId: 'startup' }, {
    flags: Object.entries(values).map(([key, value]) => ({
      key,
      enabled: value,
      description: FeatureFlags[key as FeatureFlagKey]?.description,
    })),
  });
}
