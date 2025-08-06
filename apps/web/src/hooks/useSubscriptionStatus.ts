import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { 
  isSubscriptionActive, 
  isSubscriptionInTrial,
  doesSubscriptionNeedRenewal,
  getDaysUntilExpiry 
} from "~/utils/subscription";

export function useSubscriptionStatus() {
  const { data: session } = useSession();
  const { data: subscription, isLoading } = api.subscription.getStatus.useQuery(
    undefined,
    { enabled: !!session }
  );

  const hasActiveSubscription = isSubscriptionActive(subscription ?? null);
  const isInTrial = isSubscriptionInTrial(subscription ?? null);
  const needsRenewal = doesSubscriptionNeedRenewal(subscription ?? null);
  const daysUntilExpiry = getDaysUntilExpiry(subscription ?? null);
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