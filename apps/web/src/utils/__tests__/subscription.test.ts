/**
 * Subscription Utilities Test Suite
 * Tests for subscription status checks and helper functions
 */

import { describe, expect, it } from '@jest/globals';
import { SubscriptionStatus } from '~/types/database';
import {
  canCancelSubscription,
  canResumeSubscription,
  doesSubscriptionNeedRenewal,
  getDaysUntilExpiry,
  getSubscriptionStatusColor,
  getSubscriptionStatusLabel,
  isSubscriptionActive,
  isSubscriptionInTrial,
  type SubscriptionData,
} from '../subscription';

describe('Subscription Utilities', () => {
  // Helper to create subscription data
  const createSubscription = (overrides: Partial<SubscriptionData> = {}): SubscriptionData => ({
    status: SubscriptionStatus.ACTIVE,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    cancelAtPeriodEnd: false,
    trialEndsAt: null,
    stripeSubscriptionId: 'sub_test123',
    ...overrides,
  });

  describe('isSubscriptionActive', () => {
    it('should return false for null subscription', () => {
      expect(isSubscriptionActive(null)).toBe(false);
    });

    it('should return false for subscription without status', () => {
      expect(isSubscriptionActive({})).toBe(false);
    });

    it('should return true for active subscription with future expiry', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 10000),
      });

      expect(isSubscriptionActive(subscription)).toBe(true);
    });

    it('should return true for active subscription with null expiresAt', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.ACTIVE,
        expiresAt: null,
      });

      expect(isSubscriptionActive(subscription)).toBe(true);
    });

    it('should return false for active subscription with past expiry', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.ACTIVE,
        expiresAt: new Date(Date.now() - 10000),
      });

      expect(isSubscriptionActive(subscription)).toBe(false);
    });

    it('should return false for non-active status', () => {
      const statuses = [
        SubscriptionStatus.PENDING,
        SubscriptionStatus.PAST_DUE,
        SubscriptionStatus.CANCELED,
        SubscriptionStatus.EXPIRED,
      ];

      statuses.forEach((status) => {
        const subscription = createSubscription({ status });
        expect(isSubscriptionActive(subscription)).toBe(false);
      });
    });
  });

  describe('isSubscriptionInTrial', () => {
    it('should return false for null subscription', () => {
      expect(isSubscriptionInTrial(null)).toBe(false);
    });

    it('should return false for subscription without status', () => {
      expect(isSubscriptionInTrial({})).toBe(false);
    });

    it('should return true for active subscription with future trial end date', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.ACTIVE,
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      });

      expect(isSubscriptionInTrial(subscription)).toBe(true);
    });

    it('should return false for active subscription with past trial end date', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.ACTIVE,
        trialEndsAt: new Date(Date.now() - 1000),
      });

      expect(isSubscriptionInTrial(subscription)).toBe(false);
    });

    it('should return false for active subscription with null trial end date', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.ACTIVE,
        trialEndsAt: null,
      });

      expect(isSubscriptionInTrial(subscription)).toBe(false);
    });

    it('should return false for active subscription with undefined trial end date', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.ACTIVE,
        trialEndsAt: undefined,
      });

      expect(isSubscriptionInTrial(subscription)).toBe(false);
    });

    it('should return false for non-active subscription even with future trial end', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.PENDING,
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      expect(isSubscriptionInTrial(subscription)).toBe(false);
    });
  });

  describe('doesSubscriptionNeedRenewal', () => {
    it('should return false for null subscription', () => {
      expect(doesSubscriptionNeedRenewal(null)).toBe(false);
    });

    it('should return false for subscription without status', () => {
      expect(doesSubscriptionNeedRenewal({})).toBe(false);
    });

    it('should return false for active subscription', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.ACTIVE,
      });

      expect(doesSubscriptionNeedRenewal(subscription)).toBe(false);
    });

    it('should return true for PAST_DUE status', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.PAST_DUE,
      });

      expect(doesSubscriptionNeedRenewal(subscription)).toBe(true);
    });

    it('should return true for CANCELED status', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.CANCELED,
      });

      expect(doesSubscriptionNeedRenewal(subscription)).toBe(true);
    });

    it('should return true for EXPIRED status', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.EXPIRED,
      });

      expect(doesSubscriptionNeedRenewal(subscription)).toBe(true);
    });

    it('should return true for PENDING status', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.PENDING,
      });

      expect(doesSubscriptionNeedRenewal(subscription)).toBe(true);
    });
  });

  describe('getSubscriptionStatusLabel', () => {
    it('should return "No Subscription" for null subscription', () => {
      expect(getSubscriptionStatusLabel(null)).toBe('No Subscription');
    });

    it('should return "No Subscription" for subscription without status', () => {
      expect(getSubscriptionStatusLabel({})).toBe('No Subscription');
    });

    it('should return "Active" for active subscription not canceling', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.ACTIVE,
        cancelAtPeriodEnd: false,
      });

      expect(getSubscriptionStatusLabel(subscription)).toBe('Active');
    });

    it('should return "Active (Canceling)" for active subscription with cancelAtPeriodEnd', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.ACTIVE,
        cancelAtPeriodEnd: true,
      });

      expect(getSubscriptionStatusLabel(subscription)).toBe('Active (Canceling)');
    });

    it('should return "Pending" for pending status', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.PENDING,
      });

      expect(getSubscriptionStatusLabel(subscription)).toBe('Pending');
    });

    it('should return "Past Due" for past due status', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.PAST_DUE,
      });

      expect(getSubscriptionStatusLabel(subscription)).toBe('Past Due');
    });

    it('should return "Canceled" for canceled status', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.CANCELED,
      });

      expect(getSubscriptionStatusLabel(subscription)).toBe('Canceled');
    });

    it('should return "Expired" for expired status', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.EXPIRED,
      });

      expect(getSubscriptionStatusLabel(subscription)).toBe('Expired');
    });

    it('should return "Unknown" for unrecognized status', () => {
      const subscription = createSubscription({
        status: 'UNKNOWN_STATUS' as any,
      });

      expect(getSubscriptionStatusLabel(subscription)).toBe('Unknown');
    });
  });

  describe('getSubscriptionStatusColor', () => {
    it('should return "gray" for null subscription', () => {
      expect(getSubscriptionStatusColor(null)).toBe('gray');
    });

    it('should return "gray" for subscription without status', () => {
      expect(getSubscriptionStatusColor({})).toBe('gray');
    });

    it('should return "green" for active subscription not canceling', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.ACTIVE,
        cancelAtPeriodEnd: false,
      });

      expect(getSubscriptionStatusColor(subscription)).toBe('green');
    });

    it('should return "yellow" for active subscription with cancelAtPeriodEnd', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.ACTIVE,
        cancelAtPeriodEnd: true,
      });

      expect(getSubscriptionStatusColor(subscription)).toBe('yellow');
    });

    it('should return "yellow" for pending status', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.PENDING,
      });

      expect(getSubscriptionStatusColor(subscription)).toBe('yellow');
    });

    it('should return "red" for past due status', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.PAST_DUE,
      });

      expect(getSubscriptionStatusColor(subscription)).toBe('red');
    });

    it('should return "gray" for canceled status', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.CANCELED,
      });

      expect(getSubscriptionStatusColor(subscription)).toBe('gray');
    });

    it('should return "gray" for expired status', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.EXPIRED,
      });

      expect(getSubscriptionStatusColor(subscription)).toBe('gray');
    });

    it('should return "gray" for unrecognized status', () => {
      const subscription = createSubscription({
        status: 'UNKNOWN_STATUS' as any,
      });

      expect(getSubscriptionStatusColor(subscription)).toBe('gray');
    });
  });

  describe('getDaysUntilExpiry', () => {
    it('should return null for null subscription', () => {
      expect(getDaysUntilExpiry(null)).toBeNull();
    });

    it('should return null for subscription without currentPeriodEnd', () => {
      const subscription = createSubscription({
        currentPeriodEnd: null,
      });

      expect(getDaysUntilExpiry(subscription)).toBeNull();
    });

    it('should return positive number for future expiry date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      const subscription = createSubscription({
        currentPeriodEnd: futureDate,
      });

      const days = getDaysUntilExpiry(subscription);
      expect(days).toBeGreaterThanOrEqual(10);
      expect(days).toBeLessThanOrEqual(11);
    });

    it('should return negative number for past expiry date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      const subscription = createSubscription({
        currentPeriodEnd: pastDate,
      });

      const days = getDaysUntilExpiry(subscription);
      expect(days).toBeLessThanOrEqual(-4);
      expect(days).toBeGreaterThanOrEqual(-6);
    });

    it('should return 1 for expiry less than 24 hours away', () => {
      const soonDate = new Date();
      soonDate.setHours(soonDate.getHours() + 12);

      const subscription = createSubscription({
        currentPeriodEnd: soonDate,
      });

      const days = getDaysUntilExpiry(subscription);
      expect(days).toBe(1);
    });

    it('should handle expiry exactly now as 0 or 1 day', () => {
      const subscription = createSubscription({
        currentPeriodEnd: new Date(),
      });

      const days = getDaysUntilExpiry(subscription);
      expect(days).toBeGreaterThanOrEqual(0);
      expect(days).toBeLessThanOrEqual(1);
    });
  });

  describe('canCancelSubscription', () => {
    it('should return false for null subscription', () => {
      expect(canCancelSubscription(null)).toBe(false);
    });

    it('should return false for subscription without status', () => {
      expect(canCancelSubscription({})).toBe(false);
    });

    it('should return true for active subscription with stripe ID and not canceling', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.ACTIVE,
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: 'sub_123',
      });

      expect(canCancelSubscription(subscription)).toBe(true);
    });

    it('should return false for active subscription already canceling', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.ACTIVE,
        cancelAtPeriodEnd: true,
        stripeSubscriptionId: 'sub_123',
      });

      expect(canCancelSubscription(subscription)).toBe(false);
    });

    it('should return false for active subscription without stripe ID', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.ACTIVE,
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: null,
      });

      expect(canCancelSubscription(subscription)).toBe(false);
    });

    it('should return false for active subscription with undefined stripe ID', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.ACTIVE,
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: undefined,
      });

      expect(canCancelSubscription(subscription)).toBe(false);
    });

    it('should return false for non-active subscription', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.CANCELED,
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: 'sub_123',
      });

      expect(canCancelSubscription(subscription)).toBe(false);
    });
  });

  describe('canResumeSubscription', () => {
    it('should return false for null subscription', () => {
      expect(canResumeSubscription(null)).toBe(false);
    });

    it('should return false for subscription without status', () => {
      expect(canResumeSubscription({})).toBe(false);
    });

    it('should return true for active subscription that is canceling with stripe ID', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.ACTIVE,
        cancelAtPeriodEnd: true,
        stripeSubscriptionId: 'sub_123',
      });

      expect(canResumeSubscription(subscription)).toBe(true);
    });

    it('should return false for active subscription not canceling', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.ACTIVE,
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: 'sub_123',
      });

      expect(canResumeSubscription(subscription)).toBe(false);
    });

    it('should return false for canceling subscription without stripe ID', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.ACTIVE,
        cancelAtPeriodEnd: true,
        stripeSubscriptionId: null,
      });

      expect(canResumeSubscription(subscription)).toBe(false);
    });

    it('should return false for canceling subscription with undefined stripe ID', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.ACTIVE,
        cancelAtPeriodEnd: true,
        stripeSubscriptionId: undefined,
      });

      expect(canResumeSubscription(subscription)).toBe(false);
    });

    it('should return false for non-active subscription even if canceling flag is true', () => {
      const subscription = createSubscription({
        status: SubscriptionStatus.EXPIRED,
        cancelAtPeriodEnd: true,
        stripeSubscriptionId: 'sub_123',
      });

      expect(canResumeSubscription(subscription)).toBe(false);
    });
  });
});
