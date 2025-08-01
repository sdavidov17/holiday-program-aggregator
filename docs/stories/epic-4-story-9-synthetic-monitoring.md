# Epic 4: Security, SRE & Observability
## Story 4.9: Synthetic Monitoring Implementation

**Dependencies:** 
- Epic 1, Story 1.2 (User Account System) - For auth flow testing
- Epic 1, Story 1.3 (Payment Integration) - For payment flow testing
- Epic 2 (Search & Discovery) - For search flow testing

**Can be implemented:** After critical user journeys exist

*As an SRE, I want synthetic tests for critical user journeys, so that we detect issues before real users encounter them.*

### Acceptance Criteria
1. Synthetic tests for: signup, login, search, payment flows
2. Tests run from Sydney region every 5 minutes
3. Tests use dedicated test accounts
4. Failures alert within 2 minutes
5. Performance degradation alerts at 50% threshold
6. Synthetic test results excluded from business metrics

### Development Tasks
- [ ] Set up synthetic monitoring infrastructure
- [ ] Write test scripts for critical journeys
- [ ] Create dedicated test accounts
- [ ] Configure test scheduling
- [ ] Implement test result storage
- [ ] Set up alerting rules
- [ ] Create synthetic monitoring dashboard
- [ ] Exclude synthetic traffic from analytics
- [ ] Implement test data cleanup
- [ ] Document test scenarios

### Technical Details

#### Synthetic Test Framework
```typescript
// synthetic/framework.ts
import { chromium, Browser, Page } from 'playwright';
import { logger } from '~/utils/logger';

export interface SyntheticTest {
  name: string;
  journey: string;
  frequency: string;
  timeout: number;
  steps: TestStep[];
}

export interface TestStep {
  name: string;
  action: () => Promise<void>;
  assertions: () => Promise<void>;
  metrics?: string[];
}

export class SyntheticTestRunner {
  private browser: Browser;
  private page: Page;
  
  async initialize() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox'],
    });
    
    const context = await this.browser.newContext({
      userAgent: 'Holiday-Aggregator-Synthetic-Monitor/1.0',
      extraHTTPHeaders: {
        'X-Synthetic-Test': 'true',
      },
    });
    
    this.page = await context.newPage();
  }
  
  async runTest(test: SyntheticTest): Promise<TestResult> {
    const startTime = Date.now();
    const results: StepResult[] = [];
    let success = true;
    
    try {
      await this.page.goto(process.env.NEXT_PUBLIC_URL!);
      
      for (const step of test.steps) {
        const stepResult = await this.runStep(step);
        results.push(stepResult);
        
        if (!stepResult.success) {
          success = false;
          break;
        }
      }
    } catch (error) {
      success = false;
      logger.error('Synthetic test failed', {
        test: test.name,
        error: error.message,
      });
    }
    
    return {
      test: test.name,
      journey: test.journey,
      success,
      duration: Date.now() - startTime,
      steps: results,
      timestamp: new Date(),
    };
  }
  
  private async runStep(step: TestStep): Promise<StepResult> {
    const startTime = Date.now();
    
    try {
      await step.action.call(this);
      await step.assertions.call(this);
      
      return {
        name: step.name,
        success: true,
        duration: Date.now() - startTime,
        metrics: await this.collectMetrics(step.metrics),
      };
    } catch (error) {
      return {
        name: step.name,
        success: false,
        duration: Date.now() - startTime,
        error: error.message,
        screenshot: await this.page.screenshot({ fullPage: true }),
      };
    }
  }
}
```

#### Critical Journey Tests
```typescript
// synthetic/tests/userSignup.ts
export const userSignupTest: SyntheticTest = {
  name: 'user-signup-flow',
  journey: 'authentication',
  frequency: '*/5 * * * *', // Every 5 minutes
  timeout: 30000,
  steps: [
    {
      name: 'Navigate to signup page',
      action: async function() {
        await this.page.goto('/signup');
      },
      assertions: async function() {
        await expect(this.page).toHaveTitle(/Sign Up/);
        await expect(this.page.locator('form#signup-form')).toBeVisible();
      },
      metrics: ['page_load_time', 'time_to_interactive'],
    },
    {
      name: 'Fill signup form',
      action: async function() {
        const testEmail = `synthetic-test-${Date.now()}@example.com`;
        await this.page.fill('#email', testEmail);
        await this.page.fill('#password', 'Test123!@#');
        await this.page.fill('#confirmPassword', 'Test123!@#');
        await this.page.check('#terms');
      },
      assertions: async function() {
        await expect(this.page.locator('#submit-button')).toBeEnabled();
      },
    },
    {
      name: 'Submit signup form',
      action: async function() {
        await Promise.all([
          this.page.waitForNavigation(),
          this.page.click('#submit-button'),
        ]);
      },
      assertions: async function() {
        await expect(this.page).toHaveURL(/dashboard/);
        await expect(this.page.locator('.welcome-message')).toBeVisible();
      },
      metrics: ['api_response_time'],
    },
  ],
};

// synthetic/tests/programSearch.ts
export const programSearchTest: SyntheticTest = {
  name: 'program-search-flow',
  journey: 'search',
  frequency: '*/5 * * * *',
  timeout: 20000,
  steps: [
    {
      name: 'Navigate to search page',
      action: async function() {
        await this.page.goto('/search');
      },
      assertions: async function() {
        await expect(this.page.locator('#search-form')).toBeVisible();
        await expect(this.page.locator('#location-input')).toBeVisible();
      },
    },
    {
      name: 'Perform search',
      action: async function() {
        await this.page.fill('#location-input', '2000'); // Sydney CBD
        await this.page.selectOption('#age-group', '5-7');
        await this.page.click('#search-button');
      },
      assertions: async function() {
        await this.page.waitForSelector('.program-card', { timeout: 5000 });
        const results = await this.page.locator('.program-card').count();
        expect(results).toBeGreaterThan(0);
      },
      metrics: ['search_response_time', 'results_count'],
    },
    {
      name: 'View program details',
      action: async function() {
        await this.page.click('.program-card:first-child');
      },
      assertions: async function() {
        await expect(this.page.locator('.program-details')).toBeVisible();
        await expect(this.page.locator('.provider-info')).toBeVisible();
      },
      metrics: ['detail_load_time'],
    },
  ],
};
```

#### Test Scheduling and Execution
```typescript
// synthetic/scheduler.ts
import { CronJob } from 'cron';
import { SyntheticTestRunner } from './framework';
import { ALL_SYNTHETIC_TESTS } from './tests';

export class SyntheticTestScheduler {
  private jobs: Map<string, CronJob> = new Map();
  
  async start() {
    for (const test of ALL_SYNTHETIC_TESTS) {
      const job = new CronJob(
        test.frequency,
        async () => {
          await this.runTest(test);
        },
        null,
        true,
        'Australia/Sydney'
      );
      
      this.jobs.set(test.name, job);
    }
  }
  
  private async runTest(test: SyntheticTest) {
    const runner = new SyntheticTestRunner();
    
    try {
      await runner.initialize();
      const result = await runner.runTest(test);
      
      // Store result
      await this.storeResult(result);
      
      // Check for failures or degradation
      await this.checkAlerts(result);
      
    } finally {
      await runner.cleanup();
    }
  }
  
  private async checkAlerts(result: TestResult) {
    // Alert on failure
    if (!result.success) {
      await alertOncall({
        type: 'synthetic_test_failure',
        test: result.test,
        journey: result.journey,
        error: result.steps.find(s => !s.success)?.error,
        screenshot: result.steps.find(s => !s.success)?.screenshot,
      });
    }
    
    // Alert on performance degradation
    const baseline = await this.getPerformanceBaseline(result.test);
    if (result.duration > baseline * 1.5) {
      await notifyTeam({
        type: 'performance_degradation',
        test: result.test,
        current: result.duration,
        baseline: baseline,
        degradation: ((result.duration / baseline) - 1) * 100,
      });
    }
  }
}
```

#### Test Account Management
```typescript
// synthetic/testAccounts.ts
export class TestAccountManager {
  private testAccounts = [
    {
      email: 'synthetic-user-1@test.holiday-aggregator.com',
      password: process.env.SYNTHETIC_TEST_PASSWORD,
      role: 'user',
      subscription: 'active',
    },
    {
      email: 'synthetic-user-2@test.holiday-aggregator.com',
      password: process.env.SYNTHETIC_TEST_PASSWORD,
      role: 'user',
      subscription: 'expired',
    },
    {
      email: 'synthetic-admin@test.holiday-aggregator.com',
      password: process.env.SYNTHETIC_TEST_PASSWORD,
      role: 'admin',
    },
  ];
  
  async setupTestData() {
    // Create test providers
    await this.createTestProviders();
    
    // Create test programs
    await this.createTestPrograms();
    
    // Ensure test accounts exist
    await this.ensureTestAccounts();
  }
  
  async cleanupTestData() {
    // Remove old synthetic test data
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);
    
    await db.user.deleteMany({
      where: {
        email: { contains: 'synthetic-test-' },
        createdAt: { lt: cutoff },
      },
    });
  }
}
```

#### Excluding Synthetic Traffic
```typescript
// middleware/analytics.ts
export function shouldExcludeFromAnalytics(request: NextRequest): boolean {
  // Check for synthetic test header
  if (request.headers.get('X-Synthetic-Test') === 'true') {
    return true;
  }
  
  // Check user agent
  const userAgent = request.headers.get('user-agent') || '';
  if (userAgent.includes('Synthetic-Monitor')) {
    return true;
  }
  
  // Check for test account emails
  const session = await getServerSession(request);
  if (session?.user?.email?.includes('@test.holiday-aggregator.com')) {
    return true;
  }
  
  return false;
}
```

### Testing Checklist
- [ ] Verify all synthetic tests run successfully
- [ ] Test failure detection and alerting
- [ ] Verify performance baseline calculations
- [ ] Test cleanup of synthetic data
- [ ] Verify synthetic traffic is excluded from analytics
- [ ] Test alert notifications arrive quickly
- [ ] Verify tests run from Sydney region
- [ ] Test account rotation works

### Definition of Done
- [ ] Synthetic tests created for all critical journeys
- [ ] Test scheduling configured for 5-minute intervals
- [ ] Alert rules implemented
- [ ] Test accounts created and managed
- [ ] Synthetic traffic excluded from metrics
- [ ] Performance baselines established
- [ ] Dashboard showing synthetic test results
- [ ] Documentation completed
- [ ] Code reviewed and approved
- [ ] Deployed to production