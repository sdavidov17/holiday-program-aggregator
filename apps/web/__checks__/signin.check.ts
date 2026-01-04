import { BrowserCheck, Frequency } from 'checkly/constructs';
import * as path from 'path';
import { alertChannels } from './alert-channels';

/**
 * Sign In Journey Check
 * Verifies the authentication flow is working
 * Runs every 5 minutes
 */
new BrowserCheck('signin-journey', {
  name: '🔐 Sign In Page',
  frequency: Frequency.EVERY_5M,
  locations: ['ap-southeast-2', 'us-east-1'],
  tags: ['critical', 'auth', 'user-journey'],
  alertChannels,
  code: {
    entrypoint: path.join(__dirname, 'specs/signin.spec.ts'),
  },
  environmentVariables: [
    { key: 'ENVIRONMENT_URL', value: process.env.ENVIRONMENT_URL || 'https://holiday-heroes-five.vercel.app' },
  ],
});
