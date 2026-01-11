/**
 * React hook for consuming feature flags
 * Only exposes client-safe flags
 */

import { useMemo } from 'react';
import { getClientFlags, isRumEnabled } from '~/lib/feature-flags/client';
import type { ClientFeatureFlagValues } from '~/lib/feature-flags';

interface UseFeatureFlagsReturn extends ClientFeatureFlagValues {
  /** Check if a specific flag is enabled */
  isEnabled: (flagName: keyof ClientFeatureFlagValues) => boolean;
}

/**
 * Hook to access feature flags in React components
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { RUM_ENABLED, isEnabled } = useFeatureFlags();
 *
 *   if (isEnabled('RUM_ENABLED')) {
 *     trackEvent('page_view');
 *   }
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useFeatureFlags(): UseFeatureFlagsReturn {
  // Memoize to prevent unnecessary re-renders
  const flags = useMemo(() => getClientFlags(), []);

  const isEnabled = useMemo(
    () => (flagName: keyof ClientFeatureFlagValues) => {
      return flags[flagName] ?? false;
    },
    [flags],
  );

  return {
    ...flags,
    isEnabled,
  };
}

/**
 * Convenience hook for RUM specifically
 *
 * @example
 * ```tsx
 * function Analytics() {
 *   const rumEnabled = useRumEnabled();
 *   // Only initialize analytics if RUM is enabled
 * }
 * ```
 */
export function useRumEnabled(): boolean {
  return useMemo(() => isRumEnabled(), []);
}
