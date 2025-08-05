interface SubscriptionMetrics {
  timestamp: string;
  remindersQueued: number;
  remindersSent: number;
  remindersFailed: number;
  subscriptionsExpired: number;
  expirationNoticesSent: number;
  expirationNoticesFailed: number;
  totalErrors: number;
  processingTimeMs: number;
}

export class SubscriptionMetricsCollector {
  private metrics: SubscriptionMetrics;
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      timestamp: new Date().toISOString(),
      remindersQueued: 0,
      remindersSent: 0,
      remindersFailed: 0,
      subscriptionsExpired: 0,
      expirationNoticesSent: 0,
      expirationNoticesFailed: 0,
      totalErrors: 0,
      processingTimeMs: 0,
    };
  }

  incrementRemindersQueued(count: number = 1) {
    this.metrics.remindersQueued += count;
  }

  incrementRemindersSent(count: number = 1) {
    this.metrics.remindersSent += count;
  }

  incrementRemindersFailed(count: number = 1) {
    this.metrics.remindersFailed += count;
    this.metrics.totalErrors += count;
  }

  incrementSubscriptionsExpired(count: number = 1) {
    this.metrics.subscriptionsExpired += count;
  }

  incrementExpirationNoticesSent(count: number = 1) {
    this.metrics.expirationNoticesSent += count;
  }

  incrementExpirationNoticesFailed(count: number = 1) {
    this.metrics.expirationNoticesFailed += count;
    this.metrics.totalErrors += count;
  }

  getMetrics(): SubscriptionMetrics {
    this.metrics.processingTimeMs = Date.now() - this.startTime;
    return { ...this.metrics };
  }

  // Log metrics to console in production
  // In a real app, this would send to a monitoring service
  logMetrics() {
    const metrics = this.getMetrics();
    console.log('Subscription Lifecycle Metrics:', JSON.stringify(metrics, null, 2));
    
    // Alert conditions
    if (metrics.totalErrors > 0) {
      console.error(`ALERT: ${metrics.totalErrors} errors occurred during subscription lifecycle processing`);
    }
    
    if (metrics.processingTimeMs > 30000) { // 30 seconds
      console.warn(`ALERT: Subscription lifecycle processing took ${metrics.processingTimeMs}ms`);
    }
    
    if (metrics.remindersFailed > metrics.remindersSent) {
      console.error('ALERT: More reminder failures than successes');
    }
    
    return metrics;
  }
}