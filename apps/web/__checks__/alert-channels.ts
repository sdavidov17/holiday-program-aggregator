import { type AlertChannel, EmailAlertChannel, SlackAlertChannel } from 'checkly/constructs';

/**
 * Alert Channels for Holiday Heroes Monitoring
 *
 * Channels are only created if their required environment variables are set.
 * This allows the project to deploy without Slack/Email configured initially.
 *
 * To set up Slack alerts:
 * 1. Create a Slack incoming webhook: https://api.slack.com/messaging/webhooks
 * 2. Add CHECKLY_SLACK_WEBHOOK_URL to GitHub secrets
 *
 * Alternatively, use Checkly's native Slack integration (recommended):
 * Checkly Dashboard → Integrations → Slack → "Add to Slack"
 */

const alertChannelsList: AlertChannel[] = [];

// Only create Slack channel if webhook URL is configured
if (process.env.CHECKLY_SLACK_WEBHOOK_URL) {
  const slackChannel = new SlackAlertChannel('slack-alerts', {
    url: process.env.CHECKLY_SLACK_WEBHOOK_URL,
    sendFailure: true,
    sendRecovery: true,
    sendDegraded: true,
    sslExpiry: true,
    sslExpiryThreshold: 7,
  });
  alertChannelsList.push(slackChannel);
}

// Only create Email channel if email address is configured
if (process.env.CHECKLY_ALERT_EMAIL) {
  const emailChannel = new EmailAlertChannel('email-alerts', {
    address: process.env.CHECKLY_ALERT_EMAIL,
    sendFailure: true,
    sendRecovery: true,
    sendDegraded: false,
  });
  alertChannelsList.push(emailChannel);
}

/**
 * Export alert channels for use in checks
 * Will be empty array if no channels are configured
 */
export const alertChannels = alertChannelsList;
