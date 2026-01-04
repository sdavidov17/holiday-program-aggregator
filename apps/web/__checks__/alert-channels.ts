import { SlackAlertChannel, EmailAlertChannel } from 'checkly/constructs';

/**
 * Slack Alert Channel for Holiday Heroes
 *
 * To set up:
 * 1. Create a Slack incoming webhook: https://api.slack.com/messaging/webhooks
 * 2. Set CHECKLY_SLACK_WEBHOOK_URL environment variable in Checkly dashboard
 *
 * Features:
 * - Instant alerts on failures
 * - Daily summary reports
 * - Recovery notifications
 */
export const slackChannel = new SlackAlertChannel('slack-alerts', {
  // Webhook URL must be set via CHECKLY_SLACK_WEBHOOK_URL environment variable in Checkly dashboard
  // If not set, alerts will be disabled (Checkly requires a valid URL)
  url: process.env.CHECKLY_SLACK_WEBHOOK_URL ?? '',

  // Send alert on failure
  sendFailure: true,

  // Send alert on recovery
  sendRecovery: true,

  // Send alert on degraded performance
  sendDegraded: true,

  // SSL expiry alerts (7 days before)
  sslExpiry: true,
  sslExpiryThreshold: 7,
});

/**
 * Email Alert Channel (backup)
 * Configure in Checkly dashboard with your email
 */
export const emailChannel = new EmailAlertChannel('email-alerts', {
  // Email address must be set via CHECKLY_ALERT_EMAIL environment variable in Checkly dashboard
  address: process.env.CHECKLY_ALERT_EMAIL ?? '',
  sendFailure: true,
  sendRecovery: true,
  sendDegraded: false,
});

/**
 * Export all alert channels for use in checks
 */
export const alertChannels = [slackChannel];
