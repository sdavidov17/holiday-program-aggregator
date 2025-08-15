import { useSession } from 'next-auth/react';
import { api } from '~/utils/api';
import {
  doesSubscriptionNeedRenewal,
  getDaysUntilExpiry,
  isSubscriptionActive,
  isSubscriptionInTrial,
} from '~/utils/subscription';

export function useSubscriptionStatus() {
  const { data: session } = useSession();
  const { data: subscription, isLoading } = api.subscription.getStatus.useQuery(undefined, {
    enabled: !!session,
  });

  const subscriptionData = subscription
    ? {
        status: subscription.status as any, // API returns string, but we know it's SubscriptionStatus
        expiresAt: subscription.expiresAt,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      }
    : null;

  const hasActiveSubscription = isSubscriptionActive(subscriptionData);
  const isInTrial = isSubscriptionInTrial(subscriptionData);
  const needsRenewal = doesSubscriptionNeedRenewal(subscriptionData);
  const daysUntilExpiry = getDaysUntilExpiry(subscriptionData);
  const expiresAt = subscription?.expiresAt;

  return {
    hasActiveSubscription,
    isInTrial,
    needsRenewal,
    daysUntilExpiry,
    expiresAt,
    isLoading,
    subscription,
  };
}
