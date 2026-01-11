/**
 * Feature Flags Module
 *
 * Usage:
 *
 * Server-side (tRPC, API routes):
 *   import { isAgentEnabled, requireFeature } from '~/lib/feature-flags';
 *
 * Client-side (React components):
 *   import { useFeatureFlags } from '~/hooks/useFeatureFlags';
 *
 * Middleware (Edge runtime):
 *   import { isAgentEnabledEdge } from '~/lib/feature-flags/middleware';
 */

// Types
export type { FeatureFlagKey, FeatureFlagValues, ClientFeatureFlagValues } from './flags';

// Flag definitions
export { FeatureFlags, getFeatureFlagValues, getClientFeatureFlagValues } from './flags';

// Server helpers (default export for convenience)
export {
  isFeatureEnabled,
  isAgentEnabled,
  isChecklyEnabled,
  isRumEnabled,
  requireFeature,
  withFeatureFlag,
  logFeatureFlagStates,
} from './server';

// Client helpers
export { getClientFlags } from './client';
