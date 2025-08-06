import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { SubscriptionStatus } from "@prisma/client";

export function useSubscriptionStatus() {
  const { data: session } = useSession();
  const { data: subscription, isLoading } = api.subscription.getStatus.useQuery(
    undefined,
    { enabled: !!session }
  );

  const hasActiveSubscription = subscription?.status === SubscriptionStatus.ACTIVE;
  const isExpired = subscription?.status === SubscriptionStatus.EXPIRED;
  const isPending = subscription?.status === SubscriptionStatus.PENDING;
  const isCanceled = subscription?.status === SubscriptionStatus.CANCELED;
  const expiresAt = subscription?.expiresAt;

  return {
    hasActiveSubscription,
    isExpired,
    isPending,
    isCanceled,
    expiresAt,
    isLoading,
    subscription,
  };
}