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
    frequency: Frequency.EVERY_24H,
    // Locations to run checks from
    locations: ['ap-southeast-2', 'us-east-1'],
    // Default runtime for browser checks
    runtimeId: '2024.02',
    // Check definition files pattern (*.check.ts)
    checkMatch: '**/__checks__/**/*.check.ts',
    // Browser check defaults
    browserChecks: {
      // Playwright spec files pattern (referenced via entrypoint in check files)
      testMatch: '**/__checks__/specs/**/*.spec.ts',
    },
  },

  cli: {
    // Run checks on deploy
    runLocation: 'ap-southeast-2',
    // Reporter for CLI output
    reporters: ['list'],
  },
});
