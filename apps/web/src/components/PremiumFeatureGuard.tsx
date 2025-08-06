import React from 'react';
import { useSubscriptionStatus } from '~/hooks/useSubscriptionStatus';
import Link from 'next/link';

interface PremiumFeatureGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const SubscriptionPrompt: React.FC = () => (
  <div className="text-center p-8 bg-gray-50 rounded-lg">
    <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
    <p className="text-gray-600 mb-4">
      This feature requires an active subscription.
    </p>
    <Link
      href="/subscription"
      className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
    >
      Subscribe Now
    </Link>
  </div>
);

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center p-8">
    <div data-testid="loading-spinner" className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

export function PremiumFeatureGuard({ 
  children,
  fallback = <SubscriptionPrompt />
}: PremiumFeatureGuardProps) {
  const { hasActiveSubscription, isLoading } = useSubscriptionStatus();

  if (isLoading) return <LoadingSpinner />;
  if (!hasActiveSubscription) return <>{fallback}</>;

  return <>{children}</>;
}