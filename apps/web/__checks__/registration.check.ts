import * as path from 'node:path';
import { BrowserCheck, Frequency } from 'checkly/constructs';
import { alertChannels } from './alert-channels';

/**
 * Registration Page Check
 * Verifies the registration form is accessible
 * Runs daily
 */
new BrowserCheck('registration-journey', {
  name: '📝 Registration Page',
  frequency: Frequency.EVERY_24H,
  locations: ['ap-southeast-2', 'us-east-1'],
  tags: ['critical', 'auth', 'user-journey'],
  alertChannels,
  code: {
    entrypoint: path.join(__dirname, 'specs/registration.spec.ts'),
  },
  environmentVariables: [
    {
      key: 'ENVIRONMENT_URL',
      value: process.env.ENVIRONMENT_URL || 'https://holiday-heroes-five.vercel.app',
    },
  ],
});
