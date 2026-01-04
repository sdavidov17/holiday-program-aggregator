import { BrowserCheck, Frequency } from 'checkly/constructs';
import * as path from 'path';
import { alertChannels } from './alert-channels';

/**
 * Subscription Plans Page Check
 * Verifies the subscription plans are accessible
 * Runs every 10 minutes
 */
new BrowserCheck('subscription-plans', {
  name: '💳 Subscription Plans',
  frequency: Frequency.EVERY_10M,
  locations: ['ap-southeast-2', 'us-east-1'],
  tags: ['critical', 'subscription', 'user-journey'],
  alertChannels,
  code: {
    entrypoint: path.join(__dirname, 'specs/subscription.spec.ts'),
  },
  environmentVariables: [
    { key: 'ENVIRONMENT_URL', value: process.env.ENVIRONMENT_URL || 'https://holiday-heroes.vercel.app' },
  ],
});
