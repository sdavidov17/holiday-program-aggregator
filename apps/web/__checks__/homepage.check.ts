import { BrowserCheck, Frequency } from 'checkly/constructs';
import * as path from 'path';
import { alertChannels } from './alert-channels';

/**
 * Homepage Availability Check
 * Verifies the landing page loads correctly
 * Runs every minute from Australia and US
 */
new BrowserCheck('homepage-availability', {
  name: '🏠 Homepage Availability',
  frequency: Frequency.EVERY_1M,
  locations: ['ap-southeast-2', 'us-east-1'],
  tags: ['critical', 'homepage', 'user-journey'],
  alertChannels,
  code: {
    entrypoint: path.join(__dirname, 'specs/homepage.spec.ts'),
  },
  environmentVariables: [
    { key: 'ENVIRONMENT_URL', value: process.env.ENVIRONMENT_URL || 'https://holiday-heroes.vercel.app' },
  ],
});
