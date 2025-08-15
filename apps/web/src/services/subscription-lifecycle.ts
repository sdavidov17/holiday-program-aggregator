import { addDays, startOfDay } from 'date-fns';
import { db, SubscriptionStatus } from '~/server/db';
import { SubscriptionMetricsCollector } from '~/utils/subscription-metrics';
import { sendExpirationNotice, sendRenewalReminder } from './email';

export interface LifecycleResults {
  reminders: number;
  expired: number;
  errors: string[];
}

export async function processSubscriptionLifecycle(): Promise<LifecycleResults> {
  const metrics = new SubscriptionMetricsCollector();
  const results: LifecycleResults = {
    reminders: 0,
    expired: 0,
    errors: [],
  };

  try {
    // Process renewal reminders
    const reminderResults = await sendRenewalReminders(metrics);
    results.reminders = reminderResults.sent;
    if (reminderResults.errors.length > 0) {
      results.errors.push(...reminderResults.errors);
    }

    // Process expirations
    const expirationResults = await processExpiredSubscriptions(metrics);
    results.expired = expirationResults.processed;
    if (expirationResults.errors.length > 0) {
      results.errors.push(...expirationResults.errors);
    }

    // Log results and metrics
    await logLifecycleRun(results);
    metrics.logMetrics();
  } catch (error) {
    console.error('Subscription lifecycle error:', error);
    results.errors.push(
      `General error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    metrics.incrementRemindersFailed();
  }

  return results;
}

async function sendRenewalReminders(
  metrics: SubscriptionMetricsCollector,
): Promise<{ sent: number; errors: string[] }> {
  const results = { sent: 0, errors: [] as string[] };

  try {
    // Find subscriptions expiring in exactly 7 days
    const sevenDaysFromNow = addDays(startOfDay(new Date()), 7);
    const eightDaysFromNow = addDays(sevenDaysFromNow, 1);

    const expiringSubscriptions = await db.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        expiresAt: {
          gte: sevenDaysFromNow,
          lt: eightDaysFromNow,
        },
        // Only send if we haven't sent a reminder in the last 24 hours
        OR: [{ lastReminderSent: null }, { lastReminderSent: { lt: addDays(new Date(), -1) } }],
      },
      include: {
        user: true,
      },
    });

    metrics.incrementRemindersQueued(expiringSubscriptions.length);

    for (const subscription of expiringSubscriptions) {
      try {
        if (!subscription.user.email) {
          results.errors.push(`No email for user ${subscription.userId}`);
          metrics.incrementRemindersFailed();
          continue;
        }

        await sendRenewalReminder(subscription.user.email, {
          userName: subscription.user.name || 'Valued Customer',
          expirationDate: subscription.expiresAt!.toLocaleDateString('en-AU'),
          renewalUrl: `${process.env.NEXTAUTH_URL}/subscription/renew`,
        });

        // Update reminder tracking
        await db.subscription.update({
          where: { id: subscription.id },
          data: {
            lastReminderSent: new Date(),
            reminderCount: { increment: 1 },
          },
        });

        results.sent++;
        metrics.incrementRemindersSent();
      } catch (error) {
        results.errors.push(
          `Failed to send reminder for ${subscription.userId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        metrics.incrementRemindersFailed();
      }
    }
  } catch (error) {
    results.errors.push(
      `Reminder query error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  return results;
}

async function processExpiredSubscriptions(
  metrics: SubscriptionMetricsCollector,
): Promise<{ processed: number; errors: string[] }> {
  const results = { processed: 0, errors: [] as string[] };

  try {
    const now = new Date();

    // Find active subscriptions that have expired
    const expiredSubscriptions = await db.subscription.findMany({
      where: {
        status: SubscriptionStatus.ACTIVE,
        expiresAt: {
          lt: now,
        },
      },
      include: {
        user: true,
      },
    });

    for (const subscription of expiredSubscriptions) {
      try {
        // Update subscription status
        await db.subscription.update({
          where: { id: subscription.id },
          data: {
            status: SubscriptionStatus.EXPIRED,
          },
        });

        metrics.incrementSubscriptionsExpired();

        // Send expiration notice
        if (subscription.user.email) {
          try {
            await sendExpirationNotice(subscription.user.email, {
              userName: subscription.user.name || 'Valued Customer',
              expiredDate: subscription.expiresAt!.toLocaleDateString('en-AU'),
              renewalUrl: `${process.env.NEXTAUTH_URL}/subscription/renew`,
            });
            metrics.incrementExpirationNoticesSent();
          } catch (emailError) {
            results.errors.push(
              `Failed to send expiration email for ${subscription.userId}: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`,
            );
            metrics.incrementExpirationNoticesFailed();
          }
        }

        results.processed++;
      } catch (error) {
        results.errors.push(
          `Failed to process expiration for ${subscription.userId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }
  } catch (error) {
    results.errors.push(
      `Expiration query error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }

  return results;
}

async function logLifecycleRun(results: LifecycleResults): Promise<void> {
  console.log('Subscription lifecycle run completed:', {
    timestamp: new Date().toISOString(),
    reminders: results.reminders,
    expired: results.expired,
    errors: results.errors.length,
    errorDetails: results.errors,
  });

  // In production, this would send to a proper logging service
  // For now, just console.log
}
