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
  // Webhook URL is set via environment variable in Checkly dashboard
  url: process.env.CHECKLY_SLACK_WEBHOOK_URL || 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',

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
  address: process.env.CHECKLY_ALERT_EMAIL || 'alerts@example.com',
  sendFailure: true,
  sendRecovery: true,
  sendDegraded: false,
});

/**
 * Export all alert channels for use in checks
 */
export const alertChannels = [slackChannel];
