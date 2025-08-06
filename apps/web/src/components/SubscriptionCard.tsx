import React from 'react';
import { useRouter } from 'next/router';
import { api } from '~/utils/api';
import { SubscriptionStatus } from '@prisma/client';
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
      // Show user-friendly error message
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

  const isActive = subscription?.hasSubscription && subscription.status === SubscriptionStatus.ACTIVE;
  const isPending = subscription?.status === SubscriptionStatus.PENDING;
  const isExpired = subscription?.status === SubscriptionStatus.EXPIRED;
  const isCanceled = subscription?.status === SubscriptionStatus.CANCELED;
  const isPastDue = subscription?.status === SubscriptionStatus.PAST_DUE;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2>Subscription Status</h2>
        {isActive && <span className={styles.activeBadge}>Active</span>}
        {isPending && <span className={styles.pendingBadge}>Pending</span>}
        {isExpired && <span className={styles.expiredBadge}>Expired</span>}
        {isCanceled && <span className={styles.canceledBadge}>Canceled</span>}
        {isPastDue && <span className={styles.pastDueBadge}>Past Due</span>}
      </div>

      <div className={styles.content}>
        {isActive && (
          <>
            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span className={styles.label}>Plan:</span>
                <span className={styles.value}>Annual Subscription</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Price:</span>
                <span className={styles.value}>$99/year</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Next billing date:</span>
                <span className={styles.value}>
                  {subscription.currentPeriodEnd 
                    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'N/A'}
                </span>
              </div>
              {subscription.cancelAtPeriodEnd && (
                <div className={styles.warning}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 12a1 1 0 110-2 1 1 0 010 2zm1-3H7V4h2v5z"/>
                  </svg>
                  Your subscription will end on {subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className={styles.actions}>
              {!subscription.cancelAtPeriodEnd && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) {
                      cancelSubscription.mutate();
                    }
                  }}
                  disabled={cancelSubscription.isPending}
                  className={styles.cancelButton}
                >
                  {cancelSubscription.isPending ? 'Canceling...' : 'Cancel Subscription'}
                </button>
              )}
            </div>
          </>
        )}

        {isPastDue && (
          <>
            <div className={styles.alert}>
              <h3>Payment Required</h3>
              <p>Your subscription payment is past due. Please update your payment method to continue accessing premium features.</p>
            </div>
            <button
              onClick={() => createCheckoutSession.mutate({})}
              disabled={createCheckoutSession.isPending}
              className={styles.primaryButton}
            >
              {createCheckoutSession.isPending ? 'Loading...' : 'Update Payment Method'}
            </button>
          </>
        )}

        {(isExpired || isCanceled || (!subscription?.hasSubscription && !isPending)) && (
          <>
            <div className={styles.benefits}>
              <h3>Premium Benefits</h3>
              <ul>
                <li>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  Unlimited program searches
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  Save your favorite programs
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  Email notifications for new programs
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  Advanced search filters
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  Priority customer support
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                console.log('Subscribe button clicked');
                createCheckoutSession.mutate({});
              }}
              disabled={createCheckoutSession.isPending}
              className={styles.subscribeButton}
            >
              {createCheckoutSession.isPending ? (
                <>
                  <div className={styles.buttonSpinner} />
                  Processing...
                </>
              ) : (
                <>
                  Subscribe Now - $99/year
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </>
              )}
            </button>
          </>
        )}

        {isPending && (
          <div className={styles.pending}>
            <div className={styles.pendingIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3>Subscription Pending</h3>
            <p>Your subscription is being processed. This usually takes just a few moments.</p>
            <p className={styles.small}>If this takes longer than expected, please contact support.</p>
          </div>
        )}
      </div>
    </div>
  );
}