import { defineConfig } from 'checkly';
import { Frequency } from 'checkly/constructs';

/**
 * Checkly Configuration for Holiday Heroes
 * Monitors critical user journeys with Slack notifications
 *
 * See https://www.checklyhq.com/docs/cli/ for more information.
 */
export default defineConfig({
  projectName: 'Holiday Heroes',
  logicalId: 'holiday-heroes-monitoring',
  repoUrl: 'https://github.com/sdavidov17/holiday-program-aggregator',

  checks: {
    // Frequency for all checks (can be overridden per check)
    frequency: Frequency.EVERY_5M,
    // Locations to run checks from
    locations: ['ap-southeast-2', 'us-east-1'],
    // Default runtime for browser checks
    runtimeId: '2024.02',
    // Browser check defaults
    browserChecks: {
      testMatch: '**/__checks__/**/*.check.ts',
    },
  },

  cli: {
    // Run checks on deploy
    runLocation: 'ap-southeast-2',
    // Reporter for CLI output
    reporters: ['list'],
  },
});
