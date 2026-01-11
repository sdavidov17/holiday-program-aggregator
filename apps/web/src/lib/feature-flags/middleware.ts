/**
 * Edge runtime compatible feature flag helpers
 * For use in Next.js middleware (no Node.js APIs)
 *
 * Note: Edge runtime has limited env access, so we read directly from process.env
 */

/**
 * Check feature flag from environment in edge runtime
 */
export function isFeatureEnabledEdge(flagEnvVar: string): boolean {
  const value = process.env[flagEnvVar];
  return value === 'true';
}

/**
 * Specific edge-compatible helpers
 */
export function isAgentEnabledEdge(): boolean {
  return isFeatureEnabledEdge('FEATURE_AGENT_ENABLED');
}

export function isChecklyEnabledEdge(): boolean {
  return isFeatureEnabledEdge('FEATURE_CHECKLY_ENABLED');
}

export function isRumEnabledEdge(): boolean {
  return isFeatureEnabledEdge('NEXT_PUBLIC_FEATURE_RUM_ENABLED');
}

/**
 * Get client-safe flags for injection into response headers
 * Useful for SSR hydration of client flags
 */
export function getClientFlagsForHeader(): string {
  return JSON.stringify({
    RUM_ENABLED: isRumEnabledEdge(),
  });
}
