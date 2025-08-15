import type { Subscription } from '@prisma/client';
import { SubscriptionStatus } from '~/types/database';

// Minimal subscription data needed for status checks
export interface SubscriptionData {
  status: SubscriptionStatus;
  expiresAt: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: Date | null;
  stripeSubscriptionId?: string | null;
}

// Partial subscription data (from API responses)
export type PartialSubscriptionData = Partial<SubscriptionData> & {
  status?: SubscriptionStatus;
};

/**
 * Check if a subscription is currently active
 */
export function isSubscriptionActive(
  subscription: PartialSubscriptionData | SubscriptionData | Subscription | null,
): boolean {
  if (!subscription || !subscription.status) return false;

  return (
    subscription.status === SubscriptionStatus.ACTIVE &&
    (!subscription.expiresAt || subscription.expiresAt > new Date())
  );
}

/**
 * Check if a subscription is in trial period
 */
export function isSubscriptionInTrial(
  subscription: PartialSubscriptionData | SubscriptionData | Subscription | null,
): boolean {
  if (!subscription || !subscription.status) return false;

  // Check if subscription is active and has a trial end date in the future
  return (
    subscription.status === SubscriptionStatus.ACTIVE &&
    subscription.trialEndsAt !== null &&
    subscription.trialEndsAt !== undefined &&
    subscription.trialEndsAt > new Date()
  );
}

/**
 * Check if a subscription needs renewal
 */
export function doesSubscriptionNeedRenewal(
  subscription: PartialSubscriptionData | SubscriptionData | Subscription | null,
): boolean {
  if (!subscription || !subscription.status) return false;

  const needsRenewal =
    subscription.status === SubscriptionStatus.PAST_DUE ||
    subscription.status === SubscriptionStatus.CANCELED ||
    subscription.status === SubscriptionStatus.EXPIRED ||
    subscription.status === SubscriptionStatus.PENDING;

  return needsRenewal;
}

/**
 * Get human-readable subscription status
 */
export function getSubscriptionStatusLabel(
  subscription: PartialSubscriptionData | SubscriptionData | Subscription | null,
): string {
  if (!subscription || !subscription.status) return 'No Subscription';

  switch (subscription.status) {
    case SubscriptionStatus.ACTIVE:
      return subscription.cancelAtPeriodEnd ? 'Active (Canceling)' : 'Active';
    case SubscriptionStatus.PENDING:
      return 'Pending';
    case SubscriptionStatus.PAST_DUE:
      return 'Past Due';
    case SubscriptionStatus.CANCELED:
      return 'Canceled';
    case SubscriptionStatus.EXPIRED:
      return 'Expired';
    default:
      return 'Unknown';
  }
}

/**
 * Get subscription status color for UI
 */
export function getSubscriptionStatusColor(
  subscription: PartialSubscriptionData | SubscriptionData | Subscription | null,
): string {
  if (!subscription || !subscription.status) return 'gray';

  switch (subscription.status) {
    case SubscriptionStatus.ACTIVE:
      return subscription.cancelAtPeriodEnd ? 'yellow' : 'green';
    case SubscriptionStatus.PENDING:
      return 'yellow';
    case SubscriptionStatus.PAST_DUE:
      return 'red';
    case SubscriptionStatus.CANCELED:
    case SubscriptionStatus.EXPIRED:
      return 'gray';
    default:
      return 'gray';
  }
}

/**
 * Calculate days until subscription expires
 */
export function getDaysUntilExpiry(
  subscription: PartialSubscriptionData | SubscriptionData | Subscription | null,
): number | null {
  if (!subscription || !subscription.currentPeriodEnd) return null;

  const now = new Date();
  const expiryDate = new Date(subscription.currentPeriodEnd);
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Check if subscription can be canceled
 */
export function canCancelSubscription(
  subscription: PartialSubscriptionData | SubscriptionData | Subscription | null,
): boolean {
  if (!subscription || !subscription.status) return false;

  return (
    subscription.status === SubscriptionStatus.ACTIVE &&
    !subscription.cancelAtPeriodEnd &&
    subscription.stripeSubscriptionId !== null &&
    subscription.stripeSubscriptionId !== undefined
  );
}

/**
 * Check if subscription can be resumed (un-canceled)
 */
export function canResumeSubscription(
  subscription: PartialSubscriptionData | SubscriptionData | Subscription | null,
): boolean {
  if (!subscription || !subscription.status) return false;

  return (
    subscription.status === SubscriptionStatus.ACTIVE &&
    subscription.cancelAtPeriodEnd === true &&
    subscription.stripeSubscriptionId !== null &&
    subscription.stripeSubscriptionId !== undefined
  );
}
