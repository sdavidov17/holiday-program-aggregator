/**
 * Monitoring and Analytics for Critical User Journeys
 */

export enum MonitoringEvent {
  // Parent Journey Events
  SEARCH_INITIATED = 'search_initiated',
  SEARCH_COMPLETED = 'search_completed',
  PROVIDER_VIEWED = 'provider_viewed',
  SUBSCRIPTION_STARTED = 'subscription_started',
  SUBSCRIPTION_COMPLETED = 'subscription_completed',
  PAYMENT_INITIATED = 'payment_initiated',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed',

  // Admin Journey Events
  ADMIN_LOGIN = 'admin_login',
  PROVIDER_CREATED = 'provider_created',
  PROVIDER_VETTED = 'provider_vetted',
  PROVIDER_PUBLISHED = 'provider_published',
  PROVIDER_DELETED = 'provider_deleted',

  // Performance Events
  PAGE_LOAD_TIME = 'page_load_time',
  API_RESPONSE_TIME = 'api_response_time',
  SEARCH_RESPONSE_TIME = 'search_response_time',

  // Error Events
  API_ERROR = 'api_error',
  PAYMENT_ERROR = 'payment_error',
  AUTH_ERROR = 'auth_error',
}

export interface MonitoringData {
  event: MonitoringEvent;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp?: number;
  duration?: number;
  error?: string;
}

class MonitoringService {
  private sessionId: string;
  private userId: string | undefined = undefined;
  private performanceObserver: PerformanceObserver | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializePerformanceObserver();
  }

  private generateSessionId(): string {
    // Use crypto.randomUUID for cryptographically secure session IDs
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `session_${crypto.randomUUID()}`;
    }
    // Fallback for older browsers using crypto.getRandomValues
    const array = new Uint32Array(2);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
      return `session_${Date.now()}_${array[0]!.toString(36)}_${array[1]!.toString(36)}`;
    }
    // Server-side Node.js environment
    if (typeof window === 'undefined') {
      const { randomBytes } = require('node:crypto');
      return `session_${randomBytes(16).toString('hex')}`;
    }
    // Last resort fallback (should not reach here in modern environments)
    throw new Error('No secure random number generator available');
  }

  private initializePerformanceObserver() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    this.performanceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          this.track(MonitoringEvent.PAGE_LOAD_TIME, {
            duration: entry.duration,
            path: window.location.pathname,
          });
        }
      }
    });

    this.performanceObserver.observe({ entryTypes: ['navigation'] });
  }

  public setUserId(userId: string) {
    this.userId = userId;
  }

  public track(event: MonitoringEvent, properties?: Record<string, any>) {
    const data: MonitoringData = {
      event,
      properties,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
    };

    // Send to analytics service
    this.sendToAnalytics(data);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Monitoring]', data);
    }
  }

  public trackError(event: MonitoringEvent, error: Error, context?: Record<string, any>) {
    const data: MonitoringData = {
      event,
      properties: context,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      error: error.message,
    };

    // Send to error tracking service
    this.sendToErrorTracking(data);

    // Log to console
    console.error('[Monitoring Error]', data, error);
  }

  public async trackApiCall<T>(operation: string, apiCall: () => Promise<T>): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await apiCall();
      const duration = Date.now() - startTime;

      this.track(MonitoringEvent.API_RESPONSE_TIME, {
        operation,
        duration,
        success: true,
      });

      // Alert if response time is slow
      if (duration > 3000) {
        this.sendAlert('Slow API Response', {
          operation,
          duration,
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.trackError(MonitoringEvent.API_ERROR, error as Error, {
        operation,
        duration,
      });

      throw error;
    }
  }

  private sendToAnalytics(data: MonitoringData) {
    // Integration with analytics service (e.g., Google Analytics, Mixpanel)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', data.event, {
        event_category: 'User Journey',
        event_label: data.properties?.label,
        value: data.properties?.value,
        custom_properties: data.properties,
      });
    }

    // Send to custom analytics endpoint
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch((err) => console.error('Failed to send analytics:', err));
    }
  }

  private sendToErrorTracking(data: MonitoringData) {
    // Integration with error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(new Error(data.error || 'Unknown error'), {
        tags: {
          event: data.event,
          userId: data.userId,
          sessionId: data.sessionId,
        },
        extra: data.properties,
      });
    }
  }

  public sendAlert(message: string, context: Record<string, any>) {
    // Send alerts for critical issues
    if (process.env.NEXT_PUBLIC_ALERT_WEBHOOK) {
      fetch(process.env.NEXT_PUBLIC_ALERT_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context,
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) => console.error('Failed to send alert:', err));
    }
  }

  public startTimer(label: string): () => void {
    const startTime = Date.now();

    return () => {
      const duration = Date.now() - startTime;
      this.track(MonitoringEvent.PAGE_LOAD_TIME, {
        label,
        duration,
      });
    };
  }
}

// Singleton instance
export const monitoring = new MonitoringService();

import { useRouter } from 'next/router';
// React Hooks
import { useEffect } from 'react';

export function usePageTracking() {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      monitoring.track(MonitoringEvent.PAGE_LOAD_TIME, {
        path: url,
      });
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);
}

export function useSearchTracking() {
  return {
    trackSearchInitiated: (query: string, filters?: Record<string, any>) => {
      monitoring.track(MonitoringEvent.SEARCH_INITIATED, {
        query,
        filters,
      });
    },

    trackSearchCompleted: (query: string, resultCount: number, duration: number) => {
      monitoring.track(MonitoringEvent.SEARCH_COMPLETED, {
        query,
        resultCount,
        duration,
      });

      // Alert if search is slow
      if (duration > 2000) {
        monitoring.sendAlert('Slow Search', {
          query,
          duration,
        });
      }
    },
  };
}

export function useProviderTracking() {
  return {
    trackProviderViewed: (providerId: string, providerName: string) => {
      monitoring.track(MonitoringEvent.PROVIDER_VIEWED, {
        providerId,
        providerName,
      });
    },

    trackProviderCreated: (providerId: string) => {
      monitoring.track(MonitoringEvent.PROVIDER_CREATED, {
        providerId,
      });
    },

    trackProviderVetted: (providerId: string, isVetted: boolean) => {
      monitoring.track(MonitoringEvent.PROVIDER_VETTED, {
        providerId,
        isVetted,
      });
    },
  };
}

export function usePaymentTracking() {
  return {
    trackPaymentInitiated: (amount: number, plan: string) => {
      monitoring.track(MonitoringEvent.PAYMENT_INITIATED, {
        amount,
        plan,
      });
    },

    trackPaymentCompleted: (amount: number, plan: string, paymentId: string) => {
      monitoring.track(MonitoringEvent.PAYMENT_COMPLETED, {
        amount,
        plan,
        paymentId,
      });
    },

    trackPaymentFailed: (error: string, amount: number, plan: string) => {
      monitoring.trackError(MonitoringEvent.PAYMENT_FAILED, new Error(error), { amount, plan });
    },
  };
}

// Health Check Probes
export const healthChecks = {
  async checkSearchAvailability(): Promise<boolean> {
    try {
      const response = await fetch('/api/health/search');
      return response.ok;
    } catch {
      return false;
    }
  },

  async checkPaymentAvailability(): Promise<boolean> {
    try {
      const response = await fetch('/api/health/payment');
      return response.ok;
    } catch {
      return false;
    }
  },

  async checkDatabaseConnection(): Promise<boolean> {
    try {
      const response = await fetch('/api/health/database');
      return response.ok;
    } catch {
      return false;
    }
  },

  async checkAuthService(): Promise<boolean> {
    try {
      const response = await fetch('/api/health/auth');
      return response.ok;
    } catch {
      return false;
    }
  },
};

// Automated Health Monitoring
export function startHealthMonitoring() {
  // High priority - every minute
  setInterval(async () => {
    const searchHealthy = await healthChecks.checkSearchAvailability();
    const authHealthy = await healthChecks.checkAuthService();

    if (!searchHealthy) {
      monitoring.sendAlert('Search Service Unavailable', {});
    }
    if (!authHealthy) {
      monitoring.sendAlert('Auth Service Unavailable', {});
    }
  }, 60 * 1000);

  // Medium priority - every 5 minutes
  setInterval(
    async () => {
      const paymentHealthy = await healthChecks.checkPaymentAvailability();
      const dbHealthy = await healthChecks.checkDatabaseConnection();

      if (!paymentHealthy) {
        monitoring.sendAlert('Payment Service Unavailable', {});
      }
      if (!dbHealthy) {
        monitoring.sendAlert('Database Connection Failed', {});
      }
    },
    5 * 60 * 1000,
  );
}

// Window type declarations
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    Sentry?: {
      captureException: (error: Error, context?: any) => void;
    };
  }
}
