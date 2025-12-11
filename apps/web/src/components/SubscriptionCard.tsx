import { useRouter } from 'next/router';
import { api } from '~/utils/api';
import {
  canCancelSubscription,
  canResumeSubscription,
  doesSubscriptionNeedRenewal,
  getDaysUntilExpiry,
  getSubscriptionStatusColor,
  getSubscriptionStatusLabel,
  isSubscriptionActive,
} from '~/utils/subscription';
import styles from './SubscriptionCard.module.css';

export function SubscriptionCard() {
  const router = useRouter();
  const { data: subscription, isLoading } = api.subscription.getSubscriptionStatus.useQuery();

  const createCheckoutSession = api.subscription.createCheckoutSession.useMutation({
    onSuccess: async (data) => {
      console.log('Checkout session created:', data);
      if (data.url) {
        await router.push(data.url);
      }
    },
    onError: (error) => {
      console.error('Checkout error details:', {
        message: error.message,
        data: error.data,
        shape: error.shape,
      });
      // TODO: Replace with proper toast notification
      alert(`Error creating checkout session: ${error.message}`);
    },
  });

  const cancelSubscription = api.subscription.cancelSubscription.useMutation({
    onSuccess: () => {
      void router.reload();
    },
  });

  if (isLoading) {
    return (
      <div className={styles.card}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading subscription details...</p>
        </div>
      </div>
    );
  }

  const subscriptionData =
    subscription?.hasSubscription && subscription.status
      ? {
          status: subscription.status as any, // API returns string, but we know it's SubscriptionStatus
          expiresAt: subscription.expiresAt,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        }
      : null;

  const isActive = isSubscriptionActive(subscriptionData);
  const needsRenewal = doesSubscriptionNeedRenewal(subscriptionData);
  const statusLabel = getSubscriptionStatusLabel(subscriptionData);
  const statusColor = getSubscriptionStatusColor(subscriptionData);
  const daysUntilExpiry = getDaysUntilExpiry(subscriptionData);
  const canCancel = canCancelSubscription(subscriptionData);
  const canResume = canResumeSubscription(subscriptionData);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2>Subscription Status</h2>
        <span
          className={
            statusColor === 'green'
              ? styles.activeBadge
              : statusColor === 'yellow'
                ? styles.pendingBadge
                : statusColor === 'red'
                  ? styles.expiredBadge
                  : statusColor === 'blue'
                    ? styles.pastDueBadge
                    : styles.canceledBadge
          }
          data-testid="subscription-status"
        >
          {statusLabel}
        </span>
      </div>

      <div className={styles.content}>
        <div className={styles.details}>
          {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
            <div className={styles.detailRow}>
              <span className={styles.label}>Days Remaining</span>
              <span className={styles.value}>{daysUntilExpiry}</span>
            </div>
          )}

          {subscription?.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
            <div className={styles.detailRow}>
              <span className={styles.label}>Cancels On</span>
              <span className={styles.value}>
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          {!isActive && !subscription?.cancelAtPeriodEnd && (
            <button
              className={styles.subscribeButton}
              onClick={() => createCheckoutSession.mutate({})}
              disabled={createCheckoutSession.isPending}
              data-testid="upgrade-plan"
            >
              {createCheckoutSession.isPending ? 'Processing...' : 'Subscribe Now'}
            </button>
          )}

          {canCancel && (
            <button
              className={styles.cancelButton}
              onClick={() => cancelSubscription.mutate()}
              disabled={cancelSubscription.isPending}
              data-testid="cancel-subscription"
            >
              {cancelSubscription.isPending ? 'Processing...' : 'Cancel Subscription'}
            </button>
          )}

          {canResume && (
            <button
              className={styles.resumeButton}
              onClick={() => {
                alert('Resume subscription functionality coming soon');
              }}
              data-testid="reactivate-subscription"
            >
              Resume Subscription
            </button>
          )}
        </div>

        {needsRenewal && !subscription?.cancelAtPeriodEnd && (
          <div className={styles.warning}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Your subscription needs attention. Please update your payment method or resubscribe.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
