import React from 'react';
import { useRouter } from 'next/router';
import { api } from '~/utils/api';
import { 
  isSubscriptionActive,
  doesSubscriptionNeedRenewal,
  getSubscriptionStatusLabel,
  getSubscriptionStatusColor,
  getDaysUntilExpiry,
  canCancelSubscription,
  canResumeSubscription
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

  const subscriptionData = subscription?.hasSubscription && subscription.status ? {
    status: subscription.status,
    expiresAt: subscription.expiresAt,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  } : null;
  
  const isActive = isSubscriptionActive(subscriptionData);
  const needsRenewal = doesSubscriptionNeedRenewal(subscriptionData);
  const statusLabel = getSubscriptionStatusLabel(subscriptionData);
  const statusColor = getSubscriptionStatusColor(subscriptionData);
  const daysUntilExpiry = getDaysUntilExpiry(subscriptionData);
  const canCancel = canCancelSubscription(subscriptionData);
  const canResume = canResumeSubscription(subscriptionData);

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Subscription Status</h2>
      
      <div className={styles.statusSection}>
        <div className={styles.statusBadge} data-status={statusColor}>
          {statusLabel}
        </div>
        
        {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
          <p className={styles.expiryInfo}>
            {daysUntilExpiry} days remaining
          </p>
        )}
        
        {subscription?.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
          <p className={styles.cancelInfo}>
            Cancels on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className={styles.actions}>
        {!isActive && !subscription?.cancelAtPeriodEnd && (
          <button 
            className={styles.subscribeButton}
            onClick={() => createCheckoutSession.mutate({})}
            disabled={createCheckoutSession.isPending}
          >
            {createCheckoutSession.isPending ? 'Processing...' : 'Subscribe Now'}
          </button>
        )}
        
        {canCancel && (
          <button 
            className={styles.cancelButton}
            onClick={() => cancelSubscription.mutate()}
            disabled={cancelSubscription.isPending}
          >
            {cancelSubscription.isPending ? 'Processing...' : 'Cancel Subscription'}
          </button>
        )}
        
        {canResume && (
          <button 
            className={styles.resumeButton}
            onClick={() => {
              // TODO: Implement resume subscription mutation
              alert('Resume subscription functionality coming soon');
            }}
          >
            Resume Subscription
          </button>
        )}
      </div>

      {needsRenewal && !subscription?.cancelAtPeriodEnd && (
        <div className={styles.renewalNotice}>
          <p>Your subscription needs attention. Please update your payment method or resubscribe.</p>
        </div>
      )}
    </div>
  );
}